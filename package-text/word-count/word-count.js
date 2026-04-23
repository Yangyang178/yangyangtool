Page({
  data: {
    textContent: '',
    inputLength: 0,
    totalChars: 0,
    chineseChars: 0,
    englishWords: 0,
    numbers: 0,
    punctuation: 0,
    charsWithSpace: 0,
    charsWithoutSpace: 0,
    paragraphs: 0,
    lines: 0
  },

  onTextInput(e) {
    const text = e.detail.value
    this.setData({ 
      textContent: text,
      inputLength: text.length
    })
    this.calculateStats(text)
  },

  calculateStats(text) {
    if (!text) {
      this.resetStats()
      return
    }

    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const english = (text.match(/[a-zA-Z]+/g) || []).length
    const nums = (text.match(/\d+/g) || []).length
    const punc = (text.match(/[，。！？、；：""''（）【】《》…—·～]/g) || []).length
    
    const charsWS = text.length
    const charsWOS = text.replace(/\s/g, '').length
    const paras = text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0)
    const lineCount = text.split('\n').length

    this.setData({
      totalChars: charsWS,
      chineseChars: chinese,
      englishWords: english,
      numbers: nums,
      punctuation: punc,
      charsWithSpace: charsWS,
      charsWithoutSpace: charsWOS,
      paragraphs: paras,
      lines: lineCount
    })
  },

  clearText() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ textContent: '' })
    this.resetStats()
  },

  resetStats() {
    this.setData({
      totalChars: 0,
      chineseChars: 0,
      englishWords: 0,
      numbers: 0,
      punctuation: 0,
      charsWithSpace: 0,
      charsWithoutSpace: 0,
      paragraphs: 0,
      lines: 0,
      inputLength: 0
    })
  },

  copyStats() {
    wx.vibrateShort({ type: 'light' })
    const stats = `字数统计结果：
总字符数：${this.data.totalChars}
中文字：${this.data.chineseChars}
英文词：${this.data.englishWords}
数字：${this.data.numbers}
标点符号：${this.data.punctuation}
段落数：${this.data.paragraphs}
行数：${this.data.lines}`
    
    wx.setClipboardData({ 
      data: stats, 
      success: () => wx.showToast({ title: '已复制', icon: 'success' }) 
    })
  },

  copyText() {
    if (!this.data.textContent) {
      wx.showToast({ title: '没有可复制的文本', icon: 'none' })
      return
    }
    wx.setClipboardData({ 
      data: this.data.textContent, 
      success: () => wx.showToast({ title: '已复制文本', icon: 'success' }) 
    })
  },
  onShareAppMessage() {
    return { title: '字数统计 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
