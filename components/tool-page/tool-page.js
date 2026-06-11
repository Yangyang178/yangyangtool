var toolsData = require('../../data/tools.js')
var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')

var _toolActions = {
  vibrate: function(type) {
    try { wx.vibrateShort({ type: type || 'light' }) } catch(e) {}
  },
  copyText: function(text, label) {
    if (text === undefined || text === null || text === '') {
      wx.showToast({ title: i18n.t('noData'), icon: 'none' })
      return
    }
    text = String(text)
    if (!text.trim() || text === '-') {
      wx.showToast({ title: i18n.t('noData'), icon: 'none' })
      return
    }
    _toolActions.vibrate('light')
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: label || i18n.t('copied'), icon: 'success' })
      }
    })
  },
  resetConfirm: function(callback) {
    _toolActions.vibrate('light')
    wx.showModal({
      title: i18n.t('confirm'),
      content: i18n.t('resetConfirmContent'),
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm && typeof callback === 'function') callback()
      }
    })
  }
}

Component({
  properties: {
    title: { type: String, value: '工具' },
    desc: { type: String, value: '' },
    icon: { type: String, value: '' },
    iconBg: { type: String, value: '' },
    badge: { type: String, value: '' },
    showHeader: { type: Boolean, value: true },
    navColor: { type: String, value: 'black' },
    navBg: { type: String, value: '#F8FAFC' },
    actions: { type: Array, value: [] },
    tips: { type: Array, value: [] },
    tipsTitle: { type: String, value: '' },
    toolId: { type: Number, value: 0 },
    resultText: { type: String, value: '' },
    showCopyBtn: { type: Boolean, value: false },
    showResetBtn: { type: Boolean, value: false }
  },

  data: {
    isDarkMode: false,
    relatedTools: [],
    themeStyle: '',
    isShortcut: false,
    fontClass: '',
    i18n: {}
  },

  lifetimes: {
    attached: function() {
      this.applyDarkMode()
      if (this.properties.toolId) {
        this.loadRelatedTools(this.properties.toolId)
        this.checkShortcutStatus()
      }
    }
  },

  pageLifetimes: {
    show: function() {
      this.applyDarkMode()
    }
  },

  methods: {
    applyDarkMode: function() {
      var setting = storageUtil.get('darkModeSetting', 'system')
      var isDark = false
      if (setting === 'dark') {
        isDark = true
      } else if (setting === 'system') {
        try {
          var sysInfo = wx.getSystemInfoSync()
          isDark = sysInfo.theme === 'dark'
        } catch(e) {}
      } else {
        isDark = storageUtil.get('darkMode') || false
      }
      var themeStyle = points.getThemeStyle()
      var fontClass = points.getFontClass()
      var allTexts = i18n.getAllTexts()
      var relatedTools = i18n.translateTools(this.data.relatedTools)
      this.setData({
        isDarkMode: isDark,
        navColor: isDark ? 'white' : 'black',
        navBg: isDark ? '#0F172A' : '#F8FAFC',
        themeStyle: themeStyle,
        fontClass: fontClass,
        i18n: allTexts,
        relatedTools: relatedTools
      })
    },

    loadRelatedTools: function(toolId) {
      var tool = toolsData.getToolById(toolId)
      if (!tool) return
      var sameCategory = toolsData.getToolsByCategory(tool.category)
      var related = []
      for (var i = 0; i < sameCategory.length; i++) {
        if (sameCategory[i].id !== toolId) {
          var route = toolsData.getRouteByToolId(sameCategory[i].id)
          related.push({
            id: sameCategory[i].id,
            name: sameCategory[i].name,
            description: sameCategory[i].description,
            icon: sameCategory[i].icon,
            iconBg: sameCategory[i].iconBg,
            route: route
          })
        }
        if (related.length >= 3) break
      }
      this.setData({ relatedTools: i18n.translateTools(related) })
    },

    onRelatedTap: function(e) {
      var route = e.currentTarget.dataset.route
      if (!route) return
      wx.navigateTo({
        url: route,
        fail: function() {
          wx.showToast({ title: i18n.t('pageJumpFailed'), icon: 'none' })
        }
      })
    },

    onCopyResult: function() {
      var text = this.properties.resultText
      _toolActions.copyText(text)
      this.triggerEvent('copy', { text: text })
    },

    onResetData: function() {
      var that = this
      _toolActions.resetConfirm(function() {
        that.triggerEvent('reset')
      })
    },

    vibrate: function(type) {
      _toolActions.vibrate(type)
    },

    checkShortcutStatus: function() {
      var toolId = this.properties.toolId
      if (!toolId) return
      var shortcutIds = storageUtil.safeGetArray('shortcut_tool_ids')
      var found = false
      for (var i = 0; i < shortcutIds.length; i++) {
        if (shortcutIds[i] === toolId) { found = true; break }
      }
      this.setData({ isShortcut: found })
    },

    toggleShortcut: function() {
      var toolId = this.properties.toolId
      if (!toolId) return
      var shortcutIds = storageUtil.safeGetArray('shortcut_tool_ids')
      var found = false
      for (var i = 0; i < shortcutIds.length; i++) {
        if (shortcutIds[i] === toolId) { found = true; break }
      }
      if (found) {
        var newIds = []
        for (var j = 0; j < shortcutIds.length; j++) {
          if (shortcutIds[j] !== toolId) newIds.push(shortcutIds[j])
        }
        storageUtil.set('shortcut_tool_ids', newIds)
        this.setData({ isShortcut: false })
        wx.showToast({ title: i18n.t('shortcutRemoved'), icon: 'none' })
      } else {
        if (shortcutIds.length >= 8) {
          wx.showToast({ title: i18n.t('maxShortcut'), icon: 'none' })
          return
        }
        shortcutIds.push(toolId)
        storageUtil.set('shortcut_tool_ids', shortcutIds)
        this.setData({ isShortcut: true })
        wx.showToast({ title: i18n.t('shortcutAdded'), icon: 'success' })
      }
      this.triggerEvent('shortcutchange', { toolId: toolId, isShortcut: !found })
    }
  }
})
