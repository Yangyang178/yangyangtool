Page({
  data: {
    calcMode: 'diff',
    startDate: '',
    endDate: '',
    baseDate: '',
    addYears: '0',
    addMonths: '0',
    addDays: '0',
    addSubtract: 'add',
    showResult: false,
    totalDays: '',
    weeks: '',
    months: '',
    years: '',
    hours: '',
    startDateDisplay: '',
    endDateDisplay: '',
    startWeekday: '',
    endWeekday: '',
    resultDate: '',
    resultWeekday: '',
    passedPercent: 0,
    historyList: [],
    today: ''
  },

  onLoad() {
    const today = this.formatDate(new Date())
    this.setData({ 
      today,
      startDate: today,
      endDate: today,
      baseDate: today
    })
    this.loadHistory()
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getWeekdayCN(dateStr) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const date = new Date(dateStr)
    return `周${weekdays[date.getDay()]}`
  },

  switchMode(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      calcMode: e.currentTarget.dataset.mode,
      showResult: false
    })
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value })
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value })
  },

  onBaseDateChange(e) {
    this.setData({ baseDate: e.detail.value })
  },

  onAddYearsChange(e) {
    this.setData({ addYears: e.detail.value })
  },

  onAddMonthsChange(e) {
    this.setData({ addMonths: e.detail.value })
  },

  onAddDaysChange(e) {
    this.setData({ addDays: e.detail.value })
  },

  toggleAddSubtract(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({ addSubtract: e.currentTarget.dataset.type })
  },

  swapDates() {
    wx.vibrateShort({ type: 'medium' })
    const { startDate, endDate } = this.data
    this.setData({
      startDate: endDate,
      endDate: startDate
    })
  },

  setTodayStart() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ startDate: this.formatDate(new Date()) })
  },

  setYesterday() {
    wx.vibrateShort({ type: 'light' })
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    this.setData({ startDate: this.formatDate(yesterday), endDate: this.formatDate(new Date()) })
  },

  setThisWeek() {
    wx.vibrateShort({ type: 'light' })
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    this.setData({ startDate: this.formatDate(monday), endDate: this.formatDate(new Date()) })
  },

  setThisMonth() {
    wx.vibrateShort({ type: 'light' })
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    this.setData({ startDate: this.formatDate(firstDay), endDate: this.formatDate(new Date()) })
  },

  setThisYear() {
    wx.vibrateShort({ type: 'light' })
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), 0, 1)
    this.setData({ startDate: this.formatDate(firstDay), endDate: this.formatDate(new Date()) })
  },

  calculateDiff() {
    wx.vibrateShort({ type: 'medium' })

    const { startDate, endDate } = this.data
    
    if (!startDate || !endDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(totalDays / 7)
    const hours = totalDays * 24

    let yearDiff = end.getFullYear() - start.getFullYear()
    let monthDiff = end.getMonth() - start.getMonth()
    let dayDiff = end.getDate() - start.getDate()

    if (dayDiff < 0) {
      monthDiff--
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
      dayDiff += prevMonth.getDate()
    }
    if (monthDiff < 0) {
      yearDiff--
      monthDiff += 12
    }

    if (start > end) {
      this.setData({
        startDateDisplay: endDate,
        endDateDisplay: startDate,
        startWeekday: this.getWeekdayCN(endDate),
        endWeekday: this.getWeekdayCN(startDate)
      })
    } else {
      this.setData({
        startDateDisplay: startDate,
        endDateDisplay: endDate,
        startWeekday: this.getWeekdayCN(startDate),
        endWeekday: this.getWeekdayCN(endDate)
      })
    }

    this.setData({
      showResult: true,
      totalDays: totalDays.toLocaleString(),
      weeks: weeks.toLocaleString(),
      months: `${Math.abs(yearDiff)}年${Math.abs(monthDiff)}月`,
      years: (totalDays / 365).toFixed(2),
      hours: hours.toLocaleString()
    })

    this.addToHistory(`间隔 ${totalDays} 天 (${startDate} → ${endDate})`)
  },

  calculateAdd() {
    wx.vibrateShort({ type: 'medium' })

    const { baseDate, addYears, addMonths, addDays, addSubtract } = this.data

    if (!baseDate) {
      wx.showToast({ title: '请选择基准日期', icon: 'none' })
      return
    }

    const years = parseInt(addYears) || 0
    const months = parseInt(addMonths) || 0
    const days = parseInt(addDays) || 0

    if (years === 0 && months === 0 && days === 0) {
      wx.showToast({ title: '请输入要加减的数值', icon: 'none' })
      return
    }

    const date = new Date(baseDate)

    if (addSubtract === 'add') {
      date.setFullYear(date.getFullYear() + years)
      date.setMonth(date.getMonth() + months)
      date.setDate(date.getDate() + days)
    } else {
      date.setFullYear(date.getFullYear() - years)
      date.setMonth(date.getMonth() - months)
      date.setDate(date.getDate() - days)
    }

    const resultDateStr = this.formatDate(date)

    this.setData({
      showResult: true,
      resultDate: resultDateStr,
      resultWeekday: this.getWeekdayCN(resultDateStr)
    })

    const operator = addSubtract === 'add' ? '+' : '-'
    this.addToHistory(`${baseDate} ${operator} ${years}年${months}月${days}日 = ${resultDateStr}`)
  },

  copyResult() {
    wx.vibrateShort({ type: 'light' })
    
    let text = ''
    if (this.data.calcMode === 'diff') {
      text = `📅 日期间隔计算\n开始：${this.data.startDateDisplay} ${this.data.startWeekday}\n结束：${this.data.endDateDisplay} ${this.data.endWeekday}\n间隔：${this.data.totalDays}天（约${this.data.weeks}周）`
    } else {
      text = `📅 日期计算结果\n基准：${this.data.baseDate}\n${this.data.addSubtract === 'add' ? '加上' : '减去'}：${this.data.addYears}年 ${this.data.addMonths}月 ${this.data.addDays}日\n结果：${this.data.resultDate} ${this.data.resultWeekday}`
    }

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  addToHistory(text) {
    const history = wx.getStorageSync('date_calc_history') || []
    const newRecord = {
      text,
      time: Date.now(),
      timeText: this.formatTime(new Date())
    }

    history.unshift(newRecord)
    const saved = history.slice(0, 20)
    wx.setStorageSync('date_calc_history', saved)
    this.setData({ historyList: saved.slice(0, 10) })
  },

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  },

  loadHistory() {
    const history = wx.getStorageSync('date_calc_history') || []
    this.setData({ historyList: history.slice(0, 10) })
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空计算历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('date_calc_history')
          this.setData({ historyList: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '日期计算器 - 百宝工具箱',
      path: '/pages/tools/date-calculator/date-calculator'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})