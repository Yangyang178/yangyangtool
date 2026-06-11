var CHECKIN_KEY = 'checkin_records'
var POINTS_KEY = 'user_points'
var TOTAL_POINTS_KEY = 'total_earned_points'
var storageUtil = require('./storage.js')
var i18n = require('./i18n.js')

var BASE_POINTS = 10
var CONTINUOUS_BONUS = [0, 0, 5, 10, 15, 20, 30, 50]
var Checkin = {
  getToday: function() {
    var d = new Date()
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
  },

  checkin: function() {
    var today = this.getToday()
    var records = this._getRecords()
    var alreadyChecked = false
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === today) { alreadyChecked = true; break }
    }
    if (alreadyChecked) return { success: false, message: i18n.t('checkinAlready') }

    var continuousDays = this._calcContinuousDays(records, today)
    // 7天一循环，计算当前周期天数
    var cycleDay = continuousDays % 7
    if (cycleDay === 0 && continuousDays > 0) cycleDay = 7
    var nextCycleDay = cycleDay + 1
    if (nextCycleDay > 7) nextCycleDay = 1
    var bonus = 0
    if (nextCycleDay >= 2 && nextCycleDay <= 7) {
      bonus = CONTINUOUS_BONUS[nextCycleDay] || 0
    }
    var totalPoints = BASE_POINTS + bonus

    records.unshift({ date: today, points: totalPoints, continuousDays: continuousDays + 1 })
    if (records.length > 90) records = records.slice(0, 90)
    wx.setStorageSync(CHECKIN_KEY, records)

    var currentPoints = (storageUtil.get(POINTS_KEY, 0) || 0) + totalPoints
    var totalEarned = (storageUtil.get(TOTAL_POINTS_KEY, 0) || 0) + totalPoints
    wx.setStorageSync(POINTS_KEY, currentPoints)
    wx.setStorageSync(TOTAL_POINTS_KEY, totalEarned)

    return {
      success: true,
      points: totalPoints,
      basePoints: BASE_POINTS,
      bonus: bonus,
      continuousDays: continuousDays + 1,
      message: i18n.t('checkinSuccessTitle')
    }
  },

  isCheckedToday: function() {
    var today = this.getToday()
    var records = this._getRecords()
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === today) return true
    }
    return false
  },

  getContinuousDays: function() {
    var today = this.getToday()
    var records = this._getRecords()
    return this._calcContinuousDays(records, today)
  },

  getCurrentPoints: function() {
    return storageUtil.get(POINTS_KEY, 0)
  },

  getTotalEarnedPoints: function() {
    return storageUtil.get(TOTAL_POINTS_KEY, 0)
  },

  spendPoints: function(amount) {
    var current = this.getCurrentPoints()
    if (current < amount) return { success: false, message: '积分不足' }
    wx.setStorageSync(POINTS_KEY, current - amount)
    return { success: true, remaining: current - amount }
  },

  getRecentRecords: function(count) {
    var records = this._getRecords()
    return records.slice(0, count || 7)
  },

  getWeekSummary: function() {
    var records = this._getRecords()
    var today = new Date()
    // 计算本周一的日期
    var dayOfWeek = today.getDay()
    if (dayOfWeek === 0) dayOfWeek = 7
    var monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek + 1)
    var weekRecords = []
    for (var i = 0; i < records.length; i++) {
      var parts = records[i].date.split('-')
      var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      if (d >= monday) weekRecords.push(records[i])
    }
    var totalPoints = 0
    for (var j = 0; j < weekRecords.length; j++) totalPoints += weekRecords[j].points
    return { days: weekRecords.length, points: totalPoints }
  },

  _calcContinuousDays: function(records, today) {
    if (!records || records.length === 0) return 0
    var todayParts = today.split('-')
    var todayDate = new Date(parseInt(todayParts[0], 10), parseInt(todayParts[1], 10) - 1, parseInt(todayParts[2], 10))
    var checkedToday = false
    for (var ci = 0; ci < records.length; ci++) {
      if (records[ci].date === today) { checkedToday = true; break }
    }

    var continuous = 0
    var checkDate = new Date(todayDate.getTime())
    if (!checkedToday) checkDate.setDate(checkDate.getDate() - 1)

    for (var k = 0; k < records.length; k++) {
      var y = checkDate.getFullYear()
      var m = checkDate.getMonth() + 1
      var d = checkDate.getDate()
      var dateStr = y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (d < 10 ? '0' + d : '' + d)
      var found = false
      for (var ri = 0; ri < records.length; ri++) {
        if (records[ri].date === dateStr) { found = true; break }
      }
      if (found) {
        continuous++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return continuous
  },

  _getRecords: function() {
    try {
      var records = storageUtil.safeGetArray(CHECKIN_KEY)
      return records
    } catch(e) { return [] }
  }
}

module.exports = Checkin
