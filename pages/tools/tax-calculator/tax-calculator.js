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
    breakdown: []
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onSalaryInput(e) { this.setData({ salary: e.detail.value }) },
  onDeductionChange(e) {
    const key = e.currentTarget.dataset.key
    const val = parseFloat(e.detail.value) || 0
    let obj = {}
    obj[`deductions.${key}`] = val
    this.setData(obj)
  },

  calculate() {
    const s = parseFloat(this.data.salary)
    if (!s || s <= 0) { wx.showToast({ title: '请输入有效月薪', icon: 'none' }); return }

    wx.vibrateShort({ type: 'light' })
    const d = this.data.deductions

    const threshold = 5000
    const totalDeduct = (d.children * 2000) + d.education + d.housing + d.elderly + d.other
    const taxable = Math.max(0, s - threshold - totalDeduct)
    
    const tax = this.calcTax(taxable)
    const afterTax = s - tax
    const effectiveRate = s > 0 ? ((tax / s) * 100).toFixed(2) : '0.00'
    const monthlyAfterTax = (afterTax).toFixed(2)
    const annualSalary = (s * 12).toFixed(2)
    const annualTax = (tax * 12).toFixed(2)
    const annualAfterTax = (afterTax * 12).toFixed(2)

    const breakdown = [
      { label: '税前月薪', val: s.toFixed(2), cls: '' },
      { label: '起征点', val: `-${threshold.toFixed(2)}`, cls: 'negative' },
      { label: '专项扣除合计', val: `-${totalDeduct.toFixed(2)}`, cls: 'negative' },
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
