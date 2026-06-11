var app = getApp()
var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var logger = require('../../utils/logger.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    i18n: {},
    hasEvent: false,
    eventName: '',
    targetDate: '',
    targetTime: '00:00',
    today: '',
    selectedCategory: 'life',
    selectedRepeat: 'none',

    currentEvent: null,
    timeLeft: {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    isExpired: false,
    passedPercent: 0,

    savedEvents: [],
    countdownTimer: null,

    categories: [
      { key: 'life', name: '生活', enName: 'Life', icon: '🏠', color: '#10B981' },
      { key: 'work', name: '工作', enName: 'Work', icon: '💼', color: '#F59E0B' },
      { key: 'study', name: '学习', enName: 'Study', icon: '📚', color: '#8B5CF6' },
      { key: 'family', name: '家庭', enName: 'Family', icon: '👨‍👩‍👧', color: '#EC4899' },
      { key: 'health', name: '健康', enName: 'Health', icon: '💪', color: '#EF4444' },
      { key: 'travel', name: '旅行', enName: 'Travel', icon: '✈️', color: '#06B6D4' }
    ],
    activeCategory: 'all',

    repeatOptions: [
      { key: 'none', name: '不重复', enName: 'No Repeat', icon: '🚫' },
      { key: 'yearly', name: '每年', enName: 'Yearly', icon: '🎂' },
      { key: 'monthly', name: '每月', enName: 'Monthly', icon: '📅' },
      { key: 'weekly', name: '每周', enName: 'Weekly', icon: '📆' }
    ],

    quickEvents: [
      { key: 'spring_festival', name: '春节', enName: 'Spring Festival', icon: '🧨', category: 'life' },
      { key: 'new_year', name: '元旦', enName: "New Year's Day", icon: '🎊', category: 'life' },
      { key: 'birthday', name: '生日', enName: 'Birthday', icon: '🎂', category: 'family', repeat: 'yearly' },
      { key: 'exam', name: '考试', enName: 'Exam', icon: '📝', category: 'study' },
      { key: 'holiday', name: '放假', enName: 'Holiday', icon: '🏖️', category: 'life' },
      { key: 'wedding_anniversary', name: '结婚纪念日', enName: 'Wedding Anniversary', icon: '💒', category: 'family', repeat: 'yearly' },
      { key: 'project_launch', name: '项目上线', enName: 'Project Launch', icon: '🚀', category: 'work' },
      { key: 'interview', name: '面试', enName: 'Interview', icon: '🎯', category: 'work' },
      { key: 'school_starts', name: '开学', enName: 'School Starts', icon: '📖', category: 'study' },
      { key: 'health_checkup', name: '体检', enName: 'Health Checkup', icon: '🏥', category: 'health', repeat: 'yearly' },
      { key: 'travel', name: '旅行', enName: 'Travel', icon: '✈️', category: 'travel' },
      { key: 'fitness_checkin', name: '健身打卡', enName: 'Fitness Check-in', icon: '💪', category: 'health', repeat: 'weekly' }
    ],

    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('倒计时')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('countdown') })

    var today = this.formatDate(new Date())
    this.setData({ today: today })
    this._updateI18nData()
    this.loadSavedEvents()
    poster.setupForPage(this, 14)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('countdown') })
    this._updateI18nData()

    if (this.data.hasEvent) {
      this.startCountdown()
    }
  },

  _updateI18nData: function() {
    var isEn = i18n.getLanguage() === 'en'
    var categories = this.data.categories
    var repeatOptions = this.data.repeatOptions
    var quickEvents = this.data.quickEvents

    for (var i = 0; i < categories.length; i++) {
      if (isEn && categories[i].enName) {
        categories[i].name = categories[i].enName
      }
    }
    for (var i = 0; i < repeatOptions.length; i++) {
      if (isEn && repeatOptions[i].enName) {
        repeatOptions[i].name = repeatOptions[i].enName
      }
    }
    for (var i = 0; i < quickEvents.length; i++) {
      if (isEn && quickEvents[i].enName) {
        quickEvents[i].name = quickEvents[i].enName
      }
    }

    this.setData({
      categories: categories,
      repeatOptions: repeatOptions,
      quickEvents: quickEvents
    })
  },

  onHide: function() {
    this.stopCountdown()
  },

  onUnload: function() {
    this.stopCountdown()
  },

  formatDate: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    return year + '-' + month + '-' + day
  },

  onEventNameInput: function(e) {
    this.setData({ eventName: e.detail.value })
  },

  onDateChange: function(e) {
    this.setData({ targetDate: e.detail.value })
  },

  onTimeChange: function(e) {
    this.setData({ targetTime: e.detail.value })
  },

  onCategoryTap: function(e) {
    var key = e.currentTarget.dataset.key
    this.setData({ selectedCategory: key })
  },

  onRepeatTap: function(e) {
    var key = e.currentTarget.dataset.key
    this.setData({ selectedRepeat: key })
  },

  onFilterCategory: function(e) {
    var key = e.currentTarget.dataset.key
    this.setData({ activeCategory: key })
  },

  addQuickEvent: function(e) {
    wx.vibrateShort({ type: 'light' })
    var event = e.currentTarget.dataset.event
    var date = ''

    if (event.key === 'spring_festival') {
      var year = new Date().getFullYear()
      date = year + '-01-29'
    } else if (event.key === 'new_year') {
      var year = new Date().getFullYear() + 1
      date = year + '-01-01'
    }

    if (!date && event.key === 'birthday') {
      wx.showToast({ title: this.data.i18n.selectDateToast, icon: 'none' })
    }

    this.setData({
      eventName: event.name,
      targetDate: date || this.data.targetDate,
      selectedCategory: event.category,
      selectedRepeat: event.repeat || 'none'
    })
  },

  createCountdown: function() {
    wx.vibrateShort({ type: 'medium' })

    var eventName = this.data.eventName
    var targetDate = this.data.targetDate
    var targetTime = this.data.targetTime

    if (!eventName.trim()) {
      wx.showToast({ title: this.data.i18n.inputEventName, icon: 'none' })
      return
    }

    if (!targetDate) {
      wx.showToast({ title: this.data.i18n.selectTargetDate, icon: 'none' })
      return
    }

    var targetDateTime = new Date(targetDate + 'T' + (targetTime || '00:00') + ':00')
    var now = new Date()

    if (targetDateTime <= now && this.data.selectedRepeat === 'none') {
      wx.showToast({ title: this.data.i18n.targetMustBeFuture, icon: 'none' })
      return
    }

    var newEvent = {
      id: Date.now().toString(),
      name: eventName.trim(),
      date: targetDate,
      time: targetTime !== '00:00' ? targetTime : '',
      category: this.data.selectedCategory,
      repeat: this.data.selectedRepeat,
      pinned: false,
      originalDate: targetDate,
      createdAt: Date.now()
    }

    var events = this.data.savedEvents
    events.push(newEvent)
    this._sortAndSaveEvents(events)

    this.setData({
      currentEvent: newEvent,
      hasEvent: true,
      eventName: '',
      targetDate: '',
      targetTime: '00:00',
      selectedCategory: 'life',
      selectedRepeat: 'none',
      savedEvents: events
    })

    this.startCountdown()
    wx.showToast({ title: this.data.i18n.createSuccess, icon: 'success' })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(14, '倒计时', false)
  },

  _sortAndSaveEvents: function(events) {
    events.sort(function(a, b) {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      var dateA = new Date(a.date + 'T' + (a.time || '00:00') + ':00')
      var dateB = new Date(b.date + 'T' + (b.time || '00:00') + ':00')
      return dateA - dateB
    })
    this.saveEvents(events)
  },

  _getNextRepeatDate: function(event) {
    if (!event.repeat || event.repeat === 'none') return null

    var now = new Date()
    var parts = event.originalDate.split('-')
    var origYear = parseInt(parts[0])
    var origMonth = parseInt(parts[1])
    var origDay = parseInt(parts[2])

    if (event.repeat === 'yearly') {
      var thisYear = now.getFullYear()
      var nextDate = new Date(thisYear, origMonth - 1, origDay)
      if (nextDate <= now) {
        nextDate = new Date(thisYear + 1, origMonth - 1, origDay)
      }
      return this.formatDate(nextDate)
    }

    if (event.repeat === 'monthly') {
      var thisMonth = new Date(now.getFullYear(), now.getMonth(), origDay)
      if (thisMonth <= now) {
        thisMonth = new Date(now.getFullYear(), now.getMonth() + 1, origDay)
      }
      return this.formatDate(thisMonth)
    }

    if (event.repeat === 'weekly') {
      var dayOfWeek = new Date(origYear, origMonth - 1, origDay).getDay()
      var result = new Date(now)
      result.setDate(result.getDate() + ((dayOfWeek - result.getDay() + 7) % 7))
      if (result <= now) {
        result.setDate(result.getDate() + 7)
      }
      return this.formatDate(result)
    }

    return null
  },

  _autoRenewRepeatingEvents: function() {
    var events = this.data.savedEvents
    var changed = false
    for (var i = 0; i < events.length; i++) {
      var evt = events[i]
      if (!evt.repeat || evt.repeat === 'none') continue
      var target = new Date(evt.date + 'T' + (evt.time || '00:00') + ':00')
      if (target <= new Date()) {
        var nextDate = this._getNextRepeatDate(evt)
        if (nextDate) {
          evt.date = nextDate
          changed = true
        }
      }
    }
    if (changed) {
      this._sortAndSaveEvents(events)
      this.setData({ savedEvents: events })
    }
  },

  startCountdown: function() {
    this.stopCountdown()
    this.updateCountdown()
    var that = this
    this.data.countdownTimer = setInterval(function() {
      that.updateCountdown()
    }, 1000)
  },

  stopCountdown: function() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
      this.setData({ countdownTimer: null })
    }
  },

  updateCountdown: function() {
    var currentEvent = this.data.currentEvent
    if (!currentEvent) return

    var now = new Date()
    var target = new Date(currentEvent.date + 'T' + (currentEvent.time || '00:00') + ':00')
    var diff = target - now

    if (diff <= 0) {
      if (currentEvent.repeat && currentEvent.repeat !== 'none') {
        this._autoRenewRepeatingEvents()
        var updatedEvent = null
        for (var i = 0; i < this.data.savedEvents.length; i++) {
          if (this.data.savedEvents[i].id === currentEvent.id) {
            updatedEvent = this.data.savedEvents[i]
            break
          }
        }
        if (updatedEvent) {
          this.setData({ currentEvent: updatedEvent })
          this.updateCountdown()
          return
        }
      }

      this.setData({
        isExpired: true,
        passedPercent: 100,
        timeLeft: { days: '00', hours: '00', minutes: '00', seconds: '00' }
      })
      this.stopCountdown()

      wx.vibrateLong({ type: 'heavy' })
      wx.showModal({
        title: this.data.i18n.timeUpTitle,
        content: currentEvent.name + this.data.i18n.hasArrivedMsg,
        showCancel: false
      })
      return
    }

    var totalSeconds = Math.floor(diff / 1000)
    var days = Math.floor(totalSeconds / (24 * 60 * 60))
    var hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
    var minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    var seconds = totalSeconds % 60

    var created = new Date(currentEvent.createdAt)
    var totalDuration = target - created
    var elapsed = now - created
    var passedPercent = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100)

    var daysStr = String(days)
    var hoursStr = String(hours).length < 2 ? '0' + hours : String(hours)
    var minutesStr = String(minutes).length < 2 ? '0' + minutes : String(minutes)
    var secondsStr = String(seconds).length < 2 ? '0' + seconds : String(seconds)

    this.setData({
      timeLeft: {
        days: daysStr,
        hours: hoursStr,
        minutes: minutesStr,
        seconds: secondsStr
      },
      isExpired: false,
      passedPercent: passedPercent
    })

    this.updateEventsList()
  },

  updateEventsList: function() {
    var events = []
    for (var i = 0; i < this.data.savedEvents.length; i++) {
      var event = this.data.savedEvents[i]
      var target = new Date(event.date + 'T' + (event.time || '00:00') + ':00')
      var diff = target - new Date()
      var days = Math.max(Math.ceil(diff / (24 * 60 * 60 * 1000)), 0)
      var evt = {}
      for (var k in event) { evt[k] = event[k] }
      evt.daysLeft = days
      events.push(evt)
    }
    this.setData({ savedEvents: events })
  },

  editEvent: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      hasEvent: false,
      eventName: this.data.currentEvent.name,
      targetDate: this.data.currentEvent.date,
      targetTime: this.data.currentEvent.time || '00:00',
      selectedCategory: this.data.currentEvent.category || 'life',
      selectedRepeat: this.data.currentEvent.repeat || 'none'
    })
    this.stopCountdown()
  },

  deleteEvent: function() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmDelete,
      content: that.data.i18n.confirmDeleteCountdown + this.data.currentEvent.name + that.data.i18n.confirmDeleteCountdownSuffix,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var newEvents = []
          for (var i = 0; i < that.data.savedEvents.length; i++) {
            if (that.data.savedEvents[i].id !== that.data.currentEvent.id) {
              newEvents.push(that.data.savedEvents[i])
            }
          }
          that.saveEvents(newEvents)
          that.stopCountdown()

          that.setData({
            hasEvent: false,
            currentEvent: null,
            savedEvents: newEvents,
            eventName: '',
            targetDate: '',
            targetTime: '00:00',
            selectedRepeat: 'none',
            isExpired: false,
            passedPercent: 0,
            timeLeft: { days: '00', hours: '00', minutes: '00', seconds: '00' }
          })

          wx.showToast({ title: that.data.i18n.deleted, icon: 'success' })
        }
      }
    })
  },

  shareEvent: function() {
    var that = this
    var currentEvent = this.data.currentEvent
    var timeLeft = this.data.timeLeft
    var i18nTexts = this.data.i18n
    var repeatText = ''
    if (currentEvent.repeat === 'yearly') repeatText = i18nTexts.shareRepeatYearly
    else if (currentEvent.repeat === 'monthly') repeatText = i18nTexts.shareRepeatMonthly
    else if (currentEvent.repeat === 'weekly') repeatText = i18nTexts.shareRepeatWeekly

    var text = '⏰ ' + currentEvent.name + repeatText + '\n📅 ' + currentEvent.date + '\n⏳ ' + i18nTexts.shareTimeLeftPrefix + timeLeft.days + i18nTexts.shareDayUnit + timeLeft.hours + i18nTexts.shareHourUnit + timeLeft.minutes + i18nTexts.shareMinuteUnit

    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedToClipboard, icon: 'success' })
      }
    })
  },

  pinEvent: function() {
    wx.vibrateShort({ type: 'light' })
    var currentEvent = this.data.currentEvent
    var pinned = !currentEvent.pinned
    var events = []
    for (var i = 0; i < this.data.savedEvents.length; i++) {
      var e = this.data.savedEvents[i]
      if (e.id === currentEvent.id) {
        e.pinned = pinned
      }
      events.push(e)
    }
    currentEvent.pinned = pinned

    this._sortAndSaveEvents(events)
    this.setData({
      currentEvent: currentEvent,
      savedEvents: events
    })

    wx.showToast({ title: pinned ? this.data.i18n.pinned : this.data.i18n.unpinned, icon: 'success' })
  },

  switchEvent: function(e) {
    wx.vibrateShort({ type: 'light' })
    var event = e.currentTarget.dataset.event
    this.setData({ currentEvent: event })
    this.startCountdown()
  },

  loadSavedEvents: function() {
    try {
      var events = storageUtil.safeGetArray('countdown_events')
      if (events.length > 0) {
        this._autoRenewRepeatingEvents()

        var validEvents = []
        for (var j = 0; j < events.length; j++) {
          var evt = events[j]
          if (!evt.repeat || evt.repeat === 'none') {
            var target = new Date(evt.date + 'T' + (evt.time || '00:00') + ':00')
            if (target <= new Date()) continue
          }
          validEvents.push(evt)
        }

        if (validEvents.length > 0) {
          this._sortAndSaveEvents(validEvents)
          var pinnedEvent = null
          for (var i = 0; i < validEvents.length; i++) {
            if (validEvents[i].pinned) {
              pinnedEvent = validEvents[i]
              break
            }
          }

          this.setData({
            savedEvents: validEvents,
            currentEvent: pinnedEvent || validEvents[0],
            hasEvent: true
          })
          this.startCountdown()
        }

        if (validEvents.length !== events.length) {
          this.saveEvents(validEvents)
        }
      }
    } catch (e) {
      logger.log('加载失败:', e)
    }
  },

  saveEvents: function(events) {
    try {
      wx.setStorageSync('countdown_events', events)
    } catch (e) {
      logger.log('保存失败:', e)
    }
  },

  copyResult: function() {
    var currentEvent = this.data.currentEvent
    var timeLeft = this.data.timeLeft
    var i18nTexts = this.data.i18n
    var text = ''
    if (currentEvent) {
      var repeatText = ''
      if (currentEvent.repeat === 'yearly') repeatText = i18nTexts.shareRepeatYearly
      else if (currentEvent.repeat === 'monthly') repeatText = i18nTexts.shareRepeatMonthly
      else if (currentEvent.repeat === 'weekly') repeatText = i18nTexts.shareRepeatWeekly
      text = '⏰ ' + currentEvent.name + repeatText + '\n📅 ' + currentEvent.date + (currentEvent.time ? ' ' + currentEvent.time : '') + '\n⏳ ' + i18nTexts.shareTimeLeftPrefix + timeLeft.days + i18nTexts.shareDayUnit + timeLeft.hours + i18nTexts.shareHourUnit + timeLeft.minutes + i18nTexts.shareMinuteUnit + ' ' + timeLeft.seconds + i18nTexts.shareSecondUnit
    }
    toolActions.copyText(text)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('⏰ 倒计时 - 百宝工具箱', '/package-life/countdown/countdown')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('⏰ 倒计时 - 百宝工具箱')
  }
})
