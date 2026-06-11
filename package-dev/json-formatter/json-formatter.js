var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var sampleJson = `{
  "name": "百宝工具箱",
  "version": "1.0.0",
  "author": {
    "name": "开发者",
    "email": "dev@example.com"
  },
  "tools": [
    {"id": 1, "name": "计算器", "category": "计算"},
    {"id": 2, "name": "转换器", "category": "转换"},
    {"id": 3, "name": "格式化", "category": "开发"}
  ],
  "settings": {
    "theme": "light",
    "language": "zh-CN",
    "notifications": true
  },
  "stats": {
    "users": 10000,
    "rating": 4.8,
    "downloads": 50000
  }
}`

Page({
  data: {
    inputJson: '',
    outputJson: '',
    errorMsg: '',
    jsonSize: 0,
    outputStats: {
      chars: 0,
      lines: 0,
      size: '0 B'
    },
    historyList: [],
    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var i18nTexts = i18n.getToolPageTexts('jsonFormatter')
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('JSON格式化')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    this.loadHistory()
    poster.setupForPage(this, 17)
  },
  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('jsonFormatter') })
  },

  onInputChange(e) {
    var value = e.detail.value
    this.setData({
      inputJson: value,
      errorMsg: ''
    })

    if (value.trim()) {
      this.setData({ jsonSize: value.length })
      this.validateJsonSilent(value)
    } else {
      this.setData({ jsonSize: 0 })
    }
  },

  validateJsonSilent(jsonStr) {
    try {
      JSON.parse(jsonStr)
      return true
    } catch (e) {
      return false
    }
  },

  formatJson() {
    wx.vibrateShort({ type: 'medium' })

    var { inputJson } = this.data

    if (!inputJson.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInputJson, icon: 'none' })
      return
    }

    try {
      var parsed = JSON.parse(inputJson)
      var formatted = JSON.stringify(parsed, null, 2)

      var stats = this.calculateStats(formatted)

      this.setData({
        outputJson: formatted,
        errorMsg: '',
        outputStats: stats
      })

      this.addToHistory(inputJson, 'format')
      wx.showToast({ title: this.data.i18n.formatSuccess, icon: 'success' })
      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(17, 'JSON格式化', false)
    } catch (e) {
      var errorInfo = this.parseError(e.message, inputJson)
      this.setData({
        errorMsg: errorInfo,
        outputJson: ''
      })
    }
  },

  compressJson() {
    wx.vibrateShort({ type: 'medium' })

    var { inputJson } = this.data

    if (!inputJson.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInputJson, icon: 'none' })
      return
    }

    try {
      var parsed = JSON.parse(inputJson)
      var compressed = JSON.stringify(parsed)

      var stats = this.calculateStats(compressed)

      this.setData({
        outputJson: compressed,
        errorMsg: '',
        outputStats: stats
      })

      this.addToHistory(inputJson, 'compress')
      wx.showToast({ title: this.data.i18n.compressSuccess, icon: 'success' })
      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(17, 'JSON格式化', false)
    } catch (e) {
      var errorInfo = this.parseError(e.message, inputJson)
      this.setData({
        errorMsg: errorInfo,
        outputJson: ''
      })
    }
  },

  validateJson() {
    wx.vibrateShort({ type: 'medium' })

    var { inputJson } = this.data

    if (!inputJson.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInputJson, icon: 'none' })
      return
    }

    try {
      JSON.parse(inputJson)

      var parsed = JSON.parse(inputJson)
      var formatted = JSON.stringify(parsed, null, 2)
      var stats = this.calculateStats(formatted)

      this.setData({
        outputJson: formatted,
        errorMsg: '',
        jsonSize: inputJson.length,
        outputStats: stats
      })

      wx.showModal({
        title: this.data.i18n.validatePassTitle,
        content: this.data.i18n.validatePassContent + '\n\n' + this.data.i18n.charCountLabel + inputJson.length + '\n' + this.data.i18n.dataTypeLabel + this.getDataType(parsed),
        showCancel: false,
        confirmText: this.data.i18n.greatBtn
      })
    } catch (e) {
      var errorInfo = this.parseError(e.message, inputJson)
      this.setData({
        errorMsg: errorInfo,
        outputJson: ''
      })
    }
  },

  parseError(errorMessage, jsonStr) {
    var positionMatch = errorMessage.match(/position\s+(\d+)/i)
    var lineMatch = errorMessage.match(/line\s+(\d+)/i)

    if (positionMatch) {
      var pos = parseInt(positionMatch[1])
      var previewStart = Math.max(0, pos - 30)
      var previewEnd = Math.min(jsonStr.length, pos + 30)
      var preview = jsonStr.substring(previewStart, previewEnd)

      return '语法错误（位置 ' + pos + '）:\n' + errorMessage + '\n\n附近内容：...' + preview + '...'
    }

    if (lineMatch) {
      return '第 ' + lineMatch[1] + ' 行出错:\n' + errorMessage
    }

    return 'JSON解析错误:\n' + errorMessage
  },

  getDataType(data) {
    if (Array.isArray(data)) return '数组'
    if (typeof data === 'object') return '对象'
    return typeof data
  },

  calculateStats(jsonStr) {
    var chars = jsonStr.length
    var lines = jsonStr.split('\n').length
    var bytes = new Blob([jsonStr]).size

    var sizeStr = ''
    if (bytes < 1024) {
      sizeStr = bytes + ' B'
    } else if (bytes < 1024 * 1024) {
      sizeStr = (bytes / 1024).toFixed(1) + ' KB'
    } else {
      sizeStr = (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return {
      chars: chars.toLocaleString(),
      lines: lines.toString(),
      size: sizeStr
    }
  },

  pasteFromClipboard() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.getClipboardData({
      success: function(res) {
        if (res.data.trim()) {
          that.setData({
            inputJson: res.data,
            errorMsg: ''
          })

          if (that.validateJsonSilent(res.data)) {
            that.setData({ jsonSize: res.data.length })
          }

          wx.showToast({ title: this.data.i18n.pasted, icon: 'success' })
        } else {
          wx.showToast({ title: this.data.i18n.clipboardEmpty, icon: 'none' })
        }
      },
      fail: function() {
        wx.showToast({ title: this.data.i18n.readFailed, icon: 'none' })
      }
    })
  },

  loadSample() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputJson: sampleJson,
      errorMsg: '',
      jsonSize: sampleJson.length
    })
    wx.showToast({ title: this.data.i18n.sampleLoaded, icon: 'success' })
  },

  clearInput() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputJson: '',
      outputJson: '',
      errorMsg: '',
      jsonSize: 0
    })
  },

  copyOutput: function() {
    wx.vibrateShort({ type: 'light' })

    if (!this.data.outputJson) {
      wx.showToast({ title: this.data.i18n.noContentToCopy, icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: this.data.outputJson,
      success: function() {
        wx.showToast({ title: this.data.i18n.copiedToClipboard, icon: 'success' })
      }
    })
  },

  addToHistory(jsonStr, type) {
    var history = storageUtil.safeGetArray('json_formatter_history')

    var preview = jsonStr.substring(0, 50) + (jsonStr.length > 50 ? '...' : '')

    var newRecord = {
      original: jsonStr,
      preview,
      type,
      typeText: type === 'format' ? this.data.i18n.format : this.data.i18n.compress,
      time: Date.now(),
      timeText: this.formatTime(new Date())
    }

    history.unshift(newRecord)
    var saved = history.slice(0, 15)
    wx.setStorageSync('json_formatter_history', saved)
    this.setData({ historyList: saved.slice(0, 8) })
  },

  loadHistoryItem(e) {
    wx.vibrateShort({ type: 'light' })
    var index = e.currentTarget.dataset.index
    var item = this.data.historyList[index]

    this.setData({
      inputJson: item.original,
      errorMsg: '',
      jsonSize: item.original.length
    })
  },

  formatTime(date) {
    var hours = String(date.getHours()).padStart(2, '0')
    var minutes = String(date.getMinutes()).padStart(2, '0')
    return hours + ':' + minutes
  },

  loadHistory() {
    var history = storageUtil.safeGetArray('json_formatter_history')
    this.setData({ historyList: history.slice(0, 8) })
  },

  clearHistory() {
    var that = this
    wx.showModal({
      title: this.data.i18n.tipTitle,
      content: this.data.i18n.confirmClearHistory,
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('json_formatter_history')
          that.setData({ historyList: [] })
          wx.showToast({ title: this.data.i18n.cleared, icon: 'success' })
        }
      }
    })
  },

  copyResult: function() {
    toolActions.copyText(this.data.outputText, this.data.i18n.copiedToClipboard, this.data.i18n)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('{} JSON格式化 - 百宝工具箱', '/package-dev/json-formatter/json-formatter')
  },
  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        inputJson: '',
        outputJson: '',
        errorMsg: '',
        jsonSize: 0
      })
    }, that.data.i18n)
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('{} JSON格式化 - 百宝工具箱')
  }
})
