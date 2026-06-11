var storageUtil = require('../../utils/storage.js')
var logger = require('../../utils/logger.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    mode: 'encode',
    inputContent: '',
    outputContent: '',
    showResult: false,
    errorMessage: '',
    expansionRate: '0',
    isDarkMode: false,
    fontSizeSetting: 'medium',

    imgBase64: '',
    imgBase64Preview: '',
    imgBase64Len: 0,
    imgPreviewUrl: '',
    imgSizeInfo: '',
    imgWidth: 0,
    imgHeight: 0,
    imgFileSize: '',
    imgMimeType: '',
    showImgPreview: false,
    b64ImgUrl: '',
    b64ImgSize: '',
    b64ImgWidth: 0,
    b64ImgHeight: 0
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('Base64编解码')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var toolTexts = i18n.getToolPageTexts('base64Tool')
    this.setData({ i18n: toolTexts })
    poster.setupForPage(this, 7)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var toolTexts = i18n.getToolPageTexts('base64Tool')
    this.setData({ i18n: toolTexts })
  },

  switchMode: function(e) {
    var mode = e.currentTarget.dataset.mode
    this.setData({
      mode: mode,
      showResult: false,
      errorMessage: '',
      inputContent: '',
      outputContent: '',
      imgBase64: '',
      imgBase64Preview: '',
      imgBase64Len: 0,
      imgPreviewUrl: '',
      imgSizeInfo: '',
      showImgPreview: false,
      b64ImgUrl: '',
      b64ImgSize: ''
    })
    wx.vibrateShort({ type: 'light' })
  },

  onInput: function(e) {
    this.setData({
      inputContent: e.detail.value,
      showResult: false,
      errorMessage: ''
    })
  },

  pasteFromClipboard: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.getClipboardData({
      success: function(res) {
        that.setData({ inputContent: res.data })
        wx.showToast({ title: that.data.i18n.pasted, icon: 'none' })
      },
      fail: function() {
        wx.showToast({ title: that.data.i18n.clipboardEmpty, icon: 'none' })
      }
    })
  },

  clearInput: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputContent: '',
      showResult: false,
      errorMessage: ''
    })
  },

  processBase64: function() {
    if (!this.data.inputContent.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseInput, icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'medium' })

    try {
      var result = ''

      if (this.data.mode === 'encode') {
        result = this.base64Encode(this.data.inputContent)

        var rate = ((result.length / this.data.inputContent.length - 1) * 100).toFixed(1)
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
        title: this.data.mode === 'encode' ? this.data.i18n.encodeSuccess : this.data.i18n.decodeSuccess,
        icon: 'success'
      })

      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(7, 'Base64编解码', false)

    } catch (error) {
      logger.error('Base64 error:', error)
      this.setData({
        showResult: true,
        errorMessage: error.message || '处理失败，请检查输入内容'
      })
    }
  },

  base64Encode: function(str) {
    try {
      var arr = []
      for (var i = 0; i < str.length; i++) {
        arr.push(str.charCodeAt(i))
      }
      return wx.arrayBufferToBase64(new Uint8Array(arr).buffer)
    } catch (e) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var encoded = ''
      var j = 0

      while (j < str.length) {
        var a = str.charCodeAt(j++)
        var b = j < str.length ? str.charCodeAt(j++) : 0
        var c = j < str.length ? str.charCodeAt(j++) : 0

        var triplet = (a << 16) | (b << 8) | c

        encoded += chars[(triplet >> 18) & 0x3F]
        encoded += chars[(triplet >> 12) & 0x3F]
        encoded += j > str.length + 1 ? '=' : chars[(triplet >> 6) & 0x3F]
        encoded += j > str.length ? '=' : chars[triplet & 0x3F]
      }

      return encoded
    }
  },

  base64Decode: function(base64) {
    try {
      var buffer = wx.base64ToArrayBuffer(base64)
      var uint8 = new Uint8Array(buffer)
      var chars = []
      for (var i = 0; i < uint8.length; i++) {
        chars.push(String.fromCharCode(uint8[i]))
      }
      return chars.join('')
    } catch (e) {
      var charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var decoded = ''
      var j = 0

      base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '')

      while (j < base64.length) {
        var a = charMap.indexOf(base64[j++])
        var b = charMap.indexOf(base64[j++])
        var c = charMap.indexOf(base64[j++])
        var d = charMap.indexOf(base64[j++])

        var triplet = (a << 18) | (b << 12) | (c << 6) | d

        decoded += String.fromCharCode((triplet >> 16) & 0xFF)
        if (c !== 64) decoded += String.fromCharCode((triplet >> 8) & 0xFF)
        if (d !== 64) decoded += String.fromCharCode(triplet & 0xFF)
      }

      return decoded
    }
  },

  chooseImage: function() {
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        var tempFilePath = res.tempFiles[0].tempFilePath
        var fileSize = res.tempFiles[0].size
        that._convertImageToBase64(tempFilePath, fileSize)
      },
      fail: function() {}
    })
  },

  _convertImageToBase64: function(filePath, fileSize) {
    var that = this
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: function(res) {
        var base64Data = res.data
        var ext = filePath.split('.').pop().toLowerCase()
        var mimeType = 'image/jpeg'
        if (ext === 'png') mimeType = 'image/png'
        else if (ext === 'gif') mimeType = 'image/gif'
        else if (ext === 'webp') mimeType = 'image/webp'
        else if (ext === 'bmp') mimeType = 'image/bmp'

        var fullBase64 = 'data:' + mimeType + ';base64,' + base64Data
        var estimatedOrigSize = that._formatSize(fileSize)
        var base64Size = that._formatSize(Math.ceil(base64Data.length * 3 / 4))
        var ratio = (base64Data.length * 3 / 4 / fileSize * 100).toFixed(1)

        that.setData({
          imgBase64: fullBase64,
          imgBase64Preview: fullBase64.length > 500 ? fullBase64.substring(0, 500) + '...' : fullBase64,
          imgBase64Len: fullBase64.length,
          imgPreviewUrl: filePath,
          imgSizeInfo: '原始: ' + estimatedOrigSize + ' | Base64: ' + base64Size + ' | 膨胀: ' + ratio + '%',
          imgFileSize: estimatedOrigSize,
          imgMimeType: mimeType,
          showImgPreview: true
        })

        wx.getImageInfo({
          src: filePath,
          success: function(info) {
            that.setData({
              imgWidth: info.width,
              imgHeight: info.height
            })
          }
        })

        var tracker = getApp().tracker
        if (tracker) tracker.toolUse(7, 'Base64编解码', false)
      },
      fail: function(err) {
        that.setData({ errorMessage: '图片读取失败: ' + (err.errMsg || '') })
      }
    })
  },

  copyImgBase64: function() {
    var that = this
    if (!this.data.imgBase64) {
      wx.showToast({ title: this.data.i18n.noData, icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.imgBase64,
      success: function() { wx.showToast({ title: that.data.i18n.copiedBase64, icon: 'success' }) }
    })
  },

  previewImage: function() {
    if (!this.data.imgPreviewUrl) return
    wx.previewImage({
      urls: [this.data.imgPreviewUrl],
      current: this.data.imgPreviewUrl
    })
  },

  decodeBase64Image: function() {
    var that = this
    var input = this.data.inputContent.trim()
    if (!input) {
      wx.showToast({ title: this.data.i18n.pleaseInputBase64, icon: 'none' })
      return
    }

    var base64Data = input
    var mimeType = 'image/png'

    if (input.indexOf('data:') === 0) {
      var match = input.match(/^data:([^;]+);base64,(.*)$/)
      if (match && match[2]) {
        mimeType = match[1]
        base64Data = match[2]
      }
    }

    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data.replace(/\s/g, ''))) {
      that.setData({ errorMessage: '无效的Base64图片数据' })
      return
    }

    wx.vibrateShort({ type: 'medium' })

    try {
      var buffer = wx.base64ToArrayBuffer(base64Data)
      var ext = 'png'
      if (mimeType.indexOf('jpeg') > -1 || mimeType.indexOf('jpg') > -1) ext = 'jpg'
      else if (mimeType.indexOf('gif') > -1) ext = 'gif'
      else if (mimeType.indexOf('webp') > -1) ext = 'webp'
      else if (mimeType.indexOf('bmp') > -1) ext = 'bmp'

      var filePath = wx.env.USER_DATA_PATH + '/b64decode_' + Date.now() + '.' + ext

      wx.getFileSystemManager().writeFile({
        filePath: filePath,
        data: buffer,
        success: function() {
          var origSize = that._formatSize(buffer.byteLength)
          that.setData({
            b64ImgUrl: filePath,
            b64ImgSize: origSize,
            showResult: true,
            errorMessage: ''
          })

          wx.getImageInfo({
            src: filePath,
            success: function(info) {
              that.setData({
                b64ImgWidth: info.width,
                b64ImgHeight: info.height
              })
            }
          })

          var tracker = getApp().tracker
          if (tracker) tracker.toolUse(7, 'Base64编解码', false)
        },
        fail: function(err) {
          that.setData({ errorMessage: '图片写入失败: ' + (err.errMsg || '') })
        }
      })
    } catch (err) {
      that.setData({ errorMessage: 'Base64解码失败，请检查数据格式' })
    }
  },

  previewB64Image: function() {
    if (!this.data.b64ImgUrl) return
    wx.previewImage({
      urls: [this.data.b64ImgUrl],
      current: this.data.b64ImgUrl
    })
  },

  saveB64Image: function() {
    var that = this
    if (!this.data.b64ImgUrl) return
    wx.vibrateShort({ type: 'light' })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.b64ImgUrl,
      success: function() {
        wx.showToast({ title: that.data.i18n.savedToAlbum, icon: 'success' })
      },
      fail: function(err) {
        if (err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
          wx.showModal({
            title: that.data.i18n.permissionNotOpen,
            content: that.data.i18n.openAlbumPermission,
            confirmText: that.data.i18n.goSettings,
            success: function(res) {
              if (res.confirm) wx.openSetting()
            }
          })
        }
      }
    })
  },

  _formatSize: function(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  },

  copyResult: function() {
    var that = this
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.outputContent,
      success: function() { wx.showToast({ title: that.data.i18n.copiedResult, icon: 'success' }) }
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        mode: 'encode',
        inputContent: '',
        outputContent: '',
        showResult: false,
        errorMessage: '',
        imgBase64: '',
        imgBase64Preview: '',
        imgBase64Len: 0,
        imgPreviewUrl: '',
        imgSizeInfo: '',
        showImgPreview: false,
        b64ImgUrl: '',
        b64ImgSize: ''
      })
    })
  },

  swapContent: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputContent: this.data.outputContent,
      mode: this.data.mode === 'encode' ? 'decode' : 'encode',
      showResult: false,
      errorMessage: ''
    })
    wx.showToast({ title: this.data.i18n.modeSwitched, icon: 'none' })
  },

  useExample: function(e) {
    var text = e.currentTarget.dataset.text
    this.setData({ inputContent: text })
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: this.data.i18n.exampleFilled, icon: 'none' })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🔐 Base64编解码 - 百宝工具箱', '/package-text/base64-tool/base64-tool')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🔐 Base64编解码 - 百宝工具箱')
  }
})
