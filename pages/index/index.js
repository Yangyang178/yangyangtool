const app = getApp()

const urlMap = {
  1: '/package-calculator/exchange-rate/exchange-rate',
  2: '/package-calculator/unit-converter/unit-converter',
  3: '/package-calculator/mortgage-calculator/mortgage-calculator',
  4: '/package-calculator/tip-calculator/tip-calculator',
  5: '/package-text/word-count/word-count',
  6: '/package-text/case-converter/case-converter',
  7: '/package-text/base64-tool/base64-tool',
  9: '/package-life/pomodoro/pomodoro',
  10: '/package-life/water-reminder/water-reminder',
  11: '/package-life/random-decision/random-decision',
  12: '/package-life/garbage-sorting/garbage-sorting',
  13: '/package-life/date-calculator/date-calculator',
  14: '/package-life/countdown/countdown',
  15: '/package-life/world-clock/world-clock',
  16: '/package-calculator/age-calculator/age-calculator',
  17: '/package-dev/json-formatter/json-formatter',
  18: '/package-dev/color-converter/color-converter',
  19: '/package-text/url-encoder/url-encoder',
  20: '/package-text/regex-tester/regex-tester',
  21: '/package-dev/image-processor/image-processor',
  22: '/package-dev/password-generator/password-generator',
  23: '/package-calculator/bmi-calculator/bmi-calculator',
  24: '/package-text/text-diff/text-diff',
  25: '/package-calculator/tax-calculator/tax-calculator'
}

