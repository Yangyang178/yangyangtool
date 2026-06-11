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
    state: 'idle',
    lastTime: 0,
    bestTime: 0,
    results: [],
    avgTime: 0,
    rating: '',
    ratingColor: ''
  },
  _waitTimer: null,
  _startTime: 0,

  onLoad: function() {
    var best = storageUtil.get('reaction_best', 0)
    var results = storageUtil.safeGetArray('reaction_results')
    var avg = this._calcAvg(results)
    this.setData({ bestTime: best, results: results, avgTime: avg, i18n: i18n.getToolPageTexts('reactionTest') })
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
  },

  onShow: function() {
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), i18n: i18n.getToolPageTexts('reactionTest') })
  },

  onUnload: function() {
    if (this._waitTimer) clearTimeout(this._waitTimer)
  },

  onTapArea: function() {
    var state = this.data.state
    if (state === 'idle' || state === 'result' || state === 'tooEarly') {
      this._startWaiting()
    } else if (state === 'waiting') {
      if (this._waitTimer) clearTimeout(this._waitTimer)
      this.setData({ state: 'tooEarly' })
      wx.vibrateShort({ type: 'heavy' })
    } else if (state === 'ready') {
      this._recordResult()
    }
  },

  _startWaiting: function() {
    poster.hideResultModal(this)
    var that = this
    this.setData({ state: 'waiting' })
    var delay = 1000 + Math.floor(Math.random() * 4000)
    this._waitTimer = setTimeout(function() {
      that._startTime = Date.now()
      that.setData({ state: 'ready' })
      wx.vibrateShort({ type: 'medium' })
    }, delay)
  },

  _recordResult: function() {
    var time = Date.now() - this._startTime
    var rating = this._getRating(time)
    var results = this.data.results.slice()
    results.unshift(time)
    if (results.length > 10) results = results.slice(0, 10)
    var best = this.data.bestTime
    if (best === 0 || time < best) best = time
    var avg = this._calcAvg(results)
    storageUtil.set('reaction_best', best)
    storageUtil.set('reaction_results', results)
    this.setData({
      state: 'result',
      lastTime: time,
      bestTime: best,
      results: results,
      avgTime: avg,
      rating: rating.name,
      ratingColor: rating.color
    })
    wx.vibrateShort({ type: 'heavy' })
    points.recordFunToolUse('reaction')
    var currentBest = storageUtil.get('reaction_best_time', 0)
    achievement.recordFunToolComplete('reaction', { reactionBestTime: currentBest })
    poster.setupForResult(this, {
      icon: '⚡', title: '反应速度测试',
      mainScore: this.data.lastTime + 'ms', mainScoreLabel: '反应时间',
      rating: this.data.rating,
      details: [{ label: '最佳成绩', value: storageUtil.get('reaction_best_time', 0) + 'ms' }],
      color1: '#F59E0B', color2: '#D97706'
    })
  },

  _getRating: function(time) {
    if (time < 200) return { name: '⚡ 闪电反应', color: '#F59E0B' }
    if (time < 300) return { name: '🔥 反应敏捷', color: '#EF4444' }
    if (time < 400) return { name: '👍 反应正常', color: '#10B981' }
    if (time < 500) return { name: '🐢 稍慢一点', color: '#3B82F6' }
    return { name: '💪 需要锻炼', color: '#8B5CF6' }
  },

  _calcAvg: function(results) {
    if (!results || results.length === 0) return 0
    var sum = 0
    var count = Math.min(results.length, 5)
    for (var i = 0; i < count; i++) sum += results[i]
    return Math.round(sum / count)
  },

  resetResults: function() {
    storageUtil.set('reaction_best', 0)
    storageUtil.set('reaction_results', [])
    this.setData({ bestTime: 0, results: [], avgTime: 0, state: 'idle' })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    var text = '我的反应速度是' + this.data.lastTime + 'ms，你能超过我吗？'
    return { title: '⚡ 反应速度测试 - ' + text, path: '/package-fun/reaction-test/reaction-test' }
  },
  onShareTimeline: function() {
    return { title: '⚡ 反应速度测试 - 测测你的反应有多快' }
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})
