var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var csvExport = require('../utils/csv-export.js')

var STORAGE_KEY = 'account_book_records'
var BUDGET_KEY = 'account_book_budget'
var MAX_RECORDS = 500
var EXPENSE_CATEGORIES = [
  { key: 'food', name: '餐饮', enName: 'Food', icon: '🍜' },
  { key: 'transport', name: '交通', enName: 'Transport', icon: '🚌' },
  { key: 'shopping', name: '购物', enName: 'Shopping', icon: '🛍️' },
  { key: 'housing', name: '住房', enName: 'Housing', icon: '🏠' },
  { key: 'entertain', name: '娱乐', enName: 'Entertainment', icon: '🎮' },
  { key: 'medical', name: '医疗', enName: 'Medical', icon: '💊' },
  { key: 'education', name: '教育', enName: 'Education', icon: '📚' },
  { key: 'other_exp', name: '其他', enName: 'Other', icon: '📦' }
]
var INCOME_CATEGORIES = [
  { key: 'salary', name: '工资', enName: 'Salary', icon: '💰' },
  { key: 'bonus', name: '奖金', enName: 'Bonus', icon: '🎁' },
  { key: 'invest', name: '投资', enName: 'Investment', icon: '📈' },
  { key: 'parttime', name: '兼职', enName: 'Part-time', icon: '💼' },
  { key: 'other_inc', name: '其他', enName: 'Other', icon: '💵' }
]
var ALL_CATEGORIES = EXPENSE_CATEGORIES.concat(INCOME_CATEGORIES)

function getCategoryInfo(key) {
  var lang = i18n.getLanguage()
  var isEn = lang === 'en'
  for (var i = 0; i < ALL_CATEGORIES.length; i++) {
    if (ALL_CATEGORIES[i].key === key) {
      var cat = ALL_CATEGORIES[i]
      return { key: cat.key, name: isEn && cat.enName ? cat.enName : cat.name, icon: cat.icon }
    }
  }
  return { key: key, name: isEn ? 'Unknown' : '未知', icon: '❓' }
}

function getMonthKey(date) {
  var y = date.getFullYear()
  var m = date.getMonth() + 1
  return y + '-' + (m < 10 ? '0' + m : '' + m)
}

function formatAmount(num) {
  var str = Math.abs(num).toFixed(2)
  var parts = str.split('.')
  var intPart = parts[0]
  var decPart = parts[1]
  var formatted = ''
  var count = 0
  for (var i = intPart.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) formatted = ',' + formatted
    formatted = intPart.charAt(i) + formatted
    count++
  }
  return formatted + '.' + decPart
}

