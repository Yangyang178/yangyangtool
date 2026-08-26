var storageUtil = require('../../utils/storage.js')
var i18n = require('../../utils/i18n.js')
var poster = require('../utils/poster.js')

// 数字点阵定义（7段显示风格，5x7网格）
var DIGIT_DOTS = {
  0: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  2: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1]
  ],
  3: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  5: [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  6: [
    [0,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  7: [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0]
  ],
  8: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  9: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0]
  ]
}

// 色盲测试题目数据
var COLOR_BLIND_TESTS = [
  { answer: 6, wrongAnswers: [2, 5], bgColors: ['#6B8E23','#556B2F','#8FBC8F','#9ACD32','#808000'], numColors: ['#DC143C','#B22222','#CD5C5C','#F08080','#E9967A'] },
  { answer: 2, wrongAnswers: [7, 3], bgColors: ['#DC143C','#B22222','#CD5C5C','#F08080','#E9967A'], numColors: ['#6B8E23','#556B2F','#8FBC8F','#9ACD32','#808000'] },
  { answer: 8, wrongAnswers: [3, 5], bgColors: ['#4682B4','#5F9EA0','#6495ED','#87CEEB','#00BFFF'], numColors: ['#FF8C00','#FF7F50','#FFA07A','#FFD700','#FFDAB9'] },
  { answer: 5, wrongAnswers: [2, 8], bgColors: ['#9ACD32','#808000','#6B8E23','#556B2F','#8FBC8F'], numColors: ['#8A2BE2','#9370DB','#BA55D3','#DDA0DD','#EE82EE'] },
  { answer: 7, wrongAnswers: [1, 4], bgColors: ['#FF6347','#FF4500','#FF7F50','#FA8072','#E9967A'], numColors: ['#2E8B57','#3CB371','#66CDAA','#8FBC8F','#20B2AA'] },
  { answer: 3, wrongAnswers: [5, 8], bgColors: ['#8A2BE2','#9370DB','#BA55D3','#DDA0DD','#EE82EE'], numColors: ['#FF8C00','#FF7F50','#FFA07A','#FFD700','#FFDAB9'] },
  { answer: 9, wrongAnswers: [6, 4], bgColors: ['#2E8B57','#3CB371','#66CDAA','#8FBC8F','#20B2AA'], numColors: ['#DC143C','#B22222','#CD5C5C','#F08080','#E9967A'] },
  { answer: 0, wrongAnswers: [8, 6], bgColors: ['#FF8C00','#FF7F50','#FFA07A','#FFD700','#FFDAB9'], numColors: ['#4682B4','#5F9EA0','#6495ED','#87CEEB','#00BFFF'] }
]

// 视力表级别数据
var ACUITY_LEVELS = [
  { size: 72, vision: '4.0', label: '4.0' },
  { size: 56, vision: '4.3', label: '4.3' },
  { size: 44, vision: '4.5', label: '4.5' },
  { size: 34, vision: '4.7', label: '4.7' },
  { size: 26, vision: '4.9', label: '4.9' },
  { size: 20, vision: '5.0', label: '5.0' },
  { size: 16, vision: '5.1', label: '5.1' },
  { size: 13, vision: '5.2', label: '5.2' }
]

