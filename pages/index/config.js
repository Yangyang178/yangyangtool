/**
 * 配置数据模块
 * 包含：工具路由映射、工具列表数据、分类配置
 */

const urlMap = {
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

const defaultTools = [
  {
    id: 21, name: '图片处理', description: '压缩/转换/裁剪/信息查看', icon: '📹', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'dev', isHot: true, isFavorite: false
  },
  {
    id: 2, name: '单位换算', description: '长度/重量/温度等转换', icon: '📏', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', category: 'calculator', isHot: false, isFavorite: false
  },
  {
    id: 1, name: '汇率换算', description: '实时汇率，快速换汇', icon: '💱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', category: 'calculator', isHot: true, isFavorite: false
  },
  {
    id: 3, name: '房贷计算器', description: '月供、利息一目了然', icon: '🏠', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'calculator', isHot: true, isFavorite: false
  },
  {
    id: 5, name: '字数统计', description: '中英文字符精准统计', icon: '#️⃣', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', isHot: true, isFavorite: false
  },
  {
    id: 13, name: '日期计算器', description: '间隔天数精确计算', icon: '📅', iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)', category: 'datetime', isHot: true, isFavorite: false
  },
  {
    id: 11, name: '随机决定', description: '抽签做决定不再纠结', icon: '🎲', iconBg: 'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)', category: 'life', isHot: false, isFavorite: false
  },
  {
    id: 4, name: '小费计算器', description: '快速计算小费金额', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', isHot: false, isFavorite: false
  },
  {
    id: 6, name: '大小写转换', description: '英文大小写一键切换', icon: '🔤', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', category: 'text', isHot: false, isFavorite: false
  },
  {
    id: 7, name: 'Base64编解码', description: 'Base64编码解码工具', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'text', isHot: false, isFavorite: false
  },
  {
    id: 9, name: '番茄计时', description: '专注工作25分钟', icon: '🍅', iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)', category: 'life', isHot: true, isFavorite: false
  },
  {
    id: 10, name: '喝水提醒', description: '健康饮水定时提醒', icon: '💧', iconBg: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)', category: 'life', isHot: false, isFavorite: false
  },
  {
    id: 12, name: '垃圾分类查询', description: '智能识别垃圾类型', icon: '♻️', iconBg: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)', category: 'life', isHot: false, isFavorite: false
  },
  {
    id: 14, name: '倒计时', description: '重要日期倒计时', icon: '⏰', iconBg: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)', category: 'datetime', isHot: false, isFavorite: false
  },
  {
    id: 15, name: '世界时钟', description: '全球时区时间查看', icon: '🌍', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'datetime', isHot: false, isFavorite: false
  },
  {
    id: 16, name: '年龄计算器', description: '精确到天的年龄计算', icon: '🧓', iconBg: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)', category: 'datetime', isHot: false, isFavorite: false
  },
  {
    id: 17, name: 'JSON格式化', description: 'JSON美化压缩工具', icon: '{}', iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)', category: 'dev', isHot: true, isFavorite: false
  },
  {
    id: 18, name: '颜色转换', description: 'HEX/RGB/HSL互转', icon: '🎨', iconBg: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)', category: 'dev', isHot: false, isFavorite: false
  },
  {
    id: 19, name: 'URL编解码', description: 'URL编码解码工具', icon: '🔗', iconBg: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)', category: 'dev', isHot: false, isFavorite: false
  },
  {
    id: 20, name: '正则表达式测试', description: '正则表达式在线测试', icon: '✨', iconBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', category: 'dev', isHot: false, isFavorite: false
  },
  {
    id: 22, name: '密码生成器', description: '自定义长度/字符类型，一键生成强密码', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'dev', isHot: false, isFavorite: false
  },
  {
    id: 23, name: 'BMI 计算器', description: '身高体重→BMI指数+健康建议', icon: '⚖️', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'life', isHot: true, isFavorite: false
  },
  {
    id: 24, name: '文本对比', description: '两段文本差异对比，高亮显示不同处', icon: '🔄', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', isHot: false, isFavorite: false
  },
  {
    id: 25, name: '个税计算器', description: '2024最新个税专项扣除，月薪→税后工资', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', isHot: true, isFavorite: false
  }
]

const categories = [
  { id: 'all', name: '全部' },
  { id: 'calculator', name: '计算转换' },
  { id: 'text', name: '文本处理' },
  { id: 'life', name: '生活助手' },
  { id: 'datetime', name: '日期时间' },
  { id: 'dev', name: '开发调试' }
]

const hotSearchWords = ['汇率', '房贷', 'BMI', '个税', '字数', '番茄', 'JSON', '图片', '密码', '随机']

module.exports = {
  urlMap,
  defaultTools,
  categories,
  hotSearchWords
}
