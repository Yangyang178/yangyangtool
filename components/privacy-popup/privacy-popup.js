var i18n = require('../../utils/i18n.js')

Component({
  data: {
    showPrivacy: false,
    i18n: {}
  },

  _resolvePrivacyAuthorization: null,
  _privacyEvent: null,
  _onNeedPrivacyHandler: null,

  lifetimes: {
    attached: function() {
      var that = this
      var texts = i18n.getToolPageTexts('privacyPopup')
      that.setData({ i18n: texts })

      that._onNeedPrivacyHandler = function(resolve, event) {
        that._resolvePrivacyAuthorization = resolve
        that._privacyEvent = event
        that.setData({ showPrivacy: true })
      }

      if (wx.onNeedPrivacyAuthorization) {
        wx.onNeedPrivacyAuthorization(that._onNeedPrivacyHandler)
      }
    },

    detached: function() {
      if (wx.offNeedPrivacyAuthorization && this._onNeedPrivacyHandler) {
        wx.offNeedPrivacyAuthorization(this._onNeedPrivacyHandler)
      }
      this._resolvePrivacyAuthorization = null
      this._privacyEvent = null
      this._onNeedPrivacyHandler = null
    }
  },

  methods: {
    agreePrivacy: function() {
      this.setData({ showPrivacy: false })

      if (this._resolvePrivacyAuthorization) {
        this._resolvePrivacyAuthorization({ buttonId: 'agree-btn', event: this._privacyEvent })
        this._resolvePrivacyAuthorization = null
        this._privacyEvent = null
      }

      var pages = getCurrentPages()
      if (pages.length > 0) {
        var page = pages[pages.length - 1]
        if (page && typeof page.onPrivacyAgreed === 'function') {
          page.onPrivacyAgreed()
        }
      }
    },

    disagreePrivacy: function() {
      this.setData({ showPrivacy: false })

      if (this._resolvePrivacyAuthorization) {
        this._resolvePrivacyAuthorization({ event: this._privacyEvent })
        this._resolvePrivacyAuthorization = null
        this._privacyEvent = null
      }
    },

    openPrivacyPage: function() {
      wx.navigateTo({ url: '/pages/privacy/privacy' })
    }
  }
})