Page({
  data: {
    isLoading: true,
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    currentTab: 'record',
    tabs: [
      { key: 'record', name: '记账' },
      { key: 'detail', name: '明细' },
      { key: 'stats', name: '统计' }
    ],
    inputType: 'expense',
    inputAmount: '',
    inputNote: '',
    selectedCategory: 'food',
    expenseCategories: EXPENSE_CATEGORIES,
    incomeCategories: INCOME_CATEGORIES,
    records: [],
    currentMonth: '',
    monthDisplay: '',
    monthIncome: '0.00',
    monthExpense: '0.00',
    monthBalance: '0.00',
    filteredRecords: [],
    statsCategories: [],
    dailyData: [],
    showDeleteId: null,
    chartWidth: 0,
    chartHeight: 200,
    monthlyBudget: 0,
    budgetInput: '',
    showBudgetSet: false,
    budgetPercent: 0,
    budgetRemain: '0.00',
    budgetOver: false,
    showGuideTip: false,
    i18n: {}
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('记账本')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('accountBook') })

    var now = new Date()
    var monthKey = getMonthKey(now)
    this.setData({ currentMonth: monthKey })
    this._updateI18nData()
    this._loadRecords()
    this._calcMonthSummary()
    this._loadBudget()

    var that = this
    wx.createSelectorQuery().select('.chart-canvas-wrap').boundingClientRect(function(rect) {
      if (rect) {
        that.setData({ chartWidth: rect.width })
      }
    }).exec()
    var guideClosed = storageUtil.get('guide_tip_closed_40', false)
    this.setData({ showGuideTip: !guideClosed })

    poster.setupForPage(this, 40)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ isDarkMode: isDark, fontClass: fontClass, fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('accountBook') })
    this._updateI18nData()
  },

  onTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab
    toolActions.vibrate('light')
    this.setData({ currentTab: tab })
    if (tab === 'detail') {
      this._filterRecords()
    } else if (tab === 'stats') {
      this._calcStats()
    }
  },

  onTypeChange: function(e) {
    var type = e.currentTarget.dataset.type
    toolActions.vibrate('light')
    var defaultCat = type === 'expense' ? 'food' : 'salary'
    this.setData({
      inputType: type,
      selectedCategory: defaultCat
    })
  },

  onCategoryTap: function(e) {
    var key = e.currentTarget.dataset.key
    toolActions.vibrate('light')
    this.setData({ selectedCategory: key })
  },

  onAmountInput: function(e) {
    var val = e.detail.value
    if (val.indexOf('.') !== -1) {
      var parts = val.split('.')
      if (parts[1] && parts[1].length > 2) {
        val = parts[0] + '.' + parts[1].substring(0, 2)
      }
    }
    this.setData({ inputAmount: val })
  },

  onNoteInput: function(e) {
    this.setData({ inputNote: e.detail.value })
  },

  addRecord: function() {
    var amount = parseFloat(this.data.inputAmount)
    if (!amount || amount <= 0) {
      wx.showToast({ title: this.data.i18n.inputValidAmount, icon: 'none' })
      return
    }
    if (amount > 9999999.99) {
      wx.showToast({ title: this.data.i18n.amountTooLarge, icon: 'none' })
      return
    }
    toolActions.vibrate('medium')

    var now = new Date()
    var record = {
      id: now.getTime(),
      type: this.data.inputType,
      category: this.data.selectedCategory,
      amount: amount,
      note: this.data.inputNote.trim(),
      date: this._formatDate(now),
      time: this._formatTime(now),
      monthKey: getMonthKey(now)
    }

    var records = this.data.records.slice()
    records.unshift(record)
    this._saveRecords(records)

    this.setData({
      inputAmount: '',
      inputNote: '',
      records: records
    })
    this._calcMonthSummary()

    wx.showToast({ title: this.data.i18n.recordSuccess, icon: 'success' })
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(40, '记账本', false)
  },

  onDeleteRecord: function(e) {
    var id = e.currentTarget.dataset.id
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmDelete,
      content: that.data.i18n.confirmDeleteMsg,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          var records = that.data.records.slice()
          for (var i = 0; i < records.length; i++) {
            if (records[i].id === id) {
              records.splice(i, 1)
              break
            }
          }
          that._saveRecords(records)
          that.setData({ records: records, showDeleteId: null })
          that._calcMonthSummary()
          that._filterRecords()
          wx.showToast({ title: that.data.i18n.deleted, icon: 'success' })
        }
      }
    })
  },

  onRecordLongPress: function(e) {
    var id = e.currentTarget.dataset.id
    toolActions.vibrate('medium')
    this.setData({ showDeleteId: id })
  },

  onRecordTouchEnd: function() {
    var that = this
    setTimeout(function() {
      that.setData({ showDeleteId: null })
    }, 3000)
  },

  onPrevMonth: function() {
    toolActions.vibrate('light')
    var parts = this.data.currentMonth.split('-')
    var y = parseInt(parts[0])
    var m = parseInt(parts[1]) - 1
    if (m < 1) { m = 12; y-- }
    var monthKey = y + '-' + (m < 10 ? '0' + m : '' + m)
    this.setData({
      currentMonth: monthKey,
      monthDisplay: this._formatMonthDisplay(y, m)
    })
    this._calcMonthSummary()
    if (this.data.currentTab === 'detail') this._filterRecords()
    if (this.data.currentTab === 'stats') this._calcStats()
  },

  onNextMonth: function() {
    toolActions.vibrate('light')
    var parts = this.data.currentMonth.split('-')
    var y = parseInt(parts[0])
    var m = parseInt(parts[1]) + 1
    if (m > 12) { m = 1; y++ }
    var monthKey = y + '-' + (m < 10 ? '0' + m : '' + m)
    this.setData({
      currentMonth: monthKey,
      monthDisplay: this._formatMonthDisplay(y, m)
    })
    this._calcMonthSummary()
    if (this.data.currentTab === 'detail') this._filterRecords()
    if (this.data.currentTab === 'stats') this._calcStats()
  },

  copyResult: function() {
    var texts = this.data.i18n
    var text = this.data.monthDisplay + '\n'
    text += texts.income + ': ' + this.data.monthIncome + texts.currencyUnit + '\n'
    text += texts.expense + ': ' + this.data.monthExpense + texts.currencyUnit + '\n'
    text += texts.balance + ': ' + this.data.monthBalance + texts.currencyUnit
    toolActions.copyText(text)
  },

  exportCSV: function() {
    var records = this.data.records
    if (records.length === 0) {
      wx.showToast({ title: this.data.i18n.noDataToExport, icon: 'none' })
      return
    }

    var monthKey = this.data.currentMonth
    var monthRecords = []
    for (var i = 0; i < records.length; i++) {
      if (records[i].monthKey === monthKey) {
        monthRecords.push(records[i])
      }
    }

    if (monthRecords.length === 0) {
      wx.showToast({ title: this.data.i18n.noRecordsThisMonth, icon: 'none' })
      return
    }

    var texts = this.data.i18n
    var headers = [
      { key: 'date', label: texts.csvDate },
      { key: 'time', label: texts.csvTime },
      { key: 'type', label: texts.csvType },
      { key: 'categoryName', label: texts.csvCategory },
      { key: 'amount', label: texts.csvAmount },
      { key: 'note', label: texts.csvNote }
    ]

    var rows = []
    for (var j = 0; j < monthRecords.length; j++) {
      var rec = monthRecords[j]
      var cat = getCategoryInfo(rec.category)
      rows.push({
        date: rec.date,
        time: rec.time,
        type: rec.type === 'income' ? texts.csvIncome : texts.csvExpense,
        categoryName: cat.name,
        amount: rec.amount,
        note: rec.note || ''
      })
    }

    var csv = csvExport.generateCSV(headers, rows)
    var fileName = csvExport.makeFileName('account_book_' + this.data.currentMonth)
    csvExport.saveCSV(csv, fileName)
  },

  shareCSV: function() {
    var records = this.data.records
    if (records.length === 0) {
      wx.showToast({ title: this.data.i18n.noDataToShare, icon: 'none' })
      return
    }

    var monthKey = this.data.currentMonth
    var monthRecords = []
    for (var i = 0; i < records.length; i++) {
      if (records[i].monthKey === monthKey) {
        monthRecords.push(records[i])
      }
    }

    if (monthRecords.length === 0) {
      wx.showToast({ title: this.data.i18n.noRecordsThisMonth, icon: 'none' })
      return
    }

    var texts2 = this.data.i18n
    var headers2 = [
      { key: 'date', label: texts2.csvDate },
      { key: 'time', label: texts2.csvTime },
      { key: 'type', label: texts2.csvType },
      { key: 'categoryName', label: texts2.csvCategory },
      { key: 'amount', label: texts2.csvAmount },
      { key: 'note', label: texts2.csvNote }
    ]

    var rows2 = []
    for (var j2 = 0; j2 < monthRecords.length; j2++) {
      var rec2 = monthRecords[j2]
      var cat2 = getCategoryInfo(rec2.category)
      rows2.push({
        date: rec2.date,
        time: rec2.time,
        type: rec2.type === 'income' ? texts2.csvIncome : texts2.csvExpense,
        categoryName: cat2.name,
        amount: rec2.amount,
        note: rec2.note || ''
      })
    }

    var csv2 = csvExport.generateCSV(headers2, rows2)
    var fileName2 = csvExport.makeFileName('account_book_' + this.data.currentMonth)
    csvExport.shareCSV(csv2, fileName2)
  },

  _updateI18nData: function() {
    var lang = i18n.getLanguage()
    var texts = this.data.i18n
    var isEn = lang === 'en'

    var expCats = []
    for (var i = 0; i < EXPENSE_CATEGORIES.length; i++) {
      var cat = EXPENSE_CATEGORIES[i]
      expCats.push({
        key: cat.key,
        name: isEn && cat.enName ? cat.enName : cat.name,
        icon: cat.icon
      })
    }

    var incCats = []
    for (var j = 0; j < INCOME_CATEGORIES.length; j++) {
      var icat = INCOME_CATEGORIES[j]
      incCats.push({
        key: icat.key,
        name: isEn && icat.enName ? icat.enName : icat.name,
        icon: icat.icon
      })
    }

    var tabs = [
      { key: 'record', name: texts.tabRecord },
      { key: 'detail', name: texts.tabDetail },
      { key: 'stats', name: texts.tabStats }
    ]

    var parts = this.data.currentMonth.split('-')
    var y = parseInt(parts[0])
    var m = parseInt(parts[1])
    var monthDisplay = this._formatMonthDisplay(y, m)

    this.setData({
      expenseCategories: expCats,
      incomeCategories: incCats,
      tabs: tabs,
      monthDisplay: monthDisplay
    })
  },

  _formatMonthDisplay: function(y, m) {
    var lang = i18n.getLanguage()
    if (lang === 'en') {
      var texts = this.data.i18n
      var monthNames = texts.monthNames.split(',')
      return monthNames[m - 1] + ' ' + y
    }
    return y + '年' + m + '月'
  },

  _loadRecords: function() {
    var records = storageUtil.safeGetArray(STORAGE_KEY)
    this.setData({ records: records })
  },

  _saveRecords: function(records) {
    if (records.length > MAX_RECORDS) {
      records = records.slice(0, MAX_RECORDS)
      this.setData({ records: records })
    }
    try {
      storageUtil.set(STORAGE_KEY, records)
    } catch (e) {
      wx.showToast({ title: this.data.i18n.storageFull || '存储空间不足，请清理旧数据', icon: 'none', duration: 3000 })
    }
  },

  _calcMonthSummary: function() {
    var monthKey = this.data.currentMonth
    var income = 0
    var expense = 0
    var records = this.data.records
    for (var i = 0; i < records.length; i++) {
      if (records[i].monthKey === monthKey) {
        if (records[i].type === 'income') {
          income += records[i].amount
        } else {
          expense += records[i].amount
        }
      }
    }
    this.setData({
      monthIncome: formatAmount(income),
      monthExpense: formatAmount(expense),
      monthBalance: formatAmount(income - expense)
    })
    this._updateBudgetStatus(expense)
  },

  _filterRecords: function() {
    var monthKey = this.data.currentMonth
    var filtered = []
    var records = this.data.records
    for (var i = 0; i < records.length; i++) {
      if (records[i].monthKey === monthKey) {
        var cat = getCategoryInfo(records[i].category)
        var item = {}
        for (var key in records[i]) item[key] = records[i][key]
        item.categoryName = cat.name
        item.categoryIcon = cat.icon
        item.amountDisplay = (records[i].type === 'income' ? '+' : '-') + formatAmount(records[i].amount)
        filtered.push(item)
      }
    }
    var grouped = {}
    for (var j = 0; j < filtered.length; j++) {
      var date = filtered[j].date
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(filtered[j])
    }
    var groupList = []
    var dateKeys = Object.keys(grouped).sort().reverse()
    for (var k = 0; k < dateKeys.length; k++) {
      var dayIncome = 0
      var dayExpense = 0
      var items = grouped[dateKeys[k]]
      for (var l = 0; l < items.length; l++) {
        if (items[l].type === 'income') dayIncome += items[l].amount
        else dayExpense += items[l].amount
      }
      groupList.push({
        date: dateKeys[k],
        dateDisplay: this._formatDateDisplay(dateKeys[k]),
        items: items,
        dayIncome: formatAmount(dayIncome),
        dayExpense: formatAmount(dayExpense)
      })
    }
    this.setData({ filteredRecords: groupList })
  },

  _calcStats: function() {
    var monthKey = this.data.currentMonth
    var records = this.data.records
    var catMap = {}
    var dailyMap = {}
    var dailyIncomeMap = {}
    var totalExpense = 0

    for (var i = 0; i < records.length; i++) {
      if (records[i].monthKey !== monthKey) continue
      if (records[i].type === 'expense') {
        var cat = records[i].category
        if (!catMap[cat]) catMap[cat] = 0
        catMap[cat] += records[i].amount
        totalExpense += records[i].amount

        var day = records[i].date
        if (!dailyMap[day]) dailyMap[day] = 0
        dailyMap[day] += records[i].amount
      } else {
        var incDay = records[i].date
        if (!dailyIncomeMap[incDay]) dailyIncomeMap[incDay] = 0
        dailyIncomeMap[incDay] += records[i].amount
      }
    }

    var statsCategories = []
    var catKeys = Object.keys(catMap)
    for (var j = 0; j < catKeys.length; j++) {
      var info = getCategoryInfo(catKeys[j])
      var amount = catMap[catKeys[j]]
      statsCategories.push({
        key: catKeys[j],
        name: info.name,
        icon: info.icon,
        amount: formatAmount(amount),
        rawAmount: amount,
        percent: totalExpense > 0 ? (amount / totalExpense * 100).toFixed(1) : '0'
      })
    }
    statsCategories.sort(function(a, b) { return b.rawAmount - a.rawAmount })

    var dailyData = []
    var allDays = {}
    for (var dk in dailyMap) { allDays[dk] = true }
    for (var ik in dailyIncomeMap) { allDays[ik] = true }
    var dayKeys = Object.keys(allDays).sort()
    for (var k = 0; k < dayKeys.length; k++) {
      dailyData.push({
        date: dayKeys[k],
        dayLabel: dayKeys[k].substring(8),
        expense: dailyMap[dayKeys[k]] || 0,
        income: dailyIncomeMap[dayKeys[k]] || 0,
        amount: dailyMap[dayKeys[k]] || 0
      })
    }

    this.setData({
      statsCategories: statsCategories,
      dailyData: dailyData
    })

    this._drawChart()
    this._drawPieChart()
    this._drawTrendChart()
  },

  _loadBudget: function() {
    var budget = storageUtil.get(BUDGET_KEY, 0)
    this.setData({ monthlyBudget: budget })
  },

  _updateBudgetStatus: function(expense) {
    var budget = this.data.monthlyBudget
    if (budget > 0) {
      var percent = Math.min(expense / budget * 100, 100)
      var remain = budget - expense
      this.setData({
        budgetPercent: percent,
        budgetRemain: formatAmount(Math.abs(remain)),
        budgetOver: remain < 0
      })
    } else {
      this.setData({ budgetPercent: 0, budgetRemain: '0.00', budgetOver: false })
    }
  },

  onBudgetInput: function(e) {
    this.setData({ budgetInput: e.detail.value })
  },

  showBudgetSetting: function() {
    toolActions.vibrate('light')
    this.setData({
      showBudgetSet: true,
      budgetInput: this.data.monthlyBudget > 0 ? String(this.data.monthlyBudget) : ''
    })
  },

  hideBudgetSetting: function() {
    this.setData({ showBudgetSet: false })
  },

  doNothing: function() {},

  closeGuideTip: function() {
    storageUtil.set('guide_tip_closed_40', true)
    this.setData({ showGuideTip: false })
  },

  saveBudget: function() {
    var val = parseFloat(this.data.budgetInput)
    if (isNaN(val) || val < 0) {
      wx.showToast({ title: this.data.i18n.inputValidAmount, icon: 'none' })
      return
    }
    this.setData({ monthlyBudget: val, showBudgetSet: false })
    storageUtil.set(BUDGET_KEY, val)
    var expense = parseFloat(this.data.monthExpense.replace(/,/g, ''))
    if (isNaN(expense)) expense = 0
    this._updateBudgetStatus(expense)
    wx.showToast({ title: val > 0 ? this.data.i18n.budgetSet : this.data.i18n.budgetCleared, icon: 'success' })
  },

  clearBudget: function() {
    this.setData({ monthlyBudget: 0, showBudgetSet: false, budgetInput: '' })
    storageUtil.set(BUDGET_KEY, 0)
    this._updateBudgetStatus(0)
    wx.showToast({ title: this.data.i18n.budgetCleared, icon: 'success' })
  },

  _drawChart: function() {
    var dailyData = this.data.dailyData
    if (dailyData.length === 0) return

    var query = wx.createSelectorQuery()
    query.select('#statsCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0]) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getWindowInfo().pixelRatio
      var width = res[0].width
      var height = res[0].height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      var padLeft = 50
      var padRight = 20
      var padTop = 20
      var padBottom = 40
      var chartW = width - padLeft - padRight
      var chartH = height - padTop - padBottom

      ctx.clearRect(0, 0, width, height)

      var maxAmount = 0
      for (var i = 0; i < dailyData.length; i++) {
        if (dailyData[i].amount > maxAmount) maxAmount = dailyData[i].amount
      }
      if (maxAmount === 0) maxAmount = 1

      ctx.strokeStyle = '#E2E8F0'
      ctx.lineWidth = 0.5
      for (var g = 0; g <= 4; g++) {
        var gy = padTop + chartH * (1 - g / 4)
        ctx.beginPath()
        ctx.moveTo(padLeft, gy)
        ctx.lineTo(padLeft + chartW, gy)
        ctx.stroke()

        ctx.fillStyle = '#94A3B8'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'right'
        var label = (maxAmount * g / 4).toFixed(0)
        ctx.fillText(label, padLeft - 8, gy + 3)
      }

      if (dailyData.length === 1) {
        var barW = 30
        var bx = padLeft + chartW / 2 - barW / 2
        var bh = (dailyData[0].amount / maxAmount) * chartH
        var by = padTop + chartH - bh
        ctx.fillStyle = '#10B981'
        ctx.beginPath()
        ctx.moveTo(bx + 4, by)
        ctx.lineTo(bx + barW - 4, by)
        ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + 4)
        ctx.lineTo(bx + barW, padTop + chartH)
        ctx.lineTo(bx, padTop + chartH)
        ctx.lineTo(bx, by + 4)
        ctx.quadraticCurveTo(bx, by, bx + 4, by)
        ctx.fill()

        ctx.fillStyle = '#64748B'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(dailyData[0].dayLabel, bx + barW / 2, padTop + chartH + 20)
        return
      }

      var barGap = chartW / dailyData.length
      var barW = barGap * 0.6
      if (barW > 30) barW = 30

      for (var j = 0; j < dailyData.length; j++) {
        var x = padLeft + barGap * j + (barGap - barW) / 2
        var bh2 = (dailyData[j].amount / maxAmount) * chartH
        if (bh2 < 2) bh2 = 2
        var by2 = padTop + chartH - bh2

        var gradient = ctx.createLinearGradient(x, by2, x, padTop + chartH)
        gradient.addColorStop(0, '#10B981')
        gradient.addColorStop(1, '#34D399')
        ctx.fillStyle = gradient

        var r = Math.min(4, barW / 4)
        ctx.beginPath()
        ctx.moveTo(x + r, by2)
        ctx.lineTo(x + barW - r, by2)
        ctx.quadraticCurveTo(x + barW, by2, x + barW, by2 + r)
        ctx.lineTo(x + barW, padTop + chartH)
        ctx.lineTo(x, padTop + chartH)
        ctx.lineTo(x, by2 + r)
        ctx.quadraticCurveTo(x, by2, x + r, by2)
        ctx.fill()

        if (dailyData.length <= 15 || j % 2 === 0) {
          ctx.fillStyle = '#64748B'
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(dailyData[j].dayLabel, x + barW / 2, padTop + chartH + 18)
        }
      }
    })
  },

  _drawPieChart: function() {
    var cats = this.data.statsCategories
    if (cats.length === 0) return
    var isDark = this.data.isDarkMode
    var texts = this.data.i18n
    var colors = ['#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#F97316']

    var query = wx.createSelectorQuery()
    query.select('#pieCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getWindowInfo().pixelRatio
      var width = res[0].width
      var height = res[0].height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      var centerX = width * 0.3
      var centerY = height / 2
      var radius = Math.min(width * 0.25, height * 0.38)
      if (radius < 28) radius = 28

      var total = 0
      for (var t = 0; t < cats.length; t++) total += cats[t].rawAmount
      if (total === 0) return

      var startAngle = -Math.PI / 2
      for (var si = 0; si < cats.length; si++) {
        var sliceAngle = (cats[si].rawAmount / total) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = colors[si % colors.length]
        ctx.fill()

        if (sliceAngle > 0.35) {
          var midAngle = startAngle + sliceAngle / 2
          var labelR = radius * 0.65
          var lx = centerX + Math.cos(midAngle) * labelR
          var ly = centerY + Math.sin(midAngle) * labelR
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(cats[si].percent + '%', lx, ly)
        }
        startAngle += sliceAngle
      }

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? '#232d42' : '#FFFFFF'
      ctx.fill()

      ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(texts.totalExpense, centerX, centerY - 7)
      ctx.fillStyle = '#10B981'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(formatAmount(total), centerX, centerY + 9)

      var legendX = width * 0.58
      var legendY = 16
      var legendSpacing = 38
      var maxItems = Math.min(cats.length, 6)
      for (var li = 0; li < maxItems; li++) {
        var iy = legendY + li * legendSpacing
        ctx.beginPath()
        ctx.arc(legendX, iy + 2, 4, 0, Math.PI * 2)
        ctx.fillStyle = colors[li % colors.length]
        ctx.fill()

        ctx.fillStyle = isDark ? '#94A3B8' : '#64748B'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(cats[li].icon + ' ' + cats[li].name, legendX + 10, iy + 2)

        ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B'
        ctx.font = 'bold 11px sans-serif'
        ctx.fillText(cats[li].amount + texts.currencyUnit, legendX + 10, iy + 16)
      }
    })
  },

  _drawTrendChart: function() {
    var dailyData = this.data.dailyData
    if (dailyData.length < 2) return
    var isDark = this.data.isDarkMode
    var texts = this.data.i18n

    var query = wx.createSelectorQuery()
    query.select('#trendCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) return
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      var dpr = wx.getWindowInfo().pixelRatio
      var width = res[0].width
      var height = res[0].height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      var padLeft = 45
      var padRight = 12
      var padTop = 16
      var padBottom = 30
      var chartW = width - padLeft - padRight
      var chartH = height - padTop - padBottom

      var maxVal = 0
      for (var mi = 0; mi < dailyData.length; mi++) {
        if (dailyData[mi].expense > maxVal) maxVal = dailyData[mi].expense
        if (dailyData[mi].income > maxVal) maxVal = dailyData[mi].income
      }
      if (maxVal === 0) maxVal = 1

      ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(226,232,240,0.6)'
      ctx.lineWidth = 0.5
      for (var g = 0; g <= 3; g++) {
        var gy = padTop + chartH * (1 - g / 3)
        ctx.beginPath()
        ctx.moveTo(padLeft, gy)
        ctx.lineTo(padLeft + chartW, gy)
        ctx.stroke()
        ctx.fillStyle = isDark ? '#64748B' : '#94A3B8'
        ctx.font = '9px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText((maxVal * g / 3).toFixed(0), padLeft - 5, gy + 3)
      }

      function drawLine(data, key, color, fillColor) {
        var chartPoints = []
        for (var pi = 0; pi < data.length; pi++) {
          var px = padLeft + (chartW / (data.length - 1)) * pi
          var py = padTop + chartH - ((data[pi][key] || 0) / maxVal) * chartH
          chartPoints.push({ x: px, y: py })
        }

        ctx.beginPath()
        ctx.moveTo(chartPoints[0].x, padTop + chartH)
        ctx.lineTo(chartPoints[0].x, chartPoints[0].y)
        for (var si = 1; si < chartPoints.length; si++) {
          var cpx = (chartPoints[si - 1].x + chartPoints[si].x) / 2
          ctx.bezierCurveTo(cpx, chartPoints[si - 1].y, cpx, chartPoints[si].y, chartPoints[si].x, chartPoints[si].y)
        }
        ctx.lineTo(chartPoints[chartPoints.length - 1].x, padTop + chartH)
        ctx.closePath()
        var grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH)
        grad.addColorStop(0, fillColor)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(chartPoints[0].x, chartPoints[0].y)
        for (var li = 1; li < chartPoints.length; li++) {
          var cpxL = (chartPoints[li - 1].x + chartPoints[li].x) / 2
          ctx.bezierCurveTo(cpxL, chartPoints[li - 1].y, cpxL, chartPoints[li].y, chartPoints[li].x, chartPoints[li].y)
        }
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.stroke()
      }

      drawLine(dailyData, 'expense', '#EF4444', 'rgba(239,68,68,0.15)')
      drawLine(dailyData, 'income', '#10B981', 'rgba(16,185,129,0.15)')

      var labelStep = Math.max(1, Math.floor(dailyData.length / 6))
      ctx.fillStyle = isDark ? '#64748B' : '#94A3B8'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      for (var di = 0; di < dailyData.length; di += labelStep) {
        var lx = padLeft + (chartW / (dailyData.length - 1)) * di
        ctx.fillText(dailyData[di].dayLabel, lx, padTop + chartH + 16)
      }

      var lgX = padLeft + chartW - 120
      var lgY = padTop + 4
      ctx.beginPath()
      ctx.arc(lgX, lgY, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#EF4444'
      ctx.fill()
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(texts.trendExpense, lgX + 6, lgY + 1)

      ctx.beginPath()
      ctx.arc(lgX + 50, lgY, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#10B981'
      ctx.fill()
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B'
      ctx.fillText(texts.trendIncome, lgX + 56, lgY + 1)
    })
  },

  _formatDate: function(date) {
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    var d = date.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (d < 10 ? '0' + d : '' + d)
  },

  _formatTime: function(date) {
    var h = date.getHours()
    var m = date.getMinutes()
    return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m)
  },

  _formatDateDisplay: function(dateStr) {
    var parts = dateStr.split('-')
    var m = parseInt(parts[1])
    var d = parseInt(parts[2])
    var lang = i18n.getLanguage()
    if (lang === 'en') {
      var texts = this.data.i18n
      var monthShortNames = texts.monthShortNames.split(',')
      return monthShortNames[m - 1] + ' ' + d
    }
    return m + '月' + d + '日'
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('记账本 - 百宝工具箱', '/package-life/account-book/account-book', '日常收支记账，分类统计消费')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('记账本 - 日常收支分类统计')
  }
})
