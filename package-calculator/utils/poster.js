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
      1: [{ icon: '💱', text: '实时汇率' }, { icon: '📊', text: '历史趋势' }, { icon: '🔄', text: '双向换算' }, { icon: '💰', text: '多币种' }],
      2: [{ icon: '📏', text: '长度转换' }, { icon: '⚖️', text: '重量转换' }, { icon: '🌡️', text: '温度转换' }, { icon: '🔄', text: '双向换算' }],
      3: [{ icon: '🏠', text: '等额本息' }, { icon: '📉', text: '等额本金' }, { icon: '📋', text: '还款明细' }, { icon: '💾', text: '方案对比' }],
      4: [{ icon: '💵', text: '快速分账' }, { icon: '🧾', text: '自定义比例' }, { icon: '📊', text: '多人AA' }, { icon: '🔄', text: '精确计算' }],
      5: [{ icon: '🔢', text: '精确统计' }, { icon: '📝', text: '中英混排' }, { icon: '📊', text: '阅读时间' }, { icon: '🔄', text: '实时统计' }],
      6: [{ icon: '🔤', text: '大小写' }, { icon: '🔄', text: '驼峰转换' }, { icon: '📋', text: '一键复制' }, { icon: '⚡', text: '批量处理' }],
      7: [{ icon: '🔐', text: '编码解码' }, { icon: '📝', text: '文本处理' }, { icon: '📋', text: '一键复制' }, { icon: '⚡', text: '实时转换' }],
      8: [{ icon: '📱', text: '生成二维码' }, { icon: '📷', text: '扫码识别' }, { icon: '🎨', text: '自定义配色' }, { icon: '💾', text: '保存相册' }],
      9: [{ icon: '🍅', text: '25分钟专注' }, { icon: '⏱️', text: '自定义时长' }, { icon: '📊', text: '今日统计' }, { icon: '🔔', text: '完成提醒' }],
      10: [{ icon: '💧', text: '喝水提醒' }, { icon: '📊', text: '每日统计' }, { icon: '🔔', text: '定时提醒' }, { icon: '💪', text: '健康目标' }],
      11: [{ icon: '🎲', text: '随机决策' }, { icon: '📝', text: '自定义选项' }, { icon: '🔄', text: '公平随机' }, { icon: '⚡', text: '快速选择' }],
      12: [{ icon: '🗑️', text: '垃圾分类' }, { icon: '🔍', text: '快速搜索' }, { icon: '📋', text: '分类指南' }, { icon: '♻️', text: '环保提示' }],
      13: [{ icon: '📅', text: '日期推算' }, { icon: '⏱️', text: '间隔计算' }, { icon: '🔄', text: '双向计算' }, { icon: '📋', text: '详细结果' }],
      14: [{ icon: '⏳', text: '倒计时' }, { icon: '📅', text: '自定义日期' }, { icon: '🔔', text: '到期提醒' }, { icon: '📊', text: '进度显示' }],
      15: [{ icon: '🌍', text: '多城市' }, { icon: '🕐', text: '实时时间' }, { icon: '📋', text: '自定义添加' }, { icon: '🔄', text: '自动更新' }],
      16: [{ icon: '🎂', text: '精确年龄' }, { icon: '📅', text: '下次生日' }, { icon: '⏱️', text: '生活天数' }, { icon: '🐾', text: '生肖星座' }],
      17: [{ icon: '📋', text: '格式化' }, { icon: '🔍', text: '语法高亮' }, { icon: '✏️', text: '压缩解压' }, { icon: '💾', text: '历史记录' }],
      18: [{ icon: '🎨', text: '颜色转换' }, { icon: '📋', text: '多格式' }, { icon: '🔍', text: '颜色选取' }, { icon: '⚡', text: '实时预览' }],
      19: [{ icon: '🔗', text: 'URL编码' }, { icon: '📝', text: '解码工具' }, { icon: '📋', text: '一键复制' }, { icon: '⚡', text: '实时转换' }],
      20: [{ icon: '✨', text: '正则测试' }, { icon: '🔍', text: '实时匹配' }, { icon: '🎨', text: '高亮显示' }, { icon: '📋', text: '常用模板' }],
      21: [{ icon: '🖼️', text: '图片压缩' }, { icon: '✂️', text: '裁剪旋转' }, { icon: '🔄', text: '格式转换' }, { icon: '📊', text: '信息查看' }],
      22: [{ icon: '🔐', text: '密码生成' }, { icon: '⚙️', text: '自定义规则' }, { icon: '📋', text: '一键复制' }, { icon: '💪', text: '安全强度' }],
      23: [{ icon: '⚖️', text: 'BMI计算' }, { icon: '📊', text: '健康评估' }, { icon: '📋', text: '体重记录' }, { icon: '💪', text: '健康建议' }],
      24: [{ icon: '🔍', text: '逐行对比' }, { icon: '🎨', text: '差异高亮' }, { icon: '📋', text: '快速定位' }, { icon: '⚡', text: '实时对比' }],
      25: [{ icon: '💰', text: '个税计算' }, { icon: '📊', text: '税率表' }, { icon: '📋', text: '五险一金' }, { icon: '💹', text: '到手工资' }],
      26: [{ icon: '🧮', text: '科学运算' }, { icon: '📐', text: '三角函数' }, { icon: '📜', text: '历史记录' }, { icon: '🔄', text: '实时计算' }],
      27: [{ icon: '📏', text: '精确测量' }, { icon: '📐', text: '校准功能' }, { icon: '🔄', text: '单位切换' }, { icon: '📱', text: '屏幕适配' }],
      28: [{ icon: '⏱️', text: '时间戳转换' }, { icon: '📅', text: '日期互转' }, { icon: '🌍', text: '多时区' }, { icon: '📋', text: '当前时间戳' }],
      29: [{ icon: '👨‍👩‍👧', text: '亲戚称谓' }, { icon: '📋', text: '快速查询' }, { icon: '🔄', text: '双向查找' }, { icon: '📚', text: '完整族谱' }],
      30: [{ icon: '🎧', text: '自然音效' }, { icon: '🎵', text: '混合播放' }, { icon: '⏱️', text: '定时关闭' }, { icon: '😴', text: '助眠专注' }],
      31: [{ icon: '🧭', text: '方向指引' }, { icon: '📐', text: '角度显示' }, { icon: '📍', text: '经纬度' }, { icon: '🔄', text: '实时更新' }],
      32: [{ icon: '🎬', text: '全屏弹幕' }, { icon: '🎨', text: '自定义样式' }, { icon: '⚡', text: '实时发送' }, { icon: '📢', text: '应援打call' }],
      33: [{ icon: '🎭', text: '模板制作' }, { icon: '✏️', text: '文字编辑' }, { icon: '💾', text: '保存分享' }, { icon: '🎨', text: '自定义样式' }],
      34: [{ icon: '🔄', text: '进制转换' }, { icon: '📋', text: '多进制' }, { icon: '⚡', text: '实时转换' }, { icon: '💾', text: '历史记录' }],
      35: [{ icon: '🏦', text: '提前还款' }, { icon: '📉', text: '节省利息' }, { icon: '📋', text: '方案对比' }, { icon: '💰', text: '缩短期限' }],
      36: [{ icon: '🌐', text: 'IP查询' }, { icon: '📍', text: '归属地' }, { icon: '🏢', text: '运营商' }, { icon: '📋', text: '历史记录' }],
      37: [{ icon: '📡', text: '编码解码' }, { icon: '⚡', text: '实时转换' }, { icon: '📖', text: '对照表' }, { icon: '📋', text: '一键复制' }],
      38: [{ icon: '📐', text: '三角函数' }, { icon: '🔄', text: '角度弧度' }, { icon: '📊', text: '反函数' }, { icon: '📋', text: '完整结果' }],
      39: [{ icon: '🧮', text: '位运算' }, { icon: '📊', text: '可视化' }, { icon: '🔄', text: '多进制' }, { icon: '⚡', text: '实时计算' }],
      40: [{ icon: '📒', text: '收支记录' }, { icon: '📊', text: '月度统计' }, { icon: '📈', text: '趋势图表' }, { icon: '💰', text: '分类管理' }],
      53: [{ icon: '⛽', text: '油耗计算' }, { icon: '💰', text: '费用估算' }, { icon: '📊', text: '历史记录' }, { icon: '🔄', text: '多种模式' }]
    }
    return featureMap[toolInfo.id] || [{ icon: '⚡', text: '快速' }, { icon: '🎯', text: '精准' }, { icon: '📋', text: '便捷' }, { icon: '🔄', text: '实用' }]
  },

  clearCache: function() {
    _sessionCache = {}
  }
}

module.exports = Poster
