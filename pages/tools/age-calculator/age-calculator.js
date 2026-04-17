const zodiacList = [
  { name: '鼠', emoji: '🐭', years: [2020, 2008, 1996, 1984, 1972, 1960] },
  { name: '牛', emoji: '🐮', years: [2021, 2009, 1997, 1985, 1973, 1961] },
  { name: '虎', emoji: '🐯', years: [2022, 2010, 1998, 1986, 1974, 1962] },
  { name: '兔', emoji: '🐰', years: [2023, 2011, 1999, 1987, 1975, 1963] },
  { name: '龙', emoji: '🐲', years: [2024, 2012, 2000, 1988, 1976, 1964] },
  { name: '蛇', emoji: '🐍', years: [2025, 2013, 2001, 1989, 1977, 1965] },
  { name: '马', emoji: '🐴', years: [2014, 2002, 1990, 1978, 1966] },
  { name: '羊', emoji: '🐑', years: [2015, 2003, 1991, 1979, 1967] },
  { name: '猴', emoji: '🐵', years: [2016, 2004, 1992, 1980, 1968] },
  { name: '鸡', emoji: '🐔', years: [2017, 2005, 1993, 1981, 1969] },
  { name: '狗', emoji: '🐶', years: [2018, 2006, 1994, 1982, 1970] },
  { name: '猪', emoji: '🐷', years: [2019, 2007, 1995, 1983, 1971] }
]

const constellationList = [
  { name: '水瓶座', start: [1, 20], end: [2, 18], emoji: '♒' },
  { name: '双鱼座', start: [2, 19], end: [3, 20], emoji: '♓' },
  { name: '白羊座', start: [3, 21], end: [4, 19], emoji: '♈' },
  { name: '金牛座', start: [4, 20], end: [5, 20], emoji: '♉' },
  { name: '双子座', start: [5, 21], end: [6, 21], emoji: '♊' },
  { name: '巨蟹座', start: [6, 22], end: [7, 22], emoji: '♋' },
  { name: '狮子座', start: [7, 23], end: [8, 22], emoji: '♌' },
  { name: '处女座', start: [8, 23], end: [9, 22], emoji: '♍' },
  { name: '天秤座', start: [9, 23], end: [10, 23], emoji: '♎' },
  { name: '天蝎座', start: [10, 24], end: [11, 22], emoji: '♏' },
  { name: '射手座', start: [11, 23], end: [12, 21], emoji: '♐' },
  { name: '摩羯座', start: [12, 22], end: [1, 19], emoji: '♑' }
]

