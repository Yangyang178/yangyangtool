var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var zodiacList = [
  { name: '鼠', emoji: '🐭', years: [2020, 2008, 1996, 1984, 1972, 1960] },
  { name: '牛', emoji: '🐮', years: [2021, 2009, 1997, 1985, 1973, 1961] },
  { name: '虎', emoji: '🐯', years: [2022, 2010, 1998, 1986, 1974, 1962] },
  { name: '兔', emoji: '🐰', years: [2023, 2011, 1999, 1987, 1975, 1963] },
  { name: '龙', emoji: '🐲', years: [2024, 2012, 2000, 1988, 1976, 1964] },
  { name: '蛇', emoji: '🐍', years: [2025, 2013, 2001, 1989, 1977, 1965] },
  { name: '马', emoji: '🐴', years: [2014, 2002, 1990, 1978, 1966] },
  { name: '羊', emoji: '🐑', years: [2015, 2003, 1991, 1979, 1967] },
  { name: '猴', emoji: '🐵', years: [2016, 2004, 1992, 1980, 1968] },
  { name: '鸡', emoji: '🐔', years: [2017, 2005, 1993, 1981, 1969] },
  { name: '狗', emoji: '🐶', years: [2018, 2006, 1994, 1982, 1970] },
  { name: '猪', emoji: '🐷', years: [2019, 2007, 1995, 1983, 1971] }
]

var constellationList = [
  { name: '水瓶座', start: [1, 20], end: [2, 18], emoji: '♒' },
  { name: '双鱼座', start: [2, 19], end: [3, 20], emoji: '♓' },
  { name: '白羊座', start: [3, 21], end: [4, 19], emoji: '♈' },
  { name: '金牛座', start: [4, 20], end: [5, 20], emoji: '♉' },
  { name: '双子座', start: [5, 21], end: [6, 21], emoji: '♊' },
  { name: '巨蟹座', start: [6, 22], end: [7, 22], emoji: '♋' },
  { name: '狮子座', start: [7, 23], end: [8, 22], emoji: '♌' },
  { name: '处女座', start: [8, 23], end: [9, 22], emoji: '♍' },
  { name: '天秤座', start: [9, 23], end: [10, 23], emoji: '♎' },
  { name: '天蝎座', start: [10, 24], end: [11, 22], emoji: '♏' },
  { name: '射手座', start: [11, 23], end: [12, 21], emoji: '♐' },
  { name: '摩羯座', start: [12, 22], end: [1, 19], emoji: '♑' }
]

