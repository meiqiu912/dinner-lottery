/**
 * 菜谱数据库 —— "在家做"抽签池
 * 每道菜：id / name / emoji / difficulty(1-3) / minutes(总耗时)
 *   ingredients: [{name, amount}] 食材清单（可直接当购物/备菜清单）
 *   prep: [] 备菜步骤（洗切腌）
 *   cook: [] 烹饪步骤
 */
const RECIPES = [
  {
    id: 'fanqie-chaodan', name: '番茄炒蛋', emoji: '🍅', difficulty: 1, minutes: 15,
    ingredients: [
      { name: '番茄', amount: '2个（约300g）' }, { name: '鸡蛋', amount: '3个' },
      { name: '小葱', amount: '1根' }, { name: '白糖', amount: '1小勺' },
      { name: '盐', amount: '适量' }, { name: '食用油', amount: '适量' }
    ],
    prep: ['番茄顶部划十字，开水烫30秒去皮，切滚刀块', '鸡蛋加一小撮盐打散至起泡', '小葱切葱花，葱白葱绿分开放'],
    cook: ['热锅倒油（稍多一点），油热倒入蛋液，凝固后快速划散成大块，盛出备用', '锅中补少许油，下葱白爆香，倒入番茄块中火翻炒出汁', '加白糖和盐调味，炒至番茄软烂出浓汁', '倒回鸡蛋翻炒均匀，让蛋块裹上汤汁', '撒葱绿出锅，配米饭绝了']
  },
  {
    id: 'hongshaorou', name: '红烧肉', emoji: '🥩', difficulty: 3, minutes: 90,
    ingredients: [
      { name: '五花肉', amount: '500g' }, { name: '冰糖', amount: '30g' },
      { name: '生抽', amount: '2勺' }, { name: '老抽', amount: '1勺' },
      { name: '料酒', amount: '2勺' }, { name: '姜片', amount: '4片' },
      { name: '八角', amount: '2个' }, { name: '香叶', amount: '2片' }, { name: '葱段', amount: '2段' }
    ],
    prep: ['五花肉切3厘米见方的块', '冷水下锅，加料酒姜片，焯水撇沫后捞出温水冲净', '准备好冰糖和香料'],
    cook: ['少油下冰糖，小火慢慢炒出琥珀色糖色', '立刻倒入肉块快速翻炒上色', '加葱段、姜片、八角、香叶炒香', '烹入料酒、生抽、老抽翻匀', '加热水没过肉，大火烧开转小火炖60分钟', '开盖大火收汁至浓稠冒泡，汤汁挂肉即可']
  },
  {
    id: 'mapo-doufu', name: '麻婆豆腐', emoji: '🌶️', difficulty: 2, minutes: 25,
    ingredients: [
      { name: '嫩豆腐', amount: '1盒（400g）' }, { name: '猪肉末', amount: '100g' },
      { name: '郫县豆瓣酱', amount: '1.5勺' }, { name: '豆豉', amount: '1小勺' },
      { name: '花椒面', amount: '1小勺' }, { name: '蒜末', amount: '3瓣' },
      { name: '姜末', amount: '适量' }, { name: '小葱', amount: '1根' }, { name: '水淀粉', amount: '适量' }
    ],
    prep: ['豆腐切2厘米方块，淡盐水中焯1分钟捞出（去豆腥且不易碎）', '豆瓣酱剁细，蒜姜切末，葱切花', '肉末准备好'],
    cook: ['热油下肉末炒散至微焦出香味，盛出备用', '底油下豆瓣酱和豆豉小火炒出红油', '加姜蒜末炒香，倒一小碗热水', '下豆腐和肉末，轻推匀，中火烧3分钟', '分两次淋入水淀粉勾芡，轻轻推匀', '出锅撒花椒面和葱花，麻、辣、烫、嫩']
  },
  {
    id: 'kele-jichi', name: '可乐鸡翅', emoji: '🍗', difficulty: 1, minutes: 30,
    ingredients: [
      { name: '鸡翅中', amount: '8个' }, { name: '可乐', amount: '1罐（330ml）' },
      { name: '生抽', amount: '2勺' }, { name: '老抽', amount: '半勺' },
      { name: '姜片', amount: '3片' }, { name: '料酒', amount: '1勺' }
    ],
    prep: ['鸡翅两面各划两刀方便入味', '冷水下锅加料酒姜片焯水，捞出擦干', '备好一罐可乐'],
    cook: ['少油小火把鸡翅两面煎至金黄', '下姜片，倒入可乐没过鸡翅', '加生抽、老抽，大火烧开转中火焖15分钟', '开盖大火收汁，不断翻动让鸡翅裹上亮亮酱汁', '收至粘稠冒大泡出锅']
  },
  {
    id: 'tangcu-paigu', name: '糖醋排骨', emoji: '🍖', difficulty: 2, minutes: 50,
    ingredients: [
      { name: '肋排', amount: '500g' }, { name: '冰糖', amount: '40g' },
      { name: '香醋', amount: '3勺' }, { name: '生抽', amount: '2勺' },
      { name: '料酒', amount: '2勺' }, { name: '姜片', amount: '3片' }, { name: '白芝麻', amount: '少许' }
    ],
    prep: ['排骨剁小段，冷水浸泡10分钟去血水', '冷水下锅焯水撇沫，捞出冲净', '调好料汁：1勺料酒+2勺生抽+3勺香醋+2勺清水'],
    cook: ['少油下排骨煎至两面微黄', '下姜片，倒入调好的料汁，加热水没过排骨', '大火烧开转小火焖35分钟', '下冰糖大火收汁，不断翻动防粘锅', '汤汁浓稠挂住排骨、颜色红亮时关火', '撒白芝麻出锅']
  },
  {
    id: 'yuxiang-rousi', name: '鱼香肉丝', emoji: '🥕', difficulty: 2, minutes: 25,
    ingredients: [
      { name: '猪里脊', amount: '250g' }, { name: '青椒', amount: '1个' },
      { name: '胡萝卜', amount: '半根' }, { name: '泡发木耳', amount: '5朵' },
      { name: '郫县豆瓣酱', amount: '1勺' }, { name: '葱姜蒜', amount: '适量' },
      { name: '生抽', amount: '1勺' }, { name: '香醋', amount: '2勺' }, { name: '白糖', amount: '1.5勺' }, { name: '水淀粉', amount: '适量' }
    ],
    prep: ['里脊切丝，加料酒、盐、少许淀粉和油抓匀腌10分钟', '青椒、胡萝卜、木耳全部切丝', '调鱼香汁：生抽1勺+醋2勺+糖1.5勺+淀粉半勺+清水3勺', '葱姜蒜切末'],
    cook: ['热锅热油下肉丝快速滑散至变色盛出', '底油下豆瓣酱小火炒出红油，加葱姜蒜末爆香', '下胡萝卜丝、木耳丝翻炒1分钟，再下青椒丝', '倒回肉丝，烹入鱼香汁大火翻炒', '汁浓亮油出锅，酸甜咸香带微辣']
  },
  {
    id: 'gongbao-jiding', name: '宫保鸡丁', emoji: '🥜', difficulty: 2, minutes: 25,
    ingredients: [
      { name: '鸡胸肉', amount: '300g' }, { name: '油炸花生米', amount: '50g' },
      { name: '干辣椒', amount: '8个' }, { name: '花椒', amount: '1小把' },
      { name: '葱段', amount: '3段' }, { name: '生抽', amount: '1勺' },
      { name: '香醋', amount: '1勺' }, { name: '白糖', amount: '1勺' }, { name: '水淀粉', amount: '适量' }
    ],
    prep: ['鸡胸肉切丁，加盐、料酒、淀粉抓匀腌10分钟', '干辣椒剪段去籽', '调汁：生抽+醋+糖+少许淀粉+2勺清水', '花生米去皮（用现成的更省事）'],
    cook: ['热油下鸡丁滑散炒至变色盛出', '底油小火下花椒、干辣椒段炸出香味（别炸糊）', '下葱段爆香，倒回鸡丁', '烹入调汁大火快速翻匀', '最后下花生米翻炒几下立即出锅，保持酥脆']
  },
  {
    id: 'qingzheng-luyu', name: '清蒸鲈鱼', emoji: '🐟', difficulty: 2, minutes: 25,
    ingredients: [
      { name: '鲈鱼', amount: '1条（约600g）' }, { name: '蒸鱼豉油', amount: '3勺' },
      { name: '葱段', amount: '3段' }, { name: '姜丝', amount: '1块' },
      { name: '红椒丝', amount: '少许' }, { name: '食用油', amount: '2勺' }
    ],
    prep: ['鲈鱼处理干净，两面各划三刀', '鱼身内外抹少许料酒和盐，塞入部分葱姜腌10分钟', '剩余葱姜红椒切细丝，泡清水里会卷起来'],
    cook: ['盘中垫两根筷子架起鱼身，水开后大火蒸8分钟', '关火不开盖再虚蒸2分钟', '倒掉盘中腥水，抽走筷子，换上新鲜葱姜丝红椒丝', '淋蒸鱼豉油', '烧2勺热油至冒烟，浇在葱丝上"滋啦"一声即成']
  },
  {
    id: 'shuizhu-roupian', name: '水煮肉片', emoji: '🔥', difficulty: 3, minutes: 40,
    ingredients: [
      { name: '猪里脊', amount: '300g' }, { name: '黄豆芽', amount: '150g' },
      { name: '莴笋', amount: '1根' }, { name: '郫县豆瓣酱', amount: '2勺' },
      { name: '干辣椒', amount: '10个' }, { name: '花椒', amount: '1小把' },
      { name: '蛋清', amount: '1个' }, { name: '淀粉', amount: '2勺' }, { name: '蒜末', amount: '5瓣' }, { name: '葱花', amount: '适量' }
    ],
    prep: ['里脊切薄片，加盐、蛋清、淀粉抓匀腌15分钟', '莴笋去皮切片，豆芽洗净', '干辣椒剪段，蒜切末', '豆瓣酱剁细'],
    cook: ['豆芽和莴笋片焯水断生，铺在大碗底', '热油炒豆瓣酱出红油，加热水烧开调好咸淡', '肉片逐片下锅，煮1分半钟至变色连汤倒入碗中', '表面铺蒜末、干辣椒段、花椒', '烧3勺热油浇上去激出香味，撒葱花上桌']
  },
  {
    id: 'huiguo-rou', name: '回锅肉', emoji: '🧅', difficulty: 2, minutes: 45,
    ingredients: [
      { name: '带皮五花肉', amount: '400g' }, { name: '蒜苗', amount: '3根' },
      { name: '郫县豆瓣酱', amount: '1.5勺' }, { name: '甜面酱', amount: '1勺' },
      { name: '豆豉', amount: '1小勺' }, { name: '姜片', amount: '3片' }, { name: '料酒', amount: '1勺' }
    ],
    prep: ['整块五花肉冷水下锅，加姜片料酒煮20分钟至筷子能插透', '捞出晾凉切薄片', '蒜苗斜切段，杆和叶分开'],
    cook: ['热锅少油，下肉片中火煸炒至微微卷曲出油（灯盏窝状）', '把肉推到一边，下豆瓣酱、豆豉、甜面酱炒出红油', '翻炒均匀让每片肉裹上酱', '先下蒜苗杆炒半分钟，再下蒜苗叶', '断生立即出锅，配米饭能吃三碗']
  },
  {
    id: 'disanxian', name: '地三鲜', emoji: '🥔', difficulty: 2, minutes: 30,
    ingredients: [
      { name: '土豆', amount: '1个' }, { name: '茄子', amount: '1根' },
      { name: '青椒', amount: '1个' }, { name: '蒜末', amount: '4瓣' },
      { name: '生抽', amount: '2勺' }, { name: '白糖', amount: '半勺' }, { name: '淀粉', amount: '适量' }
    ],
    prep: ['土豆茄子切滚刀块，青椒手撕成片', '茄子块撒少许淀粉拌匀（少吸油）', '调汁：生抽2勺+糖半勺+淀粉半勺+清水3勺+蒜末'],
    cook: ['油烧至六成热，土豆块炸至金黄捞出', '茄子炸至软身微焦捞出', '青椒快速过油10秒捞出', '锅留底油倒回所有食材，烹入调汁', '大火翻炒至汁浓裹匀出锅']
  },
  {
    id: 'suannai-kaofu' , name: '黑椒牛柳', emoji: '🥩', difficulty: 2, minutes: 25,
    ingredients: [
      { name: '牛里脊', amount: '300g' }, { name: '洋葱', amount: '半个' },
      { name: '青红椒', amount: '各半个' }, { name: '黑胡椒碎', amount: '1勺' },
      { name: '蚝油', amount: '1勺' }, { name: '生抽', amount: '1勺' }, { name: '淀粉', amount: '1勺' }, { name: '黄油', amount: '15g' }
    ],
    prep: ['牛肉逆纹切条，加生抽、淀粉、油抓匀腌15分钟', '洋葱青红椒切块', '调汁：蚝油+黑胡椒碎+少许清水'],
    cook: ['大火热油下牛柳快速滑炒至七成熟盛出', '锅中小火化开黄油，下洋葱炒出香味', '下青红椒块炒至断生', '倒回牛柳，烹入黑椒汁大火翻炒30秒', '出锅前补点现磨黑胡椒更香']
  },
  {
    id: 'gali-ji', name: '咖喱鸡肉', emoji: '🍛', difficulty: 1, minutes: 35,
    ingredients: [
      { name: '鸡腿肉', amount: '400g' }, { name: '土豆', amount: '1个' },
      { name: '胡萝卜', amount: '1根' }, { name: '洋葱', amount: '半个' },
      { name: '咖喱块', amount: '4小块（好侍百梦多）' }, { name: '椰浆或牛奶', amount: '100ml（可选）' }
    ],
    prep: ['鸡腿肉切块，土豆胡萝卜切滚刀块', '洋葱切丝', '咖喱块备好'],
    cook: ['少油下洋葱丝炒软出香', '下鸡块炒至表面变色', '下土豆胡萝卜翻炒2分钟', '加热水没过食材，大火烧开转小火煮15分钟', '关火放咖喱块搅至完全融化', '小火再煮5分钟至浓稠，可加椰浆更顺滑，浇米饭开吃']
  },
  {
    id: 'suantong-yumai' , name: '蒜蓉油麦菜', emoji: '🥬', difficulty: 1, minutes: 10,
    ingredients: [
      { name: '油麦菜', amount: '400g' }, { name: '大蒜', amount: '6瓣' },
      { name: '盐', amount: '适量' }, { name: '食用油', amount: '适量' }
    ],
    prep: ['油麦菜洗净掰成段沥干', '大蒜剁成蒜蓉'],
    cook: ['大火热油下一半蒜蓉爆香', '下油麦菜快速翻炒30秒至变软', '加盐和另一半蒜蓉，翻两下立即出锅', '全程大火快炒，久了出水就不好吃了']
  },
  {
    id: 'qingjiao-tudousi', name: '青椒土豆丝', emoji: '🥔', difficulty: 1, minutes: 15,
    ingredients: [
      { name: '土豆', amount: '2个' }, { name: '青椒', amount: '1个' },
      { name: '干辣椒', amount: '3个' }, { name: '香醋', amount: '2勺' }, { name: '盐', amount: '适量' }
    ],
    prep: ['土豆切细丝，清水反复冲洗掉淀粉再泡水', '青椒切丝，干辣椒剪段'],
    cook: ['大火热油下干辣椒段爆香', '下土豆丝不停翻炒1分钟', '沿锅边淋1勺香醋（保持脆爽的秘密）', '下青椒丝炒匀，加盐调味', '出锅前再淋半勺醋，酸辣脆爽']
  },
  {
    id: 'ganbian-doujiao', name: '干煸豆角', emoji: '🫘', difficulty: 2, minutes: 20,
    ingredients: [
      { name: '四季豆', amount: '400g' }, { name: '猪肉末', amount: '80g' },
      { name: '碎米芽菜', amount: '1包（或用橄榄菜代替）' }, { name: '干辣椒', amount: '6个' },
      { name: '蒜末', amount: '3瓣' }, { name: '生抽', amount: '1勺' }
    ],
    prep: ['四季豆撕去老筋掰段，务必沥干水分', '干辣椒剪段'],
    cook: ['油稍多，中火下豆角煸至表皮起皱发蔫（也可先炸更省事），盛出', '底油下肉末炒散至微焦', '下干辣椒、蒜末、芽菜炒香', '倒回豆角，加生抽大火翻匀出锅']
  },
  {
    id: 'jicai-chaodan', name: '韭菜炒蛋', emoji: '🥚', difficulty: 1, minutes: 10,
    ingredients: [
      { name: '韭菜', amount: '300g' }, { name: '鸡蛋', amount: '3个' },
      { name: '盐', amount: '适量' }, { name: '食用油', amount: '适量' }
    ],
    prep: ['韭菜洗净切段（梗和叶分开）', '鸡蛋加盐打散'],
    cook: ['热油下蛋液炒成大块盛出', '补少许油，下韭菜梗炒20秒再下韭菜叶', '韭菜塌软后倒回鸡蛋，加盐翻匀立即出锅']
  },
  {
    id: 'fanqie-niu-nan', name: '番茄炖牛腩', emoji: '🍲', difficulty: 3, minutes: 120,
    ingredients: [
      { name: '牛腩', amount: '600g' }, { name: '番茄', amount: '3个' },
      { name: '洋葱', amount: '半个' }, { name: '姜片', amount: '4片' },
      { name: '番茄酱', amount: '2勺' }, { name: '冰糖', amount: '15g' }, { name: '盐', amount: '适量' }
    ],
    prep: ['牛腩切大块冷水浸泡半小时去血水', '冷水下锅焯水捞出冲净', '2个番茄切块，1个切碎；洋葱切块'],
    cook: ['少油炒冰糖至微黄，下牛腩翻炒上色', '下姜片、洋葱块、番茄碎和番茄酱炒出红油', '加热水没过牛腩，小火炖90分钟', '下番茄块和盐，再炖15分钟至软烂', '汤汁浓红、牛腩用筷子一夹就散，连汤带肉浇米饭']
  },
  {
    id: 'donggua-paigu-tang', name: '冬瓜排骨汤', emoji: '🥣', difficulty: 1, minutes: 80,
    ingredients: [
      { name: '排骨', amount: '400g' }, { name: '冬瓜', amount: '500g' },
      { name: '姜片', amount: '3片' }, { name: '枸杞', amount: '10粒' }, { name: '盐', amount: '适量' }, { name: '白胡椒粉', amount: '少许' }
    ],
    prep: ['排骨冷水下锅焯水撇沫', '冬瓜去皮切厚片', '枸杞冲洗一下'],
    cook: ['排骨入砂锅加姜片和足量热水', '大火烧开转小火炖50分钟', '下冬瓜片再炖15分钟至透明', '加盐、白胡椒粉，撒枸杞即可', '清淡解腻，适合配重口硬菜']
  },
  {
    id: 'tomato-egg-noodles', name: '番茄鸡蛋面', emoji: '🍜', difficulty: 1, minutes: 20,
    ingredients: [
      { name: '挂面', amount: '150g' }, { name: '番茄', amount: '2个' },
      { name: '鸡蛋', amount: '2个' }, { name: '葱花', amount: '适量' },
      { name: '盐、生抽、香油', amount: '适量' }
    ],
    prep: ['番茄去皮切块，鸡蛋打散'],
    cook: ['炒散鸡蛋盛出', '底油下番茄炒出浓汁，加热水和盐、生抽', '水开下挂面煮至将熟', '倒回鸡蛋，淋香油撒葱花', '连汤带面一大碗，暖胃']
  },
  {
    id: 'dan-chaofan', name: '黄金蛋炒饭', emoji: '🍚', difficulty: 1, minutes: 15,
    ingredients: [
      { name: '隔夜米饭', amount: '1大碗' }, { name: '鸡蛋', amount: '2个' },
      { name: '火腿肠', amount: '1根' }, { name: '葱花', amount: '适量' },
      { name: '盐', amount: '适量' }
    ],
    prep: ['隔夜饭提前抓散（粒粒分明的关键）', '火腿肠切丁，葱花切好', '1个鸡蛋打散，1个备用'],
    cook: ['热油下打散的蛋液炒碎盛出', '补油下米饭中火炒散炒透', '把另一个鸡蛋直接磕在饭上快速炒散，让每粒米裹上蛋液', '下火腿丁和鸡蛋碎炒匀', '加盐、撒葱花，锅气十足出锅']
  },
  {
    id: 'congyou-banmian', name: '葱油拌面', emoji: '🥢', difficulty: 1, minutes: 20,
    ingredients: [
      { name: '细面条', amount: '200g' }, { name: '小葱', amount: '1把' },
      { name: '生抽', amount: '3勺' }, { name: '老抽', amount: '1勺' },
      { name: '白糖', amount: '1.5勺' }
    ],
    prep: ['小葱洗净彻底擦干，切长段', '调汁：生抽+老抽+糖搅匀'],
    cook: ['冷油下葱段，小火慢慢熬至葱干瘪呈焦糖色（别急）', '倒入调汁煮10秒关火，葱油即成', '面条煮熟捞出沥干，不用过凉', '浇上葱油汁拌匀，撒点熬焦的葱段', '葱香扑鼻，5块钱吃出幸福感']
  },
  {
    id: 'shui-jiao', name: '猪肉白菜水饺', emoji: '🥟', difficulty: 2, minutes: 60,
    ingredients: [
      { name: '猪肉馅', amount: '400g' }, { name: '白菜', amount: '300g' },
      { name: '饺子皮', amount: '40张' }, { name: '葱姜水', amount: '小半碗' },
      { name: '生抽、香油、盐', amount: '适量' }
    ],
    prep: ['白菜剁碎撒盐腌10分钟，攥干水分', '肉馅分3次打入葱姜水搅上劲', '拌入白菜，加生抽、香油、盐调匀', '包饺子（不会包就对折捏紧）'],
    cook: ['水开下饺子，推散防粘', '点三次凉水，饺子全部浮起鼓肚即熟', '蘸醋+蒜泥，或者调个酸汤', '一顿吃不完冻起来，就是快手早餐']
  },
  {
    id: 'yidalimian', name: '番茄肉酱意面', emoji: '🍝', difficulty: 2, minutes: 30,
    ingredients: [
      { name: '意大利面', amount: '200g' }, { name: '牛肉末', amount: '200g' },
      { name: '番茄', amount: '2个' }, { name: '洋葱', amount: '四分之一个' },
      { name: '番茄沙司', amount: '3勺' }, { name: '黄油', amount: '15g' }, { name: '黑胡椒、盐', amount: '适量' }
    ],
    prep: ['番茄去皮切碎，洋葱切碎'],
    cook: ['水开加盐，意面煮8-10分钟捞出拌少许油', '黄油化开下洋葱碎炒香', '下牛肉末炒散至变色', '下番茄碎和番茄沙司，小火熬成浓稠肉酱', '加盐和黑胡椒调味', '面条装盘浇上肉酱，仪式感拉满']
  }
];

