/**
 * 演示饭店数据生成器
 * 未配置高德 Key 时使用：按真实感随机生成周边饭店列表。
 * 可通过 seedRestaurantPool() 用真实数据整体替换本池子。
 */
const RestaurantMock = (() => {

  // (菜系, 店名词库, 人均区间, emoji)
  const CATEGORIES = [
    { type: '川菜', emoji: '🌶️', price: [40, 80], names: ['川香居', '蜀乡人家', '老码头川菜馆', '椒麻印象', '巴适得很'] },
    { type: '火锅', emoji: '🍲', price: [60, 110], names: ['热辣壹号', '老灶火锅', '捞王火锅', '草原羔羊火锅', '沸腾岁月'] },
    { type: '烧烤', emoji: '🍢', price: [45, 90], names: ['很久以前羊肉串', '木屋烧烤', '老五烧烤', '炭火故事', '烤匠'] },
    { type: '日料', emoji: '🍣', price: [70, 150], names: ['一寿司', '千寻日料', '樱屋食堂', '海胆市场', '和风匠心'] },
    { type: '韩餐', emoji: '🍱', price: [50, 90], names: ['首尔香', '本家韩式料理', '江 南 烤肉', '韩宫宴', '小巷韩食'] },
    { type: '快餐简餐', emoji: '🍔', price: [15, 35], names: ['老乡鸡', '乡村基', '真功夫', '大米先生', '嘉和一品'] },
    { type: '面馆', emoji: '🍜', price: [12, 30], names: ['陈记面馆', '一兰风拉面', '和府捞面', '遇见小面', '老张牛肉面'] },
    { type: '饺子馆', emoji: '🥟', price: [20, 40], names: ['喜家德', '东方饺子王', '袁记云饺', '大清花饺子', '胖大姐水饺'] },
    { type: '西北菜', emoji: '🫓', price: [25, 50], names: ['西贝莜面村', '西北印象', '兰州老马家', '秦镇米皮', 'biangbiang面'] },
    { type: '湘菜', emoji: '🫑', price: [40, 80], names: ['湘鄂情', '毛家饭店', '吃饭皇帝大', '兰湘子', '麓山小院'] },
    { type: '粤菜茶餐厅', emoji: '🥡', price: [50, 100], names: ['点都德', '广州酒家', '表哥茶餐厅', '翠华餐厅', '陶陶居'] },
    { type: '西餐', emoji: '🥩', price: [80, 180], names: ['萨莉亚', '西堤牛排', '蓝蛙', 'Wagas', '元素牛排馆'] },
    { type: '小龙虾', emoji: '🦞', price: [60, 120], names: ['堕落虾', '虾皇', '盱眙龙虾馆', '胡大饭馆', '麻辣诱惑'] },
    { type: '米粉米线', emoji: '🍜', price: [12, 28], names: ['螺霸王', '嗦粉人家', '蒙自源', '五谷渔粉', '阿香米线'] },
    { type: '轻食沙拉', emoji: '🥗', price: [25, 45], names: ['超级碗', '沙绿轻食', '甜心摇滚沙拉', '共禾之约', '清新食刻'] }
  ];

  const STREETS = ['人民路', '解放大道', '中山路', '幸福里步行街', '文化路', '和平街', '建设路', '光明巷', '江畔路', '朝阳街'];
  const SIGNATURES = {
    '川菜': ['招牌毛血旺', '歌乐山辣子鸡', '麻婆豆腐', '水煮鱼'],
    '火锅': ['鲜切黄牛肉', '手打虾滑', '招牌毛肚', '麻辣锅底'],
    '烧烤': ['烤羊排', '锡纸花甲', '烤茄子', '五花肉串'],
    '日料': ['三文鱼刺身', '鳗鱼饭', '地狱拉面', '加州卷'],
    '韩餐': ['石锅拌饭', '部队火锅', '韩式烤五花', '辣炒年糕'],
    '快餐简餐': ['招牌鸡腿饭', '老坛酸菜鸡', '香辣排骨饭', '梅菜扣肉饭'],
    '面馆': ['红烧牛肉面', '葱油拌面', '酸辣粉', '雪菜肉丝面'],
    '饺子馆': ['虾仁三鲜水饺', '酸菜猪肉饺', '韭菜鸡蛋饺', '手工水饺拼盘'],
    '西北菜': ['手抓羊肉', '油泼面', '肉夹馍', '大盘鸡'],
    '湘菜': ['剁椒鱼头', '小炒黄牛肉', '辣椒炒肉', '紫苏炒田螺'],
    '粤菜茶餐厅': ['虾饺皇', '叉烧包', '脆皮烧鹅', '干炒牛河'],
    '西餐': ['惠灵顿牛排', '黑椒意面', '烤羊排', '凯撒沙拉'],
    '小龙虾': ['麻辣小龙虾', '蒜泥小龙虾', '十三香龙虾', '油焖大虾'],
    '米粉米线': ['招牌螺蛳粉', '过桥米线', '酸汤肥牛粉', '桂林卤粉'],
    '轻食沙拉': ['牛油果鸡胸碗', '藜麦三文鱼碗', '考伯沙拉', '低卡牛肉卷']
  };

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

  /**
   * 生成演示饭店列表
   * @param {number} count 数量
   * @param {{lat:number, lng:number}} center 基准坐标（用于导航链接）
   */
  function generate(count = 18, center = { lat: 39.9042, lng: 116.4074 }) {
    const usedNames = new Set();
    const list = [];
    let guard = 0;
    while (list.length < count && guard++ < 200) {
      const cat = pick(CATEGORIES);
      const name = pick(cat.names);
      const fullName = usedNames.has(name) ? `${name}(${pick(['总店','旗舰店','二店','分店'])})` : name;
      usedNames.add(fullName);
      const distance = Math.round(rand(200, 3000));            // 米
      const bearing = rand(0, Math.PI * 2);                     // 随机方向
      const dLat = (distance / 111320) * Math.sin(bearing);
      const dLng = (distance / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.cos(bearing);
      const rating = (rand(3.8, 4.9)).toFixed(1);
      const price = randInt(cat.price[0], cat.price[1]);
      list.push({
        id: 'mock-' + list.length,
        name: fullName,
        type: cat.type,
        emoji: cat.emoji,
        rating: Number(rating),
        price,
        distance,                                              // 米
        address: `${pick(STREETS)}${randInt(3, 200)}号`,
        location: { lat: +(center.lat + dLat).toFixed(6), lng: +(center.lng + dLng).toFixed(6) },
        signature: pick(SIGNATURES[cat.type] || ['招牌菜']),
        tel: '',
        source: 'demo'                                         // 标记演示数据
      });
    }
    return list.sort((a, b) => a.distance - b.distance);
  }

  return { generate };
})();

/**
 * 饭店趣味签文：按菜系定制 + 通用池
 */
const RESTO_FORTUNE = {
  types: {
    '川菜':      { grade: '大吉签', line: '辣意冲天，无辣不欢', yi: '冰饮护体', ji: '穿白衣赴宴' },
    '湘菜':      { grade: '大吉签', line: '香辣入湘，干饭正当时', yi: '米饭管够', ji: '中途灌水' },
    '火锅':      { grade: '福气签', line: '锅气腾腾，聚拢人间烟火', yi: '约上饭搭子', ji: '穿浅色卫衣' },
    '烧烤':      { grade: '上上签', line: '炭火一开，烦恼全烤没', yi: '深夜放毒', ji: '细数串签' },
    '日料':      { grade: '平安签', line: '鱼生清雅，静心一晚', yi: '芥末少量试探', ji: '整团芥末跳崖' },
    '韩餐':      { grade: '福气签', line: '烤肉滋滋响，泡菜红亮亮', yi: '配剧下饭', ji: '白T恤' },
    '快餐简餐':  { grade: '平安签', line: '快就是慢，简单是福', yi: '赶时间的你', ji: '细嚼慢咽焦虑症' },
    '面馆':      { grade: '上上签', line: '一碗热汤面，熨帖五脏庙', yi: '加个卤蛋', ji: '汤洒身上' },
    '米粉米线':  { grade: '上上签', line: '嗦粉一声脆，人间值得', yi: '连汤带粉', ji: '白衬衫' },
    '面食':      { grade: '上上签', line: '面香扑鼻，实在过瘾', yi: '蒜瓣就面', ji: '优雅吃相' },
    '饺子馆':    { grade: '福气签', line: '元宝下锅，财气上桌', yi: '醋蒜双拼', ji: '抢最后一颗' },
    '西北菜':    { grade: '大吉签', line: '面香肉厚，豪迈一晚', yi: '大口吃肉', ji: '斯文做派' },
    '粤菜茶餐厅':{ grade: '福气签', line: '虾饺配茶，人生慢下来', yi: '一盅两件', ji: '行色匆匆' },
    '粤菜':      { grade: '福气签', line: '清鲜为本，食过返寻味', yi: '老火靓汤', ji: '心急烫嘴' },
    '地方菜':    { grade: '上上签', line: '他乡风味，别有洞天', yi: '大胆尝试', ji: '拿它跟家乡比' },
    '西餐':      { grade: '大吉签', line: '刀叉交响，今晚有点浪漫', yi: '七分熟', ji: '穿白裤子' },
    '小龙虾':    { grade: '上上签', line: '虾黄满膏，手指留香', yi: '戴上手套开炫', ji: '细数虾壳' },
    '轻食沙拉':  { grade: '平安签', line: '草料一顿，清清白白', yi: '给明天的大餐攒额度', ji: '半夜饿醒' },
    '海鲜':      { grade: '大吉签', line: '海风入席，鲜掉眉毛', yi: '蘸姜醋', ji: '肠胃冒险' },
    '饮品':      { grade: '平安签', line: '以茶代酒，清醒快乐', yi: '少糖去冰', ji: '晚上失眠' }
  },
  default: [
    { grade: '上上签', line: '此店与你，今日有缘', yi: '相信直觉', ji: '门口徘徊' },
    { grade: '福气签', line: '开门见饭，便是好日子', yi: '进门就点', ji: '再刷十分钟点评' },
    { grade: '大吉签', line: '饭香不怕巷子深', yi: '勇往直前', ji: '纠结距离' }
  ]
};

function restoFortuneOf(poi) {
  const t = RESTO_FORTUNE.types[poi.type];
  if (t) return t;
  const i = Math.abs((poi.name || '').length * 13) % RESTO_FORTUNE.default.length;
  return RESTO_FORTUNE.default[i];
}
