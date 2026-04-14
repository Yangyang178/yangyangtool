const app = getApp()

Page({
  data: {
    hasEvent: false,
    eventName: '',
    targetDate: '',
    targetTime: '00:00',
    today: '',
    
    currentEvent: null,
    timeLeft: {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    isExpired: false,
    passedPercent: 0,
    
    savedEvents: [],
    countdownTimer: null,
    
    quickEvents: [
      { name: '春节', icon: '🧨', getNextDate: () => this.getSpringFestival() },
      { name: '元旦', icon: '🎊', getNextDate: () => this.getNextYearDay() },
      { name: '生日', icon: '🎂', getNextDate: () => '' },
      { name: '考试', icon: '📝', getNextDate: () => '' },
      { name: '放假', icon: '🏖️', getNextDate: () => '' },
      { name: '结婚', icon: '💒', getNextDate: () => '' }
    ]
  },

  onLoad() {
    const today = this.formatDate(new Date())
    this.setData({ today })
    this.loadSavedEvents()
  },

  onShow() {
    if (this.data.hasEvent) {
      this.startCountdown()
    }
  },

  onHide() {
    this.stopCountdown()
  },

  onUnload() {
    this.stopCountdown()
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getSpringFestival() {
    const year = new Date().getFullYear()
    return `${year}-01-29`
  },

  getNextYearDay() {
    const year = new Date().getFullYear() + 1
    return `${year}-01-01`
  },

  onEventNameInput(e) {
    this.setData({ eventName: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ targetDate: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ targetTime: e.detail.value })
  },

  addQuickEvent(e) {
    wx.vibrateShort({ type: 'light' })
    const event = e.currentTarget.dataset.event
    let date = event.getNextDate ? event.getNextDate() : ''
    
    if (!date && event.name === '生日') {
      wx.showToast({ title: '请手动选择日期', icon: 'none' })
    } else if (date) {
      this.setData({
        eventName: event.name,
        targetDate: date
      })
    } else {
      this.setData({ eventName: event.name })
    }
  },

  createCountdown() {
    wx.vibrateShort({ type: 'medium' })
    
    const { eventName, targetDate, targetTime } = this.data
    
    if (!eventName.trim()) {
      wx.showToast({ title: '请输入事件名称', icon: 'none' })
      return
    }
    
    if (!targetDate) {
      wx.showToast({ title: '请选择目标日期', icon: 'none' })
      return
    }

    const targetDateTime = new Date(`${targetDate}T${targetTime || '00:00'}:00`)
    const now = new Date()
    
    if (targetDateTime <= now) {
      wx.showToast({ title: '目标时间必须在未来', icon: 'none' })
      return
    }

    const newEvent = {
      id: Date.now().toString(),
      name: eventName.trim(),
      date: targetDate,
      time: targetTime !== '00:00' ? targetTime : '',
      createdAt: Date.now()
    }

    const events = this.data.savedEvents
    events.push(newEvent)
    this.saveEvents(events)
    
    this.setData({
      currentEvent: newEvent,
      hasEvent: true,
      eventName: '',
      targetDate: '',
      targetTime: '00:00',
      savedEvents: events
    })

    this.drawProgressRing(0)
    this.startCountdown()
    
    wx.showToast({ title: '创建成功！', icon: 'success' })
  },

  startCountdown() {
    this.stopCountdown()
    this.updateCountdown()
    this.data.countdownTimer = setInterval(() => {
      this.updateCountdown()
    }, 1000)
  },

  stopCountdown() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
      this.setData({ countdownTimer: null })
    }
  },

  updateCountdown() {
    const { currentEvent } = this.data
    if (!currentEvent) return

    const now = new Date()
    const target = new Date(`${currentEvent.date}T${currentEvent.time || '00:00'}:00`)
    const diff = target - now

    if (diff <= 0) {
      this.setData({
        isExpired: true,
        passedPercent: 100,
        timeLeft: { days: '00', hours: '00', minutes: '00', seconds: '00' }
      })
      this.drawProgressRing(100)
      this.stopCountdown()
      
      wx.vibrateLong({ type: 'heavy' })
      wx.showModal({
        title: '🎉 时间到！',
        content: `${currentEvent.name} 已到来！`,
        showCancel: false
      })
      return
    }

    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / (24 * 60 * 60))
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const seconds = totalSeconds % 60

    const created = new Date(currentEvent.createdAt)
    const totalDuration = target - created
    const elapsed = now - created
    const passedPercent = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100)

    this.setData({
      timeLeft: {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      },
      isExpired: false,
      passedPercent
    })

    this.drawProgressRing(passedPercent)
    this.updateEventsList()
  },

  drawProgressRing(percent) {
    const ctx = wx.createCanvasContext('progressCanvas')
    const centerX = 100
    const centerY = 100
    const radius = 85
    const lineWidth = 10
    
    ctx.clearRect(0, 0, 200, 200)
    
    ctx.setLineWidth(lineWidth)
    ctx.setStrokeStyle('#E2E8F0')
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()

    if (percent > 0) {
      const gradient = ctx.createLinearGradient(0, 0, 200, 200)
      gradient.addColorStop(0, '#3B82F6')
      gradient.addColorStop(1, '#60A5FA')
      
      ctx.setStrokeStyle(gradient)
      ctx.setLineCap('round')
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * percent / 100))
      ctx.stroke()
    }

    ctx.setFillStyle('#3B82F6')
    ctx.setFontSize(36)
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    
    if (percent < 100) {
      ctx.fillText(`${this.data.timeLeft.days}`, centerX, centerY - 10)
      ctx.setFontSize(14)
      ctx.setFillShapeStyle('#94A3B8')
      ctx.fillText('天', centerX, centerY + 20)
    } else {
      ctx.setFontSize(24)
      ctx.setFillStyle('#10B981')
      ctx.fillText('✓', centerX, centerY)
    }

    ctx.draw()
  },

  updateEventsList() {
    const events = this.data.savedEvents.map(event => {
      const target = new Date(`${event.date}T${event.time || '00:00'}:00`)
      const diff = target - new Date()
      const days = Math.max(Math.ceil(diff / (24 * 60 * 60 * 1000)), 0)
      return { ...event, daysLeft: days }
    })
    
    this.setData({ savedEvents: events })
  },

  editEvent() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      hasEvent: false,
      eventName: this.data.currentEvent.name,
      targetDate: this.data.currentEvent.date,
      targetTime: this.data.currentEvent.time || '00:00'
    })
    this.stopCountdown()
  },

  deleteEvent() {
    wx.vibrateShort({ type: 'medium' })
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${this.data.currentEvent.name}"的倒计时吗？`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          const events = this.data.savedEvents.filter(e => e.id !== this.data.currentEvent.id)
          this.saveEvents(events)
          this.stopCountdown()
          
          this.setData({
            hasEvent: false,
            currentEvent: null,
            savedEvents: events,
            eventName: '',
            targetDate: '',
            targetTime: '00:00',
            isExpired: false,
            passedPercent: 0,
            timeLeft: { days: '00', hours: '00', minutes: '00', seconds: '00' }
          })
          
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  shareEvent() {
    const { currentEvent, timeLeft } = this.data
    const text = `⏰ ${currentEvent.name}\n📅 ${currentEvent.date}\n⏳ 还剩 ${timeLeft.days}天 ${timeLeft.hours}时 ${timeLeft.minutes}分`
    
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  switchEvent(e) {
    wx.vibrateShort({ type: 'light' })
    const event = e.currentTarget.dataset.event
    this.setData({ currentEvent: event })
    this.startCountdown()
  },

  loadSavedEvents() {
    try {
      const events = wx.getStorageSync('countdown_events') || []
      if (events.length > 0) {
        const validEvents = events.filter(event => {
          const target = new Date(`${event.date}T${event.time || '00:00'}:00`)
          return target > new Date()
        })
        
        if (validEvents.length > 0) {
          this.setData({
            savedEvents: validEvents,
            currentEvent: validEvents[0],
            hasEvent: true
          })
          this.startCountdown()
        }
        
        if (validEvents.length !== events.length) {
          this.saveEvents(validEvents)
        }
      }
    } catch (e) {
      console.log('加载失败:', e)
    }
  },

  saveEvents(events) {
    try {
      wx.setStorageSync('countdown_events', events)
    } catch (e) {
      console.log('保存失败:', e)
    }
  },

  onShareAppMessage() {
    const { currentEvent } = this.data
    return {
      title: currentEvent 
        ? `⏰ ${currentEvent.name} 倒计时` 
        : '倒计时 - 百宝工具箱',
      path: '/pages/tools/countdown/countdown'
    }
  }
})