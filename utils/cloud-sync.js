var storageUtil = require('./storage.js')
var logger = require('./logger.js')

var BACKUP_KEYS = [
  'favorites', 'recentTools', 'totalUsageCount', 'weeklyUsage', 'toolUsageLog',
  'checkin_records', 'user_points', 'total_earned_points',
  'unlocked_achievements', 'achievement_progress',
  'searchHistory', 'customToolOrder', 'hiddenTools',
  'userProfile', 'darkModeSetting', 'hasSeenGuide', 'guideVersion',
  'feedbackHistory', 'toolRequests',
  'age_calc_history', 'date_calc_history', 'json_formatter_history',
  'cachedRates', 'world_clock_cities', 'water_reminder_interval',
  'water_reminder_last_time', 'water_records', 'countdown_events',
  'ruler_cal_version', 'ruler_calibration', 'white_noise_state',
  'danmaku_history', 'relative_call_history', 'ts_converter_history',
  'garbage_history', 'calc_history', 'random_decision_history',
  'pomodoro_records', 'pomodoro_daily_goal', 'qr_history'
]

var cloudSync = {
  isCloudReady: function() {
    var app = getApp()
    return app && app.globalData && app.globalData.cloudReady
  },

  getOpenId: function() {
    var app = getApp()
    if (app && app.globalData && app.globalData.openid) {
      return app.globalData.openid
    }
    return ''
  },

  backup: function(callback) {
    if (!this.isCloudReady()) {
      if (callback) callback({ success: false, message: '云服务未连接' })
      return
    }

    var that = this
    var dataMap = {}
    for (var i = 0; i < BACKUP_KEYS.length; i++) {
      var key = BACKUP_KEYS[i]
      var val = storageUtil.get(key)
      if (val !== null && val !== undefined && val !== '') {
        dataMap[key] = val
      }
    }

    var backupData = {
      version: 1,
      data: dataMap,
      keyCount: Object.keys(dataMap).length,
      backupTime: new Date().toISOString(),
      platform: wx.getSystemInfoSync().platform || 'unknown'
    }

    try {
      var db = wx.cloud.database()
      var openid = that.getOpenId()

      if (openid) {
        db.collection('user_data').where({
          _openid: openid
        }).count({
          success: function(res) {
            if (res.total > 0) {
              that._updateBackup(db, openid, backupData, callback)
            } else {
              that._createBackup(db, backupData, callback)
            }
          },
          fail: function() {
            that._createBackup(db, backupData, callback)
          }
        })
      } else {
        that._createBackup(db, backupData, callback)
      }
    } catch(e) {
      logger.log('[云备份] 异常:', e.message || e)
      if (callback) callback({ success: false, message: '备份失败: ' + (e.message || '未知错误') })
    }
  },

  _createBackup: function(db, backupData, callback) {
    db.collection('user_data').add({
      data: backupData
    }).then(function() {
      logger.log('[云备份] 创建成功')
      storageUtil.set('lastBackupTime', backupData.backupTime)
      if (callback) callback({ success: true, message: '备份成功', keyCount: backupData.keyCount, time: backupData.backupTime })
    }).catch(function(err) {
      logger.log('[云备份] 创建失败:', err)
      if (callback) callback({ success: false, message: '备份失败' })
    })
  },

  _updateBackup: function(db, openid, backupData, callback) {
    var that = this
    db.collection('user_data').where({
      _openid: openid
    }).get({
      success: function(res) {
        if (res.data && res.data.length > 0) {
          var docId = res.data[0]._id
          db.collection('user_data').doc(docId).update({
            data: {
              version: backupData.version,
              data: backupData.data,
              keyCount: backupData.keyCount,
              backupTime: backupData.backupTime,
              platform: backupData.platform
            }
          }).then(function() {
            logger.log('[云备份] 更新成功')
            storageUtil.set('lastBackupTime', backupData.backupTime)
            if (callback) callback({ success: true, message: '备份已更新', keyCount: backupData.keyCount, time: backupData.backupTime })
          }).catch(function(err) {
            logger.log('[云备份] 更新失败:', err)
            that._createBackup(db, backupData, callback)
          })
        } else {
          that._createBackup(db, backupData, callback)
        }
      },
      fail: function() {
        that._createBackup(db, backupData, callback)
      }
    })
  },

  restore: function(callback) {
    if (!this.isCloudReady()) {
      if (callback) callback({ success: false, message: '云服务未连接' })
      return
    }

    try {
      var db = wx.cloud.database()
      var openid = this.getOpenId()

      var query = openid ? { _openid: openid } : {}
      db.collection('user_data').where(query).orderBy('backupTime', 'desc').limit(1).get({
        success: function(res) {
          if (!res.data || res.data.length === 0) {
            if (callback) callback({ success: false, message: '未找到云端备份' })
            return
          }

          var cloudRecord = res.data[0]
          var cloudData = cloudRecord.data || {}
          var restoredCount = 0

          for (var key in cloudData) {
            if (cloudData.hasOwnProperty(key)) {
              try {
                storageUtil.safeSet(key, cloudData[key])
                restoredCount++
              } catch(e) {}
            }
          }

          logger.log('[云恢复] 恢复成功, 恢复项数:', restoredCount)
          if (callback) callback({
            success: true,
            message: '恢复成功',
            keyCount: restoredCount,
            backupTime: cloudRecord.backupTime || '未知'
          })
        },
        fail: function(err) {
          logger.log('[云恢复] 获取失败:', err)
          if (callback) callback({ success: false, message: '获取云端数据失败' })
        }
      })
    } catch(e) {
      logger.log('[云恢复] 异常:', e.message || e)
      if (callback) callback({ success: false, message: '恢复失败' })
    }
  },

  getBackupInfo: function(callback) {
    if (!this.isCloudReady()) {
      if (callback) callback({ hasBackup: false })
      return
    }

    try {
      var db = wx.cloud.database()
      var openid = this.getOpenId()
      var query = openid ? { _openid: openid } : {}

      db.collection('user_data').where(query).orderBy('backupTime', 'desc').limit(1).get({
        success: function(res) {
          if (!res.data || res.data.length === 0) {
            if (callback) callback({ hasBackup: false })
            return
          }
          var record = res.data[0]
          if (callback) callback({
            hasBackup: true,
            backupTime: record.backupTime || '',
            keyCount: record.keyCount || 0,
            platform: record.platform || ''
          })
        },
        fail: function() {
          if (callback) callback({ hasBackup: false })
        }
      })
    } catch(e) {
      if (callback) callback({ hasBackup: false })
    }
  },

  getLastBackupTime: function() {
    return storageUtil.get('lastBackupTime', '')
  },

  formatBackupTime: function(timeStr) {
    if (!timeStr) return '从未备份'
    try {
      var d = new Date(timeStr)
      var now = new Date()
      var diff = now - d
      var minutes = Math.floor(diff / 60000)
      var hours = Math.floor(diff / 3600000)
      var days = Math.floor(diff / 86400000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return minutes + '分钟前'
      if (hours < 24) return hours + '小时前'
      if (days < 7) return days + '天前'

      return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
        (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' +
        (d.getMinutes() < 10 ? '0' : '') + d.getMinutes()
    } catch(e) {
      return '未知'
    }
  }
}

module.exports = cloudSync
