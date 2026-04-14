Page({
  data: {
    options: [],
    newOption: '',
    selectedIndex: -1,
    resultIndex: -1,
    selectedAnswer: '',
    showResult: false,
    isRolling: false,
    historyList: []
  },

  onLoad() {
    this.loadHistory()
  },

  onNewOptionInput(e) {
    this.setData({ newOption: e.detail.value })
  },

  addOption() {
    const option = this.data.newOption.trim()
    
    if (!option) {
      wx.showToast({ title: '请输入选项内容', icon: 'none' })
      return
    }

    if (this.data.options.includes(option)) {
      wx.showToast({ title: '该选项已存在', icon: 'none' })
      return
    }

    if (this.data.options.length >= 20) {
      wx.showToast({ title: '最多支持20个选项', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'light' })

    const newOptions = [...this.data.options, option]
    this.setData({ 
      options: newOptions,
      newOption: '',
      showResult: false,
      resultIndex: -1,
      selectedIndex: -1
    })

    wx.showToast({ title: `已添加第${newOptions.length}个选项`, icon: 'none' })
  },

  selectOption(e) {
    if (this.data.isRolling) return
    
    const index = e.currentTarget.dataset.index
    
    // 如果点击的是已选中的，取消选中
    if (this.data.selectedIndex === index) {
      this.setData({ selectedIndex: -1 })
      return
    }

    wx.vibrateShort({ type: 'light' })
    this.setData({ selectedIndex: index })
  },

  deleteOption(e) {
    const index = e.currentTarget.dataset.index
    
    wx.vibrateShort({ type: 'light' })
    
    const newOptions = this.data.options.filter((_, i) => i !== index)
    
    this.setData({
      options: newOptions,
      showResult: false,
      resultIndex: -1,
      selectedIndex: this.data.selectedIndex === index ? -1 : (this.data.selectedIndex > index ? this.data.selectedIndex - 1 : this.data.selectedIndex)
    })
  },

  quickAdd(e) {
    const optionsStr = e.currentTarget.dataset.options
    const optionsArray = optionsStr.split(',')
    
    wx.vibrateShort({ type: 'light' })
    
    this.setData({
      options: optionsArray,
      newOption: '',
      showResult: false,
      resultIndex: -1,
      selectedIndex: -1
    })

    wx.showToast({ title: `已添加${optionsArray.length}个选项`, icon: 'none' })
  },

  startRoll() {
    if (this.data.options.length < 2) {
      wx.showToast({ title: '请至少添加2个选项', icon: 'none' })
      return
    }

    // 如果用户手动选中了某个选项，直接使用它
    if (this.data.selectedIndex >= 0) {
      this.showManualSelection()
      return
    }

    // 否则进行随机抽取
    this.performRandomRoll()
  },

  showManualSelection() {
    wx.vibrateShort({ type: 'medium' })
    
    const index = this.data.selectedIndex
    const answer = this.data.options[index]

    this.setData({
      resultIndex: index,
      selectedAnswer: answer,
      showResult: true,
      isRolling: false
    })

    this.addToHistory(answer)
  },

  performRandomRoll() {
    wx.vibrateShort({ type: 'medium' })

    this.setData({ isRolling: true, showResult: false, resultIndex: -1 })

    const totalOptions = this.data.options.length
    let rollCount = 0
    const maxRolls = 20 + Math.floor(Math.random() * 10)
    const rollInterval = 80

    const rollAnimation = setInterval(() => {
      rollCount++
      
      // 随机高亮一个选项
      const randomIndex = Math.floor(Math.random() * totalOptions)
      this.setData({ selectedIndex: randomIndex })

      if (rollCount >= maxRolls) {
        clearInterval(rollAnimation)
        
        // 最终确定结果
        const finalIndex = Math.floor(Math.random() * totalOptions)
        const answer = this.data.options[finalIndex]

        this.setData({
          selectedIndex: finalIndex,
          resultIndex: finalIndex,
          selectedAnswer: answer,
          showResult: true,
          isRolling: false
        })

        this.addToHistory(answer)

        setTimeout(() => {
          this.setData({ selectedIndex: -1 })
        }, 3000)
      }
    }, rollInterval)
  },

  addToHistory(result) {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

    const record = {
      time: timeStr,
      result: result
    }

    const history = [record, ...this.data.historyList].slice(0, 20)
    this.setData({ historyList: history })

    try {
      wx.setStorageSync('random_decision_history', history)
    } catch (e) {
      console.error('Save history error:', e)
    }
  },

  shareResult() {
    wx.vibrateShort({ type: 'light' })
    
    const text = `🎲 随机决定结果：${this.data.selectedAnswer}\n\n来自「百宝工具箱」`
    
    wx.showActionSheet({
      itemList: ['复制结果', '分享给朋友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: text,
            success: () => wx.showToast({ title: '已复制', icon: 'success' })
          })
        } else {
          // 触发分享
          this.onShareAppMessage()
        }
      }
    })
  },

  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有抽取历史吗？',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.vibrateShort({ type: 'medium' })
          
          this.setData({ historyList: [] })
          wx.removeStorageSync('random_decision_history')
          
          wx.showToast({ title: '已清空历史', icon: 'success' })
        }
      }
    })
  },

  loadHistory() {
    try {
      const history = wx.getStorageSync('random_decision_history') || []
      this.setData({ historyList: history })
    } catch (e) {
      console.error('Load history error:', e)
    }
  },

  onShareAppMessage() {
    return {
      title: `随机决定：${this.data.selectedAnswer || '来试试吧！'}`,
      path: '/pages/tools/random-decision/random-decision'
    }
  }
})