/**
 * 趣味签文（每道菜定制）：
 *   grade 签级 / line 签文（一句有意思的话）/ yi 宜 / ji 忌
 * 覆盖不到的菜自动走通用签文池。
 */
const FORTUNES = {
  'fanqie-chaodan':  { grade: '上上签', line: '红黄相映，国民下饭第一签', yi: '连干三碗饭', ji: '争论咸甜之争' },
  'hongshaorou':     { grade: '大吉签', line: '肥而不腻，天意难违', yi: '焖一锅米饭', ji: '饭后称体重' },
  'mapo-doufu':      { grade: '上上签', line: '麻辣入魂，豆腐归心', yi: '多备两碗饭', ji: '穿白衣服开工' },
  'kele-jichi':      { grade: '福气签', line: '甜蜜暴击，快乐加倍', yi: '啃骨头嗦手指', ji: '计较谁多吃一个' },
  'tangcu-paigu':    { grade: '大吉签', line: '酸甜平衡，方是人生真谛', yi: '优雅吮指', ji: '端着绅士吃相' },
  'yuxiang-rousi':   { grade: '上上签', line: '无鱼却香，玄学之巅', yi: '细品人生', ji: '追问鱼在哪里' },
  'gongbao-jiding':  { grade: '上上签', line: '花生与鸡丁，天作之合', yi: '荔枝口入魂', ji: '光挑花生吃' },
  'qingzheng-luyu':  { grade: '福气签', line: '清鲜本味，大道至简', yi: '趁热下筷', ji: '多刺区逞英雄' },
  'shuizhu-roupian': { grade: '大吉签', line: '红油翻滚，热情似火', yi: '冰可乐护体', ji: '明早的厕所之行' },
  'huiguo-rou':      { grade: '上上签', line: '二进宫的肉，更懂人生', yi: '蒜苗多放', ji: '提减肥二字' },
  'disanxian':       { grade: '上上签', line: '土豆茄子青椒，素菜铁三角', yi: '汤汁拌饭', ji: '米饭不够' },
  'heijiao-niuliu':  { grade: '大吉签', line: '火候正好，牛气冲天', yi: '滑嫩入口', ji: '质疑七分熟' },
  'gali-ji':         { grade: '福气签', line: '浓汤裹饭，一勺入魂', yi: '一锅端', ji: '保持吃相' },
  'suantong-yumai':  { grade: '平安签', line: '绿意盎然，刮油有功', yi: '大鱼大肉之后', ji: '饭后亲密社交' },
  'qingjiao-tudousi':{ grade: '平安签', line: '家常本色，醋香脆爽', yi: '修炼刀工', ji: '跟外卖比性价比' },
  'ganbian-doujiao': { grade: '上上签', line: '虎皮皱起，焦香四溢', yi: '芽菜拌饭', ji: '没熟透就出锅' },
  'jicai-chaodan':   { grade: '平安签', line: '春鲜一把，黄金满盘', yi: '周末午餐', ji: '约会之前' },
  'fanqie-niu-nan':  { grade: '大吉签', line: '慢工出细活，炖出真感情', yi: '耐心等炖烂', ji: '饿着开锅揭盖' },
  'donggua-paigu-tang': { grade: '平安签', line: '清润降火，温柔一晚', yi: '饭前先喝汤', ji: '只喝汤不吃肉' },
  'tomato-egg-noodles': { grade: '福气签', line: '一碗热汤面，治愈全世界', yi: '深夜慰藉', ji: '面坨了才吃' },
  'dan-chaofan':     { grade: '大吉签', line: '粒粒分明，条条是道', yi: '隔夜饭翻身', ji: '心急粘锅' },
  'congyou-banmian': { grade: '上上签', line: '葱香入魂，五块吃饱', yi: '省钱大计', ji: '讲究摆盘' },
  'shui-jiao':       { grade: '福气签', line: '元宝滚锅，福气上桌', yi: '醋蒜双拼', ji: '抢最后一个饺子' },
  'yidalimian':      { grade: '大吉签', line: '刀叉交响，今晚有点浪漫', yi: '帕玛森自由', ji: '吸面声音过大' }
};

