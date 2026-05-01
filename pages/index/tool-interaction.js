/**
 * 工具交互模块
 * 包含：工具点击、收藏、长按菜单、使用统计、最近使用记录等
 */

const { urlMap } = require('./config')

module.exports = {
  onToolClick(e) {
    const tool = e.currentTarget.dataset.tool

    wx.vibrateShort({ type: 'light' })

    this.saveRecentTool(tool)
    this.recordWeeklyUsage()

    const url = urlMap[tool.id]

    if (url) {
      wx.navigateTo({
        url,
        fail: (err) => {
          console.log('跳转失败:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '功能开发中...',
        icon: 'none',
        duration: 1500
      })
    }
  },

  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id
    const tools = this.data.tools.map(tool => {
      const t = { ...tool }
      if (t.id === id) {
        t.isFavorite = !t.isFavorite
      }
      return t
    })

    const favorites = tools.filter(tool => tool.isFavorite).map(tool => tool.id)
    wx.setStorageSync('favorites', favorites)

    wx.vibrateShort({ type: 'light' })

    this.setData({ tools })
    this.filterTools()

    if (favorites.includes(id)) {
      this.showHeartAnimation()
    }
  },

  onToolLongPress(e) {
    wx.vibrateShort({ type: 'medium' })
    const tool = e.currentTarget.dataset.tool
    this.setData({
      showMenu: true,
      menuTool: tool
    })
  },

  closeMenu() {
    this.setData({
      showMenu: false,
      menuTool: null
    })
  },

  showHeartAnimation() {
    this.setData({ showHeart: true })
    setTimeout(() => {
      this.setData({ showHeart: false })
    }, 800)
  },

  recordWeeklyUsage() {
    const today = new Date()
    const y = today.getFullYear()
    const mo = today.getMonth() + 1
    const d = today.getDate()
    const moStr = mo < 10 ? `0${mo}` : `${mo}`
    const dStr = d < 10 ? `0${d}` : `${d}`
    const dateKey = `${y}-${moStr}-${dStr}`

    let weeklyRecord = wx.getStorageSync('weeklyUsage') || {}
    weeklyRecord[dateKey] = (weeklyRecord[dateKey] || 0) + 1

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)

    Object.keys(weeklyRecord).forEach(key => {
      const [ky, km, kd] = key.split('-').map(Number)
      const kdDate = new Date(ky, km - 1, kd)
      if (kdDate < oneWeekAgo) {
        delete weeklyRecord[key]
      }
    })

    wx.setStorageSync('weeklyUsage', weeklyRecord)
  },

  saveRecentTool(tool) {
    let recentTools = wx.getStorageSync('recentTools') || []
    recentTools = recentTools.filter(t => t.id !== tool.id)

    recentTools.unshift({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      iconBg: tool.iconBg,
      usedAt: new Date().getTime()
    })

    if (recentTools.length > 20) recentTools = recentTools.slice(0, 20)
    wx.setStorageSync('recentTools', recentTools)

    let currentCount = wx.getStorageSync('totalUsageCount') || 0
    wx.setStorageSync('totalUsageCount', currentCount + 1)

    const appInstance = getApp()
    if (appInstance.cloudSyncUsage) {
      appInstance.cloudSyncUsage(tool.id, tool.name)
    }
  },

  showMoreMenu() {
    wx.showActionSheet({
      itemList: ['关于我们', '意见反馈', '分享给朋友'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.showToast({ title: '百宝工具箱 v1.0', icon: 'none' })
            break
          case 1:
            wx.showToast({ title: '感谢您的反馈！', icon: 'none' })
            break
          case 2:
            break
        }
      }
    })
  }
}
