var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

function _adjustColor(hex, amount) {
  var num = parseInt(hex.replace('#', ''), 16)
  var r = Math.min(255, Math.max(0, (num >> 16) + amount))
  var g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  var b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

Page({
  data: {
    i18n: {},
    currentMode: 'decision',
    modes: [
      { id: 'decision', name: '随机决定', icon: '🎲' },
      { id: 'wheel', name: '转盘', icon: '🎡' },
      { id: 'dice', name: '掷骰子', icon: '🎲' },
      { id: 'number', name: '随机数', icon: '🔢' },
      { id: 'lottery', name: '抽签', icon: '🧧' }
    ],

    options: [],
    weights: [],
    newOption: '',
    selectedIndex: -1,
    resultIndex: -1,
    selectedAnswer: '',
    showResult: false,
    isRolling: false,
    historyList: [],

    wheelAnimData: {},
    wheelSpinning: false,
    wheelResult: '',
    showWheelResult: false,
    wheelRotation: 0,
    wheelColors: ['#F97316', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1', '#84CC16', '#06B6D4', '#E11D48', '#7C3AED', '#059669', '#D97706', '#DC2626', '#2563EB', '#7C2D12', '#4F46E5', '#0891B2'],

    showWeightPanel: false,

    statsList: [],
    showStats: false,
    totalDecisions: 0,

    diceCount: 1,
    diceResults: [1],
    diceTotal: 1,
    diceRolling: false,

    numMin: 1,
    numMax: 100,
    numResult: '',
    numRolling: false,

    lotteryNames: '',
    lotteryCount: 1,
    lotteryResult: [],
    lotteryRolling: false,

    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  _wheelCanvas: null,
  _wheelCtx: null,
  _wheelDpr: 1,
  _wheelAnimation: null,

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('随机决定')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('randomDecision') })
    this._updateI18nData()

    this.loadHistory()
    this.loadStats()
    poster.setupForPage(this, 11)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('randomDecision') })
    this._updateI18nData()
  },

  _updateI18nData: function() {
    var texts = this.data.i18n
    var modeNames = {
      decision: texts.modeDecision,
      wheel: texts.modeWheel,
      dice: texts.modeDice,
      number: texts.modeNumber,
      lottery: texts.modeLottery
    }
    var modes = this.data.modes
    var updateData = {}
    for (var i = 0; i < modes.length; i++) {
      if (modeNames[modes[i].id]) {
        updateData['modes[' + i + '].name'] = modeNames[modes[i].id]
      }
    }
    this.setData(updateData)
  },

  onReady: function() {
    this._initWheelCanvas()
  },

  switchMode: function(e) {
    var mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ currentMode: mode, showResult: false, showWheelResult: false })
    if (mode === 'wheel') {
      var that = this
      setTimeout(function() {
        that._initWheelCanvas()
      }, 150)
    }
  },

  onNewOptionInput: function(e) {
    this.setData({ newOption: e.detail.value })
  },

  addOption: function() {
    var option = this.data.newOption.trim()
    if (!option) { wx.showToast({ title: this.data.i18n.inputOptionContent, icon: 'none' }); return }
    var opts = this.data.options
    for (var i = 0; i < opts.length; i++) {
      if (opts[i] === option) { wx.showToast({ title: this.data.i18n.optionExists, icon: 'none' }); return }
    }
    if (opts.length >= 20) { wx.showToast({ title: this.data.i18n.maxOptions, icon: 'none' }); return }
    wx.vibrateShort({ type: 'light' })
    var newOptions = opts.concat([option])
    var newWeights = this.data.weights.concat([1])
    this.setData({ options: newOptions, weights: newWeights, newOption: '', showResult: false, resultIndex: -1, selectedIndex: -1 })
    if (this.data.currentMode === 'wheel') {
      var that = this
      setTimeout(function() { that._drawWheel() }, 100)
    }
  },

  deleteOption: function(e) {
    var index = e.currentTarget.dataset.index
    wx.vibrateShort({ type: 'light' })
    var newOptions = []
    var newWeights = []
    for (var i = 0; i < this.data.options.length; i++) {
      if (i !== index) {
        newOptions.push(this.data.options[i])
        newWeights.push(this.data.weights[i])
      }
    }
    this.setData({ options: newOptions, weights: newWeights, showResult: false, resultIndex: -1 })
    if (this.data.currentMode === 'wheel') {
      var that = this
      setTimeout(function() { that._drawWheel() }, 100)
    }
  },

  quickAdd: function(e) {
    var optionsStr = e.currentTarget.dataset.options
    var optionsArray = optionsStr.split(',')
    var weightsArray = []
    for (var i = 0; i < optionsArray.length; i++) {
      weightsArray.push(1)
    }
    wx.vibrateShort({ type: 'light' })
    this.setData({ options: optionsArray, weights: weightsArray, newOption: '', showResult: false, resultIndex: -1, selectedIndex: -1 })
    if (this.data.currentMode === 'wheel') {
      var that = this
      setTimeout(function() { that._drawWheel() }, 100)
    }
  },

  toggleWeightPanel: function() {
    this.setData({ showWeightPanel: !this.data.showWeightPanel })
  },

  onWeightChange: function(e) {
    var index = e.currentTarget.dataset.index
    var val = parseInt(e.detail.value) || 1
    if (val < 1) val = 1
    if (val > 10) val = 10
    var newWeights = this.data.weights.slice()
    newWeights[index] = val
    this.setData({ weights: newWeights })
    if (this.data.currentMode === 'wheel') {
      var that = this
      setTimeout(function() { that._drawWheel() }, 100)
    }
  },

  startRoll: function() {
    if (this.data.options.length < 2) { wx.showToast({ title: this.data.i18n.minTwoOptions, icon: 'none' }); return }
    this.performRandomRoll()
  },

  performRandomRoll: function() {
    wx.vibrateShort({ type: 'medium' })
    var that = this
    this.setData({ isRolling: true, showResult: false, resultIndex: -1 })
    var totalOptions = this.data.options.length
    var rollCount = 0
    var maxRolls = 20 + Math.floor(Math.random() * 10)
    var rollAnimation = setInterval(function() {
      rollCount++
      var randomIndex = Math.floor(Math.random() * totalOptions)
      that.setData({ selectedIndex: randomIndex })
      if (rollCount >= maxRolls) {
        clearInterval(rollAnimation)
        var finalIndex = that._weightedRandom()
        var answer = that.data.options[finalIndex]
        that.setData({ selectedIndex: finalIndex, resultIndex: finalIndex, selectedAnswer: answer, showResult: true, isRolling: false })
        that.addToHistory(answer)
        that.recordStat(answer)
        var tracker = getApp().tracker
        if (tracker) tracker.toolUse(11, '随机决定', false)
        setTimeout(function() { that.setData({ selectedIndex: -1 }) }, 3000)
      }
    }, 80)
  },

  _weightedRandom: function() {
    var weights = this.data.weights
    var totalWeight = 0
    for (var i = 0; i < weights.length; i++) {
      totalWeight += weights[i]
    }
    var rand = Math.random() * totalWeight
    var cumulative = 0
    for (var j = 0; j < weights.length; j++) {
      cumulative += weights[j]
      if (rand < cumulative) {
        return j
      }
    }
    return weights.length - 1
  },

  _initWheelCanvas: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#wheelCanvas')
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
        that._wheelCanvas = canvas
        that._wheelCtx = ctx
        that._wheelDpr = dpr
        that._drawWheel()
      })
  },

  _drawWheel: function() {
    var ctx = this._wheelCtx
    if (!ctx) return
    var options = this.data.options
    var weights = this.data.weights
    var colors = this.data.wheelColors

    var size = 280
    var cx = size / 2
    var cy = size / 2
    var outerRadius = size / 2 - 4
    var radius = size / 2 - 14

    ctx.clearRect(0, 0, size, size)

    // Draw outer shadow ring
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI)
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.restore()

    // Draw outer decorative ring
    ctx.beginPath()
    ctx.arc(cx, cy, outerRadius, 0, 2 * Math.PI)
    var ringGrad = ctx.createLinearGradient(0, 0, size, size)
    ringGrad.addColorStop(0, '#F97316')
    ringGrad.addColorStop(0.5, '#F59E0B')
    ringGrad.addColorStop(1, '#EA580C')
    ctx.fillStyle = ringGrad
    ctx.fill()

    // Inner white ring border
    ctx.beginPath()
    ctx.arc(cx, cy, outerRadius - 4, 0, 2 * Math.PI)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    if (options.length < 2) {
      // Placeholder wheel - gray with hint text
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
      var placeholderGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      placeholderGrad.addColorStop(0, '#E2E8F0')
      placeholderGrad.addColorStop(1, '#CBD5E1')
      ctx.fillStyle = placeholderGrad
      ctx.fill()

      // Draw dashed lines for placeholder
      ctx.save()
      ctx.setLineDash([8, 6])
      ctx.strokeStyle = 'rgba(148,163,184,0.5)'
      ctx.lineWidth = 2
      for (var p = 0; p < 4; p++) {
        var angle = (p / 4) * 2 * Math.PI
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
        ctx.stroke()
      }
      ctx.restore()

      // Center circle for placeholder
      ctx.beginPath()
      ctx.arc(cx, cy, 28, 0, 2 * Math.PI)
      var centerGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 28)
      centerGrad.addColorStop(0, '#F8FAFC')
      centerGrad.addColorStop(1, '#E2E8F0')
      ctx.fillStyle = centerGrad
      ctx.fill()
      ctx.strokeStyle = 'rgba(148,163,184,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Hint text
      ctx.fillStyle = '#94A3B8'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('\u6DFB\u52A0\u9009\u9879', cx, cy - 6)
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#94A3B8'
      ctx.fillText('\u5F00\u59CB\u8F6C\u76D8', cx, cy + 10)
      return
    }

    // Calculate total weight
    var totalWeight = 0
    for (var w = 0; w < weights.length; w++) {
      totalWeight += (weights[w] || 1)
    }

    // Draw pie slices
    var startAngle = -Math.PI / 2
    for (var i = 0; i < options.length; i++) {
      var weight = weights[i] || 1
      var sliceAngle = (weight / totalWeight) * 2 * Math.PI
      var endAngle = startAngle + sliceAngle

      // Slice fill with gradient
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()

      var baseColor = colors[i % colors.length]
      var midAngle = startAngle + sliceAngle / 2
      var gradX1 = cx + radius * 0.3 * Math.cos(midAngle)
      var gradY1 = cy + radius * 0.3 * Math.sin(midAngle)
      var gradX2 = cx + radius * Math.cos(midAngle)
      var gradY2 = cy + radius * Math.sin(midAngle)
      var sliceGrad = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2)
      sliceGrad.addColorStop(0, baseColor)
      sliceGrad.addColorStop(1, _adjustColor(baseColor, -25))
      ctx.fillStyle = sliceGrad
      ctx.fill()

      // Slice border
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Text label
      var textRadius = radius * 0.58
      var tx = cx + textRadius * Math.cos(midAngle)
      var ty = cy + textRadius * Math.sin(midAngle)

      ctx.save()
      ctx.translate(tx, ty)
      ctx.rotate(midAngle + Math.PI / 2)
      if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) {
        ctx.rotate(Math.PI)
      }
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      var fontSize = options.length <= 6 ? 14 : (options.length <= 10 ? 12 : 10)
      ctx.font = 'bold ' + fontSize + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      var label = options[i]
      var maxLen = options.length <= 6 ? 5 : (options.length <= 10 ? 4 : 3)
      if (label.length > maxLen) label = label.substring(0, maxLen) + '..'
      ctx.fillText(label, 0, 0)
      ctx.restore()

      startAngle = endAngle
    }

    // Inner ring highlight
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Decorative dots around the outer edge
    for (var d = 0; d < options.length * 3; d++) {
      var dotAngle = (d / (options.length * 3)) * 2 * Math.PI - Math.PI / 2
      var dotRadius = radius + 6
      var dotX = cx + dotRadius * Math.cos(dotAngle)
      var dotY = cy + dotRadius * Math.sin(dotAngle)
      ctx.beginPath()
      ctx.arc(dotX, dotY, 1.5, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fill()
    }

    // Center decorative circle
    ctx.beginPath()
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI)
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 6
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI)
    var centerBtnGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 22)
    centerBtnGrad.addColorStop(0, '#FB923C')
    centerBtnGrad.addColorStop(1, '#EA580C')
    ctx.fillStyle = centerBtnGrad
    ctx.fill()

    // Center "GO" text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GO', cx, cy)
  },

  spinWheel: function() {
    var that = this
    var options = this.data.options
    if (options.length < 2) {
      wx.showToast({ title: this.data.i18n.minTwoOptions, icon: 'none' })
      return
    }
    if (this.data.wheelSpinning) return

    wx.vibrateShort({ type: 'medium' })
    this.setData({ wheelSpinning: true, showWheelResult: false })

    var finalIndex = this._weightedRandom()
    var weights = this.data.weights
    var totalWeight = 0
    for (var w = 0; w < weights.length; w++) {
      totalWeight += (weights[w] || 1)
    }

    // Calculate the angle for the winning slice
    var cumAngle = 0
    for (var k = 0; k < finalIndex; k++) {
      cumAngle += (weights[k] || 1) / totalWeight * 360
    }
    var sliceAngle = (weights[finalIndex] || 1) / totalWeight * 360
    var midAngle = cumAngle + sliceAngle / 2

    // Add randomness within the slice
    var randomOffset = (Math.random() - 0.5) * sliceAngle * 0.6
    var targetSliceAngle = midAngle + randomOffset

    var extraSpins = 360 * (5 + Math.floor(Math.random() * 3))
    var currentRotation = this.data.wheelRotation || 0
    var targetAngle = currentRotation + extraSpins + (360 - targetSliceAngle)

    var animation = wx.createAnimation({
      duration: 4500,
      timingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
      transformOrigin: '50% 50%'
    })

    that._wheelAnimation = animation
    animation.rotate(targetAngle).step()

    that.setData({
      wheelAnimData: animation.export(),
      wheelRotation: targetAngle
    })

    setTimeout(function() {
      var answer = options[finalIndex]
      that.setData({
        wheelSpinning: false,
        wheelResult: answer,
        showWheelResult: true,
        selectedAnswer: answer
      })
      that.addToHistory('\uD83C\uDFA1 ' + answer)
      that.recordStat(answer)
      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(11, '\u968F\u673A\u51B3\u5B9A', false)
    }, 4700)
  },

  rollDice: function() {
    var that = this
    var count = this.data.diceCount
    wx.vibrateShort({ type: 'medium' })
    this.setData({ diceRolling: true })
    var rollCount = 0
    var maxRolls = 15
    var rollAnimation = setInterval(function() {
      rollCount++
      var results = []
      var total = 0
      for (var i = 0; i < count; i++) {
        var val = Math.floor(Math.random() * 6) + 1
        results.push(val)
        total += val
      }
      that.setData({ diceResults: results, diceTotal: total })
      if (rollCount >= maxRolls) {
        clearInterval(rollAnimation)
        that.setData({ diceRolling: false })
        that.addToHistory(count + '个骰子: ' + results.join(', ') + ' = ' + total)
      }
    }, 100)
  },

  changeDiceCount: function(e) {
    var count = parseInt(e.currentTarget.dataset.count)
    wx.vibrateShort({ type: 'light' })
    var results = []
    for (var i = 0; i < count; i++) results.push(1)
    this.setData({ diceCount: count, diceResults: results, diceTotal: count })
  },

  onNumMinInput: function(e) {
    this.setData({ numMin: parseInt(e.detail.value) || 0 })
  },

  onNumMaxInput: function(e) {
    this.setData({ numMax: parseInt(e.detail.value) || 100 })
  },

  rollNumber: function() {
    var that = this
    var min = this.data.numMin
    var max = this.data.numMax
    if (min >= max) { wx.showToast({ title: this.data.i18n.maxMustGreaterMin, icon: 'none' }); return }
    wx.vibrateShort({ type: 'medium' })
    this.setData({ numRolling: true })
    var rollCount = 0
    var maxRolls = 12
    var rollAnimation = setInterval(function() {
      rollCount++
      var val = Math.floor(Math.random() * (max - min + 1)) + min
      that.setData({ numResult: String(val) })
      if (rollCount >= maxRolls) {
        clearInterval(rollAnimation)
        that.setData({ numRolling: false })
        that.addToHistory(min + '-' + max + '随机数: ' + val)
      }
    }, 80)
  },

  onLotteryNamesInput: function(e) {
    this.setData({ lotteryNames: e.detail.value })
  },

  onLotteryCountInput: function(e) {
    var count = parseInt(e.currentTarget.dataset.count)
    if (count) {
      wx.vibrateShort({ type: 'light' })
      this.setData({ lotteryCount: count })
    }
  },

  startLottery: function() {
    var names = this.data.lotteryNames.split(/[,，\n]/)
    var cleanNames = []
    for (var i = 0; i < names.length; i++) {
      var n = names[i].trim()
      if (n) cleanNames.push(n)
    }
    if (cleanNames.length < 2) { wx.showToast({ title: this.data.i18n.minTwoNames, icon: 'none' }); return }
    var count = Math.min(this.data.lotteryCount, cleanNames.length)
    var that = this
    wx.vibrateShort({ type: 'medium' })
    this.setData({ lotteryRolling: true })
    var rollCount = 0
    var maxRolls = 15
    var rollAnimation = setInterval(function() {
      rollCount++
      var shuffled = cleanNames.slice().sort(function() { return Math.random() - 0.5 })
      that.setData({ lotteryResult: shuffled.slice(0, count) })
      if (rollCount >= maxRolls) {
        clearInterval(rollAnimation)
        var finalShuffled = cleanNames.slice().sort(function() { return Math.random() - 0.5 })
        var finalResult = finalShuffled.slice(0, count)
        that.setData({ lotteryResult: finalResult, lotteryRolling: false })
        that.addToHistory('抽签: ' + finalResult.join(', '))
      }
    }, 100)
  },

  addToHistory: function(result) {
    var now = new Date()
    var h = now.getHours()
    var m = now.getMinutes()
    var s = now.getSeconds()
    var timeStr = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
    var record = { time: timeStr, result: result }
    var history = [record].concat(this.data.historyList).slice(0, 20)
    this.setData({ historyList: history })
    try { wx.setStorageSync('random_decision_history', history) } catch (e) {}
  },

  clearHistory: function() {
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmClear,
      content: that.data.i18n.confirmClearHistory,
      confirmText: that.data.i18n.clearConfirmBtn,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          wx.vibrateShort({ type: 'medium' })
          that.setData({ historyList: [] })
          wx.removeStorageSync('random_decision_history')
          wx.showToast({ title: that.data.i18n.historyCleared, icon: 'success' })
        }
      }
    })
  },

  loadHistory: function() {
    try {
      var history = storageUtil.safeGetArray('random_decision_history')
      this.setData({ historyList: history })
    } catch (e) {}
  },

  recordStat: function(answer) {
    var stats = storageUtil.safeGetArray('random_decision_stats')
    var found = false
    for (var i = 0; i < stats.length; i++) {
      if (stats[i].name === answer) {
        stats[i].count++
        found = true
        break
      }
    }
    if (!found) {
      stats.push({ name: answer, count: 1 })
    }
    stats.sort(function(a, b) { return b.count - a.count })
    try { wx.setStorageSync('random_decision_stats', stats) } catch (e) {}
    this._buildStatsList(stats)
  },

  loadStats: function() {
    var stats = storageUtil.safeGetArray('random_decision_stats')
    this._buildStatsList(stats)
  },

  _buildStatsList: function(stats) {
    var totalCount = 0
    for (var i = 0; i < stats.length; i++) {
      totalCount += stats[i].count
    }
    var statsList = []
    for (var j = 0; j < stats.length; j++) {
      var percent = totalCount > 0 ? Math.round(stats[j].count / totalCount * 100) : 0
      statsList.push({
        name: stats[j].name,
        count: stats[j].count,
        percent: percent,
        barWidth: percent
      })
    }
    this.setData({ statsList: statsList, totalDecisions: totalCount })
  },

  toggleStats: function() {
    this.setData({ showStats: !this.data.showStats })
  },

  clearStats: function() {
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmClear,
      content: that.data.i18n.confirmClearStats,
      confirmText: that.data.i18n.clearConfirmBtn,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          that.setData({ statsList: [], totalDecisions: 0, showStats: false })
          wx.removeStorageSync('random_decision_stats')
          wx.showToast({ title: that.data.i18n.statsCleared, icon: 'success' })
        }
      }
    })
  },

  copyResult: function() {
    var text = ''
    if (this.data.currentMode === 'decision' || this.data.currentMode === 'wheel') {
      text = this.data.selectedAnswer || ''
    } else if (this.data.currentMode === 'dice') {
      text = '骰子: ' + this.data.diceResults.join(', ') + ' = ' + this.data.diceTotal
    } else if (this.data.currentMode === 'number') {
      text = '随机数(' + this.data.numMin + '-' + this.data.numMax + '): ' + this.data.numResult
    } else if (this.data.currentMode === 'lottery') {
      text = '抽签结果: ' + this.data.lotteryResult.join(', ')
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        options: [],
        weights: [],
        newOption: '',
        selectedIndex: -1,
        resultIndex: -1,
        selectedAnswer: '',
        showResult: false,
        isRolling: false,
        wheelAnimData: {},
        wheelSpinning: false,
        wheelResult: '',
        showWheelResult: false,
        wheelRotation: 0,
        showWeightPanel: false,
        diceCount: 1,
        diceResults: [1],
        diceTotal: 1,
        diceRolling: false,
        numMin: 1,
        numMax: 100,
        numResult: '',
        numRolling: false,
        lotteryNames: '',
        lotteryCount: 1,
        lotteryResult: [],
        lotteryRolling: false
      })
      if (that.data.currentMode === 'wheel') {
        setTimeout(function() { that._drawWheel() }, 100)
      }
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🎲 随机决定 - 百宝工具箱', '/package-life/random-decision/random-decision')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🎲 随机决定 - 百宝工具箱')
  }
})
