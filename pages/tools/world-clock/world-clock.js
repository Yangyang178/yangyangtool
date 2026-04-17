const allCities = [
  { id: 'beijing', city: '北京', country: '中国', emoji: '🏛️', timezone: 'UTC+8', offset: 8 },
  { id: 'shanghai', city: '上海', country: '中国', emoji: '🌃', timezone: 'UTC+8', offset: 8 },
  { id: 'tokyo', city: '东京', country: '日本', emoji: '🗼', timezone: 'UTC+9', offset: 9 },
  { id: 'seoul', city: '首尔', country: '韩国', emoji: '🏯', timezone: 'UTC+9', offset: 9 },
  { id: 'singapore', city: '新加坡', country: '新加坡', emoji: '🌴', timezone: 'UTC+8', offset: 8 },
  { id: 'hongkong', city: '香港', country: '中国', emoji: '🌉', timezone: 'UTC+8', offset: 8 },
  { id: 'taipei', city: '台北', country: '中国台湾', emoji: '🏙️', timezone: 'UTC+8', offset: 8 },
  { id: 'bangkok', city: '曼谷', country: '泰国', emoji: '🛕', timezone: 'UTC+7', offset: 7 },
  { id: 'dubai', city: '迪拜', country: '阿联酋', emoji: '🏜️', timezone: 'UTC+4', offset: 4 },
  { id: 'moscow', city: '莫斯科', country: '俄罗斯', emoji: '🏰', timezone: 'UTC+3', offset: 3 },
  { id: 'london', city: '伦敦', country: '英国', emoji: '🎡', timezone: 'UTC+0', offset: 0 },
  { id: 'paris', city: '巴黎', country: '法国', emoji: '🗼', timezone: 'UTC+1', offset: 1 },
  { id: 'berlin', city: '柏林', country: '德国', emoji: '⛪', timezone: 'UTC+1', offset: 1 },
  { id: 'rome', city: '罗马', country: '意大利', emoji: '🏟️', timezone: 'UTC+1', offset: 1 },
  { id: 'amsterdam', city: '阿姆斯特丹', country: '荷兰', emoji: '🚲', timezone: 'UTC+1', offset: 1 },
  { id: 'newyork', city: '纽约', country: '美国', emoji: '🗽', timezone: 'UTC-5', offset: -5 },
  { id: 'losangeles', city: '洛杉矶', country: '美国', emoji: '🎬', timezone: 'UTC-8', offset: -8 },
  { id: 'chicago', city: '芝加哥', country: '美国', emoji: '🌆', timezone: 'UTC-6', offset: -6 },
  { id: 'sanfrancisco', city: '旧金山', country: '美国', emoji: '🌉', timezone: 'UTC-8', offset: -8 },
  { id: 'toronto', city: '多伦多', country: '加拿大', emoji: '🍁', timezone: 'UTC-5', offset: -5 },
  { id: 'vancouver', city: '温哥华', country: '加拿大', emoji: '🏔️', timezone: 'UTC-8', offset: -8 },
  { id: 'sydney', city: '悉尼', country: '澳大利亚', emoji: '🦘', timezone: 'UTC+11', offset: 11 },
  { id: 'melbourne', city: '墨尔本', country: '澳大利亚', emoji: '🎭', timezone: 'UTC+11', offset: 11 },
  { id: 'auckland', city: '奥克兰', country: '新西兰', emoji: '🥝', timezone: 'UTC+13', offset: 13 },
  { id: 'mumbai', city: '孟买', country: '印度', emoji: '🕌', timezone: 'UTC+5:30', offset: 5.5 },
  { id: 'cairo', city: '开罗', country: '埃及', emoji: '🐪', timezone: 'UTC+2', offset: 2 },
  { id: 'johannesburg', city: '约翰内斯堡', country: '南非', emoji: '🦁', timezone: 'UTC+2', offset: 2 },
  { id: 'saopaulo', city: '圣保罗', country: '巴西', emoji: '☕', timezone: 'UTC-3', offset: -3 },
  { id: 'mexicocity', city: '墨西哥城', country: '墨西哥', emoji: '🌮', timezone: 'UTC-6', offset: -6 },
  { id: 'buenosaires', city: '布宜诺斯艾利斯', country: '阿根廷', emoji: '💃', timezone: 'UTC-3', offset: -3 }
]

