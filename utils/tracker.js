var MAX_QUEUE_SIZE = 50
var FLUSH_INTERVAL = 30000
var STORAGE_KEY = 'track_queue'
var storageUtil = require('./storage.js')

var Tracker = {
  _timer: null,
  _openid: '',

  init: function() {
    this._loadQueue()
    this._startFlushTimer()
    try {
      var openid = storageUtil.get('tracker_openid', '')
      if (openid) this._openid = openid
    } catch(e) {}
  },

  setOpenid: function(openid) {
    this._openid = openid
    try { wx.setStorageSync('tracker_openid', openid) } catch(e) {}
  },

  track: function(eventName, params) {
    var event = {
      event: eventName,
      params: params || {},
      time: new Date().getTime(),
      openid: this._openid,
      page: getCurrentPagePath()
    }
    this._enqueue(event)
  },

  pageView: function(pageName, source) {
    this.track('page_view', {
      page_name: pageName,
      source: source || ''
    })
  },

  toolUse: function(toolId, toolName, isFirstUse) {
    this.track('tool_use', {
      tool_id: toolId,
      tool_name: toolName,
      is_first_use: isFirstUse ? 1 : 0
    })
  },

  shareAction: function(shareType, shareTool) {
    this.track('share_action', {
      share_type: shareType,
      share_tool: shareTool || ''
    })
  },

  favoriteAction: function(toolId, action) {
    this.track('favorite_action', {
      tool_id: toolId,
      action: action
    })
  },

  checkinAction: function(continuousDays, points) {
    this.track('checkin_action', {
      continuous_days: continuousDays,
      points: points
    })
  },

  achievementUnlock: function(achievementId, achievementName) {
    this.track('achievement_unlock', {
      achievement_id: achievementId,
      achievement_name: achievementName
    })
  },

  getToolUsageStats: function() {
    var stats = {}
    try {
      var recentTools = storageUtil.safeGetArray('recentTools')
      var toolNameMap = {}
      for (var ti = 0; ti < recentTools.length; ti++) {
        toolNameMap[recentTools[ti].id] = { name: recentTools[ti].name, icon: recentTools[ti].icon, iconBg: recentTools[ti].iconBg }
      }
      var usageLog = storageUtil.safeGetArray('toolUsageLog')
      for (var i = 0; i < usageLog.length; i++) {
        var entry = usageLog[i]
        if (!stats[entry.id]) {
          var info = toolNameMap[entry.id] || {}
          stats[entry.id] = { id: entry.id, name: info.name || '', icon: info.icon || '', iconBg: info.iconBg || '', count: 0, lastUsed: 0 }
        }
        stats[entry.id].count++
        if (entry.usedAt && entry.usedAt > stats[entry.id].lastUsed) {
          stats[entry.id].lastUsed = entry.usedAt
        }
      }

      var weeklyUsage = storageUtil.get('weeklyUsage')
      if (typeof weeklyUsage !== 'object' || Array.isArray(weeklyUsage)) weeklyUsage = {}
      var today = new Date()
      var oneWeekAgo = today.getTime() - 7 * 24 * 3600000
      for (var wi = 0; wi < usageLog.length; wi++) {
        if (usageLog[wi].usedAt && usageLog[wi].usedAt >= oneWeekAgo) {
          var wid = usageLog[wi].id
          if (stats[wid]) {
            stats[wid].weeklyCount = (stats[wid].weeklyCount || 0) + 1
          }
        }
      }
    } catch(e) {}

    var statsArray = []
    for (var key in stats) {
      if (stats.hasOwnProperty(key)) {
        statsArray.push(stats[key])
      }
    }
    statsArray.sort(function(a, b) { return b.count - a.count })
    return statsArray
  },

  getRecommendedTools: function(allTools, limit) {
    var stats = this.getToolUsageStats()
    var limitNum = limit || 4
    var recommended = []

    if (stats.length > 0) {
      var usedIds = {}
      for (var si = 0; si < stats.length; si++) {
        usedIds[stats[si].id] = true
        if (recommended.length < limitNum) {
          for (var ai = 0; ai < allTools.length; ai++) {
            if (allTools[ai].id === stats[si].id) {
              var rec = {}
              for (var rk in allTools[ai]) rec[rk] = allTools[ai][rk]
              rec.useCount = stats[si].count
              rec.reason = '经常使用'
              recommended.push(rec)
              break
            }
          }
        }
      }

      var sameCategory = []
      for (var sci = 0; sci < stats.length && sameCategory.length < 2; sci++) {
        var topTool = null
        for (var sti = 0; sti < allTools.length; sti++) {
          if (allTools[sti].id === stats[sci].id) { topTool = allTools[sti]; break }
        }
        if (!topTool) continue
        for (var cci = 0; cci < allTools.length; cci++) {
          if (allTools[cci].category === topTool.category && !usedIds[allTools[cci].id]) {
            var catRec = {}
            for (var crk in allTools[cci]) catRec[crk] = allTools[cci][crk]
            catRec.reason = '同类推荐'
            sameCategory.push(catRec)
            usedIds[allTools[cci].id] = true
            break
          }
        }
      }

      for (var sri = 0; sri < sameCategory.length && recommended.length < limitNum; sri++) {
        recommended.push(sameCategory[sri])
      }
    }

    if (recommended.length < limitNum) {
      for (var hi = 0; hi < allTools.length && recommended.length < limitNum; hi++) {
        var alreadyAdded = false
        for (var ri2 = 0; ri2 < recommended.length; ri2++) {
          if (recommended[ri2].id === allTools[hi].id) { alreadyAdded = true; break }
        }
        if (!alreadyAdded && allTools[hi].isHot) {
          var hotRec = {}
          for (var hrk in allTools[hi]) hotRec[hrk] = allTools[hi][hrk]
          hotRec.reason = '热门工具'
          recommended.push(hotRec)
        }
      }
    }

    return recommended.slice(0, limitNum)
  },

  _enqueue: function(event) {
    try {
      var queue = this._getQueue()
      queue.push(event)
      if (queue.length > MAX_QUEUE_SIZE) {
        queue = queue.slice(queue.length - MAX_QUEUE_SIZE)
      }
      wx.setStorageSync(STORAGE_KEY, queue)
      if (queue.length >= 10) {
        this.flush()
      }
    } catch(e) {}
  },

  flush: function() {
    try {
      var queue = this._getQueue()
      if (queue.length === 0) return

      var batch = queue.slice()
      wx.removeStorageSync(STORAGE_KEY)

      this._uploadToCloud(batch)
    } catch(e) {}
  },

  _uploadToCloud: function(events) {
    try {
      var app = getApp()
      if (!app || !app.cloudReady) {
        this._requeue(events)
        return
      }

      var db = wx.cloud.database()
      for (var i = 0; i < events.length; i++) {
        db.collection('analytics_events').add({
          data: events[i]
        })
      }
    } catch(e) {
      this._requeue(events)
    }
  },

  _requeue: function(events) {
    try {
      var queue = this._getQueue()
      var merged = events.concat(queue)
      if (merged.length > MAX_QUEUE_SIZE) {
        merged = merged.slice(merged.length - MAX_QUEUE_SIZE)
      }
      wx.setStorageSync(STORAGE_KEY, merged)
    } catch(e) {}
  },

  _getQueue: function() {
    try {
      var q = storageUtil.safeGetArray(STORAGE_KEY)
    } catch(e) { return [] }
  },

  _loadQueue: function() {},

  _startFlushTimer: function() {
    var that = this
    if (this._timer) clearInterval(this._timer)
    this._timer = setInterval(function() {
      that.flush()
    }, FLUSH_INTERVAL)
  }
}

function getCurrentPagePath() {
  try {
    var pages = getCurrentPages()
    if (pages && pages.length > 0) {
      var page = pages[pages.length - 1]
      return '/' + page.route
    }
  } catch(e) {}
  return ''
}

module.exports = Tracker
