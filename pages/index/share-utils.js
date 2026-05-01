/**
 * 分享与海报绘制模块
 * 包含：分享配置、海报生成、Canvas绑定等功能
 */

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

module.exports = {
  onShareAppMessage() {
    return {
      title: '🧰 百宝工具箱 - 24+实用小工具合集',
      path: '/pages/index/index',
      imageUrl: this.data.sharePosterPath || ''
    }
  },

  onShareTimeline() {
    return {
      title: '🧰 百宝工具箱 - 汇率换算、单位转换等24+实用工具',
      query: '',
      imageUrl: this.data.sharePosterPath || ''
    }
  },

  drawSharePoster() {
    const appInstance = getApp()

    if (appInstance.globalData.sharePosterPath) {
      this.setData({ sharePosterPath: appInstance.globalData.sharePosterPath })
      return
    }

    const query = wx.createSelectorQuery()
    query.select('#shareCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = 500 * dpr
        canvas.height = 400 * dpr
        ctx.scale(dpr, dpr)

        ctx.fillStyle = '#0F172A'
        roundRect(ctx, 0, 0, 500, 400, 24)
        ctx.fill()

        var topGrad = ctx.createLinearGradient(0, 0, 500, 200)
        topGrad.addColorStop(0, '#1E3A5F')
        topGrad.addColorStop(1, '#0F172A')
        ctx.fillStyle = topGrad
        roundRect(ctx, 0, 0, 500, 200, 24)
        ctx.fill()

        ctx.globalAlpha = 0.15
        ctx.fillStyle = '#3B82F6'
        ctx.beginPath()
        ctx.arc(430, 40, 100, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(60, 160, 70, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.08
        ctx.fillStyle = '#8B5CF6'
        ctx.beginPath()
        ctx.arc(380, 170, 60, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1

        ctx.font = 'bold 44px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🧰 百宝工具箱', 250, 72)

        ctx.font = '16px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillText('即用即走 · 轻量高效 · 实用便捷', 250, 105)

        var tools = [
          { icon: '💹', name: '汇率' },
          { icon: '📐', name: '单位' },
          { icon: '🏠', name: '房贷' },
          { icon: '💰', name: '小费' },
          { icon: '🔢', name: '字数' },
          { icon: '🔤', name: '大小写' },
          { icon: '🔐', name: 'Base64' },
          { icon: '🍅', name: '番茄钟' },
          { icon: '💧', name: '喝水' },
          { icon: '🎲', name: '随机' },
          { icon: '🗑️', name: '垃圾分类' },
          { icon: '📅', name: '日期' }
        ]

        var cardX = 30
        var cardY = 130
        var cardW = 440
        var cardH = 180
        var cardR = 20

        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR)
        ctx.stroke()

        var cols = 6
        var rows = 2
        var itemW = 68
        var itemH = 76
        var gapX = (cardW - cols * itemW) / (cols + 1)
        var gapY = (cardH - rows * itemH) / (rows + 1)

        for (var ti = 0; ti < tools.length; ti++) {
          var col = ti % cols
          var row = Math.floor(ti / cols)
          var ix = cardX + gapX + col * (itemW + gapX)
          var iy = cardY + gapY + row * (itemH + gapY)

          ctx.globalAlpha = 0.12
          roundRect(ctx, ix, iy, itemW, itemH, 14)
          ctx.fill()
          ctx.globalAlpha = 1

          ctx.font = '26px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(tools[ti].icon, ix + itemW / 2, iy + itemH / 2 - 8)

          ctx.font = '11px sans-serif'
          ctx.fillStyle = 'rgba(255,255,255,0.65)'
          ctx.fillText(tools[ti].name, ix + itemW / 2, iy + itemH - 14)
        }

        ctx.textAlign = 'center'

        var bottomGrad = ctx.createLinearGradient(250, 330, 250, 380)
        bottomGrad.addColorStop(0, '#3B82F6')
        bottomGrad.addColorStop(1, '#1D4ED8')
        roundRect(ctx, 50, 328, 400, 48, 24)
        ctx.fillStyle = bottomGrad
        ctx.fill()

        ctx.font = '600 18px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('✨ 24+ 实用工具，一键即达', 250, 355)

        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: 500,
            height: 400,
            destWidth: 500,
            destHeight: 400,
            fileType: 'png',
            quality: 1,
            success: (res) => {
              if (res.tempFilePath) {
                appInstance.globalData.sharePosterPath = res.tempFilePath
                this.setData({ sharePosterPath: res.tempFilePath })
              }
            }
          }, this)
        }, 100)
      })
  }
}
