const app = getApp()

Page({
  data: {
    recentTools: []
  },

  onLoad() {
    this.loadRecentTools()

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShow() {
    this.loadRecentTools()
  },

  loadRecentTools() {
    const recentTools = wx.getStorageSync('recentTools') || []
    
    const formattedTools = recentTools.map(tool => ({
      ...tool,
      timeText: this.formatTime(tool.usedAt)
    }))
    
    this.setData({ recentTools: formattedTools })
  },

  formatTime(timestamp) {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now - date
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  onToolClick(e) {
    const tool = e.currentTarget.dataset.tool
    wx.vibrateShort({ type: 'light' })
    
    wx.showModal({
      title: tool.name,
      content: '即将打开此工具',
      confirmText: '打开工具',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          console.log('打开工具:', tool.name)
          wx.showToast({
            title: '功能开发中...',
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },

  clearRecent() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有使用记录吗？',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('recentTools')
          this.setData({ recentTools: [] })
          
          wx.vibrateShort({ type: 'medium' })
          wx.showToast({
            title: '已清空记录',
            icon: 'success'
          })
        }
      }
    })
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage() {
    return {
      title: '🧰 百宝工具箱 - 最近使用的工具',
      path: '/pages/recent/recent',
      imageUrl: ''
    }
  },

  onShareTimeline() {
    return {
      title: '🧰 百宝工具箱 - 实用小工具合集',
      query: '',
      imageUrl: ''
    }
  }
})
