var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var contentSecurity = require('../utils/content-security.js')
Page({
  data: {
    inputText: '',
    qrSize: 200,
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    qrDataUrl: '',
    showResult: false,
    isGenerating: false,
    sizeOptions: [
      { label: '小', enLabel: 'Small', value: 150 },
      { label: '中', enLabel: 'Medium', value: 200 },
      { label: '大', enLabel: 'Large', value: 280 },
      { label: '超大', enLabel: 'Extra Large', value: 360 }
    ],
    sizeIndex: 1,
    colorOptions: [
      { label: '经典黑', enLabel: 'Classic Black', fg: '#000000', bg: '#FFFFFF' },
      { label: '深蓝', enLabel: 'Dark Blue', fg: '#1E3A5F', bg: '#FFFFFF' },
      { label: '暗红', enLabel: 'Dark Red', fg: '#991B1B', bg: '#FFFFFF' },
      { label: '深绿', enLabel: 'Dark Green', fg: '#065F46', bg: '#FFFFFF' },
      { label: '紫罗兰', enLabel: 'Violet', fg: '#5B21B6', bg: '#FFFFFF' }
    ],
    colorIndex: 0,
    history: [],
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
    if (tracker) tracker.pageView('二维码生成')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })

    var history = storageUtil.safeGetArray('qr_history')
    this.setData({ history: history.slice(0, 5) })
    var toolTexts = i18n.getToolPageTexts('qrCode')
    this.setData({ i18n: toolTexts })
    this._updateI18nData()
    poster.setupForPage(this, 8)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var toolTexts = i18n.getToolPageTexts('qrCode')
    this.setData({ i18n: toolTexts })
    this._updateI18nData()
  },

  _updateI18nData: function() {
    var lang = i18n.getLanguage()
    var isEn = lang === 'en'
    var sizeOptions = this.data.sizeOptions
    var newSizes = []
    for (var i = 0; i < sizeOptions.length; i++) {
      var opt = sizeOptions[i]
      newSizes.push({
        label: isEn ? opt.enLabel : opt.label,
        enLabel: opt.enLabel,
        value: opt.value
      })
    }
    var colorOptions = this.data.colorOptions
    var newColors = []
    for (var j = 0; j < colorOptions.length; j++) {
      var copt = colorOptions[j]
      newColors.push({
        label: isEn ? copt.enLabel : copt.label,
        enLabel: copt.enLabel,
        fg: copt.fg,
        bg: copt.bg
      })
    }
    this.setData({ sizeOptions: newSizes, colorOptions: newColors })
  },

  onInput: function(e) {
    this.setData({ inputText: e.detail.value })
  },

  onSizeChange: function(e) {
    var idx = parseInt(e.currentTarget.dataset.index, 10)
    this.setData({ sizeIndex: idx, qrSize: this.data.sizeOptions[idx].value })
  },

  onColorChange: function(e) {
    var idx = parseInt(e.currentTarget.dataset.index, 10)
    var opt = this.data.colorOptions[idx]
    this.setData({ colorIndex: idx, fgColor: opt.fg, bgColor: opt.bg })
  },

  generateQR: function() {
    var text = this.data.inputText.trim()
    if (!text) {
      wx.showToast({ title: this.data.i18n.pleaseInput, icon: 'none' })
      return
    }
    if (text.length > 500) {
      wx.showToast({ title: this.data.i18n.contentTooLong, icon: 'none' })
      return
    }

    var that = this
    contentSecurity.checkText(text, function(pass, errMsg) {
      if (!pass) {
        wx.showToast({ title: errMsg, icon: 'none', duration: 2500 })
        return
      }
      that._generateQRInner(text)
    })
  },

  _generateQRInner: function(text) {
    this.setData({ isGenerating: true })

    var that = this
    var size = this.data.qrSize
    var fgColor = this.data.fgColor
    var bgColor = this.data.bgColor

    var qr = this._generateQRMatrix(text)
    if (!qr) {
      this.setData({ isGenerating: false })
      wx.showToast({ title: this.data.i18n.generateFailTooLong, icon: 'none' })
      return
    }

    setTimeout(function() {
      var query = wx.createSelectorQuery()
      query.select('#qrCanvas').fields({ node: true, size: true }).exec(function(res) {
        if (!res || !res[0]) {
          that.setData({ isGenerating: false })
          wx.showToast({ title: that.data.i18n.canvasInitFail, icon: 'none' })
          return
        }

      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = size * dpr
      canvas.height = size * dpr
      ctx.scale(dpr, dpr)

      var moduleCount = qr.length
      var cellSize = size / moduleCount

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)

      ctx.fillStyle = fgColor
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount; col++) {
          if (qr[row][col]) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize + 0.5, cellSize + 0.5)
          }
        }
      }

      setTimeout(function() {
        wx.canvasToTempFilePath({
          canvas: canvas,
          width: size,
          height: size,
          destWidth: size * 2,
          destHeight: size * 2,
          fileType: 'png',
          quality: 1,
          success: function(res2) {
            that.setData({
              qrDataUrl: res2.tempFilePath,
              showResult: true,
              isGenerating: false
            })
            that._saveHistory(text)
            var tracker = getApp().tracker
            if (tracker) tracker.toolUse(8, '二维码生成', false)
          },
          fail: function() {
            that.setData({ isGenerating: false })
            wx.showToast({ title: that.data.i18n.exportFail, icon: 'none' })
          }
        })
      }, 100)
    })
    }, 200)
  },

  _saveHistory: function(text) {
    try {
      var history = storageUtil.safeGetArray('qr_history')
      var newHistory = []
      for (var i = 0; i < history.length; i++) {
        if (history[i] !== text) newHistory.push(history[i])
      }
      newHistory.unshift(text)
      if (newHistory.length > 10) newHistory = newHistory.slice(0, 10)
      storageUtil.safeSet('qr_history', newHistory)
      this.setData({ history: newHistory.slice(0, 5) })
    } catch(e) {}
  },

  onHistoryClick: function(e) {
    var text = e.currentTarget.dataset.text
    this.setData({ inputText: text })
  },

  clearHistory: function() {
    wx.removeStorageSync('qr_history')
    this.setData({ history: [] })
    wx.showToast({ title: this.data.i18n.cleared, icon: 'success' })
  },

  saveToAlbum: function() {
    var that = this
    if (!this.data.qrDataUrl) {
      wx.showToast({ title: this.data.i18n.pleaseGenerateFirst, icon: 'none' })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: that.data.qrDataUrl,
      success: function() {
        wx.showToast({ title: that.data.i18n.savedToAlbum, icon: 'success' })
      },
      fail: function(err) {
        if (err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
          wx.showModal({
            title: that.data.i18n.needAuth,
            content: that.data.i18n.allowAlbumAccess,
            success: function(res) {
              if (res.confirm) wx.openSetting()
            }
          })
        } else {
          wx.showToast({ title: that.data.i18n.saveFail, icon: 'none' })
        }
      }
    })
  },

  copyResult: function() {
    var that = this
    if (!this.data.inputText) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.inputText,
      success: function() { wx.showToast({ title: that.data.i18n.copiedContent, icon: 'success' }) }
    })
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.resetAll()
    })
  },

  scanQRCode: function() {
    var that = this
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: function(res) {
        var result = res.result || ''
        if (!result) {
          wx.showToast({ title: that.data.i18n.noContentRecognized, icon: 'none' })
          return
        }
        that.setData({
          inputText: result,
          showResult: false,
          qrDataUrl: ''
        })
        wx.vibrateShort({ type: 'medium' })

        var isUrl = /^https?:\/\//i.test(result)
        wx.showModal({
          title: that.data.i18n.scanResult,
          content: result.length > 200 ? result.substring(0, 200) + '...' : result,
          showCancel: true,
          cancelText: that.data.i18n.generateQR,
          confirmText: isUrl ? that.data.i18n.openLink : that.data.i18n.copy,
          success: function(modalRes) {
            if (modalRes.confirm) {
              if (isUrl) {
                wx.copyClipboardData && wx.copyClipboardData({ data: result })
                wx.vibrateShort({ type: 'light' })
                wx.setClipboardData({
                  data: result,
                  success: function() {
                    wx.showToast({ title: that.data.i18n.linkCopied, icon: 'success' })
                  }
                })
              } else {
                wx.vibrateShort({ type: 'light' })
                wx.setClipboardData({
                  data: result,
                  success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
                })
              }
            } else {
              that.generateQR()
            }
          }
        })
      },
      fail: function(err) {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: that.data.i18n.scanFail, icon: 'none' })
        }
      }
    })
  },

  resetAll: function() {
    this.setData({
      inputText: '',
      qrDataUrl: '',
      showResult: false,
      sizeIndex: 1,
      colorIndex: 0,
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      qrSize: 200
    })
  },

  _generateQRMatrix: function(text) {
    var QR = this._QRCode
    for (var tn = 1; tn <= 40; tn++) {
      try {
        var qr = new QR(tn, 'M')
        qr.addData(text)
        qr.make()
        var count = qr.getModuleCount()
        var matrix = []
        for (var r = 0; r < count; r++) {
          var row = []
          for (var c = 0; c < count; c++) {
            row.push(qr.isDark(r, c))
          }
          matrix.push(row)
        }
        return matrix
      } catch(e) {
        continue
      }
    }
    return null
  },

  _QRCode: (function() {
    var QRCode = function(typeNumber, errorCorrectionLevel) {
      this.typeNumber = typeNumber
      this.errorCorrectionLevel = errorCorrectionLevel
      this.modules = null
      this.moduleCount = 0
      this.dataCache = null
      this.dataList = []
    }

    QRCode.prototype = {
      addData: function(data) { this.dataList.push(new QR8bitByte(data)); this.dataCache = null },
      isDark: function(row, col) { if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) throw row + "," + col; return this.modules[row][col] },
      getModuleCount: function() { return this.moduleCount },
      make: function() { this.makeImpl(true, this.getBestMaskPattern()) },
      makeImpl: function(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17
        this.modules = new Array(this.moduleCount)
        for (var row = 0; row < this.moduleCount; row++) { this.modules[row] = new Array(this.moduleCount); for (var col = 0; col < this.moduleCount; col++) this.modules[row][col] = null }
        this.setupPositionProbePattern(0, 0); this.setupPositionProbePattern(this.moduleCount - 7, 0); this.setupPositionProbePattern(0, this.moduleCount - 7)
        this.setupPositionAdjustPattern(); this.setupTimingPattern()
        this.setupTypeInfo(test, maskPattern)
        if (this.typeNumber >= 7) this.setupTypeNumber(test)
        if (this.dataCache == null) this.dataCache = createData(this.typeNumber, this.errorCorrectionLevel, this.dataList)
        this.mapData(this.dataCache, maskPattern)
      },
      setupPositionProbePattern: function(row, col) { for (var r = -1; r <= 7; r++) { if (row + r <= -1 || this.moduleCount <= row + r) continue; for (var c = -1; c <= 7; c++) { if (col + c <= -1 || this.moduleCount <= col + c) continue; if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) this.modules[row + r][col + c] = true; else this.modules[row + r][col + c] = false } } },
      getBestMaskPattern: function() { var minLostPoint = 0; var pattern = 0; for (var i = 0; i < 8; i++) { this.makeImpl(true, i); var lostPoint = QRUtil.getLostPoint(this); if (i == 0 || minLostPoint > lostPoint) { minLostPoint = lostPoint; pattern = i } } return pattern },
      setupTimingPattern: function() { for (var r = 8; r < this.moduleCount - 8; r++) { if (this.modules[r][6] != null) continue; this.modules[r][6] = (r % 2 == 0) } for (var c = 8; c < this.moduleCount - 8; c++) { if (this.modules[6][c] != null) continue; this.modules[6][c] = (c % 2 == 0) } },
      setupPositionAdjustPattern: function() { var pos = QRUtil.getPatternPosition(this.typeNumber); for (var i = 0; i < pos.length; i++) { for (var j = 0; j < pos.length; j++) { var row = pos[i]; var col = pos[j]; if (this.modules[row][col] != null) continue; for (var r = -2; r <= 2; r++) { for (var c = -2; c <= 2; c++) { if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) this.modules[row + r][col + c] = true; else this.modules[row + r][col + c] = false } } } } },
      setupTypeNumber: function(test) { var bits = QRUtil.getBCHTypeNumber(this.typeNumber); for (var i = 0; i < 18; i++) { var mod = (!test && ((bits >> i) & 1) == 1); this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod } for (var i2 = 0; i2 < 18; i2++) { var mod2 = (!test && ((bits >> i2) & 1) == 1); this.modules[i2 % 3 + this.moduleCount - 8 - 3][Math.floor(i2 / 3)] = mod2 } },
      setupTypeInfo: function(test, maskPattern) { var data = (this.errorCorrectionLevel << 3) | maskPattern; var bits = QRUtil.getBCHTypeInfo(data); for (var i = 0; i < 15; i++) { var mod = (!test && ((bits >> i) & 1) == 1); if (i < 6) this.modules[i][8] = mod; else if (i < 8) this.modules[i + 1][8] = mod; else this.modules[this.moduleCount - 15 + i][8] = mod } for (var i2 = 0; i2 < 15; i2++) { var mod2 = (!test && ((bits >> i2) & 1) == 1); if (i2 < 8) this.modules[8][this.moduleCount - i2 - 1] = mod2; else if (i2 < 9) this.modules[8][15 - i2 - 1 + 1] = mod2; else this.modules[8][15 - i2 - 1] = mod2 } this.modules[this.moduleCount - 8][8] = (!test) },
      mapData: function(data, maskPattern) { var inc = -1; var row = this.moduleCount - 1; var bitIndex = 7; var byteIndex = 0; for (var col = this.moduleCount - 1; col > 0; col -= 2) { if (col == 6) col--; while (true) { for (var c = 0; c < 2; c++) { if (this.modules[row][col - c] == null) { var dark = false; if (byteIndex < data.length) dark = (((data[byteIndex] >>> bitIndex) & 1) == 1); var mask = QRUtil.getMask(maskPattern, row, col - c); if (mask) dark = !dark; this.modules[row][col - c] = dark; bitIndex--; if (bitIndex == -1) { byteIndex++; bitIndex = 7 } } } row += inc; if (row < 0 || this.moduleCount <= row) { row -= inc; inc = -inc; break } } } }
    }

    var QR8bitByte = function(data) { this.mode = 4; this.data = data }
    QR8bitByte.prototype = { getLength: function() { var len = 0; for (var i = 0; i < this.data.length; i++) { var c = this.data.charCodeAt(i); if (c < 0x80) len += 1; else if (c < 0x800) len += 2; else len += 3 } return len }, write: function(buffer) { for (var i = 0; i < this.data.length; i++) { var c = this.data.charCodeAt(i); if (c < 0x80) { buffer.put(c, 8) } else if (c < 0x800) { buffer.put(0xC0 | (c >> 6), 8); buffer.put(0x80 | (c & 0x3F), 8) } else { buffer.put(0xE0 | (c >> 12), 8); buffer.put(0x80 | ((c >> 6) & 0x3F), 8); buffer.put(0x80 | (c & 0x3F), 8) } } } }

    var QRUtil = {
      PATTERN_POSITION_TABLE: [[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],
      G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
      G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
      G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
      getBCHTypeInfo: function(data) { var d = data << 10; while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15))); return ((data << 10) | d) ^ QRUtil.G15_MASK },
      getBCHTypeNumber: function(data) { var d = data << 12; while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18))); return (data << 12) | d },
      getBCHDigit: function(data) { var digit = 0; while (data != 0) { digit++; data >>>= 1 } return digit },
      getPatternPosition: function(typeNumber) { return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1] },
      getMask: function(maskPattern, i, j) { switch (maskPattern) { case 0: return (i + j) % 2 == 0; case 1: return i % 2 == 0; case 2: return j % 3 == 0; case 3: return (i + j) % 3 == 0; case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0; case 5: return (i * j) % 2 + (i * j) % 3 == 0; case 6: return ((i * j) % 2 + (i * j) % 3) % 2 == 0; case 7: return ((i * j) % 3 + (i + j) % 2) % 2 == 0; default: throw "bad maskPattern:" + maskPattern } },
      getErrorCorrectPolynomial: function(errorCorrectLength) { var a = new QRPolynomial([1], 0); for (var i = 0; i < errorCorrectLength; i++) a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0)); return a },
      getLengthInBits: function(mode, type) { if (1 <= type && type < 10) { switch(mode) { case 1: return 10; case 2: return 9; case 4: return 8; case 8: return 8; default: throw "mode:" + mode } } else if (type < 27) { switch(mode) { case 1: return 12; case 2: return 11; case 4: return 16; case 8: return 10; default: throw "mode:" + mode } } else if (type < 41) { switch(mode) { case 1: return 14; case 2: return 13; case 4: return 16; case 8: return 12; default: throw "mode:" + mode } } else throw "type:" + type },
      getLostPoint: function(qrCode) { var moduleCount = qrCode.getModuleCount(); var lostPoint = 0; for (var row = 0; row < moduleCount; row++) { for (var col = 0; col < moduleCount; col++) { var sameCount = 0; var dark = qrCode.isDark(row, col); for (var r = -1; r <= 1; r++) { if (row + r < 0 || moduleCount <= row + r) continue; for (var c = -1; c <= 1; c++) { if (col + c < 0 || moduleCount <= col + c) continue; if (r == 0 && c == 0) continue; if (dark == qrCode.isDark(row + r, col + c)) sameCount++ } } if (sameCount > 5) lostPoint += (3 + sameCount - 5) } } for (var row2 = 0; row2 < moduleCount - 1; row2++) { for (var col2 = 0; col2 < moduleCount - 1; col2++) { var count = 0; if (qrCode.isDark(row2, col2)) count++; if (qrCode.isDark(row2 + 1, col2)) count++; if (qrCode.isDark(row2, col2 + 1)) count++; if (qrCode.isDark(row2 + 1, col2 + 1)) count++; if (count == 0 || count == 4) lostPoint += 3 } } for (var row3 = 0; row3 < moduleCount; row3++) { for (var col3 = 0; col3 < moduleCount - 6; col3++) { if (qrCode.isDark(row3, col3) && !qrCode.isDark(row3, col3 + 1) && qrCode.isDark(row3, col3 + 2) && qrCode.isDark(row3, col3 + 3) && qrCode.isDark(row3, col3 + 4) && !qrCode.isDark(row3, col3 + 5) && qrCode.isDark(row3, col3 + 6)) lostPoint += 40 } } for (var col4 = 0; col4 < moduleCount; col4++) { for (var row4 = 0; row4 < moduleCount - 6; row4++) { if (qrCode.isDark(row4, col4) && !qrCode.isDark(row4 + 1, col4) && qrCode.isDark(row4 + 2, col4) && qrCode.isDark(row4 + 3, col4) && qrCode.isDark(row4 + 4, col4) && !qrCode.isDark(row4 + 5, col4) && qrCode.isDark(row4 + 6, col4)) lostPoint += 40 } } var darkCount = 0; for (var col5 = 0; col5 < moduleCount; col5++) { for (var row5 = 0; row5 < moduleCount; row5++) { if (qrCode.isDark(row5, col5)) darkCount++ } } var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5; lostPoint += ratio * 10; return lostPoint }
    }

    var QRMath = {
      glog: function(n) { if (n < 1) throw "glog(" + n + ")"; return QRMath.LOG_TABLE[n] },
      gexp: function(n) { while (n < 0) n += 255; while (n >= 256) n -= 255; return QRMath.EXP_TABLE[n] },
      EXP_TABLE: new Array(256), LOG_TABLE: new Array(256)
    }
    for (var i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i
    for (var i2 = 8; i2 < 256; i2++) QRMath.EXP_TABLE[i2] = QRMath.EXP_TABLE[i2 - 4] ^ QRMath.EXP_TABLE[i2 - 5] ^ QRMath.EXP_TABLE[i2 - 6] ^ QRMath.EXP_TABLE[i2 - 8]
    for (var i3 = 0; i3 < 255; i3++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i3]] = i3

    function QRPolynomial(num, shift) { if (num.length == undefined) throw num.length + "/" + shift; var offset = 0; while (offset < num.length && num[offset] == 0) offset++; this.num = new Array(num.length - offset + shift); for (var i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset] }
    QRPolynomial.prototype = {
      get: function(index) { return this.num[index] },
      getLength: function() { return this.num.length },
      multiply: function(e) { var num = new Array(this.getLength() + e.getLength() - 1); for (var i = 0; i < this.getLength(); i++) for (var j = 0; j < e.getLength(); j++) num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j))); return new QRPolynomial(num, 0) },
      mod: function(e) { if (this.getLength() - e.getLength() < 0) return this; var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0)); var num = new Array(this.getLength()); for (var i = 0; i < this.getLength(); i++) num[i] = this.get(i); for (var i2 = 0; i2 < e.getLength(); i2++) num[i2] ^= QRMath.gexp(QRMath.glog(e.get(i2)) + ratio); return new QRPolynomial(num, 0).mod(e) }
    }

    function QRBitBuffer() { this.buffer = []; this.length = 0 }
    QRBitBuffer.prototype = {
      get: function(index) { var bufIndex = Math.floor(index / 8); return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1 },
      put: function(num, length) { for (var i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) == 1) },
      getLengthInBits: function() { return this.length },
      putBit: function(bit) { var bufIndex = Math.floor(this.length / 8); if (this.buffer.length <= bufIndex) this.buffer.push(0); if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8)); this.length++ }
    }

    var RS_BLOCK_TABLE = [[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[8,50,22,4,51,23],[8,50,14,4,51,15],[3,116,92,2,117,93],[2,58,36,6,59,37],[4,46,20,6,47,21],[6,46,16,2,47,17],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[4,46,14,8,47,15],[3,145,115,1,146,116],[4,64,40,5,65,41],[3,36,16,11,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,54,16,5,55,17],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]]

    function QRRSBlock(totalCount, dataCount) { this.totalCount = totalCount; this.dataCount = dataCount }
    QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectionLevel) { var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel); if (rsBlock == undefined) throw "bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel; var length = rsBlock.length / 3; var list = []; for (var i = 0; i < length; i++) { var count = rsBlock[i * 3 + 0]; var totalCount = rsBlock[i * 3 + 1]; var dataCount = rsBlock[i * 3 + 2]; for (var j = 0; j < count; j++) list.push(new QRRSBlock(totalCount, dataCount)) } return list }
    function getRsBlockTable(typeNumber, errorCorrectionLevel) { switch(errorCorrectionLevel) { case 'L': return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0]; case 'M': return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1]; case 'Q': return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2]; case 'H': return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3]; default: return undefined } }

    function createData(typeNumber, errorCorrectionLevel, dataList) {
      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel)
      var buffer = new QRBitBuffer()
      for (var i = 0; i < dataList.length; i++) {
        var data = dataList[i]
        buffer.put(data.mode, 4)
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber))
        data.write(buffer)
      }
      var totalDataCount = 0
      for (var i2 = 0; i2 < rsBlocks.length; i2++) totalDataCount += rsBlocks[i2].dataCount
      if (buffer.getLengthInBits() > totalDataCount * 8) throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")"
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4)
      while (buffer.getLengthInBits() % 8 != 0) buffer.putBit(false)
      while (true) {
        if (buffer.getLengthInBits() >= totalDataCount * 8) break
        buffer.put(0xEC, 8)
        if (buffer.getLengthInBits() >= totalDataCount * 8) break
        buffer.put(0x11, 8)
      }
      return createBytes(buffer, rsBlocks)
    }

    function createBytes(buffer, rsBlocks) {
      var offset = 0; var maxDcCount = 0; var maxEcCount = 0; var dcdata = new Array(rsBlocks.length); var ecdata = new Array(rsBlocks.length)
      for (var r = 0; r < rsBlocks.length; r++) { var dcCount = rsBlocks[r].dataCount; var ecCount = rsBlocks[r].totalCount - dcCount; maxDcCount = Math.max(maxDcCount, dcCount); maxEcCount = Math.max(maxEcCount, ecCount); dcdata[r] = new Array(dcCount); for (var i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xff & buffer.buffer[i + offset]; offset += dcCount; var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount); var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1); var modPoly = rawPoly.mod(rsPoly); ecdata[r] = new Array(rsPoly.getLength() - 1); for (var i2 = 0; i2 < ecdata[r].length; i2++) { var modIndex = i2 + modPoly.getLength() - ecdata[r].length; ecdata[r][i2] = (modIndex >= 0) ? modPoly.get(modIndex) : 0 } }
      var totalCodeCount = 0; for (var i3 = 0; i3 < rsBlocks.length; i3++) totalCodeCount += rsBlocks[i3].totalCount
      var data = new Array(totalCodeCount); var index = 0
      for (var i4 = 0; i4 < maxDcCount; i4++) { for (var r2 = 0; r2 < rsBlocks.length; r2++) { if (i4 < dcdata[r2].length) { data[index++] = dcdata[r2][i4] } } }
      for (var i5 = 0; i5 < maxEcCount; i5++) { for (var r3 = 0; r3 < rsBlocks.length; r3++) { if (i5 < ecdata[r3].length) { data[index++] = ecdata[r3][i5] } } }
      return data
    }

    return QRCode
  })(),

  onShareAppMessage: function() {
    return poster.getShareConfig('二维码生成器 - 百宝工具箱', '/package-text/qr-code/qr-code', '在线生成二维码，文本网址一键转码')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('二维码生成器 - 文本网址在线转码')
  }
})
