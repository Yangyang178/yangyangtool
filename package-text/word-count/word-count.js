var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var STOP_WORDS = {
  '的': true, '了': true, '在': true, '是': true, '我': true, '有': true, '和': true,
  '就': true, '不': true, '人': true, '都': true, '一': true, '一个': true, '上': true,
  '也': true, '很': true, '到': true, '说': true, '要': true, '去': true, '你': true,
  '会': true, '着': true, '没有': true, '看': true, '好': true, '自己': true, '这': true,
  '那': true, '他': true, '她': true, '它': true, '们': true, '吗': true, '吧': true,
  '啊': true, '呢': true, '哦': true, '哈': true, '呀': true, '嗯': true, '么': true,
  '什么': true, '怎么': true, '为什么': true, '哪': true, '谁': true, '几': true,
  '多': true, '少': true, '可以': true, '能': true, '会': true, '还': true, '把': true,
  '被': true, '让': true, '给': true, '从': true, '对': true, '与': true, '或': true,
  '但': true, '而': true, '如果': true, '因为': true, '所以': true, '虽然': true,
  'the': true, 'a': true, 'an': true, 'is': true, 'are': true, 'was': true, 'were': true,
  'be': true, 'been': true, 'being': true, 'have': true, 'has': true, 'had': true,
  'do': true, 'does': true, 'did': true, 'will': true, 'would': true, 'could': true,
  'should': true, 'may': true, 'might': true, 'shall': true, 'can': true, 'need': true,
  'it': true, 'its': true, 'i': true, 'me': true, 'my': true, 'we': true, 'our': true,
  'you': true, 'your': true, 'he': true, 'him': true, 'his': true, 'she': true, 'her': true,
  'they': true, 'them': true, 'their': true, 'this': true, 'that': true, 'these': true,
  'those': true, 'and': true, 'or': true, 'but': true, 'not': true, 'no': true, 'in': true,
  'on': true, 'at': true, 'to': true, 'for': true, 'of': true, 'with': true, 'by': true,
  'from': true, 'as': true, 'into': true, 'about': true, 'if': true, 'then': true,
  'so': true, 'than': true, 'too': true, 'very': true, 'just': true, 'also': true
}

