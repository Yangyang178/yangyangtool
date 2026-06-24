var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var achievement = require('../../utils/achievement.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var DIFFICULTY_MAP = {
  easy: { rows: 8, cols: 8 },
  medium: { rows: 10, cols: 10 },
  hard: { rows: 12, cols: 12 }
}

var BEST_TIME_KEYS = {
  easy: 'maze_best_easy',
  medium: 'maze_best_medium',
  hard: 'maze_best_hard'
}

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    difficulty: 'easy',
    rows: 8,
    cols: 8,
    playerRow: 0,
    playerCol: 0,
    gameState: 'idle',
    timeElapsed: 0,
    stepCount: 0,
    bestTime: 0,
    bestTimeDisplay: '-',
    totalWins: 0,
    difficultyLabel: '简单',
    message: ''
  },

  _maze: null,
  _visited: null,
  _touchStartX: 0,
  _touchStartY: 0,
  _timer: null,
  _startTime: 0,
  _canvas: null,
  _ctx: null,
  _dpr: 1,
  _canvasWidth: 0,
  _canvasHeight: 0,

  onLoad: function() {
    var app = getApp()
    var difficulty = storageUtil.get('maze_difficulty', 'easy')
    var sizeInfo = DIFFICULTY_MAP[difficulty]
    var bestTime = storageUtil.get(BEST_TIME_KEYS[difficulty], 0)
    var totalWins = storageUtil.get('maze_total_wins', 0)
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      difficulty: difficulty,
      rows: sizeInfo.rows,
      cols: sizeInfo.cols,
      bestTime: bestTime,
      bestTimeDisplay: bestTime > 0 ? bestTime + 's' : '-',
      totalWins: totalWins,
      difficultyLabel: this._getDifficultyLabel(difficulty),
      i18n: i18n.getToolPageTexts('maze')
    })
    this._initCanvas()
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
      i18n: i18n.getToolPageTexts('maze')
    })
  },

  onUnload: function() {
    if (this._timer) {
      clearInterval(this._timer)
    }
  },

  _getDifficultyLabel: function(diff) {
    if (diff === 'easy') return '简单'
    if (diff === 'medium') return '中等'
    if (diff === 'hard') return '困难'
    return '简单'
  },

  _initCanvas: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#mazeCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0] || !res[0].node) return
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = wx.getWindowInfo().pixelRatio
        var width = res[0].width
        var height = res[0].height

        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        that._canvas = canvas
        that._ctx = ctx
        that._dpr = dpr
        that._canvasWidth = width
        that._canvasHeight = height

        that._generateMaze()
        that._drawMaze()
      })
  },

  _generateMaze: function() {
    var rows = this.data.rows
    var cols = this.data.cols
    var maze = []
    var visited = []
    var i, j

    for (i = 0; i < rows; i++) {
      maze[i] = []
      visited[i] = []
      for (j = 0; j < cols; j++) {
        maze[i][j] = { top: true, right: true, bottom: true, left: true }
        visited[i][j] = false
      }
    }

    var stack = []
    var startR = 0
    var startC = 0
    visited[startR][startC] = true
    stack.push({ r: startR, c: startC })

    while (stack.length > 0) {
      var current = stack[stack.length - 1]
      var r = current.r
      var c = current.c
      var neighbors = []

      if (r > 0 && !visited[r - 1][c]) neighbors.push({ r: r - 1, c: c, dir: 'top' })
      if (r < rows - 1 && !visited[r + 1][c]) neighbors.push({ r: r + 1, c: c, dir: 'bottom' })
      if (c > 0 && !visited[r][c - 1]) neighbors.push({ r: r, c: c - 1, dir: 'left' })
      if (c < cols - 1 && !visited[r][c + 1]) neighbors.push({ r: r, c: c + 1, dir: 'right' })

      if (neighbors.length > 0) {
        var next = neighbors[Math.floor(Math.random() * neighbors.length)]
        if (next.dir === 'top') {
          maze[r][c].top = false
          maze[next.r][next.c].bottom = false
        } else if (next.dir === 'bottom') {
          maze[r][c].bottom = false
          maze[next.r][next.c].top = false
        } else if (next.dir === 'left') {
          maze[r][c].left = false
          maze[next.r][next.c].right = false
        } else if (next.dir === 'right') {
          maze[r][c].right = false
          maze[next.r][next.c].left = false
        }
        visited[next.r][next.c] = true
        stack.push({ r: next.r, c: next.c })
      } else {
        stack.pop()
      }
    }

    this._maze = maze
    this._visited = []
    for (i = 0; i < rows; i++) {
      this._visited[i] = []
      for (j = 0; j < cols; j++) {
        this._visited[i][j] = false
      }
    }
    this._visited[0][0] = true
  },

  _drawMaze: function() {
    var ctx = this._ctx
    if (!ctx) return

    var width = this._canvasWidth
    var height = this._canvasHeight
    var rows = this.data.rows
    var cols = this.data.cols
    var maze = this._maze
    var isDark = this.data.isDarkMode
    var playerRow = this.data.playerRow
    var playerCol = this.data.playerCol

    var padding = 10
    var cellW = (width - padding * 2) / cols
    var cellH = (height - padding * 2) / rows
    var cellSize = Math.min(cellW, cellH)
    var offsetX = (width - cellSize * cols) / 2
    var offsetY = (height - cellSize * rows) / 2

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 背景
    ctx.fillStyle = isDark ? '#1e1e3a' : '#f9fafb'
    ctx.fillRect(0, 0, width, height)

    // 绘制已访问路径
    if (this._visited) {
      for (var vi = 0; vi < rows; vi++) {
        for (var vj = 0; vj < cols; vj++) {
          if (this._visited[vi][vj]) {
            var vx = offsetX + vj * cellSize
            var vy = offsetY + vi * cellSize
            ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'
            ctx.fillRect(vx + 1, vy + 1, cellSize - 2, cellSize - 2)
          }
        }
      }
    }

    // 绘制终点
    var endX = offsetX + (cols - 1) * cellSize + cellSize / 2
    var endY = offsetY + (rows - 1) * cellSize + cellSize / 2
    var endRadius = cellSize * 0.3
    ctx.beginPath()
    ctx.arc(endX, endY, endRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#10B981'
    ctx.fill()
    // 旗帜标记
    ctx.fillStyle = '#ffffff'
    ctx.font = Math.floor(cellSize * 0.35) + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚑', endX, endY)

    // 绘制墙壁
    ctx.strokeStyle = isDark ? '#8888aa' : '#374151'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    for (var ri = 0; ri < rows; ri++) {
      for (var ci = 0; ci < cols; ci++) {
        var x = offsetX + ci * cellSize
        var y = offsetY + ri * cellSize
        var cell = maze[ri][ci]

        if (cell.top) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + cellSize, y)
          ctx.stroke()
        }
        if (cell.right) {
          ctx.beginPath()
          ctx.moveTo(x + cellSize, y)
          ctx.lineTo(x + cellSize, y + cellSize)
          ctx.stroke()
        }
        if (cell.bottom) {
          ctx.beginPath()
          ctx.moveTo(x, y + cellSize)
          ctx.lineTo(x + cellSize, y + cellSize)
          ctx.stroke()
        }
        if (cell.left) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + cellSize)
          ctx.stroke()
        }
      }
    }

    // 绘制外边框（确保完整）
    ctx.strokeStyle = isDark ? '#8888aa' : '#374151'
    ctx.lineWidth = 3
    ctx.strokeRect(offsetX, offsetY, cellSize * cols, cellSize * rows)

    // 绘制玩家
    var px = offsetX + playerCol * cellSize + cellSize / 2
    var py = offsetY + playerRow * cellSize + cellSize / 2
    var pRadius = cellSize * 0.3
    ctx.beginPath()
    ctx.arc(px, py, pRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#3B82F6'
    ctx.fill()
    // 玩家内圈高光
    ctx.beginPath()
    ctx.arc(px - pRadius * 0.2, py - pRadius * 0.2, pRadius * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fill()
  },

  onTouchStart: function(e) {
    if (e.touches && e.touches.length > 0) {
      this._touchStartX = e.touches[0].clientX
      this._touchStartY = e.touches[0].clientY
    }
  },

  onTouchEnd: function(e) {
    if (this.data.gameState === 'won') return
    if (!e.changedTouches || e.changedTouches.length === 0) return

    var dx = e.changedTouches[0].clientX - this._touchStartX
    var dy = e.changedTouches[0].clientY - this._touchStartY
    var absDx = Math.abs(dx)
    var absDy = Math.abs(dy)

    if (Math.max(absDx, absDy) < 20) return

    if (absDx > absDy) {
      if (dx > 0) {
        this._movePlayer('right')
      } else {
        this._movePlayer('left')
      }
    } else {
      if (dy > 0) {
        this._movePlayer('down')
      } else {
        this._movePlayer('up')
      }
    }
  },

  _movePlayer: function(direction) {
    var row = this.data.playerRow
    var col = this.data.playerCol
    var maze = this._maze
    if (!maze) return

    var cell = maze[row][col]
    var newRow = row
    var newCol = col

    if (direction === 'up' && !cell.top) {
      newRow = row - 1
    } else if (direction === 'down' && !cell.bottom) {
      newRow = row + 1
    } else if (direction === 'left' && !cell.left) {
      newCol = col - 1
    } else if (direction === 'right' && !cell.right) {
      newCol = col + 1
    } else {
      return
    }

    if (newRow < 0 || newRow >= this.data.rows || newCol < 0 || newCol >= this.data.cols) return

    // 首次移动开始计时
    if (this.data.gameState === 'idle') {
      this.setData({ gameState: 'playing', message: '' })
      this._startTime = Date.now()
      var that = this
      this._timer = setInterval(function() {
        that.setData({ timeElapsed: Math.floor((Date.now() - that._startTime) / 1000) })
      }, 1000)
    }

    this._visited[newRow][newCol] = true
    var stepCount = this.data.stepCount + 1

    this.setData({
      playerRow: newRow,
      playerCol: newCol,
      stepCount: stepCount
    })

    this._drawMaze()

    // 检查是否到达终点
    if (newRow === this.data.rows - 1 && newCol === this.data.cols - 1) {
      this._gameWon()
    }
  },

  _gameWon: function() {
    var that = this
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    var timeElapsed = this.data.timeElapsed
    var difficulty = this.data.difficulty
    var bestTime = this.data.bestTime
    if (bestTime === 0 || timeElapsed < bestTime) {
      bestTime = timeElapsed
    }
    var totalWins = this.data.totalWins + 1

    storageUtil.set(BEST_TIME_KEYS[difficulty], bestTime)
    storageUtil.set('maze_total_wins', totalWins)

    this.setData({
      gameState: 'won',
      message: this.data.i18n.congratulations + timeElapsed + this.data.i18n.seconds + '，' + stepCountLabel(this.data.stepCount),
      bestTime: bestTime,
      bestTimeDisplay: bestTime + 's',
      totalWins: totalWins
    })

    wx.vibrateShort({ type: 'medium' })

    points.recordFunToolUse('maze')
    var currentWins = storageUtil.get('maze_total_wins', 0)
    achievement.recordFunToolComplete('maze', { mazeWins: currentWins })

    poster.setupForResult(this, {
      icon: '🏰', title: '迷宫',
      mainScore: this.data.timeElapsed + '秒', mainScoreLabel: '通关用时',
      rating: '迷宫探索者',
      details: [
        { label: '步数', value: this.data.stepCount + '步' },
        { label: '难度', value: this.data.difficultyLabel || '中等' }
      ],
      color1: '#7C3AED', color2: '#5B21B6'
    })

    function stepCountLabel(steps) {
      return that.data.i18n.totalSteps + steps + that.data.i18n.stepsUnit
    }
  },

  newGame: function() {
    poster.hideResultModal(this)
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    this.setData({
      playerRow: 0,
      playerCol: 0,
      gameState: 'idle',
      timeElapsed: 0,
      stepCount: 0,
      message: this.data.i18n.slideToMove || '滑动屏幕开始移动'
    })
    this._generateMaze()
    this._drawMaze()
    wx.showToast({ title: this.data.i18n.newMazeGenerated, icon: 'success' })
  },

  changeDifficulty: function(e) {
    var diff = e.currentTarget.dataset.diff
    if (diff === this.data.difficulty) return

    var sizeInfo = DIFFICULTY_MAP[diff]
    var bestTime = storageUtil.get(BEST_TIME_KEYS[diff], 0)
    storageUtil.set('maze_difficulty', diff)

    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }

    this.setData({
      difficulty: diff,
      rows: sizeInfo.rows,
      cols: sizeInfo.cols,
      playerRow: 0,
      playerCol: 0,
      gameState: 'idle',
      timeElapsed: 0,
      stepCount: 0,
      bestTime: bestTime,
      bestTimeDisplay: bestTime > 0 ? bestTime + 's' : '-',
      difficultyLabel: this._getDifficultyLabel(diff),
      message: this.data.i18n.slideToMove || '滑动屏幕开始移动'
    })

    this._generateMaze()
    this._drawMaze()
  },

  resetStats: function() {
    var difficulty = this.data.difficulty
    storageUtil.set(BEST_TIME_KEYS[difficulty], 0)
    storageUtil.set('maze_total_wins', 0)
    this.setData({
      bestTime: 0,
      bestTimeDisplay: '-',
      totalWins: 0
    })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    return {
      title: '🏰 迷宫 - 我' + this.data.timeElapsed + '秒通关，你来挑战？',
      path: '/package-fun/maze/maze'
    }
  },

  onShareTimeline: function() {
    return {
      title: '🏰 迷宫 - 随机迷宫计时通关挑战'
    }
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})