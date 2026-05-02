var app = getApp()

var urlMap = {
  1: '/package-calculator/exchange-rate/exchange-rate',
  2: '/package-calculator/unit-converter/unit-converter',
  3: '/package-calculator/mortgage-calculator/mortgage-calculator',
  4: '/package-calculator/tip-calculator/tip-calculator',
  5: '/package-text/word-count/word-count',
  6: '/package-text/case-converter/case-converter',
  7: '/package-text/base64-tool/base64-tool',
  9: '/package-life/pomodoro/pomodoro',
  10: '/package-life/water-reminder/water-reminder',
  11: '/package-life/random-decision/random-decision',
  12: '/package-life/garbage-sorting/garbage-sorting',
  13: '/package-life/date-calculator/date-calculator',
  14: '/package-life/countdown/countdown',
  15: '/package-life/world-clock/world-clock',
  16: '/package-calculator/age-calculator/age-calculator',
  17: '/package-dev/json-formatter/json-formatter',
  18: '/package-dev/color-converter/color-converter',
  19: '/package-text/url-encoder/url-encoder',
  20: '/package-text/regex-tester/regex-tester',
  21: '/package-dev/image-processor/image-processor',
  22: '/package-dev/password-generator/password-generator',
  23: '/package-calculator/bmi-calculator/bmi-calculator',
  24: '/package-text/text-diff/text-diff',
  25: '/package-calculator/tax-calculator/tax-calculator'
}

