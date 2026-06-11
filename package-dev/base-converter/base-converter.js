var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var ASCII_TABLE = [
  { dec: 0, char: 'NUL' }, { dec: 1, char: 'SOH' }, { dec: 2, char: 'STX' },
  { dec: 3, char: 'ETX' }, { dec: 4, char: 'EOT' }, { dec: 5, char: 'ENQ' },
  { dec: 6, char: 'ACK' }, { dec: 7, char: 'BEL' }, { dec: 8, char: 'BS' },
  { dec: 9, char: 'TAB' }, { dec: 10, char: 'LF' }, { dec: 11, char: 'VT' },
  { dec: 12, char: 'FF' }, { dec: 13, char: 'CR' }, { dec: 14, char: 'SO' },
  { dec: 15, char: 'SI' }, { dec: 16, char: 'DLE' }, { dec: 17, char: 'DC1' },
  { dec: 18, char: 'DC2' }, { dec: 19, char: 'DC3' }, { dec: 20, char: 'DC4' },
  { dec: 21, char: 'NAK' }, { dec: 22, char: 'SYN' }, { dec: 23, char: 'ETB' },
  { dec: 24, char: 'CAN' }, { dec: 25, char: 'EM' }, { dec: 26, char: 'SUB' },
  { dec: 27, char: 'ESC' }, { dec: 28, char: 'FS' }, { dec: 29, char: 'GS' },
  { dec: 30, char: 'RS' }, { dec: 31, char: 'US' }, { dec: 32, char: 'SP' },
  { dec: 33, char: '!' }, { dec: 34, char: '"' }, { dec: 35, char: '#' },
  { dec: 36, char: '$' }, { dec: 37, char: '%' }, { dec: 38, char: '&' },
  { dec: 39, char: "'" }, { dec: 40, char: '(' }, { dec: 41, char: ')' },
  { dec: 42, char: '*' }, { dec: 43, char: '+' }, { dec: 44, char: ',' },
  { dec: 45, char: '-' }, { dec: 46, char: '.' }, { dec: 47, char: '/' },
  { dec: 48, char: '0' }, { dec: 49, char: '1' }, { dec: 50, char: '2' },
  { dec: 51, char: '3' }, { dec: 52, char: '4' }, { dec: 53, char: '5' },
  { dec: 54, char: '6' }, { dec: 55, char: '7' }, { dec: 56, char: '8' },
  { dec: 57, char: '9' }, { dec: 58, char: ':' }, { dec: 59, char: ';' },
  { dec: 60, char: '<' }, { dec: 61, char: '=' }, { dec: 62, char: '>' },
  { dec: 63, char: '?' }, { dec: 64, char: '@' }, { dec: 65, char: 'A' },
  { dec: 66, char: 'B' }, { dec: 67, char: 'C' }, { dec: 68, char: 'D' },
  { dec: 69, char: 'E' }, { dec: 70, char: 'F' }, { dec: 71, char: 'G' },
  { dec: 72, char: 'H' }, { dec: 73, char: 'I' }, { dec: 74, char: 'J' },
  { dec: 75, char: 'K' }, { dec: 76, char: 'L' }, { dec: 77, char: 'M' },
  { dec: 78, char: 'N' }, { dec: 79, char: 'O' }, { dec: 80, char: 'P' },
  { dec: 81, char: 'Q' }, { dec: 82, char: 'R' }, { dec: 83, char: 'S' },
  { dec: 84, char: 'T' }, { dec: 85, char: 'U' }, { dec: 86, char: 'V' },
  { dec: 87, char: 'W' }, { dec: 88, char: 'X' }, { dec: 89, char: 'Y' },
  { dec: 90, char: 'Z' }, { dec: 91, char: '[' }, { dec: 92, char: '\\' },
  { dec: 93, char: ']' }, { dec: 94, char: '^' }, { dec: 95, char: '_' },
  { dec: 96, char: '`' }, { dec: 97, char: 'a' }, { dec: 98, char: 'b' },
  { dec: 99, char: 'c' }, { dec: 100, char: 'd' }, { dec: 101, char: 'e' },
  { dec: 102, char: 'f' }, { dec: 103, char: 'g' }, { dec: 104, char: 'h' },
  { dec: 105, char: 'i' }, { dec: 106, char: 'j' }, { dec: 107, char: 'k' },
  { dec: 108, char: 'l' }, { dec: 109, char: 'm' }, { dec: 110, char: 'n' },
  { dec: 111, char: 'o' }, { dec: 112, char: 'p' }, { dec: 113, char: 'q' },
  { dec: 114, char: 'r' }, { dec: 115, char: 's' }, { dec: 116, char: 't' },
  { dec: 117, char: 'u' }, { dec: 118, char: 'v' }, { dec: 119, char: 'w' },
  { dec: 120, char: 'x' }, { dec: 121, char: 'y' }, { dec: 122, char: 'z' },
  { dec: 123, char: '{' }, { dec: 124, char: '|' }, { dec: 125, char: '}' },
  { dec: 126, char: '~' }, { dec: 127, char: 'DEL' }
]

