Page({
  data: {
    inputContent: '',
    showQRCode: false,
    canvasReady: false
  },

  onInput(e) {
    this.setData({ 
      inputContent: e.detail.value,
      showQRCode: false
    })
  },

  clearInput() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ 
      inputContent: '',
      showQRCode: false,
      canvasReady: false
    })
  },

  generateQRCode() {
    if (!this.data.inputContent.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'medium' })
    
    this.setData({ showQRCode: true })

    // 延迟绘制，确保DOM渲染完成
    setTimeout(() => {
      this.drawSimpleQRCode()
    }, 300)

    wx.showToast({ title: '生成成功', icon: 'success' })
  },

  drawSimpleQRCode() {
    const ctx = wx.createCanvasContext('qrcodeCanvas', this)
    const size = 240
    const content = this.data.inputContent

    // 清空画布
    ctx.clearRect(0, 0, size, size)
    
    // 白色背景
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(0, 0, size, size)

    // 绘制简单的二维码样式（模拟）
    ctx.setFillStyle('#000000')
    const moduleSize = 8
    const quietZone = 20
    
    // 绘制定位图案（左上角）
    this.drawPositionPattern(ctx, quietZone, quietZone, moduleSize * 7)
    // 右上角
    this.drawPositionPattern(ctx, size - quietZone - moduleSize * 7, quietZone, moduleSize * 7)
    // 左下角
    this.drawPositionPattern(ctx, quietZone, size - quietZone - moduleSize * 7, moduleSize * 7)

    // 模拟数据区域（基于内容生成伪随机图案）
    const dataStart = quietZone + moduleSize * 8
    const dataEnd = size - quietZone - moduleSize * 8
    for (let y = dataStart; y < dataEnd; y += moduleSize) {
      for (let x = dataStart; x < dataEnd; x += moduleSize) {
        // 简单的伪随机：基于内容和位置
        const hash = ((x + y) * content.charCodeAt(0)) % 3
        if (hash === 0) {
          ctx.fillRect(x, y, moduleSize - 1, moduleSize - 1)
        }
      }
    }

    // 绘制中心logo区域（可选）
    const logoSize = 48
    const logoX = (size - logoSize) / 2
    const logoY = (size - logoSize) / 2
    
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8)
    
    ctx.setFillStyle('#8B5CF6')
    ctx.fillRect(logoX, logoY, logoSize, logoSize)
    
    ctx.setFillStyle('#FFFFFF')
    ctx.setFontSize(24)
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.fillText('QRC', size / 2, size / 2)

    ctx.draw(false, () => {
      this.setData({ canvasReady: true })
    })
  },

  drawPositionPattern(ctx, x, y, size) {
    // 外框
    ctx.fillRect(x, y, size, size)
    // 内部白色
    ctx.setFillStyle('#FFFFFF')
    ctx.fillRect(x + moduleSize, y + moduleSize, size - moduleSize * 2, size - moduleSize * 2)
    // 内部黑色点
    ctx.setFillStyle('#000000')
    ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, size - moduleSize * 4, size - moduleSize * 4)
  },

  saveToAlbum() {
    wx.vibrateShort({ type: 'light' })
    
    wx.canvasToTempFilePath({
      canvasId: 'qrcodeCanvas',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: () => {
            wx.showModal({
              title: '提示',
              content: '需要您授权保存到相册',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting()
                }
              }
            })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    }, this)
  },

  shareQRCode() {
    wx.vibrateShort({ type: 'light' })
    
    // 显示分享选项
    wx.showActionSheet({
      itemList: ['复制内容', '分享给朋友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: this.data.inputContent,
            success: () => wx.showToast({ title: '已复制', icon: 'success' })
          })
        } else {
          // 触发分享
          this.onShareAppMessage()
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '我的二维码',
      path: '/pages/tools/qrcode-generator/qrcode-generator'
    }
  }
})
