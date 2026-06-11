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
    state: 'idle',
    clicks: 0,
    timeLeft: 10,
    cps: 0,
    rating: '',
    ratingColor: '',
    bestClicks: 0,
    bestCps: 0,
    totalGames: 0,
    progressPercent: 100
  },
  _timer: null,
  _startTime: 0,

  onLoad: function() {
    var best = storageUtil.get('crazy_click_best', 0)
    var bestCps = storageUtil.get('crazy_click_best_cps', 0)
    var total = storageUtil.get('crazy_click_total', 0)
    this.setData({ bestClicks: best, bestCps: bestCps, totalGames: total, i18n: i18n.getToolPageTexts('crazyClick') })
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getToolPageTexts('crazyClick') })
  },

  onUnload: function() {
    if (this._timer) clearInterval(this._timer)
  },

  onTapButton: function() {
    if (this.data.state === 'idle') {
      this._startGame()
    } else if (this.data.state === 'playing') {
      this._recordClick()
    } else if (this.data.state === 'result') {
      this._resetGame()
    }
  },

  _startGame: function() {
    this.setData({ state: 'playing', clicks: 0, timeLeft: 10, cps: 0, progressPercent: 100 })
    this._startTime = Date.now()
    var that = this
    this._timer = setInterval(function() {
      var elapsed = (Date.now() - that._startTime) / 1000
      var timeLeft = Math.max(0, 10 - Math.floor(elapsed))
      var progress = Math.max(0, (10 - elapsed) / 10 * 100)
      that.setData({ timeLeft: timeLeft, progressPercent: progress })
      if (elapsed >= 10) {
        that._endGame()
      }
    }, 100)
    this._recordClick()
  },

  _recordClick: function() {
    var clicks = this.data.clicks + 1
    var elapsed = (Date.now() - this._startTime) / 1000
    var cps = elapsed > 0 ? (clicks / elapsed).toFixed(1) : 0
    this.setData({ clicks: clicks, cps: cps })
    wx.vibrateShort({ type: 'light' })
  },

  _endGame: function() {
    if (this._timer) clearInterval(this._timer)
    var clicks = this.data.clicks
    var cps = parseFloat(this.data.cps)
    var rating = this._getRating(cps)
    var best = this.data.bestClicks
    var bestCps = this.data.bestCps
    if (clicks > best) best = clicks
    if (cps > bestCps) bestCps = cps
    var total = this.data.totalGames + 1
    storageUtil.set('crazy_click_best', best)
    storageUtil.set('crazy_click_best_cps', bestCps)
    storageUtil.set('crazy_click_total', total)
    this.setData({
      state: 'result',
      cps: cps.toFixed(1),
      rating: rating.name,
      ratingColor: rating.color,
      bestClicks: best,
      bestCps: bestCps,
      totalGames: total,
      progressPercent: 0
    })
    wx.vibrateShort({ type: 'heavy' })
    points.recordFunToolUse('crazy-click')
    var currentBest = storageUtil.get('crazy_click_best_cps', 0)
    achievement.recordFunToolComplete('crazy-click', { crazyClickBestCPS: currentBest })
    poster.setupForResult(this, {
      icon: '👆', title: '疯狂点击',
      mainScore: this.data.cps, mainScoreLabel: '每秒点击次数',
      rating: this.data.rating,
      details: [
        { label: '总点击', value: this.data.clicks + '次' },
        { label: '最佳CPS', value: storageUtil.get('crazy_click_best_cps', 0).toFixed(1) }
      ],
      color1: '#EF4444', color2: '#DC2626'
    })
  },

  _getRating: function(cps) {
    if (cps < 5) return { name: '👍 手速一般', color: '#6B7280' }
    if (cps < 7) return { name: '🔥 手速不错', color: '#3B82F6' }
    if (cps < 9) return { name: '⚡ 手速达人', color: '#10B981' }
    if (cps < 11) return { name: '🚀 闪电手速', color: '#F59E0B' }
    return { name: '👽 非人类手速', color: '#EF4444' }
  },

  _resetGame: function() {
    poster.hideResultModal(this)
    this.setData({ state: 'idle', clicks: 0, timeLeft: 10, cps: 0, rating: '', progressPercent: 100 })
  },

  resetStats: function() {
    storageUtil.set('crazy_click_best', 0)
    storageUtil.set('crazy_click_best_cps', 0)
    storageUtil.set('crazy_click_total', 0)
    this.setData({ bestClicks: 0, bestCps: 0, totalGames: 0 })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    return { title: '👆 疯狂点击 - 我10秒点了' + this.data.clicks + '次，你能超过我？', path: '/package-fun/crazy-click/crazy-click' }
  },
  onShareTimeline: function() {
    return { title: '👆 疯狂点击 - 测测你的手速' }
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})