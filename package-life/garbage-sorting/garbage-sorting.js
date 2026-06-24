var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var garbageData = [
  { name: '废纸箱', emoji: '📦', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '包括纸箱、报纸、书本、打印纸等纸制品', tip: '请保持清洁干燥，折叠后投放', keywords: ['纸箱', '快递箱', '包裹', '纸盒', '包装盒'] },
  { name: '塑料瓶', emoji: '🍶', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '饮料瓶、洗发水瓶等塑料制品', tip: '清空内容物，冲洗干净后投放', keywords: ['塑料', '饮料瓶', '矿泉水瓶', 'PET', '洗发水瓶', '沐浴露'] },
  { name: '易拉罐', emoji: '🥫', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '铝制或铁制的金属罐', tip: '清空内容物，压扁后投放', keywords: ['铝罐', '可乐罐', '啤酒罐', '金属罐', '饮料罐'] },
  { name: '玻璃瓶', emoji: '🫙', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '酒瓶、调料瓶、玻璃杯等玻璃制品', tip: '小心轻放，避免破碎', keywords: ['玻璃', '酒瓶', '酱油瓶', '醋瓶', '玻璃杯'] },
  { name: '旧衣服', emoji: '👕', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '衣物、床单、窗帘等纺织品', tip: '清洗干净，打包后投放至回收点', keywords: ['衣服', '裤子', '裙子', '外套', '床单', '窗帘', '毛巾', '纺织品', '布料'] },
  { name: '牛奶盒', emoji: '🥛', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '利乐包、牛奶盒等复合包装', tip: '清洗、剪开、压扁后投放', keywords: ['牛奶', '利乐包', '饮料盒', '果汁盒'] },
  { name: '旧书刊', emoji: '📚', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '书籍、杂志、宣传册等', tip: '捆绑整齐后投放', keywords: ['书', '杂志', '报纸', '宣传册', '课本', '笔记本', '纸张'] },
  { name: '废旧金属', emoji: '⚙️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '铁丝、铜线、铝制品等金属', tip: '清洁后投放至可回收桶', keywords: ['金属', '铁', '铜', '铝', '钢丝', '铁丝', '铜线'] },
  { name: '报纸', emoji: '📰', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '各类报纸、期刊', tip: '保持干燥，捆扎后投放', keywords: ['报纸', '期刊', '新闻纸'] },
  { name: '打印纸', emoji: '🖨️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: 'A4纸、复印纸等办公用纸', tip: '保持干燥平整', keywords: ['A4', '打印', '复印', '办公纸', '白纸'] },
  { name: '纸袋', emoji: '🛍️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '纸质购物袋、包装袋', tip: '保持干燥，折叠后投放', keywords: ['纸袋', '购物袋', '牛皮纸'] },
  { name: '塑料玩具', emoji: '🧸', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '塑料材质的玩具', tip: '取出电池后投放', keywords: ['玩具', '塑料玩具', '积木'] },
  { name: '不锈钢锅', emoji: '🍳', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '不锈钢、铁质厨具', tip: '清洗后投放', keywords: ['锅', '不锈钢', '铁锅', '厨具', '炒锅'] },
  { name: '铝箔纸', emoji: '🪙', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '锡纸、铝箔等', tip: '清洁后揉成团投放', keywords: ['锡纸', '铝箔', '烤肉纸'] },
  { name: '旧鞋', emoji: '👟', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '旧鞋子、运动鞋等', tip: '配对打包后投放', keywords: ['鞋', '运动鞋', '皮鞋', '凉鞋'] },
  { name: '包包', emoji: '👜', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '旧包、手提包等', tip: '清空内物后投放', keywords: ['包', '手提包', '背包', '书包'] },
  { name: '电池', emoji: '🔋', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '充电电池、纽扣电池、铅酸电池等', tip: '切勿随意丢弃，投入有害垃圾桶', keywords: ['电池', '充电电池', '纽扣电池', '蓄电池', '5号电池', '7号电池'] },
  { name: '灯管', emoji: '💡', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '荧光灯管、节能灯、LED灯等', tip: '小心轻放，避免破碎造成汞污染', keywords: ['灯', '灯管', '灯泡', '荧光灯', '节能灯', 'LED'] },
  { name: '药品', emoji: '💊', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '过期药品及其包装', tip: '连同包装一起投入有害垃圾桶', keywords: ['药', '药品', '过期药', '药片', '胶囊', '药瓶', '感冒药', '消炎药'] },
  { name: '油漆桶', emoji: '🪣', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '油漆、涂料、溶剂等化学制品容器', tip: '密封后投放，避免泄漏', keywords: ['油漆', '涂料', '溶剂', '稀释剂', '天那水'] },
  { name: '杀虫剂', emoji: '🧴', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '各类杀虫剂、除草剂等农药', tip: '连同包装一起投放至有害垃圾桶', keywords: ['杀虫剂', '农药', '除草剂', '蚊香液', '驱蚊'] },
  { name: '温度计', emoji: '🌡️', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '水银温度计等含汞物品', tip: '小心轻放，避免破碎', keywords: ['温度计', '水银', '体温计', '汞'] },
  { name: '过期化妆品', emoji: '💄', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '过期的护肤品、化妆品', tip: '连同包装一起投放', keywords: ['化妆品', '口红', '粉底', '眼影', '护肤品', '面霜', '乳液', '指甲油'] },
  { name: '废墨盒', emoji: '🖨️', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '打印机墨盒、硒鼓', tip: '连同包装一起投放', keywords: ['墨盒', '硒鼓', '碳粉', '打印机'] },
  { name: '废胶片', emoji: '🎞️', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: 'X光片、胶卷等含银废品', tip: '装袋后投放', keywords: ['胶片', 'X光', '胶卷', '底片'] },
  { name: '水银血压计', emoji: '🩺', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '含汞血压计', tip: '小心轻放，避免破碎', keywords: ['血压计', '水银', '医疗'] },
  { name: '消毒液瓶', emoji: '🧪', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '含化学成分的消毒液容器', tip: '密封后投放', keywords: ['消毒液', '84消毒液', '酒精', '化学'] },
  { name: '剩菜剩饭', emoji: '🍚', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '剩余饭菜、糕点、蔬菜等食物残渣', tip: '沥干水分后投放，避免混入餐具', keywords: ['剩饭', '剩菜', '饭菜', '食物残渣', '剩饭剩菜'] },
  { name: '果皮', emoji: '🍎', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '水果皮、核、蔬菜叶等', tip: '直接投放至厨余垃圾桶', keywords: ['果皮', '苹果皮', '香蕉皮', '橘子皮', '西瓜皮', '水果'] },
  { name: '蛋壳', emoji: '🥚', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '鸡蛋壳、鸭蛋壳等', tip: '可直接投放', keywords: ['蛋壳', '鸡蛋壳', '鸭蛋壳', '蛋'] },
  { name: '茶叶渣', emoji: '🍵', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '泡过的茶叶、咖啡渣等', tip: '沥干水分后投放', keywords: ['茶叶', '茶渣', '咖啡渣', '茶'] },
  { name: '骨头', emoji: '🦴', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '小骨头（鸡骨、鱼骨等）', tip: '大骨头属于其他垃圾', keywords: ['骨头', '鸡骨', '鱼骨', '小骨头'] },
  { name: '菜叶', emoji: '🥬', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '各种蔬菜叶子', tip: '可直接投放', keywords: ['菜叶', '蔬菜', '白菜', '青菜', '菜'] },
  { name: '鱼骨', emoji: '🐟', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '鱼类小骨头', tip: '大鱼骨属于其他垃圾', keywords: ['鱼骨', '鱼刺', '鱼'] },
  { name: '瓜子壳', emoji: '🌻', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '瓜子壳、花生壳等', tip: '直接投放', keywords: ['瓜子', '花生壳', '坚果壳', '瓜子壳'] },
  { name: '中药渣', emoji: '🌿', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '煎煮后的中药残渣', tip: '沥干水分后投放', keywords: ['中药', '药渣', '草药'] },
  { name: '过期食品', emoji: '🍞', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '过期的面包、饼干等食品', tip: '去除外包装后投放', keywords: ['过期', '面包', '饼干', '食品', '零食'] },
  { name: '豆腐渣', emoji: '🫘', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '豆腐渣、豆渣等', tip: '沥干水分后投放', keywords: ['豆腐', '豆渣', '豆浆渣'] },
  { name: '米饭', emoji: '🍚', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '剩余米饭、面条等主食', tip: '沥干水分后投放', keywords: ['米饭', '饭', '面条', '米', '粥'] },
  { name: '水果', emoji: '🍉', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '腐烂或剩余的水果', tip: '直接投放', keywords: ['水果', '苹果', '香蕉', '梨', '桃', '葡萄'] },
  { name: '玉米芯', emoji: '🌽', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '吃完的玉米芯', tip: '直接投放', keywords: ['玉米', '玉米芯', '玉米棒'] },
  { name: '虾壳', emoji: '🦐', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '虾壳、蟹壳等小型壳类', tip: '直接投放', keywords: ['虾壳', '蟹壳', '虾', '蟹'] },
  { name: '卫生纸', emoji: '🧻', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的卫生纸、餐巾纸等', tip: '已被污染，无法回收利用', keywords: ['卫生纸', '纸巾', '餐巾纸', '面巾纸', '擦手纸', '厕纸'] },
  { name: '烟蒂', emoji: '🚬', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '烟头、烟灰等', tip: '确保熄灭后投放', keywords: ['烟', '烟头', '烟灰', '烟蒂', '香烟'] },
  { name: '陶瓷碎片', emoji: '🏺', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '破碎的陶瓷、瓦片等', tip: '用纸包裹后再投放，避免划伤', keywords: ['陶瓷', '碗', '盘子', '瓦片', '花盆', '瓷砖'] },
  { name: '一次性餐具', emoji: '🥢', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '一次性筷子、饭盒、杯子等', tip: '清理残留食物后投放', keywords: ['一次性', '筷子', '饭盒', '杯子', '餐具'] },
  { name: '尘土', emoji: '🌪️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '灰尘、清扫垃圾等', tip: '装袋后密封投放', keywords: ['灰尘', '尘土', '扫地', '清扫'] },
  { name: '贝壳', emoji: '🐚', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '蛤蜊、扇贝等海鲜壳', tip: '难以降解，属于其他垃圾', keywords: ['贝壳', '蛤蜊', '扇贝', '生蚝壳'] },
  { name: '大骨头', emoji: '🍖', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '猪骨、牛骨等大块骨头', tip: '难以粉碎处理，属其他垃圾', keywords: ['大骨头', '猪骨', '牛骨', '排骨', '筒骨'] },
  { name: '外卖餐盒', emoji: '🍱', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '一次性塑料餐盒', tip: '油污严重时属其他垃圾', keywords: ['外卖', '餐盒', '打包盒', '塑料盒'] },
  { name: '充电器', emoji: '🔌', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '损坏的电子配件', tip: '建议送至专门回收点', keywords: ['充电器', '数据线', '电子配件'] },
  { name: '创可贴', emoji: '🩹', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的创可贴', tip: '直接投放', keywords: ['创可贴', '绷带', '止血贴'] },
  { name: '猫砂', emoji: '🐱', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的猫砂', tip: '装袋密封后投放', keywords: ['猫砂', '宠物', '猫'] },
  { name: '狗粮袋', emoji: '🐕', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '宠物食品包装袋', tip: '清空后投放', keywords: ['狗粮', '猫粮', '宠物食品'] },
  { name: '纸尿裤', emoji: '👶', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的纸尿裤、卫生巾', tip: '包裹后投放', keywords: ['纸尿裤', '尿不湿', '卫生巾', '尿片'] },
  { name: '胶带', emoji: '📎', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '透明胶带、双面胶等', tip: '直接投放', keywords: ['胶带', '透明胶', '双面胶', '胶水'] },
  { name: '拖把', emoji: '🧹', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '废旧拖把、扫帚等', tip: '直接投放', keywords: ['拖把', '扫帚', '清洁工具'] },
  { name: '干燥剂', emoji: '📦', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '食品包装中的干燥剂', tip: '直接投放', keywords: ['干燥剂', '防潮剂', '硅胶'] },
  { name: '污损塑料袋', emoji: '🛒', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '被污染的塑料袋', tip: '直接投放', keywords: ['塑料袋', '购物袋', '垃圾袋'] },
  { name: '破旧雨伞', emoji: '☂️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '损坏无法使用的雨伞', tip: '直接投放', keywords: ['雨伞', '伞'] },
  { name: '毛发', emoji: '💇', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '头发、宠物毛发等', tip: '装袋后投放', keywords: ['头发', '毛发', '宠物毛'] },
  { name: '灰土', emoji: '🧱', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '炉灰、渣土等', tip: '装袋后投放', keywords: ['灰', '土', '渣', '炉灰'] },
  { name: '口香糖', emoji: '🫧', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '嚼过的口香糖', tip: '用纸包好后投放', keywords: ['口香糖', '泡泡糖'] },
  { name: '保鲜膜', emoji: '🎞️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的保鲜膜', tip: '直接投放', keywords: ['保鲜膜', '塑料膜', '缠绕膜'] },
  { name: '湿巾', emoji: '🧴', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的湿纸巾', tip: '直接投放', keywords: ['湿巾', '湿纸巾', '消毒湿巾'] },
  { name: '旧毛巾', emoji: '🧽', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '旧毛巾、抹布等纺织品', tip: '清洗后投放', keywords: ['毛巾', '抹布', '纺织品'] },
  { name: '饮料盒', emoji: '🧃', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '果汁盒、酸奶盒等', tip: '清洗压扁后投放', keywords: ['饮料盒', '果汁盒', '酸奶盒'] },
  { name: '废铜线', emoji: '🔌', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '废电线、铜线等', tip: '投放至可回收桶', keywords: ['电线', '铜线', '电缆'] },
  { name: '旧家电', emoji: '📺', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '旧电视、冰箱、洗衣机等', tip: '联系专业回收机构', keywords: ['家电', '电视', '冰箱', '洗衣机', '空调', '电器'] },
  { name: '手机', emoji: '📱', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '旧手机、平板等电子产品', tip: '恢复出厂设置后投放', keywords: ['手机', '平板', '电子产品', '电脑'] },
  { name: '旧键盘', emoji: '⌨️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '旧键盘、鼠标等外设', tip: '投放至可回收桶', keywords: ['键盘', '鼠标', '电脑配件'] },
  { name: '硬纸板', emoji: '📋', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '瓦楞纸板、硬纸板', tip: '折叠压平后投放', keywords: ['硬纸板', '瓦楞纸', '纸板'] },
  { name: '信封', emoji: '✉️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '纸质信封、文件袋', tip: '去除塑料窗后投放', keywords: ['信封', '文件袋', '信件'] },
  { name: '光盘', emoji: '💿', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: 'CD、DVD光盘', tip: '装入袋中投放', keywords: ['光盘', 'CD', 'DVD', '碟片'] },
  { name: '墨水瓶', emoji: '🖊️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '玻璃墨水瓶', tip: '清洗后投放', keywords: ['墨水', '墨水瓶'] },
  { name: '旧枕头', emoji: '🛏️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '旧枕头、靠垫等', tip: '打包后投放', keywords: ['枕头', '靠垫', '抱枕'] },
  { name: '塑料桶', emoji: '🪣', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '塑料水桶、收纳箱', tip: '清洗后投放', keywords: ['塑料桶', '水桶', '收纳箱', '整理箱'] },
  { name: '废纸', emoji: '📄', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '各类废纸、便签纸', tip: '保持干燥后投放', keywords: ['废纸', '便签', '草稿纸', '纸'] },
  { name: '铝制易拉罐', emoji: '🥫', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '铝制饮料罐', tip: '压扁后投放', keywords: ['铝', '易拉罐', '罐头'] },
  { name: '过期指甲油', emoji: '💅', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '指甲油、洗甲水等', tip: '密封后投放', keywords: ['指甲油', '洗甲水', '美甲'] },
  { name: '废荧光棒', emoji: '✨', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '荧光棒、发光棒', tip: '装袋后投放', keywords: ['荧光棒', '发光棒', '荧光'] },
  { name: '废打印机色带', emoji: '🖨️', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '打印机色带、墨盒', tip: '连同包装投放', keywords: ['色带', '墨盒', '打印机'] },
  { name: '废有机溶剂', emoji: '🧪', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '有机溶剂、化学试剂', tip: '密封后投放', keywords: ['溶剂', '化学', '试剂', '丙酮', '酒精'] },
  { name: '废矿物油', emoji: '🛢️', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '废机油、润滑油等', tip: '密封容器存放后投放', keywords: ['机油', '润滑油', '矿物油', '油'] },
  { name: '染发剂', emoji: '💇', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '染发剂及其包装', tip: '密封后投放', keywords: ['染发', '染发剂', '焗油'] },
  { name: '废胶片', emoji: '📸', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '废相纸、废胶卷', tip: '装袋后投放', keywords: ['相纸', '胶卷', '照片'] },
  { name: '过期保健品', emoji: '💊', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '过期的保健品、维生素', tip: '连同包装投放', keywords: ['保健品', '维生素', '营养品'] },
  { name: '花生壳', emoji: '🥜', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '花生壳、坚果壳', tip: '直接投放', keywords: ['花生壳', '花生', '坚果'] },
  { name: '甘蔗皮', emoji: '🎋', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '甘蔗皮、甘蔗渣', tip: '直接投放', keywords: ['甘蔗', '甘蔗皮'] },
  { name: '豆腐', emoji: '🧈', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '过期或变质的豆腐', tip: '去包装后投放', keywords: ['豆腐', '豆制品'] },
  { name: '宠物饲料', emoji: '🐾', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '过期的宠物食品', tip: '去包装后投放', keywords: ['宠物', '饲料', '猫粮', '狗粮'] },
  { name: '火锅底料', emoji: '🍲', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '剩余火锅底料、调料', tip: '沥干后投放', keywords: ['火锅', '底料', '调料'] },
  { name: '菜根', emoji: '🥕', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '蔬菜根茎、菜帮', tip: '直接投放', keywords: ['菜根', '蔬菜', '萝卜', '胡萝卜'] },
  { name: '葱蒜皮', emoji: '🧅', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '葱皮、蒜皮、洋葱皮', tip: '直接投放', keywords: ['葱', '蒜', '洋葱', '葱皮', '蒜皮'] },
  { name: '过期牛奶', emoji: '🥛', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '过期变质的牛奶', tip: '倒掉液体后投放', keywords: ['牛奶', '过期', '酸奶', '变质'] },
  { name: '烂菜叶', emoji: '🥬', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '腐烂的蔬菜叶子', tip: '直接投放', keywords: ['烂菜', '腐烂', '蔬菜'] },
  { name: '蛋糕', emoji: '🎂', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '剩余蛋糕、面包等糕点', tip: '去包装后投放', keywords: ['蛋糕', '面包', '糕点', '甜品'] },
  { name: '破损碗碟', emoji: '🍽️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '破损的碗、碟、杯子', tip: '用纸包裹后投放', keywords: ['碗', '碟', '杯子', '盘子', '瓷器'] },
  { name: '旧牙刷', emoji: '🪥', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '废旧牙刷', tip: '直接投放', keywords: ['牙刷', '刷牙'] },
  { name: '用过的棉签', emoji: '🩹', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的棉签、棉球', tip: '直接投放', keywords: ['棉签', '棉球', '化妆棉'] },
  { name: '烟盒', emoji: '🚬', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '空烟盒', tip: '直接投放', keywords: ['烟盒', '香烟盒'] },
  { name: '用过的口罩', emoji: '😷', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的一次性口罩', tip: '折叠后投放', keywords: ['口罩', '一次性口罩', '防护'] },
  { name: '一次性手套', emoji: '🧤', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的一次性手套', tip: '直接投放', keywords: ['手套', '一次性手套', '橡胶手套'] },
  { name: '破旧鞋子', emoji: '👞', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '严重破损无法回收的鞋', tip: '直接投放', keywords: ['破鞋', '旧鞋', '坏鞋'] },
  { name: '铅笔屑', emoji: '✏️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '铅笔刨花、橡皮屑', tip: '直接投放', keywords: ['铅笔', '橡皮', '刨花'] },
  { name: '过期隐形眼镜', emoji: '👁️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '过期的隐形眼镜', tip: '连同包装投放', keywords: ['隐形眼镜', '美瞳'] },
  { name: '用过的化妆棉', emoji: '🧴', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的化妆棉、卸妆棉', tip: '直接投放', keywords: ['化妆棉', '卸妆棉', '卸妆'] },
  { name: '砂纸', emoji: '📃', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '用过的砂纸', tip: '直接投放', keywords: ['砂纸', '打磨'] },
  { name: '防潮剂', emoji: '📦', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '食品中的防潮剂', tip: '直接投放', keywords: ['防潮剂', '干燥剂', '除湿'] },
  { name: '海绵', emoji: '🧽', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '废旧海绵、洗碗布', tip: '直接投放', keywords: ['海绵', '洗碗布', '清洁海绵'] },
  { name: '创可贴包装', emoji: '🩹', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '创可贴的外包装纸', tip: '直接投放', keywords: ['包装', '创可贴'] },
  { name: '废笔', emoji: '🖊️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '用完的笔、马克笔', tip: '直接投放', keywords: ['笔', '圆珠笔', '马克笔', '水笔'] },
  { name: '橡皮筋', emoji: '📎', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '断裂的橡皮筋', tip: '直接投放', keywords: ['橡皮筋', '皮筋'] },
  { name: '污损纸张', emoji: '📄', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '被油污浸染的纸张', tip: '直接投放', keywords: ['油纸', '污损', '油污纸'] },
  { name: '贴纸', emoji: '🏷️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的贴纸、标签', tip: '直接投放', keywords: ['贴纸', '标签', '不干胶'] },
  { name: '一次性剃须刀', emoji: '🪒', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '一次性剃须刀', tip: '包裹刀片后投放', keywords: ['剃须刀', '刮胡刀'] },
  { name: '食品干燥剂', emoji: '📦', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '食品包装内的干燥剂包', tip: '直接投放', keywords: ['干燥剂', '食品干燥剂'] },
  { name: '暖宝宝', emoji: '🔥', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的暖宝宝', tip: '冷却后投放', keywords: ['暖宝宝', '暖贴', '发热贴'] },
  { name: '气球', emoji: '🎈', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '废弃气球', tip: '直接投放', keywords: ['气球'] },
  { name: '吸管', emoji: '🥤', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '塑料吸管', tip: '直接投放', keywords: ['吸管', '塑料吸管'] },
  { name: '牙签', emoji: '🪥', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的牙签', tip: '用纸包好后投放', keywords: ['牙签'] },
  { name: '保鲜袋', emoji: '🛍️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的保鲜袋', tip: '直接投放', keywords: ['保鲜袋', '密封袋', '食品袋'] },
  { name: '锡纸', emoji: '🪙', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的锡纸', tip: '直接投放', keywords: ['锡纸', '铝箔', '烤肉纸'] },
  { name: '一次性杯盖', emoji: '🥤', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '塑料杯盖', tip: '直接投放', keywords: ['杯盖', '塑料盖'] },
  { name: '用过的纸杯', emoji: '🥛', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '一次性纸杯', tip: '倒空内容物后投放', keywords: ['纸杯', '一次性杯'] },
  { name: '茶叶包装袋', emoji: '🍵', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '茶叶的外包装袋', tip: '直接投放', keywords: ['茶叶袋', '包装袋'] },
  { name: '快递袋', emoji: '📦', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '塑料快递袋', tip: '直接投放', keywords: ['快递袋', '快递', '邮包'] },
  { name: '气泡膜', emoji: '🫧', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '快递气泡膜', tip: '直接投放', keywords: ['气泡膜', '泡泡膜', '防震膜'] },
  { name: '泡沫箱', emoji: '📦', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '白色泡沫箱、泡沫板', tip: '大块投放', keywords: ['泡沫', '泡沫箱', 'EPS', '保丽龙'] },
  { name: '旧地毯', emoji: '🏠', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '废旧地毯、地垫', tip: '卷起后投放', keywords: ['地毯', '地垫', '垫子'] },
  { name: '碎玻璃', emoji: '🪟', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '碎玻璃片', tip: '用厚纸包裹标注后投放', keywords: ['碎玻璃', '玻璃碎片'] },
  { name: '过期食用油', emoji: '🫒', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '过期的食用油', tip: '密封容器后投放', keywords: ['食用油', '油', '过期油', '废油'] }
]

Page({
  data: {
    i18n: {},
    searchKeyword: '',
    currentCategory: 'all',
    showResult: false,
    resultItem: null,
    filteredItems: garbageData,
    historyList: [],
    categoryTitle: '',

    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',

    activeTab: 'search',
    isListening: false,
    showPhotoGuide: false,
    quizMode: false,
    quizQuestion: null,
    quizOptions: [],
    quizSelectedIndex: -1,
    quizCorrectIndex: -1,
    quizAnswered: false,
    quizScore: 0,
    quizTotal: 0,
    quizFinished: false,
    quizQuestions: [],
    isLoading: true
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('垃圾分类查询')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('garbageSorting') })

    this.loadHistory()
    this.filterItems()
    this._updateI18nData()
    poster.setupForPage(this, 12)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('garbageSorting') })
    this._updateI18nData()
  },

  loadHistory: function() {
    var history = storageUtil.safeGetArray('garbage_history')
    this.setData({ historyList: history.slice(0, 10) })
  },

  onSearchInput: function(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.filterItems()
  },

  onSearch: function() {
    wx.vibrateShort({ type: 'light' })
    var keyword = this.data.searchKeyword.trim()
    if (!keyword) {
      wx.showToast({ title: this.data.i18n.inputSearchKeyword, icon: 'none' })
      return
    }
    var results = this._searchByKeyword(keyword)
    if (results.length > 0) {
      this.showResult(results[0])
      this.addToHistory(results[0])
      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(12, '垃圾分类查询', false)
    } else {
      wx.showToast({ title: this.data.i18n.notFoundKeyword, icon: 'none' })
    }
  },

  _searchByKeyword: function(keyword) {
    var kw = keyword.toLowerCase()
    var results = []
    for (var i = 0; i < garbageData.length; i++) {
      var item = garbageData[i]
      if (item.name.indexOf(keyword) > -1 || item.desc.indexOf(keyword) > -1) {
        results.push(item)
        continue
      }
      if (item.keywords) {
        for (var j = 0; j < item.keywords.length; j++) {
          if (item.keywords[j].indexOf(keyword) > -1 || keyword.indexOf(item.keywords[j]) > -1) {
            results.push(item)
            break
          }
        }
      }
    }
    return results
  },

  switchCategory: function(e) {
    wx.vibrateShort({ type: 'light' })
    var category = e.currentTarget.dataset.category
    var t = this.data.i18n
    var titleMap = {
      recyclable: t.catRecyclableText,
      hazardous: t.catHazardousText,
      kitchen: t.catKitchenText,
      other: t.catOtherText
    }
    this.setData({
      currentCategory: category,
      showResult: false,
      categoryTitle: titleMap[category] || ''
    })
    this.filterItems()
  },

  filterItems: function() {
    var items = garbageData
    if (this.data.currentCategory !== 'all') {
      var cat = this.data.currentCategory
      var filtered = []
      for (var i = 0; i < items.length; i++) {
        if (items[i].category === cat) filtered.push(items[i])
      }
      items = filtered
    }
    if (this.data.searchKeyword.trim()) {
      var keyword = this.data.searchKeyword.trim()
      items = this._searchByKeyword(keyword)
      if (this.data.currentCategory !== 'all') {
        var cat2 = this.data.currentCategory
        var catFiltered = []
        for (var j = 0; j < items.length; j++) {
          if (items[j].category === cat2) catFiltered.push(items[j])
        }
        items = catFiltered
      }
    }
    this.setData({ filteredItems: items })
  },

  onItemClick: function(e) {
    wx.vibrateShort({ type: 'light' })
    var item = e.currentTarget.dataset.item
    this.showResult(item)
    this.addToHistory(item)
  },

  showResult: function(item) {
    this.setData({ showResult: true, resultItem: item })
  },

  addToHistory: function(item) {
    var history = storageUtil.safeGetArray('garbage_history')
    var newRecord = {}
    for (var key in item) { newRecord[key] = item[key] }
    newRecord.time = Date.now()
    var filtered = []
    for (var i = 0; i < history.length; i++) {
      if (history[i].name !== item.name) filtered.push(history[i])
    }
    filtered.unshift(newRecord)
    var saved = filtered.slice(0, 20)
    storageUtil.safeSet('garbage_history', saved)
    this.setData({ historyList: saved.slice(0, 10) })
  },

  onHistoryClick: function(e) {
    wx.vibrateShort({ type: 'light' })
    var item = e.currentTarget.dataset.item
    this.showResult(item)
  },

  clearHistory: function() {
    wx.showModal({
      title: this.data.i18n.tipTitle,
      content: this.data.i18n.confirmClearHistory,
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('garbage_history')
          this.setData({ historyList: [] })
          wx.showToast({ title: this.data.i18n.cleared, icon: 'success' })
        }
      }.bind(this)
    })
  },

  copyResult: function() {
    var item = this.data.resultItem
    var t = this.data.i18n
    var text = ''
    if (item) {
      text = item.name + ' → ' + item.categoryText + '\n' + item.desc + '\n' + t.copyFormat + item.tip
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        searchKeyword: '',
        currentCategory: 'all',
        showResult: false,
        resultItem: null,
        activeTab: 'search'
      })
      that.filterItems()
    })
  },

  onTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    if (tab === 'quiz') this.startNewQuiz()
  },

  startVoiceSearch: function() {
    var that = this
    if (that.data.isListening) return
    wx.vibrateShort({ type: 'light' })
    that.setData({ isListening: true })
    wx.startRecord({
      success: function(res) {
        var tempFilePath = res.tempFilePath
        wx.stopRecord()
        that.setData({ isListening: false })
        wx.showModal({
          title: that.data.i18n.voiceRecognition,
          content: that.data.i18n.voiceNotSupported,
          showCancel: false
        })
      },
      fail: function() {
        that.setData({ isListening: false })
      }
    })
    setTimeout(function() {
      if (that.data.isListening) {
        wx.stopRecord()
        that.setData({ isListening: false })
      }
    }, 5000)
  },

  useVoiceInput: function() {
    var that = this
    wx.vibrateShort({ type: 'light' })
    wx.showModal({
      title: this.data.i18n.voiceSearch,
      content: this.data.i18n.voiceSearchGuide,
      showCancel: false,
      confirmText: this.data.i18n.gotIt
    })
  },

  showPhotoGuideModal: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ showPhotoGuide: true })
  },

  hidePhotoGuide: function() {
    this.setData({ showPhotoGuide: false })
  },

  openImageTool: function() {
    this.setData({ showPhotoGuide: false })
    wx.navigateTo({ url: '/package-text/base64-tool/base64-tool' })
  },

  startNewQuiz: function() {
    var questions = this._generateQuizQuestions(10)
    this.setData({
      quizQuestions: questions,
      quizScore: 0,
      quizTotal: 0,
      quizFinished: false,
      quizQuestion: questions[0],
      quizOptions: questions[0].options,
      quizSelectedIndex: -1,
      quizCorrectIndex: -1,
      quizAnswered: false,
      quizMode: true
    })
  },

  _generateQuizQuestions: function(count) {
    var shuffled = garbageData.slice().sort(function() { return Math.random() - 0.5 })
    var questions = []
    var categories = ['recyclable', 'hazardous', 'kitchen', 'other']
    var t = this.data.i18n
    var catNames = { recyclable: t.catRecyclableText, hazardous: t.catHazardousText, kitchen: t.catKitchenText, other: t.catOtherText }
    var num = Math.min(count, shuffled.length)
    for (var i = 0; i < num; i++) {
      var item = shuffled[i]
      var correctCat = item.category
      var options = [catNames[correctCat]]
      var otherCats = []
      for (var c = 0; c < categories.length; c++) {
        if (categories[c] !== correctCat) otherCats.push(catNames[categories[c]])
      }
      otherCats.sort(function() { return Math.random() - 0.5 })
      options.push(otherCats[0], otherCats[1], otherCats[2])
      options.sort(function() { return Math.random() - 0.5 })
      var correctIndex = -1
      for (var j = 0; j < options.length; j++) {
        if (options[j] === catNames[correctCat]) { correctIndex = j; break }
      }
      questions.push({
        item: item,
        options: options,
        correctIndex: correctIndex,
        index: i
      })
    }
    return questions
  },

  onQuizAnswer: function(e) {
    if (this.data.quizAnswered) return
    var index = e.currentTarget.dataset.index
    var isCorrect = index === this.data.quizQuestion.correctIndex
    var newScore = this.data.quizScore + (isCorrect ? 1 : 0)
    var newTotal = this.data.quizTotal + 1
    wx.vibrateShort({ type: isCorrect ? 'light' : 'heavy' })
    this.setData({
      quizSelectedIndex: index,
      quizCorrectIndex: this.data.quizQuestion.correctIndex,
      quizAnswered: true,
      quizScore: newScore,
      quizTotal: newTotal
    })
    var that = this
    setTimeout(function() {
      var nextIndex = that.data.quizQuestion.index + 1
      if (nextIndex >= that.data.quizQuestions.length) {
        that.setData({ quizFinished: true })
        return
      }
      var nextQ = that.data.quizQuestions[nextIndex]
      that.setData({
        quizQuestion: nextQ,
        quizOptions: nextQ.options,
        quizSelectedIndex: -1,
        quizCorrectIndex: -1,
        quizAnswered: false
      })
    }, 1500)
  },

  restartQuiz: function() {
    this.startNewQuiz()
  },

  exitQuiz: function() {
    this.setData({ quizMode: false, activeTab: 'search' })
  },

  _updateI18nData: function() {
    var t = this.data.i18n
    if (!t || !t.catRecyclableText) return

    var catTextMap = {
      recyclable: t.catRecyclableText,
      hazardous: t.catHazardousText,
      kitchen: t.catKitchenText,
      other: t.catOtherText
    }
    var catShortMap = {
      recyclable: t.catRecyclableShort,
      hazardous: t.catHazardousShort,
      kitchen: t.catKitchenShort,
      other: t.catOtherShort
    }

    for (var i = 0; i < garbageData.length; i++) {
      var cat = garbageData[i].category
      garbageData[i].categoryText = catTextMap[cat] || garbageData[i].categoryText
      garbageData[i].categoryShort = catShortMap[cat] || garbageData[i].categoryShort
    }

    var currentCat = this.data.currentCategory
    var categoryTitle = ''
    if (currentCat !== 'all' && catTextMap[currentCat]) {
      categoryTitle = catTextMap[currentCat]
    }

    var filteredItems = this.data.filteredItems
    var updatedFiltered = []
    for (var j = 0; j < filteredItems.length; j++) {
      var item = filteredItems[j]
      var cat2 = item.category
      updatedFiltered.push({
        name: item.name, emoji: item.emoji, category: item.category,
        categoryShort: catShortMap[cat2] || item.categoryShort,
        categoryText: catTextMap[cat2] || item.categoryText,
        desc: item.desc, tip: item.tip, keywords: item.keywords
      })
    }

    this.setData({
      categoryTitle: categoryTitle || this.data.categoryTitle,
      filteredItems: updatedFiltered
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('垃圾分类查询 - 百宝工具箱', '/package-life/garbage-sorting/garbage-sorting', '垃圾分类识别，干湿有害可回收分类')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('垃圾分类查询 - 干湿有害可回收分类')
  }
})
