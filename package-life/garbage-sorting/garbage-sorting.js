const garbageData = [
  { name: '废纸箱', emoji: '📦', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '包括纸箱、报纸、书本、打印纸等纸制品', tip: '请保持清洁干燥，折叠后投放' },
  { name: '塑料瓶', emoji: '🍶', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '饮料瓶、洗发水瓶等塑料制品', tip: '清空内容物，冲洗干净后投放' },
  { name: '易拉罐', emoji: '🥫', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '铝制或铁制的金属罐', tip: '清空内容物，压扁后投放' },
  { name: '玻璃瓶', emoji: '🫙', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '酒瓶、调料瓶、玻璃杯等玻璃制品', tip: '小心轻放，避免破碎' },
  { name: '旧衣服', emoji: '👕', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '衣物、床单、窗帘等纺织品', tip: '清洗干净，打包后投放至回收点' },
  { name: '电池', emoji: '🔋', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '充电电池、纽扣电池、铅酸电池等', tip: '切勿随意丢弃，投入有害垃圾桶' },
  { name: '灯管', emoji: '💡', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '荧光灯管、节能灯、LED灯等', tip: '小心轻放，避免破碎造成汞污染' },
  { name: '药品', emoji: '💊', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '过期药品及其包装', tip: '连同包装一起投入有害垃圾桶' },
  { name: '油漆桶', emoji: '🪣', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '油漆、涂料、溶剂等化学制品容器', tip: '密封后投放，避免泄漏' },
  { name: '杀虫剂', emoji: '🧴', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '各类杀虫剂、除草剂等农药', tip: '连同包装一起投放至有害垃圾桶' },
  { name: '剩菜剩饭', emoji: '🍚', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '剩余饭菜、糕点、蔬菜等食物残渣', tip: '沥干水分后投放，避免混入餐具' },
  { name: '果皮', emoji: '🍎', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '水果皮、核、蔬菜叶等', tip: '直接投放至厨余垃圾桶' },
  { name: '蛋壳', emoji: '🥚', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '鸡蛋壳、鸭蛋壳等', tip: '可直接投放' },
  { name: '茶叶渣', emoji: '🍵', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '泡过的茶叶、咖啡渣等', tip: '沥干水分后投放' },
  { name: '骨头', emoji: '🦴', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '小骨头（鸡骨、鱼骨等）', tip: '大骨头属于其他垃圾' },
  { name: '卫生纸', emoji: '🧻', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '使用过的卫生纸、餐巾纸等', tip: '已被污染，无法回收利用' },
  { name: '烟蒂', emoji: '🚬', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '烟头、烟灰等', tip: '确保熄灭后投放' },
  { name: '陶瓷碎片', emoji: '🏺', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '破碎的陶瓷、瓦片等', tip: '用纸包裹后再投放，避免划伤' },
  { name: '一次性餐具', emoji: '🥢', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '一次性筷子、饭盒、杯子等', tip: '清理残留食物后投放' },
  { name: '尘土', emoji: '🌪️', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '灰尘、清扫垃圾等', tip: '装袋后密封投放' },
  { name: '牛奶盒', emoji: '🥛', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '利乐包、牛奶盒等复合包装', tip: '清洗、剪开、压扁后投放' },
  { name: '旧书刊', emoji: '📚', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '书籍、杂志、宣传册等', tip: '捆绑整齐后投放' },
  { name: '温度计', emoji: '🌡️', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '水银温度计等含汞物品', tip: '小心轻放，避免破碎' },
  { name: '过期化妆品', emoji: '💄', category: 'hazardous', categoryShort: '有害', categoryText: '有害垃圾', desc: '过期的护肤品、化妆品', tip: '连同包装一起投放' },
  { name: '菜叶', emoji: '🥬', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '各种蔬菜叶子', tip: '可直接投放' },
  { name: '鱼骨', emoji: '🐟', category: 'kitchen', categoryShort: '厨余', categoryText: '厨余垃圾', desc: '鱼类小骨头', tip: '大鱼骨属于其他垃圾' },
  { name: '贝壳', emoji: '🐚', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '蛤蜊、扇贝等海鲜壳', tip: '难以降解，属于其他垃圾' },
  { name: '大骨头', emoji: '🍖', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '猪骨、牛骨等大块骨头', tip: '难以粉碎处理，属其他垃圾' },
  { name: '废旧金属', emoji: '⚙️', category: 'recyclable', categoryShort: '可回收', categoryText: '可回收物', desc: '铁丝、铜线、铝制品等金属', tip: '清洁后投放至可回收桶' },
  { name: '充电器', emoji: '🔌', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '损坏的电子配件', tip: '建议送至专门回收点' },
  { name: '外卖餐盒', emoji: '🍱', category: 'other', categoryShort: '其他', categoryText: '其他垃圾', desc: '一次性塑料餐盒', tip: '油污严重时属其他垃圾' }
]

Page({
  data: {
    searchKeyword: '',
    currentCategory: 'all',
    showResult: false,
    resultItem: null,
    filteredItems: garbageData,
    historyList: [],
    categoryTitle: ''
  },

  onLoad() {
    this.loadHistory()
    this.filterItems()
  },

  onShow() {
    
  },

  loadHistory() {
    const history = wx.getStorageSync('garbage_history') || []
    this.setData({ historyList: history.slice(0, 10) })
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterItems()
  },

  onSearch() {
    wx.vibrateShort({ type: 'light' })
    const keyword = this.data.searchKeyword.trim()
    if (!keyword) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    
    const result = garbageData.find(item => 
      item.name.includes(keyword)
    )
    
    if (result) {
      this.showResult(result)
      this.addToHistory(result)
    } else {
      wx.showToast({ title: '未找到该物品', icon: 'none' })
    }
  },

  switchCategory(e) {
    wx.vibrateShort({ type: 'light' })
    const category = e.currentTarget.dataset.category
    const titleMap = {
      recyclable: '可回收物',
      hazardous: '有害垃圾',
      kitchen: '厨余垃圾',
      other: '其他垃圾'
    }
    
    this.setData({
      currentCategory: category,
      showResult: false,
      categoryTitle: titleMap[category] || ''
    })
    this.filterItems()
  },

  filterItems() {
    let items = garbageData
    
    if (this.data.currentCategory !== 'all') {
      items = items.filter(item => item.category === this.data.currentCategory)
    }
    
    if (this.data.searchKeyword.trim()) {
      const keyword = this.data.searchKeyword.trim()
      items = items.filter(item => 
        item.name.includes(keyword) || item.desc.includes(keyword)
      )
    }
    
    this.setData({ filteredItems: items })
  },

  onItemClick(e) {
    wx.vibrateShort({ type: 'light' })
    const item = e.currentTarget.dataset.item
    this.showResult(item)
    this.addToHistory(item)
  },

  showResult(item) {
    this.setData({
      showResult: true,
      resultItem: item
    })
  },

  addToHistory(item) {
    const history = wx.getStorageSync('garbage_history') || []
    const newRecord = {
      ...item,
      time: Date.now()
    }
    
    const filtered = history.filter(h => h.name !== item.name)
    filtered.unshift(newRecord)
    
    const saved = filtered.slice(0, 20)
    wx.setStorageSync('garbage_history', saved)
    this.setData({ historyList: saved.slice(0, 10) })
  },

  onHistoryClick(e) {
    wx.vibrateShort({ type: 'light' })
    const item = e.currentTarget.dataset.item
    this.showResult(item)
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空查询历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('garbage_history')
          this.setData({ historyList: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '垃圾分类查询 - 百宝工具箱',
      path: '/pages/tools/garbage-sorting/garbage-sorting'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})