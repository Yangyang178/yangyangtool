var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var achievement = require('../../utils/achievement.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var COLORS = [
  { id: 0, name: '红', color: '#EF4444', active: '#FCA5A5' },
  { id: 1, name: '蓝', color: '#3B82F6', active: '#93C5FD' },
  { id: 2, name: '绿', color: '#10B981', active: '#6EE7B7' },
  { id: 3, name: '黄', color: '#F59E0B', active: '#FCD34D' }
]

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    colors: COLORS,
    activeColor: -1,
    level: 0,
    bestLevel: 0,
    totalGames: 0,
    state: 'idle',
    stateText: '',
    playerIndex: 0,
    isPlaying: false
  },
  _sequence: [],
  _showTimer: null,

  onLoad: function() {
    var best = storageUtil.get('color_memory_best', 0)
    var total = storageUtil.get('color_memory_total', 0)
    this.setData({ bestLevel: best, totalGames: total, i18n: i18n.getToolPageTexts('colorMemory') })
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getToolPageTexts('colorMemory') })
  },

  onUnload: function() {
    this._clearTimers()
  },

  _clearTimers: function() {
    if (this._showTimer) { clearTimeout(this._showTimer); this._showTimer = null }
  },

  startGame: function() {
    poster.hideResultModal(this)
    this._sequence = []
    this.setData({ level: 0, state: 'idle', playerIndex: 0, isPlaying: true })
    this._nextRound()
  },

  _nextRound: function() {
    var nextColor = Math.floor(Math.random() * 4)
    this._sequence.push(nextColor)
    var level = this._sequence.length
    this.setData({ level: level, state: 'showing', stateText: this.data.i18n.observeSequence })
    this._showSequence(0)
  },

  _showSequence: function(index) {
    var that = this
    if (index >= this._sequence.length) {
      that.setData({ activeColor: -1, state: 'playing', stateText: that.data.i18n.yourTurn + '0/' + that._sequence.length + ')', playerIndex: 0 })
      return
    }
    var colorId = this._sequence[index]
    that.setData({ activeColor: colorId })
    wx.vibrateShort({ type: 'light' })
    that._showTimer = setTimeout(function() {
      that.setData({ activeColor: -1 })
      that._showTimer = setTimeout(function() {
        that._showSequence(index + 1)
      }, 200)
    }, 500)
  },

  onTapColor: function(e) {
    if (this.data.state !== 'playing') return
    var colorId = e.currentTarget.dataset.id
    var playerIndex = this.data.playerIndex
    var that = this

    this.setData({ activeColor: colorId })
    setTimeout(function() { that.setData({ activeColor: -1 }) }, 150)

    if (colorId !== this._sequence[playerIndex]) {
      this._gameOver()
      return
    }

    playerIndex++
    this.setData({ playerIndex: playerIndex, stateText: this.data.i18n.yourTurn + playerIndex + '/' + this._sequence.length + ')' })

    if (playerIndex >= this._sequence.length) {
      this.setData({ state: 'correct', stateText: this.data.i18n.correct })
      wx.vibrateShort({ type: 'medium' })
      var that2 = this
      setTimeout(function() { that2._nextRound() }, 1000)
    }
  },

  _gameOver: function() {
    var level = this.data.level
    var best = this.data.bestLevel
    var total = this.data.totalGames + 1
    if (level > best) best = level
    storageUtil.set('color_memory_best', best)
    storageUtil.set('color_memory_total', total)
    this.setData({
      state: 'gameover',
      stateText: this.data.i18n.gameOver + level + this.data.i18n.roundUnit,
      bestLevel: best,
      totalGames: total,
      isPlaying: false
    })
    wx.vibrateShort({ type: 'heavy' })
    points.recordFunToolUse('color-memory')
    var currentBest = storageUtil.get('color_memory_best_round', 0)
    achievement.recordFunToolComplete('color-memory', { colorMemoryBestRound: currentBest })
    poster.setupForResult(this, {
      icon: '🎨', title: '色彩记忆',
      mainScore: '第' + this.data.level + '轮', mainScoreLabel: '最终轮数',
      rating: this.data.level >= 5 ? '记忆达人' : '继续加油',
      details: [{ label: '最佳轮数', value: '第' + storageUtil.get('color_memory_best', 0) + '轮' }],
      color1: '#8B5CF6', color2: '#7C3AED'
    })
  },

  resetStats: function() {
    storageUtil.set('color_memory_best', 0)
    storageUtil.set('color_memory_total', 0)
    this.setData({ bestLevel: 0, totalGames: 0 })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    return { title: '🎨 色彩记忆 - 我到了第' + this.data.level + '关，你能超过我吗？', path: '/package-fun/color-memory/color-memory' }
  },
  onShareTimeline: function() {
    return { title: '🎨 色彩记忆 - 测测你的记忆力' }
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})
