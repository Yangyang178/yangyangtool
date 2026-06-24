var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var logger = require('../../utils/logger.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    i18n: {},
    salary: '',
    bonus: '',
    socialInsurance: {
      pension: 8,
      medical: 2,
      unemployment: 0.5,
      housing: 7
    },
    showSocialDetail: false,
    deductions: {
      childrenEducation: 0,
      continuingEducation: 0,
      housingRent: 1500,
      elderlyCare: 2000,
      other: 0
    },
    result: null,
    bonusResult: null,
    breakdown: [],
    totalDeduction: '3500',
    socialTotal: '0',
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    isLoading: true
  },

  onLoad: function() {
    this.setData({ i18n: i18n.getToolPageTexts('tax') })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('个税计算器')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    this.updateTotalDeduction()
    this.updateSocialTotal()
    poster.setupForPage(this, 25)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    this.setData({ i18n: i18n.getToolPageTexts('tax') })
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
  },

  onSalaryInput: function(e) {
    this.setData({ salary: e.detail.value })
  },

  onBonusInput: function(e) {
    this.setData({ bonus: e.detail.value })
  },

  onDeductionInput: function(e) {
    var key = e.currentTarget.dataset.field
    var val = parseFloat(e.detail.value) || 0
    var obj = {}
    obj['deductions.' + key] = val
    this.setData(obj)
    this.updateTotalDeduction()
  },

  onSocialInput: function(e) {
    var key = e.currentTarget.dataset.field
    var val = parseFloat(e.detail.value) || 0
    var obj = {}
    obj['socialInsurance.' + key] = val
    this.setData(obj)
    this.updateSocialTotal()
  },

  toggleSocialDetail: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ showSocialDetail: !this.data.showSocialDetail })
  },

  updateTotalDeduction: function() {
    var d = this.data.deductions
    var total = parseFloat(d.childrenEducation || 0) + parseFloat(d.continuingEducation || 0) + parseFloat(d.housingRent || 0) + parseFloat(d.elderlyCare || 0) + parseFloat(d.other || 0)
    this.setData({ totalDeduction: total.toFixed(0) })
  },

  updateSocialTotal: function() {
    var si = this.data.socialInsurance
    var total = parseFloat(si.pension || 0) + parseFloat(si.medical || 0) + parseFloat(si.unemployment || 0) + parseFloat(si.housing || 0)
    this.setData({ socialTotal: total.toFixed(1) })
  },

  calcTax: function(taxable) {
    if (taxable <= 0) return 0
    var brackets = [
      { limit: 3000, rate: 0.03, quick: 0 },
      { limit: 12000, rate: 0.1, quick: 210 },
      { limit: 25000, rate: 0.2, quick: 1410 },
      { limit: 35000, rate: 0.25, quick: 2660 },
      { limit: 55000, rate: 0.3, quick: 4410 },
      { limit: 80000, rate: 0.35, quick: 7160 },
      { limit: Infinity, rate: 0.45, quick: 15160 }
    ]
    for (var i = 0; i < brackets.length; i++) {
      if (taxable <= brackets[i].limit) {
        return taxable * brackets[i].rate - brackets[i].quick
      }
    }
    return 0
  },

  calcBonusTaxSeparate: function(bonus) {
    if (bonus <= 0) return 0
    var monthly = bonus / 12
    var brackets = [
      { limit: 3000, rate: 0.03, quick: 0 },
      { limit: 12000, rate: 0.1, quick: 210 },
      { limit: 25000, rate: 0.2, quick: 1410 },
      { limit: 35000, rate: 0.25, quick: 2660 },
      { limit: 55000, rate: 0.3, quick: 4410 },
      { limit: 80000, rate: 0.35, quick: 7160 },
      { limit: Infinity, rate: 0.45, quick: 15160 }
    ]
    var rate = 0.03
    var quick = 0
    for (var i = 0; i < brackets.length; i++) {
      if (monthly <= brackets[i].limit) {
        rate = brackets[i].rate
        quick = brackets[i].quick
        break
      }
    }
    return bonus * rate - quick
  },

  calculate: function() {
    try {
      var s = parseFloat(this.data.salary)
      if (!s || isNaN(s) || s <= 0) {
        wx.showToast({ title: this.data.i18n.inputValidSalary, icon: 'none' })
        return
      }
      if (s > 1000000) {
        wx.showToast({ title: this.data.i18n.salaryTooHigh, icon: 'none' })
        return
      }

      wx.vibrateShort({ type: 'light' })
      var d = this.data.deductions
      var si = this.data.socialInsurance

      var children = parseFloat(d.childrenEducation) || 0
      var education = parseFloat(d.continuingEducation) || 0
      var housing = parseFloat(d.housingRent) || 0
      var elderly = parseFloat(d.elderlyCare) || 0
      var other = parseFloat(d.other) || 0

      var pensionRate = parseFloat(si.pension) || 0
      var medicalRate = parseFloat(si.medical) || 0
      var unemploymentRate = parseFloat(si.unemployment) || 0
      var housingRate = parseFloat(si.housing) || 0

      var socialTotalRate = pensionRate + medicalRate + unemploymentRate + housingRate
      var socialDeduction = s * socialTotalRate / 100
      var pensionAmount = s * pensionRate / 100
      var medicalAmount = s * medicalRate / 100
      var unemploymentAmount = s * unemploymentRate / 100
      var housingAmount = s * housingRate / 100

      var threshold = 5000
      var totalDeduct = children + education + housing + elderly + other
      var taxable = Math.max(0, s - threshold - totalDeduct - socialDeduction)
      var tax = this.calcTax(taxable)
      var afterTax = Math.max(0, s - tax - socialDeduction)
      var effectiveRate = s > 0 ? ((tax / s) * 100).toFixed(2) : '0.00'
      var monthlyAfterTax = afterTax.toFixed(2)
      var annualSalary = (s * 12).toFixed(2)
      var annualTax = (tax * 12).toFixed(2)
      var annualAfterTax = (afterTax * 12).toFixed(2)
      var annualSocial = (socialDeduction * 12).toFixed(2)

      var taxableNoSocial = Math.max(0, s - threshold - totalDeduct)
      var taxNoSocial = this.calcTax(taxableNoSocial)
      var afterTaxNoSocial = Math.max(0, s - taxNoSocial)
      var taxSavedBySocial = (taxNoSocial - tax).toFixed(2)

      var breakdown = [
        { label: this.data.i18n.preTaxSalary, val: s.toFixed(2), cls: '' },
        { label: this.data.i18n.socialDeduction, val: '-' + socialDeduction.toFixed(2), cls: 'negative' },
        { label: this.data.i18n.thresholdDeduction, val: '-' + threshold.toFixed(2), cls: 'negative' },
        { label: this.data.i18n.specialDeduction, val: '-' + totalDeduct.toFixed(2), cls: 'negative' },
        { label: this.data.i18n.taxableIncome, val: taxable.toFixed(2), cls: '' },
        { label: this.data.i18n.taxPayableLabel, val: tax.toFixed(2), cls: 'negative' },
        { label: this.data.i18n.afterTaxSalary, val: monthlyAfterTax, cls: 'positive' }
      ]

      var socialResult = {
        total: socialDeduction.toFixed(2),
        pension: pensionAmount.toFixed(2),
        medical: medicalAmount.toFixed(2),
        unemployment: unemploymentAmount.toFixed(2),
        housing: housingAmount.toFixed(2),
        annualTotal: annualSocial,
        taxSaved: taxSavedBySocial,
        noSocialTax: taxNoSocial.toFixed(2),
        taxWithSocial: tax.toFixed(2)
      }

      var bonusResult = null
      var bonusVal = parseFloat(this.data.bonus) || 0
      if (bonusVal > 0) {
        var separateTax = this.calcBonusTaxSeparate(bonusVal)
        var separateAfterTax = bonusVal - separateTax

        var combinedTaxable = Math.max(0, s - threshold - totalDeduct - socialDeduction + bonusVal)
        var combinedTax = this.calcTax(combinedTaxable)
        var combinedMonthTax = combinedTax
        var combinedAfterTax = s + bonusVal - combinedMonthTax - socialDeduction

        var better = separateTax <= combinedMonthTax - tax ? 'separate' : 'combined'
        var savedAmount = Math.abs(separateTax - (combinedMonthTax - tax)).toFixed(2)

        bonusResult = {
          bonus: bonusVal.toFixed(2),
          separate: {
            tax: separateTax.toFixed(2),
            afterTax: separateAfterTax.toFixed(2),
            effectiveRate: (separateTax / bonusVal * 100).toFixed(2)
          },
          combined: {
            extraTax: (combinedMonthTax - tax).toFixed(2),
            totalTax: combinedMonthTax.toFixed(2),
            afterTax: combinedAfterTax.toFixed(2),
            effectiveRate: ((combinedMonthTax - tax) / bonusVal * 100).toFixed(2)
          },
          better: better,
          saved: savedAmount
        }
      }

      this.setData({
        result: {
          gross: s.toFixed(2),
          tax: tax.toFixed(2),
          afterTax: monthlyAfterTax,
          effectiveRate: effectiveRate,
          totalDeduct: totalDeduct.toFixed(2),
          taxable: taxable.toFixed(2),
          annualSalary: annualSalary,
          annualTax: annualTax,
          annualAfterTax: annualAfterTax,
          socialDeduction: socialDeduction.toFixed(2),
          monthlyNet: afterTax.toFixed(2),
          annual: {
            preTax: annualSalary,
            tax: annualTax,
            afterTax: annualAfterTax
          },
          socialResult: socialResult
        },
        bonusResult: bonusResult,
        breakdown: breakdown
      })

      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(25, '个税计算器', false)
    } catch (err) {
      logger.error('Tax calculation error:', err)
      wx.showToast({ title: this.data.i18n.calcError, icon: 'none' })
    }
  },

  copyResult: function() {
    if (!this.data.result) return
    var t = this.data.i18n
    var text = t.afterTaxMonthly + ': ' + this.data.result.afterTax + t.yuan
    if (this.data.bonusResult) {
      var br = this.data.bonusResult
      text += '\n' + t.afterTaxBonusLabel + ': ' + (br.better === 'separate' ? br.separate.afterTax : br.combined.afterTax) + t.yuan
      text += '\n' + t.recommend + ': ' + (br.better === 'separate' ? t.separateTaxLabel : t.combinedTaxLabel)
    }
    var that = this
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: text,
      success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        salary: '',
        bonus: '',
        socialInsurance: {
          pension: 8,
          medical: 2,
          unemployment: 0.5,
          housing: 7
        },
        deductions: {
          childrenEducation: 0,
          continuingEducation: 0,
          housingRent: 1500,
          elderlyCare: 2000,
          other: 0
        },
        result: null,
        bonusResult: null,
        breakdown: [],
        totalDeduction: '3500',
        socialTotal: '17.5',
        showSocialDetail: false
      })
      that.updateTotalDeduction()
      that.updateSocialTotal()
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('个税计算器 - 百宝工具箱', '/package-calculator/tax-calculator/tax-calculator', '工资个税计算，五险一金扣除')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('个税计算器 - 工资个税五险一金计算')
  }
})
