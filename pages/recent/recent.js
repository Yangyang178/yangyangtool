var app = getApp()
var toolsData = require('../../data/tools.js')
var checkin = require('../../utils/checkin.js')
var achievement = require('../../utils/achievement.js')
var storageUtil = require('../../utils/storage.js')
var logger = require('../../utils/logger.js')
var cloudSync = require('../../utils/cloud-sync.js')
var points = require('../../utils/points.js')
var perf = require('../../utils/perf.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    userInfo: { nickname: '微信用户', avatarUrl: '', avatarBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
    totalUsage: 0,

    checkinInfo: {
      isChecked: false,
      continuousDays: 0,
      cycleDay: 0,
      currentPoints: 0,
      totalEarned: 0,
      todayPoints: 0
    },

    achievementStats: {
      total: 15,
      unlocked: 0,
      percent: 0
    },
    achievementList: [],
    
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

    weeklyReport: {
      summary: '',
      topTools: [],
      compareLastWeek: '',
      checkinSummary: '',
      totalPoints: 0
    },
    
    recentTools: [],
    favoriteTools: [],
    favoritePreviewNames: '',
    isDarkMode: false,
    darkModeSetting: 'system',
    fontSizeSetting: 'medium',
    fontClass: '',
    fontName: '默认',
    showFontPicker: false,
    langSetting: 'zh',
    langName: '中文',
    showLangPicker: false,
    i18n: {},
    consecutiveDaysText: '',
    todayPointsText: '',
    totalEarnedText: '',
    totalSpentText: '',
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
      { value: 'bug', label: '🐛 问题反馈', zhLabel: '🐛 问题反馈', enLabel: '🐛 Bug Report' },
      { value: 'suggestion', label: '💡 功能建议', zhLabel: '💡 功能建议', enLabel: '💡 Feature Suggestion' },
      { value: 'other', label: '💬 其他', zhLabel: '💬 其他', enLabel: '💬 Other' }
    ],

    showAboutUs: false,

    showAchievementUnlock: false,
    unlockAnimation: {},
    unlockAchievement: null,

    showAchievementDetail: false,
    achievementDetailList: [],
    achievementFilter: 'all',

    showShareCard: false,
    shareCardData: null,
    showCheckinShareCard: false,
    checkinShareImagePath: '',

    showRankPanel: false,
    rankCategory: 'checkin',
    rankType: 'streak',
    rankList: [],
    myRank: -1,
    myRankData: null,
    rankLoading: false,

    openRankType: 'today',
    openRankList: [],
    openMyRank: -1,
    openMyRankData: null,
    openRankLoading: false,

    showToolRequest: false,
    toolRequestContent: '',
    toolRequestContact: '',
    selectedCategory: '',
    selectedPriority: 'medium',
    showDataManage: false,
    isBackingUp: false,
    isRestoring: false,
    cloudBackupInfo: { hasBackup: false, backupTime: '', keyCount: 0 },
    lastBackupTimeText: '',

    showDailyTasks: false,
    dailyTaskInfo: { tasks: [], allDone: false, bonusClaimed: false, bonusPoints: 20 },
    pointsSummary: { currentPoints: 0, totalEarned: 0, dailyTaskCompleted: 0, dailyTaskTotal: 4, dailyBonusClaimed: false, dailyAllDone: false, totalInvites: 0 },

    showPointsShop: false,
    shopItems: [],
    activeFrame: null,
    activeTheme: null,
    themeStyle: '',
    activeBadge: '',

    showFrameSelector: false,
    ownedFrames: [],
    previewFrame: null,

    showThemeSelector: false,
    ownedThemes: [],

    showBadgeSelector: false,
    ownedBadges: [],
    activeBadgeId: '',

    showInvitePanel: false,
    inviteInfo: { totalInvites: 0, totalPoints: 0, records: [] },
    myInviteCode: '',
    inviteCodeInput: '',

    showPerfPanel: false,
    perfSummary: null,
    storageInfo: null,
    storageBreakdown: null,
    isSubmittingUGC: false,
    submittedRequests: [],

    calDays: [],
    calYear: 0,
    calMonth: 0,
    calMonthName: '',
    calIsCurrent: true,
    _calYear: null,
    _calMonth: null,
    showCalendar: false,
    showAchievement: false,
    showRecentTools: false,
    showDesktopGuideModal: false,
    
    toolCategories: [
      { value: 'calculator', icon: '🧮', label: '计算转换', zhLabel: '计算转换', enLabel: 'Calculator' },
      { value: 'text', icon: '📝', label: '文本处理', zhLabel: '文本处理', enLabel: 'Text Tools' },
      { value: 'life', icon: '🏠', label: '生活助手', zhLabel: '生活助手', enLabel: 'Life Tools' },
      { value: 'datetime', icon: '⏰', label: '日期时间', zhLabel: '日期时间', enLabel: 'Date & Time' },
      { value: 'dev', icon: '💻', label: '开发调试', zhLabel: '开发调试', enLabel: 'Dev Tools' },
      { value: 'other', icon: '✨', label: '其他类型', zhLabel: '其他类型', enLabel: 'Other' }
    ],
    
    priorityLevels: [
      { value: 'low', icon: '😊', label: '一般', zhLabel: '一般', enLabel: 'Low' },
      { value: 'medium', icon: '💪', label: '需要', zhLabel: '需要', enLabel: 'Medium' },
      { value: 'high', icon: '🔥', label: '急需', zhLabel: '急需', enLabel: 'High' }
    ]
  },

  onLoad() {
    var tracker = getApp().tracker; tracker.pageView('profile')
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
    this.loadCheckinInfo()
    this.loadAchievements()
    this.checkNewAchievements()
    this.generateWeeklyReport()
    this.loadPointsData()
    this.loadPerfData()
    this.loadUsageStats()
    // 如果有签到记录，同步到云端排行榜
    if (checkin.isCheckedToday() || checkin.getContinuousDays() > 0) {
      this.reportCheckinToCloud()
    }
    var appInstance = getApp()
    if (appInstance) {
      var isDark = appInstance.globalData.isDarkMode || storageUtil.get('darkMode') === true
      var setting = storageUtil.get('darkModeSetting', 'system')
      this.setData({
        isDarkMode: isDark,
        darkModeSetting: setting
      })
      if (isDark) {
        wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0F172A' })
        wx.setTabBarStyle({ color: '#64748B', selectedColor: '#60A5FA', backgroundColor: '#1E293B', borderStyle: 'black' })
      } else {
        wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#F8FAFC' })
        wx.setTabBarStyle({ color: '#94A3B8', selectedColor: '#3B82F6', backgroundColor: '#FFFFFF', borderStyle: 'white' })
      }
    }
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var fontClass = points.getFontClass()
    var activeFont = points.getActiveFont()
    var langSetting = i18n.getLanguage()
    var allTexts = i18n.getAllTexts()
    var weekDayLabelsStr = i18n.t('weekDayLabels')
    var calWeekDays = weekDayLabelsStr.split(',')
    this.setData({
      fontClass: fontClass,
      fontName: activeFont ? i18n.t(activeFont.nameKey) : allTexts.defaultFont,
      langSetting: langSetting,
      langName: i18n.t('name'),
      i18n: allTexts,
      calWeekDays: calWeekDays
    })
    this._updateI18nData()
  },

  _updateI18nData: function() {
    var lang = i18n.getLanguage()
    var isEn = lang === 'en'
    var feedbackTypes = this.data.feedbackTypes
    var toolCategories = this.data.toolCategories
    var priorityLevels = this.data.priorityLevels
    var updatedFeedbackTypes = []
    for (var i = 0; i < feedbackTypes.length; i++) {
      var item = feedbackTypes[i]
      updatedFeedbackTypes.push({
        value: item.value,
        label: isEn ? item.enLabel : item.zhLabel,
        zhLabel: item.zhLabel,
        enLabel: item.enLabel
      })
    }
    var updatedToolCategories = []
    for (var j = 0; j < toolCategories.length; j++) {
      var cat = toolCategories[j]
      updatedToolCategories.push({
        value: cat.value,
        icon: cat.icon,
        label: isEn ? cat.enLabel : cat.zhLabel,
        zhLabel: cat.zhLabel,
        enLabel: cat.enLabel
      })
    }
    var updatedPriorityLevels = []
    for (var k = 0; k < priorityLevels.length; k++) {
      var pri = priorityLevels[k]
      updatedPriorityLevels.push({
        value: pri.value,
        icon: pri.icon,
        label: isEn ? pri.enLabel : pri.zhLabel,
        zhLabel: pri.zhLabel,
        enLabel: pri.enLabel
      })
    }
    this.setData({
      feedbackTypes: updatedFeedbackTypes,
      toolCategories: updatedToolCategories,
      priorityLevels: updatedPriorityLevels,
      lastBackupTimeText: cloudSync.formatBackupTime(cloudSync.getLastBackupTime())
    })
  },

  loadUserInfo() {
    var usageCount = storageUtil.get('totalUsageCount', 0)
    this.setData({ totalUsage: usageCount })

    var savedProfile = storageUtil.get('userProfile', {})
    if (savedProfile.nickname || savedProfile.avatarUrl || savedProfile.avatarBg) {
      this.setData({
        userInfo: {
          nickname: savedProfile.nickname || '微信用户',
          avatarUrl: savedProfile.avatarUrl || '',
          avatarBg: savedProfile.avatarBg || 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
        }
      })
    } else {
      this.setData({
        userInfo: {
          nickname: '微信用户',
          avatarUrl: '',
          avatarBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
        }
      })
    }
  },

  calculateFunStats() {
    var totalUsageCount = storageUtil.get('totalUsageCount', 0)

    var operationCount = totalUsageCount
    var savedTime = Math.round(totalUsageCount * 2.5)

    var efficiencyLevel = i18n.t('levelNovice')
    var levelIcon = '🌱'

    if (totalUsageCount >= 2000) {
      efficiencyLevel = i18n.t('levelMaster')
      levelIcon = '👑'
    } else if (totalUsageCount >= 1000) {
      efficiencyLevel = i18n.t('levelLegend')
      levelIcon = '🏆'
    } else if (totalUsageCount >= 500) {
      efficiencyLevel = i18n.t('levelAuthority')
      levelIcon = '💎'
    } else if (totalUsageCount >= 200) {
      efficiencyLevel = i18n.t('levelExpert')
      levelIcon = '⭐'
    } else if (totalUsageCount >= 100) {
      efficiencyLevel = i18n.t('levelProficient')
      levelIcon = '🔥'
    } else if (totalUsageCount >= 50) {
      efficiencyLevel = i18n.t('levelIntermediate')
      levelIcon = '🚀'
    } else if (totalUsageCount >= 20) {
      efficiencyLevel = i18n.t('levelBeginner')
      levelIcon = '📈'
    } else if (totalUsageCount >= 10) {
      efficiencyLevel = i18n.t('levelElementary')
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
        savedTime: i18n.t('savedMinutes', { count: savedTime }),
        efficiencyLevel: efficiencyLevel,
        levelIcon: levelIcon,
        progressPercent: progressPercent
      }
    })
  },

  loadWeeklyData() {
    var weeklyRecord = storageUtil.get('weeklyUsage', {})
    var today = new Date()
    var dayOfWeek = today.getDay()
    var monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    
    var weekDayLabelsStr = i18n.t('weekDayLabels')
    var labels = weekDayLabelsStr.split(',')
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
    
    var weeklyRecord = storageUtil.get('weeklyUsage', {})
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

  openFrameSelectorFromProfile() {
    this.setData({ showEditProfile: false })
    this.openFrameSelector()
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
        that._saveAvatarPermanently(tempPath, function(savedPath) {
          that.setData({ tempAvatarUrl: savedPath })
          wx.showToast({ title: i18n.t('avatarSelected'), icon: 'none', duration: 1500 })
        })
      },
      fail: function(err) {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: i18n.t('avatarChooseFail'), icon: 'none' })
        }
      }
    })
  },

  _saveAvatarPermanently: function(tempPath, callback) {
    try {
      var fs = wx.getFileSystemManager()
      var savedPath = wx.env.USER_DATA_PATH + '/avatar.png'
      fs.saveFile({
        tempFilePath: tempPath,
        filePath: savedPath,
        success: function() {
          if (callback) callback(savedPath)
        },
        fail: function() {
          if (callback) callback(tempPath)
        }
      })
    } catch(e) {
      if (callback) callback(tempPath)
    }
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
      wx.showToast({ title: i18n.t('enterNickname'), icon: 'none' })
      return
    }

    var profile = {
      nickname: nickname,
      avatarUrl: this.data.tempAvatarUrl,
      avatarBg: this.data.userInfo.avatarBg
    }

    storageUtil.safeSet('userProfile', profile)

    this.setData({
      showEditProfile: false,
      'userInfo.nickname': nickname,
      'userInfo.avatarUrl': this.data.tempAvatarUrl
    })

    wx.showToast({ title: i18n.t('profileSaved'), icon: 'success' })
  },

  loadRecentTools() {
    var recentTools = storageUtil.safeGetArray('recentTools')
    var formattedTools = []

    // 获取使用频率统计
    var usageMap = {}
    try {
      var tracker = getApp().tracker
      if (tracker && tracker.getToolUsageStats) {
        var stats = tracker.getToolUsageStats()
        for (var s = 0; s < stats.length; s++) {
          usageMap[stats[s].id] = stats[s]
        }
      }
    } catch(e) {}

    // 计算最大使用次数
    var maxCount = 1
    for (var ri = 0; ri < recentTools.length; ri++) {
      var tool = recentTools[ri]
      var usage = usageMap[tool.id]
      if (usage && usage.count > maxCount) maxCount = usage.count
    }

    for (var ri2 = 0; ri2 < recentTools.length; ri2++) {
      var tool2 = recentTools[ri2]
      var newTool = {}
      for (var key in tool2) {
        newTool[key] = tool2[key]
      }
      newTool.timeText = this.formatTime(tool2.usedAt)
      var usage2 = usageMap[tool2.id]
      newTool.useCount = usage2 ? usage2.count : 0
      newTool.usePercent = newTool.useCount > 0 ? Math.round(newTool.useCount / maxCount * 100) : 0
      formattedTools.push(newTool)
    }
    this.setData({ recentTools: i18n.translateTools(formattedTools) })
  },

  loadFavorites() {
    var favoriteIds = storageUtil.safeGetArray('favorites')
    var allTools = toolsData.tools

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

    var translatedFavTools = i18n.translateTools(favTools)
    var names = ''
    for (var ni = 0; ni < translatedFavTools.length; ni++) {
      if (ni > 0) names += ' · '
      names += translatedFavTools[ni].name
    }
    this.setData({
      favoriteTools: translatedFavTools,
      favoritePreviewNames: names
    })
  },

  formatTime(timestamp) {
    var now = new Date()
    var date = new Date(timestamp)
    var diff = now - date

    var minutes = Math.floor(diff / (1000 * 60))
    var hours = Math.floor(diff / (1000 * 60 * 60))
    var days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return i18n.t('justNow')
    if (minutes < 60) return i18n.t('minutesAgo', { count: minutes })
    if (hours < 24) return i18n.t('hoursAgo', { count: hours })
    if (days < 7) return i18n.t('daysAgo', { count: days })

    return i18n.t('monthDay', { month: date.getMonth() + 1, day: date.getDate() })
  },

  calculateCacheSize: function() {
    var that = this
    try {
      this.calculateDetailedCache()
    } catch (e) {
      logger.error('Calculate cache size error:', e)
      that.setData({ cacheSize: '未知' })
      wx.showToast({ title: '\u7F13\u5B58\u8BA1\u7B97\u5931\u8D25', icon: 'none', duration: 2000 })
      setTimeout(function() {
        wx.showModal({
          title: '\u26A0\uFE0F \u7F13\u5B58\u8BA1\u7B97\u5931\u8D25',
          content: '\u65E0\u6CD5\u83B7\u53D6\u7CBE\u786E\u7F13\u5B58\u5927\u5C0F\uFF0C\u662F\u5426\u91CD\u65B0\u8BA1\u7B97\uFF1F',
          confirmText: '\u91CD\u8BD5',
          cancelText: '\u53D6\u6D88',
          success: function(res) {
            if (res.confirm) {
              try {
                that.calculateDetailedCache()
                wx.showToast({ title: '\u91CD\u65B0\u8BA1\u7B97\u6210\u529F', icon: 'success' })
              } catch(e2) {
                wx.showToast({ title: '\u4ECD\u7136\u5931\u8D25', icon: 'none' })
              }
            }
          }
        })
      }, 2200)
    }
  },

  calculateDetailedCache() {
    try {
      var dataSize = 0
      var historyCount = 0
      var imageDataSize = 0

      var protectedKeys = ['_storage_migrated_v2', 'hasSeenGuide', 'guideVersion']

      var dataKeys = [
        'userProfile', 'userInfo', 'darkMode', 'darkModeSetting', 'fontSizeSetting',
        'customToolOrder', 'hiddenTools', 'favSortBy', 'searchHistory',
        'user_points', 'total_earned_points', 'daily_tasks', 'invite_records',
        'owned_shop_items', 'active_avatar_frame', 'active_theme_color',
        'checkin_records', 'tracker_openid', 'cachedRates',
        'remote_config_cache', 'remote_config_cache_time',
        'achievements_unlocked', 'achievements_progress',
        'errorLog', 'weeklyUsage', 'toolRequests'
      ]

      var historyKeys = [
        'recentTools', 'favorites', 'feedbackHistory', 'toolUsageLog',
        'totalUsageCount', 'ts_converter_history', 'json_formatter_history',
        'white_noise_state', 'danmaku_history', 'relative_call_history',
        'world_clock_cities', 'countdown_events', 'date_calc_history',
        'random_decision_history', 'random_decision_stats', 'garbage_history', 'water_records',
        'water_reminder_interval', 'water_reminder_last_time',
        'pomodoro_records', 'pomodoro_daily_goal', 'qr_history',
        'age_calc_history', 'ruler_calibration', 'ruler_cal_version',
        'whiteNoiseFavorites',
        'rulerMeasureRecords'
      ]

      for (var di = 0; di < dataKeys.length; di++) {
        try {
          var d = storageUtil.get(dataKeys[di])
          if (d !== '' && d !== undefined && d !== null) {
            dataSize += JSON.stringify(d).length * 2
          }
        } catch(e) {}
      }

      for (var hi = 0; hi < historyKeys.length; hi++) {
        try {
          var h = storageUtil.get(historyKeys[hi])
          if (h !== '' && h !== undefined && h !== null) {
            var hSize = JSON.stringify(h).length * 2
            dataSize += hSize
            if (Array.isArray(h)) {
              historyCount += h.length
            }
          }
        } catch(e) {}
      }

      var recentTools = storageUtil.safeGetArray('recentTools')
      if (!historyCount && recentTools.length) historyCount = recentTools.length

      var favorites = storageUtil.safeGetArray('favorites')
      historyCount += favorites.length

      try {
        var res = wx.getStorageInfoSync()
        for (var ai = 0; ai < res.keys.length; ai++) {
          var aKey = res.keys[ai]
          if (dataKeys.indexOf(aKey) === -1 && historyKeys.indexOf(aKey) === -1 && protectedKeys.indexOf(aKey) === -1) {
            try {
              var aData = wx.getStorageSync(aKey)
              if (aData !== '' && aData !== undefined && aData !== null) {
                var aSize = JSON.stringify(aData).length * 2
                dataSize += aSize
                if (aKey.indexOf('avatar') > -1 || aKey.indexOf('image') > -1 || aKey.indexOf('temp_') === 0) {
                  imageDataSize += aSize
                }
              }
            } catch(e) {}
          }
        }
      } catch(e) {}

      var displayTotal = this.formatSize(dataSize + imageDataSize)

      this.setData({
        cacheSize: displayTotal,
        cacheInfo: {
          total: displayTotal,
          data: this.formatSize(dataSize),
          images: this.formatSize(imageDataSize),
          history: historyCount + ' 条'
        }
      })
    } catch(e) {
      logger.error('calculateDetailedCache failed:', e)
      throw e
    }
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    var kb = Math.round(bytes / 1024)
    if (kb < 1024) return kb + ' KB'
    return (kb / 1024).toFixed(1) + ' MB'
  },

  checkDarkMode() {
    var setting = storageUtil.get('darkModeSetting', 'system')
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

    var currentCount = storageUtil.get('totalUsageCount', 0)
    storageUtil.safeSet('totalUsageCount', currentCount + 1)

    this.recordWeeklyUsage()
    this._reportToolUseToCloud()
    this._reportToolUsageRank(tool.id, tool.name, tool.icon)

    var targetUrl = toolsData.getRouteByToolId(tool.id)
    if (!targetUrl) {
      wx.showToast({ title: '工具路径不存在', icon: 'none' })
      return
    }

    wx.navigateTo({ url: targetUrl, fail: function() { wx.showToast({ title: '页面跳转失败', icon: 'none' }) } })
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

  toggleFontSize: function() {
    wx.vibrateShort({ type: 'light' })
    var sizes = ['small', 'medium', 'large']
    var labels = ['小', '中', '大']
    var currentIndex = 0
    for (var si = 0; si < sizes.length; si++) {
      if (sizes[si] === this.data.fontSizeSetting) { currentIndex = si; break }
    }
    var nextIndex = (currentIndex + 1) % sizes.length
    var newSetting = sizes[nextIndex]

    wx.setStorageSync('fontSizeSetting', newSetting)
    this.setData({ fontSizeSetting: newSetting })

    var app = getApp()
    if (app && app.globalData) {
      app.globalData.fontSizeSetting = newSetting
    }

    wx.showToast({ title: '字体: ' + labels[nextIndex], icon: 'none' })
  },

  openFontPicker: function() {
    wx.vibrateShort({ type: 'light' })
    var allItems = points.getShopItems()
    this._translateShopItems(allItems)
    var fontItems = []
    fontItems.push({
      id: 'default',
      name: i18n.t('defaultFont'),
      icon: '🔤',
      desc: i18n.t('defaultFontDesc'),
      isOwned: true,
      isActive: !points.getActiveFont()
    })
    for (var i = 0; i < allItems.length; i++) {
      var item = allItems[i]
      if (item.type !== 'font') continue
      fontItems.push({
        id: item.id,
        name: item.name,
        icon: item.icon,
        desc: item.desc,
        fontFamily: item.fontFamily,
        fontClass: item.fontClass,
        isOwned: item.isOwned,
        isActive: item.isActive
      })
    }
    this.setData({
      showFontPicker: true,
      fontPickerItems: fontItems
    })
  },

  closeFontPicker: function() {
    this.setData({ showFontPicker: false })
  },

  selectFont: function(e) {
    var fontId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })

    if (fontId === 'default') {
      points.deactivateItem('font')
      this.setData({
        fontClass: '',
        fontName: i18n.t('defaultFont'),
        showFontPicker: false
      })
      wx.showToast({ title: i18n.t('switchDefaultFont'), icon: 'none' })
      return
    }

    var owned = storageUtil.safeGetArray('owned_shop_items')
    var isOwned = false
    for (var k = 0; k < owned.length; k++) {
      if (owned[k] === fontId) { isOwned = true; break }
    }
    if (!isOwned) {
      wx.showToast({ title: i18n.t('buyFontFirst'), icon: 'none' })
      return
    }

    var result = points.activateItem(fontId)
    if (result.success) {
      var fontClass = points.getFontClass()
      var activeFont = points.getActiveFont()
      this.setData({
        fontClass: fontClass,
        fontName: activeFont ? i18n.t(activeFont.nameKey) : i18n.t('defaultFont'),
        showFontPicker: false
      })
      wx.showToast({ title: i18n.t('switchFont'), icon: 'success' })
    }
  },

  openLangPicker: function() {
    wx.vibrateShort({ type: 'light' })
    var langs = i18n.getLanguages()
    var currentLang = i18n.getLanguage()
    var items = []
    for (var i = 0; i < langs.length; i++) {
      items.push({
        id: langs[i].id,
        name: langs[i].name,
        icon: langs[i].icon,
        isActive: langs[i].id === currentLang
      })
    }
    this.setData({
      showLangPicker: true,
      langPickerItems: items
    })
  },

  closeLangPicker: function() {
    this.setData({ showLangPicker: false })
  },

  selectLang: function(e) {
    var langId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    if (langId === i18n.getLanguage()) {
      this.setData({ showLangPicker: false })
      return
    }
    i18n.setLanguage(langId)
    var allTexts = i18n.getAllTexts()
    var weekDayLabelsStr = i18n.t('weekDayLabels')
    var calWeekDays = weekDayLabelsStr.split(',')
    this.setData({
      langSetting: langId,
      langName: i18n.t('name'),
      i18n: allTexts,
      calWeekDays: calWeekDays,
      showLangPicker: false
    })
    this.loadRecentTools()
    this.loadFavorites()
    this.loadCheckinInfo()
    this.loadPointsData()
    this.calculateFunStats()
    this.loadWeeklyData()
    this._updateI18nData()
    wx.showToast({ title: allTexts.switchLanguage, icon: 'success' })
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
      content: '确定要清理所有数据吗？\n包括：最近使用、使用历史、搜索记录、图片缓存等\n（积分、签到、已购商品、收藏不会被删除）',
      confirmText: '全部清理',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var protectedKeys = [
            'user_points', 'total_earned_points', 'checkin_records',
            'daily_tasks', 'owned_shop_items', 'active_avatar_frame',
            'active_theme_color', 'unlocked_achievements', 'achievement_progress',
            'invite_records', 'my_invite_code', 'invited_by', 'pending_invite_rewards',
            'favorites', 'userInfo', 'userProfile',
            'darkMode', 'darkModeSetting', 'fontSizeSetting',
            'customToolOrder', 'hiddenTools', 'favSortBy',
            'tracker_openid', '_storage_migrated_v2', 'lastBackupTime',
            'rate_history',
            'account_book_records',
            'account_book_budget',
            'pomodoro_records',
            'pomodoro_daily_goal',
            'water_records',
            'water_cup_size',
            'water_reminder_interval',
            'color_favorites',
            'calculator_history',
            'calculator_favorites',
            'calculator_expressions',
            'unit_converter_favorites',
            'unit_converter_recent',
            'ipLookupHistory',
            'ipFavorites',
            'bmiHistory',
            'compassDirectionMarks',
            'whiteNoiseFavorites',
            'rulerMeasureRecords'
          ]
          var backup = {}
          for (var pi = 0; pi < protectedKeys.length; pi++) {
            try {
              var val = wx.getStorageSync(protectedKeys[pi])
              if (val !== '' && val !== undefined && val !== null) {
                backup[protectedKeys[pi]] = val
              }
            } catch(e) {}
          }
          wx.clearStorageSync()
          var backupKeys = Object.keys(backup)
          for (var bi = 0; bi < backupKeys.length; bi++) {
            try { wx.setStorageSync(backupKeys[bi], backup[backupKeys[bi]]) } catch(e) {}
          }
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
      content: '确定要清理历史记录吗？\n包括：最近使用、工具使用历史、反馈历史\n（收藏不会被删除）',
      confirmText: '清理',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var keysToRemove = [
            'recentTools', 'feedbackHistory', 'toolUsageLog', 'totalUsageCount',
            'ts_converter_history', 'json_formatter_history', 'danmaku_history',
            'relative_call_history', 'countdown_events', 'date_calc_history',
            'random_decision_history', 'random_decision_stats', 'garbage_history', 'qr_history',
            'age_calc_history', 'pomodoro_records'
          ]
          for (var kti = 0; kti < keysToRemove.length; kti++) {
            try { wx.removeStorageSync(keysToRemove[kti]) } catch(e) {}
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
      content: '确定要清空数据缓存吗？\n包括：搜索记录、远程配置缓存、错误日志等临时数据\n（积分、签到、已购商品等不会被删除）',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var keysToRemove = [
            'searchHistory', 'cachedRates',
            'remote_config_cache', 'remote_config_cache_time',
            'errorLog', 'weeklyUsage', 'toolRequests'
          ]
          for (var udi = 0; udi < keysToRemove.length; udi++) {
            try { wx.removeStorageSync(keysToRemove[udi]) } catch(e) {}
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
            var info = wx.getStorageInfoSync()
            for (var ik = 0; ik < info.keys.length; ik++) {
              var key = info.keys[ik]
              if (key.indexOf('avatar') > -1 || key.indexOf('image') > -1 || key.indexOf('temp_') === 0 || key.indexOf('cache_') === 0) {
                try { wx.removeStorageSync(key) } catch(e) {}
              }
            }
            var userInfo = that.data.userInfo
            if (userInfo) {
              userInfo.avatarUrl = ''
              try { wx.setStorageSync('userInfo', userInfo) } catch(e) {}
              that.setData({ userInfo: userInfo })
            }
            that.calculateDetailedCache()
            wx.showToast({ title: '图片缓存已清空', icon: 'success' })
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

  showNewUserGuide: function() {
    wx.vibrateShort({ type: 'light' })
    wx.removeStorageSync('hasSeenGuide')
    wx.removeStorageSync('guideVersion')
    wx.reLaunch({ url: '/pages/index/index' })
  },

  showAboutUs() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      showAboutUs: true
    })
  },

  closeAboutUs() {
    this.setData({ showAboutUs: false })
  },

  openPrivacy() {
    wx.vibrateShort({ type: 'light' })
    wx.navigateTo({ url: '/pages/privacy/privacy' })
  },

  copyWechat() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: 'y8849112640',
      success: function() {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        })
      }
    })
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
      var history = storageUtil.safeGetArray('feedbackHistory')
      history.unshift(feedbackData)
      if (history.length > 20) history = history.slice(0, 20)
      wx.setStorageSync('feedbackHistory', history)
    } catch(e) {}

    var appInstance = getApp()
    if (appInstance && typeof appInstance.cloudSyncFeedback === 'function') {
      appInstance.cloudSyncFeedback({
        content: feedbackContent,
        type: feedbackType,
        contact: contactInfo || '',
        device: deviceInfo,
        time: timeStr
      })
    }

    this.setData({ isSubmitting: true })

    var that = this

    if (appInstance && appInstance.globalData && appInstance.globalData.cloudReady) {
      wx.cloud.callFunction({
        name: 'sendEmail',
        data: {
          feedbackType: feedbackType,
          feedbackContent: feedbackContent,
          contactInfo: contactInfo || '',
          deviceInfo: deviceInfo
        },
        success: function(res) {
          logger.log('[反馈] 云函数调用成功')
        },
        fail: function(err) {
          logger.log('[反馈] 云函数调用失败:', (err && err.errMsg) || 'unknown')
        }
      })
    }

    setTimeout(function() {
      that.setData({ isSubmitting: false, showFeedback: false, feedbackContent: '', contactInfo: '' })
      wx.showModal({
        title: '提交成功 ✅',
        content: '感谢您的宝贵意见！\n\n我们已收到您的反馈，会尽快处理。',
        showCancel: false,
        confirmText: '我知道了'
      })
    }, 300)
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
      logger.log('获取菜单按钮位置失败', e)
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
    var requests = storageUtil.safeGetArray('toolRequests')
    this.setData({ submittedRequests: requests.slice(0, 10) })
  },

  loadCheckinInfo() {
    var isChecked = checkin.isCheckedToday()
    var continuousDays = checkin.getContinuousDays()
    var currentPoints = checkin.getCurrentPoints()
    var totalEarned = checkin.getTotalEarnedPoints()
    var totalDays = checkin.getTotalDays()
    // 当前周期天数：7天一循环
    var cycleDay = continuousDays % 7
    if (cycleDay === 0 && continuousDays > 0) cycleDay = 7
    // 今日可获积分（含宝箱预估）
    var todayPoints = 10
    if (!isChecked) {
      var nextCycleDay = cycleDay + 1
      if (nextCycleDay > 7) nextCycleDay = 1
      var bonus = 0
      if (nextCycleDay >= 2 && nextCycleDay <= 7) {
        bonus = [0, 0, 5, 10, 15, 20, 30, 50][nextCycleDay] || 0
      }
      todayPoints = 10 + bonus
    }
    // 补签卡和里程碑
    var makeupCards = checkin.getMakeupCards()
    var canMakeup = checkin.canMakeupYesterday()
    var milestones = checkin.getMilestones()
    this.setData({
      checkinInfo: {
        isChecked: isChecked,
        continuousDays: continuousDays,
        cycleDay: cycleDay,
        currentPoints: currentPoints,
        totalEarned: totalEarned,
        totalDays: totalDays,
        todayPoints: isChecked ? 0 : todayPoints
      },
      consecutiveDaysText: i18n.t('consecutiveDays', { days: continuousDays }),
      todayPointsText: '+' + todayPoints + i18n.t('pointsShort'),
      makeupCards: makeupCards,
      canMakeup: canMakeup,
      milestones: milestones
    })
    this._loadCheckinCalendar()
  },

  _loadCheckinCalendar: function() {
    var now = new Date()
    var year = now.getFullYear()
    var month = now.getMonth()
    var today = now.getDate()

    // 支持切换月份
    if (this.data._calYear != null && this.data._calMonth != null) {
      year = this.data._calYear
      month = this.data._calMonth
    }

    var firstDay = new Date(year, month, 1).getDay()
    if (firstDay === 0) firstDay = 7
    var daysInMonth = new Date(year, month + 1, 0).getDate()

    // 获取签到记录日期集合
    var records = checkin._getRecords()
    var checkedDates = {}
    for (var ri = 0; ri < records.length; ri++) {
      checkedDates[records[ri].date] = true
    }

    // 构建日历网格 7列 x 6行
    var calendarDays = []
    var dayNum = 1
    for (var row = 0; row < 6; row++) {
      for (var col = 0; col < 7; col++) {
        var cellIndex = row * 7 + col
        if (cellIndex < firstDay - 1 || dayNum > daysInMonth) {
          calendarDays.push({ day: 0, checked: false, isToday: false })
        } else {
          var mStr = (month + 1 < 10 ? '0' + (month + 1) : '' + (month + 1))
          var dStr = (dayNum < 10 ? '0' + dayNum : '' + dayNum)
          var dateStr = year + '-' + mStr + '-' + dStr
          calendarDays.push({
            day: dayNum,
            checked: !!checkedDates[dateStr],
            isToday: year === now.getFullYear() && month === now.getMonth() && dayNum === today
          })
          dayNum++
        }
      }
    }

    var monthNamesStr = i18n.t('monthNames')
    var monthNames = monthNamesStr.split(',')
    var isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

    this.setData({
      calYear: year,
      calMonth: month,
      calMonthName: monthNames[month],
      calDays: calendarDays,
      calIsCurrent: isCurrentMonth,
      _calYear: year,
      _calMonth: month
    })
  },

  toggleCalendar: function() {
    this.setData({ showCalendar: !this.data.showCalendar })
  },

  toggleAchievement: function() {
    this.setData({ showAchievement: !this.data.showAchievement })
  },

  toggleRecentTools: function() {
    this.setData({ showRecentTools: !this.data.showRecentTools })
  },

  showDesktopGuide: function() {
    var that = this
    if (typeof wx.addShortcut === 'function') {
      wx.addShortcut({
        success: function() {
          wx.showToast({ title: i18n.t('addDesktopSuccess'), icon: 'success' })
        },
        fail: function() {
          that.setData({ showDesktopGuideModal: true })
        }
      })
    } else {
      this.setData({ showDesktopGuideModal: true })
    }
  },

  closeDesktopGuide: function() {
    this.setData({ showDesktopGuideModal: false })
  },

  openMiniApp: function(e) {
    var appid = e.currentTarget.dataset.appid
    var name = e.currentTarget.dataset.name
    if (!appid) return
    wx.navigateToMiniProgram({
      appId: appid,
      fail: function() {
        wx.showToast({ title: '无法打开该小程序', icon: 'none' })
      }
    })
  },

  showMiniAppActions: function(e) {
    var appid = e.currentTarget.dataset.appid
    var name = e.currentTarget.dataset.name
    if (!appid) return
    var that = this
    wx.showActionSheet({
      itemList: ['打开「' + name + '」'],
      success: function(res) {
        if (res.tapIndex === 0) {
          that.openMiniApp(e)
        }
      }
    })
  },

  calPrevMonth: function() {
    var y = this.data.calYear
    var m = this.data.calMonth - 1
    if (m < 0) { m = 11; y-- }
    this.setData({ _calYear: y, _calMonth: m })
    this._loadCheckinCalendar()
  },

  calNextMonth: function() {
    var now = new Date()
    var y = this.data.calYear
    var m = this.data.calMonth + 1
    if (m > 11) { m = 0; y++ }
    // 不能超过当前月
    if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) return
    this.setData({ _calYear: y, _calMonth: m })
    this._loadCheckinCalendar()
  },

  doCheckin() {
    var result = checkin.checkin()
    if (result.success) {
      wx.vibrateShort({ type: 'heavy' })
      var tracker = getApp().tracker
      if (tracker) tracker.checkinAction(result.continuousDays, result.points)
      points.recordTaskProgress('checkin')
      this.loadCheckinInfo()
      this.loadPointsData()
      this.checkNewAchievements()
      this.generateWeeklyReport()
      this.reportCheckinToCloud(result)
      try { var appInst = getApp(); if (appInst && typeof appInst.autoBackup === 'function') appInst.autoBackup() } catch(e) {}
      // 构建签到结果内容
      var content = i18n.t('checkinBase') + result.basePoints
      if (result.bonus > 0) content += i18n.t('checkinBonus') + result.bonus
      content += '\n' + result.chest.icon + ' ' + result.chest.name + ' +' + result.chest.points
      content += '\n' + i18n.t('checkinTotal') + result.points + i18n.t('checkinPointsUnit')
      content += '\n' + i18n.t('checkinStreak') + result.continuousDays + i18n.t('checkinStreakUnit')
      // 宝箱掉落补签卡
      if (result.chest.makeupDrop) {
        content += '\n🎫 ' + i18n.t('makeupCardDrop')
      }
      // 里程碑提示
      if (result.newMilestones && result.newMilestones.length > 0) {
        for (var mi = 0; mi < result.newMilestones.length; mi++) {
          var ms = result.newMilestones[mi]
          content += '\n' + ms.icon + ' ' + i18n.t('milestoneUnlock') + ms.name + '！+' + ms.points + i18n.t('checkinPointsUnit')
        }
      }
      wx.showModal({
        title: i18n.t('checkinSuccessTitle'),
        content: content,
        showCancel: false,
        confirmText: i18n.t('checkinGreat'),
        confirmColor: '#3B82F6'
      })
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  loadAchievements() {
    var stats = achievement.getStats()
    var list = achievement.getAchievementList()
    this.setData({
      achievementStats: stats,
      achievementList: list.slice(0, 6)
    })
  },

  openAchievementDetail() {
    wx.vibrateShort({ type: 'light' })
    var list = achievement.getAchievementList()
    this.setData({
      showAchievementDetail: true,
      achievementDetailList: list,
      achievementFilter: 'all'
    })
  },

  closeAchievementDetail() {
    this.setData({ showAchievementDetail: false })
  },

  doMakeupCheckin() {
    if (!this.data.canMakeup) {
      wx.showToast({ title: i18n.t('makeupNoCard'), icon: 'none' })
      return
    }
    var self = this
    wx.showModal({
      title: i18n.t('makeupTitle'),
      content: i18n.t('makeupConfirm'),
      success: function(res) {
        if (!res.confirm) return
        var result = checkin.makeupCheckin()
        if (result.success) {
          wx.showToast({ title: i18n.t('makeupSuccess') + '+' + result.points, icon: 'none' })
          self.loadCheckinInfo()
          self.loadPointsData()
        } else {
          wx.showToast({ title: result.message, icon: 'none' })
        }
      }
    })
  },

  claimMilestone(e) {
    var days = e.currentTarget.dataset.days
    var result = checkin.claimMilestone(days)
    if (result.success) {
      wx.vibrateShort({ type: 'heavy' })
      wx.showToast({ title: result.milestone.icon + ' +' + result.points, icon: 'none', duration: 2000 })
      this.loadCheckinInfo()
      this.loadPointsData()
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  filterAchievements(e) {
    var filter = e.currentTarget.dataset.filter
    wx.vibrateShort({ type: 'light' })
    var list = achievement.getAchievementList()
    if (filter === 'unlocked') {
      var filtered = []
      for (var i = 0; i < list.length; i++) {
        if (list[i].unlocked) filtered.push(list[i])
      }
      list = filtered
    } else if (filter === 'locked') {
      var filtered2 = []
      for (var j = 0; j < list.length; j++) {
        if (!list[j].unlocked) filtered2.push(list[j])
      }
      list = filtered2
    }
    this.setData({
      achievementFilter: filter,
      achievementDetailList: list
    })
  },

  shareAchievement(e) {
    var achId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    var cardData = achievement.getShareCardData(achId)
    if (!cardData) {
      wx.showToast({ title: '该成就尚未解锁', icon: 'none' })
      return
    }
    this.setData({
      showShareCard: true,
      shareCardData: cardData
    })
  },

  closeShareCard() {
    this.setData({ showShareCard: false, shareCardData: null })
  },

  saveShareCard() {
    var that = this
    wx.showLoading({ title: '生成中...' })
    var query = wx.createSelectorQuery()
    query.select('#shareCardCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0]) {
          wx.hideLoading()
          wx.showToast({ title: '生成失败', icon: 'none' })
          return
        }

        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = 2
        canvas.width = 600 * dpr
        canvas.height = 400 * dpr
        ctx.scale(dpr, dpr)

        var cardData = that.data.shareCardData

        function drawRoundRect(cx, x, y, rw, rh, r) {
          cx.beginPath()
          cx.moveTo(x + r, y)
          cx.arcTo(x + rw, y, x + rw, y + rh, r)
          cx.arcTo(x + rw, y + rh, x, y + rh, r)
          cx.arcTo(x, y + rh, x, y, r)
          cx.arcTo(x, y, x + rw, y, r)
          cx.closePath()
        }

        var grad = ctx.createLinearGradient(0, 0, 600, 400)
        grad.addColorStop(0, '#667eea')
        grad.addColorStop(1, '#764ba2')
        ctx.fillStyle = grad
        drawRoundRect(ctx, 0, 0, 600, 400, 20)
        ctx.fill()

        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.beginPath()
        ctx.arc(500, 80, 120, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 64px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(cardData.icon, 300, 140)

        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(cardData.name, 300, 200)

        ctx.font = '18px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.fillText(cardData.desc, 300, 235)

        ctx.font = '14px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillText(cardData.nickname + '  |  ' + i18n.t('unlockedCountLabel') + ' ' + cardData.unlockedCount + '/' + cardData.totalCount, 300, 300)

        ctx.font = '12px sans-serif'
        ctx.fillText(i18n.t('brandTitle'), 300, 340)

        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        drawRoundRect(ctx, 200, 360, 200, 28, 14)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '11px sans-serif'
        ctx.fillText(i18n.t('longPressToOpen'), 300, 379)

        setTimeout(function() {
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: 600,
            height: 400,
            destWidth: 600 * dpr,
            destHeight: 400 * dpr,
            fileType: 'png',
            quality: 1,
            success: function(exportRes) {
              wx.hideLoading()
              wx.saveImageToPhotosAlbum({
                filePath: exportRes.tempFilePath,
                success: function() {
                  wx.showToast({ title: '已保存到相册', icon: 'success' })
                },
                fail: function() {
                  wx.showModal({
                    title: '提示',
                    content: '需要相册权限才能保存图片',
                    confirmText: '去设置',
                    success: function(modalRes) {
                      if (modalRes.confirm) wx.openSetting()
                    }
                  })
                }
              })
            },
            fail: function() {
              wx.hideLoading()
              wx.showToast({ title: '导出失败', icon: 'none' })
            }
          })
        }, 100)
      })
  },

  checkNewAchievements() {
    var newAch = achievement.syncFromStorage()
    if (newAch && newAch.length > 0) {
      this.loadAchievements()
      var ach = newAch[0]
      var tracker = getApp().tracker
      if (tracker) tracker.achievementUnlock(ach.id, ach.name)

      this.setData({
        showAchievementUnlock: true,
        unlockAchievement: ach,
        unlockAnimation: {
          scale: 0,
          opacity: 0,
          glowOpacity: 0,
          textOpacity: 0
        }
      })

      var self = this
      setTimeout(function() {
        self.setData({
          'unlockAnimation.scale': 1,
          'unlockAnimation.opacity': 1,
          'unlockAnimation.glowOpacity': 1
        })
      }, 100)

      setTimeout(function() {
        self.setData({ 'unlockAnimation.textOpacity': 1 })
      }, 400)

      setTimeout(function() {
        self.setData({ 'unlockAnimation.glowOpacity': 0 })
      }, 1500)

      setTimeout(function() {
        self.setData({ showAchievementUnlock: false, unlockAchievement: null })
      }, 3500)
    }
  },

  generateWeeklyReport() {
    var recentTools = storageUtil.safeGetArray('recentTools')
    var weeklyUsage = storageUtil.get('weeklyUsage', {})
    var today = new Date()
    var dayOfWeek = today.getDay()
    var thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    var lastMonday = new Date(thisMonday)
    lastMonday.setDate(thisMonday.getDate() - 7)

    var thisWeekCount = 0
    var lastWeekCount = 0
    for (var i = 0; i < 7; i++) {
      var thisDate = new Date(thisMonday)
      thisDate.setDate(thisMonday.getDate() + i)
      var thisKey = this._formatDateKey(thisDate)
      thisWeekCount += (weeklyUsage[thisKey] || 0)

      var lastDate = new Date(lastMonday)
      lastDate.setDate(lastMonday.getDate() + i)
      var lastKey = this._formatDateKey(lastDate)
      lastWeekCount += (weeklyUsage[lastKey] || 0)
    }

    var toolCountMap = {}
    var oneWeekAgo = today.getTime() - 7 * 24 * 3600000
    var usageLog = storageUtil.safeGetArray('toolUsageLog')
    for (var li = 0; li < usageLog.length; li++) {
      if (usageLog[li].usedAt && usageLog[li].usedAt >= oneWeekAgo) {
        var tid = usageLog[li].id
        toolCountMap[tid] = (toolCountMap[tid] || 0) + 1
      }
    }
    var topToolsArr = []
    for (var toolId in toolCountMap) {
      var toolInfo = toolsData.getToolById(parseInt(toolId, 10))
      if (toolInfo) {
        topToolsArr.push({ name: i18n.getToolName(toolInfo.id, toolInfo.name), icon: toolInfo.icon, count: toolCountMap[toolId] })
      }
    }
    topToolsArr.sort(function(a, b) { return b.count - a.count })
    topToolsArr = topToolsArr.slice(0, 3)

    var compareText = ''
    if (lastWeekCount === 0) {
      compareText = i18n.t('compareStarted')
    } else if (thisWeekCount > lastWeekCount) {
      var pct = Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      compareText = i18n.t('compareUp', { pct: pct })
    } else if (thisWeekCount < lastWeekCount) {
      var pct2 = Math.round(((lastWeekCount - thisWeekCount) / lastWeekCount) * 100)
      compareText = i18n.t('compareDown', { pct: pct2 })
    } else {
      compareText = i18n.t('compareSame')
    }

    var weekSummary = checkin.getWeekSummary()
    var continuousDays = checkin.getContinuousDays()
    var checkinText = ''
    if (continuousDays > 0) {
      checkinText = i18n.t('checkinSummaryStreak', { days: continuousDays, weekDays: weekSummary.days, points: weekSummary.points })
    } else if (weekSummary.days > 0) {
      checkinText = i18n.t('checkinSummaryWeek', { weekDays: weekSummary.days, points: weekSummary.points })
    } else {
      checkinText = i18n.t('checkinSummaryNone')
    }

    var summaryText = ''
    if (thisWeekCount === 0) {
      summaryText = i18n.t('weeklySummaryZero')
    } else if (thisWeekCount < 10) {
      summaryText = i18n.t('weeklySummaryLow', { count: thisWeekCount })
    } else if (thisWeekCount < 30) {
      summaryText = i18n.t('weeklySummaryMid', { count: thisWeekCount })
    } else {
      summaryText = i18n.t('weeklySummaryHigh', { count: thisWeekCount })
    }

    this.setData({
      weeklyReport: {
        summary: summaryText,
        topTools: topToolsArr,
        compareLastWeek: compareText,
        checkinSummary: checkinText,
        totalPoints: weekSummary.points
      }
    })
  },

  _formatDateKey(date) {
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    var d = date.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (d < 10 ? '0' + d : '' + d)
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

    var requests = storageUtil.safeGetArray('toolRequests')
    requests.unshift(requestData)
    
    if (requests.length > 20) {
      requests = requests.slice(0, 20)
    }
    
    wx.setStorageSync('toolRequests', requests)

    var priorityEmoji = selectedPriority === 'high' ? '🔥' : selectedPriority === 'medium' ? '💪' : '😊'
    var cName = categoryLabel ? categoryLabel.label : '未选择'
    var pName = priorityLabel ? priorityLabel.label : '需要'
    
    var mailBody = '\u00a0\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n  \ud83e\udde6 \u767e\u5b9d\u5de5\u5177\u7bb1 - \u65b0\u5de5\u5177\u9700\u6c42\u5efa\u8bae\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\r\n\ud83d\udccb \u9700\u6c42\u8be6\u60c5\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\u9700\u6c42\u63cf\u8ff0\uff1a' + toolRequestContent + '\r\n\r\n\u5de5\u5177\u7c7b\u578b\uff1a' + cName + '\r\n\u4f18\u5148\u7ea7\uff1a' + priorityEmoji + ' ' + pName + '\r\n\u8054\u7cfb\u65b9\u5f0f\uff1a' + (toolRequestContact || '\u6722\u586b\u5199') + '\r\n\r\n\u23f0 \u63d0\u4ea4\u65f6\u95f4\uff1a' + timeStr + '\r\n\r\n\ud83d\udcf1 \u8bbe\u5907\u4fe1\u606f\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\u8bbe\u5907\u578b\u53f7\uff1a' + wx.getSystemInfoSync().model + '\r\n\u5fae\u4fe1\u7248\u672c\uff1a' + wx.getSystemInfoSync().version + '\r\n\u7cfb\u7edf\u5e73\u53f0\uff1a' + wx.getSystemInfoSync().platform + '\r\n\u5c4f\u5e55\u5c3a\u5bf8\uff1a' + wx.getSystemInfoSync().windowWidth + '\u00d7' + wx.getSystemInfoSync().windowHeight + '\r\n\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r\n\u6765\u81ea\u767e\u5b9d\u5de5\u5177\u7bb1\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u7528\u6237\r\n\u90ae\u7bb1\u63a5\u6536\u65f6\u95f4\uff1a' + new Date().toLocaleString() + '\r\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'.trim()

    var appInstance = getApp()
    if (appInstance && typeof appInstance.cloudSyncFeedback === 'function') {
      appInstance.cloudSyncFeedback({
        content: toolRequestContent,
        type: 'tool_request',
        category: cName,
        priority: pName,
        contact: toolRequestContact || '',
        device: wx.getSystemInfoSync().model + ' / 微信' + wx.getSystemInfoSync().version,
        time: timeStr
      })
    }

    if (appInstance && appInstance.globalData && appInstance.globalData.cloudReady) {
      wx.cloud.callFunction({
        name: 'sendEmail',
        data: {
          feedbackType: 'tool_request',
          feedbackContent: '[工具需求] ' + cName + ' | ' + pName + '\n' + toolRequestContent,
          contactInfo: toolRequestContact || '',
          deviceInfo: wx.getSystemInfoSync().model + ' / 微信' + wx.getSystemInfoSync().version
        },
        success: function(res) {
          logger.log('[工具需求] 云函数调用成功')
        },
        fail: function(err) {
          logger.log('[工具需求] 云函数调用失败:', (err && err.errMsg) || 'unknown')
        }
      })
    }

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

      wx.showModal({
        title: '✅ 需求已提交',
        content: '感谢您的宝贵建议！❤️\n\n我们已收到您的工具需求，会尽快评估开发。',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#F59E0B'
      })
    }, 300)
  },

  openDataManage: function() {
    wx.vibrateShort({ type: 'light' })
    var lastTime = cloudSync.getLastBackupTime()
    var timeText = cloudSync.formatBackupTime(lastTime)
    this.setData({
      showDataManage: true,
      lastBackupTimeText: timeText
    })
    var that = this
    cloudSync.getBackupInfo(function(info) {
      that.setData({
        cloudBackupInfo: info,
        lastBackupTimeText: cloudSync.formatBackupTime(info.backupTime || lastTime)
      })
    })
  },

  closeDataManage: function() {
    this.setData({ showDataManage: false })
  },

  doBackup: function() {
    var that = this
    this.setData({ isBackingUp: true })
    cloudSync.backup(function(result) {
      that.setData({ isBackingUp: false })
      if (result.success) {
        that.setData({
          lastBackupTimeText: cloudSync.formatBackupTime(result.time),
          'cloudBackupInfo.hasBackup': true,
          'cloudBackupInfo.backupTime': result.time,
          'cloudBackupInfo.keyCount': result.keyCount
        })
        wx.showModal({
          title: '✅ ' + i18n.t('backupSuccessTitle'),
          content: i18n.t('backupSuccessContent', { count: result.keyCount, time: cloudSync.formatBackupTime(result.time) }),
          showCancel: false,
          confirmText: i18n.t('okay'),
          confirmColor: '#3B82F6'
        })
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    })
  },

  doRestore: function() {
    var that = this
    wx.showModal({
      title: '⚠️ ' + i18n.t('restoreDataTitle'),
      content: i18n.t('restoreDataContent'),
      confirmText: i18n.t('restore'),
      confirmColor: '#F59E0B',
      success: function(res) {
        if (res.confirm) {
          that.setData({ isRestoring: true })
          cloudSync.restore(function(result) {
            that.setData({ isRestoring: false })
            if (result.success) {
              wx.showModal({
                title: '✅ ' + i18n.t('restoreSuccessTitle'),
                content: i18n.t('restoreSuccessContent', { count: result.keyCount, time: cloudSync.formatBackupTime(result.backupTime) }),
                showCancel: false,
                confirmText: i18n.t('refreshPage'),
                confirmColor: '#3B82F6',
                success: function() {
                  that.loadAllData()
                }
              })
            } else {
              wx.showToast({ title: result.message, icon: 'none' })
            }
          })
        }
      }
    })
  },

  loadPointsData: function() {
    var inviteResult = points.checkInviteRewards()
    if (inviteResult.count > 0) {
      this.loadCheckinInfo()
      wx.showModal({
        title: i18n.t('inviteRewardTitle'),
        content: i18n.t('inviteRewardContent', { count: inviteResult.count, points: inviteResult.points }),
        showCancel: false,
        confirmText: i18n.t('great'),
        confirmColor: '#3B82F6'
      })
    }
    points._checkCloudInviteRewards()
    var summary = points.getPointsSummary()
    var taskInfo = points.getDailyTasks()
    var shopItems = points.getShopItems()
    this._translateTaskInfo(taskInfo)
    this._translateShopItems(shopItems)
    var activeFrame = points.getActiveFrame()
    var activeTheme = points.getActiveTheme()
    var themeStyle = points.getThemeStyle()
    var activeBadge = points.getActiveBadge()
    this.setData({
      pointsSummary: summary,
      dailyTaskInfo: taskInfo,
      shopItems: shopItems,
      activeFrame: activeFrame,
      activeTheme: activeTheme,
      themeStyle: themeStyle,
      activeBadge: activeBadge,
      totalEarnedText: i18n.t('totalEarned', { points: summary.totalEarned }),
      totalSpentText: i18n.t('totalSpent', { points: summary.totalSpent })
    })
  },

  loadUsageStats: function() {
    try {
      var tracker = getApp().tracker
      if (!tracker || !tracker.getToolUsageStats) return
      var stats = tracker.getToolUsageStats()
      var topTools = stats.slice(0, 8)
      var maxCount = 1
      for (var i = 0; i < topTools.length; i++) {
        if (topTools[i].count > maxCount) maxCount = topTools[i].count
      }
      for (var j = 0; j < topTools.length; j++) {
        topTools[j].percent = Math.round(topTools[j].count / maxCount * 100)
        if (!topTools[j].icon) topTools[j].icon = '🔧'
        if (!topTools[j].name) topTools[j].name = topTools[j].id
      }
      this.setData({ usageTopTools: topTools })
    } catch(e) {
      this.setData({ usageTopTools: [] })
    }
  },

  openDailyTasks: function() {
    wx.vibrateShort({ type: 'light' })
    var taskInfo = points.getDailyTasks()
    this._translateTaskInfo(taskInfo)
    this.setData({ showDailyTasks: true, dailyTaskInfo: taskInfo })
  },

  closeDailyTasks: function() {
    this.setData({ showDailyTasks: false })
  },

  claimDailyBonus: function() {
    wx.vibrateShort({ type: 'medium' })
    var result = points.claimDailyBonus()
    if (result.success) {
      this.loadPointsData()
      this.loadCheckinInfo()
      wx.showModal({
        title: i18n.t('dailyBonusTitle'),
        content: i18n.t('dailyBonusContent', { points: result.points }),
        showCancel: false,
        confirmText: i18n.t('great'),
        confirmColor: '#3B82F6'
      })
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  openPointsShop: function() {
    wx.vibrateShort({ type: 'light' })
    var shopItems = points.getShopItems()
    this._translateShopItems(shopItems)
    this.setData({ showPointsShop: true, shopItems: shopItems })
  },

  closePointsShop: function() {
    this.setData({ showPointsShop: false })
  },

  purchaseItem: function(e) {
    var itemId = e.currentTarget.dataset.id
    var item = null
    var allItems = this.data.shopItems
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].id === itemId) { item = allItems[i]; break }
    }
    if (!item) return
    if (item.isOwned && item.type === 'frame') {
      this.closePointsShop()
      this.openFrameSelector()
      return
    }
    if (item.isOwned) {
      var actResult = points.activateItem(itemId)
      if (actResult.success) {
        wx.vibrateShort({ type: 'light' })
        this.loadPointsData()
        wx.showToast({ title: i18n.t('activated'), icon: 'success' })
      }
      return
    }
    var that = this
    wx.showModal({
      title: i18n.t('purchaseConfirmTitle'),
      content: i18n.t('purchaseConfirmContent', { icon: item.icon, name: item.name, price: item.price, balance: checkin.getCurrentPoints() }),
      confirmText: i18n.t('buy'),
      confirmColor: '#3B82F6',
      success: function(res) {
        if (res.confirm) {
          wx.vibrateShort({ type: 'medium' })
          var result = points.purchaseItem(itemId)
          if (result.success) {
            that.loadPointsData()
            that.loadCheckinInfo()
            var newThemeStyle = points.getThemeStyle()
            that.setData({ themeStyle: newThemeStyle })
            wx.showModal({
              title: i18n.t('purchaseSuccessTitle'),
              content: i18n.t('purchaseSuccessContent', { icon: item.icon, name: item.name }),
              showCancel: false,
              confirmText: i18n.t('okay'),
              confirmColor: '#3B82F6'
            })
          } else {
            wx.showToast({ title: result.message, icon: 'none' })
          }
        }
      }
    })
  },

  deactivateItem: function(e) {
    var type = e.currentTarget.dataset.type
    wx.vibrateShort({ type: 'light' })
    points.deactivateItem(type)
    this.loadPointsData()
    this.loadCheckinInfo()
    var themeStyle = points.getThemeStyle()
    this.setData({ themeStyle: themeStyle })
    wx.showToast({ title: i18n.t('deactivated'), icon: 'none' })
  },

  activateItem: function(e) {
    var itemId = e.currentTarget.dataset.id
    if (!itemId) return
    wx.vibrateShort({ type: 'light' })
    var result = points.activateItem(itemId)
    if (result.success) {
      this.loadPointsData()
      this.loadCheckinInfo()
      var themeStyle = points.getThemeStyle()
      this.setData({ themeStyle: themeStyle })
      wx.showToast({ title: i18n.t('activated'), icon: 'success' })
    } else {
      wx.showToast({ title: result.message || i18n.t('activateFailed'), icon: 'none' })
    }
  },

  openFrameSelector: function() {
    wx.vibrateShort({ type: 'light' })
    var owned = points.getOwnedFrames()
    this._translateShopItems(owned)
    var activeFrame = points.getActiveFrame()
    if (activeFrame) {
      var tmpArr = [activeFrame]
      this._translateShopItems(tmpArr)
      activeFrame = tmpArr[0]
    }
    this.setData({
      showFrameSelector: true,
      ownedFrames: owned,
      previewFrame: activeFrame
    })
  },

  closeFrameSelector: function() {
    this.setData({ showFrameSelector: false })
  },

  selectFrame: function(e) {
    var itemId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    if (itemId === '') {
      points.deactivateItem('frame')
      this.setData({
        activeFrame: null,
        previewFrame: null
      })
      wx.showToast({ title: i18n.t('badgeDeactivated'), icon: 'none' })
    } else {
      var result = points.activateItem(itemId)
      if (result.success) {
        var activeFrame = points.getActiveFrame()
        if (activeFrame) {
          var tmpArr2 = [activeFrame]
          this._translateShopItems(tmpArr2)
          activeFrame = tmpArr2[0]
        }
        this.setData({
          activeFrame: activeFrame,
          previewFrame: activeFrame
        })
        wx.showToast({ title: '已佩戴', icon: 'success' })
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    }
  },

  goToShopFromSelector: function() {
    this.setData({ showFrameSelector: false })
    var shopItems = points.getShopItems()
    this._translateShopItems(shopItems)
    this.setData({ showPointsShop: true, shopItems: shopItems })
  },

  goToShopFromThemeSelector: function() {
    this.setData({ showThemeSelector: false })
    var shopItems = points.getShopItems()
    this._translateShopItems(shopItems)
    this.setData({ showPointsShop: true, shopItems: shopItems })
  },

  goToShopFromBadgeSelector: function() {
    this.setData({ showBadgeSelector: false })
    var shopItems = points.getShopItems()
    this._translateShopItems(shopItems)
    this.setData({ showPointsShop: true, shopItems: shopItems })
  },

  openThemeSelector: function() {
    wx.vibrateShort({ type: 'light' })
    var owned = points.getOwnedThemes()
    this._translateShopItems(owned)
    var activeTheme = points.getActiveTheme()
    if (activeTheme) {
      var tmpArr = [activeTheme]
      this._translateShopItems(tmpArr)
      activeTheme = tmpArr[0]
    }
    this.setData({
      showThemeSelector: true,
      ownedThemes: owned,
      activeTheme: activeTheme
    })
  },

  closeThemeSelector: function() {
    this.setData({ showThemeSelector: false })
  },

  selectTheme: function(e) {
    var itemId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    if (itemId === '') {
      points.deactivateItem('theme')
      this.setData({
        activeTheme: null,
        themeStyle: ''
      })
      wx.showToast({ title: i18n.t('resetDefault'), icon: 'none' })
    } else {
      var result = points.activateItem(itemId)
      if (result.success) {
        var activeTheme = points.getActiveTheme()
        var themeStyle = points.getThemeStyle()
        if (activeTheme) {
          var tmpArr2 = [activeTheme]
          this._translateShopItems(tmpArr2)
          activeTheme = tmpArr2[0]
        }
        this.setData({
          activeTheme: activeTheme,
          themeStyle: themeStyle
        })
        wx.showToast({ title: i18n.t('switchThemeColor'), icon: 'success' })
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    }
  },

  openBadgeSelector: function() {
    wx.vibrateShort({ type: 'light' })
    var owned = points.getOwnedBadges()
    this._translateShopItems(owned)
    var activeFrame = points.getActiveFrame()
    var activeBadgeId = ''
    if (activeFrame && activeFrame.type === 'badge') {
      activeBadgeId = activeFrame.id
    }
    this.setData({
      showBadgeSelector: true,
      ownedBadges: owned,
      activeBadgeId: activeBadgeId
    })
  },

  closeBadgeSelector: function() {
    this.setData({ showBadgeSelector: false })
  },

  selectBadge: function(e) {
    var itemId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    if (itemId === '') {
      points.deactivateItem('badge')
      this.setData({
        activeBadge: '',
        activeBadgeId: ''
      })
      wx.showToast({ title: i18n.t('badgeDeactivated'), icon: 'none' })
    } else {
      var result = points.activateItem(itemId)
      if (result.success) {
        var activeBadge = points.getActiveBadge()
        this.setData({
          activeBadge: activeBadge,
          activeBadgeId: itemId
        })
        wx.showToast({ title: i18n.t('badgeActivated'), icon: 'success' })
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    }
  },

  chooseAvatarFromSelector: function() {
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        var tempPath = res.tempFiles[0].tempFilePath
        that._saveAvatarPermanently(tempPath, function(savedPath) {
          var info = that.data.userInfo
          info.avatarUrl = savedPath
          storageUtil.safeSet('userProfile', {
            nickname: info.nickname,
            avatarUrl: savedPath,
            avatarBg: info.avatarBg
          })
          that.setData({ userInfo: info })
          wx.showToast({ title: i18n.t('avatarChanged'), icon: 'success' })
        })
      },
      fail: function(err) {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: i18n.t('avatarChooseFail'), icon: 'none' })
        }
      }
    })
  },

  openInvitePanel: function() {
    wx.vibrateShort({ type: 'light' })
    var inviteInfo = points.getInviteInfo()
    var myCode = points.getMyInviteCode()
    var inviteStatsText = i18n.t('inviteStatsTitle', { totalInvites: inviteInfo.totalInvites, totalPoints: inviteInfo.totalPoints })
    this.setData({
      showInvitePanel: true,
      inviteInfo: inviteInfo,
      myInviteCode: myCode,
      inviteCodeInput: '',
      inviteStatsText: inviteStatsText
    })
  },

  closeInvitePanel: function() {
    this.setData({ showInvitePanel: false })
  },

  onInviteCodeInput: function(e) {
    this.setData({ inviteCodeInput: e.detail.value.trim() })
  },

  useInviteCode: function() {
    var code = this.data.inviteCodeInput
    if (!code) {
      wx.showToast({ title: i18n.t('enterInviteCode'), icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'medium' })
    var result = points.recordInvite(code)
    if (result.success) {
      this.loadPointsData()
      this.loadCheckinInfo()
      wx.showModal({
        title: i18n.t('inviteCodeSuccessTitle'),
        content: i18n.t('inviteCodeRewardContent', { points: result.points }),
        showCancel: false,
        confirmText: i18n.t('great'),
        confirmColor: '#3B82F6'
      })
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  copyInviteCode: function() {
    wx.vibrateShort({ type: 'light' })
    var code = this.data.myInviteCode
    wx.setClipboardData({
      data: code,
      success: function() {
        wx.showToast({ title: i18n.t('inviteCodeCopied'), icon: 'success' })
      }
    })
  },

  loadPerfData: function() {
    var storageInfo = perf.getStorageInfo()
    this.setData({ storageInfo: storageInfo })
  },

  openPerfPanel: function() {
    wx.vibrateShort({ type: 'light' })
    var summary = perf.getPerfSummary()
    var breakdown = perf.getStorageBreakdown()
    this.setData({
      showPerfPanel: true,
      perfSummary: summary,
      storageInfo: summary.storageInfo,
      storageBreakdown: breakdown
    })
  },

  closePerfPanel: function() {
    this.setData({ showPerfPanel: false })
  },

  clearPerfRecords: function() {
    wx.vibrateShort({ type: 'light' })
    perf.clearPerfRecords()
    var summary = perf.getPerfSummary()
    var breakdown = perf.getStorageBreakdown()
    this.setData({
      perfSummary: summary,
      storageBreakdown: breakdown
    })
    wx.showToast({ title: '性能记录已清除', icon: 'success' })
  },

  _translateTaskInfo: function(taskInfo) {
    if (!taskInfo || !taskInfo.tasks) return
    var TASK_NAME_KEYS = {
      checkin: 'taskCheckin',
      use_tools: 'taskUseTools3',
      use_tools_5: 'taskUseTools5',
      share_once: 'taskShareOnce',
      fun_challenge: 'taskFunChallenge'
    }
    var TASK_DESC_KEYS = {
      checkin: 'taskCheckinDesc',
      use_tools: 'taskUseTools3Desc',
      use_tools_5: 'taskUseTools5Desc',
      share_once: 'taskShareOnceDesc',
      fun_challenge: 'taskFunChallengeDesc'
    }
    for (var i = 0; i < taskInfo.tasks.length; i++) {
      var taskId = taskInfo.tasks[i].id
      if (TASK_NAME_KEYS[taskId]) {
        taskInfo.tasks[i].name = i18n.t(TASK_NAME_KEYS[taskId])
      }
      if (TASK_DESC_KEYS[taskId]) {
        taskInfo.tasks[i].desc = i18n.t(TASK_DESC_KEYS[taskId])
      }
    }
  },

  _translateShopItems: function(shopItems) {
    if (!shopItems || !shopItems.length) return
    var SHOP_NAME_KEYS = {
      frame_gold: 'shopFrameGold',
      frame_diamond: 'shopFrameDiamond',
      frame_rainbow: 'shopFrameRainbow',
      theme_rose: 'shopThemeRose',
      theme_emerald: 'shopThemeEmerald',
      theme_amber: 'shopThemeAmber',
      theme_violet: 'shopThemeViolet',
      theme_sunset: 'shopThemeSunset',
      theme_aurora: 'shopThemeAurora',
      theme_sakura: 'shopThemeSakura',
      theme_ocean: 'shopThemeOcean',
      theme_forest: 'shopThemeForest',
      theme_lavender: 'shopThemeLavender',
      theme_fire: 'shopThemeFire',
      theme_night: 'shopThemeNight',
      badge_pioneer: 'shopBadgePioneer',
      badge_master: 'shopBadgeMaster',
      font_kai: 'shopFontKai',
      font_song: 'shopFontSong',
      font_fang: 'shopFontFang',
      font_round: 'shopFontRound',
      font_hei: 'shopFontHei'
    }
    var SHOP_DESC_KEYS = {
      frame_gold: 'shopFrameGoldDesc',
      frame_diamond: 'shopFrameDiamondDesc',
      frame_rainbow: 'shopFrameRainbowDesc',
      theme_rose: 'shopThemeRoseDesc',
      theme_emerald: 'shopThemeEmeraldDesc',
      theme_amber: 'shopThemeAmberDesc',
      theme_violet: 'shopThemeVioletDesc',
      theme_sunset: 'shopThemeSunsetDesc',
      theme_aurora: 'shopThemeAuroraDesc',
      theme_sakura: 'shopThemeSakuraDesc',
      theme_ocean: 'shopThemeOceanDesc',
      theme_forest: 'shopThemeForestDesc',
      theme_lavender: 'shopThemeLavenderDesc',
      theme_fire: 'shopThemeFireDesc',
      theme_night: 'shopThemeNightDesc',
      badge_pioneer: 'shopBadgePioneerDesc',
      badge_master: 'shopBadgeMasterDesc',
      font_kai: 'shopFontKaiDesc',
      font_song: 'shopFontSongDesc',
      font_fang: 'shopFontFangDesc',
      font_round: 'shopFontRoundDesc',
      font_hei: 'shopFontHeiDesc'
    }
    for (var i = 0; i < shopItems.length; i++) {
      var itemId = shopItems[i].id
      if (SHOP_NAME_KEYS[itemId]) {
        shopItems[i].name = i18n.t(SHOP_NAME_KEYS[itemId])
      }
      if (SHOP_DESC_KEYS[itemId]) {
        shopItems[i].desc = i18n.t(SHOP_DESC_KEYS[itemId])
      }
    }
  },

  // 上报签到数据到云数据库
  reportCheckinToCloud: function(result) {
    try {
      var continuousDays = result ? result.continuousDays : checkin.getContinuousDays()
      var totalEarned = checkin.getTotalEarnedPoints()
      var records = checkin._getRecords()
      var today = checkin.getToday()
      var profile = storageUtil.get('userProfile', {})
      var nickName = profile.nickname || ''
      var avatarUrl = profile.avatarUrl || ''
      wx.cloud.callFunction({
        name: 'checkinRank',
        data: {
          action: 'report',
          continuousDays: continuousDays,
          totalDays: records.length,
          totalPoints: totalEarned,
          lastCheckinDate: today,
          nickName: nickName,
          avatarUrl: avatarUrl
        },
        fail: function() {}
      })
    } catch(e) {}
  },

  // 加载排行榜
  loadCheckinRank: function() {
    var that = this
    this.setData({ rankLoading: true })
    try {
      wx.cloud.callFunction({
        name: 'checkinRank',
        data: {
          action: 'getRank',
          type: that.data.rankType || 'streak',
          limit: 20
        },
        success: function(res) {
          if (res.result && res.result.success) {
            that.setData({
              rankList: res.result.rankList || [],
              myRank: res.result.myRank || -1,
              myRankData: res.result.myData || null,
              rankLoading: false
            })
          } else {
            that.setData({ rankLoading: false, rankList: [] })
          }
        },
        fail: function() {
          that.setData({ rankLoading: false, rankList: [] })
        }
      })
    } catch(e) {
      this.setData({ rankLoading: false })
    }
  },

  toggleRankPanel: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showRankPanel
    this.setData({ showRankPanel: show, rankCategory: 'checkin' })
    if (show) {
      this.loadCheckinRank()
    }
  },

  switchRankCategory: function(e) {
    var cat = e.currentTarget.dataset.cat
    this.setData({ rankCategory: cat })
    if (cat === 'checkin') {
      this.loadCheckinRank()
    } else if (cat === 'open') {
      this.loadOpenRank()
    }
  },

  switchRankType: function(e) {
    var type = e.currentTarget.dataset.type
    this.setData({ rankType: type })
    this.loadCheckinRank()
  },

  // 上报工具使用到开榜（每次使用工具也计数）
  _reportToolUseToCloud: function() {
    try {
      var profile = storageUtil.get('userProfile', {})
      wx.cloud.callFunction({
        name: 'updateOpenStats',
        data: {
          action: 'report',
          nickName: profile.nickname || '',
          avatarUrl: profile.avatarUrl || ''
        },
        fail: function() {}
      })
    } catch(e) {}
  },

  // 开榜相关
  loadOpenRank: function() {
    var that = this
    this.setData({ openRankLoading: true })
    try {
      wx.cloud.callFunction({
        name: 'updateOpenStats',
        data: {
          action: 'getRank',
          type: that.data.openRankType || 'today',
          limit: 10
        },
        success: function(res) {
          if (res.result && res.result.success) {
            that.setData({
              openRankList: res.result.rankList || [],
              openMyRank: res.result.myRank || -1,
              openMyRankData: res.result.myData || null,
              openRankLoading: false
            })
          } else {
            that.setData({ openRankLoading: false, openRankList: [] })
          }
        },
        fail: function() {
          that.setData({ openRankLoading: false, openRankList: [] })
        }
      })
    } catch(e) {
      this.setData({ openRankLoading: false })
    }
  },

  switchOpenRankType: function(e) {
    var type = e.currentTarget.dataset.type
    this.setData({ openRankType: type })
    this.loadOpenRank()
  },

  // 上报工具使用排行
  _reportToolUsageRank: function(toolId, toolName, toolIcon) {
    // 本地即时计数
    try {
      var localUsage = storageUtil.get('toolLocalUsage') || {}
      localUsage[toolId] = (localUsage[toolId] || 0) + 1
      var todayStr = new Date().toISOString().split('T')[0]
      var lastDate = storageUtil.get('toolLocalUsageDate') || ''
      if (lastDate !== todayStr) {
        localUsage = {}
        localUsage[toolId] = 1
        storageUtil.safeSet('toolLocalUsageDate', todayStr)
      }
      storageUtil.safeSet('toolLocalUsage', localUsage)
    } catch(e) {}
    // 异步上报云端
    try {
      wx.cloud.callFunction({
        name: 'toolRank',
        data: {
          action: 'report',
          toolId: toolId,
          toolName: toolName || '',
          toolIcon: toolIcon || ''
        },
        success: function() {
          try {
            var lu = storageUtil.get('toolLocalUsage') || {}
            delete lu[toolId]
            storageUtil.safeSet('toolLocalUsage', lu)
          } catch(e) {}
        },
        fail: function() {}
      })
    } catch(e) {}
  },

  // 分享签到成就卡片
  shareCheckinCard: function() {
    var continuousDays = checkin.getContinuousDays()
    var totalEarned = checkin.getTotalEarnedPoints()
    var isChecked = checkin.isCheckedToday()
    if (!isChecked && continuousDays === 0) {
      wx.showToast({ title: i18n.t('checkinFirst'), icon: 'none' })
      return
    }
    this.setData({ showCheckinShareCard: true, checkinShareImagePath: '' })
    var that = this
    // 弹窗渲染后绘制canvas并导出图片路径供分享使用
    setTimeout(function() {
      that._drawCheckinShareCanvas(function(imagePath) {
        if (imagePath) {
          that.setData({ checkinShareImagePath: imagePath })
        }
      })
    }, 300)
  },

  closeCheckinShareCard: function() {
    this.setData({ showCheckinShareCard: false })
  },

  saveCheckinShareCard: function() {
    var that = this
    // 如果已有缓存的图片路径，直接保存
    if (that.data.checkinShareImagePath) {
      wx.showLoading({ title: '保存中...' })
      wx.saveImageToPhotosAlbum({
        filePath: that.data.checkinShareImagePath,
        success: function() {
          wx.hideLoading()
          wx.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: function() {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '需要相册权限才能保存图片',
            confirmText: '去设置',
            success: function(modalRes) {
              if (modalRes.confirm) wx.openSetting()
            }
          })
        }
      })
      return
    }
    wx.showLoading({ title: '生成中...' })
    that._drawCheckinShareCanvas(function(imagePath) {
      if (imagePath) {
        that.setData({ checkinShareImagePath: imagePath })
        wx.hideLoading()
        wx.saveImageToPhotosAlbum({
          filePath: imagePath,
          success: function() {
            wx.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: function() {
            wx.showModal({
              title: '提示',
              content: '需要相册权限才能保存图片',
              confirmText: '去设置',
              success: function(modalRes) {
                if (modalRes.confirm) wx.openSetting()
              }
            })
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({ title: '生成失败', icon: 'none' })
      }
    })
  },

  _drawCheckinShareCanvas: function(callback) {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#checkinShareCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0]) {
          callback && callback('')
          return
        }
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var w = 600
        var h = 420
        canvas.width = w
        canvas.height = h

        var info = that.data.checkinInfo
        var continuousDays = info ? info.continuousDays : 0
        var totalEarned = info ? info.totalEarned : 0
        var isChecked = info ? info.isChecked : false

        function drawRoundRect(cx, x, y, rw, rh, r) {
          cx.beginPath()
          cx.moveTo(x + r, y)
          cx.arcTo(x + rw, y, x + rw, y + rh, r)
          cx.arcTo(x + rw, y + rh, x, y + rh, r)
          cx.arcTo(x, y + rh, x, y, r)
          cx.arcTo(x, y, x + rw, y, r)
          cx.closePath()
        }

        var grad = ctx.createLinearGradient(0, 0, w, h)
        grad.addColorStop(0, '#f59e0b')
        grad.addColorStop(1, '#d97706')
        ctx.fillStyle = grad
        drawRoundRect(ctx, 0, 0, w, h, 20)
        ctx.fill()

        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.beginPath()
        ctx.arc(520, 60, 100, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(80, 360, 80, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('🧰 百宝工具箱', w / 2, 50)

        ctx.font = '16px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.fillText(i18n.t('shareCardTitle'), w / 2, 80)

        ctx.font = 'bold 72px sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(String(continuousDays), w / 2, 175)

        ctx.font = '16px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.fillText(i18n.t('shareCardDaysLabel'), w / 2, 205)

        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(100, 230)
        ctx.lineTo(500, 230)
        ctx.stroke()

        var todayText = isChecked ? i18n.t('shareCardDone') : i18n.t('shareCardTodo')
        ctx.font = 'bold 24px sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(String(totalEarned), w / 2 - 100, 275)
        ctx.fillText(todayText, w / 2 + 100, 275)

        ctx.font = '13px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.fillText(i18n.t('shareCardPoints'), w / 2 - 100, 300)
        ctx.fillText(i18n.t('shareCardToday'), w / 2 + 100, 300)

        ctx.font = '14px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fillText(i18n.t('shareCardSlogan'), w / 2, 345)

        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        drawRoundRect(ctx, 200, 370, 200, 28, 14)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '11px sans-serif'
        ctx.fillText(i18n.t('longPressToOpen') || '长按识别小程序', w / 2, 389)

        setTimeout(function() {
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: w,
            height: h,
            destWidth: w * 2,
            destHeight: h * 2,
            fileType: 'png',
            quality: 1,
            success: function(exportRes) {
              callback && callback(exportRes.tempFilePath)
            },
            fail: function() {
              callback && callback('')
            }
          })
        }, 150)
      })
  },

  onShareAppMessage: function() {
    var appInstance = getApp()
    var poster = (appInstance.globalData && appInstance.globalData.sharePosterPath) || ''
    var myCode = points.getMyInviteCode()
    var isCheckinShare = this.data.showCheckinShareCard && this.data.checkinShareImagePath
    try {
      var taskInfo = points.getDailyTasks()
      var shareTaskCompleted = false
      for (var i = 0; i < taskInfo.tasks.length; i++) {
        if (taskInfo.tasks[i].id === 'share_once' && taskInfo.tasks[i].completed) {
          shareTaskCompleted = true
          break
        }
      }
      if (!shareTaskCompleted) {
        points.recordShare()
        achievement.recordShare()
        this.loadPointsData()
        this.loadCheckinInfo()
      }
    } catch(e) {}
    if (isCheckinShare) {
      return {
        title: '🧰 我在百宝工具箱连续签到' + (this.data.checkinInfo ? this.data.checkinInfo.continuousDays : 0) + '天！',
        path: '/pages/index/index?inviteCode=' + myCode,
        imageUrl: this.data.checkinShareImagePath
      }
    }
    return {
      title: '🧰 百宝工具箱 - 40+实用小工具合集',
      path: '/pages/index/index?inviteCode=' + myCode,
      imageUrl: poster
    }
  },

  onShareTimeline: function() {
    var appInstance = getApp()
    var poster = (appInstance.globalData && appInstance.globalData.sharePosterPath) || ''
    try {
      var taskInfo = points.getDailyTasks()
      var shareTaskCompleted = false
      for (var i = 0; i < taskInfo.tasks.length; i++) {
        if (taskInfo.tasks[i].id === 'share_once' && taskInfo.tasks[i].completed) {
          shareTaskCompleted = true
          break
        }
      }
      if (!shareTaskCompleted) {
        points.recordShare()
        achievement.recordShare()
        this.loadPointsData()
        this.loadCheckinInfo()
      }
    } catch(e) {}
    return {
      title: '🧰 百宝工具箱 - 40+实用小工具，即用即走',
      query: 'inviteCode=' + points.getMyInviteCode(),
      imageUrl: poster
    }
  }
})