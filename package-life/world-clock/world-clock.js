var allCities = [
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
  { id: 'saopaulo', city: '圣保罗', country: '巴西', emoji: '☀️', timezone: 'UTC-3', offset: -3 },
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

  onLoad: function() {
    this.updateLocalTime()
    this.loadSavedCities()
    this.startTimer()
  },

  onShow: function() {
    if (!this.data.timeUpdateTimer) {
      this.startTimer()
    }
  },

  onHide: function() {
    this.stopTimer()
  },

  onUnload: function() {
    this.stopTimer()
  },

  startTimer: function() {
    var that = this
    that.updateLocalTime()
    that.updateAllTimes()
    that.data.timeUpdateTimer = setInterval(function() {
      that.updateLocalTime()
      that.updateAllTimes()
    }, 1000)
  },

  stopTimer: function() {
    if (this.data.timeUpdateTimer) {
      clearInterval(this.data.timeUpdateTimer)
      this.setData({ timeUpdateTimer: null })
    }
  },

  updateLocalTime: function() {
    var now = new Date()

    var hours = String(now.getHours())
    hours = hours.length === 1 ? '0' + hours : hours
    var minutes = String(now.getMinutes())
    minutes = minutes.length === 1 ? '0' + minutes : minutes
    var seconds = String(now.getSeconds())
    seconds = seconds.length === 1 ? '0' + seconds : seconds

    var year = now.getFullYear()
    var month = now.getMonth() + 1
    month = month < 10 ? '0' + month : '' + month
    var day = now.getDate()
    day = day < 10 ? '0' + day : '' + day

    var weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    var weekday = weekdays[now.getDay()]

    var offset = -now.getTimezoneOffset() / 60
    var offsetStr = offset >= 0 ? '+' + offset : '' + offset

    this.setData({
      localTime: hours + ':' + minutes + ':' + seconds,
      localDate: year + '年' + month + '月' + day + '日',
      localOffset: offsetStr,
      localWeekday: weekday
    })
  },

  updateAllTimes: function() {
    var cities = []
    for (var ui = 0; ui < this.data.cityList.length; ui++) {
      cities.push(this.getCityTime(this.data.cityList[ui]))
    }
    this.setData({ cityList: cities })
  },

  getCityTime: function(city) {
    var now = new Date()
    var utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    var cityTime = new Date(utc + (3600000 * city.offset))

    var hours = String(cityTime.getHours())
    hours = hours.length === 1 ? '0' + hours : hours
    var minutes = String(cityTime.getMinutes())
    minutes = minutes.length === 1 ? '0' + minutes : minutes
    var seconds = String(cityTime.getSeconds())
    seconds = seconds.length === 1 ? '0' + seconds : seconds

    var m = cityTime.getMonth() + 1
    var d = cityTime.getDate()
    var dateStr = (m < 10 ? '0' + m : '' + m) + '/' + (d < 10 ? '0' + d : '' + d)

    var localOffset = -now.getTimezoneOffset() / 60
    var diffHours = Math.round(city.offset - localOffset)

    var diffType = 'same'
    var diffText = ''

    if (diffHours > 0) {
      diffType = 'ahead'
      diffText = '+' + diffHours + '小时'
    } else if (diffHours < 0) {
      diffType = 'behind'
      diffText = diffHours + '小时'
    } else {
      diffType = 'same'
      diffText = '相同'
    }

    var result = {}
    for (var key in city) { result[key] = city[key] }
    result.time = hours + ':' + minutes + ':' + seconds
    result.date = dateStr
    result.diffType = diffType
    result.diffText = diffText
    return result
  },

  showAddCity: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      showCityPicker: true,
      searchKeyword: '',
      filteredCities: allCities
    })
  },

  hideAddCity: function() {
    this.setData({ showCityPicker: false })
  },

  onSearchCity: function(e) {
    var keyword = e.detail.value.toLowerCase().trim()
    this.setData({ searchKeyword: e.detail.value })

    if (!keyword) {
      this.setData({ filteredCities: allCities })
      return
    }

    var filtered = []
    for (var fi = 0; fi < allCities.length; fi++) {
      var c = allCities[fi]
      if (c.city.indexOf(keyword) > -1 || c.country.indexOf(keyword) > -1 || c.id.indexOf(keyword) > -1) {
        filtered.push(c)
      }
    }
    this.setData({ filteredCities: filtered })
  },

  selectCity: function(e) {
    wx.vibrateShort({ type: 'medium' })
    var city = e.currentTarget.dataset.city

    var exists = null
    for (var ei = 0; ei < this.data.cityList.length; ei++) {
      if (this.data.cityList[ei].id === city.id) { exists = true; break }
    }
    if (exists) {
      wx.showToast({ title: '该城市已添加', icon: 'none' })
      return
    }

    var cityWithTime = this.getCityTime(city)
    var cities = []
    for (var sci = 0; sci < this.data.cityList.length; sci++) {
      cities.push(this.data.cityList[sci])
    }
    cities.push(cityWithTime)

    this.setData({
      cityList: cities,
      showCityPicker: false,
      searchKeyword: ''
    })

    this.saveCities(cities)
    wx.showToast({ title: '已添加 ' + city.city, icon: 'success' })
  },

  quickAddCity: function(e) {
    wx.vibrateShort({ type: 'medium' })
    var cityInfo = e.currentTarget.dataset.city
    var city = null
    for (var qci = 0; qci < allCities.length; qci++) {
      if (allCities[qci].id === cityInfo.id) { city = allCities[qci]; break }
    }

    if (!city) return

    var exists = null
    for (var qei = 0; qei < this.data.cityList.length; qei++) {
      if (this.data.cityList[qei].id === city.id) { exists = true; break }
    }
    if (exists) {
      wx.showToast({ title: '该城市已添加', icon: 'none' })
      return
    }

    var cityWithTime = this.getCityTime(city)
    var cities = []
    for (var qsi = 0; qsi < this.data.cityList.length; qsi++) {
      cities.push(this.data.cityList[qsi])
    }
    cities.push(cityWithTime)

    this.setData({ cityList: cities })
    this.saveCities(cities)
    wx.showToast({ title: '已添加 ' + city.city, icon: 'success' })
  },

  removeCity: function(e) {
    var cityId = e.currentTarget.dataset.id
    var that = this
    wx.showModal({
      title: '确认删除',
      content: '确定要移除这个城市吗？',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var cities = []
          for (var rci = 0; rci < that.data.cityList.length; rci++) {
            if (that.data.cityList[rci].id !== cityId) {
              cities.push(that.data.cityList[rci])
            }
          }
          that.setData({ cityList: cities })
          that.saveCities(cities)
          wx.showToast({ title: '已移除', icon: 'success' })
        }
      }
    })
  },

  loadSavedCities: function() {
    try {
      var savedIds = wx.getStorageSync('world_clock_cities') || []
      if (savedIds.length > 0) {
        var cities = []
        for (var lii = 0; lii < savedIds.length; lii++) {
          var foundCity = null
          for (var laci = 0; laci < allCities.length; laci++) {
            if (allCities[laci].id === savedIds[lii]) { foundCity = allCities[laci]; break }
          }
          if (foundCity) {
            cities.push(this.getCityTime(foundCity))
          }
        }

        this.setData({ cityList: cities })
      }
    } catch (e) {
      console.log('加载失败:', e)
    }
  },

  saveCities: function(cities) {
    try {
      var ids = []
      for (var si = 0; si < cities.length; si++) {
        ids.push(cities[si].id)
      }
      wx.setStorageSync('world_clock_cities', ids)
    } catch (e) {
      console.log('保存失败:', e)
    }
  },

  onShareAppMessage: function() {
    return {
      title: '世界时钟 - 百宝工具箱',
      path: '/pages/tools/world-clock/world-clock'
    }
  },
  onShareTimeline: function() {
    return { title: '' }
  }
})