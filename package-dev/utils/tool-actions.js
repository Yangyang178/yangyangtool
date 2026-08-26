var toolActions = {
  vibrate: function(type) {
    try { wx.vibrateShort({ type: type || 'light' }) } catch(e) {}
  },

  copyText: function(text, label, i18n) {
    var noResultMsg = (i18n && i18n.noResultToCopy) || '暂无结果可复制'
    var copiedMsg = (i18n && i18n.copied) || '已复制'
    if (text === undefined || text === null || text === '') {
      wx.showToast({ title: noResultMsg, icon: 'none' })
      return
    }
    text = String(text)
    if (!text.trim() || text === '-') {
      wx.showToast({ title: noResultMsg, icon: 'none' })
      return
    }
    toolActions.vibrate('light')
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: label || copiedMsg, icon: 'success' })
      }
    })
  },

  resetConfirm: function(callback, i18n) {
    toolActions.vibrate('light')
    var title = (i18n && i18n.confirmResetTitle) || '确认重置'
    var content = (i18n && i18n.confirmResetContent) || '确定要清空所有输入和结果吗？'
    wx.showModal({
      title: title,
      content: content,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm && typeof callback === 'function') callback()
      }
    })
  }
}

module.exports = toolActions
