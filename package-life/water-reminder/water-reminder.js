Page({
  data: {
    // 统计
    todayCount: 0,
    targetCups: 8,
    progressPercent: 0,
    
    // 设置
    selectedInterval: 30,
    intervalOptions: [
      { value: 15, unit: '分钟' },
      { value: 30, unit: '分钟' },
      { value: 45, unit: '分钟' },
      { value: 60, unit: '小时' },
      { value: 90, unit: '分钟' },
      { value: 120, unit: '小时' }
    ],
    
    // 状态
    isRunning: false,
    nextRemainTime: '',
    
    // 记录
    records: [],
    
    // 定时器
    timerInterval: null,
    countdownSeconds: 0
  },

  onLoad() {
    this.loadTodayRecords()
    this.updateProgress()
  },

  onUnload() {
    this.stopTimer()
  },

  onShow() {
    if (this.data.isRunning) {
      // 页面显示时检查是否需要恢复计时
      const lastTime = wx.getStorageSync('water_reminder_last_time')
      if (lastTime) {
        const elapsed = Math.floor((Date.now() - lastTime) / 1000)
        const interval = this.data.selectedInterval * 60
        const remain = interval - (elapsed % interval)
        this.setData({ countdownSeconds: remain })
        this.updateCountdownDisplay()
      }
    }
  },

  selectInterval(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ selectedInterval: value })
    wx.vibrateShort({ type: 'light' })

    // 如果正在运行，更新倒计时
    if (this.data.isRunning) {
      this.resetCountdown()
    }
  },

  toggleReminder() {
    if (this.data.isRunning) {
      this.stopTimer()
    } else {
      this.startTimer()
    }
  },

  startTimer() {
    wx.vibrateShort({ type: 'medium' })

    this.setData({ 
      isRunning: true,
      countdownSeconds: this.data.selectedInterval * 60
    })

    // 记录开始时间
    wx.setStorageSync('water_reminder_last_time', Date.now())

    // 开始倒计时
    this.startCountdown()

    // 显示启动提示
    wx.showToast({
      title: `每${this.data.selectedInterval}分钟提醒一次`,
      icon: 'none',
      duration: 2000
    })
  },

  stopTimer() {
    wx.vibrateShort({ type: 'light' })

    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.data.timerInterval = null
    }

    this.setData({ 
      isRunning: false,
      nextRemainTime: ''
    })

    wx.removeStorageSync('water_reminder_last_time')

    wx.showToast({ title: '已暂停提醒', icon: 'none' })
  },

  startCountdown() {
    const that = this

    // 先立即更新一次显示
    that.updateCountdownDisplay()

    // 每秒更新倒计时
    this.data.timerInterval = setInterval(() => {
      let newSeconds = that.data.countdownSeconds - 1

      if (newSeconds <= 0) {
        // 触发提醒
        that.triggerReminder()
        return
      }

      that.setData({ countdownSeconds: newSeconds })
      that.updateCountdownDisplay()
    }, 1000)
  },

  resetCountdown() {
    this.setData({ countdownSeconds: this.data.selectedInterval * 60 })
    this.updateCountdownDisplay()
  },

  updateCountdownDisplay() {
    const seconds = this.data.countdownSeconds
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    
    let display = ''
    if (mins > 0) {
      display = `${mins}:${secs.toString().padStart(2, '0')}`
    } else {
      display = `${secs}秒`
    }

    this.setData({ nextRemainTime: display })

    // 更新圆形进度条
    this.drawCountdownRing(seconds / (this.data.selectedInterval * 60))
  },

  drawCountdownRing(progress) {
    const ctx = wx.createCanvasContext('countdownRing', this)
    const centerX = 70
    const centerY = 70
    const radius = 58
    const lineWidth = 6

    ctx.clearRect(0, 0, 140, 140)

    // 背景圆环
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#E2E8F0')
    ctx.setLineWidth(lineWidth)
    ctx.stroke()

    // 进度圆环（逆时针）
    if (progress > 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress)
      ctx.setStrokeStyle('#06B6D4')
      ctx.setLineWidth(lineWidth)
      ctx.setLineCap('round')
      ctx.stroke()
    }

    ctx.draw()
  },

  triggerReminder() {
    // 震动提醒
    wx.vibrateLong()

    // 显示提醒对话框
    wx.showModal({
      title: '💧 该喝水啦！',
      content: '保持身体水分充足，点击"已喝"记录本次饮水',
      confirmText: '✅ 已喝',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          this.addRecord()
        }
        
        // 重置倒计时，继续下一轮
        this.setData({ countdownSeconds: this.data.selectedInterval * 60 })
        this.updateCountdownDisplay()
      }
    })
  },

  addRecord() {
    wx.vibrateShort({ type: 'light' })

    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const newCount = this.data.todayCount + 1
    const record = {
      time: timeStr,
      cup: newCount
    }

    const records = [record, ...this.data.records]

    this.setData({
      todayCount: newCount,
      records: records
    })

    this.updateProgress()
    this.saveRecords()

    wx.showToast({ title: `第 ${newCount} 杯水 💪`, icon: 'none' })
  },

  updateProgress() {
    const percent = Math.min(Math.round((this.data.todayCount / this.data.targetCups) * 100), 100)
    this.setData({ progressPercent: percent })
  },

  saveRecords() {
    try {
      const today = new Date().toDateString()
      let allRecords = wx.getStorageSync('water_records') || {}
      allRecords[today] = {
        count: this.data.todayCount,
        list: this.data.records
      }
      wx.setStorageSync('water_records', allRecords)
    } catch (e) {
      console.error('Save water records error:', e)
    }
  },

  loadTodayRecords() {
    try {
      const today = new Date().toDateString()
      const allRecords = wx.getStorageSync('water_records') || {}
      const todayData = allRecords[today] || {}

      this.setData({
        todayCount: todayData.count || 0,
        records: todayData.list || []
      })
    } catch (e) {
      console.error('Load water records error:', e)
    }
  },

  clearRecords() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空今天的所有饮水记录吗？',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.vibrateShort({ type: 'medium' })
          
          this.setData({
            todayCount: 0,
            records: []
          })
          
          this.updateProgress()
          this.saveRecords()
          
          wx.showToast({ title: '已清空记录', icon: 'success' })
        }
      }
    })
  },
  onShareAppMessage() {
    return { title: '喝水提醒 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
