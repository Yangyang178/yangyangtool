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

Page({
  data: {
    favoriteTools: [],
    popularTools: [],
    isDarkMode: false
  },

  onLoad() {
    this.loadFavorites()
    this.loadPopularTools()

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShow() {
    this.loadFavorites()
    this.loadPopularTools()
    var appInstance = getApp()
    if (appInstance) {
      var isDark = appInstance.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
      this.setData({ isDarkMode: isDark })
    }
  },

  loadPopularTools() {
    var allTools = [
      { id: 21, name: '图片处理', description: '压缩/转换/裁剪/信息查看', icon: '🖼️', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'dev', isHot: true },
      { id: 1, name: '汇率换算', description: '实时汇率，快速换汇', icon: '💱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', category: 'calculator', isHot: true },
      { id: 3, name: '房贷计算器', description: '月供、利息一目了然', icon: '🏠', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'calculator', isHot: true },
      { id: 5, name: '字数统计', description: '中英文字符精准统计', icon: '#️⃣', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', isHot: true },
      { id: 13, name: '日期计算器', description: '间隔天数精确计算', icon: '📅', iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)', category: 'datetime', isHot: true },
      { id: 9, name: '番茄计时', description: '专注工作25分钟', icon: '🍅', iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)', category: 'life', isHot: true },
      { id: 17, name: 'JSON格式化', description: 'JSON美化压缩工具', icon: '{}', iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)', category: 'dev', isHot: true },
      { id: 23, name: 'BMI 计算器', description: '身高体重→BMI指数+健康建议', icon: '⚖️', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'life', isHot: true },
      { id: 25, name: '个税计算器', description: '2024最新个税专项扣除，月薪→税后工资', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', isHot: true }
    ]
    var favorites = wx.getStorageSync('favorites') || []
    var toolsWithFav = []
    for (var ti = 0; ti < allTools.length; ti++) {
      var tool = allTools[ti]
      var newTool = {}
      for (var key in tool) {
        newTool[key] = tool[key]
      }
      var isFav = false
      for (var fi = 0; fi < favorites.length; fi++) {
        if (favorites[fi] === tool.id) {
          isFav = true
          break
        }
      }
      newTool.isFavorite = isFav
      toolsWithFav.push(newTool)
    }

    this.setData({ popularTools: toolsWithFav })
  },

  loadFavorites() {
    var favorites = wx.getStorageSync('favorites') || []
    var allTools = [
      { id: 1, name: '汇率换算', icon: '💱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
      { id: 2, name: '单位换算', icon: '📏', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
      { id: 3, name: '房贷计算器', icon: '🏠', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' },
      { id: 4, name: '小费计算器', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
      { id: 5, name: '字数统计', icon: '#️⃣', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)' },
      { id: 6, name: '大小写转换', icon: '🔤', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' },
      { id: 7, name: 'Base64编解码', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)' },
      { id: 8, name: '二维码生成器', icon: '📱', iconBg: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)' },
      { id: 9, name: '番茄计时', icon: '🍅', iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)' },
      { id: 10, name: '喝水提醒', icon: '💧', iconBg: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)' },
      { id: 11, name: '随机决定', icon: '🎲', iconBg: 'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)' },
      { id: 12, name: '垃圾分类查询', icon: '♻️', iconBg: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)' },
      { id: 13, name: '日期计算器', icon: '📅', iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)' },
      { id: 14, name: '倒计时', icon: '⏰', iconBg: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)' },
      { id: 15, name: '世界时钟', icon: '🌍', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
      { id: 16, name: '年龄计算器', icon: '👶', iconBg: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)' },
      { id: 17, name: 'JSON格式化', icon: '{}', iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' },
      { id: 18, name: '颜色转换', icon: '🎨', iconBg: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' },
      { id: 19, name: 'URL编解码', icon: '🔗', iconBg: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)' },
      { id: 20, name: '正则表达式测试', icon: '✨', iconBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)' },
      { id: 21, name: '图片处理', icon: '🖼️', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
      { id: 22, name: '密码生成器', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)' },
      { id: 23, name: 'BMI 计算器', icon: '⚖️', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' },
      { id: 24, name: '文本对比', icon: '🔄', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)' },
      { id: 25, name: '个税计算器', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }
    ]

    var favoriteTools = []
    for (var i = 0; i < allTools.length; i++) {
      var tool = allTools[i]
      var isFav = false
      for (var j = 0; j < favorites.length; j++) {
        if (favorites[j] === tool.id) {
          isFav = true
          break
        }
      }
      if (isFav) favoriteTools.push(tool)
    }

    this.setData({ favoriteTools: favoriteTools })
  },

  onToolClick(e) {
    var tool = e.currentTarget.dataset.tool
    wx.vibrateShort({ type: 'light' })

    var targetUrl = urlMap[tool.id]

    if (targetUrl) {
      wx.navigateTo({
        url: targetUrl,
        fail: function(err) {
          console.log('跳转失败:', err)
          wx.showToast({ title: '页面跳转失败', icon: 'none' })
        }
      })
    } else {
      wx.showToast({ title: '工具路径不存在', icon: 'none' })
    }
  },

  toggleFavorite(e) {
    var id = e.currentTarget.dataset.id
    var favorites = wx.getStorageSync('favorites') || []

    var index = favorites.indexOf(id)
    if (index > -1) {
      favorites.splice(index, 1)
    } else {
      favorites.push(id)
      wx.vibrateShort({ type: 'light' })
      wx.showToast({
        title: '已收藏 ❤️',
        icon: 'success',
        duration: 1200
      })
    }

    wx.setStorageSync('favorites', favorites)
    this.loadFavorites()
    this.loadPopularTools()
  },

  removeFavorite(e) {
    var id = e.currentTarget.dataset.id
    var favorites = wx.getStorageSync('favorites') || []
    var newFavorites = []
    for (var fi = 0; fi < favorites.length; fi++) {
      if (favorites[fi] !== id) newFavorites.push(favorites[fi])
    }
    favorites = newFavorites
    wx.setStorageSync('favorites', favorites)

    wx.vibrateShort({ type: 'light' })
    this.loadFavorites()

    wx.showToast({
      title: '已取消收藏',
      icon: 'none',
      duration: 1500
    })
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage() {
    var appInstance = getApp()
    var poster = (appInstance.globalData && appInstance.globalData.sharePosterPath) || ''
    return {
      title: '🧰 百宝工具箱 - 我的收藏工具',
      path: '/pages/favorites/favorites',
      imageUrl: poster
    }
  },

  onShareTimeline() {
    var appInstance = getApp()
    var poster = (appInstance.globalData && appInstance.globalData.sharePosterPath) || ''
    return {
      title: '🧰 百宝工具箱 - 收藏的24+实用小工具',
      query: '',
      imageUrl: poster
    }
  }
})
