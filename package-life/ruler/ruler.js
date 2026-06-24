var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var app = getApp()

var MODE_RULER = 'ruler'
var MODE_PROTRACTOR = 'protractor'
var MODE_LEVEL = 'level'

Page({
  data: {
    isLoading: true,
    i18n: {},
    currentMode: MODE_RULER,

    unit: 'cm',
    ticks: [],
    pxPerMM: 0,
    screenPhysicalMM: 0,
    scale: 1,
    showTip: true,
    isLandscape: false,
    landscapeWidth: 0,
    landscapeHeight: 0,
    landscapeTicks: [],
    calibration: 1,
    showCalibration: false,

    protractorAngle1: 0,
    protractorAngle2: 90,
    protractorAngleDisplay: '90.0',
    protractorDragging: '',
    protractorCanvasSize: 300,

    levelX: 0,
    levelY: 0,
    levelAngleX: '0.0',
    levelAngleY: '0.0',
    levelTotalAngle: '0.0',
    levelIsFlat: true,
    levelBubbleX: 50,
    levelBubbleY: 50,

    measureRecords: [],
    showRecords: false,

    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium'
  },

  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('尺子')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('ruler') })

    this.initScreenInfo()
    this.generateTicks()
    this._loadRecords()
    poster.setupForPage(this, 27)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('ruler') })
    if (this.data.currentMode === MODE_LEVEL) {
      this._startAccelerometer()
    }
  },

  onHide: function() {
    this._stopAccelerometer()
  },

  onUnload: function() {
    this._stopAccelerometer()
  },

  onPrivacyAgreed: function() {
    if (this.data.currentMode === MODE_LEVEL) {
      this._startAccelerometer()
    }
  },

  switchMode: function(e) {
    var mode = e.currentTarget.dataset.mode
    if (mode === this.data.currentMode) return
    wx.vibrateShort({ type: 'light' })
    this.setData({ currentMode: mode })
    if (mode === MODE_PROTRACTOR) {
      var that = this
      setTimeout(function() {
        that._drawProtractor()
      }, 300)
    } else if (mode === MODE_LEVEL) {
      this._startAccelerometer()
    } else {
      this._stopAccelerometer()
    }
  },

  initScreenInfo: function () {
    var info = wx.getSystemInfoSync()
    var screenWidth = info.screenWidth
    var screenHeight = info.screenHeight
    var platform = info.platform || ''
    var CAL_VERSION = 'v3'
    var savedVersion = ''
    try { savedVersion = storageUtil.get('ruler_cal_version', '') } catch (e) {}
    var savedCalibration = 1
    if (savedVersion === CAL_VERSION) {
      try { savedCalibration = parseFloat(storageUtil.get('ruler_calibration')) || 1 } catch (e) {}
    } else {
      try { storageUtil.safeSet('ruler_calibration', 1) } catch (e) {}
      try { storageUtil.safeSet('ruler_cal_version', CAL_VERSION) } catch (e) {}
    }
    var physicalWidthMM
    if (platform === 'ios') {
      var ppi = info.pixelRatio <= 2 ? 326 : 460
      physicalWidthMM = screenWidth * info.pixelRatio / ppi * 25.4
    } else {
      var dpi = info.pixelRatio * 160
      physicalWidthMM = screenWidth * info.pixelRatio / dpi * 25.4
    }
    var pxPerMM = screenWidth / physicalWidthMM * savedCalibration
    var canvasSize = Math.min(screenWidth - 48, 340)

    this.setData({
      pxPerMM: pxPerMM,
      screenPhysicalMM: Math.round(physicalWidthMM * 10) / 10,
      calibration: savedCalibration,
      landscapeWidth: screenHeight,
      landscapeHeight: screenWidth,
      protractorCanvasSize: canvasSize
    })
  },

  generateTicks: function () {
    if (this.data.unit === 'cm') {
      this.generateCMTicks()
    } else {
      this.generateInchTicks()
    }
  },

  generateCMTicks: function () {
    var pxPerMM = this.data.pxPerMM
    var scale = this.data.scale
    var totalMM = 300
    var ticks = []

    for (var i = 0; i <= totalMM; i++) {
      var type = 'small'
      var label = ''
      if (i % 10 === 0) {
        type = 'large'
        label = String(i / 10)
      } else if (i % 5 === 0) {
        type = 'medium'
      }
      ticks.push({
        offset: i * pxPerMM * scale,
        type: type,
        label: label
      })
    }
    this.setData({ ticks: ticks })
  },

  generateInchTicks: function () {
    var pxPerMM = this.data.pxPerMM
    var scale = this.data.scale
    var totalInch = 12
    var pxPerInch = pxPerMM * 25.4
    var ticks = []

    for (var s = 0; s <= totalInch * 16; s++) {
      var type = 'small'
      var label = ''
      var inchVal = s / 16
      if (s % 16 === 0) {
        type = 'large'
        label = String(s / 16)
      } else if (s % 8 === 0) {
        type = 'medium'
      } else if (s % 4 === 0) {
        type = 'medium-small'
      }
      ticks.push({
        offset: inchVal * pxPerInch * scale,
        type: type,
        label: label
      })
    }
    this.setData({ ticks: ticks })
  },

  generateLandscapeTicks: function () {
    var pxPerMM = this.data.pxPerMM
    var unit = this.data.unit
    var ticks = []

    if (unit === 'cm') {
      var totalMM = 500
      for (var i = 0; i <= totalMM; i++) {
        var type = 'small'
        var label = ''
        if (i % 10 === 0) {
          type = 'large'
          label = String(i / 10)
        } else if (i % 5 === 0) {
          type = 'medium'
        }
        ticks.push({ offset: i * pxPerMM, type: type, label: label })
      }
    } else {
      var totalInch = 20
      var pxPerInch = pxPerMM * 25.4
      for (var s = 0; s <= totalInch * 16; s++) {
        var type2 = 'small'
        var label2 = ''
        var inchVal = s / 16
        if (s % 16 === 0) { type2 = 'large'; label2 = String(s / 16) }
        else if (s % 8 === 0) { type2 = 'medium' }
        else if (s % 4 === 0) { type2 = 'medium-small' }
        ticks.push({ offset: inchVal * pxPerInch, type: type2, label: label2 })
      }
    }
    this.setData({ landscapeTicks: ticks })
  },

  switchUnit: function (e) {
    var unit = e.currentTarget.dataset.unit
    if (unit === this.data.unit) return
    wx.vibrateShort({ type: 'light' })
    this.setData({ unit: unit })
    this.generateTicks()
    if (this.data.isLandscape) this.generateLandscapeTicks()
  },

  enterLandscape: function () {
    wx.vibrateShort({ type: 'medium' })
    this.generateLandscapeTicks()
    this.setData({ isLandscape: true })
  },

  exitLandscape: function () {
    this.setData({ isLandscape: false })
  },

  onScaleStart: function (e) {
    if (e.touches.length < 2) return
    var t1 = e.touches[0]
    var t2 = e.touches[1]
    this._startDist = Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2))
    this._startScale = this.data.scale
  },

  onScaleMove: function (e) {
    if (e.touches.length < 2 || !this._startDist) return
    var t1 = e.touches[0]
    var t2 = e.touches[1]
    var dist = Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2))
    var newScale = this._startScale * (dist / this._startDist)
    newScale = Math.max(0.5, Math.min(3, newScale))
    this.setData({ scale: newScale })
    this.generateTicks()
  },

  onScaleEnd: function () {
    this._startDist = null
    this._startScale = null
  },

  resetScale: function () {
    wx.vibrateShort({ type: 'light' })
    this.setData({ scale: 1 })
    this.generateTicks()
  },

  dismissTip: function () {
    this.setData({ showTip: false })
  },

  toggleCalibration: function () {
    this.setData({ showCalibration: !this.data.showCalibration })
  },

  onCalibrationChange: function (e) {
    var calibration = parseFloat(e.detail.value) || 1
    this.applyCalibration(calibration)
  },

  applyCalibration: function (calibration) {
    var info = wx.getSystemInfoSync()
    var screenWidth = info.screenWidth
    var basePhysicalMM = this.data.screenPhysicalMM
    var basePxPerMM = screenWidth / basePhysicalMM

    this.setData({
      calibration: calibration,
      pxPerMM: basePxPerMM * calibration
    })
    this.generateTicks()
    this.generateLandscapeTicks()
    try { storageUtil.safeSet('ruler_calibration', calibration) } catch (e) {}

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(27, '尺子', false)
  },

  resetCalibration: function () {
    this.applyCalibration(1)
  },

  landscapeCalPlus: function () {
    var cal = Math.min(1.2, Math.round((this.data.calibration + 0.01) * 100) / 100)
    this.applyCalibration(cal)
  },

  landscapeCalMinus: function () {
    var cal = Math.max(0.8, Math.round((this.data.calibration - 0.01) * 100) / 100)
    this.applyCalibration(cal)
  },

  _drawProtractor: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#protractorCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getSystemInfoSync().pixelRatio
      var size = that.data.protractorCanvasSize
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.scale(dpr, dpr)

      var cx = size / 2
      var cy = size * 0.75
      var radius = size * 0.42
      var isDark = that.data.isDarkMode

      ctx.clearRect(0, 0, size, size)

      ctx.beginPath()
      ctx.arc(cx, cy, radius, Math.PI, 0, false)
      ctx.closePath()
      ctx.fillStyle = isDark ? '#1e2738' : '#F0F4FF'
      ctx.fill()
      ctx.strokeStyle = isDark ? '#475569' : '#94A3B8'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(cx - radius, cy)
      ctx.lineTo(cx + radius, cy)
      ctx.strokeStyle = isDark ? '#64748B' : '#CBD5E1'
      ctx.lineWidth = 1
      ctx.stroke()

      var i, angle, innerR, outerR, x1, y1, x2, y2
      for (i = 0; i <= 180; i++) {
        angle = (i - 90) * Math.PI / 180
        if (i % 10 === 0) {
          innerR = radius - 18
          outerR = radius
          ctx.lineWidth = 1.5
          ctx.strokeStyle = isDark ? '#94A3B8' : '#475569'
        } else if (i % 5 === 0) {
          innerR = radius - 12
          outerR = radius
          ctx.lineWidth = 1
          ctx.strokeStyle = isDark ? '#64748B' : '#94A3B8'
        } else {
          innerR = radius - 7
          outerR = radius
          ctx.lineWidth = 0.5
          ctx.strokeStyle = isDark ? '#374151' : '#CBD5E1'
        }
        x1 = cx + innerR * Math.cos(angle)
        y1 = cy + innerR * Math.sin(angle)
        x2 = cx + outerR * Math.cos(angle)
        y2 = cy + outerR * Math.sin(angle)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        if (i % 30 === 0 && i > 0 && i < 180) {
          var labelR = radius - 26
          var lx = cx + labelR * Math.cos(angle)
          var ly = cy + labelR * Math.sin(angle)
          ctx.fillStyle = isDark ? '#CBD5E1' : '#475569'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(i), lx, ly)
        }
      }

      ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('0', cx + radius + 12, cy + 4)
      ctx.fillText('180', cx - radius - 16, cy + 4)
      ctx.fillText('90', cx, cy - radius - 8)

      var a1 = that.data.protractorAngle1
      var a2 = that.data.protractorAngle2
      var rad1 = (a1 - 90) * Math.PI / 180
      var rad2 = (a2 - 90) * Math.PI / 180
      var lineR = radius + 10

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + lineR * Math.cos(rad1), cy + lineR * Math.sin(rad1))
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2.5
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + lineR * Math.cos(rad2), cy + lineR * Math.sin(rad2))
      ctx.strokeStyle = '#EF4444'
      ctx.lineWidth = 2.5
      ctx.stroke()

      var arcR = 30
      var startAngle = Math.min(rad1, rad2)
      var endAngle = Math.max(rad1, rad2)
      ctx.beginPath()
      ctx.arc(cx, cy, arcR, startAngle, endAngle, false)
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx + (radius + 10) * Math.cos(rad1), cy + (radius + 10) * Math.sin(rad1), 8, 0, Math.PI * 2)
      ctx.fillStyle = '#3B82F6'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(cx + (radius + 10) * Math.cos(rad2), cy + (radius + 10) * Math.sin(rad2), 8, 0, Math.PI * 2)
      ctx.fillStyle = '#EF4444'
      ctx.fill()
    })
  },

  onProtractorTouchStart: function(e) {
    if (!e.touches || e.touches.length === 0) return
    var touch = e.touches[0]
    var size = this.data.protractorCanvasSize
    var cx = size / 2
    var cy = size * 0.75
    var radius = size * 0.42 + 10
    var a1 = this.data.protractorAngle1
    var a2 = this.data.protractorAngle2
    var rad1 = (a1 - 90) * Math.PI / 180
    var rad2 = (a2 - 90) * Math.PI / 180
    var p1x = cx + radius * Math.cos(rad1)
    var p1y = cy + radius * Math.sin(rad1)
    var p2x = cx + radius * Math.cos(rad2)
    var p2y = cy + radius * Math.sin(rad2)
    var dist1 = Math.sqrt(Math.pow(touch.x - p1x, 2) + Math.pow(touch.y - p1y, 2))
    var dist2 = Math.sqrt(Math.pow(touch.x - p2x, 2) + Math.pow(touch.y - p2y, 2))
    if (dist1 < 30 && dist1 < dist2) {
      this.setData({ protractorDragging: 'angle1' })
    } else if (dist2 < 30) {
      this.setData({ protractorDragging: 'angle2' })
    }
  },

  onProtractorTouchMove: function(e) {
    var dragging = this.data.protractorDragging
    if (!dragging || !e.touches || e.touches.length === 0) return
    var touch = e.touches[0]
    var size = this.data.protractorCanvasSize
    var cx = size / 2
    var cy = size * 0.75
    var dx = touch.x - cx
    var dy = touch.y - cy
    var angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
    if (angle < 0) angle += 360
    if (angle > 180) angle = 180
    if (angle < 0) angle = 0
    var updateKey = dragging === 'angle1' ? 'protractorAngle1' : 'protractorAngle2'
    var updateData = {}
    updateData[updateKey] = angle
    this.setData(updateData)
    this._updateAngleDisplay()
    this._drawProtractor()
  },

  onProtractorTouchEnd: function() {
    this.setData({ protractorDragging: '' })
  },

  _updateAngleDisplay: function() {
    var a1 = this.data.protractorAngle1
    var a2 = this.data.protractorAngle2
    var diff = Math.abs(a1 - a2)
    if (diff > 180) diff = 360 - diff
    this.setData({ protractorAngleDisplay: diff.toFixed(1) })
  },

  saveAngleRecord: function() {
    var angle = this.data.protractorAngleDisplay
    var records = this.data.measureRecords.slice()
    records.unshift({
      id: Date.now(),
      type: 'angle',
      value: angle,
      unit: '\u00B0',
      time: this._formatTime(new Date()),
      desc: '\u91CF\u89D2\u5668'
    })
    if (records.length > 20) records = records.slice(0, 20)
    this.setData({ measureRecords: records })
    this._saveRecords(records)
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: this.data.i18n.recordSaved, icon: 'success' })
  },

  _startAccelerometer: function() {
    var that = this
    this._stopAccelerometer()
    try {
      wx.onAccelerometerChange(function(res) {
        that._onAccelerometerChange(res)
      })
      wx.startAccelerometer({
        interval: 'ui',
        fail: function() {
          that.setData({ levelAngleX: '--', levelAngleY: '--', levelTotalAngle: '--' })
        }
      })
    } catch(e) {}
  },

  _stopAccelerometer: function() {
    try { wx.stopAccelerometer() } catch(e) {}
    try { wx.offAccelerometerChange() } catch(e) {}
  },

  _onAccelerometerChange: function(res) {
    var x = res.x || 0
    var y = res.y || 0
    var z = res.z || 0
    var angleX = Math.atan2(x, Math.sqrt(y * y + z * z)) * 180 / Math.PI
    var angleY = Math.atan2(y, Math.sqrt(x * x + z * z)) * 180 / Math.PI
    var totalAngle = Math.sqrt(angleX * angleX + angleY * angleY)
    var isFlat = totalAngle < 2

    var bubbleX = 50 - (angleX / 45) * 40
    var bubbleY = 50 - (angleY / 45) * 40
    if (bubbleX < 5) bubbleX = 5
    if (bubbleX > 95) bubbleX = 95
    if (bubbleY < 5) bubbleY = 5
    if (bubbleY > 95) bubbleY = 95

    this.setData({
      levelX: x,
      levelY: y,
      levelAngleX: angleX.toFixed(1),
      levelAngleY: angleY.toFixed(1),
      levelTotalAngle: totalAngle.toFixed(1),
      levelIsFlat: isFlat,
      levelBubbleX: bubbleX,
      levelBubbleY: bubbleY
    })
  },

  saveLevelRecord: function() {
    var angle = this.data.levelTotalAngle
    var records = this.data.measureRecords.slice()
    records.unshift({
      id: Date.now(),
      type: 'level',
      value: angle,
      unit: '\u00B0',
      time: this._formatTime(new Date()),
      desc: '\u6C34\u5E73\u4EEA'
    })
    if (records.length > 20) records = records.slice(0, 20)
    this.setData({ measureRecords: records })
    this._saveRecords(records)
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: this.data.i18n.recordSaved, icon: 'success' })
  },

  saveLengthRecord: function() {
    var screenMM = this.data.screenPhysicalMM
    var cal = this.data.calibration
    var actualMM = screenMM * cal
    var value, unitStr
    if (this.data.unit === 'cm') {
      value = (actualMM / 10).toFixed(1)
      unitStr = 'cm'
    } else {
      value = (actualMM / 25.4).toFixed(2)
      unitStr = 'in'
    }
    var records = this.data.measureRecords.slice()
    records.unshift({
      id: Date.now(),
      type: 'length',
      value: value,
      unit: unitStr,
      time: this._formatTime(new Date()),
      desc: '\u5C3A\u5B50'
    })
    if (records.length > 20) records = records.slice(0, 20)
    this.setData({ measureRecords: records })
    this._saveRecords(records)
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: this.data.i18n.recordSaved, icon: 'success' })
  },

  toggleRecords: function() {
    this.setData({ showRecords: !this.data.showRecords })
  },

  removeRecord: function(e) {
    var rid = e.currentTarget.dataset.id
    var records = this.data.measureRecords.slice()
    var newRecords = []
    for (var i = 0; i < records.length; i++) {
      if (records[i].id !== rid) newRecords.push(records[i])
    }
    this.setData({ measureRecords: newRecords })
    this._saveRecords(newRecords)
    wx.showToast({ title: this.data.i18n.deleted, icon: 'success' })
  },

  clearRecords: function() {
    var that = this
    wx.showModal({
      title: that.data.i18n.clearRecords,
      content: that.data.i18n.confirmClearRecords,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          that.setData({ measureRecords: [], showRecords: false })
          that._saveRecords([])
          wx.showToast({ title: that.data.i18n.cleared, icon: 'success' })
        }
      }
    })
  },

  _saveRecords: function(records) {
    storageUtil.set('rulerMeasureRecords', records)
  },

  _loadRecords: function() {
    var records = storageUtil.safeGetArray('rulerMeasureRecords')
    this.setData({ measureRecords: records })
  },

  _formatTime: function(d) {
    var h = d.getHours()
    var m = d.getMinutes()
    if (h < 10) h = '0' + h
    if (m < 10) m = '0' + m
    return h + ':' + m
  },

  copyResult: function() {
    var text = '\u6821\u51C6\u7CFB\u6570: ' + this.data.calibration + ', \u5C4F\u5E55\u7269\u7406\u5BBD\u5EA6: ' + this.data.screenPhysicalMM + 'mm'
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.applyCalibration(1)
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('手机尺子 - 百宝工具箱', '/package-life/ruler/ruler', '屏幕尺子测量工具，厘米英寸刻度')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('手机尺子 - 屏幕测量厘米英寸刻度')
  }
})