Page({
  data: {
    birthDate: '',
    today: '',
    showResult: false,
    
    ageYears: '',
    ageMonths: '',
    ageDays: '',
    
    zodiacName: '',
    zodiacEmoji: '',
    constellationName: '',
    
    nextBirthdayDays: '',
    nextBirthdayDate: '',
    
    totalDays: '',
    totalHours: '',
    totalMinutes: '',
    heartbeats: '',
    breaths: '',
    sleepNights: '',
    
    milestones: [],
    historyList: []
  },

  onLoad() {
    const today = this.formatDate(new Date())
    this.setData({ today })
    this.loadHistory()
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  formatNumber(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + '亿'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    } else {
      return num.toLocaleString()
    }
  },

  onBirthDateChange(e) {
    this.setData({ birthDate: e.detail.value })
  },

  setTodayBirthday() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ birthDate: this.formatDate(new Date()) })
  },

  setYesterdayBirthday() {
    wx.vibrateShort({ type: 'light' })
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    this.setData({ birthDate: this.formatDate(yesterday) })
  },

  setWeekAgo() {
    wx.vibrateShort({ type: 'light' })
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    this.setData({ birthDate: this.formatDate(weekAgo) })
  },

  setMonthAgo() {
    wx.vibrateShort({ type: 'light' })
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    this.setData({ birthDate: this.formatDate(monthAgo) })
  },

  setYearAgo() {
    wx.vibrateShort({ type: 'light' })
    const yearAgo = new Date()
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)
    this.setData({ birthDate: this.formatDate(yearAgo) })
  },

  calculateAge() {
    wx.vibrateShort({ type: 'medium' })

    const { birthDate } = this.data
    
    if (!birthDate) {
      wx.showToast({ title: '请选择出生日期', icon: 'none' })
      return
    }

    const birth = new Date(birthDate)
    const now = new Date()

    if (birth > now) {
      wx.showToast({ title: '出生日期不能是未来', icon: 'none' })
      return
    }

    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    let days = now.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    const totalMs = now - birth
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24))
    const totalHours = Math.floor(totalMs / (1000 * 60 * 60))
    const totalMinutes = Math.floor(totalMs / (1000 * 60))

    const zodiac = this.getZodiac(birth.getFullYear())
    const constellation = this.getConstellation(birth.getMonth() + 1, birth.getDate())

    const nextBirthday = this.getNextBirthday(birth)
    const nextBirthdayDiff = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24))
    const nextBirthdayDate = this.formatDate(nextBirthday)

    const milestones = this.generateMilestones(birth, now)

    this.setData({
      showResult: true,
      ageYears: years,
      ageMonths: months,
      ageDays: days,
      
      zodiacName: zodiac.name,
      zodiacEmoji: zodiac.emoji,
      constellationName: constellation.name,
      
      nextBirthdayDays: nextBirthdayDiff === 0 ? '今天！🎂' : nextBirthdayDiff.toString(),
      nextBirthdayDate: `下次生日：${nextBirthdayDate}`,
      
      totalDays: this.formatNumber(totalDays),
      totalHours: this.formatNumber(totalHours),
      totalMinutes: this.formatNumber(totalMinutes),
      heartbeats: this.formatNumber(Math.floor(totalMinutes * 80)),
      breaths: this.formatNumber(Math.floor(totalMinutes * 16)),
      sleepNights: this.formatNumber(Math.floor(totalDays * 0.67)),
      
      milestones
    })

    const ageText = `${years}岁${months}个月`
    this.addToHistory(birthDate, ageText)
  },

  getZodiac(year) {
    for (let zodiac of zodiacList) {
      if (zodiac.years.includes(year)) {
        return zodiac
      }
    }
    return { name: '', emoji: '' }
  },

  getConstellation(month, day) {
    for (let c of constellationList) {
      const [startMonth, startDay] = c.start
      const [endMonth, endDay] = c.end
      
      if (startMonth === endMonth) {
        if (month === startMonth && day >= startDay && day <= endDay) {
          return c
        }
      } else if (startMonth > endMonth) {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return c
        }
      } else {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay) || 
            (month > startMonth && month < endMonth)) {
          return c
        }
      }
    }
    return { name: '未知', emoji: '?' }
  },

  getNextBirthday(birthDate) {
    const now = new Date()
    let nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    
    if (nextBirthday <= now) {
      nextBirthday.setFullYear(now.getFullYear() + 1)
    }
    
    return nextBirthday
  },

  generateMilestones(birthDate, now) {
    const milestones = [
      { age: '100天', name: '百日庆典', days: 100 },
      { age: '1周岁', name: '一周岁生日', days: 365 },
      { age: '6岁', name: '上小学', days: 365 * 6 },
      { age: '12岁', name: '小学毕业', days: 365 * 12 },
      { age: '18岁', name: '成年礼', days: 365 * 18 },
      { age: '22岁', name: '大学毕业', days: 365 * 22 },
      { age: '25岁', name: '四分之一世纪', days: 365 * 25 },
      { age: '30岁', name: '而立之年', days: 365 * 30 },
      { age: '40岁', name: '不惑之年', days: 365 * 40 },
      { age: '50岁', name: '知天命', days: 365 * 50 },
      { age: '60岁', name: '花甲之年', days: 365 * 60 },
      { age: '70岁', name: '古稀之年', days: 365 * 70 },
      { age: '80岁', name: '耄耋之年', days: 365 * 80 },
      { age: '100岁', name: '期颐之寿', days: 365 * 100 }
    ]

    const livedDays = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24))

    return milestones.map(m => {
      const milestoneDate = new Date(birthDate.getTime() + m.days * 24 * 60 * 60 * 1000)
      const passed = livedDays >= m.days
      
      return {
        ...m,
        passed,
        date: this.formatDate(milestoneDate)
      }
    }).slice(0, 10)
  },

  addToHistory(birthDate, ageText) {
    const history = wx.getStorageSync('age_calc_history') || []
    const newRecord = {
      birthDate,
      ageText,
      time: Date.now(),
      timeText: this.formatTime(new Date())
    }

    history.unshift(newRecord)
    const saved = history.slice(0, 20)
    wx.setStorageSync('age_calc_history', saved)
    this.setData({ historyList: saved.slice(0, 10) })
  },

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  },

  loadHistory() {
    const history = wx.getStorageSync('age_calc_history') || []
    this.setData({ historyList: history.slice(0, 10) })
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空计算历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('age_calc_history')
          this.setData({ historyList: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  copyResult() {
    wx.vibrateShort({ type: 'light' })
    
    const text = `🎂 年龄计算结果\n` +
                 `出生日期：${this.data.birthDate}\n` +
                 `年龄：${this.data.ageYears}岁 ${this.data.ageMonths}个月 ${this.data.ageDays}天\n` +
                 `生肖：${this.data.zodiacName}${this.data.zodiacEmoji}\n` +
                 `星座：${this.data.constellationName}座\n` +
                 `总天数：${this.data.totalDays}天\n` +
                 `距离下次生日还有：${this.data.nextBirthdayDays}天`

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  shareResult() {
    wx.vibrateShort({ type: 'light' })
    const { birthDate, ageYears, zodiacName, constellationName } = this.data
    
    wx.showModal({
      title: '分享年龄信息',
      content: `我今年${ageYears}岁了！\n属${zodiacName}，${constellationName}座`,
      confirmText: '复制',
      success: (res) => {
        if (res.confirm) {
          this.copyResult()
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '年龄计算器 - 百宝工具箱',
      path: '/pages/tools/age-calculator/age-calculator'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})