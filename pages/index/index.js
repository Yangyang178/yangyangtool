var app = getApp()

var urlMap = {
  1: '/package-calculator/exchange-rate/exchange-rate',
  2: '/package-calculator/unit-converter/unit-converter',
  3: '/package-calculator/mortgage-calculator/mortgage-calculator',
  4: '/package-calculator/tip-calculator/tip-calculator',
  5: '/package-text/word-count/word-count',
  6: '/package-text/case-converter/case-converter',
  7: '/package-text/base64-tool/base64-tool',
  9: '/package-life/pomodoro/pomodoro',
  10: '/package-life/water-reminder/water-reminder',
  11: '/package-life/random-decision/random-decision',
  12: '/package-life/garbage-sorting/garbage-sorting',
  13: '/package-life/date-calculator/date-calculator',
  14: '/package-life/countdown/countdown',
  15: '/package-life/world-clock/world-clock',
  16: '/package-calculator/age-calculator/age-calculator',
  17: '/package-dev/json-formatter/json-formatter',
  18: '/package-dev/color-converter/color-converter',
  19: '/package-text/url-encoder/url-encoder',
  20: '/package-text/regex-tester/regex-tester',
  21: '/package-dev/image-processor/image-processor',
  22: '/package-dev/password-generator/password-generator',
  23: '/package-calculator/bmi-calculator/bmi-calculator',
  24: '/package-text/text-diff/text-diff',
  25: '/package-calculator/tax-calculator/tax-calculator'
}

