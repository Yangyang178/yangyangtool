var i18n = require('../utils/i18n.js')
var storageUtil = require('../utils/storage.js')

Component({
  data: {
    selected: 0,
    isDarkMode: false,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '',
        icon: '/images/tab-tools.png',
        selectedIcon: '/images/tab-tools-active.png'
      },
      {
        pagePath: '/pages/favorites/favorites',
        text: '',
        icon: '/images/tab-fav.png',
        selectedIcon: '/images/tab-fav-active.png'
      },
      {
        pagePath: '/pages/recent/recent',
        text: '',
        icon: '/images/tab-recent.png',
        selectedIcon: '/images/tab-recent-active.png'
      }
    ]
  },

  lifetimes: {
    attached: function() {
      this._updateTexts()
    }
  },

  pageLifetimes: {
    show: function() {
      this._updateTexts()
    }
  },

  methods: {
    _updateTexts: function() {
      var app = getApp()
      var isDark = app.globalData.isDarkMode || false
      var texts = i18n.getAllTexts()
      var list = this.data.list.slice()
      list[0].text = texts.tabTools || '工具集'
      list[1].text = texts.tabFavorites || '收藏夹'
      list[2].text = texts.tabProfile || '我的'
      this.setData({ list: list, isDarkMode: isDark })
    },

    switchTab: function(e) {
      var index = e.currentTarget.dataset.index
      var url = this.data.list[index].pagePath
      wx.switchTab({ url: url })
    }
  }
})