var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var AGE_GROUPS = [
  { min: 18, max: 24, maleNormal: [18.5, 23.9], femaleNormal: [18.5, 23.9] },
  { min: 25, max: 34, maleNormal: [18.5, 24.9], femaleNormal: [18.5, 24.9] },
  { min: 35, max: 44, maleNormal: [18.5, 25.9], femaleNormal: [18.5, 26.9] },
  { min: 45, max: 54, maleNormal: [18.5, 26.9], femaleNormal: [18.5, 27.9] },
  { min: 55, max: 64, maleNormal: [18.5, 27.9], femaleNormal: [18.5, 28.9] },
  { min: 65, max: 120, maleNormal: [18.5, 28.9], femaleNormal: [18.5, 29.9] }
]

Page({
  data: {
    i18n: {},
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    bmi: null,
    status: '',
    statusClass: '',
    pointerLeft: '0%',
    advice: '',
    unitType: 'metric',
    idealWeight: { min: '', max: '' },
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',

    bodyFatRate: null,
    bodyFatStatus: '',
    bodyFatClass: '',
    leanBodyMass: null,
    fatWeight: '',
    showBodyFat: false,

    bmiHistory: [],
    showHistory: false,

    ageGroupRef: null,
    showAgeRef: false,

    heightLabel: '',
    weightLabel: '',
    bodyFatRefTitle: '',

    categoryRanges: [
      { label: 'thin', range: '<18.5', class: 'status-underweight' },
      { label: 'normal', range: '18.5-23.9', class: 'status-normal' },
      { label: 'overweight', range: '24-27.9', class: 'status-overweight' },
      { label: 'obese', range: '≥28', class: 'status-obese' }
    ],
    isLoading: true
  },

  onLoad: function() {
    var i18nTexts = i18n.getToolPageTexts('bmi')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var unitType = this.data.unitType
    var gender = this.data.gender
    this.setData({
      isDarkMode: isDark,
      i18n: i18nTexts,
      heightLabel: unitType === 'metric' ? i18nTexts.heightCm : i18nTexts.heightIn,
      weightLabel: unitType === 'metric' ? i18nTexts.weightKg : i18nTexts.weightLb,
      bodyFatRefTitle: gender === 'male' ? i18nTexts.maleBodyFatRef : i18nTexts.femaleBodyFatRef
    })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('BMI计算器')
    poster.setupForPage(this, 23)
    this._loadHistory()
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var i18nTexts = i18n.getToolPageTexts('bmi')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    var unitType = this.data.unitType
    var gender = this.data.gender
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({
      isDarkMode: isDark,
      fontClass: fontClass,
      i18n: i18nTexts,
      heightLabel: unitType === 'metric' ? i18nTexts.heightCm : i18nTexts.heightIn,
      weightLabel: unitType === 'metric' ? i18nTexts.weightKg : i18nTexts.weightLb,
      bodyFatRefTitle: gender === 'male' ? i18nTexts.maleBodyFatRef : i18nTexts.femaleBodyFatRef,
      fontSizeSetting: fontSize
    })
  },

  onHeightInput: function(e) { this.setData({ height: e.detail.value }) },
  onWeightInput: function(e) { this.setData({ weight: e.detail.value }) },
  onAgeInput: function(e) { this.setData({ age: e.detail.value }) },

  onGenderChange: function(e) {
    var gender = e.currentTarget.dataset.type
    var i18nTexts = this.data.i18n
    this.setData({
      gender: gender,
      bodyFatRefTitle: gender === 'male' ? i18nTexts.maleBodyFatRef : i18nTexts.femaleBodyFatRef
    })
    wx.vibrateShort({ type: 'light' })
  },

  switchUnit: function(e) {
    var unitType = e.currentTarget.dataset.type
    var i18nTexts = this.data.i18n
    this.setData({
      unitType: unitType,
      heightLabel: unitType === 'metric' ? i18nTexts.heightCm : i18nTexts.heightIn,
      weightLabel: unitType === 'metric' ? i18nTexts.weightKg : i18nTexts.weightLb,
      height: '', weight: '', bmi: null, status: '', statusClass: '', pointerLeft: '0%', advice: '',
      bodyFatRate: null, bodyFatStatus: '', showBodyFat: false
    })
  },

  calculateBMI: function() {
    var h = parseFloat(this.data.height)
    var w = parseFloat(this.data.weight)
    var i18nTexts = this.data.i18n
    if (!h || !w || isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      wx.showToast({ title: i18nTexts.invalidHeightWeight, icon: 'none' })
      return
    }
    if (this.data.unitType === 'metric') {
      if (h > 250) { wx.showToast({ title: i18nTexts.heightTooHigh, icon: 'none' }); return }
      if (w > 500) { wx.showToast({ title: i18nTexts.weightTooHigh, icon: 'none' }); return }
      if (h < 50) { wx.showToast({ title: i18nTexts.heightTooLow, icon: 'none' }); return }
      if (w < 10) { wx.showToast({ title: i18nTexts.weightTooLow, icon: 'none' }); return }
    }

    wx.vibrateShort({ type: 'light' })

    var bmi, heightM
    if (this.data.unitType === 'metric') {
      heightM = h / 100
      bmi = w / (heightM * heightM)
    } else {
      bmi = (w / (h * h)) * 703
      heightM = h * 0.0254
    }

    bmi = Math.round(bmi * 10) / 10

    var status, statusClass, advice
    if (bmi < 18.5) {
      status = 'thin'; statusClass = 'status-underweight'
      advice = '您的体重偏低，建议适当增加营养摄入，进行力量训练来增加肌肉量。保持均衡饮食，多吃优质蛋白质。'
    } else if (bmi < 24) {
      status = 'normal'; statusClass = 'status-normal'
      advice = '恭喜！您的BMI在健康范围内。建议继续保持均衡饮食和规律运动，维持当前的健康状态。'
    } else if (bmi < 28) {
      status = 'overweight'; statusClass = 'status-overweight'
      advice = '您的体重略偏高，建议控制饮食总热量，减少高糖高脂食物摄入，增加有氧运动频率（每周至少150分钟）。'
    } else {
      status = 'obese'; statusClass = 'status-obese'
      advice = '您的体重偏高较多，建议咨询专业医生或营养师制定科学的减重计划。循序渐进地调整饮食结构，结合适量运动。'
    }

    var minBMI = 18.5
    var maxBMI = 23.9
    var minW = Math.round(minBMI * heightM * heightM * 10) / 10
    var maxW = Math.round(maxBMI * heightM * heightM * 10) / 10

    var pointerPos
    if (bmi < 15) pointerPos = '0%'
    else if (bmi > 35) pointerPos = '100%'
    else pointerPos = ((bmi - 15) / 20 * 100) + '%'

    var updateData = {
      bmi: bmi,
      status: status,
      statusClass: statusClass,
      pointerLeft: pointerPos,
      advice: advice,
      idealWeight: { min: minW.toFixed(1), max: maxW.toFixed(1) }
    }

    var ageVal = parseInt(this.data.age)
    if (ageVal > 0 && ageVal < 150) {
      var gender = this.data.gender
      var bfr = this._calcBodyFat(bmi, ageVal, gender)
      if (bfr !== null) {
        var bfStatus = this._getBodyFatStatus(bfr, gender)
        var lbm = w * (1 - bfr / 100)
        var fatWeight = (w * bfr / 100).toFixed(1)
        updateData.bodyFatRate = bfr.toFixed(1)
        updateData.bodyFatStatus = bfStatus.label
        updateData.bodyFatClass = bfStatus.cls
        updateData.leanBodyMass = lbm.toFixed(1)
        updateData.fatWeight = fatWeight
        updateData.showBodyFat = true
      }

      var ageRef = this._getAgeGroupRef(ageVal, gender)
      updateData.ageGroupRef = ageRef
      updateData.showAgeRef = true
    } else {
      updateData.showBodyFat = false
      updateData.showAgeRef = false
    }

    this.setData(updateData)
    this._saveHistory(bmi, status, statusClass, w, h)

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(23, 'BMI计算器', false)
  },

  _calcBodyFat: function(bmi, age, gender) {
    if (age < 18 || age > 80) return null
    if (gender === 'male') {
      return 1.2 * bmi + 0.23 * age - 16.2
    } else {
      return 1.2 * bmi + 0.23 * age - 5.4
    }
  },

  _getBodyFatStatus: function(bfr, gender) {
    if (gender === 'male') {
      if (bfr < 10) return { label: 'lowLabel', cls: 'bf-low' }
      if (bfr < 20) return { label: 'normalLabel', cls: 'bf-normal' }
      if (bfr < 25) return { label: 'highLabel', cls: 'bf-high' }
      return { label: 'veryHighLabel', cls: 'bf-veryhigh' }
    } else {
      if (bfr < 18) return { label: 'lowLabel', cls: 'bf-low' }
      if (bfr < 28) return { label: 'normalLabel', cls: 'bf-normal' }
      if (bfr < 33) return { label: 'highLabel', cls: 'bf-high' }
      return { label: 'veryHighLabel', cls: 'bf-veryhigh' }
    }
  },

  _getAgeGroupRef: function(age, gender) {
    var i18nTexts = this.data.i18n
    var yearsOld = i18nTexts.yearsOld || '岁'
    for (var i = 0; i < AGE_GROUPS.length; i++) {
      var g = AGE_GROUPS[i]
      if (age >= g.min && age <= g.max) {
        var normalRange = gender === 'male' ? g.maleNormal : g.femaleNormal
        var allGroups = []
        for (var j = 0; j < AGE_GROUPS.length; j++) {
          var ag = AGE_GROUPS[j]
          var agLabel = ag.max >= 120 ? '65+' + yearsOld : ag.min + '-' + ag.max + yearsOld
          allGroups.push({
            label: agLabel,
            maleNormal: ag.maleNormal,
            femaleNormal: ag.femaleNormal
          })
        }
        var groupLabel = g.max >= 120 ? '65+' + yearsOld : g.min + '-' + g.max + yearsOld
        return {
          group: groupLabel,
          normalMin: normalRange[0],
          normalMax: normalRange[1],
          allGroups: allGroups
        }
      }
    }
    return null
  },

  _saveHistory: function(bmi, status, statusClass, weight, height) {
    var list = storageUtil.safeGetArray('bmiHistory')
    list.unshift({
      bmi: bmi,
      statusKey: status,
      statusClass: statusClass,
      weight: weight,
      height: height,
      date: this._formatDate(new Date()),
      ts: Date.now()
    })
    if (list.length > 30) {
      list = list.slice(0, 30)
    }
    storageUtil.set('bmiHistory', list)
    this.setData({ bmiHistory: list })
  },

  _loadHistory: function() {
    var list = storageUtil.safeGetArray('bmiHistory')
    var i18nTexts = this.data.i18n
    var statusMap = { '偏瘦': 'thin', '正常': 'normal', '偏胖': 'overweight', '肥胖': 'obese' }
    var classMap = { '偏瘦': 'status-underweight', '正常': 'status-normal', '偏胖': 'status-overweight', '肥胖': 'status-obese' }
    for (var i = 0; i < list.length; i++) {
      if (!list[i].statusKey && list[i].status) {
        list[i].statusKey = statusMap[list[i].status] || list[i].status
        list[i].statusClass = classMap[list[i].status] || 'status-normal'
      }
    }
    this.setData({ bmiHistory: list })
  },

  toggleHistory: function() {
    var show = !this.data.showHistory
    this.setData({ showHistory: show })
    if (show && this.data.bmiHistory.length > 0) {
      this._drawTrendChart()
    }
  },

  clearHistory: function() {
    var that = this
    var i18nTexts = this.data.i18n
    wx.showModal({
      title: i18nTexts.confirmClear,
      content: i18nTexts.confirmClearContent,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          storageUtil.set('bmiHistory', [])
          that.setData({ bmiHistory: [], showHistory: false })
          wx.showToast({ title: i18nTexts.cleared, icon: 'success' })
        }
      }
    })
  },

  deleteHistoryItem: function(e) {
    var ts = e.currentTarget.dataset.ts
    var list = this.data.bmiHistory.slice()
    var newList = []
    for (var i = 0; i < list.length; i++) {
      if (list[i].ts !== ts) {
        newList.push(list[i])
      }
    }
    storageUtil.set('bmiHistory', newList)
    this.setData({ bmiHistory: newList })
    if (newList.length > 0) {
      this._drawTrendChart()
    }
    wx.showToast({ title: this.data.i18n.deleted, icon: 'success' })
  },

  _drawTrendChart: function() {
    var that = this
    var list = this.data.bmiHistory
    if (list.length < 2) return

    var query = wx.createSelectorQuery()
    query.select('#trendCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0] || !res[0].node) return
        var canvas = res[0].node
        var dpr = wx.getWindowInfo().pixelRatio
        var w = res[0].width
        var h = res[0].height
        canvas.width = w * dpr
        canvas.height = h * dpr
        var ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)

        var isDark = that.data.isDarkMode
        var bgColor = isDark ? '#1a2035' : '#FFFFFF'
        var textColor = isDark ? '#CBD5E1' : '#64748B'
        var gridColor = isDark ? 'rgba(71,85,105,0.3)' : 'rgba(0,0,0,0.06)'
        var lineColor = '#14B8A6'
        var dotColor = '#0D9488'

        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, w, h)

        var padLeft = 32
        var padRight = 16
        var padTop = 16
        var padBottom = 30
        var chartW = w - padLeft - padRight
        var chartH = h - padTop - padBottom

        var data = list.slice(0, 15).reverse()
        var minBmi = 999
        var maxBmi = 0
        for (var i = 0; i < data.length; i++) {
          if (data[i].bmi < minBmi) minBmi = data[i].bmi
          if (data[i].bmi > maxBmi) maxBmi = data[i].bmi
        }
        minBmi = Math.floor(minBmi / 5) * 5
        maxBmi = Math.ceil(maxBmi / 5) * 5
        if (maxBmi - minBmi < 10) {
          minBmi = minBmi - 2
          maxBmi = maxBmi + 2
        }
        var range = maxBmi - minBmi
        if (range === 0) range = 10

        ctx.strokeStyle = gridColor
        ctx.lineWidth = 0.5
        for (var g = 0; g <= 4; g++) {
          var gy = padTop + chartH * (1 - g / 4)
          ctx.beginPath()
          ctx.moveTo(padLeft, gy)
          ctx.lineTo(padLeft + chartW, gy)
          ctx.stroke()

          ctx.fillStyle = textColor
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'right'
          var labelVal = minBmi + range * g / 4
          ctx.fillText(labelVal.toFixed(0), padLeft - 4, gy + 3)
        }

        var normalMinY = padTop + chartH * (1 - (18.5 - minBmi) / range)
        var normalMaxY = padTop + chartH * (1 - (24 - minBmi) / range)
        ctx.fillStyle = isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.06)'
        ctx.fillRect(padLeft, normalMaxY, chartW, normalMinY - normalMaxY)

        var chartPoints = []
        var gap = chartW / Math.max(data.length - 1, 1)
        for (var pi = 0; pi < data.length; pi++) {
          var px = padLeft + gap * pi
          var py = padTop + chartH * (1 - (data[pi].bmi - minBmi) / range)
          chartPoints.push({ x: px, y: py, bmi: data[pi].bmi })
        }

        if (chartPoints.length > 1) {
          ctx.strokeStyle = lineColor
          ctx.lineWidth = 2
          ctx.lineJoin = 'round'
          ctx.beginPath()
          ctx.moveTo(chartPoints[0].x, chartPoints[0].y)
          for (var li = 1; li < chartPoints.length; li++) {
            ctx.lineTo(chartPoints[li].x, chartPoints[li].y)
          }
          ctx.stroke()

          var grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH)
          grad.addColorStop(0, 'rgba(20,184,166,0.15)')
          grad.addColorStop(1, 'rgba(20,184,166,0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(chartPoints[0].x, padTop + chartH)
          for (var fi = 0; fi < chartPoints.length; fi++) {
            ctx.lineTo(chartPoints[fi].x, chartPoints[fi].y)
          }
          ctx.lineTo(chartPoints[chartPoints.length - 1].x, padTop + chartH)
          ctx.closePath()
          ctx.fill()
        }

        for (var di = 0; di < chartPoints.length; di++) {
          ctx.fillStyle = dotColor
          ctx.beginPath()
          ctx.arc(chartPoints[di].x, chartPoints[di].y, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(chartPoints[di].x, chartPoints[di].y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = textColor
        ctx.font = '8px sans-serif'
        ctx.textAlign = 'center'
        for (var xi = 0; xi < data.length; xi++) {
          if (data.length <= 8 || xi % 2 === 0) {
            var dateStr = data[xi].date.substring(5)
            ctx.fillText(dateStr, chartPoints[xi].x, padTop + chartH + 14)
          }
        }
      })
  },

  _formatDate: function(d) {
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    if (m < 10) m = '0' + m
    if (day < 10) day = '0' + day
    return y + '-' + m + '-' + day
  },

  copyResult: function() {
    var i18nTexts = this.data.i18n
    var text = 'BMI: ' + this.data.bmi + ' (' + i18nTexts[this.data.status] + ')'
    if (this.data.bodyFatRate) {
      text += '\n' + i18nTexts.bodyFatEstimate.replace('🧬 ', '') + ': ' + this.data.bodyFatRate + '% (' + i18nTexts[this.data.bodyFatStatus] + ')'
      text += '\n' + i18nTexts.leanBodyMass + ': ' + this.data.leanBodyMass + 'kg'
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        height: '',
        weight: '',
        age: '',
        gender: 'male',
        bmi: null,
        status: '',
        statusClass: '',
        pointerLeft: '0%',
        advice: '',
        idealWeight: { min: '', max: '' },
        bodyFatRate: null,
        bodyFatStatus: '',
        bodyFatClass: '',
        leanBodyMass: null,
        fatWeight: '',
        showBodyFat: false,
        ageGroupRef: null,
        showAgeRef: false
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('BMI计算器 - 百宝工具箱', '/package-calculator/bmi-calculator/bmi-calculator', '身体质量指数计算，体脂率估算')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('BMI计算器 - 身体质量指数体脂率估算')
  }
})
