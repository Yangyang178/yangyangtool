var storageUtil = require('../../utils/storage.js')
var toolsData = require('../../data/tools.js')
var points = require('../../utils/points.js')

var CANVAS_ID = 'toolPosterCanvas'
var _sessionCache = {}

var Poster = {
  setupForPage: function(pageInstance, toolId) {
    var app = getApp()
    app.globalData.toolPosterPath = ''

    var tool = toolsData.getToolById(toolId)
    if (!tool) return

    var cached = _sessionCache[toolId] || ''
    if (cached) {
      app.globalData.toolPosterPath = cached
      pageInstance.setData({ _posterPath: cached })
      return
    }

    var toolInfo = {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      icon: tool.icon,
      category: tool.category
    }

    Poster._drawOnCanvas(pageInstance, toolInfo, function(path) {
      if (path) {
        _sessionCache[toolId] = path
        app.globalData.toolPosterPath = path
        pageInstance.setData({ _posterPath: path })
      }
    })
  },

  getShareConfig: function(title, path, desc) {
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
    var config = {
      title: title,
      path: path,
      imageUrl: imageUrl
    }
    if (desc) {
      config.desc = desc
    }
    return config
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

  _drawOnCanvas: function(pageInstance, toolInfo, callback, _retryCount) {
    try {
      var query = wx.createSelectorQuery().in(pageInstance)
      query.select('#' + CANVAS_ID).fields({ node: true, size: true }).exec(function(res) {
        if (!res || !res[0] || !res[0].node) {
          var retry = (_retryCount || 0) + 1
          if (retry <= 3) {
            setTimeout(function() {
              Poster._drawOnCanvas(pageInstance, toolInfo, callback, retry)
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
        var H = 400
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)

        Poster._drawBackground(ctx, W, H, toolInfo)
        Poster._drawToolInfo(ctx, W, H, toolInfo)
        Poster._drawFeatures(ctx, W, H, toolInfo)
        Poster._drawBottom(ctx, W, H, toolInfo)

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

  _drawBackground: function(ctx, W, H, toolInfo) {
    var themeColors = Poster._getThemeColors(toolInfo.category)
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, W, H)

    var topGrad = ctx.createLinearGradient(0, 0, W, H * 0.55)
    topGrad.addColorStop(0, themeColors.dark)
    topGrad.addColorStop(1, '#0F172A')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, W, H * 0.55)

    ctx.globalAlpha = 0.12
    ctx.fillStyle = themeColors.primary
    ctx.beginPath()
    ctx.arc(W - 60, 50, 120, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(50, H * 0.45, 80, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 0.06
    ctx.fillStyle = themeColors.secondary
    ctx.beginPath()
    ctx.arc(W * 0.6, H * 0.35, 60, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  },

  _drawToolInfo: function(ctx, W, H, toolInfo) {
    ctx.font = '48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(toolInfo.icon || '🧰', W / 2, 80)

    ctx.font = 'bold 32px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(toolInfo.name || '百宝工具箱', W / 2, 140)

    ctx.font = '14px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    var desc = toolInfo.description || ''
    if (desc.length > 22) desc = desc.substring(0, 22) + '...'
    ctx.fillText(desc, W / 2, 172)
  },

  _drawFeatures: function(ctx, W, H, toolInfo) {
    var themeColors = Poster._getThemeColors(toolInfo.category)
    var features = Poster._getFeatures(toolInfo)
    if (features.length === 0) return

    var cardX = 35
    var cardY = 200
    var cardW = W - 70
    var cardH = 100

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    Poster._roundRect(ctx, cardX, cardY, cardW, cardH, 16)
    ctx.fill()

    var cols = features.length > 3 ? 4 : features.length
    var itemW = cardW / cols
    for (var i = 0; i < features.length && i < 4; i++) {
      var fx = cardX + itemW * i + itemW / 2
      var fy = cardY + cardH / 2

      ctx.globalAlpha = 0.15
      ctx.fillStyle = themeColors.primary
      ctx.beginPath()
      ctx.arc(fx, fy - 8, 22, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(features[i].icon, fx, fy - 8)

      ctx.font = '11px -apple-system, system-ui, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText(features[i].text, fx, fy + 22)
    }
  },

  _drawBottom: function(ctx, W, H, toolInfo) {
    var themeColors = Poster._getThemeColors(toolInfo.category)
    var bottomY = 325

    var btnGrad = ctx.createLinearGradient(W / 2 - 100, bottomY, W / 2 + 100, bottomY + 40)
    btnGrad.addColorStop(0, themeColors.primary)
    btnGrad.addColorStop(1, themeColors.dark)
    Poster._roundRect(ctx, W / 2 - 120, bottomY, 240, 40, 20)
    ctx.fillStyle = btnGrad
    ctx.fill()

    ctx.font = '600 16px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✨ 立即体验', W / 2, bottomY + 20)

    ctx.font = '11px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText('🧰 百宝工具箱 · 即用即走', W / 2, H - 18)
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

  _getThemeColors: function(category) {
    var themes = {
      calculator: { primary: '#10B981', secondary: '#34D399', dark: '#065F46' },
      text: { primary: '#8B5CF6', secondary: '#A78BFA', dark: '#4C1D95' },
      datetime: { primary: '#F59E0B', secondary: '#FBBF24', dark: '#92400E' },
      life: { primary: '#3B82F6', secondary: '#60A5FA', dark: '#1E3A8A' },
      office: { primary: '#06B6D4', secondary: '#22D3EE', dark: '#164E63' },
      dev: { primary: '#EF4444', secondary: '#F87171', dark: '#7F1D1D' }
    }
    return themes[category] || themes.dev
  },

  _getFeatures: function(toolInfo) {
    var featureMap = {
      50: [{ icon: '🖼️', text: '九宫格切图' }, { icon: '📐', text: '3/6/9宫格' }, { icon: '🎨', text: '圆角边框' }, { icon: '💾', text: '保存相册' }],
      51: [{ icon: '🖼️', text: '多图拼接' }, { icon: '📏', text: '长图合成' }, { icon: '🔄', text: '横向纵向' }, { icon: '💾', text: '保存相册' }]
    }
    return featureMap[toolInfo.id] || [{ icon: '⚡', text: '快速' }, { icon: '🎯', text: '精准' }, { icon: '📋', text: '便捷' }, { icon: '🔄', text: '实用' }]
  },

  clearCache: function() {
    _sessionCache = {}
  }
}

module.exports = Poster
