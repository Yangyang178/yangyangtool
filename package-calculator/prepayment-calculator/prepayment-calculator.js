var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var YEAR_OPTIONS = []
for (var yi = 1; yi <= 30; yi++) {
  YEAR_OPTIONS.push(yi)
}

Page({
  data: {
    i18n: {},
    loanAmount: '',
    yearIndex: 19,
    yearOptions: YEAR_OPTIONS,
    interestRate: '4.2',
    repaymentMethod: 'equal_payment',
    prepayMethod: 'shorten',
    hasResult: false,
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',

    prepayPlans: [],
    newPlanMonth: '',
    newPlanAmount: '',

    originalMonthly: '0.00',
    newMonthly: '0.00',
    savedInterest: '0.00',
    newTotalMonths: '0',
    savedMonths: '0',
    originalTotalInterest: '0.00',
    newTotalInterest: '0.00',
    originalTotalPayment: '0.00',
    newTotalPayment: '0.00',
    originalTotalMonths: '0',

    compareData: null,
    showCompare: false,

    ratePresets: [
      { label: '3.85%(LPR)', rate: '3.85' },
      { label: '4.2%', rate: '4.2' },
      { label: '4.65%', rate: '4.65' },
      { label: '5.0%', rate: '5.0' }
    ],
    showGuideTip: false,
    isLoading: true
  },

  onLoad: function() {
    this.setData({ i18n: i18n.getToolPageTexts('prepayment') })
    var guideClosed = storageUtil.get('guide_tip_closed_35', false)
    this.setData({ showGuideTip: !guideClosed })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('提前还款计算器')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    poster.setupForPage(this, 35)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    this.setData({ i18n: i18n.getToolPageTexts('prepayment') })
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
  },

  closeGuideTip: function() {
    storageUtil.set('guide_tip_closed_35', true)
    this.setData({ showGuideTip: false })
  },

  onLoanInput: function(e) {
    this.setData({ loanAmount: e.detail.value, hasResult: false })
  },

  onYearChange: function(e) {
    this.setData({ yearIndex: e.detail.value, hasResult: false })
  },

  onRateInput: function(e) {
    this.setData({ interestRate: e.detail.value, hasResult: false })
  },

  usePresetRate: function(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({ interestRate: e.currentTarget.dataset.rate, hasResult: false })
  },

  onMethodChange: function(e) {
    var method = e.currentTarget.dataset.method
    this.setData({ repaymentMethod: method, hasResult: false })
    wx.vibrateShort({ type: 'light' })
  },

  onPrepayMethodChange: function(e) {
    var method = e.currentTarget.dataset.method
    this.setData({ prepayMethod: method, hasResult: false })
    wx.vibrateShort({ type: 'light' })
  },

  onPlanMonthInput: function(e) {
    this.setData({ newPlanMonth: e.detail.value })
  },

  onPlanAmountInput: function(e) {
    this.setData({ newPlanAmount: e.detail.value })
  },

  addPlan: function() {
    var month = this.data.newPlanMonth.trim()
    var amount = this.data.newPlanAmount.trim()
    if (!month || isNaN(parseInt(month)) || parseInt(month) <= 0) {
      wx.showToast({ title: this.data.i18n.inputValidMonth, icon: 'none' })
      return
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      wx.showToast({ title: this.data.i18n.inputValidAmount, icon: 'none' })
      return
    }
    var plans = this.data.prepayPlans.slice()
    plans.push({
      month: parseInt(month),
      amount: parseFloat(amount),
      id: Date.now()
    })
    plans.sort(function(a, b) { return a.month - b.month })
    this.setData({
      prepayPlans: plans,
      newPlanMonth: '',
      newPlanAmount: '',
      hasResult: false
    })
    wx.vibrateShort({ type: 'light' })
  },

  removePlan: function(e) {
    var index = e.currentTarget.dataset.index
    var plans = this.data.prepayPlans.slice()
    plans.splice(index, 1)
    this.setData({ prepayPlans: plans, hasResult: false })
    wx.vibrateShort({ type: 'light' })
  },

  clearPlans: function() {
    this.setData({ prepayPlans: [], hasResult: false })
    wx.vibrateShort({ type: 'light' })
  },

  calculate: function() {
    var rawAmount = this.data.loanAmount.trim()
    if (!rawAmount || isNaN(parseFloat(rawAmount))) {
      wx.showToast({ title: this.data.i18n.inputValidLoan, icon: 'none' })
      return
    }
    if (!this.data.interestRate || isNaN(parseFloat(this.data.interestRate))) {
      wx.showToast({ title: this.data.i18n.inputValidRate, icon: 'none' })
      return
    }

    var inputAmount = parseFloat(rawAmount)
    if (inputAmount <= 0) {
      wx.showToast({ title: this.data.i18n.loanMustPositive, icon: 'none' })
      return
    }

    var amount = Math.round(inputAmount * 10000)
    var years = parseInt(this.data.yearOptions[this.data.yearIndex])
    var totalMonths = years * 12
    var annualRate = parseFloat(this.data.interestRate)

    if (annualRate <= 0 || annualRate >= 100) {
      wx.showToast({ title: this.data.i18n.rateRange, icon: 'none' })
      return
    }

    var rate = annualRate / 100 / 12
    var repayType = this.data.repaymentMethod === 'equal_payment' ? 'equalPayment' : 'equalPrincipal'
    var prepayType = this.data.prepayMethod

    var originalMonthlyPay = 0
    var originalTotalPay = 0
    var originalTotalInt = 0

    if (repayType === 'equalPayment') {
      var powValue = Math.pow(1 + rate, totalMonths)
      if (powValue === 1) {
        originalMonthlyPay = amount / totalMonths
      } else {
        originalMonthlyPay = (amount * rate * powValue) / (powValue - 1)
      }
      originalTotalPay = originalMonthlyPay * totalMonths
      originalTotalInt = originalTotalPay - amount
    } else {
      var principalPerMonth = amount / totalMonths
      var remaining = amount
      for (var i = 0; i < totalMonths; i++) {
        originalTotalInt += remaining * rate
        remaining -= principalPerMonth
      }
      originalTotalPay = amount + originalTotalInt
      originalMonthlyPay = principalPerMonth + amount * rate
    }

    var plans = this.data.prepayPlans
    var finalResult

    if (plans.length === 0) {
      finalResult = this._calcNoPrepay(amount, totalMonths, rate, repayType, originalMonthlyPay, originalTotalInt, originalTotalPay)
    } else {
      finalResult = this._calcMultiPrepay(amount, totalMonths, rate, repayType, prepayType, plans, originalMonthlyPay, originalTotalInt, originalTotalPay)
    }

    if (!finalResult) return

    this.setData({
      originalMonthly: this.formatCurrency(originalMonthlyPay),
      newMonthly: this.formatCurrency(finalResult.newMonthly),
      savedInterest: this.formatCurrency(finalResult.savedInterest),
      newTotalMonths: finalResult.newTotalMonths.toString(),
      savedMonths: finalResult.savedMonths.toString(),
      originalTotalInterest: this.formatCurrency(originalTotalInt),
      newTotalInterest: this.formatCurrency(finalResult.newTotalInterest),
      originalTotalPayment: this.formatCurrency(originalTotalPay),
      newTotalPayment: this.formatCurrency(finalResult.newTotalPayment),
      originalTotalMonths: totalMonths.toString(),
      hasResult: true
    })

    this._calcCompare(amount, totalMonths, rate, originalMonthlyPay, originalTotalInt, originalTotalPay, plans)

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(9, '提前还款计算器', false)
    wx.vibrateShort({ type: 'medium' })
  },

  _calcNoPrepay: function(amount, totalMonths, rate, repayType, originalMonthlyPay, originalTotalInt, originalTotalPay) {
    return {
      newMonthly: originalMonthlyPay,
      savedInterest: 0,
      newTotalMonths: totalMonths,
      savedMonths: 0,
      newTotalInterest: originalTotalInt,
      newTotalPayment: originalTotalPay
    }
  },

  _calcMultiPrepay: function(amount, totalMonths, rate, repayType, prepayType, plans, originalMonthlyPay, originalTotalInt, originalTotalPay) {
    var currentPrincipal = amount
    var currentMonths = totalMonths
    var currentMonthlyPay = originalMonthlyPay
    var totalPaidInterest = 0
    var totalPaidPrincipal = 0
    var totalPrepayAmount = 0
    var lastPlanMonth = 0
    var currentPrincipalPerMonth = amount / totalMonths

    for (var pi = 0; pi < plans.length; pi++) {
      var plan = plans[pi]
      var monthsToPay = plan.month - lastPlanMonth

      if (monthsToPay <= 0) {
        wx.showToast({ title: this.data.i18n.monthsMustIncrease, icon: 'none' })
        return null
      }
      if (plan.month >= currentMonths + lastPlanMonth) {
        wx.showToast({ title: this.data.i18n.monthOutOfRange, icon: 'none' })
        return null
      }

      var prepayAmountVal = Math.round(plan.amount * 10000)
      if (prepayAmountVal <= 0) {
        wx.showToast({ title: this.data.i18n.prepayMustPositive, icon: 'none' })
        return null
      }

      if (repayType === 'equalPayment') {
        for (var m = 0; m < monthsToPay; m++) {
          var monthInterest = currentPrincipal * rate
          var monthPrincipal = currentMonthlyPay - monthInterest
          if (monthPrincipal > currentPrincipal) {
            monthPrincipal = currentPrincipal
          }
          totalPaidInterest += monthInterest
          totalPaidPrincipal += monthPrincipal
          currentPrincipal -= monthPrincipal
          if (currentPrincipal <= 0) {
            currentPrincipal = 0
            break
          }
        }
      } else {
        for (var m2 = 0; m2 < monthsToPay; m2++) {
          var monthInterest2 = currentPrincipal * rate
          var monthPrincipal2 = currentPrincipalPerMonth
          if (monthPrincipal2 > currentPrincipal) {
            monthPrincipal2 = currentPrincipal
          }
          totalPaidInterest += monthInterest2
          totalPaidPrincipal += monthPrincipal2
          currentPrincipal -= monthPrincipal2
          if (currentPrincipal <= 0) {
            currentPrincipal = 0
            break
          }
        }
      }

      if (currentPrincipal <= 0) {
        wx.showToast({ title: this.data.i18n.loanAlreadyPaid, icon: 'none' })
        return null
      }

      if (prepayAmountVal > currentPrincipal) {
        wx.showToast({ title: this.data.i18n.prepayExceedPrincipal, icon: 'none' })
        return null
      }

      currentPrincipal -= prepayAmountVal
      totalPrepayAmount += prepayAmountVal
      lastPlanMonth = plan.month

      if (currentPrincipal <= 0) {
        var newTotalInt = totalPaidInterest
        var savedInt = originalTotalInt - newTotalInt
        if (savedInt < 0) savedInt = 0
        return {
          newMonthly: 0,
          savedInterest: savedInt,
          newTotalMonths: plan.month,
          savedMonths: totalMonths - plan.month,
          newTotalInterest: newTotalInt,
          newTotalPayment: totalPaidPrincipal + totalPrepayAmount + totalPaidInterest
        }
      }

      var remainingMonths = currentMonths - lastPlanMonth

      if (prepayType === 'shorten') {
        if (repayType === 'equalPayment') {
          var ratio = currentPrincipal * rate / currentMonthlyPay
          if (ratio >= 1) {
            wx.showToast({ title: this.data.i18n.calcError, icon: 'none' })
            return null
          }
          remainingMonths = Math.ceil(-Math.log(1 - ratio) / Math.log(1 + rate))
        } else {
          remainingMonths = Math.ceil(currentPrincipal / currentPrincipalPerMonth)
          if (remainingMonths < 1) remainingMonths = 1
        }
        currentMonths = lastPlanMonth + remainingMonths
      } else {
        if (repayType === 'equalPayment') {
          var powRem = Math.pow(1 + rate, remainingMonths)
          if (powRem === 1) {
            currentMonthlyPay = currentPrincipal / remainingMonths
          } else {
            currentMonthlyPay = (currentPrincipal * rate * powRem) / (powRem - 1)
          }
        } else {
          currentPrincipalPerMonth = currentPrincipal / remainingMonths
          currentMonthlyPay = currentPrincipalPerMonth + currentPrincipal * rate
        }
      }
    }

    var remainingMonthsFinal = currentMonths - lastPlanMonth
    var remainingInterest = 0

    if (repayType === 'equalPayment') {
      remainingInterest = currentMonthlyPay * remainingMonthsFinal - currentPrincipal
    } else {
      var tempRem = currentPrincipal
      var ppM = currentPrincipal / remainingMonthsFinal
      for (var ri = 0; ri < remainingMonthsFinal; ri++) {
        remainingInterest += tempRem * rate
        tempRem -= ppM
      }
    }

    var newTotalInt = totalPaidInterest + remainingInterest
    var savedInt = originalTotalInt - newTotalInt
    if (savedInt < 0) savedInt = 0

    var newTotalPay = totalPaidPrincipal + totalPrepayAmount + remainingInterest + currentPrincipal

    return {
      newMonthly: currentMonthlyPay,
      savedInterest: savedInt,
      newTotalMonths: currentMonths,
      savedMonths: totalMonths - currentMonths,
      newTotalInterest: newTotalInt,
      newTotalPayment: newTotalPay
    }
  },

  _calcCompare: function(amount, totalMonths, rate, originalMonthlyPay, originalTotalInt, originalTotalPay, plans) {
    var compareData = {
      noPrepay: { totalInterest: originalTotalInt, totalPayment: originalTotalPay, months: totalMonths },
      shortenEqual: null,
      reduceEqual: null,
      shortenPrincipal: null,
      reducePrincipal: null
    }

    var types = [
      { key: 'shortenEqual', repayType: 'equalPayment', prepayType: 'shorten' },
      { key: 'reduceEqual', repayType: 'equalPayment', prepayType: 'reduce' },
      { key: 'shortenPrincipal', repayType: 'equalPrincipal', prepayType: 'shorten' },
      { key: 'reducePrincipal', repayType: 'equalPrincipal', prepayType: 'reduce' }
    ]

    for (var ti = 0; ti < types.length; ti++) {
      var t = types[ti]
      if (plans.length === 0) {
        var r = this._calcSinglePrepay(amount, totalMonths, rate, t.repayType, t.prepayType, 60, 20)
        if (r) {
          compareData[t.key] = r
        }
      } else {
        var r2 = this._calcMultiPrepay(amount, totalMonths, rate, t.repayType, t.prepayType, plans, originalMonthlyPay, originalTotalInt, originalTotalPay)
        if (r2) {
          compareData[t.key] = {
            totalInterest: r2.newTotalInterest,
            totalPayment: r2.newTotalPayment,
            months: r2.newTotalMonths
          }
        }
      }
    }

    this.setData({ compareData: compareData, showCompare: true })
    this._drawCompareChart(compareData)
  },

  _calcSinglePrepay: function(amount, totalMonths, rate, repayType, prepayType, prepayMonth, prepayAmountWan) {
    var originalMonthlyPay = 0
    var originalTotalInt = 0
    var originalTotalPay = 0

    if (repayType === 'equalPayment') {
      var powV = Math.pow(1 + rate, totalMonths)
      if (powV === 1) {
        originalMonthlyPay = amount / totalMonths
      } else {
        originalMonthlyPay = (amount * rate * powV) / (powV - 1)
      }
      originalTotalPay = originalMonthlyPay * totalMonths
      originalTotalInt = originalTotalPay - amount
    } else {
      var ppM = amount / totalMonths
      var rem = amount
      for (var i = 0; i < totalMonths; i++) {
        originalTotalInt += rem * rate
        rem -= ppM
      }
      originalTotalPay = amount + originalTotalInt
      originalMonthlyPay = ppM + amount * rate
    }

    var remainingPrincipal = 0
    var paidInterest = 0

    if (repayType === 'equalPayment') {
      var powK = Math.pow(1 + rate, prepayMonth)
      remainingPrincipal = amount * powK - originalMonthlyPay * (powK - 1) / rate
      paidInterest = originalMonthlyPay * prepayMonth - (amount - remainingPrincipal)
    } else {
      var ppM2 = amount / totalMonths
      remainingPrincipal = amount - prepayMonth * ppM2
      var tempR = amount
      for (var j = 0; j < prepayMonth; j++) {
        paidInterest += tempR * rate
        tempR -= ppM2
      }
    }

    if (remainingPrincipal < 0) remainingPrincipal = 0
    var prepayAmountVal = Math.round(prepayAmountWan * 10000)
    var newRemaining = remainingPrincipal - prepayAmountVal
    if (newRemaining <= 0) return null

    var remainingMonths = totalMonths - prepayMonth
    var newMonthlyPay = 0
    var newInterestOnRemaining = 0
    var newRemainingMonths = 0

    if (prepayType === 'shorten') {
      if (repayType === 'equalPayment') {
        var ratio = newRemaining * rate / originalMonthlyPay
        if (ratio >= 1) return null
        newRemainingMonths = Math.ceil(-Math.log(1 - ratio) / Math.log(1 + rate))
        newMonthlyPay = originalMonthlyPay
        newInterestOnRemaining = newMonthlyPay * newRemainingMonths - newRemaining
      } else {
        var origPPM = amount / totalMonths
        newRemainingMonths = Math.ceil(newRemaining / origPPM)
        var actPPM = newRemaining / newRemainingMonths
        var tR = newRemaining
        for (var k = 0; k < newRemainingMonths; k++) {
          newInterestOnRemaining += tR * rate
          tR -= actPPM
        }
        newMonthlyPay = actPPM + newRemaining * rate
      }
    } else {
      newRemainingMonths = remainingMonths
      if (repayType === 'equalPayment') {
        var powRem = Math.pow(1 + rate, remainingMonths)
        if (powRem === 1) {
          newMonthlyPay = newRemaining / remainingMonths
        } else {
          newMonthlyPay = (newRemaining * rate * powRem) / (powRem - 1)
        }
        newInterestOnRemaining = newMonthlyPay * remainingMonths - newRemaining
      } else {
        var newPPM = newRemaining / remainingMonths
        var tR2 = newRemaining
        for (var m = 0; m < remainingMonths; m++) {
          newInterestOnRemaining += tR2 * rate
          tR2 -= newPPM
        }
        newMonthlyPay = newPPM + newRemaining * rate
      }
    }

    var newTotalInt = paidInterest + newInterestOnRemaining
    var paidSoFar = 0
    if (repayType === 'equalPayment') {
      paidSoFar = originalMonthlyPay * prepayMonth
    } else {
      var ppM3 = amount / totalMonths
      var tR3 = amount
      for (var p = 0; p < prepayMonth; p++) {
        paidSoFar += ppM3 + tR3 * rate
        tR3 -= ppM3
      }
    }
    var newTotalPay = paidSoFar + prepayAmountVal
    if (repayType === 'equalPayment') {
      newTotalPay += newMonthlyPay * newRemainingMonths
    } else {
      var ppM4 = newRemaining / newRemainingMonths
      var tR4 = newRemaining
      for (var q = 0; q < newRemainingMonths; q++) {
        newTotalPay += ppM4 + tR4 * rate
        tR4 -= ppM4
      }
    }

    return {
      totalInterest: newTotalInt,
      totalPayment: newTotalPay,
      months: prepayMonth + newRemainingMonths
    }
  },

  _drawCompareChart: function(compareData) {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#compareChart')
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

        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, w, h)

        var items = [
          { label: that.data.i18n.noPrepay, value: compareData.noPrepay.totalInterest, color: '#94A3B8' },
          { label: that.data.i18n.equalPaymentShorten, value: compareData.shortenEqual ? compareData.shortenEqual.totalInterest : 0, color: '#10B981' },
          { label: that.data.i18n.equalPaymentReduce, value: compareData.reduceEqual ? compareData.reduceEqual.totalInterest : 0, color: '#3B82F6' },
          { label: that.data.i18n.equalPrincipalShorten, value: compareData.shortenPrincipal ? compareData.shortenPrincipal.totalInterest : 0, color: '#F59E0B' },
          { label: that.data.i18n.equalPrincipalReduce, value: compareData.reducePrincipal ? compareData.reducePrincipal.totalInterest : 0, color: '#8B5CF6' }
        ]

        var maxVal = 0
        for (var i = 0; i < items.length; i++) {
          if (items[i].value > maxVal) maxVal = items[i].value
        }
        if (maxVal === 0) maxVal = 1

        var padLeft = 12
        var padRight = 12
        var padTop = 16
        var padBottom = 50
        var chartW = w - padLeft - padRight
        var chartH = h - padTop - padBottom
        var barW = chartW / items.length * 0.55
        var gap = chartW / items.length

        ctx.strokeStyle = gridColor
        ctx.lineWidth = 0.5
        for (var g = 0; g <= 4; g++) {
          var gy = padTop + chartH * (1 - g / 4)
          ctx.beginPath()
          ctx.moveTo(padLeft, gy)
          ctx.lineTo(padLeft + chartW, gy)
          ctx.stroke()
        }

        for (var bi = 0; bi < items.length; bi++) {
          var item = items[bi]
          var barH = (item.value / maxVal) * chartH
          if (barH < 2) barH = 2
          var x = padLeft + gap * bi + (gap - barW) / 2
          var y = padTop + chartH - barH

          ctx.fillStyle = item.color
          ctx.beginPath()
          var radius = 4
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + barW - radius, y)
          ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius)
          ctx.lineTo(x + barW, padTop + chartH)
          ctx.lineTo(x, padTop + chartH)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.fill()

          ctx.fillStyle = textColor
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          var valText = that._shortNum(item.value)
          ctx.fillText(valText, x + barW / 2, y - 4)

          var labels = item.label.split('\n')
          ctx.font = '8px sans-serif'
          for (var li = 0; li < labels.length; li++) {
            ctx.fillText(labels[li], x + barW / 2, padTop + chartH + 14 + li * 11)
          }
        }

        ctx.fillStyle = textColor
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(that.data.i18n.totalInterestCompare, w / 2, h - 2)
      })
  },

  _shortNum: function(num) {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + (this.data.i18n.hundredMillion || '亿')
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + (this.data.i18n.tenThousand || '万')
    }
    return num.toFixed(0)
  },

  copyResult: function() {
    if (!this.data.hasResult) {
      toolActions.copyText('')
      return
    }
    var t = this.data.i18n
    var text = t.copyPrepayResult + '\n'
      + t.originalMonthlyPay + ': ' + this.data.originalMonthly + t.yuan + '\n'
      + t.newMonthlyPay + ': ' + this.data.newMonthly + t.yuan + '\n'
      + t.savedInterestLabel + ': ' + this.data.savedInterest + t.yuan + '\n'
      + t.savedMonthsLabel + ': ' + this.data.savedMonths + t.months + '\n'
      + t.newRepayPeriod + ': ' + this.data.newTotalMonths + t.months + '\n'
      + t.originalTotalInterest + ': ' + this.data.originalTotalInterest + t.yuan + '\n'
      + t.newTotalInterest + ': ' + this.data.newTotalInterest + t.yuan + '\n'
      + t.originalTotalRepayment + ': ' + this.data.originalTotalPayment + t.yuan + '\n'
      + t.newTotalRepayment + ': ' + this.data.newTotalPayment + t.yuan
    if (this.data.prepayPlans.length > 0) {
      text += '\n' + t.prepayPlanCount + ': ' + this.data.prepayPlans.length + t.times
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    this.setData({
      loanAmount: '',
      yearIndex: 19,
      interestRate: '4.2',
      repaymentMethod: 'equal_payment',
      prepayMethod: 'shorten',
      prepayPlans: [],
      newPlanMonth: '',
      newPlanAmount: '',
      originalMonthly: '0.00',
      newMonthly: '0.00',
      savedInterest: '0.00',
      newTotalMonths: '0',
      savedMonths: '0',
      originalTotalInterest: '0.00',
      newTotalInterest: '0.00',
      originalTotalPayment: '0.00',
      newTotalPayment: '0.00',
      originalTotalMonths: '0',
      hasResult: false,
      compareData: null,
      showCompare: false
    })
    wx.vibrateShort({ type: 'light' })
  },

  formatCurrency: function(num) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  formatNumber: function(num) {
    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('提前还款计算器 - 百宝工具箱', '/package-calculator/prepayment-calculator/prepayment-calculator', '房贷提前还款计算，省息方案对比')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('提前还款计算器 - 房贷省息方案对比')
  }
})
