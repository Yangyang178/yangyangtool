var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var BIT_WIDTH_OPTIONS = [8, 16, 32]
var OPERATION_OPTIONS = ['AND', 'OR', 'XOR', 'NOT', 'LSHIFT', 'RSHIFT', 'LCIRC', 'RCIRC']
var BASE_OPTIONS = [10, 16, 2, 8]
var BASE_LABELS = { 2: '二进制', 8: '八进制', 10: '十进制', 16: '十六进制' }
var OP_LABELS = { AND: 'AND (&)', OR: 'OR (|)', XOR: 'XOR (^)', NOT: 'NOT (~)', LSHIFT: '左移 (<<)', RSHIFT: '右移 (>>)', LCIRC: '左移循环', RCIRC: '右移循环' }

Page({
  data: {
    isLoading: true,
    valueA: '',
    valueB: '',
    bitWidth: 8,
    activeBase: 10,
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    hasResult: false,
    resultValue: '',
    operation: 'AND',
    bitsA: [],
    bitsB: [],
    bitsResult: [],
    decA: 0,
    decB: 0,
    decResult: 0,
    hexA: '',
    hexB: '',
    hexResult: '',
    errorMessage: '',
    bitWidthOptions: BIT_WIDTH_OPTIONS,
    operationOptions: OPERATION_OPTIONS,
    baseOptions: BASE_OPTIONS,
    baseLabels: BASE_LABELS,
    opLabels: OP_LABELS,
    isUnaryOp: false
  },

  onLoad: function(options) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var i18nTexts = i18n.getToolPageTexts('bitVisualizer')
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('位运算可视化')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var updateData = { isDarkMode: isDark, i18n: i18nTexts }

    if (options && options.valueA) {
      updateData.valueA = options.valueA
      if (options.base) {
        var base = parseInt(options.base)
        if (base === 2 || base === 8 || base === 10 || base === 16) {
          updateData.activeBase = base
        }
      }
    }

    this.setData(updateData)
    poster.setupForPage(this, 39)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, fontClass: fontClass, i18n: i18n.getToolPageTexts('bitVisualizer') })
  },

  onValueAInput: function(e) {
    this.setData({ valueA: e.detail.value, errorMessage: '' })
  },

  onValueBInput: function(e) {
    this.setData({ valueB: e.detail.value, errorMessage: '' })
  },

  onBaseChange: function(e) {
    var base = parseInt(e.currentTarget.dataset.base)
    if (base === this.data.activeBase) return
    toolActions.vibrate('light')

    var oldBase = this.data.activeBase
    var decA = this._parseInput(this.data.valueA, oldBase)
    var decB = this._parseInput(this.data.valueB, oldBase)

    this.setData({ activeBase: base, errorMessage: '' })

    if (decA !== null && this.data.valueA) {
      var newValA = this._formatValue(decA, base)
      this.setData({ valueA: newValA })
    }
    if (decB !== null && this.data.valueB) {
      var newValB = this._formatValue(decB, base)
      this.setData({ valueB: newValB })
    }
  },

  onBitWidthChange: function(e) {
    var width = parseInt(e.currentTarget.dataset.width)
    if (width === this.data.bitWidth) return
    toolActions.vibrate('light')
    this.setData({ bitWidth: width, errorMessage: '' })
    if (this.data.hasResult) {
      this.calculate()
    }
  },

  onOperationChange: function(e) {
    var op = e.currentTarget.dataset.op
    if (op === this.data.operation) return
    toolActions.vibrate('light')
    var isUnary = (op === 'NOT')
    this.setData({ operation: op, isUnaryOp: isUnary, errorMessage: '' })
    if (this.data.hasResult) {
      this.calculate()
    }
  },

  calculate: function() {
    var valueA = this.data.valueA.trim()
    if (!valueA) {
      this.setData({ errorMessage: this.data.i18n.pleaseInputValueA, hasResult: false })
      return
    }

    var base = this.data.activeBase
    var decA = this._parseInput(valueA, base)
    if (decA === null) {
      this.setData({ errorMessage: this.data.i18n.valueAInvalidPrefix + BASE_LABELS[base] + this.data.i18n.valueInvalidSuffix, hasResult: false })
      return
    }

    var bitWidth = this.data.bitWidth
    var maxVal = Math.pow(2, bitWidth) - 1
    if (decA < 0) {
      decA = decA & maxVal
    }
    decA = decA & maxVal

    var decB = 0
    var op = this.data.operation

    if (op !== 'NOT') {
      var valueB = this.data.valueB.trim()
      if (!valueB) {
        this.setData({ errorMessage: this.data.i18n.pleaseInputValueB, hasResult: false })
        return
      }
      decB = this._parseInput(valueB, base)
      if (decB === null) {
        this.setData({ errorMessage: this.data.i18n.valueBInvalidPrefix + BASE_LABELS[base] + this.data.i18n.valueInvalidSuffix, hasResult: false })
        return
      }
      if (decB < 0) {
        decB = decB & maxVal
      }
      decB = decB & maxVal
    }

    var decResult = 0
    switch (op) {
      case 'AND':
        decResult = decA & decB
        break
      case 'OR':
        decResult = decA | decB
        break
      case 'XOR':
        decResult = decA ^ decB
        break
      case 'NOT':
        decResult = (~decA) & maxVal
        break
      case 'LSHIFT':
        decResult = (decA << decB) & maxVal
        break
      case 'RSHIFT':
        decResult = (decA >>> decB) & maxVal
        break
      case 'LCIRC':
        var shiftL = decB % bitWidth
        decResult = ((decA << shiftL) | (decA >>> (bitWidth - shiftL))) & maxVal
        break
      case 'RCIRC':
        var shiftR = decB % bitWidth
        decResult = ((decA >>> shiftR) | (decA << (bitWidth - shiftR))) & maxVal
        break
    }

    var bitsA = this._toBitsArray(decA, bitWidth)
    var bitsB = this._toBitsArray(decB, bitWidth)
    var bitsResult = this._toBitsArray(decResult, bitWidth)

    for (var i = 0; i < bitsResult.length; i++) {
      if (op === 'NOT') {
        if (bitsResult[i].value !== bitsA[i].value) {
          bitsResult[i].highlight = true
        }
      } else {
        if (bitsResult[i].value !== bitsA[i].value || bitsResult[i].value !== bitsB[i].value) {
          if (bitsResult[i].value !== (bitsA[i].value & bitsB[i].value) || op !== 'AND') {
            bitsResult[i].highlight = true
          }
        }
      }
    }

    var hexA = this._formatValue(decA, 16).toUpperCase()
    var hexB = this._formatValue(decB, 16).toUpperCase()
    var hexResult = this._formatValue(decResult, 16).toUpperCase()

    this.setData({
      hasResult: true,
      errorMessage: '',
      decA: decA,
      decB: decB,
      decResult: decResult,
      hexA: hexA,
      hexB: hexB,
      hexResult: hexResult,
      bitsA: bitsA,
      bitsB: bitsB,
      bitsResult: bitsResult,
      resultValue: this._formatValue(decResult, base)
    })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(35, '位运算可视化', false)
  },

  _parseInput: function(val, base) {
    if (!val || !val.trim()) return null
    val = val.trim()

    if (val.indexOf('0x') === 0 || val.indexOf('0X') === 0) {
      base = 16
      val = val.substring(2)
    } else if (val.indexOf('0b') === 0 || val.indexOf('0B') === 0) {
      base = 2
      val = val.substring(2)
    } else if (val.indexOf('0o') === 0 || val.indexOf('0O') === 0) {
      base = 8
      val = val.substring(2)
    }

    if (!val) return null

    var isNeg = false
    if (val.charAt(0) === '-') {
      isNeg = true
      val = val.substring(1)
    }

    var validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substring(0, base)
    for (var i = 0; i < val.length; i++) {
      var c = val.charAt(i).toUpperCase()
      if (validChars.indexOf(c) === -1) return null
    }

    var result = parseInt(val, base)
    if (isNaN(result)) return null
    return isNeg ? -result : result
  },

  _toBitsArray: function(num, bitWidth) {
    var bits = []
    for (var i = bitWidth - 1; i >= 0; i--) {
      var bitVal = (num >> i) & 1
      bits.push({ value: bitVal, highlight: false })
    }
    return bits
  },

  _formatValue: function(num, base) {
    if (num === 0) return '0'
    if (num < 0) {
      var maxVal = Math.pow(2, this.data.bitWidth) - 1
      num = num & maxVal
    }
    return num.toString(base).toUpperCase()
  },

  copyResult: function() {
    var text = ''
    if (!this.data.hasResult) {
      toolActions.copyText('', null, this.data.i18n)
      return
    }
    var op = this.data.operation
    var opSymbol = ''
    switch (op) {
      case 'AND': opSymbol = '&'; break
      case 'OR': opSymbol = '|'; break
      case 'XOR': opSymbol = '^'; break
      case 'NOT': opSymbol = '~'; break
      case 'LSHIFT': opSymbol = '<<'; break
      case 'RSHIFT': opSymbol = '>>'; break
      case 'LCIRC': opSymbol = '<<<'; break
      case 'RCIRC': opSymbol = '>>>'; break
    }
    var binA = this._formatValue(this.data.decA, 2)
    var binResult = this._formatValue(this.data.decResult, 2)
    if (op === 'NOT') {
      text = '~' + this.data.decA + ' = ' + this.data.decResult
      text += '\n' + binA + ' -> ' + binResult
    } else {
      var binB = this._formatValue(this.data.decB, 2)
      text = this.data.decA + ' ' + opSymbol + ' ' + this.data.decB + ' = ' + this.data.decResult
      text += '\n' + binA + ' ' + opSymbol + ' ' + binB + ' -> ' + binResult
    }
    toolActions.copyText(text, this.data.i18n.resultCopied, this.data.i18n)
  },

  resetData: function() {
    toolActions.resetConfirm(function() {
      this.setData({
        valueA: '',
        valueB: '',
        hasResult: false,
        resultValue: '',
        bitsA: [],
        bitsB: [],
        bitsResult: [],
        decA: 0,
        decB: 0,
        decResult: 0,
        hexA: '',
        hexB: '',
        hexResult: '',
        errorMessage: ''
      })
    }.bind(this), this.data.i18n)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('位运算可视化 - 百宝工具箱', '/package-dev/bit-visualizer/bit-visualizer', '二进制位运算实时演示，AND/OR/XOR')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('位运算可视化 - 二进制AND/OR/XOR演示')
  }
})
