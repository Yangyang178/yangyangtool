const sampleJson = `{
  "name": "百宝工具箱",
  "version": "1.0.0",
  "author": {
    "name": "开发者",
    "email": "dev@example.com"
  },
  "tools": [
    {"id": 1, "name": "计算器", "category": "计算"},
    {"id": 2, "name": "转换器", "category": "转换"},
    {"id": 3, "name": "格式化", "category": "开发"}
  ],
  "settings": {
    "theme": "light",
    "language": "zh-CN",
    "notifications": true
  },
  "stats": {
    "users": 10000,
    "rating": 4.8,
    "downloads": 50000
  }
}`

Page({
  data: {
    inputJson: '',
    outputJson: '',
    errorMsg: '',
    jsonSize: 0,
    outputStats: {
      chars: 0,
      lines: 0,
      size: '0 B'
    },
    historyList: []
  },

  onLoad() {
    this.loadHistory()
  },

  onInputChange(e) {
    const value = e.detail.value
    this.setData({ 
      inputJson: value,
      errorMsg: ''
    })
    
    if (value.trim()) {
      this.setData({ jsonSize: value.length })
      this.validateJsonSilent(value)
    } else {
      this.setData({ jsonSize: 0 })
    }
  },

  validateJsonSilent(jsonStr) {
    try {
      JSON.parse(jsonStr)
      return true
    } catch (e) {
      return false
    }
  },

  formatJson() {
    wx.vibrateShort({ type: 'medium' })

    const { inputJson } = this.data
    
    if (!inputJson.trim()) {
      wx.showToast({ title: '请输入JSON数据', icon: 'none' })
      return
    }

    try {
      const parsed = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsed, null, 2)
      
      const stats = this.calculateStats(formatted)
      
      this.setData({
        outputJson: formatted,
        errorMsg: '',
        outputStats: stats
      })

      this.addToHistory(inputJson, 'format')
      wx.showToast({ title: '格式化成功！', icon: 'success' })
    } catch (e) {
      const errorInfo = this.parseError(e.message, inputJson)
      this.setData({
        errorMsg: errorInfo,
        outputJson: ''
      })
    }
  },

  compressJson() {
    wx.vibrateShort({ type: 'medium' })

    const { inputJson } = this.data

    if (!inputJson.trim()) {
      wx.showToast({ title: '请输入JSON数据', icon: 'none' })
      return
    }

    try {
      const parsed = JSON.parse(inputJson)
      const compressed = JSON.stringify(parsed)
      
      const stats = this.calculateStats(compressed)
      
      this.setData({
        outputJson: compressed,
        errorMsg: '',
        outputStats: stats
      })

      this.addToHistory(inputJson, 'compress')
      wx.showToast({ title: '压缩成功！', icon: 'success' })
    } catch (e) {
      const errorInfo = this.parseError(e.message, inputJson)
      this.setData({
        errorMsg: errorInfo,
        outputJson: ''
      })
    }
  },

  validateJson() {
    wx.vibrateShort({ type: 'medium' })

    const { inputJson } = this.data

    if (!inputJson.trim()) {
      wx.showToast({ title: '请输入JSON数据', icon: 'none' })
      return
    }

    try {
      JSON.parse(inputJson)
      
      const parsed = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsed, null, 2)
      const stats = this.calculateStats(formatted)

      this.setData({
        outputJson: formatted,
        errorMsg: '',
        jsonSize: inputJson.length,
        outputStats: stats
      })

      wx.showModal({
        title: '✅ 验证通过',
        content: `JSON格式完全正确！\n\n字符数：${inputJson.length}\n数据类型：${this.getDataType(parsed)}`,
        showCancel: false,
        confirmText: '太好了！'
      })
    } catch (e) {
      const errorInfo = this.parseError(e.message, inputJson)
      this.setData({
        errorMsg: errorInfo,
        outputJson: ''
      })
    }
  },

  parseError(errorMessage, jsonStr) {
    let positionMatch = errorMessage.match(/position\s+(\d+)/i)
    let lineMatch = errorMessage.match(/line\s+(\d+)/i)
    
    if (positionMatch) {
      const pos = parseInt(positionMatch[1])
      const previewStart = Math.max(0, pos - 30)
      const previewEnd = Math.min(jsonStr.length, pos + 30)
      const preview = jsonStr.substring(previewStart, previewEnd)
      
      return `语法错误（位置 ${pos}）:\n${errorMessage}\n\n附近内容：...${preview}...`
    }
    
    if (lineMatch) {
      return `第 ${lineMatch[1]} 行出错:\n${errorMessage}`
    }

    return `JSON解析错误:\n${errorMessage}`
  },

  getDataType(data) {
    if (Array.isArray(data)) return '数组'
    if (typeof data === 'object') return '对象'
    return typeof data
  },

  calculateStats(jsonStr) {
    const chars = jsonStr.length
    const lines = jsonStr.split('\n').length
    const bytes = new Blob([jsonStr]).size
    
    let sizeStr = ''
    if (bytes < 1024) {
      sizeStr = bytes + ' B'
    } else if (bytes < 1024 * 1024) {
      sizeStr = (bytes / 1024).toFixed(1) + ' KB'
    } else {
      sizeStr = (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return {
      chars: chars.toLocaleString(),
      lines: lines.toString(),
      size: sizeStr
    }
  },

  pasteFromClipboard() {
    wx.vibrateShort({ type: 'light' })
    
    wx.getClipboardData({
      success: (res) => {
        if (res.data.trim()) {
          this.setData({ 
            inputJson: res.data,
            errorMsg: ''
          })
          
          if (this.validateJsonSilent(res.data)) {
            this.setData({ jsonSize: res.data.length })
          }
          
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
    this.setData({
      inputJson: sampleJson,
      errorMsg: '',
      jsonSize: sampleJson.length
    })
    wx.showToast({ title: '已加载示例', icon: 'success' })
  },

  clearInput() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      inputJson: '',
      outputJson: '',
      errorMsg: '',
      jsonSize: 0
    })
  },

  copyOutput() {
    wx.vibrateShort({ type: 'light' })

    if (!this.data.outputJson) {
      wx.showToast({ title: '没有可复制的内容', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: this.data.outputJson,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  addToHistory(jsonStr, type) {
    const history = wx.getStorageSync('json_formatter_history') || []
    
    const preview = jsonStr.substring(0, 50) + (jsonStr.length > 50 ? '...' : '')
    
    const newRecord = {
      original: jsonStr,
      preview,
      type,
      typeText: type === 'format' ? '格式化' : '压缩',
      time: Date.now(),
      timeText: this.formatTime(new Date())
    }

    history.unshift(newRecord)
    const saved = history.slice(0, 15)
    wx.setStorageSync('json_formatter_history', saved)
    this.setData({ historyList: saved.slice(0, 8) })
  },

  loadHistoryItem(e) {
    wx.vibrateShort({ type: 'light' })
    const index = e.currentTarget.dataset.index
    const item = this.data.historyList[index]
    
    this.setData({
      inputJson: item.original,
      errorMsg: '',
      jsonSize: item.original.length
    })
  },

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  },

  loadHistory() {
    const history = wx.getStorageSync('json_formatter_history') || []
    this.setData({ historyList: history.slice(0, 8) })
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('json_formatter_history')
          this.setData({ historyList: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: 'JSON格式化 - 百宝工具箱',
      path: '/pages/tools/json-formatter/json-formatter'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})