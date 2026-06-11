var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    text1: '',
    text2: '',
    diffResult: [],
    stats: { added: 0, removed: 0, same: 0 },
    hasDiff: false,
    showLineNumbers: true,
    mergeMode: 'none',
    mergedText: '',
    showMergePanel: false,
    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('文本对比')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var toolTexts = i18n.getToolPageTexts('textDiff')
    this.setData({ i18n: toolTexts })
    poster.setupForPage(this, 24)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var toolTexts = i18n.getToolPageTexts('textDiff')
    this.setData({ i18n: toolTexts })
  },

  onInput1: function(e) { this.setData({ text1: e.detail.value }) },
  onInput2: function(e) { this.setData({ text2: e.detail.value }) },

  clearText1: function() { this.setData({ text1: '' }) },
  clearText2: function() { this.setData({ text2: '' }) },

  swapTexts: function() {
    wx.vibrateShort({ type: 'light' })
    var tmp = this.data.text1
    this.setData({ text1: this.data.text2, text2: tmp })
  },

  toggleLineNumbers: function() {
    this.setData({ showLineNumbers: !this.data.showLineNumbers })
  },

  compare: function() {
    var lines1 = (this.data.text1 || '').split('\n')
    var lines2 = (this.data.text2 || '').split('\n')

    wx.vibrateShort({ type: 'light' })

    var diff = []
    var added = 0, removed = 0, same = 0
    var lineNum = 0

    var lcs = this.computeLCS(lines1, lines2)
    var i = 0, j = 0, k = 0
    while (i < lines1.length || j < lines2.length) {
      if (k < lcs.length && i < lines1.length && lines1[i] === lcs[k] && j < lines2.length && lines2[j] === lcs[k]) {
        lineNum++
        diff.push({ type: 'same', lineNum: lineNum, content: lines1[i], selected: false })
        same++
        i++; j++; k++
      } else {
        var inLCS = false
        for (var m = k; m < lcs.length && !inLCS; m++) {
          if (i < lines1.length && lines1[i] === lcs[m]) inLCS = true
          if (j < lines2.length && lines2[j] === lcs[m]) inLCS = true
        }
        if (!inLCS) {
          while (i < lines1.length && (k >= lcs.length || lines1[i] !== lcs[k])) {
            diff.push({ type: 'removed', lineNum: 0, content: lines1[i], selected: false })
            removed++
            i++
          }
          while (j < lines2.length && (k >= lcs.length || lines2[j] !== lcs[k])) {
            diff.push({ type: 'added', lineNum: 0, content: lines2[j], selected: false })
            added++
            j++
          }
        } else {
          while (i < lines1.length && (k >= lcs.length || lines1[i] !== lcs[k])) {
            diff.push({ type: 'removed', lineNum: 0, content: lines1[i], selected: false })
            removed++
            i++
          }
          while (j < lines2.length && (k >= lcs.length || lines2[j] !== lcs[k])) {
            diff.push({ type: 'added', lineNum: 0, content: lines2[j], selected: false })
            added++
            j++
          }
        }
      }
    }

    this.setData({
      diffResult: diff,
      stats: { added: added, removed: removed, same: same },
      hasDiff: added > 0 || removed > 0,
      showMergePanel: false,
      mergeMode: 'none',
      mergedText: ''
    })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(24, '文本对比', false)

    if (diff.length === 0) {
      wx.showToast({ title: this.data.i18n.textsIdentical, icon: 'none' })
    }
  },

  computeLCS: function(arr1, arr2) {
    var m = arr1.length, n = arr2.length
    var dp = []
    for (var x = 0; x <= m; x++) {
      dp[x] = []
      for (var y = 0; y <= n; y++) {
        dp[x][y] = 0
      }
    }

    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    var result = []
    var i = m, j = n
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        result.unshift(arr1[i - 1])
        i--; j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }
    return result
  },

  toggleMergePanel: function() {
    this.setData({ showMergePanel: !this.data.showMergePanel })
  },

  selectMergeMode: function(e) {
    var mode = e.currentTarget.dataset.mode
    this.setData({ mergeMode: mode })
    this.generateMergedText(mode)
  },

  generateMergedText: function(mode) {
    var diff = this.data.diffResult
    var lines = []
    for (var i = 0; i < diff.length; i++) {
      var item = diff[i]
      if (mode === 'left') {
        if (item.type === 'same' || item.type === 'removed') {
          lines.push(item.content)
        }
      } else if (mode === 'right') {
        if (item.type === 'same' || item.type === 'added') {
          lines.push(item.content)
        }
      } else if (mode === 'both') {
        lines.push(item.content)
      }
    }
    this.setData({ mergedText: lines.join('\n') })
  },

  useMergedText: function() {
    if (!this.data.mergedText) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      text1: this.data.mergedText,
      text2: '',
      diffResult: [],
      stats: { added: 0, removed: 0, same: 0 },
      hasDiff: false,
      showMergePanel: false,
      mergeMode: 'none',
      mergedText: ''
    })
    wx.showToast({ title: this.data.i18n.replacedToOriginal, icon: 'success' })
  },

  copyMergedText: function() {
    var that = this
    if (!this.data.mergedText) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.mergedText,
      success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  exportResult: function() {
    var that = this
    var diff = this.data.diffResult
    if (!diff || diff.length === 0) {
      wx.showToast({ title: this.data.i18n.pleaseCompareFirst, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })

    var lines = []
    lines.push('========== 文本对比结果 ==========')
    lines.push('')
    lines.push('统计：' + this.data.stats.added + ' 行新增 | ' + this.data.stats.removed + ' 行删除 | ' + this.data.stats.same + ' 行相同')
    lines.push('')
    lines.push('--- 原始文本')
    lines.push('+++ 对比文本')
    lines.push('')

    var lineNum = 0
    for (var i = 0; i < diff.length; i++) {
      var item = diff[i]
      var prefix = ' '
      if (item.type === 'added') prefix = '+'
      else if (item.type === 'removed') prefix = '-'
      if (item.type === 'same') lineNum++
      var numStr = item.type === 'same' ? (lineNum + '') : ''
      var numPad = numStr.length < 4 ? '    '.substr(0, 4 - numStr.length) + numStr : numStr
      lines.push(numPad + ' ' + prefix + ' ' + item.content)
    }

    lines.push('')
    lines.push('========== 导出时间：' + this._formatDateTime(new Date()) + ' ==========')

    wx.setClipboardData({
      data: lines.join('\n'),
      success: function() { wx.showToast({ title: that.data.i18n.diffResultCopied, icon: 'success' }) }
    })
  },

  _formatDateTime: function(date) {
    var y = date.getFullYear()
    var mo = date.getMonth() + 1
    var d = date.getDate()
    var h = date.getHours()
    var mi = date.getMinutes()
    return y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (d < 10 ? '0' : '') + d + ' ' + (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi
  },

  copyResult: function() {
    var diffResult = this.data.diffResult
    if (!diffResult || diffResult.length === 0) {
      toolActions.copyText('')
      return
    }
    var text = ''
    for (var i = 0; i < diffResult.length; i++) {
      var item = diffResult[i]
      var prefix = item.type === 'added' ? '+ ' : item.type === 'removed' ? '- ' : '  '
      text += prefix + item.content + '\n'
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        text1: '',
        text2: '',
        diffResult: [],
        stats: { added: 0, removed: 0, same: 0 },
        hasDiff: false,
        showMergePanel: false,
        mergeMode: 'none',
        mergedText: ''
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🔄 文本对比 - 百宝工具箱', '/package-text/text-diff/text-diff')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🔄 文本对比 - 百宝工具箱')
  }
})
