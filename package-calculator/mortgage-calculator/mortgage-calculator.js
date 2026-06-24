var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
Page({
  data: {
    isLoading: true,
    loanAmount: '',
    yearIndex: 19,
    yearOptions: Array.from({length: 30}, function(_, i) { return i + 1 }),
    interestRate: '4.2',
    repaymentType: 'equalPayment',
    ratePresets: [
      { label: '3.85%(LPR)', rate: '3.85' },
      { label: '4.2%', rate: '4.2' },
      { label: '4.65%', rate: '4.65' },
      { label: '5.0%', rate: '5.0' }
    ],
    monthlyPayment: '0.00',
    totalInterest: '0.00',
    totalPayment: '0.00',
    loanTotal: '0.00',
    totalMonths: '0',
    amountDisplay: '',
    hasCalculated: false,
    firstMonthPayment: '',
    lastMonthPayment: '',
    monthlyDecrease: '',
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    interestRatio: '0',
    showChart: false,
    chartType: 'pie',
    compareData: null,
    i18n: {},
    monthlyPaymentLabel: '',
    loanSummaryText: ''
  },

  onLoad: function() {
    this.setData({ i18n: i18n.getToolPageTexts('mortgage') })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('房贷计算器')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    poster.setupForPage(this, 3)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    this.setData({ i18n: i18n.getToolPageTexts('mortgage') })
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
  },

  onLoanAmountInput(e) {
    this.setData({
      loanAmount: e.detail.value,
      hasCalculated: false})
    },

  onYearChange(e) {
    this.setData({ yearIndex: e.detail.value, hasCalculated: false })
  },

  onRateInput(e) {
    this.setData({ interestRate: e.detail.value, hasCalculated: false })
  },

  usePresetRate(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({ interestRate: e.currentTarget.dataset.rate })
  },

  onTypeChange(e) {
    var type = e.currentTarget.dataset.type
    this.setData({ repaymentType: type, hasCalculated: false })
    wx.vibrateShort({ type: 'light' })
  },

  calculate() {
    var rawAmount = this.data.loanAmount.trim()

    if (!rawAmount || isNaN(parseFloat(rawAmount))) {
      wx.showToast({ title: this.data.i18n.invalidLoanAmount, icon: 'none' })
      return
    }

    if (!this.data.interestRate || isNaN(parseFloat(this.data.interestRate))) {
      wx.showToast({ title: this.data.i18n.invalidRate, icon: 'none' })
      return
    }

    var inputAmount = parseFloat(rawAmount)

    if (inputAmount <= 0) {
      wx.showToast({ title: this.data.i18n.amountMustPositive, icon: 'none' })
      return
    }

    if (inputAmount > 5000) {
      var that = this
      wx.showModal({
        title: this.data.i18n.confirmTitle,
        content: this.data.i18n.confirmLargeAmount.replace('{amount}', inputAmount).replace('{yuan}', this.formatNumber(inputAmount * 10000)),
        confirmText: this.data.i18n.confirmCalculate,
        success: function(res) {
          if (res.confirm) {
            that.doCalculate(inputAmount)
          }
        }
      })
      return
    }

    this.doCalculate(inputAmount)
  },

  doCalculate(inputWan) {
    var amount = Math.round(inputWan * 10000)
    var years = parseInt(this.data.yearOptions[this.data.yearIndex])
    var months = years * 12
    var annualRate = parseFloat(this.data.interestRate)

    if (annualRate <= 0 || annualRate >= 100) {
      wx.showToast({ title: this.data.i18n.rateRangeError, icon: 'none' })
      return
    }

    var rate = annualRate / 100 / 12

    var monthlyPay = 0
    var totalPay = 0
    var totalInt = 0
    var firstMonth = 0
    var lastMonth = 0
    var monthDecrease = 0

    if (this.data.repaymentType === 'equalPayment') {
      var powValue = Math.pow(1 + rate, months)
      if (powValue === 1) {
        monthlyPay = amount / months
      } else {
        monthlyPay = (amount * rate * powValue) / (powValue - 1)
      }
      totalPay = monthlyPay * months
      totalInt = totalPay - amount
      firstMonth = monthlyPay
      lastMonth = monthlyPay
    } else {
      var principalPerMonth = amount / months
      var remaining = amount

      for (var i = 0; i < months; i++) {
        var interest = remaining * rate
        var payment = principalPerMonth + interest

        if (i === 0) {
          firstMonth = payment
        }

        if (i === months - 1) {
          lastMonth = payment
        }

        totalInt += interest
        remaining -= principalPerMonth
      }

      totalPay = amount + totalInt
      monthlyPay = firstMonth
      monthDecrease = principalPerMonth * rate
    }

    var monthlyPaymentLabel = this.data.repaymentType === 'equalPayment' ? this.data.i18n.monthlyPayment : this.data.i18n.firstMonthPayment
    var loanSummaryText = this.data.i18n.loanSummary.replace('{amount}', inputWan + this.data.i18n.wanUnit).replace('{months}', months).replace('{rate}', this.data.interestRate)

    this.setData({
      monthlyPayment: this.formatCurrency(monthlyPay),
      totalInterest: this.formatCurrency(totalInt),
      totalPayment: this.formatCurrency(totalPay),
      loanTotal: this.formatCurrency(amount),
      totalMonths: months.toString(),
      amountDisplay: inputWan + '万',
      hasCalculated: true,
      firstMonthPayment: this.formatCurrency(firstMonth),
      lastMonthPayment: this.formatCurrency(lastMonth),
      monthlyDecrease: monthDecrease > 0 ? this.data.i18n.monthlyDecrease + ' ' + this.formatCurrency(monthDecrease) : '',
      interestRatio: totalPay > 0 ? (totalInt / totalPay * 100).toFixed(1) : '0',
      showChart: false,
      compareData: this.calcBothTypes(amount, months, rate),
      monthlyPaymentLabel: monthlyPaymentLabel,
      loanSummaryText: loanSummaryText
    })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(3, '房贷计算器', false)

    wx.vibrateShort({ type: 'medium' })
  },

  formatCurrency(num) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  formatNumber(num) {
    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  resetForm: function() {
    this.setData({
      loanAmount: '',
      yearIndex: 19,
      interestRate: '4.2',
      repaymentType: 'equalPayment',
      monthlyPayment: '0.00',
      totalInterest: '0.00',
      totalPayment: '0.00',
      loanTotal: '0.00',
      totalMonths: '0',
      amountDisplay: '',
      hasCalculated: false,
      firstMonthPayment: '',
      lastMonthPayment: '',
      monthlyDecrease: '',
      interestRatio: '0',
      showChart: false,
      chartType: 'pie',
      compareData: null,
      monthlyPaymentLabel: '',
      loanSummaryText: ''
    })
    wx.vibrateShort({ type: 'light' })
  },
  calcBothTypes: function(amount, months, rate) {
    var epPow = Math.pow(1 + rate, months)
    var epMonthly = epPow === 1 ? amount / months : (amount * rate * epPow) / (epPow - 1)
    var epTotalPay = epMonthly * months
    var epTotalInt = epTotalPay - amount

    var eprPrincipalPerMonth = amount / months
    var eprRemaining = amount
    var eprTotalInt = 0
    var eprFirstMonth = 0
    var eprLastMonth = 0
    for (var i = 0; i < months; i++) {
      var interest = eprRemaining * rate
      var payment = eprPrincipalPerMonth + interest
      if (i === 0) eprFirstMonth = payment
      if (i === months - 1) eprLastMonth = payment
      eprTotalInt += interest
      eprRemaining -= eprPrincipalPerMonth
    }
    var eprTotalPay = amount + eprTotalInt

    return {
      ep: {
        name: this.data.i18n.equalPayment,
        monthlyPayment: epMonthly,
        totalPayment: epTotalPay,
        totalInterest: epTotalInt,
        principal: amount,
        interestRatio: epTotalPay > 0 ? (epTotalInt / epTotalPay * 100).toFixed(1) : '0'
      },
      epr: {
        name: this.data.i18n.equalPrincipal,
        monthlyPayment: eprFirstMonth,
        lastMonthPayment: eprLastMonth,
        totalPayment: eprTotalPay,
        totalInterest: eprTotalInt,
        principal: amount,
        interestRatio: eprTotalPay > 0 ? (eprTotalInt / eprTotalPay * 100).toFixed(1) : '0'
      },
      savedInterest: epTotalInt - eprTotalInt
    }
  },

  toggleChart: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showChart
    this.setData({ showChart: show })
    if (show) {
      var that = this
      setTimeout(function() { that.drawChart() }, 150)
    }
  },

  switchChartType: function(e) {
    var type = e.currentTarget.dataset.type
    if (type === this.data.chartType) return
    wx.vibrateShort({ type: 'light' })
    this.setData({ chartType: type })
    var that = this
    setTimeout(function() { that.drawChart() }, 50)
  },

  drawChart: function() {
    var that = this
    var canvasId = this.data.chartType === 'pie' ? 'pieCanvas' : 'barCanvas'
    var query = wx.createSelectorQuery()
    query.select('#' + canvasId)
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0] || !res[0].node) return
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = wx.getWindowInfo().pixelRatio
        var width = res[0].width
        var height = res[0].height
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        if (that.data.chartType === 'pie') {
          that.drawPieChart(ctx, width, height)
        } else {
          that.drawBarChart(ctx, width, height)
        }
      })
  },

  drawPieChart: function(ctx, width, height) {
    var data = this.data.compareData
    var isDark = this.data.isDarkMode
    if (!data) return

    ctx.clearRect(0, 0, width, height)

    var centerX = width * 0.26
    var centerY = height * 0.42
    var radius = Math.min(width * 0.22, height * 0.3)
    if (radius < 28) radius = 28

    var epPrincipal = data.ep.principal
    var epInterest = data.ep.totalInterest
    var epTotal = epPrincipal + epInterest

    var slices = [
      { value: epPrincipal, color: '#10B981', label: this.data.i18n.loanPrincipal },
      { value: epInterest, color: '#F59E0B', label: this.data.i18n.interestPaid }
    ]

    var startAngle = -Math.PI / 2
    for (var si = 0; si < slices.length; si++) {
      var sliceAngle = (slices[si].value / epTotal) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = slices[si].color
      ctx.fill()

      if (sliceAngle > 0.3) {
        var midAngle = startAngle + sliceAngle / 2
        var labelR = radius * 0.65
        var lx = centerX + Math.cos(midAngle) * labelR
        var ly = centerY + Math.sin(midAngle) * labelR
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        var pct = (slices[si].value / epTotal * 100).toFixed(1) + '%'
        ctx.fillText(pct, lx, ly)
      }

      startAngle += sliceAngle
    }

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.42, 0, Math.PI * 2)
    ctx.fillStyle = isDark ? '#1a2035' : '#FFFFFF'
    ctx.fill()

    ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.data.i18n.interestRatioLabel, centerX, centerY - 7)
    ctx.fillStyle = '#F59E0B'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText(data.ep.interestRatio + '%', centerX, centerY + 9)

    var legendX = width * 0.54
    var legendY = 20
    var legendSpacing = 46
    var legendItems = [
      { color: '#10B981', label: this.data.i18n.loanPrincipal, value: this.formatCurrency(epPrincipal) + ' ' + this.data.i18n.yuan },
      { color: '#F59E0B', label: this.data.i18n.interestPaid, value: this.formatCurrency(epInterest) + ' ' + this.data.i18n.yuan },
      { color: '#3B82F6', label: this.data.i18n.totalRepayment, value: this.formatCurrency(epTotal) + ' ' + this.data.i18n.yuan }
    ]

    for (var li = 0; li < legendItems.length; li++) {
      var item = legendItems[li]
      var iy = legendY + li * legendSpacing

      ctx.beginPath()
      ctx.arc(legendX, iy + 2, 5, 0, Math.PI * 2)
      ctx.fillStyle = item.color
      ctx.fill()

      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.label, legendX + 12, iy + 2)

      ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(item.value, legendX + 12, iy + 18)
    }

    var savedY = legendY + legendItems.length * legendSpacing + 6
    var savedText = this.data.i18n.eprSaveInterest
    var savedValue = this.formatCurrency(data.savedInterest) + ' ' + this.data.i18n.yuan
    var boxW = width - legendX - 8
    if (boxW < 100) boxW = 100
    ctx.beginPath()
    ctx.moveTo(legendX, savedY)
    ctx.lineTo(legendX + boxW, savedY)
    ctx.lineTo(legendX + boxW, savedY + 38)
    ctx.lineTo(legendX, savedY + 38)
    ctx.closePath()
    ctx.fillStyle = isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5'
    ctx.fill()

    ctx.fillStyle = isDark ? '#6EE7B7' : '#065F46'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(savedText, legendX + 8, savedY + 5)
    ctx.fillStyle = isDark ? '#34D399' : '#059669'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(savedValue, legendX + 8, savedY + 20)
  },

  drawBarChart: function(ctx, width, height) {
    var data = this.data.compareData
    var isDark = this.data.isDarkMode
    if (!data) return

    ctx.clearRect(0, 0, width, height)

    var padLeft = 12
    var padRight = 12
    var padTop = 20
    var padBottom = 60
    var chartW = width - padLeft - padRight
    var chartH = height - padTop - padBottom

    var epTotal = data.ep.totalPayment
    var eprTotal = data.epr.totalPayment
    var maxVal = Math.max(epTotal, eprTotal)
    if (maxVal === 0) maxVal = 1

    var barW = chartW * 0.28
    var gap = chartW * 0.16
    var startX = padLeft + (chartW - barW * 2 - gap) / 2

    var items = [
      { x: startX, total: epTotal, principal: data.ep.principal, interest: data.ep.totalInterest, name: this.data.i18n.equalPayment },
      { x: startX + barW + gap, total: eprTotal, principal: data.epr.principal, interest: data.epr.totalInterest, name: this.data.i18n.equalPrincipal }
    ]

    for (var bi = 0; bi < items.length; bi++) {
      var bar = items[bi]
      var totalH = (bar.total / maxVal) * chartH
      var principalH = (bar.principal / maxVal) * chartH
      var interestH = totalH - principalH
      var barY = padTop + chartH - totalH

      ctx.fillStyle = '#10B981'
      ctx.beginPath()
      var pr = 4
      if (principalH > pr * 2) {
        ctx.moveTo(bar.x, barY + totalH)
        ctx.lineTo(bar.x, barY + interestH + pr)
        ctx.arcTo(bar.x, barY + interestH, bar.x + pr, barY + interestH, pr)
        ctx.lineTo(bar.x + barW - pr, barY + interestH)
        ctx.arcTo(bar.x + barW, barY + interestH, bar.x + barW, barY + interestH + pr, pr)
        ctx.lineTo(bar.x + barW, barY + totalH)
        ctx.closePath()
        ctx.fill()
      } else if (principalH > 0) {
        ctx.fillRect(bar.x, barY + interestH, barW, principalH)
      }

      ctx.fillStyle = '#F59E0B'
      ctx.beginPath()
      if (interestH > pr * 2) {
        ctx.moveTo(bar.x, barY + interestH)
        ctx.lineTo(bar.x, barY + pr)
        ctx.arcTo(bar.x, barY, bar.x + pr, barY, pr)
        ctx.lineTo(bar.x + barW - pr, barY)
        ctx.arcTo(bar.x + barW, barY, bar.x + barW, barY + pr, pr)
        ctx.lineTo(bar.x + barW, barY + interestH)
        ctx.closePath()
        ctx.fill()
      } else if (interestH > 0) {
        ctx.fillRect(bar.x, barY, barW, interestH)
      }

      ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      var totalStr = this.formatCurrency(bar.total) + this.data.i18n.yuan
      ctx.fillText(totalStr, bar.x + barW / 2, barY - 4)

      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(bar.name, bar.x + barW / 2, padTop + chartH + 10)

      ctx.fillStyle = '#10B981'
      ctx.font = '10px sans-serif'
      ctx.fillText(this.data.i18n.loanPrincipal + ' ' + (bar.principal / bar.total * 100).toFixed(1) + '%', bar.x + barW / 2, padTop + chartH + 28)
    }

    var legendY2 = padTop + chartH + 46
    var legendStartX = padLeft + chartW * 0.15
    var lgItems = [
      { color: '#10B981', label: this.data.i18n.loanPrincipal },
      { color: '#F59E0B', label: this.data.i18n.interestPaid }
    ]
    for (var lgi = 0; lgi < lgItems.length; lgi++) {
      var lgiX = legendStartX + lgi * 80
      ctx.beginPath()
      ctx.arc(lgiX, legendY2 + 1, 4, 0, Math.PI * 2)
      ctx.fillStyle = lgItems[lgi].color
      ctx.fill()
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(lgItems[lgi].label, lgiX + 8, legendY2 + 1)
    }
  },

  copyResult: function() {
    if (!this.data.hasCalculated) {
      wx.showToast({ title: this.data.i18n.pleaseCalculate, icon: 'none' })
      return
    }
    var type = this.data.repaymentType === 'equalPayment' ? this.data.i18n.equalPayment : this.data.i18n.equalPrincipal
    var text = this.data.i18n.copyResultTitle + '\n'
    text += this.data.i18n.repaymentMethod + ': ' + type + '\n'
    text += this.data.i18n.loanAmountLabel + ': ' + this.data.amountDisplay + ' ' + this.data.i18n.yuan + '\n'
    text += this.data.i18n.loanTerm + ': ' + this.data.totalMonths + this.data.i18n.months + '\n'
    text += this.data.i18n.annualRate + ': ' + this.data.interestRate + '%\n'
    text += this.data.i18n.monthlyPayment + ': ' + this.data.monthlyPayment + ' ' + this.data.i18n.yuan + '\n'
    text += this.data.i18n.interestPaid + ': ' + this.data.totalInterest + ' ' + this.data.i18n.yuan + '\n'
    text += this.data.i18n.totalRepayment + ': ' + this.data.totalPayment + ' ' + this.data.i18n.yuan
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: this.data.i18n.copySuccess, icon: 'success' })
      }.bind(this),
      fail: function() {
        wx.showToast({ title: this.data.i18n.copyFail, icon: 'none' })
      }.bind(this)
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('房贷计算器 - 百宝工具箱', '/package-calculator/mortgage-calculator/mortgage-calculator', '精准计算月供利息，等额本息本金对比')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('房贷计算器 - 月供利息精准计算')
  }
})
