var tools = [
  { id: 1, name: '汇率换算', description: '实时汇率，快速换汇', icon: '💱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', category: 'calculator', route: '/package-calculator/exchange-rate/exchange-rate', isHot: true },
  { id: 9, name: '番茄计时', description: '专注工作25分钟', icon: '🍅', iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)', category: 'office', route: '/package-life/pomodoro/pomodoro', isHot: true },
  { id: 8, name: '二维码生成', description: '生成/扫描二维码，支持配色', icon: '📱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)', category: 'office', route: '/package-text/qr-code/qr-code', isHot: true },
  { id: 5, name: '字数统计', description: '中英文字符精准统计', icon: '#️⃣', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', route: '/package-text/word-count/word-count', isHot: true },
  { id: 3, name: '房贷计算器', description: '月供、利息一目了然', icon: '🏠', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'calculator', route: '/package-calculator/mortgage-calculator/mortgage-calculator', isHot: true },
  { id: 26, name: '科学计算器', description: '四则运算+科学函数，历史记录', icon: '🧮', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'calculator', route: '/package-calculator/calculator/calculator', isHot: true },
  { id: 25, name: '个税计算器', description: '2024最新个税专项扣除，月薪→税后工资', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', route: '/package-calculator/tax-calculator/tax-calculator', isHot: true },
  { id: 17, name: 'JSON格式化', description: 'JSON美化压缩工具', icon: '{}', iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)', category: 'dev', route: '/package-dev/json-formatter/json-formatter', isHot: true },
  { id: 21, name: '图片处理', description: '压缩/转换/裁剪/信息查看', icon: '📹', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'office', route: '/package-dev/image-processor/image-processor', isHot: true },
  { id: 13, name: '日期计算器', description: '间隔天数精确计算', icon: '📅', iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)', category: 'datetime', route: '/package-life/date-calculator/date-calculator', isHot: true },
  { id: 23, name: 'BMI 计算器', description: '身高体重→BMI指数+健康建议', icon: '⚖️', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'life', route: '/package-calculator/bmi-calculator/bmi-calculator', isHot: true },
  { id: 28, name: '时间戳转换', description: 'Unix时间戳↔日期互转，实时显示', icon: '⏱️', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'dev', route: '/package-dev/timestamp-converter/timestamp-converter', isHot: true },
  { id: 30, name: '白噪音', description: '混合自然音效，助你专注入眠', icon: '🎧', iconBg: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)', category: 'office', route: '/package-life/white-noise/white-noise', isHot: true },
  { id: 32, name: '手持弹幕', description: '全屏滚动弹幕，应援打call', icon: '🎬', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', category: 'office', route: '/package-life/danmaku/danmaku', isHot: true },
  { id: 34, name: '进制转换', description: '2/8/10/16/32进制互转+位运算', icon: '🔢', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'dev', route: '/package-dev/base-converter/base-converter', isHot: true },
  { id: 2, name: '单位换算', description: '长度/重量/温度等转换', icon: '📏', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', category: 'calculator', route: '/package-calculator/unit-converter/unit-converter', isHot: false },
  { id: 10, name: '喝水提醒', description: '健康饮水定时提醒', icon: '💧', iconBg: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)', category: 'life', route: '/package-life/water-reminder/water-reminder', isHot: false },
  { id: 14, name: '倒计时', description: '重要日期倒计时', icon: '⏰', iconBg: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)', category: 'datetime', route: '/package-life/countdown/countdown', isHot: false },
  { id: 15, name: '世界时钟', description: '全球时区时间查看', icon: '🌍', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'datetime', route: '/package-life/world-clock/world-clock', isHot: false },
  { id: 18, name: '颜色转换', description: 'HEX/RGB/HSL互转', icon: '🎨', iconBg: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)', category: 'dev', route: '/package-dev/color-converter/color-converter', isHot: false },
  { id: 22, name: '密码生成器', description: '自定义长度/字符类型，一键生成强密码', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'dev', route: '/package-dev/password-generator/password-generator', isHot: false },
  { id: 24, name: '文本对比', description: '两段文本差异对比，高亮显示不同处', icon: '🔄', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', route: '/package-text/text-diff/text-diff', isHot: false },
  { id: 6, name: '大小写转换', description: '英文大小写一键切换', icon: '🔤', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', category: 'text', route: '/package-text/case-converter/case-converter', isHot: false },
  { id: 29, name: '亲戚称谓', description: '快速查找亲戚称谓关系', icon: '👨‍👩‍👧‍👦', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'life', route: '/package-life/relative-call/relative-call', isHot: false },
  { id: 27, name: '尺子', description: '手机屏幕即尺子，厘米/英寸测量', icon: '📏', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', category: 'life', route: '/package-life/ruler/ruler', isHot: false },
  { id: 31, name: '指南针', description: '精准方向辨别+水平仪', icon: '🧭', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', category: 'life', route: '/package-life/compass/compass', isHot: false },
  { id: 33, name: '表情包制作', description: '模板+文字，一键生成表情包', icon: '🎭', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'office', route: '/package-life/meme-maker/meme-maker', isHot: false },
  { id: 12, name: '垃圾分类查询', description: '智能识别垃圾类型', icon: '♻️', iconBg: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)', category: 'life', route: '/package-life/garbage-sorting/garbage-sorting', isHot: false },
  { id: 11, name: '随机决定', description: '抽签做决定不再纠结', icon: '🎲', iconBg: 'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)', category: 'life', route: '/package-life/random-decision/random-decision', isHot: false },
  { id: 16, name: '年龄计算器', description: '精确到天的年龄计算', icon: '🧓', iconBg: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)', category: 'datetime', route: '/package-calculator/age-calculator/age-calculator', isHot: false },
  { id: 4, name: '小费计算器', description: '快速计算小费金额', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', route: '/package-calculator/tip-calculator/tip-calculator', isHot: false },
  { id: 7, name: 'Base64编解码', description: 'Base64编码解码工具', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'text', route: '/package-text/base64-tool/base64-tool', isHot: false },
  { id: 19, name: 'URL编解码', description: 'URL编码解码工具', icon: '🔗', iconBg: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)', category: 'dev', route: '/package-text/url-encoder/url-encoder', isHot: false },
  { id: 20, name: '正则表达式测试', description: '正则表达式在线测试', icon: '✨', iconBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', category: 'dev', route: '/package-text/regex-tester/regex-tester', isHot: false },
  { id: 35, name: '提前还款计算器', description: '计算提前还款节省的利息和时间', icon: '🏦', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'calculator', route: '/package-calculator/prepayment-calculator/prepayment-calculator', isHot: true },
  { id: 36, name: 'IP地址查询', description: '查询IP归属地和运营商信息', icon: '🌐', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)', category: 'dev', route: '/package-dev/ip-lookup/ip-lookup', isHot: true },
  { id: 37, name: 'Morse电码转换', description: '文本与摩尔斯电码互转', icon: '📡', iconBg: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)', category: 'text', route: '/package-text/morse-code/morse-code', isHot: false },
  { id: 38, name: '三角函数计算器', description: '三角函数计算与角度弧度互转', icon: '📐', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', route: '/package-calculator/trig-calculator/trig-calculator', isHot: false },
  { id: 39, name: '位运算可视化', description: '直观展示二进制位运算过程', icon: '🧮', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'dev', route: '/package-dev/bit-visualizer/bit-visualizer', isHot: false },
  { id: 40, name: '记账本', description: '简易收支记录+月度统计图表', icon: '📒', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'office', route: '/package-life/account-book/account-book', isHot: true },
  { id: 41, name: '反应速度测试', description: '测试你的反应速度，挑战极限', icon: '⚡', iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', category: 'fun', route: '/package-fun/reaction-test/reaction-test', isHot: true },
  { id: 42, name: '色彩记忆', description: '记住颜色序列，锻炼记忆力', icon: '🎨', iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', category: 'fun', route: '/package-fun/color-memory/color-memory', isHot: false },
  { id: 43, name: '数字猜谜', description: '猜4位数字，锻炼逻辑推理', icon: '🔢', iconBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', category: 'fun', route: '/package-fun/number-guess/number-guess', isHot: false },
  { id: 44, name: '记忆翻牌', description: '翻牌配对，挑战最短步数', icon: '🃏', iconBg: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', category: 'fun', route: '/package-fun/memory-card/memory-card', isHot: false },
  { id: 45, name: '疯狂点击', description: '10秒疯狂点击，测手速', icon: '👆', iconBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', category: 'fun', route: '/package-fun/crazy-click/crazy-click', isHot: true },
  { id: 46, name: '迷宫', description: '随机迷宫+计时通关', icon: '🏰', iconBg: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', category: 'fun', route: '/package-fun/maze/maze', isHot: false },
  { id: 47, name: '视力测试', description: '色盲/散光/视力表三合一', icon: '👁', iconBg: 'linear-gradient(135deg, #059669 0%, #065F46 100%)', category: 'fun', route: '/package-fun/vision-test/vision-test', isHot: false },
  { id: 48, name: '心理测试', description: '趣味性格/心理小测试', icon: '🔮', iconBg: 'linear-gradient(135deg, #DB2777 0%, #9D174D 100%)', category: 'fun', route: '/package-fun/psychology-test/psychology-test', isHot: false },
  { id: 49, name: '数字顺序记忆', description: '按1-2-3依次点完，练习专注与顺序记忆', icon: '🔢', iconBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', category: 'fun', route: '/package-fun/number-sequence/number-sequence', isHot: false },
  { id: 50, name: '时间感知训练', description: '随机目标秒数，默数计时，累计绝对误差', icon: '⏱️', iconBg: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', category: 'fun', route: '/package-fun/time-perception/time-perception', isHot: false }
]

var _routeMap = null
function getRouteMap() {
  if (_routeMap) return _routeMap
  _routeMap = {}
  for (var i = 0; i < tools.length; i++) {
    _routeMap[tools[i].id] = tools[i].route
  }
  return _routeMap
}

function getToolById(id) {
  for (var i = 0; i < tools.length; i++) {
    if (tools[i].id === id) return tools[i]
  }
  return null
}

function getRouteByToolId(id) {
  var map = getRouteMap()
  return map[id] || null
}

function getToolsByCategory(category) {
  if (category === 'all') return tools.slice()
  var result = []
  for (var i = 0; i < tools.length; i++) {
    if (tools[i].category === category) result.push(tools[i])
  }
  return result
}

function getHotTools() {
  var result = []
  for (var i = 0; i < tools.length; i++) {
    if (tools[i].isHot) result.push(tools[i])
  }
  return result
}

function getToolsWithFavorites(favoriteIds) {
  var result = []
  for (var i = 0; i < tools.length; i++) {
    var t = {}
    for (var key in tools[i]) t[key] = tools[i][key]
    t.isFavorite = false
    for (var j = 0; j < favoriteIds.length; j++) {
      if (favoriteIds[j] === t.id) { t.isFavorite = true; break }
    }
    result.push(t)
  }
  return result
}

module.exports = {
  tools: tools,
  getRouteMap: getRouteMap,
  getToolById: getToolById,
  getRouteByToolId: getRouteByToolId,
  getToolsByCategory: getToolsByCategory,
  getHotTools: getHotTools,
  getToolsWithFavorites: getToolsWithFavorites
}
