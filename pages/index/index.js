const app = getApp()

const { urlMap, defaultTools, categories, hotSearchWords } = require('./config')
const layoutManager = require('./layout-manager')
const searchManager = require('./search-manager')
const toolInteraction = require('./tool-interaction')
const shareUtils = require('./share-utils')

Page({
  data: {
    greetingText: '',
    searchKeyword: '',
    searchHistory: [],
    hotSearchWords,
    showSearchPanel: false,
    currentCategory: 'all',
    isRefreshing: false,
    scrollTop: 0,
    isDarkMode: false,
    showGuide: false,
    sharePosterPath: '',

    isLoading: true,

    isEditMode: false,
    isDragging: false,
    dragIndex: -1,

    selectedToolIndex: -1,

    canUndo: false,
    editHistory: [],

    customOrder: [],
    hiddenTools: [],
    hiddenToolsList: [],
    categories,
    tools: []
  },

  onLoad() {
    console.log('[index] onLoad 开始')

    try {
      this.updateGreeting()

      if (typeof this.loadCustomLayout === 'function') {
        this.loadCustomLayout()
      } else {
        console.warn('[index] loadCustomLayout 方法不存在')
      }

      if (typeof this.filterTools === 'function') {
        this.filterTools()
      } else {
        console.warn('[index] filterTools 方法不存在')
      }

      this.applyCurrentTheme()

      let favorites = wx.getStorageSync('favorites')
      console.log('[index] favorites 原始值:', favorites, '类型:', typeof favorites)

      if (!Array.isArray(favorites)) {
        console.warn('[index] favorites 不是数组，重置为空数组')
        favorites = []
      }

      const toolsData = Array.isArray(defaultTools) ? defaultTools : []
      console.log('[index] toolsData 长度:', toolsData.length)

      const tools = toolsData.map(tool => ({
        ...tool,
        isFavorite: Array.isArray(favorites) && favorites.indexOf(tool.id) > -1
      }))

      console.log('[index] 处理后 tools 长度:', tools.length)
      this.setData({ tools, filteredTools: tools })

      wx.setStorageSync('allTools', this.data.tools)
      wx.setStorageSync('urlMap', urlMap || {})

      let history = wx.getStorageSync('searchHistory')
      if (!Array.isArray(history)) {
        history = []
      }
      this.setData({ searchHistory: history })

      const hasSeenGuide = wx.getStorageSync('hasSeenGuide')
      if (!hasSeenGuide) {
        this.setData({ showGuide: true })
      }

      if (typeof this.drawSharePoster === 'function') {
        this.drawSharePoster()
      }

      setTimeout(() => {
        this.setData({ isLoading: false })
        console.log('[index] onLoad 完成，页面加载成功')
      }, 600)

    } catch (error) {
      console.error('[index] onLoad 出错:', error)
      this.setData({ isLoading: false })
    }
  },

  onShow() {
    this.updateGreeting()
    this.applyCurrentTheme()

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  applyCurrentTheme() {
    try {
      const appInstance = getApp()
      if (appInstance) {
        const isDark = appInstance.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
        this.setData({ isDarkMode: isDark })

        const bgColor = isDark ? '#0F172A' : '#F8FAFC'
        wx.setBackgroundColor({
          backgroundColor: bgColor,
          backgroundColorTop: bgColor,
          backgroundColorBottom: bgColor
        })
      }
    } catch(e) {
      console.log('[index] applyCurrentTheme error:', e)
    }
  },

  updateGreeting() {
    try {
      const hour = new Date().getHours()
      let greeting = ''

      if (hour >= 5 && hour < 12) {
        greeting = '上午好'
      } else if (hour >= 12 && hour < 14) {
        greeting = '中午好'
      } else if (hour >= 14 && hour < 18) {
        greeting = '下午好'
      } else if (hour >= 18 && hour < 22) {
        greeting = '晚上好'
      } else {
        greeting = '夜深了'
      }

      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const now = new Date()
      const dateStr = weekDays[now.getDay()] + ',' + (now.getMonth() + 1) + '月' + now.getDate() + '日'

      this.setData({
        greetingText: greeting + '\n' + dateStr
      })
    } catch(e) {
      console.log('[index] updateGreeting error:', e)
      this.setData({ greetingText: '欢迎使用' })
    }
  },

  onGuideClose() {
    this.setData({ showGuide: false })
  },

  onPullDownRefresh() {
    this.setData({ isRefreshing: true })

    setTimeout(() => {
      this.updateGreeting()
      this.setData({ isRefreshing: false })
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
  },

  onScrollToUpper() {
    this.setData({ scrollTop: 1 })
    setTimeout(() => {
      this.setData({ scrollTop: 0 })
    }, 50)
  },

  onPageScroll(e) {
    try {
      let st = 0
      if (e.detail && e.detail.scrollTop !== undefined) {
        st = e.detail.scrollTop
      } else if (e.detail && e.detail.scrollY !== undefined) {
        st = e.detail.scrollY
      }
      if (st < 5 && st > -50) {
        if (!this._scrollFixTimer) {
          this._scrollFixTimer = setTimeout(() => {
            this._scrollFixTimer = null
            if (this.data.scrollTop !== 0) {
              this.setData({ scrollTop: 0 })
            }
          }, 100)
        }
      }
    } catch(e) {
      console.log('[index] onPageScroll error:', e)
    }
  },

  ...layoutManager,
  ...searchManager,
  ...toolInteraction,
  ...shareUtils
})
