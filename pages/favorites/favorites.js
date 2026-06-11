var app = getApp()
var toolsData = require('../../data/tools.js')
var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    favoriteTools: [],
    popularTools: [],
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    sortBy: 'time',
    i18n: {}
  },

  onLoad: function() {
    var tracker = getApp().tracker; if (tracker) tracker.pageView('favorites')
    var sortPref = storageUtil.get('favSortBy', 'time')
    this.setData({ sortBy: sortPref, i18n: i18n.getToolPageTexts('favorites') })
    this.loadFavorites()
    this.loadPopularTools()

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShow: function() {
    this.setData({ i18n: i18n.getToolPageTexts('favorites') })
    this.loadFavorites()
    this.loadPopularTools()
    var appInstance = getApp()
    if (appInstance) {
      var isDark = appInstance.globalData.isDarkMode || storageUtil.get('darkMode') === true
      var themeStyle = points.getThemeStyle()
      var fontClass = points.getFontClass()
      this.setData({ isDarkMode: isDark, themeStyle: themeStyle, fontClass: fontClass })
      var fontSize = storageUtil.get('fontSizeSetting', 'medium')
      this.setData({ fontSizeSetting: fontSize })
    }
  },

  toggleSort: function() {
    var newSort = this.data.sortBy === 'time' ? 'name' : 'time'
    this.setData({ sortBy: newSort })
    wx.setStorageSync('favSortBy', newSort)
    this.loadFavorites()
  },

  loadPopularTools: function() {
    var hotTools = toolsData.getHotTools()
    var favorites = storageUtil.safeGetArray('favorites')
    var toolsWithFav = []
    for (var ti = 0; ti < hotTools.length; ti++) {
      var tool = hotTools[ti]
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

    this.setData({ popularTools: i18n.translateTools(toolsWithFav) })
  },

  loadFavorites: function() {
    var favorites = storageUtil.safeGetArray('favorites')
    var allTools = toolsData.tools
    var favoriteTools = []

    for (var i = 0; i < favorites.length; i++) {
      for (var j = 0; j < allTools.length; j++) {
        if (allTools[j].id === favorites[i]) {
          favoriteTools.push(allTools[j])
          break
        }
      }
    }

    if (this.data.sortBy === 'name') {
      favoriteTools.sort(function(a, b) {
        return a.name.localeCompare(b.name, 'zh-CN')
      })
    }

    this.setData({ favoriteTools: i18n.translateTools(favoriteTools) })
  },

  onToolClick: function(e) {
    var tool = e.currentTarget.dataset.tool
    wx.vibrateShort({ type: 'light' })

    var targetUrl = toolsData.getRouteByToolId(tool.id)

    if (targetUrl) {
      wx.navigateTo({
        url: targetUrl,
        fail: function(err) {
          wx.showToast({ title: i18n.t('pageJumpFailed'), icon: 'none' })
        }
      })
    } else {
      wx.showToast({ title: i18n.t('pageJumpFailed'), icon: 'none' })
    }
  },

  toggleFavorite: function(e) {
    var id = e.currentTarget.dataset.id
    var favorites = storageUtil.safeGetArray('favorites')

    var index = -1
    for (var fi = 0; fi < favorites.length; fi++) {
      if (favorites[fi] === id) { index = fi; break }
    }
    if (index > -1) {
      favorites.splice(index, 1)
      wx.showToast({ title: i18n.t('removed'), icon: 'none', duration: 1500 })
    } else {
      favorites.push(id)
      wx.vibrateShort({ type: 'light' })
      wx.showToast({ title: i18n.t('added') + ' ⭐', icon: 'success', duration: 1200 })
    }

    wx.setStorageSync('favorites', favorites)
    this.loadFavorites()
    this.loadPopularTools()
  },

  removeFavorite: function(e) {
    var id = e.currentTarget.dataset.id
    var favorites = storageUtil.safeGetArray('favorites')
    var newFavorites = []
    for (var fi = 0; fi < favorites.length; fi++) {
      if (favorites[fi] !== id) newFavorites.push(favorites[fi])
    }
    favorites = newFavorites
    wx.setStorageSync('favorites', favorites)

    wx.vibrateShort({ type: 'light' })
    this.loadFavorites()
    this.loadPopularTools()

    wx.showToast({ title: i18n.t('removed'), icon: 'none', duration: 1500 })
  },

  goToHome: function() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onShareAppMessage: function() {
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
      }
    } catch(e) {}
    return {
      title: '🧰 ' + i18n.t('brandTitle') + ' - ' + i18n.t('myFavorites'),
      path: '/pages/favorites/favorites',
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
      }
    } catch(e) {}
    return {
      title: '🧰 ' + i18n.t('brandTitle') + ' - ' + i18n.t('slogan'),
      query: '',
      imageUrl: poster
    }
  }
})
