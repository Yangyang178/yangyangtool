var storageUtil = require('./utils/storage.js')
var toolsData = require('./data/tools.js')
var tracker = require('./utils/tracker.js')
var remoteConfig = require('./utils/remote-config.js')
var logger = require('./utils/logger.js')
var perf = require('./utils/perf.js')
var points = require('./utils/points.js')
var cloudSync = require('./utils/cloud-sync.js')

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
    cloudReady: false,
    appVersion: '2.0'
  },

  onLaunch: function() {
    logger.log('百宝工具箱启动')

    perf.init()
    this.initCloud()
    this.initLocalData()
    tracker.init()
    remoteConfig.init()
    this.applyTheme()
    this.cleanStorage()
    this.loadCustomFonts()

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
              that.autoRestoreIfNeeded()
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

  loadCustomFonts: function() {
    var activeFont = points.getActiveFont()
    if (activeFont && activeFont.fontUrl) {
      var fontFamily = activeFont.fontFamily
      var fontUrl = activeFont.fontUrl
      // 云存储路径需要先下载到本地
      if (fontUrl.indexOf('cloud://') === 0) {
        wx.cloud.downloadFile({
          fileID: fontUrl,
          success: function(res) {
            if (res.tempFilePath) {
              wx.loadFontFace({
                family: fontFamily,
                source: 'url("' + res.tempFilePath + '")',
                global: true,
                success: function() {
                  logger.log('云存储字体加载成功:', fontFamily)
                },
                fail: function(err) {
                  logger.warn('云存储字体loadFontFace失败:', err)
                }
              })
            }
          },
          fail: function(err) {
            logger.warn('云存储字体下载失败:', err)
          }
        })
      } else {
        wx.loadFontFace({
          family: fontFamily,
          source: 'url("' + fontUrl + '")',
          global: true,
          success: function(res) {
            logger.log('字体加载成功:', fontFamily)
          },
          fail: function(err) {
            logger.warn('字体加载失败:', err)
          }
        })
      }
    }
  },

  _migrateWrappedKeys: function() {
    try {
      var migrated = wx.getStorageSync('_storage_migrated_v2')
      if (migrated) return
      var keysToMigrate = [
        'favorites', 'recentTools', 'totalUsageCount', 'weeklyUsage', 'toolUsageLog',
        'checkin_records', 'user_points', 'total_earned_points',
        'daily_tasks', 'invite_records',
        'owned_shop_items', 'active_avatar_frame', 'active_theme_color', 'active_font_family',
        'searchHistory', 'customToolOrder', 'hiddenTools',
        'unlocked_achievements', 'achievement_progress',
        'feedbackHistory', 'userProfile', 'toolRequests',
        'darkMode', 'darkModeSetting', 'hasSeenGuide', 'guideVersion',
        'fontSizeSetting', 'app_language', 'backupRemindDismissed', 'lastBackupTime',
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
            storageUtil.safeSet(key, raw.d)
          }
        } catch(e) {}
      }
      storageUtil.safeSet('_storage_migrated_v2', true)
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

  autoRestoreIfNeeded: function() {
    var that = this
    if (!that.globalData.cloudReady) return

    var checkKeys = ['favorites', 'recentTools', 'totalUsageCount', 'user_points', 'checkin_records', 'unlocked_achievements']
    var hasAnyLocalData = false
    for (var i = 0; i < checkKeys.length; i++) {
      var val = storageUtil.get(checkKeys[i])
      if (val !== null && val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0)) {
        hasAnyLocalData = true
        break
      }
    }

    if (hasAnyLocalData) {
      logger.log('[自动恢复] 本地数据存在，跳过自动恢复')
      return
    }

    logger.log('[自动恢复] 检测到本地数据为空，尝试从云端恢复...')
    cloudSync.restore(function(result) {
      if (result.success) {
        logger.log('[自动恢复] 恢复成功, 恢复项数:', result.keyCount)
        that.globalData.justRestored = true
        var pages = getCurrentPages()
        if (pages.length > 0) {
          var currentPage = pages[pages.length - 1]
          if (currentPage && typeof currentPage.onCloudRestored === 'function') {
            currentPage.onCloudRestored()
          } else if (currentPage && typeof currentPage.onShow === 'function') {
            currentPage.onShow()
          }
        }
      } else {
        logger.log('[自动恢复] 无云端备份或恢复失败:', result.message)
      }
    })
  },

  autoBackup: function() {
    if (!this.globalData.cloudReady) return
    var lastBackupTime = storageUtil.get('lastBackupTime', '')
    if (lastBackupTime) {
      try {
        var lastDate = new Date(lastBackupTime).toDateString()
        var today = new Date().toDateString()
        if (lastDate === today) {
          logger.log('[自动备份] 今日已备份，跳过')
          return
        }
      } catch(e) {}
    }
    logger.log('[自动备份] 开始静默备份...')
    cloudSync.backup(function(result) {
      if (result.success) {
        logger.log('[自动备份] 成功, 备份项数:', result.keyCount)
      } else {
        logger.log('[自动备份] 失败:', result.message)
      }
    })
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
    storageUtil.safeSet('darkMode', isDark)

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
      title: '\u767E\u5B9D\u5DE5\u5177\u7BB1 - \u6C47\u7387\u6362\u7B97\u3001\u623F\u8D37\u8BA1\u7B97\u3001\u4E8C\u7EF4\u7801\u7B4950+\u5B9E\u7528\u5DE5\u5177',
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
      title: '\u767E\u5B9D\u5DE5\u5177\u7BB1 - \u6C47\u7387\u6362\u7B97\u3001\u623F\u8D37\u8BA1\u7B97\u3001\u4E8C\u7EF4\u7801\u7B4950+\u5B9E\u7528\u5DE5\u5177',
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
      storageUtil.safeSet('errorLog', errorLog)
    } catch (e) {}
  },

  cleanStorage: function() {
    // 清理按日期存储的过期数据
    storageUtil.cleanDateKeyedData('pomodoro_records', 30)
    storageUtil.cleanDateKeyedData('water_records', 30)

    // 清理临时文件
    try {
      var fs = wx.getFileSystemManager()
      var files = fs.readdirSync(wx.env.USER_DATA_PATH)
      for (var i = 0; i < files.length; i++) {
        // 清理base64解码临时文件
        if (files[i].indexOf('b64decode_') === 0) {
          try { fs.unlinkSync(wx.env.USER_DATA_PATH + '/' + files[i]) } catch (e) {}
        }
      }
      // 只保留最新3个CSV文件
      var csvFiles = []
      for (var j = 0; j < files.length; j++) {
        if (files[j].indexOf('.csv') > -1) {
          csvFiles.push(files[j])
        }
      }
      csvFiles.sort().reverse()
      for (var k = 3; k < csvFiles.length; k++) {
        try { fs.unlinkSync(wx.env.USER_DATA_PATH + '/' + csvFiles[k]) } catch (e) {}
      }
    } catch (e) {}
  }
})