Page({
  data: {
    localTime: '',
    localDate: '',
    localOffset: '+8',
    localWeekday: '',
    cityList: [],
    showCityPicker: false,
    searchKeyword: '',
    filteredCities: allCities,
    popularCities: [
      { id: 'tokyo', city: '东京', emoji: '🗼' },
      { id: 'newyork', city: '纽约', emoji: '🗽' },
      { id: 'london', city: '伦敦', emoji: '🎡' },
      { id: 'paris', city: '巴黎', emoji: '🗼' },
      { id: 'sydney', city: '悉尼', emoji: '🦘' },
      { id: 'dubai', city: '迪拜', emoji: '🏜️' },
      { id: 'singapore', city: '新加坡', emoji: '🌴' },
      { id: 'seoul', city: '首尔', emoji: '🏯' }
    ],
    timeUpdateTimer: null
  },

  onLoad() {
    this.updateLocalTime()
    this.loadSavedCities()
    this.startTimer()
  },

  onShow() {
    if (!this.data.timeUpdateTimer) {
      this.startTimer()
    }
  },

  onHide() {
    this.stopTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  startTimer() {
    this.updateAllTimes()
    this.data.timeUpdateTimer = setInterval(() => {
      this.updateLocalTime()
      this.updateAllTimes()
    }, 1000)
  },

  stopTimer() {
    if (this.data.timeUpdateTimer) {
      clearInterval(this.data.timeUpdateTimer)
      this.setData({ timeUpdateTimer: null })
    }
  },

  updateLocalTime() {
    const now = new Date()
    
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const weekday = weekdays[now.getDay()]
    
    const offset = -now.getTimezoneOffset() / 60
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`

    this.setData({
      localTime: `${hours}:${minutes}:${seconds}`,
      localDate: `${year}年${month}月${day}日`,
      localOffset: offsetStr,
      localWeekday: weekday
    })
  },

  updateAllTimes() {
    const cities = this.data.cityList.map(city => {
      return this.getCityTime(city)
    })
    this.setData({ cityList: cities })
  },

  getCityTime(city) {
    const now = new Date()
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const cityTime = new Date(utc + (3600000 * city.offset))
    
    const hours = String(cityTime.getHours()).padStart(2, '0')
    const minutes = String(cityTime.getMinutes()).padStart(2, '0')
    const seconds = String(cityTime.getSeconds()).padStart(2, '0')
    
    const year = cityTime.getFullYear()
    const month = String(cityTime.getMonth() + 1).padStart(2, '0')
    const day = String(cityTime.getDate()).padStart(2, '0')

    const localOffset = -now.getTimezoneOffset() / 60
    const diffHours = Math.round(city.offset - localOffset)

    let diffType = 'same'
    let diffText = ''
    
    if (diffHours > 0) {
      diffType = 'ahead'
      diffText = `+${diffHours}小时`
    } else if (diffHours < 0) {
      diffType = 'behind'
      diffText = `${diffHours}小时`
    } else {
      diffType = 'same'
      diffText = '相同'
    }

    return {
      ...city,
      time: `${hours}:${minutes}:${seconds}`,
      date: `${month}/${day}`,
      diffType,
      diffText
    }
  },

  showAddCity() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ 
      showCityPicker: true, 
      searchKeyword: '',
      filteredCities: allCities 
    })
  },

  hideAddCity() {
    this.setData({ showCityPicker: false })
  },

  onSearchCity(e) {
    const keyword = e.detail.value.toLowerCase().trim()
    this.setData({ searchKeyword: e.detail.value })
    
    if (!keyword) {
      this.setData({ filteredCities: allCities })
      return
    }

    const filtered = allCities.filter(city =>
      city.city.includes(keyword) || 
      city.country.includes(keyword) ||
      city.id.includes(keyword)
    )
    this.setData({ filteredCities: filtered })
  },

  selectCity(e) {
    wx.vibrateShort({ type: 'medium' })
    const city = e.currentTarget.dataset.city
    
    const exists = this.data.cityList.find(c => c.id === city.id)
    if (exists) {
      wx.showToast({ title: '该城市已添加', icon: 'none' })
      return
    }

    const cityWithTime = this.getCityTime(city)
    const cities = [...this.data.cityList, cityWithTime]
    
    this.setData({
      cityList: cities,
      showCityPicker: false,
      searchKeyword: ''
    })

    this.saveCities(cities)
    wx.showToast({ title: `已添加${city.city}`, icon: 'success' })
  },

  quickAddCity(e) {
    wx.vibrateShort({ type: 'medium' })
    const cityInfo = e.currentTarget.dataset.city
    const city = allCities.find(c => c.id === cityInfo.id)
    
    if (!city) return

    const exists = this.data.cityList.find(c => c.id === city.id)
    if (exists) {
      wx.showToast({ title: '该城市已添加', icon: 'none' })
      return
    }

    const cityWithTime = this.getCityTime(city)
    const cities = [...this.data.cityList, cityWithTime]
    
    this.setData({ cityList: cities })
    this.saveCities(cities)
    wx.showToast({ title: `已添加${city.city}`, icon: 'success' })
  },

  removeCity(e) {
    const cityId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要移除这个城市吗？',
      success: (res) => {
        if (res.confirm) {
          const cities = this.data.cityList.filter(c => c.id !== cityId)
          this.setData({ cityList: cities })
          this.saveCities(cities)
          wx.showToast({ title: '已移除', icon: 'success' })
        }
      }
    })
  },

  loadSavedCities() {
    try {
      const savedIds = wx.getStorageSync('world_clock_cities') || []
      if (savedIds.length > 0) {
        const cities = savedIds.map(id => {
          const city = allCities.find(c => c.id === id)
          return city ? this.getCityTime(city) : null
        }).filter(Boolean)
        
        this.setData({ cityList: cities })
      }
    } catch (e) {
      console.log('加载失败:', e)
    }
  },

  saveCities(cities) {
    try {
      const ids = cities.map(c => c.id)
      wx.setStorageSync('world_clock_cities', ids)
    } catch (e) {
      console.log('保存失败:', e)
    }
  },

  onShareAppMessage() {
    return {
      title: '世界时钟 - 百宝工具箱',
      path: '/pages/tools/world-clock/world-clock'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})