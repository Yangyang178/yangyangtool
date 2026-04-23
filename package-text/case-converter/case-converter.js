Page({
  data: {
    inputText: '',
    outputText: '',
    currentMode: 'upper',
    modes: [
      { id: 'upper', name: '全部大写', icon: '🔠' },
      { id: 'lower', name: '全部小写', icon: '🔡' },
      { id: 'capitalize', name: '首字母大写', icon: '🔤' },
      { id: 'sentence', name: '句首大写', icon: '📝' },
      { id: 'toggle', name: '切换大小写', icon: '🔄' }
    ]
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
    this.convertText()
  },

  selectMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ currentMode: mode })
    wx.vibrateShort({ type: 'light' })
    this.convertText()
  },

  convertText() {
    if (!this.data.inputText) {
      this.setData({ outputText: '' })
      return
    }

    let result = ''
    const text = this.data.inputText

    switch (this.data.currentMode) {
      case 'upper':
        result = text.toUpperCase()
        break
      case 'lower':
        result = text.toLowerCase()
        break
      case 'capitalize':
        result = text.replace(/\b\w/g, l => l.toUpperCase())
        break
      case 'sentence':
        result = text.replace(/(^\w|[.!?]\s+\w)/g, l => l.toUpperCase())
        break
      case 'toggle':
        result = text.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('')
        break
    }

    this.setData({ outputText: result })
  },

  copyResult() {
    if (!this.data.outputText) {
      wx.showToast({ title: '没有可复制的内容', icon: 'none' })
      return
    }
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: this.data.outputText,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    })
  },

  clearAll() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputText: '',
      outputText: ''
    })
  },
  onShareAppMessage() {
    return { title: '大小写转换 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
