var storageUtil = require('../../utils/storage.js')
var logger = require('../../utils/logger.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var app = getApp()

// 轨道占用时间记录（trackIndex -> 上次使用的时间戳）
var _trackLastUsed = {}
// 一键齐发定时器
var _templateTimer = null

var TEMPLATES = {
  cheer: {
    name: '📣 应援打call',
    zhName: '📣 应援打call',
    enName: '📣 Cheer & Support',
    items: [
      { text: '加油！加油！', color: '#FF3B30' },
      { text: '你最棒！', color: '#FF9500' },
      { text: '冲冲冲！', color: '#FFCC00' },
      { text: '永远支持你！', color: '#FF2D55' },
      { text: '太厉害了！', color: '#007AFF' },
      { text: '必胜！', color: '#34C759' },
      { text: '全力以赴！', color: '#FF3B30' },
      { text: '我们都在！', color: '#007AFF' }
    ]
  },
  love: {
    name: '💕 表白告白',
    zhName: '💕 表白告白',
    enName: '💕 Love & Confession',
    items: [
      { text: '我爱你！', color: '#FF2D55' },
      { text: '❤️❤️❤️', color: '#FF3B30' },
      { text: '喜欢你！', color: '#FF2D55' },
      { text: '想你了~', color: '#FF9500' },
      { text: '你是我的唯一', color: '#FF2D55' },
      { text: '在一起！', color: '#FF3B30' },
      { text: '么么哒~', color: '#FF2D55' },
      { text: '永远爱你', color: '#FF3B30' }
    ]
  },
  festival: {
    name: '🎉 节日祝福',
    zhName: '🎉 节日祝福',
    enName: '🎉 Festival Greetings',
    items: [
      { text: '新年快乐！', color: '#FF3B30' },
      { text: '恭喜发财！', color: '#FFCC00' },
      { text: '万事如意！', color: '#FF3B30' },
      { text: '生日快乐！', color: '#FF2D55' },
      { text: '中秋快乐！', color: '#FF9500' },
      { text: '阖家团圆！', color: '#FFCC00' },
      { text: '节日快乐！', color: '#34C759' },
      { text: '幸福安康！', color: '#FF3B30' }
    ]
  },
  funny: {
    name: '😂 搞笑趣味',
    zhName: '😂 搞笑趣味',
    enName: '😂 Funny & Fun',
    items: [
      { text: '哈哈哈！', color: '#FFCC00' },
      { text: '太搞笑了！', color: '#FF9500' },
      { text: '笑死我了！', color: '#34C759' },
      { text: '666666', color: '#007AFF' },
      { text: '秀！', color: '#FF9500' },
      { text: '前方高能！', color: '#FF3B30' },
      { text: '弹幕护体！', color: '#FFCC00' },
      { text: '名场面！', color: '#007AFF' }
    ]
  },
  concert: {
    name: '🎵 演唱会',
    zhName: '🎵 演唱会',
    enName: '🎵 Concert',
    items: [
      { text: '安可！安可！', color: '#FF2D55' },
      { text: '再来一首！', color: '#007AFF' },
      { text: '好听！', color: '#34C759' },
      { text: '太震撼了！', color: '#FF9500' },
      { text: '泪目了...', color: '#007AFF' },
      { text: '神仙现场！', color: '#FF2D55' },
      { text: 'encore！', color: '#FFCC00' },
      { text: '绝了！', color: '#FF3B30' }
    ]
  }
}

Page({
  data: {
    i18n: {},
    inputText: '',
    colors: [
      { name: '白', zhName: '白', enName: 'White', value: '#FFFFFF' },
      { name: '红', zhName: '红', enName: 'Red', value: '#FF3B30' },
      { name: '黄', zhName: '黄', enName: 'Yellow', value: '#FFCC00' },
      { name: '绿', zhName: '绿', enName: 'Green', value: '#34C759' },
      { name: '蓝', zhName: '蓝', enName: 'Blue', value: '#007AFF' },
      { name: '粉', zhName: '粉', enName: 'Pink', value: '#FF2D55' },
      { name: '橙', zhName: '橙', enName: 'Orange', value: '#FF9500' }
    ],
    selectedColor: '#FFFFFF',
    selectedColorIndex: 0,
    speeds: [
      { name: '极慢', zhName: '极慢', enName: 'Very Slow', value: 18 },
      { name: '慢速', zhName: '慢速', enName: 'Slow', value: 12 },
      { name: '正常', zhName: '正常', enName: 'Normal', value: 8 },
      { name: '快速', zhName: '快速', enName: 'Fast', value: 5 },
      { name: '极速', zhName: '极速', enName: 'Very Fast', value: 3 }
    ],
    selectedSpeed: 8,
    selectedSpeedIndex: 2,
    fontSizes: [
      { name: '小', zhName: '小', enName: 'Small', value: 0.12 },
      { name: '中', zhName: '中', enName: 'Medium', value: 0.25 },
      { name: '大', zhName: '大', enName: 'Large', value: 0.45 },
      { name: '超大', zhName: '超大', enName: 'Extra Large', value: 0.7 }
    ],
    selectedFontSizeRatio: 0.25,
    selectedFontSizeIndex: 1,
    isFullScreen: false,
    danmakuList: [],
    historyList: [],
    landscapeWidth: 0,
    landscapeHeight: 0,

    templateCategories: [
      { key: 'cheer', name: '📣 应援', zhName: '📣 应援', enName: '📣 Cheer', icon: '📣' },
      { key: 'love', name: '💕 表白', zhName: '💕 表白', enName: '💕 Love', icon: '💕' },
      { key: 'festival', name: '🎉 节日', zhName: '🎉 节日', enName: '🎉 Festival', icon: '🎉' },
      { key: 'funny', name: '😂 搞笑', zhName: '😂 搞笑', enName: '😂 Funny', icon: '😂' },
      { key: 'concert', name: '🎵 演唱会', zhName: '🎵 演唱会', enName: '🎵 Concert', icon: '🎵' }
    ],
    selectedTemplateKey: '',
    templateItems: [],
    showTemplates: false,
    multiLineMode: false,
    multiLineCount: 3,
    multiLineCounts: [],
    multiLineMaxLines: 5,

    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('手持弹幕')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('danmaku') })
    this._updateI18nData()

    var sysInfo = wx.getSystemInfoSync()
    var lh = sysInfo.windowWidth
    var lw = sysInfo.windowHeight
    this.setData({
      landscapeWidth: lw,
      landscapeHeight: lh
    })
    this._updateMultiLineOptions()
    this.loadHistory()
    poster.setupForPage(this, 32)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('danmaku') })
    this._updateI18nData()
  },

  onHide: function() {
    if (_templateTimer) {
      clearTimeout(_templateTimer)
      _templateTimer = null
    }
  },

  onInputText: function (e) {
    this.setData({ inputText: e.detail.value })
  },

  onSelectColor: function (e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      selectedColor: this.data.colors[index].value,
      selectedColorIndex: index
    })
  },

  onSelectSpeed: function (e) {
    var index = e.currentTarget.dataset.index
    this.setData({
      selectedSpeed: this.data.speeds[index].value,
      selectedSpeedIndex: index
    })
  },

  onSelectFontSize: function (e) {
    var index = e.currentTarget.dataset.index
    var ratio = this.data.fontSizes[index].value
    _trackLastUsed = {}
    this.setData({
      selectedFontSizeRatio: ratio,
      selectedFontSizeIndex: index
    })
    // 字体变化后更新多行弹幕可用选项
    this._updateMultiLineOptions()
  },

  getFontSize: function () {
    return Math.round(this.data.landscapeHeight * this.data.selectedFontSizeRatio)
  },

  // 根据字体大小和屏幕高度，动态计算轨道布局
  _getTrackLayout: function() {
    var fontSize = this.getFontSize()
    var screenHeight = this.data.landscapeHeight
    if (!screenHeight || screenHeight <= 0) {
      return { count: 1, positions: [50] }
    }
    // 每条轨道需要的垂直空间：字体高度 + 30%间距
    var trackHeight = fontSize * 1.3
    // 上下边距各留半个字体高度
    var margin = fontSize * 0.5
    var usableHeight = screenHeight - margin * 2

    var count = Math.floor(usableHeight / trackHeight)
    count = Math.max(1, Math.min(count, 8))

    var positions = []
    var totalUsed = count * trackHeight
    var startY = (screenHeight - totalUsed) / 2
    for (var i = 0; i < count; i++) {
      var y = startY + (i + 0.5) * trackHeight
      positions.push(Math.round(y / screenHeight * 1000) / 10)
    }

    return { count: count, positions: positions }
  },

  // 根据当前字体大小，计算可用的多行选项
  _getAvailableMultiLineCounts: function() {
    var layout = this._getTrackLayout()
    var maxLines = layout.count
    var counts = []
    for (var i = 2; i <= 5; i++) {
      if (i <= maxLines) {
        counts.push({ value: i, available: true })
      } else {
        counts.push({ value: i, available: false })
      }
    }
    return { counts: counts, maxLines: maxLines }
  },

  // 更新多行弹幕的可用选项
  _updateMultiLineOptions: function() {
    var result = this._getAvailableMultiLineCounts()
    var updateData = {
      multiLineCounts: result.counts,
      multiLineMaxLines: result.maxLines
    }
    // 如果当前选择的行数超过最大可用行数，自动调整
    if (this.data.multiLineCount > result.maxLines) {
      updateData.multiLineCount = result.maxLines
    }
    this.setData(updateData)
  },

  // 根据当前语言更新数据中的name字段
  _updateI18nData: function() {
    var lang = i18n.getLanguage()
    var isEn = lang === 'en'
    var colors = this.data.colors
    var speeds = this.data.speeds
    var fontSizes = this.data.fontSizes
    var templateCategories = this.data.templateCategories
    var updateData = {}

    var newColors = []
    for (var i = 0; i < colors.length; i++) {
      newColors.push({
        name: isEn ? colors[i].enName : colors[i].zhName,
        zhName: colors[i].zhName,
        enName: colors[i].enName,
        value: colors[i].value
      })
    }
    updateData.colors = newColors

    var newSpeeds = []
    for (var i = 0; i < speeds.length; i++) {
      newSpeeds.push({
        name: isEn ? speeds[i].enName : speeds[i].zhName,
        zhName: speeds[i].zhName,
        enName: speeds[i].enName,
        value: speeds[i].value
      })
    }
    updateData.speeds = newSpeeds

    var newFontSizes = []
    for (var i = 0; i < fontSizes.length; i++) {
      newFontSizes.push({
        name: isEn ? fontSizes[i].enName : fontSizes[i].zhName,
        zhName: fontSizes[i].zhName,
        enName: fontSizes[i].enName,
        value: fontSizes[i].value
      })
    }
    updateData.fontSizes = newFontSizes

    var newCategories = []
    for (var i = 0; i < templateCategories.length; i++) {
      newCategories.push({
        key: templateCategories[i].key,
        name: isEn ? templateCategories[i].enName : templateCategories[i].zhName,
        zhName: templateCategories[i].zhName,
        enName: templateCategories[i].enName,
        icon: templateCategories[i].icon
      })
    }
    updateData.templateCategories = newCategories

    this.setData(updateData)
  },

  // 获取一个可用轨道（选择最久未使用的）
  _getAvailableTrack: function() {
    var layout = this._getTrackLayout()
    var now = Date.now()
    var bestTrack = 0
    var oldestTime = Infinity

    for (var i = 0; i < layout.count; i++) {
      var lastUsed = _trackLastUsed[i] || 0
      if (lastUsed < oldestTime) {
        oldestTime = lastUsed
        bestTrack = i
      }
    }

    _trackLastUsed[bestTrack] = now
    return { index: bestTrack, topPercent: layout.positions[bestTrack] }
  },

  toggleTemplates: function() {
    this.setData({ showTemplates: !this.data.showTemplates })
  },

  selectTemplateCategory: function(e) {
    var key = e.currentTarget.dataset.key
    var tpl = TEMPLATES[key]
    if (!tpl) return
    this.setData({
      selectedTemplateKey: key,
      templateItems: tpl.items
    })
  },

  useTemplateItem: function(e) {
    var index = e.currentTarget.dataset.index
    var item = this.data.templateItems[index]
    if (!item) return
    wx.vibrateShort({ type: 'light' })
    var colorIndex = 0
    var colors = this.data.colors
    for (var i = 0; i < colors.length; i++) {
      if (colors[i].value === item.color) {
        colorIndex = i
        break
      }
    }
    this.setData({
      inputText: item.text,
      selectedColor: item.color,
      selectedColorIndex: colorIndex
    })
    wx.showToast({ title: this.data.i18n.filled, icon: 'success', duration: 800 })
  },

  sendTemplateBarrage: function() {
    var items = this.data.templateItems
    if (!items || items.length === 0) {
      wx.showToast({ title: this.data.i18n.selectTemplateFirst, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'medium' })

    var that = this
    var sendCount = Math.min(items.length, 8)
    // 等一条弹幕完全滚过屏幕再发下一条：间隔 = 弹幕动画时长
    var baseDuration = this.data.selectedSpeed

    // 清除之前的定时器
    if (_templateTimer) {
      clearTimeout(_templateTimer)
      _templateTimer = null
    }

    var sendIndex = 0
    function sendNext() {
      if (sendIndex >= sendCount) {
        _templateTimer = null
        return
      }
      var item = items[sendIndex]
      var track = that._getAvailableTrack()
      var duration = baseDuration + Math.random() * 1.5
      var danmakuId = 'dm_' + Date.now() + '_' + sendIndex + '_' + Math.floor(Math.random() * 10000)
      var danmaku = {
        id: danmakuId,
        text: item.text,
        color: item.color,
        fontSize: that.getFontSize(),
        duration: duration,
        trackIndex: track.index,
        topPercent: track.topPercent,
        show: true
      }
      var newList = that.data.danmakuList.concat([danmaku])
      that.setData({ danmakuList: newList })
      that.saveToHistory(item.text, item.color)
      sendIndex++
      if (sendIndex < sendCount) {
        // 间隔 = 当前弹幕的动画时长，确保它完全滚过屏幕
        _templateTimer = setTimeout(sendNext, duration * 1000)
      } else {
        _templateTimer = null
      }
    }

    sendNext()
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(32, '手持弹幕', false)
  },

  toggleMultiLine: function() {
    var newMode = !this.data.multiLineMode
    if (newMode) {
      var layout = this._getTrackLayout()
      if (layout.count < 2) {
        wx.showToast({
          title: this.data.i18n.fontTooLargeMultiLine,
          icon: 'none',
          duration: 2000
        })
        return
      }
      this._updateMultiLineOptions()
    }
    this.setData({ multiLineMode: newMode })
  },

  selectMultiLineCount: function(e) {
    var count = e.currentTarget.dataset.value
    var available = e.currentTarget.dataset.available
    if (!available) {
      wx.showToast({
        title: this.data.i18n.fontTooLargeMaxLines + this.data.multiLineMaxLines + this.data.i18n.fontTooLargeMaxLinesSuffix,
        icon: 'none',
        duration: 1500
      })
      return
    }
    this.setData({ multiLineCount: count })
  },

  sendDanmaku: function () {
    var text = this.data.inputText.trim()
    if (!text) {
      wx.showToast({ title: this.data.i18n.inputDanmakuContent, icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'light' })

    if (this.data.multiLineMode && this.data.multiLineCount > 1) {
      this._sendMultiLine(text, this.data.selectedColor)
    } else {
      this._sendSingle(text, this.data.selectedColor)
    }

    this.saveToHistory(text, this.data.selectedColor)

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(32, '手持弹幕', false)

    this.setData({ inputText: '' })
  },

  _sendSingle: function(text, color) {
    var track = this._getAvailableTrack()
    var danmakuId = 'dm_' + Date.now() + '_' + Math.floor(Math.random() * 10000)
    var danmaku = {
      id: danmakuId,
      text: text,
      color: color,
      fontSize: this.getFontSize(),
      duration: this.data.selectedSpeed,
      trackIndex: track.index,
      topPercent: track.topPercent,
      show: true
    }

    var newList = this.data.danmakuList.concat([danmaku])
    this.setData({ danmakuList: newList })
  },

  _sendMultiLine: function(text, color) {
    var lineCount = this.data.multiLineCount
    var layout = this._getTrackLayout()

    // 智能检验：请求行数超过可用轨道数，提示用户
    if (lineCount > layout.count) {
      wx.showToast({
        title: this.data.i18n.fontTooLargeMaxLinesDanmaku + layout.count + this.data.i18n.fontTooLargeMaxLinesDanmakuSuffix,
        icon: 'none',
        duration: 2000
      })
      lineCount = layout.count
    }

    var newList = this.data.danmakuList.slice()
    // 每行分配不同轨道，确保不重叠
    for (var i = 0; i < lineCount; i++) {
      var danmakuId = 'dm_' + Date.now() + '_' + i + '_' + Math.floor(Math.random() * 10000)
      var danmaku = {
        id: danmakuId,
        text: text,
        color: color,
        fontSize: this.getFontSize(),
        duration: this.data.selectedSpeed + Math.random() * 1.5,
        trackIndex: i,
        topPercent: layout.positions[i],
        show: true
      }
      _trackLastUsed[i] = Date.now()
      newList.push(danmaku)
    }
    this.setData({ danmakuList: newList })
  },

  enterFullScreen: function () {
    if (this.data.danmakuList.length === 0) {
      wx.showToast({ title: this.data.i18n.sendDanmakuFirst, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'medium' })
    this.setData({ isFullScreen: true })
  },

  exitFullScreen: function () {
    _trackLastUsed = {}
    if (_templateTimer) {
      clearTimeout(_templateTimer)
      _templateTimer = null
    }
    this.setData({
      isFullScreen: false,
      danmakuList: []
    })
  },

  sendAndFullScreen: function () {
    var text = this.data.inputText.trim()
    if (!text) {
      wx.showToast({ title: this.data.i18n.inputDanmakuContent, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })

    if (this.data.multiLineMode && this.data.multiLineCount > 1) {
      this._sendMultiLine(text, this.data.selectedColor)
    } else {
      this._sendSingle(text, this.data.selectedColor)
    }

    this.saveToHistory(text, this.data.selectedColor)
    this.setData({ inputText: '', isFullScreen: true })
  },

  saveToHistory: function (text, color) {
    var history = this.data.historyList
    var exists = false
    for (var i = 0; i < history.length; i++) {
      if (history[i].text === text && history[i].color === color) {
        history[i].time = Date.now()
        exists = true
        break
      }
    }
    if (!exists) {
      history.unshift({
        text: text,
        color: color,
        time: Date.now()
      })
    }
    if (history.length > 20) {
      history = history.slice(0, 20)
    }
    this.setData({ historyList: history })
    this.saveHistory()
  },

  loadHistory: function () {
    try {
      var history = storageUtil.safeGetArray('danmaku_history')
      this.setData({ historyList: history })
    } catch (e) {
      logger.log('加载弹幕历史失败:', e)
    }
  },

  saveHistory: function () {
    try {
      wx.setStorageSync('danmaku_history', this.data.historyList)
    } catch (e) {
      logger.log('保存弹幕历史失败:', e)
    }
  },

  useHistoryItem: function (e) {
    var index = e.currentTarget.dataset.index
    var item = this.data.historyList[index]
    this.setData({
      inputText: item.text,
      selectedColor: item.color
    })
    var colorIndex = 0
    var colors = this.data.colors
    for (var i = 0; i < colors.length; i++) {
      if (colors[i].value === item.color) {
        colorIndex = i
        break
      }
    }
    this.setData({ selectedColorIndex: colorIndex })
    wx.showToast({ title: this.data.i18n.filled, icon: 'success', duration: 1000 })
  },

  clearHistory: function () {
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmClear,
      content: that.data.i18n.confirmClearDanmaku,
      confirmColor: '#EF4444',
      success: function (res) {
        if (res.confirm) {
          that.setData({ historyList: [] })
          try {
            wx.removeStorageSync('danmaku_history')
          } catch (e) {
            logger.log('清空历史失败:', e)
          }
          wx.showToast({ title: that.data.i18n.cleared, icon: 'success' })
        }
      }
    })
  },

  copyResult: function() {
    var text = this.data.inputText || this.data.danmakuList.length > 0 ? this.data.inputText : ''
    if (!text && this.data.danmakuList.length > 0) {
      text = this.data.danmakuList[this.data.danmakuList.length - 1].text
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      _trackLastUsed = {}
      if (_templateTimer) {
        clearTimeout(_templateTimer)
        _templateTimer = null
      }
      that.setData({
        inputText: '',
        danmakuList: [],
        selectedTemplateKey: '',
        templateItems: [],
        showTemplates: false,
        multiLineMode: false,
        multiLineCount: 3
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🎬 手持弹幕 - 百宝工具箱', '/package-life/danmaku/danmaku')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('🎬 手持弹幕 - 百宝工具箱')
  }
})
