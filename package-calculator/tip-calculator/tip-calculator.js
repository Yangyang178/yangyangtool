var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var TIP_CULTURE = [
  { country: '美国', flag: '🇺🇸', currency: '$', code: 'USD', tipRange: '15-25%', defaultTip: 18, note: '小费文化根深蒂固，餐厅通常15-20%，酒吧1-2美元/杯，出租车15%' },
  { country: '加拿大', flag: '🇨🇦', currency: 'C$', code: 'CAD', tipRange: '15-20%', defaultTip: 18, note: '与美国类似，餐厅15-20%，外卖配送5-10%' },
  { country: '英国', flag: '🇬🇧', currency: '£', code: 'GBP', tipRange: '10-15%', defaultTip: 12, note: '非强制，高档餐厅10-15%，已含服务费则无需额外小费' },
  { country: '法国', flag: '🇫🇷', currency: '€', code: 'EUR', tipRange: '5-10%', defaultTip: 10, note: '账单已含服务费，额外留零钱即可，5-10%表示满意' },
  { country: '德国', flag: '🇩🇪', currency: '€', code: 'EUR', tipRange: '5-10%', defaultTip: 10, note: '凑整即可，如9.5欧给10欧说"Stimmt so"' },
  { country: '意大利', flag: '🇮🇹', currency: '€', code: 'EUR', tipRange: '5-10%', defaultTip: 10, note: 'Coperto(餐位费)已含，额外1-2欧元即可' },
  { country: '西班牙', flag: '🇪🇸', currency: '€', code: 'EUR', tipRange: '5-10%', defaultTip: 10, note: '非强制，留零钱或5%即可表示满意' },
  { country: '日本', flag: '🇯🇵', currency: '¥', code: 'JPY', tipRange: '0%', defaultTip: 0, note: '给小费被视为不礼貌！服务已含在价格中' },
  { country: '韩国', flag: '🇰🇷', currency: '₩', code: 'KRW', tipRange: '0%', defaultTip: 0, note: '无需小费，服务费通常已含' },
  { country: '中国', flag: '🇨🇳', currency: '¥', code: 'CNY', tipRange: '0%', defaultTip: 0, note: '无需小费，高档酒店可能收服务费' },
  { country: '澳大利亚', flag: '🇦🇺', currency: 'A$', code: 'AUD', tipRange: '0-10%', defaultTip: 10, note: '非强制，高档餐厅可给10%表示满意' },
  { country: '巴西', flag: '🇧🇷', currency: 'R$', code: 'BRL', tipRange: '10%', defaultTip: 10, note: '通常10%，账单可能已含Gorjeta(服务费)' },
  { country: '墨西哥', flag: '🇲🇽', currency: 'MX$', code: 'MXN', tipRange: '10-15%', defaultTip: 15, note: '餐厅10-15%，加油站和泊车1-2美元' },
  { country: '泰国', flag: '🇹🇭', currency: '฿', code: 'THB', tipRange: '0-10%', defaultTip: 10, note: '高档餐厅可给10%，街边摊无需小费' },
  { country: '印度', flag: '🇮🇳', currency: '₹', code: 'INR', tipRange: '10%', defaultTip: 10, note: '餐厅约10%，酒店行李员50-100卢比' }
]

var ROUND_OPTIONS = [
  { label: '不舍入', value: 'none' },
  { label: '向上取整', value: 'ceil' },
  { label: '四舍五入', value: 'round' },
  { label: '凑5整', value: 'nickel' },
  { label: '凑整十', value: 'ten' }
]