Page({
  data: {
    i18n: {},
    birthDate: '',
    today: '',
    showResult: false,

    ageYears: '',
    ageMonths: '',
    ageDays: '',

    zodiacName: '',
    zodiacEmoji: '',
    constellationName: '',

    nextBirthdayDays: '',
    nextBirthdayDate: '',

    totalDays: '',
    totalHours: '',
    totalMinutes: '',
    heartbeats: '',
    breaths: '',
    sleepNights: '',

    lifeProgress: 0,
    lifeExpectancy: 80,
    livedPercent: '',
    remainYears: '',
    lifeProgressLabel: '',

    showDateCalc: false,
    dateCalcStart: '',
    dateCalcEnd: '',
    dateCalcResult: null,

    isDarkMode: false,
    fontSizeSetting: 'medium',
    milestones: [],
    historyList: []
  },

  onLoad: function() {
    var i18nTexts = i18n.getToolPageTexts('age')
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('年龄计算器')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    var today = this.formatDate(new Date())
    this.setData({ today: today, dateCalcStart: today, dateCalcEnd: today })
    this.loadHistory()
    poster.setupForPage(this, 16)
  },

  onShow: function() {
    var i18nTexts = i18n.getToolPageTexts('age')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ isDarkMode: isDark, i18n: i18nTexts, fontSizeSetting: fontSize })
  },

  formatDate: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day
  },

  formatNumber: function(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + '亿'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  onBirthDateChange: function(e) {
    this.setData({ birthDate: e.detail.value })
  },

  setTodayBirthday: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ birthDate: this.formatDate(new Date()) })
  },

  setYesterdayBirthday: function() {
    wx.vibrateShort({ type: 'light' })
    var yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    this.setData({ birthDate: this.formatDate(yesterday) })
  },

  setWeekAgo: function() {
    wx.vibrateShort({ type: 'light' })
    var weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    this.setData({ birthDate: this.formatDate(weekAgo) })
  },

  setMonthAgo: function() {
    wx.vibrateShort({ type: 'light' })
    var monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    this.setData({ birthDate: this.formatDate(monthAgo) })
  },

  setYearAgo: function() {
    wx.vibrateShort({ type: 'light' })
    var yearAgo = new Date()
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    this.setData({ birthDate: this.formatDate(yearAgo) })
  },

  calculateAge: function() {
    wx.vibrateShort({ type: 'medium' })

    var birthDate = this.data.birthDate

    if (!birthDate) {
      wx.showToast({ title: this.data.i18n.selectBirthDateToast, icon: 'none' })
      return
    }

    var birth = new Date(birthDate)
    var now = new Date()

    if (birth > now) {
      wx.showToast({ title: this.data.i18n.birthDateFuture, icon: 'none' })
      return
    }

    var years = now.getFullYear() - birth.getFullYear()
    var months = now.getMonth() - birth.getMonth()
    var days = now.getDate() - birth.getDate()

    if (days < 0) {
      months--
      var prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    var totalMs = now - birth
    var totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24))
    var totalHours = Math.floor(totalMs / (1000 * 60 * 60))
    var totalMinutes = Math.floor(totalMs / (1000 * 60))

    var zodiac = this.getZodiac(birth.getFullYear())
    var constellation = this.getConstellation(birth.getMonth() + 1, birth.getDate())

    var nextBirthday = this.getNextBirthday(birth)
    var nextBirthdayDiff = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24))
    var nextBirthdayDate = this.formatDate(nextBirthday)

    var milestones = this.generateMilestones(birth, now)

    var lifeExpectancy = this.data.lifeExpectancy
    var livedPercent = (years / lifeExpectancy * 100)
    var remainYears = Math.max(0, lifeExpectancy - years)
    var lifeProgress = Math.min(100, Math.max(0, livedPercent))

    this.setData({
      showResult: true,
      ageYears: years,
      ageMonths: months,
      ageDays: days,

      zodiacName: zodiac.name,
      zodiacEmoji: zodiac.emoji,
      constellationName: constellation.name,

      nextBirthdayDays: nextBirthdayDiff === 0 ? '今天！🎂' : nextBirthdayDiff.toString(),
      nextBirthdayDate: '下次生日：' + nextBirthdayDate,

      totalDays: this.formatNumber(totalDays),
      totalHours: this.formatNumber(totalHours),
      totalMinutes: this.formatNumber(totalMinutes),
      heartbeats: this.formatNumber(Math.floor(totalMinutes * 80)),
      breaths: this.formatNumber(Math.floor(totalMinutes * 16)),
      sleepNights: this.formatNumber(Math.floor(totalDays * 0.67)),

      lifeProgress: lifeProgress,
      livedPercent: livedPercent.toFixed(1),
      remainYears: remainYears,
      lifeProgressLabel: years + ' / ' + lifeExpectancy + ' 年',

      milestones: milestones
    })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(16, '年龄计算器', false)

    var ageText = years + '岁' + months + '个月'
    this.addToHistory(birthDate, ageText)
  },

  onLifeExpectancyChange: function(e) {
    this.setData({ lifeExpectancy: Number(e.detail.value) })
  },

  toggleDateCalc: function() {
    this.setData({ showDateCalc: !this.data.showDateCalc })
  },

  onDateCalcStartChange: function(e) {
    this.setData({ dateCalcStart: e.detail.value })
  },

  onDateCalcEndChange: function(e) {
    this.setData({ dateCalcEnd: e.detail.value })
  },

  calculateDateDiff: function() {
    var start = this.data.dateCalcStart
    var end = this.data.dateCalcEnd
    if (!start || !end) {
      wx.showToast({ title: this.data.i18n.selectTwoDates, icon: 'none' })
      return
    }
    var startDate = new Date(start)
    var endDate = new Date(end)
    if (startDate > endDate) {
      var temp = startDate
      startDate = endDate
      endDate = temp
    }

    var diffMs = endDate - startDate
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    var diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    var diffMinutes = Math.floor(diffMs / (1000 * 60))
    var diffWeeks = Math.floor(diffDays / 7)

    var totalYears = endDate.getFullYear() - startDate.getFullYear()
    var totalMonths = endDate.getMonth() - startDate.getMonth() + totalYears * 12
    var remDays = endDate.getDate() - startDate.getDate()
    if (remDays < 0) {
      totalMonths--
      var prevM = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
      remDays += prevM.getDate()
    }
    var detailYears = Math.floor(totalMonths / 12)
    var detailMonths = totalMonths % 12

    this.setData({
      dateCalcResult: {
        diffDays: this.formatNumber(diffDays),
        diffHours: this.formatNumber(diffHours),
        diffMinutes: this.formatNumber(diffMinutes),
        diffWeeks: diffWeeks,
        detailYears: detailYears,
        detailMonths: detailMonths,
        detailDays: remDays,
        totalMonths: totalMonths
      }
    })
  },

  getZodiac: function(year) {
    for (var i = 0; i < zodiacList.length; i++) {
      var z = zodiacList[i]
      for (var j = 0; j < z.years.length; j++) {
        if (z.years[j] === year) {
          return z
        }
      }
    }
    var remainder = year % 12
    var idxMap = { 4: 0, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5, 10: 6, 11: 7, 0: 8, 1: 9, 2: 10, 3: 11 }
    return zodiacList[idxMap[remainder]] || { name: '', emoji: '' }
  },

  getConstellation: function(month, day) {
    for (var i = 0; i < constellationList.length; i++) {
      var c = constellationList[i]
      var startMonth = c.start[0]
      var startDay = c.start[1]
      var endMonth = c.end[0]
      var endDay = c.end[1]

      if (startMonth === endMonth) {
        if (month === startMonth && day >= startDay && day <= endDay) {
          return c
        }
      } else if (startMonth > endMonth) {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return c
        }
      } else {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay) ||
            (month > startMonth && month < endMonth)) {
          return c
        }
      }
    }
    return { name: '未知', emoji: '?' }
  },

  getNextBirthday: function(birthDate) {
    var now = new Date()
    var nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    if (nextBirthday <= now) {
      nextBirthday.setFullYear(now.getFullYear() + 1)
    }
    return nextBirthday
  },

  generateMilestones: function(birthDate, now) {
    var that = this
    var milestones = [
      { age: '100天', name: '百日庆典', days: 100 },
      { age: '1周岁', name: '一周岁生日', days: 365 },
      { age: '6岁', name: '上小学', days: 365 * 6 },
      { age: '12岁', name: '小学毕业', days: 365 * 12 },
      { age: '18岁', name: '成年礼', days: 365 * 18 },
      { age: '22岁', name: '大学毕业', days: 365 * 22 },
      { age: '25岁', name: '四分之一世纪', days: 365 * 25 },
      { age: '30岁', name: '而立之年', days: 365 * 30 },
      { age: '40岁', name: '不惑之年', days: 365 * 40 },
      { age: '50岁', name: '知天命', days: 365 * 50 },
      { age: '60岁', name: '花甲之年', days: 365 * 60 },
      { age: '70岁', name: '古稀之年', days: 365 * 70 },
      { age: '80岁', name: '耄耋之年', days: 365 * 80 },
      { age: '100岁', name: '期颐之寿', days: 365 * 100 }
    ]

    var livedDays = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24))
    var result = []
    for (var i = 0; i < milestones.length; i++) {
      var m = milestones[i]
      var milestoneDate = new Date(birthDate.getTime() + m.days * 24 * 60 * 60 * 1000)
      var passed = livedDays >= m.days
      result.push({
        age: m.age,
        name: m.name,
        days: m.days,
        passed: passed,
        date: that.formatDate(milestoneDate)
      })
    }
    return result.slice(0, 10)
  },

  addToHistory: function(birthDate, ageText) {
    var history = storageUtil.safeGetArray('age_calc_history')
    var newRecord = {
      birthDate: birthDate,
      ageText: ageText,
      time: Date.now(),
      timeText: this.formatTime(new Date())
    }
    history.unshift(newRecord)
    var saved = history.slice(0, 20)
    wx.setStorageSync('age_calc_history', saved)
    this.setData({ historyList: saved.slice(0, 10) })
  },

  formatTime: function(date) {
    var hours = date.getHours()
    var minutes = date.getMinutes()
    return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes
  },

  loadHistory: function() {
    var history = storageUtil.safeGetArray('age_calc_history')
    this.setData({ historyList: history.slice(0, 10) })
  },

  clearHistory: function() {
    var that = this
    var i18nTexts = this.data.i18n
    wx.showModal({
      title: i18nTexts.tipTitle,
      content: i18nTexts.confirmClearHistory,
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('age_calc_history')
          that.setData({ historyList: [] })
          wx.showToast({ title: i18nTexts.cleared, icon: 'success' })
        }
      }
    })
  },

  copyResult: function() {
    wx.vibrateShort({ type: 'light' })
    var i18nTexts = this.data.i18n
    var text = '🎂 ' + i18nTexts.toolTitle + '\n' +
               i18nTexts.selectBirthDate.replace('🎂 ', '') + '：' + this.data.birthDate + '\n' +
               i18nTexts.calculateAge.replace('🔢 ', '') + '：' + this.data.ageYears + i18nTexts.yearsOld + ' ' + this.data.ageMonths + i18nTexts.monthsDays + ' ' + this.data.ageDays + i18nTexts.days + '\n' +
               i18nTexts.zodiac + '：' + this.data.zodiacName + this.data.zodiacEmoji + '\n' +
               i18nTexts.constellation + '：' + this.data.constellationName + '\n' +
               i18nTexts.totalDays + '：' + this.data.totalDays + i18nTexts.days + '\n' +
               i18nTexts.lifeProgressLabel + '：' + this.data.livedPercent + '%\n' +
               i18nTexts.nextBirthday.replace('🎉 ', '') + '：' + this.data.nextBirthdayDays + i18nTexts.days
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: i18nTexts.copiedToClipboard, icon: 'success' })
      }
    })
  },

  shareResult: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    var i18nTexts = this.data.i18n
    var ageYears = this.data.ageYears
    var zodiacName = this.data.zodiacName
    var constellationName = this.data.constellationName
    wx.showModal({
      title: i18nTexts.shareAgeTitle,
      content: ageYears + i18nTexts.yearsOld + '！\n' + i18nTexts.zodiac + zodiacName + '，' + i18nTexts.constellation + constellationName,
      confirmText: i18nTexts.copyResult.replace('📋 ', ''),
      success: function(res) {
        if (res.confirm) {
          that.copyResult()
        }
      }
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        birthDate: '',
        showResult: false,
        ageYears: '',
        ageMonths: '',
        ageDays: '',
        zodiacName: '',
        zodiacEmoji: '',
        constellationName: '',
        nextBirthdayDays: '',
        nextBirthdayDate: '',
        totalDays: '',
        totalHours: '',
        totalMinutes: '',
        heartbeats: '',
        breaths: '',
        sleepNights: '',
        lifeProgress: 0,
        livedPercent: '',
        remainYears: '',
        lifeProgressLabel: '',
        milestones: [],
        showDateCalc: false,
        dateCalcResult: null
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🧓 年龄计算器 - 百宝工具箱', '/package-calculator/age-calculator/age-calculator')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🧓 年龄计算器 - 百宝工具箱')
  }
})
