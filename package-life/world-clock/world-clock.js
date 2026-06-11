var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var logger = require('../../utils/logger.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var allCities = [
  { id: 'beijing', city: '北京', cityEn: 'Beijing', country: '中国', countryEn: 'China', emoji: '🏛️', timezone: 'UTC+8', offset: 8, dst: false },
  { id: 'shanghai', city: '上海', cityEn: 'Shanghai', country: '中国', countryEn: 'China', emoji: '🌃', timezone: 'UTC+8', offset: 8, dst: false },
  { id: 'tokyo', city: '东京', cityEn: 'Tokyo', country: '日本', countryEn: 'Japan', emoji: '🗼', timezone: 'UTC+9', offset: 9, dst: false },
  { id: 'seoul', city: '首尔', cityEn: 'Seoul', country: '韩国', countryEn: 'South Korea', emoji: '🏯', timezone: 'UTC+9', offset: 9, dst: false },
  { id: 'singapore', city: '新加坡', cityEn: 'Singapore', country: '新加坡', countryEn: 'Singapore', emoji: '🌴', timezone: 'UTC+8', offset: 8, dst: false },
  { id: 'hongkong', city: '香港', cityEn: 'Hong Kong', country: '中国', countryEn: 'China', emoji: '🌉', timezone: 'UTC+8', offset: 8, dst: false },
  { id: 'taipei', city: '台北', cityEn: 'Taipei', country: '中国台湾', countryEn: 'Taiwan(China)', emoji: '🏙️', timezone: 'UTC+8', offset: 8, dst: false },
  { id: 'bangkok', city: '曼谷', cityEn: 'Bangkok', country: '泰国', countryEn: 'Thailand', emoji: '🛕', timezone: 'UTC+7', offset: 7, dst: false },
  { id: 'dubai', city: '迪拜', cityEn: 'Dubai', country: '阿联酋', countryEn: 'UAE', emoji: '🏜️', timezone: 'UTC+4', offset: 4, dst: false },
  { id: 'moscow', city: '莫斯科', cityEn: 'Moscow', country: '俄罗斯', countryEn: 'Russia', emoji: '🏰', timezone: 'UTC+3', offset: 3, dst: false },
  { id: 'london', city: '伦敦', cityEn: 'London', country: '英国', countryEn: 'UK', emoji: '🎡', timezone: 'UTC+0', offset: 0, dst: true, dstOffset: 1, dstStart: '3月最后一个周日', dstStartEn: 'Last Sun in Mar', dstEnd: '10月最后一个周日', dstEndEn: 'Last Sun in Oct' },
  { id: 'paris', city: '巴黎', cityEn: 'Paris', country: '法国', countryEn: 'France', emoji: '🗼', timezone: 'UTC+1', offset: 1, dst: true, dstOffset: 1, dstStart: '3月最后一个周日', dstStartEn: 'Last Sun in Mar', dstEnd: '10月最后一个周日', dstEndEn: 'Last Sun in Oct' },
  { id: 'berlin', city: '柏林', cityEn: 'Berlin', country: '德国', countryEn: 'Germany', emoji: '⛪', timezone: 'UTC+1', offset: 1, dst: true, dstOffset: 1, dstStart: '3月最后一个周日', dstStartEn: 'Last Sun in Mar', dstEnd: '10月最后一个周日', dstEndEn: 'Last Sun in Oct' },
  { id: 'rome', city: '罗马', cityEn: 'Rome', country: '意大利', countryEn: 'Italy', emoji: '🏟️', timezone: 'UTC+1', offset: 1, dst: true, dstOffset: 1, dstStart: '3月最后一个周日', dstStartEn: 'Last Sun in Mar', dstEnd: '10月最后一个周日', dstEndEn: 'Last Sun in Oct' },
  { id: 'amsterdam', city: '阿姆斯特丹', cityEn: 'Amsterdam', country: '荷兰', countryEn: 'Netherlands', emoji: '🚲', timezone: 'UTC+1', offset: 1, dst: true, dstOffset: 1, dstStart: '3月最后一个周日', dstStartEn: 'Last Sun in Mar', dstEnd: '10月最后一个周日', dstEndEn: 'Last Sun in Oct' },
  { id: 'newyork', city: '纽约', cityEn: 'New York', country: '美国', countryEn: 'USA', emoji: '🗽', timezone: 'UTC-5', offset: -5, dst: true, dstOffset: 1, dstStart: '3月第二个周日', dstStartEn: '2nd Sun in Mar', dstEnd: '11月第一个周日', dstEndEn: '1st Sun in Nov' },
  { id: 'losangeles', city: '洛杉矶', cityEn: 'Los Angeles', country: '美国', countryEn: 'USA', emoji: '🎬', timezone: 'UTC-8', offset: -8, dst: true, dstOffset: 1, dstStart: '3月第二个周日', dstStartEn: '2nd Sun in Mar', dstEnd: '11月第一个周日', dstEndEn: '1st Sun in Nov' },
  { id: 'chicago', city: '芝加哥', cityEn: 'Chicago', country: '美国', countryEn: 'USA', emoji: '🌆', timezone: 'UTC-6', offset: -6, dst: true, dstOffset: 1, dstStart: '3月第二个周日', dstStartEn: '2nd Sun in Mar', dstEnd: '11月第一个周日', dstEndEn: '1st Sun in Nov' },
  { id: 'sanfrancisco', city: '旧金山', cityEn: 'San Francisco', country: '美国', countryEn: 'USA', emoji: '🌉', timezone: 'UTC-8', offset: -8, dst: true, dstOffset: 1, dstStart: '3月第二个周日', dstStartEn: '2nd Sun in Mar', dstEnd: '11月第一个周日', dstEndEn: '1st Sun in Nov' },
  { id: 'toronto', city: '多伦多', cityEn: 'Toronto', country: '加拿大', countryEn: 'Canada', emoji: '🍁', timezone: 'UTC-5', offset: -5, dst: true, dstOffset: 1, dstStart: '3月第二个周日', dstStartEn: '2nd Sun in Mar', dstEnd: '11月第一个周日', dstEndEn: '1st Sun in Nov' },
  { id: 'vancouver', city: '温哥华', cityEn: 'Vancouver', country: '加拿大', countryEn: 'Canada', emoji: '🏔️', timezone: 'UTC-8', offset: -8, dst: true, dstOffset: 1, dstStart: '3月第二个周日', dstStartEn: '2nd Sun in Mar', dstEnd: '11月第一个周日', dstEndEn: '1st Sun in Nov' },
  { id: 'sydney', city: '悉尼', cityEn: 'Sydney', country: '澳大利亚', countryEn: 'Australia', emoji: '🦘', timezone: 'UTC+11', offset: 11, dst: true, dstOffset: 1, dstStart: '10月第一个周日', dstStartEn: '1st Sun in Oct', dstEnd: '4月第一个周日', dstEndEn: '1st Sun in Apr' },
  { id: 'melbourne', city: '墨尔本', cityEn: 'Melbourne', country: '澳大利亚', countryEn: 'Australia', emoji: '🎭', timezone: 'UTC+11', offset: 11, dst: true, dstOffset: 1, dstStart: '10月第一个周日', dstStartEn: '1st Sun in Oct', dstEnd: '4月第一个周日', dstEndEn: '1st Sun in Apr' },
  { id: 'auckland', city: '奥克兰', cityEn: 'Auckland', country: '新西兰', countryEn: 'New Zealand', emoji: '🥝', timezone: 'UTC+13', offset: 13, dst: true, dstOffset: 1, dstStart: '9月最后一个周日', dstStartEn: 'Last Sun in Sep', dstEnd: '4月第一个周日', dstEndEn: '1st Sun in Apr' },
  { id: 'mumbai', city: '孟买', cityEn: 'Mumbai', country: '印度', countryEn: 'India', emoji: '🕌', timezone: 'UTC+5:30', offset: 5.5, dst: false },
  { id: 'cairo', city: '开罗', cityEn: 'Cairo', country: '埃及', countryEn: 'Egypt', emoji: '🐪', timezone: 'UTC+2', offset: 2, dst: false },
  { id: 'johannesburg', city: '约翰内斯堡', cityEn: 'Johannesburg', country: '南非', countryEn: 'South Africa', emoji: '🦁', timezone: 'UTC+2', offset: 2, dst: false },
  { id: 'saopaulo', city: '圣保罗', cityEn: 'São Paulo', country: '巴西', countryEn: 'Brazil', emoji: '☀️', timezone: 'UTC-3', offset: -3, dst: true, dstOffset: 1, dstStart: '11月第一个周日', dstStartEn: '1st Sun in Nov', dstEnd: '2月第三个周日', dstEndEn: '3rd Sun in Feb' },
  { id: 'mexicocity', city: '墨西哥城', cityEn: 'Mexico City', country: '墨西哥', countryEn: 'Mexico', emoji: '🌮', timezone: 'UTC-6', offset: -6, dst: false },
  { id: 'buenosaires', city: '布宜诺斯艾利斯', cityEn: 'Buenos Aires', country: '阿根廷', countryEn: 'Argentina', emoji: '💃', timezone: 'UTC-3', offset: -3, dst: false }
]

