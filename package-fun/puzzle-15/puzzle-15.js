var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var achievement = require('../../utils/achievement.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    grid: GOAL.slice(),
    moves: 0,
    timeElapsed: 0,
    gameState: 'idle',
    bestMoves: 0,
    bestTime: 0,
    totalWins: 0,
    message: '点击"打乱"开始游戏'
  },

  _timer: null,
  _startTime: 0,

  onLoad: function() {
    var bestMoves = storageUtil.get('puzzle_15_best_moves', 0)
    var bestTime = storageUtil.get('puzzle_15_best_time', 0)
    var wins = storageUtil.get('puzzle_15_wins', 0)
    this.setData({ bestMoves: bestMoves, bestTime: bestTime, totalWins: wins, i18n: i18n.getToolPageTexts('puzzle15') })
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
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
      i18n: i18n.getToolPageTexts('puzzle15')
    })
  },

  onUnload: function() {
    this._clearTimer()
  },

  _clearTimer: function() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },

  _formatTime: function(seconds) {
    var m = Math.floor(seconds / 60)
    var s = seconds % 60
    var mStr = m < 10 ? '0' + m : '' + m
    var sStr = s < 10 ? '0' + s : '' + s
    return mStr + ':' + sStr
  },

  _countInversions: function(arr) {
    var inversions = 0
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === 0) continue
      for (var j = i + 1; j < arr.length; j++) {
        if (arr[j] === 0) continue
        if (arr[i] > arr[j]) {
          inversions++
        }
      }
    }
    return inversions
  },

  _isSolvable: function(arr) {
    var inversions = this._countInversions(arr)
    var emptyIndex = -1
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === 0) {
        emptyIndex = i
        break
      }
    }
    var emptyRow = Math.floor(emptyIndex / 4)
    var rowFromBottom = 4 - emptyRow
    if (rowFromBottom % 2 === 0) {
      return inversions % 2 === 1
    } else {
      return inversions % 2 === 0
    }
  },

  _shuffle: function() {
    var grid = GOAL.slice()
    for (var i = grid.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = grid[i]
      grid[i] = grid[j]
      grid[j] = temp
    }
    if (!this._isSolvable(grid)) {
      var first = -1
      var second = -1
      for (var k = 0; k < grid.length; k++) {
        if (grid[k] !== 0) {
          if (first === -1) {
            first = k
          } else if (second === -1) {
            second = k
            break
          }
        }
      }
      var tmp = grid[first]
      grid[first] = grid[second]
      grid[second] = tmp
    }
    if (this._checkArrayWin(grid)) {
      return this._shuffle()
    }
    return grid
  },

  _checkArrayWin: function(arr) {
    for (var i = 0; i < GOAL.length; i++) {
      if (arr[i] !== GOAL[i]) return false
    }
    return true
  },

  _checkWin: function() {
    return this._checkArrayWin(this.data.grid)
  },

  shuffleBoard: function() {
    this._clearTimer()
    var grid = this._shuffle()
    this.setData({
      grid: grid,
      moves: 0,
      timeElapsed: 0,
      gameState: 'playing',
      message: '点击空格旁的数字滑动'
    })
    var that = this
    this._startTime = Date.now()
    this._timer = setInterval(function() {
      var elapsed = Math.floor((Date.now() - that._startTime) / 1000)
      that.setData({ timeElapsed: elapsed })
    }, 1000)
  },

  newGame: function() {
    poster.hideResultModal(this)
    this.shuffleBoard()
  },

  onTapTile: function(e) {
    if (this.data.gameState !== 'playing') return

    var index = e.currentTarget.dataset.index
    var grid = this.data.grid
    if (grid[index] === 0) return

    var row = Math.floor(index / 4)
    var col = index % 4

    var emptyIndex = -1
    for (var i = 0; i < grid.length; i++) {
      if (grid[i] === 0) {
        emptyIndex = i
        break
      }
    }
    var emptyRow = Math.floor(emptyIndex / 4)
    var emptyCol = emptyIndex % 4

    var isAdjacent = false
    if (row === emptyRow && Math.abs(col - emptyCol) === 1) {
      isAdjacent = true
    }
    if (col === emptyCol && Math.abs(row - emptyRow) === 1) {
      isAdjacent = true
    }

    if (!isAdjacent) return

    grid[emptyIndex] = grid[index]
    grid[index] = 0

    var moves = this.data.moves + 1
    this.setData({ grid: grid, moves: moves })

    if (this._checkWin()) {
      this._clearTimer()
      var elapsed = this.data.timeElapsed
      var bestMoves = this.data.bestMoves
      var bestTime = this.data.bestTime
      var totalWins = this.data.totalWins + 1

      if (bestMoves === 0 || moves < bestMoves) {
        bestMoves = moves
        storageUtil.set('puzzle_15_best_moves', bestMoves)
      }
      if (bestTime === 0 || elapsed < bestTime) {
        bestTime = elapsed
        storageUtil.set('puzzle_15_best_time', bestTime)
      }
      storageUtil.set('puzzle_15_wins', totalWins)

      this.setData({
        gameState: 'won',
        message: '恭喜完成！用了 ' + moves + ' 步',
        bestMoves: bestMoves,
        bestTime: bestTime,
        totalWins: totalWins
      })
      wx.vibrateShort({ type: 'medium' })
      points.recordFunToolUse('puzzle-15')
      var currentBest = storageUtil.get('puzzle_15_best_moves', 0)
      achievement.recordFunToolComplete('puzzle-15', { puzzle15BestMoves: currentBest })
      poster.setupForResult(this, {
        icon: '🧩', title: '数字华容道',
        mainScore: this.data.moves + '步', mainScoreLabel: '完成步数',
        rating: this.data.moves <= 50 ? '华容道高手' : '拼图达人',
        details: [
          { label: '用时', value: this.data.timeElapsed + '秒' },
          { label: '最佳步数', value: storageUtil.get('puzzle_15_best_moves', 0) + '步' }
        ],
        color1: '#10B981', color2: '#047857'
      })
    }
  },

  onShareAppMessage: function() {
    return {
      title: '🧩 数字华容道 - 我用了' + this.data.moves + '步完成，来挑战我吧！',
      path: '/package-fun/puzzle-15/puzzle-15'
    }
  },

  onShareTimeline: function() {
    return {
      title: '🧩 数字华容道 - 经典15数字滑块拼图'
    }
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})
