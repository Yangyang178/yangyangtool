Page({
  data: {
    amount: '',
    fromCurrency: 'CNY',
    fromCurrencyName: '人民币',
    toCurrency: 'USD',
    toCurrencyName: '美元',
    exchangeRate: '0.1387',
    resultAmount: '0.00',
    quickRates: [
      { code: 'USD', rate: '0.1387' },
      { code: 'EUR', rate: '0.1275' },
      { code: 'GBP', rate: '0.1092' },
      { code: 'JPY', rate: '21.45' },
      { code: 'KRW', rate: '189.23' },
      { code: 'HKD', rate: '1.078' }
    ],
    
    currencies: [
      { code: 'CNY', name: '人民币', rate: 1 },
      { code: 'USD', name: '美元', rate: 0.1387 },
      { code: 'EUR', name: '欧元', rate: 0.1275 },
      { code: 'GBP', name: '英镑', rate: 0.1092 },
      { code: 'JPY', name: '日元', rate: 21.45 },
      { code: 'KRW', name: '韩元', rate: 189.23 },
      { code: 'HKD', name: '港币', rate: 1.078 },
      { code: 'TWD', name: '台币', rate: 4.35 }
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
    const currencyNames = this.data.currencies.map(c => c.name)
    wx.showActionSheet({
      itemList: currencyNames,
      success: (res) => {
        const selected = this.data.currencies[res.tapIndex]
        this.setData({
          fromCurrency: selected.code,
          fromCurrencyName: selected.name
        })
        this.updateExchangeRate()
        this.calculateResult()
      }
    })
  },

  showToCurrency() {
    const currencyNames = this.data.currencies.map(c => c.name)
    wx.showActionSheet({
      itemList: currencyNames,
      success: (res) => {
        const selected = this.data.currencies[res.tapIndex]
        this.setData({
          toCurrency: selected.code,
          toCurrencyName: selected.name
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
    
    this.setData({
      fromCurrency: this.data.toCurrency,
      fromCurrencyName: this.data.toCurrencyName,
      toCurrency: temp,
      toCurrencyName: tempName
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
  }
})