Page({
  data: {
    i18n: {},
    allCities: [],
    localTime: '',
    localDate: '',
    localOffset: '+8',
    localWeekday: '',
    cityList: [],
    showCityPicker: false,
    searchKeyword: '',
    filteredCities: allCities,
    popularCities: [
      { id: 'tokyo', city: '东京', cityEn: 'Tokyo', emoji: '🗼' },
      { id: 'newyork', city: '纽约', cityEn: 'New York', emoji: '🗽' },
      { id: 'london', city: '伦敦', cityEn: 'London', emoji: '🎡' },
      { id: 'paris', city: '巴黎', cityEn: 'Paris', emoji: '🗼' },
      { id: 'sydney', city: '悉尼', cityEn: 'Sydney', emoji: '🦘' },
      { id: 'dubai', city: '迪拜', cityEn: 'Dubai', emoji: '🏜️' },
      { id: 'singapore', city: '新加坡', cityEn: 'Singapore', emoji: '🌴' },
      { id: 'seoul', city: '首尔', cityEn: 'Seoul', emoji: '🏯' }
    ],
    timeUpdateTimer: null,

    showTimeSlider: false,
    sliderHour: 0,
    sliderMinute: 0,
    sliderValue: 0,
    sliderLabel: '',
    sliderCityList: [],
    isSliderMode: false,

    showMeeting: false,
    meetingResults: [],
    workStart: 9,
    workEnd: 18,
    bestMeetingTime: '',
    bestMeetingScore: 0,
    totalWorkSlots: 0,
    bestReason: '',

    dstAlerts: [],

    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  _updateI18nData: function() {
    var isEn = i18n.getLanguage() === 'en'
    var updatedAllCities = []
    for (var i = 0; i < allCities.length; i++) {
      var c = {}
      for (var key in allCities[i]) { c[key] = allCities[i][key] }
      if (isEn) {
        c.city = c.cityEn || c.city
        c.country = c.countryEn || c.country
      }
      updatedAllCities.push(c)
    }
    var updatedPopular = []
    for (var pi = 0; pi < this.data.popularCities.length; pi++) {
      var pc = {}
      for (var pkey in this.data.popularCities[pi]) { pc[pkey] = this.data.popularCities[pi][pkey] }
      if (isEn) {
        pc.city = pc.cityEn || pc.city
      }
      updatedPopular.push(pc)
    }
    var updateData = {
      filteredCities: updatedAllCities,
      popularCities: updatedPopular
    }
    if (this.data.cityList && this.data.cityList.length > 0) {
      var updatedCityList = []
      for (var ci = 0; ci < this.data.cityList.length; ci++) {
        var cl = {}
        for (var ck in this.data.cityList[ci]) { cl[ck] = this.data.cityList[ci][ck] }
        if (isEn) {
          var foundCity = null
          for (var fi = 0; fi < allCities.length; fi++) {
            if (allCities[fi].id === cl.id) { foundCity = allCities[fi]; break }
          }
          if (foundCity) {
            cl.city = foundCity.cityEn || foundCity.city
            cl.country = foundCity.countryEn || foundCity.country
          }
        }
        updatedCityList.push(cl)
      }
      updateData.cityList = updatedCityList
    }
    this.setData(updateData)
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('世界时钟')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('worldClock') })
    this.updateLocalTime()
    this.loadSavedCities()
    this._updateI18nData()
    this.startTimer()
    this._checkDST()
    poster.setupForPage(this, 15)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('worldClock') })
    this._updateI18nData()
    if (!this.data.timeUpdateTimer) {
      this.startTimer()
    }
  },

  onHide: function() {
    this.stopTimer()
  },

  onUnload: function() {
    this.stopTimer()
  },

  startTimer: function() {
    var that = this
    that.updateLocalTime()
    that.updateAllTimes()
    that.data.timeUpdateTimer = setInterval(function() {
      that.updateLocalTime()
      that.updateAllTimes()
    }, 1000)
  },

  stopTimer: function() {
    if (this.data.timeUpdateTimer) {
      clearInterval(this.data.timeUpdateTimer)
      this.setData({ timeUpdateTimer: null })
    }
  },

  updateLocalTime: function() {
    var now = new Date()
    var hours = String(now.getHours())
    hours = hours.length === 1 ? '0' + hours : hours
    var minutes = String(now.getMinutes())
    minutes = minutes.length === 1 ? '0' + minutes : minutes
    var seconds = String(now.getSeconds())
    seconds = seconds.length === 1 ? '0' + seconds : seconds
    var year = now.getFullYear()
    var month = now.getMonth() + 1
    month = month < 10 ? '0' + month : '' + month
    var day = now.getDate()
    day = day < 10 ? '0' + day : '' + day
    var weekdays = i18n.getLanguage() === 'en' ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    var weekday = weekdays[now.getDay()]
    var offset = -now.getTimezoneOffset() / 60
    var offsetStr = offset >= 0 ? '+' + offset : '' + offset
    var dateStr = i18n.getLanguage() === 'en' ? (month + '/' + day + '/' + year) : (year + '年' + month + '月' + day + '日')
    this.setData({
      localTime: hours + ':' + minutes + ':' + seconds,
      localDate: dateStr,
      localOffset: offsetStr,
      localWeekday: weekday
    })
  },

  updateAllTimes: function() {
    if (this.data.isSliderMode) return
    var cities = []
    for (var ui = 0; ui < this.data.cityList.length; ui++) {
      cities.push(this.getCityTime(this.data.cityList[ui]))
    }
    this.setData({ cityList: cities })
  },

  getCityTime: function(city) {
    var now = new Date()
    var utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    var cityTime = new Date(utc + (3600000 * city.offset))
    var hours = String(cityTime.getHours())
    hours = hours.length === 1 ? '0' + hours : hours
    var minutes = String(cityTime.getMinutes())
    minutes = minutes.length === 1 ? '0' + minutes : minutes
    var seconds = String(cityTime.getSeconds())
    seconds = seconds.length === 1 ? '0' + seconds : seconds
    var m = cityTime.getMonth() + 1
    var d = cityTime.getDate()
    var dateStr = (m < 10 ? '0' + m : '' + m) + '/' + (d < 10 ? '0' + d : '' + d)
    var localOffset = -now.getTimezoneOffset() / 60
    var diffHours = Math.round(city.offset - localOffset)
    var diffType = 'same'
    var diffText = ''
    var hourUnit = i18n.getLanguage() === 'en' ? 'h' : '小时'
    var sameText = i18n.getLanguage() === 'en' ? 'Same' : '相同'
    if (diffHours > 0) {
      diffType = 'ahead'
      diffText = '+' + diffHours + hourUnit
    } else if (diffHours < 0) {
      diffType = 'behind'
      diffText = diffHours + hourUnit
    } else {
      diffType = 'same'
      diffText = sameText
    }

    var cityHour = cityTime.getHours()
    var isWorkHour = (cityHour >= this.data.workStart && cityHour < this.data.workEnd)
    var workBar = this._buildWorkBar(cityHour)

    var result = {}
    for (var key in city) { result[key] = city[key] }
    result.time = hours + ':' + minutes + ':' + seconds
    result.date = dateStr
    result.diffType = diffType
    result.diffText = diffText
    result.isWorkHour = isWorkHour
    result.workBar = workBar
    return result
  },

  _buildWorkBar: function(currentHour) {
    var workStart = this.data.workStart
    var workEnd = this.data.workEnd
    var bars = []
    for (var h = 0; h < 24; h++) {
      var isWork = (h >= workStart && h < workEnd)
      var isCurrent = (h === currentHour)
      bars.push({ hour: h, isWork: isWork, isCurrent: isCurrent })
    }
    return bars
  },

  getCityTimeAtHour: function(city, baseHour, baseMinute) {
    var localOffset = -(new Date().getTimezoneOffset()) / 60
    var diffFromLocal = city.offset - localOffset
    var cityHour = baseHour + diffFromLocal
    var cityMinute = baseMinute
    var dayOffset = 0
    if (cityHour >= 24) {
      cityHour = cityHour - 24
      dayOffset = 1
    } else if (cityHour < 0) {
      cityHour = cityHour + 24
      dayOffset = -1
    }
    var hStr = Math.floor(cityHour) < 10 ? '0' + Math.floor(cityHour) : '' + Math.floor(cityHour)
    var mStr = cityMinute < 10 ? '0' + cityMinute : '' + cityMinute
    var isWorkHour = (cityHour >= this.data.workStart && cityHour < this.data.workEnd)
    var nextDayText = i18n.getLanguage() === 'en' ? ' (+1d)' : ' (次日)'
    var prevDayText = i18n.getLanguage() === 'en' ? ' (-1d)' : ' (昨日)'
    var dayText = ''
    if (dayOffset === 1) dayText = nextDayText
    else if (dayOffset === -1) dayText = prevDayText
    return {
      time: hStr + ':' + mStr,
      hour: cityHour,
      minute: cityMinute,
      dayOffset: dayOffset,
      dayText: dayText,
      isWorkHour: isWorkHour,
      city: city.city,
      emoji: city.emoji,
      offset: city.offset,
      timezone: city.timezone,
      country: city.country,
      id: city.id
    }
  },

  _checkDST: function() {
    var now = new Date()
    var month = now.getMonth() + 1
    var isEn = i18n.getLanguage() === 'en'
    var cities = this.data.cityList
    var alerts = []
    for (var i = 0; i < cities.length; i++) {
      var c = cities[i]
      if (c.dst) {
        var inDST = this._isInDST(c, month)
        var effectiveOffset = inDST ? c.offset + c.dstOffset : c.offset
        var tzLabel = 'UTC' + (effectiveOffset >= 0 ? '+' : '') + effectiveOffset
        alerts.push({
          city: c.city,
          emoji: c.emoji,
          inDST: inDST,
          effectiveOffset: effectiveOffset,
          effectiveTimezone: tzLabel,
          dstStart: isEn ? (c.dstStartEn || c.dstStart) : c.dstStart,
          dstEnd: isEn ? (c.dstEndEn || c.dstEnd) : c.dstEnd
        })
      }
    }
    this.setData({ dstAlerts: alerts })
  },

  _isInDST: function(city, month) {
    if (!city.dst) return false
    if (city.id === 'sydney' || city.id === 'melbourne' || city.id === 'auckland' || city.id === 'saopaulo') {
      return (month >= 10 || month <= 4)
    }
    return (month >= 3 && month <= 10)
  },

  toggleTimeSlider: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showTimeSlider
    if (show) {
      var now = new Date()
      var currentMinutes = now.getHours() * 60 + now.getMinutes()
      this.setData({
        showTimeSlider: show,
        showMeeting: false,
        isSliderMode: true,
        sliderValue: currentMinutes,
        sliderHour: now.getHours(),
        sliderMinute: now.getMinutes()
      })
      this.updateSliderDisplay(currentMinutes)
    } else {
      this.setData({ showTimeSlider: show, isSliderMode: false })
      this.updateAllTimes()
    }
  },

  onSliderChange: function(e) {
    var totalMinutes = e.detail.value
    this.setData({ sliderValue: totalMinutes })
    this.updateSliderDisplay(totalMinutes)
  },

  onSliderChanging: function(e) {
    var totalMinutes = e.detail.value
    this.setData({ sliderValue: totalMinutes })
    this.updateSliderDisplay(totalMinutes)
  },

  updateSliderDisplay: function(totalMinutes) {
    var hours = Math.floor(totalMinutes / 60)
    var minutes = totalMinutes % 60
    var hStr = hours < 10 ? '0' + hours : '' + hours
    var mStr = minutes < 10 ? '0' + minutes : '' + minutes
    var sliderCityList = []
    for (var i = 0; i < this.data.cityList.length; i++) {
      var city = this.data.cityList[i]
      var ct = this.getCityTimeAtHour(city, hours, minutes)
      sliderCityList.push(ct)
    }
    this.setData({
      sliderHour: hours,
      sliderMinute: minutes,
      sliderLabel: hStr + ':' + mStr,
      sliderCityList: sliderCityList
    })
  },

  resetToNow: function() {
    wx.vibrateShort({ type: 'light' })
    var now = new Date()
    var currentMinutes = now.getHours() * 60 + now.getMinutes()
    this.setData({ sliderValue: currentMinutes })
    this.updateSliderDisplay(currentMinutes)
  },

  toggleMeeting: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showMeeting
    if (show) {
      this.setData({ showMeeting: show, showTimeSlider: false, isSliderMode: false })
      this.calculateMeetingTimes()
      this.updateAllTimes()
    } else {
      this.setData({ showMeeting: show })
    }
  },

  calculateMeetingTimes: function() {
    var cities = this.data.cityList
    if (cities.length < 2) {
      this.setData({ meetingResults: [] })
      return
    }
    var workStart = this.data.workStart
    var workEnd = this.data.workEnd
    var localOffset = -(new Date().getTimezoneOffset()) / 60
    var results = []
    var bestSlots = []

    for (var h = workStart; h < workEnd; h++) {
      var allInWork = true
      var workCount = 0
      var cityTimes = []
      for (var ci = 0; ci < cities.length; ci++) {
        var city = cities[ci]
        var diffFromLocal = city.offset - localOffset
        var cityHour = h + diffFromLocal
        var dayOffset = 0
        if (cityHour >= 24) { cityHour = cityHour - 24; dayOffset = 1 }
        else if (cityHour < 0) { cityHour = cityHour + 24; dayOffset = -1 }
        var inWork = (cityHour >= workStart && cityHour < workEnd)
        if (!inWork) allInWork = false
        else workCount++
        var hStr = Math.floor(cityHour) < 10 ? '0' + Math.floor(cityHour) : '' + Math.floor(cityHour)
        var nextDayText = i18n.getLanguage() === 'en' ? ' (+1d)' : ' (次日)'
        var prevDayText = i18n.getLanguage() === 'en' ? ' (-1d)' : ' (昨日)'
        var dayText = ''
        if (dayOffset === 1) dayText = nextDayText
        else if (dayOffset === -1) dayText = prevDayText
        cityTimes.push({
          city: city.city,
          emoji: city.emoji,
          hour: hStr + ':00',
          hourNum: cityHour,
          isWorkHour: inWork,
          dayText: dayText
        })
      }

      var localHStr = h < 10 ? '0' + h : '' + h
      var score = 0
      var reason = ''

      var isEn = i18n.getLanguage() === 'en'
      if (allInWork) {
        var midDiff = 0
        for (var si = 0; si < cityTimes.length; si++) {
          midDiff += Math.abs(cityTimes[si].hourNum - 13)
        }
        score = 100 - midDiff * 3
        if (h >= 9 && h <= 11) {
          reason = isEn ? 'Morning prime time, energetic' : '上午黄金时段，精力充沛'
          score += 10
        } else if (h >= 14 && h <= 16) {
          reason = isEn ? 'Afternoon, good for deep discussion' : '下午时段，适合深度讨论'
          score += 5
        } else if (h === workStart) {
          reason = isEn ? 'Work start, good for quick sync' : '工作日开始，适合简短同步'
        } else if (h === workEnd - 1) {
          reason = isEn ? 'End of workday, may be tired' : '工作日末尾，注意疲劳'
          score -= 5
        } else {
          reason = isEn ? 'All cities in working hours' : '所有城市均在工作时间'
        }
        bestSlots.push({ localTime: localHStr + ':00', localHour: h, cityTimes: cityTimes, allInWork: true, score: score, reason: reason })
      } else {
        score = workCount * 10
        if (workCount === cities.length - 1) {
          reason = isEn ? 'Only 1 city outside work hours' : '仅1个城市不在工作时间'
        } else {
          reason = isEn ? (workCount + '/' + cities.length + ' cities in work hours') : (workCount + '/' + cities.length + '个城市在工作时间')
        }
      }

      results.push({
        localTime: localHStr + ':00',
        localHour: h,
        cityTimes: cityTimes,
        allInWork: allInWork,
        score: score,
        reason: reason,
        workCount: workCount
      })
    }

    bestSlots.sort(function(a, b) { return b.score - a.score })

    var topResults = []
    var shown = 0
    for (var ri = 0; ri < results.length; ri++) {
      if (results[ri].allInWork) {
        topResults.push(results[ri])
        shown++
      }
      if (shown >= 5) break
    }

    if (topResults.length === 0) {
      var nearResults = []
      for (var ni = 0; ni < results.length; ni++) {
        if (results[ni].workCount >= cities.length - 1) {
          nearResults.push(results[ni])
        }
        if (nearResults.length >= 3) break
      }
      topResults = nearResults
    }

    var bestTime = bestSlots.length > 0 ? bestSlots[0].localTime : ''
    var bestScore = bestSlots.length > 0 ? bestSlots[0].score : 0
    var bestReason = bestSlots.length > 0 ? bestSlots[0].reason : ''

    this.setData({
      meetingResults: topResults,
      bestMeetingTime: bestTime,
      bestMeetingScore: bestScore,
      totalWorkSlots: bestSlots.length,
      bestReason: bestReason
    })
  },

  showAddCity: function() {
    wx.vibrateShort({ type: 'light' })
    var isEn = i18n.getLanguage() === 'en'
    var i18nCities = []
    for (var ii = 0; ii < allCities.length; ii++) {
      var ic = {}
      for (var ik in allCities[ii]) { ic[ik] = allCities[ii][ik] }
      if (isEn) {
        ic.city = ic.cityEn || ic.city
        ic.country = ic.countryEn || ic.country
      }
      i18nCities.push(ic)
    }
    this.setData({ showCityPicker: true, searchKeyword: '', filteredCities: i18nCities })
  },

  hideAddCity: function() {
    this.setData({ showCityPicker: false })
  },

  onSearchCity: function(e) {
    var keyword = e.detail.value.toLowerCase().trim()
    this.setData({ searchKeyword: e.detail.value })
    var isEn = i18n.getLanguage() === 'en'
    var i18nCities = []
    for (var ii = 0; ii < allCities.length; ii++) {
      var ic = {}
      for (var ik in allCities[ii]) { ic[ik] = allCities[ii][ik] }
      if (isEn) {
        ic.city = ic.cityEn || ic.city
        ic.country = ic.countryEn || ic.country
      }
      i18nCities.push(ic)
    }
    if (!keyword) {
      this.setData({ filteredCities: i18nCities })
      return
    }
    var filtered = []
    for (var fi = 0; fi < allCities.length; fi++) {
      var c = allCities[fi]
      if (c.city.indexOf(keyword) > -1 || c.country.indexOf(keyword) > -1 || c.id.indexOf(keyword) > -1 || (c.cityEn && c.cityEn.toLowerCase().indexOf(keyword) > -1) || (c.countryEn && c.countryEn.toLowerCase().indexOf(keyword) > -1)) {
        var fc = {}
        for (var fk in c) { fc[fk] = c[fk] }
        if (isEn) {
          fc.city = fc.cityEn || fc.city
          fc.country = fc.countryEn || fc.country
        }
        filtered.push(fc)
      }
    }
    this.setData({ filteredCities: filtered })
  },

  selectCity: function(e) {
    wx.vibrateShort({ type: 'medium' })
    var city = e.currentTarget.dataset.city
    var exists = null
    for (var ei = 0; ei < this.data.cityList.length; ei++) {
      if (this.data.cityList[ei].id === city.id) { exists = true; break }
    }
    if (exists) {
      wx.showToast({ title: this.data.i18n.cityAlreadyAdded, icon: 'none' })
      return
    }
    var cityWithTime = this.getCityTime(city)
    var cities = []
    for (var sci = 0; sci < this.data.cityList.length; sci++) {
      cities.push(this.data.cityList[sci])
    }
    cities.push(cityWithTime)
    this.setData({ cityList: cities, showCityPicker: false, searchKeyword: '' })
    this.saveCities(cities)
    this._checkDST()
    wx.showToast({ title: this.data.i18n.cityAdded + city.city, icon: 'success' })
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(15, '世界时钟', false)
  },

  quickAddCity: function(e) {
    wx.vibrateShort({ type: 'medium' })
    var cityInfo = e.currentTarget.dataset.city
    var city = null
    for (var qci = 0; qci < allCities.length; qci++) {
      if (allCities[qci].id === cityInfo.id) { city = allCities[qci]; break }
    }
    if (!city) return
    var exists = null
    for (var qei = 0; qei < this.data.cityList.length; qei++) {
      if (this.data.cityList[qei].id === city.id) { exists = true; break }
    }
    if (exists) {
      wx.showToast({ title: this.data.i18n.cityAlreadyAdded, icon: 'none' })
      return
    }
    var cityWithTime = this.getCityTime(city)
    var cities = []
    for (var qsi = 0; qsi < this.data.cityList.length; qsi++) {
      cities.push(this.data.cityList[qsi])
    }
    cities.push(cityWithTime)
    this.setData({ cityList: cities })
    this.saveCities(cities)
    this._checkDST()
    wx.showToast({ title: this.data.i18n.cityAdded + city.city, icon: 'success' })
  },

  removeCity: function(e) {
    var cityId = e.currentTarget.dataset.id
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmDelete,
      content: that.data.i18n.confirmDeleteCity,
      confirmText: that.data.i18n.deleteConfirmBtn,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var cities = []
          for (var rci = 0; rci < that.data.cityList.length; rci++) {
            if (that.data.cityList[rci].id !== cityId) {
              cities.push(that.data.cityList[rci])
            }
          }
          that.setData({ cityList: cities })
          that.saveCities(cities)
          that._checkDST()
          wx.showToast({ title: that.data.i18n.removed, icon: 'success' })
        }
      }
    })
  },

  loadSavedCities: function() {
    try {
      var savedIds = storageUtil.safeGetArray('world_clock_cities')
      if (savedIds.length > 0) {
        var cities = []
        for (var lii = 0; lii < savedIds.length; lii++) {
          var foundCity = null
          for (var laci = 0; laci < allCities.length; laci++) {
            if (allCities[laci].id === savedIds[lii]) { foundCity = allCities[laci]; break }
          }
          if (foundCity) {
            cities.push(this.getCityTime(foundCity))
          }
        }
        this.setData({ cityList: cities })
      }
    } catch (e) {
      logger.log('加载失败:', e)
    }
  },

  saveCities: function(cities) {
    try {
      var ids = []
      for (var si = 0; si < cities.length; si++) {
        ids.push(cities[si].id)
      }
      wx.setStorageSync('world_clock_cities', ids)
    } catch (e) {
      logger.log('保存失败:', e)
    }
  },

  copyResult: function() {
    var isEn = i18n.getLanguage() === 'en'
    var lines = []
    lines.push((isEn ? 'Local Time: ' : '本地时间: ') + this.data.localTime + ' ' + this.data.localDate + ' ' + this.data.localWeekday)
    var cities = this.data.cityList
    for (var i = 0; i < cities.length; i++) {
      var city = cities[i]
      lines.push(city.emoji + ' ' + city.city + ': ' + city.time + ' ' + city.date + ' (' + city.diffText + ')')
    }
    if (this.data.bestMeetingTime) {
      lines.push((isEn ? 'Best Meeting Time: ' : '最佳会议时间: ') + this.data.bestMeetingTime + ' ' + this.data.bestReason)
    }
    var text = lines.join('\n')
    toolActions.copyText(text)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🌍 世界时钟 - 百宝工具箱', '/package-life/world-clock/world-clock')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🌍 世界时钟 - 百宝工具箱')
  }
})
