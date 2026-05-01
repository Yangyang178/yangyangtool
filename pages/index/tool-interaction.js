/**
 * 工具交互模块
 * 包含：工具点击、收藏、长按菜单、使用统计、最近使用记录等
 */

const { urlMap } = require('./config')

module.exports = {
  onToolClick(e) {
    try {
      const tool = e.currentTarget.dataset.tool

      if (!tool) {
        console.warn('[tool] onToolClick: tool 数据为空')
        return
      }

      wx.vibrateShort({ type: 'light' })

      if (typeof this.saveRecentTool === 'function') {
        this.saveRecentTool(tool)
      }
      if (typeof this.recordWeeklyUsage === 'function') {
        this.recordWeeklyUsage()
      }

      if (!urlMap) {
        console.error('[tool] urlMap 未定义')
        wx.showToast({
          title: '功能开发中...',
          icon: 'none',
          duration: 1500
        })
        return
      }

      const url = urlMap[tool.id]

      if (url) {
        wx.navigateTo({
          url: url,
          fail: function(err) {
            console.log('[tool] 跳转失败:', err)
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      } else {
        console.log('[tool] 未找到工具路由，id:', tool.id)
        wx.showToast({
          title: '功能开发中...',
          icon: 'none',
          duration: 1500
        })
      }
    } catch(e) {
      console.error('[tool] onToolClick error:', e)
    }
  },

  toggleFavorite(e) {
    try {
      const id = e.currentTarget.dataset.id

      if (!id) {
        console.warn('[tool] toggleFavorite: id 为空')
        return
      }

      const toolsData = this.data.tools || []
      const tools = []

      for (let i = 0; i < toolsData.length; i++) {
        const t = {}
        const sourceTool = toolsData[i]
        for (const key in sourceTool) {
          t[key] = sourceTool[key]
        }

        if (t.id === id) {
          t.isFavorite = !t.isFavorite
        }
        tools.push(t)
      }

      const favorites = []
      for (let j = 0; j < tools.length; j++) {
        if (tools[j].isFavorite) {
          favorites.push(tools[j].id)
        }
      }

      wx.setStorageSync('favorites', favorites)

      wx.vibrateShort({ type: 'light' })

      this.setData({ tools: tools })

      if (typeof this.filterTools === 'function') {
        this.filterTools()
      }

      let hasId = false
      for (let k = 0; k < favorites.length; k++) {
        if (favorites[k] === id) {
          hasId = true
          break
        }
      }

      if (hasId && typeof this.showHeartAnimation === 'function') {
        this.showHeartAnimation()
      }
    } catch(e) {
      console.error('[tool] toggleFavorite error:', e)
    }
  },

  onToolLongPress(e) {
    try {
      wx.vibrateShort({ type: 'medium' })
      const tool = e.currentTarget.dataset.tool
      this.setData({
        showMenu: true,
        menuTool: tool
      })
    } catch(e) {
      console.error('[tool] onToolLongPress error:', e)
    }
  },

  closeMenu() {
    try {
      this.setData({
        showMenu: false,
        menuTool: null
      })
    } catch(e) {
      console.error('[tool] closeMenu error:', e)
    }
  },

  showHeartAnimation() {
    try {
      this.setData({ showHeart: true })
      const that = this
      setTimeout(function() {
        that.setData({ showHeart: false })
      }, 800)
    } catch(e) {
      console.error('[tool] showHeartAnimation error:', e)
    }
  },

  recordWeeklyUsage() {
    try {
      const today = new Date()
      const y = today.getFullYear()
      const mo = today.getMonth() + 1
      const d = today.getDate()
      const moStr = mo < 10 ? ('0' + mo) : ('' + mo)
      const dStr = d < 10 ? ('0' + d) : ('' + d)
      const dateKey = y + '-' + moStr + '-' + dStr

      let weeklyRecord = wx.getStorageSync('weeklyUsage') || {}
      if (typeof weeklyRecord !== 'object' || Array.isArray(weeklyRecord)) {
        weeklyRecord = {}
      }

      weeklyRecord[dateKey] = (weeklyRecord[dateKey] || 0) + 1

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(today.getDate() - 7)

      const keysToRemove = []
      for (const key in weeklyRecord) {
        if (weeklyRecord.hasOwnProperty(key)) {
          const parts = key.split('-')
          if (parts.length === 3) {
            const ky = parseInt(parts[0], 10)
            const km = parseInt(parts[1], 10) - 1
            const kd = parseInt(parts[2], 10)
            const kdDate = new Date(ky, km, kd)
            if (kdDate < oneWeekAgo) {
              keysToRemove.push(key)
            }
          }
        }
      }

      for (let kr = 0; kr < keysToRemove.length; kr++) {
        delete weeklyRecord[keysToRemove[kr]]
      }

      wx.setStorageSync('weeklyUsage', weeklyRecord)
    } catch(e) {
      console.error('[tool] recordWeeklyUsage error:', e)
    }
  },

  saveRecentTool(tool) {
    try {
      if (!tool || !tool.id) {
        console.warn('[tool] saveRecentTool: tool 数据无效')
        return
      }

      let recentTools = wx.getStorageSync('recentTools') || []
      if (!Array.isArray(recentTools)) {
        recentTools = []
      }

      const newRecent = []
      for (let i = 0; i < recentTools.length; i++) {
        if (recentTools[i].id !== tool.id) {
          newRecent.push(recentTools[i])
        }
      }

      newRecent.unshift({
        id: tool.id,
        name: tool.name,
        icon: tool.icon,
        iconBg: tool.iconBg,
        usedAt: new Date().getTime()
      })

      if (newRecent.length > 20) {
        newRecent = newRecent.slice(0, 20)
      }

      wx.setStorageSync('recentTools', newRecent)

      let currentCount = wx.getStorageSync('totalUsageCount') || 0
      currentCount = parseInt(currentCount, 10) || 0
      wx.setStorageSync('totalUsageCount', currentCount + 1)

      try {
        const appInstance = getApp()
        if (appInstance && typeof appInstance.cloudSyncUsage === 'function') {
          appInstance.cloudSyncUsage(tool.id, tool.name)
        }
      } catch(appErr) {
        console.log('[tool] cloudSync 调用失败（非关键错误）:', appErr)
      }
    } catch(e) {
      console.error('[tool] saveRecentTool error:', e)
    }
  },

  showMoreMenu() {
    try {
      wx.showActionSheet({
        itemList: ['关于我们', '意见反馈', '分享给朋友'],
        success: function(res) {
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
    } catch(e) {
      console.error('[tool] showMoreMenu error:', e)
    }
  }
}
