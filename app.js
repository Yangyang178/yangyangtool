App({
  globalData: {
    userInfo: null,
    isDarkMode: false,
    sharePosterPath: '',
    openid: '',
    cloudReady: false,
    tools: [
      { id: 1, name: '汇率换算', category: 'calculator' },
      { id: 2, name: '单位换算', category: 'calculator' },
      { id: 3, name: '房贷计算器', category: 'calculator' },
      { id: 4, name: '小费计算器', category: 'calculator' },
      { id: 5, name: '字数统计', category: 'text' },
      { id: 6, name: '大小写转换', category: 'text' },
      { id: 7, name: 'Base64编解码', category: 'text' },
      { id: 8, name: '二维码生成器', category: 'text' },
      { id: 9, name: '番茄计时', category: 'life' },
      { id: 10, name: '喝水提醒', category: 'life' },
      { id: 11, name: '随机决定', category: 'life' },
      { id: 12, name: '垃圾分类查询', category: 'life' },
      { id: 13, name: '日期计算器', category: 'datetime' },
      { id: 14, name: '倒计时', category: 'datetime' },
      { id: 15, name: '世界时钟', category: 'datetime' },
      { id: 16, name: '年龄计算器', category: 'datetime' },
      { id: 17, name: 'JSON格式化', category: 'dev' },
      { id: 18, name: '颜色转换', category: 'dev' },
      { id: 19, name: 'URL编解码', category: 'dev' },
      { id: 20, name: '正则表达式测试', category: 'dev' },
      { id: 21, name: '图片处理', category: 'dev' },
      { id: 22, name: '密码生成器', category: 'dev' },
      { id: 23, name: 'BMI 计算器', category: 'life' },
      { id: 24, name: '文本对比', category: 'text' },
      { id: 25, name: '个税计算器', category: 'calculator' }
    ]
  },

  onLaunch: function() {
    console.log('百宝工具箱启动')

    this.initCloud()
    this.initLocalData()
    this.applyTheme()

    if (wx.onThemeChange) {
      wx.onThemeChange(function(result) {
        var setting = wx.getStorageSync('darkModeSetting') || 'system'
        if (setting === 'system') {
          this.applyTheme()
        }
      }.bind(this))
    }
  },

  initCloud: function() {
    var that = this

    if (!wx.cloud) {
      console.log('[云开发] 当前版本不支持云开发，使用本地模式')
      return
    }

    try {
      wx.cloud.init({
        traceUser: true
      })

      that.globalData.cloudReady = true
      console.log('[云开发] 初始化成功(自动环境)')

      var db = wx.cloud.database()

      db.collection('tool_records').count({
        success: function(res) {
          console.log('[云数据库] 连接成功! tool_records记录数:', res.total)
        },
        fail: function(err) {
          console.log('[云数据库] 连接失败:', err.errMsg || JSON.stringify(err))
          that.globalData.cloudReady = false
        }
      })
    } catch(e) {
      console.log('[云开发] 初始化异常:', e.message || e)
      that.globalData.cloudReady = false
    }
  },

  initLocalData: function() {
    if (!wx.getStorageSync('favorites')) {
      wx.setStorageSync('favorites', [])
    }

    if (!wx.getStorageSync('recentTools')) {
      wx.setStorageSync('recentTools', [])
    }
  },

  syncLocalToCloud: function() {
    var that = this
    if (!that.globalData.cloudReady) return

    try {
      var db = wx.cloud.database()
      var totalUsage = wx.getStorageSync('totalUsageCount') || 0
      var todayStr = new Date().toDateString()
      var weeklyRecord = wx.getStorageSync('weeklyUsage') || {}
      var todayCount = weeklyRecord[todayStr] || 0
      var recentTools = wx.getStorageSync('recentTools') || []

      db.collection('usage_log').add({
        data: {
          date: todayStr,
          count: todayCount,
          toolsUsed: recentTools.slice(0, 10),
          totalUsageCount: totalUsage,
          createdAt: db.serverDate()
        }
      }).then(function() {
        console.log('[云端同步] usage_log 写入成功')
      }).catch(function(err) {
        console.log('[云端同步] usage_log 失败:', err.errMsg)
      })
    } catch(e) {}
  },

  cloudSyncUsage: function(toolId, toolName) {
    if (!this.globalData.cloudReady) return
    try {
      var db = wx.cloud.database()
      db.collection('usage_log').add({
        data: {
          toolId: toolId,
          toolName: toolName,
          usedAt: db.serverDate(),
          date: new Date().toDateString()
        }
      }).catch(function() {})
    } catch(e) {}
  },

  cloudSyncWaterRecord: function(record) {
    if (!this.globalData.cloudReady) return
    try {
      var db = wx.cloud.database()
      db.collection('tool_records').add({
        data: {
          toolType: 'water_reminder',
          record: record,
          createdAt: db.serverDate()
        }
      }).catch(function() {})
    } catch(e) {}
  },

  cloudSyncPomodoroRecord: function(record) {
    if (!this.globalData.cloudReady) return
    try {
      var db = wx.cloud.database()
      db.collection('tool_records').add({
        data: {
          toolType: 'pomodoro',
          record: record,
          createdAt: db.serverDate()
        }
      }).catch(function() {})
    } catch(e) {}
  },

  cloudSyncFeedback: function(feedback) {
    if (!this.globalData.cloudReady) return
    try {
      var db = wx.cloud.database()
      db.collection('user_feedbacks').add({
        data: {
          content: feedback.content || '',
          type: feedback.type || 'feedback',
          contact: feedback.contact || '',
          createdAt: db.serverDate()
        }
      }).then(function() {
        console.log('[云端同步] 反馈已保存到 user_feedbacks')
      }).catch(function(err) {
        console.log('[云端同步] 反馈失败:', err.errMsg)
      })
    } catch(e) {}
  },

  applyTheme: function() {
    var setting = wx.getStorageSync('darkModeSetting') || 'system'
    var isDark = false

    if (setting === 'system') {
      try {
        var res = wx.getSystemInfoSync()
        isDark = res.theme === 'dark'
      } catch (e) {
        isDark = false
      }
    } else {
      isDark = setting === 'dark'
    }

    this.globalData.isDarkMode = isDark
    wx.setStorageSync('darkMode', isDark)

    if (isDark) {
      wx.setBackgroundColor({ backgroundColor: '#0F172A', backgroundColorTop: '#0F172A', backgroundColorBottom: '#0F172A' })
      wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0F172A' })
      wx.setTabBarStyle({ color: '#64748B', selectedColor: '#60A5FA', backgroundColor: '#1E293B', borderStyle: 'black' })
    } else {
      wx.setBackgroundColor({ backgroundColor: '#F8FAFC', backgroundColorTop: '#F8FAFC', backgroundColorBottom: '#F8FAFC' })
      wx.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#F8FAFC' })
      wx.setTabBarStyle({ color: '#94A3B8', selectedColor: '#3B82F6', backgroundColor: '#FFFFFF', borderStyle: 'white' })
    }

    var pages = getCurrentPages()
    for (var pi = 0; pi < pages.length; pi++) {
      var page = pages[pi]
      if (page && page.setData) {
        page.setData({ isDarkMode: isDark })
      }
    }
  },

  lightTheme: {
    pageBg: '#F8FAFC', cardBg: '#FFFFFF', surfaceBg: '#F1F5F9',
    textPrimary: '#1E293B', textSecondary: '#64748B', textTertiary: '#94A3B8',
    borderLight: '#E2E8F0', borderFaint: '#F1F5F9'
  },

  darkTheme: {
    pageBg: '#0F172A', cardBg: '#1E293B', surfaceBg: '#1E293B',
    textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textTertiary: '#64748B',
    borderLight: '#334155', borderFaint: '#1E293B'
  },

  onShareAppMessage: function() {
    var poster = this.globalData.sharePosterPath || ''
    return {
      title: '\uD83C\uDFE0 \u767E\u5B9D\u5DE5\u5177\u7BB1 - 24+\u5B9E\u7528\u5C0F\u5DE5\u5177\u5408\u96C6',
      path: '/pages/index/index',
      imageUrl: poster
    };
  },

  onShareTimeline: function() {
    var poster = this.globalData.sharePosterPath || ''
    return {
      title: '\uD83C\uDFE0 \u767E\u5B9D\u5DE5\u5177\u7BB1 - \u6C47\u7387\u6362\u7B97\u3001\u5355\u4F4D\u8F6C\u6362\u7B4924+\u5B9E\u7528\u5DE5\u5177',
      query: '',
      imageUrl: poster
    };
  }
})
