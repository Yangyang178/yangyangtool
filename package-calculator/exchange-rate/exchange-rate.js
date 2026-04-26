Page({
  data: {
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

    quickRates: [
      { code: 'USD', name: '美元', rate: '0.1387', symbol: '$' },
      { code: 'EUR', name: '欧元', rate: '0.1275', symbol: '€' },
      { code: 'GBP', name: '英镑', rate: '0.1092', symbol: '£' },
      { code: 'JPY', name: '日元', rate: '21.45', symbol: '¥' },
      { code: 'KRW', name: '韩元', rate: '189.23', symbol: '₩' },
      { code: 'HKD', name: '港币', rate: '1.078', symbol: 'HK$' },
      { code: 'TWD', name: '台币', rate: '4.35', symbol: 'NT$' },
      { code: 'SGD', name: '新加坡元', rate: '0.1865', symbol: 'S$' },
      { code: 'AUD', name: '澳元', rate: '0.2134', symbol: 'A$' },
      { code: 'CAD', name: '加元', rate: '0.1898', symbol: 'C$' },
      { code: 'CHF', name: '瑞士法郎', rate: '0.1234', symbol: 'CHF' },
      { code: 'THB', name: '泰铢', rate: '4.7890', symbol: '฿' }
    ],

    currencies: [
      { code: 'CNY', name: '人民币', rate: 1, symbol: '¥', flag: '🇨🇳' },
      { code: 'USD', name: '美元', rate: 0.1387, symbol: '$', flag: '🇺🇸' },
      { code: 'EUR', name: '欧元', rate: 0.1275, symbol: '€', flag: '🇪🇺' },
      { code: 'GBP', name: '英镑', rate: 0.1092, symbol: '£', flag: '🇬🇧' },
      { code: 'JPY', name: '日元', rate: 21.45, symbol: '¥', flag: '🇯🇵' },
      { code: 'KRW', name: '韩元', rate: 189.23, symbol: '₩', flag: '🇰🇷' },
      { code: 'HKD', name: '港币', rate: 1.078, symbol: 'HK$', flag: '🇭🇰' },
      { code: 'TWD', name: '台币', rate: 4.35, symbol: 'NT$', flag: '🇹🇼' },
      { code: 'SGD', name: '新加坡元', rate: 0.1865, symbol: 'S$', flag: '🇸🇬' },
      { code: 'AUD', name: '澳元', rate: 0.2134, symbol: 'A$', flag: '🇦🇺' },
      { code: 'CAD', name: '加元', rate: 0.1898, symbol: 'C$', flag: '🇨🇦' },
      { code: 'CHF', name: '瑞士法郎', rate: 0.1234, symbol: 'CHF', flag: '🇨🇭' },
      { code: 'SEK', name: '瑞典克朗', rate: 1.4567, symbol: 'kr', flag: '🇸🇪' },
      { code: 'NOK', name: '挪威克朗', rate: 1.5234, symbol: 'kr', flag: '🇳🇴' },
      { code: 'DKK', name: '丹麦克朗', rate: 0.9489, symbol: 'kr', flag: '🇩🇰' },
      { code: 'NZD', name: '新西兰元', rate: 0.2289, symbol: 'NZ$', flag: '🇳🇿' },
      { code: 'THB', name: '泰铢', rate: 4.7890, symbol: '฿', flag: '🇹🇭' },
      { code: 'MYR', name: '马来西亚林吉特', rate: 0.5876, symbol: 'RM', flag: '🇲🇾' },
      { code: 'PHP', name: '菲律宾比索', rate: 7.8912, symbol: '₱', flag: '🇵🇭' },
      { code: 'INR', name: '印度卢比', rate: 11.5678, symbol: '₹', flag: '🇮🇳' },
      { code: 'RUB', name: '俄罗斯卢布', rate: 12.3456, symbol: '₽', flag: '🇷🇺' },
      { code: 'BRL', name: '巴西雷亚尔', rate: 0.6890, symbol: 'R$', flag: '🇧🇷' },
      { code: 'MXN', name: '墨西哥比索', rate: 2.4567, symbol: 'MX$', flag: '🇲🇽' },
      { code: 'ZAR', name: '南非兰特', rate: 2.5678, symbol: 'R', flag: '🇿🇦' },
      { code: 'TRY', name: '土耳其里拉', rate: 4.2345, symbol: '₺', flag: '🇹🇷' },
      { code: 'SAR', name: '沙特里亚尔', rate: 0.5201, symbol: '﷼', flag: '🇸🇦' },
      { code: 'AED', name: '阿联酋迪拉姆', rate: 0.5092, symbol: 'د.إ', flag: '🇦🇪' }
    ]
  },

  onLoad: function() {
    this.useCachedOrDemo()
    this.calculateResult()
  },

  tryFetchRealRates: function() {
    var that = this
    that.setData({ isRefreshing: true })

    wx.request({
      url: 'https://api.exchangerate-api.com/v4/latest/CNY',
      method: 'GET',
      timeout: 5000,
      success: function(res) {
        if (res.data && res.data.rates) {
          var rates = res.data.rates
          var timeStr = new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
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

          that.setData({
            currencies: newCurrencies,
            quickRates: newQuickRates,
            rateSource: 'real',
            lastUpdateText: '实时 ' + timeStr,
            isRefreshing: false
          })

          that.updateExchangeRate()
          that.calculateResult()

          wx.setStorageSync('cachedRates', { currencies: newCurrencies, quickRates: newQuickRates, cachedAt: Date.now() })
        } else {
          that.useCachedOrDemo()
        }
      },
      fail: function() {
        that.useCachedOrDemo()
      }
    })
  },

  useCachedOrDemo() {
    var cached = wx.getStorageSync('cachedRates')
    if (cached && cached.cachedAt && (Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000)) {
      var timeStr = new Date(cached.cachedAt).toLocaleDateString('zh-CN')
      this.setData({
        currencies: cached.currencies,
        quickRates: cached.quickRates,
        rateSource: 'cache',
        lastUpdateText: '缓存 ' + timeStr,
        isRefreshing: false
      })
    } else {
      this.setData({
        rateSource: 'demo',
        lastUpdateText: '演示数据',
        isRefreshing: false
      })
    }
    this.updateExchangeRate()
    this.calculateResult()
  },

  refreshRates() {
    wx.vibrateShort({ type: 'light' })
    this.tryFetchRealRates()
  },

  onAmountInput(e) {
    var amount = e.detail.value
    this.setData({ amount: amount })
    this.calculateResult()
  },

  showFromCurrency() {
    var currencyNames = []
    for (var ci = 0; ci < this.data.currencies.length; ci++) {
      var c = this.data.currencies[ci]
      currencyNames.push(c.flag + ' ' + c.name + ' (' + c.code + ')')
    }
    wx.showActionSheet({
      itemList: currencyNames,
      success: function(res) {
        var selected = this.data.currencies[res.tapIndex]
        this.setData({
          fromCurrency: selected.code,
          fromCurrencyName: selected.name,
          fromSymbol: selected.symbol
        })
        this.updateExchangeRate()
        this.calculateResult()
      }.bind(this)
    })
  },

  showToCurrency() {
    var currencyNames2 = []
    for (var ci2 = 0; ci2 < this.data.currencies.length; ci2++) {
      var c2 = this.data.currencies[ci2]
      currencyNames2.push(c2.flag + ' ' + c2.name + ' (' + c2.code + ')')
    }
    wx.showActionSheet({
      itemList: currencyNames2,
      success: function(res) {
        var selected = this.data.currencies[res.tapIndex]
        this.setData({
          toCurrency: selected.code,
          toCurrencyName: selected.name,
          toSymbol: selected.symbol
        })
        this.updateExchangeRate()
        this.calculateResult()
      }.bind(this)
    })
  },

  swapCurrency() {
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
  },

  updateExchangeRate() {
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

  calculateResult() {
    if (!this.data.amount || parseFloat(this.data.amount) === 0) {
      this.setData({ resultAmount: '0.00' })
      return
    }

    var amount = parseFloat(this.data.amount)
    var result = (amount * parseFloat(this.data.exchangeRate)).toFixed(2)
    this.setData({ resultAmount: result })
  },

  copyResult() {
    wx.vibrateShort({ type: 'light' })

    var sourceTag = this.data.rateSource === 'demo' ? ' [演示汇率]' : ''
    var text = this.data.amount + ' ' + this.data.fromCurrency + ' = ' + this.data.resultAmount + ' ' + this.data.toCurrency + sourceTag

    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  resetCalculator() {
    wx.vibrateShort({ type: 'light' })

    this.setData({
      amount: '',
      resultAmount: '0.00'
    })
  },

  selectQuickRate(e) {
    var currencyCode = e.currentTarget.dataset.currency
    var selected = null
    for (var sqi = 0; sqi < this.data.currencies.length; sqi++) {
      if (this.data.currencies[sqi].code === currencyCode) { selected = this.data.currencies[sqi]; break }
    }

    if (selected && selected.code !== this.data.fromCurrency) {
      wx.vibrateShort({ type: 'light' })

      this.setData({
        toCurrency: selected.code,
        toCurrencyName: selected.name,
        toSymbol: selected.symbol
      })

      this.updateExchangeRate()
      this.calculateResult()

      wx.showToast({
        title: '已切换到 ' + selected.name,
        icon: 'none',
        duration: 1000
      })
    }
  },
  onShareAppMessage() {
    return { title: '汇率换算 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})