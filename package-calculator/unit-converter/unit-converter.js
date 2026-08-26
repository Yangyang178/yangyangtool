var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var logger = require('../../utils/logger.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var FAVORITES_KEY = 'unit_converter_favorites'
var RECENT_KEY = 'unit_converter_recent'

var UNITS_DATA = {
  length: [
    { name: '光年', factor: 9.461e15 },
    { name: '千米', factor: 1000 },
    { name: '米', factor: 1 },
    { name: '分米', factor: 0.1 },
    { name: '厘米', factor: 0.01 },
    { name: '毫米', factor: 0.001 },
    { name: '微米', factor: 0.000001 },
    { name: '纳米', factor: 1e-9 },
    { name: '英寸', factor: 0.0254 },
    { name: '英尺', factor: 0.3048 },
    { name: '码', factor: 0.9144 },
    { name: '英里', factor: 1609.344 },
    { name: '海里', factor: 1852 },
    { name: '市尺', factor: 0.333333 },
    { name: '市寸', factor: 0.0333333 }
  ],
  weight: [
    { name: '公吨', factor: 1000000 },
    { name: '吨', factor: 1000 },
    { name: '千克', factor: 1 },
    { name: '克', factor: 0.001 },
    { name: '毫克', factor: 0.000001 },
    { name: '微克', factor: 1e-9 },
    { name: '斤', factor: 0.5 },
    { name: '两', factor: 0.05 },
    { name: '钱', factor: 0.005 },
    { name: '磅', factor: 0.453592 },
    { name: '盎司', factor: 0.0283495 },
    { name: '格令', factor: 0.0000647989 },
    { name: '克拉', factor: 0.0002 },
    { name: '原子质量单位', factor: 1.66054e-27 }
  ],
  temperature: [
    { name: '摄氏度', type: 'celsius' },
    { name: '华氏度', type: 'fahrenheit' },
    { name: '开尔文', type: 'kelvin' },
    { name: '兰氏度', type: 'rankine' }
  ],
  area: [
    { name: '平方千米', factor: 1000000 },
    { name: '公顷', factor: 10000 },
    { name: '公亩', factor: 100 },
    { name: '亩', factor: 666.667 },
    { name: '平方米', factor: 1 },
    { name: '平方分米', factor: 0.01 },
    { name: '平方厘米', factor: 0.0001 },
    { name: '平方毫米', factor: 0.000001 },
    { name: '平方英尺', factor: 0.092903 },
    { name: '平方英寸', factor: 0.00064516 },
    { name: '平方码', factor: 0.836127 },
    { name: '英亩', factor: 4046.86 },
    { name: '平方英里', factor: 2589988 },
    { name: '顷', factor: 66666.7 }
  ],
  volume: [
    { name: '立方米', factor: 1 },
    { name: '升', factor: 0.001 },
    { name: '毫升', factor: 0.000001 },
    { name: '加仑(美)', factor: 0.00378541 },
    { name: '加仑(英)', factor: 0.00454609 },
    { name: '品脱(美)', factor: 0.000473176 },
    { name: '夸脱(美)', factor: 0.000946353 },
    { name: '液量盎司(美)', factor: 0.0000295735 },
    { name: '桶(石油)', factor: 0.158987 },
    { name: '杯(美)', factor: 0.000236588 },
    { name: '汤匙(美)', factor: 0.0000147868 },
    { name: '茶匙(美)', factor: 0.00000492892 }
  ],
  time: [
    { name: '世纪', factor: 3153600000 },
    { name: '十年', factor: 315360000 },
    { name: '年(365天)', factor: 31536000 },
    { name: '月(30天)', factor: 2592000 },
    { name: '周', factor: 604800 },
    { name: '天', factor: 86400 },
    { name: '小时', factor: 3600 },
    { name: '分钟', factor: 60 },
    { name: '秒', factor: 1 },
    { name: '毫秒', factor: 0.001 },
    { name: '微秒', factor: 0.000001 },
    { name: '纳秒', factor: 1e-9 },
    { name: '皮秒', factor: 1e-12 }
  ],
  speed: [
    { name: '光速', factor: 299792458 },
    { name: '马赫(20℃)', factor: 343 },
    { name: '千米/时', factor: 0.277778 },
    { name: '米/秒', factor: 1 },
    { name: '米/分', factor: 0.0166667 },
    { name: '厘米/秒', factor: 0.01 },
    { name: '公里/秒', factor: 1000 },
    { name: '英里/时', factor: 0.44704 },
    { name: '英尺/秒', factor: 0.3048 },
    { name: '节(海里/时)', factor: 0.514444 },
    { name: '英寸/秒', factor: 0.0254 }
  ],
  data: [
    { name: '字节(B)', factor: 1 },
    { name: '千字节(KB)', factor: 1024 },
    { name: '兆字节(MB)', factor: 1048576 },
    { name: '吉字节(GB)', factor: 1073741824 },
    { name: '太字节(TB)', factor: 1099511627776 },
    { name: '拍字节(PB)', factor: 1125899906842624 },
    { name: '艾字节(EB)', factor: 1152921504606846976 },
    { name: '比特(bit)', factor: 0.125 },
    { name: '千比特(Kb)', factor: 128 },
    { name: '兆比特(Mb)', factor: 131072 },
    { name: '吉比特(Gb)', factor: 134217728 }
  ],
  pressure: [
    { name: '帕斯卡(Pa)', factor: 1 },
    { name: '千帕(kPa)', factor: 1000 },
    { name: '兆帕(MPa)', factor: 1000000 },
    { name: '巴(bar)', factor: 100000 },
    { name: '毫巴(mbar)', factor: 100 },
    { name: '标准大气压(atm)', factor: 101325 },
    { name: '工程大气压(at)', factor: 98066.5 },
    { name: '磅/平方英寸(psi)', factor: 6894.76 },
    { name: '毫米汞柱(mmHg)', factor: 133.322 },
    { name: '厘米水柱(cmH2O)', factor: 98.0665 },
    { name: '托(Torr)', factor: 133.322 }
  ],
  energy: [
    { name: '焦耳(J)', factor: 1 },
    { name: '千焦(kJ)', factor: 1000 },
    { name: '兆焦(MJ)', factor: 1000000 },
    { name: '卡路里(cal)', factor: 4.184 },
    { name: '千卡(kcal)', factor: 4184 },
    { name: '千瓦时(kWh)', factor: 3600000 },
    { name: '瓦时(Wh)', factor: 3600 },
    { name: '电子伏特(eV)', factor: 1.60219e-19 },
    { name: '英热单位(BTU)', factor: 1055.06 },
    { name: '英尺-磅(ft·lbf)', factor: 1.35582 },
    { name: '尔格(erg)', factor: 1e-7 },
    { name: '吨TNT当量', factor: 4184000000 }
  ],
  fuel: [
    { name: 'L/100km', factor: 1 },
    { name: 'km/L', factor: 100 },
    { name: 'MPG(美)', factor: 42.517 },
    { name: 'MPG(英)', factor: 35.406 },
    { name: '英里/英制加仑', factor: 35.406 },
    { name: '英里/美制加仑', factor: 42.517 }
  ],
  power: [
    { name: '瓦特(W)', factor: 1 },
    { name: '千瓦(kW)', factor: 1000 },
    { name: '兆瓦(MW)', factor: 1000000 },
    { name: '马力(公制)', factor: 735.499 },
    { name: '马力(英制)', factor: 745.7 },
    { name: '英热单位/时(BTU/h)', factor: 0.293071 },
    { name: '焦耳/秒(J/s)', factor: 1 },
    { name: '千卡/分(kcal/min)', factor: 69.7333 },
    { name: '英尺-磅/秒(ft·lbf/s)', factor: 1.35582 }
  ],
  angle: [
    { name: '度(°)', factor: 1 },
    { name: '弧度(rad)', factor: 57.2958 },
    { name: '梯度(grad)', factor: 0.9 },
    { name: '角分(\')', factor: 0.0166667 },
    { name: '角秒(")', factor: 0.000277778 },
    { name: '圈(turn)', factor: 360 },
    { name: '毫弧度(mrad)', factor: 0.0572958 }
  ]
}

var CONVERSION_LISTS = {
  length: [
    { from: '1 千米', to: '1000 米' },
    { from: '1 米', to: '100 厘米' },
    { from: '1 英寸', to: '2.54 厘米' },
    { from: '1 英尺', to: '0.3048 米' },
    { from: '1 海里', to: '1.852 千米' }
  ],
  weight: [
    { from: '1 千克', to: '1000 克' },
    { from: '1 斤', to: '500 克' },
    { from: '1 磅', to: '453.59 克' },
    { from: '1 吨', to: '1000 千克' },
    { from: '1 盎司', to: '28.35 克' }
  ],
  temperature: [
    { from: '0°C', to: '32°F' },
    { from: '100°C', to: '212°F' },
    { from: '0°C', to: '273.15K' },
    { from: '-273.15°C', to: '0K' },
    { from: '37°C', to: '98.6°F (体温)' }
  ],
  area: [
    { from: '1 公顷', to: '10000 平方米' },
    { from: '1 亩', to: '666.67 平方米' },
    { from: '1 平方千米', to: '100 公顷' },
    { from: '1 平方英里', to: '2.59 平方千米' },
    { from: '1 英亩', to: '4046.86 平方米' }
  ],
  volume: [
    { from: '1 升', to: '1000 毫升' },
    { from: '1 加仑(美)', to: '3.78541 升' },
    { from: '1 桶(石油)', to: '158.987 升' },
    { from: '1 立方米', to: '1000 升' },
    { from: '1 杯(美)', to: '236.588 毫升' }
  ],
  time: [
    { from: '1 天', to: '24 小时' },
    { from: '1 小时', to: '60 分钟' },
    { from: '1 分钟', to: '60 秒' },
    { from: '1 年(365天)', to: '8760 小时' },
    { from: '1 周', to: '168 小时' }
  ],
  speed: [
    { from: '100 千米/时', to: '27.78 米/秒' },
    { from: '60 英里/时', to: '96.56 千米/时' },
    { from: '1 马赫(20°C)', to: '343 米/秒' },
    { from: '1 节', to: '1.852 千米/时' },
    { from: '光速', to: '299,792,458 米/秒' }
  ],
  data: [
    { from: '1 GB', to: '1024 MB' },
    { from: '1 MB', to: '1024 KB' },
    { from: '1 KB', to: '1024 字节' },
    { from: '1 TB', to: '1024 GB' },
    { from: '8 bit', to: '1 字节' }
  ],
  pressure: [
    { from: '1 标准大气压', to: '101.325 kPa' },
    { from: '1 巴(bar)', to: '100 kPa' },
    { from: '1 psi', to: '6.89476 kPa' },
    { from: '760 mmHg', to: '1 标准大气压' },
    { from: '1 工程大气压', to: '98.0665 kPa' }
  ],
  energy: [
    { from: '1 kWh', to: '3.6 MJ' },
    { from: '1 kcal', to: '4184 J' },
    { from: '1 BTU', to: '1055.06 J' },
    { from: '1 电子伏特(eV)', to: '1.602×10⁻¹⁹ J' },
    { from: '1 吨 TNT 当量', to: '4.184 GJ' }
  ]
}

Page({
  data: {
    i18n: {},
    currentCategory: 'length',
    inputValue: '',
    resultValue: '0',
    fromUnit: '米',
    toUnit: '厘米',
    showTable: true,
    showUnitPicker: false,
    pickerType: 'from',
    currentUnits: [],
    favorites: [],
    recentUsed: [],
    showFavorites: false,
    showRecent: false,
    exchangeRate: null,
    exchangeLoading: false,
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    categories: [
      { id: 'length', name: '长度', icon: '📏' },
      { id: 'weight', name: '重量', icon: '⚖️' },
      { id: 'temperature', name: '温度', icon: '🌡️' },
      { id: 'area', name: '面积', icon: '⬜' },
      { id: 'volume', name: '体积', icon: '🧊' },
      { id: 'time', name: '时间', icon: '⏰' },
      { id: 'speed', name: '速度', icon: '💨' },
      { id: 'data', name: '数据', icon: '💾' },
      { id: 'pressure', name: '压强', icon: '🔵' },
      { id: 'energy', name: '能量', icon: '⚡' },
      { id: 'power', name: '功率', icon: '🔌' },
      { id: 'fuel', name: '油耗', icon: '⛽' },
      { id: 'angle', name: '角度', icon: '📐' }
    ],
    conversionList: [],
    isLoading: true
  },

  onLoad: function() {
    this.setData({ i18n: i18n.getToolPageTexts('unit') })
    var i18nTexts = this.data.i18n
    this.setData({
      categories: [
        { id: 'length', name: i18nTexts.catLength, icon: '📏' },
        { id: 'weight', name: i18nTexts.catWeight, icon: '⚖️' },
        { id: 'temperature', name: i18nTexts.catTemperature, icon: '🌡️' },
        { id: 'area', name: i18nTexts.catArea, icon: '⬜' },
        { id: 'volume', name: i18nTexts.catVolume, icon: '🧊' },
        { id: 'time', name: i18nTexts.catTime, icon: '⏰' },
        { id: 'speed', name: i18nTexts.catSpeed, icon: '💨' },
        { id: 'data', name: i18nTexts.catData, icon: '💾' },
        { id: 'pressure', name: i18nTexts.catPressure, icon: '🔵' },
        { id: 'energy', name: i18nTexts.catEnergy, icon: '⚡' },
        { id: 'power', name: i18nTexts.catPower, icon: '🔌' },
        { id: 'fuel', name: i18nTexts.catFuel, icon: '⛽' },
        { id: 'angle', name: i18nTexts.catAngle, icon: '📐' }
      ]
    })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('单位换算')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    this.updateConversionList()
    this.calculate()
    this._loadFavorites()
    this._loadRecent()
    this._loadExchangeRate()
    poster.setupForPage(this, 2)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    this.setData({ i18n: i18n.getToolPageTexts('unit') })
    var i18nTexts = this.data.i18n
    this.setData({
      categories: [
        { id: 'length', name: i18nTexts.catLength, icon: '📏' },
        { id: 'weight', name: i18nTexts.catWeight, icon: '⚖️' },
        { id: 'temperature', name: i18nTexts.catTemperature, icon: '🌡️' },
        { id: 'area', name: i18nTexts.catArea, icon: '⬜' },
        { id: 'volume', name: i18nTexts.catVolume, icon: '🧊' },
        { id: 'time', name: i18nTexts.catTime, icon: '⏰' },
        { id: 'speed', name: i18nTexts.catSpeed, icon: '💨' },
        { id: 'data', name: i18nTexts.catData, icon: '💾' },
        { id: 'pressure', name: i18nTexts.catPressure, icon: '🔵' },
        { id: 'energy', name: i18nTexts.catEnergy, icon: '⚡' },
        { id: 'power', name: i18nTexts.catPower, icon: '🔌' },
        { id: 'fuel', name: i18nTexts.catFuel, icon: '⛽' },
        { id: 'angle', name: i18nTexts.catAngle, icon: '📐' }
      ]
    })
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
  },

  onCategoryChange: function(e) {
    var categoryId = e.currentTarget.dataset.id
    var category = UNITS_DATA[categoryId]
    if (!category || category.length === 0) return
    var firstUnit = category[0].name || category[0].type || ''
    var secondUnit = category[1] ? (category[1].name || category[1].type) : firstUnit
    this.setData({
      currentCategory: categoryId,
      fromUnit: firstUnit,
      toUnit: secondUnit,
      inputValue: '',
      resultValue: '0'
    })
    this.updateConversionList()
    wx.vibrateShort({ type: 'light' })
  },

  onInput: function(e) {
    var value = e.detail.value
    this.setData({ inputValue: value })
    this.calculate()
  },

  showFromUnit: function() {
    var units = UNITS_DATA[this.data.currentCategory]
    if (!units || units.length === 0) {
      wx.showToast({ title: this.data.i18n.noUnits, icon: 'none' })
      return
    }
    this.setData({ showUnitPicker: true, pickerType: 'from', currentUnits: units })
    wx.vibrateShort({ type: 'light' })
  },

  showToUnit: function() {
    var units = UNITS_DATA[this.data.currentCategory]
    if (!units || units.length === 0) {
      wx.showToast({ title: this.data.i18n.noUnits, icon: 'none' })
      return
    }
    this.setData({ showUnitPicker: true, pickerType: 'to', currentUnits: units })
    wx.vibrateShort({ type: 'light' })
  },

  hideUnitPicker: function() {
    this.setData({ showUnitPicker: false })
  },

  selectUnit: function(e) {
    var unitName = e.currentTarget.dataset.name
    if (this.data.pickerType === 'from') {
      this.setData({ fromUnit: unitName })
    } else {
      this.setData({ toUnit: unitName })
    }
    this.hideUnitPicker()
    this.calculate()
  },

  swapUnits: function() {
    wx.vibrateShort({ type: 'light' })
    var temp = this.data.fromUnit
    this.setData({ fromUnit: this.data.toUnit, toUnit: temp })
    this.calculate()
  },

  _findUnit: function(category, unitName) {
    for (var i = 0; i < category.length; i++) {
      if ((category[i].name || category[i].type) === unitName) return category[i]
    }
    return null
  },

  calculate: function() {
    if (!this.data.inputValue || parseFloat(this.data.inputValue) === 0) {
      this.setData({ resultValue: '0' })
      return
    }
    var value = parseFloat(this.data.inputValue)
    var category = UNITS_DATA[this.data.currentCategory]
    if (!category) return

    if (this.data.currentCategory === 'temperature') {
      this.calculateTemperature(value)
    } else {
      var fromUnit = this._findUnit(category, this.data.fromUnit)
      var toUnit = this._findUnit(category, this.data.toUnit)
      if (fromUnit && toUnit && typeof fromUnit.factor !== 'undefined' && typeof toUnit.factor !== 'undefined') {
        if (toUnit.factor === 0) {
          this.setData({ resultValue: this.data.i18n.divByZero })
          return
        }
        var result = (value * fromUnit.factor / toUnit.factor).toFixed(4)
        this.setData({ resultValue: result.replace(/\.?0+$/, '') })
        this._addRecent()
        var tracker = getApp().tracker
        if (tracker) tracker.toolUse(2, '单位换算', false)
      } else {
        this.setData({ resultValue: this.data.i18n.convertFailed })
      }
    }
  },

  calculateTemperature: function(value) {
    var result = 0
    if (this.data.fromUnit === '摄氏度') {
      if (this.data.toUnit === '华氏度') result = value * 9 / 5 + 32
      else if (this.data.toUnit === '开尔文') result = value + 273.15
      else if (this.data.toUnit === '兰氏度') result = (value + 273.15) * 9 / 5
      else result = value
    } else if (this.data.fromUnit === '华氏度') {
      if (this.data.toUnit === '摄氏度') result = (value - 32) * 5 / 9
      else if (this.data.toUnit === '开尔文') result = (value - 32) * 5 / 9 + 273.15
      else if (this.data.toUnit === '兰氏度') result = value + 459.67
      else result = value
    } else if (this.data.fromUnit === '开尔文') {
      if (this.data.toUnit === '摄氏度') result = value - 273.15
      else if (this.data.toUnit === '华氏度') result = (value - 273.15) * 9 / 5 + 32
      else if (this.data.toUnit === '兰氏度') result = value * 9 / 5
      else result = value
    } else {
      if (this.data.toUnit === '摄氏度') result = (value - 491.67) * 5 / 9
      else if (this.data.toUnit === '华氏度') result = value - 459.67
      else if (this.data.toUnit === '开尔文') result = value * 5 / 9
      else result = value
    }
    this.setData({ resultValue: result.toFixed(2) })
    this._addRecent()
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(2, '单位换算', false)
  },

  updateConversionList: function() {
    this.setData({ conversionList: CONVERSION_LISTS[this.data.currentCategory] || [] })
  },

  copyResult: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    var text = this.data.inputValue + ' ' + this.data.fromUnit + ' = ' + this.data.resultValue + ' ' + this.data.toUnit
    wx.setClipboardData({
      data: text,
      success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  addFavorite: function() {
    var pair = {
      category: this.data.currentCategory,
      fromUnit: this.data.fromUnit,
      toUnit: this.data.toUnit,
      label: this.data.fromUnit + ' → ' + this.data.toUnit
    }
    var favs = this.data.favorites.slice()
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].category === pair.category && favs[i].fromUnit === pair.fromUnit && favs[i].toUnit === pair.toUnit) {
        wx.showToast({ title: this.data.i18n.alreadyFav, icon: 'none' })
        return
      }
    }
    if (favs.length >= 20) {
      wx.showToast({ title: this.data.i18n.maxFav, icon: 'none' })
      return
    }
    favs.unshift(pair)
    this.setData({ favorites: favs })
    this._saveFavorites(favs)
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: this.data.i18n.favAdded, icon: 'success' })
  },

  removeFavorite: function(e) {
    var idx = e.currentTarget.dataset.index
    var favs = this.data.favorites.slice()
    favs.splice(idx, 1)
    this.setData({ favorites: favs })
    this._saveFavorites(favs)
    wx.vibrateShort({ type: 'light' })
  },

  useFavorite: function(e) {
    var idx = e.currentTarget.dataset.index
    var fav = this.data.favorites[idx]
    if (!fav) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      currentCategory: fav.category,
      fromUnit: fav.fromUnit,
      toUnit: fav.toUnit,
      showFavorites: false
    })
    this.updateConversionList()
    this.calculate()
  },

  toggleFavorites: function() {
    this.setData({ showFavorites: !this.data.showFavorites, showRecent: false })
  },

  _loadFavorites: function() {
    var favs = storageUtil.safeGetArray(FAVORITES_KEY)
    if (favs && favs.length > 0) this.setData({ favorites: favs })
  },

  _saveFavorites: function(favs) {
    try { storageUtil.safeSet(FAVORITES_KEY, favs) } catch (e) {}
  },

  toggleRecent: function() {
    this.setData({ showRecent: !this.data.showRecent, showFavorites: false })
  },

  useRecent: function(e) {
    var idx = e.currentTarget.dataset.index
    var item = this.data.recentUsed[idx]
    if (!item) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      currentCategory: item.category,
      fromUnit: item.fromUnit,
      toUnit: item.toUnit,
      inputValue: item.inputValue || '',
      showRecent: false
    })
    this.updateConversionList()
    this.calculate()
  },

  clearRecent: function() {
    this.setData({ recentUsed: [] })
    try { wx.removeStorageSync(RECENT_KEY) } catch (e) {}
    wx.vibrateShort({ type: 'light' })
  },

  _addRecent: function() {
    var item = {
      category: this.data.currentCategory,
      fromUnit: this.data.fromUnit,
      toUnit: this.data.toUnit,
      inputValue: this.data.inputValue,
      time: this._formatTime(new Date())
    }
    var recent = this.data.recentUsed.slice()
    for (var i = 0; i < recent.length; i++) {
      if (recent[i].category === item.category && recent[i].fromUnit === item.fromUnit && recent[i].toUnit === item.toUnit) {
        recent.splice(i, 1)
        break
      }
    }
    recent.unshift(item)
    if (recent.length > 10) recent = recent.slice(0, 10)
    this.setData({ recentUsed: recent })
    try { storageUtil.safeSet(RECENT_KEY, recent) } catch (e) {}
  },

  _loadRecent: function() {
    var recent = storageUtil.safeGetArray(RECENT_KEY)
    if (recent && recent.length > 0) this.setData({ recentUsed: recent })
  },

  _formatTime: function(date) {
    var h = date.getHours()
    var m = date.getMinutes()
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m
  },

  _loadExchangeRate: function() {
    var cached = storageUtil.get('cachedRates', null)
    if (!cached) return
    var rates = {}
    var quickRates = cached.quickRates
    if (quickRates && quickRates.length > 0) {
      for (var i = 0; i < quickRates.length; i++) {
        var q = quickRates[i]
        if (q.code === 'USD' || q.code === 'EUR' || q.code === 'JPY' || q.code === 'GBP') {
          rates[q.code] = q.rate
        }
      }
    }
    if (Object.keys(rates).length > 0) {
      var updateTime = ''
      if (cached.cachedAt) {
        var d = new Date(cached.cachedAt)
        var month = d.getMonth() + 1
        var day = d.getDate()
        var hour = d.getHours()
        var min = d.getMinutes()
        updateTime = (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day + ' ' + (hour < 10 ? '0' : '') + hour + ':' + (min < 10 ? '0' : '') + min
      }
      this.setData({
        exchangeRate: {
          base: 'CNY',
          updateTime: updateTime,
          rates: rates
        }
      })
    }
  },

  goToExchangeRate: function() {
    wx.vibrateShort({ type: 'light' })
    wx.navigateTo({ url: '/package-calculator/exchange-rate/exchange-rate' })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({ inputValue: '', resultValue: '0' })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('单位换算 - 百宝工具箱', '/package-calculator/unit-converter/unit-converter', '长度重量温度等多单位互换')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('单位换算 - 长度重量温度多单位互换')
  }
})
