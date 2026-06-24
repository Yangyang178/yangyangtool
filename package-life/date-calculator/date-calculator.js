var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    isLoading: true,
    i18n: {},
    activeTab: 0,
    calcMode: 'diff',
    startDate: '',
    endDate: '',
    baseDate: '',
    addYears: '0',
    addMonths: '0',
    addDays: '0',
    addSubtract: 'add',
    showResult: false,
    totalDays: '',
    weeks: '',
    months: '',
    years: '',
    hours: '',
    startDateDisplay: '',
    endDateDisplay: '',
    startWeekday: '',
    endWeekday: '',
    resultDate: '',
    resultWeekday: '',
    passedPercent: 0,
    historyList: [],
    today: '',

    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('日期计算器')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('dateCalc') })

    var today = this.formatDate(new Date())
    this.setData({
      today,
      startDate: today,
      endDate: today,
      baseDate: today
    })
    this.loadHistory()
    poster.setupForPage(this, 13)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('dateCalc') })
  },

  formatDate(date) {
    var year = date.getFullYear()
    var month = String(date.getMonth() + 1).padStart(2, '0')
    var day = String(date.getDate()).padStart(2, '0')
    return year + '-' + month + '-' + day
  },

  getWeekdayCN(dateStr) {
    var weekdays = ['日', '一', '二', '三', '四', '五', '六']
    var date = new Date(dateStr)
    return '周' + weekdays[date.getDay()]
  },

  switchMode(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      calcMode: e.currentTarget.dataset.mode,
      showResult: false
    })
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value })
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value })
  },

  onBaseDateChange(e) {
    this.setData({ baseDate: e.detail.value })
  },

  onAddYearsChange(e) {
    this.setData({ addYears: e.detail.value })
  },

  onAddMonthsChange(e) {
    this.setData({ addMonths: e.detail.value })
  },

  onAddDaysChange(e) {
    this.setData({ addDays: e.detail.value })
  },

  toggleAddSubtract(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({ addSubtract: e.currentTarget.dataset.type })
  },

  swapDates() {
    wx.vibrateShort({ type: 'medium' })
    var { startDate, endDate } = this.data
    this.setData({
      startDate: endDate,
      endDate: startDate
    })
  },

  setTodayStart() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ startDate: this.formatDate(new Date()) })
  },

  setYesterday() {
    wx.vibrateShort({ type: 'light' })
    var yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    this.setData({ startDate: this.formatDate(yesterday), endDate: this.formatDate(new Date()) })
  },

  setThisWeek() {
    wx.vibrateShort({ type: 'light' })
    var now = new Date()
    var dayOfWeek = now.getDay()
    var diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    var monday = new Date(now.setDate(diff))
    this.setData({ startDate: this.formatDate(monday), endDate: this.formatDate(new Date()) })
  },

  setThisMonth() {
    wx.vibrateShort({ type: 'light' })
    var now = new Date()
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    this.setData({ startDate: this.formatDate(firstDay), endDate: this.formatDate(new Date()) })
  },

  setThisYear() {
    wx.vibrateShort({ type: 'light' })
    var now = new Date()
    var firstDay = new Date(now.getFullYear(), 0, 1)
    this.setData({ startDate: this.formatDate(firstDay), endDate: this.formatDate(new Date()) })
  },

  calculateDiff() {
    wx.vibrateShort({ type: 'medium' })

    var { startDate, endDate } = this.data

    if (!startDate || !endDate) {
      wx.showToast({ title: this.data.i18n.selectDate, icon: 'none' })
      return
    }

    var start = new Date(startDate)
    var end = new Date(endDate)
    var diffTime = Math.abs(end - start)

    var totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    var weeks = Math.floor(totalDays / 7)
    var hours = totalDays * 24

    var yearDiff = end.getFullYear() - start.getFullYear()
    var monthDiff = end.getMonth() - start.getMonth()
    var dayDiff = end.getDate() - start.getDate()

    if (dayDiff < 0) {
      monthDiff--
      var prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
      dayDiff += prevMonth.getDate()
    }
    if (monthDiff < 0) {
      yearDiff--
      monthDiff += 12
    }

    if (start > end) {
      this.setData({
        startDateDisplay: endDate,
        endDateDisplay: startDate,
        startWeekday: this.getWeekdayCN(endDate),
        endWeekday: this.getWeekdayCN(startDate)
      })
    } else {
      this.setData({
        startDateDisplay: startDate,
        endDateDisplay: endDate,
        startWeekday: this.getWeekdayCN(startDate),
        endWeekday: this.getWeekdayCN(endDate)
      })
    }

    this.setData({
      showResult: true,
      totalDays: totalDays.toLocaleString(),
      weeks: weeks.toLocaleString(),
      months: Math.abs(yearDiff) + '年' + Math.abs(monthDiff) + '月',
      years: (totalDays / 365).toFixed(2),
      hours: hours.toLocaleString()
    })

    this.addToHistory('间隔 ' + totalDays + ' 天 (' + startDate + ' → ' + endDate + ')')

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(13, '日期计算器', false)
  },

  calculateAdd() {
    wx.vibrateShort({ type: 'medium' })

    var { baseDate, addYears, addMonths, addDays, addSubtract } = this.data

    if (!baseDate) {
      wx.showToast({ title: this.data.i18n.selectBaseDate, icon: 'none' })
      return
    }

    var years = parseInt(addYears) || 0
    var months = parseInt(addMonths) || 0
    var days = parseInt(addDays) || 0

    if (years === 0 && months === 0 && days === 0) {
      wx.showToast({ title: this.data.i18n.inputAddSubValue, icon: 'none' })
      return
    }

    var date = new Date(baseDate)

    if (addSubtract === 'add') {
      date.setFullYear(date.getFullYear() + years)
      date.setMonth(date.getMonth() + months)
      date.setDate(date.getDate() + days)
    } else {
      date.setFullYear(date.getFullYear() - years)
      date.setMonth(date.getMonth() - months)
      date.setDate(date.getDate() - days)
    }

    var resultDateStr = this.formatDate(date)

    this.setData({
      showResult: true,
      resultDate: resultDateStr,
      resultWeekday: this.getWeekdayCN(resultDateStr)
    })

    var operator = addSubtract === 'add' ? '+' : '-'
    this.addToHistory(baseDate + ' ' + operator + ' ' + years + '年' + months + '月' + days + '日 = ' + resultDateStr)

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(13, '日期计算器', false)
  },

  copyResult: function() {
    var that = this
    wx.vibrateShort({ type: 'light' })

    var text = ''
    if (this.data.calcMode === 'diff') {
      text = '📅 日期间隔计算\n开始：' + this.data.startDateDisplay + ' ' + this.data.startWeekday + '\n结束：' + this.data.endDateDisplay + ' ' + this.data.endWeekday + '\n间隔：' + this.data.totalDays + '天（约' + this.data.weeks + '周）'
    } else {
      var action = this.data.addSubtract === 'add' ? '加上' : '减去'
      text = '📅 日期计算结果\n基准：' + this.data.baseDate + '\n' + action + '：' + this.data.addYears + '年 ' + this.data.addMonths + '月 ' + this.data.addDays + '日\n结果：' + this.data.resultDate + ' ' + this.data.resultWeekday
    }

    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedToClipboard, icon: 'success' })
      }
    })
  },

  addToHistory(text) {
    var history = storageUtil.safeGetArray('date_calc_history')
    var newRecord = {
      text,
      time: Date.now(),
      timeText: this.formatTime(new Date())
    }

    history.unshift(newRecord)
    var saved = history.slice(0, 20)
    storageUtil.safeSet('date_calc_history', saved)
    this.setData({ historyList: saved.slice(0, 10) })
  },

  formatTime(date) {
    var hours = String(date.getHours()).padStart(2, '0')
    var minutes = String(date.getMinutes()).padStart(2, '0')
    return hours + ':' + minutes
  },

  loadHistory() {
    var history = storageUtil.safeGetArray('date_calc_history')
    this.setData({ historyList: history.slice(0, 10) })
  },

  clearHistory() {
    var that = this
    wx.showModal({
      title: that.data.i18n.tipTitle,
      content: that.data.i18n.confirmClearHistory,
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('date_calc_history')
          that.setData({ historyList: [] })
          wx.showToast({ title: that.data.i18n.cleared, icon: 'success' })
        }
      }
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      var today = that.formatDate(new Date())
      that.setData({
        calcMode: 'diff',
        startDate: today,
        endDate: today,
        baseDate: today,
        addYears: '0',
        addMonths: '0',
        addDays: '0',
        addSubtract: 'add',
        showResult: false,
        totalDays: '',
        weeks: '',
        months: '',
        years: '',
        hours: '',
        startDateDisplay: '',
        endDateDisplay: '',
        startWeekday: '',
        endWeekday: '',
        resultDate: '',
        resultWeekday: '',
        passedPercent: 0
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('日期计算器 - 百宝工具箱', '/package-life/date-calculator/date-calculator', '日期间隔计算，工作日天数统计')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('日期计算器 - 日期间隔工作日天数计算')
  }
})
