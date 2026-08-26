var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var achievement = require('../../utils/achievement.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝']

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    cards: [],
    moves: 0,
    matchedPairs: 0,
    totalPairs: 8,
    timeElapsed: 0,
    gameState: 'idle',
    bestMoves: 0,
    bestTime: 0,
    totalWins: 0,
    message: ''
  },
  _firstCard: -1,
  _secondCard: -1,
  _isChecking: false,
  _timer: null,
  _startTime: 0,

  onLoad: function() {
    var best = storageUtil.get('memory_card_best_moves', 0)
    var bestTime = storageUtil.get('memory_card_best_time', 0)
    var wins = storageUtil.get('memory_card_wins', 0)
    this.setData({ bestMoves: best, bestTime: bestTime, totalWins: wins, i18n: i18n.getToolPageTexts('memoryCard') })
    this._newGame()
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
    poster.setupForPage(this)
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getToolPageTexts('memoryCard') })
  },

  onUnload: function() {
    if (this._timer) clearInterval(this._timer)
  },

  _newGame: function() {
    poster.hideResultModal(this)
    if (this._timer) clearInterval(this._timer)
    var pairs = []
    for (var i = 0; i < EMOJIS.length; i++) {
      pairs.push({ emoji: EMOJIS[i], pairId: i })
      pairs.push({ emoji: EMOJIS[i], pairId: i })
    }
    for (var j = pairs.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1))
      var temp = pairs[j]
      pairs[j] = pairs[k]
      pairs[k] = temp
    }
    var cards = []
    for (var m = 0; m < pairs.length; m++) {
      cards.push({
        id: m,
        emoji: pairs[m].emoji,
        pairId: pairs[m].pairId,
        faceUp: false,
        matched: false
      })
    }
    this._firstCard = -1
    this._secondCard = -1
    this._isChecking = false
    this._startTime = 0
    this.setData({
      cards: cards,
      moves: 0,
      matchedPairs: 0,
      timeElapsed: 0,
      gameState: 'idle',
      message: this.data.i18n.tapToStart || '点击翻牌开始游戏'
    })
  },

  onTapCard: function(e) {
    if (this._isChecking) return
    var index = e.currentTarget.dataset.index
    var cards = this.data.cards
    if (index < 0 || index >= cards.length) return
    if (cards[index].faceUp || cards[index].matched) return

    if (this.data.gameState === 'idle') {
      this.setData({ gameState: 'playing', message: this.data.i18n.findAllPairs })
      this._startTime = Date.now()
      var that = this
      this._timer = setInterval(function() {
        that.setData({ timeElapsed: Math.floor((Date.now() - that._startTime) / 1000) })
      }, 1000)
    }

    cards[index].faceUp = true
    this.setData({ cards: cards })
    wx.vibrateShort({ type: 'light' })

    if (this._firstCard === -1) {
      this._firstCard = index
    } else {
      this._secondCard = index
      this.setData({ moves: this.data.moves + 1 })
      this._checkMatch()
    }
  },

  _checkMatch: function() {
    var cards = this.data.cards
    var first = cards[this._firstCard]
    var second = cards[this._secondCard]
    var that = this

    if (first.pairId === second.pairId) {
      first.matched = true
      second.matched = true
      this.setData({ cards: cards, matchedPairs: this.data.matchedPairs + 1 })
      wx.vibrateShort({ type: 'medium' })
      this._firstCard = -1
      this._secondCard = -1

      if (this.data.matchedPairs >= this.data.totalPairs) {
        this._gameWon()
      }
    } else {
      this._isChecking = true
      setTimeout(function() {
        cards[that._firstCard].faceUp = false
        cards[that._secondCard].faceUp = false
        that.setData({ cards: cards })
        that._firstCard = -1
        that._secondCard = -1
        that._isChecking = false
      }, 800)
    }
  },

  _gameWon: function() {
    if (this._timer) clearInterval(this._timer)
    var timeElapsed = this.data.timeElapsed
    var moves = this.data.moves
    var best = this.data.bestMoves
    var bestTime = this.data.bestTime
    if (best === 0 || moves < best) best = moves
    if (bestTime === 0 || timeElapsed < bestTime) bestTime = timeElapsed
    var wins = this.data.totalWins + 1
    storageUtil.set('memory_card_best_moves', best)
    storageUtil.set('memory_card_best_time', bestTime)
    storageUtil.set('memory_card_wins', wins)
    this.setData({
      gameState: 'won',
      message: this.data.i18n.congratulations + moves + '步 · ' + timeElapsed + '秒',
      bestMoves: best,
      bestTime: bestTime,
      totalWins: wins
    })
    wx.vibrateShort({ type: 'heavy' })
    points.recordFunToolUse('memory-card')
    var currentBest = storageUtil.get('memory_card_best_moves', 0)
    achievement.recordFunToolComplete('memory-card', { memoryCardBestMoves: currentBest })
    poster.setupForResult(this, {
      icon: '🃏', title: '记忆翻牌',
      mainScore: this.data.moves + '步', mainScoreLabel: '完成步数',
      rating: this.data.moves <= 20 ? '翻牌高手' : '记忆达人',
      details: [
        { label: '用时', value: this.data.timeElapsed + '秒' },
        { label: '最佳步数', value: storageUtil.get('memory_card_best_moves', 0) + '步' }
      ],
      color1: '#EC4899', color2: '#DB2777'
    })
  },

  startNewGame: function() {
    this._newGame()
    wx.showToast({ title: this.data.i18n.newGameStart, icon: 'success' })
  },

  resetStats: function() {
    storageUtil.set('memory_card_best_moves', 0)
    storageUtil.set('memory_card_best_time', 0)
    storageUtil.set('memory_card_wins', 0)
    this.setData({ bestMoves: 0, bestTime: 0, totalWins: 0 })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🃏 记忆翻牌 - 我' + this.data.moves + '步完成，你来挑战？', '/package-fun/memory-card/memory-card')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🃏 记忆翻牌 - 测测你的记忆力')
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})