var DIRECTIONS = ['up', 'down', 'left', 'right']

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    currentTab: 'color',

    // 色盲测试
    colorQuestionIndex: 0,
    colorAnswer: '',
    colorScore: 0,
    colorTotal: 8,
    colorResult: '',
    colorResultType: '',
    colorTests: COLOR_BLIND_TESTS,
    colorProgress: '1/8',
    colorFinished: false,

    // 散光测试
    astigmatismResult: '',
    astigmatismResultType: '',

    // 视力表
    acuityLevel: 0,
    acuityRound: 0,
    acuityScore: 0,
    acuityCurrentDir: 'right',
    acuityResult: '',
    acuityResultType: '',
    acuityLevels: ACUITY_LEVELS,
    acuityCurrentSize: 72,
    acuityCurrentVision: '4.0',
    acuityProgress: '1/3',
    acuityFinished: false,
    acuityERotation: '0deg'
  },

  onLoad: function() {
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false, i18n: i18n.getToolPageTexts('visionTest') })
    this._initAcuityRound()
    poster.setupForPage(this)
  },

  onShow: function() {
    var app = getApp()
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      i18n: i18n.getToolPageTexts('visionTest')
    })
    this._drawCurrentCanvas()
  },

  onUnload: function() {
    if (this._switchTimer) { clearTimeout(this._switchTimer); this._switchTimer = null }
    if (this._drawTimer) { clearTimeout(this._drawTimer); this._drawTimer = null }
  },

  // ========== Tab切换 ==========
  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    var that = this
    this._switchTimer = setTimeout(function() {
      that._drawCurrentCanvas()
    }, 300)
  },

  _drawCurrentCanvas: function() {
    if (this.data.currentTab === 'color' && !this.data.colorFinished) {
      this._drawColorBlindTest()
    } else if (this.data.currentTab === 'astigmatism') {
      this._drawAstigmatismTest()
    }
  },

  // ========== 色盲测试 ==========
  onColorInput: function(e) {
    this.setData({ colorAnswer: e.detail.value })
  },

  submitColorAnswer: function() {
    var answer = this.data.colorAnswer.trim()
    if (answer === '') {
      wx.showToast({ title: this.data.i18n.pleaseInputDigit, icon: 'none' })
      return
    }

    var index = this.data.colorQuestionIndex
    var test = COLOR_BLIND_TESTS[index]
    var score = this.data.colorScore
    var userNum = parseInt(answer, 10)

    if (userNum === test.answer) {
      score++
    }

    var nextIndex = index + 1
    if (nextIndex >= COLOR_BLIND_TESTS.length) {
      // 测试完成
      var result = ''
      var resultType = ''
      if (score === 8) {
        result = this.data.i18n.colorNormal
        resultType = 'good'
      } else if (score >= 6) {
        result = this.data.i18n.colorMildAbnormal
        resultType = 'warn'
      } else {
        result = this.data.i18n.colorAbnormal
        resultType = 'bad'
      }
      this.setData({
        colorScore: score,
        colorFinished: true,
        colorResult: result,
        colorResultType: resultType,
        colorProgress: '8/8'
      })
      storageUtil.set('vision_color_score', score)
    } else {
      this.setData({
        colorScore: score,
        colorQuestionIndex: nextIndex,
        colorAnswer: '',
        colorProgress: (nextIndex + 1) + '/8'
      })
      var that = this
      this._drawTimer = setTimeout(function() {
        that._drawColorBlindTest()
      }, 100)
    }
  },

  nextColorQuestion: function() {
    // 此方法保留用于扩展，当前逻辑在submitColorAnswer中处理
  },

  resetColorTest: function() {
    this.setData({
      colorQuestionIndex: 0,
      colorAnswer: '',
      colorScore: 0,
      colorResult: '',
      colorResultType: '',
      colorFinished: false,
      colorProgress: '1/8'
    })
    var that = this
    this._drawTimer = setTimeout(function() {
      that._drawColorBlindTest()
    }, 100)
  },

  _drawColorBlindTest: function() {
    var index = this.data.colorQuestionIndex
    var test = COLOR_BLIND_TESTS[index]
    var that = this

    var query = wx.createSelectorQuery()
    query.select('#colorBlindCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getSystemInfoSync().pixelRatio
      var width = 280
      var height = 280
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // 清空画布
      ctx.fillStyle = '#F5F5F5'
      ctx.fillRect(0, 0, width, height)

      // 画背景圆点
      var dotSize = 10
      var cols = Math.floor(width / dotSize)
      var rows = Math.floor(height / dotSize)
      var bgColors = test.bgColors
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var colorIdx = Math.floor(Math.random() * bgColors.length)
          ctx.fillStyle = bgColors[colorIdx]
          ctx.beginPath()
          var cx = c * dotSize + dotSize / 2 + (Math.random() - 0.5) * 3
          var cy = r * dotSize + dotSize / 2 + (Math.random() - 0.5) * 3
          var radius = dotSize / 2 - 1 + Math.random() * 2
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // 画数字圆点
      var digit = test.answer
      var dots = DIGIT_DOTS[digit]
      if (!dots) return

      var numColors = test.numColors
      var offsetX = Math.floor((cols - 5) / 2)
      var offsetY = Math.floor((rows - 7) / 2)

      for (var row = 0; row < dots.length; row++) {
        for (var col = 0; col < dots[row].length; col++) {
          if (dots[row][col] === 1) {
            var numColorIdx = Math.floor(Math.random() * numColors.length)
            ctx.fillStyle = numColors[numColorIdx]
            ctx.beginPath()
            var ncx = (col + offsetX) * dotSize + dotSize / 2 + (Math.random() - 0.5) * 2
            var ncy = (row + offsetY) * dotSize + dotSize / 2 + (Math.random() - 0.5) * 2
            var nradius = dotSize / 2 - 1 + Math.random() * 2
            ctx.arc(ncx, ncy, nradius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    })
  },

  // ========== 散光测试 ==========
  onAstigmatismSelect: function(e) {
    var choice = e.currentTarget.dataset.choice
    var result = ''
    var resultType = ''
    if (choice === 'same') {
      result = this.data.i18n.astigmatismNormal
      resultType = 'good'
    } else {
      result = this.data.i18n.astigmatismAbnormal
      resultType = 'warn'
    }
    this.setData({
      astigmatismResult: result,
      astigmatismResultType: resultType
    })
    storageUtil.set('vision_astigmatism_result', choice)
  },

  resetAstigmatism: function() {
    this.setData({
      astigmatismResult: '',
      astigmatismResultType: ''
    })
  },

  _drawAstigmatismTest: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#astigmatismCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getSystemInfoSync().pixelRatio
      var width = 280
      var height = 280
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // 白色背景
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)

      var centerX = width / 2
      var centerY = height / 2
      var lineCount = 24
      var lineLength = 120

      // 画放射线
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1.5
      for (var i = 0; i < lineCount; i++) {
        var angle = (Math.PI * 2 / lineCount) * i
        var endX = centerX + Math.cos(angle) * lineLength
        var endY = centerY + Math.sin(angle) * lineLength
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }

      // 画中心圆点
      ctx.fillStyle = '#333333'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
      ctx.fill()

      // 画外圈
      ctx.strokeStyle = '#999999'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, lineLength, 0, Math.PI * 2)
      ctx.stroke()
    })
  },

  // ========== 视力表 ==========
  _initAcuityRound: function() {
    var level = this.data.acuityLevel
    var levelData = ACUITY_LEVELS[level]
    var dir = DIRECTIONS[Math.floor(Math.random() * 4)]
    var rotation = this._getRotation(dir)
    this.setData({
      acuityCurrentDir: dir,
      acuityCurrentSize: levelData.size,
      acuityCurrentVision: levelData.vision,
      acuityERotation: rotation,
      acuityProgress: '1/3'
    })
  },

  _getRotation: function(dir) {
    if (dir === 'right') return '0deg'
    if (dir === 'down') return '90deg'
    if (dir === 'left') return '180deg'
    if (dir === 'up') return '270deg'
    return '0deg'
  },

  onDirectionClick: function(e) {
    if (this.data.acuityFinished) return

    var direction = e.currentTarget.dataset.dir
    var currentDir = this.data.acuityCurrentDir
    var score = this.data.acuityScore
    var round = this.data.acuityRound
    var level = this.data.acuityLevel

    if (direction === currentDir) {
      score++
    }

    round++

    if (round >= 3) {
      // 本级3题完成
      if (score >= 2) {
        // 通过本级，进入下一级
        level++
        if (level >= ACUITY_LEVELS.length) {
          // 全部通过
          this.setData({
            acuityFinished: true,
            acuityResult: this.data.i18n.acuityExcellent,
            acuityResultType: 'good',
            acuityScore: score
          })
          storageUtil.set('vision_acuity_result', '5.2')
          return
        }
        // 进入下一级
        var nextLevelData = ACUITY_LEVELS[level]
        var nextDir = DIRECTIONS[Math.floor(Math.random() * 4)]
        var nextRotation = this._getRotation(nextDir)
        this.setData({
          acuityLevel: level,
          acuityRound: 0,
          acuityScore: 0,
          acuityCurrentDir: nextDir,
          acuityCurrentSize: nextLevelData.size,
          acuityCurrentVision: nextLevelData.vision,
          acuityERotation: nextRotation,
          acuityProgress: '1/3'
        })
      } else {
        // 未通过本级，测试结束
        var currentLevelData = ACUITY_LEVELS[level]
        var result = ''
        var resultType = ''
        if (level === 0) {
          result = this.data.i18n.acuityWeak
          resultType = 'bad'
        } else {
          var prevLevelData = ACUITY_LEVELS[level - 1]
          result = this.data.i18n.acuityResultPrefix + prevLevelData.vision + '。'
          if (parseFloat(prevLevelData.vision) >= 4.9) {
            resultType = 'good'
          } else if (parseFloat(prevLevelData.vision) >= 4.5) {
            resultType = 'warn'
          } else {
            resultType = 'bad'
          }
        }
        this.setData({
          acuityFinished: true,
          acuityResult: result,
          acuityResultType: resultType,
          acuityScore: score
        })
        storageUtil.set('vision_acuity_result', currentLevelData.vision)
      }
    } else {
      // 继续本级下一题
      var newDir = DIRECTIONS[Math.floor(Math.random() * 4)]
      var newRotation = this._getRotation(newDir)
      this.setData({
        acuityRound: round,
        acuityScore: score,
        acuityCurrentDir: newDir,
        acuityERotation: newRotation,
        acuityProgress: (round + 1) + '/3'
      })
    }
  },

  resetAcuity: function() {
    this.setData({
      acuityLevel: 0,
      acuityRound: 0,
      acuityScore: 0,
      acuityResult: '',
      acuityResultType: '',
      acuityFinished: false
    })
    this._initAcuityRound()
  },

  // ========== 分享 ==========
  onShareAppMessage: function() {
    return poster.getShareConfig('👁 视力测试 - 色盲/散光/视力表，快来测测你的视力！', '/package-fun/vision-test/vision-test')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('👁 视力测试 - 色盲/散光/视力表')
  }
})
