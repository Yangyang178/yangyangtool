var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
Page({
  data: {
    isLoading: true,
    amount: '',
    fromCurrency: 'CNY',
    fromCurrencyName: '人民币',
    fromSymbol: '¥',
    toCurrency: 'USD',
    toCurrencyName: '美元',
    toSymbol: '$',
    exchangeRate: '0.1387',
    resultAmount: '0.00',
    isRefreshing: false,
    lastUpdateText: '演示数据',
    rateSource: 'demo',
    showCurrencyPicker: false,
    pickerType: 'from',
    isOffline: false,
    cacheAge: '',
    cacheExpired: false,

    quickRates: [
      { code: 'USD', name: '美元', enName: 'US Dollar', rate: '0.1387', symbol: '$', flag: '🇺🇸' },
      { code: 'EUR', name: '欧元', enName: 'Euro', rate: '0.1275', symbol: '€', flag: '🇪🇺' },
      { code: 'GBP', name: '英镑', enName: 'British Pound', rate: '0.1092', symbol: '£', flag: '🇬🇧' },
      { code: 'JPY', name: '日元', enName: 'Japanese Yen', rate: '21.45', symbol: '¥', flag: '🇯🇵' },
      { code: 'KRW', name: '韩元', enName: 'Korean Won', rate: '189.23', symbol: '₩', flag: '🇰🇷' },
      { code: 'HKD', name: '港币', enName: 'Hong Kong Dollar', rate: '1.078', symbol: 'HK$', flag: '🇭🇰' },
      { code: 'TWD', name: '台币', enName: 'New Taiwan Dollar', rate: '4.35', symbol: 'NT$', flag: '🇹🇼' },
      { code: 'SGD', name: '新加坡元', enName: 'Singapore Dollar', rate: '0.1865', symbol: 'S$', flag: '🇸🇬' },
      { code: 'THB', name: '泰铢', enName: 'Thai Baht', rate: '4.7890', symbol: '฿', flag: '🇹🇭' },
      { code: 'VND', name: '越南盾', enName: 'Vietnamese Dong', rate: '3512.5', symbol: '₫', flag: '🇻🇳' },
      { code: 'MYR', name: '林吉特', enName: 'Malaysian Ringgit', rate: '0.5876', symbol: 'RM', flag: '🇲🇾' },
      { code: 'PHP', name: '比索', enName: 'Philippine Peso', rate: '7.8912', symbol: '₱', flag: '🇵🇭' }
    ],

    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    showTrendChart: false,
    trendPeriod: '7d',
    trendData: [],
    trendChange: '',
    trendChangeDir: '',

    currencyGroups: [
      {
        name: '🇨🇳 中国及港澳台',
        enName: '🇨🇳 China & HK/MO/TW',
        list: [
          { code: 'CNY', name: '人民币', enName: 'Chinese Yuan', rate: 1, symbol: '¥', flag: '🇨🇳' },
          { code: 'HKD', name: '港币', enName: 'Hong Kong Dollar', rate: 1.078, symbol: 'HK$', flag: '🇭🇰' },
          { code: 'TWD', name: '新台币', enName: 'New Taiwan Dollar', rate: 4.35, symbol: 'NT$', flag: '🇹🇼' },
          { code: 'MOP', name: '澳门元', enName: 'Macanese Pataca', rate: 1.1134, symbol: 'MOP$', flag: '🇲🇴' }
        ]
      },
      {
        name: '🌏 东南亚',
        enName: '🌏 Southeast Asia',
        list: [
          { code: 'THB', name: '泰铢', enName: 'Thai Baht', rate: 4.7890, symbol: '฿', flag: '🇹🇭' },
          { code: 'VND', name: '越南盾', enName: 'Vietnamese Dong', rate: 3512.5, symbol: '₫', flag: '🇻🇳' },
          { code: 'MYR', name: '林吉特', enName: 'Malaysian Ringgit', rate: 0.5876, symbol: 'RM', flag: '🇲🇾' },
          { code: 'PHP', name: '菲律宾比索', enName: 'Philippine Peso', rate: 7.8912, symbol: '₱', flag: '🇵🇭' },
          { code: 'SGD', name: '新加坡元', enName: 'Singapore Dollar', rate: 0.1865, symbol: 'S$', flag: '🇸🇬' },
          { code: 'IDR', name: '印尼盾', enName: 'Indonesian Rupiah', rate: 2205.3, symbol: 'Rp', flag: '🇮🇩' },
          { code: 'MMK', name: '缅甸元', enName: 'Myanmar Kyat', rate: 291.5, symbol: 'K', flag: '🇲🇲' },
          { code: 'KHR', name: '柬埔寨瑞尔', enName: 'Cambodian Riel', rate: 558.2, symbol: '៛', flag: '🇰🇭' },
          { code: 'LAK', name: '老挝基普', enName: 'Lao Kip', rate: 3015.7, symbol: '₭', flag: '🇱🇦' }
        ]
      },
      {
        name: '🇯🇵🇰🇷 东亚',
        enName: '🇯🇵🇰🇷 East Asia',
        list: [
          { code: 'JPY', name: '日元', enName: 'Japanese Yen', rate: 21.45, symbol: '¥', flag: '🇯🇵' },
          { code: 'KRW', name: '韩元', enName: 'Korean Won', rate: 189.23, symbol: '₩', flag: '🇰🇷' }
        ]
      },
      {
        name: '🌍 欧美',
        enName: '🌍 Europe & Americas',
        list: [
          { code: 'USD', name: '美元', enName: 'US Dollar', rate: 0.1387, symbol: '$', flag: '🇺🇸' },
          { code: 'EUR', name: '欧元', enName: 'Euro', rate: 0.1275, symbol: '€', flag: '🇪🇺' },
          { code: 'GBP', name: '英镑', enName: 'British Pound', rate: 0.1092, symbol: '£', flag: '🇬🇧' },
          { code: 'CHF', name: '瑞士法郎', enName: 'Swiss Franc', rate: 0.1234, symbol: 'CHF', flag: '🇨🇭' },
          { code: 'CAD', name: '加元', enName: 'Canadian Dollar', rate: 0.1898, symbol: 'C$', flag: '🇨🇦' },
          { code: 'AUD', name: '澳元', enName: 'Australian Dollar', rate: 0.2134, symbol: 'A$', flag: '🇦🇺' },
          { code: 'NZD', name: '新西兰元', enName: 'New Zealand Dollar', rate: 0.2289, symbol: 'NZ$', flag: '🇳🇿' },
          { code: 'SEK', name: '瑞典克朗', enName: 'Swedish Krona', rate: 1.4567, symbol: 'kr', flag: '🇸🇪' },
          { code: 'NOK', name: '挪威克朗', enName: 'Norwegian Krone', rate: 1.5234, symbol: 'kr', flag: '🇳🇴' },
          { code: 'DKK', name: '丹麦克朗', enName: 'Danish Krone', rate: 0.9489, symbol: 'kr', flag: '🇩🇰' }
        ]
      },
      {
        name: '🕌 中东/南亚',
        enName: '🕌 Middle East/South Asia',
        list: [
          { code: 'INR', name: '印度卢比', enName: 'Indian Rupee', rate: 11.5678, symbol: '₹', flag: '🇮🇳' },
          { code: 'SAR', name: '沙特里亚尔', enName: 'Saudi Riyal', rate: 0.5201, symbol: '﷼', flag: '🇸🇦' },
          { code: 'AED', name: '迪拉姆', enName: 'UAE Dirham', rate: 0.5092, symbol: 'د.إ', flag: '🇦🇪' },
          { code: 'PKR', name: '巴基斯坦卢比', enName: 'Pakistani Rupee', rate: 38.78, symbol: '₨', flag: '🇵🇰' },
          { code: 'BDT', name: '孟加拉塔卡', enName: 'Bangladeshi Taka', rate: 16.52, symbol: '৳', flag: '🇧🇩' }
        ]
      },
      {
        name: '🌎 其他',
        enName: '🌎 Others',
        list: [
          { code: 'RUB', name: '俄罗斯卢布', enName: 'Russian Ruble', rate: 12.3456, symbol: '₽', flag: '🇷🇺' },
          { code: 'BRL', name: '巴西雷亚尔', enName: 'Brazilian Real', rate: 0.6890, symbol: 'R$', flag: '🇧🇷' },
          { code: 'MXN', name: '墨西哥比索', enName: 'Mexican Peso', rate: 2.4567, symbol: 'MX$', flag: '🇲🇽' },
          { code: 'ZAR', name: '南非兰特', enName: 'South African Rand', rate: 2.5678, symbol: 'R', flag: '🇿🇦' },
          { code: 'TRY', name: '土耳其里拉', enName: 'Turkish Lira', rate: 4.2345, symbol: '₺', flag: '🇹🇷' },
          { code: 'EGP', name: '埃及镑', enName: 'Egyptian Pound', rate: 6.89, symbol: 'E£', flag: '🇪🇬' }
        ]
      }
    ],

    currencies: [],
    i18n: {},
    pickerTitleText: ''
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('汇率换算')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })

    this._updateI18nData()
    this.useCachedOrDemo()
    this.calculateResult()

    var that = this
    setTimeout(function() { that.tryFetchRealRates() }, 500)
    poster.setupForPage(this, 1)

    var toolTexts = i18n.getToolPageTexts('exchange')
    this.setData({ i18n: toolTexts })
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })

    this._updateI18nData()

    var toolTexts = i18n.getToolPageTexts('exchange')
    this.setData({ i18n: toolTexts })
  },

  _updateI18nData: function() {
    var lang = i18n.getLanguage()
    var isEn = lang === 'en'

    var quickRates = this.data.quickRates
    var newQuickRates = []
    for (var qi = 0; qi < quickRates.length; qi++) {
      var q = quickRates[qi]
      var nq = {}
      for (var qk in q) { nq[qk] = q[qk] }
      if (isEn && q.enName) {
        nq.name = q.enName
      }
      newQuickRates.push(nq)
    }

    var groups = this.data.currencyGroups
    var newGroups = []
    for (var gi = 0; gi < groups.length; gi++) {
      var group = groups[gi]
      var newGroup = {}
      for (var gk in group) { newGroup[gk] = group[gk] }
      if (isEn && group.enName) {
        newGroup.name = group.enName
      }
      var newList = []
      for (var li = 0; li < group.list.length; li++) {
        var c = group.list[li]
        var nc = {}
        for (var ck in c) { nc[ck] = c[ck] }
        if (isEn && c.enName) {
          nc.name = c.enName
        }
        newList.push(nc)
      }
      newGroup.list = newList
      newGroups.push(newGroup)
    }

    var fromName = this.data.fromCurrencyName
    var toName = this.data.toCurrencyName
    if (isEn) {
      var fromCurr = null
      var toCurr = null
      for (var fi = 0; fi < groups.length; fi++) {
        for (var fj = 0; fj < groups[fi].list.length; fj++) {
          if (groups[fi].list[fj].code === this.data.fromCurrency) {
            fromCurr = groups[fi].list[fj]
          }
          if (groups[fi].list[fj].code === this.data.toCurrency) {
            toCurr = groups[fi].list[fj]
          }
        }
      }
      if (fromCurr && fromCurr.enName) { fromName = fromCurr.enName }
      if (toCurr && toCurr.enName) { toName = toCurr.enName }
    }

    var setDataObj = {
      quickRates: newQuickRates,
      currencyGroups: newGroups,
      fromCurrencyName: fromName,
      toCurrencyName: toName
    }

    this.setData(setDataObj)
    this.buildFlatCurrencies()
  },

  buildFlatCurrencies: function() {
    var flat = []
    var groups = this.data.currencyGroups
    for (var gi = 0; gi < groups.length; gi++) {
      var list = groups[gi].list
      for (var li = 0; li < list.length; li++) {
        flat.push(list[li])
      }
    }
    this.setData({ currencies: flat })
  },

  tryFetchRealRates: function() {
    var that = this
    that.setData({ isRefreshing: true })

    wx.getNetworkType({
      success: function(netRes) {
        if (netRes.networkType === 'none') {
          that.useCachedOrDemo()
          that.setData({ isOffline: true, isRefreshing: false })
          return
        }

        that.setData({ isOffline: false })

        var apiList = [
          {
            url: 'https://open.er-api.com/v6/latest/CNY',
            parse: function(data) {
              if (data && data.rates) return data.rates
              return null
            }
          },
          {
            url: 'https://api.exchangerate-api.com/v4/latest/CNY',
            parse: function(data) {
              if (data && data.rates) return data.rates
              return null
            }
          },
          {
            url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/cny.json',
            parse: function(data) {
              if (data && data.cny) {
                var rates = {}
                for (var k in data.cny) {
                  rates[k.toUpperCase()] = data.cny[k]
                }
                return rates
              }
              return null
            }
          }
        ]

        var apiIndex = 0

        function tryNextApi() {
          if (apiIndex >= apiList.length) {
            that.useCachedOrDemo()
            that.setData({ isRefreshing: false })
            return
          }

          var api = apiList[apiIndex]
          apiIndex++

          wx.request({
            url: api.url,
            method: 'GET',
            timeout: 6000,
            success: function(res) {
              var rates = api.parse(res.data)
              if (rates) {
                that.applyRealRates(rates)
              } else {
                tryNextApi()
              }
            },
            fail: function() {
              tryNextApi()
            }
          })
        }

        tryNextApi()
      },
      fail: function() {
        that.useCachedOrDemo()
        that.setData({ isRefreshing: false })
      }
    })
  },

  applyRealRates: function(rates) {
    var timeStr = this.formatTime(Date.now())
    var that = this

    var newCurrencies = []
    for (var ci2 = 0; ci2 < that.data.currencies.length; ci2++) {
      var c = that.data.currencies[ci2]
      var newRate = rates[c.code]
      if (newRate !== undefined) {
        var newC = {}
        for (var ck in c) { newC[ck] = c[ck] }
        newC.rate = newRate
        newCurrencies.push(newC)
      } else {
        newCurrencies.push(c)
      }
    }

    var newQuickRates = []
    for (var qi = 0; qi < that.data.quickRates.length; qi++) {
      var q = that.data.quickRates[qi]
      var qr = rates[q.code]
      if (qr !== undefined) {
        var newQ = {}
        for (var qk in q) { newQ[qk] = q[qk] }
        newQ.rate = String(qr)
        newQuickRates.push(newQ)
      } else {
        newQuickRates.push(q)
      }
    }

    var newGroups = []
    for (var ngi = 0; ngi < that.data.currencyGroups.length; ngi++) {
      var group = that.data.currencyGroups[ngi]
      var newGroupList = []
      for (var nli = 0; nli < group.list.length; nli++) {
        var gc = group.list[nli]
        var gr = rates[gc.code]
        if (gr !== undefined) {
          var newGC = {}
          for (var gck in gc) { newGC[gck] = gc[gck] }
          newGC.rate = gr
          newGroupList.push(newGC)
        } else {
          newGroupList.push(gc)
        }
      }
      var newGroup = { name: group.name, enName: group.enName, list: newGroupList }
      newGroups.push(newGroup)
    }

    that.setData({
      currencies: newCurrencies,
      quickRates: newQuickRates,
      currencyGroups: newGroups,
      rateSource: 'real',
      lastUpdateText: i18n.t('realTime') + ' ' + timeStr,
      isRefreshing: false,
      isOffline: false,
      cacheExpired: false
    })

    that._updateI18nData()
    that.updateExchangeRate()
    that.calculateResult()

    try {
      storageUtil.safeSet('cachedRates', {
        currencies: newCurrencies,
        quickRates: newQuickRates,
        currencyGroups: newGroups,
        cachedAt: Date.now()
      })
    } catch(e) {}

    that.saveRateHistory(rates)
  },

  useCachedOrDemo: function() {
    var cached = null
    try { cached = storageUtil.get('cachedRates') } catch(e) {}

    if (cached && cached.cachedAt) {
      var ageMs = Date.now() - cached.cachedAt
      var ageHours = Math.floor(ageMs / (60 * 60 * 1000))
      var ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000))
      var cacheAge = ''
      var cacheExpired = false

      if (ageHours < 1) {
        cacheAge = i18n.t('justNow')
      } else if (ageHours < 24) {
        cacheAge = ageHours + i18n.t('hoursAgo')
      } else if (ageDays <= 7) {
        cacheAge = ageDays + i18n.t('daysAgo')
        cacheExpired = true
      } else {
        cacheAge = ageDays + i18n.t('daysAgo')
        cacheExpired = true
      }

      var timeStr = this.formatTime(cached.cachedAt)

      var setDataObj = {
        rateSource: 'cache',
        lastUpdateText: i18n.t('cache') + ' ' + timeStr,
        isRefreshing: false,
        cacheAge: cacheAge,
        cacheExpired: cacheExpired
      }

      if (cached.currencies) setDataObj.currencies = cached.currencies
      if (cached.quickRates) setDataObj.quickRates = cached.quickRates
      if (cached.currencyGroups) setDataObj.currencyGroups = cached.currencyGroups

      this.setData(setDataObj)
    } else {
      this.setData({
        rateSource: 'demo',
        lastUpdateText: i18n.t('demoData'),
        isRefreshing: false,
        cacheAge: '',
        cacheExpired: false
      })
    }
    this._updateI18nData()
    this.updateExchangeRate()
    this.calculateResult()
  },

  formatTime: function(timestamp) {
    var d = new Date(timestamp)
    var month = d.getMonth() + 1
    var day = d.getDate()
    var hour = d.getHours()
    var min = d.getMinutes()
    var mStr = month < 10 ? '0' + month : '' + month
    var dStr = day < 10 ? '0' + day : '' + day
    var hStr = hour < 10 ? '0' + hour : '' + hour
    var minStr = min < 10 ? '0' + min : '' + min
    return mStr + '/' + dStr + ' ' + hStr + ':' + minStr
  },

  refreshRates: function() {
    wx.vibrateShort({ type: 'light' })
    this.tryFetchRealRates()
  },

  onAmountInput: function(e) {
    var amount = e.detail.value
    this.setData({ amount: amount })
    this.calculateResult()
  },

  showFromCurrency: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      showCurrencyPicker: true,
      pickerType: 'from',
      pickerTitleText: i18n.t('selectSource')
    })
  },

  showToCurrency: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      showCurrencyPicker: true,
      pickerType: 'to',
      pickerTitleText: i18n.t('selectTarget')
    })
  },

  hideCurrencyPicker: function() {
    this.setData({ showCurrencyPicker: false })
  },

  selectCurrency: function(e) {
    var currencyCode = e.currentTarget.dataset.code
    var selected = null
    for (var sci = 0; sci < this.data.currencies.length; sci++) {
      if (this.data.currencies[sci].code === currencyCode) { selected = this.data.currencies[sci]; break }
    }

    if (selected) {
      wx.vibrateShort({ type: 'light' })

      var displayName = selected.name
      var lang = i18n.getLanguage()
      if (lang === 'en' && selected.enName) {
        displayName = selected.enName
      }

      if (this.data.pickerType === 'from') {
        if (selected.code === this.data.toCurrency) {
          wx.showToast({ title: i18n.t('sameCurrency'), icon: 'none' })
          return
        }
        this.setData({
          fromCurrency: selected.code,
          fromCurrencyName: displayName,
          fromSymbol: selected.symbol,
          showCurrencyPicker: false
        })
      } else {
        if (selected.code === this.data.fromCurrency) {
          wx.showToast({ title: i18n.t('sameCurrency'), icon: 'none' })
          return
        }
        this.setData({
          toCurrency: selected.code,
          toCurrencyName: displayName,
          toSymbol: selected.symbol,
          showCurrencyPicker: false
        })
      }

      this.updateExchangeRate()
      this.calculateResult()
      if (this.data.showTrendChart) {
        this.loadTrendData()
      }
    }
  },

  swapCurrency: function() {
    wx.vibrateShort({ type: 'light' })

    var temp = this.data.fromCurrency
    var tempName = this.data.fromCurrencyName
    var tempSymbol = this.data.fromSymbol

    this.setData({
      fromCurrency: this.data.toCurrency,
      fromCurrencyName: this.data.toCurrencyName,
      fromSymbol: this.data.toSymbol,
      toCurrency: temp,
      toCurrencyName: tempName,
      toSymbol: tempSymbol
    })

    this.updateExchangeRate()
    this.calculateResult()
    if (this.data.showTrendChart) {
      this.loadTrendData()
    }
  },

  updateExchangeRate: function() {
    var fromCurr = null
    for (var fci = 0; fci < this.data.currencies.length; fci++) {
      if (this.data.currencies[fci].code === this.data.fromCurrency) { fromCurr = this.data.currencies[fci]; break }
    }
    var toCurr = null
    for (var tci = 0; tci < this.data.currencies.length; tci++) {
      if (this.data.currencies[tci].code === this.data.toCurrency) { toCurr = this.data.currencies[tci]; break }
    }

    if (fromCurr && toCurr) {
      var rate = (toCurr.rate / fromCurr.rate).toFixed(4)
      this.setData({ exchangeRate: rate })
    }
  },

  calculateResult: function() {
    if (!this.data.amount || parseFloat(this.data.amount) === 0) {
      this.setData({ resultAmount: '0.00' })
      return
    }

    var amount = parseFloat(this.data.amount)
    var result = (amount * parseFloat(this.data.exchangeRate)).toFixed(2)
    this.setData({ resultAmount: result })
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(1, '汇率换算', false)
  },

  copyResult: function() {
    wx.vibrateShort({ type: 'light' })

    var sourceTag = ''
    if (this.data.rateSource === 'demo') sourceTag = ' [' + i18n.t('demoRate') + ']'
    else if (this.data.rateSource === 'cache') sourceTag = ' [' + i18n.t('cacheRate') + ']'

    var text = this.data.amount + ' ' + this.data.fromCurrency + ' = ' + this.data.resultAmount + ' ' + this.data.toCurrency + sourceTag

    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: i18n.t('copiedToClipboard'), icon: 'success' })
      }
    })
  },

  resetCalculator: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      amount: '',
      resultAmount: '0.00'
    })
  },

  selectQuickRate: function(e) {
    var currencyCode = e.currentTarget.dataset.currency
    var selected = null
    for (var sqi = 0; sqi < this.data.currencies.length; sqi++) {
      if (this.data.currencies[sqi].code === currencyCode) { selected = this.data.currencies[sqi]; break }
    }

    if (selected && selected.code !== this.data.fromCurrency) {
      wx.vibrateShort({ type: 'light' })

      var displayName = selected.name
      var lang = i18n.getLanguage()
      if (lang === 'en' && selected.enName) {
        displayName = selected.enName
      }

      this.setData({
        toCurrency: selected.code,
        toCurrencyName: displayName,
        toSymbol: selected.symbol
      })

      this.updateExchangeRate()
      this.calculateResult()

      wx.showToast({ title: i18n.t('switchedTo') + ' ' + displayName, icon: 'none', duration: 1000 })
    }
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        amount: '',
        resultAmount: '0.00'
      })
    })
  },

  saveRateHistory: function(rates) {
    try {
      var key = 'rate_history'
      var history = storageUtil.safeGetArray(key)
      var today = this._getTodayStr()
      var existing = false
      for (var i = 0; i < history.length; i++) {
        if (history[i].date === today) {
          history[i].rates = rates
          existing = true
          break
        }
      }
      if (!existing) {
        history.push({ date: today, rates: rates })
      }
      if (history.length > 60) {
        history = history.slice(history.length - 60)
      }
      storageUtil.safeSet(key, history)
    } catch(e) {}
  },

  _getTodayStr: function() {
    var d = new Date()
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
  },

  toggleTrendChart: function() {
    wx.vibrateShort({ type: 'light' })
    var show = !this.data.showTrendChart
    this.setData({ showTrendChart: show })
    if (show) {
      this.loadTrendData()
    }
  },

  switchTrendPeriod: function(e) {
    var period = e.currentTarget.dataset.period
    if (period === this.data.trendPeriod) return
    wx.vibrateShort({ type: 'light' })
    this.setData({ trendPeriod: period })
    this.loadTrendData()
  },

  loadTrendData: function() {
    var that = this
    var history = storageUtil.safeGetArray('rate_history')
    var period = that.data.trendPeriod
    var days = period === '30d' ? 30 : 7
    var fromCode = that.data.fromCurrency
    var toCode = that.data.toCurrency

    var trendData = []
    for (var i = 0; i < history.length; i++) {
      var entry = history[i]
      var fromRate = entry.rates[fromCode]
      var toRate = entry.rates[toCode]
      if (fromRate && toRate) {
        var crossRate = toRate / fromRate
        trendData.push({ date: entry.date, rate: crossRate })
      }
    }

    if (trendData.length > days) {
      trendData = trendData.slice(trendData.length - days)
    }

    if (trendData.length >= 2) {
      var firstRate = trendData[0].rate
      var lastRate = trendData[trendData.length - 1].rate
      var change = ((lastRate - firstRate) / firstRate * 100).toFixed(2)
      var dir = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
      that.setData({
        trendData: trendData,
        trendChange: (change > 0 ? '+' : '') + change + '%',
        trendChangeDir: dir
      })
    } else {
      that.setData({
        trendData: trendData,
        trendChange: '',
        trendChangeDir: ''
      })
    }

    setTimeout(function() { that.drawTrendChart() }, 100)
  },

  drawTrendChart: function() {
    var that = this
    var query = wx.createSelectorQuery()
    query.select('#trendCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0] || !res[0].node) return
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = wx.getWindowInfo().pixelRatio
        var width = res[0].width
        var height = res[0].height
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        var data = that.data.trendData
        var isDark = that.data.isDarkMode

        ctx.clearRect(0, 0, width, height)

        if (data.length < 2) {
          ctx.fillStyle = isDark ? '#64748B' : '#94A3B8'
          ctx.font = '14px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(i18n.t('insufficientData'), width / 2, height / 2)
          return
        }

        var padLeft = 50
        var padRight = 16
        var padTop = 20
        var padBottom = 36
        var chartW = width - padLeft - padRight
        var chartH = height - padTop - padBottom

        var minRate = data[0].rate
        var maxRate = data[0].rate
        for (var mi = 1; mi < data.length; mi++) {
          if (data[mi].rate < minRate) minRate = data[mi].rate
          if (data[mi].rate > maxRate) maxRate = data[mi].rate
        }
        var rateRange = maxRate - minRate
        if (rateRange === 0) {
          rateRange = Math.abs(maxRate) * 0.01
          if (rateRange === 0) rateRange = 0.01
        }
        minRate -= rateRange * 0.15
        maxRate += rateRange * 0.15
        rateRange = maxRate - minRate

        ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(226,232,240,0.8)'
        ctx.lineWidth = 1
        var gridLines = 4
        for (var gi = 0; gi <= gridLines; gi++) {
          var gy = padTop + (chartH / gridLines) * gi
          ctx.beginPath()
          ctx.moveTo(padLeft, gy)
          ctx.lineTo(padLeft + chartW, gy)
          ctx.stroke()

          var gridVal = maxRate - (rateRange / gridLines) * gi
          ctx.fillStyle = isDark ? '#64748B' : '#94A3B8'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'right'
          ctx.fillText(gridVal.toFixed(4), padLeft - 6, gy + 4)
        }

        var isUp = data[data.length - 1].rate >= data[0].rate
        var lineColor = isUp ? '#10B981' : '#EF4444'
        var fillColorTop = isUp ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'
        var fillColorBot = isUp ? 'rgba(16,185,129,0.02)' : 'rgba(239,68,68,0.02)'

        var chartPoints = []
        for (var pi = 0; pi < data.length; pi++) {
          var px = padLeft + (chartW / (data.length - 1)) * pi
          var py = padTop + chartH - ((data[pi].rate - minRate) / rateRange) * chartH
          chartPoints.push({ x: px, y: py })
        }

        ctx.beginPath()
        ctx.moveTo(chartPoints[0].x, padTop + chartH)
        ctx.lineTo(chartPoints[0].x, chartPoints[0].y)
        for (var si = 1; si < chartPoints.length; si++) {
          var prev = chartPoints[si - 1]
          var curr = chartPoints[si]
          var cpx = (prev.x + curr.x) / 2
          ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y)
        }
        ctx.lineTo(chartPoints[chartPoints.length - 1].x, padTop + chartH)
        ctx.closePath()
        var grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH)
        grad.addColorStop(0, fillColorTop)
        grad.addColorStop(1, fillColorBot)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(chartPoints[0].x, chartPoints[0].y)
        for (var li = 1; li < chartPoints.length; li++) {
          var prevL = chartPoints[li - 1]
          var currL = chartPoints[li]
          var cpxL = (prevL.x + currL.x) / 2
          ctx.bezierCurveTo(cpxL, prevL.y, cpxL, currL.y, currL.x, currL.y)
        }
        ctx.strokeStyle = lineColor
        ctx.lineWidth = 2.5
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.stroke()

        var lastPt = chartPoints[chartPoints.length - 1]
        ctx.beginPath()
        ctx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = lineColor
        ctx.fill()
        ctx.beginPath()
        ctx.arc(lastPt.x, lastPt.y, 7, 0, Math.PI * 2)
        ctx.strokeStyle = lineColor
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.4
        ctx.stroke()
        ctx.globalAlpha = 1

        var labelStep = Math.max(1, Math.floor(data.length / 5))
        ctx.fillStyle = isDark ? '#64748B' : '#94A3B8'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        for (var di = 0; di < data.length; di += labelStep) {
          var dateStr = data[di].date.substring(5)
          ctx.fillText(dateStr, chartPoints[di].x, padTop + chartH + 18)
        }
        if ((data.length - 1) % labelStep !== 0) {
          var lastDateStr = data[data.length - 1].date.substring(5)
          ctx.fillText(lastDateStr, chartPoints[chartPoints.length - 1].x, padTop + chartH + 18)
        }
      })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('汇率换算 - 百宝工具箱', '/package-calculator/exchange-rate/exchange-rate', '实时汇率计算，支持全球货币换算')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('汇率换算 - 实时汇率计算，全球货币换算')
  }
})