for (var ai = 0; ai < ASCII_TABLE.length; ai++) {
  var entry = ASCII_TABLE[ai]
  entry.hex = entry.dec.toString(16).toUpperCase()
  entry.bin = entry.dec.toString(2).padStart(8, '0')
}

Page({
  data: {
    activeBase: 10,
    inputValue: '',
    baseLabels: { 2: '二进制', 8: '八进制', 10: '十进制', 16: '十六进制', 32: '三十二进制' },
    hasResult: false,
    errorMessage: '',
    binValue: '', octValue: '', decValue: '', hexValue: '', b32Value: '',
    bitLength: 0,
    complement8: '', complement16: '', complement32: '',
    asciiTable: ASCII_TABLE.slice(32, 128),
    asciiSearch: '',
    asciiFiltered: null,

    bitVisual: [],
    showBitVisual: false,
    bitOps: { not: '', shl1: '', shr1: '', and0xFF: '' },

    colorHex: '',
    colorR: 0, colorG: 0, colorB: 0,
    showColorLink: false,

    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  onLoad: function() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
    var i18nTexts = i18n.getToolPageTexts('baseConverter')
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('进制转换')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    poster.setupForPage(this, 13)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('baseConverter') })
  },

  onBaseTap: function(e) {
    var base = Number(e.currentTarget.dataset.base)
    this.setData({ activeBase: base, errorMessage: '' })
  },

  onInput: function(e) {
    this.setData({ inputValue: e.detail.value })
    this.convert()
  },

  onInputBlur: function() {
    this.convert()
  },

  onClear: function() {
    this.setData({ inputValue: '', hasResult: false, errorMessage: '' })
  },

  onQuickInput: function(e) {
    var val = e.currentTarget.dataset.val
    this.setData({ inputValue: val })
    this.convert()
  },

  convert: function() {
    var input = this.data.inputValue.trim()
    if (!input) {
      this.setData({ hasResult: false, errorMessage: '' })
      return
    }

    var base = this.data.activeBase
    var validChars = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9a-fA-F]+$/, 32: /^[0-9a-zA-Z]+$/ }
    if (!validChars[base] || !validChars[base].test(input)) {
      this.setData({ errorMessage: this.data.i18n.invalidInputPrefix + this.data.baseLabels[base] + this.data.i18n.invalidInputSuffix, hasResult: false })
      return
    }

    var dec
    try {
      dec = parseInt(input, base)
    } catch (e) {
      this.setData({ errorMessage: this.data.i18n.parseFailed, hasResult: false })
      return
    }

    if (isNaN(dec) || dec < 0 || dec > 4294967295) {
      this.setData({ errorMessage: this.data.i18n.valueOutOfRange, hasResult: false })
      return
    }

    var bin = dec.toString(2)
    var bitLen = bin.length

    var complement8 = dec <= 127 ? bin.padStart(8, '0') : (dec | 0xFFFFFF00).toString(2).slice(-8)
    var complement16 = dec <= 32767 ? bin.padStart(16, '0') : (dec | 0xFFFF0000).toString(2).slice(-16)
    var complement32 = bin.padStart(32, '0')

    var bits = []
    for (var i = 31; i >= 0; i--) {
      bits.push({ bit: (dec >> i) & 1, position: i })
    }

    var notVal = ((~dec) >>> 0) & 0xFFFFFFFF
    var shl1 = (dec << 1) >>> 0
    var shr1 = dec >>> 1
    var andFF = dec & 0xFF

    var colorHex = ''
    var colorR = 0, colorG = 0, colorB = 0
    var showColorLink = false
    if (dec >= 0 && dec <= 16777215) {
      colorR = (dec >> 16) & 0xFF
      colorG = (dec >> 8) & 0xFF
      colorB = dec & 0xFF
      colorHex = '#' + colorR.toString(16).padStart(2, '0').toUpperCase() + colorG.toString(16).padStart(2, '0').toUpperCase() + colorB.toString(16).padStart(2, '0').toUpperCase()
      showColorLink = true
    }

    this.setData({
      hasResult: true,
      errorMessage: '',
      binValue: bin,
      octValue: dec.toString(8),
      decValue: dec.toString(10),
      hexValue: dec.toString(16).toUpperCase(),
      b32Value: dec.toString(36).toUpperCase(),
      bitLength: bitLen,
      complement8: complement8,
      complement16: complement16,
      complement32: complement32,
      bitVisual: bits,
      showBitVisual: true,
      bitOps: {
        not: 'NOT → ' + notVal.toString(10) + ' (0x' + notVal.toString(16).toUpperCase() + ')',
        shl1: '<< 1 → ' + shl1.toString(10) + ' (0x' + shl1.toString(16).toUpperCase() + ')',
        shr1: '>> 1 → ' + shr1.toString(10) + ' (0x' + shr1.toString(16).toUpperCase() + ')',
        and0xFF: '& 0xFF → ' + andFF.toString(10) + ' (0x' + andFF.toString(16).toUpperCase() + ')'
      },
      colorHex: colorHex,
      colorR: colorR,
      colorG: colorG,
      colorB: colorB,
      showColorLink: showColorLink
    })

    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(13, '进制转换', false)
  },

  toggleBitVisual: function() {
    this.setData({ showBitVisual: !this.data.showBitVisual })
  },

  onBitTap: function(e) {
    var pos = Number(e.currentTarget.dataset.pos)
    var bits = this.data.bitVisual.slice()
    bits[31 - pos].bit = bits[31 - pos].bit ? 0 : 1
    var newDec = 0
    for (var i = 0; i < 32; i++) {
      newDec = newDec * 2 + bits[i].bit
    }
    this.setData({ bitVisual: bits, inputValue: newDec.toString(), activeBase: 10 })
    this.convert()
  },

  onAsciiSearch: function(e) {
    var keyword = e.detail.value.trim().toLowerCase()
    this.setData({ asciiSearch: keyword })
    if (!keyword) {
      this.setData({ asciiFiltered: null })
      return
    }
    var filtered = []
    var table = ASCII_TABLE
    for (var i = 0; i < table.length; i++) {
      var entry = table[i]
      if (entry.dec.toString().indexOf(keyword) >= 0 ||
          entry.hex.toLowerCase().indexOf(keyword) >= 0 ||
          entry.char.toLowerCase().indexOf(keyword) >= 0) {
        filtered.push(entry)
      }
    }
    this.setData({ asciiFiltered: filtered })
  },

  goToColorConverter: function() {
    var url = '/package-dev/color-converter/color-converter'
    if (this.data.colorHex) {
      url = url + '?hex=' + this.data.colorHex.replace('#', '')
    }
    wx.navigateTo({ url: url })
  },

  goToBitVisualizer: function() {
    var url = '/package-dev/bit-visualizer/bit-visualizer'
    if (this.data.decValue) {
      url = url + '?valueA=' + this.data.decValue + '&base=10'
    }
    wx.navigateTo({ url: url })
  },

  onCopyResult: function(e) {
    var val = e.currentTarget.dataset.value
    if (!val) return
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: val,
      success: function() { wx.showToast({ title: that.data.i18n.copied, icon: 'success' }) }
    })
  },

  copyResult: function() {
    if (!this.data.decValue) return
    var text = 'BIN: ' + this.data.binValue + '\nOCT: ' + this.data.octValue + '\nDEC: ' + this.data.decValue + '\nHEX: ' + this.data.hexValue
    toolActions.copyText(text, null, this.data.i18n)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        inputValue: '',
        activeBase: 10,
        hasResult: false,
        errorMessage: '',
        binValue: '', octValue: '', decValue: '', hexValue: '', b32Value: '',
        bitLength: 0,
        complement8: '', complement16: '', complement32: '',
        bitVisual: [],
        showBitVisual: false,
        bitOps: { not: '', shl1: '', shr1: '', and0xFF: '' },
        colorHex: '',
        colorR: 0, colorG: 0, colorB: 0,
        showColorLink: false,
        asciiSearch: '',
        asciiFiltered: null
      })
    }, that.data.i18n)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🔢 进制转换 - 百宝工具箱', '/package-dev/base-converter/base-converter')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('🔢 进制转换 - 百宝工具箱')
  }
})
