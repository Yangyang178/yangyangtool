var storageUtil = require('../../utils/storage.js')
var i18n = require('../../utils/i18n.js')

var commonRegexes = [
  { name: '手机号码', pattern: '1[3-9]\\d{9}', desc: '中国大陆11位手机号', category: 'contact' },
  { name: '邮箱地址', pattern: '\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*', desc: '标准邮箱格式', category: 'contact' },
  { name: '固定电话', pattern: '(0\\d{2,3}-)?\\d{7,8}', desc: '区号+号码', category: 'contact' },
  { name: '身份证号', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', desc: '18位身份证', category: 'id' },
  { name: 'URL网址', pattern: 'https?://[^\\s]+', desc: 'HTTP/HTTPS协议', category: 'web' },
  { name: 'IP地址', pattern: '((25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d?\\d)', desc: 'IPv4地址', category: 'web' },
  { name: '域名', pattern: '[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\\.?', desc: '标准域名格式', category: 'web' },
  { name: '日期格式', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', desc: 'YYYY-MM-DD', category: 'format' },
  { name: '时间格式', pattern: '([01]?\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?', desc: 'HH:MM或HH:MM:SS', category: 'format' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', desc: '一个或多个中文', category: 'text' },
  { name: '数字', pattern: '-?\\d+(\\.\\d+)?', desc: '整数或小数', category: 'text' },
  { name: '英文单词', pattern: '[a-zA-Z]+', desc: '纯英文字母', category: 'text' },
  { name: '密码强度', pattern: '^(?=.*\\d)(?=.*[a-zA-Z]).{6,20}$', desc: '至少含字母和数字6-20位', category: 'security' },
  { name: '强密码', pattern: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,20}$', desc: '大小写+数字+特殊字符', category: 'security' },
  { name: '用户名', pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,15}$', desc: '字母开头3-16位', category: 'format' },
  { name: '邮政编码', pattern: '[1-9]\\d{5}(?!\\d)', desc: '中国6位邮编', category: 'id' },
  { name: '车牌号', pattern: '[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-Z][A-Z0-9]{5,6}', desc: '中国大陆车牌', category: 'id' },
  { name: '银行卡号', pattern: '\\d{16,19}', desc: '16-19位银行卡', category: 'id' },
  { name: 'HTML标签', pattern: '<[^>]+>', desc: '匹配HTML标签', category: 'web' },
  { name: '十六进制色值', pattern: '#[0-9a-fA-F]{3,8}', desc: 'CSS颜色值', category: 'format' }
]

var regexCategories = [
  { key: 'all', name: '全部' },
  { key: 'contact', name: '联系' },
  { key: 'id', name: '证件' },
  { key: 'web', name: '网络' },
  { key: 'format', name: '格式' },
  { key: 'text', name: '文本' },
  { key: 'security', name: '安全' }
]

var cheatSheetData = [
  { category: '字符类', items: [
    { syntax: '.', desc: '任意字符(除换行)' },
    { syntax: '\\d', desc: '数字 [0-9]' },
    { syntax: '\\D', desc: '非数字 [^0-9]' },
    { syntax: '\\w', desc: '单词字符 [a-zA-Z0-9_]' },
    { syntax: '\\W', desc: '非单词字符' },
    { syntax: '\\s', desc: '空白符' },
    { syntax: '\\S', desc: '非空白符' },
    { syntax: '[abc]', desc: '字符集a/b/c' },
    { syntax: '[^abc]', desc: '除a/b/c外' },
    { syntax: '[a-z]', desc: 'a到z范围' }
  ]},
  { category: '量词', items: [
    { syntax: '*', desc: '0次或多次' },
    { syntax: '+', desc: '1次或多次' },
    { syntax: '?', desc: '0次或1次' },
    { syntax: '{n}', desc: '恰好n次' },
    { syntax: '{n,}', desc: '至少n次' },
    { syntax: '{n,m}', desc: 'n到m次' },
    { syntax: '*?', desc: '非贪婪0+次' },
    { syntax: '+?', desc: '非贪婪1+次' }
  ]},
  { category: '锚点', items: [
    { syntax: '^', desc: '行首' },
    { syntax: '$', desc: '行尾' },
    { syntax: '\\b', desc: '单词边界' },
    { syntax: '\\B', desc: '非单词边界' }
  ]},
  { category: '分组', items: [
    { syntax: '(abc)', desc: '捕获分组' },
    { syntax: '(?:abc)', desc: '非捕获分组' },
    { syntax: '(?=abc)', desc: '正向前瞻' },
    { syntax: '(?!abc)', desc: '负向前瞻' },
    { syntax: '\\1', desc: '反向引用第1组' },
    { syntax: 'a|b', desc: 'a或b' }
  ]},
  { category: '标志位', items: [
    { syntax: 'g', desc: '全局匹配' },
    { syntax: 'i', desc: '忽略大小写' },
    { syntax: 'm', desc: '多行模式' },
    { syntax: 's', desc: '单行模式(.匹配换行)' }
  ]}
]

var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')

var sampleData = {
  regex: '(\\d{4})-(\\d{2})-(\\d{2})',
  text: '日期1：2025-01-15\n日期2：2024-12-25\n无效：2025-13-45'
}

Page({
  data: {
    regexPattern: '',
    testText: '',

    flags: { g: true, i: false, m: false },
    currentFlags: 'g',
    errorMsg: '',
    matchResult: false,
    hasTested: false,
    matchCount: 0,
    highlightedText: '',
    matches: [],

    showReplace: false,
    replaceText: '',

    textLength: 0,
    lineCount: 0,

    commonRegexes: commonRegexes,
    regexCategories: regexCategories,
    activeRegexCategory: 'all',
    filteredRegexes: commonRegexes,

    cheatSheetData: cheatSheetData,
    showCheatSheet: false,
    activeCheatCategory: '',

    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('正则表达式测试')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    this.updateFlagsDisplay()
    var toolTexts = i18n.getToolPageTexts('regexTester')
    this.setData({ i18n: toolTexts })
    poster.setupForPage(this, 20)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var toolTexts = i18n.getToolPageTexts('regexTester')
    this.setData({ i18n: toolTexts })
  },

  onRegexInput: function(e) {
    this.setData({ regexPattern: e.detail.value, errorMsg: '' })
  },

  onTextInput: function(e) {
    var value = e.detail.value
    this.setData({
      testText: value,
      textLength: value.length,
      lineCount: value ? value.split('\n').length : 0
    })
  },

  toggleFlag: function(e) {
    wx.vibrateShort({ type: 'light' })
    var flag = e.currentTarget.dataset.flag
    var flags = this.data.flags
    flags[flag] = !flags[flag]
    this.setData({ flags: flags })
    this.updateFlagsDisplay()
  },

  updateFlagsDisplay: function() {
    var g = this.data.flags.g
    var i = this.data.flags.i
    var m = this.data.flags.m
    var flagsStr = ''
    if (g) flagsStr += 'g'
    if (i) flagsStr += 'i'
    if (m) flagsStr += 'm'
    this.setData({ currentFlags: flagsStr || '-' })
  },

  testRegex: function() {
    wx.vibrateShort({ type: 'medium' })

    var regexPattern = this.data.regexPattern
    var testText = this.data.testText
    var flags = this.data.flags

    if (!regexPattern.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInputRegex, icon: 'none' })
      return
    }

    if (!testText.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInputTestText, icon: 'none' })
      return
    }

    try {
      var flagStr = ''
      if (flags.g) flagStr += 'g'
      if (flags.i) flagStr += 'i'
      if (flags.m) flagStr += 'm'

      var regex = new RegExp(regexPattern, flagStr)

      var matches = []
      var match

      if (flags.g) {
        while ((match = regex.exec(testText)) !== null) {
          var groups = []
          if (match.length > 1) {
            for (var gi = 1; gi < match.length; gi++) {
              groups.push({ index: gi, value: match[gi] !== undefined ? match[gi] : '' })
            }
          }
          matches.push({
            match: match[0],
            index: match.index,
            groups: groups
          })

          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }
      } else {
        match = regex.exec(testText)
        if (match) {
          var groups2 = []
          if (match.length > 1) {
            for (var gj = 1; gj < match.length; gj++) {
              groups2.push({ index: gj, value: match[gj] !== undefined ? match[gj] : '' })
            }
          }
          matches.push({
            match: match[0],
            index: match.index,
            groups: groups2
          })
        }
      }

      var highlightedText = this.generateHighlightedText(testText, matches)

      this.setData({
        errorMsg: '',
        matchResult: matches.length > 0,
        hasTested: true,
        matchCount: matches.length,
        highlightedText: highlightedText,
        matches: matches,
        showReplace: false
      })

      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(20, '正则表达式测试', false)

      if (matches.length > 0) {
        wx.showToast({ title: matches.length + ' ' + this.data.i18n.foundMatches, icon: 'success', duration: 1500 })
      } else {
        wx.showToast({ title: this.data.i18n.noMatchFound, icon: 'none' })
      }

    } catch (e) {
      this.setData({
        errorMsg: '正则表达式错误: ' + e.message,
        matchResult: false,
        hasTested: true,
        matches: []
      })
      wx.vibrateLong({ type: 'heavy' })
    }
  },

  generateHighlightedText: function(text, matches) {
    if (!matches || matches.length === 0) {
      return text.replace(/</g, '&lt;')
    }

    var result = ''
    var lastIndex = 0

    for (var idx = 0; idx < matches.length; idx++) {
      var match = matches[idx]
      result += this.escapeHtml(text.substring(lastIndex, match.index))

      var colors = ['#C4B5FD', '#93C5FD', '#86EFAC', '#FCD34D', '#FCA5A5', '#67E8F9', '#F9A8D4', '#A5B4FC']
      var colorIdx = idx % colors.length

      if (match.groups && match.groups.length > 0) {
        var fullMatch = match.match
        var posInMatch = 0
        result += '<span style="background:' + colors[colorIdx] + '33;color:#1E293B;padding:2px 4px;border-radius:4px;font-weight:700;">'

        for (var gi = 0; gi < match.groups.length; gi++) {
          var groupVal = match.groups[gi].value
          if (!groupVal) continue
          var gIdx = fullMatch.indexOf(groupVal, posInMatch)
          if (gIdx === -1) continue

          if (gIdx > posInMatch) {
            result += this.escapeHtml(fullMatch.substring(posInMatch, gIdx))
          }

          var groupColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1']
          var gColorIdx = gi % groupColors.length
          result += '<span style="background:' + groupColors[gColorIdx] + '44;color:#1E293B;padding:1px 3px;border-radius:3px;border-bottom:2px solid ' + groupColors[gColorIdx] + ';">' + this.escapeHtml(groupVal) + '</span>'

          posInMatch = gIdx + groupVal.length
        }

        if (posInMatch < fullMatch.length) {
          result += this.escapeHtml(fullMatch.substring(posInMatch))
        }
        result += '</span>'
      } else {
        result += '<span style="background:' + colors[colorIdx] + ';color:#1E293B;padding:2px 4px;border-radius:4px;font-weight:700;">' + this.escapeHtml(match.match) + '</span>'
      }

      lastIndex = match.index + match.match.length
    }

    result += this.escapeHtml(text.substring(lastIndex))
    return result
  },

  escapeHtml: function(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  },

  showReplacePanel: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ showReplace: !this.data.showReplace })
  },

  onReplaceInput: function(e) {
    this.setData({ replaceText: e.detail.value })
  },

  executeReplace: function() {
    wx.vibrateShort({ type: 'medium' })

    var regexPattern = this.data.regexPattern
    var testText = this.data.testText
    var replaceText = this.data.replaceText
    var flags = this.data.flags

    if (!regexPattern.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInputRegex, icon: 'none' })
      return
    }

    try {
      var flagStr = ''
      if (flags.g) flagStr += 'g'
      if (flags.i) flagStr += 'i'
      if (flags.m) flagStr += 'm'

      var regex = new RegExp(regexPattern, flagStr)
      var result = testText.replace(regex, replaceText)

      this.setData({
        testText: result,
        textLength: result.length,
        lineCount: result.split('\n').length,
        showReplace: false,
        matchResult: false,
        hasTested: false,
        matches: []
      })

      wx.showToast({ title: this.data.i18n.replaceSuccess, icon: 'success' })

    } catch (e) {
      wx.showToast({ title: this.data.i18n.replaceFail, icon: 'none' })
    }
  },

  loadSampleRegex: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      regexPattern: sampleData.regex,
      testText: sampleData.text,
      textLength: sampleData.text.length,
      lineCount: sampleData.text.split('\n').length,
      errorMsg: ''
    })
    wx.showToast({ title: this.data.i18n.exampleLoaded, icon: 'success' })
  },

  clearRegex: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      regexPattern: '',
      testText: '',
      errorMsg: '',
      matchResult: false,
      hasTested: false,
      matches: [],
      showReplace: false,
      replaceText: '',
      textLength: 0,
      lineCount: 0
    })
  },

  pasteText: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.getClipboardData({
      success: function(res) {
        if (res.data && res.data.trim()) {
          that.setData({
            testText: res.data,
            textLength: res.data.length,
            lineCount: res.data.split('\n').length
          })
          wx.showToast({ title: that.data.i18n.pasted, icon: 'success' })
        } else {
          wx.showToast({ title: that.data.i18n.clipboardEmpty, icon: 'none' })
        }
      }
    })
  },

  selectLibraryRegex: function(e) {
    wx.vibrateShort({ type: 'medium' })
    var regex = e.currentTarget.dataset.regex
    this.setData({ regexPattern: regex.pattern, errorMsg: '' })
    wx.showToast({ title: this.data.i18n.selected + regex.name, icon: 'success' })
  },

  onRegexCategoryTap: function(e) {
    var key = e.currentTarget.dataset.key
    wx.vibrateShort({ type: 'light' })
    if (key === 'all') {
      this.setData({ activeRegexCategory: 'all', filteredRegexes: commonRegexes })
    } else {
      var filtered = []
      for (var i = 0; i < commonRegexes.length; i++) {
        if (commonRegexes[i].category === key) filtered.push(commonRegexes[i])
      }
      this.setData({ activeRegexCategory: key, filteredRegexes: filtered })
    }
  },

  toggleCheatSheet: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showCheatSheet
    this.setData({ showCheatSheet: show })
  },

  onCheatCategoryTap: function(e) {
    var key = e.currentTarget.dataset.key
    wx.vibrateShort({ type: 'light' })
    this.setData({ activeCheatCategory: this.data.activeCheatCategory === key ? '' : key })
  },

  copyResult: function() {
    var matches = this.data.matches
    if (!matches || matches.length === 0) {
      toolActions.copyText('')
      return
    }
    var text = ''
    for (var i = 0; i < matches.length; i++) {
      var m = matches[i]
      text += m.match + ' (位置: ' + m.index + ')'
      if (m.groups && m.groups.length > 0) {
        for (var j = 0; j < m.groups.length; j++) {
          text += '\n  $' + m.groups[j].index + ': ' + m.groups[j].value
        }
      }
      if (i < matches.length - 1) text += '\n'
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        regexPattern: '',
        testText: '',
        flags: { g: true, i: false, m: false },
        currentFlags: 'g',
        errorMsg: '',
        matchResult: false,
        hasTested: false,
        matchCount: 0,
        highlightedText: '',
        matches: [],
        showReplace: false,
        replaceText: '',
        textLength: 0,
        lineCount: 0
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('✨ 正则表达式测试 - 百宝工具箱', '/package-text/regex-tester/regex-tester')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('✨ 正则表达式测试 - 百宝工具箱')
  }
})
