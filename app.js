var storageUtil = require('./utils/storage.js')
var toolsData = require('./data/tools.js')
var tracker = require('./utils/tracker.js')
var remoteConfig = require('./utils/remote-config.js')
var logger = require('./utils/logger.js')
var perf = require('./utils/perf.js')
var points = require('./utils/points.js')

App({
  storage: storageUtil,
  toolsData: toolsData,
  tracker: tracker,
  remoteConfig: remoteConfig,
  perf: perf,

  globalData: {
    userInfo: null,
    isDarkMode: false,
    sharePosterPath: '',
    toolPosterPath: '',
    openid: '',
    cloudReady: false
  },

  onLaunch: function() {
    logger.log('百宝工具箱启动')

    perf.init()
    this.initCloud()
    this.initLocalData()
    tracker.init()
    remoteConfig.init()
    this.applyTheme()

    if (wx.onThemeChange) {
      wx.onThemeChange(function(result) {
        var setting = storageUtil.get('darkModeSetting', 'system')
        if (setting === 'system') {
          this.applyTheme()
        }
      }.bind(this))
    }
  },

  onShow: function() {
    if (!this._appReadyMarked) {
      this._appReadyMarked = true
      var readyMs = perf.markAppReady()
      logger.log('[性能监控] App Ready: ' + readyMs + 'ms')
    }
  },

  onHide: function() {
    tracker.flush()
  },

  initCloud: function() {
    var that = this

    if (!wx.cloud) {
      logger.log('[云开发] 当前版本不支持云开发，使用本地模式')
      return
    }

    try {
      wx.cloud.init({
        traceUser: true
      })

      that.globalData.cloudReady = true
      logger.log('[云开发] 初始化成功(自动环境)')

      setTimeout(function() {
        try {
          var db = wx.cloud.database()
          db.collection('tool_records').count({
            success: function(res) {
              logger.log('[云数据库] 连接成功! tool_records记录数:', res.total)
              that.syncLocalToCloud()
            },
            fail: function(err) {
              logger.log('[云数据库] 连接失败，使用纯本地模式')
              that.globalData.cloudReady = false
            }
          })
        } catch(e) {
          logger.log('[云数据库] 检测连接异常:', e.message || e)
          that.globalData.cloudReady = false
        }
      }, 2000)
    } catch(e) {
      logger.log('[云开发] 初始化异常:', e.message || e)
      that.globalData.cloudReady = false
    }
  },

  initLocalData: function() {
    this._migrateWrappedKeys()
  },

  _migrateWrappedKeys: function() {
    try {
      var migrated = wx.getStorageSync('_storage_migrated_v2')
      if (migrated) return
      var keysToMigrate = [
        'favorites', 'recentTools', 'totalUsageCount', 'weeklyUsage', 'toolUsageLog',
        'checkin_records', 'user_points', 'total_earned_points',
        'searchHistory', 'customToolOrder', 'hiddenTools',
        'unlocked_achievements', 'achievement_progress',
        'feedbackHistory', 'userProfile', 'toolRequests',
        'darkMode', 'darkModeSetting', 'hasSeenGuide', 'guideVersion',
        'age_calc_history', 'date_calc_history', 'json_formatter_history',
        'cachedRates', 'world_clock_cities', 'water_reminder_interval',
        'water_reminder_last_time', 'water_records', 'countdown_events',
        'ruler_cal_version', 'ruler_calibration', 'white_noise_state',
        'danmaku_history', 'relative_call_history', 'ts_converter_history',
        'garbage_history', 'calc_history', 'random_decision_history',
        'pomodoro_records', 'pomodoro_daily_goal', 'qr_history'
      ]
      for (var i = 0; i < keysToMigrate.length; i++) {
        var key = keysToMigrate[i]
        try {
          var raw = wx.getStorageSync(key)
          if (raw === '' || raw === undefined || raw === null) continue
          if (typeof raw === 'object' && raw !== null && !Array.isArray(raw) && 'v' in raw && 'd' in raw && typeof raw.v === 'number' && 't' in raw) {
            wx.setStorageSync(key, raw.d)
          }
        } catch(e) {}
      }
      wx.setStorageSync('_storage_migrated_v2', true)
    } catch(e) {}
  },

  syncLocalToCloud: function() {
    var that = this
    if (!that.globalData.cloudReady) return

    setTimeout(function() {
      if (!that.globalData.cloudReady) return
      try {
        var db = wx.cloud.database()
        var totalUsage = 0
        try { totalUsage = storageUtil.get('totalUsageCount', 0); } catch(e) {}
        var todayStr = new Date().toDateString()
        var todayCount = 0
        try { todayCount = (storageUtil.get('weeklyUsage', {}))[todayStr] || 0; } catch(e) {}
        var recentTools = []
        try { recentTools = storageUtil.safeGetArray('recentTools'); } catch(e) {}

        db.collection('usage_log').add({
          data: {
            date: todayStr,
            count: todayCount,
            toolsUsed: recentTools.slice(0, 10),
            totalUsageCount: totalUsage,
            createdAt: db.serverDate()
          }
        }).then(function() {
          logger.log('[云端同步] usage_log 写入成功')
        }).catch(function(err) {
          logger.log('[云端同步] usage_log 失败:', (err && err.errMsg) || 'unknown')
        })
      } catch(e) {}
    }, 1000)
  },

  cloudSyncUsage: function(toolId, toolName) {
    if (!this.globalData.cloudReady) return
    var that = this
    setTimeout(function() {
      if (!that.globalData.cloudReady) return
      try {
        var db = wx.cloud.database()
        db.collection('usage_log').add({
          data: {
            toolId: toolId,
            toolName: toolName,
            usedAt: db.serverDate(),
            date: new Date().toDateString()
          }
        }).catch(function() {})
      } catch(e) {}
    }, 500)
  },

  cloudSyncWaterRecord: function(record) {
    if (!this.globalData.cloudReady) return
    setTimeout(function() {
      try {
        var db = wx.cloud.database()
        db.collection('tool_records').add({
          data: {
            toolType: 'water_reminder',
            record: record,
            createdAt: db.serverDate()
          }
        }).catch(function() {})
      } catch(e) {}
    }, 300)
  },

  cloudSyncPomodoroRecord: function(record) {
    if (!this.globalData.cloudReady) return
    setTimeout(function() {
      try {
        var db = wx.cloud.database()
        db.collection('tool_records').add({
          data: {
            toolType: 'pomodoro',
            record: record,
            createdAt: db.serverDate()
          }
        }).catch(function() {})
      } catch(e) {}
    }, 300)
  },

  cloudSyncFeedback: function(feedback) {
    if (!this.globalData.cloudReady) return
    var typeLabels = { bug: '问题反馈', suggestion: '功能建议', other: '其他', tool_request: '工具需求' }
    setTimeout(function() {
      try {
        var db = wx.cloud.database()
        db.collection('user_feedbacks').add({
          data: {
            type: feedback.type || 'feedback',
            typeName: typeLabels[feedback.type] || feedback.type || '其他',
            content: feedback.content || '',
            contact: feedback.contact || '',
            category: feedback.category || '',
            priority: feedback.priority || '',
            device: feedback.device || '',
            time: feedback.time || '',
            timestamp: Date.now(),
            status: 'pending',
            createdAt: db.serverDate()
          }
        }).then(function() {
          logger.log('[云端同步] 反馈已保存到 user_feedbacks')
        }).catch(function(err) {
          logger.log('[云端同步] 反馈失败:', (err && err.errMsg) || 'unknown')
        })
      } catch(e) {}
    }, 500)
  },

  applyTheme: function() {
    var setting = storageUtil.get('darkModeSetting', 'system')
    var isDark = false

    if (setting === 'system') {
      try {
        var res = wx.getSystemInfoSync()
        isDark = res.theme === 'dark'
      } catch (e) {
        isDark = false
      }
    } else {
      isDark = setting === 'dark'
    }

    this.globalData.isDarkMode = isDark
    wx.setStorageSync('darkMode', isDark)

    if (isDark) {
      wx.setBackgroundColor({ backgroundColor: '#0F172A', backgroundColorTop: '#0F172A', backgroundColorBottom: '#0F172A' })
      wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0F172A' })
      wx.setTabBarStyle({ color: '#64748B', selectedColor: '#60A5FA', backgroundColor: '#1E293B', borderStyle: 'black' })
    } else {
      wx.setBackgroundColor({ backgroundColor: '#F8FAFC', backgroundColorTop: '#F8FAFC', backgroundColorBottom: '#F8FAFC' })
      wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#F8FAFC' })
      wx.setTabBarStyle({ color: '#94A3B8', selectedColor: '#3B82F6', backgroundColor: '#FFFFFF', borderStyle: 'white' })
    }

    var pages = getCurrentPages()
    for (var pi = 0; pi < pages.length; pi++) {
      var page = pages[pi]
      if (page && page.setData) {
        page.setData({ isDarkMode: isDark })
      }
    }
  },

  lightTheme: {
    pageBg: '#F8FAFC', cardBg: '#FFFFFF', surfaceBg: '#F1F5F9',
    textPrimary: '#1E293B', textSecondary: '#64748B', textTertiary: '#94A3B8',
    borderLight: '#E2E8F0', borderFaint: '#F1F5F9'
  },

  darkTheme: {
    pageBg: '#0F172A', cardBg: '#1E293B', surfaceBg: '#1E293B',
    textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textTertiary: '#64748B',
    borderLight: '#334155', borderFaint: '#1E293B'
  },

  onShareAppMessage: function() {
    var poster = this.globalData.sharePosterPath || ''
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
      title: '\uD83C\uDFE0 \u767E\u5B9D\u5DE5\u5177\u7BB1 - 40+\u5B9E\u7528\u5C0F\u5DE5\u5177\u5408\u96C6',
      path: '/pages/index/index',
      imageUrl: poster
    };
  },

  onShareTimeline: function() {
    var poster = this.globalData.sharePosterPath || ''
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
      title: '\uD83C\uDFE0 \u767E\u5B9D\u5DE5\u5177\u7BB1 - \u6C47\u7387\u6362\u7B97\u3001\u5355\u4F4D\u8F6C\u6362\u7B4940+\u5B9E\u7528\u5DE5\u5177',
      query: '',
      imageUrl: poster
    };
  },

  onError: function(err) {
    logger.error('=== Global App Error ===', err)
    
    var errorMsg = '未知错误'
    if (typeof err === 'string') {
      errorMsg = err.length > 50 ? err.substring(0, 50) + '...' : err
    } else if (err && err.message) {
      errorMsg = err.message
    }

    wx.showToast({
      title: '应用异常，请重试',
      icon: 'none',
      duration: 2000
    })

    try {
      var errorLog = storageUtil.safeGetArray('errorLog')
      errorLog.push({
        time: new Date().toISOString(),
        error: errorMsg,
        page: getCurrentPages().length > 0 ? getCurrentPages()[getCurrentPages().length - 1].route : 'unknown'
      })
      if (errorLog.length > 20) errorLog = errorLog.slice(-20)
      wx.setStorageSync('errorLog', errorLog)
    } catch (e) {}
  }
})
