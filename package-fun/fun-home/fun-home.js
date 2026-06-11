var storageUtil = require('../../utils/storage.js')
var poster = require('../utils/poster.js')
var checkin = require('../../utils/checkin.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')

// 签到解锁配置：连续签到天数 -> 解锁的工具id
var UNLOCK_MAP = {
  7: 'maze',
  14: 'vision-test',
  21: 'psychology-test'
}

// 各工具最佳成绩存储key和格式化方式
var BEST_RECORD_MAP = {
  'reaction': { key: 'reaction_best', unit: 'ms', label: '', format: function(v) { var t = i18n.getToolPageTexts('funHome'); return v > 0 ? v + 'ms' : '' } },
  'color-memory': { key: 'color_memory_best', unit: '', label: '', format: function(v) { var t = i18n.getToolPageTexts('funHome'); return v > 0 ? v + t.roundUnit : '' } },
  'number-guess': { key: 'number_guess_best', unit: '', label: '', format: function(v) { var t = i18n.getToolPageTexts('funHome'); return v > 0 ? v + t.guessUnit : '' } },
  'memory-card': { key: 'memory_card_best_moves', unit: '', label: '', format: function(v) { var t = i18n.getToolPageTexts('funHome'); return v > 0 ? v + t.movesUnit : '' } },
  'crazy-click': { key: 'crazy_click_best_cps', unit: '', label: '', format: function(v) { var t = i18n.getToolPageTexts('funHome'); return v > 0 ? v.toFixed(1) + t.cpsUnit : '' } },
  'maze': { key: 'maze_best_easy', unit: '', label: '', format: function(v) { var t = i18n.getToolPageTexts('funHome'); return v > 0 ? v + t.secondsUnit : '' } },
  'number-sequence': { key: 'ns_best_normal', unit: '', label: '', format: function(v) { var t = i18n.getToolPageTexts('funHome'); return v > 0 ? v + t.secondsUnit : '' } },
  'time-perception': { key: 'tp_best_avg', unit: '', label: '', format: function(v) { return v > 0 ? v.toFixed(1) + 's' : '' } },
  'char-finder': { key: 'cf_best_level', unit: '', label: '', format: function(v) { return v > 0 ? 'Lv.' + v : '' } }
}

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    tools: [
      { id: 'reaction', name: '', icon: '⚡', desc: '', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', route: '/package-fun/reaction-test/reaction-test', locked: false },
      { id: 'color-memory', name: '', icon: '🎨', desc: '', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', route: '/package-fun/color-memory/color-memory', locked: false },
      { id: 'number-guess', name: '', icon: '🔢', desc: '', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', route: '/package-fun/number-guess/number-guess', locked: false },
      { id: 'memory-card', name: '', icon: '🃏', desc: '', gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', route: '/package-fun/memory-card/memory-card', locked: false },
      { id: 'crazy-click', name: '', icon: '👆', desc: '', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', route: '/package-fun/crazy-click/crazy-click', locked: false },
      { id: 'maze', name: '', icon: '🏰', desc: '', gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', route: '/package-fun/maze/maze', locked: true, unlockDays: 7 },
      { id: 'vision-test', name: '', icon: '👁', desc: '', gradient: 'linear-gradient(135deg, #059669 0%, #065F46 100%)', route: '/package-fun/vision-test/vision-test', locked: true, unlockDays: 14 },
      { id: 'psychology-test', name: '', icon: '🔮', desc: '', gradient: 'linear-gradient(135deg, #DB2777 0%, #9D174D 100%)', route: '/package-fun/psychology-test/psychology-test', locked: true, unlockDays: 21 },
      { id: 'number-sequence', name: '', icon: '🔢', desc: '', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', route: '/package-fun/number-sequence/number-sequence', locked: false },
      { id: 'time-perception', name: '', icon: '⏱️', desc: '', gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', route: '/package-fun/time-perception/time-perception', locked: false },
      { id: 'char-finder', name: '', icon: '🔍', desc: '', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', route: '/package-fun/char-finder/char-finder', locked: false }
    ],
    continuousDays: 0
  },
  onLoad: function() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
    var app = getApp()
    var i18nTexts = i18n.getToolPageTexts('funHome')
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, i18n: i18nTexts })
    this._updateI18nData(i18nTexts)
    poster.setupForPage(this)
  },
  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    var i18nTexts = i18n.getToolPageTexts('funHome')
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), themeStyle: themeStyle, fontClass: fontClass, i18n: i18nTexts })
    this._updateI18nData(i18nTexts)
    this._updateUnlockStatus()
  },
  _updateI18nData: function(t) {
    this.setData({
      tools: [
        { id: 'reaction', name: t.toolReaction, icon: '⚡', desc: t.toolReactionDesc, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', route: '/package-fun/reaction-test/reaction-test', locked: false },
        { id: 'color-memory', name: t.toolColorMemory, icon: '🎨', desc: t.toolColorMemoryDesc, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', route: '/package-fun/color-memory/color-memory', locked: false },
        { id: 'number-guess', name: t.toolNumberGuess, icon: '🔢', desc: t.toolNumberGuessDesc, gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', route: '/package-fun/number-guess/number-guess', locked: false },
        { id: 'memory-card', name: t.toolMemoryCard, icon: '🃏', desc: t.toolMemoryCardDesc, gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', route: '/package-fun/memory-card/memory-card', locked: false },
        { id: 'crazy-click', name: t.toolCrazyClick, icon: '👆', desc: t.toolCrazyClickDesc, gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', route: '/package-fun/crazy-click/crazy-click', locked: false },
        { id: 'maze', name: t.toolMaze, icon: '🏰', desc: t.toolMazeDesc, gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', route: '/package-fun/maze/maze', locked: true, unlockDays: 7 },
        { id: 'vision-test', name: t.toolVisionTest, icon: '👁', desc: t.toolVisionTestDesc, gradient: 'linear-gradient(135deg, #059669 0%, #065F46 100%)', route: '/package-fun/vision-test/vision-test', locked: true, unlockDays: 14 },
        { id: 'psychology-test', name: t.toolPsychologyTest, icon: '🔮', desc: t.toolPsychologyTestDesc, gradient: 'linear-gradient(135deg, #DB2777 0%, #9D174D 100%)', route: '/package-fun/psychology-test/psychology-test', locked: true, unlockDays: 21 },
        { id: 'number-sequence', name: t.toolNumberSequence, icon: '🔢', desc: t.toolNumberSequenceDesc, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', route: '/package-fun/number-sequence/number-sequence', locked: false },
        { id: 'time-perception', name: t.toolTimePerception, icon: '⏱️', desc: t.toolTimePerceptionDesc, gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', route: '/package-fun/time-perception/time-perception', locked: false },
        { id: 'char-finder', name: t.toolCharFinder, icon: '🔍', desc: t.toolCharFinderDesc, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', route: '/package-fun/char-finder/char-finder', locked: false }
      ]
    })
  },
  _updateUnlockStatus: function() {
    var continuousDays = checkin.getContinuousDays()
    var tools = this.data.tools.slice()
    for (var i = 0; i < tools.length; i++) {
      if (tools[i].unlockDays) {
        tools[i].locked = continuousDays < tools[i].unlockDays
        tools[i].unlockProgress = continuousDays >= tools[i].unlockDays ? 100 : Math.round(continuousDays / tools[i].unlockDays * 100)
        tools[i].unlockRemainDays = tools[i].unlockDays - continuousDays
      }
      // 加载最佳成绩
      var recordConfig = BEST_RECORD_MAP[tools[i].id]
      if (recordConfig) {
        var bestVal = storageUtil.get(recordConfig.key, 0)
        tools[i].bestRecord = recordConfig.format(bestVal)
      } else {
        tools[i].bestRecord = ''
      }
    }
    this.setData({ tools: tools, continuousDays: continuousDays })
  },
  openTool: function(e) {
    var route = e.currentTarget.dataset.route
    var locked = e.currentTarget.dataset.locked
    var unlockDays = e.currentTarget.dataset.unlockdays
    if (locked) {
      wx.vibrateShort({ type: 'medium' })
      var texts = i18n.getToolPageTexts('funHome')
      wx.showModal({
        title: texts.notUnlocked,
        content: texts.unlockHint + unlockDays + texts.consecutiveDays + this.data.continuousDays + texts.consecutiveDays,
        showCancel: false,
        confirmText: texts.gotIt
      })
      return
    }
    wx.vibrateShort({ type: 'light' })
    wx.navigateTo({ url: route })
  },
  openLeaderboard: function() {
    wx.navigateTo({ url: '/package-fun/leaderboard/leaderboard' })
  },
  onShareAppMessage: function() { return poster.getShareConfig(this.data.i18n.shareTitle, '/package-fun/fun-home/fun-home') },
  onShareTimeline: function() { return poster.getTimelineConfig(this.data.i18n.shareTitle) }
})
