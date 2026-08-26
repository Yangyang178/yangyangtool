var app = getApp()
var toolsData = require('../../data/tools.js')
var categoriesData = require('../../data/categories.js')
var helpers = require('../../utils/helpers.js')
var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var perf = require('../../utils/perf.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    greetingText: '',
    currentCategory: 'all',
    isRefreshing: false,
    scrollTop: 0,
    isDarkMode: false,
    fontSizeSetting: 'medium',
    fontClass: '',
    i18n: {},
    activeTheme: null,
    themeStyle: '',
    showGuide: false,
    isLoading: true,
    categories: categoriesData.categories,
    hotSearchWords: categoriesData.hotSearchWords,
    tools: [],
    filteredTools: [],
    topTools: [],
    recentTools: [],
    showRecentModal: false,
    showStarGuide: false,
    totalUsageDisplay: '1.2万',
    searchKeyword: '',
    searchHistory: [],
    showSearchPanel: false,
    searchSuggestions: [],
    searchNoResult: false,
    isEditMode: false,
    isDragging: false,
    dragIndex: -1,
    selectedToolIndex: -1,
    selectedCategoryIndex: -1,
    canUndo: false,
    editHistory: [],
    customOrder: [],
    hiddenTools: [],
    hiddenToolsList: [],
    customCategoryOrder: [],
    sharePosterPath: '',
    recommendedTools: [],
    newTools: [],
    appVersion: '',
    todayTip: null,
    hiddenToolsText: '',
    allRecentUseText: '',
    categorySections: [],
    collapsedCategories: {},
    toolRankPreview: []
  },

  onLoad: function(options) {
    perf.markPageStart('index')
    var app = getApp()
    var tracker = app.tracker; tracker.pageView('home')
    this.setData({ appVersion: app.globalData.appVersion })
    this.updateGreeting()

    if (options && options.inviteCode) {
      var inviteResult = points.recordInvite(options.inviteCode)
      if (inviteResult.success) {
        setTimeout(function() {
          wx.showModal({
            title: '🎉 欢迎加入',
            content: '使用邀请码成功！奖励 +' + inviteResult.points + '积分',
            showCancel: false,
            confirmText: '太棒了',
            confirmColor: '#3B82F6'
          })
        }, 1500)
      }
    }

    var favorites = storageUtil.safeGetArray('favorites')
    var allTools = toolsData.getToolsWithFavorites(favorites)
    // 立即翻译工具数据
    var tools = i18n.translateTools(allTools)

    var history = storageUtil.safeGetArray('searchHistory')
    var hasSeenGuide = storageUtil.get('hasSeenGuide')
    var guideVersion = storageUtil.get('guideVersion')
    var currentGuideVersion = 5
    var shouldShowGuide = !hasSeenGuide || guideVersion < currentGuideVersion

    var recentTools = storageUtil.safeGetArray('recentTools')
    recentTools = i18n.translateTools(recentTools)

    // 翻译分类
    var categories = i18n.translateCategories(categoriesData.categories)
    var hotSearchWords = i18n.getHotSearchWords()

    this.setData({
      tools: tools,
      filteredTools: tools,
      searchHistory: history,
      showGuide: shouldShowGuide,
      recentTools: recentTools,
      categories: categories,
      hotSearchWords: hotSearchWords,
      i18n: i18n.getAllTexts()
    })

    this.loadCustomLayout()
    this.filterTools()
    this.buildCategorySections(tools)
    this.applyCurrentTheme()
    this.computeTopTools(tools)
    this.computeRecommendations(tools)
    this.computeNewTools(tools)
    this.computeTodayTip(tools)

    var totalUsage = 0
    try {
      totalUsage = storageUtil.get('totalUsageCount', 0)
      totalUsage = parseInt(totalUsage, 10) || 0
    } catch(e) {}

    var totalUsageDisplay = '1.2万'
    if (totalUsage > 10000) {
      totalUsageDisplay = (totalUsage / 10000).toFixed(1) + i18n.t('tenThousand')
    } else if (totalUsage > 0) {
      totalUsageDisplay = totalUsage.toString()
    }

    this.setData({ totalUsageDisplay: totalUsageDisplay })

    var that = this
    setTimeout(function() {
      that.setData({ isLoading: false })
      perf.markPageReady('index')
      that.drawSharePoster()
    }, 600)
  },

  onShow: function() {
    this.updateGreeting()
    this.applyCurrentTheme()
    this.applyLanguage()
    try {
      var recentTools = storageUtil.safeGetArray('recentTools')
      recentTools = i18n.translateTools(recentTools)
      var allRecentUseText = i18n.t('allRecentUse', { count: recentTools.length })
      // 收藏引导：使用过工具且未看过引导
      var hasSeenStarGuide = storageUtil.get('hasSeenStarGuide')
      var shouldShowStarGuide = !hasSeenStarGuide && recentTools.length > 0
      this.setData({ recentTools: recentTools, allRecentUseText: allRecentUseText, showStarGuide: shouldShowStarGuide })
    } catch(e) {}
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
    this.checkBackupReminder()
    this._loadToolRankPreview()
  },

  onCloudRestored: function() {
    logger.log('[首页] 云端数据已恢复，刷新页面')
    var favorites = storageUtil.safeGetArray('favorites')
    var allTools = toolsData.getToolsWithFavorites(favorites)
    var tools = i18n.translateTools(allTools)

    var recentTools = storageUtil.safeGetArray('recentTools')
    recentTools = i18n.translateTools(recentTools)
    var allRecentUseText = i18n.t('allRecentUse', { count: recentTools.length })

    this.setData({
      tools: tools,
      filteredTools: tools,
      recentTools: recentTools,
      allRecentUseText: allRecentUseText,
      searchHistory: storageUtil.safeGetArray('searchHistory')
    })

    this.loadCustomLayout()
    this.filterTools()
    this.buildCategorySections(tools)
    this.applyCurrentTheme()
    this.computeTopTools(tools)
    this.computeRecommendations(tools)
    this.computeNewTools(tools)
    this.computeTodayTip(tools)

    wx.showToast({ title: '已从云端恢复数据', icon: 'success', duration: 2000 })
  },

  checkBackupReminder: function() {
    try {
      var lastBackupTime = storageUtil.get('lastBackupTime', '')
      if (lastBackupTime) return
      var reminded = storageUtil.get('backupRemindDismissed', '')
      if (reminded) return
      var totalUsage = storageUtil.get('totalUsageCount', 0)
      if (!totalUsage || totalUsage < 10) return
    } catch(e) { return }

    var that = this
    setTimeout(function() {
      wx.showModal({
        title: i18n.t('backupRemindTitle'),
        content: i18n.t('backupRemindContent'),
        confirmText: i18n.t('backupRemindNow'),
        cancelText: i18n.t('backupRemindLater'),
        confirmColor: '#3B82F6',
        success: function(res) {
          if (res.confirm) {
            var appInst = getApp()
            if (appInst && typeof appInst.autoBackup === 'function') {
              appInst.autoBackup()
              wx.showToast({ title: i18n.t('backupRemindDoing'), icon: 'none', duration: 2000 })
            }
          } else {
            try { storageUtil.set('backupRemindDismissed', '1') } catch(e) {}
          }
        }
      })
    }, 2000)
  },

  applyLanguage: function() {
    var allTexts = i18n.getAllTexts()
    var categories = i18n.translateCategories(categoriesData.categories)
    var hotSearchWords = i18n.getHotSearchWords()
    var tools = i18n.translateTools(this.data.tools)
    var filteredTools = i18n.translateTools(this.data.filteredTools)
    var topTools = i18n.translateTools(this.data.topTools)
    var recentTools = i18n.translateTools(this.data.recentTools)
    var recommendedTools = i18n.translateTools(this.data.recommendedTools)
    var newTools = i18n.translateTools(this.data.newTools)
    var hiddenToolsList = i18n.translateTools(this.data.hiddenToolsList)
    // Clear _highlighted to prevent stale cached Chinese names from overriding translated names
    var clearHighlighted = function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i]._highlighted) {
          list[i]._highlighted = { name: list[i].name, description: list[i].description }
        }
      }
    }
    clearHighlighted(tools)
    clearHighlighted(filteredTools)
    clearHighlighted(topTools)
    clearHighlighted(recentTools)
    clearHighlighted(recommendedTools)
    clearHighlighted(newTools)
    clearHighlighted(hiddenToolsList)
    var hiddenToolsText = i18n.t('hiddenTools', { count: this.data.hiddenToolsList.length })
    var allRecentUseText = i18n.t('allRecentUse', { count: this.data.recentTools.length })
    this.setData({
      i18n: allTexts,
      categories: categories,
      hotSearchWords: hotSearchWords,
      tools: tools,
      filteredTools: filteredTools,
      topTools: topTools,
      recentTools: recentTools,
      recommendedTools: recommendedTools,
      newTools: newTools,
      hiddenToolsList: hiddenToolsList,
      hiddenToolsText: hiddenToolsText,
      allRecentUseText: allRecentUseText
    })
    this.buildCategorySections(tools)
    this.computeTodayTip(tools)
  },

  computeTopTools: function(tools) {
    var topTools = []
    try {
      var weeklyUsage = storageUtil.get('weeklyUsage', {})
      if (typeof weeklyUsage !== 'object' || Array.isArray(weeklyUsage)) weeklyUsage = {}
      var sortedTools = []
      for (var ti = 0; ti < tools.length; ti++) {
        var usageCount = parseInt(weeklyUsage[tools[ti].id], 10) || 0
        sortedTools.push({ id: tools[ti].id, name: tools[ti].name, icon: tools[ti].icon, iconBg: tools[ti].iconBg, count: usageCount })
      }
      sortedTools.sort(function(a, b) { return b.count - a.count })
      topTools = sortedTools.slice(0, 3)
    } catch(e) {
      topTools = toolsData.getHotTools().slice(0, 3)
    }
    this.setData({ topTools: i18n.translateTools(topTools) })
  },

  computeRecommendations: function(tools) {
    try {
      var tracker = getApp().tracker
      if (!tracker || typeof tracker.getRecommendedTools !== 'function') {
        var hotTools = toolsData.getHotTools().slice(0, 4)
        for (var h = 0; h < hotTools.length; h++) {
          hotTools[h].reason = i18n.t('hotSearch')
        }
        this.setData({ recommendedTools: i18n.translateTools(hotTools) })
        return
      }
      var recommended = tracker.getRecommendedTools(tools, 4)
      for (var ri = 0; ri < recommended.length; ri++) {
        if (recommended[ri].reason === '经常使用') {
          recommended[ri].reason = i18n.t('reasonFrequentUse')
        } else if (recommended[ri].reason === '同类推荐') {
          recommended[ri].reason = i18n.t('reasonSameCategory')
        } else if (recommended[ri].reason === '热门工具') {
          recommended[ri].reason = i18n.t('reasonHotTool')
        }
      }
      this.setData({ recommendedTools: i18n.translateTools(recommended) })
    } catch(e) {
      var fallback = toolsData.getHotTools().slice(0, 4)
      for (var f = 0; f < fallback.length; f++) {
        fallback[f].reason = i18n.t('hotSearch')
      }
      this.setData({ recommendedTools: i18n.translateTools(fallback) })
    }
  },

  computeNewTools: function(tools) {
    try {
      var newTools = []
      for (var i = 0; i < tools.length; i++) {
        if (tools[i].isNew) newTools.push(tools[i])
      }
      // 按 id 倒序，最新的在前
      newTools.sort(function(a, b) { return b.id - a.id })
      // 最多展示 6 个
      if (newTools.length > 6) newTools = newTools.slice(0, 6)
      this.setData({ newTools: i18n.translateTools(newTools) })
    } catch(e) {
      this.setData({ newTools: [] })
    }
  },

  onNewToolClick: function(e) {
    var tool = e.currentTarget.dataset.tool
    if (!tool || !tool.route) return
    var tracker = getApp().tracker
    if (tracker) tracker.track('new_tool_click', { id: tool.id, name: tool.name })
    wx.navigateTo({
      url: tool.route,
      fail: function() {
        wx.showToast({ title: i18n.t('openFail'), icon: 'none' })
      }
    })
  },

  computeTodayTip: function(tools) {
    var tips = [
      { toolId: 9, title: i18n.t('todayTipTitle1'), desc: i18n.t('todayTipDesc1'), category: i18n.t('todayTipCat1') },
      { toolId: 10, title: i18n.t('todayTipTitle2'), desc: i18n.t('todayTipDesc2'), category: i18n.t('todayTipCat2') },
      { toolId: 8, title: i18n.t('todayTipTitle3'), desc: i18n.t('todayTipDesc3'), category: i18n.t('todayTipCat3') },
      { toolId: 21, title: i18n.t('todayTipTitle4'), desc: i18n.t('todayTipDesc4'), category: i18n.t('todayTipCat4') },
      { toolId: 1, title: i18n.t('todayTipTitle5'), desc: i18n.t('todayTipDesc5'), category: i18n.t('todayTipCat5') },
      { toolId: 17, title: i18n.t('todayTipTitle6'), desc: i18n.t('todayTipDesc6'), category: i18n.t('todayTipCat6') },
      { toolId: 30, title: i18n.t('todayTipTitle7'), desc: i18n.t('todayTipDesc7'), category: i18n.t('todayTipCat7') },
      { toolId: 13, title: i18n.t('todayTipTitle8'), desc: i18n.t('todayTipDesc8'), category: i18n.t('todayTipCat8') },
      { toolId: 3, title: i18n.t('todayTipTitle9'), desc: i18n.t('todayTipDesc9'), category: i18n.t('todayTipCat9') },
      { toolId: 26, title: i18n.t('todayTipTitle10'), desc: i18n.t('todayTipDesc10'), category: i18n.t('todayTipCat10') },
      { toolId: 5, title: i18n.t('todayTipTitle11'), desc: i18n.t('todayTipDesc11'), category: i18n.t('todayTipCat11') },
      { toolId: 32, title: i18n.t('todayTipTitle12'), desc: i18n.t('todayTipDesc12'), category: i18n.t('todayTipCat12') },
      { toolId: 34, title: i18n.t('todayTipTitle13'), desc: i18n.t('todayTipDesc13'), category: i18n.t('todayTipCat13') },
      { toolId: 15, title: i18n.t('todayTipTitle14'), desc: i18n.t('todayTipDesc14'), category: i18n.t('todayTipCat14') },
      { toolId: 33, title: i18n.t('todayTipTitle15'), desc: i18n.t('todayTipDesc15'), category: i18n.t('todayTipCat15') }
    ]

    var today = new Date()
    var dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % tips.length
    var tip = tips[dayIndex]

    var tipTool = null
    for (var i = 0; i < tools.length; i++) {
      if (tools[i].id === tip.toolId) {
        tipTool = tools[i]
        break
      }
    }

    if (tipTool) {
      tip.tool = tipTool
    }

    // 翻译分类
    if (tipTool && tipTool.category) {
      tip.category = i18n.getCategoryName(tipTool.category)
    }

    this.setData({ todayTip: tip })
  },

  onRecommendToolClick: function(e) {
    var tool = e.currentTarget.dataset.tool
    if (!tool) return
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(tool.id, tool.name, this._isFirstUse(tool.id))
    wx.vibrateShort({ type: 'light' })
    this.saveRecentTool(tool)
    this.recordWeeklyUsage()
    points.recordToolUse(tool.id)
    var url = toolsData.getRouteByToolId(tool.id)
    if (url) {
      wx.navigateTo({ url: url, fail: function() { wx.showToast({ title: i18n.t('pageJumpFailed'), icon: 'none' }) } })
    } else {
      wx.showToast({ title: i18n.t('featureInDev'), icon: 'none', duration: 1500 })
    }
  },

  onTodayTipClick: function() {
    if (!this.data.todayTip || !this.data.todayTip.tool) return
    wx.vibrateShort({ type: 'light' })
    var tool = this.data.todayTip.tool
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(tool.id, tool.name, this._isFirstUse(tool.id))
    this.saveRecentTool(tool)
    this.recordWeeklyUsage()
    points.recordToolUse(tool.id)
    var url = toolsData.getRouteByToolId(tool.id)
    if (url) {
      wx.navigateTo({ url: url, fail: function() { wx.showToast({ title: i18n.t('pageJumpFailed'), icon: 'none' }) } })
    } else {
      wx.showToast({ title: i18n.t('featureInDev'), icon: 'none', duration: 1500 })
    }
  },

  applyCurrentTheme: function() {
    try {
      var appInstance = getApp()
      if (appInstance) {
        var isDark = appInstance.globalData.isDarkMode || storageUtil.get('darkMode') === true
        this.setData({ isDarkMode: isDark })
        var fontSize = storageUtil.get('fontSizeSetting', 'medium')
        this.setData({ fontSizeSetting: fontSize })
        var bgColor = isDark ? '#0F172A' : '#F8FAFC'
        wx.setBackgroundColor({ backgroundColor: bgColor, backgroundColorTop: bgColor, backgroundColorBottom: bgColor })
        if (isDark) {
          wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0F172A' })
          wx.setTabBarStyle({ color: '#64748B', selectedColor: '#60A5FA', backgroundColor: '#1E293B', borderStyle: 'black' })
        } else {
          wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#F8FAFC' })
          wx.setTabBarStyle({ color: '#94A3B8', selectedColor: '#3B82F6', backgroundColor: '#FFFFFF', borderStyle: 'white' })
        }
        var activeTheme = points.getActiveTheme()
        var themeStyle = points.getThemeStyle()
        var fontClass = points.getFontClass()
        this.setData({ activeTheme: activeTheme, themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getAllTexts() })
      }
    } catch(e) {}
  },

  updateGreeting: function() {
    try {
      var hour = new Date().getHours()
      var greeting = ''
      if (hour >= 5 && hour < 12) greeting = i18n.t('goodMorning')
      else if (hour >= 12 && hour < 14) greeting = i18n.t('goodNoon')
      else if (hour >= 14 && hour < 18) greeting = i18n.t('goodAfternoon')
      else if (hour >= 18 && hour < 22) greeting = i18n.t('goodEvening')
      else greeting = i18n.t('goodNight')
      var weekDaysStr = i18n.t('weekDays')
      var weekDays = weekDaysStr.split(',')
      var now = new Date()
      var dayName = weekDays[now.getDay()] || ''
      var monthVal = now.getMonth() + 1
      var dateVal = now.getDate()
      var dateStr = dayName + ',' + i18n.t('monthDay', { month: monthVal, day: dateVal })
      this.setData({ greetingText: greeting + '\n' + dateStr })
    } catch(e) {
      this.setData({ greetingText: i18n.t('welcomeUse') })
    }
  },

  onGuideClose: function() { this.setData({ showGuide: false }); this.applyCurrentTheme() },

  closeStarGuide: function() {
    this.setData({ showStarGuide: false })
    wx.setStorageSync('hasSeenStarGuide', true)
  },

  onPullDownRefresh: function() {
    this.setData({ isRefreshing: true })
    var that = this
    setTimeout(function() { that.updateGreeting(); that.setData({ isRefreshing: false }); wx.stopPullDownRefresh(); wx.showToast({ title: i18n.t('refreshSuccess'), icon: 'success' }) }, 1000)
  },

  onScrollToUpper: function() { var that = this; this.setData({ scrollTop: 1 }); setTimeout(function() { that.setData({ scrollTop: 0 }) }, 50) },

  onPageScroll: function(e) {
    try {
      var st = 0
      if (e.detail && e.detail.scrollTop !== undefined) st = e.detail.scrollTop
      else if (e.detail && e.detail.scrollY !== undefined) st = e.detail.scrollY
      if (st < 5 && st > -50) {
        var self = this
        if (!this._scrollFixTimer) { this._scrollFixTimer = setTimeout(function() { self._scrollFixTimer = null; if (self.data.scrollTop !== 0) self.setData({ scrollTop: 0 }) }, 100) }
      }
    } catch(e) {}
  },

  onCategoryChange: function(e) {
    this.setData({ currentCategory: e.currentTarget.dataset.id, showSearchPanel: false })
    this.filterTools()
  },

  showRecentModalFn: function() {
    try {
      wx.vibrateShort({ type: 'light' })
      var recentTools = storageUtil.safeGetArray('recentTools')
      recentTools = i18n.translateTools(recentTools)
      var allRecentUseText = i18n.t('allRecentUse', { count: recentTools.length })
      this.setData({ showRecentModal: true, recentTools: recentTools, allRecentUseText: allRecentUseText })
    } catch(e) {}
  },

  hideRecentModal: function() { this.setData({ showRecentModal: false }) },

  deleteRecentTool: function(e) {
    var index = e.currentTarget.dataset.index
    var recentTools = this.data.recentTools || []
    if (index == null || index < 0 || index >= recentTools.length) return
    var self = this
    wx.showModal({
      title: i18n.t('tipTitle'),
      content: i18n.t('deleteRecentConfirm'),
      confirmText: i18n.t('confirm'),
      cancelText: i18n.t('cancel'),
      success: function(res) {
        if (!res.confirm) return
        recentTools.splice(index, 1)
        wx.setStorageSync('recentTools', recentTools)
        var allRecentUseText = i18n.t('allRecentUse', { count: recentTools.length })
        self.setData({ recentTools: recentTools, allRecentUseText: allRecentUseText })
        wx.showToast({ title: i18n.t('recentDeleted'), icon: 'success', duration: 1200 })
      }
    })
  },

  clearAllRecentTools: function() {
    var self = this
    wx.showModal({
      title: i18n.t('tipTitle'),
      content: i18n.t('clearAllRecentConfirm'),
      confirmText: i18n.t('confirm'),
      cancelText: i18n.t('cancel'),
      success: function(res) {
        if (!res.confirm) return
        wx.setStorageSync('recentTools', [])
        var allRecentUseText = i18n.t('allRecentUse', { count: 0 })
        self.setData({ recentTools: [], allRecentUseText: allRecentUseText })
        wx.showToast({ title: i18n.t('recentCleared'), icon: 'success', duration: 1200 })
      }
    })
  },

  onRecentToolClick: function(e) {
    try {
      var tool = e.currentTarget.dataset.tool
      if (!tool) return
      wx.vibrateShort({ type: 'light' })
      points.recordToolUse(tool.id)
      var url = toolsData.getRouteByToolId(tool.id)
      if (url) { wx.navigateTo({ url: url, fail: function() { wx.showToast({ title: i18n.t('pageJumpFailed'), icon: 'none' }) } }) }
      else { wx.showToast({ title: i18n.t('featureInDev'), icon: 'none', duration: 1500 }) }
    } catch(e) {}
  },

  onToolClick: function(e) {
    try {
      var tool = e.currentTarget.dataset.tool
      if (!tool) return
      var tracker = getApp().tracker; tracker.toolUse(tool.id, tool.name, this._isFirstUse(tool.id))
      wx.vibrateShort({ type: 'light' })
      this.saveRecentTool(tool)
      this.recordWeeklyUsage()
      points.recordToolUse(tool.id)
      this._reportToolUsageRank(tool.id, tool.name, tool.icon)
      var url = toolsData.getRouteByToolId(tool.id)
      if (url) { wx.navigateTo({ url: url, fail: function() { wx.showToast({ title: i18n.t('pageJumpFailed'), icon: 'none' }) } }) }
      else { wx.showToast({ title: i18n.t('featureInDev'), icon: 'none', duration: 1500 }) }
    } catch(e) {}
  },

  toggleFavorite: function(e) {
    try {
      var tracker = getApp().tracker
      var id = e.currentTarget.dataset.id
      var toolsList = this.data.tools || []
      var tools = []
      // 找到该工具当前的收藏状态并切换
      var newFavState = null
      for (var i = 0; i < toolsList.length; i++) {
        var t = {}; var src = toolsList[i]
        for (var key in src) t[key] = src[key]
        if (t.id === id) {
          t.isFavorite = !t.isFavorite
          newFavState = t.isFavorite
        }
        tools.push(t)
      }
      var favorites = []
      for (var j = 0; j < tools.length; j++) { if (tools[j].isFavorite) favorites.push(tools[j].id) }
      wx.setStorageSync('favorites', favorites)
      wx.vibrateShort({ type: 'light' })

      // 同步更新 categorySections 中对应工具的收藏状态
      var patch = { tools: tools }
      if (newFavState !== null) {
        var sections = this.data.categorySections || []
        for (var si = 0; si < sections.length; si++) {
          var sectionTools = sections[si].tools || []
          for (var ti = 0; ti < sectionTools.length; ti++) {
            if (sectionTools[ti].id === id) {
              sectionTools[ti].isFavorite = newFavState
            }
          }
        }
        // 同步更新 newTools
        var newTools = this.data.newTools || []
        for (var ni = 0; ni < newTools.length; ni++) {
          if (newTools[ni].id === id) newTools[ni].isFavorite = newFavState
        }
        // 同步更新 topTools
        var topTools = this.data.topTools || []
        for (var tpi = 0; tpi < topTools.length; tpi++) {
          if (topTools[tpi].id === id) topTools[tpi].isFavorite = newFavState
        }
        // 同步更新 recentTools
        var recentTools = this.data.recentTools || []
        for (var ri = 0; ri < recentTools.length; ri++) {
          if (recentTools[ri].id === id) recentTools[ri].isFavorite = newFavState
        }
        // 同步更新 _allToolsCache
        if (this._allToolsCache) {
          for (var catKey in this._allToolsCache) {
            var cachedTools = this._allToolsCache[catKey]
            for (var ci = 0; ci < cachedTools.length; ci++) {
              if (cachedTools[ci].id === id) cachedTools[ci].isFavorite = newFavState
            }
          }
        }
        patch.categorySections = sections
        patch.newTools = newTools
        patch.topTools = topTools
        patch.recentTools = recentTools
      }

      this.setData(patch)
      this.filterTools()
      var hasId = false
      for (var k = 0; k < favorites.length; k++) { if (favorites[k] === id) { hasId = true; break } }
      if (hasId) { this.showHeartAnimation(); tracker.favoriteAction(id, 'add') } else { tracker.favoriteAction(id, 'remove') }
    } catch(e) {}
  },

  _isFirstUse: function(toolId) {
    var recentTools = this.data.recentTools || []
    for (var i = 0; i < recentTools.length; i++) {
      if (recentTools[i].id === toolId) return false
    }
    return true
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
      var weeklyRecord = storageUtil.get('weeklyUsage', {})
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
      var recentTools = storageUtil.safeGetArray('recentTools')
      var newRecent = []
      for (var i = 0; i < recentTools.length; i++) { if (recentTools[i].id !== tool.id) newRecent.push(recentTools[i]) }
      newRecent.unshift({ id: tool.id, name: tool.name, icon: tool.icon, iconBg: tool.iconBg, usedAt: new Date().getTime() })
      if (newRecent.length > 20) newRecent = newRecent.slice(0, 20)
      wx.setStorageSync('recentTools', newRecent)
      var usageLog = storageUtil.safeGetArray('toolUsageLog')
      usageLog.unshift({ id: tool.id, usedAt: new Date().getTime() })
      if (usageLog.length > 200) usageLog = usageLog.slice(0, 200)
      wx.setStorageSync('toolUsageLog', usageLog)
      var count = storageUtil.get('totalUsageCount', 0)
      count = parseInt(count, 10) || 0
      wx.setStorageSync('totalUsageCount', count + 1)
      try { var appInst = getApp(); if (appInst && typeof appInst.cloudSyncUsage === 'function') appInst.cloudSyncUsage(tool.id, tool.name) } catch(err) {}
    } catch(e) {}
  },

  showMoreMenu: function() {
    wx.showActionSheet({
      itemList: [i18n.t('aboutUsMenu'), i18n.t('feedbackMenu'), i18n.t('shareToFriend')],
      success: function(res) { switch (res.tapIndex) { case 0: wx.showToast({ title: i18n.t('brandTitle') + ' v1.0', icon: 'none' }); break; case 1: wx.showToast({ title: i18n.t('feedback'), icon: 'none' }); break } },
      fail: function() {}
    })
  },

  addToSearchHistory: function(keyword) {
    if (!keyword || !keyword.trim()) return
    var history = storageUtil.safeGetArray('searchHistory')
    var newHistory = []
    for (var i = 0; i < history.length; i++) { if (history[i] !== keyword) newHistory.push(history[i]) }
    newHistory.unshift(keyword)
    if (newHistory.length > 10) newHistory = newHistory.slice(0, 10)
    wx.setStorageSync('searchHistory', newHistory)
    this.setData({ searchHistory: newHistory })
  },

  clearSearchHistory: function() {
    var that = this
    wx.showModal({ title: i18n.t('clearSearchHistoryTitle'), content: i18n.t('clearSearchHistoryContent'), confirmText: i18n.t('clearAll'), confirmColor: '#EF4444',
      success: function(res) { if (res.confirm) { wx.removeStorageSync('searchHistory'); that.setData({ searchHistory: [] }); wx.showToast({ title: i18n.t('cleared'), icon: 'success' }) } }
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
    if (keyword.length > 0) {
      this.updateSearchSuggestions(keyword)
      this.setData({ showSearchPanel: true })
    } else {
      this.setData({ searchSuggestions: [], searchNoResult: false })
    }
    this.filterTools()
  },

  clearSearch: function() { this.setData({ searchKeyword: '', showSearchPanel: false, searchSuggestions: [], searchNoResult: false }); this.filterTools() },

  onSearchFocus: function() { this.setData({ showSearchPanel: true }) },

  onSearchBlur: function() { var that = this; setTimeout(function() { that.setData({ showSearchPanel: false }) }, 200) },

  filterTools: function() {
    try {
      var filtered = [].concat(this.data.tools || [])

      if (this.data.searchKeyword) {
        // 搜索时全局匹配，不受分类限制
        var keyword = this.data.searchKeyword.toLowerCase()
        var result = []
        for (var j = 0; j < filtered.length; j++) {
          var tool = filtered[j]
          var nameMatch = helpers.fuzzyMatch(tool.name, keyword)
          var descMatch = helpers.fuzzyMatch(tool.description, keyword)
          var zhName = i18n.getToolName(tool.id, '')
          var zhDesc = i18n.getToolDesc(tool.id, '')
          var zhNameMatch = zhName && zhName !== tool.name ? helpers.fuzzyMatch(zhName, keyword) : false
          var zhDescMatch = zhDesc && zhDesc !== tool.description ? helpers.fuzzyMatch(zhDesc, keyword) : false
          if (nameMatch || descMatch || zhNameMatch || zhDescMatch) {
            var highlighted = {}
            highlighted.name = nameMatch ? helpers.highlightText(tool.name, this.data.searchKeyword, this.data.isDarkMode) : tool.name
            highlighted.description = descMatch ? helpers.highlightText(tool.description, this.data.searchKeyword, this.data.isDarkMode) : tool.description
            tool._highlighted = highlighted
            result.push(tool)
          }
        }
        filtered = result
        if (result.length > 0) {
          this.addToSearchHistory(this.data.searchKeyword)
        }
        this.setData({ searchNoResult: result.length === 0 })
      } else {
        // 非搜索时按分类筛选
        if (this.data.currentCategory !== 'all') {
          var catFiltered = []
          for (var i = 0; i < filtered.length; i++) { if (filtered[i].category === this.data.currentCategory) catFiltered.push(filtered[i]) }
          filtered = catFiltered
        }
        for (var k = 0; k < filtered.length; k++) {
          filtered[k]._highlighted = { name: filtered[k].name, description: filtered[k].description }
        }
        this.setData({ searchNoResult: false })
      }
      this.setData({ filteredTools: filtered })
    } catch(e) {}
  },

  updateSearchSuggestions: function(keyword) {
    var kw = keyword.toLowerCase()
    var allTools = this.data.tools || []
    var suggestions = []
    for (var i = 0; i < allTools.length; i++) {
      var tool = allTools[i]
      var nameMatch = helpers.fuzzyMatch(tool.name, kw)
      var descMatch = helpers.fuzzyMatch(tool.description, kw)
      var zhName = i18n.getToolName(tool.id, '')
      var zhNameMatch = zhName && zhName !== tool.name ? helpers.fuzzyMatch(zhName, kw) : false
      if (nameMatch || descMatch || zhNameMatch) {
        suggestions.push({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          icon: tool.icon,
          iconBg: tool.iconBg,
          route: tool.route
        })
        if (suggestions.length >= 5) break
      }
    }
    this.setData({ searchSuggestions: suggestions })
  },

  onSuggestionClick: function(e) {
    var route = e.currentTarget.dataset.route
    if (route) {
      wx.navigateTo({ url: route })
    }
  },

  buildCategorySections: function(tools) {
    // 分类图标和默认排序配置
    var categoryConfig = {
      calculator: { icon: '🧮', sort: 1 },
      text: { icon: '📝', sort: 2 },
      datetime: { icon: '📅', sort: 3 },
      life: { icon: '🏡', sort: 4 },
      office: { icon: '💼', sort: 5 },
      dev: { icon: '💻', sort: 6 },
      fun: { icon: '🧠', sort: 7 }
    }
    // 按分类分组（缓存全量数据，供展开时懒加载）
    var groups = {}
    for (var i = 0; i < tools.length; i++) {
      var cat = tools[i].category
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(tools[i])
    }
    this._allToolsCache = groups
    // 构建分类区段
    var sections = []
    for (var key in groups) {
      if (!categoryConfig[key]) continue
      var catNames = {
        calculator: i18n.t('catCalculator') || '计算转换',
        text: i18n.t('catText') || '文本处理',
        datetime: i18n.t('catDatetime') || '日期时间',
        life: i18n.t('catLife') || '生活助手',
        office: i18n.t('catOffice') || '效率/办公',
        dev: i18n.t('catDev') || '开发调试',
        fun: i18n.t('catFun') || '益智趣味'
      }
      sections.push({
        id: key,
        name: catNames[key],
        icon: categoryConfig[key].icon,
        sort: categoryConfig[key].sort,
        tools: [],  // 懒加载：折叠状态下不填充工具数据
        count: groups[key].length,
        countText: i18n.t('catToolCount', { count: groups[key].length })
      })
    }
    // 优先按自定义顺序排序，否则按默认 sort
    var customOrder = this.data.customCategoryOrder || []
    if (customOrder.length > 0) {
      var orderedSections = []
      var usedIds = {}
      for (var co = 0; co < customOrder.length; co++) {
        for (var si = 0; si < sections.length; si++) {
          if (sections[si].id === customOrder[co] && !usedIds[sections[si].id]) {
            orderedSections.push(sections[si])
            usedIds[sections[si].id] = true
            break
          }
        }
      }
      // 追加自定义顺序中未包含的分类（防止数据丢失）
      for (var ri = 0; ri < sections.length; ri++) {
        if (!usedIds[sections[ri].id]) orderedSections.push(sections[ri])
      }
      sections = orderedSections
    } else {
      sections.sort(function(a, b) { return a.sort - b.sort })
    }
    // 保留已有的折叠状态，新增的分类默认折叠
    var collapsed = this.data.collapsedCategories || {}
    var defaultCollapsedIds = ['calculator', 'text', 'datetime', 'life', 'office', 'dev', 'fun']
    for (var j = 0; j < sections.length; j++) {
      if (collapsed[sections[j].id] === undefined) {
        collapsed[sections[j].id] = defaultCollapsedIds.indexOf(sections[j].id) > -1
      }
      // 已展开的分类需要填充工具数据
      if (!collapsed[sections[j].id]) {
        sections[j].tools = i18n.translateTools(this._allToolsCache[sections[j].id] || [])
      }
    }
    this.setData({ categorySections: sections, collapsedCategories: collapsed })
  },

  toggleCategoryCollapse: function(e) {
    var catId = e.currentTarget.dataset.id
    var collapsed = this.data.collapsedCategories || {}
    var willCollapse = !collapsed[catId]
    collapsed[catId] = willCollapse
    wx.vibrateShort({ type: 'light' })

    // 懒加载：展开时填充工具数据，折叠时清空释放内存
    var sections = this.data.categorySections
    var patch = { collapsedCategories: collapsed }
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].id === catId) {
        var path = 'categorySections[' + i + '].tools'
        if (willCollapse) {
          patch[path] = []
        } else {
          patch[path] = i18n.translateTools(this._allToolsCache[catId] || [])
        }
        break
      }
    }
    this.setData(patch)
  },

  loadCustomLayout: function() {
    try {
      var customOrder = storageUtil.safeGetArray('customToolOrder')
      var hiddenTools = storageUtil.safeGetArray('hiddenTools')
      var customCategoryOrder = storageUtil.safeGetArray('customCategoryOrder')
      this.setData({ customOrder: customOrder, hiddenTools: hiddenTools, customCategoryOrder: customCategoryOrder })
      var tools = this.data.tools || []
      if (!Array.isArray(tools) || tools.length === 0) return
      if (customOrder.length > 0) {
        var orderedTools = []
        for (var oi = 0; oi < customOrder.length; oi++) {
          var isHidden = false
          for (var hi = 0; hi < hiddenTools.length; hi++) { if (hiddenTools[hi] === customOrder[oi]) { isHidden = true; break } }
          if (!isHidden) { for (var ti = 0; ti < tools.length; ti++) { if (tools[ti].id === customOrder[oi]) { orderedTools.push(tools[ti]); break } } }
        }
        var remainingTools = []
        for (var ri = 0; ri < tools.length; ri++) {
          var inOrdered = false
          for (var ci = 0; ci < customOrder.length; ci++) { if (customOrder[ci] === tools[ri].id) { inOrdered = true; break } }
          var isHidden2 = false
          for (var hi2 = 0; hi2 < hiddenTools.length; hi2++) { if (hiddenTools[hi2] === tools[ri].id) { isHidden2 = true; break } }
          if (!inOrdered && !isHidden2) remainingTools.push(tools[ri])
        }
        var finalTools = orderedTools.concat(remainingTools)
        this.setData({ tools: finalTools, filteredTools: finalTools })
      } else if (hiddenTools.length > 0) {
        var visibleTools = []
        for (var vi = 0; vi < tools.length; vi++) {
          var hFound = false
          for (var hi3 = 0; hi3 < hiddenTools.length; hi3++) { if (hiddenTools[hi3] === tools[vi].id) { hFound = true; break } }
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
        wx.showModal({ title: i18n.t('editModeTitle'), content: i18n.t('editModeContent'), showCancel: false, confirmText: i18n.t('iKnow'), confirmColor: '#3B82F6' })
        this.setData({ isEditMode: true, selectedCategoryIndex: -1, canUndo: false, editHistory: [] })
      } else {
        this.setData({ isEditMode: false, selectedCategoryIndex: -1, canUndo: false, editHistory: [] })
        this.saveCategoryOrder()
        wx.showToast({ title: i18n.t('layoutSaved'), icon: 'success', duration: 1500 })
      }
    } catch(e) {}
  },

  onEditCategoryClick: function(e) {
    try {
      if (!this.data.isEditMode) return
      var index = e.currentTarget.dataset.index
      var currentSelected = this.data.selectedCategoryIndex
      if (currentSelected === -1) {
        wx.vibrateShort({ type: 'light' })
        this.setData({ selectedCategoryIndex: index })
        return
      }
      if (currentSelected === index) {
        wx.vibrateShort({ type: 'light' })
        this.setData({ selectedCategoryIndex: -1 })
        return
      }
      wx.vibrateShort({ type: 'medium' })
      var sections = this.data.categorySections || []
      if (!sections[currentSelected] || !sections[index]) return
      this.pushCategoryEditHistory()
      var temp = sections[currentSelected]
      sections[currentSelected] = sections[index]
      sections[index] = temp
      this.setData({ categorySections: sections, selectedCategoryIndex: -1, canUndo: true })
      wx.showToast({ title: i18n.t('swappedPosition'), icon: 'success', duration: 800 })
    } catch(e) {}
  },

  pushCategoryEditHistory: function() {
    try {
      var sections = this.data.categorySections || []
      var snapshot = []
      for (var i = 0; i < sections.length; i++) snapshot.push(sections[i].id)
      var history = this.data.editHistory || []
      history = history.slice()
      history.push({ categoryOrder: snapshot, timestamp: Date.now() })
      if (history.length > 20) history = history.slice(history.length - 20)
      this.setData({ editHistory: history })
    } catch(e) {}
  },

  saveCategoryOrder: function() {
    try {
      var sections = this.data.categorySections || []
      var order = []
      for (var i = 0; i < sections.length; i++) order.push(sections[i].id)
      wx.setStorageSync('customCategoryOrder', order)
      this.setData({ customCategoryOrder: order })
    } catch(e) {}
  },

  onEditToolClick: function(e) {
    try {
      if (!this.data.isEditMode) return
      var index = e.currentTarget.dataset.index
      var currentSelected = this.data.selectedToolIndex
      if (currentSelected === -1) { wx.vibrateShort({ type: 'light' }); this.setData({ selectedToolIndex: index }); return }
      if (currentSelected === index) { wx.vibrateShort({ type: 'light' }); this.setData({ selectedToolIndex: -1 }); return }
      wx.vibrateShort({ type: 'medium' })
      var filteredTools = this.data.filteredTools || []
      if (!filteredTools[currentSelected] || !filteredTools[index]) return
      this.pushEditHistory()
      var temp = filteredTools[currentSelected]
      filteredTools[currentSelected] = filteredTools[index]
      filteredTools[index] = temp
      this.setData({ filteredTools: filteredTools, selectedToolIndex: -1, canUndo: true })
      this.saveCustomLayout()
      wx.showToast({ title: i18n.t('swappedPosition'), icon: 'success', duration: 800 })
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
      if (history.length === 0) { wx.showToast({ title: i18n.t('noUndoAction'), icon: 'none', duration: 1200 }); return }
      wx.vibrateShort({ type: 'light' })
      var newHistory = history.slice()
      var prevState = newHistory.pop()
      // 分类排序撤销
      if (prevState.categoryOrder && Array.isArray(prevState.categoryOrder)) {
        var sections = this.data.categorySections || []
        var restoredSections = []
        var usedIds = {}
        for (var co = 0; co < prevState.categoryOrder.length; co++) {
          for (var si = 0; si < sections.length; si++) {
            if (sections[si].id === prevState.categoryOrder[co] && !usedIds[sections[si].id]) {
              restoredSections.push(sections[si])
              usedIds[sections[si].id] = true
              break
            }
          }
        }
        for (var ri = 0; ri < sections.length; ri++) {
          if (!usedIds[sections[ri].id]) restoredSections.push(sections[ri])
        }
        this.setData({ categorySections: restoredSections, editHistory: newHistory, canUndo: newHistory.length > 0, selectedCategoryIndex: -1 })
        this.saveCategoryOrder()
        wx.showToast({ title: i18n.t('undoLastStep'), icon: 'none', duration: 800 })
        return
      }
      // 兼容旧工具排序撤销
      var allTools = this.data.tools || []
      var restoredOrder = []
      if (prevState.order && Array.isArray(prevState.order)) {
        for (var oi = 0; oi < prevState.order.length; oi++) { for (var ti = 0; ti < allTools.length; ti++) { if (allTools[ti].id === prevState.order[oi]) { restoredOrder.push(allTools[ti]); break } } }
      }
      var restoredHidden = (prevState.hidden && Array.isArray(prevState.hidden)) ? prevState.hidden : []
      this.setData({ filteredTools: restoredOrder, hiddenTools: restoredHidden, editHistory: newHistory, canUndo: newHistory.length > 0, selectedToolIndex: -1 })
      this.updateHiddenToolsList(restoredHidden)
      this.saveCustomLayout()
      wx.showToast({ title: i18n.t('undoLastStep'), icon: 'none', duration: 800 })
    } catch(e) {}
  },

  toggleToolVisibility: function(e) {
    try {
      if (!this.data.isEditMode) return
      wx.vibrateShort({ type: 'light' })
      this.pushEditHistory()
      var id = e.currentTarget.dataset.id
      var hiddenTools = (this.data.hiddenTools || []).slice()
      var foundIdx = -1
      for (var i = 0; i < hiddenTools.length; i++) { if (hiddenTools[i] === id) { foundIdx = i; break } }
      if (foundIdx > -1) { hiddenTools.splice(foundIdx, 1); wx.showToast({ title: i18n.getLanguage() === 'zh' ? '已显示 ✓' : 'Shown ✓', icon: 'none', duration: 1000 }) }
      else { hiddenTools.push(id); wx.showToast({ title: i18n.getLanguage() === 'zh' ? '已隐藏 👁' : 'Hidden 👁', icon: 'none', duration: 1000 }) }
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
      var displayName = restoredTool ? restoredTool.name : ''
      wx.showToast({ title: i18n.t('toolRestored', { name: displayName }), icon: 'success', duration: 1000 })
    } catch(e) {}
  },

  updateHiddenToolsList: function(hiddenTools) {
    try {
      if (!hiddenTools || !Array.isArray(hiddenTools) || hiddenTools.length === 0) { this.setData({ hiddenToolsList: [] }); return }
      var allTools = this.data.tools || []
      var hiddenList = []
      for (var i = 0; i < allTools.length; i++) { for (var j = 0; j < hiddenTools.length; j++) { if (hiddenTools[j] === allTools[i].id) { hiddenList.push(allTools[i]); break } } }
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
        title: i18n.t('resetLayoutTitle'), content: i18n.t('resetLayoutContent'),
        confirmText: i18n.t('resetLayout'), cancelText: i18n.t('cancel'), confirmColor: '#EF4444',
        success: function(res) {
          if (res.confirm) {
            that.pushCategoryEditHistory()
            wx.removeStorageSync('customToolOrder')
            wx.removeStorageSync('hiddenTools')
            wx.removeStorageSync('customCategoryOrder')
            that.setData({ customOrder: [], hiddenTools: [], customCategoryOrder: [], isEditMode: false, canUndo: true, selectedCategoryIndex: -1, selectedToolIndex: -1 })
            var favs = storageUtil.safeGetArray('favorites')
            var defaultToolsCopy = toolsData.getToolsWithFavorites(favs)
            defaultToolsCopy = i18n.translateTools(defaultToolsCopy)
            that.setData({ tools: defaultToolsCopy, filteredTools: defaultToolsCopy })
            that.buildCategorySections(defaultToolsCopy)
            wx.showToast({ title: i18n.t('defaultLayoutRestored'), icon: 'success' })
          }
        }
      })
    } catch(e) {}
  },

  onShareAppMessage: function() {
    var tracker = getApp().tracker; tracker.shareAction('friend', '')
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
      }
    } catch(e) {}
    return { title: '🧰 百宝工具箱 - 汇率换算、房贷计算、二维码等50+实用工具', path: '/pages/index/index', imageUrl: this.data.sharePosterPath || '' }
  },

  onShareTimeline: function() {
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
      }
    } catch(e) {}
    return { title: '🧰 百宝工具箱 - 汇率换算、房贷计算、二维码等50+实用工具', query: '', imageUrl: this.data.sharePosterPath || '' }
  },

  drawSharePoster: function() {
    var that = this
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
        var posterTools = [{ icon: '💹', name: '汇率' }, { icon: '📐', name: '单位' }, { icon: '🏠', name: '房贷' }, { icon: '💰', name: '小费' }, { icon: '🔢', name: '字数' }, { icon: '🔤', name: '大小写' }, { icon: '🔐', name: 'Base64' }, { icon: '🍅', name: '番茄钟' }, { icon: '💧', name: '喝水' }, { icon: '🎲', name: '随机' }, { icon: '🗑️', name: '垃圾分类' }, { icon: '📅', name: '日期' }]
        var cardX = 30, cardY = 130, cardW = 440, cardH = 180
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.beginPath(); ctx.moveTo(cardX, cardY + 18); ctx.lineTo(cardX + cardW, cardY + 18); ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW - 18, cardY); ctx.lineTo(cardX + 18, cardY); ctx.quadraticCurveTo(cardX, cardY, cardX, cardY + 18); ctx.fill()
        var cols = 6, rows = 2, itemW = 68, itemH = 76, gapX = (cardW - cols * itemW) / (cols + 1), gapY = (cardH - rows * itemH) / (rows + 1)
        for (var ti = 0; ti < posterTools.length; ti++) {
          var col = ti % cols, row = Math.floor(ti / cols)
          var ix = cardX + gapX + col * (itemW + gapX), iy = cardY + gapY + row * (itemH + gapY)
          ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.arc(ix + itemW / 2, iy + itemH / 2, 28, 0, Math.PI * 2); ctx.fill()
          ctx.globalAlpha = 1; ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(posterTools[ti].icon, ix + itemW / 2, iy + itemH / 2 - 8)
          ctx.font = '11px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(posterTools[ti].name, ix + itemW / 2, iy + itemH - 14)
        }
        ctx.textAlign = 'center'; var bottomGrad = ctx.createLinearGradient(250, 330, 250, 380)
        bottomGrad.addColorStop(0, '#3B82F6'); bottomGrad.addColorStop(1, '#1D4ED8')
        ctx.beginPath(); ctx.moveTo(50, 336); ctx.lineTo(450, 336); ctx.quadraticCurveTo(450, 360, 426, 360); ctx.lineTo(74, 360); ctx.quadraticCurveTo(50, 360, 50, 336); ctx.closePath(); ctx.fillStyle = bottomGrad; ctx.fill()
        ctx.font = '600 18px -apple-system, system-ui, sans-serif'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('✨ 40+ 实用工具，一键即达', 250, 355)
        setTimeout(function() {
          wx.canvasToTempFilePath({ canvas: canvas, width: 500, height: 400, destWidth: 500, destHeight: 400, fileType: 'png', quality: 1,
            success: function(res) { if (res.tempFilePath) { appInstance.globalData.sharePosterPath = res.tempFilePath; that.setData({ sharePosterPath: res.tempFilePath }) } }
          })
        }, 100)
      })
    } catch(e) {}
  },

  // 跳转工具排行页
  goToToolRank: function() {
    wx.navigateTo({ url: '/pages/tool-rank/tool-rank' })
  },

  // 加载工具排行预览（首页显示前3名）
  _loadToolRankPreview: function() {
    var that = this
    try {
      wx.cloud.callFunction({
        name: 'toolRank',
        data: {
          action: 'getRank',
          type: 'today',
          limit: 3
        },
        success: function(res) {
          if (res.result && res.result.success) {
            var list = res.result.rankList || []
            // 叠加本地未同步的使用次数
            var localUsage = storageUtil.get('toolLocalUsage') || {}
            for (var i = 0; i < list.length; i++) {
              var localCount = localUsage[list[i].toolId] || 0
              if (localCount > 0) {
                list[i].todayUses = (list[i].todayUses || 0) + localCount
                list[i].totalUses = (list[i].totalUses || 0) + localCount
              }
              var toolObj = toolsData.getToolById(list[i].toolId)
              if (toolObj) {
                list[i].toolName = i18n.getToolName(list[i].toolId, list[i].toolName)
                list[i].toolIcon = toolObj.icon || list[i].toolIcon
              }
            }
            // 本地有使用但未入榜的工具，补充到预览
            var existIds = {}
            for (var j = 0; j < list.length; j++) { existIds[list[j].toolId] = true }
            var localItems = []
            for (var tid in localUsage) {
              if (!existIds[tid] && localUsage[tid] > 0) {
                var tObj = toolsData.getToolById(tid)
                if (tObj) {
                  localItems.push({
                    toolId: tid,
                    toolName: i18n.getToolName(tid, ''),
                    toolIcon: tObj.icon || '🔧',
                    todayUses: localUsage[tid],
                    totalUses: localUsage[tid]
                  })
                }
              }
            }
            if (localItems.length > 0) {
              list = list.concat(localItems)
              list.sort(function(a, b) { return b.todayUses - a.todayUses })
              list = list.slice(0, 3)
            }
            that.setData({ toolRankPreview: list })
          }
        },
        fail: function() {
          // 云端查询失败时，用本地数据显示预览
          var localUsage = storageUtil.get('toolLocalUsage') || {}
          var localList = []
          for (var tid in localUsage) {
            if (localUsage[tid] > 0) {
              var tObj = toolsData.getToolById(tid)
              if (tObj) {
                localList.push({
                  toolId: tid,
                  toolName: i18n.getToolName(tid, ''),
                  toolIcon: tObj.icon || '🔧',
                  todayUses: localUsage[tid],
                  totalUses: localUsage[tid]
                })
              }
            }
          }
          localList.sort(function(a, b) { return b.todayUses - a.todayUses })
          that.setData({ toolRankPreview: localList.slice(0, 3) })
        }
      })
    } catch(e) {}
  },

  // 上报工具使用到排行（本地即时计数 + 云端异步同步）
  _reportToolUsageRank: function(toolId, toolName, toolIcon) {
    // 本地即时计数，确保返回首页时立刻可见
    try {
      var localUsage = storageUtil.get('toolLocalUsage') || {}
      localUsage[toolId] = (localUsage[toolId] || 0) + 1
      // 只保留今天的数据，避免累积过多
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
          // 上报成功后清除本地计数，避免重复叠加
          try {
            var lu = storageUtil.get('toolLocalUsage') || {}
            delete lu[toolId]
            storageUtil.safeSet('toolLocalUsage', lu)
          } catch(e) {}
        },
        fail: function() {}
      })
    } catch(e) {}
  }
})
