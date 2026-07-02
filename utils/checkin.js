var CHECKIN_KEY = 'checkin_records'
var POINTS_KEY = 'user_points'
var TOTAL_POINTS_KEY = 'total_earned_points'
var MILESTONE_KEY = 'milestone_claimed'
var MAKEUP_KEY = 'makeup_cards'
var storageUtil = require('./storage.js')
var i18n = require('./i18n.js')

var BASE_POINTS = 10
// 连续签到奖励：第1天10，第2天15，第3天20，第4天25，第5天30，第6天40，第7天60
var CONTINUOUS_BONUS = [0, 0, 5, 10, 15, 20, 30, 50]
// 7天循环后进入倍增模式：第2轮×1.5，第3轮×2，第4轮×2.5...
var CYCLE_MULTIPLIER_BASE = 1.5

// 里程碑奖励：累计签到天数 → 奖励积分
var MILESTONES = [
  { days: 7,   points: 50,  icon: '🎁', nameKey: 'ms7' },
  { days: 14,  points: 100, icon: '🎊', nameKey: 'ms14' },
  { days: 30,  points: 200, icon: '🏆', nameKey: 'ms30' },
  { days: 60,  points: 400, icon: '💎', nameKey: 'ms60' },
  { days: 100, points: 800, icon: '👑', nameKey: 'ms100' },
  { days: 365, points: 3650, icon: '🌟', nameKey: 'ms365' }
]

