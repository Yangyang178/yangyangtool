const commonEncodings = [
  { char: '空格', encoded: '%20', desc: '空格字符' },
  { char: '!', encoded: '%21', desc: '感叹号' },
  { char: '"', encoded: '%22', desc: '双引号' },
  { char: '#', encoded: '%23', desc: '井号' },
  { char: '$', encoded: '%24', desc: '美元符号' },
  { char: '&', encoded: '%26', desc: '和号' },
  { char: "'", encoded: '%27', desc: '单引号' },
  { char: '(', encoded: '%28', desc: '左括号' },
  { char: ')', encoded: '%29', desc: '右括号' },
  { char: '*', encoded: '%2A', desc: '星号' },
  { char: '+', encoded: '%2B', desc: '加号' },
  { char: ',', encoded: '%2C', desc: '逗号' },
  { char: '/', encoded: '%2F', desc: '斜杠' },
  { char: ':', encoded: '%3A', desc: '冒号' },
  { char: ';', encoded: '%3B', desc: '分号' },
  { char: '=', encoded: '%3D', desc: '等号' },
  { char: '?', encoded: '%3F', desc: '问号' },
  { char: '@', encoded: '%40', desc: '@符号' },
  { char: '[', encoded: '%5B', desc: '左方括号' },
  { char: ']', encoded: '%5D', desc: '右方括号' },
  { char: '{', encoded: '%7B', desc: '左花括号' },
  { char: '}', encoded: '%7D', desc: '右花括号' },
  { char: '|', encoded: '%7C', desc: '竖线' },
  { char: '~', encoded: '%7E', desc: '波浪号' },
  { char: '%', encoded: '%25', desc: '百分号' },
  { char: '中文', encoded: '%E4%B8%AD%E6%96%87', desc: 'UTF-8编码' }
]

const sampleUrls = [
  'https://www.example.com/search?q=hello world&lang=zh-CN',
  'https://api.test.com/user?id=123&name=%E5%BC%A0%E4%B8%89',
  '特殊字符测试：!@#$%^&*()_+-=[]{}|;\':",./<>?'
]

