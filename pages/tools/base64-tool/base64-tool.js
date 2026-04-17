Page({
  data: {
    mode: 'encode',
    inputContent: '',
    outputContent: '',
    showResult: false,
    errorMessage: '',
    expansionRate: '0'
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ 
      mode,
      showResult: false,
      errorMessage: '',
      inputContent: '',
      outputContent: ''
    })
    wx.vibrateShort({ type: 'light' })
  },

  onInput(e) {
    this.setData({ 
      inputContent: e.detail.value,
      showResult: false,
      errorMessage: ''
    })
  },

  pasteFromClipboard() {
    wx.vibrateShort({ type: 'light' })
    
    wx.getClipboardData({
      success: (res) => {
        this.setData({ inputContent: res.data })
        wx.showToast({ title: '已粘贴', icon: 'none' })
      },
      fail: () => {
        wx.showToast({ title: '剪贴板无内容', icon: 'none' })
      }
    })
  },

  clearInput() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputContent: '',
      showResult: false,
      errorMessage: ''
    })
  },

  processBase64() {
    if (!this.data.inputContent.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'medium' })

    try {
      let result = ''
      
      if (this.data.mode === 'encode') {
        result = this.base64Encode(this.data.inputContent)
        
        // 计算膨胀率
        const rate = ((result.length / this.data.inputContent.length - 1) * 100).toFixed(1)
        this.setData({ expansionRate: rate })
        
      } else {
        result = this.base64Decode(this.data.inputContent)
        
        if (result === null) {
          throw new Error('无效的 Base64 字符串')
        }
      }

      this.setData({
        outputContent: result,
        showResult: true,
        errorMessage: ''
      })

      wx.showToast({ 
        title: this.data.mode === 'encode' ? '编码成功' : '解码成功', 
        icon: 'success' 
      })

    } catch (error) {
      console.error('Base64 error:', error)
      this.setData({
        showResult: true,
        errorMessage: error.message || '处理失败，请检查输入内容'
      })
    }
  },

  base64Encode(str) {
    try {
      return wx.arrayBufferToBase64(new Uint8Array([...str].map(c => c.charCodeAt(0))).buffer)
    } catch (e) {
      // fallback: 手动实现简单base64编码（仅支持ASCII）
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      let encoded = ''
      let i = 0
      
      while (i < str.length) {
        const a = str.charCodeAt(i++)
        const b = i < str.length ? str.charCodeAt(i++) : 0
        const c = i < str.length ? str.charCodeAt(i++) : 0
        
        const triplet = (a << 16) | (b << 8) | c
        
        encoded += chars[(triplet >> 18) & 0x3F]
        encoded += chars[(triplet >> 12) & 0x3F]
        encoded += i > str.length + 1 ? '=' : chars[(triplet >> 6) & 0x3F]
        encoded += i > str.length ? '=' : chars[triplet & 0x3F]
      }
      
      return encoded
    }
  },

  base64Decode(base64) {
    try {
      const buffer = wx.base64ToArrayBuffer(base64)
      return String.fromCharCode(...new Uint8Array(buffer))
    } catch (e) {
      // fallback: 手动实现简单base64解码
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      let decoded = ''
      let i = 0
      
      base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '')
      
      while (i < base64.length) {
        const a = chars.indexOf(base64[i++])
        const b = chars.indexOf(base64[i++])
        const c = chars.indexOf(base64[i++])
        const d = chars.indexOf(base64[i++])
        
        const triplet = (a << 18) | (b << 12) | (c << 6) | d
        
        decoded += String.fromCharCode((triplet >> 16) & 0xFF)
        if (c !== 64) decoded += String.fromCharCode((triplet >> 8) & 0xFF)
        if (d !== 64) decoded += String.fromCharCode(triplet & 0xFF)
      }
      
      return decoded
    }
  },

  copyResult() {
    wx.vibrateShort({ type: 'light' })
    
    wx.setClipboardData({
      data: this.data.outputContent,
      success: () => wx.showToast({ title: '已复制结果', icon: 'success' })
    })
  },

  swapContent() {
    wx.vibrateShort({ type: 'light' })
    
    this.setData({
      inputContent: this.data.outputContent,
      mode: this.data.mode === 'encode' ? 'decode' : 'encode',
      showResult: false,
      errorMessage: ''
    })

    wx.showToast({ title: '已切换模式', icon: 'none' })
  },

  useExample(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputContent: text })
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: '已填入示例', icon: 'none' })
  },
  onShareAppMessage() {
    return { title: 'Base64编解码 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
