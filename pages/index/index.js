const app = getApp()

Page({
  data: {
    greetingText: '',
    searchKeyword: '',
    currentCategory: 'all',
    isRefreshing: false,
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
        id: 8,
        name: '二维码生成器',
        description: '文字/链接生成二维码',
        icon: '📱',
        iconBg: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
        category: 'text',
        isHot: true,
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
        id: 22,
        name: '文件格式转换',
        description: '格式查询/兼容性/转换指南',
        icon: '📁',
        iconBg: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
        category: 'dev',
        isHot: true,
        isFavorite: false
      }
    ],
    filteredTools: []
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

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShow() {
    this.updateGreeting()
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
    this.setData({ searchKeyword: '' })
    this.filterTools()
  },

  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ currentCategory: categoryId })
    this.filterTools()
  },

  filterTools() {
    let filtered = [...this.data.tools]
    
    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === this.data.currentCategory)
    }
    
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(keyword) || 
        tool.description.toLowerCase().includes(keyword)
      )
    }
    
    this.setData({ filteredTools: filtered })
  },

  onToolClick(e) {
    const tool = e.currentTarget.dataset.tool
    
    wx.vibrateShort({ type: 'light' })
    
    this.saveRecentTool(tool)
    
    const urlMap = {
      1: '/pages/tools/exchange-rate/exchange-rate',
      2: '/pages/tools/unit-converter/unit-converter',
      3: '/pages/tools/mortgage-calculator/mortgage-calculator',
      4: '/pages/tools/tip-calculator/tip-calculator',
      5: '/pages/tools/word-count/word-count',
      6: '/pages/tools/case-converter/case-converter',
      7: '/pages/tools/base64-tool/base64-tool',
      8: '/pages/tools/qrcode-generator/qrcode-generator',
      9: '/pages/tools/pomodoro/pomodoro',
      10: '/pages/tools/water-reminder/water-reminder',
      11: '/pages/tools/random-decision/random-decision',
      12: '/pages/tools/garbage-sorting/garbage-sorting',
      13: '/pages/tools/date-calculator/date-calculator',
      14: '/pages/tools/countdown/countdown',
      15: '/pages/tools/world-clock/world-clock',
      16: '/pages/tools/age-calculator/age-calculator',
      17: '/pages/tools/json-formatter/json-formatter',
      18: '/pages/tools/color-converter/color-converter',
      19: '/pages/tools/url-encoder/url-encoder',
      20: '/pages/tools/regex-tester/regex-tester',
      21: '/pages/tools/image-processor/image-processor',
      22: '/pages/tools/file-converter/file-converter'
    }
    
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
  },

  saveRecentTool(tool) {
    let recentTools = wx.getStorageSync('recentTools') || []
    recentTools = recentTools.filter(t => t.id !== tool.id)
    recentTools.unshift({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      usedAt: new Date().getTime()
    })
    recentTools = recentTools.slice(0, 20)
    wx.setStorageSync('recentTools', recentTools)
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
  }
})