Page({
  data: {
    i18n: {},
    billAmount: '',
    selectedTip: 18,
    tipOptions: [
      { value: 10 },
      { value: 15 },
      { value: 18 },
      { value: 20 },
      { value: 25 }
    ],
    isCustomTip: false,
    customTipValue: '',
    peopleCount: 1,
    currentTipPercent: 18,
    tipAmount: '0.00',
    totalAmount: '0.00',
    totalPerPerson: '0.00',
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',

    selectedCountryIdx: 0,
    countryList: TIP_CULTURE,
    currencySymbol: '$',
    currencyCode: 'USD',
    showCountryRef: false,

    roundMode: 'none',
    roundOptions: ROUND_OPTIONS,
    roundedTotal: '',
    roundedTip: '',
    isLoading: true
  },

  onLoad: function() {
    this.setData({ i18n: i18n.getToolPageTexts('tip') })
    var i18nTexts = this.data.i18n
    var countryKeys = ['US','CA','GB','FR','DE','IT','ES','JP','KR','CN','AU','BR','MX','TH','IN']
    var translatedList = TIP_CULTURE.map(function(item, idx) {
      var key = countryKeys[idx]
      return {
        country: i18nTexts['country' + key] || item.country,
        flag: item.flag,
        currency: item.currency,
        code: item.code,
        tipRange: item.tipRange,
        defaultTip: item.defaultTip,
        note: i18nTexts['note' + key] || item.note
      }
    })
    this.setData({
      countryList: translatedList,
      roundOptions: [
        { label: i18nTexts.roundNone, value: 'none' },
        { label: i18nTexts.roundCeil, value: 'ceil' },
        { label: i18nTexts.roundRound, value: 'round' },
        { label: i18nTexts.roundNickel, value: 'nickel' },
        { label: i18nTexts.roundTen, value: 'ten' }
      ]
    })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('小费计算器')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    poster.setupForPage(this, 4)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    this.setData({ i18n: i18n.getToolPageTexts('tip') })
    var i18nTexts = this.data.i18n
    var countryKeys = ['US','CA','GB','FR','DE','IT','ES','JP','KR','CN','AU','BR','MX','TH','IN']
    var translatedList = TIP_CULTURE.map(function(item, idx) {
      var key = countryKeys[idx]
      return {
        country: i18nTexts['country' + key] || item.country,
        flag: item.flag,
        currency: item.currency,
        code: item.code,
        tipRange: item.tipRange,
        defaultTip: item.defaultTip,
        note: i18nTexts['note' + key] || item.note
      }
    })
    this.setData({
      countryList: translatedList,
      roundOptions: [
        { label: i18nTexts.roundNone, value: 'none' },
        { label: i18nTexts.roundCeil, value: 'ceil' },
        { label: i18nTexts.roundRound, value: 'round' },
        { label: i18nTexts.roundNickel, value: 'nickel' },
        { label: i18nTexts.roundTen, value: 'ten' }
      ]
    })
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
  },

  onBillInput: function(e) {
    this.setData({ billAmount: e.detail.value })
    this.calculate()
  },

  selectTip: function(e) {
    var value = e.currentTarget.dataset.value
    this.setData({
      selectedTip: value,
      isCustomTip: false,
      currentTipPercent: value
    })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  showCustomTip: function() {
    this.setData({ isCustomTip: true })
    wx.vibrateShort({ type: 'light' })
  },

  onCustomTipInput: function(e) {
    var value = parseFloat(e.detail.value) || 0
    this.setData({
      customTipValue: e.detail.value,
      selectedTip: value,
      currentTipPercent: value
    })
    this.calculate()
  },

  increasePeople: function() {
    var count = this.data.peopleCount + 1
    if (count > 20) count = 20
    this.setData({ peopleCount: count })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  decreasePeople: function() {
    var count = this.data.peopleCount - 1
    if (count < 1) count = 1
    this.setData({ peopleCount: count })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  onCountryChange: function(e) {
    var idx = parseInt(e.detail.value)
    var country = TIP_CULTURE[idx]
    this.setData({
      selectedCountryIdx: idx,
      currencySymbol: country.currency,
      currencyCode: country.code,
      selectedTip: country.defaultTip,
      currentTipPercent: country.defaultTip,
      isCustomTip: false
    })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  toggleCountryRef: function() {
    this.setData({ showCountryRef: !this.data.showCountryRef })
  },

  useCountryTip: function(e) {
    var idx = e.currentTarget.dataset.idx
    var country = TIP_CULTURE[idx]
    this.setData({
      selectedCountryIdx: idx,
      currencySymbol: country.currency,
      currencyCode: country.code,
      selectedTip: country.defaultTip,
      currentTipPercent: country.defaultTip,
      isCustomTip: false,
      showCountryRef: false
    })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  onRoundChange: function(e) {
    var mode = e.currentTarget.dataset.value
    this.setData({ roundMode: mode })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  calculate: function() {
    var amount = parseFloat(this.data.billAmount) || 0
    var tipPercent = parseFloat(this.data.currentTipPercent) || 0
    var people = parseInt(this.data.peopleCount) || 1

    var tipAmount = amount * (tipPercent / 100)
    var totalAmount = amount + tipAmount
    var perPerson = totalAmount / people

    var roundMode = this.data.roundMode
    var roundedTotal = ''
    var roundedTip = ''

    if (roundMode !== 'none' && totalAmount > 0) {
      var rt = totalAmount
      if (roundMode === 'ceil') {
        rt = Math.ceil(rt)
      } else if (roundMode === 'round') {
        rt = Math.round(rt)
      } else if (roundMode === 'nickel') {
        rt = Math.ceil(rt / 5) * 5
      } else if (roundMode === 'ten') {
        rt = Math.ceil(rt / 10) * 10
      }
      roundedTotal = rt.toFixed(2)
      roundedTip = (rt - amount).toFixed(2)
    }

    this.setData({
      tipAmount: tipAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalPerPerson: perPerson.toFixed(2),
      roundedTotal: roundedTotal,
      roundedTip: roundedTip
    })
  },

  copyResult: function() {
    wx.vibrateShort({ type: 'light' })
    var sym = this.data.currencySymbol
    var people = this.data.peopleCount
    var t = this.data.i18n
    var text = ''

    if (people > 1) {
      text = t.bill + ': ' + sym + this.data.billAmount + '\n' + t.tip + ' (' + this.data.currentTipPercent + '%): ' + sym + this.data.tipAmount + '\n' + t.totalLabel + ': ' + sym + this.data.totalAmount + '\n' + t.perPersonLabel + ': ' + sym + this.data.totalPerPerson + ' × ' + people + t.personUnit
    } else {
      text = t.bill + ': ' + sym + this.data.billAmount + '\n' + t.tip + ' (' + this.data.currentTipPercent + '%): ' + sym + this.data.tipAmount + '\n' + t.totalLabel + ': ' + sym + this.data.totalAmount
    }
    if (this.data.roundedTotal) {
      text += '\n' + t.roundedAfter + ': ' + sym + this.data.roundedTotal + ' (' + t.tipLabel + sym + this.data.roundedTip + ')'
    }

    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: t.copiedToClipboard, icon: 'success' })
      }
    })
  },

  resetCalculator: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      billAmount: '',
      selectedTip: 18,
      isCustomTip: false,
      customTipValue: '',
      peopleCount: 1,
      currentTipPercent: 18,
      tipAmount: '0.00',
      totalAmount: '0.00',
      totalPerPerson: '0.00',
      roundMode: 'none',
      roundedTotal: '',
      roundedTip: ''
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.resetCalculator()
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('小费计算器 - 百宝工具箱', '/package-calculator/tip-calculator/tip-calculator', '快速计算小费金额，支持多人AA分摊')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('小费计算器 - 小费AA分摊计算')
  }
})
