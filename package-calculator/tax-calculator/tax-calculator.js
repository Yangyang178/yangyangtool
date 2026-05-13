Page({
  data: {
    salary: '',
    deductions: {
      children: 0,
      education: 0,
      housing: 1500,
      elderly: 2000,
      other: 0
    },
    result: null,
    breakdown: [],
    totalDeduction: '3500',
    isDarkMode: false
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      isDarkMode: systemInfo.theme === 'dark'
    })
    
    this.updateTotalDeduction()
  },

  onSalaryInput(e) { this.setData({ salary: e.detail.value }) },

  onDeductionChange(e) {
    const key = e.currentTarget.dataset.key
    const val = parseFloat(e.detail.value) || 0
    let obj = {}
    obj[`deductions.${key}`] = val
    this.setData(obj)
    this.updateTotalDeduction()
  },

  updateTotalDeduction() {
    const d = this.data.deductions
    const total = parseFloat(d.children || 0) + parseFloat(d.education || 0) + parseFloat(d.housing || 0) + parseFloat(d.elderly || 0) + parseFloat(d.other || 0)
    this.setData({ totalDeduction: total.toFixed(0) })
  },

  calculate() {
    try {
      const s = parseFloat(this.data.salary)
      if (!s || isNaN(s) || s <= 0) {
        wx.showToast({ title: '请输入有效月薪（大于0）', icon: 'none' })
        return
      }
      if (s > 1000000) {
        wx.showToast({ title: '月薪超过100万？请检查输入', icon: 'none' })
        return
      }

      wx.vibrateShort({ type: 'light' })
      const d = this.data.deductions

      var children = parseFloat(d.children) || 0
      var education = parseFloat(d.education) || 0
      var housing = parseFloat(d.housing) || 0
      var elderly = parseFloat(d.elderly) || 0
      var other = parseFloat(d.other) || 0

      if (children < 0 || education < 0 || housing < 0 || elderly < 0 || other < 0) {
        wx.showToast({ title: '扣除项不能为负数', icon: 'none' })
        return
      }

      if (children > 2000 || education > 2000 || housing > 1500 || elderly > 3000) {
        wx.showToast({ title: '扣除项超出标准上限', icon: 'none' })
      }

      const threshold = 5000
      const totalDeduct = children + education + housing + elderly + other
      const taxable = Math.max(0, s - threshold - totalDeduct)

      const tax = this.calcTax(taxable)
      const afterTax = Math.max(0, s - tax)
      const effectiveRate = s > 0 ? ((tax / s) * 100).toFixed(2) : '0.00'
      const monthlyAfterTax = afterTax.toFixed(2)
      const annualSalary = (s * 12).toFixed(2)
      const annualTax = (tax * 12).toFixed(2)
      const annualAfterTax = (afterTax * 12).toFixed(2)

    const breakdown = [
      { label: '税前月薪', val: s.toFixed(2), cls: '' },
      { label: '起征点扣除', val: `-${threshold.toFixed(2)}`, cls: 'negative' },
      { label: '专项附加扣除', val: `-${totalDeduct.toFixed(2)}`, cls: 'negative' },
      { label: '应纳税所得额', val: taxable.toFixed(2), cls: '' },
      { label: '应纳个税', val: tax.toFixed(2), cls: 'negative' },
      { label: '税后月薪', val: monthlyAfterTax, cls: 'positive' }
    ]

    this.setData({
      result: {
        gross: s.toFixed(2),
        tax: tax.toFixed(2),
        afterTax: monthlyAfterTax,
        effectiveRate,
        totalDeduct: totalDeduct.toFixed(2),
        taxable: taxable.toFixed(2),
        annualSalary,
        annualTax,
        annualAfterTax
      },
      breakdown
    })
    } catch (err) {
      console.error('Tax calculation error:', err)
      wx.showToast({ title: '计算出错，请检查输入', icon: 'none' })
    }
  },

  calcTax(taxable) {
    if (taxable <= 0) return 0
    const brackets = [
      [3000, 0.03, 0],
      [12000, 0.1, 210],
      [25000, 0.2, 1410],
      [35000, 0.25, 2660],
      [55000, 0.3, 4410],
      [80000, 0.35, 7160],
      [Infinity, 0.45, 15160]
    ]
    for (const [limit, rate, quick] of brackets) {
      if (taxable <= limit) return taxable * rate - quick
    }
    return 0
  },

  onShareAppMessage() {
    return { title: '个税计算器 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
