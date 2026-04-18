Page({
  data: {
    password: '',
    length: 16,
    strengthLevel: 'medium',
    strengthText: '中等',
    options: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false
    },
    charSets: {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }
  },

  onLoad() {
    this.generatePassword()

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onLengthChange(e) {
    this.setData({ length: e.detail.value })
    this.generatePassword()
  },

  selectLength(e) {
    const len = parseInt(e.currentTarget.dataset.len)
    this.setData({ length: len })
    this.generatePassword()
  },

  toggleOption(e) {
    const key = e.currentTarget.dataset.key
    const val = this.data.options[key]
    let newOptions = {}
    newOptions[`options.${key}`] = !val
    this.setData(newOptions)
    
    const activeCount = Object.values(this.data.options).filter(v => v).length
    if (activeCount === 0) {
      wx.showToast({ title: '至少选择一种字符类型', icon: 'none' })
      return
    }
    this.generatePassword()
  },

  generatePassword() {
    const { length, options, charSets } = this.data
    let chars = ''
    if (options.uppercase) chars += charSets.uppercase
    if (options.lowercase) chars += charSets.lowercase
    if (options.numbers) chars += charSets.numbers
    if (options.symbols) chars += charSets.symbols
    
    if (!chars) return

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    
    const strength = this.calcStrength(result)
    this.setData({ password: result, ...strength })
  },

  calcStrength(pwd) {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++
    
    if (score <= 3) return { strengthLevel: 'weak', strengthText: '弱' }
    if (score <= 5) return { strengthLevel: 'medium', strengthText: '中等' }
    return { strengthLevel: 'strong', strengthText: '强' }
  },

  copyPassword() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.password,
      success: () => wx.showToast({ title: '已复制密码', icon: 'success' })
    })
  },

  refreshPassword() {
    wx.vibrateShort({ type: 'light' })
    this.generatePassword()
  },

  onShareAppMessage() {
    return { title: '密码生成器 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
