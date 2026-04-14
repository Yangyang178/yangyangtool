Page({
  data: {
    loanAmount: '',
    yearIndex: 19,
    yearOptions: Array.from({length: 30}, (_, i) => i + 1),
    interestRate: '4.2',
    repaymentType: 'equalPayment',
    ratePresets: [
      { label: '3.85%(LPR)', rate: '3.85' },
      { label: '4.2%', rate: '4.2' },
      { label: '4.65%', rate: '4.65' },
      { label: '5.0%', rate: '5.0' }
    ],
    monthlyPayment: '0.00',
    totalInterest: '0.00',
    totalPayment: '0.00',
    loanTotal: '0.00',
    totalMonths: '0'
  },

  onLoanAmountInput(e) {
    this.setData({ loanAmount: e.detail.value })
  },

  onYearChange(e) {
    this.setData({ yearIndex: e.detail.value })
  },

  onRateInput(e) {
    this.setData({ interestRate: e.detail.value })
  },

  usePresetRate(e) {
    this.setData({ interestRate: e.currentTarget.dataset.rate })
  },

  onTypeChange(e) {
    this.setData({ repaymentType: e.currentTarget.dataset.type })
    wx.vibrateShort({ type: 'light' })
  },

  calculate() {
    if (!this.data.loanAmount || !this.data.interestRate) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    const amount = parseFloat(this.data.loanAmount) * 10000
    const years = parseInt(this.data.yearOptions[this.data.yearIndex])
    const months = years * 12
    const rate = parseFloat(this.data.interestRate) / 100 / 12

    let monthlyPay = 0
    let totalPay = 0
    let totalInt = 0

    if (this.data.repaymentType === 'equalPayment') {
      monthlyPay = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
      totalPay = monthlyPay * months
      totalInt = totalPay - amount
    } else {
      const principalPerMonth = amount / months
      let remaining = amount
      for (let i = 0; i < months; i++) {
        const interest = remaining * rate
        totalInt += interest
        if (i === 0) monthlyPay = principalPerMonth + interest
        remaining -= principalPerMonth
      }
      totalPay = amount + totalInt
    }

    this.setData({
      monthlyPayment: monthlyPay.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      totalInterest: totalInt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      totalPayment: totalPay.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      loanTotal: amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      totalMonths: months.toString()
    })

    wx.vibrateShort({ type: 'medium' })
  },

  resetForm() {
    this.setData({
      loanAmount: '',
      yearIndex: 19,
      interestRate: '4.2',
      repaymentType: 'equalPayment',
      monthlyPayment: '0.00',
      totalInterest: '0.00',
      totalPayment: '0.00',
      loanTotal: '0.00',
      totalMonths: '0'
    })
    wx.vibrateShort({ type: 'light' })
  }
})
