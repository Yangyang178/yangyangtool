var app = getApp()
var points = require('../../utils/points.js')
var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var subscribe = require('../utils/subscribe.js')

Page({
  data: {
    i18n: {},
    todayCount: 0,
    targetCups: 8,
    progressPercent: 0,
    selectedInterval: 30,
    intervalOptions: [
      { value: 15, unit: '分钟' },
      { value: 30, unit: '分钟' },
      { value: 45, unit: '分钟' },
      { value: 60, unit: '分钟' },
      { value: 90, unit: '分钟' },
      { value: 120, unit: '分钟' }
    ],
    isRunning: false,
    nextRemainTime: '',
    records: [],
    timerInterval: null,
    countdownSeconds: 0,
    weekData: [],
    weekLabels: [],
    weekMax: 8,
    weekAvg: '0.0',
    weekHighest: 0,
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    cupSize: 250,
    cupSizeOptions: [
      { value: 150, label: '150ml' },
      { value: 200, label: '200ml' },
      { value: 250, label: '250ml' },
      { value: 300, label: '300ml' }
    ],
    isCustomCup: false,
    showCupCustom: false,
    customCupInput: '',
    todayMl: 0,
    targetMl: 2000,
    streakDays: 0,
    monthData: [],
    showMonthChart: false,
    isLoading: true
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('喝水提醒')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('waterReminder') })

    var savedInterval = storageUtil.get('water_reminder_interval', 30)
    this.setData({ selectedInterval: savedInterval })

    var savedCupSize = storageUtil.get('water_cup_size', 250)
    var isPreset = false
    for (var ci = 0; ci < this.data.cupSizeOptions.length; ci++) {
      if (this.data.cupSizeOptions[ci].value === savedCupSize) { isPreset = true; break }
    }
    this.setData({
      cupSize: savedCupSize,
      targetMl: savedCupSize * this.data.targetCups,
      isCustomCup: !isPreset
    })

    this.loadTodayRecords()
    this.updateProgress()
    this.loadWeekData()
    this.calcStreak()
    this.loadMonthData()
    poster.setupForPage(this, 10)
    this.setData({ isLoading: false })
  },

  onUnload: function() {
    this.stopTimer()
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('waterReminder') })

    if (this.data.isRunning) {
      var lastTime = storageUtil.get('water_reminder_last_time')
      if (lastTime) {
        var elapsed = Math.floor((Date.now() - lastTime) / 1000)
        var interval = this.data.selectedInterval * 60
        var remain = interval - (elapsed % interval)
        if (remain <= 0) {
          this.triggerReminder()
        } else {
          this.setData({ countdownSeconds: remain })
          this.updateCountdownDisplay()
        }
      }
    }
  },

  selectInterval: function(e) {
    var value = e.currentTarget.dataset.value
    this.setData({ selectedInterval: value })
    storageUtil.safeSet('water_reminder_interval', value)
    wx.vibrateShort({ type: 'light' })

    if (this.data.isRunning) {
      this.resetCountdown()
    }
  },

  selectCupSize: function(e) {
    var value = e.currentTarget.dataset.value
    if (value === 'custom') {
      this.setData({ showCupCustom: true, customCupInput: '' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    this.setData({
      cupSize: value,
      targetMl: value * this.data.targetCups,
      isCustomCup: false
    })
    storageUtil.safeSet('water_cup_size', value)
    this.updateProgress()
  },

  doNothing: function() {},

  onCustomCupInput: function(e) {
    this.setData({ customCupInput: e.detail.value })
  },

  onQuickCup: function(e) {
    var val = e.currentTarget.dataset.val
    this.setData({ customCupInput: val })
  },

  hideCupCustom: function() {
    this.setData({ showCupCustom: false })
  },

  saveCustomCup: function() {
    var val = parseInt(this.data.customCupInput)
    if (!val || val < 50 || val > 1000) {
      wx.showToast({ title: this.data.i18n.inputCupRange, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    this.setData({
      cupSize: val,
      targetMl: val * this.data.targetCups,
      isCustomCup: true,
      showCupCustom: false
    })
    storageUtil.safeSet('water_cup_size', val)
    this.updateProgress()
  },

  toggleMonthChart: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showMonthChart
    this.setData({ showMonthChart: show })
    if (show) {
      var that = this
      setTimeout(function() { that.drawMonthChart() }, 150)
    }
  },

  calcStreak: function() {
    var allRecords = {}
    try { allRecords = storageUtil.get('water_records', {}) } catch(e) {}
    var target = this.data.targetCups
    var streak = 0
    var today = new Date()

    for (var i = 0; i < 365; i++) {
      var d = new Date(today)
      d.setDate(d.getDate() - i)
      var key = d.toDateString()
      var dayData = allRecords[key] || {}
      var count = dayData.count || 0
      if (count >= target) {
        streak++
      } else if (i === 0) {
        continue
      } else {
        break
      }
    }

    this.setData({ streakDays: streak })
  },

  loadMonthData: function() {
    var allRecords = {}
    try { allRecords = storageUtil.get('water_records', {}) } catch(e) {}
    var monthData = []
    var target = this.data.targetCups

    for (var i = 29; i >= 0; i--) {
      var d = new Date()
      d.setDate(d.getDate() - i)
      var key = d.toDateString()
      var dayData = allRecords[key] || {}
      var count = dayData.count || 0
      var isToday = i === 0
      monthData.push({
        date: key,
        dayLabel: (d.getMonth() + 1) + '/' + d.getDate(),
        count: count,
        ml: count * this.data.cupSize,
        reached: count >= target,
        isToday: isToday
      })
    }

    this.setData({ monthData: monthData })
  },

  drawMonthChart: function() {
    var monthData = this.data.monthData
    if (monthData.length === 0) return
    var isDark = this.data.isDarkMode
    var target = this.data.targetCups
    var that = this

    var query = wx.createSelectorQuery()
    query.select('#monthCanvas').fields({ node: true, size: true }).exec(function(res) {
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
      var padRight = 8
      var padTop = 14
      var padBottom = 28
      var chartW = width - padLeft - padRight
      var chartH = height - padTop - padBottom

      var maxCount = target
      for (var mi = 0; mi < monthData.length; mi++) {
        if (monthData[mi].count > maxCount) maxCount = monthData[mi].count
      }
      maxCount = Math.ceil(maxCount * 1.15)

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
        ctx.fillText(Math.round(maxCount * g / 3), padLeft - 4, gy + 3)
      }

      var targetY = padTop + chartH - (target / maxCount) * chartH
      ctx.setLineDash([4, 3])
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padLeft, targetY)
      ctx.lineTo(padLeft + chartW, targetY)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#F59E0B'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('目标', padLeft + chartW, targetY - 3)

      var chartPoints = []
      for (var pi = 0; pi < monthData.length; pi++) {
        var px = padLeft + (chartW / (monthData.length - 1)) * pi
        var py = padTop + chartH - ((monthData[pi].count || 0) / maxCount) * chartH
        chartPoints.push({ x: px, y: py })
      }

      ctx.beginPath()
      ctx.moveTo(chartPoints[0].x, padTop + chartH)
      ctx.lineTo(chartPoints[0].x, chartPoints[0].y)
      for (var si = 1; si < chartPoints.length; si++) {
        var cpx = (chartPoints[si - 1].x + chartPoints[si].x) / 2
        ctx.bezierCurveTo(cpx, chartPoints[si - 1].y, cpx, chartPoints[si].y, chartPoints[si].x, chartPoints[si].y)
      }
      ctx.lineTo(chartPoints[chartPoints.length - 1].x, padTop + chartH)
      ctx.closePath()
      var grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH)
      grad.addColorStop(0, 'rgba(6,182,212,0.25)')
      grad.addColorStop(1, 'rgba(6,182,212,0.02)')
      ctx.fillStyle = grad
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(chartPoints[0].x, chartPoints[0].y)
      for (var li = 1; li < chartPoints.length; li++) {
        var cpxL = (chartPoints[li - 1].x + chartPoints[li].x) / 2
        ctx.bezierCurveTo(cpxL, chartPoints[li - 1].y, cpxL, chartPoints[li].y, chartPoints[li].x, chartPoints[li].y)
      }
      ctx.strokeStyle = '#06B6D4'
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.stroke()

      for (var di = 0; di < monthData.length; di++) {
        if (monthData[di].reached) {
          ctx.beginPath()
          ctx.arc(chartPoints[di].x, chartPoints[di].y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = '#10B981'
          ctx.fill()
        }
      }

      var lastPt = chartPoints[chartPoints.length - 1]
      ctx.beginPath()
      ctx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#06B6D4'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(lastPt.x, lastPt.y, 7, 0, Math.PI * 2)
      ctx.strokeStyle = '#06B6D4'
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.4
      ctx.stroke()
      ctx.globalAlpha = 1

      var labelStep = Math.max(1, Math.floor(monthData.length / 6))
      ctx.fillStyle = isDark ? '#64748B' : '#94A3B8'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      for (var xi = 0; xi < monthData.length; xi += labelStep) {
        ctx.fillText(monthData[xi].dayLabel, chartPoints[xi].x, padTop + chartH + 16)
      }
    })
  },

  toggleReminder: function() {
    if (this.data.isRunning) {
      this.stopTimer()
    } else {
      this.startTimer()
    }
  },

  startTimer: function() {
    wx.vibrateShort({ type: 'medium' })

    this.setData({
      isRunning: true,
      countdownSeconds: this.data.selectedInterval * 60
    })

    storageUtil.safeSet('water_reminder_last_time', Date.now())

    this.startCountdown()

    // 开启提醒时请求订阅消息，以便后台也能收到喝水提醒
    var that = this
    if (subscribe.shouldRequestSubscribe('WATER_REMIND')) {
      subscribe.requestWaterSubscribe(function(res) {
        if (res.success && res.subscribed) {
          // 注册云函数定时提醒
          subscribe.registerWaterReminder(
            that.data.selectedInterval,
            that.data.todayCount,
            that.data.targetCups
          )
          wx.showToast({ title: that.data.i18n.pushReminderOn || '已开启推送提醒', icon: 'none', duration: 1500 })
        }
      })
    }

    wx.showToast({
      title: this.data.i18n.reminderInterval + this.data.selectedInterval + this.data.i18n.reminderIntervalSuffix,
      icon: 'none',
      duration: 2000
    })
  },

  stopTimer: function() {
    wx.vibrateShort({ type: 'light' })

    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval)
      this.data.timerInterval = null
    }

    // 停止提醒时取消云函数推送
    subscribe.cancelWaterReminder()

    this.setData({
      isRunning: false,
      nextRemainTime: ''
    })

    wx.removeStorageSync('water_reminder_last_time')
    wx.showToast({ title: this.data.i18n.reminderPaused, icon: 'none' })
  },

  startCountdown: function() {
    var that = this
    that.updateCountdownDisplay()

    this.data.timerInterval = setInterval(function() {
      var newSeconds = that.data.countdownSeconds - 1

      if (newSeconds <= 0) {
        that.triggerReminder()
        return
      }

      that.setData({ countdownSeconds: newSeconds })
      that.updateCountdownDisplay()
    }, 1000)
  },

  resetCountdown: function() {
    this.setData({ countdownSeconds: this.data.selectedInterval * 60 })
    storageUtil.safeSet('water_reminder_last_time', Date.now())
    this.updateCountdownDisplay()
  },

  updateCountdownDisplay: function() {
    var seconds = this.data.countdownSeconds
    var mins = Math.floor(seconds / 60)
    var secs = seconds % 60

    var display = ''
    if (mins > 0) {
      display = mins + ':' + (secs < 10 ? '0' : '') + secs
    } else {
      display = secs + '秒'
    }

    this.setData({ nextRemainTime: display })
    this.drawCountdownRing(seconds / (this.data.selectedInterval * 60))
  },

  drawCountdownRing: function(progress) {
    var query = wx.createSelectorQuery()
    query.select('#countdownRing')
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
        var radius = Math.min(w, h) / 2 - 6
        var lineWidth = 6

        ctx.clearRect(0, 0, w, h)

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = '#E2E8F0'
        ctx.lineWidth = lineWidth
        ctx.stroke()

        if (progress > 0) {
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress)
          ctx.strokeStyle = '#06B6D4'
          ctx.lineWidth = lineWidth
          ctx.lineCap = 'round'
          ctx.stroke()
        }
      })
  },

  triggerReminder: function() {
    wx.vibrateLong()

    var that = this

    wx.showModal({
      title: this.data.i18n.timeToDrink,
      content: this.data.i18n.drinkWaterMsg,
      confirmText: this.data.i18n.drankBtn,
      cancelText: this.data.i18n.laterBtn,
      success: function(res) {
        if (res.confirm) {
          that.addRecord()
        }
        that.setData({ countdownSeconds: that.data.selectedInterval * 60 })
        storageUtil.safeSet('water_reminder_last_time', Date.now())
        that.updateCountdownDisplay()
      }
    })
  },

  addRecord: function() {
    wx.vibrateShort({ type: 'light' })

    var now = new Date()
    var hours = now.getHours()
    var minutes = now.getMinutes()
    var timeStr = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes

    var newCount = this.data.todayCount + 1
    var record = {
      time: timeStr,
      cup: newCount
    }

    var records = [record].concat(this.data.records)

    this.setData({
      todayCount: newCount,
      records: records
    })

    this.updateProgress()
    this.saveRecords()
    this.loadWeekData()

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(10, '喝水提醒', false)

    wx.showToast({ title: this.data.i18n.cupNo + ' ' + newCount + this.data.i18n.cupWater, icon: 'none' })

    // 每次喝水记录后请求订阅，累积喝水提醒配额
    subscribe.requestOnWaterRecord()
  },

  manualAddWater: function() {
    this.addRecord()
  },

  updateProgress: function() {
    var percent = Math.min(Math.round((this.data.todayCount / this.data.targetCups) * 100), 100)
    var ml = this.data.todayCount * this.data.cupSize
    this.setData({ progressPercent: percent, todayMl: ml })
  },

  saveRecords: function() {
    try {
      var today = new Date().toDateString()
      var allRecords = storageUtil.get('water_records', {})
      allRecords[today] = {
        count: this.data.todayCount,
        list: this.data.records
      }
      // 清理30天前的旧数据
      storageUtil.cleanDateKeyedData('water_records', 30)
      storageUtil.safeSet('water_records', allRecords)
    } catch (e) {
      wx.showToast({ title: this.data.i18n.recordSaveFailed, icon: 'none', duration: 2000 })
    }
  },

  loadTodayRecords: function() {
    try {
      var today = new Date().toDateString()
      var allRecords = storageUtil.get('water_records', {})
      var todayData = allRecords[today] || {}

      this.setData({
        todayCount: todayData.count || 0,
        records: todayData.list || []
      })
    } catch (e) {}
  },

  loadWeekData: function() {
    var allRecords = {}
    try { allRecords = storageUtil.get('water_records', {}) } catch(e) {}

    var weekData = []
    var weekLabels = []
    var weekMax = this.data.targetCups
    var dayNames = ['日', '一', '二', '三', '四', '五', '六']

    for (var i = 6; i >= 0; i--) {
      var d = new Date()
      d.setDate(d.getDate() - i)
      var key = d.toDateString()
      var dayData = allRecords[key] || {}
      var count = dayData.count || 0

      weekData.push(count)
      weekLabels.push('周' + dayNames[d.getDay()])

      if (count > weekMax) weekMax = count
    }

    var weekTotal = 0
    var weekHighest = 0
    for (var j = 0; j < weekData.length; j++) {
      weekTotal += weekData[j]
      if (weekData[j] > weekHighest) weekHighest = weekData[j]
    }
    var weekAvg = (weekTotal / 7).toFixed(1)

    this.setData({
      weekData: weekData,
      weekLabels: weekLabels,
      weekMax: weekMax + 2,
      weekAvg: weekAvg,
      weekHighest: weekHighest
    })

    this.drawWeekChart()
  },

  drawWeekChart: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#weekChart')
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
        var padding = { top: 20, right: 16, bottom: 30, left: 16 }
        var chartW = w - padding.left - padding.right
        var chartH = h - padding.top - padding.bottom

        ctx.clearRect(0, 0, w, h)

        var weekData = that.data.weekData
        var weekLabels = that.data.weekLabels
        var weekMax = that.data.weekMax
        var targetCups = that.data.targetCups
        var isDark = that.data.isDarkMode

        var gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
        var textColor = isDark ? '#94A3B8' : '#94A3B8'
        var barColor = '#06B6D4'
        var barColorLight = 'rgba(6,182,212,0.15)'
        var targetLineColor = isDark ? 'rgba(251,191,36,0.4)' : 'rgba(245,158,11,0.3)'

        for (var g = 0; g <= 4; g++) {
          var gy = padding.top + chartH - (chartH * g / 4)
          ctx.beginPath()
          ctx.moveTo(padding.left, gy)
          ctx.lineTo(w - padding.right, gy)
          ctx.strokeStyle = gridColor
          ctx.lineWidth = 1
          ctx.stroke()
        }

        var targetY = padding.top + chartH - (chartH * targetCups / weekMax)
        ctx.beginPath()
        ctx.setLineDash([4, 4])
        ctx.moveTo(padding.left, targetY)
        ctx.lineTo(w - padding.right, targetY)
        ctx.strokeStyle = targetLineColor
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])

        var barWidth = chartW / 7 * 0.5
        var gap = chartW / 7

        for (var i = 0; i < 7; i++) {
          var x = padding.left + gap * i + gap / 2
          var barH = weekMax > 0 ? (weekData[i] / weekMax) * chartH : 0
          var y = padding.top + chartH - barH

          ctx.fillStyle = barColorLight
          ctx.beginPath()
          var r = Math.min(barWidth / 2, 6)
          var bx = x - barWidth / 2
          var by = y
          var bw = barWidth
          var bh = barH
          if (bh > r * 2) {
            ctx.moveTo(bx + r, by)
            ctx.arcTo(bx + bw, by, bx + bw, by + bh, r)
            ctx.lineTo(bx + bw, by + bh)
            ctx.lineTo(bx, by + bh)
            ctx.arcTo(bx, by, bx + bw, by, r)
          } else if (bh > 0) {
            ctx.rect(bx, by, bw, bh)
          }
          ctx.fill()

          if (weekData[i] > 0) {
            var fillH = Math.min(bh, bh * 0.7)
            var fillY = padding.top + chartH - fillH
            ctx.fillStyle = barColor
            ctx.beginPath()
            if (fillH > r * 2) {
              ctx.moveTo(bx + r, fillY)
              ctx.arcTo(bx + bw, fillY, bx + bw, fillY + fillH, r)
              ctx.lineTo(bx + bw, by + bh)
              ctx.lineTo(bx, by + bh)
              ctx.arcTo(bx, fillY, bx + bw, fillY, r)
            } else if (fillH > 0) {
              ctx.rect(bx, fillY, bw, fillH)
            }
            ctx.fill()
          }

          if (weekData[i] > 0) {
            ctx.fillStyle = barColor
            ctx.font = '10px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(weekData[i], x, y - 6)
          }

          ctx.fillStyle = textColor
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(weekLabels[i], x, h - 8)
        }
      })
  },

  clearRecords: function() {
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmClear,
      content: that.data.i18n.confirmClearRecords,
      confirmText: that.data.i18n.clear,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          wx.vibrateShort({ type: 'medium' })

          that.setData({
            todayCount: 0,
            records: []
          })

          that.updateProgress()
          that.saveRecords()
          that.loadWeekData()

          wx.showToast({ title: that.data.i18n.recordsCleared, icon: 'success' })
        }
      }
    })
  },

  copyResult: function() {
    var text = '今日饮水: ' + this.data.todayCount + '/' + this.data.targetCups + '杯, 完成度: ' + this.data.progressPercent + '%'
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        todayCount: 0,
        records: []
      })
      that.updateProgress()
      that.saveRecords()
      that.loadWeekData()
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('喝水提醒 - 百宝工具箱', '/package-life/water-reminder/water-reminder', '每日饮水记录提醒，健康喝水计划')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('喝水提醒 - 每日饮水记录健康计划')
  }
})
