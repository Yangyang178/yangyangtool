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
    tools: defaultTools
  },

  onLoad() {
    this.updateGreeting()
    this.loadCustomLayout()
    this.filterTools()
    this.applyCurrentTheme()

    const favorites = wx.getStorageSync('favorites') || []
    const tools = defaultTools.map(tool => ({
      ...tool,
      isFavorite: favorites.includes(tool.id)
    }))

    this.setData({ tools, filteredTools: tools })

    wx.setStorageSync('allTools', this.data.tools)
    wx.setStorageSync('urlMap', urlMap)

    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })

    const hasSeenGuide = wx.getStorageSync('hasSeenGuide')
    if (!hasSeenGuide) {
      this.setData({ showGuide: true })
    }

    this.drawSharePoster()

    setTimeout(() => {
      this.setData({ isLoading: false })
    }, 600)
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
    const appInstance = getApp()
    if (appInstance) {
      const isDark = appInstance.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
      this.setData({ isDarkMode: isDark })

      const bgColor = isDark ? '#0F172A' : '#F8FAFC'
      try {
        wx.setBackgroundColor({
          backgroundColor: bgColor,
          backgroundColorTop: bgColor,
          backgroundColorBottom: bgColor
        })
      } catch(e) {
        console.log('setBackgroundColor error:', e)
      }
    }
  },

  updateGreeting() {
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
  }
})

Object.assign(Page.prototype, layoutManager)
Object.assign(Page.prototype, searchManager)
Object.assign(Page.prototype, toolInteraction)
Object.assign(Page.prototype, shareUtils)
