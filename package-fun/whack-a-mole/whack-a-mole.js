var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var achievement = require('../../utils/achievement.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    holes: [],
    score: 0,
    timeLeft: 30,
    gameState: 'idle',
    bestScore: 0,
    totalGames: 0,
    message: '',
    rating: '',
    ratingColor: ''
  },

  _gameTimer: null,
  _spawnTimer: null,
  _startTime: 0,
  _hitTimers: [],

  onLoad: function() {
    var best = storageUtil.get('whack_mole_best', 0)
    var total = storageUtil.get('whack_mole_total', 0)
    var holes = []
    for (var i = 0; i < 9; i++) {
      holes.push({ active: false, hit: false })
    }
    this.setData({ holes: holes, bestScore: best, totalGames: total, i18n: i18n.getToolPageTexts('whackAMole') })
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getToolPageTexts('whackAMole') })
  },

  onUnload: function() {
    this._clearAllTimers()
  },

  _clearAllTimers: function() {
    if (this._gameTimer) {
      clearInterval(this._gameTimer)
      this._gameTimer = null
    }
    if (this._spawnTimer) {
      clearInterval(this._spawnTimer)
      this._spawnTimer = null
    }
    for (var i = 0; i < this._hitTimers.length; i++) {
      clearTimeout(this._hitTimers[i])
    }
    this._hitTimers = []
  },

  _getMoleDuration: function() {
    var elapsed = (Date.now() - this._startTime) / 1000
    var duration = 1200 - elapsed * 20
    if (duration < 600) duration = 600
    return duration
  },

  _getActiveCount: function() {
    var holes = this.data.holes
    var count = 0
    for (var i = 0; i < holes.length; i++) {
      if (holes[i].active) count++
    }
    return count
  },

  _spawnMole: function() {
    if (this.data.gameState !== 'playing') return
    var activeCount = this._getActiveCount()
    if (activeCount >= 3) return

    var holes = this.data.holes
    var inactiveHoles = []
    for (var i = 0; i < holes.length; i++) {
      if (!holes[i].active) inactiveHoles.push(i)
    }
    if (inactiveHoles.length === 0) return

    var randomIndex = Math.floor(Math.random() * inactiveHoles.length)
    var holeIndex = inactiveHoles[randomIndex]

    var key = 'holes[' + holeIndex + '].active'
    var updateObj = {}
    updateObj[key] = true
    this.setData(updateObj)

    var that = this
    var duration = this._getMoleDuration()
    var timer = setTimeout(function() {
      if (that.data.gameState !== 'playing') return
      var currentHoles = that.data.holes
      if (currentHoles[holeIndex].active && !currentHoles[holeIndex].hit) {
        var hideKey = 'holes[' + holeIndex + '].active'
        var hideObj = {}
        hideObj[hideKey] = false
        that.setData(hideObj)
      }
    }, duration)
    this._hitTimers.push(timer)
  },

  _startGame: function() {
    poster.hideResultModal(this)
    this._clearAllTimers()
    var holes = []
    for (var i = 0; i < 9; i++) {
      holes.push({ active: false, hit: false })
    }
    this.setData({
      holes: holes,
      score: 0,
      timeLeft: 30,
      gameState: 'playing',
      message: this.data.i18n.whackMole,
      rating: '',
      ratingColor: ''
    })
    this._startTime = Date.now()

    var that = this
    this._gameTimer = setInterval(function() {
      var elapsed = (Date.now() - that._startTime) / 1000
      var timeLeft = Math.max(0, 30 - elapsed)
      that.setData({ timeLeft: timeLeft.toFixed(1) })
      if (elapsed >= 30) {
        that._endGame()
      }
    }, 100)

    this._spawnTimer = setInterval(function() {
      that._spawnMole()
    }, 800)

    this._spawnMole()
  },

  _endGame: function() {
    this._clearAllTimers()
    var holes = []
    for (var i = 0; i < 9; i++) {
      holes.push({ active: false, hit: false })
    }
    var score = this.data.score
    var ratingInfo = this._getRating(score)
    var best = this.data.bestScore
    if (score > best) best = score
    var total = this.data.totalGames + 1
    storageUtil.set('whack_mole_best', best)
    storageUtil.set('whack_mole_total', total)

    this.setData({
      holes: holes,
      gameState: 'result',
      timeLeft: '0.0',
      rating: ratingInfo.name,
      ratingColor: ratingInfo.color,
      bestScore: best,
      totalGames: total,
      message: this.data.i18n.gameOver
    })
    wx.vibrateShort({ type: 'heavy' })
    points.recordFunToolUse('whack-a-mole')
    var currentBest = storageUtil.get('whack_mole_best', 0)
    achievement.recordFunToolComplete('whack-a-mole', { whackMoleBestScore: currentBest })
    poster.setupForResult(this, {
      icon: '🐹', title: '打地鼠',
      mainScore: this.data.score + '分', mainScoreLabel: '最终得分',
      rating: this.data.rating,
      details: [{ label: '最佳分数', value: storageUtil.get('whack_mole_best', 0) + '分' }],
      color1: '#D97706', color2: '#92400E'
    })
  },

  _getRating: function(score) {
    if (score < 10) return { name: '初出茅庐', color: '#6B7280' }
    if (score < 15) return { name: '眼疾手快', color: '#3B82F6' }
    if (score < 20) return { name: '打鼠达人', color: '#10B981' }
    if (score < 25) return { name: '闪电猎手', color: '#F59E0B' }
    return { name: '地鼠克星', color: '#EF4444' }
  },

  startNewGame: function() {
    this._startGame()
  },

  onTapHole: function(e) {
    if (this.data.gameState !== 'playing') return
    var index = e.currentTarget.dataset.index
    var holes = this.data.holes
    var hole = holes[index]
    if (!hole.active || hole.hit) return

    var score = this.data.score + 1
    var activeKey = 'holes[' + index + '].hit'
    var updateObj = {}
    updateObj[activeKey] = true
    updateObj.score = score
    this.setData(updateObj)
    wx.vibrateShort({ type: 'light' })

    var that = this
    var timer = setTimeout(function() {
      var hideActiveKey = 'holes[' + index + '].active'
      var hideHitKey = 'holes[' + index + '].hit'
      var hideObj = {}
      hideObj[hideActiveKey] = false
      hideObj[hideHitKey] = false
      that.setData(hideObj)
    }, 300)
    this._hitTimers.push(timer)
  },

  resetStats: function() {
    storageUtil.set('whack_mole_best', 0)
    storageUtil.set('whack_mole_total', 0)
    this.setData({ bestScore: 0, totalGames: 0 })
    wx.showToast({ title: this.data.i18n.reset, icon: 'success' })
  },

  onShareAppMessage: function() {
    return { title: '🐹 打地鼠 - 我打了' + this.data.score + '只地鼠，你能超过我？', path: '/package-fun/whack-a-mole/whack-a-mole' }
  },

  onShareTimeline: function() {
    return { title: '🐹 打地鼠 - 限时30秒挑战' }
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})