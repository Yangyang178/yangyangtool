var app = getApp()
var storageUtil = require('../utils/storage.js')
var points = require('../utils/points.js')
var i18n = require('../utils/i18n.js')

var _toolActions = {
  vibrate: function(type) {
    try { wx.vibrateShort({ type: type || 'light' }) } catch(e) {}
  },
  copyText: function(text, label) {
    if (text === undefined || text === null || text === '') {
      wx.showToast({ title: '暂无结果可复制', icon: 'none' })
      return
    }
    text = String(text)
    if (!text.trim() || text === '-') {
      wx.showToast({ title: '暂无结果可复制', icon: 'none' })
      return
    }
    _toolActions.vibrate('light')
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: label || '已复制', icon: 'success' })
      }
    })
  },
  resetConfirm: function(callback) {
    _toolActions.vibrate('light')
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有输入和结果吗？',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm && typeof callback === 'function') callback()
      }
    })
  }
}

Page({
  data: {
    i18n: {},
    toolTitle: '工具名称',
    toolDesc: '工具描述，一句话说明用途',
    toolIcon: '🔧',
    iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    badge: '',

    inputValue: '',
    resultValue: '',
    resultLabel: '',
    detail1: '',
    detail2: '',

    actionButtons: [
      { type: 'primary', text: '复制结果', icon: '📋', bindtap: 'copyResult' },
      { type: 'secondary', text: '清空重置', icon: '🔄', bindtap: 'resetData' }
    ],

    tipList: [
      '提示1：使用说明第一条',
      '提示2：使用说明第二条'
    ]
  },

  onLoad: function() {
    this.applyDarkMode()
    this.setData({ i18n: i18n.getToolPageTexts('toolTemplate') })
  },

  onShow: function() {
    this.applyDarkMode()
  },

  applyDarkMode: function() {
    var isDark = storageUtil.get('darkMode') || false
    this.setData({ isDarkMode: isDark })
  },

  onInput: function(e) {
    this.setData({ inputValue: e.detail.value })
    this.calculate()
  },

  calculate: function() {
    var val = this.data.inputValue
    
    if (!val || !val.trim()) {
      this.setData({
        resultValue: '-',
        resultLabel: '请输入内容',
        detail1: '',
        detail2: ''
      })
      return
    }

    var result = val

    this.setData({
      resultValue: result,
      resultLabel: '计算结果',
      detail1: '详情1: ' + result.length + ' 字符',
      detail2: '详情2: 示例数据'
    })
  },

  copyResult: function() {
    _toolActions.copyText(this.data.resultValue)
  },

  resetData: function() {
    var that = this
    _toolActions.resetConfirm(function() {
      that.setData({
        inputValue: '',
        resultValue: '-',
        resultLabel: '请输入内容',
        detail1: '',
        detail2: ''
      })
    })
  },

  onShareAppMessage: function() {
    try {
      var taskInfo = points.getDailyTasks()
      var shareTaskCompleted = false
      for (var i = 0; i < taskInfo.tasks.length; i++) {
        if (taskInfo.tasks[i].id === 'share_once' && taskInfo.tasks[i].completed) {
          shareTaskCompleted = true
          break
        }
      }
      if (!shareTaskCompleted) {
        points.recordShare()
      }
    } catch(e) {}
    return {
      title: this.data.toolTitle + ' - 百宝工具箱',
      path: '/pages/index/index'
    }
  },
  onShareTimeline: function() {
    try {
      var taskInfo = points.getDailyTasks()
      var shareTaskCompleted = false
      for (var i = 0; i < taskInfo.tasks.length; i++) {
        if (taskInfo.tasks[i].id === 'share_once' && taskInfo.tasks[i].completed) {
          shareTaskCompleted = true
          break
        }
      }
      if (!shareTaskCompleted) {
        points.recordShare()
      }
    } catch(e) {}
    return {
      title: this.data.toolTitle + ' - 百宝工具箱'
    }
  }
})
