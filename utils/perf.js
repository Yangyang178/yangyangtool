var storageUtil = require('./storage.js')
var logger = require('./logger.js')

var PERF_KEY = 'perf_records'
var STORAGE_WARN_KEY = 'storage_warn_dismissed'
var MAX_RECORDS = 100
var STORAGE_LIMIT = 10 * 1024 * 1024
var WARN_THRESHOLD = 0.7
var DANGER_THRESHOLD = 0.9

var Perf = {
  _startTime: 0,
  _pageStartTimes: {},

  init: function() {
    this._startTime = Date.now()
    this._setupWxPerfMonitor()
    this.checkStorageCapacity()
  },

  _setupWxPerfMonitor: function() {
    try {
      if (wx.onMemoryWarning) {
        wx.onMemoryWarning(function(res) {
          var level = res && res.level || 0
          logger.warn('[性能监控] 内存警告 level=' + level)
          Perf._recordEvent('memory_warning', { level: level })
        })
      }
    } catch(e) {}

    try {
      var performance = wx.getPerformance ? wx.getPerformance() : null
      if (performance && performance.onPageLoad) {
        performance.onPageLoad(function(res) {
          Perf._recordEvent('wx_page_load', {
            path: res.path || '',
            duration: res.duration || 0
          })
        })
      }
    } catch(e) {}
  },

  markPageStart: function(pageName) {
    this._pageStartTimes[pageName] = Date.now()
  },

  markPageReady: function(pageName) {
    var startTime = this._pageStartTimes[pageName]
    if (!startTime) return 0
    var duration = Date.now() - startTime
    delete this._pageStartTimes[pageName]
    this._recordEvent('page_ready', {
      page: pageName,
      duration: duration
    })
    return duration
  },

  markAppReady: function() {
    var duration = Date.now() - this._startTime
    this._recordEvent('app_ready', { duration: duration })
    return duration
  },

  checkStorageCapacity: function() {
    var info = this.getStorageInfo()
    if (info.isDanger) {
      this._recordEvent('storage_danger', {
        usedKB: info.usedKB,
        percent: info.percent
      })
      this._showStorageWarning(info)
    } else if (info.isWarning) {
      this._recordEvent('storage_warning', {
        usedKB: info.usedKB,
        percent: info.percent
      })
    }
    return info
  },

  getStorageInfo: function() {
    try {
      var res = wx.getStorageInfoSync()
      var usedSize = res.currentSize || 0
      var limitSize = res.limitSize || STORAGE_LIMIT / 1024
      var usedBytes = usedSize * 1024
      var limitBytes = limitSize * 1024
      var percent = limitBytes > 0 ? usedBytes / limitBytes : 0
      return {
        keys: res.keys || [],
        keyCount: (res.keys || []).length,
        usedKB: usedSize,
        usedMB: (usedSize / 1024).toFixed(2),
        limitKB: limitSize,
        limitMB: (limitSize / 1024).toFixed(2),
        usedBytes: usedBytes,
        limitBytes: limitBytes,
        percent: Math.round(percent * 100),
        isWarning: percent >= WARN_THRESHOLD && percent < DANGER_THRESHOLD,
        isDanger: percent >= DANGER_THRESHOLD,
        remainingKB: limitSize - usedSize,
        remainingMB: ((limitSize - usedSize) / 1024).toFixed(2)
      }
    } catch(e) {
      return {
        keys: [],
        keyCount: 0,
        usedKB: 0,
        usedMB: '0.00',
        limitKB: STORAGE_LIMIT / 1024,
        limitMB: '10.00',
        usedBytes: 0,
        limitBytes: STORAGE_LIMIT,
        percent: 0,
        isWarning: false,
        isDanger: false,
        remainingKB: STORAGE_LIMIT / 1024,
        remainingMB: '10.00'
      }
    }
  },

  getStorageBreakdown: function() {
    var info = this.getStorageInfo()
    var breakdown = []
    var keys = info.keys
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      try {
        var data = storageUtil.get(key, '')
        var size = 0
        if (data !== '' && data !== undefined && data !== null) {
          var jsonStr = JSON.stringify(data)
          size = jsonStr.length * 2
        }
        var category = this._categorizeKey(key)
        breakdown.push({
          key: key,
          sizeBytes: size,
          sizeKB: (size / 1024).toFixed(1),
          category: category
        })
      } catch(e) {}
    }
    breakdown.sort(function(a, b) { return b.sizeBytes - a.sizeBytes })
    var categories = {}
    for (var j = 0; j < breakdown.length; j++) {
      var cat = breakdown[j].category
      if (!categories[cat]) categories[cat] = { name: cat, totalBytes: 0, count: 0 }
      categories[cat].totalBytes += breakdown[j].sizeBytes
      categories[cat].count++
    }
    var categoryList = []
    for (var k in categories) {
      categoryList.push({
        name: categories[k].name,
        totalBytes: categories[k].totalBytes,
        totalKB: (categories[k].totalBytes / 1024).toFixed(1),
        count: categories[k].count
      })
    }
    categoryList.sort(function(a, b) { return b.totalBytes - a.totalBytes })
    return {
      breakdown: breakdown.slice(0, 20),
      categories: categoryList,
      total: info
    }
  },

  _categorizeKey: function(key) {
    if (key === 'perf_records' || key === 'storage_warn_dismissed') return '系统设置'
    if (key.indexOf('checkin') > -1 || key.indexOf('points') > -1 || key.indexOf('earned') > -1) return '签到积分'
    if (key.indexOf('achievement') > -1 || key.indexOf('unlocked') > -1) return '成就系统'
    if (key.indexOf('favorite') > -1 || key.indexOf('recent') > -1 || key.indexOf('hidden') > -1 || key.indexOf('custom') > -1) return '工具偏好'
    if (key.indexOf('history') > -1 || key.indexOf('_history') > -1 || key.indexOf('records') > -1) return '使用记录'
    if (key.indexOf('dark') > -1 || key.indexOf('font') > -1 || key.indexOf('guide') > -1 || key.indexOf('migrated') > -1) return '系统设置'
    if (key.indexOf('daily_') > -1 || key.indexOf('invite') > -1 || key.indexOf('shop') > -1 || key.indexOf('badge') > -1 || key.indexOf('frame') > -1 || key.indexOf('theme') > -1) return '积分中心'
    if (key.indexOf('water') > -1 || key.indexOf('pomodoro') > -1 || key.indexOf('countdown') > -1 || key.indexOf('danmaku') > -1 || key.indexOf('account_book') > -1) return '生活工具'
    if (key.indexOf('cached') > -1 || key.indexOf('cache') > -1 || key.indexOf('temp') > -1) return '缓存数据'
    if (key.indexOf('weekly') > -1 || key.indexOf('totalUsage') > -1 || key.indexOf('searchHistory') > -1) return '统计搜索'
    if (key.indexOf('feedback') > -1 || key.indexOf('profile') > -1 || key.indexOf('request') > -1) return '用户数据'
    return '其他'
  },

  _showStorageWarning: function(info) {
    var dismissed = storageUtil.get(STORAGE_WARN_KEY + '_' + this._getToday(), false)
    if (dismissed) return
    wx.showModal({
      title: '⚠️ 存储空间不足',
      content: '当前已使用 ' + info.usedMB + 'MB / ' + info.limitMB + 'MB (' + info.percent + '%)\n\n建议清理缓存数据以释放空间，避免数据丢失。',
      confirmText: '去清理',
      cancelText: '暂不',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/recent/recent' })
        }
      }
    })
  },

  dismissStorageWarning: function() {
    storageUtil.set(STORAGE_WARN_KEY + '_' + this._getToday(), true)
  },

  getPerfRecords: function(count) {
    var records = storageUtil.safeGetArray(PERF_KEY)
    return records.slice(0, count || 20)
  },

  getPageLoadStats: function() {
    var records = storageUtil.safeGetArray(PERF_KEY)
    var pageStats = {}
    for (var i = 0; i < records.length; i++) {
      var r = records[i]
      if (r.type === 'page_ready' && r.data && r.data.page) {
        var page = r.data.page
        if (!pageStats[page]) {
          pageStats[page] = { page: page, count: 0, totalMs: 0, minMs: Infinity, maxMs: 0, avgMs: 0 }
        }
        var dur = r.data.duration || 0
        pageStats[page].count++
        pageStats[page].totalMs += dur
        if (dur < pageStats[page].minMs) pageStats[page].minMs = dur
        if (dur > pageStats[page].maxMs) pageStats[page].maxMs = dur
      }
    }
    var list = []
    for (var k in pageStats) {
      pageStats[k].avgMs = pageStats[k].count > 0 ? Math.round(pageStats[k].totalMs / pageStats[k].count) : 0
      if (pageStats[k].minMs === Infinity) pageStats[k].minMs = 0
      list.push(pageStats[k])
    }
    list.sort(function(a, b) { return b.avgMs - a.avgMs })
    return list
  },

  getPerfSummary: function() {
    var storageInfo = this.getStorageInfo()
    var pageStats = this.getPageLoadStats()
    var records = storageUtil.safeGetArray(PERF_KEY)
    var appReadyRecord = null
    for (var i = 0; i < records.length; i++) {
      if (records[i].type === 'app_ready') {
        appReadyRecord = records[i]
        break
      }
    }
    var lastMemoryWarning = null
    for (var j = 0; j < records.length; j++) {
      if (records[j].type === 'memory_warning') {
        lastMemoryWarning = records[j]
      }
    }
    return {
      storageInfo: storageInfo,
      pageLoadStats: pageStats,
      appReadyMs: appReadyRecord ? (appReadyRecord.data && appReadyRecord.data.duration) || 0 : 0,
      lastMemoryWarning: lastMemoryWarning ? lastMemoryWarning.time : '',
      totalEvents: records.length
    }
  },

  _recordEvent: function(type, data) {
    var records = storageUtil.safeGetArray(PERF_KEY)
    records.unshift({
      type: type,
      time: new Date().toISOString(),
      data: data || {}
    })
    if (records.length > MAX_RECORDS) records = records.slice(0, MAX_RECORDS)
    storageUtil.set(PERF_KEY, records)
  },

  _getToday: function() {
    var d = new Date()
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
  },

  clearPerfRecords: function() {
    storageUtil.set(PERF_KEY, [])
    return { success: true }
  }
}

module.exports = Perf
