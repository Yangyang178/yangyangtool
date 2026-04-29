Page({
  data: {
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

    timerInterval: null,

    timerStartTime: 0,
    timerStartLeft: 0
  },

  onLoad: function() {
    this.loadTodayRecords()
    this.drawProgressRing(1)
  },

  onUnload: function() {
    this.clearTimer()
  },

  onShow: function() {
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

    var that = this
    wx.showModal({
      title: that.data.currentMode === 'work' ? '\uD83C\uDF89 \u4E13\u6CE8\u5B8C\u6210\uFF01' : '\u2615 \u4F11\u606F\u7ED3\u675F\uFF01',
      content: that.data.currentMode === 'work' ? '\u4F11\u606F\u4E00\u4E0B\u5427~' : '\u51C6\u5907\u597D\u7EE7\u7EED\u4E86\u5417\uFF1F',
      confirmText: that.data.currentMode === 'work' ? '\u5F00\u59CB\u4F11\u606F' : '\u5F00\u59CB\u5DE5\u4F5C',
      cancelText: '\u7A0D\u540E',
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

  addRecord: function() {
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
      var allRecords = wx.getStorageSync('pomodoro_records') || {}
      allRecords[today] = records
      wx.setStorageSync('pomodoro_records', allRecords)
    } catch (e) {
      console.error('Save record error:', e)
      wx.showToast({ title: '\u8BB0\u5F55\u4FDD\u5B58\u5931\u8D25', icon: 'none', duration: 2000 })
      setTimeout(function() {
        wx.showModal({
          title: '\u26A0\uFE0F \u6570\u636E\u4FDD\u5B58\u5931\u8D25',
          content: '\u756a\u8304\u949F\u8BB0\u5F55\u53EF\u80FD\u672A\u6B63\u786E\u4FDD\u5B58\uFF0C\u662F\u5426\u91CD\u8BD5\uFF1F',
          confirmText: '\u91CD\u8BD5',
          cancelText: '\u7A0D\u540E',
          success: function(res) {
            if (res.confirm) {
              try {
                var allRec = wx.getStorageSync('pomodoro_records') || {}
                var todayKey = new Date().toDateString()
                var existing = allRec[todayKey] || []
                existing.push(record)
                allRec[todayKey] = existing
                wx.setStorageSync('pomodoro_records', allRec)
                wx.showToast({ title: '\u91CD\u8BD5\u6210\u529F', icon: 'success' })
              } catch(e2) {
                wx.showToast({ title: '\u4ECD\u7136\u5931\u8D25', icon: 'none' })
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
  },

  loadTodayRecords: function() {
    try {
      var today = new Date().toDateString()
      var allRecords = wx.getStorageSync('pomodoro_records') || {}
      var todayRecords = allRecords[today] || []
      this.setData({ todayRecords: todayRecords })
    } catch (e) {
      console.error('Load records error:', e)
    }
  },

  onShareAppMessage: function() {
    return { title: '\u756a\u8304\u8BA1\u65F6 - \u597D\u7528\u65B9\u4FBF\u7684\u5DE5\u5177\u96C6', path: '/pages/index/index' }
  },
  onShareTimeline: function() {
    return { title: '' }
  }
})