Page({
  data: {
    greetingText: '',
    searchKeyword: '',
    searchHistory: [],
    hotSearchWords: ['汇率', '房贷', 'BMI', '个税', '字数', '番茄', 'JSON', '图片', '密码', '随机'],
    showSearchPanel: false,
    currentCategory: 'all',
    isRefreshing: false,
    scrollTop: 0,
    isDarkMode: false,
    categories: [
      { id: 'all', name: '全部' },
      { id: 'calculator', name: '计算转换' },
      { id: 'text', name: '文本处理' },
      { id: 'life', name: '生活助手' },
      { id: 'datetime', name: '日期时间' },
      { id: 'dev', name: '开发调试' }
    ],
    tools: [
      {
        id: 21,
        name: '图片处理',
        description: '压缩/转换/裁剪/信息查看',
        icon: '🖼️',
        iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
        category: 'dev',
        isHot: true,
        isFavorite: false
      },
      {
        id: 2,
        name: '单位换算',
        description: '长度/重量/温度等转换',
        icon: '📏',
        iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        category: 'calculator',
        isHot: false,
        isFavorite: false
      },
      {
        id: 1,
        name: '汇率换算',
        description: '实时汇率，快速换汇',
        icon: '💱',
        iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
        category: 'calculator',
        isHot: true,
        isFavorite: false
      },
      {
        id: 3,
        name: '房贷计算器',
        description: '月供、利息一目了然',
        icon: '🏠',
        iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
        category: 'calculator',
        isHot: true,
        isFavorite: false
      },
      {
        id: 5,
        name: '字数统计',
        description: '中英文字符精准统计',
        icon: '#️⃣',
        iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
        category: 'text',
        isHot: true,
        isFavorite: false
      },
      {
        id: 13,
        name: '日期计算器',
        description: '间隔天数精确计算',
        icon: '📅',
        iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
        category: 'datetime',
        isHot: true,
        isFavorite: false
      },
      {
        id: 11,
        name: '随机决定',
        description: '抽签做决定不再纠结',
        icon: '🎲',
        iconBg: 'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)',
        category: 'life',
        isHot: false,
        isFavorite: false
      },
      {
        id: 4,
        name: '小费计算器',
        description: '快速计算小费金额',
        icon: '💰',
        iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        category: 'calculator',
        isHot: false,
        isFavorite: false
      },
      {
        id: 6,
        name: '大小写转换',
        description: '英文大小写一键切换',
        icon: '🔤',
        iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
        category: 'text',
        isHot: false,
        isFavorite: false
      },
      {
        id: 7,
        name: 'Base64编解码',
        description: 'Base64编码解码工具',
        icon: '🔐',
        iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
        category: 'text',
        isHot: false,
        isFavorite: false
      },
      {
        id: 9,
        name: '番茄计时',
        description: '专注工作25分钟',
        icon: '🍅',
        iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
        category: 'life',
        isHot: true,
        isFavorite: false
      },
      {
        id: 10,
        name: '喝水提醒',
        description: '健康饮水定时提醒',
        icon: '💧',
        iconBg: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)',
        category: 'life',
        isHot: false,
        isFavorite: false
      },
      {
        id: 12,
        name: '垃圾分类查询',
        description: '智能识别垃圾类型',
        icon: '♻️',
        iconBg: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)',
        category: 'life',
        isHot: false,
        isFavorite: false
      },
      {
        id: 14,
        name: '倒计时',
        description: '重要日期倒计时',
        icon: '⏰',
        iconBg: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)',
        category: 'datetime',
        isHot: false,
        isFavorite: false
      },
      {
        id: 15,
        name: '世界时钟',
        description: '全球时区时间查看',
        icon: '🌍',
        iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
        category: 'datetime',
        isHot: false,
        isFavorite: false
      },
      {
        id: 16,
        name: '年龄计算器',
        description: '精确到天的年龄计算',
        icon: '👶',
        iconBg: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)',
        category: 'datetime',
        isHot: false,
        isFavorite: false
      },
      {
        id: 17,
        name: 'JSON格式化',
        description: 'JSON美化压缩工具',
        icon: '{}',
        iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
        category: 'dev',
        isHot: true,
        isFavorite: false
      },
      {
        id: 18,
        name: '颜色转换',
        description: 'HEX/RGB/HSL互转',
        icon: '🎨',
        iconBg: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
        category: 'dev',
        isHot: false,
        isFavorite: false
      },
      {
        id: 19,
        name: 'URL编解码',
        description: 'URL编码解码工具',
        icon: '🔗',
        iconBg: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)',
        category: 'dev',
        isHot: false,
        isFavorite: false
      },
      {
        id: 20,
        name: '正则表达式测试',
        description: '正则表达式在线测试',
        icon: '✨',
        iconBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)',
        category: 'dev',
        isHot: false,
        isFavorite: false
      },
      {
        id: 22,
        name: '密码生成器',
        description: '自定义长度/字符类型，一键生成强密码',
        icon: '🔐',
        iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
        category: 'dev',
        isHot: false,
        isFavorite: false
      },
      {
        id: 23,
        name: 'BMI 计算器',
        description: '身高体重→BMI指数+健康建议',
        icon: '⚖️',
        iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
        category: 'life',
        isHot: true,
        isFavorite: false
      },
      {
        id: 24,
        name: '文本对比',
        description: '两段文本差异对比，高亮显示不同处',
        icon: '🔄',
        iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
        category: 'text',
        isHot: false,
        isFavorite: false
      },
      {
        id: 25,
        name: '个税计算器',
        description: '2024最新个税专项扣除，月薪→税后工资',
        icon: '💰',
        iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        category: 'calculator',
        isHot: true,
        isFavorite: false
      },
    ]
  },

  onLoad() {
    this.updateGreeting()
    this.filterTools()
    
    const favorites = wx.getStorageSync('favorites') || []
    const tools = this.data.tools.map(tool => ({
      ...tool,
      isFavorite: favorites.includes(tool.id)
    }))

    this.setData({ tools, filteredTools: tools })

    wx.setStorageSync('allTools', this.data.tools)
    wx.setStorageSync('urlMap', urlMap)

    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })
  },

  getPinyinFirstLetter(str) {
    if (!str) return ''
    const pinyinMap = {
      'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
      'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p',
      'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
      'y': 'y', 'z': 'z',
      '阿': 'a', '啊': 'a', '爱': 'a',
      '把': 'b', '百': 'b', '半': 'b',
      '查': 'c', '重': 'c',
      '大': 'd', '단': 'd', '当': 'd',
      '二': 'e',
      '发': 'f', '房': 'f',
      '高': 'g', '个': 'g',
      '还': 'h', '黄': 'h',
      '计': 'j', '加': 'j', '解': 'j', '今': 'j', '经': 'j',
      '开': 'k', '空': 'k',
      '两': 'l', '量': 'l', '楼': 'l', '历': 'l',
      '米': 'm', '码': 'm', '面': 'm',
      '年': 'n', '农': 'n',
      '排': 'p', '评': 'p',
      '期': 'q', '区': 'q',
      '日': 'r', '任': 'r',
      '三': 's', '时': 's', '数': 's', '删': 's',
      '体': 't', '天': 't', '图': 't',
      '文': 'w', '网': 'w',
      '下': 'x', '信': 'x', '姓': 'x', '小': 'x',
      '颜': 'y', '一': 'y', '用': 'y',
      '在': 'z', '中': 'z', '字': 'z', '转': 'z'
    }
    const firstChar = str.charAt(0).toLowerCase()
    return pinyinMap[firstChar] || firstChar
  },

  addToSearchHistory(keyword) {
    if (!keyword.trim()) return
    let history = wx.getStorageSync('searchHistory') || []
    history = history.filter(k => k !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    this.setData({ searchHistory: history })
  },

  clearSearchHistory() {
    wx.showModal({
      title: '清空搜索历史',
      content: '确定要清空所有搜索历史吗？',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({ searchHistory: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  onHotSearchClick(e) {
    const keyword = e.currentTarget.dataset.word
    this.setData({ searchKeyword: keyword })
    this.addToSearchHistory(keyword)
    this.filterTools()
  },

  onHistoryClick(e) {
    const keyword = e.currentTarget.dataset.word
    this.setData({ searchKeyword: keyword })
    this.filterTools()
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
    const app = getApp()
    if (app) {
      const isDark = app.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
      this.setData({ isDarkMode: isDark })
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
    const dateStr = `${weekDays[now.getDay()]},${now.getMonth() + 1}月${now.getDate()}日`
    
    this.setData({
      greetingText: `${greeting} · ${dateStr}`
    })
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })
    this.filterTools()
  },

  clearSearch() {
    this.setData({ searchKeyword: '', showSearchPanel: false })
    this.filterTools()
  },

  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ currentCategory: categoryId, showSearchPanel: false })
    this.filterTools()
  },

  filterTools() {
    let filtered = [...this.data.tools]
    
    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === this.data.currentCategory)
    }
    
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      const pinyinKeyword = this.getPinyinFirstLetter(keyword)
      
      filtered = filtered.filter(tool => {
        const nameMatch = tool.name.toLowerCase().includes(keyword)
        const descMatch = tool.description.toLowerCase().includes(keyword)
        const pinyinMatch = this.getPinyinFirstLetter(tool.name).toLowerCase().includes(pinyinKeyword)
        
        return nameMatch || descMatch || pinyinMatch
      })
      
      this.addToSearchHistory(this.data.searchKeyword)
    }
    
    this.setData({ filteredTools: filtered })
  },

  onSearchFocus() {
    this.setData({ showSearchPanel: true })
  },

  onSearchBlur() {
    setTimeout(() => {
      this.setData({ showSearchPanel: false })
    }, 200)
  },

  onToolClick(e) {
    const tool = e.currentTarget.dataset.tool
    
    wx.vibrateShort({ type: 'light' })
    
    this.saveRecentTool(tool)

    const url = urlMap[tool.id]
    
    if (url) {
      wx.navigateTo({
        url: url,
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
      if (tool.id === id) {
        return { ...tool, isFavorite: !tool.isFavorite }
      }
      return tool
    })
    
    const favorites = tools.filter(t => t.isFavorite).map(t => t.id)
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
    recentTools = recentTools.slice(0, 20)
    wx.setStorageSync('recentTools', recentTools)

    const currentCount = wx.getStorageSync('totalUsageCount') || 0
    wx.setStorageSync('totalUsageCount', currentCount + 1)
  },

  showMoreMenu() {
    wx.showActionSheet({
      itemList: ['关于我们', '意见反馈', '分享给朋友'],
      success: (res) => {
        switch(res.tapIndex) {
          case 0:
            wx.showToast({ title: '百宝工具箱 v1.0', icon: 'none' })
            break
          case 1:
            wx.showToast({ title: '感谢您的反馈！', icon: 'none' })
            break
          case 2:
            // 分享功能
            break
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '🧰 百宝工具箱 - 20+实用小工具合集',
      path: '/pages/index/index',
      imageUrl: ''
    }
  },

  onShareTimeline() {
    return {
      title: '🧰 百宝工具箱 - 汇率换算、单位转换等20+实用工具',
      query: '',
      imageUrl: ''
    }
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
    const scrollTop = e.detail && e.detail.scrollTop !== undefined ? e.detail.scrollTop : (e.detail && e.detail.scrollY !== undefined ? e.detail.scrollY : 0)
    if (scrollTop < 5 && scrollTop > -50) {
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
