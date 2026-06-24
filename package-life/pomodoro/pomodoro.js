var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var logger = require('../../utils/logger.js')
var poster = require('../utils/poster.js')
var csvExport = require('../utils/csv-export.js')
var i18n = require('../../utils/i18n.js')
var subscribe = require('../utils/subscribe.js')
Page({
  data: {
    isLoading: true,
    i18n: {},
    isRunning: false,
    isPaused: false,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    displayTime: '25:00',
    statusText: '准备开始',

    completedCount: 0,
    totalMinutes: 0,
    currentRound: 1,
    totalRounds: 4,

    currentMode: 'work',

    workDurations: [15, 20, 25, 30, 45, 60],
    workDurationIndex: 2,
    shortBreaks: [3, 5, 10],
    shortBreakIndex: 1,
    longBreaks: [15, 20, 30],
    longBreakIndex: 0,

    todayRecords: [],

    dailyGoal: 8,
    todayFocusMinutes: 0,
    todayPomodoroCount: 0,
    goalProgress: 0,

    timerInterval: null,

    timerStartTime: 0,
    timerStartLeft: 0,

    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    weekData: [],
    weekTotalPomodoros: 0,
    weekTotalMinutes: 0,
    streakDays: 0
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('番茄计时')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('pomodoro') })

    this.loadTodayRecords()
    this.loadWeekData()
    this.drawProgressRing(1)
    poster.setupForPage(this, 9)
    this.setData({ isLoading: false })
  },

  onUnload: function() {
    this.clearTimer()
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('pomodoro') })

    if (this.data.isRunning && this.data.timerStartTime > 0) {
      this.syncTimeFromTimestamp()
    }
  },

  onHide: function() {
    if (this.data.isRunning) {
      this.syncTimeFromTimestamp()
    }
  },

  clearTimer: function() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.setData({ timerInterval: null })
    }
  },

  syncTimeFromTimestamp: function() {
    if (this.data.timerStartTime <= 0) return

    var now = Date.now()
    var elapsed = Math.floor((now - this.data.timerStartTime) / 1000)
    var actualLeft = this.data.timerStartLeft - elapsed

    if (actualLeft <= 0) {
      this.clearTimer()
      this.setData({
        isRunning: false,
        isPaused: false,
        timeLeft: 0,
        displayTime: '00:00'
      })
      this.drawProgressRing(0)
      this.timerComplete()
      return
    }

    var minutes = Math.floor(actualLeft / 60)
    var seconds = actualLeft % 60
    var displayTime = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
    var progress = actualLeft / this.data.totalTime

    this.setData({
      timeLeft: actualLeft,
      displayTime: displayTime
    })
    this.drawProgressRing(progress)
  },

  toggleTimer: function() {
    if (this.data.isRunning) {
      this.pauseTimer()
    } else {
      this.startTimer()
    }
  },

  startTimer: function() {
    wx.vibrateShort({ type: 'medium' })
    wx.setKeepScreenOn({ keepScreenOn: true })

    var that = this
    var startTime = Date.now()

    this.setData({
      isRunning: true,
      isPaused: false,
      statusText: this.data.currentMode === 'work' ? '\uD83C\uDF45 \u4E13\u6CE8\u4E2D...' : '\u2615 \u4F11\u606F\u4E2D...',
      timerStartTime: startTime,
      timerStartLeft: this.data.timeLeft
    })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(9, '番茄计时', false)

    // 专注模式开始时请求订阅消息，以便后台时能收到完成提醒
    if (this.data.currentMode === 'work' && subscribe.shouldRequestSubscribe('POMODORO_COMPLETE')) {
      subscribe.requestPomodoroSubscribe(function(res) {
        if (res.success && res.subscribed) {
          // 注册云函数延迟发送提醒
          var duration = that.data.workDurations[that.data.workDurationIndex]
          subscribe.registerPomodoroReminder(duration, 'work')
        }
      })
    }

    this.clearTimer()

    this.data.timerInterval = setInterval(function() {
      that.syncTimeFromTimestamp()
    }, 1000)
  },

  pauseTimer: function() {
    wx.vibrateShort({ type: 'light' })
    wx.setKeepScreenOn({ keepScreenOn: false })

    this.clearTimer()

    this.syncTimeFromTimestamp()

    // 暂停时取消云函数提醒
    subscribe.cancelPomodoroReminder()

    this.setData({
      isRunning: false,
      isPaused: true,
      statusText: '\u5DF2\u6682\u505C',
      timerStartTime: 0,
      timerStartLeft: 0
    })
  },

  resetTimer: function() {
    wx.vibrateShort({ type: 'light' })
    wx.setKeepScreenOn({ keepScreenOn: false })

    this.clearTimer()

    // 重置时取消云函数提醒
    subscribe.cancelPomodoroReminder()

    var duration = this.getDurationForMode()

    this.setData({
      isRunning: false,
      isPaused: false,
      timeLeft: duration,
      totalTime: duration,
      displayTime: this.formatTime(duration),
      statusText: '\u51C6\u5907\u5F00\u59CB',
      timerStartTime: 0,
      timerStartLeft: 0
    })

    this.drawProgressRing(1)
  },

  skipToBreak: function() {
    wx.vibrateShort({ type: 'medium' })

    if (this.data.currentMode === 'work') {
      this.switchToBreakMode()
    } else {
      this.switchToWorkMode()
    }
  },

  timerComplete: function() {
    this.clearTimer()
    wx.setKeepScreenOn({ keepScreenOn: false })
    wx.vibrateLong()

    this.requestSubscribeMessage()

    var that = this
    wx.showModal({
      title: that.data.currentMode === 'work' ? that.data.i18n.focusComplete : that.data.i18n.restComplete,
      content: that.data.currentMode === 'work' ? that.data.i18n.takeBreak : that.data.i18n.readyToContinue,
      confirmText: that.data.currentMode === 'work' ? that.data.i18n.startBreak : that.data.i18n.startWork,
      cancelText: that.data.i18n.laterBtn,
      success: function(res) {
        if (res.confirm) {
          if (that.data.currentMode === 'work') {
            that.switchToBreakMode()
          } else {
            that.switchToWorkMode()
          }
        } else {
          that.resetTimer()
        }
      }
    })

    this.addRecord()
  },

  switchToBreakMode: function() {
    var breakDuration = 0
    if (this.data.completedCount > 0 && (this.data.completedCount + 1) % this.data.totalRounds === 0) {
      breakDuration = this.data.longBreaks[this.data.longBreakIndex] * 60
    } else {
      breakDuration = this.data.shortBreaks[this.data.shortBreakIndex] * 60
    }

    this.setData({
      currentMode: 'break',
      timeLeft: breakDuration,
      totalTime: breakDuration,
      displayTime: this.formatTime(breakDuration),
      completedCount: this.data.completedCount + 1,
      totalMinutes: this.data.totalMinutes + this.data.workDurations[this.data.workDurationIndex]
    })

    this.drawProgressRing(1)

    var that = this
    setTimeout(function() {
      that.startTimer()
    }, 500)
  },

  switchToWorkMode: function() {
    var workDuration = this.data.workDurations[this.data.workDurationIndex] * 60

    this.setData({
      currentMode: 'work',
      timeLeft: workDuration,
      totalTime: workDuration,
      displayTime: this.formatTime(workDuration),
      currentRound: Math.min(this.data.currentRound + 1, this.data.totalRounds)
    })

    this.drawProgressRing(1)

    var that = this
    setTimeout(function() {
      that.startTimer()
    }, 500)
  },

  getDurationForMode: function() {
    if (this.data.currentMode === 'work') {
      return this.data.workDurations[this.data.workDurationIndex] * 60
    } else {
      return this.data.shortBreaks[this.data.shortBreakIndex] * 60
    }
  },

  formatTime: function(seconds) {
    var mins = Math.floor(seconds / 60)
    var secs = seconds % 60
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0')
  },

  drawProgressRing: function(progress) {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#progressRing')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0]) return
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = wx.getSystemInfoSync().pixelRatio

        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        var w = res[0].width
        var h = res[0].height
        var centerX = w / 2
        var centerY = h / 2
        var radius = Math.min(w, h) / 2 - 12
        var lineWidth = 12

        ctx.clearRect(0, 0, w, h)

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = '#E2E8F0'
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.stroke()

        if (progress > 0) {
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress)

          if (that.data.currentMode === 'work') {
            ctx.strokeStyle = '#EF4444'
          } else {
            ctx.strokeStyle = '#10B981'
          }

          ctx.lineWidth = lineWidth
          ctx.lineCap = 'round'
          ctx.stroke()
        }
      })
  },

  onWorkDurationChange: function(e) {
    var index = e.detail.value
    this.setData({ workDurationIndex: index })
    if (!this.data.isRunning && !this.data.isPaused) {
      var duration = this.data.workDurations[index] * 60
      this.setData({
        timeLeft: duration,
        totalTime: duration,
        displayTime: this.formatTime(duration)
      })
      this.drawProgressRing(1)
    }
    wx.vibrateShort({ type: 'light' })
  },

  onShortBreakChange: function(e) {
    this.setData({ shortBreakIndex: e.detail.value })
    wx.vibrateShort({ type: 'light' })
  },

  onLongBreakChange: function(e) {
    this.setData({ longBreakIndex: e.detail.value })
    wx.vibrateShort({ type: 'light' })
  },

  changeTotalRounds: function(e) {
    var round = parseInt(e.currentTarget.dataset.round)
    this.setData({ totalRounds: round })
    wx.vibrateShort({ type: 'light' })
  },

  requestSubscribeMessage: function() {
    // 订阅消息已在startTimer中请求，此处不再重复请求
    // 保留此方法以兼容原有调用
  },

  addRecord: function() {
    var that = this
    var now = new Date()
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')

    var record = {
      type: this.data.currentMode,
      time: timeStr,
      duration: this.data.currentMode === 'work' 
                ? this.data.workDurations[this.data.workDurationIndex]
                : this.data.shortBreaks[this.data.shortBreakIndex]
    }

    var records = []
    for (var i = 0; i < this.data.todayRecords.length; i++) {
      records.push(this.data.todayRecords[i])
    }
    records.push(record)
    this.setData({ todayRecords: records })

    try {
      var today = new Date().toDateString()
      var allRecords = storageUtil.get('pomodoro_records', {})
      allRecords[today] = records
      // 清理30天前的旧数据
      storageUtil.cleanDateKeyedData('pomodoro_records', 30)
      storageUtil.safeSet('pomodoro_records', allRecords)
    } catch (e) {
      logger.error('Save record error:', e)
      wx.showToast({ title: that.data.i18n.recordSaveFailed, icon: 'none', duration: 2000 })
      setTimeout(function() {
        wx.showModal({
          title: that.data.i18n.dataSaveFailed,
          content: that.data.i18n.dataSaveFailedMsg,
          confirmText: that.data.i18n.retryBtn,
          cancelText: that.data.i18n.laterBtn,
          success: function(res) {
            if (res.confirm) {
              try {
                var allRec = storageUtil.get('pomodoro_records', {})
                var todayKey = new Date().toDateString()
                var existing = allRec[todayKey] || []
                existing.push(record)
                allRec[todayKey] = existing
                storageUtil.safeSet('pomodoro_records', allRec)
                wx.showToast({ title: that.data.i18n.retrySuccess, icon: 'success' })
              } catch(e2) {
                wx.showToast({ title: that.data.i18n.stillFailed, icon: 'none' })
              }
            }
          }
        })
      }, 2200)
    }

    var appInstance = getApp()
    if (appInstance.cloudSyncPomodoroRecord) {
      appInstance.cloudSyncPomodoroRecord({
        type: this.data.currentMode,
        time: timeStr,
        duration: this.data.currentMode === 'work' 
                  ? this.data.workDurations[this.data.workDurationIndex]
                  : this.data.shortBreaks[this.data.shortBreakIndex],
        date: today
      })
    }

    this.loadTodayRecords()
    this.loadWeekData()
  },

  loadTodayRecords: function() {
    try {
      var today = new Date().toDateString()
      var allRecords = storageUtil.get('pomodoro_records', {})
      var todayRecords = allRecords[today] || []
      this.setData({ todayRecords: todayRecords })

      var focusMinutes = 0
      var pomodoroCount = 0
      for (var i = 0; i < todayRecords.length; i++) {
        if (todayRecords[i].type === 'work') {
          focusMinutes += (todayRecords[i].duration || 0)
          pomodoroCount++
        }
      }

      var goal = storageUtil.get('pomodoro_daily_goal', 8)
      var progress = goal > 0 ? Math.min(100, Math.round((pomodoroCount / goal) * 100)) : 0

      this.setData({
        todayFocusMinutes: focusMinutes,
        todayPomodoroCount: pomodoroCount,
        dailyGoal: goal,
        goalProgress: progress
      })
    } catch (e) {
      logger.error('Load records error:', e)
    }
  },

  changeDailyGoal: function(e) {
    var goal = parseInt(e.currentTarget.dataset.goal)
    if (!goal) return
    wx.vibrateShort({ type: 'light' })
    this.setData({ dailyGoal: goal })
    storageUtil.safeSet('pomodoro_daily_goal', goal)
    var progress = goal > 0 ? Math.min(100, Math.round((this.data.todayPomodoroCount / goal) * 100)) : 0
    this.setData({ goalProgress: progress })
  },

  loadWeekData: function() {
    try {
      var allRecords = storageUtil.get('pomodoro_records', {})
      var today = new Date()
      var dayOfWeek = today.getDay()
      if (dayOfWeek === 0) dayOfWeek = 7
      var weekData = []
      var dayNames = ['一', '二', '三', '四', '五', '六', '日']
      var totalPomodoros = 0
      var totalMinutes = 0
      var streak = 0

      for (var i = 6; i >= 0; i--) {
        var d = new Date(today)
        d.setDate(d.getDate() - (dayOfWeek - 1 - (6 - i)))
        var key = d.toDateString()
        var records = allRecords[key] || []
        var count = 0
        var minutes = 0
        for (var j = 0; j < records.length; j++) {
          if (records[j].type === 'work') {
            count++
            minutes += (records[j].duration || 0)
          }
        }
        var isToday = key === today.toDateString()
        var label = dayNames[6 - i]
        weekData.push({
          date: key,
          dayLabel: label,
          count: count,
          minutes: minutes,
          isToday: isToday
        })
        totalPomodoros += count
        totalMinutes += minutes
        if (count > 0) {
          streak++
        } else if (!isToday) {
          streak = 0
        }
      }

      this.setData({
        weekData: weekData,
        weekTotalPomodoros: totalPomodoros,
        weekTotalMinutes: totalMinutes,
        streakDays: streak
      })

      var that = this
      setTimeout(function() { that.drawWeekChart() }, 150)
    } catch(e) {}
  },

  drawWeekChart: function() {
    var weekData = this.data.weekData
    if (weekData.length === 0) return
    var isDark = this.data.isDarkMode
    var that = this

    var query = wx.createSelectorQuery()
    query.select('#weekCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getWindowInfo().pixelRatio
      var width = res[0].width
      var height = res[0].height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      var padLeft = 35
      var padRight = 12
      var padTop = 12
      var padBottom = 28
      var chartW = width - padLeft - padRight
      var chartH = height - padTop - padBottom

      var maxCount = 0
      for (var mi = 0; mi < weekData.length; mi++) {
        if (weekData[mi].count > maxCount) maxCount = weekData[mi].count
      }
      if (maxCount === 0) maxCount = that.data.dailyGoal || 8
      maxCount = Math.ceil(maxCount * 1.2)

      ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(226,232,240,0.5)'
      ctx.lineWidth = 0.5
      for (var g = 0; g <= 3; g++) {
        var gy = padTop + chartH * (1 - g / 3)
        ctx.beginPath()
        ctx.moveTo(padLeft, gy)
        ctx.lineTo(padLeft + chartW, gy)
        ctx.stroke()
        ctx.fillStyle = isDark ? '#64748B' : '#94A3B8'
        ctx.font = '9px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(Math.round(maxCount * g / 3), padLeft - 5, gy + 3)
      }

      var barGap = chartW / weekData.length
      var barW = Math.min(barGap * 0.5, 28)

      for (var bi = 0; bi < weekData.length; bi++) {
        var bx = padLeft + barGap * bi + (barGap - barW) / 2
        var bh = maxCount > 0 ? (weekData[bi].count / maxCount) * chartH : 0
        if (bh < 2 && weekData[bi].count > 0) bh = 4
        var by = padTop + chartH - bh

        if (weekData[bi].isToday) {
          var grad = ctx.createLinearGradient(bx, by, bx, padTop + chartH)
          grad.addColorStop(0, '#EF4444')
          grad.addColorStop(1, '#FCA5A5')
          ctx.fillStyle = grad
        } else if (weekData[bi].count > 0) {
          var grad2 = ctx.createLinearGradient(bx, by, bx, padTop + chartH)
          grad2.addColorStop(0, '#F87171')
          grad2.addColorStop(1, '#FECACA')
          ctx.fillStyle = grad2
        } else {
          ctx.fillStyle = isDark ? 'rgba(148,163,184,0.1)' : '#F1F5F9'
          bh = 4
          by = padTop + chartH - bh
        }

        var r = Math.min(4, barW / 4)
        ctx.beginPath()
        ctx.moveTo(bx + r, by)
        ctx.lineTo(bx + barW - r, by)
        ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r)
        ctx.lineTo(bx + barW, padTop + chartH)
        ctx.lineTo(bx, padTop + chartH)
        ctx.lineTo(bx, by + r)
        ctx.quadraticCurveTo(bx, by, bx + r, by)
        ctx.fill()

        if (weekData[bi].count > 0) {
          ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
          ctx.font = 'bold 9px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(weekData[bi].count, bx + barW / 2, by - 4)
        }

        ctx.fillStyle = weekData[bi].isToday ? '#EF4444' : (isDark ? '#94A3B8' : '#64748B')
        ctx.font = (weekData[bi].isToday ? 'bold ' : '') + '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(weekData[bi].dayLabel, bx + barW / 2, padTop + chartH + 16)
      }

      var goalLine = that.data.dailyGoal || 8
      if (goalLine > 0 && goalLine <= maxCount) {
        var goalY = padTop + chartH - (goalLine / maxCount) * chartH
        ctx.setLineDash([4, 3])
        ctx.strokeStyle = '#F59E0B'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(padLeft, goalY)
        ctx.lineTo(padLeft + chartW, goalY)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#F59E0B'
        ctx.font = '8px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText('目标', padLeft + chartW, goalY - 3)
      }
    })
  },

  copyResult: function() {
    var text = '🍅 专注' + this.data.todayFocusMinutes + '分钟 | 今日完成' + this.data.todayPomodoroCount + '个番茄钟'
    toolActions.copyText(text)
  },

  exportCSV: function() {
    var allRecords = storageUtil.get('pomodoro_records', {})
    var dateKeys = Object.keys(allRecords)
    if (dateKeys.length === 0) {
      wx.showToast({ title: this.data.i18n.noDataToExport, icon: 'none' })
      return
    }

    var headers = [
      { key: 'date', label: '日期' },
      { key: 'time', label: '时间' },
      { key: 'type', label: '类型' },
      { key: 'duration', label: '时长(分钟)' }
    ]

    var rows = []
    var sortedKeys = dateKeys.sort().reverse()
    for (var k = 0; k < sortedKeys.length; k++) {
      var dateKey = sortedKeys[k]
      var dayRecords = allRecords[dateKey]
      for (var r = 0; r < dayRecords.length; r++) {
        var rec = dayRecords[r]
        var dateStr = dateKey
        if (dateKey.indexOf('Mon') !== -1 || dateKey.indexOf('Tue') !== -1 || dateKey.indexOf('Wed') !== -1) {
          var d = new Date(dateKey)
          if (!isNaN(d.getTime())) {
            var yy = d.getFullYear()
            var mm = d.getMonth() + 1
            var dd = d.getDate()
            dateStr = yy + '-' + (mm < 10 ? '0' + mm : '' + mm) + '-' + (dd < 10 ? '0' + dd : '' + dd)
          }
        }
        rows.push({
          date: dateStr,
          time: rec.time || '',
          type: rec.type === 'work' ? '专注' : '休息',
          duration: rec.duration || 0
        })
      }
    }

    if (rows.length === 0) {
      wx.showToast({ title: this.data.i18n.noDataToExport, icon: 'none' })
      return
    }

    var csv = csvExport.generateCSV(headers, rows)
    var fileName = csvExport.makeFileName('pomodoro')
    csvExport.saveCSV(csv, fileName)
  },

  shareCSV: function() {
    var allRecords = storageUtil.get('pomodoro_records', {})
    var dateKeys = Object.keys(allRecords)
    if (dateKeys.length === 0) {
      wx.showToast({ title: this.data.i18n.noDataToShare, icon: 'none' })
      return
    }

    var headers = [
      { key: 'date', label: '日期' },
      { key: 'time', label: '时间' },
      { key: 'type', label: '类型' },
      { key: 'duration', label: '时长(分钟)' }
    ]

    var rows = []
    var sortedKeys = dateKeys.sort().reverse()
    for (var k = 0; k < sortedKeys.length; k++) {
      var dateKey = sortedKeys[k]
      var dayRecords = allRecords[dateKey]
      for (var r = 0; r < dayRecords.length; r++) {
        var rec = dayRecords[r]
        var dateStr = dateKey
        if (dateKey.indexOf('Mon') !== -1 || dateKey.indexOf('Tue') !== -1 || dateKey.indexOf('Wed') !== -1) {
          var d = new Date(dateKey)
          if (!isNaN(d.getTime())) {
            var yy = d.getFullYear()
            var mm = d.getMonth() + 1
            var dd = d.getDate()
            dateStr = yy + '-' + (mm < 10 ? '0' + mm : '' + mm) + '-' + (dd < 10 ? '0' + dd : '' + dd)
          }
        }
        rows.push({
          date: dateStr,
          time: rec.time || '',
          type: rec.type === 'work' ? '专注' : '休息',
          duration: rec.duration || 0
        })
      }
    }

    if (rows.length === 0) {
      wx.showToast({ title: this.data.i18n.noDataToShare, icon: 'none' })
      return
    }

    var csv = csvExport.generateCSV(headers, rows)
    var fileName = csvExport.makeFileName('pomodoro')
    csvExport.shareCSV(csv, fileName)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('番茄计时器 - 百宝工具箱', '/package-life/pomodoro/pomodoro', '番茄工作法计时，专注效率提升')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('番茄计时器 - 番茄工作法专注计时')
  }
})