Page({
  data: {
    greetingText: '',
    searchKeyword: '',
    searchHistory: [],
    hotSearchWords: ['汇率', '房贷', 'BMI', '个税', '字数', '番茄', 'JSON', '图片', '密码', '随机'],
    showSearchPanel: false,
    currentCategory: 'all',
    isRefreshing: false,
    scrollTop: 0,
    isDarkMode: false,
    showGuide: false,
    sharePosterPath: '',

    isLoading: true,

    isEditMode: false,
    isDragging: false,
    dragIndex: -1,

    selectedToolIndex: -1,

    canUndo: false,
    editHistory: [],

    customOrder: [],
    hiddenTools: [],
    hiddenToolsList: [],
    categories: [
      { id: 'all', name: '全部' },
      { id: 'calculator', name: '计算转换' },
      { id: 'text', name: '文本处理' },
      { id: 'life', name: '生活助手' },
      { id: 'datetime', name: '日期时间' },
      { id: 'dev', name: '开发调试' }
    ],
    tools: [
      {
        id: 21, name: '图片处理', description: '压缩/转换/裁剪/信息查看', icon: '\uD83D\uDCF9\uFE0F', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'dev', isHot: true, isFavorite: false
      },
      {
        id: 2, name: '单位换算', description: '长度/重量/温度等转换', icon: '\uD83D\uDCCF', iconBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', category: 'calculator', isHot: false, isFavorite: false
      },
      {
        id: 1, name: '汇率换算', description: '实时汇率，快速换汇', icon: '\u{1F4B1}', iconBg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', category: 'calculator', isHot: true, isFavorite: false
      },
      {
        id: 3, name: '房贷计算器', description: '月供、利息一目了然', icon: '\uD83C\uDFE0', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'calculator', isHot: true, isFavorite: false
      },
      {
        id: 5, name: '字数统计', description: '中英文字符精准统计', icon: '#\ufe0f\u20e3', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', isHot: true, isFavorite: false
      },
      {
        id: 13, name: '日期计算器', description: '间隔天数精确计算', icon: '\uD83D\uDCC5', iconBg: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)', category: 'datetime', isHot: true, isFavorite: false
      },
      {
        id: 11, name: '随机决定', description: '抽签做决定不再纠结', icon: '\uD83C\uDFB2', iconBg: 'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)', category: 'life', isHot: false, isFavorite: false
      },
      {
        id: 4, name: '小费计算器', description: '快速计算小费金额', icon: '\uD83D\uDCB0', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', isHot: false, isFavorite: false
      },
      {
        id: 6, name: '大小写转换', description: '英文大小写一键切换', icon: '\uD83D\uDD24', iconBg: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', category: 'text', isHot: false, isFavorite: false
      },
      {
        id: 7, name: 'Base64编解码', description: 'Base64编码解码工具', icon: '\uD83D\uDD10', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'text', isHot: false, isFavorite: false
      },
      {
        id: 9, name: '番茄计时', description: '专注工作25分钟', icon: '\uD83C\uDF45', iconBg: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)', category: 'life', isHot: true, isFavorite: false
      },
      {
        id: 10, name: '喝水提醒', description: '健康饮水定时提醒', icon: '\uD83D\uDCA7', iconBg: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)', category: 'life', isHot: false, isFavorite: false
      },
      {
        id: 12, name: '垃圾分类查询', description: '智能识别垃圾类型', icon: '\u267B\uFE0F', iconBg: 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)', category: 'life', isHot: false, isFavorite: false
      },
      {
        id: 14, name: '倒计时', description: '重要日期倒计时', icon: '\u23F0', iconBg: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)', category: 'datetime', isHot: false, isFavorite: false
      },
      {
        id: 15, name: '世界时钟', description: '全球时区时间查看', icon: '\uD83C\uDF0D', iconBg: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', category: 'datetime', isHot: false, isFavorite: false
      },
      {
        id: 16, name: '年龄计算器', description: '精确到天的年龄计算', icon: '\uD83E\uDDD2', iconBg: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)', category: 'datetime', isHot: false, isFavorite: false
      },
      {
        id: 17, name: 'JSON格式化', description: 'JSON美化压缩工具', icon: '{}', iconBg: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)', category: 'dev', isHot: true, isFavorite: false
      },
      {
        id: 18, name: '颜色转换', description: 'HEX/RGB/HSL互转', icon: '\uD83C\uDFA8', iconBg: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)', category: 'dev', isHot: false, isFavorite: false
      },
      {
        id: 19, name: 'URL编解码', description: 'URL编码解码工具', icon: '\uD83D\uDD17', iconBg: 'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)', category: 'dev', isHot: false, isFavorite: false
      },
      {
        id: 20, name: '正则表达式测试', description: '正则表达式在线测试', icon: '\u2728', iconBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', category: 'dev', isHot: false, isFavorite: false
      },
      {
        id: 22, name: '密码生成器', description: '自定义长度/字符类型，一键生成强密码', icon: '\uD83D\uDD10', iconBg: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)', category: 'dev', isHot: false, isFavorite: false
      },
      {
        id: 23, name: 'BMI 计算器', description: '身高体重→BMI指数+健康建议', icon: '\u2696\uFE0F', iconBg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', category: 'life', isHot: true, isFavorite: false
      },
      {
        id: 24, name: '文本对比', description: '两段文本差异对比，高亮显示不同处', icon: '\uD83D\uDD04', iconBg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', category: 'text', isHot: false, isFavorite: false
      },
      {
        id: 25, name: '个税计算器', description: '2024最新个税专项扣除，月薪→税后工资', icon: '\uD83D\uDCB0', iconBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', category: 'calculator', isHot: true, isFavorite: false
      }
    ]
  },

  onLoad: function() {
    this.updateGreeting()
    this.loadCustomLayout()
    this.filterTools()

    var favorites = wx.getStorageSync('favorites') || []
    var toolsData = this.data.tools
    var tools = []
    for (var i = 0; i < toolsData.length; i++) {
      var toolCopy = {}
      for (var key in toolsData[i]) {
        toolCopy[key] = toolsData[i][key]
      }
      var isFav = false
      for (var j = 0; j < favorites.length; j++) {
        if (favorites[j] === toolCopy.id) {
          isFav = true
          break
        }
      }
      toolCopy.isFavorite = isFav
      tools.push(toolCopy)
    }

    this.setData({ tools: tools, filteredTools: tools })

    wx.setStorageSync('allTools', this.data.tools)
    wx.setStorageSync('urlMap', urlMap)

    var history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })

    var hasSeenGuide = wx.getStorageSync('hasSeenGuide')
    if (!hasSeenGuide) {
      this.setData({ showGuide: true })
    }

    this.drawSharePoster()

    var that = this
    setTimeout(function() {
      that.setData({ isLoading: false })
    }, 600)
  },

  loadCustomLayout: function() {
    var customOrder = wx.getStorageSync('customToolOrder') || []
    var hiddenTools = wx.getStorageSync('hiddenTools') || []

    this.setData({
      customOrder: customOrder,
      hiddenTools: hiddenTools
    })

    if (customOrder.length > 0) {
      var tools = this.data.tools

      var orderedTools = []
      for (var oi = 0; oi < customOrder.length; oi++) {
        var skipHidden = false
        for (var hi = 0; hi < hiddenTools.length; hi++) {
          if (hiddenTools[hi] === customOrder[oi]) {
            skipHidden = true
            break
          }
        }
        if (!skipHidden) {
          for (var ti = 0; ti < tools.length; ti++) {
            if (tools[ti].id === customOrder[oi]) {
              orderedTools.push(tools[ti])
              break
            }
          }
        }
      }

      var remainingTools = []
      for (var ri = 0; ri < tools.length; ri++) {
        var inOrdered = false
        var isHidden = false
        for (var ci = 0; ci < customOrder.length; ci++) {
          if (customOrder[ci] === tools[ri].id) {
            inOrdered = true
            break
          }
        }
        for (var chi = 0; chi < hiddenTools.length; chi++) {
          if (hiddenTools[chi] === tools[ri].id) {
            isHidden = true
            break
          }
        }
        if (!inOrdered && !isHidden) {
          remainingTools.push(tools[ri])
        }
      }

      var finalTools = orderedTools.concat(remainingTools)
      this.setData({
        tools: finalTools,
        filteredTools: finalTools
      })
    } else if (hiddenTools.length > 0) {
      var visibleTools = []
      for (var vi = 0; vi < this.data.tools.length; vi++) {
        var hFound = false
        for (var vh = 0; vh < hiddenTools.length; vh++) {
          if (hiddenTools[vh] === this.data.tools[vi].id) {
            hFound = true
            break
          }
        }
        if (!hFound) visibleTools.push(this.data.tools[vi])
      }
      this.setData({
        tools: visibleTools,
        filteredTools: visibleTools
      })
    }

    this.updateHiddenToolsList(hiddenTools)
  },

  toggleEditMode: function() {
    wx.vibrateShort({ type: 'light' })

    if (!this.data.isEditMode) {
      wx.showModal({
        title: '\uD83D\uDCDD 编辑模式',
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
        title: '布局已保存 \u2705',
        icon: 'success',
        duration: 1500
      })
    }
  },

  onEditToolClick: function(e) {
    if (!this.data.isEditMode) return

    var index = e.currentTarget.dataset.index
    var currentSelected = this.data.selectedToolIndex

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

    var filteredTools = []
    for (var fi = 0; fi < this.data.filteredTools.length; fi++) {
      filteredTools.push(this.data.filteredTools[fi])
    }

    if (!filteredTools[currentSelected] || !filteredTools[index]) {
      console.warn('Invalid index for swap')
      return
    }

    this.pushEditHistory()

    var temp = filteredTools[currentSelected]
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
  },

  pushEditHistory: function() {
    var snapshot = []
    for (var i = 0; i < this.data.filteredTools.length; i++) {
      snapshot.push(this.data.filteredTools[i].id)
    }
    var hiddenSnapshot = []
    for (var j = 0; j < this.data.hiddenTools.length; j++) {
      hiddenSnapshot.push(this.data.hiddenTools[j])
    }
    var history = []
    for (var h = 0; h < this.data.editHistory.length; h++) {
      history.push(this.data.editHistory[h])
    }
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

  undoLastAction: function() {
    if (this.data.editHistory.length === 0) {
      wx.showToast({ title: '没有可撤销的操作', icon: 'none', duration: 1200 })
      return
    }

    wx.vibrateShort({ type: 'light' })

    var history = []
    for (var h = 0; h < this.data.editHistory.length; h++) {
      history.push(this.data.editHistory[h])
    }
    var prevState = history.pop()

    var allTools = this.data.tools
    var restoredOrder = []
    for (var oi = 0; oi < prevState.order.length; oi++) {
      for (var ti = 0; ti < allTools.length; ti++) {
        if (allTools[ti].id === prevState.order[oi]) {
          restoredOrder.push(allTools[ti])
          break
        }
      }
    }

    var restoredHidden = prevState.hidden || []

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

  toggleToolVisibility: function(e) {
    if (!this.data.isEditMode) return

    wx.vibrateShort({ type: 'light' })

    this.pushEditHistory()

    var id = e.currentTarget.dataset.id
    var hiddenTools = []
    for (var hi = 0; hi < this.data.hiddenTools.length; hi++) {
      hiddenTools.push(this.data.hiddenTools[hi])
    }

    var foundIdx = -1
    for (var fi = 0; fi < hiddenTools.length; fi++) {
      if (hiddenTools[fi] === id) {
        foundIdx = fi
        break
      }
    }
    if (foundIdx > -1) {
      hiddenTools.splice(foundIdx, 1)
      wx.showToast({ title: '已显示 \u2713', icon: 'none', duration: 1000 })
    } else {
      hiddenTools.push(id)
      wx.showToast({ title: '已隐藏 \uD83D\uDC41', icon: 'none', duration: 1000 })
    }

    this.updateHiddenToolsList(hiddenTools)

    var visibleTools = []
    for (var vi = 0; vi < this.data.filteredTools.length; vi++) {
      var isHidden = false
      for (var hv = 0; hv < hiddenTools.length; hv++) {
        if (hiddenTools[hv] === this.data.filteredTools[vi].id) {
          isHidden = true
          break
        }
      }
      if (!isHidden) visibleTools.push(this.data.filteredTools[vi])
    }
    this.setData({
      hiddenTools: hiddenTools,
      filteredTools: visibleTools,
      canUndo: true
    })
  },

  restoreHiddenTool: function(e) {
    wx.vibrateShort({ type: 'light' })

    var id = e.currentTarget.dataset.id
    var hiddenTools = []
    for (var hi = 0; hi < this.data.hiddenTools.length; hi++) {
      hiddenTools.push(this.data.hiddenTools[hi])
    }

    var newHidden = []
    for (var nh = 0; nh < hiddenTools.length; nh++) {
      if (hiddenTools[nh] !== id) newHidden.push(hiddenTools[nh])
    }
    hiddenTools = newHidden

    this.updateHiddenToolsList(hiddenTools)

    var allTools = this.data.tools
    var restoredTool = null
    for (var ai = 0; ai < allTools.length; ai++) {
      if (allTools[ai].id === id) {
        restoredTool = allTools[ai]
        break
      }
    }

    var visibleTools = []
    for (var vi = 0; vi < this.data.filteredTools.length; vi++) {
      visibleTools.push(this.data.filteredTools[vi])
    }
    if (restoredTool) {
      var alreadyExists = false
      for (var ve = 0; ve < visibleTools.length; ve++) {
        if (visibleTools[ve].id === id) {
          alreadyExists = true
          break
        }
      }
      if (!alreadyExists) visibleTools.push(restoredTool)
    }

    this.setData({
      hiddenTools: hiddenTools,
      filteredTools: visibleTools
    })

    var displayName = restoredTool ? restoredTool.name : '工具'
    wx.showToast({
      title: displayName + ' 已恢复 \u2713',
      icon: 'success',
      duration: 1000
    })
  },

  updateHiddenToolsList: function(hiddenTools) {
    if (!hiddenTools || hiddenTools.length === 0) {
      this.setData({ hiddenToolsList: [] })
      return
    }

    var allTools = this.data.tools
    var hiddenList = []
    for (var i = 0; i < allTools.length; i++) {
      for (var j = 0; j < hiddenTools.length; j++) {
        if (hiddenTools[j] === allTools[i].id) {
          hiddenList.push(allTools[i])
          break
        }
      }
    }

    this.setData({ hiddenToolsList: hiddenList })
  },

  saveCustomLayout: function() {
    var currentOrder = []
    for (var i = 0; i < this.data.filteredTools.length; i++) {
      currentOrder.push(this.data.filteredTools[i].id)
    }
    wx.setStorageSync('customToolOrder', currentOrder)
    wx.setStorageSync('hiddenTools', this.data.hiddenTools)

    this.setData({
      customOrder: currentOrder
    })
  },

  resetLayout: function() {
    wx.vibrateShort({ type: 'medium' })

    var that = this
    wx.showModal({
      title: '\u26A0\uFE0F 重置布局',
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

          var favorites = wx.getStorageSync('favorites') || []
          var defaultTools = []
          for (var di = 0; di < that.data.tools.length; di++) {
            var tcopy = {}
            for (var key in that.data.tools[di]) {
              tcopy[key] = that.data.tools[di][key]
            }
            var isFav = false
            for (var fj = 0; fj < favorites.length; fj++) {
              if (favorites[fj] === tcopy.id) {
                isFav = true
                break
              }
            }
            tcopy.isFavorite = isFav
            defaultTools.push(tcopy)
          }

          that.setData({
            tools: defaultTools,
            filteredTools: defaultTools
          })

          wx.showToast({ title: '已恢复默认布局', icon: 'success' })
        }
      }
    })
  },

  getPinyinFirstLetter: function(str) {
    if (!str) return ''
    var pinyinMap = {
      'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
      'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p',
      'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
      'y': 'y', 'z': 'z',
      '\u963f': 'a', '\u7231': 'a', '\u5b89': 'a',
      '\u628a': 'b', '\u767e': 'b', '\u534a': 'b', '\u672c': 'b', '\u6bd4': 'b', '\u53d8': 'b', '\u8868': 'b', '\u522b': 'b', '\u4e0d': 'b',
      '\u67e5': 'c', '\u5dee': 'c', '\u4ea7': 'c', '\u5e38': 'c', '\u6210': 'c', '\u7a0b': 'c', '\u5c3a': 'c', '\u51b2': 'c', '\u62bd': 'c', '\u5904': 'c', '\u9664': 'c', '\u6d4b': 'c', '\u7b56': 'c', '\u5b58': 'c', '\u64cd': 'c',
      '\u5927': 'd', '\u5355': 'd', '\u5f53': 'd', '\u5012': 'd', '\u5bfc': 'd', '\u5f97': 'd', '\u7684': 'd', '\u5730': 'd', '\u7b2c': 'd', '\u5178': 'd', '\u5b9a': 'd', '\u4e22': 'd', '\u5ea6': 'd', '\u6bb5': 'd', '\u77ed': 'd', '\u5bf9': 'd', '\u8fbe': 'd', '\u4ee3': 'd', '\u4e8c': 'e',
      '\u53d1': 'f', '\u6cd5': 'f', '\u53cd': 'f', '\u8303': 'f', '\u623f': 'f', '\u8d39': 'f', '\u5206': 'f', '\u4efd': 'f', '\u98ce': 'f', '\u590d': 'f', '\u4ed8': 'f', '\u8d1f': 'f',
      '\u6539': 'g', '\u6982': 'g', '\u5e72': 'g', '\u521a': 'g', '\u9ad8': 'g', '\u4e2a': 'g', '\u683c': 'g', '\u66f4': 'g', '\u5de5': 'g', '\u516c': 'g', '\u529f': 'g', '\u7ba1': 'g', '\u89c4': 'g', '\u56fd': 'g', '\u8fc7': 'g',
      '\u8fd8': 'h', '\u6d77': 'h', '\u542b': 'h', '\u884c': 'h', '\u597d': 'h', '\u53f7': 'h', '\u5408': 'h', '\u548c': 'h', '\u7ea2': 'h', '\u540e': 'h', '\u4e92': 'h', '\u5212': 'h', '\u5316': 'h', '\u6362': 'h', '\u9ec4': 'h', '\u6c47': 'h', '\u4f1a': 'h', '\u6df7': 'h', '\u6d3b': 'h', '\u6216': 'h', '\u83b7': 'h', '\u559d': 'h', '\u9ed1': 'h', '\u6052': 'h',
      '\u673a': 'j', '\u57fa': 'j', '\u53ca': 'j', '\u51e0': 'j', '\u8ba1': 'j', '\u8bb0': 'j', '\u9645': 'j', '\u52a0': 'j', '\u5bb6': 'j', '\u4ef7': 'j', '\u68c0': 'j', '\u7b80': 'j', '\u5efa': 'j', '\u5065': 'j', '\u5c06': 'j', '\u964d': 'j', '\u4ea4': 'j', '\u89d2': 'j', '\u6559': 'j', '\u63a5': 'j', '\u7ed3': 'j', '\u89e3': 'j', '\u754c': 'j', '\u501f': 'j', '\u4eca': 'j', '\u91d1': 'j', '\u7d27': 'j', '\u8fdb': 'j', '\u8fd1': 'j', '\u7ecf': 'j', '\u7cbe': 'j', '\u8b66': 'j', '\u7ade': 'j', '\u955c': 'j', '\u7a76': 'j', '\u4e5d': 'j', '\u4e45': 'j', '\u65e7': 'j', '\u5c40': 'j', '\u51b3': 'j', '\u89c9': 'j', '\u7edd': 'j', '\u5177': 'j', '\u5377': 'j',
      '\u5f00': 'k', '\u770b': 'k', '\u79d1': 'k', '\u53ef': 'k', '\u514b': 'k', '\u5ba2': 'k', '\u7a7a': 'k', '\u63a7': 'k', '\u53e3': 'k', '\u5feb': 'k', '\u5bbd': 'k', '\u6846': 'k',
      '\u62c9': 'l', '\u6765': 'l', '\u84dd': 'l', '\u6717': 'l', '\u7c7b': 'l', '\u7d2f': 'l', '\u79bb': 'l', '\u7406': 'l', '\u5386': 'l', '\u7acb': 'l', '\u5229': 'l', '\u529b': 'l', '\u4f8b': 'l', '\u8fde': 'l', '\u8054': 'l', '\u4e24': 'l', '\u91cf': 'l', '\u804a': 'l', '\u5217': 'l', '\u4e34': 'l', '\u9f84': 'l', '\u9886': 'l', '\u53e6': 'l', '\u6d41': 'l', '\u5f55': 'l', '\u4e71': 'l', '\u7387': 'l', '\u6ee4': 'l', '\u8f6e': 'l', '\u903b': 'l', '\u843d': 'l', '\u573e': 'l', '\u680f': 'l', '\u697c': 'l',
      '\u7801': 'm', '\u4e70': 'm', '\u6ee1': 'm', '\u6f2b': 'm', '\u732b': 'm', '\u5192': 'm', '\u8d38': 'm', '\u7709': 'm', '\u6bcf': 'm', '\u7f8e': 'm', '\u95e8': 'm', '\u7c73': 'm', '\u5bc6': 'm', '\u9762': 'm', '\u6c11': 'm', '\u540d': 'm', '\u660e': 'm', '\u547d': 'm', '\u6a21': 'm', '\u672b': 'm', '\u76ee': 'm', '\u9ed8': 'm',
      '\u90a3': 'n', '\u5185': 'n', '\u7eb3': 'n', '\u80fd': 'n', '\u5e74': 'n', '\u5ff5': 'n', '\u519c': 'n', '\u6d53': 'n', '\u6696': 'n',
      '\u6b27': 'o', '\u5076': 'o',
      '\u6392': 'p', '\u5224': 'p', '\u65c1': 'p', '\u8dd1': 'p', '\u914d': 'p', '\u6279': 'p', '\u7247': 'p', '\u504f': 'p', '\u62fc': 'p', '\u9891': 'p', '\u8bc4': 'p', '\u5c4f': 'p', '\u5e73': 'p', '\u51ed': 'p',
      '\u671f': 'q', '\u9f50': 'q', '\u5176': 'q', '\u68cb': 'q', '\u542f': 'q', '\u6c14': 'q', '\u5343': 'q', '\u7b7e': 'q', '\u524d': 'q', '\u94b1': 'q', '\u5f3a': 'q', '\u5207': 'q', '\u6e05': 'q', '\u60c5': 'q', '\u8bf7': 'q', '\u79cb': 'q', '\u6c42': 'q', '\u533a': 'q', '\u53d6': 'q', '\u8da3': 'q', '\u53bb': 'q', '\u5708': 'q', '\u5168': 'q', '\u6743': 'q', '\u786e': 'q',
      '\u7136': 'r', '\u8ba9': 'r', '\u70ed': 'r', '\u4eba': 'r', '\u8ba4': 'r', '\u4efb': 'r', '\u65e5': 'r', '\u5bb9': 'r', '\u5165': 'r', '\u8f6f': 'r',
      '\u4e09': 's', '\u6563': 's', '\u626b': 's', '\u8272': 's', '\u5220': 's', '\u4e0a': 's', '\u5c11': 's', '\u8bbe': 's', '\u6df1': 's', '\u5ba1': 's', '\u751f': 's', '\u5931': 's', '\u65f6': 's', '\u5b9e': 't', '\u8bc6': 's', '\u4e16': 's', '\u5f0f': 's', '\u793a': 's', '\u4e8b': 's', '\u662f': 's', '\u624b': 's', '\u9996': 's', '\u53d7': 's', '\u6570': 's', '\u5237': 's', '\u53cc': 's', '\u6c34': 's', '\u987a': 's', '\u8bf4': 's', '\u641c': 's', '\u901f': 's', '\u968f': 's', '\u788e': 's', '\u7b97': 's', '\u867d': 's', '\u7f29': 's', '\u9501': 's',
      '\u4ed6': 't', '\u53f0': 't', '\u8c08': 't', '\u5f39': 't', '\u7279': 't', '\u63d0': 't', '\u5929': 't', '\u586b': 't', '\u6761': 't', '\u8d34': 't', '\u94c1': 't', '\u901a': 't', '\u540c': 't', '\u7edf': 't', '\u5934': 't', '\u56fe': 't', '\u7a81': 't', '\u56e2': 't', '\u9000': 't', '\u62d6': 't',
      '\u5916': 'w', '\u5b8c': 'w', '\u7f51': 'w', '\u5371': 'w', '\u7ef4': 'w', '\u56f4': 'w', '\u4f4d': 'w', '\u6587': 'w', '\u7a33': 'w', '\u95ee': 'w', '\u5367': 'w', '\u65e0': 'w', '\u4e94': 'w', '\u7269': 'w',
      '\u4e0b': 'x', '\u5148': 'x', '\u663e': 'x', '\u73b0': 'x', '\u7ebf': 'x', '\u9650': 'x', '\u76f8': 'x', '\u5411': 'x', '\u9879': 'x', '\u6d88': 'x', '\u5c0f': 'x', '\u6548': 'x', '\u4e9b': 'x', '\u534f': 'x', '\u4fe1': 'x', '\u661f': 'x', '\u884c': 'x', '\u4fee': 'x', '\u79c0': 'x', '\u865a': 'x', '\u9700': 'x', '\u5e8f': 'x', 'u9009': 'x', '\u5b66': 'x', '\u96ea': 'x', '\u5bfb': 'x', '\u5faa': 'x', '\u9a8c': 'x', '\u54cd': 'x', '\u50cf': 'x', '\u4eab': 'x', '\u5fc3': 'x', '\u65b0': 'x', '\u9192': 'x', '\u8be6': 'x', '\u964d': 'x', '\u5199': 'x',
      '\u989c': 'y', '\u7f8a': 'y', '\u9633': 'y', '\u6837': 'y', '\u6447': 'y', '\u8981': 'y', '\u4e5f': 'y', '\u4e00': 'y', '\u4ee5': 'y', '\u6613': 'y', '\u610f': 'y', '\u56e0': 'y', '\u5f15': 'y', '\u5e94': 'y', '\u6620': 'y', '\u62e5': 'y', '\u6c38': 'y', '\u7528': 'y', '\u4f18': 'y', 'c5b0': 'y', '\u7531': 'y', '\u90ae': 'y', '\u6709': 'y', '\u53f3': 'y', '\u4e8e': 'y', '\u4f59': 'y', '\u4e0e': 'y', '\u9884': 'y', '\u57df': 'y', '\u5458': 'y', '\u539f': 'y', '\u6e90': 'y', '\u8fdc': 'y', '\u613f': 'y', '\u6708': 'y', '\u9605': 'y', '\u8d8a': 'y', '\u4e91': 'y', '\u5141': 'y', '\u8fd0': 'y', '\u97f5': 'y', 'u538b': 'y', '\u4e9a': 'y', '\u4e25': 'y', '\u773c': 'y', '\u6f14': 'y', 'u9a8c': 'y', '\u517b': 'y', '\u9875': 'y', '\u4f9d': 'y', '\u79fb': 'y', '\u5df2': 'y', '\u76ca': 'y', '\u4e49': 'y', '\u97f3': 'y', '\u9634': 'y', '\u94f6': 'y', 'u5370': 'y', '\u82f1': 'y', 'u8fce': 'y', '\u76c8': 'y', 'u5f71': 'y', '\u786c': 'y', '\u52c7': 'y', '\u60a0': 'y', '\u6cb9': 'y', 'u6e38': 'y', 'u53cb': 'y', 'u53c8': 'y', 'u5e7c': 'y', '\u9c7c': 'y', '\u6109': 'y', '\u6e14': 'y', '\u4e88': 'y', '\u5b87': 'y', '\u7fbd': 'y', '\u96e8': 'y', '\u8bed': 'y', '\u7389': 'y', '\u80b2': 'y', '\u6d74': 'y', '\u8c6b': 'y', '\u5fa1': 'y', '\u88d5': 'y', '\u9047': 'y', '\u8a89': 'y', '\u6108': 'y', '\u6b32': 'y', '\u5706': 'y', '\u7f18': 'y', '\u65e5': 'y', '\u7ea6': 'y', '\u8dc3': 'y', '\u94a5': 'y', '\u5cb3': 'y', '\u60a6': 'y', '\u5747': 'y', '\u8574': 'y',
      '\u5728': 'z', '\u54b1': 'z', '\u6742': 'z', '\u707e': 'z', '\u8f7d': 'z', '\u6682': 'z', '\u8d5e': 'z', '\u810f': 'z', '\u90ed': 'z', '\u65e9': 'z', '\u9020': 'z', '\u566a': 'z', '\u8d23': 'z', '\u62e9': 'z', '\u5219': 'z', '\u6cfd': 'z', '\u8d3c': 'z', '\u600e': 'z', '\u589e': 'z', '\u8d60': 'z', '\u624e': 'z', '\u7728': 'z', '\u5360': 'z', '\u5c55': 'z', '\u7ad9': 'z', '\u5f20': 'z', '\u638c': 'z', '\u4e08': 'z', '\u5e10': 'z', '\u8d26': 'z', '\u969c': 'z', '\u62db': 'z', '\u627e': 'z', '\u7167': 'z', '\u7f69': 'z', '\u6298': 'z', '\u54f2': 'z', '\u8005': 'z', '\u8fd9': 'z', '\u6d59': 'z', '\u9488': 'z', '\u4fa6': 'z', '\u771f': 'z', '\u8bca': 'z', '\u6795': 'z', '\u9635': 'z', '\u632f': 'z', '\u9547': 'z', '\u9707': 'z', '\u4e89': 'z', '\u5f81': 'z', '\u6574': 'z', '\u6b63': 'z', '\u8bc1': 'z', '\u653f': 'z', '\u75c7': 'z', '\u4e4b': 'z', '\u652f': 'z', '\u77e5': 'z', '\u7ec7': 'z', '\u8102': 'z', '\u6267': 'z', '\u503c': 'z', '\u804c': 'z', '\u76f4': 'z', '\u690d': 'z', '\u6b96': 'z', '\u6b62': 'z', '\u65e8': 'z', '\u6307': 'z', '\u7eb8': 'z', '\u81f3': 'z', '\u5fd7': 'z', '\u5236': 'z', '\u8d28': 'z', '\u6cbb': 'zh', '\u79e9': 'z', '\u667a': 'z', '\u7f6e': 'z', '\u4e2d': 'zh', '\u5fe0': 'zh', '\u949f': 'zh', '\u7ec8': 'zh', '\u79cd': 'zh', '\u4f17': 'zh', '\u5468': 'zhou', '\u6d32': 'z', '\u7ca5': 'z', '\u8f74': 'z', '\u8098': 'z', '\u76b1': 'z', '\u9aa4': 'z', '\u7af9': 'z', '\u7af9': 'z', '\u4e3b': 'z', 'u716e': 'z', u5631: 'z', '\u4f4f': 'z', '\u6ce8': 'z', '\u9a7b': 'z', '\u67f1': 'z', '\u52a9': 'z', '\u7b51': 'z', '\u795d': 'z', '\u8457': 'z', '\u6293': 'z', '\u62fd': 'z', '\u4e13': 'z', '\u8f6c': 'z', '\u8d5a': 'z', '\u5e84': 'z', '\u88c5': 'z', '\u58ee': 'z', '\u72b6': 'z', '\u649e': 'z', '\u8ffd': 'z', '\u51c6': 'z', '\u6355': 'z', '\u684c': 'z', '\u7740': 'z', '\u5179': 'z', '\u8d44': 'z', '\u59ff': 'z', '\u6ecb': 'z', '\u7c92': 'z', '\u5b50': 'z', '\u7d2b': 'z', '\u5b57': 'z', '\u81ea': 'z', '\u5b97': 'z', '\u7efc': 'z', '\u603b': 'z', '\u7eb5': 'z', '\u8d70': 'z', '\u594f': 'z', '\u79df': 'z', '\u8db3': 'z', '\u65cf': 'z', '\u963b': 'z', '\u7ec4': 'z', '\u7956': 'z', '\u5634': 'z', '\u9189': 'z', '\u6700': 'z', '\u7f6a': 'z', '\u5c0a': 'z', '\u9075': 'z', '\u6628': 'z', '\u5de6': 'z', 'u4f50': 'z', '\u505a': 'z', '\u5ea7': 'z'
    }
    var firstChar = str.charAt(0).toLowerCase()
    return pinyinMap[firstChar] || firstChar
  },

  addToSearchHistory: function(keyword) {
    if (!keyword.trim()) return
    var history = wx.getStorageSync('searchHistory') || []
    var newHistory = []
    for (var i = 0; i < history.length; i++) {
      if (history[i] !== keyword) newHistory.push(history[i])
    }
    newHistory.unshift(keyword)
    if (newHistory.length > 10) newHistory = newHistory.slice(0, 10)
    wx.setStorageSync('searchHistory', newHistory)
    this.setData({ searchHistory: newHistory })
  },

  clearSearchHistory: function() {
    var that = this
    wx.showModal({
      title: '\u6e05\u7a7a\u641c\u7d22\u5386\u53f2',
      content: '\u786e\u5b9a\u8981\u6e05\u7a7a\u6240\u6709\u641c\u7d22\u5386\u53f2\u5417\uff1f',
      confirmText: '\u6e05\u7a7a',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          that.setData({ searchHistory: [] })
          wx.showToast({ title: '\u5df2\u6e05\u7a7a', icon: 'success' })
        }
      }
    })
  },

  onHotSearchClick: function(e) {
    var keyword = e.currentTarget.dataset.word
    this.setData({ searchKeyword: keyword })
    this.addToSearchHistory(keyword)
    this.filterTools()
  },

  onHistoryClick: function(e) {
    var keyword = e.currentTarget.dataset.word
    this.setData({ searchKeyword: keyword })
    this.filterTools()
  },

  onShow: function() {
    this.updateGreeting()
    this.applyCurrentTheme()

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  applyCurrentTheme: function() {
    var appInstance = getApp()
    if (appInstance) {
      var isDark = appInstance.globalData.isDarkMode || wx.getStorageSync('darkMode') === true
      this.setData({ isDarkMode: isDark })
    }
  },

  updateGreeting: function() {
    var hour = new Date().getHours()
    var greeting = ''

    if (hour >= 5 && hour < 12) {
      greeting = '\u4e0a\u5348\u597d'
    } else if (hour >= 12 && hour < 14) {
      greeting = '\u4e2d\u5348\u597d'
    } else if (hour >= 14 && hour < 18) {
      greeting = '\u4e0b\u5348\u597d'
    } else if (hour >= 18 && hour < 22) {
      greeting = '\u665a\u4e0a\u597d'
    } else {
      greeting = '\u591c\u6df1\u4e86'
    }

    var weekDays = ['\u5468\u65e5', '\u5468\u4e00', '\u5468\u4e8c', '\u5468\u4e09', '\u5468\u56db', '\u5468\u4e94', '\u5468\u516d']
    var now = new Date()
    var dateStr = weekDays[now.getDay()] + ',' + (now.getMonth() + 1) + '\u6708' + now.getDate() + '\u65e5'

    this.setData({
      greetingText: greeting + '\n' + dateStr
    })
  },

  onSearchInput: function(e) {
    var keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })
    this.filterTools()
  },

  clearSearch: function() {
    this.setData({ searchKeyword: '', showSearchPanel: false })
    this.filterTools()
  },

  onCategoryChange: function(e) {
    var categoryId = e.currentTarget.dataset.id
    this.setData({ currentCategory: categoryId, showSearchPanel: false })
    this.filterTools()
  },

  filterTools: function() {
    var filtered = []
    for (var i = 0; i < this.data.tools.length; i++) {
      filtered.push(this.data.tools[i])
    }

    if (this.data.currentCategory !== 'all') {
      var newFiltered = []
      for (var f = 0; f < filtered.length; f++) {
        if (filtered[f].category === this.data.currentCategory) {
          newFiltered.push(filtered[f])
        }
      }
      filtered = newFiltered
    }

    if (this.data.searchKeyword) {
      var keyword = this.data.searchKeyword.toLowerCase()
      var pinyinKeyword = this.getPinyinFirstLetter(keyword)

      var matched = []
      for (var m = 0; m < filtered.length; m++) {
        var tool = filtered[m]
        var nameMatch = tool.name.toLowerCase().indexOf(keyword) > -1
        var descMatch = tool.description.toLowerCase().indexOf(keyword) > -1
        var pinyinMatch = this.getPinyinFirstLetter(tool.name).toLowerCase().indexOf(pinyinKeyword) > -1

        if (nameMatch || descMatch || pinyinMatch) {
          matched.push(tool)
        }
      }

      filtered = matched
      this.addToSearchHistory(this.data.searchKeyword)
    }

    this.setData({ filteredTools: filtered })
  },

  onSearchFocus: function() {
    this.setData({ showSearchPanel: true })
  },

  onSearchBlur: function() {
    var that = this
    setTimeout(function() {
      that.setData({ showSearchPanel: false })
    }, 200)
  },

  onToolClick: function(e) {
    var tool = e.currentTarget.dataset.tool

    wx.vibrateShort({ type: 'light' })

    this.saveRecentTool(tool)
    this.recordWeeklyUsage()

    var url = urlMap[tool.id]

    if (url) {
      wx.navigateTo({
        url: url,
        fail: function(err) {
          console.log('\u8df3\u8f6c\u5931\u8d25:', err)
          wx.showToast({
            title: '\u9875\u9762\u8df3\u8f6c\u5931\u8d25',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '\u529f\u80fd\u5f00\u53d1\u4e2d...',
        icon: 'none',
        duration: 1500
      })
    }
  },

  toggleFavorite: function(e) {
    var id = e.currentTarget.dataset.id
    var tools = []
    for (var i = 0; i < this.data.tools.length; i++) {
      var t = {}
      for (var key in this.data.tools[i]) {
        t[key] = this.data.tools[i][key]
      }
      if (t.id === id) {
        t.isFavorite = !t.isFavorite
      }
      tools.push(t)
    }

    var favorites = []
    for (var j = 0; j < tools.length; j++) {
      if (tools[j].isFavorite) favorites.push(tools[j].id)
    }
    wx.setStorageSync('favorites', favorites)

    wx.vibrateShort({ type: 'light' })

    this.setData({ tools: tools })
    this.filterTools()

    var hasId = false
    for (var k = 0; k < favorites.length; k++) {
      if (favorites[k] === id) { hasId = true; break }
    }
    if (hasId) {
      this.showHeartAnimation()
    }
  },

  onToolLongPress: function(e) {
    wx.vibrateShort({ type: 'medium' })
    var tool = e.currentTarget.dataset.tool
    this.setData({
      showMenu: true,
      menuTool: tool
    })
  },

  closeMenu: function() {
    this.setData({
      showMenu: false,
      menuTool: null
    })
  },

  showHeartAnimation: function() {
    this.setData({ showHeart: true })
    var that = this
    setTimeout(function() {
      that.setData({ showHeart: false })
    }, 800)
  },

  recordWeeklyUsage: function() {
    var today = new Date()
    var y = today.getFullYear()
    var mo = today.getMonth() + 1
    var d = today.getDate()
    var moStr = mo < 10 ? '0' + mo : '' + mo
    var dStr = d < 10 ? '0' + d : '' + d
    var dateKey = y + '-' + moStr + '-' + dStr

    var weeklyRecord = wx.getStorageSync('weeklyUsage') || {}
    weeklyRecord[dateKey] = (weeklyRecord[dateKey] || 0) + 1

    var oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)
    var keysToRemove = []
    var _keys = []
    for (var k in weeklyRecord) {
      _keys.push(k)
    }
    for (var ki = 0; ki < _keys.length; ki++) {
      var parts = _keys[ki].split('-')
      var ky = parseInt(parts[0], 10)
      var km = parseInt(parts[1], 10) - 1
      var kd = parseInt(parts[2], 10)
      var kdDate = new Date(ky, km, kd)
      if (kdDate < oneWeekAgo) {
        keysToRemove.push(_keys[ki])
      }
    }
    for (var kr = 0; kr < keysToRemove.length; kr++) {
      delete weeklyRecord[keysToRemove[kr]]
    }

    wx.setStorageSync('weeklyUsage', weeklyRecord)
  },

  saveRecentTool: function(tool) {
    var recentTools = wx.getStorageSync('recentTools') || []
    var newRecent = []
    for (var i = 0; i < recentTools.length; i++) {
      if (recentTools[i].id !== tool.id) newRecent.push(recentTools[i])
    }
    newRecent.unshift({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      iconBg: tool.iconBg,
      usedAt: new Date().getTime()
    })
    if (newRecent.length > 20) newRecent = newRecent.slice(0, 20)
    wx.setStorageSync('recentTools', newRecent)

    var currentCount = wx.getStorageSync('totalUsageCount') || 0
    wx.setStorageSync('totalUsageCount', currentCount + 1)
  },

  showMoreMenu: function() {
    var that = this
    wx.showActionSheet({
      itemList: ['\u5173\u4e8e\u6211\u4eec', '\u610f\u89c1\u53cd\u9988', '\u5206\u4eab\u7ed9\u670b\u53cb'],
      success: function(res) {
        switch (res.tapIndex) {
          case 0:
            wx.showToast({ title: '\u767e\u5b9d\u5de5\u5177\u7bb1 v1.0', icon: 'none' })
            break
          case 1:
            wx.showToast({ title: '\u611f\u8c22\u60a8\u7684\u53cd\u9988\uff01', icon: 'none' })
            break
          case 2:
            break
        }
      }
    })
  },

  onShareAppMessage: function() {
    return {
      title: '🧰 百宝工具箱 - 24+实用小工具合集',
      path: '/pages/index/index',
      imageUrl: this.data.sharePosterPath || ''
    }
  },

  onShareTimeline: function() {
    return {
      title: '🧰 百宝工具箱 - 汇率换算、单位转换等24+实用工具',
      query: '',
      imageUrl: this.data.sharePosterPath || ''
    }
  },

  drawSharePoster: function() {
    var that = this
    var appInstance = getApp()
    
    if (appInstance.globalData.sharePosterPath) {
      that.setData({ sharePosterPath: appInstance.globalData.sharePosterPath })
      return
    }

    const query = wx.createSelectorQuery()
    query.select('#shareCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0]) return
        
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = 500 * dpr
        canvas.height = 400 * dpr
        ctx.scale(dpr, dpr)

        ctx.fillStyle = '#0F172A'
        roundRect(ctx, 0, 0, 500, 400, 24)
        ctx.fill()

        var topGrad = ctx.createLinearGradient(0, 0, 500, 200)
        topGrad.addColorStop(0, '#1E3A5F')
        topGrad.addColorStop(1, '#0F172A')
        ctx.fillStyle = topGrad
        roundRect(ctx, 0, 0, 500, 200, 24)
        ctx.fill()

        ctx.globalAlpha = 0.15
        ctx.fillStyle = '#3B82F6'
        ctx.beginPath()
        ctx.arc(430, 40, 100, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(60, 160, 70, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.08
        ctx.fillStyle = '#8B5CF6'
        ctx.beginPath()
        ctx.arc(380, 170, 60, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1

        ctx.font = 'bold 44px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🧰 百宝工具箱', 250, 72)

        ctx.font = '16px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillText('即用即走 · 轻量高效 · 实用便捷', 250, 105)

        var tools = [
          { icon: '💱', name: '汇率' },
          { icon: '📐', name: '单位' },
          { icon: '🏠', name: '房贷' },
          { icon: '💰', name: '小费' },
          { icon: '#️⃣', name: '字数' },
          { icon: '🔤', name: '大小写' },
          { icon: '🔐', name: 'Base64' },
          { icon: '🍅', name: '番茄钟' },
          { icon: '💧', name: '喝水' },
          { icon: '🎲', name: '随机' },
          { icon: '♻️', name: '垃圾分类' },
          { icon: '📅', name: '日期' }
        ]

        var cardX = 30
        var cardY = 130
        var cardW = 440
        var cardH = 180
        var cardR = 20

        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR)
        ctx.stroke()

        var cols = 6
        var rows = 2
        var itemW = 68
        var itemH = 76
        var gapX = (cardW - cols * itemW) / (cols + 1)
        var gapY = (cardH - rows * itemH) / (rows + 1)

        for (var ti = 0; ti < tools.length; ti++) {
          var col = ti % cols
          var row = Math.floor(ti / cols)
          var ix = cardX + gapX + col * (itemW + gapX)
          var iy = cardY + gapY + row * (itemH + gapY)

          ctx.globalAlpha = 0.12
          roundRect(ctx, ix, iy, itemW, itemH, 14)
          ctx.fill()
          ctx.globalAlpha = 1

          ctx.font = '26px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(tools[ti].icon, ix + itemW / 2, iy + itemH / 2 - 8)

          ctx.font = '11px sans-serif'
          ctx.fillStyle = 'rgba(255,255,255,0.65)'
          ctx.fillText(tools[ti].name, ix + itemW / 2, iy + itemH - 14)
        }

        ctx.textAlign = 'center'

        var bottomGrad = ctx.createLinearGradient(250, 330, 250, 380)
        bottomGrad.addColorStop(0, '#3B82F6')
        bottomGrad.addColorStop(1, '#1D4ED8')
        roundRect(ctx, 50, 328, 400, 48, 24)
        ctx.fillStyle = bottomGrad
        ctx.fill()

        ctx.font = '600 18px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('✨ 24+ 实用工具，一键即达', 250, 355)

        setTimeout(function() {
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: 500,
            height: 400,
            destWidth: 500,
            destHeight: 400,
            fileType: 'png',
            quality: 1,
            success: function(res) {
              if (res.tempFilePath) {
                appInstance.globalData.sharePosterPath = res.tempFilePath
                that.setData({ sharePosterPath: res.tempFilePath })
              }
            }
          }, that)
        }, 100)
      })
  },

  onGuideClose: function() {
    this.setData({ showGuide: false })
  },

  onPullDownRefresh: function() {
    this.setData({ isRefreshing: true })

    var that = this
    setTimeout(function() {
      that.updateGreeting()
      that.setData({ isRefreshing: false })
      wx.stopPullDownRefresh()
      wx.showToast({ title: '\u5237\u65b0\u6210\u529f', icon: 'success' })
    }, 1000)
  },

  onScrollToUpper: function() {
    this.setData({ scrollTop: 1 })
    var that = this
    setTimeout(function() {
      that.setData({ scrollTop: 0 })
    }, 50)
  },

  onPageScroll: function(e) {
    var st = 0
    if (e.detail && e.detail.scrollTop !== undefined) {
      st = e.detail.scrollTop
    } else if (e.detail && e.detail.scrollY !== undefined) {
      st = e.detail.scrollY
    }
    if (st < 5 && st > -50) {
      if (!this._scrollFixTimer) {
        var that = this
        this._scrollFixTimer = setTimeout(function() {
          that._scrollFixTimer = null
          if (that.data.scrollTop !== 0) {
            that.setData({ scrollTop: 0 })
          }
        }, 100)
      }
    }
  }
})

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
