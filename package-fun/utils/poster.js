var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')

var CANVAS_ID = 'funPosterCanvas'
var _sessionCache = {}

var Poster = {
  setupForPage: function(pageInstance) {
    var app = getApp()
    app.globalData.toolPosterPath = ''

    var cached = _sessionCache['funHome'] || ''
    if (cached) {
      app.globalData.toolPosterPath = cached
      pageInstance.setData({ _posterPath: cached })
      return
    }

    Poster._drawOnCanvas(pageInstance, function(path) {
      if (path) {
        _sessionCache['funHome'] = path
        app.globalData.toolPosterPath = path
        pageInstance.setData({ _posterPath: path })
      }
    })
  },

  getShareConfig: function(title, path) {
    var taskInfo = points.getDailyTasks()
    var shareTaskCompleted = false
    for (var i = 0; i < taskInfo.tasks.length; i++) {
      if (taskInfo.tasks[i].id === 'share_once' && taskInfo.tasks[i].completed) {
        shareTaskCompleted = true
        break
      }
    }
    if (!shareTaskCompleted) {
      try { points.recordShare() } catch(e) {}
    }
    var app = getApp()
    var imageUrl = app.globalData.toolPosterPath || ''
    return {
      title: title,
      path: path,
      imageUrl: imageUrl
    }
  },

  getTimelineConfig: function(title) {
    var taskInfo = points.getDailyTasks()
    var shareTaskCompleted = false
    for (var i = 0; i < taskInfo.tasks.length; i++) {
      if (taskInfo.tasks[i].id === 'share_once' && taskInfo.tasks[i].completed) {
        shareTaskCompleted = true
        break
      }
    }
    if (!shareTaskCompleted) {
      try { points.recordShare() } catch(e) {}
    }
    var app = getApp()
    var imageUrl = app.globalData.toolPosterPath || ''
    return {
      title: title,
      imageUrl: imageUrl
    }
  },

  _drawOnCanvas: function(pageInstance, callback, _retryCount) {
    try {
      var query = wx.createSelectorQuery().in(pageInstance)
      query.select('#' + CANVAS_ID).fields({ node: true, size: true }).exec(function(res) {
        if (!res || !res[0] || !res[0].node) {
          var retry = (_retryCount || 0) + 1
          if (retry <= 3) {
            setTimeout(function() {
              Poster._drawOnCanvas(pageInstance, callback, retry)
            }, 300 * retry)
          } else {
            if (callback) callback('')
          }
          return
        }
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = 2
        try { dpr = wx.getWindowInfo().pixelRatio } catch(e) { dpr = 2 }
        if (dpr > 3) dpr = 3

        var W = 500
        var H = 640
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)

        Poster._drawBackground(ctx, W, H)
        Poster._drawTitle(ctx, W, H)
        Poster._drawGameCards(ctx, W, H)
        Poster._drawChallengeBar(ctx, W, H)
        Poster._drawBottom(ctx, W, H)

        setTimeout(function() {
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: W,
            height: H,
            destWidth: W * 2,
            destHeight: H * 2,
            fileType: 'png',
            quality: 1,
            success: function(result) {
              if (callback) callback(result.tempFilePath || '')
            },
            fail: function() {
              if (callback) callback('')
            }
          })
        }, 200)
      })
    } catch(e) {
      if (callback) callback('')
    }
  },

  _drawBackground: function(ctx, W, H) {
    // 深色渐变背景
    var bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, '#1a1a2e')
    bgGrad.addColorStop(0.5, '#16213e')
    bgGrad.addColorStop(1, '#0f3460')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // 装饰光圈 - 左上角暖色
    ctx.globalAlpha = 0.15
    var glow1 = ctx.createRadialGradient(80, 60, 0, 80, 60, 150)
    glow1.addColorStop(0, '#F59E0B')
    glow1.addColorStop(1, 'rgba(245,158,11,0)')
    ctx.fillStyle = glow1
    ctx.fillRect(0, 0, 250, 220)

    // 装饰光圈 - 右侧紫色
    ctx.globalAlpha = 0.12
    var glow2 = ctx.createRadialGradient(420, 180, 0, 420, 180, 130)
    glow2.addColorStop(0, '#8B5CF6')
    glow2.addColorStop(1, 'rgba(139,92,246,0)')
    ctx.fillStyle = glow2
    ctx.fillRect(280, 50, 220, 260)

    // 装饰光圈 - 底部蓝色
    ctx.globalAlpha = 0.10
    var glow3 = ctx.createRadialGradient(250, 380, 0, 250, 380, 160)
    glow3.addColorStop(0, '#3B82F6')
    glow3.addColorStop(1, 'rgba(59,130,246,0)')
    ctx.fillStyle = glow3
    ctx.fillRect(80, 220, 340, 180)

    // 星星装饰
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#FFFFFF'
    var stars = [[50, 30], [150, 20], [280, 45], [400, 25], [460, 70], [30, 120], [470, 150], [120, 350], [380, 360]]
    for (var i = 0; i < stars.length; i++) {
      ctx.beginPath()
      ctx.arc(stars[i][0], stars[i][1], 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  },

  _drawTitle: function(ctx, W, H) {
    // 大脑图标
    ctx.font = '52px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🧠', W / 2, 55)

    // 标题
    ctx.font = 'bold 30px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('益智工具库', W / 2, 105)

    // 副标题
    ctx.font = '14px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText('脑力测试 · 放松解压 · 挑战自我', W / 2, 132)
  },

  _drawGameCards: function(ctx, W, H) {
    // 11个游戏卡片 - 6行2列（最后一行1个居中）
    var cards = [
      { icon: '⚡', name: '反应速度', color1: '#F59E0B', color2: '#D97706' },
      { icon: '🎨', name: '色彩记忆', color1: '#8B5CF6', color2: '#7C3AED' },
      { icon: '🔢', name: '数字猜谜', color1: '#3B82F6', color2: '#2563EB' },
      { icon: '🃏', name: '记忆翻牌', color1: '#EC4899', color2: '#DB2777' },
      { icon: '👆', name: '疯狂点击', color1: '#EF4444', color2: '#DC2626' },
      { icon: '💣', name: '扫雷', color1: '#6B7280', color2: '#374151' },
      { icon: '🧩', name: '数字华容道', color1: '#10B981', color2: '#047857' },
      { icon: '🏰', name: '迷宫', color1: '#7C3AED', color2: '#5B21B6' },
      { icon: '👁', name: '视力测试', color1: '#059669', color2: '#065F46' },
      { icon: '🔮', name: '心理测试', color1: '#DB2777', color2: '#9D174D' }
    ]

    var cardW = 140
    var cardH = 60
    var gapX = 20
    var gapY = 10

    // 2列居中
    var totalW = cardW * 2 + gapX
    var startX = (W - totalW) / 2
    var startY = 155

    for (var i = 0; i < cards.length; i++) {
      var row = Math.floor(i / 2)
      var col = i % 2
      var cx = startX + col * (cardW + gapX)
      var cy = startY + row * (cardH + gapY)
      Poster._drawMiniCard(ctx, cx, cy, cardW, cardH, cards[i])
    }
  },

  _drawMiniCard: function(ctx, cx, cy, cardW, cardH, card) {
    // Card background
    ctx.globalAlpha = 0.12
    ctx.fillStyle = card.color1
    Poster._roundRect(ctx, cx, cy, cardW, cardH, 10)
    ctx.fill()
    ctx.globalAlpha = 1

    // Card border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    Poster._roundRect(ctx, cx, cy, cardW, cardH, 10)
    ctx.stroke()

    // Icon circle
    ctx.globalAlpha = 0.25
    var iconGrad = ctx.createLinearGradient(cx + 14, cy + 12, cx + 42, cy + 40)
    iconGrad.addColorStop(0, card.color1)
    iconGrad.addColorStop(1, card.color2)
    ctx.fillStyle = iconGrad
    ctx.beginPath()
    ctx.arc(cx + 28, cy + cardH / 2, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Icon
    ctx.font = '15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(card.icon, cx + 28, cy + cardH / 2)

    // Name
    ctx.font = 'bold 12px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.fillText(card.name, cx + 52, cy + cardH / 2)
  },

  _drawChallengeBar: function(ctx, W, H) {
    // 挑战口号横条
    var barY = 585
    var barH = 32
    var barW = 360

    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#F59E0B'
    Poster._roundRect(ctx, (W - barW) / 2, barY, barW, barH, 18)
    ctx.fill()
    ctx.globalAlpha = 1

    // 横条边框
    ctx.strokeStyle = 'rgba(245,158,11,0.3)'
    ctx.lineWidth = 1
    Poster._roundRect(ctx, (W - barW) / 2, barY, barW, barH, 18)
    ctx.stroke()

    ctx.font = '13px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FCD34D'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🔥 你敢来挑战吗？测测你的脑力极限！', W / 2, barY + barH / 2)
  },

  _drawBottom: function(ctx, W, H) {
    // CTA 按钮
    var btnY = 628
    var btnW = 200
    var btnH = 40
    var btnGrad = ctx.createLinearGradient(W / 2 - btnW / 2, btnY, W / 2 + btnW / 2, btnY + btnH)
    btnGrad.addColorStop(0, '#F59E0B')
    btnGrad.addColorStop(1, '#D97706')
    Poster._roundRect(ctx, W / 2 - btnW / 2, btnY, btnW, btnH, 20)
    ctx.fillStyle = btnGrad
    ctx.fill()

    ctx.font = '600 15px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#78350F'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✨ 立即挑战', W / 2, btnY + btnH / 2)

    // 底部品牌
    ctx.font = '11px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillText('🧰 百宝工具箱 · 即用即走', W / 2, H - 14)
  },

  _roundRect: function(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  },

  clearCache: function() {
    _sessionCache = {}
  },

  // 挑战结果海报 - 供各游戏工具调用
  RESULT_CANVAS_ID: 'resultPosterCanvas',

  setupForResult: function(pageInstance, resultData) {
    var app = getApp()
    app.globalData.toolPosterPath = ''

    // 先弹出结果卡片
    pageInstance.setData({
      showResultModal: true,
      _resultData: resultData,
      _posterPath: ''
    })

    Poster._drawResultOnCanvas(pageInstance, resultData, function(path) {
      if (path) {
        app.globalData.toolPosterPath = path
        pageInstance.setData({ _posterPath: path })
      }
    })
  },

  hideResultModal: function(pageInstance) {
    pageInstance.setData({ showResultModal: false })
  },

  _drawResultOnCanvas: function(pageInstance, resultData, callback, _retryCount) {
    try {
      var query = wx.createSelectorQuery().in(pageInstance)
      query.select('#' + Poster.RESULT_CANVAS_ID).fields({ node: true, size: true }).exec(function(res) {
        if (!res || !res[0] || !res[0].node) {
          var retry = (_retryCount || 0) + 1
          if (retry <= 3) {
            setTimeout(function() {
              Poster._drawResultOnCanvas(pageInstance, resultData, callback, retry)
            }, 300 * retry)
          } else {
            if (callback) callback('')
          }
          return
        }
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = 2
        try { dpr = wx.getWindowInfo().pixelRatio } catch(e) { dpr = 2 }
        if (dpr > 3) dpr = 3

        var W = 420
        var H = 560
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)

        Poster._drawResultBackground(ctx, W, H, resultData)
        Poster._drawResultContent(ctx, W, H, resultData)

        setTimeout(function() {
          wx.canvasToTempFilePath({
            canvas: canvas,
            width: W,
            height: H,
            destWidth: W * 2,
            destHeight: H * 2,
            fileType: 'png',
            quality: 1,
            success: function(result) {
              if (callback) callback(result.tempFilePath || '')
            },
            fail: function() {
              if (callback) callback('')
            }
          })
        }, 200)
      })
    } catch(e) {
      if (callback) callback('')
    }
  },

  _drawResultBackground: function(ctx, W, H, data) {
    var bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, '#1a1a2e')
    bgGrad.addColorStop(0.5, '#16213e')
    bgGrad.addColorStop(1, '#0f3460')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // 装饰光圈
    ctx.globalAlpha = 0.15
    var glow1 = ctx.createRadialGradient(80, 80, 0, 80, 80, 140)
    glow1.addColorStop(0, data.color1 || '#F59E0B')
    glow1.addColorStop(1, 'rgba(245,158,11,0)')
    ctx.fillStyle = glow1
    ctx.fillRect(0, 0, 250, 220)

    ctx.globalAlpha = 0.12
    var glow2 = ctx.createRadialGradient(340, 400, 0, 340, 400, 140)
    glow2.addColorStop(0, data.color2 || '#8B5CF6')
    glow2.addColorStop(1, 'rgba(139,92,246,0)')
    ctx.fillStyle = glow2
    ctx.fillRect(200, 280, 220, 240)

    // 星星
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#FFFFFF'
    var stars = [[40, 25], [130, 18], [260, 40], [380, 22], [450, 65], [25, 110], [390, 130]]
    for (var i = 0; i < stars.length; i++) {
      ctx.beginPath()
      ctx.arc(stars[i][0], stars[i][1], 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  },

  _drawResultContent: function(ctx, W, H, data) {
    // 图标
    ctx.font = '48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(data.icon || '🧠', W / 2, 60)

    // 游戏名称
    ctx.font = 'bold 26px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(data.title || '益智工具库', W / 2, 110)

    // 分割线
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, 135)
    ctx.lineTo(W - 60, 135)
    ctx.stroke()

    // 核心成绩 - 大号显示
    if (data.mainScore) {
      ctx.font = 'bold 52px -apple-system, system-ui, sans-serif'
      var scoreGrad = ctx.createLinearGradient(W / 2 - 80, 170, W / 2 + 80, 170)
      scoreGrad.addColorStop(0, data.color1 || '#F59E0B')
      scoreGrad.addColorStop(1, data.color2 || '#D97706')
      ctx.fillStyle = scoreGrad
      ctx.fillText(data.mainScore, W / 2, 185)

      ctx.font = '14px -apple-system, system-ui, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText(data.mainScoreLabel || '', W / 2, 220)
    }

    // 评级
    if (data.rating) {
      ctx.font = 'bold 20px -apple-system, system-ui, sans-serif'
      ctx.fillStyle = '#FCD34D'
      ctx.fillText(data.rating, W / 2, 260)
    }

    // 详细数据卡片
    if (data.details && data.details.length > 0) {
      var cardY = 290
      var cardH = 36
      var cardGap = 8
      var cardW = 280

      for (var i = 0; i < data.details.length; i++) {
        var cy = cardY + i * (cardH + cardGap)
        // 卡片背景
        ctx.globalAlpha = 0.08
        ctx.fillStyle = '#FFFFFF'
        Poster._roundRect(ctx, (W - cardW) / 2, cy, cardW, cardH, 8)
        ctx.fill()
        ctx.globalAlpha = 1

        // 标签
        ctx.font = '13px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.textAlign = 'left'
        ctx.fillText(data.details[i].label, (W - cardW) / 2 + 16, cy + cardH / 2)

        // 值
        ctx.font = 'bold 14px -apple-system, system-ui, sans-serif'
        ctx.fillStyle = '#FFFFFF'
        ctx.textAlign = 'right'
        ctx.fillText(data.details[i].value, (W + cardW) / 2 - 16, cy + cardH / 2)
      }
    }

    // 挑战口号
    var barY = 470
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#F59E0B'
    Poster._roundRect(ctx, (W - 300) / 2, barY, 300, 28, 14)
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.font = '12px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FCD34D'
    ctx.textAlign = 'center'
    ctx.fillText('🔥 你能超越我吗？来挑战试试！', W / 2, barY + 14)

    // CTA 按钮
    var btnY = 510
    var btnW = 180
    var btnH = 36
    var btnGrad = ctx.createLinearGradient(W / 2 - btnW / 2, btnY, W / 2 + btnW / 2, btnY + btnH)
    btnGrad.addColorStop(0, data.color1 || '#F59E0B')
    btnGrad.addColorStop(1, data.color2 || '#D97706')
    Poster._roundRect(ctx, W / 2 - btnW / 2, btnY, btnW, btnH, 18)
    ctx.fillStyle = btnGrad
    ctx.fill()

    ctx.font = '600 14px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✨ 来挑战', W / 2, btnY + btnH / 2)

    // 底部品牌
    ctx.font = '10px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillText('🧰 百宝工具箱 · 益智工具库', W / 2, H - 12)
  }
}

module.exports = Poster
