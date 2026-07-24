var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')
var poster = require('../utils/poster.js')

// 测试数据从 i18n 动态获取（支持中英文切换）
function getTests() {
  var texts = i18n.getToolPageTexts('psychologyTest')
  return (texts && texts.tests) ? texts.tests : []
}

// 格式化进度文案
function formatProgress(fmt, cur, total) {
  return (fmt || '{cur}/{total}').replace('{cur}', cur).replace('{total}', total)
}

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: '',
    page: 'list',
    testList: [],
    currentTestIndex: -1,
    currentQuestionIndex: 0,
    currentQuestionText: '',
    currentOptions: [],
    totalQuestions: 0,
    progressText: '',
    progressPercent: 0,
    answers: [],
    totalScore: 0,
    resultInfo: null
  },

  onLoad: function() {
    var texts = i18n.getToolPageTexts('psychologyTest')
    var TESTS = getTests()
    var list = []
    for (var i = 0; i < TESTS.length; i++) {
      list.push({
        id: TESTS[i].id,
        title: TESTS[i].title,
        desc: TESTS[i].desc,
        icon: TESTS[i].icon,
        questionCount: TESTS[i].questions.length
      })
    }
    this.setData({ testList: list, i18n: texts })
    var app = getApp()
    this.setData({ isDarkMode: app.globalData.isDarkMode || false })
    poster.setupForPage(this)
  },

  onShow: function() {
    var app = getApp()
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    var texts = i18n.getToolPageTexts('psychologyTest')
    // 语言可能切换，重新构建 testList
    var TESTS = getTests()
    var list = []
    for (var i = 0; i < TESTS.length; i++) {
      list.push({
        id: TESTS[i].id,
        title: TESTS[i].title,
        desc: TESTS[i].desc,
        icon: TESTS[i].icon,
        questionCount: TESTS[i].questions.length
      })
    }
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      themeStyle: themeStyle,
      fontClass: fontClass,
      i18n: texts,
      testList: list
    })
  },

  selectTest: function(e) {
    var index = e.currentTarget.dataset.index
    var TESTS = getTests()
    var test = TESTS[index]
    var questionCount = test.questions.length
    var texts = this.data.i18n || {}
    this.setData({
      page: 'test',
      currentTestIndex: index,
      currentQuestionIndex: 0,
      currentQuestionText: test.questions[0].text,
      currentOptions: test.questions[0].options,
      totalQuestions: questionCount,
      progressText: formatProgress(texts.progressFormat, 1, questionCount),
      progressPercent: Math.round(1 / questionCount * 100),
      answers: [],
      totalScore: 0,
      resultInfo: null
    })
  },

  selectOption: function(e) {
    var score = e.currentTarget.dataset.score
    var answers = this.data.answers.concat([score])
    var totalScore = 0
    for (var i = 0; i < answers.length; i++) {
      totalScore += answers[i]
    }
    var nextIndex = this.data.currentQuestionIndex + 1
    var TESTS = getTests()
    var test = TESTS[this.data.currentTestIndex]
    var texts = this.data.i18n || {}

    if (nextIndex >= test.questions.length) {
      this.setData({ answers: answers, totalScore: totalScore })
      this._calculateResult()
      return
    }

    this.setData({
      answers: answers,
      totalScore: totalScore,
      currentQuestionIndex: nextIndex,
      currentQuestionText: test.questions[nextIndex].text,
      currentOptions: test.questions[nextIndex].options,
      progressText: formatProgress(texts.progressFormat, nextIndex + 1, test.questions.length),
      progressPercent: Math.round((nextIndex + 1) / test.questions.length * 100)
    })
  },

  _calculateResult: function() {
    var TESTS = getTests()
    var test = TESTS[this.data.currentTestIndex]
    var score = this.data.totalScore
    var result = null
    for (var i = 0; i < test.results.length; i++) {
      if (score >= test.results[i].minScore && score <= test.results[i].maxScore) {
        result = test.results[i]
        break
      }
    }
    if (!result) {
      result = test.results[test.results.length - 1]
    }

    var historyKey = 'psychology_test_' + test.id
    var history = storageUtil.get(historyKey, [])
    history.push({
      score: score,
      title: result.title,
      time: Date.now()
    })
    storageUtil.set(historyKey, history)

    this.setData({
      page: 'result',
      resultInfo: result
    })
  },

  backToList: function() {
    this.setData({
      page: 'list',
      currentTestIndex: -1,
      currentQuestionIndex: 0,
      currentQuestionText: '',
      currentOptions: [],
      answers: [],
      totalScore: 0,
      resultInfo: null
    })
  },

  restartTest: function() {
    var index = this.data.currentTestIndex
    var TESTS = getTests()
    var test = TESTS[index]
    var questionCount = test.questions.length
    var texts = this.data.i18n || {}
    this.setData({
      page: 'test',
      currentQuestionIndex: 0,
      currentQuestionText: test.questions[0].text,
      currentOptions: test.questions[0].options,
      totalQuestions: questionCount,
      progressText: formatProgress(texts.progressFormat, 1, questionCount),
      progressPercent: Math.round(1 / questionCount * 100),
      answers: [],
      totalScore: 0,
      resultInfo: null
    })
  },

  onShareAppMessage: function() {
    var texts = i18n.getToolPageTexts('psychologyTest') || {}
    var resultInfo = this.data.resultInfo
    var TESTS = getTests()
    var test = this.data.currentTestIndex >= 0 ? TESTS[this.data.currentTestIndex] : null
    if (this.data.page === 'result' && resultInfo && test) {
      return poster.getShareConfig(test.icon + ' ' + resultInfo.title + ' - ' + (texts.toolTitle || '心理测试'), '/package-fun/psychology-test/psychology-test')
    }
    return poster.getShareConfig(texts.shareTitle || '🔮 心理测试', '/package-fun/psychology-test/psychology-test')
  },

  onShareTimeline: function() {
    var texts = i18n.getToolPageTexts('psychologyTest') || {}
    return poster.getTimelineConfig(texts.shareTitle || '🔮 心理测试')
  }
})