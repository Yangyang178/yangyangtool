Page({
  data: {
    height: '',
    weight: '',
    bmi: null,
    status: '',
    statusClass: '',
    pointerLeft: '0%',
    advice: '',
    unitType: 'metric',
    idealWeight: { min: '', max: '' },
    categoryRanges: [
      { label: '偏瘦', range: '<18.5', class: 'status-underweight' },
      { label: '正常', range: '18.5-23.9', class: 'status-normal' },
      { label: '偏胖', range: '24-27.9', class: 'status-overweight' },
      { label: '肥胖', range: '≥28', class: 'status-obese' }
    ]
  },

  onHeightInput(e) { this.setData({ height: e.detail.value }) },
  onWeightInput(e) { this.setData({ weight: e.detail.value }) },

  switchUnit(e) {
    this.setData({ 
      unitType: e.currentTarget.dataset.type, 
      height: '', weight: '', bmi: null, status: '', statusClass: '', pointerLeft: '0%', advice: '' 
    })
  },

  calculateBMI() {
    const h = parseFloat(this.data.height)
    const w = parseFloat(this.data.weight)
    
    if (!h || !w || h <= 0 || w <= 0) {
      wx.showToast({ title: '请输入有效的身高和体重', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'light' })

    let bmi, heightM
    if (this.data.unitType === 'metric') {
      heightM = h / 100
      bmi = w / (heightM * heightM)
    } else {
      bmi = (w / (h * h)) * 703
    }

    bmi = Math.round(bmi * 10) / 10

    let status, statusClass, advice
    if (bmi < 18.5) {
      status = '偏瘦'; statusClass = 'status-underweight'
      advice = '您的体重偏低，建议适当增加营养摄入，进行力量训练来增加肌肉量。保持均衡饮食，多吃优质蛋白质。'
    } else if (bmi < 24) {
      status = '正常'; statusClass = 'status-normal'
      advice = '恭喜！您的BMI在健康范围内。建议继续保持均衡饮食和规律运动，维持当前的健康状态。'
    } else if (bmi < 28) {
      status = '偏胖'; statusClass = 'status-overweight'
      advice = '您的体重略偏高，建议控制饮食总热量，减少高糖高脂食物摄入，增加有氧运动频率（每周至少150分钟）。'
    } else {
      status = '肥胖'; statusClass = 'status-obese'
      advice = '您的体重偏高较多，建议咨询专业医生或营养师制定科学的减重计划。循序渐进地调整饮食结构，结合适量运动。'
    }

    const minBMI = 18.5
    const maxBMI = 23.9
    const minW = Math.round(minBMI * heightM * heightM * 10) / 10
    const maxW = Math.round(maxBMI * heightM * heightM * 10) / 10

    let pointerPos
    if (bmi < 15) pointerPos = '0%'
    else if (bmi > 35) pointerPos = '100%'
    else pointerPos = ((bmi - 15) / 20 * 100) + '%'

    this.setData({
      bmi, status, statusClass,
      pointerLeft: pointerPos,
      advice,
      idealWeight: { min: minW.toFixed(1), max: maxW.toFixed(1) }
    })
  },

  onShareAppMessage() {
    return { title: 'BMI计算器 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
