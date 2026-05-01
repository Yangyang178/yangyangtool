/**
 * 布局管理模块
 * 包含：编辑模式、工具排序、显示/隐藏、撤销/重做等功能
 */

module.exports = {
  loadCustomLayout() {
    try {
      let customOrder = wx.getStorageSync('customToolOrder')
      let hiddenTools = wx.getStorageSync('hiddenTools')

      if (!Array.isArray(customOrder)) {
        customOrder = []
      }
      if (!Array.isArray(hiddenTools)) {
        hiddenTools = []
      }

      this.setData({
        customOrder: customOrder,
        hiddenTools: hiddenTools
      })

      const tools = this.data.tools || []
      if (!Array.isArray(tools) || tools.length === 0) {
        console.warn('[layout] tools 为空或不是数组，跳过布局加载')
        return
      }

      if (customOrder.length > 0) {
        let orderedTools = []

        for (let i = 0; i < customOrder.length; i++) {
          const orderId = customOrder[i]
          const isHidden = hiddenTools.indexOf(orderId) > -1
          if (!isHidden) {
            for (let j = 0; j < tools.length; j++) {
              if (tools[j].id === orderId) {
                orderedTools.push(tools[j])
                break
              }
            }
          }
        }

        let remainingTools = []
        for (let k = 0; k < tools.length; k++) {
          const tool = tools[k]
          const inOrdered = customOrder.indexOf(tool.id) > -1
          const isHidden = hiddenTools.indexOf(tool.id) > -1
          if (!inOrdered && !isHidden) {
            remainingTools.push(tool)
          }
        }

        const finalTools = orderedTools.concat(remainingTools)
        this.setData({
          tools: finalTools,
          filteredTools: finalTools
        })
      } else if (hiddenTools.length > 0) {
        let visibleTools = []
        for (let v = 0; v < tools.length; v++) {
          const tool = tools[v]
          const hFound = hiddenTools.indexOf(tool.id) > -1
          if (!hFound) {
            visibleTools.push(tool)
          }
        }
        this.setData({
          tools: visibleTools,
          filteredTools: visibleTools
        })
      }

      this.updateHiddenToolsList(hiddenTools)

    } catch(e) {
      console.error('[layout] loadCustomLayout error:', e)
    }
  },

  toggleEditMode() {
    try {
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
    } catch(e) {
      console.error('[layout] toggleEditMode error:', e)
    }
  },

  onEditToolClick(e) {
    try {
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

      const filteredTools = this.data.filteredTools || []

      if (!filteredTools[currentSelected] || !filteredTools[index]) {
        console.warn('[layout] Invalid index for swap')
        return
      }

      this.pushEditHistory()

      const temp = filteredTools[currentSelected]
      filteredTools[currentSelected] = filteredTools[index]
      filteredTools[index] = temp

      this.setData({
        filteredTools: filteredTools,
        selectedToolIndex: -1,
        canUndo: true
      })

      this.saveCustomLayout()

      wx.showToast({
        title: '已交换位置',
        icon: 'success',
        duration: 800
      })
    } catch(e) {
      console.error('[layout] onEditToolClick error:', e)
    }
  },

  pushEditHistory() {
    try {
      const filteredTools = this.data.filteredTools || []
      const snapshot = []
      for (let i = 0; i < filteredTools.length; i++) {
        snapshot.push(filteredTools[i].id)
      }

      const hiddenTools = this.data.hiddenTools || []
      const hiddenSnapshot = []
      for (let j = 0; j < hiddenTools.length; j++) {
        hiddenSnapshot.push(hiddenTools[j])
      }

      let history = this.data.editHistory || []
      history = history.slice()

      history.push({
        order: snapshot,
        hidden: hiddenSnapshot,
        timestamp: Date.now()
      })

      if (history.length > 20) {
        history = history.slice(history.length - 20)
      }

      this.setData({ editHistory: history })
    } catch(e) {
      console.error('[layout] pushEditHistory error:', e)
    }
  },

  undoLastAction() {
    try {
      const history = this.data.editHistory || []

      if (history.length === 0) {
        wx.showToast({ title: '没有可撤销的操作', icon: 'none', duration: 1200 })
        return
      }

      wx.vibrateShort({ type: 'light' })

      const newHistory = history.slice()
      const prevState = newHistory.pop()

      const allTools = this.data.tools || []
      const restoredOrder = []

      if (prevState.order && Array.isArray(prevState.order)) {
        for (let oi = 0; oi < prevState.order.length; oi++) {
          const orderId = prevState.order[oi]
          for (let ti = 0; ti < allTools.length; ti++) {
            if (allTools[ti].id === orderId) {
              restoredOrder.push(allTools[ti])
              break
            }
          }
        }
      }

      const restoredHidden = (prevState.hidden && Array.isArray(prevState.hidden)) ? prevState.hidden : []

      this.setData({
        filteredTools: restoredOrder,
        hiddenTools: restoredHidden,
        editHistory: newHistory,
        canUndo: newHistory.length > 0,
        selectedToolIndex: -1
      })

      this.updateHiddenToolsList(restoredHidden)
      this.saveCustomLayout()

      wx.showToast({
        title: '已撤销 ↩️',
        icon: 'none',
        duration: 800
      })
    } catch(e) {
      console.error('[layout] undoLastAction error:', e)
    }
  },

  toggleToolVisibility(e) {
    try {
      if (!this.data.isEditMode) return

      wx.vibrateShort({ type: 'light' })

      this.pushEditHistory()

      const id = e.currentTarget.dataset.id
      let hiddenTools = (this.data.hiddenTools || []).slice()

      const foundIdx = hiddenTools.indexOf(id)

      if (foundIdx > -1) {
        hiddenTools.splice(foundIdx, 1)
        wx.showToast({ title: '已显示 ✓', icon: 'none', duration: 1000 })
      } else {
        hiddenTools.push(id)
        wx.showToast({ title: '已隐藏 👁', icon: 'none', duration: 1000 })
      }

      this.updateHiddenToolsList(hiddenTools)

      const filteredTools = this.data.filteredTools || []
      let visibleTools = []
      for (let vi = 0; vi < filteredTools.length; vi++) {
        const tool = filteredTools[vi]
        const isHidden = hiddenTools.indexOf(tool.id) > -1
        if (!isHidden) {
          visibleTools.push(tool)
        }
      }

      this.setData({
        hiddenTools: hiddenTools,
        filteredTools: visibleTools,
        canUndo: true
      })
    } catch(e) {
      console.error('[layout] toggleToolVisibility error:', e)
    }
  },

  restoreHiddenTool(e) {
    try {
      wx.vibrateShort({ type: 'light' })

      const id = e.currentTarget.dataset.id
      let hiddenTools = (this.data.hiddenTools || []).slice()
      const newHidden = []
      for (let nh = 0; nh < hiddenTools.length; nh++) {
        if (hiddenTools[nh] !== id) {
          newHidden.push(hiddenTools[nh])
        }
      }
      hiddenTools = newHidden

      this.updateHiddenToolsList(hiddenTools)

      const allTools = this.data.tools || []
      let restoredTool = null
      for (let ai = 0; ai < allTools.length; ai++) {
        if (allTools[ai].id === id) {
          restoredTool = allTools[ai]
          break
        }
      }

      let visibleTools = (this.data.filteredTools || []).slice()
      if (restoredTool) {
        let alreadyExists = false
        for (let ve = 0; ve < visibleTools.length; ve++) {
          if (visibleTools[ve].id === id) {
            alreadyExists = true
            break
          }
        }
        if (!alreadyExists) {
          visibleTools.push(restoredTool)
        }
      }

      this.setData({
        hiddenTools: hiddenTools,
        filteredTools: visibleTools
      })

      const displayName = restoredTool ? restoredTool.name : '工具'
      wx.showToast({
        title: displayName + ' 已恢复 ✓',
        icon: 'success',
        duration: 1000
      })
    } catch(e) {
      console.error('[layout] restoreHiddenTool error:', e)
    }
  },

  updateHiddenToolsList(hiddenTools) {
    try {
      if (!hiddenTools || !Array.isArray(hiddenTools) || hiddenTools.length === 0) {
        this.setData({ hiddenToolsList: [] })
        return
      }

      const allTools = this.data.tools || []
      const hiddenList = []

      for (let i = 0; i < allTools.length; i++) {
        for (let j = 0; j < hiddenTools.length; j++) {
          if (hiddenTools[j] === allTools[i].id) {
            hiddenList.push(allTools[i])
            break
          }
        }
      }

      this.setData({ hiddenToolsList: hiddenList })
    } catch(e) {
      console.error('[layout] updateHiddenToolsList error:', e)
    }
  },

  saveCustomLayout() {
    try {
      const filteredTools = this.data.filteredTools || []
      const currentOrder = []
      for (let i = 0; i < filteredTools.length; i++) {
        currentOrder.push(filteredTools[i].id)
      }

      wx.setStorageSync('customToolOrder', currentOrder)
      wx.setStorageSync('hiddenTools', this.data.hiddenTools || [])

      this.setData({
        customOrder: currentOrder
      })
    } catch(e) {
      console.error('[layout] saveCustomLayout error:', e)
    }
  },

  resetLayout() {
    try {
      wx.vibrateShort({ type: 'medium' })

      const that = this

      wx.showModal({
        title: '⚠️ 重置布局',
        content: '确定要恢复默认布局吗？\n所有自定义排序和隐藏设置将被清除。\n\n💡 重置后可通过"撤销"按钮恢复',
        confirmText: '重置',
        cancelText: '取消',
        confirmColor: '#EF4444',
        success: function(res) {
          if (res.confirm) {
            that.pushEditHistory()

            wx.removeStorageSync('customToolOrder')
            wx.removeStorageSync('hiddenTools')

            that.setData({
              customOrder: [],
              hiddenTools: [],
              isEditMode: false,
              canUndo: true,
              selectedToolIndex: -1
            })

            let favorites = wx.getStorageSync('favorites') || []
            if (!Array.isArray(favorites)) {
              favorites = []
            }

            const defaultTools = require('./config').defaultTools || []
            const defaultToolsCopy = []

            for (let di = 0; di < defaultTools.length; di++) {
              const tcopy = {}
              const sourceTool = defaultTools[di]
              for (const key in sourceTool) {
                tcopy[key] = sourceTool[key]
              }
              tcopy.isFavorite = favorites.indexOf(tcopy.id) > -1
              defaultToolsCopy.push(tcopy)
            }

            that.setData({
              tools: defaultToolsCopy,
              filteredTools: defaultToolsCopy
            })

            wx.showToast({ title: '已恢复默认布局', icon: 'success' })
          }
        }
      })
    } catch(e) {
      console.error('[layout] resetLayout error:', e)
    }
  }
}
