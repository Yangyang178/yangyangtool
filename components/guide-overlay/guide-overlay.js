var i18n = require('../../utils/i18n.js')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    current: 0,
    i18n: {}
  },

  lifetimes: {
    attached: function() {
      var texts = i18n.getToolPageTexts('guideOverlay')
      this.setData({ i18n: texts })
    }
  },

  methods: {
    preventMove: function() {},

    onSwiperChange: function(e) {
      this.setData({ current: e.detail.current })
    },

    onNext: function() {
      var next = this.data.current + 1
      if (next < 7) {
        this.setData({ current: next })
      }
    },

    onSkip: function() {
      wx.setStorageSync('hasSeenGuide', true)
      wx.setStorageSync('guideVersion', 3)
      this.triggerEvent('close')
    },

    onStart: function() {
      wx.setStorageSync('hasSeenGuide', true)
      wx.setStorageSync('guideVersion', 3)
      this.triggerEvent('close')
    }
  }
})