// 宝箱等级及概率
var CHEST_RATES = [
  { type: 'common',    nameKey: 'chestCommon',    icon: '📦', minPoints: 5,  maxPoints: 15,  rate: 50, makeupChance: 0 },
  { type: 'rare',      nameKey: 'chestRare',      icon: '💎', minPoints: 15, maxPoints: 40,  rate: 30, makeupChance: 10 },
  { type: 'epic',      nameKey: 'chestEpic',      icon: '🔮', minPoints: 40, maxPoints: 80,  rate: 15, makeupChance: 20 },
  { type: 'legendary', nameKey: 'chestLegendary',  icon: '👑', minPoints: 80, maxPoints: 200, rate: 5,  makeupChance: 50 }
]

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

    var continuousDays = this._calcContinuousDays(records, today) + 1
    var totalDays = records.length + 1

    // 计算连续签到奖励
    var cycleDay = continuousDays % 7
    if (cycleDay === 0) cycleDay = 7
    var cycleRound = Math.floor((continuousDays - 1) / 7) // 第几轮7天
    var bonus = 0
    if (cycleDay >= 2 && cycleDay <= 7) {
      bonus = CONTINUOUS_BONUS[cycleDay] || 0
    }
    // 倍增模式：第2轮开始每轮×1.5的递增
    if (cycleRound >= 1) {
      var multiplier = 1 + (CYCLE_MULTIPLIER_BASE - 1) * cycleRound
      bonus = Math.round(bonus * multiplier)
    }

    // 抽宝箱
    var chest = this._drawChest(continuousDays)

    var totalPoints = BASE_POINTS + bonus + chest.points

    records.unshift({
      date: today,
      points: totalPoints,
      continuousDays: continuousDays,
      chest: chest.type,
      chestPoints: chest.points
    })
    if (records.length > 90) records = records.slice(0, 90)
    storageUtil.safeSet(CHECKIN_KEY, records)

    var currentPoints = (storageUtil.get(POINTS_KEY, 0) || 0) + totalPoints
    var totalEarned = (storageUtil.get(TOTAL_POINTS_KEY, 0) || 0) + totalPoints
    storageUtil.safeSet(POINTS_KEY, currentPoints)
    storageUtil.safeSet(TOTAL_POINTS_KEY, totalEarned)

    // 检查里程碑
    var newMilestones = this._checkMilestones(totalDays)

    return {
      success: true,
      points: totalPoints,
      basePoints: BASE_POINTS,
      bonus: bonus,
      continuousDays: continuousDays,
      totalDays: totalDays,
      chest: chest,
      newMilestones: newMilestones,
      message: i18n.t('checkinSuccessTitle')
    }
  },

  // 抽宝箱
  _drawChest: function(continuousDays) {
    // 连续签到天数越多，宝箱概率越好
    var luckBonus = Math.min(continuousDays * 2, 30) // 最多+30%概率
    var rand = Math.random() * 100
    var accumulated = 0
    var selectedChest = CHEST_RATES[0]
    // 调整后的概率：传说和史诗概率提升
    var adjustedRates = []
    for (var i = 0; i < CHEST_RATES.length; i++) {
      if (i >= 2) { // epic和legendary
        adjustedRates.push(CHEST_RATES[i].rate + luckBonus / 2)
      } else {
        adjustedRates.push(CHEST_RATES[i].rate - luckBonus / 4)
      }
    }
    // 归一化
    var total = 0
    for (var j = 0; j < adjustedRates.length; j++) total += adjustedRates[j]
    for (var k = 0; k < adjustedRates.length; k++) adjustedRates[k] = adjustedRates[k] / total * 100

    for (var m = 0; m < CHEST_RATES.length; m++) {
      accumulated += adjustedRates[m]
      if (rand < accumulated) {
        selectedChest = CHEST_RATES[m]
        break
      }
    }
    var points = selectedChest.minPoints + Math.floor(Math.random() * (selectedChest.maxPoints - selectedChest.minPoints + 1))

    // 补签卡掉落
    var makeupDrop = false
    if (Math.random() * 100 < selectedChest.makeupChance) {
      makeupDrop = true
      this._addMakeupCard(1)
    }

    return {
      type: selectedChest.type,
      name: i18n.t(selectedChest.nameKey),
      icon: selectedChest.icon,
      points: points,
      makeupDrop: makeupDrop
    }
  },

  // 检查里程碑
  _checkMilestones: function(totalDays) {
    var claimed = storageUtil.safeGetArray(MILESTONE_KEY)
    var newMilestones = []
    for (var i = 0; i < MILESTONES.length; i++) {
      if (totalDays >= MILESTONES[i].days) {
        var alreadyClaimed = false
        for (var j = 0; j < claimed.length; j++) {
          if (claimed[j] === MILESTONES[i].days) { alreadyClaimed = true; break }
        }
        if (!alreadyClaimed) {
          newMilestones.push({
            days: MILESTONES[i].days,
            points: MILESTONES[i].points,
            icon: MILESTONES[i].icon,
            name: i18n.t(MILESTONES[i].nameKey)
          })
          claimed.push(MILESTONES[i].days)
        }
      }
    }
    if (newMilestones.length > 0) {
      wx.setStorageSync(MILESTONE_KEY, claimed)
    }
    return newMilestones
  },

  // 领取里程碑奖励
  claimMilestone: function(days) {
    var milestone = null
    for (var i = 0; i < MILESTONES.length; i++) {
      if (MILESTONES[i].days === days) { milestone = MILESTONES[i]; break }
    }
    if (!milestone) return { success: false, message: i18n.t('msNotExist') }
    var claimed = storageUtil.safeGetArray(MILESTONE_KEY)
    var alreadyClaimed = false
    for (var j = 0; j < claimed.length; j++) {
      if (claimed[j] === days) { alreadyClaimed = true; break }
    }
    if (alreadyClaimed) return { success: false, message: i18n.t('msAlreadyClaimed') }
    claimed.push(days)
    wx.setStorageSync(MILESTONE_KEY, claimed)
    var currentPoints = (storageUtil.get(POINTS_KEY, 0) || 0) + milestone.points
    var totalEarned = (storageUtil.get(TOTAL_POINTS_KEY, 0) || 0) + milestone.points
    storageUtil.safeSet(POINTS_KEY, currentPoints)
    storageUtil.safeSet(TOTAL_POINTS_KEY, totalEarned)
    return { success: true, points: milestone.points, milestone: { days: milestone.days, points: milestone.points, icon: milestone.icon, name: i18n.t(milestone.nameKey) } }
  },

  // 获取里程碑列表
  getMilestones: function() {
    var records = this._getRecords()
    var totalDays = records.length
    var claimed = storageUtil.safeGetArray(MILESTONE_KEY)
    var result = []
    for (var i = 0; i < MILESTONES.length; i++) {
      var isClaimed = false
      for (var j = 0; j < claimed.length; j++) {
        if (claimed[j] === MILESTONES[i].days) { isClaimed = true; break }
      }
      result.push({
        days: MILESTONES[i].days,
        points: MILESTONES[i].points,
        icon: MILESTONES[i].icon,
        name: i18n.t(MILESTONES[i].nameKey),
        reached: totalDays >= MILESTONES[i].days,
        claimed: isClaimed,
        progress: Math.min(totalDays, MILESTONES[i].days),
        total: MILESTONES[i].days
      })
    }
    return result
  },

  // 补签卡
  getMakeupCards: function() {
    return storageUtil.get(MAKEUP_KEY, 0)
  },

  _addMakeupCard: function(count) {
    var current = storageUtil.get(MAKEUP_KEY, 0)
    storageUtil.safeSet(MAKEUP_KEY, current + count)
  },

  // 补签：使用补签卡补签昨天
  makeupCheckin: function() {
    var cards = this.getMakeupCards()
    if (cards <= 0) return { success: false, message: i18n.t('makeupNoCard') }
    var yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    var y = yesterday.getFullYear()
    var m = yesterday.getMonth() + 1
    var d = yesterday.getDate()
    var yesterdayStr = y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (d < 10 ? '0' + d : '' + d)
    var records = this._getRecords()
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === yesterdayStr) return { success: false, message: i18n.t('makeupAlready') }
    }
    // 扣除补签卡
    storageUtil.safeSet(MAKEUP_KEY, cards - 1)
    // 执行补签（基础积分）
    var makeupPoints = BASE_POINTS
    var continuousDays = this._calcContinuousDays(records, yesterdayStr) + 1
    records.unshift({ date: yesterdayStr, points: makeupPoints, continuousDays: continuousDays, isMakeup: true })
    if (records.length > 90) records = records.slice(0, 90)
    storageUtil.safeSet(CHECKIN_KEY, records)
    var currentPoints = (storageUtil.get(POINTS_KEY, 0) || 0) + makeupPoints
    var totalEarned = (storageUtil.get(TOTAL_POINTS_KEY, 0) || 0) + makeupPoints
    storageUtil.safeSet(POINTS_KEY, currentPoints)
    storageUtil.safeSet(TOTAL_POINTS_KEY, totalEarned)
    return { success: true, points: makeupPoints, continuousDays: continuousDays }
  },

  isCheckedToday: function() {
    var today = this.getToday()
    var records = this._getRecords()
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === today) return true
    }
    return false
  },

  canMakeupYesterday: function() {
    if (this.getMakeupCards() <= 0) return false
    var yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    var y = yesterday.getFullYear()
    var m = yesterday.getMonth() + 1
    var d = yesterday.getDate()
    var yesterdayStr = y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (d < 10 ? '0' + d : '' + d)
    var records = this._getRecords()
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === yesterdayStr) return false
    }
    return true
  },

  getContinuousDays: function() {
    var today = this.getToday()
    var records = this._getRecords()
    return this._calcContinuousDays(records, today)
  },

  getTotalDays: function() {
    return this._getRecords().length
  },

  getCurrentPoints: function() {
    return storageUtil.get(POINTS_KEY, 0)
  },

  getTotalEarnedPoints: function() {
    return storageUtil.get(TOTAL_POINTS_KEY, 0)
  },

  spendPoints: function(amount) {
    var current = this.getCurrentPoints()
    if (current < amount) return { success: false, message: i18n.t('pointsNotEnough') }
    storageUtil.safeSet(POINTS_KEY, current - amount)
    return { success: true, remaining: current - amount }
  },

  getRecentRecords: function(count) {
    var records = this._getRecords()
    return records.slice(0, count || 7)
  },

  getWeekSummary: function() {
    var records = this._getRecords()
    var today = new Date()
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
