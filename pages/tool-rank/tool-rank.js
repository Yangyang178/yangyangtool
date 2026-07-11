var i18n = require('../../utils/i18n.js')
var storageUtil = require('../../utils/storage.js')
var toolsData = require('../../data/tools.js')

Page({
  data: {
    rankType: 'today',
    rankList: [],
    isLoading: true,
    isDarkMode: false,
    i18n: {}
  },

  onLoad: function() {
    this._applyTheme()
    this._applyI18n()
    this.loadRank()
  },

  onShow: function() {
    this._applyTheme()
    this._applyI18n()
  },

  _applyTheme: function() {
    var isDark = storageUtil.get('darkMode') === true
    var setting = storageUtil.get('darkModeSetting', 'system')
    if (setting === 'system') {
      try { isDark = wx.getSystemInfoSync().theme === 'dark' } catch(e) {}
    } else if (setting === 'light') {
      isDark = false
    }
    this.setData({ isDarkMode: isDark })
  },

  _applyI18n: function() {
    this.setData({ i18n: i18n.getAllTexts() })
  },

  loadRank: function() {
    var that = this
    this.setData({ isLoading: true })
    try {
      wx.cloud.callFunction({
        name: 'toolRank',
        data: {
          action: 'getRank',
          type: that.data.rankType,
          limit: 10
        },
        success: function(res) {
          if (res.result && res.result.success) {
            var list = res.result.rankList || []
            // 用 toolId 查找翻译后的工具名和图标
            for (var k = 0; k < list.length; k++) {
              var toolObj = toolsData.getToolById(list[k].toolId)
              if (toolObj) {
                list[k].toolName = i18n.getToolName(list[k].toolId, list[k].toolName)
                list[k].toolIcon = toolObj.icon || list[k].toolIcon
              }
            }
            // 计算百分比进度条
            var maxUses = 1
            for (var i = 0; i < list.length; i++) {
              var uses = that.data.rankType === 'today' ? list[i].todayUses : list[i].totalUses
              if (uses > maxUses) maxUses = uses
            }
            for (var j = 0; j < list.length; j++) {
              var uses2 = that.data.rankType === 'today' ? list[j].todayUses : list[j].totalUses
              list[j].percent = Math.round((uses2 / maxUses) * 100)
            }
            that.setData({ rankList: list, isLoading: false })
          } else {
            that.setData({ rankList: [], isLoading: false })
          }
        },
        fail: function() {
          that.setData({ rankList: [], isLoading: false })
        }
      })
    } catch(e) {
      this.setData({ isLoading: false })
    }
  },

  switchRankType: function(e) {
    var type = e.currentTarget.dataset.type
    if (type === this.data.rankType) return
    this.setData({ rankType: type })
    this.loadRank()
  }
})
