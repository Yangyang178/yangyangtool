var presetColors = [
  { value: '#EF4444' }, { value: '#F97316' }, { value: '#F59E0B' },
  { value: '#10B981' }, { value: '#3B82F6' }, { value: '#8B5CF6' },
  { value: '#EC4899' }, { value: '#64748B' }
]

var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var colorPalette = [
  { name: '红', hex: '#EF4444' },
  { name: '橙', hex: '#F97316' },
  { name: '黄', hex: '#F59E0B' },
  { name: '绿', hex: '#10B981' },
  { name: '青', hex: '#06B6D4' },
  { name: '蓝', hex: '#3B82F6' },
  { name: '紫', hex: '#8B5CF6' },
  { name: '粉', hex: '#EC4899' },
  { name: '黑', hex: '#1E293B' },
  { name: '灰', hex: '#64748B' },
  { name: '白', hex: '#FFFFFF' },
  { name: '金', hex: '#D97706' },
  { name: '银', hex: '#94A3B8' },
  { name: '棕', hex: '#92400E' },
  { name: '天蓝', hex: '#0EA5E9' }
]

Page({
  data: {
    currentColor: '#3B82F6',

    hexInput: '3B82F6',
    rValue: '59',
    gValue: '130',
    bValue: '246',
    hValue: '217',
    sValue: '91',
    lValue: '60',

    hexValue: '#3B82F6',
    rgbValue: 'rgb(59, 130, 246)',
    hslValue: 'hsl(217, 91%, 60%)',
    cmykValue: '76%, 47%, 0%, 4%',

    colorName: '蓝色 (Blue)',
    contrastRatio: '12.63:1',

    presetColors: presetColors,
    colorPalette: colorPalette,

    showPicker: false,
    pickerHue: 217,
    pickerS: 91,
    pickerV: 60,
    pickerHuePos: 60.3,
    pickerColor: '#3B82F6',

    palettes: [
      { name: '海洋微风', colors: ['#0EA5E9', '#06B6D4', '#14B8A6', '#10B981', '#059669'] },
      { name: '落日余晖', colors: ['#F97316', '#FB923C', '#F59E0B', '#EAB308', '#FBBF24'] },
      { name: '薰衣草田', colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'] },
      { name: '森林秘境', colors: ['#065F46', '#047857', '#059669', '#10B981', '#34D399'] },
      { name: '樱花烂漫', colors: ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8', '#FDF2F8'] },
      { name: '极光之夜', colors: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1', '#818CF8'] },
      { name: '焦糖拿铁', colors: ['#78350F', '#92400E', '#B45309', '#D97706', '#F59E0B'] },
      { name: '薄荷清新', colors: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399'] }
    ],
    pickedColors: [],
    favoriteColors: [],
    harmonyScheme: null,
    harmonyType: 'complementary',
    harmonyTypes: [
      { id: 'complementary', name: '互补色' },
      { id: 'analogous', name: '类似色' },
      { id: 'triadic', name: '三角色' },
      { id: 'split', name: '分裂互补' },
      { id: 'tetradic', name: '四角色' }
    ],
    gradientStart: '#3B82F6',
    gradientEnd: '#EC4899',
    gradientAngle: 135,
    gradientCSS: '',
    isDarkMode: false,
    fontSizeSetting: 'medium'
  },

  onLoad: function(options) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var i18nTexts = i18n.getToolPageTexts('colorConverter')
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('颜色转换')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    var initHex = '#3B82F6'
    if (options && options.hex) {
      var hex = options.hex
      if (hex.length === 6) {
        initHex = '#' + hex.toUpperCase()
      }
    }
    this.initColor(initHex)
    this.loadFavorites()
    this.generateHarmony()
    this.updateGradientCSS()
    poster.setupForPage(this, 18)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('colorConverter') })
  },

  initPicker: function() {
    var hsl = this.rgbToHsl(59, 130, 246)
    this.setData({
      pickerHue: hsl.h,
      pickerS: hsl.s,
      pickerV: hsl.l,
      pickerHuePos: (hsl.h / 360) * 100
    })
  },

  showColorPicker: function() {
    wx.vibrateShort({ type: 'light' })
    var hsl = this.rgbToHsl(
      parseInt(this.data.rValue) || 0,
      parseInt(this.data.gValue) || 0,
      parseInt(this.data.bValue) || 0
    )
    this.setData({
      showPicker: true,
      pickerHue: hsl.h,
      pickerS: hsl.s,
      pickerV: hsl.l,
      pickerHuePos: (hsl.h / 360) * 100
    })
  },

  hideColorPicker: function() {
    this.setData({ showPicker: false })
  },

  updatePickerColor: function() {
    var rgb = this.hsvToRgb(
      this.data.pickerHue,
      this.data.pickerS,
      this.data.pickerV
    )
    var hex = this.rgbToHex(rgb.r, rgb.g, rgb.b)
    this.initColor(hex)
    this.setData({
      pickerColor: '#' + hex
    })
  },

  pickQuickColor: function(e) {
    wx.vibrateShort({ type: 'light' })
    var hex = e.currentTarget.dataset.hex
    this.initColor(hex)
  },

  hsvToRgb: function(h, s, v) {
    h /= 360
    s /= 100
    v /= 100
    var r, g, b
    var i = Math.floor(h * 6)
    var f = h * 6 - i
    var p = v * (1 - s)
    var q = v * (1 - f * s)
    var t = v * (1 - (1 - f) * s)
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break
      case 1: r = q; g = v; b = p; break
      case 2: r = p; g = v; b = t; break
      case 3: r = p; g = q; b = v; break
      case 4: r = t; g = p; b = v; break
      case 5: r = v; g = p; b = q; break
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  },

  onSvTouchStart: function(e) {
    this.handleSvTouch(e)
  },

  onSvTouchMove: function(e) {
    this.handleSvTouch(e)
  },

  handleSvTouch: function(e) {
    var that = this
    var touch = e.touches[0]
    var query = wx.createSelectorQuery().in(this)
    query.select('.sv-container').boundingClientRect().exec(function(res) {
      if (!res[0]) return
      var rect = res[0]
      var s = ((touch.clientX - rect.left) / rect.width) * 100
      var v = (1 - (touch.clientY - rect.top) / rect.height) * 100
      s = Math.max(0, Math.min(100, s))
      v = Math.max(0, Math.min(100, v))
      that.setData({ pickerS: s, pickerV: v })
      that.updatePickerColor()
    })
  },

  onHueTouchStart: function(e) {
    this.handleHueTouch(e)
  },

  onHueTouchMove: function(e) {
    this.handleHueTouch(e)
  },

  handleHueTouch: function(e) {
    var that = this
    var touch = e.touches[0]
    var query = wx.createSelectorQuery().in(this)
    query.select('.hue-container').boundingClientRect().exec(function(res) {
      if (!res[0]) return
      var rect = res[0]
      var hue = ((touch.clientX - rect.left) / rect.width) * 360
      hue = Math.max(0, Math.min(360, hue))
      that.setData({
        pickerHue: hue,
        pickerHuePos: (hue / 360) * 100
      })
      that.updatePickerColor()
    })
  },

  initColor: function(hex) {
    var cleanHex = hex.replace('#', '')
    var rgb = this.hexToRgb(cleanHex)
    var hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    var cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b)

    this.setData({
      currentColor: '#' + cleanHex.toUpperCase(),
      hexInput: cleanHex.toUpperCase(),
      rValue: String(rgb.r),
      gValue: String(rgb.g),
      bValue: String(rgb.b),
      hValue: String(Math.round(hsl.h)),
      sValue: String(Math.round(hsl.s)),
      lValue: String(Math.round(hsl.l)),
      hexValue: '#' + cleanHex.toUpperCase(),
      rgbValue: 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')',
      hslValue: 'hsl(' + Math.round(hsl.h) + ', ' + Math.round(hsl.s) + '%, ' + Math.round(hsl.l) + '%)',
      cmykValue: cmyk.c + '%, ' + cmyk.m + '%, ' + cmyk.y + '%, ' + cmyk.k + '%',
      colorName: this.getColorName(rgb.r, rgb.g, rgb.b),
      contrastRatio: this.calculateContrast(rgb.r, rgb.g, rgb.b)
    })
    this.generateHarmony()
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(18, '颜色转换', false)
  },

  onHexInput: function(e) {
    var value = e.detail.value.replace(/[^a-fA-F0-9]/g, '').toUpperCase()
    if (value.length > 6) value = value.substring(0, 6)
    this.setData({ hexInput: value })
    if (value.length === 6 && /^[0-9A-F]{6}$/.test(value)) {
      wx.vibrateShort({ type: 'light' })
      this.initColor('#' + value)
    }
  },

  onRInput: function(e) {
    var value = parseInt(e.detail.value) || 0
    value = Math.max(0, Math.min(255, value))
    this.setData({ rValue: String(value) })
    this.updateFromRgb()
  },

  onGInput: function(e) {
    var value = parseInt(e.detail.value) || 0
    value = Math.max(0, Math.min(255, value))
    this.setData({ gValue: String(value) })
    this.updateFromRgb()
  },

  onBInput: function(e) {
    var value = parseInt(e.detail.value) || 0
    value = Math.max(0, Math.min(255, value))
    this.setData({ bValue: String(value) })
    this.updateFromRgb()
  },

  onHInput: function(e) {
    var value = parseFloat(e.detail.value) || 0
    value = Math.max(0, Math.min(360, value))
    this.setData({ hValue: String(Math.round(value)) })
    this.updateFromHsl()
  },

  onSInput: function(e) {
    var value = parseFloat(e.detail.value) || 0
    value = Math.max(0, Math.min(100, value))
    this.setData({ sValue: String(Math.round(value)) })
    this.updateFromHsl()
  },

  onLInput: function(e) {
    var value = parseFloat(e.detail.value) || 0
    value = Math.max(0, Math.min(100, value))
    this.setData({ lValue: String(Math.round(value)) })
    this.updateFromHsl()
  },

  updateFromRgb: function() {
    var r = parseInt(this.data.rValue) || 0
    var g = parseInt(this.data.gValue) || 0
    var b = parseInt(this.data.bValue) || 0
    var hex = this.rgbToHex(r, g, b)
    var hsl = this.rgbToHsl(r, g, b)
    var cmyk = this.rgbToCmyk(r, g, b)
    this.setData({
      currentColor: '#' + hex.toUpperCase(),
      hexInput: hex.toUpperCase(),
      hexValue: '#' + hex.toUpperCase(),
      rgbValue: 'rgb(' + r + ', ' + g + ', ' + b + ')',
      hslValue: 'hsl(' + Math.round(hsl.h) + ', ' + Math.round(hsl.s) + '%, ' + Math.round(hsl.l) + '%)',
      cmykValue: cmyk.c + '%, ' + cmyk.m + '%, ' + cmyk.y + '%, ' + cmyk.k + '%',
      hValue: String(Math.round(hsl.h)),
      sValue: String(Math.round(hsl.s)),
      lValue: String(Math.round(hsl.l)),
      colorName: this.getColorName(r, g, b),
      contrastRatio: this.calculateContrast(r, g, b)
    })
  },

  updateFromHsl: function() {
    var h = parseFloat(this.data.hValue) || 0
    var s = parseFloat(this.data.sValue) || 0
    var l = parseFloat(this.data.lValue) || 0
    var rgb = this.hslToRgb(h, s, l)
    var hex = this.rgbToHex(rgb.r, rgb.g, rgb.b)
    var cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
    this.setData({
      currentColor: '#' + hex.toUpperCase(),
      hexInput: hex.toUpperCase(),
      rValue: String(rgb.r),
      gValue: String(rgb.g),
      bValue: String(rgb.b),
      hexValue: '#' + hex.toUpperCase(),
      rgbValue: 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')',
      hslValue: 'hsl(' + Math.round(h) + ', ' + Math.round(s) + '%, ' + Math.round(l) + '%)',
      cmykValue: cmyk.c + '%, ' + cmyk.m + '%, ' + cmyk.y + '%, ' + cmyk.k + '%',
      colorName: this.getColorName(rgb.r, rgb.g, rgb.b),
      contrastRatio: this.calculateContrast(rgb.r, rgb.g, rgb.b)
    })
  },

  selectPresetColor: function(e) {
    wx.vibrateShort({ type: 'light' })
    var color = e.currentTarget.dataset.value
    this.initColor(color)
  },

  selectPaletteColor: function(e) {
    wx.vibrateShort({ type: 'medium' })
    var color = e.currentTarget.dataset.color
    this.initColor(color.hex)
  },

  generateRandomColor: function() {
    wx.vibrateShort({ type: 'heavy' })
    var letters = '0123456789ABCDEF'
    var color = ''
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    this.initColor('#' + color)
  },

  invertColor: function() {
    wx.vibrateShort({ type: 'medium' })
    var r = 255 - (parseInt(this.data.rValue) || 0)
    var g = 255 - (parseInt(this.data.gValue) || 0)
    var b = 255 - (parseInt(this.data.bValue) || 0)
    this.setData({
      rValue: String(r),
      gValue: String(g),
      bValue: String(b)
    })
    this.updateFromRgb()
  },

  copyColor: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: this.data.hexValue,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedHexValue, icon: 'success' })
      }
    })
  },

  copyHex: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: this.data.hexValue,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedHex, icon: 'success' })
      }
    })
  },

  copyRgb: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: this.data.rgbValue,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedRgb, icon: 'success' })
      }
    })
  },

  copyHsl: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: this.data.hslValue,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedHsl, icon: 'success' })
      }
    })
  },

  copyCmyk: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: this.data.cmykValue,
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedCmyk, icon: 'success' })
      }
    })
  },

  copyCssHex: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: 'color: ' + this.data.hexValue + ';',
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedCss, icon: 'success' })
      }
    })
  },

  copyCssRgb: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: 'color: rgb(' + this.data.rValue + ', ' + this.data.gValue + ', ' + this.data.bValue + ');',
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedCss, icon: 'success' })
      }
    })
  },

  copyCssHsl: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: 'color: hsl(' + this.data.hValue + ', ' + this.data.sValue + '%, ' + this.data.lValue + '%);',
      success: function() {
        wx.showToast({ title: that.data.i18n.copiedCss, icon: 'success' })
      }
    })
  },

  hexToRgb: function(hex) {
    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  },

  rgbToHex: function(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  },

  rgbToHsl: function(r, g, b) {
    r /= 255
    g /= 255
    b /= 255
    var max = Math.max(r, g, b)
    var min = Math.min(r, g, b)
    var h = 0
    var s = 0
    var l = (max + min) / 2
    if (max !== min) {
      var d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  },

  hslToRgb: function(h, s, l) {
    h /= 360
    s /= 100
    l /= 100
    var r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      var hue2rgb = function(p, q, t) {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s
      var p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  },

  rgbToCmyk: function(r, g, b) {
    if (r === 0 && g === 0 && b === 0) {
      return { c: 0, m: 0, y: 0, k: 100 }
    }
    var c = 1 - (r / 255)
    var m = 1 - (g / 255)
    var y = 1 - (b / 255)
    var k = Math.min(c, m, y)
    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100)
    }
  },

  getColorName: function(r, g, b) {
    var colors = [
      { name: '红色', test: function(rr, gg, bb) { return rr > 200 && gg < 80 && bb < 80 } },
      { name: '橙色', test: function(rr, gg, bb) { return rr > 200 && gg > 100 && bb < 80 } },
      { name: '黄色', test: function(rr, gg, bb) { return rr > 200 && gg > 200 && bb < 100 } },
      { name: '绿色', test: function(rr, gg, bb) { return rr < 100 && gg > 180 && bb < 100 } },
      { name: '青色', test: function(rr, gg, bb) { return rr < 100 && gg > 150 && bb > 150 } },
      { name: '蓝色', test: function(rr, gg, bb) { return rr < 100 && gg < 120 && bb > 180 } },
      { name: '紫色', test: function(rr, gg, bb) { return rr > 140 && gg < 100 && bb > 140 } },
      { name: '粉色', test: function(rr, gg, bb) { return rr > 220 && gg < 160 && bb > 160 } },
      { name: '白色', test: function(rr, gg, bb) { return rr > 240 && gg > 240 && bb > 240 } },
      { name: '灰色', test: function(rr, gg, bb) { return Math.abs(rr - gg) < 30 && Math.abs(gg - bb) < 30 && rr < 200 && rr > 50 } },
      { name: '黑色', test: function(rr, gg, bb) { return rr < 40 && gg < 40 && bb < 40 } },
      { name: '棕色', test: function(rr, gg, bb) { return rr > 120 && gg > 70 && gg < 150 && bb < 80 } },
      { name: '自定义色', test: function() { return true } }
    ]
    for (var ci = 0; ci < colors.length; ci++) {
      if (colors[ci].test(r, g, b)) {
        return colors[ci].name
      }
    }
    return '未知'
  },

  calculateContrast: function(r, g, b) {
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    var whiteLuminance = 1
    var ratio = (Math.max(luminance, whiteLuminance) + 0.05) /
                   (Math.min(luminance, whiteLuminance) + 0.05)
    return ratio.toFixed(2) + ':1'
  },

  pickFromImage: function() {
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempPath = res.tempFiles[0].tempFilePath
        var query = wx.createSelectorQuery()
        query.select('#pickCanvas').fields({ node: true, size: true }).exec(function(res2) {
          if (!res2 || !res2[0]) {
            that.pickFromImageSimple(tempPath)
            return
          }
          var canvas = res2[0].node
          var ctx = canvas.getContext('2d')
          var img = canvas.createImage()
          img.src = tempPath
          img.onload = function() {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            var cx = Math.floor(img.width / 2)
            var cy = Math.floor(img.height / 2)
            var pixel = ctx.getImageData(cx, cy, 1, 1).data
            that.updateFromRGB(pixel[0], pixel[1], pixel[2])
            wx.showToast({ title: that.data.i18n.pickedCenterColor, icon: 'success' })
          }
        })
      },
      fail: function() {}
    })
  },

  pickFromImageCanvas: function() {
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempPath = res.tempFiles[0].tempFilePath
        var query = wx.createSelectorQuery()
        query.select('#pickCanvas').fields({ node: true, size: true }).exec(function(res2) {
          if (!res2[0]) {
            that.pickFromImageSimple(tempPath)
            return
          }
          var canvas = res2[0].node
          var ctx = canvas.getContext('2d')
          var img = canvas.createImage()
          img.src = tempPath
          img.onload = function() {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            var cx = Math.floor(img.width / 2)
            var cy = Math.floor(img.height / 2)
            var pixel = ctx.getImageData(cx, cy, 1, 1).data
            that.updateFromRGB(pixel[0], pixel[1], pixel[2])
            wx.showToast({ title: that.data.i18n.pickedCenterColor, icon: 'success' })
          }
        })
      },
      fail: function() {}
    })
  },

  pickFromImageSimple: function(tempPath) {
    var that = this
    wx.getImageInfo({
      src: tempPath,
      success: function() {
        that.setData({ imagePickPath: tempPath, showImagePicker: true })
      }
    })
  },

  onImageTap: function(e) {
    var x = e.detail.x
    var y = e.detail.y
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#pickImage').boundingClientRect()
    query.exec(function(res) {
      if (!res[0]) return
      var rect = res[0]
      var ratioX = (x - rect.left) / rect.width
      var ratioY = (y - rect.top) / rect.height
      var query2 = wx.createSelectorQuery()
      query2.select('#pickCanvas').fields({ node: true }).exec(function(res2) {
        if (!res2[0]) return
        var canvas = res2[0].node
        var ctx = canvas.getContext('2d')
        var px = Math.floor(ratioX * canvas.width)
        var py = Math.floor(ratioY * canvas.height)
        px = Math.max(0, Math.min(px, canvas.width - 1))
        py = Math.max(0, Math.min(py, canvas.height - 1))
        var pixel = ctx.getImageData(px, py, 1, 1).data
        that.updateFromRGB(pixel[0], pixel[1], pixel[2])
        wx.vibrateShort({ type: 'light' })
      })
    })
  },

  closeImagePicker: function() {
    this.setData({ showImagePicker: false, imagePickPath: '' })
  },

  updateFromRGB: function(r, g, b) {
    var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    this.initColor(hex)
  },

  onPaletteColorTap: function(e) {
    var color = e.currentTarget.dataset.color
    wx.vibrateShort({ type: 'light' })
    this.initColor(color)
  },

  loadFavorites: function() {
    var favs = storageUtil.get('color_favorites', [])
    this.setData({ favoriteColors: favs })
  },

  addFavorite: function() {
    var hex = this.data.currentColor
    var favs = this.data.favoriteColors
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].toUpperCase() === hex.toUpperCase()) {
        wx.showToast({ title: this.data.i18n.alreadyFavorited, icon: 'none' })
        return
      }
    }
    if (favs.length >= 20) {
      wx.showToast({ title: this.data.i18n.maxFavorites, icon: 'none' })
      return
    }
    favs.push(hex)
    this.setData({ favoriteColors: favs })
    wx.setStorageSync('color_favorites', favs)
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: this.data.i18n.favorited, icon: 'success' })
  },

  removeFavorite: function(e) {
    var idx = e.currentTarget.dataset.index
    var favs = this.data.favoriteColors
    favs.splice(idx, 1)
    this.setData({ favoriteColors: favs })
    wx.setStorageSync('color_favorites', favs)
    wx.vibrateShort({ type: 'light' })
  },

  selectFavorite: function(e) {
    var hex = e.currentTarget.dataset.hex
    wx.vibrateShort({ type: 'light' })
    this.initColor(hex)
  },

  selectHarmonyType: function(e) {
    var type = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ harmonyType: type })
    this.generateHarmony()
  },

  generateHarmony: function() {
    var hsl = this.rgbToHsl(
      parseInt(this.data.rValue) || 0,
      parseInt(this.data.gValue) || 0,
      parseInt(this.data.bValue) || 0
    )
    var h = hsl.h
    var s = hsl.s
    var l = hsl.l
    var type = this.data.harmonyType
    var colors = []
    if (type === 'complementary') {
      colors = [
        { hex: this.data.currentColor, label: '原色' },
        { hex: this._hslToHex((h + 180) % 360, s, l), label: '互补色' }
      ]
    } else if (type === 'analogous') {
      colors = [
        { hex: this._hslToHex((h + 330) % 360, s, l), label: '类似色' },
        { hex: this.data.currentColor, label: '原色' },
        { hex: this._hslToHex((h + 30) % 360, s, l), label: '类似色' }
      ]
    } else if (type === 'triadic') {
      colors = [
        { hex: this.data.currentColor, label: '原色' },
        { hex: this._hslToHex((h + 120) % 360, s, l), label: '三角色' },
        { hex: this._hslToHex((h + 240) % 360, s, l), label: '三角色' }
      ]
    } else if (type === 'split') {
      colors = [
        { hex: this.data.currentColor, label: '原色' },
        { hex: this._hslToHex((h + 150) % 360, s, l), label: '分裂色' },
        { hex: this._hslToHex((h + 210) % 360, s, l), label: '分裂色' }
      ]
    } else if (type === 'tetradic') {
      colors = [
        { hex: this.data.currentColor, label: '原色' },
        { hex: this._hslToHex((h + 90) % 360, s, l), label: '四角色' },
        { hex: this._hslToHex((h + 180) % 360, s, l), label: '四角色' },
        { hex: this._hslToHex((h + 270) % 360, s, l), label: '四角色' }
      ]
    }
    this.setData({ harmonyScheme: colors })
  },

  _hslToHex: function(h, s, l) {
    var rgb = this.hslToRgb(h, s, l)
    return '#' + this.rgbToHex(rgb.r, rgb.g, rgb.b)
  },

  onHarmonyColorTap: function(e) {
    var hex = e.currentTarget.dataset.hex
    wx.vibrateShort({ type: 'light' })
    this.initColor(hex)
  },

  copyHarmonyAll: function() {
    if (!this.data.harmonyScheme) return
    wx.vibrateShort({ type: 'light' })
    var text = ''
    for (var i = 0; i < this.data.harmonyScheme.length; i++) {
      text += this.data.harmonyScheme[i].label + ': ' + this.data.harmonyScheme[i].hex + '\n'
    }
    wx.setClipboardData({
      data: text.trim(),
      success: function() { wx.showToast({ title: that.data.i18n.copiedScheme, icon: 'success' }) }
    })
  },

  selectGradientStart: function() {
    this.setData({ gradientStart: this.data.currentColor })
    this.updateGradientCSS()
  },

  selectGradientEnd: function() {
    this.setData({ gradientEnd: this.data.currentColor })
    this.updateGradientCSS()
  },

  onGradientAngleInput: function(e) {
    var val = parseInt(e.detail.value) || 0
    val = Math.max(0, Math.min(360, val))
    this.setData({ gradientAngle: val })
    this.updateGradientCSS()
  },

  selectGradientAngle: function(e) {
    var angle = parseInt(e.currentTarget.dataset.angle)
    wx.vibrateShort({ type: 'light' })
    this.setData({ gradientAngle: angle })
    this.updateGradientCSS()
  },

  updateGradientCSS: function() {
    var css = 'linear-gradient(' + this.data.gradientAngle + 'deg, ' + this.data.gradientStart + ', ' + this.data.gradientEnd + ')'
    this.setData({ gradientCSS: css })
  },

  copyGradientCSS: function() {
    wx.vibrateShort({ type: 'light' })
    var that = this
    wx.setClipboardData({
      data: 'background: ' + this.data.gradientCSS + ';',
      success: function() { wx.showToast({ title: that.data.i18n.copiedGradientCss, icon: 'success' }) }
    })
  },

  randomGradient: function() {
    wx.vibrateShort({ type: 'medium' })
    var letters = '0123456789ABCDEF'
    var c1 = '#', c2 = '#'
    for (var i = 0; i < 6; i++) {
      c1 += letters[Math.floor(Math.random() * 16)]
      c2 += letters[Math.floor(Math.random() * 16)]
    }
    var angles = [0, 45, 90, 135, 180, 225, 270, 315]
    var angle = angles[Math.floor(Math.random() * angles.length)]
    this.setData({ gradientStart: c1, gradientEnd: c2, gradientAngle: angle })
    this.updateGradientCSS()
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.initColor('#3B82F6')
      that.setData({
        showPicker: false,
        pickedColors: [],
        gradientStart: '#3B82F6',
        gradientEnd: '#EC4899',
        gradientAngle: 135,
        harmonyType: 'complementary'
      })
      that.updateGradientCSS()
      that.generateHarmony()
    }, that.data.i18n)
  },

  copyResult: function() {
    toolActions.copyText(this.data.hexValue, this.data.i18n.colorCopied, this.data.i18n)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🎨 颜色转换 - 百宝工具箱', '/package-dev/color-converter/color-converter')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('🎨 颜色转换 - 百宝工具箱')
  }
})
