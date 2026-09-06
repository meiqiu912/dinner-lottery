/**
 * 今晚吃啥？ —— 主逻辑
 * 屏幕路由 / 老虎机抽签 / 每日次数 + 激励广告 / 历史
 */
(function () {
  'use strict';

  /* ================= 工具 ================= */
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const todayKey = () => new Date().toISOString().slice(0, 10);   // 本地日期近似（演示足够）
  function toast(msg, ms = 2200) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), ms);
  }
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const fmtDistance = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(1) + ' km';

  /* ================= 本地状态 ================= */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };
  const state = {
    mode: 'cook',            // cook | eatout
    quota: null,             // {date, left}
    restaurantPool: [],      // 出去吃候选池
    geoCenter: null,         // {lat,lng,label,ok}
    geoReady: false,
    currentResult: null,     // 当前抽中的菜/店
    pool: [],                // 当前抽签池
    drawing: false,          // 出签流程进行中
    pendingAfterAd: false,   // 能量已满但需看广告，看完直接出签
    drawSeq: 0               // 抽签会话序号（用于丢弃过期回调）
  };

  /* ================= 次数（每日免费 + 看广告奖励） ================= */
  const DEFAULT_QUOTA = 3;
  function getQuota() {
    const q = store.get('dl_quota', null);
    if (!q || q.date !== todayKey()) {
      const n = store.get('dl_free_quota', DEFAULT_QUOTA);
      state.quota = { date: todayKey(), left: n };
      store.set('dl_quota', state.quota);
    } else {
      state.quota = q;
    }
    return state.quota;
  }
  function quotaLeft() { return getQuota().left; }
  function spendQuota() {
    const q = getQuota();
    q.left = Math.max(0, q.left - 1);
    store.set('dl_quota', q);
    refreshQuotaUI();
  }
  function rewardQuota(n = 3) {
    const q = getQuota();
    q.left += n;
    store.set('dl_quota', q);
    refreshQuotaUI();
  }
  function refreshQuotaUI() {
    $('#free-draws-info').innerHTML = `今日剩余免费抽签：<b>${quotaLeft()}</b> 次`;
    $('#draw-count').textContent = quotaLeft();
  }

  /* ================= 屏幕路由 ================= */
  let backTarget = 'screen-home';
  function showScreen(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $('#' + id).classList.add('active');
    window.scrollTo(0, 0);
  }
  $$('[data-back]').forEach(b => b.addEventListener('click', () => showScreen(backTarget)));

  /* ================= 首页 ================= */
  $$('.mode-card').forEach(card => card.addEventListener('click', () => {
    state.mode = card.dataset.mode;
    startDrawFlow();
  }));
  $('#btn-history').addEventListener('click', () => { renderHistory(); showScreen('screen-history'); });

  /* ================= 抽签流程（摇签筒） ================= */
  const CN_DIGITS = '零一二三四五六七八九';
  function toCnNum(n) {
    if (n <= 0 || n >= 100) return String(n);
    if (n < 10) return CN_DIGITS[n];
    const t = Math.floor(n / 10), o = n % 10;
    if (n < 20) return '十' + (o ? CN_DIGITS[o] : '');
    return CN_DIGITS[t] + '十' + (o ? CN_DIGITS[o] : '');
  }

  function deviceHint() {
    const touch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    return touch ? '📱 用力摇动手机，摇出今晚的签！' : '🖱️ 按住签筒，左右快速摇晃';
  }

  function startDrawFlow() {
    backTarget = 'screen-home';
    state.currentResult = null;
    state.drawing = false;
    ShakeEngine.reset();
    if (state.mode === 'cook') {
      state.pool = RECIPES;
      $('#draw-title').textContent = '诚心摇签 · 在家做';
      $('#draw-hint').textContent = deviceHint() + `（菜库 ${RECIPES.length} 道）`;
      ShakeEngine.enable(true);
    } else {
      state.pool = [];
      $('#draw-title').textContent = '诚心摇签 · 出去吃';
      $('#draw-hint').textContent = '📡 正在获取周边饭店…';
      ShakeEngine.enable(false);
      const seq = ++state.drawSeq;
      prepareEatoutPool().then(() => {
        if (seq !== state.drawSeq) return;   // 用户已离开/重新进入，丢弃过期回调
        const n = state.restaurantPool.length;
        const isDemo = state.restaurantPool[0] && state.restaurantPool[0].source === 'demo';
        state.pool = state.restaurantPool;
        $('#draw-hint').textContent = `附近 ${n} 家饭店${isDemo ? '（演示数据）' : ''} · ` + deviceHint();
        if ($('#screen-draw').classList.contains('active')) ShakeEngine.enable(true);
      });
    }
    setupMotionAccess();
    showScreen('screen-draw');
  }

  async function prepareEatoutPool() {
    state.geoCenter = await GeoService.locate();
    if (GeoService.getKey()) {
      // 有 Key 时：GPS 坐标(WGS-84)先转成高德坐标系(GCJ-02)，避免整体偏移；并把坐标描述成真实地址
      state.geoCenter = await GeoService.convertToGcj(state.geoCenter);
      const addr = await GeoService.describePosition(state.geoCenter);
      if (addr) state.geoCenter.label = '当前位置：' + addr;
    }
    let res = await GeoService.searchNearbyRestaurants(state.geoCenter);
    if (!res.ok) {
      // 无 Key / 失败 → 演示数据兜底
      if (res.reason && res.reason !== 'no_key') {
        toast('周边搜索失败，已切换为演示数据');
      }
      state.restaurantPool = RestaurantMock.generate(18, state.geoCenter);
    } else {
      state.restaurantPool = res.pois;
    }
    state.geoReady = true;
  }

  /* ---------- 摇签引擎：手机摇 + 指针拖，攒能量出签 ---------- */
  const ShakeEngine = (() => {
    const tube = $('#shake-tube');
    const sticks = $('#svg-sticks');
    const fill = $('#energy-fill');
    const label = $('#energy-label');
    const drawn = $('#drawn-stick');
    let energy = 0, enabled = false, full = false;
    let dragging = false, lastX = 0, lastDir = 0, tilt = 0;
    let prevAcc = null, prevSign = 0;
    let lastT = performance.now();
    let onFullCb = null;

    function setTilt(target, instant) {
      tilt = target;
      tube.style.transition = instant ? 'none' : 'transform .22s ease-out';
      tube.style.transform = `translateX(${tilt}px) rotate(${tilt * 0.32}deg)`;
    }
    function jitter() {   // 竹签抖动一下
      sticks.classList.remove('shake');
      void sticks.getBBox && sticks.getBBox();
      sticks.classList.add('shake');
    }
    function render() {
      fill.style.width = energy + '%';
      label.textContent = energy >= 100 ? '出签！' : energy > 72 ? '快出签了！' : energy > 36 ? '摇起来！' : '用力摇！';
    }
    function add(n) {
      if (!enabled || full) return;
      energy = Math.min(100, energy + n);
      render();
      if (energy >= 100) {
        full = true;
        setTilt(0);
        if (onFullCb) onFullCb();
      }
    }

    // ---- 指针拖甩（电脑 / 手机无传感器兜底）----
    tube.addEventListener('pointerdown', e => {
      if (!enabled || full) return;
      dragging = true; lastX = e.clientX; lastDir = 0;
      tube.setPointerCapture(e.pointerId);
      tube.style.transition = 'none';
    });
    tube.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (Math.abs(dx) < 1) return;
      setTilt(Math.max(-46, Math.min(46, tilt + dx * 0.6)), true);
      const dir = Math.sign(dx);
      if (dir && dir !== lastDir && Math.abs(dx) >= 3) {   // 方向翻转才计能量
        add(Math.min(12, 4 + Math.abs(dx) * 0.5));
        jitter();
        lastDir = dir;
      }
    });
    const endDrag = () => { if (!dragging) return; dragging = false; setTilt(0); };
    tube.addEventListener('pointerup', endDrag);
    tube.addEventListener('pointercancel', endDrag);
    tube.addEventListener('lostpointercapture', endDrag);

    // ---- 手机摇一摇（加速度方向翻转计能量）----
    window.addEventListener('devicemotion', e => {
      if (!enabled || full) return;
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null) return;
      ShakeEngine.motionSeen = true;
      if (!prevAcc) { prevAcc = { x: a.x, y: a.y, z: a.z }; return; }
      const delta = Math.abs(a.x - prevAcc.x) + Math.abs(a.y - prevAcc.y) + Math.abs(a.z - prevAcc.z);
      prevAcc = { x: a.x, y: a.y, z: a.z };
      const sign = a.x >= 0 ? 1 : -1;
      if (delta >= 15 && sign !== prevSign) {
        prevSign = sign;
        add(Math.min(12, (delta - 8) * 0.6));
        setTilt((Math.random() - 0.5) * 66);
        jitter();
      }
    });

    // ---- 能量衰减（停止摇晃会退潮）----
    (function loop(t) {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      if (energy > 0 && !full && !dragging) {
        energy = Math.max(0, energy - 15 * dt);
        render();
      }
      requestAnimationFrame(loop);
    })(performance.now());

    return {
      motionSeen: false,
      enable(on) { enabled = on; },
      reset() {
        energy = 0; full = false; prevAcc = null; prevSign = 0; dragging = false;
        setTilt(0); render();
        drawn.classList.remove('pop'); drawn.hidden = true;
        tube.classList.remove('burst'); sticks.classList.remove('shake', 'burst');
        const flash = $('#stage-flash'), glow = $('#glow-burst');
        flash.classList.remove('go');
        glow.hidden = true; glow.classList.remove('show');
        $('#fortune-strip').hidden = true;
      },
      burst() {
        tube.classList.remove('burst'); void tube.offsetWidth; tube.classList.add('burst');
        sticks.classList.remove('burst'); sticks.getBBox && sticks.getBBox(); sticks.classList.add('burst');
        const flash = $('#stage-flash'), glow = $('#glow-burst');
        flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
        glow.hidden = false; glow.classList.remove('show'); void glow.offsetWidth; glow.classList.add('show');
      },
      showStick(no, text) {
        $('#stick-no').textContent = no;
        $('#stick-text').textContent = text;
        drawn.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => drawn.classList.add('pop')));
      },
      onFull(cb) { onFullCb = cb; }
    };
  })();

  /* ---------- 手机传感器权限（iOS 13+ 需用户手势授权）---------- */
  let motionHintTimer = null;
  function setupMotionAccess() {
    const box = $('#motion-permission');
    const needsPermission = typeof DeviceMotionEvent !== 'undefined'
      && typeof DeviceMotionEvent.requestPermission === 'function';
    if (needsPermission) {
      box.hidden = false;
      $('#btn-motion').onclick = async () => {
        try {
          const resp = await DeviceMotionEvent.requestPermission();
          if (resp === 'granted') { box.hidden = true; toast('授权成功，用力摇吧！📱'); }
          else { box.hidden = true; toast('未授权传感器，可按住签筒左右拖动摇晃'); }
        } catch { box.hidden = true; toast('传感器不可用，请按住签筒左右拖动摇晃'); }
      };
    } else {
      box.hidden = true;
    }
    // 触屏设备 3 秒无传感器数据 → 提示可拖动兜底
    clearTimeout(motionHintTimer);
    ShakeEngine.motionSeen = false;
    const touch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    if (touch && typeof DeviceMotionEvent !== 'undefined') {
      motionHintTimer = setTimeout(() => {
        if (!ShakeEngine.motionSeen && $('#screen-draw').classList.contains('active')) {
          $('#draw-hint').textContent += '（摇不动？按住签筒左右拖也行）';
        }
      }, 3000);
    }
  }

  /* ---------- 能量满 → 出签 ---------- */
  ShakeEngine.onFull(() => {
    if (state.drawing) return;
    state.drawing = true;
    ShakeEngine.enable(false);
    if (quotaLeft() <= 0) {          // 免费次数用完 → 看广告，看完直接出签
      state.pendingAfterAd = true;
      openAd();
      return;
    }
    spendQuota();
    performDraw();
  });

  function performDraw() {
    const item = pick(state.pool);
    state.currentResult = item;
    const no = '第' + toCnNum(state.pool.indexOf(item) + 1) + '签';
    state.fortune = state.mode === 'cook' ? fortuneOf(item) : restoFortuneOf(item);
    ShakeEngine.burst();
    ShakeEngine.showStick(no, `${item.emoji} ${item.name}`);
    setTimeout(() => {
      const f = state.fortune;
      $('#fortune-grade').textContent = f.grade;
      $('#fortune-line').textContent = `「${item.name}」${f.line}`;
      $('#fortune-yi').textContent = f.yi;
      $('#fortune-ji').textContent = f.ji;
      $('#fortune-strip').hidden = false;
    }, 1050);
  }

  $('#btn-reveal').addEventListener('click', () => {
    if (!state.currentResult) return;
    $('#fortune-strip').hidden = true;
    if (state.mode === 'cook') {
      renderCookResult(state.currentResult);
      showScreen('screen-result-cook');
    } else {
      renderEatoutResult(state.currentResult);
      showScreen('screen-result-eatout');
    }
    state.drawing = false;
  });

  /* ================= 在家做：结果渲染 ================= */
  function renderCookResult(dish) {
    const stars = '⭐'.repeat(dish.difficulty) + '☆'.repeat(3 - dish.difficulty);
    const f = state.fortune || fortuneOf(dish);
    $('#cook-result').innerHTML = `
      <div class="fortune-card">
        <div class="fc-head"><span class="fc-grade">${escapeHtml(f.grade)}</span><b class="fc-line">${escapeHtml(f.line)}</b></div>
        <p class="fc-yiji">宜 ${escapeHtml(f.yi)} · 忌 ${escapeHtml(f.ji)}</p>
      </div>
      <div class="dish-hero">
        <div class="photo-ring${DISHES_WITH_PHOTOS.has(dish.id) ? '' : ' noimg'}">
          ${DISHES_WITH_PHOTOS.has(dish.id) ? `<img src="img/dishes/${dish.id}.jpg" alt="${escapeHtml(dish.name)}"
               onerror="this.parentElement.classList.add('noimg');this.remove();">` : ''}
          <div class="photo-fallback">${dish.emoji}</div>
          <span class="steam s1"></span><span class="steam s2"></span>
        </div>
        <h2 class="dish-name">${escapeHtml(dish.name)}</h2>
        <div class="dish-meta"><span>${stars} 难度</span><span>⏱ 约 ${dish.minutes} 分钟</span><span>🍚 记得焖饭</span></div>
      </div>
      <div class="recipe-section">
        <h3>🛒 食材清单 <i>（点击勾选备好的）</i></h3>
        <ul class="ingredient-list">
          ${dish.ingredients.map(ing => `
            <li class="ingredient">
              <label>
                <input type="checkbox">
                <span class="ing-name">${escapeHtml(ing.name)}</span>
                <span class="ing-amount">${escapeHtml(ing.amount)}</span>
              </label>
            </li>`).join('')}
        </ul>
      </div>
      <div class="recipe-section">
        <h3>🔪 备菜</h3>
        <ol class="step-list">${dish.prep.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
      </div>
      <div class="recipe-section">
        <h3>🔥 开火烹饪</h3>
        <ol class="step-list cook-steps">${dish.cook.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
      </div>`;
  }

  $('#btn-accept-cook').addEventListener('click', () => {
    addHistory('cook', state.currentResult);
    toast(`已锁定：今晚吃「${state.currentResult.name}」，买菜去吧 🛒`);
    showScreen('screen-home');
  });
  $('#btn-recook').addEventListener('click', () => tryRedraw('cook'));

  /* ================= 出去吃：结果渲染 ================= */
  function renderEatoutResult(p) {
    const isDemo = p.source === 'demo';
    const f = state.fortune || restoFortuneOf(p);
    $('#eatout-result').innerHTML = `
      <div class="fortune-card">
        <div class="fc-head"><span class="fc-grade">${escapeHtml(f.grade)}</span><b class="fc-line">${escapeHtml(f.line)}</b></div>
        <p class="fc-yiji">宜 ${escapeHtml(f.yi)} · 忌 ${escapeHtml(f.ji)}</p>
      </div>
      <div class="shop-hero">
        <div class="shop-emoji">${p.emoji || '🍽️'}</div>
        <h2 class="shop-name">${escapeHtml(p.name)}</h2>
        <div class="shop-badges">
          <span class="badge type">${escapeHtml(p.type)}</span>
          <span class="badge rating">★ ${p.rating}</span>
          ${p.price ? `<span class="badge price">¥${p.price}/人</span>` : ''}
          <span class="badge dist">${fmtDistance(p.distance)}</span>
        </div>
      </div>
      <div class="shop-info">
        <div class="info-row"><span>📍</span><div>${escapeHtml(p.address)}<i class="pos-note">${escapeHtml(state.geoCenter && state.geoCenter.label || '')}${isDemo ? ' · 演示数据' : ''}</i></div></div>
        ${p.signature ? `<div class="info-row"><span>👍</span><div>招牌：${escapeHtml(p.signature)}</div></div>` : ''}
        ${p.tel ? `<div class="info-row"><span>📞</span><div><a href="tel:${escapeHtml(p.tel)}">${escapeHtml(p.tel)}</a>（可打电话订位）</div></div>` : ''}
      </div>`;
    $('#btn-nav').href = GeoService.navUrl(p, state.geoCenter && state.geoCenter.ok ? state.geoCenter : null);
  }
  $('#btn-reeat').addEventListener('click', () => tryRedraw('eatout'));
  // 点导航视为"去了"，计入今日记录
  $('#btn-nav').addEventListener('click', () => {
    if (state.currentResult) {
      addHistory('eatout', state.currentResult);
      toast(`已记入今天抽过的：${state.currentResult.name}`);
    }
  });

  /* ================= 再抽一次 / 广告 ================= */
  function tryRedraw(mode) {
    if (quotaLeft() > 0) {
      state.mode = mode;
      startDrawFlow();
    } else {
      openAd();
    }
  }

  const AD_SECONDS = 5, AD_REWARD = 3;
  function openAd() {
    const overlay = $('#ad-overlay');
    const close = $('#ad-close');
    const counter = $('#ad-countdown');
    overlay.classList.add('show');
    close.disabled = true;
    let s = AD_SECONDS;
    counter.textContent = s;
    toast('免费次数已用完，看完广告解锁 ' + AD_REWARD + ' 次');
    clearInterval(openAd._t);
    openAd._t = setInterval(() => {
      s--;
      counter.textContent = Math.max(0, s);
      if (s <= 0) {
        clearInterval(openAd._t);
        close.disabled = false;         // 倒计时结束才能关闭 = 有效观看
      }
    }, 1000);
  }
  $('#ad-close').addEventListener('click', () => {
    if ($('#ad-close').disabled) return;
    $('#ad-overlay').classList.remove('show');
    clearInterval(openAd._t);
    rewardQuota(AD_REWARD);
    toast(`🎉 广告观看完成，+${AD_REWARD} 次抽签机会`);
    if (state.pendingAfterAd) {          // 摇签中途看广告：奖励后直接出签
      state.pendingAfterAd = false;
      spendQuota();
      performDraw();
    }
  });

  /* ================= 历史 ================= */
  function addHistory(mode, item) {
    const key = 'dl_history_' + todayKey();
    const list = store.get(key, []);
    list.unshift({ mode, name: item.name, emoji: item.emoji, ts: Date.now() });
    store.set(key, list.slice(0, 50));
  }
  function renderHistory() {
    const list = store.get('dl_history_' + todayKey(), []);
    $('#history-list').innerHTML = list.length ? list.map(h => `
      <div class="history-item">
        <span class="h-emoji">${h.emoji}</span>
        <span class="h-name">${escapeHtml(h.name)}</span>
        <span class="h-mode">${h.mode === 'cook' ? '在家做' : '出去吃'}</span>
        <span class="h-time">${new Date(h.ts).toTimeString().slice(0, 5)}</span>
      </div>`).join('')
      : '<p class="empty-tip">今天还没抽过签</p>';
  }
  $('#btn-clear-history').addEventListener('click', () => {
    localStorage.removeItem('dl_history_' + todayKey());
    renderHistory();
    toast('已清空今日记录');
  });

  /* ================= 设置 ================= */
  $('#btn-settings').addEventListener('click', () => {
    $('#input-amap-key').value = GeoService.getKey();
    $('#input-free-quota').value = store.get('dl_free_quota', DEFAULT_QUOTA);
    $('#settings-overlay').classList.add('show');
  });
  $('#btn-settings-cancel').addEventListener('click', () => $('#settings-overlay').classList.remove('show'));
  $('#btn-settings-save').addEventListener('click', () => {
    GeoService.saveKey($('#input-amap-key').value);
    let n = parseInt($('#input-free-quota').value, 10);
    if (isNaN(n)) n = DEFAULT_QUOTA;
    n = Math.min(99, Math.max(1, n));
    store.set('dl_free_quota', n);
    $('#settings-overlay').classList.remove('show');
    const q = getQuota(); q.left = n; store.set('dl_quota', q);
    refreshQuotaUI();
    toast(GeoService.getKey() ? '已保存，出去吃将搜索真实周边' : '已保存（未配置Key，使用演示数据）');
  });

  /* ================= 其他 ================= */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ================= PWA 安装 ================= */
  let deferredInstall = null;
  const installBtn = $('#btn-install');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    if (installBtn) installBtn.hidden = false;
  });
  if (installBtn) installBtn.addEventListener('click', async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    if (outcome === 'accepted') installBtn.hidden = true;
    deferredInstall = null;
  });
  // iOS 没有 beforeinstallprompt：显示"添加到主屏幕"引导（Safari 非独立窗口时）
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone) {
    const tip = $('#ios-install-tip');
    if (tip) tip.hidden = false;
  }
  window.addEventListener('appinstalled', () => { if (installBtn) installBtn.hidden = true; });

  /* ================= PWA Service Worker（file:// 下会失败，忽略即可） ================= */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  refreshQuotaUI();
})();
