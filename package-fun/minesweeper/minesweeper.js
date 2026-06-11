var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var achievement = require('../../utils/achievement.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var ROWS = 9
var COLS = 9
var MINE_COUNT = 10

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    cells: [],
    gameState: 'idle',
    mineCount: MINE_COUNT,
    flagCount: 0,
    timeElapsed: 0,
    bestTime: 0,
    totalWins: 0,
    message: ''
  },
  _minesPlaced: false,
  _timer: null,
  _startTime: 0,

  onLoad: function() {
    var best = storageUtil.get('minesweeper_best_time', 0)
    var wins = storageUtil.get('minesweeper_wins', 0)
    this.setData({ bestTime: best, totalWins: wins, i18n: i18n.getToolPageTexts('minesweeper') })
    this._newGame()
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getToolPageTexts('minesweeper') })
  },

  onUnload: function() {
    if (this._timer) clearInterval(this._timer)
  },

  _newGame: function() {
    poster.hideResultModal(this)
    if (this._timer) clearInterval(this._timer)
    this._minesPlaced = false
    this._startTime = 0
    var cells = []
    for (var i = 0; i < ROWS * COLS; i++) {
      cells.push({
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0
      })
    }
    this.setData({
      cells: cells,
      gameState: 'idle',
      flagCount: 0,
      timeElapsed: 0,
      message: this.data.i18n.tapToStart || '点击格子开始游戏'
    })
  },

  _placeMines: function(safeRow, safeCol) {
    var cells = this.data.cells
    var placed = 0
    while (placed < MINE_COUNT) {
      var idx = Math.floor(Math.random() * ROWS * COLS)
      var row = Math.floor(idx / COLS)
      var col = idx % COLS
      if (cells[idx].mine) continue
      if (Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1) continue
      cells[idx].mine = true
      placed++
    }
    this._calculateAdjacent()
    this.setData({ cells: cells })
  },

  _calculateAdjacent: function() {
    var cells = this.data.cells
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].mine) continue
      var row = Math.floor(i / COLS)
      var col = i % COLS
      var count = 0
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          var nr = row + dr
          var nc = col + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (cells[nr * COLS + nc].mine) count++
          }
        }
      }
      cells[i].adjacent = count
    }
  },

  onTapCell: function(e) {
    var index = e.currentTarget.dataset.index
    var cells = this.data.cells
    if (index < 0 || index >= cells.length) return
    if (cells[index].revealed || cells[index].flagged) return
    if (this.data.gameState === 'gameover' || this.data.gameState === 'won') return

    if (!this._minesPlaced) {
      var safeRow = Math.floor(index / COLS)
      var safeCol = index % COLS
      this._placeMines(safeRow, safeCol)
      this._minesPlaced = true
      this.setData({ gameState: 'playing', message: this.data.i18n.carefulDemining })
      this._startTime = Date.now()
      var that = this
      this._timer = setInterval(function() {
        that.setData({ timeElapsed: Math.floor((Date.now() - that._startTime) / 1000) })
      }, 1000)
      cells = this.data.cells
    }

    if (cells[index].mine) {
      this._gameOver(index)
      return
    }

    if (cells[index].adjacent === 0) {
      this._floodFill(Math.floor(index / COLS), index % COLS)
    } else {
      cells[index].revealed = true
      this.setData({ cells: cells })
    }

    this._checkWin()
  },

  onLongPressCell: function(e) {
    var index = e.currentTarget.dataset.index
    var cells = this.data.cells
    if (index < 0 || index >= cells.length) return
    if (cells[index].revealed) return
    if (this.data.gameState === 'gameover' || this.data.gameState === 'won') return

    cells[index].flagged = !cells[index].flagged
    var flagCount = this.data.flagCount
    if (cells[index].flagged) {
      flagCount++
    } else {
      flagCount--
    }
    this.setData({ cells: cells, flagCount: flagCount })
    wx.vibrateShort({ type: 'light' })
  },

  _floodFill: function(row, col) {
    var cells = this.data.cells
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return
    var idx = row * COLS + col
    if (cells[idx].revealed || cells[idx].flagged || cells[idx].mine) return

    cells[idx].revealed = true

    if (cells[idx].adjacent === 0) {
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          this._floodFill(row + dr, col + dc)
        }
      }
    }
    this.setData({ cells: cells })
  },

  _checkWin: function() {
    var cells = this.data.cells
    for (var i = 0; i < cells.length; i++) {
      if (!cells[i].mine && !cells[i].revealed) return
    }
    this._gameWon()
  },

  _gameOver: function(clickedIndex) {
    if (this._timer) clearInterval(this._timer)
    var cells = this.data.cells
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].mine) {
        cells[i].revealed = true
      }
    }
    this.setData({
      cells: cells,
      gameState: 'gameover',
      message: this.data.i18n.hitMine
    })
    wx.vibrateShort({ type: 'heavy' })
  },

  _gameWon: function() {
    if (this._timer) clearInterval(this._timer)
    var timeElapsed = this.data.timeElapsed
    var bestTime = this.data.bestTime
    if (bestTime === 0 || timeElapsed < bestTime) bestTime = timeElapsed
    var wins = this.data.totalWins + 1
    storageUtil.set('minesweeper_best_time', bestTime)
    storageUtil.set('minesweeper_wins', wins)
    this.setData({
      gameState: 'won',
      message: this.data.i18n.congratulations + timeElapsed + this.data.i18n.seconds,
      bestTime: bestTime,
      totalWins: wins
    })
    wx.vibrateShort({ type: 'medium' })
    points.recordFunToolUse('minesweeper')
    var currentWins = storageUtil.get('minesweeper_wins', 0)
    achievement.recordFunToolComplete('minesweeper', { minesweeperWins: currentWins })
    poster.setupForResult(this, {
      icon: '💣', title: '扫雷',
      mainScore: this.data.timeElapsed + '秒', mainScoreLabel: '通关用时',
      rating: '排雷英雄',
      details: [
        { label: '最佳时间', value: storageUtil.get('minesweeper_best_time', 0) + '秒' },
        { label: '胜利次数', value: storageUtil.get('minesweeper_wins', 0) + '次' }
      ],
      color1: '#6B7280', color2: '#374151'
    })
  },

  startNewGame: function() {
    this._newGame()
    wx.showToast({ title: this.data.i18n.newGameStart, icon: 'success' })
  },

  resetStats: function() {
    storageUtil.set('minesweeper_best_time', 0)
    storageUtil.set('minesweeper_wins', 0)
    this.setData({ bestTime: 0, totalWins: 0 })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    return { title: '💣 扫雷 - 我' + this.data.timeElapsed + '秒通关，你来挑战？', path: '/package-fun/minesweeper/minesweeper' }
  },
  onShareTimeline: function() {
    return { title: '💣 扫雷 - 经典扫雷游戏' }
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})