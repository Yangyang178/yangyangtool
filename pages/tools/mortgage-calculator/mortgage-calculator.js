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
    totalMonths: '0',
    amountDisplay: '',
    hasCalculated: false,
    firstMonthPayment: '',
    lastMonthPayment: '',
    monthlyDecrease: '',
    interestRatio: '0'
  },

  onLoanAmountInput(e) {
    this.setData({ 
      loanAmount: e.detail.value,
      hasCalculated: false 
    })
  },

  onYearChange(e) {
    this.setData({ yearIndex: e.detail.value, hasCalculated: false })
  },

  onRateInput(e) {
    this.setData({ interestRate: e.detail.value, hasCalculated: false })
  },

  usePresetRate(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({ interestRate: e.currentTarget.dataset.rate })
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ repaymentType: type, hasCalculated: false })
    wx.vibrateShort({ type: 'light' })
  },

  calculate() {
    const rawAmount = this.data.loanAmount.trim()
    
    if (!rawAmount || isNaN(parseFloat(rawAmount))) {
      wx.showToast({ title: '请输入有效的贷款金额', icon: 'none' })
      return
    }

    if (!this.data.interestRate || isNaN(parseFloat(this.data.interestRate))) {
      wx.showToast({ title: '请输入有效的年利率', icon: 'none' })
      return
    }

    let inputAmount = parseFloat(rawAmount)
    
    if (inputAmount <= 0) {
      wx.showToast({ title: '贷款金额必须大于0', icon: 'none' })
      return
    }

    if (inputAmount > 5000) {
      wx.showModal({
        title: '提示',
        content: `您输入的是 ${inputAmount} 万元（即 ${this.formatNumber(inputAmount * 10000)} 元），确认继续吗？`,
        confirmText: '确认计算',
        success: (res) => {
          if (res.confirm) {
            this.doCalculate(inputAmount)
          }
        }
      })
      return
    }

    this.doCalculate(inputAmount)
  },

  doCalculate(inputWan) {
    const amount = Math.round(inputWan * 10000)
    const years = parseInt(this.data.yearOptions[this.data.yearIndex])
    const months = years * 12
    const annualRate = parseFloat(this.data.interestRate)
    
    if (annualRate <= 0 || annualRate >= 100) {
      wx.showToast({ title: '年利率应在 0~100% 之间', icon: 'none' })
      return
    }
    
    const rate = annualRate / 100 / 12

    let monthlyPay = 0
    let totalPay = 0
    let totalInt = 0
    let firstMonth = 0
    let lastMonth = 0
    let monthDecrease = 0

    if (this.data.repaymentType === 'equalPayment') {
      const powValue = Math.pow(1 + rate, months)
      if (powValue === 1) {
        monthlyPay = amount / months
      } else {
        monthlyPay = (amount * rate * powValue) / (powValue - 1)
      }
      totalPay = monthlyPay * months
      totalInt = totalPay - amount
      firstMonth = monthlyPay
      lastMonth = monthlyPay
    } else {
      const principalPerMonth = amount / months
      let remaining = amount
      
      for (let i = 0; i < months; i++) {
        const interest = remaining * rate
        const payment = principalPerMonth + interest
        
        if (i === 0) {
          firstMonth = payment
        }
        
        if (i === months - 1) {
          lastMonth = payment
        }
        
        totalInt += interest
        remaining -= principalPerMonth
      }
      
      totalPay = amount + totalInt
      monthlyPay = firstMonth
      monthDecrease = principalPerMonth * rate
    }

    this.setData({
      monthlyPayment: this.formatCurrency(monthlyPay),
      totalInterest: this.formatCurrency(totalInt),
      totalPayment: this.formatCurrency(totalPay),
      loanTotal: this.formatCurrency(amount),
      totalMonths: months.toString(),
      amountDisplay: `${inputWan}万`,
      hasCalculated: true,
      firstMonthPayment: this.formatCurrency(firstMonth),
      lastMonthPayment: this.formatCurrency(lastMonth),
      monthlyDecrease: monthDecrease > 0 ? `每月递减 ${this.formatCurrency(monthDecrease)}` : '',
      interestRatio: totalPay > 0 ? (totalInt / totalPay * 100).toFixed(1) : '0'
    })

    wx.vibrateShort({ type: 'medium' })
  },

  formatCurrency(num) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  formatNumber(num) {
    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
      totalMonths: '0',
      amountDisplay: '',
      hasCalculated: false,
      firstMonthPayment: '',
      lastMonthPayment: '',
      monthlyDecrease: '',
      interestRatio: '0'
    })
    wx.vibrateShort({ type: 'light' })
  }
})
