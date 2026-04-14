Page({
  data: {
    currentCategory: 'length',
    inputValue: '',
    resultValue: '0',
    fromUnit: '米',
    toUnit: '厘米',
    showTable: true,
    
    categories: [
      { id: 'length', name: '长度' },
      { id: 'weight', name: '重量' },
      { id: 'temperature', name: '温度' },
      { id: 'area', name: '面积' }
    ],
    
    units: {
      length: [
        { name: '千米', factor: 1000 },
        { name: '米', factor: 1 },
        { name: '厘米', factor: 0.01 },
        { name: '毫米', factor: 0.001 },
        { name: '英寸', factor: 0.0254 },
        { name: '英尺', factor: 0.3048 },
        { name: '码', factor: 0.9144 },
        { name: '英里', factor: 1609.344 }
      ],
      weight: [
        { name: '吨', factor: 1000 },
        { name: '千克', factor: 1 },
        { name: '克', factor: 0.001 },
        { name: '毫克', factor: 0.000001 },
        { name: '斤', factor: 0.5 },
        { name: '两', factor: 0.05 },
        { name: '磅', factor: 0.453592 },
        { name: '盎司', factor: 0.0283495 }
      ],
      temperature: [
        { name: '摄氏度', type: 'celsius' },
        { name: '华氏度', type: 'fahrenheit' },
        { name: '开尔文', type: 'kelvin' }
      ],
      area: [
        { name: '平方千米', factor: 1000000 },
        { name: '公顷', factor: 10000 },
        { name: '亩', factor: 666.667 },
        { name: '平方米', factor: 1 },
        { name: '平方分米', factor: 0.01 },
        { name: '平方厘米', factor: 0.0001 },
        { name: '平方英尺', factor: 0.092903 },
        { name: '平方英里', factor: 2589988 }
      ]
    },
    
    conversionList: []
  },

  onLoad() {
    this.updateConversionList()
    this.calculate()
  },

  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    const category = this.data.units[categoryId]
    
    this.setData({
      currentCategory: categoryId,
      fromUnit: category[0].name || category[0].type === undefined ? category[0].name : category[0].type,
      toUnit: category[1] ? (category[1].name || category[1].type) : category[0].name,
      inputValue: '',
      resultValue: '0'
    })
    
    this.updateConversionList()
    wx.vibrateShort({ type: 'light' })
  },

  onInput(e) {
    const value = e.detail.value
    this.setData({ inputValue: value })
    this.calculate()
  },

  showFromUnit() {
    const units = this.data.units[this.data.currentCategory]
    const names = units.map(u => u.name || u.type)
    
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        this.setData({ fromUnit: names[res.tapIndex] })
        this.calculate()
      }
    })
  },

  showToUnit() {
    const units = this.data.units[this.data.currentCategory]
    const names = units.map(u => u.name || u.type)
    
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        this.setData({ toUnit: names[res.tapIndex] })
        this.calculate()
      }
    })
  },

  swapUnits() {
    wx.vibrateShort({ type: 'light' })
    
    const temp = this.data.fromUnit
    this.setData({
      fromUnit: this.data.toUnit,
      toUnit: temp
    })
    this.calculate()
  },

  calculate() {
    if (!this.data.inputValue || parseFloat(this.data.inputValue) === 0) {
      this.setData({ resultValue: '0' })
      return
    }

    const value = parseFloat(this.data.inputValue)
    const category = this.data.units[this.data.currentCategory]
    
    if (this.data.currentCategory === 'temperature') {
      this.calculateTemperature(value)
    } else {
      const fromUnit = category.find(u => (u.name || u.type) === this.data.fromUnit)
      const toUnit = category.find(u => (u.name || u.type) === this.data.toUnit)
      
      if (fromUnit && toUnit) {
        const result = (value * fromUnit.factor / toUnit.factor).toFixed(4)
        this.setData({ resultValue: result.replace(/\.?0+$/, '') })
      }
    }
  },

  calculateTemperature(value) {
    let result = 0
    
    if (this.data.fromUnit === '摄氏度') {
      if (this.data.toUnit === '华氏度') result = value * 9/5 + 32
      else if (this.data.toUnit === '开尔文') result = value + 273.15
      else result = value
    } else if (this.data.fromUnit === '华氏度') {
      if (this.data.toUnit === '摄氏度') result = (value - 32) * 5/9
      else if (this.data.toUnit === '开尔文') result = (value - 32) * 5/9 + 273.15
      else result = value
    } else {
      if (this.data.toUnit === '摄氏度') result = value - 273.15
      else if (this.data.toUnit === '华氏度') result = (value - 273.15) * 9/5 + 32
      else result = value
    }
    
    this.setData({ resultValue: result.toFixed(2) })
  },

  updateConversionList() {
    const lists = {
      length: [
        { from: '1 千米', to: '1000 米' },
        { from: '1 米', to: '100 厘米' },
        { from: '1 英寸', to: '2.54 厘米' },
        { from: '1 英尺', to: '0.3048 米' }
      ],
      weight: [
        { from: '1 千克', to: '1000 克' },
        { from: '1 斤', to: '500 克' },
        { from: '1 磅', to: '453.59 克' },
        { from: '1 吨', to: '1000 千克' }
      ],
      temperature: [
        { from: '0°C', to: '32°F' },
        { from: '100°C', to: '212°F' },
        { from: '0°C', to: '273.15K' },
        { from: '-273.15°C', to: '0K' }
      ],
      area: [
        { from: '1 公顷', to: '10000 平方米' },
        { from: '1 亩', to: '666.67 平方米' },
        { from: '1 平方千米', to: '100 公顷' },
        { from: '1 平方英里', to: '2.59 平方千米' }
      ]
    }
    
    this.setData({ conversionList: lists[this.data.currentCategory] })
  },

  copyResult() {
    wx.vibrateShort({ type: 'light' })
    
    const text = `${this.data.inputValue} ${this.data.fromUnit} = ${this.data.resultValue} ${this.data.toUnit}`
    
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  }
})
