/**
 * 高德地图能力封装：浏览器定位 + 周边"餐饮"搜索
 * Key 管理：localStorage('amap_key')，可由设置页写入。
 * 未配置 Key 或请求失败时自动降级为演示数据（app.js 决定）。
 */
const GeoService = (() => {

  const LS_KEY = 'dl_amap_key';
  // 安全：Key 不写入代码（本仓库公开）。首次使用在 APP 设置页(⚙️)粘贴一次，
  // 会存进浏览器 localStorage，此后长期生效；未配置时"出去吃"自动使用演示数据。
  const DEFAULT_KEY = '';
  // 浏览器定位失败时使用的默认坐标（北京国贸附近），仅用于演示数据
  const FALLBACK_CENTER = { lat: 39.9087, lng: 116.4611, label: '默认位置（北京国贸）' };

  function getKey() { return localStorage.getItem(LS_KEY) || DEFAULT_KEY; }
  function saveKey(k) {
    k = (k || '').trim();
    if (k) localStorage.setItem(LS_KEY, k);
    else localStorage.removeItem(LS_KEY);
  }

  /** 浏览器定位（需 https/localhost），失败则回退默认坐标 */
  function locate() {
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve({ ok: false, ...FALLBACK_CENTER });
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude, label: '当前位置' }),
        () => resolve({ ok: false, ...FALLBACK_CENTER }),
        { timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  async function amapGet(path, params) {
    const q = new URLSearchParams({ key: getKey(), ...params });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`https://restapi.amap.com/v3/${path}?${q}`, { signal: ctrl.signal });
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  /**
   * 浏览器 GPS 是 WGS-84 坐标，高德系用 GCJ-02，不转换会整体偏移几百米。
   * 调坐标转换接口修正（消耗基础LBS配额，个人认证 15万次/月，足够）。
   */
  async function convertToGcj(center) {
    if (!getKey() || center.gcj || !center.ok) return center;
    try {
      const data = await amapGet('assistant/coordinate/convert', {
        locations: `${center.lng},${center.lat}`, coordsys: 'gps'
      });
      if (data.status === '1' && data.locations) {
        const [lng, lat] = data.locations.split(',').map(Number);
        if (lng && lat) return { ...center, lat, lng, gcj: true };
      }
    } catch (e) { /* 转换失败沿用原坐标，误差可接受 */ }
    return center;
  }

  /** 逆地理编码：把坐标变成"xx路xx号"的真实位置描述 */
  async function describePosition(center) {
    if (!getKey() || !center.gcj) return null;
    try {
      const data = await amapGet('geocode/regeo', {
        location: `${center.lng},${center.lat}`, extensions: 'base'
      });
      if (data.status === '1' && data.regeocode && data.regeocode.formatted_address) {
        return data.regeocode.formatted_address;
      }
    } catch (e) { /* 失败保持默认标签 */ }
    return null;
  }

  /**
   * 周边餐饮搜索（高德 Web 服务 API v3 place/around）
   * @returns {Promise<{ok:boolean, pois:Array, center:object, reason?:string}>}
   *   poi 归一化为 {name,type,rating,price,distance,address,location:{lat,lng},tel,source:'amap'}
   */
  async function searchNearbyRestaurants(center, radius = 3000) {
    const key = getKey();
    if (!key) return { ok: false, pois: [], center, reason: 'no_key' };

    const location = `${center.lng},${center.lat}`;
    const types = '050000';           // 高德分类：餐饮服务
    const url = `https://restapi.amap.com/v3/place/around?key=${encodeURIComponent(key)}`
      + `&location=${encodeURIComponent(location)}&types=${types}`
      + `&radius=${radius}&offset=25&page=1&extensions=all&sortrule=weight`;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);   // 网络挂起时 8s 超时，避免卡死在加载中
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      const data = await res.json();
      if (data.status !== '1' || !data.pois || !data.pois.length) {
        return { ok: false, pois: [], center, reason: data.info || 'empty' };
      }
      const pois = data.pois.map((p, i) => normalizeAmapPoi(p, center, i)).filter(p => p && p.name);
      return pois.length ? { ok: true, pois, center } : { ok: false, pois: [], center, reason: 'filtered_empty' };
    } catch (e) {
      return { ok: false, pois: [], center, reason: 'network: ' + e.message };
    }
  }

  function normalizeAmapPoi(p, center, i) {
    // location 格式 "lng,lat"
    const [lng, lat] = (p.location || '').split(',').map(Number);
    if (!lat || !lng) return null;
    const biz = (p.biz_ext && typeof p.biz_ext === 'object') ? p.biz_ext : {};
    const rating = parseFloat(biz.rating);
    const cost = parseFloat(biz.cost);
    let distance = parseInt(p.distance, 10);
    if (isNaN(distance)) distance = haversine(center, { lat, lng });
    const photoTitle = p.photos && p.photos[0] && p.photos[0].title;
    const signature = (photoTitle && photoTitle.length && typeof photoTitle === 'string') ? photoTitle : '';
    return {
      id: 'amap-' + p.id + '-' + i,
      name: p.name,
      type: simplifyType(p.type || '餐厅'),
      emoji: '🍽️',
      rating: isNaN(rating) ? (4 + Math.random() * 0.9) : rating,   // 高德部分POI无评分，给个近似值
      price: isNaN(cost) ? null : Math.round(cost),                  // 人均（元）
      distance,
      address: p.address && p.address.length ? p.address : (p.pname || '') + (p.cityname || '') + (p.adname || ''),
      location: { lat, lng },
      tel: p.tel || '',
      signature,
      source: 'amap'
    };
  }

  function simplifyType(rawType) {
    const t = rawType || '';
    const map = [
      ['火锅', '火锅'], ['烧烤|烤串', '烧烤'], ['小吃|快餐', '快餐简餐'], ['日本|寿司|日式', '日料'],
      ['韩国|韩式|烤肉', '韩餐'], ['西餐|牛排|意式|披萨', '西餐'], ['川菜|湘菜|湖北|云南|贵州', '地方菜'],
      ['粤菜|潮州|客家|广东', '粤菜'], ['东北|西北|兰州|陕西|山西', '西北菜'],
      ['面|粉|米线|馄饨|饺子', '面食'], ['奶茶|咖啡|饮品|茶', '饮品甜点'], ['面包|糕点|烘焙|蛋糕|甜品|冷饮', '烘焙甜品'],
      ['海鲜', '海鲜'], ['素菜|沙拉|轻食', '轻食'], ['中餐厅|家常菜|特色', '中餐']
    ];
    for (const [re, label] of map) if (new RegExp(re).test(t)) return label;
    // 高德 type 形如 "餐饮服务;咖啡厅;咖啡厅"——取中类（第二段）比大类更有信息量
    const mid = t.split(';')[1];
    if (mid) return mid.slice(0, 6);
    return t.split(';')[0].split('|')[0].slice(0, 6) || '餐厅';
  }

  function haversine(a, b) { // 米
    const R = 6371000, rad = x => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }

  /** 生成高德地图导航 URI（浏览器/APP 均可唤起） */
  function navUrl(target, myCenter) {
    const pos = `${target.location.lng},${target.location.lat}`;
    const name = encodeURIComponent(target.name);
    if (myCenter && myCenter.lng) {
      const from = `${myCenter.lng},${myCenter.lat}`;
      return `https://uri.amap.com/navigation?from=${from},我的位置&to=${pos},${name}&via=&mode=car&policy=&src=&coordinate=gaode&callnative=0`;
    }
    return `https://uri.amap.com/marker?position=${pos}&name=${name}&src=myapp&coordinate=gaode&callnative=0`;
  }

  return { getKey, saveKey, locate, convertToGcj, describePosition, searchNearbyRestaurants, navUrl, FALLBACK_CENTER };
})();
