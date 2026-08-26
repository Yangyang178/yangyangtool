var ACHIEVEMENT_KEY = 'unlocked_achievements'
var PROGRESS_KEY = 'achievement_progress'
var storageUtil = require('./storage.js')
var i18n = require('./i18n.js')

var ACHIEVEMENTS = [
  {
    id: 'first_use',
    name: '初来乍到',
    desc: '首次使用工具',
    enName: 'First Step',
    enDesc: 'Used a tool for the first time',
    icon: '🎯',
    condition: function(p) { return p.totalUsage >= 1 }
  },
  {
    id: 'explorer_5',
    name: '探索者',
    desc: '使用5个不同工具',
    enName: 'Explorer',
    enDesc: 'Used 5 different tools',
    icon: '🧭',
    condition: function(p) { return p.uniqueTools >= 5 }
  },
  {
    id: 'explorer_15',
    name: '全能达人',
    desc: '使用15个不同工具',
    enName: 'All-Rounder',
    enDesc: 'Used 15 different tools',
    icon: '🏆',
    condition: function(p) { return p.uniqueTools >= 15 }
  },
  {
    id: 'explorer_all',
    name: '工具大师',
    desc: '使用全部工具',
    enName: 'Tool Master',
    enDesc: 'Used all tools',
    icon: '👑',
    condition: function(p) { return p.uniqueTools >= p.totalTools }
  },
  {
    id: 'usage_50',
    name: '效率学徒',
    desc: '累计使用50次',
    enName: 'Efficiency Apprentice',
    enDesc: 'Used tools 50 times total',
    icon: '📈',
    condition: function(p) { return p.totalUsage >= 50 }
  },
  {
    id: 'usage_200',
    name: '效率专家',
    desc: '累计使用200次',
    enName: 'Efficiency Expert',
    enDesc: 'Used tools 200 times total',
    icon: '⚡',
    condition: function(p) { return p.totalUsage >= 200 }
  },
  {
    id: 'usage_1000',
    name: '效率宗师',
    desc: '累计使用1000次',
    enName: 'Efficiency Grandmaster',
    enDesc: 'Used tools 1000 times total',
    icon: '💎',
    condition: function(p) { return p.totalUsage >= 1000 }
  },
  {
    id: 'checkin_7',
    name: '坚持一周',
    desc: '连续签到7天',
    enName: 'One Week Streak',
    enDesc: 'Checked in 7 days in a row',
    icon: '🔥',
    condition: function(p) { return p.continuousDays >= 7 }
  },
  {
    id: 'checkin_30',
    name: '月度之星',
    desc: '累计签到30天',
    enName: 'Monthly Star',
    enDesc: 'Checked in 30 days total',
    icon: '🌟',
    condition: function(p) { return p.totalCheckinDays >= 30 }
  },
  {
    id: 'favorite_5',
    name: '收藏家',
    desc: '收藏5个工具',
    enName: 'Collector',
    enDesc: 'Favorited 5 tools',
    icon: '⭐',
    condition: function(p) { return p.favoriteCount >= 5 }
  },
  {
    id: 'share_first',
    name: '传播者',
    desc: '首次分享小程序',
    enName: 'Spreader',
    enDesc: 'Shared the app for the first time',
    icon: '📢',
    condition: function(p) { return p.shareCount >= 1 }
  },
  {
    id: 'share_10',
    name: '推广大使',
    desc: '分享10次',
    enName: 'Ambassador',
    enDesc: 'Shared the app 10 times',
    icon: '🎊',
    condition: function(p) { return p.shareCount >= 10 }
  },
  {
    id: 'feedback_first',
    name: '建言献策',
    desc: '首次提交反馈',
    enName: 'Contributor',
    enDesc: 'Submitted feedback for the first time',
    icon: '💬',
    condition: function(p) { return p.feedbackCount >= 1 }
  },
  {
    id: 'points_100',
    name: '小有积蓄',
    desc: '累计获得100积分',
    enName: 'Small Savings',
    enDesc: 'Earned 100 points total',
    icon: '💰',
    condition: function(p) { return p.totalEarnedPoints >= 100 }
  },
  {
    id: 'points_500',
    name: '积分大亨',
    desc: '累计获得500积分',
    enName: 'Points Tycoon',
    enDesc: 'Earned 500 points total',
    icon: '🏦',
    condition: function(p) { return p.totalEarnedPoints >= 500 }
  },
  {
    id: 'pomodoro_7',
    name: '专注达人',
    desc: '连续7天使用番茄计时',
    enName: 'Focus Master',
    enDesc: 'Used Pomodoro 7 days in a row',
    icon: '🍅',
    condition: function(p) { return p.pomodoroConsecutiveDays >= 7 }
  },
  {
    id: 'pomodoro_30',
    name: '时间管理大师',
    desc: '累计完成30个番茄钟',
    enName: 'Time Manager',
    enDesc: 'Completed 30 Pomodoro sessions',
    icon: '⏱️',
    condition: function(p) { return p.pomodoroTotalCount >= 30 }
  },
  {
    id: 'qrcode_10',
    name: '码上成功',
    desc: '生成10个二维码',
    enName: 'QR Success',
    enDesc: 'Generated 10 QR codes',
    icon: '📱',
    condition: function(p) { return p.qrcodeCount >= 10 }
  },
  {
    id: 'qrcode_50',
    name: '二维码工厂',
    desc: '生成50个二维码',
    enName: 'QR Factory',
    enDesc: 'Generated 50 QR codes',
    icon: '🏭',
    condition: function(p) { return p.qrcodeCount >= 50 }
  },
  {
    id: 'image_20',
    name: '图片工匠',
    desc: '处理20张图片',
    enName: 'Image Craftsman',
    enDesc: 'Processed 20 images',
    icon: '🖼️',
    condition: function(p) { return p.imageProcessCount >= 20 }
  },
  {
    id: 'image_100',
    name: '修图达人',
    desc: '处理100张图片',
    enName: 'Image Expert',
    enDesc: 'Processed 100 images',
    icon: '🎨',
    condition: function(p) { return p.imageProcessCount >= 100 }
  },
  {
    id: 'water_7',
    name: '水润一周',
    desc: '连续7天记录喝水',
    enName: 'Hydrated Week',
    enDesc: 'Logged water 7 days in a row',
    icon: '💧',
    condition: function(p) { return p.waterConsecutiveDays >= 7 }
  },
  {
    id: 'countdown_5',
    name: '期待满满',
    desc: '创建5个倒计时',
    enName: 'Full of Expectation',
    enDesc: 'Created 5 countdowns',
    icon: '🎉',
    condition: function(p) { return p.countdownCount >= 5 }
  },
  {
    id: 'noise_sleep',
    name: '好梦守护',
    desc: '使用白噪音10次',
    enName: 'Dream Guardian',
    enDesc: 'Used white noise 10 times',
    icon: '🌙',
    condition: function(p) { return p.noiseUseCount >= 10 }
  },
  {
    id: 'color_20',
    name: '色彩玩家',
    desc: '使用颜色转换20次',
    enName: 'Color Player',
    enDesc: 'Used color converter 20 times',
    icon: '🌈',
    condition: function(p) { return p.colorConvertCount >= 20 }
  },
  {
    id: 'text_30',
    name: '文字工匠',
    desc: '使用文本工具30次',
    enName: 'Text Craftsman',
    enDesc: 'Used text tools 30 times',
    icon: '✍️',
    condition: function(p) { return p.textToolCount >= 30 }
  },
  {
    id: 'calculator_20',
    name: '精打细算',
    desc: '使用计算工具20次',
    enName: 'Calculator Pro',
    enDesc: 'Used calculator tools 20 times',
    icon: '🧮',
    condition: function(p) { return p.calculatorCount >= 20 }
  },
  {
    id: 'fun_first',
    name: '初试身手',
    desc: '首次完成益智挑战',
    enName: 'First Try',
    enDesc: 'Completed first puzzle challenge',
    icon: '🎮',
    condition: function(p) { return p.funToolComplete >= 1 }
  },
  {
    id: 'reaction_master',
    name: '反应达人',
    desc: '反应速度测试达到"反应敏捷"评级',
    enName: 'Quick Reflexes',
    enDesc: 'Achieved "Quick" rating in reaction test',
    icon: '⚡',
    condition: function(p) { return p.reactionBestTime > 0 && p.reactionBestTime <= 300 }
  },
  {
    id: 'memory_master',
    name: '记忆大师',
    desc: '色彩记忆通过5轮以上',
    enName: 'Memory Master',
    enDesc: 'Passed 5+ rounds in color memory',
    icon: '🎨',
    condition: function(p) { return p.colorMemoryBestRound >= 5 }
  },
  {
    id: 'number_detective',
    name: '数字侦探',
    desc: '数字猜谜10次内猜中',
    enName: 'Number Detective',
    enDesc: 'Guessed the number in 10 tries or less',
    icon: '🔢',
    condition: function(p) { return p.numberGuessBestTries > 0 && p.numberGuessBestTries <= 10 }
  },
  {
    id: 'card_matcher',
    name: '翻牌高手',
    desc: '记忆翻牌20步内完成',
    enName: 'Card Matcher',
    enDesc: 'Completed memory cards in 20 moves or less',
    icon: '🃏',
    condition: function(p) { return p.memoryCardBestMoves > 0 && p.memoryCardBestMoves <= 20 }
  },
  {
    id: 'click_frenzy',
    name: '闪电手速',
    desc: '疯狂点击CPS达到7以上',
    enName: 'Lightning Hands',
    enDesc: 'Achieved 7+ CPS in crazy click',
    icon: '👆',
    condition: function(p) { return p.crazyClickBestCPS >= 7 }
  },
  {
    id: 'maze_runner',
    name: '迷宫探索者',
    desc: '迷宫通关3次',
    enName: 'Maze Explorer',
    enDesc: 'Completed 3 mazes',
    icon: '🏰',
    condition: function(p) { return p.mazeWins >= 3 }
  },
  {
    id: 'fun_explorer',
    name: '益智全才',
    desc: '体验8种不同的益智工具',
    enName: 'Puzzle All-Rounder',
    enDesc: 'Tried 8 different puzzle tools',
    icon: '🧠',
    condition: function(p) { return p.funToolUnique >= 8 }
  }
]