var defaultTools = [
  { id: 21, name: '图片处理', description: '压缩/转换/裁剪/信息查看', icon: '📹', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'dev', isHot: true, isFavorite: false },
  { id: 2, name: '单位换算', description: '长度/重量/温度等转换', icon: '📏', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', category: 'calculator', isHot: false, isFavorite: false },
  { id: 1, name: '汇率换算', description: '实时汇率，快速换汇', icon: '💱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', category: 'calculator', isHot: true, isFavorite: false },
  { id: 3, name: '房贷计算器', description: '月供、利息一目了然', icon: '🏠', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'calculator', isHot: true, isFavorite: false },
  { id: 5, name: '字数统计', description: '中英文字符精准统计', icon: '#️⃣', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', isHot: true, isFavorite: false },
  { id: 13, name: '日期计算器', description: '间隔天数精确计算', icon: '📅', iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)', category: 'datetime', isHot: true, isFavorite: false },
  { id: 11, name: '随机决定', description: '抽签做决定不再纠结', icon: '🎲', iconBg: 'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)', category: 'life', isHot: false, isFavorite: false },
  { id: 4, name: '小费计算器', description: '快速计算小费金额', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', isHot: false, isFavorite: false },
  { id: 6, name: '大小写转换', description: '英文大小写一键切换', icon: '🔤', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', category: 'text', isHot: false, isFavorite: false },
  { id: 7, name: 'Base64编解码', description: 'Base64编码解码工具', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'text', isHot: false, isFavorite: false },
  { id: 9, name: '番茄计时', description: '专注工作25分钟', icon: '🍅', iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)', category: 'life', isHot: true, isFavorite: false },
  { id: 10, name: '喝水提醒', description: '健康饮水定时提醒', icon: '💧', iconBg: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)', category: 'life', isHot: false, isFavorite: false },
  { id: 12, name: '垃圾分类查询', description: '智能识别垃圾类型', icon: '♻️', iconBg: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)', category: 'life', isHot: false, isFavorite: false },
  { id: 14, name: '倒计时', description: '重要日期倒计时', icon: '⏰', iconBg: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)', category: 'datetime', isHot: false, isFavorite: false },
  { id: 15, name: '世界时钟', description: '全球时区时间查看', icon: '🌍', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'datetime', isHot: false, isFavorite: false },
  { id: 16, name: '年龄计算器', description: '精确到天的年龄计算', icon: '🧓', iconBg: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)', category: 'datetime', isHot: false, isFavorite: false },
  { id: 17, name: 'JSON格式化', description: 'JSON美化压缩工具', icon: '{}', iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)', category: 'dev', isHot: true, isFavorite: false },
  { id: 18, name: '颜色转换', description: 'HEX/RGB/HSL互转', icon: '🎨', iconBg: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)', category: 'dev', isHot: false, isFavorite: false },
  { id: 19, name: 'URL编解码', description: 'URL编码解码工具', icon: '🔗', iconBg: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)', category: 'dev', isHot: false, isFavorite: false },
  { id: 20, name: '正则表达式测试', description: '正则表达式在线测试', icon: '✨', iconBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', category: 'dev', isHot: false, isFavorite: false },
  { id: 22, name: '密码生成器', description: '自定义长度/字符类型，一键生成强密码', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'dev', isHot: false, isFavorite: false },
  { id: 23, name: 'BMI 计算器', description: '身高体重→BMI指数+健康建议', icon: '⚖️', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'life', isHot: true, isFavorite: false },
  { id: 24, name: '文本对比', description: '两段文本差异对比，高亮显示不同处', icon: '🔄', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', isHot: false, isFavorite: false },
  { id: 25, name: '个税计算器', description: '2024最新个税专项扣除，月薪→税后工资', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', isHot: true, isFavorite: false }
]

var categories = [
  { id: 'all', name: '全部' },
  { id: 'calculator', name: '计算转换' },
  { id: 'text', name: '文本处理' },
  { id: 'life', name: '生活助手' },
  { id: 'datetime', name: '日期时间' },
  { id: 'dev', name: '开发调试' }
]

var hotSearchWords = ['汇率', '房贷', 'BMI', '个税', '字数', '番茄', 'JSON', '图片', '密码', '随机']

var pinyinMap = {
  'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
  'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p',
  'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
  'y': 'y', 'z': 'z',
  '阿': 'a', '爱': 'a', '安': 'a',
  '把': 'b', '百': 'b', '半': 'b', '本': 'b', '比': 'b', '变': 'b', '表': 'b', '别': 'b', '不': 'b',
  '查': 'c', '差': 'c', '产': 'c', '常': 'c', '成': 'c', '程': 'c', '尺': 'c', '冲': 'c', '处': 'c', '除': 'c', '测': 'c', '策': 'c', '存': 'c', '操': 'c',
  '大': 'd', '单': 'd', '当': 'd', '倒': 'd', '导': 'd', '得': 'd', '的': 'd', '地': 'd', '第': 'd', '典': 'd', '定': 'd', '丢': 'd', '度': 'd', '段': 'd', '短': 'd', '对': 'd', '达': 'd', '代': 'd', '二': 'e',
  '发': 'f', '法': 'f', '反': 'f', '范': 'f', '房': 'f', '费': 'f', '分': 'f', '份': 'f', '风': 'f', '复': 'f', '付': 'f', '负': 'f',
  '改': 'g', '概': 'g', '干': 'g', '刚': 'g', '高': 'g', '个': 'g', '格': 'g', '更': 'g', '工': 'g', '公': 'g', '功': 'g', '管': 'g', '规': 'g', '国': 'g', '过': 'g',
  '还': 'h', '海': 'h', '含': 'h', '行': 'h', '好': 'h', '号': 'h', '合': 'h', '和': 'h', '红': 'h', '后': 'h', '互': 'h', '划': 'h', '化': 'h', '换': 'h', '黄': 'h', '汇': 'h', '会': 'h', '混': 'h', '活': 'h', '或': 'h', '获': 'h', '喝': 'h', '黑': 'h', '恒': 'h',
  '机': 'j', '基': 'j', '及': 'j', '几': 'j', '计': 'j', '记': 'j', '际': 'j', '加': 'j', '家': 'j', '价': 'j', '检': 'j', '简': 'j', '建': 'j', '健': 'j', '将': 'j', '降': 'j', '交': 'j', '角': 'j', '教': 'j', '接': 'j', '结': 'j', '解': 'j', '界': 'j', '借': 'j', '今': 'j', '金': 'j', '紧': 'j', '进': 'j', '近': 'j', '经': 'j', '精': 'j', '警': 'j', '竞': 'j', '镜': 'j', '究': 'j', '九': 'j', '久': 'j', '旧': 'j', '局': 'j', '决': 'j', '觉': 'j', '绝': 'j', '具': 'j', '卷': 'j',
  '开': 'k', '看': 'k', '科': 'k', '可': 'k', '克': 'k', '客': 'k', '空': 'k', '控': 'k', '口': 'k', '快': 'k', '宽': 'k', '框': 'k',
  '拉': 'l', '来': 'l', '蓝': 'l', '朗': 'l', '类': 'l', '累': 'l', '离': 'l', '理': 'l', '历': 'l', '立': 'l', '利': 'l', '力': 'l', '例': 'l', '连': 'l', '联': 'l', '两': 'l', '量': 'l', '聊': 'l', '列': 'l', '临': 'l', '龄': 'l', '领': 'l', '另': 'l', '流': 'l', '录': 'l', '乱': 'l', '率': 'l', '滤': 'l', '轮': 'l', '逻': 'l', '落': 'l', '垃': 'l', '栏': 'l', '楼': 'l',
  '码': 'm', '买': 'm', '满': 'm', '漫': 'm', '猫': 'm', '冒': 'm', '贸': 'm', '眉': 'm', '每': 'm', '美': 'm', '门': 'm', '米': 'm', '密': 'm', '面': 'm', '民': 'm', '名': 'm', '明': 'm', '命': 'm', '模': 'm', '末': 'm', '目': 'm', '默': 'm',
  '那': 'n', '内': 'n', '纳': 'n', '能': 'n', '年': 'n', '念': 'n', '农': 'n', '浓': 'n', '暖': 'n',
  '欧': 'o', '偶': 'o',
  '排': 'p', '判': 'p', '旁': 'p', '跑': 'p', '配': 'p', '批': 'p', '片': 'p', '偏': 'p', '拼': 'p', '频': 'p', '评': 'p', '屏': 'p', '平': 'p', '凭': 'p',
  '期': 'q', '齐': 'q', '其': 'q', '棋': 'q', '启': 'q', '气': 'q', '千': 'q', '签': 'q', '前': 'q', '钱': 'q', '强': 'q', '切': 'q', '清': 'q', '情': 'q', '请': 'q', '秋': 'q', '求': 'q', '区': 'q', '取': 'q', '趣': 'q', '去': 'q', '圈': 'q', '全': 'q', '权': 'q', '确': 'q',
  '然': 'r', '让': 'r', '热': 'r', '人': 'r', '认': 'r', '任': 'r', '日': 'r', '容': 'r', '入': 'r', '软': 'r',
  '三': 's', '散': 's', '扫': 's', '色': 's', '删': 's', '上': 's', '少': 's', '设': 's', '深': 's', '审': 's', '生': 's', '失': 's', '时': 's', '实': 't', '识': 's', '世': 's', '式': 's', '示': 's', '事': 's', '是': 's', '手': 's', '首': 's', '受': 's', '数': 's', '刷': 's', '双': 's', '水': 's', '顺': 's', '说': 's', '搜': 's', '速': 's', '随': 's', '碎': 's', '算': 's', '虽': 's', '缩': 's', '锁': 's',
  '他': 't', '台': 't', '谈': 't', '弹': 't', '特': 't', '提': 't', '天': 't', '填': 't', '条': 't', '贴': 't', '铁': 't', '通': 't', '同': 't', '统': 't', '头': 't', '图': 't', '突': 't', '团': 't', '退': 't', '拖': 't',
  '外': 'w', '完': 'w', '网': 'w', '危': 'w', '维': 'w', '围': 'w', '位': 'w', '文': 'w', '稳': 'w', '问': 'w', '卧': 'w', '无': 'w', '五': 'w', '物': 'w',
  '下': 'x', '先': 'x', '显': 'x', '现': 'x', '线': 'x', '限': 'x', '相': 'x', '向': 'x', '项': 'x', '消': 'x', '小': 'x', '效': 'x', '些': 'x', '协': 'x', '信': 'x', '星': 'x', '行': 'x', '修': 'x', '秀': 'x', '虚': 'x', '需': 'x', '序': 'x', '选': 'x', '学': 'x', '雪': 'x', '寻': 'x', '循': 'x', '验': 'x', '响': 'x', '像': 'x', '享': 'x', '心': 'x', '新': 'x', '醒': 'x', '详': 'x', '降': 'x', '写': 'x',
  '颜': 'y', '羊': 'y', '阳': 'y', '样': 'y', '摇': 'y', '要': 'y', '也': 'y', '一': 'y', '以': 'y', '易': 'y', '意': 'y', '因': 'y', '引': 'y', '应': 'y', '映': 'y', '拥': 'y', '永': 'y', '用': 'y', '优': 'y', '由': 'y', '邮': 'y', '有': 'y', '右': 'y', '于': 'y', '余': 'y', '与': 'y', '预': 'y', '域': 'y', '员': 'y', '原': 'y', '源': 'y', '远': 'y', '愿': 'y', '月': 'y', '阅': 'y', '越': 'y', '云': 'y', '允': 'y', '运': 'y', '韵': 'y', '压': 'y', '亚': 'y', '严': 'y', '眼': 'y', '演': 'y', '养': 'y', '页': 'y', '依': 'y', '移': 'y', '已': 'y', '益': 'y', '义': 'y', '音': 'y', '阴': 'y', '银': 'y', '印': 'y', '英': 'y', '迎': 'y', '盈': 'y', '影': 'y', '硬': 'y', '勇': 'y', '悠': 'y', '油': 'y', '游': 'y', '友': 'y', '又': 'y', '幼': 'y', '鱼': 'y', '愉': 'y', '渔': 'y', '予': 'y', '宇': 'y', '羽': 'y', '雨': 'y', '语': 'y', '玉': 'y', '育': 'y', '浴': 'y', '蚌': 'y', '御': 'y', '优': 'y', '遇': 'y', '誉': 'y', '愈': 'y', '欲': 'y', '圆': 'y', '缘': 'y', '日': 'y', '约': 'y', '跃': 'y', '钥': 'y', '岳': 'y', '悦': 'y', '均': 'y', '蕴': 'y',
  '在': 'z', '咱': 'z', '杂': 'z', '灾': 'z', '载': 'z', '暂': 'z', '赞': 'z', '脏': 'z', '郭': 'z', '早': 'z', '造': 'z', '噪': 'z', '责': 'z', '择': 'z', '则': 'z', '泽': 'z', '贼': 'z', '怎': 'z', '增': 'z', '赠': 'z', '扎': 'z', '眨': 'z', '占': 'z', '展': 'z', '站': 'z', '张': 'z', '掌': 'z', '丈': 'z', '帐': 'z', '账': 'z', '障': 'z', '招': 'z', '找': 'z', '照': 'z', '罩': 'z', '折': 'z', '哲': 'z', '者': 'z', '这': 'z', '浙': 'z', '针': 'z', '侦': 'z', '真': 'z', '诊': 'z', '枕': 'z', '阵': 'z', '振': 'z', '镇': 'z', '震': 'z', '争': 'z', '征': 'z', '整': 'z', '正': 'z', '证': 'z', '政': 'z', '症': 'z', '之': 'z', '支': 'z', '知': 'z', '织': 'z', '脂': 'z', '执': 'z', '值': 'z', '职': 'z', '直': 'z', '植': 'z', '殖': 'z', '止': 'z', '旨': 'z', '指': 'z', '纸': 'z', '至': 'z', '志': 'z', '制': 'z', '质': 'z', '治': 'z', '秩': 'z', '智': 'z', '置': 'z', '中': 'zh', '忠': 'zh', '钟': 'zh', '终': 'zh', '种': 'zh', '众': 'zh', '周': 'zhou', '洲': 'z', '粥': 'z', '轴': 'z', '肘': 'z', '皱': 'z', '竹': 'z', '筑': 'z', '主': 'z', '煮': 'z', '嘱': 'z', '住': 'z', '注': 'z', '驻': 'z', '柱': 'z', '助': 'z', '筑': 'z', '祝': 'z', '著': 'z', '抓': 'z', '拽': 'z', '专': 'z', '转': 'z', '赚': 'z', '庄': 'z', '装': 'z', '壮': 'z', '状': 'z', '撞': 'z', '追': 'z', '准': 'z', '捕': 'z', '桌': 'z', '着': 'z', '兹': 'z', '资': 'z', '姿': 'z', '滋': 'z', '粒': 'z', '子': 'z', '字': 'z', '自': 'z', '宗': 'z', '综': 'z', '总': 'z', '纵': 'z'
}

function getPinyinFirstLetter(str) {
  if (!str) return ''
  var firstChar = str.charAt(0).toLowerCase()
  return pinyinMap[firstChar] || firstChar
}

Page({
  data: {
    greetingText: '',
    searchKeyword: '',
    searchHistory: [],
    hotSearchWords: hotSearchWords,
    showSearchPanel: false,
    currentCategory: 'all',
    isRefreshing: false,
    scrollTop: 0,
    isDarkMode: false,
    showGuide: false,
    sharePosterPath: '',
    isLoading: true,
    isEditMode: false,
    isDragging: false,
    dragIndex: -1,
    selectedToolIndex: -1,
    canUndo: false,
    editHistory: [],
    customOrder: [],
    hiddenTools: [],
    hiddenToolsList: [],
    categories: categories,
    tools: defaultTools
  },

  onLoad: function() {
    this.updateGreeting()
    this.loadCustomLayout()
    this.filterTools()
    this.applyCurrentTheme()

    var favorites = wx.getStorageSync('favorites') || []
    if (!Array.isArray(favorites)) favorites = []

    var tools = []
    for (var i = 0; i < defaultTools.length; i++) {
      var t = {}
      for (var key in defaultTools[i]) {
        t[key] = defaultTools[i][key]
      }
      t.isFavorite = false
      for (var j = 0; j < favorites.length; j++) {
        if (favorites[j] === t.id) {
          t.isFavorite = true
          break
        }
      }
      tools.push(t)
    }

    this.setData({ tools: tools, filteredTools: tools })
    wx.setStorageSync('allTools', tools)
    wx.setStorageSync('urlMap', urlMap)

    var history = wx.getStorageSync('searchHistory') || []
    if (!Array.isArray(history)) history = []
    this.setData({ searchHistory: history })

    var hasSeenGuide = wx.getStorageSync('hasSeenGuide')
    if (!hasSeenGuide) this.setData({ showGuide: true })

    this.drawSharePoster()
    setTimeout(function() { this.setData({ isLoading: false }) }.bind(this), 600)
  },

  onShow: function() {
    this.updateGreeting()
    this.applyCurrentTheme()
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  applyCurrentTheme: function() {
    try {
      var appInstance = getApp()
      if (appInstance) {
        var isDark = appInstance.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
        this.setData({ isDarkMode: isDark })
        var bgColor = isDark ? '#0F172A' : '#F8FAFC'
        wx.setBackgroundColor({
          backgroundColor: bgColor,
          backgroundColorTop: bgColor,
          backgroundColorBottom: bgColor
        })
      }
    } catch(e) {}
  },

  updateGreeting: function() {
    try {
      var hour = new Date().getHours()
      var greeting = ''
      if (hour >= 5 && hour < 12) greeting = '上午好'
      else if (hour >= 12 && hour < 14) greeting = '中午好'
      else if (hour >= 14 && hour < 18) greeting = '下午好'
      else if (hour >= 18 && hour < 22) greeting = '晚上好'
      else greeting = '夜深了'

      var weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      var now = new Date()
      var dateStr = weekDays[now.getDay()] + ',' + (now.getMonth() + 1) + '月' + now.getDate() + '日'
      this.setData({ greetingText: greeting + '\n' + dateStr })
    } catch(e) {
      this.setData({ greetingText: '欢迎使用' })
    }
  },

  onGuideClose: function() {
    this.setData({ showGuide: false })
  },

  onPullDownRefresh: function() {
    this.setData({ isRefreshing: true })
    var that = this
    setTimeout(function() {
      that.updateGreeting()
      that.setData({ isRefreshing: false })
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
  },

  onScrollToUpper: function() {
    this.setData({ scrollTop: 1 })
    setTimeout(function() { this.setData({ scrollTop: 0 }) }.bind(this), 50)
  },

  onPageScroll: function(e) {
    try {
      var st = 0
      if (e.detail && e.detail.scrollTop !== undefined) st = e.detail.scrollTop
      else if (e.detail && e.detail.scrollY !== undefined) st = e.detail.scrollY
      if (st < 5 && st > -50) {
        if (!this._scrollFixTimer) {
          this._scrollFixTimer = setTimeout(function() {
            this._scrollFixTimer = null
            if (this.data.scrollTop !== 0) this.setData({ scrollTop: 0 })
          }.bind(this), 100)
        }
      }
    } catch(e) {}
  },

  loadCustomLayout: function() {
    try {
      var customOrder = wx.getStorageSync('customToolOrder') || []
      var hiddenTools = wx.getStorageSync('hiddenTools') || []
      if (!Array.isArray(customOrder)) customOrder = []
      if (!Array.isArray(hiddenTools)) hiddenTools = []

      this.setData({ customOrder: customOrder, hiddenTools: hiddenTools })

      var tools = this.data.tools || []
      if (!Array.isArray(tools) || tools.length === 0) return

      if (customOrder.length > 0) {
        var orderedTools = []
        for (var oi = 0; oi < customOrder.length; oi++) {
          var isHidden = false
          for (var hi = 0; hi < hiddenTools.length; hi++) {
            if (hiddenTools[hi] === customOrder[oi]) { isHidden = true; break }
          }
          if (!isHidden) {
            for (var ti = 0; ti < tools.length; ti++) {
              if (tools[ti].id === customOrder[oi]) { orderedTools.push(tools[ti]); break }
            }
          }
        }
        var remainingTools = []
        for (var ri = 0; ri < tools.length; ri++) {
          var inOrdered = false
          for (var ci = 0; ci < customOrder.length; ci++) {
            if (customOrder[ci] === tools[ri].id) { inOrdered = true; break }
          }
          var isHidden2 = false
          for (var hi2 = 0; hi2 < hiddenTools.length; hi2++) {
            if (hiddenTools[hi2] === tools[ri].id) { isHidden2 = true; break }
          }
          if (!inOrdered && !isHidden2) remainingTools.push(tools[ri])
        }
        var finalTools = orderedTools.concat(remainingTools)
        this.setData({ tools: finalTools, filteredTools: finalTools })
      } else if (hiddenTools.length > 0) {
        var visibleTools = []
        for (var vi = 0; vi < tools.length; vi++) {
          var hFound = false
          for (var hi3 = 0; hi3 < hiddenTools.length; hi3++) {
            if (hiddenTools[hi3] === tools[vi].id) { hFound = true; break }
          }
          if (!hFound) visibleTools.push(tools[vi])
        }
        this.setData({ tools: visibleTools, filteredTools: visibleTools })
      }

      this.updateHiddenToolsList(hiddenTools)
    } catch(e) {}
  },

  toggleEditMode: function() {
    try {
      wx.vibrateShort({ type: 'light' })
      if (!this.data.isEditMode) {
        wx.showModal({
          title: '📝 编辑模式',
          content: '点击工具卡片选中\n再次点击另一个卡片可交换位置\n点击眼睛图标可隐藏工具',
          showCancel: false, confirmText: '我知道了', confirmColor: '#3B82F6'
        })
      }
      this.setData({
        isEditMode: !this.data.isEditMode,
        selectedToolIndex: -1, canUndo: false, editHistory: []
      })
      if (!this.data.isEditMode) {
        this.saveCustomLayout()
        wx.showToast({ title: '布局已保存 ✅', icon: 'success', duration: 1500 })
      }
    } catch(e) {}
  },

  onEditToolClick: function(e) {
    try {
      if (!this.data.isEditMode) return
      var index = e.currentTarget.dataset.index
      var currentSelected = this.data.selectedToolIndex
      if (currentSelected === -1) {
        wx.vibrateShort({ type: 'light' })
        this.setData({ selectedToolIndex: index }); return
      }
      if (currentSelected === index) {
        wx.vibrateShort({ type: 'light' })
        this.setData({ selectedToolIndex: -1 }); return
      }
      wx.vibrateShort({ type: 'medium' })
      var filteredTools = this.data.filteredTools || []
      if (!filteredTools[currentSelected] || !filteredTools[index]) return
      this.pushEditHistory()
      var temp = filteredTools[currentSelected]
      filteredTools[currentSelected] = filteredTools[index]
      filteredTools[index] = temp
      this.setData({ filteredTools: filteredTools, selectedToolIndex: -1, canUndo: true })
      this.saveCustomLayout()
      wx.showToast({ title: '已交换位置', icon: 'success', duration: 800 })
    } catch(e) {}
  },

  pushEditHistory: function() {
    try {
      var filteredTools = this.data.filteredTools || []
      var snapshot = []
      for (var i = 0; i < filteredTools.length; i++) snapshot.push(filteredTools[i].id)
      var hiddenTools = this.data.hiddenTools || []
      var hiddenSnapshot = []
      for (var j = 0; j < hiddenTools.length; j++) hiddenSnapshot.push(hiddenTools[j])
      var history = this.data.editHistory || []
      history = history.slice()
      history.push({ order: snapshot, hidden: hiddenSnapshot, timestamp: Date.now() })
      if (history.length > 20) history = history.slice(history.length - 20)
      this.setData({ editHistory: history })
    } catch(e) {}
  },

  undoLastAction: function() {
    try {
      var history = this.data.editHistory || []
      if (history.length === 0) { wx.showToast({ title: '没有可撤销的操作', icon: 'none', duration: 1200 }); return }
      wx.vibrateShort({ type: 'light' })
      var newHistory = history.slice()
      var prevState = newHistory.pop()
      var allTools = this.data.tools || []
      var restoredOrder = []
      if (prevState.order && Array.isArray(prevState.order)) {
        for (var oi = 0; oi < prevState.order.length; oi++) {
          for (var ti = 0; ti < allTools.length; ti++) {
            if (allTools[ti].id === prevState.order[oi]) { restoredOrder.push(allTools[ti]); break }
          }
        }
      }
      var restoredHidden = (prevState.hidden && Array.isArray(prevState.hidden)) ? prevState.hidden : []
      this.setData({ filteredTools: restoredOrder, hiddenTools: restoredHidden, editHistory: newHistory, canUndo: newHistory.length > 0, selectedToolIndex: -1 })
      this.updateHiddenToolsList(restoredHidden)
      this.saveCustomLayout()
      wx.showToast({ title: '已撤销 ↩️', icon: 'none', duration: 800 })
    } catch(e) {}
  },

  toggleToolVisibility: function(e) {
    try {
      if (!this.data.isEditMode) return
      wx.vibrateShort({ type: 'light' })
      this.pushEditHistory()
      var id = e.currentTarget.dataset.id
      var hiddenTools = this.data.hiddenTools || []
      hiddenTools = hiddenTools.slice()
      var foundIdx = -1
      for (var i = 0; i < hiddenTools.length; i++) { if (hiddenTools[i] === id) { foundIdx = i; break } }
      if (foundIdx > -1) { hiddenTools.splice(foundIdx, 1); wx.showToast({ title: '已显示 ✓', icon: 'none', duration: 1000 }) }
      else { hiddenTools.push(id); wx.showToast({ title: '已隐藏 👁', icon: 'none', duration: 1000 }) }
      this.updateHiddenToolsList(hiddenTools)
      var filteredTools = this.data.filteredTools || []
      var visibleTools = []
      for (var vi = 0; vi < filteredTools.length; vi++) {
        var isHidden = false
        for (var hi = 0; hi < hiddenTools.length; hi++) { if (hiddenTools[hi] === filteredTools[vi].id) { isHidden = true; break } }
        if (!isHidden) visibleTools.push(filteredTools[vi])
      }
      this.setData({ hiddenTools: hiddenTools, filteredTools: visibleTools, canUndo: true })
    } catch(e) {}
  },

  restoreHiddenTool: function(e) {
    try {
      wx.vibrateShort({ type: 'light' })
      var id = e.currentTarget.dataset.id
      var hiddenTools = this.data.hiddenTools || []
      var newHidden = []
      for (var nh = 0; nh < hiddenTools.length; nh++) { if (hiddenTools[nh] !== id) newHidden.push(hiddenTools[nh]) }
      hiddenTools = newHidden
      this.updateHiddenToolsList(hiddenTools)
      var allTools = this.data.tools || []
      var restoredTool = null
      for (var ai = 0; ai < allTools.length; ai++) { if (allTools[ai].id === id) { restoredTool = allTools[ai]; break } }
      var visibleTools = this.data.filteredTools || []
      if (restoredTool) {
        var alreadyExists = false
        for (var ve = 0; ve < visibleTools.length; ve++) { if (visibleTools[ve].id === id) { alreadyExists = true; break } }
        if (!alreadyExists) visibleTools.push(restoredTool)
      }
      this.setData({ hiddenTools: hiddenTools, filteredTools: visibleTools })
      var displayName = restoredTool ? restoredTool.name : '工具'
      wx.showToast({ title: displayName + ' 已恢复 ✓', icon: 'success', duration: 1000 })
    } catch(e) {}
  },

  updateHiddenToolsList: function(hiddenTools) {
    try {
      if (!hiddenTools || !Array.isArray(hiddenTools) || hiddenTools.length === 0) { this.setData({ hiddenToolsList: [] }); return }
      var allTools = this.data.tools || []
      var hiddenList = []
      for (var i = 0; i < allTools.length; i++) {
        for (var j = 0; j < hiddenTools.length; j++) { if (hiddenTools[j] === allTools[i].id) { hiddenList.push(allTools[i]); break } }
      }
      this.setData({ hiddenToolsList: hiddenList })
    } catch(e) {}
  },

  saveCustomLayout: function() {
    try {
      var filteredTools = this.data.filteredTools || []
      var currentOrder = []
      for (var i = 0; i < filteredTools.length; i++) currentOrder.push(filteredTools[i].id)
      wx.setStorageSync('customToolOrder', currentOrder)
      wx.setStorageSync('hiddenTools', this.data.hiddenTools || [])
      this.setData({ customOrder: currentOrder })
    } catch(e) {}
  },

  resetLayout: function() {
    try {
      wx.vibrateShort({ type: 'medium' })
      var that = this
      wx.showModal({
        title: '⚠️ 重置布局', content: '确定要恢复默认布局吗？\n所有自定义排序和隐藏设置将被清除。',
        confirmText: '重置', cancelText: '取消', confirmColor: '#EF4444',
        success: function(res) {
          if (res.confirm) {
            that.pushEditHistory()
            wx.removeStorageSync('customToolOrder')
            wx.removeStorageSync('hiddenTools')
            that.setData({ customOrder: [], hiddenTools: [], isEditMode: false, canUndo: true, selectedToolIndex: -1 })
            var favs = wx.getStorageSync('favorites') || []
            if (!Array.isArray(favs)) favs = []
            var defaultToolsCopy = []
            for (var di = 0; di < defaultTools.length; di++) {
              var tcopy = {}; var src = defaultTools[di]
              for (var key in src) tcopy[key] = src[key]
              tcopy.isFavorite = false
              for (var fi = 0; fi < favs.length; fi++) { if (favs[fi] === tcopy.id) { tcopy.isFavorite = true; break } }
              defaultToolsCopy.push(tcopy)
            }
            that.setData({ tools: defaultToolsCopy, filteredTools: defaultToolsCopy })
            wx.showToast({ title: '已恢复默认布局', icon: 'success' })
          }
        }
      })
    } catch(e) {}
  },

  addToSearchHistory: function(keyword) {
    if (!keyword.trim()) return
    var history = wx.getStorageSync('searchHistory') || []
    var newHistory = []
    for (var i = 0; i < history.length; i++) {
      if (history[i] !== keyword) newHistory.push(history[i])
    }
    newHistory.unshift(keyword)
    if (newHistory.length > 10) newHistory = newHistory.slice(0, 10)
    wx.setStorageSync('searchHistory', newHistory)
    this.setData({ searchHistory: newHistory })
  },

  clearSearchHistory: function() {
    var that = this
    wx.showModal({ title: '清空搜索历史', content: '确定要清空所有搜索历史吗？', confirmText: '清空', confirmColor: '#EF4444',
      success: function(res) { if (res.confirm) { wx.removeStorageSync('searchHistory'); that.setData({ searchHistory: [] }); wx.showToast({ title: '已清空', icon: 'success' }) } }
    })
  },

  onHotSearchClick: function(e) {
    var word = e.currentTarget.dataset.word
    this.setData({ searchKeyword: word })
    this.addToSearchHistory(word)
    this.filterTools()
  },

  onHistoryClick: function(e) {
    var word = e.currentTarget.dataset.word
    this.setData({ searchKeyword: word })
    this.filterTools()
  },

  onSearchInput: function(e) {
    var keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })
    this.filterTools()
  },

  clearSearch: function() {
    this.setData({ searchKeyword: '', showSearchPanel: false })
    this.filterTools()
  },

  onCategoryChange: function(e) {
    var categoryId = e.currentTarget.dataset.id
    this.setData({ currentCategory: categoryId, showSearchPanel: false })
    this.filterTools()
  },

  onSearchFocus: function() { this.setData({ showSearchPanel: true }) },

  onSearchBlur: function() {
    var that = this
    setTimeout(function() { that.setData({ showSearchPanel: false }) }, 200)
  },

  filterTools: function() {
    try {
      var filtered = [].concat(this.data.tools || [])
      if (this.data.currentCategory !== 'all') {
        var catFiltered = []
        for (var i = 0; i < filtered.length; i++) { if (filtered[i].category === this.data.currentCategory) catFiltered.push(filtered[i]) }
        filtered = catFiltered
      }
      if (this.data.searchKeyword) {
        var keyword = this.data.searchKeyword.toLowerCase()
        var pinyinKeyword = getPinyinFirstLetter(keyword)
        var result = []
        for (var j = 0; j < filtered.length; j++) {
          var tool = filtered[j]
          var nameMatch = tool.name.toLowerCase().indexOf(keyword) > -1
          var descMatch = tool.description.toLowerCase().indexOf(keyword) > -1
          var pinyinMatch = getPinyinFirstLetter(tool.name).toLowerCase().indexOf(pinyinKeyword) > -1
          if (nameMatch || descMatch || pinyinMatch) result.push(tool)
        }
        filtered = result
        this.addToSearchHistory(this.data.searchKeyword)
      }
      this.setData({ filteredTools: filtered })
    } catch(e) {}
  },

  onToolClick: function(e) {
    try {
      var tool = e.currentTarget.dataset.tool
      if (!tool) return
      wx.vibrateShort({ type: 'light' })
      this.saveRecentTool(tool)
      this.recordWeeklyUsage()
      var url = urlMap[tool.id]
      if (url) {
        wx.navigateTo({ url: url, fail: function(err) { console.log('[tool] 跳转失败:', err); wx.showToast({ title: '页面跳转失败', icon: 'none' }) } })
      } else { wx.showToast({ title: '功能开发中...', icon: 'none', duration: 1500 }) }
    } catch(e) {}
  },

  toggleFavorite: function(e) {
    try {
      var id = e.currentTarget.dataset.id
      var toolsData = this.data.tools || []
      var tools = []
      for (var i = 0; i < toolsData.length; i++) {
        var t = {}; var src = toolsData[i]
        for (var key in src) t[key] = src[key]
        if (t.id === id) t.isFavorite = !t.isFavorite
        tools.push(t)
      }
      var favorites = []
      for (var j = 0; j < tools.length; j++) { if (tools[j].isFavorite) favorites.push(tools[j].id) }
      wx.setStorageSync('favorites', favorites)
      wx.vibrateShort({ type: 'light' })
      this.setData({ tools: tools })
      this.filterTools()
      var hasId = false
      for (var k = 0; k < favorites.length; k++) { if (favorites[k] === id) { hasId = true; break } }
      if (hasId) this.showHeartAnimation()
    } catch(e) {}
  },

  onToolLongPress: function(e) {
    try { wx.vibrateShort({ type: 'medium' }); var tool = e.currentTarget.dataset.tool; this.setData({ showMenu: true, menuTool: tool }) } catch(e) {}
  },

  closeMenu: function() { this.setData({ showMenu: false, menuTool: null }) },

  showHeartAnimation: function() {
    this.setData({ showHeart: true })
    var that = this
    setTimeout(function() { that.setData({ showHeart: false }) }, 800)
  },

  recordWeeklyUsage: function() {
    try {
      var today = new Date()
      var y = today.getFullYear(), mo = today.getMonth() + 1, d = today.getDate()
      var moStr = mo < 10 ? ('0' + mo) : ('' + mo), dStr = d < 10 ? ('0' + d) : ('' + d)
      var dateKey = y + '-' + moStr + '-' + dStr
      var weeklyRecord = wx.getStorageSync('weeklyUsage') || {}
      if (typeof weeklyRecord !== 'object' || Array.isArray(weeklyRecord)) weeklyRecord = {}
      weeklyRecord[dateKey] = (weeklyRecord[dateKey] || 0) + 1
      var oneWeekAgo = new Date(); oneWeekAgo.setDate(today.getDate() - 7)
      var keysToRemove = []
      for (var key in weeklyRecord) {
        if (weeklyRecord.hasOwnProperty(key)) {
          var parts = key.split('-')
          if (parts.length === 3) {
            var kdDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
            if (kdDate < oneWeekAgo) keysToRemove.push(key)
          }
        }
      }
      for (var kr = 0; kr < keysToRemove.length; kr++) delete weeklyRecord[keysToRemove[kr]]
      wx.setStorageSync('weeklyUsage', weeklyRecord)
    } catch(e) {}
  },

  saveRecentTool: function(tool) {
    try {
      if (!tool || !tool.id) return
      var recentTools = wx.getStorageSync('recentTools') || []
      if (!Array.isArray(recentTools)) recentTools = []
      var newRecent = []
      for (var i = 0; i < recentTools.length; i++) { if (recentTools[i].id !== tool.id) newRecent.push(recentTools[i]) }
      newRecent.unshift({ id: tool.id, name: tool.name, icon: tool.icon, iconBg: tool.iconBg, usedAt: new Date().getTime() })
      if (newRecent.length > 20) newRecent = newRecent.slice(0, 20)
      wx.setStorageSync('recentTools', newRecent)
      var count = wx.getStorageSync('totalUsageCount') || 0
      count = parseInt(count, 10) || 0
      wx.setStorageSync('totalUsageCount', count + 1)
      try { var appInst = getApp(); if (appInst && typeof appInst.cloudSyncUsage === 'function') appInst.cloudSyncUsage(tool.id, tool.name) } catch(err) {}
    } catch(e) {}
  },

  showMoreMenu: function() {
    wx.showActionSheet({
      itemList: ['关于我们', '意见反馈', '分享给朋友'],
      success: function(res) { switch (res.tapIndex) { case 0: wx.showToast({ title: '百宝工具箱 v1.0', icon: 'none' }); break; case 1: wx.showToast({ title: '感谢您的反馈！', icon: 'none' }); break } }
    })
  },

  onShareAppMessage: function() { return { title: '🧰 百宝工具箱 - 24+实用小工具合集', path: '/pages/index/index', imageUrl: this.data.sharePosterPath || '' } },

  onShareTimeline: function() { return { title: '🧰 百宝工具箱 - 汇率换算、单位转换等24+实用工具', query: '', imageUrl: this.data.sharePosterPath || '' } },

  drawSharePoster: function() {
    try {
      var appInstance = getApp()
      if (appInstance.globalData.sharePosterPath) { this.setData({ sharePosterPath: appInstance.globalData.sharePosterPath }); return }
      var query = wx.createSelectorQuery()
      query.select('#shareCanvas').fields({ node: true, size: true }).exec(function(res) {
        if (!res || !res[0]) return
        var canvas = res[0].node, ctx = canvas.getContext('2d')
        var dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = 500 * dpr; canvas.height = 400 * dpr; ctx.scale(dpr, dpr)
        ctx.fillStyle = '#0F172A'
        ctx.beginPath(); ctx.rect(0, 0, 500, 400, 24); ctx.fill()
        var topGrad = ctx.createLinearGradient(0, 0, 500, 200)
        topGrad.addColorStop(0, '#1E3A5F'); topGrad.addColorStop(1, '#0F172A')
        ctx.fillStyle = topGrad
        ctx.beginPath(); ctx.rect(0, 0, 500, 200, 24); ctx.fill()
        ctx.globalAlpha = 0.15
        ctx.fillStyle = '#3B82F6'; ctx.beginPath(); ctx.arc(430, 40, 100, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(60, 160, 70, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 0.08; ctx.fillStyle = '#8B5CF6'; ctx.beginPath(); ctx.arc(380, 170, 60, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        ctx.font = 'bold 44px -apple-system, system-ui, sans-serif'; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🧰 百宝工具箱', 250, 72)
        ctx.font = '16px -apple-system, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('即用即走 · 轻量高效 · 实用便捷', 250, 105)
        var tools = [{ icon: '💹', name: '汇率' }, { icon: '📐', name: '单位' }, { icon: '🏠', name: '房贷' }, { icon: '💰', name: '小费' }, { icon: '🔢', name: '字数' }, { icon: '🔤', name: '大小写' }, { icon: '🔐', name: 'Base64' }, { icon: '🍅', name: '番茄钟' }, { icon: '💧', name: '喝水' }, { icon: '🎲', name: '随机' }, { icon: '🗑️', name: '垃圾分类' }, { icon: '📅', name: '日期' }]
        var cardX = 30, cardY = 130, cardW = 440, cardH = 180
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.beginPath(); ctx.moveTo(cardX, cardY + 18); ctx.lineTo(cardX + cardW, cardY + 18); ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW - 18, cardY); ctx.lineTo(cardX + 18, cardY); ctx.quadraticCurveTo(cardX, cardY, cardX, cardY + 18); ctx.fill()
        var cols = 6, rows = 2, itemW = 68, itemH = 76, gapX = (cardW - cols * itemW) / (cols + 1), gapY = (cardH - rows * itemH) / (rows + 1)
        for (var ti = 0; ti < tools.length; ti++) {
          var col = ti % cols, row = Math.floor(ti / cols)
          var ix = cardX + gapX + col * (itemW + gapX), iy = cardY + gapY + row * (itemH + gapY)
          ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.arc(ix + itemW / 2, iy + itemH / 2, 28, 0, Math.PI * 2); ctx.fill()
          ctx.globalAlpha = 1; ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tools[ti].icon, ix + itemW / 2, iy + itemH / 2 - 8)
          ctx.font = '11px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(tools[ti].name, ix + itemW / 2, iy + itemH - 14)
        }
        ctx.textAlign = 'center'; var bottomGrad = ctx.createLinearGradient(250, 330, 250, 380)
        bottomGrad.addColorStop(0, '#3B82F6'); bottomGrad.addColorStop(1, '#1D4ED8')
        ctx.beginPath(); ctx.moveTo(50, 336); ctx.lineTo(450, 336); ctx.quadraticCurveTo(450, 360, 426, 360); ctx.lineTo(74, 360); ctx.quadraticCurveTo(50, 360, 50, 336); ctx.closePath(); ctx.fillStyle = bottomGrad; ctx.fill()
        ctx.font = '600 18px -apple-system, system-ui, sans-serif'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('✨ 24+ 实用工具，一键即达', 250, 355)
        var that = this
        setTimeout(function() {
          wx.canvasToTempFilePath({ canvas: canvas, width: 500, height: 400, destWidth: 500, destHeight: 400, fileType: 'png', quality: 1,
            success: function(res) { if (res.tempFilePath) { appInstance.globalData.sharePosterPath = res.tempFilePath; that.setData({ sharePosterPath: res.tempFilePath }) } }
          }, that)
        }, 100)
      }.bind(this))
    } catch(e) {}
  }
})
