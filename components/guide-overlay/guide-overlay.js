Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    current: 0
  },

  methods: {
    preventMove: function() {},

    onSwiperChange: function(e) {
      this.setData({ current: e.detail.current })
    },

    onNext: function() {
      var next = this.data.current + 1
      if (next < 4) {
        this.setData({ current: next })
      }
    },

    onSkip: function() {
      wx.setStorageSync('hasSeenGuide', true)
      this.triggerEvent('close')
    },

    onStart: function() {
      wx.setStorageSync('hasSeenGuide', true)
      this.triggerEvent('close')
    }
  }
})