var i18n = require('../../utils/i18n.js')
var storage = require('../../utils/storage.js')
var points = require('../../utils/points.js')

Page({
  data: {
    gameState: 'idle',
    totalRounds: 5,
    currentRound: 0,
    targetSeconds: 0,
    actualTime: 0,
    errorValue: 0,
    totalError: 0,
    avgError: '0.0',
    bestAvgError: -1,
    elapsedDisplay: '0.0',
    roundResults: [],
    isNewRecord: false,
    isDarkMode: false,
    fontSizeSetting: 'medium',
    i18n: {}
  },

  onLoad: function() {
    var app = getApp()
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: app.globalData.fontSizeSetting || 'medium',
      i18n: i18n.getToolPageTexts('timePerception')
    })
    this.loadBestRecord()
  },

  onShow: function() {
    var app = getApp()
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: app.globalData.fontSizeSetting || 'medium',
      i18n: i18n.getToolPageTexts('timePerception')
    })
  },

  loadBestRecord: function() {
    var best = storage.get('tp_best_avg', -1)
    this.setData({ bestAvgError: best >= 0 ? best.toFixed(1) : -1 })
  },

  setRounds: function(e) {
    var rounds = parseInt(e.currentTarget.dataset.rounds, 10)
    this.setData({ totalRounds: rounds })
  },

  startGame: function() {
    this.setData({
      gameState: 'ready',
      currentRound: 0,
      totalError: 0,
      avgError: '0.0',
      roundResults: [],
      isNewRecord: false
    })
    this._nextTarget()
  },

  _nextTarget: function() {
    var targets = [3, 4, 5, 6, 7, 8, 10, 12, 15]
    var target = targets[Math.floor(Math.random() * targets.length)]
    var round = this.data.currentRound + 1
    this.setData({ targetSeconds: target, currentRound: round, gameState: 'ready' })
  },

  startCounting: function() {
    var that = this
    this._startTime = Date.now()
    this.setData({ gameState: 'counting', elapsedDisplay: '0.0' })
    this._timer = setInterval(function() {
      var elapsed = (Date.now() - that._startTime) / 1000
      that.setData({ elapsedDisplay: elapsed.toFixed(1) })
    }, 100)
  },

  stopCounting: function() {
    if (this._timer) { clearInterval(this._timer); this._timer = null }
    var actual = (Date.now() - this._startTime) / 1000
    var actualRounded = Math.round(actual * 10) / 10
    var target = this.data.targetSeconds
    var error = Math.abs(actualRounded - target)
    var errorRounded = Math.round(error * 10) / 10
    var totalErr = Math.round((this.data.totalError + errorRounded) * 10) / 10
    var avgErr = (totalErr / this.data.currentRound).toFixed(1)
    var results = this.data.roundResults.slice()
    results.push({ round: this.data.currentRound, target: target, actual: actualRounded, error: errorRounded })
    this.setData({ gameState: 'result', actualTime: actualRounded, errorValue: errorRounded, totalError: totalErr, avgError: avgErr, roundResults: results })
  },

  nextRound: function() {
    if (this.data.currentRound >= this.data.totalRounds) {
      this._checkRecord()
      points.recordFunToolUse('time-perception')
      this.setData({ gameState: 'finished' })
    } else {
      this._nextTarget()
    }
  },

  _checkRecord: function() {
    var avg = parseFloat(this.data.avgError)
    var best = storage.get('tp_best_avg', -1)
    if (best < 0 || avg < best) {
      storage.set('tp_best_avg', avg)
      this.setData({ bestAvgError: avg.toFixed(1), isNewRecord: true })
    }
  },

  goBack: function() {
    wx.navigateBack({ delta: 1 })
  }
})
