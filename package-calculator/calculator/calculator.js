var storageUtil = require('../../utils/storage.js')
var logger = require('../../utils/logger.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var HISTORY_KEY = 'calculator_history'
var FAVORITES_KEY = 'calculator_favorites'
var EXPRESSIONS_KEY = 'calculator_expressions'
var MAX_HISTORY = 20

Page({
  data: {
    i18n: {},
    expression: '',
    result: '0',
    history: [],
    favorites: [],
    savedExpressions: [],
    showHistory: false,
    showFavorites: false,
    showExpressions: false,
    showConstants: false,
    mathConstants: [
      { label: 'π', value: 'π', desc: '3.14159...' },
      { label: 'e', value: 'e', desc: '2.71828...' },
      { label: 'φ', value: '1.6180339887', desc: '黄金比例' },
      { label: '√2', value: '1.4142135624', desc: '根号2' },
      { label: '√3', value: '1.7320508076', desc: '根号3' },
      { label: 'ln2', value: '0.6931471806', desc: '自然对数2' },
      { label: 'ln10', value: '2.302585093', desc: '自然对数10' }
    ],
    isDarkMode: false,
    fontSizeSetting: 'medium',
    themeStyle: '',
    fontClass: ''
  },

  onLoad: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('calculator') })
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('科学计算器')
    this._loadHistory()
    this._loadFavorites()
    this._loadExpressions()
    poster.setupForPage(this, 26)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var themeStyle = points.getThemeStyle()
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, themeStyle: themeStyle, fontClass: fontClass, i18n: i18n.getToolPageTexts('calculator') })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
  },

  onInput: function(e) {
    var value = e.currentTarget.dataset.value
    var expr = this.data.expression

    if (value === 'C') {
      this.setData({ expression: '', result: '0' })
      return
    }

    if (value === 'backspace') {
      this.setData({ expression: expr.slice(0, -1) })
      return
    }

    if (value === '=') {
      this._calculate()
      return
    }

    this.setData({ expression: expr + value })
  },

  onScientific: function(e) {
    var func = e.currentTarget.dataset.func
    var expr = this.data.expression

    if (func === 'pi') {
      this.setData({ expression: expr + 'π' })
      return
    }
    if (func === 'e') {
      this.setData({ expression: expr + 'e' })
      return
    }
    if (func === 'sqrt') {
      this.setData({ expression: expr + '√(' })
      return
    }
    if (func === 'square') {
      this.setData({ expression: expr + '²' })
      return
    }
    if (func === 'power') {
      this.setData({ expression: expr + '^' })
      return
    }
    if (func === '(' || func === ')') {
      this.setData({ expression: expr + func })
      return
    }

    this.setData({ expression: expr + func + '(' })
  },

  _calculate: function() {
    var expr = this.data.expression
    if (!expr) return

    try {
      var calcExpr = this._prepareExpression(expr)
      var result = eval(calcExpr)

      if (typeof result !== 'number' || !isFinite(result)) {
        wx.showToast({ title: i18n.getToolPageTexts('calculator').calcError, icon: 'none' })
        return
      }

      var displayResult = this._formatResult(result)

      this._addHistory(expr, displayResult)

      this.setData({
        result: displayResult,
        expression: displayResult
      })

      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(26, '科学计算器', false)

      wx.vibrateShort({ type: 'light' })
    } catch (err) {
      wx.showToast({ title: i18n.getToolPageTexts('calculator').exprError, icon: 'none' })
    }
  },

  _prepareExpression: function(expr) {
    var s = expr

    s = s.replace(/×/g, '*')
    s = s.replace(/÷/g, '/')
    s = s.replace(/π/g, 'Math.PI')
    s = s.replace(/e(?!xp)/g, 'Math.E')
    s = s.replace(/sin\(/g, 'Math.sin(')
    s = s.replace(/cos\(/g, 'Math.cos(')
    s = s.replace(/tan\(/g, 'Math.tan(')
    s = s.replace(/log\(/g, 'Math.log10(')
    s = s.replace(/ln\(/g, 'Math.log(')
    s = s.replace(/√\(/g, 'Math.sqrt(')
    s = s.replace(/²/g, '**2')
    s = s.replace(/\^/g, '**')

    return s
  },

  _formatResult: function(num) {
    if (Number.isInteger(num) && Math.abs(num) < 1e15) {
      return num.toString()
    }
    var formatted = parseFloat(num.toPrecision(12))
    return formatted.toString()
  },

  _addHistory: function(expression, result) {
    var history = this.data.history.slice()
    history.unshift({
      expression: expression,
      result: result,
      time: this._formatTime(new Date())
    })

    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY)
    }

    this.setData({ history: history })
    this._saveHistory(history)
  },

  _loadHistory: function() {
    try {
      var data = storageUtil.safeGetArray(HISTORY_KEY)
      if (data && data.length > 0) {
        this.setData({ history: data })
      }
    } catch (e) {
      logger.error('load history error', e)
    }
  },

  _saveHistory: function(history) {
    try {
      wx.setStorageSync(HISTORY_KEY, history)
    } catch (e) {
      logger.error('save history error', e)
    }
  },

  _formatTime: function(date) {
    var h = date.getHours()
    var m = date.getMinutes()
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m)
  },

  toggleHistory: function() {
    this.setData({ showHistory: !this.data.showHistory })
  },

  useHistoryItem: function(e) {
    var idx = e.currentTarget.dataset.index
    var item = this.data.history[idx]
    if (item) {
      this.setData({
        expression: item.result,
        result: item.result,
        showHistory: false
      })
    }
  },

  clearHistory: function() {
    var that = this
    var texts = i18n.getToolPageTexts('calculator')
    wx.showModal({
      title: texts.clearHistoryTitle,
      content: texts.clearHistoryContent,
      success: function(res) {
        if (res.confirm) {
          that.setData({ history: [] })
          try {
            wx.removeStorageSync(HISTORY_KEY)
          } catch (e) {
            logger.error('clear history error', e)
          }
        }
      }
    })
  },

  toggleFavorites: function() {
    this.setData({ showFavorites: !this.data.showFavorites, showHistory: false, showExpressions: false, showConstants: false })
  },

  toggleExpressions: function() {
    this.setData({ showExpressions: !this.data.showExpressions, showHistory: false, showFavorites: false, showConstants: false })
  },

  toggleConstants: function() {
    this.setData({ showConstants: !this.data.showConstants, showHistory: false, showFavorites: false, showExpressions: false })
  },

  toggleHistory: function() {
    this.setData({ showHistory: !this.data.showHistory, showFavorites: false, showExpressions: false, showConstants: false })
  },

  addFavorite: function(e) {
    var idx = e.currentTarget.dataset.index
    var item = this.data.history[idx]
    if (!item) return
    var favs = this.data.favorites.slice()
    var exists = false
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].expression === item.expression && favs[i].result === item.result) {
        exists = true
        break
      }
    }
    if (exists) {
      wx.showToast({ title: i18n.getToolPageTexts('calculator').alreadyFavorited, icon: 'none' })
      return
    }
    if (favs.length >= 20) {
      wx.showToast({ title: i18n.getToolPageTexts('calculator').maxFavorites, icon: 'none' })
      return
    }
    favs.unshift({ expression: item.expression, result: item.result, time: item.time })
    this.setData({ favorites: favs })
    this._saveFavorites(favs)
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: i18n.getToolPageTexts('calculator').favorited, icon: 'success' })
  },

  removeFavorite: function(e) {
    var idx = e.currentTarget.dataset.index
    var favs = this.data.favorites.slice()
    favs.splice(idx, 1)
    this.setData({ favorites: favs })
    this._saveFavorites(favs)
    wx.vibrateShort({ type: 'light' })
  },

  useFavorite: function(e) {
    var idx = e.currentTarget.dataset.index
    var item = this.data.favorites[idx]
    if (item) {
      this.setData({ expression: item.result, result: item.result, showFavorites: false })
    }
  },

  _loadFavorites: function() {
    try {
      var data = storageUtil.safeGetArray(FAVORITES_KEY)
      if (data && data.length > 0) {
        this.setData({ favorites: data })
      }
    } catch (e) {
      logger.error('load favorites error', e)
    }
  },

  _saveFavorites: function(favs) {
    try {
      wx.setStorageSync(FAVORITES_KEY, favs)
    } catch (e) {
      logger.error('save favorites error', e)
    }
  },

  saveExpression: function() {
    var expr = this.data.expression
    if (!expr) {
      wx.showToast({ title: i18n.getToolPageTexts('calculator').inputExpression, icon: 'none' })
      return
    }
    var saved = this.data.savedExpressions.slice()
    for (var i = 0; i < saved.length; i++) {
      if (saved[i].expression === expr) {
        wx.showToast({ title: i18n.getToolPageTexts('calculator').alreadySaved, icon: 'none' })
        return
      }
    }
    if (saved.length >= 20) {
      wx.showToast({ title: i18n.getToolPageTexts('calculator').maxSaved, icon: 'none' })
      return
    }
    saved.unshift({ expression: expr, time: this._formatTime(new Date()) })
    this.setData({ savedExpressions: saved })
    this._saveExpressions(saved)
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: i18n.getToolPageTexts('calculator').saved, icon: 'success' })
  },

  removeExpression: function(e) {
    var idx = e.currentTarget.dataset.index
    var saved = this.data.savedExpressions.slice()
    saved.splice(idx, 1)
    this.setData({ savedExpressions: saved })
    this._saveExpressions(saved)
    wx.vibrateShort({ type: 'light' })
  },

  useExpression: function(e) {
    var idx = e.currentTarget.dataset.index
    var item = this.data.savedExpressions[idx]
    if (item) {
      this.setData({ expression: item.expression, showExpressions: false })
    }
  },

  _loadExpressions: function() {
    try {
      var data = storageUtil.safeGetArray(EXPRESSIONS_KEY)
      if (data && data.length > 0) {
        this.setData({ savedExpressions: data })
      }
    } catch (e) {
      logger.error('load expressions error', e)
    }
  },

  _saveExpressions: function(saved) {
    try {
      wx.setStorageSync(EXPRESSIONS_KEY, saved)
    } catch (e) {
      logger.error('save expressions error', e)
    }
  },

  onConstantTap: function(e) {
    var idx = e.currentTarget.dataset.index
    var item = this.data.mathConstants[idx]
    if (!item) return
    wx.vibrateShort({ type: 'light' })
    var expr = this.data.expression
    this.setData({ expression: expr + item.value, showConstants: false })
  },

  copyResult: function() {
    var text = this.data.result
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({ expression: '', result: '0', showHistory: false, showFavorites: false, showExpressions: false, showConstants: false })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🧮 科学计算器 - 百宝工具箱', '/package-calculator/calculator/calculator')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🧮 科学计算器 - 百宝工具箱')
  }
})
