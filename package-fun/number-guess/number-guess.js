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
    currentInput: [],
    guessHistory: [],
    gameState: 'playing',
    guessCount: 0,
    bestRecord: 0,
    totalWins: 0,
    usedDigits: {},
    message: ''
  },
  _answer: [],

  onLoad: function() {
    var best = storageUtil.get('number_guess_best', 0)
    var wins = storageUtil.get('number_guess_wins', 0)
    this.setData({ bestRecord: best, totalWins: wins, i18n: i18n.getToolPageTexts('numberGuess') })
    this._newGame()
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
    poster.setupForPage(this)
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'), themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getToolPageTexts('numberGuess') })
  },

  _newGame: function() {
    poster.hideResultModal(this)
    var digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (var i = digits.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = digits[i]
      digits[i] = digits[j]
      digits[j] = temp
    }
    if (digits[0] === 0) {
      for (var k = 1; k < 4; k++) {
        if (digits[k] !== 0) {
          var t = digits[0]
          digits[0] = digits[k]
          digits[k] = t
          break
        }
      }
    }
    this._answer = [digits[0], digits[1], digits[2], digits[3]]
    this.setData({
      currentInput: [],
      guessHistory: [],
      gameState: 'playing',
      guessCount: 0,
      usedDigits: {},
      message: this.data.i18n.guessANumber || '猜一个4位不重复数字'
    })
  },

  onTapDigit: function(e) {
    if (this.data.gameState !== 'playing') return
    var digit = e.currentTarget.dataset.digit
    var currentInput = this.data.currentInput.slice()
    if (currentInput.length >= 4) return
    var used = this.data.usedDigits
    if (used[digit]) return

    currentInput.push(digit)
    used[digit] = true
    this.setData({ currentInput: currentInput, usedDigits: used })
    wx.vibrateShort({ type: 'light' })
  },

  onTapDelete: function() {
    if (this.data.gameState !== 'playing') return
    var currentInput = this.data.currentInput.slice()
    if (currentInput.length === 0) return
    var removed = currentInput.pop()
    var used = this.data.usedDigits
    used[removed] = false
    this.setData({ currentInput: currentInput, usedDigits: used })
  },

  onTapSubmit: function() {
    if (this.data.gameState !== 'playing') return
    if (this.data.currentInput.length !== 4) {
      wx.showToast({ title: this.data.i18n.pleaseInput4Digits, icon: 'none' })
      return
    }
    var guess = this.data.currentInput.slice()
    var result = this._checkGuess(guess)
    var guessCount = this.data.guessCount + 1
    var history = this.data.guessHistory.slice()
    history.unshift({ guess: guess.join(''), a: result.a, b: result.b, num: guessCount })

    if (result.a === 4) {
      var best = this.data.bestRecord
      if (best === 0 || guessCount < best) best = guessCount
      var wins = this.data.totalWins + 1
      storageUtil.set('number_guess_best', best)
      storageUtil.set('number_guess_wins', wins)
      this.setData({
        guessHistory: history,
        guessCount: guessCount,
        gameState: 'won',
        bestRecord: best,
        totalWins: wins,
        message: this.data.i18n.congratulations + guessCount + this.data.i18n.timesGuessCorrect,
        usedDigits: {}
      })
      wx.vibrateShort({ type: 'heavy' })
      points.recordFunToolUse('number-guess')
      var currentBest = storageUtil.get('number_guess_best', 0)
      achievement.recordFunToolComplete('number-guess', { numberGuessBestTries: currentBest })
      poster.setupForResult(this, {
        icon: '🔢', title: '数字猜谜',
        mainScore: guessCount + '次', mainScoreLabel: '猜中次数',
        rating: guessCount <= 5 ? '逻辑天才' : guessCount <= 10 ? '推理高手' : '继续努力',
        details: [{ label: '最佳记录', value: storageUtil.get('number_guess_best', 0) + '次' }],
        color1: '#3B82F6', color2: '#2563EB'
      })
      wx.showModal({
        title: this.data.i18n.youWin,
        content: this.data.i18n.answerIs + this._answer.join('') + '\n' + this.data.i18n.youUsed + guessCount + this.data.i18n.timesToGuess,
        showCancel: false,
        confirmText: this.data.i18n.playAgain,
        confirmColor: '#3B82F6',
        success: function() {}
      })
    } else {
      this.setData({
        guessHistory: history,
        guessCount: guessCount,
        currentInput: [],
        usedDigits: {},
        message: result.a + 'A' + result.b + 'B' + this.data.i18n.continueGuess
      })
    }
  },

  _checkGuess: function(guess) {
    var a = 0, b = 0
    for (var i = 0; i < 4; i++) {
      if (guess[i] === this._answer[i]) {
        a++
      } else {
        for (var j = 0; j < 4; j++) {
          if (i !== j && guess[i] === this._answer[j]) {
            b++
            break
          }
        }
      }
    }
    return { a: a, b: b }
  },

  startNewGame: function() {
    this._newGame()
    wx.showToast({ title: this.data.i18n.newGameStart, icon: 'success' })
  },

  resetStats: function() {
    storageUtil.set('number_guess_best', 0)
    storageUtil.set('number_guess_wins', 0)
    this.setData({ bestRecord: 0, totalWins: 0 })
    wx.showToast({ title: this.data.i18n.resetDone, icon: 'success' })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🔢 数字猜谜 - 我' + this.data.guessCount + '次猜中，你来挑战？', '/package-fun/number-guess/number-guess')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🔢 数字猜谜 - 锻炼逻辑推理能力')
  },
  closeResultModal: function() {
    poster.hideResultModal(this)
  }
})
