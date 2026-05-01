/**
 * 布局管理模块
 * 包含：编辑模式、工具排序、显示/隐藏、撤销/重做等功能
 */

module.exports = {
  loadCustomLayout() {
    const customOrder = wx.getStorageSync('customToolOrder') || []
    const hiddenTools = wx.getStorageSync('hiddenTools') || []

    this.setData({
      customOrder,
      hiddenTools
    })

    if (customOrder.length > 0) {
      const tools = this.data.tools
      let orderedTools = []

      for (const orderId of customOrder) {
        const isHidden = hiddenTools.includes(orderId)
        if (!isHidden) {
          const tool = tools.find(t => t.id === orderId)
          if (tool) orderedTools.push(tool)
        }
      }

      const remainingTools = tools.filter(tool =>
        !customOrder.includes(tool.id) && !hiddenTools.includes(tool.id)
      )

      const finalTools = [...orderedTools, ...remainingTools]
      this.setData({
        tools: finalTools,
        filteredTools: finalTools
      })
    } else if (hiddenTools.length > 0) {
      const visibleTools = this.data.tools.filter(
        tool => !hiddenTools.includes(tool.id)
      )
      this.setData({
        tools: visibleTools,
        filteredTools: visibleTools
      })
    }

    this.updateHiddenToolsList(hiddenTools)
  },

  toggleEditMode() {
    wx.vibrateShort({ type: 'light' })

    if (!this.data.isEditMode) {
      wx.showModal({
        title: '📝 编辑模式',
        content: '点击工具卡片选中\n再次点击另一个卡片可交换位置\n点击眼睛图标可隐藏工具',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#3B82F6'
      })
    }

    this.setData({
      isEditMode: !this.data.isEditMode,
      selectedToolIndex: -1,
      canUndo: false,
      editHistory: []
    })

    if (!this.data.isEditMode) {
      this.saveCustomLayout()
      wx.showToast({
        title: '布局已保存 ✅',
        icon: 'success',
        duration: 1500
      })
    }
  },

  onEditToolClick(e) {
    if (!this.data.isEditMode) return

    const index = e.currentTarget.dataset.index
    const currentSelected = this.data.selectedToolIndex

    if (currentSelected === -1) {
      wx.vibrateShort({ type: 'light' })
      this.setData({ selectedToolIndex: index })
      return
    }

    if (currentSelected === index) {
      wx.vibrateShort({ type: 'light' })
      this.setData({ selectedToolIndex: -1 })
      return
    }

    wx.vibrateShort({ type: 'medium' })

    const filteredTools = [...this.data.filteredTools]

    if (!filteredTools[currentSelected] || !filteredTools[index]) {
      console.warn('Invalid index for swap')
      return
    }

    this.pushEditHistory()

    [filteredTools[currentSelected], filteredTools[index]] =
    [filteredTools[index], filteredTools[currentSelected]]

    this.setData({
      filteredTools,
      selectedToolIndex: -1,
      canUndo: true
    })

    this.saveCustomLayout()

    wx.showToast({
      title: '已交换位置',
      icon: 'success',
      duration: 800
    })
  },

  pushEditHistory() {
    const snapshot = this.data.filteredTools.map(tool => tool.id)
    const hiddenSnapshot = [...this.data.hiddenTools]
    let history = [...this.data.editHistory]

    history.push({
      order: snapshot,
      hidden: hiddenSnapshot,
      timestamp: Date.now()
    })

    if (history.length > 20) {
      history = history.slice(history.length - 20)
    }

    this.setData({ editHistory: history })
  },

  undoLastAction() {
    if (this.data.editHistory.length === 0) {
      wx.showToast({ title: '没有可撤销的操作', icon: 'none', duration: 1200 })
      return
    }

    wx.vibrateShort({ type: 'light' })

    const history = [...this.data.editHistory]
    const prevState = history.pop()

    const allTools = this.data.tools
    const restoredOrder = prevState.order.map(id => allTools.find(t => t.id === id)).filter(Boolean)

    const restoredHidden = prevState.hidden || []

    this.setData({
      filteredTools: restoredOrder,
      hiddenTools: restoredHidden,
      editHistory: history,
      canUndo: history.length > 0,
      selectedToolIndex: -1
    })

    this.updateHiddenToolsList(restoredHidden)
    this.saveCustomLayout()

    wx.showToast({
      title: '已撤销 ↩️',
      icon: 'none',
      duration: 800
    })
  },

  toggleToolVisibility(e) {
    if (!this.data.isEditMode) return

    wx.vibrateShort({ type: 'light' })

    this.pushEditHistory()

    const id = e.currentTarget.dataset.id
    let hiddenTools = [...this.data.hiddenTools]

    const foundIdx = hiddenTools.indexOf(id)

    if (foundIdx > -1) {
      hiddenTools.splice(foundIdx, 1)
      wx.showToast({ title: '已显示 ✓', icon: 'none', duration: 1000 })
    } else {
      hiddenTools.push(id)
      wx.showToast({ title: '已隐藏 👁', icon: 'none', duration: 1000 })
    }

    this.updateHiddenToolsList(hiddenTools)

    const visibleTools = this.data.filteredTools.filter(
      tool => !hiddenTools.includes(tool.id)
    )

    this.setData({
      hiddenTools,
      filteredTools: visibleTools,
      canUndo: true
    })
  },

  restoreHiddenTool(e) {
    wx.vibrateShort({ type: 'light' })

    const id = e.currentTarget.dataset.id
    let hiddenTools = [...this.data.hiddenTools]
    hiddenTools = hiddenTools.filter(toolId => toolId !== id)

    this.updateHiddenToolsList(hiddenTools)

    const allTools = this.data.tools
    const restoredTool = allTools.find(t => t.id === id)

    let visibleTools = [...this.data.filteredTools]
    if (restoredTool && !visibleTools.find(t => t.id === id)) {
      visibleTools.push(restoredTool)
    }

    this.setData({
      hiddenTools,
      filteredTools: visibleTools
    })

    const displayName = restoredTool ? restoredTool.name : '工具'
    wx.showToast({
      title: `${displayName} 已恢复 ✓`,
      icon: 'success',
      duration: 1000
    })
  },

  updateHiddenToolsList(hiddenTools) {
    if (!hiddenTools || hiddenTools.length === 0) {
      this.setData({ hiddenToolsList: [] })
      return
    }

    const allTools = this.data.tools
    const hiddenList = allTools.filter(tool => hiddenTools.includes(tool.id))

    this.setData({ hiddenToolsList: hiddenList })
  },

  saveCustomLayout() {
    const currentOrder = this.data.filteredTools.map(tool => tool.id)
    wx.setStorageSync('customToolOrder', currentOrder)
    wx.setStorageSync('hiddenTools', this.data.hiddenTools)

    this.setData({
      customOrder: currentOrder
    })
  },

  resetLayout() {
    wx.vibrateShort({ type: 'medium' })

    wx.showModal({
      title: '⚠️ 重置布局',
      content: '确定要恢复默认布局吗？\n所有自定义排序和隐藏设置将被清除。\n\n💡 重置后可通过"撤销"按钮恢复',
      confirmText: '重置',
      cancelText: '取消',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          this.pushEditHistory()

          wx.removeStorageSync('customToolOrder')
          wx.removeStorageSync('hiddenTools')

          this.setData({
            customOrder: [],
            hiddenTools: [],
            isEditMode: false,
            canUndo: true,
            selectedToolIndex: -1
          })

          const favorites = wx.getStorageSync('favorites') || []
          const defaultTools = require('./config').defaultTools
          const defaultToolsCopy = defaultTools.map(tool => ({
            ...tool,
            isFavorite: favorites.includes(tool.id)
          }))

          this.setData({
            tools: defaultToolsCopy,
            filteredTools: defaultToolsCopy
          })

          wx.showToast({ title: '已恢复默认布局', icon: 'success' })
        }
      }
    })
  }
}
