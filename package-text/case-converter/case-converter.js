var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    inputText: '',
    outputText: '',
    currentMode: 'upper',
    modes: [
      { id: 'upper', name: '全部大写', icon: '🔠', group: 'basic' },
      { id: 'lower', name: '全部小写', icon: '🔡', group: 'basic' },
      { id: 'capitalize', name: '首字母大写', icon: '🔤', group: 'basic' },
      { id: 'sentence', name: '句首大写', icon: '📝', group: 'basic' },
      { id: 'toggle', name: '切换大小写', icon: '🔄', group: 'basic' }
    ],
    codeModes: [
      { id: 'camel', name: '驼峰命名', icon: '🐪', example: 'myVariableName' },
      { id: 'pascal', name: '帕斯卡', icon: '🏛️', example: 'MyClassName' },
      { id: 'snake', name: '蛇形命名', icon: '🐍', example: 'my_variable_name' },
      { id: 'kebab', name: '短横线', icon: '➖', example: 'my-component-name' },
      { id: 'constant', name: '常量命名', icon: '🔒', example: 'MAX_COUNT' }
    ],
    showCodeModes: false,
    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  _updateI18nData: function() {
    var toolTexts = i18n.getToolPageTexts('caseConverter')
    var modeNameMap = {
      upper: toolTexts.modeUpper, lower: toolTexts.modeLower,
      capitalize: toolTexts.modeCapitalize, sentence: toolTexts.modeSentence,
      toggle: toolTexts.modeToggle
    }
    var modes = this.data.modes.slice()
    for (var i = 0; i < modes.length; i++) {
      if (modeNameMap[modes[i].id]) {
        modes[i].name = modeNameMap[modes[i].id]
      }
    }
    var codeNameMap = {
      camel: toolTexts.codeCamel, pascal: toolTexts.codePascal,
      snake: toolTexts.codeSnake, kebab: toolTexts.codeKebab,
      constant: toolTexts.codeConstant
    }
    var codeModes = this.data.codeModes.slice()
    for (var j = 0; j < codeModes.length; j++) {
      if (codeNameMap[codeModes[j].id]) {
        codeModes[j].name = codeNameMap[codeModes[j].id]
      }
    }
    this.setData({ i18n: toolTexts, modes: modes, codeModes: codeModes })
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('大小写转换')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    poster.setupForPage(this, 6)
    this._updateI18nData()
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    this._updateI18nData()
  },

  onInput: function(e) {
    this.setData({ inputText: e.detail.value })
    this.convertText()
  },

  selectMode: function(e) {
    var mode = e.currentTarget.dataset.mode
    this.setData({ currentMode: mode })
    wx.vibrateShort({ type: 'light' })
    this.convertText()
  },

  toggleCodeModes: function() {
    this.setData({ showCodeModes: !this.data.showCodeModes })
  },

  selectCodeMode: function(e) {
    var mode = e.currentTarget.dataset.mode
    this.setData({ currentMode: mode })
    wx.vibrateShort({ type: 'light' })
    this.convertText()
  },

  _splitWords: function(text) {
    text = text.trim()
    if (!text) return []
    var words = text.replace(/([a-z])([A-Z])/g, '$1 $2')
    words = words.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    words = words.replace(/[_\-]+/g, ' ')
    words = words.replace(/\s+/g, ' ')
    var parts = words.split(' ')
    var result = []
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim()
      if (p) result.push(p.toLowerCase())
    }
    return result
  },

  _toCamelCase: function(words) {
    if (words.length === 0) return ''
    var result = words[0]
    for (var i = 1; i < words.length; i++) {
      result += words[i].charAt(0).toUpperCase() + words[i].slice(1)
    }
    return result
  },

  _toPascalCase: function(words) {
    var result = ''
    for (var i = 0; i < words.length; i++) {
      result += words[i].charAt(0).toUpperCase() + words[i].slice(1)
    }
    return result
  },

  _toSnakeCase: function(words) {
    return words.join('_')
  },

  _toKebabCase: function(words) {
    return words.join('-')
  },

  _toConstantCase: function(words) {
    var upper = []
    for (var i = 0; i < words.length; i++) {
      upper.push(words[i].toUpperCase())
    }
    return upper.join('_')
  },

  convertText: function() {
    if (!this.data.inputText) {
      this.setData({ outputText: '' })
      return
    }

    var result = ''
    var text = this.data.inputText

    switch (this.data.currentMode) {
      case 'upper':
        result = text.toUpperCase()
        break
      case 'lower':
        result = text.toLowerCase()
        break
      case 'capitalize':
        result = text.replace(/\b\w/g, function(l) { return l.toUpperCase() })
        break
      case 'sentence':
        result = text.replace(/(^\w|[.!?]\s+\w)/g, function(l) { return l.toUpperCase() })
        break
      case 'toggle':
        result = text.split('').map(function(char) {
          return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        }).join('')
        break
      case 'camel':
        result = this._toCamelCase(this._splitWords(text))
        break
      case 'pascal':
        result = this._toPascalCase(this._splitWords(text))
        break
      case 'snake':
        result = this._toSnakeCase(this._splitWords(text))
        break
      case 'kebab':
        result = this._toKebabCase(this._splitWords(text))
        break
      case 'constant':
        result = this._toConstantCase(this._splitWords(text))
        break
    }

    this.setData({ outputText: result })
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(6, '大小写转换', false)
  },

  copyResult: function() {
    var that = this
    if (!this.data.outputText) {
      wx.showToast({ title: this.data.i18n.noContentToCopy, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.outputText,
      success: function() { return wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  resetData: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputText: '',
      outputText: '',
      currentMode: 'upper'
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🔤 大小写转换 - 百宝工具箱', '/package-text/case-converter/case-converter')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🔤 大小写转换 - 百宝工具箱')
  }
})
