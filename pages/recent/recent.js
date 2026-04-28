var app = getApp()

Page({
  data: {
    userInfo: { nickname: '微信用户', avatarUrl: '', avatarBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
    totalUsage: 0,
    
    menuButtonInfo: {
      top: 0,
      height: 44
    },
    
    funStats: {
      savedTime: '0分钟',
      operationCount: 0,
      efficiencyLevel: '新手',
      levelIcon: '🌱',
      progressPercent: 0
    },
    
    weeklyData: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      values: [0, 0, 0, 0, 0, 0, 0],
      maxValue: 10,
      totalWeekUsage: 0,
      mostUsedDay: '-',
      averageDaily: 0
    },
    
    recentTools: [],
    favoriteTools: [],
    favoritePreviewNames: '',
    isDarkMode: false,
    darkModeSetting: 'system',
    cacheSize: '0 KB',
    showClearCache: false,
    cacheInfo: {
      total: '0 KB',
      data: '0 KB',
      images: '0 KB',
      history: '0 条'
    },
    clearHistory: [],
    
    showEditProfile: false,
    editNickname: '',
    tempAvatarUrl: '',
    selectedAvatarColor: '#DBEAFE',
    avatarColors: [
      { color: '#DBEAFE', bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
      { color: '#FEE2E2', bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
      { color: '#D1FAE5', bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' },
      { color: '#FEF3C7', bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
      { color: '#E9D5FF', bg: 'linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)' },
      { color: '#FCE7F3', bg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' },
      { color: '#CFFAFE', bg: 'linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%)' },
      { color: '#1E293B', bg: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)' }
    ],

    showFeedback: false,
    feedbackType: 'bug',
    feedbackContent: '',
    contactInfo: '',
    isSubmitting: false,
    feedbackTypes: [
      { value: 'bug', label: '🐛 问题反馈' },
      { value: 'suggestion', label: '💡 功能建议' },
      { value: 'other', label: '💬 其他' }
    ],

    showToolRequest: false,
    toolRequestContent: '',
    toolRequestContact: '',
    selectedCategory: '',
    selectedPriority: 'medium',
    isSubmittingUGC: false,
    submittedRequests: [],
    
    toolCategories: [
      { value: 'calculator', icon: '🧮', label: '计算转换' },
      { value: 'text', icon: '📝', label: '文本处理' },
      { value: 'life', icon: '🏠', label: '生活助手' },
      { value: 'datetime', icon: '⏰', label: '日期时间' },
      { value: 'dev', icon: '💻', label: '开发调试' },
      { value: 'other', icon: '✨', label: '其他类型' }
    ],
    
    priorityLevels: [
      { value: 'low', icon: '😊', label: '一般' },
      { value: 'medium', icon: '💪', label: '需要' },
      { value: 'high', icon: '🔥', label: '急需' }
    ]
  },

  onLoad() {
    this.loadAllData()
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShow() {
    this.loadAllData()
  },

  loadAllData() {
    this.loadUserInfo()
    this.loadRecentTools()
    this.loadFavorites()
    this.calculateCacheSize()
    this.checkDarkMode()
    this.calculateFunStats()
    this.loadWeeklyData()
    this.loadSubmittedRequests()
    var appInstance = getApp()
    if (appInstance) {
      var isDark = appInstance.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
      var setting = wx.getStorageSync('darkModeSetting') || 'system'
      this.setData({ 
        isDarkMode: isDark,
        darkModeSetting: setting
      })
    }
  },

  loadUserInfo() {
    var usageCount = wx.getStorageSync('totalUsageCount') || 0
    this.setData({ totalUsage: usageCount })

    var savedProfile = wx.getStorageSync('userProfile') || {}
    if (savedProfile.nickname || savedProfile.avatarUrl || savedProfile.avatarBg) {
      this.setData({
        userInfo: {
          nickname: savedProfile.nickname || '微信用户',
          avatarUrl: savedProfile.avatarUrl || '',
          avatarBg: savedProfile.avatarBg || 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
        }
      })
    } else {
      try {
        wx.getUserProfile({
          desc: '用于展示用户信息',
          success: function(res) {
            this.setData({ 'userInfo.nickname': res.userInfo.nickName || '微信用户' })
          }.bind(this),
          fail: function() {
            this.setData({ 'userInfo.nickname': '微信用户' })
          }.bind(this)
        })
      } catch (e) {
        this.setData({ 'userInfo.nickname': '微信用户' })
      }
    }
  },

  calculateFunStats() {
    var totalUsageCount = wx.getStorageSync('totalUsageCount') || 0

    var operationCount = totalUsageCount
    var savedTime = Math.round(totalUsageCount * 2.5)

    var efficiencyLevel = '新手'
    var levelIcon = '🌱'

    if (totalUsageCount >= 2000) {
      efficiencyLevel = '宗师'
      levelIcon = '👑'
    } else if (totalUsageCount >= 1000) {
      efficiencyLevel = '传奇'
      levelIcon = '🏆'
    } else if (totalUsageCount >= 500) {
      efficiencyLevel = '权威'
      levelIcon = '💎'
    } else if (totalUsageCount >= 200) {
      efficiencyLevel = '专家'
      levelIcon = '⭐'
    } else if (totalUsageCount >= 100) {
      efficiencyLevel = '熟练'
      levelIcon = '🔥'
    } else if (totalUsageCount >= 50) {
      efficiencyLevel = '进阶'
      levelIcon = '🚀'
    } else if (totalUsageCount >= 20) {
      efficiencyLevel = '入门'
      levelIcon = '📈'
    } else if (totalUsageCount >= 10) {
      efficiencyLevel = '初级'
      levelIcon = '✨'
    }

    var currentThreshold = 0
    var nextThreshold = 10
    if (totalUsageCount >= 2000) { currentThreshold = 2000; nextThreshold = 5000 }
    else if (totalUsageCount >= 1000) { currentThreshold = 1000; nextThreshold = 2000 }
    else if (totalUsageCount >= 500) { currentThreshold = 500; nextThreshold = 1000 }
    else if (totalUsageCount >= 200) { currentThreshold = 200; nextThreshold = 500 }
    else if (totalUsageCount >= 100) { currentThreshold = 100; nextThreshold = 200 }
    else if (totalUsageCount >= 50) { currentThreshold = 50; nextThreshold = 100 }
    else if (totalUsageCount >= 20) { currentThreshold = 20; nextThreshold = 50 }
    else if (totalUsageCount >= 10) { currentThreshold = 10; nextThreshold = 20 }

    var progressPercent = 0
    if (nextThreshold > currentThreshold && totalUsageCount > currentThreshold) {
      progressPercent = Math.min(99, Math.round(((totalUsageCount - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    } else if (totalUsageCount === 0) {
      progressPercent = 0
    } else if (totalUsageCount < 10) {
      progressPercent = Math.min(99, Math.round((totalUsageCount / 10) * 100))
    }

    this.setData({
      funStats: {
        operationCount: operationCount,
        savedTime: savedTime,
        efficiencyLevel: efficiencyLevel,
        levelIcon: levelIcon,
        progressPercent: progressPercent
      }
    })
  },

  loadWeeklyData() {
    var weeklyRecord = wx.getStorageSync('weeklyUsage') || {}
    var today = new Date()
    var dayOfWeek = today.getDay()
    var monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    
    var labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    var values = [0, 0, 0, 0, 0, 0, 0]
    
    for (var i = 0; i < 7; i++) {
      var date = new Date(monday)
      date.setDate(monday.getDate() + i)
      var y = date.getFullYear()
      var m = date.getMonth() + 1
      var d = date.getDate()
      var mStr = m < 10 ? '0' + m : '' + m
      var dStr = d < 10 ? '0' + d : '' + d
      var dateKey = y + '-' + mStr + '-' + dStr
      values[i] = weeklyRecord[dateKey] || 0
    }

    var totalWeek = 0
    for (var vi = 0; vi < values.length; vi++) {
      totalWeek += values[vi]
    }

    var maxValue = 1
    for (var mi = 0; mi < values.length; mi++) {
      if (values[mi] > maxValue) maxValue = values[mi]
    }

    var maxIndex = -1
    for (var xi = 0; xi < values.length; xi++) {
      if (values[xi] === maxValue) { maxIndex = xi; break }
    }

    var averageDaily = totalWeek > 0 ? (totalWeek / 7).toFixed(1) : 0

    this.setData({
      weeklyData: {
        labels: labels,
        values: values,
        maxValue: maxValue,
        totalWeekUsage: totalWeek,
        mostUsedDay: values[maxIndex] > 0 ? labels[maxIndex] : '-',
        averageDaily: parseFloat(averageDaily)
      }
    })
  },

  recordWeeklyUsage() {
    var today = new Date()
    var y = today.getFullYear()
    var m = today.getMonth() + 1
    var d = today.getDate()
    var mStr = m < 10 ? '0' + m : '' + m
    var dStr = d < 10 ? '0' + d : '' + d
    var dateKey = y + '-' + mStr + '-' + dStr
    
    var weeklyRecord = wx.getStorageSync('weeklyUsage') || {}
    weeklyRecord[dateKey] = (weeklyRecord[dateKey] || 0) + 1
    
    var oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)

    var keysToRemove = []
    for (var key in weeklyRecord) {
      keysToRemove.push(key)
    }
    for (var ki = 0; ki < keysToRemove.length; ki++) {
      var parts = keysToRemove[ki].split('-')
      var ky = parseInt(parts[0], 10)
      var km = parseInt(parts[1], 10) - 1
      var kd = parseInt(parts[2], 10)
      var keyDate = new Date(ky, km, kd)
      if (keyDate < oneWeekAgo) {
        delete weeklyRecord[keysToRemove[ki]]
      }
    }
    
    wx.setStorageSync('weeklyUsage', weeklyRecord)
  },

  openEditProfile() {
    wx.vibrateShort({ type: 'light' })
    var info = this.data.userInfo
    this.setData({
      showEditProfile: true,
      editNickname: info.nickname,
      tempAvatarUrl: info.avatarUrl || '',
      selectedAvatarColor: info.avatarBg ? this.extractColorFromBg(info.avatarBg) : '#DBEAFE'
    })
  },

  closeEditProfile() {
    this.setData({ showEditProfile: false })
  },

  extractColorFromBg(bg) {
    if (!bg) return '#DBEAFE'
    var colors = this.data.avatarColors
    for (var ci = 0; ci < colors.length; ci++) {
      if (bg.indexOf(colors[ci].color) > -1) return colors[ci].color
    }
    return '#DBEAFE'
  },

  chooseAvatar() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        var tempPath = res.tempFiles[0].tempFilePath
        that.setData({ tempAvatarUrl: tempPath })
        wx.showToast({ title: '头像已选择，点击保存生效', icon: 'none', duration: 1500 })
      }
    })
  },

  onNicknameInput(e) {
    this.setData({ editNickname: e.detail.value })
  },

  selectAvatarColor(e) {
    wx.vibrateShort({ type: 'light' })
    var dataset = e.currentTarget.dataset
    this.setData({ selectedAvatarColor: dataset.color, 'userInfo.avatarBg': dataset.bg })
  },

  saveProfile() {
    wx.vibrateShort({ type: 'light' })
    var nickname = this.data.editNickname.trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    var profile = {
      nickname: nickname,
      avatarUrl: this.data.tempAvatarUrl,
      avatarBg: this.data.userInfo.avatarBg
    }

    wx.setStorageSync('userProfile', profile)

    this.setData({
      showEditProfile: false,
      'userInfo.nickname': nickname,
      'userInfo.avatarUrl': this.data.tempAvatarUrl
    })

    wx.showToast({ title: '资料已保存 ✅', icon: 'success' })
  },

  loadRecentTools() {
    var recentTools = wx.getStorageSync('recentTools') || []
    var formattedTools = []
    for (var ri = 0; ri < recentTools.length; ri++) {
      var tool = recentTools[ri]
      var newTool = {}
      for (var key in tool) {
        newTool[key] = tool[key]
      }
      newTool.timeText = this.formatTime(tool.usedAt)
      formattedTools.push(newTool)
    }
    this.setData({ recentTools: formattedTools })
  },

  loadFavorites() {
    var favoriteIds = wx.getStorageSync('favorites') || []
    var allTools = this.getAllToolsData()

    if (!allTools.length) return

    var favTools = []
    for (var fi = 0; fi < favoriteIds.length; fi++) {
      for (var ti = 0; ti < allTools.length; ti++) {
        if (allTools[ti].id === favoriteIds[fi]) {
          favTools.push(allTools[ti])
          break
        }
      }
    }

    var names = ''
    for (var ni = 0; ni < favTools.length; ni++) {
      if (ni > 0) names += ' · '
      names += favTools[ni].name
    }
    this.setData({
      favoriteTools: favTools,
      favoritePreviewNames: names
    })
  },

  getAllToolsData() {
    return [
      { id: 1, name: '汇率换算', icon: '💱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
      { id: 2, name: '单位换算', icon: '📏', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
      { id: 3, name: '房贷计算器', icon: '🏠', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' },
      { id: 4, name: '小费计算器', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
      { id: 5, name: '字数统计', icon: '#️⃣', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)' },
      { id: 6, name: '大小写转换', icon: '🔤', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' },
      { id: 7, name: 'Base64编解码', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)' },
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
  },

  formatTime(timestamp) {
    var now = new Date()
    var date = new Date(timestamp)
    var diff = now - date

    var minutes = Math.floor(diff / (1000 * 60))
    var hours = Math.floor(diff / (1000 * 60 * 60))
    var days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return minutes + '分钟前'
    if (hours < 24) return hours + '小时前'
    if (days < 7) return days + '天前'

    return (date.getMonth() + 1) + '月' + date.getDate() + '日'
  },

  calculateCacheSize() {
    try {
      this.calculateDetailedCache()
    } catch (e) {
      this.setData({ cacheSize: '未知' })
    }
  },

  calculateDetailedCache() {
    try {
      var dataSize = 0
      var historyCount = 0

      var keys = ['favorites', 'recentTools', 'totalUsageCount', 'userProfile', 'darkMode', 'urlMap', 'allTools', 'feedbackHistory']
      for (var ki = 0; ki < keys.length; ki++) {
        try {
          var data = wx.getStorageSync(keys[ki])
          if (data !== '' && data !== undefined && data !== null) {
            dataSize += JSON.stringify(data).length * 2
          }
        } catch(e) {}
      }

      var recentTools = wx.getStorageSync('recentTools') || []
      historyCount = recentTools.length

      var favorites = wx.getStorageSync('favorites') || []
      historyCount += favorites.length

      var feedbackHistory = wx.getStorageSync('feedbackHistory') || []
      historyCount += feedbackHistory.length

      var displayTotal = this.formatSize(dataSize)

      this.setData({
        cacheSize: displayTotal,
        cacheInfo: {
          total: displayTotal,
          data: this.formatSize(dataSize),
          images: '0 KB',
          history: historyCount + ' 条'
        }
      })
    } catch(e) {}
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    var kb = Math.round(bytes / 1024)
    if (kb < 1024) return kb + ' KB'
    return (kb / 1024).toFixed(1) + ' MB'
  },

  checkDarkMode() {
    var setting = wx.getStorageSync('darkModeSetting') || 'system'
    this.setData({ darkModeSetting: setting })

    if (setting === 'system') {
      var that = this
      wx.getSystemInfo({
        success: function(res) {
          var isDark = res.theme === 'dark'
          that.setData({ isDarkMode: isDark })
          wx.setStorageSync('darkMode', isDark)
        }
      })
    } else {
      var isDark = setting === 'dark'
      this.setData({ isDarkMode: isDark })
      wx.setStorageSync('darkMode', isDark)
    }
  },

  onToolClick(e) {
    var tool = e.currentTarget.dataset.tool
    wx.vibrateShort({ type: 'light' })

    var currentCount = wx.getStorageSync('totalUsageCount') || 0
    wx.setStorageSync('totalUsageCount', currentCount + 1)
    
    this.recordWeeklyUsage()

    var urlMap = wx.getStorageSync('urlMap') || {}
    var targetUrl = urlMap[tool.id]
    if (!targetUrl) {
      wx.showToast({ title: '工具路径不存在', icon: 'none' })
      return
    }

    if (targetUrl.indexOf('/pages/') === 0) {
      wx.navigateTo({ url: targetUrl, fail: function() { wx.switchTab({ url: targetUrl }) } })
    } else {
      wx.navigateTo({ url: targetUrl })
    }
  },

  goToRecentFull() {
    wx.vibrateShort({ type: 'light' })
  },

  goToFavorites() {
    wx.vibrateShort({ type: 'light' })
    wx.switchTab({ url: '/pages/favorites/favorites' })
  },

  toggleDarkMode() {
    wx.vibrateShort({ type: 'light' })
    
    var modes = ['system', 'light', 'dark']
    var currentIndex = -1
    for (var mi = 0; mi < modes.length; mi++) {
      if (modes[mi] === this.data.darkModeSetting) { currentIndex = mi; break }
    }
    var nextIndex = (currentIndex + 1) % modes.length
    var newSetting = modes[nextIndex]
    
    wx.setStorageSync('darkModeSetting', newSetting)
    this.setData({ darkModeSetting: newSetting })

    var that = this
    if (newSetting === 'system') {
      wx.getSystemInfo({
        success: function(res) {
          var isDark = res.theme === 'dark'
          that.setData({ isDarkMode: isDark })
          wx.setStorageSync('darkMode', isDark)
          that.applyThemeGlobal(isDark)
        }
      })
      wx.showToast({ title: '已切换至跟随系统 🔄', icon: 'success' })
    } else if (newSetting === 'light') {
      this.setData({ isDarkMode: false })
      wx.setStorageSync('darkMode', false)
      this.applyThemeGlobal(false)
      wx.showToast({ title: '已切换至白天模式 ☀️', icon: 'success' })
    } else {
      this.setData({ isDarkMode: true })
      wx.setStorageSync('darkMode', true)
      this.applyThemeGlobal(true)
      wx.showToast({ title: '已切换至夜间模式 🌙', icon: 'success' })
    }
  },

  applyThemeGlobal(isDark) {
    var appInstance = getApp()
    if (appInstance && appInstance.applyTheme) {
      appInstance.applyTheme()
    }
  },

  clearCache() {
    wx.vibrateShort({ type: 'light' })
    this.calculateDetailedCache()
    this.setData({ showClearCache: true })
  },

  closeClearCache() {
    this.setData({ showClearCache: false })
  },

  clearAllData() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: '⚠️ 清理所有数据',
      content: '确定要清理所有数据吗？\n包括：收藏记录、使用历史、用户设置等',
      confirmText: '全部清理',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          wx.clearStorageSync()
          that.setData({
            cacheSize: '0 KB',
            showClearCache: false,
            recentTools: [],
            favoriteTools: [],
            favoritePreviewNames: '',
            cacheInfo: { total: '0 B', data: '0 B', images: '0 B', history: '0 条' }
          })
          wx.showToast({ title: '已清理全部数据', icon: 'success' })
          setTimeout(function() { that.loadAllData() }, 1000)
        }
      }
    })
  },

  clearHistoryData() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: '🗑️ 清理历史记录',
      content: '确定要清理所有历史记录吗？\n包括：最近使用、收藏夹、反馈历史',
      confirmText: '清理',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var keysToRemove = ['recentTools', 'favorites', 'feedbackHistory']
          for (var kti = 0; kti < keysToRemove.length; kti++) {
            wx.removeStorageSync(keysToRemove[kti])
          }
          
          that.calculateDetailedCache()
          that.setData({
            recentTools: [],
            favoriteTools: [],
            favoritePreviewNames: ''
          })
          wx.showToast({ title: '历史记录已清理', icon: 'success' })
        }
      }
    })
  },

  clearTempData() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: '📋 清理暂存数据',
      content: '确定要清理临时缓存数据吗？',
      confirmText: '清理',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          try {
            wx.getStorageInfo({
              success: function(info) {
                for (var iki = 0; iki < info.keys.length; iki++) {
                  var key = info.keys[iki]
                  if (key.indexOf('temp_') === 0 || key.indexOf('cache_') === 0) {
                    wx.removeStorageSync(key)
                  }
                }
                that.calculateDetailedCache()
                wx.showToast({ title: '暂存数据已清理', icon: 'success' })
              }
            })
          } catch(e) {
            wx.showToast({ title: '清理失败', icon: 'none' })
          }
        }
      }
    })
  },

  clearClipboardTemp() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: '📎 清理剪贴板暂存',
      content: '确定要清理剪贴板暂存数据吗？',
      confirmText: '清理',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          wx.setClipboardData({ data: '' })
          setTimeout(function() {
            wx.showToast({ title: '剪贴板已清空', icon: 'success' })
          }, 500)
        }
      }
    })
  },

  clearUserData() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: '💾 清空数据缓存',
      content: '确定要清空数据缓存吗？\n包括：用户设置、收藏记录、使用次数等\n（不会删除历史记录）',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var keysToRemove = ['userProfile', 'totalUsageCount', 'urlMap', 'allTools']
          for (var udi = 0; udi < keysToRemove.length; udi++) {
            wx.removeStorageSync(keysToRemove[udi])
          }
          
          that.calculateDetailedCache()
          wx.showToast({ title: '数据缓存已清空', icon: 'success' })
        }
      }
    })
  },

  clearImageCache() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: '🖼️ 清空图片缓存',
      content: '确定要清空图片缓存吗？\n包括：用户头像、临时图片等',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          try {
            wx.getStorageInfo({
              success: function(info) {
                var cleared = 0
                for (var ik = 0; ik < info.keys.length; ik++) {
                  var key = info.keys[ik]
                  if (key.indexOf('avatar') > -1 || key.indexOf('image') > -1 || key.indexOf('temp_') === 0) {
                    wx.removeStorageSync(key)
                    cleared++
                  }
                }
                that.calculateDetailedCache()
                wx.showToast({ title: '图片缓存已清空', icon: 'success' })
              }
            })
          } catch(e) {
            wx.showToast({ title: '清空失败', icon: 'none' })
          }
        }
      }
    })
  },

  onFeedback() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      showFeedback: true,
      feedbackType: 'bug',
      feedbackContent: '',
      contactInfo: ''
    })
  },

  closeFeedback() {
    this.setData({ showFeedback: false })
  },

  selectFeedbackType(e) {
    wx.vibrateShort({ type: 'light' })
    var value = e.currentTarget.dataset.value
    this.setData({ feedbackType: value })
  },

  onContactInput(e) {
    this.setData({ contactInfo: e.detail.value })
  },

  onFeedbackInput(e) {
    this.setData({ feedbackContent: e.detail.value })
  },

  submitFeedback: function() {
    var feedbackContent = this.data.feedbackContent
    var feedbackType = this.data.feedbackType
    var contactInfo = this.data.contactInfo

    if (!feedbackContent.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    if (feedbackContent.trim().length < 5) {
      wx.showToast({ title: '反馈内容至少5个字', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'medium' })

    var typeLabels = { bug: '问题反馈', suggestion: '功能建议', other: '其他' }

    var now = new Date()
    var h = now.getHours()
    var min = now.getMinutes()
    var timeStr = (now.getMonth() + 1) + '/' + now.getDate() + ' ' + (h < 10 ? '0' : '') + h + ':' + (min < 10 ? '0' : '') + min

    var deviceInfo = ''
    try {
      deviceInfo = wx.getSystemInfoSync().model + ' / 微信' + wx.getSystemInfoSync().version
    } catch(e) {
      deviceInfo = '未知设备'
    }

    var sendText = '[百宝工具箱] ' + typeLabels[feedbackType] + '\n时间: ' + timeStr + '\n设备: ' + deviceInfo + '\n联系: ' + (contactInfo || '未填写') + '\n\n反馈内容:\n' + feedbackContent

    var feedbackData = {
      type: feedbackType,
      content: feedbackContent,
      contact: contactInfo,
      time: timeStr,
      device: deviceInfo
    }

    try {
      var history = wx.getStorageSync('feedbackHistory') || []
      history.unshift(feedbackData)
      if (history.length > 20) history = history.slice(0, 20)
      wx.setStorageSync('feedbackHistory', history)
    } catch(e) {}

    var appInstance = getApp()
    if (appInstance.cloudSyncFeedback) {
      appInstance.cloudSyncFeedback({
        content: feedbackContent,
        type: feedbackType,
        contact: contactInfo
      })
    }

    this.setData({ isSubmitting: true })

    var that = this

    setTimeout(function() {
      try {
        wx.setClipboardData({
          data: sendText,
          success: function() {
            that.setData({ isSubmitting: false, showFeedback: false, feedbackContent: '', contactInfo: '' })
            that.showFeedbackSuccessModal()
          },
          fail: function() {
            that.setData({ isSubmitting: false, showFeedback: false, feedbackContent: '', contactInfo: '' })
            that.showFeedbackSuccessModal()
          }
        })
      } catch(e) {
        that.setData({ isSubmitting: false, showFeedback: false, feedbackContent: '', contactInfo: '' })
        that.showFeedbackSuccessModal()
      }
    }, 100)
  },

  showFeedbackSuccessModal: function() {
    var that = this
    wx.showModal({
      title: '反馈已保存',
      content: '感谢您的宝贵意见！\n\n反馈已保存到本地历史记录。\n\n如需发送给我们，请在"意见反馈"页面查看历史记录，或直接发送至邮箱：yhz123456718@qq.com',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  openToolRequest: function() {
    wx.vibrateShort({ type: 'light' })
    
    try {
      var menuButton = wx.getMenuButtonBoundingClientRect()
      this.setData({
        'menuButtonInfo.top': menuButton.top,
        'menuButtonInfo.height': menuButton.height
      })
    } catch (e) {
      console.log('获取菜单按钮位置失败', e)
    }
    
    this.setData({
      showToolRequest: true,
      toolRequestContent: '',
      toolRequestContact: '',
      selectedCategory: '',
      selectedPriority: 'medium'
    })
  },

  closeToolRequest() {
    this.setData({ showToolRequest: false })
  },

  selectToolCategory(e) {
    wx.vibrateShort({ type: 'light' })
    var value = e.currentTarget.dataset.value
    this.setData({ 
      selectedCategory: value === this.data.selectedCategory ? '' : value 
    })
  },

  selectPriority(e) {
    wx.vibrateShort({ type: 'light' })
    var value = e.currentTarget.dataset.value
    this.setData({ selectedPriority: value })
  },

  onToolRequestInput(e) {
    this.setData({ toolRequestContent: e.detail.value })
  },

  onToolRequestContactInput(e) {
    this.setData({ toolRequestContact: e.detail.value })
  },

  loadSubmittedRequests() {
    var requests = wx.getStorageSync('toolRequests') || []
    this.setData({ submittedRequests: requests.slice(0, 10) })
  },

  submitToolRequest() {
    var toolRequestContent = this.data.toolRequestContent
    var toolRequestContact = this.data.toolRequestContact
    var selectedCategory = this.data.selectedCategory
    var selectedPriority = this.data.selectedPriority

    if (!toolRequestContent.trim()) {
      wx.showToast({ title: '请输入需求描述', icon: 'none' })
      return
    }

    if (toolRequestContent.trim().length < 5) {
      wx.showToast({ title: '需求描述至少5个字', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'medium' })
    this.setData({ isSubmittingUGC: true })

    var now = new Date()
    var timeStr = (now.getMonth() + 1) + '月' + now.getDate() + '日 '
    var h = now.getHours()
    var min = now.getMinutes()
    timeStr += (h < 10 ? '0' + h : '' + h) + ':' + (min < 10 ? '0' + min : '' + min)

    var categoryLabel = null
    var categories = this.data.toolCategories
    for (var ci = 0; ci < categories.length; ci++) {
      if (categories[ci].value === selectedCategory) { categoryLabel = categories[ci]; break }
    }

    var priorityLabel = null
    var levels = this.data.priorityLevels
    for (var li = 0; li < levels.length; li++) {
      if (levels[li].value === selectedPriority) { priorityLabel = levels[li]; break }
    }

    var requestData = {
      id: Date.now(),
      content: toolRequestContent,
      category: selectedCategory || 'other',
      categoryName: categoryLabel ? categoryLabel.label : '其他',
      priority: selectedPriority,
      priorityLabel: priorityLabel ? priorityLabel.label : '需要',
      contact: toolRequestContact || '未填写',
      time: timeStr,
      timestamp: now.getTime(),
      status: 'pending'
    }

    var requests = wx.getStorageSync('toolRequests') || []
    requests.unshift(requestData)
    
    if (requests.length > 20) {
      requests = requests.slice(0, 20)
    }
    
    wx.setStorageSync('toolRequests', requests)

    var priorityEmoji = selectedPriority === 'high' ? '🔥' : selectedPriority === 'medium' ? '💪' : '😊'
    var cName = categoryLabel ? categoryLabel.label : '未选择'
    var pName = priorityLabel ? priorityLabel.label : '需要'
    
    var mailBody = '\u00a0\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n  \ud83e\udde6 \u767e\u5b9d\u5de5\u5177\u7bb1 - \u65b0\u5de5\u5177\u9700\u6c42\u5efa\u8bae\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\r\n\ud83d\udccb \u9700\u6c42\u8be6\u60c5\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\u9700\u6c42\u63cf\u8ff0\uff1a' + toolRequestContent + '\r\n\r\n\u5de5\u5177\u7c7b\u578b\uff1a' + cName + '\r\n\u4f18\u5148\u7ea7\uff1a' + priorityEmoji + ' ' + pName + '\r\n\u8054\u7cfb\u65b9\u5f0f\uff1a' + (toolRequestContact || '\u6722\u586b\u5199') + '\r\n\r\n\u23f0 \u63d0\u4ea4\u65f6\u95f4\uff1a' + timeStr + '\r\n\r\n\ud83d\udcf1 \u8bbe\u5907\u4fe1\u606f\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\u8bbe\u5907\u578b\u53f7\uff1a' + wx.getSystemInfoSync().model + '\r\n\u5fae\u4fe1\u7248\u672c\uff1a' + wx.getSystemInfoSync().version + '\r\n\u7cfb\u7edf\u5e73\u53f0\uff1a' + wx.getSystemInfoSync().platform + '\r\n\u5c4f\u5e55\u5c3a\u5bf8\uff1a' + wx.getSystemInfoSync().windowWidth + '\u00d7' + wx.getSystemInfoSync().windowHeight + '\r\n\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\u6765\u81ea\u767e\u5b9d\u5de5\u5177\u7bb1\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u7528\u6237\r\n\u90ae\u7bb1\u63a5\u6536\u65f6\u95f4\uff1a' + new Date().toLocaleString() + '\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'.trim()

    var that = this
    setTimeout(function() {
      that.setData({ 
        isSubmittingUGC: false,
        showToolRequest: false,
        toolRequestContent: '',
        toolRequestContact: '',
        selectedCategory: '',
        selectedPriority: 'medium',
        submittedRequests: requests.slice(0, 10)
      })

      wx.setClipboardData({
        data: mailBody,
        success: function() {
          wx.showModal({
            title: '✅ 需求已提交并发送到邮箱',
            content: '感谢您的宝贵建议！❤️\n\n📧 需求信息已自动复制到剪贴板\n\n请按以下步骤发送邮件给我们：\n\n1️⃣ 打开QQ邮箱网页版（mail.qq.com）\n2️⃣ 点击"写信"按钮\n3️⃣ 收件人填写：yhz123456718@qq.com\n4️⃣ 主题已准备好，直接粘贴\n5️⃣ 正文处粘贴完整内容\n6️⃣ 点击"发送" ✅\n\n我们会尽快评估并回复您！',
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#F59E0B'
          })
        },
        fail: function() {
          wx.showModal({
            title: '💾 需求已保存到本地',
            content: '您的需求已成功提交！\n\n由于剪贴板权限问题，请手动记录以下信息后发送邮件：\n\n📧 收件人：yhz123456718@qq.com\n📝 主题：【百宝工具箱】新工具需求 - ' + timeStr + '\n\n需求内容：\n' + toolRequestContent + '\n\n您可以在"我的-想增加什么工具"中查看已提交的需求记录。',
            showCancel: false,
            confirmText: '好的',
            confirmColor: '#F59E0B'
          })
        }
      })
    }, 800)
  },

  onShareAppMessage() {
    var appInstance = getApp()
    var poster = (appInstance.globalData && appInstance.globalData.sharePosterPath) || ''
    return {
      title: '🧰 百宝工具箱 - 24+实用小工具合集',
      path: '/pages/index/index',
      imageUrl: poster
    }
  },

  onShareTimeline() {
    var appInstance = getApp()
    var poster = (appInstance.globalData && appInstance.globalData.sharePosterPath) || ''
    return {
      title: '🧰 百宝工具箱 - 24+实用小工具，即用即走',
      query: '',
      imageUrl: poster
    }
  }
})