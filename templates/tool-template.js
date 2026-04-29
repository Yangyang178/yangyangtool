var app = getApp()

Page({
  data: {
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
  },

  onShow: function() {
    this.applyDarkMode()
  },

  applyDarkMode: function() {
    var isDark = wx.getStorageSync('darkMode') || false
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
    wx.vibrateShort({ type: 'light' })
    
    var text = String(this.data.resultValue)
    if (text === '-' || text === '') {
      wx.showToast({ title: '\u6682\u65E0\u7ED3\u679C\u53EF\u590D\u5236', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: '\u5DF2\u590D\u5236', icon: 'success' })
      }
    })

    if (app && app.cloudSyncUsage) {
      app.cloudSyncUsage(0, this.data.toolTitle)
    }
  },

  resetData: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputValue: '',
      resultValue: '-',
      resultLabel: '请输入内容',
      detail1: '',
      detail2: ''
    })
  },

  onShareAppMessage: function() {
    return {
      title: '\uD83C\uDFE0 ' + this.data.toolTitle + ' - \u597D\u7528\u65B9\u4FBF\u7684\u5DE5\u5177\u96C6',
      path: '/pages/index/index'
    }
  },
  onShareTimeline: function() {
    return {
      title: '\uD83C\uDFE0 ' + this.data.toolTitle
    }
  }
})
