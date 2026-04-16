App({
  globalData: {
    userInfo: null,
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
      { id: 22, name: '文档格式转换', category: 'dev' }
    ]
  },

  onLaunch() {
    console.log('百宝工具箱启动')
    
    if (!wx.getStorageSync('favorites')) {
      wx.setStorageSync('favorites', [])
    }
    
    if (!wx.getStorageSync('recentTools')) {
      wx.setStorageSync('recentTools', [])
    }
  },

  onShareAppMessage() {
    return {
      title: '🧰 百宝工具箱 - 22+实用小工具合集',
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return {
      title: '🧰 百宝工具箱 - 汇率换算、单位转换等22+实用工具',
      query: ''
    };
  }
})
