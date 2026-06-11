var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')

var TESTS = [
  {
    id: 'personality',
    title: '你的隐藏性格',
    desc: '测测你内心深处的真实性格',
    icon: '🎭',
    questions: [
      {
        text: '周末你更倾向于？',
        options: [
          { text: '宅在家看剧', score: 1 },
          { text: '约朋友出去玩', score: 2 },
          { text: '独自探索新地方', score: 3 },
          { text: '学习新技能', score: 4 }
        ]
      },
      {
        text: '遇到困难时你会？',
        options: [
          { text: '先冷静思考再行动', score: 1 },
          { text: '寻求他人帮助', score: 2 },
          { text: '凭直觉快速决定', score: 3 },
          { text: '制定详细计划', score: 4 }
        ]
      },
      {
        text: '你更喜欢哪种颜色？',
        options: [
          { text: '蓝色 - 平静深邃', score: 1 },
          { text: '橙色 - 温暖活力', score: 2 },
          { text: '紫色 - 神秘优雅', score: 3 },
          { text: '绿色 - 自然清新', score: 4 }
        ]
      },
      {
        text: '朋友对你的评价更接近？',
        options: [
          { text: '稳重可靠', score: 1 },
          { text: '热情开朗', score: 2 },
          { text: '独特有个性', score: 3 },
          { text: '聪明有想法', score: 4 }
        ]
      },
      {
        text: '你理想中的生活是？',
        options: [
          { text: '安稳平静的日子', score: 1 },
          { text: '充满社交和活动', score: 2 },
          { text: '自由自在无拘束', score: 3 },
          { text: '不断成长和突破', score: 4 }
        ]
      }
    ],
    results: [
      { minScore: 5, maxScore: 8, title: '沉稳内敛型', desc: '你是一个内心丰富但不轻易表达的人。你善于观察和思考，做事稳重可靠。虽然外表平静，但内心有着坚定的力量。', emoji: '🦉' },
      { minScore: 9, maxScore: 12, title: '阳光社交型', desc: '你天生就是人群中的焦点！热情开朗的性格让你很容易交到朋友。你享受与人相处的时光，总能为周围的人带来欢乐。', emoji: '🐬' },
      { minScore: 13, maxScore: 16, title: '自由灵魂型', desc: '你是一个不随波逐流的独立灵魂。你有自己独特的审美和价值观，不喜欢被条条框框束缚。创造力是你的天赋。', emoji: '🦋' },
      { minScore: 17, maxScore: 20, title: '智慧进取型', desc: '你是一个永远在追求进步的人。清晰的逻辑和强烈的求知欲让你不断突破自我。你相信努力能改变一切。', emoji: '🦅' }
    ]
  },
  {
    id: 'stress',
    title: '你的压力指数',
    desc: '测测你最近的压力水平',
    icon: '🧘',
    questions: [
      { text: '最近是否经常感到疲惫？', options: [{ text: '很少', score: 1 }, { text: '偶尔', score: 2 }, { text: '经常', score: 3 }, { text: '总是', score: 4 }] },
      { text: '你的睡眠质量如何？', options: [{ text: '很好', score: 1 }, { text: '还行', score: 2 }, { text: '不太好', score: 3 }, { text: '很差', score: 4 }] },
      { text: '是否容易因为小事烦躁？', options: [{ text: '不会', score: 1 }, { text: '偶尔', score: 2 }, { text: '经常', score: 3 }, { text: '总是', score: 4 }] },
      { text: '最近食欲如何？', options: [{ text: '正常', score: 1 }, { text: '略有变化', score: 2 }, { text: '明显变化', score: 3 }, { text: '暴食或没胃口', score: 4 }] },
      { text: '是否觉得时间不够用？', options: [{ text: '没有', score: 1 }, { text: '有时', score: 2 }, { text: '经常', score: 3 }, { text: '总是', score: 4 }] }
    ],
    results: [
      { minScore: 5, maxScore: 7, title: '轻松自在', desc: '你目前的状态很好，压力水平很低。继续保持良好的生活习惯，享受当下的美好时光吧！', emoji: '😊' },
      { minScore: 8, maxScore: 11, title: '轻度压力', desc: '你有一些小压力，但总体可控。建议适当放松，做一些让自己开心的事情，比如散步、听音乐。', emoji: '🙂' },
      { minScore: 12, maxScore: 15, title: '中度压力', desc: '你正承受着不小的压力。建议尝试运动、冥想等减压方式，必要时可以和信任的人倾诉。', emoji: '😰' },
      { minScore: 16, maxScore: 20, title: '高度压力', desc: '你的压力水平较高，需要认真对待。建议调整生活节奏，寻求专业帮助也是一个好的选择。', emoji: '😥' }
    ]
  },
  {
    id: 'brain',
    title: '你的脑力类型',
    desc: '测测你是左脑型还是右脑型',
    icon: '🧠',
    questions: [
      { text: '做决定时你更依赖？', options: [{ text: '逻辑分析', score: 1 }, { text: '直觉感受', score: 2 }] },
      { text: '你更擅长？', options: [{ text: '数学和逻辑', score: 1 }, { text: '艺术和创意', score: 2 }] },
      { text: '看书时你更关注？', options: [{ text: '细节和数据', score: 1 }, { text: '整体感受', score: 2 }] },
      { text: '你更喜欢？', options: [{ text: '按计划行事', score: 1 }, { text: '随性而为', score: 2 }] },
      { text: '学习新事物你倾向？', options: [{ text: '先理解原理', score: 1 }, { text: '先动手尝试', score: 2 }] },
      { text: '你的工作桌面？', options: [{ text: '整齐有序', score: 1 }, { text: '看似混乱但自己能找到', score: 2 }] }
    ],
    results: [
      { minScore: 6, maxScore: 7, title: '左脑主导型', desc: '你是一个逻辑思维强者！分析问题条理清晰，做事有计划有步骤。数学、编程、科学研究是你的强项。', emoji: '🔬' },
      { minScore: 8, maxScore: 9, title: '左右均衡型', desc: '你兼具逻辑与创意，是难得的全能型人才。既能理性分析，又能感性创造，适应力极强。', emoji: '⚖️' },
      { minScore: 10, maxScore: 12, title: '右脑主导型', desc: '你是一个创意无限的人！想象力丰富，感受力敏锐。艺术、设计、文学创作是你的舞台。', emoji: '🎨' }
    ]
  }
]

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
    this.setData({ testList: list, i18n: i18n.getToolPageTexts('psychologyTest') })
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
      i18n: i18n.getToolPageTexts('psychologyTest')
    })
  },

  selectTest: function(e) {
    var index = e.currentTarget.dataset.index
    var test = TESTS[index]
    var questionCount = test.questions.length
    this.setData({
      page: 'test',
      currentTestIndex: index,
      currentQuestionIndex: 0,
      currentQuestionText: test.questions[0].text,
      currentOptions: test.questions[0].options,
      totalQuestions: questionCount,
      progressText: '第 1/' + questionCount + ' 题',
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
    var test = TESTS[this.data.currentTestIndex]

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
      progressText: '第 ' + (nextIndex + 1) + '/' + test.questions.length + ' 题',
      progressPercent: Math.round((nextIndex + 1) / test.questions.length * 100)
    })
  },

  _calculateResult: function() {
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
    var test = TESTS[index]
    var questionCount = test.questions.length
    this.setData({
      page: 'test',
      currentQuestionIndex: 0,
      currentQuestionText: test.questions[0].text,
      currentOptions: test.questions[0].options,
      totalQuestions: questionCount,
      progressText: '第 1/' + questionCount + ' 题',
      progressPercent: Math.round(1 / questionCount * 100),
      answers: [],
      totalScore: 0,
      resultInfo: null
    })
  },

  onShareAppMessage: function() {
    var test = TESTS[this.data.currentTestIndex]
    var resultInfo = this.data.resultInfo
    if (this.data.page === 'result' && resultInfo) {
      return {
        title: test.icon + ' ' + resultInfo.title + ' - 心理测试',
        path: '/package-fun/psychology-test/psychology-test'
      }
    }
    return {
      title: '🔮 心理测试 - 趣味性格/心理小测试',
      path: '/package-fun/psychology-test/psychology-test'
    }
  },

  onShareTimeline: function() {
    return {
      title: '🔮 心理测试 - 趣味性格/心理小测试'
    }
  }
})