var Achievement = {
  getAll: function() {
    return ACHIEVEMENTS
  },

  getUnlocked: function() {
    try {
      return storageUtil.safeGetArray(ACHIEVEMENT_KEY)
    } catch(e) { return [] }
  },

  checkAndUnlock: function(progressData) {
    var unlocked = this.getUnlocked()
    var newAchievements = []
    var totalTools = progressData.totalTools || 25

    var fullProgress = {}
    for (var k in progressData) {
      fullProgress[k] = progressData[k]
    }
    fullProgress.totalTools = totalTools

    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var ach = ACHIEVEMENTS[i]
      var alreadyUnlocked = false
      for (var j = 0; j < unlocked.length; j++) {
        if (unlocked[j] === ach.id) { alreadyUnlocked = true; break }
      }
      if (alreadyUnlocked) continue

      try {
        if (ach.condition(fullProgress)) {
          unlocked.push(ach.id)
          var lang = i18n.getLanguage()
          var displayName = lang === 'en' && ach.enName ? ach.enName : ach.name
          var displayDesc = lang === 'en' && ach.enDesc ? ach.enDesc : ach.desc
          newAchievements.push({
            id: ach.id,
            name: displayName,
            desc: displayDesc,
            icon: ach.icon
          })
        }
      } catch(e) {}
    }

    if (newAchievements.length > 0) {
      try {
        wx.setStorageSync(ACHIEVEMENT_KEY, unlocked)
      } catch(e) {}
    }

    return newAchievements
  },

  getProgress: function() {
    try {
      return storageUtil.get(PROGRESS_KEY, {})
    } catch(e) { return {} }
  },

  updateProgress: function(updates) {
    var progress = this.getProgress()
    for (var key in updates) {
      progress[key] = updates[key]
    }
    try {
      wx.setStorageSync(PROGRESS_KEY, progress)
    } catch(e) {}
    return this.checkAndUnlock(progress)
  },

  getStats: function() {
    var unlocked = this.getUnlocked()
    return {
      total: ACHIEVEMENTS.length,
      unlocked: unlocked.length,
      percent: ACHIEVEMENTS.length > 0 ? Math.round((unlocked.length / ACHIEVEMENTS.length) * 100) : 0
    }
  },

  getAchievementList: function() {
    var unlocked = this.getUnlocked()
    var lang = i18n.getLanguage()
    var list = []
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var ach = ACHIEVEMENTS[i]
      var isUnlocked = false
      for (var j = 0; j < unlocked.length; j++) {
        if (unlocked[j] === ach.id) { isUnlocked = true; break }
      }
      var displayName = lang === 'en' && ach.enName ? ach.enName : ach.name
      var displayDesc = lang === 'en' && ach.enDesc ? ach.enDesc : ach.desc
      list.push({
        id: ach.id,
        name: displayName,
        desc: displayDesc,
        icon: ach.icon,
        unlocked: isUnlocked
      })
    }
    return list
  },

  recordShare: function() {
    var progress = this.getProgress()
    progress.shareCount = (progress.shareCount || 0) + 1
    return this.updateProgress(progress)
  },

  recordFeedback: function() {
    var progress = this.getProgress()
    progress.feedbackCount = (progress.feedbackCount || 0) + 1
    return this.updateProgress(progress)
  },

  recordToolAction: function(actionKey) {
    var progress = this.getProgress()
    progress[actionKey] = (progress[actionKey] || 0) + 1
    return this.updateProgress(progress)
  },

  recordPomodoro: function() {
    var progress = this.getProgress()
    progress.pomodoroTotalCount = (progress.pomodoroTotalCount || 0) + 1

    var today = this._getToday()
    var lastDate = progress.pomodoroLastDate || ''
    if (lastDate === today) {
      return this.updateProgress(progress)
    }

    progress.pomodoroLastDate = today
    var yesterday = this._getYesterday()
    if (lastDate === yesterday) {
      progress.pomodoroConsecutiveDays = (progress.pomodoroConsecutiveDays || 0) + 1
    } else {
      progress.pomodoroConsecutiveDays = 1
    }

    return this.updateProgress(progress)
  },

  recordWater: function() {
    var progress = this.getProgress()
    var today = this._getToday()
    var lastDate = progress.waterLastDate || ''
    if (lastDate === today) {
      return this.updateProgress(progress)
    }

    progress.waterLastDate = today
    var yesterday = this._getYesterday()
    if (lastDate === yesterday) {
      progress.waterConsecutiveDays = (progress.waterConsecutiveDays || 0) + 1
    } else {
      progress.waterConsecutiveDays = 1
    }

    return this.updateProgress(progress)
  },

  recordQRCode: function() {
    return this.recordToolAction('qrcodeCount')
  },

  recordImageProcess: function() {
    return this.recordToolAction('imageProcessCount')
  },

  recordCountdown: function() {
    return this.recordToolAction('countdownCount')
  },

  recordNoise: function() {
    return this.recordToolAction('noiseUseCount')
  },

  recordColorConvert: function() {
    return this.recordToolAction('colorConvertCount')
  },

  recordTextTool: function() {
    return this.recordToolAction('textToolCount')
  },

  recordCalculator: function() {
    return this.recordToolAction('calculatorCount')
  },

  recordFunToolComplete: function(toolId, extraData) {
    var progress = this.getProgress()
    progress.funToolComplete = (progress.funToolComplete || 0) + 1

    // 记录体验过的不同益智工具
    var funToolSet = progress.funToolSet || {}
    funToolSet[toolId] = true
    progress.funToolSet = funToolSet
    var uniqueCount = 0
    for (var k in funToolSet) { uniqueCount++ }
    progress.funToolUnique = uniqueCount

    // 合并额外数据（各工具的best记录）
    if (extraData) {
      for (var key in extraData) {
        progress[key] = extraData[key]
      }
    }

    return this.updateProgress(progress)
  },

  getShareCardData: function(achievementId) {
    var unlocked = this.getUnlocked()
    var isUnlocked = false
    for (var i = 0; i < unlocked.length; i++) {
      if (unlocked[i] === achievementId) { isUnlocked = true; break }
    }
    if (!isUnlocked) return null

    var ach = null
    for (var j = 0; j < ACHIEVEMENTS.length; j++) {
      if (ACHIEVEMENTS[j].id === achievementId) { ach = ACHIEVEMENTS[j]; break }
    }
    if (!ach) return null

    var lang = i18n.getLanguage()
    var displayName = lang === 'en' && ach.enName ? ach.enName : ach.name
    var displayDesc = lang === 'en' && ach.enDesc ? ach.enDesc : ach.desc

    var stats = this.getStats()
    var profile = storageUtil.get('userProfile', {})

    return {
      id: ach.id,
      name: displayName,
      desc: displayDesc,
      icon: ach.icon,
      unlockedCount: stats.unlocked,
      totalCount: stats.total,
      nickname: profile.nickname || '微信用户',
      date: this._getToday()
    }
  },

  _getToday: function() {
    var d = new Date()
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
  },

  _getYesterday: function() {
    var d = new Date()
    d.setDate(d.getDate() - 1)
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
  },

  syncFromStorage: function() {
    var checkin = require('./checkin.js')
    var totalUsage = storageUtil.get('totalUsageCount', 0)
    var recentTools = storageUtil.safeGetArray('recentTools')
    var favorites = storageUtil.safeGetArray('favorites')
    var feedbackHistory = storageUtil.safeGetArray('feedbackHistory')

    var uniqueToolIds = {}
    for (var i = 0; i < recentTools.length; i++) {
      uniqueToolIds[recentTools[i].id] = true
    }
    var uniqueTools = 0
    for (var id in uniqueToolIds) { uniqueTools++ }

    var toolsData = require('../data/tools.js')
    var totalTools = toolsData.tools ? toolsData.tools.length : 25

    var progress = {
      totalUsage: totalUsage,
      uniqueTools: uniqueTools,
      totalTools: totalTools,
      continuousDays: checkin.getContinuousDays(),
      totalCheckinDays: checkin.getRecentRecords(90).length,
      favoriteCount: Array.isArray(favorites) ? favorites.length : 0,
      shareCount: this.getProgress().shareCount || 0,
      feedbackCount: feedbackHistory.length,
      totalEarnedPoints: checkin.getTotalEarnedPoints()
    }

    return this.updateProgress(progress)
  }
}

module.exports = Achievement
