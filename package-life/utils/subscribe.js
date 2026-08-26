var storageUtil = require('../../utils/storage.js')
var logger = require('../../utils/logger.js')

// 订阅消息模板ID
// 注意：以下模板ID为占位符，需要在微信公众平台后台申请替换
// 申请路径：微信公众平台 → 功能 → 订阅消息 → 添加模板
var TEMPLATES = {
  // 倒计时提醒 - 日程提醒类
  // 模板关键词：事件名称、倒计时天数、提醒时间、备注
  COUNTDOWN_REMIND: 'qbKp5hOMoxHgj08ooZV9Oxla6d__mfB--oQMQduJ2SI',

  // 番茄钟完成提醒 - 与倒计时共用「行动计划提醒」模板
  POMODORO_COMPLETE: 'qbKp5hOMoxHgj08ooZV9Oxla6d__mfB--oQMQduJ2SI',

  // 喝水提醒 - 与倒计时共用「行动计划提醒」模板
  WATER_REMIND: 'qbKp5hOMoxHgj08ooZV9Oxla6d__mfB--oQMQduJ2SI'
}

// 订阅次数存储key（每个模板的剩余可发送次数）
var SUB_COUNT_KEY = 'subscribe_message_count'
// 订阅请求时间记录（避免频繁弹窗）
var SUB_REQUEST_TIME_KEY = 'subscribe_request_time'

// 每种模板的最小请求间隔（毫秒）
var REQUEST_INTERVALS = {
  COUNTDOWN_REMIND: 4 * 60 * 60 * 1000,  // 倒计时：4小时
  POMODORO_COMPLETE: 2 * 60 * 60 * 1000,  // 番茄钟：2小时
  WATER_REMIND: 4 * 60 * 60 * 1000         // 喝水：4小时
}

