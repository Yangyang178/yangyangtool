var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')
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

var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')

Page({
  data: {
    currentMode: 'encode',
    inputText: '',
    outputText: '',
    inputLabel: '',
    inputPlaceholder: '',
    outputLabel: '',
    convertBtnText: '',

    inputLength: 0,
    inputBytes: 0,
    outputLength: 0,
    changeRate: '',

    parsedUrl: null,
    paramTable: [],
    editingParamIndex: -1,
    editingParamKey: '',
    editingParamValue: '',
    shortUrl: '',
    shortUrlLoading: false,
    commonEncodings: commonEncodings,
    isDarkMode: false,
    isLoading: true,
    fontClass: '',
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('URL编解码')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var toolTexts = i18n.getToolPageTexts('urlEncoder')
    this.setData({ i18n: toolTexts })
    this._updateI18nData()
    poster.setupForPage(this, 19)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var toolTexts = i18n.getToolPageTexts('urlEncoder')
    this.setData({ i18n: toolTexts })
    this._updateI18nData()
  },

  switchMode: function(e) {
    wx.vibrateShort({ type: 'light' })
    var mode = e.currentTarget.dataset.mode
    var t = this.data.i18n

    var modeConfig = {}
    if (mode === 'encode') {
      modeConfig.inputLabel = t.encodeInputLabel
      modeConfig.inputPlaceholder = t.encodePlaceholder
      modeConfig.outputLabel = t.encodeOutputLabel
      modeConfig.convertBtnText = t.encodeBtnText
    } else if (mode === 'decode') {
      modeConfig.inputLabel = t.decodeInputLabel
      modeConfig.inputPlaceholder = t.decodePlaceholder
      modeConfig.outputLabel = t.decodeOutputLabel
      modeConfig.convertBtnText = t.decodeBtnText
    } else if (mode === 'base64') {
      modeConfig.inputLabel = t.base64InputLabel
      modeConfig.inputPlaceholder = t.base64Placeholder
      modeConfig.outputLabel = t.base64OutputLabel
      modeConfig.convertBtnText = t.base64BtnText
    }

    var setDataObj = {
      currentMode: mode,
      outputText: '',
      parsedUrl: null,
      paramTable: [],
      editingParamIndex: -1,
      shortUrl: ''
    }
    for (var key in modeConfig) {
      setDataObj[key] = modeConfig[key]
    }
    this.setData(setDataObj)
  },

  onInputChange: function(e) {
    var value = e.detail.value
    this.setData({
      inputText: value,
      inputLength: value.length,
      inputBytes: this.calculateBytes(value)
    })
  },

  calculateBytes: function(str) {
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

  convert: function() {
    wx.vibrateShort({ type: 'medium' })

    var inputData = this.data
    var inputText = inputData.inputText
    var currentMode = inputData.currentMode

    if (!inputText.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInput, icon: 'none' })
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

      var successTitle = currentMode === 'base64' ? this.data.i18n.convertSuccess : (currentMode === 'encode' ? this.data.i18n.encodeSuccess : this.data.i18n.decodeSuccess)
      wx.showToast({
        title: successTitle,
        icon: 'success'
      })

      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(19, 'URL编解码', false)

    } catch (e) {
      wx.showToast({
        title: this.data.i18n.errorLabel + e.message,
        icon: 'none',
        duration: 3000
      })
    }
  },

  calculateChangeRate: function(inputLen, outputLen) {
    if (inputLen === 0) return '0%'
    var rate = ((outputLen - inputLen) / inputLen * 100).toFixed(1)
    return rate > 0 ? '+' + rate + '%' : rate + '%'
  },

  isBase64: function(str) {
    var base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    return base64Regex.test(str.trim()) && str.trim().length % 4 === 0
  },

  base64Encode: function(str) {
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

  base64Decode: function(str) {
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

  tryParseUrl: function(urlStr) {
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
            value: value,
            encoded: encodeURIComponent(key) + '=' + encodeURIComponent(value)
          })
        }
      }

      var paramTable = []
      for (var j = 0; j < params.length; j++) {
        paramTable.push({
          index: j,
          key: params[j].key,
          value: params[j].value,
          encoded: params[j].encoded
        })
      }

      this.setData({
        parsedUrl: {
          protocol: urlObj.protocol.replace(':', ''),
          host: urlObj.hostname,
          port: urlObj.port || '',
          pathname: urlObj.pathname || '/',
          search: urlObj.search || '',
          hash: urlObj.hash ? urlObj.hash.substring(1) : '',
          params: params,
          fullUrl: urlObj.href
        },
        paramTable: paramTable
      })
    } catch (e) {
      this.setData({ parsedUrl: null, paramTable: [] })
    }
  },

  onEditParam: function(e) {
    var index = e.currentTarget.dataset.index
    var param = this.data.paramTable[index]
    if (!param) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      editingParamIndex: index,
      editingParamKey: param.key,
      editingParamValue: param.value
    })
  },

  onEditParamKey: function(e) {
    this.setData({ editingParamKey: e.detail.value })
  },

  onEditParamValue: function(e) {
    this.setData({ editingParamValue: e.detail.value })
  },

  saveParamEdit: function() {
    var index = this.data.editingParamIndex
    var newKey = this.data.editingParamKey.trim()
    var newValue = this.data.editingParamValue

    if (!newKey) {
      wx.showToast({ title: this.data.i18n.paramNameEmpty, icon: 'none' })
      return
    }

    var paramTable = this.data.paramTable.slice()
    paramTable[index].key = newKey
    paramTable[index].value = newValue
    paramTable[index].encoded = encodeURIComponent(newKey) + '=' + encodeURIComponent(newValue)

    var parsedUrl = this.data.parsedUrl
    parsedUrl.params[index].key = newKey
    parsedUrl.params[index].value = newValue

    this.setData({
      paramTable: paramTable,
      parsedUrl: parsedUrl,
      editingParamIndex: -1
    })

    this._rebuildUrlFromParams()
    wx.showToast({ title: this.data.i18n.paramUpdated, icon: 'success' })
  },

  cancelParamEdit: function() {
    this.setData({ editingParamIndex: -1 })
  },

  deleteParam: function(e) {
    var index = e.currentTarget.dataset.index
    wx.vibrateShort({ type: 'medium' })
    var paramTable = this.data.paramTable.slice()
    paramTable.splice(index, 1)

    for (var i = 0; i < paramTable.length; i++) {
      paramTable[i].index = i
    }

    var parsedUrl = this.data.parsedUrl
    parsedUrl.params.splice(index, 1)

    this.setData({
      paramTable: paramTable,
      parsedUrl: parsedUrl
    })

    this._rebuildUrlFromParams()
    wx.showToast({ title: this.data.i18n.paramDeleted, icon: 'success' })
  },

  addNewParam: function() {
    wx.vibrateShort({ type: 'light' })
    var paramTable = this.data.paramTable.slice()
    var newIndex = paramTable.length
    paramTable.push({
      index: newIndex,
      key: 'newParam',
      value: '',
      encoded: 'newParam='
    })

    var parsedUrl = this.data.parsedUrl
    if (!parsedUrl.params) parsedUrl.params = []
    parsedUrl.params.push({ key: 'newParam', value: '' })

    this.setData({
      paramTable: paramTable,
      parsedUrl: parsedUrl,
      editingParamIndex: newIndex,
      editingParamKey: 'newParam',
      editingParamValue: ''
    })
  },

  _rebuildUrlFromParams: function() {
    var parsedUrl = this.data.parsedUrl
    if (!parsedUrl) return

    var paramParts = []
    for (var i = 0; i < parsedUrl.params.length; i++) {
      var p = parsedUrl.params[i]
      paramParts.push(encodeURIComponent(p.key) + '=' + encodeURIComponent(p.value))
    }

    var search = paramParts.length > 0 ? '?' + paramParts.join('&') : ''
    var hash = parsedUrl.hash ? '#' + parsedUrl.hash : ''
    var port = parsedUrl.port ? ':' + parsedUrl.port : ''
    var newUrl = parsedUrl.protocol + '://' + parsedUrl.host + port + parsedUrl.pathname + search + hash

    parsedUrl.search = search
    parsedUrl.fullUrl = newUrl

    this.setData({
      parsedUrl: parsedUrl,
      outputText: encodeURIComponent(newUrl)
    })
  },

  copyRebuiltUrl: function() {
    var that = this
    if (!this.data.parsedUrl || !this.data.parsedUrl.fullUrl) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.parsedUrl.fullUrl,
      success: function() { wx.showToast({ title: that.data.i18n.urlCopied, icon: 'success' }) }
    })
  },

  generateShortUrl: function() {
    var url = this.data.parsedUrl ? this.data.parsedUrl.fullUrl : this.data.inputText
    if (!url || !url.match(/^https?:\/\//i)) {
      wx.showToast({ title: this.data.i18n.pleaseInputValidUrl, icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'light' })
    this.setData({ shortUrlLoading: true })

    var that = this
    wx.request({
      url: 'https://tinyurl.com/api-create.php',
      data: { url: url },
      method: 'GET',
      success: function(res) {
        if (res.statusCode === 200 && res.data && typeof res.data === 'string' && res.data.indexOf('http') === 0) {
          that.setData({ shortUrl: res.data, shortUrlLoading: false })
          wx.showToast({ title: that.data.i18n.shortUrlSuccess, icon: 'success' })
        } else {
          that.setData({ shortUrlLoading: false })
          that._showShortUrlFallback(url)
        }
      },
      fail: function() {
        that.setData({ shortUrlLoading: false })
        that._showShortUrlFallback(url)
      }
    })
  },

  _showShortUrlFallback: function(url) {
    var that = this
    wx.showModal({
      title: that.data.i18n.shortUrlTitle,
      content: that.data.i18n.shortUrlFallback,
      confirmText: that.data.i18n.copyUrl,
      success: function(res) {
        if (res.confirm) {
          wx.vibrateShort({ type: 'light' })
          wx.setClipboardData({
            data: url,
            success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
          })
        }
      }
    })
  },

  copyShortUrl: function() {
    var that = this
    if (!this.data.shortUrl) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.shortUrl,
      success: function() { wx.showToast({ title: that.data.i18n.shortUrlCopied, icon: 'success' }) }
    })
  },

  pasteFromClipboard: function() {
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
          wx.showToast({ title: that.data.i18n.pasted, icon: 'success' })
        } else {
          wx.showToast({ title: that.data.i18n.clipboardEmpty, icon: 'none' })
        }
      },
      fail: function() {
        wx.showToast({ title: that.data.i18n.readFail, icon: 'none' })
      }
    })
  },

  loadSample: function() {
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

    wx.showToast({ title: this.data.i18n.exampleLoaded, icon: 'success' })
  },

  clearInput: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputText: '',
      outputText: '',
      inputLength: 0,
      inputBytes: 0,
      outputLength: 0,
      changeRate: '',
      parsedUrl: null,
      paramTable: [],
      editingParamIndex: -1,
      shortUrl: ''
    })
  },

  copyOutput: function() {
    var that = this
    wx.vibrateShort({ type: 'light' })

    if (!this.data.outputText) {
      wx.showToast({ title: this.data.i18n.noContentToCopy, icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.outputText,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedToClipboard, icon: 'success' })
      }
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        inputText: '',
        outputText: '',
        inputLength: 0,
        inputBytes: 0,
        outputLength: 0,
        changeRate: '',
        parsedUrl: null,
        paramTable: [],
        editingParamIndex: -1,
        shortUrl: ''
      })
    })
  },

  copyResult: function() {
    toolActions.copyText(this.data.outputText, this.data.i18n.resultCopied)
  },

  _updateI18nData: function() {
    var t = this.data.i18n
    if (!t || !t.encodeInputLabel) return

    var mode = this.data.currentMode
    var modeLabels = {}
    if (mode === 'encode') {
      modeLabels.inputLabel = t.encodeInputLabel
      modeLabels.inputPlaceholder = t.encodePlaceholder
      modeLabels.outputLabel = t.encodeOutputLabel
      modeLabels.convertBtnText = t.encodeBtnText
    } else if (mode === 'decode') {
      modeLabels.inputLabel = t.decodeInputLabel
      modeLabels.inputPlaceholder = t.decodePlaceholder
      modeLabels.outputLabel = t.decodeOutputLabel
      modeLabels.convertBtnText = t.decodeBtnText
    } else if (mode === 'base64') {
      modeLabels.inputLabel = t.base64InputLabel
      modeLabels.inputPlaceholder = t.base64Placeholder
      modeLabels.outputLabel = t.base64OutputLabel
      modeLabels.convertBtnText = t.base64BtnText
    }

    var descKeys = ['descSpace', 'descExclamation', 'descDoubleQuote', 'descHash', 'descDollar', 'descAmpersand', 'descSingleQuote', 'descLeftParen', 'descRightParen', 'descAsterisk', 'descPlus', 'descComma', 'descSlash', 'descColon', 'descSemicolon', 'descEquals', 'descQuestion', 'descAt', 'descLeftBracket', 'descRightBracket', 'descLeftBrace', 'descRightBrace', 'descPipe', 'descTilde', 'descPercent', 'descChinese']
    var updatedEncodings = commonEncodings.slice()
    for (var i = 0; i < updatedEncodings.length && i < descKeys.length; i++) {
      updatedEncodings[i] = { char: updatedEncodings[i].char, encoded: updatedEncodings[i].encoded, desc: t[descKeys[i]] || updatedEncodings[i].desc }
    }

    var setDataObj = { commonEncodings: updatedEncodings }
    for (var key in modeLabels) {
      setDataObj[key] = modeLabels[key]
    }
    this.setData(setDataObj)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('URL编解码 - 百宝工具箱', '/package-text/url-encoder/url-encoder', 'URL编码解码转换，网址特殊字符处理')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('URL编解码 - 网址编码解码特殊字符处理')
  }
})
