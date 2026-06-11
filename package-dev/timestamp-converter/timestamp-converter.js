var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var app = getApp()

Page({
  data: {
    currentTimestamp: '',
    currentTimestampMs: '',
    activeTab: 0,
    timestampInput: '',
    timestampUnit: 'auto',
    ts2dateResult: null,
    dateValue: '',
    timeValue: '',
    dateTsResult: null,
    history: [],
    batchInput: '',
    batchResults: [],
    showBatch: false,
    quickTimestamps: [
      { label: '今天0点', getTs: function() { var d = new Date(); d.setHours(0,0,0,0); return Math.floor(d.getTime()/1000) } },
      { label: '昨天0点', getTs: function() { var d = new Date(); d.setDate(d.getDate()-1); d.setHours(0,0,0,0); return Math.floor(d.getTime()/1000) } },
      { label: '本周一', getTs: function() { var d = new Date(); var day = d.getDay()||7; d.setDate(d.getDate()-day+1); d.setHours(0,0,0,0); return Math.floor(d.getTime()/1000) } },
      { label: '本月1号', getTs: function() { var d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return Math.floor(d.getTime()/1000) } },
      { label: '今年1月1日', getTs: function() { return Math.floor(new Date(new Date().getFullYear(),0,1).getTime()/1000) } },
      { label: '2000-01-01', getTs: function() { return 946684800 } }
    ],
    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  _timer: null,

  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var i18nTexts = i18n.getToolPageTexts('timestampConverter')
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('时间戳转换')
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    this._updateCurrentTimestamp()
    var self = this
    this._timer = setInterval(function () {
      self._updateCurrentTimestamp()
    }, 1000)
    this._loadHistory()
    poster.setupForPage(this, 28)
  },
  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('timestampConverter') })
  },

  onUnload: function () {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },

  _updateCurrentTimestamp: function () {
    var now = Date.now()
    this.setData({
      currentTimestamp: Math.floor(now / 1000),
      currentTimestampMs: now
    })
  },

  _loadHistory: function () {
    try {
      var history = storageUtil.safeGetArray('ts_converter_history')
      if (history && history.length) {
        this.setData({ history: history })
      }
    } catch (e) {}
  },

  _saveHistory: function () {
    try {
      wx.setStorageSync('ts_converter_history', this.data.history)
    } catch (e) {}
  },

  _addToHistory: function (input, output, type) {
    var history = this.data.history.slice()
    history.unshift({
      input: input,
      output: output,
      type: type,
      time: this._formatDateTime(new Date())
    })
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    this.setData({ history: history })
    this._saveHistory()
  },

  _normalizeTimestamp: function (input) {
    var ts = Number(input)
    if (isNaN(ts) || ts <= 0) return null
    if (this.data.timestampUnit === 'ms') {
      return ts
    }
    if (this.data.timestampUnit === 's') {
      return ts * 1000
    }
    if (String(ts).length <= 10) {
      return ts * 1000
    }
    return ts
  },

  _formatDateTime: function (date) {
    var y = date.getFullYear()
    var M = this._pad(date.getMonth() + 1)
    var d = this._pad(date.getDate())
    var h = this._pad(date.getHours())
    var m = this._pad(date.getMinutes())
    var s = this._pad(date.getSeconds())
    return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s
  },

  _formatISO: function (date) {
    return date.toISOString()
  },

  _formatUTC: function (date) {
    return date.toUTCString()
  },

  _formatRelative: function (date) {
    var now = Date.now()
    var diff = now - date.getTime()
    var absDiff = Math.abs(diff)
    var isFuture = diff < 0
    var suffix = isFuture ? '后' : '前'

    if (absDiff < 60000) return '刚刚'
    if (absDiff < 3600000) return Math.floor(absDiff / 60000) + '分钟' + suffix
    if (absDiff < 86400000) return Math.floor(absDiff / 3600000) + '小时' + suffix
    if (absDiff < 2592000000) return Math.floor(absDiff / 86400000) + '天' + suffix
    if (absDiff < 31536000000) return Math.floor(absDiff / 2592000000) + '个月' + suffix
    return Math.floor(absDiff / 31536000000) + '年' + suffix
  },

  _pad: function (n) {
    return n < 10 ? '0' + n : String(n)
  },

  onTabChange: function (e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  onTimestampInput: function (e) {
    this.setData({ timestampInput: e.detail.value })
  },

  onUnitChange: function (e) {
    this.setData({ timestampUnit: e.currentTarget.dataset.unit })
  },

  onConvertTs2Date: function () {
    var input = this.data.timestampInput.trim()
    if (!input) {
      wx.showToast({ title: this.data.i18n.pleaseInputTimestamp, icon: 'none' })
      return
    }
    var ms = this._normalizeTimestamp(input)
    if (!ms) {
      wx.showToast({ title: this.data.i18n.invalidTimestamp, icon: 'none' })
      return
    }
    var date = new Date(ms)
    if (isNaN(date.getTime())) {
      wx.showToast({ title: this.data.i18n.invalidTimestamp, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    var result = {
      local: this._formatDateTime(date),
      iso: this._formatISO(date),
      utc: this._formatUTC(date),
      relative: this._formatRelative(date),
      tsSeconds: Math.floor(ms / 1000),
      tsMillis: ms
    }
    this.setData({ ts2dateResult: result })
    this._addToHistory(input, result.local, 'ts2date')
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(28, '时间戳转换', false)
  },

  onDateChange: function (e) {
    this.setData({ dateValue: e.detail.value })
  },

  onTimeChange: function (e) {
    this.setData({ timeValue: e.detail.value })
  },

  onConvertDate2Ts: function () {
    var dateVal = this.data.dateValue
    var timeVal = this.data.timeValue
    if (!dateVal) {
      wx.showToast({ title: this.data.i18n.pleaseSelectDate, icon: 'none' })
      return
    }
    if (!timeVal) {
      timeVal = '00:00'
    }
    wx.vibrateShort({ type: 'light' })
    var dateStr = dateVal + ' ' + timeVal + ':00'
    var date = new Date(dateStr.replace(/-/g, '/'))
    if (isNaN(date.getTime())) {
      wx.showToast({ title: this.data.i18n.invalidDate, icon: 'none' })
      return
    }
    var tsSeconds = Math.floor(date.getTime() / 1000)
    var tsMillis = date.getTime()
    var result = {
      seconds: tsSeconds,
      millis: tsMillis,
      local: this._formatDateTime(date),
      iso: this._formatISO(date),
      utc: this._formatUTC(date)
    }
    this.setData({ dateTsResult: result })
    this._addToHistory(dateStr, String(tsSeconds), 'date2ts')
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(28, '时间戳转换', false)
  },

  onUseCurrentTimestamp: function () {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      timestampInput: String(Math.floor(Date.now() / 1000)),
      activeTab: 0
    })
    this.onConvertTs2Date()
  },

  onQuickTimestamp: function(e) {
    var index = e.currentTarget.dataset.index
    var item = this.data.quickTimestamps[index]
    if (!item) return
    wx.vibrateShort({ type: 'light' })
    var ts = item.getTs()
    this.setData({
      timestampInput: String(ts),
      activeTab: 0
    })
    this.onConvertTs2Date()
  },

  toggleBatch: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ showBatch: !this.data.showBatch })
  },

  onBatchInput: function(e) {
    this.setData({ batchInput: e.detail.value })
  },

  onBatchConvert: function() {
    var input = this.data.batchInput.trim()
    if (!input) {
      wx.showToast({ title: this.data.i18n.pleaseInputTimestamp, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    var parts = input.split(/[\n,;，；\s]+/)
    var results = []
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim()
      if (!part) continue
      var ts = Number(part)
      if (isNaN(ts) || ts <= 0) {
        results.push({ input: part, valid: false, error: this.data.i18n.invalidTimestamp })
        continue
      }
      var ms = ts
      if (String(ts).length <= 10) {
        ms = ts * 1000
      }
      var date = new Date(ms)
      if (isNaN(date.getTime())) {
        results.push({ input: part, valid: false, error: this.data.i18n.invalidDate })
        continue
      }
      results.push({
        input: part,
        valid: true,
        local: this._formatDateTime(date),
        iso: this._formatISO(date),
        relative: this._formatRelative(date),
        tsSeconds: Math.floor(ms / 1000),
        tsMillis: ms
      })
    }
    this.setData({ batchResults: results })
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(28, '时间戳转换', false)
  },

  onCopyBatchAll: function() {
    var that = this
    var results = this.data.batchResults
    if (!results || results.length === 0) return
    wx.vibrateShort({ type: 'light' })
    var text = ''
    for (var i = 0; i < results.length; i++) {
      var r = results[i]
      if (r.valid) {
        text += r.input + ' → ' + r.local + '\n'
      } else {
        text += r.input + ' → ' + r.error + '\n'
      }
    }
    wx.setClipboardData({
      data: text.trim(),
      success: function() { wx.showToast({ title: that.data.i18n.copiedAllResults, icon: 'success' }) }
    })
  },

  onCopyBatchOne: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var r = this.data.batchResults[index]
    if (!r || !r.valid) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: r.local,
      success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  onCopyResult: function (e) {
    var that = this
    var text = e.currentTarget.dataset.text
    if (!text) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: String(text),
      success: function () {
        wx.showToast({ title: that.data.i18n.copied, icon: 'success' })
      }
    })
  },

  onCopyCurrentTs: function () {
    var that = this
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: String(this.data.currentTimestamp),
      success: function () {
        wx.showToast({ title: that.data.i18n.copiedSecondTs, icon: 'success' })
      }
    })
  },

  onHistoryItemTap: function (e) {
    var index = e.currentTarget.dataset.index
    var item = this.data.history[index]
    if (!item) return
    wx.vibrateShort({ type: 'light' })
    if (item.type === 'ts2date') {
      this.setData({
        timestampInput: item.input,
        activeTab: 0
      })
      this.onConvertTs2Date()
    } else {
      var parts = item.input.split(' ')
      var datePart = parts[0] || ''
      var timePart = (parts[1] || '').substring(0, 5)
      this.setData({
        dateValue: datePart,
        timeValue: timePart,
        activeTab: 1
      })
      this.onConvertDate2Ts()
    }
  },

  onClearHistory: function () {
    wx.vibrateShort({ type: 'medium' })
    this.setData({ history: [] })
    try {
      wx.removeStorageSync('ts_converter_history')
    } catch (e) {}
    wx.showToast({ title: this.data.i18n.cleared, icon: 'success' })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        timestampInput: '',
        timestampUnit: 'auto',
        ts2dateResult: null,
        dateValue: '',
        timeValue: '',
        dateTsResult: null,
        activeTab: 0
      })
    }, that.data.i18n)
  },

  copyResult: function() {
    var text = ''
    if (this.data.activeTab === 0 && this.data.ts2dateResult) {
      var r = this.data.ts2dateResult
      text = r.local + ' (秒: ' + r.tsSeconds + ', 毫秒: ' + r.tsMillis + ')'
    } else if (this.data.activeTab === 1 && this.data.dateTsResult) {
      var r2 = this.data.dateTsResult
      text = r2.local + ' (秒: ' + r2.seconds + ', 毫秒: ' + r2.millis + ')'
    }
    if (!text) {
      wx.showToast({ title: this.data.i18n.noResultToCopy, icon: 'none' })
      return
    }
    toolActions.copyText(text, this.data.i18n.copied, this.data.i18n)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('⏱️ 时间戳转换 - 百宝工具箱', '/package-dev/timestamp-converter/timestamp-converter')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('⏱️ 时间戳转换 - 百宝工具箱')
  }
})