var Subscribe = {
  // 获取模板ID
  getTemplateId: function(type) {
    return TEMPLATES[type] || ''
  },

  // ========== 订阅次数管理 ==========

  // 获取某模板的剩余订阅次数
  getSubCount: function(type) {
    try {
      var counts = storageUtil.get(SUB_COUNT_KEY, {})
      return counts[type] || 0
    } catch (e) {
      return 0
    }
  },

  // 增加订阅次数（用户同意订阅时调用）
  _addSubCount: function(type, count) {
    try {
      var counts = storageUtil.get(SUB_COUNT_KEY, {})
      counts[type] = (counts[type] || 0) + (count || 1)
      storageUtil.safeSet(SUB_COUNT_KEY, counts)
    } catch (e) {}
  },

  // 消耗一次订阅次数（云函数成功发送消息后调用）
  consumeSubCount: function(type) {
    try {
      var counts = storageUtil.get(SUB_COUNT_KEY, {})
      if (counts[type] && counts[type] > 0) {
        counts[type] = counts[type] - 1
        storageUtil.safeSet(SUB_COUNT_KEY, counts)
      }
    } catch (e) {}
  },

  // 检查是否有足够的订阅次数
  hasSubCount: function(type, minCount) {
    return this.getSubCount(type) >= (minCount || 1)
  },

  // ========== 请求订阅 ==========

  // 请求订阅消息授权（核心方法）
  // 每次用户点"允许"= 获得1次发送配额
  requestSubscribe: function(tmplIds, callback) {
    if (!tmplIds || tmplIds.length === 0) {
      if (callback) callback({ success: false, subscribed: false })
      return
    }

    // 过滤掉未配置的模板ID
    var validIds = []
    for (var i = 0; i < tmplIds.length; i++) {
      if (tmplIds[i] && tmplIds[i].indexOf('TEMPL_ID') === -1) {
        validIds.push(tmplIds[i])
      }
    }

    if (validIds.length === 0) {
      if (callback) callback({ success: false, subscribed: false, reason: 'no_valid_template' })
      return
    }

    try {
      wx.requestSubscribeMessage({
        tmplIds: validIds,
        success: function(res) {
          var subscribed = false
          for (var j = 0; j < validIds.length; j++) {
            if (res[validIds[j]] === 'accept') {
              subscribed = true
              // 找到对应的type，增加订阅次数
              var typeKey = Subscribe._getTypeByTemplateId(validIds[j])
              if (typeKey) {
                Subscribe._addSubCount(typeKey, 1)
              }
              Subscribe._saveRequestTime(typeKey)
            }
          }
          if (callback) callback({ success: true, subscribed: subscribed, detail: res })
        },
        fail: function(err) {
          logger.warn('requestSubscribeMessage fail:', err)
          if (callback) callback({ success: false, subscribed: false, error: err })
        }
      })
    } catch (e) {
      logger.warn('requestSubscribeMessage error:', e)
      if (callback) callback({ success: false, subscribed: false, error: e })
    }
  },

  // 根据模板ID反查type
  _getTypeByTemplateId: function(tmplId) {
    for (var key in TEMPLATES) {
      if (TEMPLATES[key] === tmplId) return key
    }
    return null
  },

  // ========== 场景化请求方法 ==========

  // 请求倒计时提醒订阅
  // 触发时机：创建倒计时后、查看倒计时列表时、编辑倒计时后
  requestCountdownSubscribe: function(callback) {
    var tmplId = this.getTemplateId('COUNTDOWN_REMIND')
    if (!tmplId || tmplId.indexOf('TEMPL_ID') !== -1) {
      if (callback) callback({ success: false })
      return
    }
    // 倒计时需要2次订阅（前1天+当天），如果不足2次则请求
    var currentCount = this.getSubCount('COUNTDOWN_REMIND')
    if (currentCount >= 2) {
      // 已有足够次数，不需要弹窗
      if (callback) callback({ success: true, subscribed: true, count: currentCount })
      return
    }
    this.requestSubscribe([tmplId], callback)
  },

  // 请求番茄钟完成订阅
  // 触发时机：开始专注时
  requestPomodoroSubscribe: function(callback) {
    var tmplId = this.getTemplateId('POMODORO_COMPLETE')
    if (!tmplId || tmplId.indexOf('TEMPL_ID') !== -1) {
      if (callback) callback({ success: false })
      return
    }
    // 番茄钟只需1次订阅
    var currentCount = this.getSubCount('POMODORO_COMPLETE')
    if (currentCount >= 1) {
      if (callback) callback({ success: true, subscribed: true, count: currentCount })
      return
    }
    this.requestSubscribe([tmplId], callback)
  },

  // 请求喝水提醒订阅
  // 触发时机：开启提醒时、每次喝水记录后
  requestWaterSubscribe: function(callback) {
    var tmplId = this.getTemplateId('WATER_REMIND')
    if (!tmplId || tmplId.indexOf('TEMPL_ID') !== -1) {
      if (callback) callback({ success: false })
      return
    }
    // 喝水提醒需要多次订阅（一天可能提醒多次），尽量多攒
    this.requestSubscribe([tmplId], callback)
  },

  // ========== 请求频率控制 ==========

  // 保存本次请求时间
  _saveRequestTime: function(type) {
    try {
      var times = storageUtil.get(SUB_REQUEST_TIME_KEY, {})
      times[type] = Date.now()
      storageUtil.safeSet(SUB_REQUEST_TIME_KEY, times)
    } catch (e) {}
  },

  // 获取上次请求时间
  _getLastRequestTime: function(type) {
    try {
      var times = storageUtil.get(SUB_REQUEST_TIME_KEY, {})
      return times[type] || 0
    } catch (e) {
      return 0
    }
  },

  // 判断是否应该请求订阅（避免频繁弹窗打扰用户）
  // 每种模板有独立的最小请求间隔
  shouldRequestSubscribe: function(type) {
    var tmplId = this.getTemplateId(type)
    if (!tmplId || tmplId.indexOf('TEMPL_ID') !== -1) return false

    var lastTime = this._getLastRequestTime(type)
    var interval = REQUEST_INTERVALS[type] || 4 * 60 * 60 * 1000
    var now = Date.now()

    return (now - lastTime) > interval
  },

  // ========== 云函数调用 ==========

  // 调用云函数发送订阅消息
  sendSubscribeMessage: function(options) {
    if (!wx.cloud) {
      logger.warn('cloud not available')
      return
    }

    wx.cloud.callFunction({
      name: 'sendSubscribeMessage',
      data: {
        templateType: options.templateType || '',
        toUser: options.toUser || '',
        data: options.data || {},
        page: options.page || ''
      },
      success: function(res) {
        // sendSubscribeMessage success
      },
      fail: function(err) {
        logger.warn('sendSubscribeMessage fail:', err)
      }
    })
  },

  // 注册倒计时云函数提醒
  registerCountdownReminder: function(event) {
    if (!wx.cloud) return

    var tmplId = this.getTemplateId('COUNTDOWN_REMIND')
    if (!tmplId || tmplId.indexOf('TEMPL_ID') !== -1) return

    // 检查是否有足够订阅次数
    if (!this.hasSubCount('COUNTDOWN_REMIND', 1)) {
      logger.warn('no countdown subscribe count')
      return
    }

    wx.cloud.callFunction({
      name: 'countdownReminder',
      data: {
        action: 'register',
        eventId: event.id,
        eventName: event.name,
        targetDate: event.date,
        targetTime: event.time || '00:00',
        category: event.category || 'life',
        repeat: event.repeat || 'none',
        templateId: tmplId
      },
      success: function(res) {
        // registerCountdownReminder success
      },
      fail: function(err) {
        logger.warn('registerCountdownReminder fail:', err)
        wx.showToast({ title: '提醒设置失败，请稍后重试', icon: 'none', duration: 2500 })
      }
    })
  },

  // 取消倒计时提醒
  cancelCountdownReminder: function(eventId) {
    if (!wx.cloud) return

    wx.cloud.callFunction({
      name: 'countdownReminder',
      data: {
        action: 'cancel',
        eventId: eventId
      },
      success: function(res) {
        // cancelCountdownReminder success
      },
      fail: function(err) {
        logger.warn('cancelCountdownReminder fail:', err)
      }
    })
  },

  // 注册番茄钟完成提醒
  registerPomodoroReminder: function(duration, mode) {
    if (!wx.cloud) return

    var tmplId = this.getTemplateId('POMODORO_COMPLETE')
    if (!tmplId || tmplId.indexOf('TEMPL_ID') !== -1) return

    // 检查是否有足够订阅次数
    if (!this.hasSubCount('POMODORO_COMPLETE', 1)) {
      logger.warn('no pomodoro subscribe count')
      return
    }

    wx.cloud.callFunction({
      name: 'pomodoroReminder',
      data: {
        action: 'register',
        duration: duration,
        mode: mode,
        templateId: tmplId
      },
      success: function(res) {
        // registerPomodoroReminder success
      },
      fail: function(err) {
        logger.warn('registerPomodoroReminder fail:', err)
        wx.showToast({ title: '提醒设置失败，请稍后重试', icon: 'none', duration: 2500 })
      }
    })
  },

  // 取消番茄钟提醒
  cancelPomodoroReminder: function() {
    if (!wx.cloud) return

    wx.cloud.callFunction({
      name: 'pomodoroReminder',
      data: {
        action: 'cancel'
      },
      success: function(res) {
        // cancelPomodoroReminder success
      },
      fail: function(err) {
        logger.warn('cancelPomodoroReminder fail:', err)
      }
    })
  },

  // 注册喝水提醒
  registerWaterReminder: function(interval, todayCups, targetCups) {
    if (!wx.cloud) return

    var tmplId = this.getTemplateId('WATER_REMIND')
    if (!tmplId || tmplId.indexOf('TEMPL_ID') !== -1) return

    // 检查是否有足够订阅次数
    if (!this.hasSubCount('WATER_REMIND', 1)) {
      logger.warn('no water subscribe count')
      return
    }

    wx.cloud.callFunction({
      name: 'waterReminder',
      data: {
        action: 'register',
        interval: interval,
        todayCups: todayCups,
        targetCups: targetCups,
        templateId: tmplId
      },
      success: function(res) {
        // registerWaterReminder success
      },
      fail: function(err) {
        logger.warn('registerWaterReminder fail:', err)
        wx.showToast({ title: '提醒设置失败，请稍后重试', icon: 'none', duration: 2500 })
      }
    })
  },

  // 取消喝水提醒
  cancelWaterReminder: function() {
    if (!wx.cloud) return

    wx.cloud.callFunction({
      name: 'waterReminder',
      data: {
        action: 'cancel'
      },
      success: function(res) {
        // cancelWaterReminder success
      },
      fail: function(err) {
        logger.warn('cancelWaterReminder fail:', err)
      }
    })
  },

  // ========== 多触点累积订阅 ==========

  // 在"我的"页面签到成功后，顺便请求订阅
  // 签到是高频操作，适合累积订阅次数
  requestOnCheckin: function(callback) {
    // 按优先级请求：喝水 > 倒计时 > 番茄钟
    // 每次只请求1-2个模板，避免弹窗太多
    var types = ['WATER_REMIND', 'COUNTDOWN_REMIND']
    var tmplIds = []
    for (var i = 0; i < types.length; i++) {
      var tmplId = this.getTemplateId(types[i])
      if (tmplId && tmplId.indexOf('TEMPL_ID') === -1 && this.shouldRequestSubscribe(types[i])) {
        tmplIds.push(tmplId)
      }
    }
    if (tmplIds.length === 0) {
      if (callback) callback({ success: false, reason: 'no_need' })
      return
    }
    this.requestSubscribe(tmplIds, callback)
  },

  // 在喝水记录后请求订阅（喝水是高频操作，适合攒次数）
  requestOnWaterRecord: function(callback) {
    if (!this.shouldRequestSubscribe('WATER_REMIND')) {
      if (callback) callback({ success: false, reason: 'too_frequent' })
      return
    }
    this.requestWaterSubscribe(callback)
  },

  // 在查看倒计时列表时请求订阅（补充倒计时订阅次数）
  requestOnViewCountdown: function(callback) {
    if (!this.shouldRequestSubscribe('COUNTDOWN_REMIND')) {
      if (callback) callback({ success: false, reason: 'too_frequent' })
      return
    }
    var currentCount = this.getSubCount('COUNTDOWN_REMIND')
    // 倒计时需要2次（前1天+当天），不足时请求
    if (currentCount < 2) {
      this.requestCountdownSubscribe(callback)
    } else {
      if (callback) callback({ success: true, subscribed: true, count: currentCount })
    }
  }
}

module.exports = Subscribe
