var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    i18n: {},
    angleInput: '',
    angleUnit: 'deg',
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    hasResult: false,
    sinValue: '',
    cosValue: '',
    tanValue: '',
    asinValue: '',
    acosValue: '',
    atanValue: '',
    radianValue: '',
    degreeValue: '',
    cscValue: '',
    secValue: '',
    cotValue: '',
    graphFunc: 'sin',
    graphFuncs: [
      { id: 'sin', name: 'sin(x)', color: '#3B82F6' },
      { id: 'cos', name: 'cos(x)', color: '#10B981' },
      { id: 'tan', name: 'tan(x)', color: '#EF4444' }
    ],
    graphAmplitude: 1,
    graphPeriod: 1,
    graphPhase: 0,
    showGraph: false,
    isLoading: true
  },

  onLoad: function() {
    var toolTexts = i18n.getToolPageTexts('trig')
    this.setData({ i18n: toolTexts, undefText: toolTexts.undefVal || 'Undefined' })
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('三角函数计算器')
    poster.setupForPage(this, 38)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var toolTexts = i18n.getToolPageTexts('trig')
    this.setData({ i18n: toolTexts, undefText: toolTexts.undefVal || 'Undefined' })
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
  },

  onAngleInput: function(e) {
    this.setData({ angleInput: e.detail.value })
  },

  onUnitChange: function(e) {
    var unit = e.currentTarget.dataset.unit
    this.setData({ angleUnit: unit })
  },

  calculate: function() {
    var input = parseFloat(this.data.angleInput)
    if (isNaN(input)) {
      wx.showToast({ title: this.data.i18n.inputValidNumber, icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'light' })

    var rad
    if (this.data.angleUnit === 'deg') {
      rad = input * Math.PI / 180
    } else {
      rad = input
    }

    var sinV = Math.sin(rad)
    var cosV = Math.cos(rad)
    var tanV = Math.tan(rad)

    var isTanUndefined = false
    var normalAngle = this.data.angleUnit === 'deg' ? input : input * 180 / Math.PI
    normalAngle = normalAngle % 360
    if (normalAngle < 0) normalAngle = normalAngle + 360
    if (Math.abs(normalAngle - 90) < 0.0001 || Math.abs(normalAngle - 270) < 0.0001) {
      isTanUndefined = true
    }

    var sinStr = this._toFixed(sinV)
    var cosStr = this._toFixed(cosV)
    var tanStr = isTanUndefined ? this.data.i18n.undefVal : this._toFixed(tanV)

    var cscStr = ''
    var secStr = ''
    var cotStr = ''
    if (Math.abs(sinV) < 1e-10) {
      cscStr = this.data.i18n.undefVal
    } else {
      cscStr = this._toFixed(1 / sinV)
    }
    if (Math.abs(cosV) < 1e-10) {
      secStr = this.data.i18n.undefVal
    } else {
      secStr = this._toFixed(1 / cosV)
    }
    if (isTanUndefined || Math.abs(tanV) < 1e-10) {
      if (isTanUndefined) {
        cotStr = '0'
      } else {
        cotStr = this.data.i18n.undefVal
      }
    } else {
      cotStr = this._toFixed(1 / tanV)
    }

    var asinStr = ''
    var acosStr = ''
    var atanStr = ''
    if (input < -1 || input > 1) {
      asinStr = this.data.i18n.outOfDomain
      acosStr = this.data.i18n.outOfDomain
    } else {
      asinStr = this._toFixed(Math.asin(input))
      acosStr = this._toFixed(Math.acos(input))
    }
    atanStr = this._toFixed(Math.atan(input))

    var radianStr = ''
    var degreeStr = ''
    if (this.data.angleUnit === 'deg') {
      radianStr = this._toFixed(rad)
      degreeStr = String(input)
    } else {
      radianStr = String(input)
      degreeStr = this._toFixed(input * 180 / Math.PI)
    }

    this.setData({
      hasResult: true,
      sinValue: sinStr,
      cosValue: cosStr,
      tanValue: tanStr,
      asinValue: asinStr,
      acosValue: acosStr,
      atanValue: atanStr,
      radianValue: radianStr,
      degreeValue: degreeStr,
      cscValue: cscStr,
      secValue: secStr,
      cotValue: cotStr
    })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(24, '三角函数计算器', false)

    if (this.data.showGraph) {
      this.drawGraph()
    }
  },

  copyResult: function() {
    var text = ''
    text = text + '角度: ' + this.data.degreeValue + '°\n'
    text = text + '弧度: ' + this.data.radianValue + '\n'
    text = text + 'sin = ' + this.data.sinValue + '\n'
    text = text + 'cos = ' + this.data.cosValue + '\n'
    text = text + 'tan = ' + this.data.tanValue + '\n'
    text = text + 'csc = ' + this.data.cscValue + '\n'
    text = text + 'sec = ' + this.data.secValue + '\n'
    text = text + 'cot = ' + this.data.cotValue + '\n'
    text = text + 'asin = ' + this.data.asinValue + '\n'
    text = text + 'acos = ' + this.data.acosValue + '\n'
    text = text + 'atan = ' + this.data.atanValue
    toolActions.copyText(text, '结果已复制')
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        angleInput: '',
        angleUnit: 'deg',
        hasResult: false,
        sinValue: '',
        cosValue: '',
        tanValue: '',
        asinValue: '',
        acosValue: '',
        atanValue: '',
        radianValue: '',
        degreeValue: '',
        cscValue: '',
        secValue: '',
        cotValue: ''
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('三角函数计算器 - 百宝工具箱', '/package-calculator/trig-calculator/trig-calculator', 'sin/cos/tan三角函数计算')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('三角函数计算器 - sin/cos/tan计算')
  },

  _toFixed: function(num) {
    if (isNaN(num) || !isFinite(num)) return this.data.i18n.undefVal
    var str = num.toFixed(8)
    str = str.replace(/0+$/, '')
    str = str.replace(/\.$/, '')
    return str
  },

  toggleGraph: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showGraph
    this.setData({ showGraph: show })
    if (show) {
      var that = this
      setTimeout(function() { that.drawGraph() }, 300)
    }
  },

  selectGraphFunc: function(e) {
    var funcId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ graphFunc: funcId })
    this.drawGraph()
  },

  onAmplitudeChange: function(e) {
    var val = parseFloat(e.detail.value) || 1
    val = Math.max(0.1, Math.min(5, val))
    this.setData({ graphAmplitude: val })
    this.drawGraph()
  },

  onPeriodChange: function(e) {
    var val = parseFloat(e.detail.value) || 1
    val = Math.max(0.1, Math.min(5, val))
    this.setData({ graphPeriod: val })
    this.drawGraph()
  },

  onPhaseChange: function(e) {
    var val = parseFloat(e.detail.value) || 0
    val = Math.max(-3.14, Math.min(3.14, val))
    this.setData({ graphPhase: val })
    this.drawGraph()
  },

  drawGraph: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#trigCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0]) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getWindowInfo().pixelRatio
      var w = res[0].width
      var h = res[0].height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)

      var isDark = that.data.isDarkMode
      var bgColor = isDark ? '#1a2035' : '#F8FAFC'
      var axisColor = isDark ? '#475569' : '#CBD5E1'
      var textColor = isDark ? '#94A3B8' : '#64748B'
      var gridColor = isDark ? '#232d42' : '#F1F5F9'

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, w, h)

      var padL = 36
      var padR = 16
      var padT = 16
      var padB = 28
      var plotW = w - padL - padR
      var plotH = h - padT - padB
      var centerY = padT + plotH / 2

      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1
      for (var gi = -2; gi <= 2; gi++) {
        var gy = centerY - (gi / 2) * (plotH / 2)
        ctx.beginPath()
        ctx.moveTo(padL, gy)
        ctx.lineTo(padL + plotW, gy)
        ctx.stroke()
      }

      ctx.strokeStyle = axisColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(padL, centerY)
      ctx.lineTo(padL + plotW, centerY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(padL, padT)
      ctx.lineTo(padL, padT + plotH)
      ctx.stroke()

      ctx.fillStyle = textColor
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('1', padL - 4, padT + plotH / 4 + 3)
      ctx.fillText('-1', padL - 4, padT + plotH * 3 / 4 + 3)
      ctx.fillText('0', padL - 4, centerY + 3)

      ctx.textAlign = 'center'
      var xLabels = ['0', 'π/2', 'π', '3π/2', '2π']
      for (var xi = 0; xi <= 4; xi++) {
        var lx = padL + (xi / 4) * plotW
        ctx.fillText(xLabels[xi], lx, padT + plotH + 16)
      }

      var funcId = that.data.graphFunc
      var amplitude = that.data.graphAmplitude
      var period = that.data.graphPeriod
      var phase = that.data.graphPhase
      var funcColor = '#3B82F6'
      var funcRef = null
      for (var fi = 0; fi < that.data.graphFuncs.length; fi++) {
        if (that.data.graphFuncs[fi].id === funcId) {
          funcColor = that.data.graphFuncs[fi].color
          break
        }
      }

      ctx.strokeStyle = funcColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      var steps = 200
      for (var si = 0; si <= steps; si++) {
        var t = si / steps
        var xRad = t * 2 * Math.PI * period
        var yVal = 0
        if (funcId === 'sin') {
          yVal = amplitude * Math.sin(xRad + phase)
        } else if (funcId === 'cos') {
          yVal = amplitude * Math.cos(xRad + phase)
        } else if (funcId === 'tan') {
          var tanRaw = Math.tan(xRad + phase)
          yVal = amplitude * tanRaw
          if (Math.abs(yVal) > 3) yVal = NaN
        }
        var px = padL + t * plotW
        var py = centerY - (yVal / (amplitude > 0 ? amplitude : 1)) * (plotH / 2) * 0.8
        if (isNaN(yVal)) {
          ctx.stroke()
          ctx.beginPath()
          continue
        }
        if (si === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.stroke()

      if (that.data.hasResult) {
        var inputRad = 0
        if (that.data.angleUnit === 'deg') {
          inputRad = parseFloat(that.data.angleInput) * Math.PI / 180
        } else {
          inputRad = parseFloat(that.data.angleInput)
        }

        var normRad = inputRad % (2 * Math.PI * period)
        if (normRad < 0) normRad = normRad + 2 * Math.PI * period
        var tPoint = normRad / (2 * Math.PI * period)
        if (tPoint > 1) tPoint = tPoint % 1

        var yPoint = 0
        if (funcId === 'sin') {
          yPoint = amplitude * Math.sin(inputRad + phase)
        } else if (funcId === 'cos') {
          yPoint = amplitude * Math.cos(inputRad + phase)
        } else if (funcId === 'tan') {
          yPoint = amplitude * Math.tan(inputRad + phase)
        }

        if (isFinite(yPoint) && Math.abs(yPoint) <= 3 * amplitude) {
          var dotX = padL + tPoint * plotW
          var dotY = centerY - (yPoint / (amplitude > 0 ? amplitude : 1)) * (plotH / 2) * 0.8

          ctx.strokeStyle = funcColor
          ctx.lineWidth = 1
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(dotX, centerY)
          ctx.lineTo(dotX, dotY)
          ctx.stroke()
          ctx.setLineDash([])

          ctx.fillStyle = funcColor
          ctx.globalAlpha = 0.15
          ctx.beginPath()
          ctx.arc(dotX, dotY, 12, 0, 2 * Math.PI)
          ctx.fill()
          ctx.globalAlpha = 1

          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.fillStyle = funcColor
          ctx.beginPath()
          ctx.arc(dotX, dotY, 3.5, 0, 2 * Math.PI)
          ctx.fill()

          ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          var labelY = dotY < centerY ? dotY + 18 : dotY - 10
          ctx.fillText(that._toFixed(yPoint), dotX, labelY)
        }
      }
    })
  }
})
