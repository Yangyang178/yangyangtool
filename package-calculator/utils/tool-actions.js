var toolActions = {
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
    toolActions.vibrate('light')
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: label || '已复制', icon: 'success' })
      }
    })
  },

  resetConfirm: function(callback) {
    toolActions.vibrate('light')
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

module.exports = toolActions
