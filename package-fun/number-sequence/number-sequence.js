var i18n = require('../../utils/i18n.js')
var storage = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var poster = require('../utils/poster.js')

var DIFFICULTY_MAP = {
  easy: { count: 9, cols: 3, memorizeSec: 3 },
  normal: { count: 16, cols: 4, memorizeSec: 5 },
  hard: { count: 25, cols: 5, memorizeSec: 8 }
}

Page({
  data: {
    gameState: 'idle',
    difficulty: 'normal',
    difficultyText: '',
    numbers: 16,
    nextNumber: 1,
    gridCols: 4,
    gridNumbers: [],
    formattedTime: '0.0',
    usedTime: 0,
    wrongCount: 0,
    bestTime: 0,
    totalGames: 0,
    isNewRecord: false,
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    i18n: {},
    showResultModal: false,
    _posterPath: '',
    _resultData: {},
    memorizeCountdown: 0,
    memorizeElapsed: '0.0',
    numbersHidden: false
  },

  onLoad: function() {
    var app = getApp()
    var i18nData = i18n.getToolPageTexts('numberSequence')
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: app.globalData.fontSizeSetting || 'medium',
      i18n: i18nData,
      difficultyText: this._getDiffText('normal', i18nData)
    })
    this._loadStats()
    poster.setupForPage(this)
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    var i18nData = i18n.getToolPageTexts('numberSequence')
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: storage.get('fontSizeSetting', 'medium'),
      themeStyle: themeStyle,
      fontClass: fontClass,
      i18n: i18nData,
      difficultyText: this._getDiffText(this.data.difficulty, i18nData)
    })
  },

  onUnload: function() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    if (this._memorizeTimer) {
      clearInterval(this._memorizeTimer)
      this._memorizeTimer = null
    }
  },

  _getDiffText: function(diff, i18nData) {
    if (!i18nData) i18nData = this.data.i18n
    if (diff === 'easy') return i18nData.easy
    if (diff === 'hard') return i18nData.hard
    return i18nData.normal
  },

  _loadStats: function() {
    var best = storage.get('ns_best_' + this.data.difficulty, 0)
    var total = storage.get('ns_total', 0)
    this.setData({ bestTime: best, totalGames: total })
  },

  setDifficulty: function(e) {
    var diff = e.currentTarget.dataset.diff
    this.setData({
      difficulty: diff,
      numbers: DIFFICULTY_MAP[diff].count,
      difficultyText: this._getDiffText(diff)
    })
    this._loadStats()
  },

  startGame: function() {
    poster.hideResultModal(this)
    var diff = this.data.difficulty
    var config = DIFFICULTY_MAP[diff]
    var count = config.count
    var cols = config.cols

    // 清理可能存在的旧计时器
    if (this._timer) { clearInterval(this._timer); this._timer = null }
    if (this._memorizeTimer) { clearInterval(this._memorizeTimer); this._memorizeTimer = null }

    // 生成数字列表（不再用百分比定位，改用 CSS Grid）
    var nums = []
    for (var i = 0; i < count; i++) {
      nums.push(i + 1)
    }

    // 打乱顺序
    for (var k = nums.length - 1; k > 0; k--) {
      var si = Math.floor(Math.random() * (k + 1))
      var tmp = nums[k]
      nums[k] = nums[si]
      nums[si] = tmp
    }

    // 分配数字
    var gridNumbers = []
    for (var p = 0; p < count; p++) {
      gridNumbers.push({ num: nums[p], tapped: false, wrong: false })
    }

    // 进入记忆阶段
    this.setData({
      gameState: 'memorizing',
      numbers: count,
      gridCols: cols,
      nextNumber: 1,
      gridNumbers: gridNumbers,
      formattedTime: '0.0',
      usedTime: 0,
      wrongCount: 0,
      isNewRecord: false,
      numbersHidden: false,
      memorizeCountdown: 0,
      memorizeElapsed: '0.0'
    })
    this._startMemorizeTimer()
  },

  // 记忆阶段计时器（记录已记忆时长，不自动结束）
  _startMemorizeTimer: function() {
    var that = this
    var elapsed = 0
    this._memorizeStartTime = Date.now()
    this._memorizeTimer = setInterval(function() {
      elapsed = (Date.now() - that._memorizeStartTime) / 1000
      that.setData({ memorizeElapsed: elapsed.toFixed(1) })
    }, 100)
  },

  // 手动切换数字显示/隐藏（仅在 playing 状态可用，作为辅助功能）
  toggleNumbersVisible: function() {
    if (this.data.gameState !== 'playing') return
    // 切换为显示会重置错误惩罚：每次手动显示再隐藏后游戏继续
    this.setData({ numbersHidden: !this.data.numbersHidden })
  },

  // 用户主动开始挑战（结束记忆阶段）
  startChallenge: function() {
    if (this.data.gameState !== 'memorizing') return
    if (this._memorizeTimer) {
      clearInterval(this._memorizeTimer)
      this._memorizeTimer = null
    }
    wx.vibrateShort({ type: 'medium' })
    this.setData({
      gameState: 'playing',
      numbersHidden: true,
      memorizeCountdown: 0,
      memorizeElapsed: '0.0'
    })
    this._startTimer()
  },

  _startTimer: function() {
    var that = this
    this._startTime = Date.now()
    this._timer = setInterval(function() {
      var elapsed = (Date.now() - that._startTime) / 1000
      that.setData({ formattedTime: elapsed.toFixed(1) })
    }, 100)
  },

  _stopTimer: function() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    var elapsed = (Date.now() - this._startTime) / 1000
    this.setData({ usedTime: Math.round(elapsed * 10) / 10 })
  },

  onNumberTap: function(e) {
    if (this.data.gameState !== 'playing') return
    var index = e.currentTarget.dataset.index
    var item = this.data.gridNumbers[index]
    if (item.tapped) return

    if (item.num === this.data.nextNumber) {
      var gridNumbers = this.data.gridNumbers
      gridNumbers[index].tapped = true
      var nextNum = this.data.nextNumber + 1
      this.setData({ gridNumbers: gridNumbers, nextNumber: nextNum })
      if (nextNum > this.data.numbers) {
        this._finishGame()
      }
    } else {
      var gridNumbers2 = this.data.gridNumbers.slice()
      gridNumbers2[index].wrong = true
      var newWrong = this.data.wrongCount + 1
      this.setData({ gridNumbers: gridNumbers2, wrongCount: newWrong })
      var that = this
      setTimeout(function() {
        var grid = that.data.gridNumbers.slice()
        grid[index].wrong = false
        that.setData({ gridNumbers: grid })
      }, 300)
    }
  },

  _finishGame: function() {
    this._stopTimer()
    this._checkRecord()

    // 记录总游戏次数
    var total = this.data.totalGames + 1
    storage.set('ns_total', total)
    this.setData({ totalGames: total })

    // 记录积分
    points.recordFunToolUse('number-sequence')

    // 计算评级
    var rating = ''
    var usedTime = this.data.usedTime
    var wrongCount = this.data.wrongCount
    var count = this.data.numbers
    if (wrongCount === 0 && usedTime < count * 1.5) rating = '专注大师'
    else if (wrongCount <= 1 && usedTime < count * 2) rating = '反应敏捷'
    else if (wrongCount <= 3) rating = '表现不错'
    else rating = '继续加油'

    this.setData({ gameState: 'idle' })

    // 弹出结果海报
    poster.setupForResult(this, {
      icon: '🔢',
      title: '数字顺序记忆',
      mainScore: usedTime + '秒',
      mainScoreLabel: '完成用时',
      rating: rating,
      details: [
        { label: '数字数量', value: count + '个' },
        { label: '错误次数', value: wrongCount + '次' },
        { label: '难度等级', value: this.data.difficultyText },
        { label: '最佳记录', value: this.data.bestTime + '秒' }
      ],
      color1: '#3B82F6',
      color2: '#6366F1'
    })
  },

  _checkRecord: function() {
    var usedTime = this.data.usedTime
    var bestKey = 'ns_best_' + this.data.difficulty
    var best = storage.get(bestKey, 0)
    if (best === 0 || usedTime < best) {
      storage.set(bestKey, usedTime)
      this.setData({ bestTime: usedTime, isNewRecord: true })
    }
  },

  resetStats: function() {
    storage.set('ns_best_easy', 0)
    storage.set('ns_best_normal', 0)
    storage.set('ns_best_hard', 0)
    storage.set('ns_total', 0)
    this.setData({ bestTime: 0, totalGames: 0 })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig(
      '🔢 数字顺序记忆 - 我用' + this.data.usedTime + '秒完成，你能超过我吗？',
      '/package-fun/number-sequence/number-sequence'
    )
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('🔢 数字顺序记忆 - 测测你的专注力')
  },

  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})
