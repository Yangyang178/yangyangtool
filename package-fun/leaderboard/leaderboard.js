var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')

var GAMES = [
  { id: 'reaction', name: '反应速度', icon: '⚡', key: 'reaction_best', lowerBetter: true, unit: 'ms', historyKey: 'reaction_results', formatScore: function(v) { return v > 0 ? v + 'ms' : '-' } },
  { id: 'color-memory', name: '色彩记忆', icon: '🎨', key: 'color_memory_best', lowerBetter: false, unit: '轮', historyKey: '', formatScore: function(v) { return v > 0 ? '第' + v + '轮' : '-' } },
  { id: 'number-guess', name: '数字猜谜', icon: '🔢', key: 'number_guess_best', lowerBetter: true, unit: '次', historyKey: '', formatScore: function(v) { return v > 0 ? v + '次' : '-' } },
  { id: 'memory-card', name: '记忆翻牌', icon: '🃏', key: 'memory_card_best_moves', lowerBetter: true, unit: '步', historyKey: '', formatScore: function(v) { return v > 0 ? v + '步' : '-' } },
  { id: 'crazy-click', name: '疯狂点击', icon: '👆', key: 'crazy_click_best_cps', lowerBetter: false, unit: '/s', historyKey: '', formatScore: function(v) { return v > 0 ? v.toFixed(1) + '/s' : '-' } },
  { id: 'maze', name: '迷宫', icon: '🏰', key: 'maze_best_easy', lowerBetter: true, unit: '秒', historyKey: '', formatScore: function(v) { return v > 0 ? v + '秒' : '-' } },
  { id: 'number-sequence', name: '数字顺序记忆', icon: '🔢', key: 'ns_best_normal', lowerBetter: true, unit: '秒', historyKey: '', formatScore: function(v) { return v > 0 ? v + '秒' : '-' } },
  { id: 'time-perception', name: '时间感知训练', icon: '⏱️', key: 'tp_best_avg', lowerBetter: true, unit: '秒', historyKey: '', formatScore: function(v) { return v >= 0 && v > 0 ? v.toFixed(1) + '秒' : '-' } },
  { id: 'char-finder', name: '字里寻字', icon: '🔍', key: 'cf_best_level', lowerBetter: false, unit: '关', historyKey: '', formatScore: function(v) { return v > 0 ? '第' + v + '关' : '-' } }
]

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    games: GAMES,
    currentGame: 0,
    bestScore: '-',
    bestScoreDisplay: '-',
    totalGames: 0,
    localRank: [],
    historyRecords: []
  },

  onLoad: function() {
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, i18n: i18n.getToolPageTexts('leaderboard') })
    this._loadCurrentGame()
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      themeStyle: themeStyle,
      fontClass: fontClass,
      i18n: i18n.getToolPageTexts('leaderboard')
    })
    this._loadCurrentGame()
  },

  switchGame: function(e) {
    var idx = e.currentTarget.dataset.index
    if (idx === this.data.currentGame) return
    this.setData({ currentGame: idx })
    this._loadCurrentGame()
  },

  _loadCurrentGame: function() {
    var game = GAMES[this.data.currentGame]
    var bestVal = storageUtil.get(game.key, 0)
    var bestDisplay = game.formatScore(bestVal)

    // Build local rank entries - for now just show user's best as #1
    var rank = []
    if (bestVal > 0) {
      rank.push({ rank: 1, name: '我', score: bestDisplay, isMe: true })
    }

    // Try to load history results for more entries
    if (game.id === 'reaction') {
      var results = storageUtil.safeGetArray('reaction_results')
      for (var i = 0; i < results.length && rank.length < 10; i++) {
        if (results[i] !== bestVal) {
          rank.push({ rank: rank.length + 1, name: '我', score: results[i] + 'ms', isMe: true })
        }
      }
    }

    // Get total games count
    var totalGames = 0
    if (game.id === 'reaction') totalGames = storageUtil.safeGetArray('reaction_results').length
    else if (game.id === 'crazy-click') totalGames = storageUtil.get('crazy_click_total', 0)
    else if (game.id === 'memory-card') totalGames = storageUtil.get('memory_card_total_wins', 0)
    else if (game.id === 'color-memory') totalGames = storageUtil.get('color_memory_total', 0)
    else if (game.id === 'number-guess') totalGames = storageUtil.get('number_guess_total_wins', 0)

    // Load history records
    var historyRecords = []
    if (game.id === 'reaction') {
      var reactionResults = storageUtil.safeGetArray('reaction_results')
      for (var j = 0; j < reactionResults.length && j < 20; j++) {
        historyRecords.push({ index: j + 1, score: reactionResults[j] + 'ms' })
      }
    }

    this.setData({
      bestScore: bestVal,
      bestScoreDisplay: bestDisplay,
      totalGames: totalGames,
      localRank: rank,
      historyRecords: historyRecords
    })
  },

  onShareAppMessage: function() {
    var game = GAMES[this.data.currentGame]
    return { title: game.icon + ' ' + game.name + '排行榜 - 百宝工具箱', path: '/package-fun/leaderboard/leaderboard' }
  },

  onShareTimeline: function() {
    var game = GAMES[this.data.currentGame]
    return { title: game.icon + ' ' + game.name + '排行榜 - 百宝工具箱' }
  }
})
