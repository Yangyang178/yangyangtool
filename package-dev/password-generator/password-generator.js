var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    isLoading: true,
    password: '',
    length: 16,
    strengthLevel: 'medium',
    strengthText: '中等',
    strengthScore: 0,
    strengthPercent: 0,
    options: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeConfused: false
    },
    charSets: {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    },
    confusedChars: '0O1lI|`',
    batchCount: 5,
    batchCounts: [5, 6, 7, 8, 9, 10],
    batchPasswords: [],
    showBatch: false,
    generateMode: 'random',
    modes: [
      { id: 'random', name: '随机密码', icon: '🎲' },
      { id: 'readable', name: '易读密码', icon: '📖' },
      { id: 'pin', name: 'PIN码', icon: '🔢' }
    ],
    pinLength: 6,
    pinLengths: [4, 6, 8],
    pinLengthIndex: 1,

    checkPassword: '',
    checkResult: null,
    checkScore: 0,
    checkDetails: [],
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium'
  },

  _updateI18nData: function() {
    var i18nTexts = this.data.i18n || {}
    this.setData({
      'modes[0].name': i18nTexts.modeRandom || '随机密码',
      'modes[1].name': i18nTexts.modeReadable || '易读密码',
      'modes[2].name': i18nTexts.modePin || 'PIN码'
    })
  },

  onLoad: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var i18nTexts = i18n.getToolPageTexts('passwordGenerator')
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    this._updateI18nData()
    this.generatePassword()
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('密码生成器')
    poster.setupForPage(this, 22)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, fontClass: fontClass, i18n: i18n.getToolPageTexts('passwordGenerator') })
    this._updateI18nData()
  },

  switchMode: function(e) {
    var mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ generateMode: mode })
    this.generatePassword()
  },

  onLengthChange: function(e) {
    this.setData({ length: e.detail.value })
    this.generatePassword()
  },

  selectLength: function(e) {
    var len = parseInt(e.currentTarget.dataset.len)
    this.setData({ length: len })
    this.generatePassword()
  },

  onPinLengthChange: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    this.setData({ pinLengthIndex: index, pinLength: this.data.pinLengths[index] })
    this.generatePassword()
  },

  toggleOption: function(e) {
    var key = e.currentTarget.dataset.key
    var val = this.data.options[key]
    var update = {}
    update['options.' + key] = !val
    this.setData(update)

    var activeCount = 0
    var opts = this.data.options
    for (var k in opts) { if (opts[k]) activeCount++ }
    if (activeCount === 0) {
      wx.showToast({ title: this.data.i18n.selectCharType, icon: 'none' })
      return
    }
    this.generatePassword()
  },

  generatePassword: function() {
    var mode = this.data.generateMode
    if (mode === 'pin') {
      this.generatePin()
    } else if (mode === 'readable') {
      this.generateReadable()
    } else {
      this.generateRandom()
    }
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(22, '密码生成器', false)
  },

  generateRandom: function() {
    var length = this.data.length
    var options = this.data.options
    var charSets = this.data.charSets
    var chars = ''
    if (options.uppercase) chars += charSets.uppercase
    if (options.lowercase) chars += charSets.lowercase
    if (options.numbers) chars += charSets.numbers
    if (options.symbols) chars += charSets.symbols
    if (!chars) return

    if (options.excludeConfused) {
      var confused = this.data.confusedChars
      var filtered = ''
      for (var fi = 0; fi < chars.length; fi++) {
        if (confused.indexOf(chars[fi]) === -1) filtered += chars[fi]
      }
      chars = filtered || chars
    }

    var result = ''
    for (var i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    var strength = this.calcStrength(result)
    this.setData({
      password: result,
      strengthLevel: strength.strengthLevel,
      strengthText: strength.strengthText,
      strengthScore: strength.strengthScore,
      strengthPercent: strength.strengthPercent
    })
  },

  generateReadable: function() {
    var consonants = 'bcdfghjklmnpqrstvwxyz'
    var vowels = 'aeiou'
    var result = ''
    var numSyllables = Math.max(2, Math.floor(this.data.length / 3))
    for (var s = 0; s < numSyllables; s++) {
      result += consonants[Math.floor(Math.random() * consonants.length)]
      result += vowels[Math.floor(Math.random() * vowels.length)]
      if (Math.random() > 0.5) {
        result += consonants[Math.floor(Math.random() * consonants.length)]
      }
      if (s < numSyllables - 1) {
        result += '-'
      }
    }
    result += Math.floor(Math.random() * 90 + 10)
    var strength = this.calcStrength(result)
    this.setData({
      password: result,
      strengthLevel: strength.strengthLevel,
      strengthText: strength.strengthText,
      strengthScore: strength.strengthScore,
      strengthPercent: strength.strengthPercent
    })
  },

  generatePin: function() {
    var pinLen = this.data.pinLength
    var result = ''
    for (var i = 0; i < pinLen; i++) {
      result += Math.floor(Math.random() * 10)
    }
    var strength = this.calcStrength(result)
    this.setData({
      password: result,
      strengthLevel: strength.strengthLevel,
      strengthText: strength.strengthText,
      strengthScore: strength.strengthScore,
      strengthPercent: strength.strengthPercent
    })
  },

  calcStrength: function(pwd) {
    var score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (pwd.length >= 20) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++
    var uniqueChars = []
    for (var i = 0; i < pwd.length; i++) {
      if (uniqueChars.indexOf(pwd[i]) === -1) uniqueChars.push(pwd[i])
    }
    if (uniqueChars.length >= pwd.length * 0.7) score++
    if (uniqueChars.length >= pwd.length * 0.9) score++

    var percent = Math.min(100, Math.round(score / 12 * 100))
    var level, text
    var i18nTexts = this.data.i18n || {}
    if (score <= 3) { level = 'weak'; text = i18nTexts.strengthWeak || '弱' }
    else if (score <= 6) { level = 'medium'; text = i18nTexts.strengthMedium || '中等' }
    else if (score <= 9) { level = 'strong'; text = i18nTexts.strengthStrong || '强' }
    else { level = 'very-strong'; text = i18nTexts.strengthVeryStrong || '极强' }

    return { strengthLevel: level, strengthText: text, strengthScore: score, strengthPercent: percent }
  },

  copyPassword: function() {
    var that = this
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.password,
      success: function() { wx.showToast({ title: that.data.i18n.copiedPassword, icon: 'success' }) }
    })
  },

  refreshPassword: function() {
    wx.vibrateShort({ type: 'light' })
    this.generatePassword()
  },

  toggleBatch: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showBatch
    this.setData({ showBatch: show })
    if (show) this.generateBatch()
  },

  selectBatchCount: function(e) {
    var count = parseInt(e.currentTarget.dataset.count)
    wx.vibrateShort({ type: 'light' })
    this.setData({ batchCount: count })
    this.generateBatch()
  },

  generateBatch: function() {
    var count = this.data.batchCount
    var passwords = []
    var mode = this.data.generateMode
    for (var i = 0; i < count; i++) {
      var pwd = this._generateOnePassword(mode)
      if (pwd) passwords.push(pwd)
    }
    this.setData({ batchPasswords: passwords })
  },

  _generateOnePassword: function(mode) {
    if (mode === 'pin') {
      var pinLen = this.data.pinLength
      var pinResult = ''
      for (var pi = 0; pi < pinLen; pi++) {
        pinResult += Math.floor(Math.random() * 10)
      }
      return pinResult
    }
    if (mode === 'readable') {
      var consonants = 'bcdfghjklmnpqrstvwxyz'
      var vowels = 'aeiou'
      var readResult = ''
      var numSyllables = Math.max(2, Math.floor(this.data.length / 3))
      for (var s = 0; s < numSyllables; s++) {
        readResult += consonants[Math.floor(Math.random() * consonants.length)]
        readResult += vowels[Math.floor(Math.random() * vowels.length)]
        if (Math.random() > 0.5) {
          readResult += consonants[Math.floor(Math.random() * consonants.length)]
        }
        if (s < numSyllables - 1) readResult += '-'
      }
      readResult += Math.floor(Math.random() * 90 + 10)
      return readResult
    }

    var length = this.data.length
    var options = this.data.options
    var charSets = this.data.charSets
    var chars = ''
    if (options.uppercase) chars += charSets.uppercase
    if (options.lowercase) chars += charSets.lowercase
    if (options.numbers) chars += charSets.numbers
    if (options.symbols) chars += charSets.symbols
    if (!chars) return ''

    if (options.excludeConfused) {
      var confused = this.data.confusedChars
      var filtered = ''
      for (var fi = 0; fi < chars.length; fi++) {
        if (confused.indexOf(chars[fi]) === -1) filtered += chars[fi]
      }
      chars = filtered || chars
    }

    var result = ''
    for (var ri = 0; ri < length; ri++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  },

  copyBatchAll: function() {
    var that = this
    wx.vibrateShort({ type: 'light' })
    var text = this.data.batchPasswords.join('\n')
    wx.setClipboardData({
      data: text,
      success: function() { wx.showToast({ title: that.data.i18n.copiedAllPasswords, icon: 'success' }) }
    })
  },

  copyBatchOne: function(e) {
    var that = this
    var idx = e.currentTarget.dataset.index
    var pwd = this.data.batchPasswords[idx]
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: pwd,
      success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  onCheckInput: function(e) {
    this.setData({ checkPassword: e.detail.value })
    if (e.detail.value.length > 0) {
      this.checkPasswordStrength(e.detail.value)
    } else {
      this.setData({ checkResult: null, checkScore: 0, checkDetails: [] })
    }
  },

  checkPasswordStrength: function(pwd) {
    var score = 0
    var details = []
    var len = pwd.length
    var i18nTexts = this.data.i18n || {}

    if (len >= 8) { score += 20; details.push({ text: i18nTexts.checkLen8 || '长度≥8位', pass: true }) }
    else { details.push({ text: i18nTexts.checkLen8 || '长度≥8位', pass: false }) }

    if (len >= 12) { score += 10; details.push({ text: i18nTexts.checkLen12 || '长度≥12位', pass: true }) }
    else { details.push({ text: i18nTexts.checkLen12 || '长度≥12位', pass: false }) }

    if (/[a-z]/.test(pwd)) { score += 15; details.push({ text: i18nTexts.checkLower || '包含小写字母', pass: true }) }
    else { details.push({ text: i18nTexts.checkLower || '包含小写字母', pass: false }) }

    if (/[A-Z]/.test(pwd)) { score += 15; details.push({ text: i18nTexts.checkUpper || '包含大写字母', pass: true }) }
    else { details.push({ text: i18nTexts.checkUpper || '包含大写字母', pass: false }) }

    if (/[0-9]/.test(pwd)) { score += 15; details.push({ text: i18nTexts.checkNumber || '包含数字', pass: true }) }
    else { details.push({ text: i18nTexts.checkNumber || '包含数字', pass: false }) }

    if (/[^a-zA-Z0-9]/.test(pwd)) { score += 15; details.push({ text: i18nTexts.checkSpecial || '包含特殊字符', pass: true }) }
    else { details.push({ text: i18nTexts.checkSpecial || '包含特殊字符', pass: false }) }

    var hasRepeat = /(.)\1{2,}/.test(pwd)
    if (!hasRepeat) { score += 5; details.push({ text: i18nTexts.checkNoRepeat || '无连续重复', pass: true }) }
    else { details.push({ text: i18nTexts.checkNoRepeat || '无连续重复', pass: false }) }

    var hasSeq = false
    for (var i = 0; i < pwd.length - 2; i++) {
      var c1 = pwd.charCodeAt(i)
      var c2 = pwd.charCodeAt(i + 1)
      var c3 = pwd.charCodeAt(i + 2)
      if (c2 - c1 === 1 && c3 - c2 === 1) { hasSeq = true; break }
      if (c1 - c2 === 1 && c2 - c3 === 1) { hasSeq = true; break }
    }
    if (!hasSeq) { score += 5; details.push({ text: i18nTexts.checkNoSequence || '无连续序列', pass: true }) }
    else { details.push({ text: i18nTexts.checkNoSequence || '无连续序列', pass: false }) }

    var level = 'weak'
    var levelText = i18nTexts.strengthWeak || '弱'
    var levelColor = '#EF4444'
    if (score >= 80) { level = 'strong'; levelText = i18nTexts.strengthStrong || '强'; levelColor = '#10B981' }
    else if (score >= 50) { level = 'medium'; levelText = i18nTexts.strengthMedium || '中等'; levelColor = '#F59E0B' }

    this.setData({
      checkResult: { level: level, levelText: levelText, levelColor: levelColor },
      checkScore: Math.min(score, 100),
      checkDetails: details
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      var i18nTexts = that.data.i18n || {}
      that.setData({
        password: '',
        length: 16,
        strengthLevel: 'medium',
        strengthText: i18nTexts.strengthMedium || '中等',
        strengthScore: 0,
        strengthPercent: 0,
        options: {
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: false,
          excludeConfused: false
        },
        generateMode: 'random',
        pinLength: 6,
        pinLengthIndex: 1,
        checkPassword: '',
        checkResult: null,
        checkScore: 0,
        checkDetails: [],
        batchPasswords: [],
        showBatch: false,
        batchCount: 5
      })
      that.generatePassword()
    }, that.data.i18n)
  },

  copyResult: function() {
    toolActions.copyText(this.data.password, this.data.i18n.passwordCopied, this.data.i18n)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('密码生成器 - 百宝工具箱', '/package-dev/password-generator/password-generator', '随机安全密码生成，自定义长度和字符')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('密码生成器 - 随机安全密码自定义生成')
  }
})
