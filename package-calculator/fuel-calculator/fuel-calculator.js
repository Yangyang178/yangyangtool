var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    isLoading: true,

    calcMode: 'per100',
    mileage: '',
    fuelAmount: '',
    fuelPrice: '',
    unitPrice: '',

    result: null,
    costPerKm: null,
    totalCost: null,
    rangeEstimate: null,

    history: [],
    showHistory: false,
    showGuideTip: false
  },

  onLoad: function() {
    this.setData({
      i18n: i18n.getToolPageTexts('fuelCalc'),
      isDarkMode: storageUtil.get('darkMode') || false,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      fontClass: points.getFontClass(),
      isLoading: false
    })
    var guideClosed = storageUtil.get('guide_tip_closed_53', false)
    this.setData({ showGuideTip: !guideClosed })
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
    this.loadHistory()
  },

  closeGuideTip: function() {
    storageUtil.set('guide_tip_closed_53', true)
    this.setData({ showGuideTip: false })
  },

  onShow: function() {
    var setting = storageUtil.get('darkModeSetting', 'system')
    var isDark = false
    if (setting === 'dark') {
      isDark = true
    } else if (setting === 'system') {
      try { isDark = wx.getSystemInfoSync().theme === 'dark' } catch(e) {}
    }
    this.setData({
      isDarkMode: isDark,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      fontClass: points.getFontClass()
    })
  },

  switchMode: function(e) {
    var mode = e.currentTarget.dataset.mode
    wx.vibrateShort({ type: 'light' })
    this.setData({ calcMode: mode, result: null, costPerKm: null, totalCost: null, rangeEstimate: null })
  },

  onMileageInput: function(e) {
    this.setData({ mileage: e.detail.value })
  },

  onFuelAmountInput: function(e) {
    this.setData({ fuelAmount: e.detail.value })
  },

  onFuelPriceInput: function(e) {
    this.setData({ fuelPrice: e.detail.value })
  },

  onUnitPriceInput: function(e) {
    this.setData({ unitPrice: e.detail.value })
  },

  usePricePreset: function(e) {
    var price = e.currentTarget.dataset.price
    this.setData({ fuelPrice: price })
  },

  usePricePresetCost: function(e) {
    var price = e.currentTarget.dataset.price
    this.setData({ unitPrice: price })
  },

  calculate: function() {
    var t = this.data.i18n
    var mileage = parseFloat(this.data.mileage)
    var fuelAmount = parseFloat(this.data.fuelAmount)
    var fuelPrice = parseFloat(this.data.fuelPrice)
    var unitPrice = parseFloat(this.data.unitPrice)
    var mode = this.data.calcMode

    if (mode === 'per100') {
      if (!mileage || mileage <= 0) {
        wx.showToast({ title: t.inputMileage, icon: 'none' })
        return
      }
      if (!fuelAmount || fuelAmount <= 0) {
        wx.showToast({ title: t.inputFuelAmount, icon: 'none' })
        return
      }

      var consumption = (fuelAmount / mileage * 100).toFixed(1)
      var costPerKm = fuelPrice > 0 ? (fuelPrice * fuelAmount / mileage).toFixed(2) : null
      var totalCost = fuelPrice > 0 ? (fuelPrice * fuelAmount).toFixed(2) : null

      this.setData({
        result: consumption,
        costPerKm: costPerKm,
        totalCost: totalCost,
        rangeEstimate: null
      })

      this.saveHistory({
        mode: 'per100',
        mileage: mileage,
        fuel: fuelAmount,
        price: fuelPrice || 0,
        result: consumption
      })

    } else {
      if (!unitPrice || unitPrice <= 0) {
        wx.showToast({ title: t.inputUnitPrice, icon: 'none' })
        return
      }
      if (!fuelAmount || fuelAmount <= 0) {
        wx.showToast({ title: t.inputFuelAmount, icon: 'none' })
        return
      }

      var totalCost2 = (unitPrice * fuelAmount).toFixed(2)
      var per100 = mileage > 0 ? (fuelAmount / mileage * 100).toFixed(1) : null
      var costPerKm2 = mileage > 0 ? (unitPrice * fuelAmount / mileage).toFixed(2) : null

      this.setData({
        result: totalCost2,
        costPerKm: costPerKm2,
        totalCost: null,
        rangeEstimate: per100
      })

      this.saveHistory({
        mode: 'cost',
        mileage: mileage || 0,
        fuel: fuelAmount,
        price: unitPrice,
        result: totalCost2
      })
    }

    try { points.recordToolUse(53) } catch(e) {}
  },

  reset: function() {
    wx.vibrateShort({ type: 'medium' })
    this.setData({
      mileage: '',
      fuelAmount: '',
      fuelPrice: '',
      unitPrice: '',
      result: null,
      costPerKm: null,
      totalCost: null,
      rangeEstimate: null
    })
  },

  loadHistory: function() {
    var history = storageUtil.safeGetArray('fuelCalcHistory')
    if (history.length > 10) history = history.slice(-10)
    this.setData({ history: history })
  },

  saveHistory: function(record) {
    var history = this.data.history.slice()
    record.time = new Date().toLocaleDateString()
    history.push(record)
    if (history.length > 10) history = history.slice(-10)
    storageUtil.set('fuelCalcHistory', history)
    this.setData({ history: history })
  },

  toggleHistory: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ showHistory: !this.data.showHistory })
  },

  clearHistory: function() {
    var that = this
    wx.showModal({
      title: that.data.i18n.clearHistoryTitle,
      content: that.data.i18n.clearHistoryContent,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          storageUtil.set('fuelCalcHistory', [])
          that.setData({ history: [], showHistory: false })
          wx.showToast({ title: that.data.i18n.cleared, icon: 'success' })
        }
      }
    })
  },

  onShareAppMessage: function() {
    return {
      title: '油耗计算器 - 百宝工具箱',
      path: '/package-calculator/fuel-calculator/fuel-calculator'
    }
  }
})
