const app = getApp()

Page({
  data: {
    userInfo: { nickname: '微信用户', avatarUrl: '', avatarBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
    totalUsage: 0,
    recentTools: [],
    favoriteTools: [],
    favoritePreviewNames: '',
    isDarkMode: false,
    cacheSize: '0 KB',
    
    showEditProfile: false,
    editNickname: '',
    tempAvatarUrl: '',
    selectedAvatarColor: '#DBEAFE',
    avatarColors: [
      { color: '#DBEAFE', bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
      { color: '#FEE2E2', bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
      { color: '#D1FAE5', bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' },
      { color: '#FEF3C7', bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
      { color: '#E9D5FF', bg: 'linear-gradient(135deg, #E9D5FF 0%, #DDD6FE 100%)' },
      { color: '#FCE7F3', bg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' },
      { color: '#CFFAFE', bg: 'linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%)' },
      { color: '#1E293B', bg: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)' }
    ],

    showFeedback: false,
    feedbackType: 'bug',
    feedbackContent: '',
    contactInfo: '',
    isSubmitting: false,
    feedbackTypes: [
      { value: 'bug', label: '🐛 问题反馈' },
      { value: 'suggestion', label: '💡 功能建议' },
      { value: 'other', label: '💬 其他' }
    ]
  },

  onLoad() {
    this.loadAllData()
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShow() {
    this.loadAllData()
  },

  loadAllData() {
    this.loadUserInfo()
    this.loadRecentTools()
    this.loadFavorites()
    this.calcCacheSize()
    this.checkDarkMode()
    const app = getApp()
    if (app) {
      const isDark = app.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
      this.setData({ isDarkMode: isDark })
    }
  },

  loadUserInfo() {
    const usageCount = wx.getStorageSync('totalUsageCount') || 0
    this.setData({ totalUsage: usageCount })

    const savedProfile = wx.getStorageSync('userProfile') || {}
    if (savedProfile.nickname || savedProfile.avatarUrl || savedProfile.avatarBg) {
      this.setData({
        userInfo: {
          nickname: savedProfile.nickname || '微信用户',
          avatarUrl: savedProfile.avatarUrl || '',
          avatarBg: savedProfile.avatarBg || 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
        }
      })
    } else {
      try {
        wx.getUserProfile({
          desc: '用于展示用户信息',
          success: (res) => {
            this.setData({ 'userInfo.nickname': res.userInfo.nickName || '微信用户' })
          },
          fail: () => {
            this.setData({ 'userInfo.nickname': '微信用户' })
          }
        })
      } catch (e) {
        this.setData({ 'userInfo.nickname': '微信用户' })
      }
    }
  },

  openEditProfile() {
    wx.vibrateShort({ type: 'light' })
    const info = this.data.userInfo
    this.setData({
      showEditProfile: true,
      editNickname: info.nickname,
      tempAvatarUrl: info.avatarUrl || '',
      selectedAvatarColor: info.avatarBg ? this.extractColorFromBg(info.avatarBg) : '#DBEAFE'
    })
  },

  closeEditProfile() {
    this.setData({ showEditProfile: false })
  },

  extractColorFromBg(bg) {
    if (!bg) return '#DBEAFE'
    for (let c of this.data.avatarColors) {
      if (bg.includes(c.color)) return c.color
    }
    return '#DBEAFE'
  },

  chooseAvatar() {
    wx.vibrateShort({ type: 'light' })
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.setData({ tempAvatarUrl: tempPath })
        wx.showToast({ title: '头像已选择，点击保存生效', icon: 'none', duration: 1500 })
      }
    })
  },

  onNicknameInput(e) {
    this.setData({ editNickname: e.detail.value })
  },

  selectAvatarColor(e) {
    wx.vibrateShort({ type: 'light' })
    const { color, bg } = e.currentTarget.dataset
    this.setData({ selectedAvatarColor: color, 'userInfo.avatarBg': bg })
  },

  saveProfile() {
    wx.vibrateShort({ type: 'light' })
    const nickname = this.data.editNickname.trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    const profile = {
      nickname: nickname,
      avatarUrl: this.data.tempAvatarUrl,
      avatarBg: this.data.userInfo.avatarBg
    }

    wx.setStorageSync('userProfile', profile)

    this.setData({
      showEditProfile: false,
      'userInfo.nickname': nickname,
      'userInfo.avatarUrl': this.data.tempAvatarUrl
    })

    wx.showToast({ title: '资料已保存 ✅', icon: 'success' })
  },

  loadRecentTools() {
    const recentTools = wx.getStorageSync('recentTools') || []
    const formattedTools = recentTools.map(tool => ({
      ...tool,
      timeText: this.formatTime(tool.usedAt)
    }))
    this.setData({ recentTools: formattedTools })
  },

  loadFavorites() {
    const favoriteIds = wx.getStorageSync('favorites') || []
    const allTools = this.getAllToolsData()

    if (!allTools.length) return

    const favTools = favoriteIds
      .map(id => allTools.find(t => t.id === id))
      .filter(Boolean)

    const names = favTools.map(t => t.name).join(' · ')
    this.setData({
      favoriteTools: favTools,
      favoritePreviewNames: names
    })
  },

  getAllToolsData() {
    return [
      { id: 1, name: '汇率换算', icon: '💱', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
      { id: 2, name: '单位换算', icon: '📏', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
      { id: 3, name: '房贷计算器', icon: '🏠', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' },
      { id: 4, name: '小费计算器', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
      { id: 5, name: '字数统计', icon: '#️⃣', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)' },
      { id: 6, name: '大小写转换', icon: '🔤', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' },
      { id: 7, name: 'Base64编解码', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)' },
      { id: 9, name: '番茄计时', icon: '🍅', iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)' },
      { id: 10, name: '喝水提醒', icon: '💧', iconBg: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)' },
      { id: 11, name: '随机决定', icon: '🎲', iconBg: 'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)' },
      { id: 12, name: '垃圾分类查询', icon: '♻️', iconBg: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)' },
      { id: 13, name: '日期计算器', icon: '📅', iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)' },
      { id: 14, name: '倒计时', icon: '⏰', iconBg: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)' },
      { id: 15, name: '世界时钟', icon: '🌍', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
      { id: 16, name: '年龄计算器', icon: '👶', iconBg: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)' },
      { id: 17, name: 'JSON格式化', icon: '{}', iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' },
      { id: 18, name: '颜色转换', icon: '🎨', iconBg: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' },
      { id: 19, name: 'URL编解码', icon: '🔗', iconBg: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)' },
      { id: 20, name: '正则表达式测试', icon: '✨', iconBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)' },
      { id: 21, name: '图片处理', icon: '🖼️', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
      { id: 22, name: '密码生成器', icon: '🔐', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)' },
      { id: 23, name: 'BMI 计算器', icon: '⚖️', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' },
      { id: 24, name: '文本对比', icon: '🔄', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)' },
      { id: 25, name: '个税计算器', icon: '💰', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }
    ]
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

  calcCacheSize() {
    try {
      const info = wx.getStorageInfoSync()
      const sizeKB = Math.round(info.currentSize / 1024)
      let display = sizeKB + ' KB'
      if (sizeKB > 1024) display = (sizeKB / 1024).toFixed(1) + ' MB'
      this.setData({ cacheSize: display })
    } catch (e) {
      this.setData({ cacheSize: '未知' })
    }
  },

  checkDarkMode() {
    this.setData({
      isDarkMode: wx.getStorageSync('darkMode') === true
    })
  },

  onToolClick(e) {
    const tool = e.currentTarget.dataset.tool
    wx.vibrateShort({ type: 'light' })

    const currentCount = wx.getStorageSync('totalUsageCount') || 0
    wx.setStorageSync('totalUsageCount', currentCount + 1)

    const urlMap = wx.getStorageSync('urlMap') || {}
    const targetUrl = urlMap[tool.id]
    if (!targetUrl) {
      wx.showToast({ title: '工具路径不存在', icon: 'none' })
      return
    }

    if (targetUrl.startsWith('/pages/')) {
      wx.navigateTo({ url: targetUrl, fail: () => wx.switchTab({ url: targetUrl }) })
    } else {
      wx.navigateTo({ url: targetUrl })
    }
  },

  goToRecentFull() {
    wx.vibrateShort({ type: 'light' })
  },

  goToFavorites() {
    wx.vibrateShort({ type: 'light' })
    wx.switchTab({ url: '/pages/favorites/favorites' })
  },

  toggleDarkMode() {
    wx.vibrateShort({ type: 'light' })
    const newValue = !this.data.isDarkMode
    wx.setStorageSync('darkMode', newValue)
    this.setData({ isDarkMode: newValue })
    const app = getApp()
    if (app && app.applyTheme) {
      app.applyTheme()
    }
    wx.showToast({
      title: newValue ? '已开启夜间模式 🌙' : '已关闭夜间模式 ☀️',
      icon: 'success'
    })
  },

  clearCache() {
    wx.vibrateShort({ type: 'light' })
    wx.showModal({
      title: '清理缓存',
      content: `当前缓存大小：${this.data.cacheSize}\n确定要清理吗？`,
      confirmText: '清理',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.setData({ cacheSize: '0 KB', recentTools: [], favoriteTools: [], favoritePreviewNames: '' })
          wx.showToast({ title: '缓存已清理', icon: 'success' })
          setTimeout(() => this.loadAllData(), 1000)
        }
      }
    })
  },

  onFeedback() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      showFeedback: true,
      feedbackType: 'bug',
      feedbackContent: '',
      contactInfo: ''
    })
  },

  closeFeedback() {
    this.setData({ showFeedback: false })
  },

  selectFeedbackType(e) {
    wx.vibrateShort({ type: 'light' })
    const value = e.currentTarget.dataset.value
    this.setData({ feedbackType: value })
  },

  onContactInput(e) {
    this.setData({ contactInfo: e.detail.value })
  },

  onFeedbackInput(e) {
    this.setData({ feedbackContent: e.detail.value })
  },

  submitFeedback() {
    const { feedbackContent, feedbackType, contactInfo } = this.data

    if (!feedbackContent.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    if (feedbackContent.trim().length < 5) {
      wx.showToast({ title: '反馈内容至少5个字', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'medium' })
    this.setData({ isSubmitting: true })

    const typeLabels = {
      bug: '问题反馈',
      suggestion: '功能建议',
      other: '其他'
    }

    const now = new Date()
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const mailSubject = `【百宝工具箱】${typeLabels[feedbackType]} - ${timeStr}`
    const mailBody = `
反馈类型：${typeLabels[feedbackType]}
联系方式：${contactInfo || '未填写'}
提交时间：${timeStr}
设备信息：${wx.getSystemInfoSync().model} / 微信 ${wx.getSystemInfoSync().version}

反馈内容：
${feedbackContent}
---
来自百宝工具箱微信小程序
`.trim()

    const feedbackData = {
      type: feedbackType,
      content: feedbackContent,
      contact: contactInfo,
      time: timeStr,
      device: wx.getSystemInfoSync().model
    }

    let history = wx.getStorageSync('feedbackHistory') || []
    history.unshift(feedbackData)
    if (history.length > 20) history = history.slice(0, 20)
    wx.setStorageSync('feedbackHistory', history)

    this.setData({ isSubmitting: false })

    wx.setClipboardData({
      data: mailBody,
      success: () => {
        wx.showModal({
          title: '✅ 反馈内容已复制',
          content: `感谢您的反馈！\n\n反馈已保存并复制到剪贴板。\n\n请按以下步骤发送邮件给我们：\n\n📧 收件人：yhz123456718@qq.com\n📝 主题：${mailSubject}\n\n操作步骤：\n1️⃣ 打开QQ邮箱网页版（mail.qq.com）\n2️⃣ 点击"写信"按钮\n3️⃣ 粘贴收件人和主题（已自动填好格式）\n4️⃣ 在正文处粘贴反馈内容\n5️⃣ 点击发送 ✅`,
          showCancel: false,
          confirmText: '我知道了',
          success: () => {
            this.setData({
              showFeedback: false,
              feedbackContent: '',
              contactInfo: ''
            })
            wx.showToast({
              title: '感谢您的反馈 ❤️',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
      fail: () => {
        wx.showModal({
          title: '💾 反馈已保存',
          content: `反馈已保存到本地！\n\n由于剪贴板权限问题，请手动记录以下信息后发送邮件：\n\n📧 收件人：yhz123456718@qq.com\n📝 主题：${mailSubject}\n\n您可以在"我的-设置-清理缓存"中查看历史反馈记录。`,
          showCancel: false,
          confirmText: '好的',
          success: () => {
            this.setData({
              showFeedback: false,
              feedbackContent: '',
              contactInfo: ''
            })
          }
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '🧰 百宝工具箱 - 实用小工具合集',
      path: '/pages/index/index',
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
