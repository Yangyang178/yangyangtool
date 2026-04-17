const presetColors = [
  { value: '#EF4444' }, { value: '#F97316' }, { value: '#F59E0B' },
  { value: '#10B981' }, { value: '#3B82F6' }, { value: '#8B5CF6' },
  { value: '#EC4899' }, { value: '#64748B' }
]

const colorPalette = [
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
    
    presetColors,
    colorPalette
  },

  onLoad() {
    this.initColor('#3B82F6')
  },

  initColor(hex) {
    const cleanHex = hex.replace('#', '')
    const rgb = this.hexToRgb(cleanHex)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
    
    this.setData({
      currentColor: `#${cleanHex.toUpperCase()}`,
      hexInput: cleanHex.toUpperCase(),
      rValue: String(rgb.r),
      gValue: String(rgb.g),
      bValue: String(rgb.b),
      hValue: String(Math.round(hsl.h)),
      sValue: String(Math.round(hsl.s)),
      lValue: String(Math.round(hsl.l)),
      
      hexValue: `#${cleanHex.toUpperCase()}`,
      rgbValue: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hslValue: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
      cmykValue: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
      
      colorName: this.getColorName(rgb.r, rgb.g, rgb.b),
      contrastRatio: this.calculateContrast(rgb.r, rgb.g, rgb.b)
    })
  },

  onHexInput(e) {
    let value = e.detail.value.replace(/[^a-fA-F0-9]/g, '').toUpperCase()
    if (value.length > 6) value = value.substring(0, 6)
    
    this.setData({ hexInput: value })
    
    if (value.length === 6 && /^[0-9A-F]{6}$/.test(value)) {
      wx.vibrateShort({ type: 'light' })
      this.initColor(`#${value}`)
    }
  },

  onRInput(e) {
    let value = parseInt(e.detail.value) || 0
    value = Math.max(0, Math.min(255, value))
    this.setData({ rValue: String(value) })
    this.updateFromRgb()
  },

  onGInput(e) {
    let value = parseInt(e.detail.value) || 0
    value = Math.max(0, Math.min(255, value))
    this.setData({ gValue: String(value) })
    this.updateFromRgb()
  },

  onBInput(e) {
    let value = parseInt(e.detail.value) || 0
    value = Math.max(0, Math.min(255, value))
    this.setData({ bValue: String(value) })
    this.updateFromRgb()
  },

  onHInput(e) {
    let value = parseFloat(e.detail.value) || 0
    value = Math.max(0, Math.min(360, value))
    this.setData({ hValue: String(Math.round(value)) })
    this.updateFromHsl()
  },

  onSInput(e) {
    let value = parseFloat(e.detail.value) || 0
    value = Math.max(0, Math.min(100, value))
    this.setData({ sValue: String(Math.round(value)) })
    this.updateFromHsl()
  },

  onLInput(e) {
    let value = parseFloat(e.detail.value) || 0
    value = Math.max(0, Math.min(100, value))
    this.setData({ lValue: String(Math.round(value)) })
    this.updateFromHsl()
  },

  updateFromRgb() {
    const r = parseInt(this.data.rValue) || 0
    const g = parseInt(this.data.gValue) || 0
    const b = parseInt(this.data.bValue) || 0
    
    const hex = this.rgbToHex(r, g, b)
    const hsl = this.rgbToHsl(r, g, b)
    const cmyk = this.rgbToCmyk(r, g, b)
    
    this.setData({
      currentColor: `#${hex.toUpperCase()}`,
      hexInput: hex.toUpperCase(),
      hexValue: `#${hex.toUpperCase()}`,
      rgbValue: `rgb(${r}, ${g}, ${b})`,
      hslValue: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
      cmykValue: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
      hValue: String(Math.round(hsl.h)),
      sValue: String(Math.round(hsl.s)),
      lValue: String(Math.round(hsl.l)),
      colorName: this.getColorName(r, g, b),
      contrastRatio: this.calculateContrast(r, g, b)
    })
  },

  updateFromHsl() {
    const h = parseFloat(this.data.hValue) || 0
    const s = parseFloat(this.data.sValue) || 0
    const l = parseFloat(this.data.lValue) || 0
    
    const rgb = this.hslToRgb(h, s, l)
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b)
    const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b)
    
    this.setData({
      currentColor: `#${hex.toUpperCase()}`,
      hexInput: hex.toUpperCase(),
      rValue: String(rgb.r),
      gValue: String(rgb.g),
      bValue: String(rgb.b),
      hexValue: `#${hex.toUpperCase()}`,
      rgbValue: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hslValue: `hsl(${Math.round(h)}, ${Math.round(s)}, ${Math.round(l)})%`,
      cmykValue: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
      colorName: this.getColorName(rgb.r, rgb.g, rgb.b),
      contrastRatio: this.calculateContrast(rgb.r, rgb.g, rgb.b)
    })
  },

  selectPresetColor(e) {
    wx.vibrateShort({ type: 'light' })
    const color = e.currentTarget.dataset.value
    this.initColor(color)
  },

  selectPaletteColor(e) {
    wx.vibrateShort({ type: 'medium' })
    const color = e.currentTarget.dataset.color
    this.initColor(color.hex)
  },

  generateRandomColor() {
    wx.vibrateShort({ type: 'heavy' })
    
    const letters = '0123456789ABCDEF'
    let color = ''
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    
    this.initColor(`#${color}`)
  },

  invertColor() {
    wx.vibrateShort({ type: 'medium' })
    
    const r = 255 - (parseInt(this.data.rValue) || 0)
    const g = 255 - (parseInt(this.data.gValue) || 0)
    const b = 255 - (parseInt(this.data.bValue) || 0)
    
    this.setData({
      rValue: String(r),
      gValue: String(g),
      bValue: String(b)
    })
    
    this.updateFromRgb()
  },

  copyColor() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.hexValue,
      success: () => {
        wx.showToast({ title: '已复制HEX值', icon: 'success' })
      }
    })
  },

  copyHex() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.hexValue,
      success: () => {
        wx.showToast({ title: '已复制HEX', icon: 'success' })
      }
    })
  },

  copyRgb() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.rgbValue,
      success: () => {
        wx.showToast({ title: '已复制RGB', icon: 'success' })
      }
    })
  },

  copyHsl() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.hslValue,
      success: () => {
        wx.showToast({ title: '已复制HSL', icon: 'success' })
      }
    })
  },

  copyCmyk() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.cmykValue,
      success: () => {
        wx.showToast({ title: '已复制CMYK', icon: 'success' })
      }
    })
  },

  copyCssHex() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: `color: ${this.data.hexValue};`,
      success: () => {
        wx.showToast({ title: '已复制CSS', icon: 'success' })
      }
    })
  },

  copyCssRgb() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: `color: rgb(${this.data.rValue}, ${this.data.gValue}, ${this.data.bValue});`,
      success: () => {
        wx.showToast({ title: '已复制CSS', icon: 'success' })
      }
    })
  },

  copyCssHsl() {
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: `color: hsl(${this.data.hValue}, ${this.data.sValue}%, ${this.data.lValue}%);`,
      success: () => {
        wx.showToast({ title: '已复制CSS', icon: 'success' })
      }
    })
  },

  hexToRgb(hex) {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  },

  rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  },

  rgbToHsl(r, g, b) {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
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

  hslToRgb(h, s, l) {
    h /= 360
    s /= 100
    l /= 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  },

  rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) {
      return { c: 0, m: 0, y: 0, k: 100 }
    }

    const c = 1 - (r / 255)
    const m = 1 - (g / 255)
    const y = 1 - (b / 255)
    const k = Math.min(c, m, y)

    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100)
    }
  },

  getColorName(r, g, b) {
    const colors = [
      { name: '红色', test: (rr, gg, bb) => rr > 200 && gg < 80 && bb < 80 },
      { name: '橙色', test: (rr, gg, bb) => rr > 200 && gg > 100 && bb < 80 },
      { name: '黄色', test: (rr, gg, bb) => rr > 200 && gg > 200 && bb < 100 },
      { name: '绿色', test: (rr, gg, bb) => rr < 100 && gg > 180 && bb < 100 },
      { name: '青色', test: (rr, gg, bb) => rr < 100 && gg > 150 && bb > 150 },
      { name: '蓝色', test: (rr, gg, bb) => rr < 100 && gg < 120 && bb > 180 },
      { name: '紫色', test: (rr, gg, bb) => rr > 140 && gg < 100 && bb > 140 },
      { name: '粉色', test: (rr, gg, bb) => rr > 220 && gg < 160 && bb > 160 },
      { name: '白色', test: (rr, gg, bb) => rr > 240 && gg > 240 && bb > 240 },
      { name: '灰色', test: (rr, gg, bb) => Math.abs(rr - gg) < 30 && Math.abs(gg - bb) < 30 && rr < 200 && rr > 50 },
      { name: '黑色', test: (rr, gg, bb) => rr < 40 && gg < 40 && bb < 40 },
      { name: '棕色', test: (rr, gg, bb) => rr > 120 && gg > 70 && gg < 150 && bb < 80 },
      { name: '自定义色', test: () => true }
    ]

    for (const color of colors) {
      if (color.test(r, g, b)) {
        return color.name
      }
    }
    return '未知'
  },

  calculateContrast(r, g, b) {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const whiteLuminance = 1
    const ratio = (Math.max(luminance, whiteLuminance) + 0.05) / 
                   (Math.min(luminance, whiteLuminance) + 0.05)
    return ratio.toFixed(2) + ':1'
  },

  onShareAppMessage() {
    return {
      title: '颜色转换工具 - 百宝工具箱',
      path: '/pages/tools/color-converter/color-converter'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})