Page({
  data: {
    textContent: '',
    inputLength: 0,
    totalChars: 0,
    chineseChars: 0,
    englishWords: 0,
    numbers: 0,
    punctuation: 0,
    charsWithSpace: 0,
    charsWithoutSpace: 0,
    paragraphs: 0,
    lines: 0,

    readTimeMinutes: 0,
    readTimeText: '',
    speakTimeMinutes: 0,
    speakTimeText: '',

    keywords: [],
    showKeywords: false,

    deduplicatedText: '',
    dedupRemoved: 0,
    showDedup: false,

    isDarkMode: false,
    isLoading: true,
    fontClass: '',
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('字数统计')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var toolTexts = i18n.getToolPageTexts('wordCount')
    this.setData({ i18n: toolTexts })
    poster.setupForPage(this, 5)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var toolTexts = i18n.getToolPageTexts('wordCount')
    this.setData({ i18n: toolTexts })
  },

  onTextInput: function(e) {
    var text = e.detail.value
    this.setData({
      textContent: text,
      inputLength: text.length
    })
    this.calculateStats(text)
  },

  calculateStats: function(text) {
    if (!text) {
      this.resetStats()
      return
    }

    var chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    var english = (text.match(/[a-zA-Z]+/g) || []).length
    var nums = (text.match(/\d+/g) || []).length
    var punc = (text.match(/[，。！？、；：""''（）【】《》…—·～,.!?;:'"()\[\]{}<>]/g) || []).length

    var charsWS = text.length
    var charsWOS = text.replace(/\s/g, '').length
    var paras = text.split(/\n\s*\n/).filter(function(p) { return p.trim() }).length || (text.trim() ? 1 : 0)
    var lineCount = text.split('\n').length

    var readMinutes = chinese / 400 + english / 250
    var readText = ''
    if (readMinutes < 1) {
      readText = Math.max(1, Math.round(readMinutes * 60)) + '秒'
    } else if (readMinutes < 60) {
      readText = Math.round(readMinutes) + '分钟'
    } else {
      var hours = Math.floor(readMinutes / 60)
      var mins = Math.round(readMinutes % 60)
      readText = hours + '小时' + (mins > 0 ? mins + '分钟' : '')
    }

    var speakMinutes = chinese / 250 + english / 150
    var speakText = ''
    if (speakMinutes < 1) {
      speakText = Math.max(1, Math.round(speakMinutes * 60)) + '秒'
    } else if (speakMinutes < 60) {
      speakText = Math.round(speakMinutes) + '分钟'
    } else {
      var sHours = Math.floor(speakMinutes / 60)
      var sMins = Math.round(speakMinutes % 60)
      speakText = sHours + '小时' + (sMins > 0 ? sMins + '分钟' : '')
    }

    var keywords = this.extractKeywords(text)

    this.setData({
      totalChars: charsWS,
      chineseChars: chinese,
      englishWords: english,
      numbers: nums,
      punctuation: punc,
      charsWithSpace: charsWS,
      charsWithoutSpace: charsWOS,
      paragraphs: paras,
      lines: lineCount,
      readTimeMinutes: readMinutes,
      readTimeText: readText,
      speakTimeMinutes: speakMinutes,
      speakTimeText: speakText,
      keywords: keywords
    })

    if (this.data.showDedup) {
      this._calcDedup(text)
    }

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(5, '字数统计', false)
  },

  extractKeywords: function(text) {
    var cnWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || []
    var enWords = text.match(/[a-zA-Z]{3,}/g) || []
    var allWords = cnWords.concat(enWords)

    var freq = {}
    for (var i = 0; i < allWords.length; i++) {
      var w = allWords[i].toLowerCase()
      if (STOP_WORDS[w]) continue
      if (w.length < 2) continue
      freq[w] = (freq[w] || 0) + 1
    }

    var entries = []
    for (var key in freq) {
      if (freq[key] >= 2) {
        entries.push({ word: key, count: freq[key] })
      }
    }

    entries.sort(function(a, b) { return b.count - a.count })
    return entries.slice(0, 20)
  },

  toggleKeywords: function() {
    this.setData({ showKeywords: !this.data.showKeywords })
  },

  toggleDedup: function() {
    var show = !this.data.showDedup
    this.setData({ showDedup: show })
    if (show && this.data.textContent) {
      this._calcDedup(this.data.textContent)
    }
  },

  _calcDedup: function(text) {
    var lines = text.split('\n')
    var seen = {}
    var result = []
    var removed = 0
    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim()
      if (!trimmed) {
        result.push(lines[i])
        continue
      }
      if (!seen[trimmed]) {
        seen[trimmed] = true
        result.push(lines[i])
      } else {
        removed++
      }
    }
    this.setData({
      deduplicatedText: result.join('\n'),
      dedupRemoved: removed
    })
  },

  useDedupText: function() {
    if (!this.data.deduplicatedText) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      textContent: this.data.deduplicatedText,
      inputLength: this.data.deduplicatedText.length
    })
    this.calculateStats(this.data.deduplicatedText)
    wx.showToast({ title: this.data.i18n.replacedOriginal, icon: 'success' })
  },

  copyDedupText: function() {
    var that = this
    if (!this.data.deduplicatedText) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.deduplicatedText,
      success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  clearText: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ textContent: '' })
    this.resetStats()
  },

  resetStats: function() {
    this.setData({
      totalChars: 0,
      chineseChars: 0,
      englishWords: 0,
      numbers: 0,
      punctuation: 0,
      charsWithSpace: 0,
      charsWithoutSpace: 0,
      paragraphs: 0,
      lines: 0,
      inputLength: 0,
      readTimeMinutes: 0,
      readTimeText: '',
      speakTimeMinutes: 0,
      speakTimeText: '',
      keywords: [],
      deduplicatedText: '',
      dedupRemoved: 0
    })
  },

  copyStats: function() {
    var that = this
    wx.vibrateShort({ type: 'light' })
    var stats = '字数统计结果：\n' +
      '总字符数：' + this.data.totalChars + '\n' +
      '中文字：' + this.data.chineseChars + '\n' +
      '英文词：' + this.data.englishWords + '\n' +
      '数字：' + this.data.numbers + '\n' +
      '标点符号：' + this.data.punctuation + '\n' +
      '段落数：' + this.data.paragraphs + '\n' +
      '行数：' + this.data.lines + '\n' +
      '阅读时长：' + this.data.readTimeText + '\n' +
      '朗读时长：' + this.data.speakTimeText

    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: stats,
      success: function() { return wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  copyText: function() {
    var that = this
    if (!this.data.textContent) {
      wx.showToast({ title: this.data.i18n.noTextToCopy, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.textContent,
      success: function() { return wx.showToast({ title: that.data.i18n.copiedText, icon: 'success' }) }
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        textContent: '',
        inputLength: 0,
        totalChars: 0,
        chineseChars: 0,
        englishWords: 0,
        numbers: 0,
        punctuation: 0,
        charsWithSpace: 0,
        charsWithoutSpace: 0,
        paragraphs: 0,
        lines: 0,
        readTimeMinutes: 0,
        readTimeText: '',
        speakTimeMinutes: 0,
        speakTimeText: '',
        keywords: [],
        showKeywords: false,
        showDedup: false,
        deduplicatedText: '',
        dedupRemoved: 0
      })
    })
  },

  copyResult: function() {
    var stats = '总字符: ' + this.data.totalChars +
      ' | 中文: ' + this.data.chineseChars +
      ' | 英文词: ' + this.data.englishWords +
      ' | 数字: ' + this.data.numbers +
      ' | 标点: ' + this.data.punctuation +
      ' | 段落: ' + this.data.paragraphs +
      ' | 行: ' + this.data.lines +
      ' | 阅读: ' + this.data.readTimeText
    toolActions.copyText(stats, '统计已复制')
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('字数统计 - 百宝工具箱', '/package-text/word-count/word-count', '中英文字数统计，字符段落分析')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('字数统计 - 中英文字数字符段落分析')
  }
})
