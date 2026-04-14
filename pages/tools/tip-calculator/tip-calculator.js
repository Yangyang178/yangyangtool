Page({
  data: {
    billAmount: '',
    selectedTip: 15,
    tipOptions: [
      { value: 10 },
      { value: 15 },
      { value: 18 },
      { value: 20 }
    ],
    isCustomTip: false,
    customTipValue: '',
    peopleCount: 1,
    currentTipPercent: 15,
    tipAmount: '0.00',
    totalAmount: '0.00',
    totalPerPerson: '0.00'
  },

  onBillInput(e) {
    this.setData({ billAmount: e.detail.value })
    this.calculate()
  },

  selectTip(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      selectedTip: value,
      isCustomTip: false,
      currentTipPercent: value
    })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  showCustomTip() {
    this.setData({ isCustomTip: true })
    wx.vibrateShort({ type: 'light' })
  },

  onCustomTipInput(e) {
    const value = parseFloat(e.detail.value) || 0
    this.setData({
      customTipValue: e.detail.value,
      selectedTip: value,
      currentTipPercent: value
    })
    this.calculate()
  },

  increasePeople() {
    let count = this.data.peopleCount + 1
    if (count > 20) count = 20
    this.setData({ peopleCount: count })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  decreasePeople() {
    let count = this.data.peopleCount - 1
    if (count < 1) count = 1
    this.setData({ peopleCount: count })
    this.calculate()
    wx.vibrateShort({ type: 'light' })
  },

  calculate() {
    const amount = parseFloat(this.data.billAmount) || 0
    const tipPercent = parseFloat(this.data.currentTipPercent) || 0
    const people = parseInt(this.data.peopleCount) || 1

    const tipAmount = amount * (tipPercent / 100)
    const totalAmount = amount + tipAmount
    const perPerson = totalAmount / people

    this.setData({
      tipAmount: tipAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalPerPerson: perPerson.toFixed(2)
    })
  },

  copyResult() {
    wx.vibrateShort({ type: 'light' })
    
    const people = this.data.peopleCount
    let text = ''
    
    if (people > 1) {
      text = `账单: $${this.data.billAmount}\n小费 (${this.data.currentTipPercent}%): $${this.data.tipAmount}\n总计: $${this.data.totalAmount}\n每人: $${this.data.totalPerPerson} × ${people}人`
    } else {
      text = `账单: $${this.data.billAmount}\n小费 (${this.data.currentTipPercent}%): $${this.data.tipAmount}\n总计: $${this.data.totalAmount}`
    }

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  resetCalculator() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      billAmount: '',
      selectedTip: 15,
      isCustomTip: false,
      customTipValue: '',
      peopleCount: 1,
      currentTipPercent: 15,
      tipAmount: '0.00',
      totalAmount: '0.00',
      totalPerPerson: '0.00'
    })
  }
})
