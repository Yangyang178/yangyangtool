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

  onLoad() {
    this.calculateResult()
  },

  onAmountInput(e) {
    const amount = e.detail.value
    this.setData({ amount })
    this.calculateResult()
  },

  showFromCurrency() {
    const currencyNames = this.data.currencies.map(c => c.flag + ' ' + c.name + ' (' + c.code + ')')
    wx.showActionSheet({
      itemList: currencyNames,
      success: (res) => {
        const selected = this.data.currencies[res.tapIndex]
        this.setData({
          fromCurrency: selected.code,
          fromCurrencyName: selected.name,
          fromSymbol: selected.symbol
        })
        this.updateExchangeRate()
        this.calculateResult()
      }
    })
  },

  showToCurrency() {
    const currencyNames = this.data.currencies.map(c => c.flag + ' ' + c.name + ' (' + c.code + ')')
    wx.showActionSheet({
      itemList: currencyNames,
      success: (res) => {
        const selected = this.data.currencies[res.tapIndex]
        this.setData({
          toCurrency: selected.code,
          toCurrencyName: selected.name,
          toSymbol: selected.symbol
        })
        this.updateExchangeRate()
        this.calculateResult()
      }
    })
  },

  swapCurrency() {
    wx.vibrateShort({ type: 'light' })

    const temp = this.data.fromCurrency
    const tempName = this.data.fromCurrencyName
    const tempSymbol = this.data.fromSymbol

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
    const fromCurr = this.data.currencies.find(c => c.code === this.data.fromCurrency)
    const toCurr = this.data.currencies.find(c => c.code === this.data.toCurrency)
    
    if (fromCurr && toCurr) {
      const rate = (toCurr.rate / fromCurr.rate).toFixed(4)
      this.setData({ exchangeRate: rate })
    }
  },

  calculateResult() {
    if (!this.data.amount || parseFloat(this.data.amount) === 0) {
      this.setData({ resultAmount: '0.00' })
      return
    }
    
    const amount = parseFloat(this.data.amount)
    const result = (amount * parseFloat(this.data.exchangeRate)).toFixed(2)
    this.setData({ resultAmount: result })
  },

  copyResult() {
    wx.vibrateShort({ type: 'light' })
    
    const text = `${this.data.amount} ${this.data.fromCurrency} = ${this.data.resultAmount} ${this.data.toCurrency}`
    
    wx.setClipboardData({
      data: text,
      success: () => {
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
    const currencyCode = e.currentTarget.dataset.currency
    const selected = this.data.currencies.find(c => c.code === currencyCode)

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
