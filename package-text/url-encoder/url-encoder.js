var commonEncodings = [
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

var sampleUrls = [
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
    commonEncodings: commonEncodings
  },

  onLoad() {
    
  },

  switchMode(e) {
    wx.vibrateShort({ type: 'light' })
    var mode = e.currentTarget.dataset.mode
    
    var modeConfig = {}
    if (mode === 'encode') {
      modeConfig.inputLabel = '📝 输入原始文本/URL'
      modeConfig.inputPlaceholder = '请输入要编码的文本或URL地址...'
      modeConfig.outputLabel = '📤 编码结果'
      modeConfig.convertBtnText = '🔒 执行URL编码'
    } else if (mode === 'decode') {
      modeConfig.inputLabel = '📝 输入编码后的文本'
      modeConfig.inputPlaceholder = '请输入包含%XX格式的编码文本...'
      modeConfig.outputLabel = '📤 解码结果'
      modeConfig.convertBtnText = '🔓 执行URL解码'
    } else if (mode === 'base64') {
      modeConfig.inputLabel = '📝 输入文本（编码）或Base64（解码）'
      modeConfig.inputPlaceholder = '输入普通文本进行Base64编码，或输入Base64字符串进行解码...'
      modeConfig.outputLabel = '📤 转换结果'
      modeConfig.convertBtnText = '📦 Base64转换'
    }

    var setDataObj = {
      currentMode: mode,
      outputText: '',
      parsedUrl: null
    }
    for (var key in modeConfig) {
      setDataObj[key] = modeConfig[key]
    }
    this.setData(setDataObj)
  },

  onInputChange(e) {
    var value = e.detail.value
    this.setData({ 
      inputText: value,
      inputLength: value.length,
      inputBytes: this.calculateBytes(value)
    })
    
    if (this.currentMode === 'decode' || (this.currentMode === 'base64')) {
      
    }
  },

  calculateBytes(str) {
    var bytes = 0
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i)
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
    
    var inputData = this.data
    var inputText = inputData.inputText
    var currentMode = inputData.currentMode
    
    if (!inputText.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    var result = ''
    
    try {
      if (currentMode === 'encode') {
        result = encodeURIComponent(inputText)
      } else if (currentMode === 'decode') {
        result = decodeURIComponent(inputText)
      } else if (currentMode === 'base64') {
        if (this.isBase64(inputText.trim())) {
          result = this.base64Decode(inputText.trim())
        } else {
          result = this.base64Encode(inputText)
        }
      }
      
      var changeRate = this.calculateChangeRate(inputText.length, result.length)
      
      this.setData({
        outputText: result,
        outputLength: result.length,
        changeRate: changeRate
      })

      if (currentMode === 'encode') {
        this.tryParseUrl(inputText)
      }

      var successTitle = currentMode === 'base64' ? '转换成功！' : (currentMode === 'encode' ? '编码成功！' : '解码成功！')
      wx.showToast({ 
        title: successTitle,
        icon: 'success' 
      })
      
    } catch (e) {
      wx.showToast({ 
        title: '错误: ' + e.message,
        icon: 'none',
        duration: 3000
      })
    }
  },

  calculateChangeRate(inputLen, outputLen) {
    if (inputLen === 0) return '0%'
    var rate = ((outputLen - inputLen) / inputLen * 100).toFixed(1)
    return rate > 0 ? '+' + rate + '%' : rate + '%'
  },

  isBase64(str) {
    var base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    return base64Regex.test(str.trim()) && str.trim().length % 4 === 0
  },

  base64Encode(str) {
    try {
      var chars = []
      for (var ci = 0; ci < str.length; ci++) {
        chars.push(str.charCodeAt(ci))
      }
      return wx.arrayBufferToBase64(
        new Uint8Array(chars).buffer
      )
    } catch (e) {
      var result = ''
      for (var i = 0; i < str.length; i++) {
        result += '%' + ('00' + str.charCodeAt(i).toString(16)).slice(-2)
      }
      return result
    }
  },

  base64Decode(str) {
    try {
      var arrayBuffer = wx.base64ToArrayBuffer(str)
      var uint8Array = new Uint8Array(arrayBuffer)
      var result = ''
      for (var i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i])
      }
      return result
    } catch (e) {
      throw new Error('无效的Base64字符串')
    }
  },

  tryParseUrl(urlStr) {
    try {
      var url = urlStr
      
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url
      }
      
      var urlObj = new URL(url)
      
      var params = []
      if (urlObj.search) {
        var searchParams = urlObj.search.substring(1)
        var pairs = searchParams.split('&')
        
        for (var pi = 0; pi < pairs.length; pi++) {
          var pair = pairs[pi]
          var eqIdx = pair.indexOf('=')
          var key = eqIdx > -1 ? decodeURIComponent(pair.substring(0, eqIdx)) : pair
          var value = eqIdx > -1 ? decodeURIComponent(pair.substring(eqIdx + 1)) : ''
          params.push({
            key: key,
            value: value
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
          params: params
        }
      })
    } catch (e) {
      this.setData({ parsedUrl: null })
    }
  },

  pasteFromClipboard() {
    wx.vibrateShort({ type: 'light' })
    
    var that = this
    wx.getClipboardData({
      success: function(res) {
        if (res.data.trim()) {
          that.setData({
            inputText: res.data,
            inputLength: res.data.length,
            inputBytes: that.calculateBytes(res.data)
          })
          wx.showToast({ title: '已粘贴', icon: 'success' })
        } else {
          wx.showToast({ title: '剪贴板为空', icon: 'none' })
        }
      },
      fail: function() {
        wx.showToast({ title: '读取失败', icon: 'none' })
      }
    })
  },

  loadSample() {
    wx.vibrateShort({ type: 'light' })
    
    var samples = {}
    samples.encode = sampleUrls[0]
    samples.decode = 'https%3A%2F%2Fwww.example.com%2Fsearch%3Fq%3Dhello%20world'
    samples.base64 = 'Hello, 世界!'
    
    var sample = samples[this.data.currentMode]
    
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

    var that = this
    wx.setClipboardData({
      data: this.data.outputText,
      success: function() {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: 'URL编解码工具 - 百宝工具箱',
      path: '/pages/tools/url-encoder/url-encoder'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})