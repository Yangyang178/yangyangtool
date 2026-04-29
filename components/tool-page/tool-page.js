Component({
  properties: {
    title: { type: String, value: '工具' },
    desc: { type: String, value: '' },
    icon: { type: String, value: '' },
    iconBg: { type: String, value: '' },
    badge: { type: String, value: '' },
    showHeader: { type: Boolean, value: true },
    navColor: { type: String, value: 'black' },
    navBg: { type: String, value: '#F8FAFC' },
    actions: { type: Array, value: [] },
    tips: { type: Array, value: [] },
    tipsTitle: { type: String, value: '' }
  },

  data: {
    isDarkMode: false
  },

  lifetimes: {
    attached: function() {
      var isDark = wx.getStorageSync('darkMode') || false
      this.setData({ isDarkMode: isDark })
    }
  },

  methods: {}
})
