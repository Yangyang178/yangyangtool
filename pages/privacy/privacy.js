var app = getApp()
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    isDarkMode: false,
    fontSizeSetting: 'medium',
    i18n: {}
  },

  onLoad: function() {
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false,
      fontSizeSetting: app.globalData.fontSizeSetting || 'medium',
      i18n: i18n.getToolPageTexts('privacyPage')
    })
  },

  onShow: function() {
    if (this.data.isDarkMode !== app.globalData.isDarkMode) {
      this.setData({ isDarkMode: app.globalData.isDarkMode })
    }
  }
})