/* 通用签文池（未定制的菜 / 兜底） */
const FORTUNE_FALLBACK = [
  { grade: '上上签', line: '此菜与你，今夜有缘', yi: '相信直觉', ji: '犹豫不决' },
  { grade: '福气签', line: '热菜上桌，就是好日子', yi: '趁热吃', ji: '拍照太久' },
  { grade: '平安签', line: '吃饱了，才有力气想明天', yi: '先吃再说', ji: '深夜纠结' }
];

function fortuneOf(recipe) {
  return FORTUNES[recipe.id] ||
    FORTUNE_FALLBACK[Math.abs(recipe.id.length * 7) % FORTUNE_FALLBACK.length];
}

/* 有实拍图的菜品 id 清单（img/dishes/<id>.jpg）。无图菜品直接走 emoji 展示，不发无效请求 */
const DISHES_WITH_PHOTOS = new Set([
  'congyou-banmian', 'dan-chaofan', 'donggua-paigu-tang', 'fanqie-chaodan', 'gali-ji',
  'ganbian-doujiao', 'gongbao-jiding', 'heijiao-niuliu', 'hongshaorou', 'huiguo-rou',
  'kele-jichi', 'mapo-doufu', 'qingjiao-tudousi', 'qingzheng-luyu', 'shui-jiao',
  'shuizhu-roupian', 'suantong-yumai', 'tangcu-paigu', 'tomato-egg-noodles', 'yidalimian', 'yuxiang-rousi'
]);
