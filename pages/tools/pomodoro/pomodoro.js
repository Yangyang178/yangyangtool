Page({
  data: {
    // 计时器状态
    isRunning: false,
    isPaused: false,
    timeLeft: 25 * 60, // 秒
    totalTime: 25 * 60,
    displayTime: '25:00',
    statusText: '准备开始',
    
    // 统计
    completedCount: 0,
    totalMinutes: 0,
    currentRound: 1,
    totalRounds: 4,
    
    // 当前模式：work 或 break
    currentMode: 'work', // work = 工作, break = 休息
    
    // 时间配置
    workDurations: [15, 20, 25, 30, 45, 60],
    workDurationIndex: 2, // 默认25分钟
    shortBreaks: [3, 5, 10],
    shortBreakIndex: 1, // 默认5分钟
    longBreaks: [15, 20, 30],
    longBreakIndex: 0, // 默认15分钟
    
    todayRecords: [],
    
    timerInterval: null
  },

  onLoad() {
    this.loadTodayRecords()
    this.drawProgressRing(1) // 初始绘制完整圆环
  },

  onUnload() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
    }
  },

  toggleTimer() {
    if (this.data.isRunning) {
      this.pauseTimer()
    } else {
      this.startTimer()
    }
  },

  startTimer() {
    wx.vibrateShort({ type: 'medium' })
    
    const that = this
    this.setData({
      isRunning: true,
      isPaused: false,
      statusText: this.data.currentMode === 'work' ? '🍅 专注中...' : '☕ 休息中...'
    })

    this.data.timerInterval = setInterval(() => {
      let newTimeLeft = that.data.timeLeft - 1
      
      if (newTimeLeft <= 0) {
        that.timerComplete()
        return
      }

      const minutes = Math.floor(newTimeLeft / 60)
      const seconds = newTimeLeft % 60
      const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      
      const progress = newTimeLeft / that.data.totalTime
      
      that.setData({
        timeLeft: newTimeLeft,
        displayTime: displayTime
      })
      
      that.drawProgressRing(progress)
    }, 1000)
  },

  pauseTimer() {
    wx.vibrateShort({ type: 'light' })
    
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.data.timerInterval = null
    }
    
    this.setData({
      isRunning: false,
      isPaused: true,
      statusText: '已暂停'
    })
  },

  resetTimer() {
    wx.vibrateShort({ type: 'light' })
    
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.data.timerInterval = null
    }

    const duration = this.getDurationForMode()
    
    this.setData({
      isRunning: false,
      isPaused: false,
      timeLeft: duration,
      totalTime: duration,
      displayTime: this.formatTime(duration),
      statusText: '准备开始'
    })

    this.drawProgressRing(1)
  },

  skipToBreak() {
    wx.vibrateShort({ type: 'medium' })
    
    if (this.data.currentMode === 'work') {
      this.switchToBreakMode()
    } else {
      this.switchToWorkMode()
    }
  },

  timerComplete() {
    // 停止计时器
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.data.timerInterval = null
    }

    // 震动提醒
    wx.vibrateLong()

    // 显示完成提示
    wx.showModal({
      title: this.data.currentMode === 'work' ? '🎉 专注完成！' : '☕ 休息结束！',
      content: this.data.currentMode === 'work' ? '休息一下吧~' : '准备好继续了吗？',
      confirmText: this.data.currentMode === 'work' ? '开始休息' : '开始工作',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          if (this.data.currentMode === 'work') {
            this.switchToBreakMode()
          } else {
            this.switchToWorkMode()
          }
        } else {
          // 稍后处理，重置状态
          this.resetTimer()
        }
      }
    })

    // 记录到历史
    this.addRecord()
  },

  switchToBreakMode() {
    const breakDuration = this.data.completedCount > 0 && 
                         (this.data.completedCount + 1) % this.data.totalRounds === 0 
                           ? this.data.longBreaks[this.data.longBreakIndex] * 60 
                           : this.data.shortBreaks[this.data.shortBreakIndex] * 60

    this.setData({
      currentMode: 'break',
      timeLeft: breakDuration,
      totalTime: breakDuration,
      displayTime: this.formatTime(breakDuration),
      completedCount: this.data.completedCount + 1,
      totalMinutes: this.data.totalMinutes + this.data.workDurations[this.data.workDurationIndex]
    })

    this.drawProgressRing(1)

    // 自动开始休息
    setTimeout(() => {
      this.startTimer()
    }, 500)
  },

  switchToWorkMode() {
    const workDuration = this.data.workDurations[this.data.workDurationIndex] * 60

    this.setData({
      currentMode: 'work',
      timeLeft: workDuration,
      totalTime: workDuration,
      displayTime: this.formatTime(workDuration),
      currentRound: Math.min(this.data.currentRound + 1, this.data.totalRounds)
    })

    this.drawProgressRing(1)

    setTimeout(() => {
      this.startTimer()
    }, 500)
  },

  getDurationForMode() {
    if (this.data.currentMode === 'work') {
      return this.data.workDurations[this.data.workDurationIndex] * 60
    } else {
      return this.data.shortBreaks[this.data.shortBreakIndex] * 60
    }
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  drawProgressRing(progress) {
    const ctx = wx.createCanvasContext('progressRing', this)
    const centerX = 120
    const centerY = 120
    const radius = 100
    const lineWidth = 12

    // 清空画布
    ctx.clearRect(0, 0, 240, 240)

    // 背景圆环（灰色）
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#E2E8F0')
    ctx.setLineWidth(lineWidth)
    ctx.setLineCap('round')
    ctx.stroke()

    // 进度圆环
    if (progress > 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress)
      
      if (this.data.currentMode === 'work') {
        ctx.setStrokeStyle('#EF4444') // 红色-工作模式
      } else {
        ctx.setStrokeStyle('#10B981') // 绿色-休息模式
      }
      
      ctx.setLineWidth(lineWidth)
      ctx.setLineCap('round')
      ctx.stroke()
    }

    ctx.draw()
  },

  onWorkDurationChange(e) {
    const index = e.detail.value
    this.setData({ workDurationIndex: index })
    if (!this.data.isRunning && !this.data.isPaused) {
      const duration = this.data.workDurations[index] * 60
      this.setData({
        timeLeft: duration,
        totalTime: duration,
        displayTime: this.formatTime(duration)
      })
      this.drawProgressRing(1)
    }
    wx.vibrateShort({ type: 'light' })
  },

  onShortBreakChange(e) {
    this.setData({ shortBreakIndex: e.detail.value })
    wx.vibrateShort({ type: 'light' })
  },

  onLongBreakChange(e) {
    this.setData({ longBreakIndex: e.detail.value })
    wx.vibrateShort({ type: 'light' })
  },

  changeTotalRounds(e) {
    const round = parseInt(e.currentTarget.dataset.round)
    this.setData({ totalRounds: round })
    wx.vibrateShort({ type: 'light' })
  },

  addRecord() {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const record = {
      type: this.data.currentMode,
      time: timeStr,
      duration: this.data.currentMode === 'work' 
                ? this.data.workDurations[this.data.workDurationIndex]
                : this.data.shortBreaks[this.data.shortBreakIndex]
    }

    const records = [...this.data.todayRecords, record]
    this.setData({ todayRecords: records })

    // 保存到本地存储
    try {
      const today = new Date().toDateString()
      let allRecords = wx.getStorageSync('pomodoro_records') || {}
      allRecords[today] = records
      wx.setStorageSync('pomodoro_records', allRecords)
    } catch (e) {
      console.error('Save record error:', e)
    }
  },

  loadTodayRecords() {
    try {
      const today = new Date().toDateString()
      const allRecords = wx.getStorageSync('pomodoro_records') || {}
      const todayRecords = allRecords[today] || []
      this.setData({ todayRecords })
    } catch (e) {
      console.error('Load records error:', e)
    }
  },
  onShareAppMessage() {
    return { title: '番茄计时 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
