var i18n = require('../../utils/i18n.js')
var storage = require('../../utils/storage.js')
var points = require('../../utils/points.js')

var DIFFICULTY_MAP = {
  easy: { count: 9 },
  normal: { count: 16 },
  hard: { count: 25 }
}

Page({
  data: {
    gameState: 'idle',
    difficulty: 'normal',
    level: 1,
    numbers: 16,
    nextNumber: 1,
    gridNumbers: [],
    formattedTime: '0.0',
    usedTime: 0,
    wrongCount: 0,
    bestTime: 0,
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
      i18n: i18n.getToolPageTexts('numberSequence')
    })
    this.loadBestRecord()
  },

  onShow: function() {
    var app = getApp()
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: app.globalData.fontSizeSetting || 'medium',
      i18n: i18n.getToolPageTexts('numberSequence')
    })
  },

  loadBestRecord: function() {
    var best = storage.get('ns_best_' + this.data.difficulty, 0)
    this.setData({ bestTime: best })
  },

  setDifficulty: function(e) {
    var diff = e.currentTarget.dataset.diff
    this.setData({ difficulty: diff, numbers: DIFFICULTY_MAP[diff].count })
    this.loadBestRecord()
  },

  startGame: function() {
    var diff = this.data.difficulty
    var count = DIFFICULTY_MAP[diff].count
    var cols = diff === 'easy' ? 3 : diff === 'normal' ? 4 : 5
    var rows = Math.ceil(count / cols)
    var numbers = []
    var cellW = 80 / cols
    var cellH = 80 / rows
    for (var i = 1; i <= count; i++) {
      var col = (i - 1) % cols
      var row = Math.floor((i - 1) / cols)
      var x = 10 + col * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * 0.3
      var y = 5 + row * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * 0.3
      if (x < 8) x = 8
      if (x > 88) x = 88
      if (y < 5) y = 5
      if (y > 90) y = 90
      numbers.push({ num: i, x: x, y: y, tapped: false, wrong: false })
    }
    // Shuffle positions while keeping numbers in order
    var positions = []
    for (var j = 0; j < count; j++) {
      positions.push({ x: numbers[j].x, y: numbers[j].y })
    }
    for (var k = positions.length - 1; k > 0; k--) {
      var swapIdx = Math.floor(Math.random() * (k + 1))
      var temp = positions[k]
      positions[k] = positions[swapIdx]
      positions[swapIdx] = temp
    }
    // Assign shuffled positions but keep numbers 1-N
    var shuffled = []
    var numArr = []
    for (var m = 1; m <= count; m++) numArr.push(m)
    for (var n = numArr.length - 1; n > 0; n--) {
      var si = Math.floor(Math.random() * (n + 1))
      var tmp = numArr[n]
      numArr[n] = numArr[si]
      numArr[si] = tmp
    }
    for (var p = 0; p < count; p++) {
      shuffled.push({ num: numArr[p], x: positions[p].x, y: positions[p].y, tapped: false, wrong: false })
    }
    this.setData({
      gameState: 'playing',
      numbers: count,
      nextNumber: 1,
      gridNumbers: shuffled,
      formattedTime: '0.0',
      usedTime: 0,
      wrongCount: 0,
      isNewRecord: false
    })
    this._startTimer()
  },

  _startTimer: function() {
    var that = this
    this._startTime = Date.now()
    this._timer = setInterval(function() {
      var elapsed = (Date.now() - that._startTime) / 1000
      that.setData({ formattedTime: elapsed.toFixed(1) })
    }, 100)
  },

  _stopTimer: function() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    var elapsed = (Date.now() - this._startTime) / 1000
    this.setData({ usedTime: Math.round(elapsed * 10) / 10 })
  },

  onNumberTap: function(e) {
    if (this.data.gameState !== 'playing') return
    var index = e.currentTarget.dataset.index
    var item = this.data.gridNumbers[index]
    if (item.tapped) return

    if (item.num === this.data.nextNumber) {
      var gridNumbers = this.data.gridNumbers
      gridNumbers[index].tapped = true
      var nextNum = this.data.nextNumber + 1
      this.setData({ gridNumbers: gridNumbers, nextNumber: nextNum })
      if (nextNum > this.data.numbers) {
        this._stopTimer()
        this._checkRecord()
        points.recordFunToolUse('number-sequence')
        this.setData({ gameState: 'finished' })
      }
    } else {
      var gridNumbers2 = this.data.gridNumbers.slice()
      gridNumbers2[index].wrong = true
      var newWrong = this.data.wrongCount + 1
      this.setData({ gridNumbers: gridNumbers2, wrongCount: newWrong })
      var that = this
      setTimeout(function() {
        var grid = that.data.gridNumbers.slice()
        grid[index].wrong = false
        that.setData({ gridNumbers: grid })
      }, 300)
    }
  },

  _checkRecord: function() {
    var usedTime = this.data.usedTime
    var bestKey = 'ns_best_' + this.data.difficulty
    var best = storage.get(bestKey, 0)
    if (best === 0 || usedTime < best) {
      storage.set(bestKey, usedTime)
      this.setData({ bestTime: usedTime, isNewRecord: true })
    }
  },

  goBack: function() {
    wx.navigateBack({ delta: 1 })
  }
})
