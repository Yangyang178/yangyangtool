var i18n = require('../../utils/i18n.js')
var storage = require('../../utils/storage.js')
var points = require('../../utils/points.js')

var LEVELS = [
  { char: '照', answers: ['日', '刀', '口', '灬'] },
  { char: '想', answers: ['木', '目', '心'] },
  { char: '影', answers: ['日', '京', '彡'] },
  { char: '谢', answers: ['讠', '身', '寸'] },
  { char: '算', answers: ['竹', '目', '廾'] },
  { char: '碧', answers: ['王', '白', '石'] },
  { char: '霜', answers: ['雨', '木', '目'] },
  { char: '藏', answers: ['艹', '臣', '戈'] },
  { char: '德', answers: ['彳', '十', '心'] },
  { char: '器', answers: ['口', '口', '口', '口', '犬'] },
  { char: '赢', answers: ['亡', '口', '月', '贝', '凡'] },
  { char: '繁', answers: ['每', '糸'] },
  { char: '操', answers: ['扌', '口', '木'] },
  { char: '燃', answers: ['火', '犬', '灬'] },
  { char: '潮', answers: ['氵', '朝'] },
  { char: '懂', answers: ['忄', '艹', '重'] },
  { char: '醒', answers: ['酉', '星'] },
  { char: '磨', answers: ['麻', '石'] },
  { char: '糖', answers: ['米', '唐'] },
  { char: '飘', answers: ['票', '风'] },
  { char: '爆', answers: ['火', '暴'] },
  { char: '舞', answers: ['夕', '舛'] },
  { char: '熊', answers: ['能', '灬'] },
  { char: '鲜', answers: ['鱼', '羊'] },
  { char: '黎', answers: ['禾', '人', '水'] },
  { char: '暮', answers: ['莫', '日'] },
  { char: '晨', answers: ['日', '辰'] },
  { char: '暴', answers: ['日', '共', '水'] },
  { char: '霜', answers: ['雨', '相'] },
  { char: '慕', answers: ['莫', '㣺'] }
]

Page({
  data: {
    gameState: 'idle',
    level: 1,
    currentChar: '',
    allAnswers: [],
    foundChars: [],
    targetCount: 0,
    foundCount: 0,
    remainingSlots: [],
    inputValue: '',
    hintsLeft: 3,
    showWrongHint: false,
    isDarkMode: false,
    fontSizeSetting: 'medium',
    i18n: {}
  },

  onLoad: function() {
    var app = getApp()
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: app.globalData.fontSizeSetting || 'medium',
      i18n: i18n.getToolPageTexts('charFinder')
    })
  },

  onShow: function() {
    var app = getApp()
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: app.globalData.fontSizeSetting || 'medium',
      i18n: i18n.getToolPageTexts('charFinder')
    })
  },

  startGame: function() {
    this.setData({ gameState: 'playing', level: 1 })
    this._loadLevel()
  },

  _loadLevel: function() {
    var idx = (this.data.level - 1) % LEVELS.length
    var levelData = LEVELS[idx]
    var target = levelData.answers.length
    var remaining = []
    for (var i = 0; i < target; i++) { remaining.push(i) }
    this.setData({
      currentChar: levelData.char,
      allAnswers: levelData.answers,
      foundChars: [],
      targetCount: target,
      foundCount: 0,
      remainingSlots: remaining,
      inputValue: '',
      showWrongHint: false
    })
  },

  onInput: function(e) {
    this.setData({ inputValue: e.detail.value })
  },

  onSubmit: function() {
    var input = this.data.inputValue.trim()
    if (!input) return
    var found = this.data.foundChars
    var answers = this.data.allAnswers
    var isCorrect = false
    for (var i = 0; i < answers.length; i++) {
      if (answers[i] === input) {
        var alreadyFound = false
        for (var j = 0; j < found.length; j++) {
          if (found[j] === input) { alreadyFound = true; break }
        }
        if (!alreadyFound) { isCorrect = true; found.push(input); break }
      }
    }
    if (isCorrect) {
      var newCount = found.length
      var newRemaining = this.data.targetCount - newCount
      var slots = []
      for (var k = 0; k < newRemaining; k++) { slots.push(k) }
      this.setData({ foundChars: found, foundCount: newCount, remainingSlots: slots, inputValue: '', showWrongHint: false })
      if (newCount >= this.data.targetCount) {
        points.recordFunToolUse('char-finder')
        var currentLevel = this.data.level
        var bestLevel = storage.get('cf_best_level', 0)
        if (currentLevel > bestLevel) {
          storage.set('cf_best_level', currentLevel)
        }
        var that = this
        setTimeout(function() { that.setData({ gameState: 'levelComplete' }) }, 500)
      }
    } else {
      this.setData({ showWrongHint: true, inputValue: '' })
      var that2 = this
      setTimeout(function() { that2.setData({ showWrongHint: false }) }, 1500)
    }
  },

  nextLevel: function() {
    var nextLevel = this.data.level + 1
    if (nextLevel > LEVELS.length) {
      this.setData({ gameState: 'allComplete' })
    } else {
      this.setData({ level: nextLevel, gameState: 'playing' })
      this._loadLevel()
    }
  },

  goBack: function() {
    wx.navigateBack({ delta: 1 })
  }
})