Page({
  data: {
    currentMode: 'encode',
    inputText: '',
    outputText: '',
    inputLabel: '📝 输入原始文本/URL',
    inputPlaceholder: '请输入要编码的文本或URL地址...',
    outputLabel: '📤 编码结果',
    convertBtnText: '🔒 执行URL编码',
    
    inputLength: 0,
    inputBytes: 0,
    outputLength: 0,
    changeRate: '',
    
    parsedUrl: null,
    commonEncodings
  },

  onLoad() {
    
  },

  switchMode(e) {
    wx.vibrateShort({ type: 'light' })
    const mode = e.currentTarget.dataset.mode
    
    const modeConfig = {
      encode: {
        inputLabel: '📝 输入原始文本/URL',
        inputPlaceholder: '请输入要编码的文本或URL地址...',
        outputLabel: '📤 编码结果',
        convertBtnText: '🔒 执行URL编码'
      },
      decode: {
        inputLabel: '📝 输入编码后的文本',
        inputPlaceholder: '请输入包含%XX格式的编码文本...',
        outputLabel: '📤 解码结果',
        convertBtnText: '🔓 执行URL解码'
      },
      base64: {
        inputLabel: '📝 输入文本（编码）或Base64（解码）',
        inputPlaceholder: '输入普通文本进行Base64编码，或输入Base64字符串进行解码...',
        outputLabel: '📤 转换结果',
        convertBtnText: '📦 Base64转换'
      }
    }
    
    this.setData({
      currentMode: mode,
      ...modeConfig[mode],
      outputText: '',
      parsedUrl: null
    })
  },

  onInputChange(e) {
    const value = e.detail.value
    this.setData({ 
      inputText: value,
      inputLength: value.length,
      inputBytes: this.calculateBytes(value)
    })
    
    if (this.currentMode === 'decode' || (this.currentMode === 'base64')) {
      
    }
  },

  calculateBytes(str) {
    let bytes = 0
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i)
      if (code < 0x80) {
        bytes += 1
      } else if (code < 0x800) {
        bytes += 2
      } else if (code < 0x10000) {
        bytes += 3
      } else {
        bytes += 4
      }
    }
    return bytes
  },

  convert() {
    wx.vibrateShort({ type: 'medium' })
    
    const { inputText, currentMode } = this.data
    
    if (!inputText.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    let result = ''
    
    try {
      switch (currentMode) {
        case 'encode':
          result = encodeURIComponent(inputText)
          break
          
        case 'decode':
          result = decodeURIComponent(inputText)
          break
          
        case 'base64':
          if (this.isBase64(inputText.trim())) {
            result = this.base64Decode(inputText.trim())
          } else {
            result = this.base64Encode(inputText)
          }
          break
      }
      
      const changeRate = this.calculateChangeRate(inputText.length, result.length)
      
      this.setData({
        outputText: result,
        outputLength: result.length,
        changeRate
      })

      if (currentMode === 'encode') {
        this.tryParseUrl(inputText)
      }

      wx.showToast({ 
        title: currentMode === 'base64' ? '转换成功！' : (currentMode === 'encode' ? '编码成功！' : '解码成功！'),
        icon: 'success' 
      })
      
    } catch (e) {
      wx.showToast({ 
        title: `错误: ${e.message}`,
        icon: 'none',
        duration: 3000
      })
    }
  },

  calculateChangeRate(inputLen, outputLen) {
    if (inputLen === 0) return '0%'
    const rate = ((outputLen - inputLen) / inputLen * 100).toFixed(1)
    return rate > 0 ? `+${rate}%` : `${rate}%`
  },

  isBase64(str) {
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    return base64Regex.test(str.trim()) && str.trim().length % 4 === 0
  },

  base64Encode(str) {
    try {
      return wx.arrayBufferToBase64(
        new Uint8Array([...str].map(c => c.charCodeAt(0))).buffer
      )
    } catch (e) {
      let result = ''
      for (let i = 0; i < str.length; i++) {
        result += '%' + ('00' + str.charCodeAt(i).toString(16)).slice(-2)
      }
      return result
    }
  },

  base64Decode(str) {
    try {
      const arrayBuffer = wx.base64ToArrayBuffer(str)
      const uint8Array = new Uint8Array(arrayBuffer)
      let result = ''
      for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i])
      }
      return result
    } catch (e) {
      throw new Error('无效的Base64字符串')
    }
  },

  tryParseUrl(urlStr) {
    try {
      let url = urlStr
      
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url
      }
      
      const urlObj = new URL(url)
      
      const params = []
      if (urlObj.search) {
        const searchParams = urlObj.search.substring(1)
        const pairs = searchParams.split('&')
        
        for (const pair of pairs) {
          const [key, value] = pair.split('=')
          params.push({
            key: decodeURIComponent(key),
            value: value ? decodeURIComponent(value) : ''
          })
        }
      }
      
      this.setData({
        parsedUrl: {
          protocol: urlObj.protocol.replace(':', ''),
          host: urlObj.hostname,
          port: urlObj.port || '',
          pathname: urlObj.pathname || '/',
          search: urlObj.search || '',
          hash: urlObj.hash ? urlObj.hash.substring(1) : '',
          params
        }
      })
    } catch (e) {
      this.setData({ parsedUrl: null })
    }
  },

  pasteFromClipboard() {
    wx.vibrateShort({ type: 'light' })
    
    wx.getClipboardData({
      success: (res) => {
        if (res.data.trim()) {
          this.setData({
            inputText: res.data,
            inputLength: res.data.length,
            inputBytes: this.calculateBytes(res.data)
          })
          wx.showToast({ title: '已粘贴', icon: 'success' })
        } else {
          wx.showToast({ title: '剪贴板为空', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '读取失败', icon: 'none' })
      }
    })
  },

  loadSample() {
    wx.vibrateShort({ type: 'light' })
    
    const samples = {
      encode: sampleUrls[0],
      decode: 'https%3A%2F%2Fwww.example.com%2Fsearch%3Fq%3Dhello%20world',
      base64: 'Hello, 世界!'
    }
    
    const sample = samples[this.data.currentMode]
    
    this.setData({
      inputText: sample,
      inputLength: sample.length,
      inputBytes: this.calculateBytes(sample)
    })
    
    wx.showToast({ title: '已加载示例', icon: 'success' })
  },

  clearInput() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputText: '',
      outputText: '',
      inputLength: 0,
      inputBytes: 0,
      outputLength: 0,
      changeRate: '',
      parsedUrl: null
    })
  },

  copyOutput() {
    wx.vibrateShort({ type: 'light' })
    
    if (!this.data.outputText) {
      wx.showToast({ title: '没有可复制的内容', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: this.data.outputText,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: 'URL编解码工具 - 百宝工具箱',
      path: '/pages/tools/url-encoder/url-encoder'
    }
  }
})