var app = getApp()
var points = require('../../utils/points.js')
var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var contentSecurity = require('../utils/content-security.js')

var CANVAS_SIZE = 600

var HOT_TEMPLATES = [
  { id: 'ht_no_listen', name: '我不听', enName: "I Won't Listen", emoji: '🙉', bgColor: '#FFB6C1', topText: '', bottomText: '我不听我不听！', enTopText: '', enBottomText: "I won't listen!" },
  { id: 'ht_so_good', name: '真香', enName: 'So Good', emoji: '😋', bgColor: '#FFF9C4', topText: '我绝对不会...', bottomText: '真香！', enTopText: 'I would never...', enBottomText: 'So good!' },
  { id: 'ht_awesome', name: '太强了', enName: 'Awesome', emoji: '💪', bgColor: '#E65100', topText: '', bottomText: '太强了！', enTopText: '', enBottomText: 'Awesome!' },
  { id: 'ht_confused', name: '什么鬼', enName: 'What?', emoji: '🤨', bgColor: '#E3F2FD', topText: '', bottomText: '什么鬼？？', enTopText: '', enBottomText: 'What??' },
  { id: 'ht_cry_laugh', name: '笑死', enName: 'LOL', emoji: '😂', bgColor: '#FFF9C4', topText: '', bottomText: '笑死我了哈哈哈', enTopText: '', enBottomText: 'LOL hahaha' },
  { id: 'ht_angry', name: '气死了', enName: 'So Mad', emoji: '😡', bgColor: '#FCE4EC', topText: '气死了！', bottomText: '', enTopText: 'So mad!', enBottomText: '' },
  { id: 'ht_ok', name: '好的呢', enName: 'Okay~', emoji: '😊', bgColor: '#E8F5E9', topText: '', bottomText: '好的呢~', enTopText: '', enBottomText: 'Okay~' },
  { id: 'ht_no_way', name: '不可能', enName: 'No Way', emoji: '🚫', bgColor: '#37474F', topText: '', bottomText: '绝对不可能！', enTopText: '', enBottomText: 'No way!' },
  { id: 'ht_help', name: '救命', enName: 'Help!', emoji: '🆘', bgColor: '#B71C1C', topText: '', bottomText: '救命啊！！', enTopText: '', enBottomText: 'Help me!!' },
  { id: 'ht_peace', name: '佛系', enName: 'Chill', emoji: '🧘', bgColor: '#E8EAF6', topText: '', bottomText: '随缘吧...', enTopText: '', enBottomText: 'Whatever...' },
  { id: 'ht_rich', name: '暴富', enName: 'Rich', emoji: '💰', bgColor: '#FFD700', topText: '', bottomText: '我要暴富！', enTopText: '', enBottomText: 'I wanna be rich!' },
  { id: 'ht_sleepy', name: '困了', enName: 'Sleepy', emoji: '😴', bgColor: '#1A237E', topText: '', bottomText: '困了，先睡了', enTopText: '', enBottomText: 'Sleepy, gonna sleep' }
]

var STICKER_LIST = [
  '⭐', '❤️', '🔥', '✨', '💯', '🎉', '👑', '💎',
  '🌈', '🌸', '🍀', '☀️', '🌙', '⚡', '💫', '🎀',
  '🏆', '🎯', '🚀', '💡', '🎵', '❄️', '🌺', '🦋',
  '💪', '👍', '👎', '👊', '✌️', '🤝', '👋', '🙌',
  '💖', '💝', '💔', '💕', '💗', '💓', '💞', '💘'
]

Page({
  data: {
    i18n: {},
    templates: [
      { id: 'doge', name: 'Doge', enName: 'Doge', emoji: '🐕', bgColor: '#F5DEB3' },
      { id: 'sadfrog', name: '悲伤蛙', enName: 'Sad Frog', emoji: '🐸', bgColor: '#4CAF50' },
      { id: 'panda', name: '熊猫头', enName: 'Panda', emoji: '🐼', bgColor: '#E0E0E0' },
      { id: 'cat', name: '猫咪', enName: 'Cat', emoji: '🐱', bgColor: '#FFB6C1' },
      { id: 'monkey', name: '猴子', enName: 'Monkey', emoji: '🐵', bgColor: '#D2691E' },
      { id: 'laughcry', name: '笑哭', enName: 'Laugh Cry', emoji: '😂', bgColor: '#FFF9C4' },
      { id: 'doghead', name: '狗头', enName: 'Dog Head', emoji: '🐶', bgColor: '#FFE0B2' },
      { id: 'think', name: '思考', enName: 'Thinking', emoji: '🤔', bgColor: '#E3F2FD' },
      { id: 'shock', name: '震惊', enName: 'Shocked', emoji: '😱', bgColor: '#FCE4EC' },
      { id: 'clown', name: '小丑', enName: 'Clown', emoji: '🤡', bgColor: '#F3E5F5' },
      { id: 'skull', name: '骷髅', enName: 'Skull', emoji: '💀', bgColor: '#37474F' },
      { id: 'alien', name: '外星人', enName: 'Alien', emoji: '👽', bgColor: '#1B5E20' },
      { id: 'pig', name: '猪猪', enName: 'Piggy', emoji: '🐷', bgColor: '#F8BBD0' },
      { id: 'rabbit', name: '兔子', enName: 'Rabbit', emoji: '🐰', bgColor: '#F3E5F5' },
      { id: 'penguin', name: '企鹅', enName: 'Penguin', emoji: '🐧', bgColor: '#1A237E' },
      { id: 'fox', name: '狐狸', enName: 'Fox', emoji: '🦊', bgColor: '#FF6F00' },
      { id: 'dino', name: '恐龙', enName: 'Dino', emoji: '🦕', bgColor: '#2E7D32' },
      { id: 'bear', name: '小熊', enName: 'Bear', emoji: '🐻', bgColor: '#5D4037' },
      { id: 'owl', name: '猫头鹰', enName: 'Owl', emoji: '🦉', bgColor: '#3E2723' },
      { id: 'shark', name: '鲨鱼', enName: 'Shark', emoji: '🦈', bgColor: '#0D47A1' },
      { id: 'dragon', name: '龙', enName: 'Dragon', emoji: '🐉', bgColor: '#B71C1C' },
      { id: 'unicorn', name: '独角兽', enName: 'Unicorn', emoji: '🦄', bgColor: '#7B1FA2' },
      { id: 'fire', name: '火焰', enName: 'Fire', emoji: '🔥', bgColor: '#BF360C' },
      { id: 'heart', name: '爱心', enName: 'Heart', emoji: '❤️', bgColor: '#C62828' },
      { id: 'thumb', name: '点赞', enName: 'Thumbs Up', emoji: '👍', bgColor: '#1565C0' },
      { id: 'muscle', name: '加油', enName: 'Strong', emoji: '💪', bgColor: '#E65100' },
      { id: 'ok', name: 'OK', enName: 'OK', emoji: '👌', bgColor: '#00695C' },
      { id: 'cry', name: '大哭', enName: 'Crying', emoji: '😭', bgColor: '#0277BD' },
      { id: 'angry', name: '愤怒', enName: 'Angry', emoji: '😠', bgColor: '#B71C1C' },
      { id: 'cool', name: '墨镜', enName: 'Cool', emoji: '😎', bgColor: '#212121' },
      { id: 'poop', name: '便便', enName: 'Poop', emoji: '💩', bgColor: '#6D4C41' },
      { id: 'robot', name: '机器人', enName: 'Robot', emoji: '🤖', bgColor: '#455A64' },
      { id: 'ghost', name: '幽灵', enName: 'Ghost', emoji: '👻', bgColor: '#9575CD' },
      { id: 'devil', name: '恶魔', enName: 'Devil', emoji: '😈', bgColor: '#880E4F' },
      { id: 'angel', name: '天使', enName: 'Angel', emoji: '😇', bgColor: '#E8EAF6' },
      { id: 'custom', name: '自定义', enName: 'Custom', emoji: '🎨', bgColor: '#FFFFFF' }
    ],
    selectedTemplate: 'doge',
    topText: '',
    bottomText: '',
    fontSize: 40,
    fontColor: '#FFFFFF',
    strokeEnabled: true,
    strokeColor: '#000000',
    strokeColors: [
      { color: '#000000', name: '黑', enName: 'Black' },
      { color: '#FFFFFF', name: '白', enName: 'White' },
      { color: '#FF0000', name: '红', enName: 'Red' },
      { color: '#0000FF', name: '蓝', enName: 'Blue' },
      { color: '#FFD700', name: '金', enName: 'Gold' }
    ],
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowColors: [
      { color: '#000000', name: '黑', enName: 'Black' },
      { color: '#FF0000', name: '红', enName: 'Red' },
      { color: '#0000FF', name: '蓝', enName: 'Blue' },
      { color: '#FFD700', name: '金', enName: 'Gold' },
      { color: '#00FF00', name: '绿', enName: 'Green' }
    ],
    bgColor: '#F5DEB3',
    bgColors: ['#F5DEB3', '#4CAF50', '#E0E0E0', '#FFB6C1', '#D2691E', '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#FFE66D', '#2C3E50', '#8E44AD'],
    fontColors: [
      { color: '#FFFFFF', name: '白', enName: 'White' },
      { color: '#000000', name: '黑', enName: 'Black' },
      { color: '#FF0000', name: '红', enName: 'Red' },
      { color: '#FFE500', name: '黄', enName: 'Yellow' }
    ],
    previewEmoji: '🐕',
    previewBgColor: '#F5DEB3',
    isGenerating: false,
    customImagePath: '',

    hotTemplates: HOT_TEMPLATES,
    showHotTemplates: false,
    stickerList: STICKER_LIST,
    showStickers: false,
    activeStickers: [],
    selectedStickerIndex: -1,

    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    isLoading: true
  },

  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('表情包制作')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('memeMaker') })
    this._updateI18nData()
    poster.setupForPage(this, 33)
    this.setData({ isLoading: false })
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('memeMaker') })
    this._updateI18nData()
  },

  _updateI18nData: function() {
    var isEn = i18n.getLanguage() === 'en'
    var templates = this.data.templates
    var hotTemplates = this.data.hotTemplates
    var strokeColors = this.data.strokeColors
    var shadowColors = this.data.shadowColors
    var fontColors = this.data.fontColors
    var updateData = {}

    if (isEn) {
      var i
      var newTemplates = []
      for (i = 0; i < templates.length; i++) {
        var t = {}
        for (var k in templates[i]) {
          t[k] = templates[i][k]
        }
        if (t.enName) {
          t.name = t.enName
        }
        newTemplates.push(t)
      }
      updateData.templates = newTemplates

      var newHotTemplates = []
      for (i = 0; i < hotTemplates.length; i++) {
        var h = {}
        for (var k2 in hotTemplates[i]) {
          h[k2] = hotTemplates[i][k2]
        }
        if (h.enName) {
          h.name = h.enName
        }
        if (h.enTopText !== undefined) {
          h.topText = h.enTopText
        }
        if (h.enBottomText !== undefined) {
          h.bottomText = h.enBottomText
        }
        newHotTemplates.push(h)
      }
      updateData.hotTemplates = newHotTemplates

      var newStrokeColors = []
      for (i = 0; i < strokeColors.length; i++) {
        var sc = {}
        for (var k3 in strokeColors[i]) {
          sc[k3] = strokeColors[i][k3]
        }
        if (sc.enName) {
          sc.name = sc.enName
        }
        newStrokeColors.push(sc)
      }
      updateData.strokeColors = newStrokeColors

      var newShadowColors = []
      for (i = 0; i < shadowColors.length; i++) {
        var shc = {}
        for (var k4 in shadowColors[i]) {
          shc[k4] = shadowColors[i][k4]
        }
        if (shc.enName) {
          shc.name = shc.enName
        }
        newShadowColors.push(shc)
      }
      updateData.shadowColors = newShadowColors

      var newFontColors = []
      for (i = 0; i < fontColors.length; i++) {
        var fc = {}
        for (var k5 in fontColors[i]) {
          fc[k5] = fontColors[i][k5]
        }
        if (fc.enName) {
          fc.name = fc.enName
        }
        newFontColors.push(fc)
      }
      updateData.fontColors = newFontColors
    } else {
      updateData.templates = templates
      updateData.hotTemplates = hotTemplates
      updateData.strokeColors = strokeColors
      updateData.shadowColors = shadowColors
      updateData.fontColors = fontColors
    }

    this.setData(updateData)
  },

  onReady: function () {
    this.drawPreview()
    this._draggingIndex = -1
    this._dragOffsetX = 0
    this._dragOffsetY = 0
    this._canvasRect = null
    var that = this
    wx.createSelectorQuery().select('.preview-box').boundingClientRect(function(rect) {
      that._canvasRect = rect
    }).exec()
  },

  onTemplateTap: function (e) {
    var id = e.currentTarget.dataset.id
    var templates = this.data.templates
    var selected = null
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].id === id) {
        selected = templates[i]
        break
      }
    }
    if (!selected) return

    wx.vibrateShort({ type: 'light' })

    this.setData({
      selectedTemplate: id,
      previewEmoji: selected.emoji,
      previewBgColor: selected.bgColor,
      bgColor: selected.bgColor
    })
    this.drawPreview()
  },

  toggleHotTemplates: function() {
    this.setData({ showHotTemplates: !this.data.showHotTemplates })
  },

  onHotTemplateTap: function(e) {
    var id = e.currentTarget.dataset.id
    var tpl = null
    var hotTemplates = this.data.hotTemplates
    for (var i = 0; i < hotTemplates.length; i++) {
      if (hotTemplates[i].id === id) {
        tpl = hotTemplates[i]
        break
      }
    }
    if (!tpl) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      selectedTemplate: tpl.id,
      previewEmoji: tpl.emoji,
      previewBgColor: tpl.bgColor,
      bgColor: tpl.bgColor,
      topText: tpl.topText,
      bottomText: tpl.bottomText
    })
    this.drawPreview()
  },

  toggleStickers: function() {
    this.setData({ showStickers: !this.data.showStickers })
  },

  onStickerTap: function(e) {
    var emoji = e.currentTarget.dataset.emoji
    var stickers = this.data.activeStickers.slice()
    stickers.push({
      emoji: emoji,
      x: 80 + Math.random() * 140,
      y: 80 + Math.random() * 140,
      size: 60
    })
    this.setData({ activeStickers: stickers })
    this.drawPreview()
  },

  onStickerSizeChange: function(e) {
    var idx = e.currentTarget.dataset.index
    var size = Number(e.detail.value)
    var stickers = this.data.activeStickers.slice()
    if (stickers[idx]) {
      stickers[idx].size = size
      this.setData({ activeStickers: stickers })
      this.drawPreview()
    }
  },

  onPreviewTouchStart: function(e) {
    if (this.data.activeStickers.length === 0) return
    var rect = this._canvasRect
    if (!rect) return
    var touch = e.touches[0]
    var px = (touch.clientX - rect.left) / rect.width * 300
    var py = (touch.clientY - rect.top) / rect.height * 300
    var stickers = this.data.activeStickers
    var hitIndex = -1
    for (var i = stickers.length - 1; i >= 0; i--) {
      var s = stickers[i]
      var half = s.size / 4
      if (px >= s.x - half && px <= s.x + half && py >= s.y - half && py <= s.y + half) {
        hitIndex = i
        break
      }
    }
    if (hitIndex >= 0) {
      this._draggingIndex = hitIndex
      this._dragOffsetX = px - stickers[hitIndex].x
      this._dragOffsetY = py - stickers[hitIndex].y
    }
  },

  onPreviewTouchMove: function(e) {
    if (this._draggingIndex < 0) return
    var rect = this._canvasRect
    if (!rect) return
    var touch = e.touches[0]
    var px = (touch.clientX - rect.left) / rect.width * 300
    var py = (touch.clientY - rect.top) / rect.height * 300
    var stickers = this.data.activeStickers.slice()
    var idx = this._draggingIndex
    if (stickers[idx]) {
      stickers[idx].x = Math.max(20, Math.min(280, px - this._dragOffsetX))
      stickers[idx].y = Math.max(20, Math.min(280, py - this._dragOffsetY))
      this.setData({ activeStickers: stickers })
      this.drawPreview()
    }
  },

  onPreviewTouchEnd: function() {
    this._draggingIndex = -1
  },

  removeSticker: function(e) {
    var idx = e.currentTarget.dataset.index
    var stickers = this.data.activeStickers.slice()
    stickers.splice(idx, 1)
    this.setData({ activeStickers: stickers })
    this.drawPreview()
  },

  clearStickers: function() {
    this.setData({ activeStickers: [] })
    this.drawPreview()
  },

  onTopTextInput: function (e) {
    this.setData({ topText: e.detail.value })
    this.drawPreview()
  },

  onBottomTextInput: function (e) {
    this.setData({ bottomText: e.detail.value })
    this.drawPreview()
  },

  onFontSizeChange: function (e) {
    this.setData({ fontSize: Number(e.detail.value) })
    this.drawPreview()
  },

  onFontColorTap: function (e) {
    var color = e.currentTarget.dataset.color
    this.setData({ fontColor: color })
    this.drawPreview()
  },

  onStrokeToggle: function (e) {
    this.setData({ strokeEnabled: e.detail.value })
    this.drawPreview()
  },

  onStrokeColorTap: function(e) {
    var color = e.currentTarget.dataset.color
    this.setData({ strokeColor: color })
    this.drawPreview()
  },

  onShadowToggle: function(e) {
    this.setData({ shadowEnabled: e.detail.value })
    this.drawPreview()
  },

  onShadowColorTap: function(e) {
    var color = e.currentTarget.dataset.color
    this.setData({ shadowColor: color })
    this.drawPreview()
  },

  onBgColorTap: function (e) {
    var color = e.currentTarget.dataset.color
    this.setData({ bgColor: color, previewBgColor: color })
    this.drawPreview()
  },

  onChooseImage: function () {
    var that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: function (res) {
        var tempFilePath = res.tempFiles[0].tempFilePath
        contentSecurity.checkImage(tempFilePath, function(pass, errMsg) {
          if (!pass) {
            wx.showToast({ title: errMsg, icon: 'none', duration: 2500 })
            return
          }
          that.setData({ customImagePath: tempFilePath })
          that.drawPreview()
        })
      }
    })
  },

  drawPreview: function () {
    var that = this
    var retryCount = 0
    var maxRetry = 5

    function tryDraw() {
      var query = wx.createSelectorQuery()
      query.select('#previewCanvas')
        .fields({ node: true, size: true })
        .exec(function (res) {
          if (!res[0]) {
            retryCount++
            if (retryCount < maxRetry) {
              setTimeout(tryDraw, 100)
            }
            return
          }
          var canvas = res[0].node
          var ctx = canvas.getContext('2d')
          var dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = CANVAS_SIZE * dpr
          canvas.height = CANVAS_SIZE * dpr
          ctx.scale(dpr, dpr)
          that.renderMeme(ctx, CANVAS_SIZE, CANVAS_SIZE, canvas, true)
        })
    }

    tryDraw()
  },

  renderMeme: function (ctx, width, height, canvas, includeStickers) {
    var that = this
    var bgColor = this.data.bgColor
    var emoji = this.data.previewEmoji
    var topText = this.data.topText
    var bottomText = this.data.bottomText
    var fontSize = this.data.fontSize
    var fontColor = this.data.fontColor
    var strokeEnabled = this.data.strokeEnabled
    var strokeColor = this.data.strokeColor
    var shadowEnabled = this.data.shadowEnabled
    var shadowColor = this.data.shadowColor

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    if (this.data.selectedTemplate === 'custom' && this.data.customImagePath) {
      var img = canvas.createImage()
      img.onload = function () {
        var imgW = img.width
        var imgH = img.height
        var scale = Math.min(width / imgW, height / imgH)
        var drawW = imgW * scale
        var drawH = imgH * scale
        var drawX = (width - drawW) / 2
        var drawY = (height - drawH) / 2
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        if (includeStickers) {
          that.drawStickers(ctx, width, height)
        }
        that.drawText(ctx, width, height, topText, bottomText, fontSize, fontColor, strokeEnabled, strokeColor, shadowEnabled, shadowColor)
      }
      img.src = this.data.customImagePath
    } else {
      if (this.data.selectedTemplate !== 'custom') {
        ctx.font = '180px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(emoji, width / 2, height / 2)
      }
      if (includeStickers) {
        this.drawStickers(ctx, width, height)
      }
      this.drawText(ctx, width, height, topText, bottomText, fontSize, fontColor, strokeEnabled, strokeColor, shadowEnabled, shadowColor)
    }
  },

  drawStickers: function(ctx, width, height) {
    var stickers = this.data.activeStickers
    for (var i = 0; i < stickers.length; i++) {
      var s = stickers[i]
      ctx.font = s.size + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.emoji, s.x * 2, s.y * 2)
    }
  },

  drawText: function (ctx, width, height, topText, bottomText, fontSize, fontColor, strokeEnabled, strokeColor, shadowEnabled, shadowColor) {
    ctx.font = 'bold ' + fontSize + 'px sans-serif'
    ctx.textAlign = 'center'

    if (shadowEnabled) {
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = fontSize / 4
      ctx.shadowOffsetX = fontSize / 16
      ctx.shadowOffsetY = fontSize / 16
    } else {
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    if (topText) {
      ctx.textBaseline = 'top'
      var lines = this.wrapText(ctx, topText, width - 40)
      var lineHeight = fontSize * 1.2
      var startY = 20
      for (var i = 0; i < lines.length; i++) {
        if (strokeEnabled) {
          ctx.strokeStyle = strokeColor
          ctx.lineWidth = fontSize / 8
          ctx.lineJoin = 'round'
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.strokeText(lines[i], width / 2, startY + i * lineHeight)
          if (shadowEnabled) {
            ctx.shadowColor = shadowColor
            ctx.shadowBlur = fontSize / 4
            ctx.shadowOffsetX = fontSize / 16
            ctx.shadowOffsetY = fontSize / 16
          }
        }
        ctx.fillStyle = fontColor
        ctx.fillText(lines[i], width / 2, startY + i * lineHeight)
      }
    }

    if (bottomText) {
      ctx.textBaseline = 'bottom'
      var lines = this.wrapText(ctx, bottomText, width - 40)
      var lineHeight = fontSize * 1.2
      var startY = height - 20 - (lines.length - 1) * lineHeight
      for (var i = 0; i < lines.length; i++) {
        if (strokeEnabled) {
          ctx.strokeStyle = strokeColor
          ctx.lineWidth = fontSize / 8
          ctx.lineJoin = 'round'
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.strokeText(lines[i], width / 2, startY + i * lineHeight)
          if (shadowEnabled) {
            ctx.shadowColor = shadowColor
            ctx.shadowBlur = fontSize / 4
            ctx.shadowOffsetX = fontSize / 16
            ctx.shadowOffsetY = fontSize / 16
          }
        }
        ctx.fillStyle = fontColor
        ctx.fillText(lines[i], width / 2, startY + i * lineHeight)
      }
    }

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  },

  wrapText: function (ctx, text, maxWidth) {
    var lines = []
    var currentLine = ''
    for (var i = 0; i < text.length; i++) {
      var ch = text[i]
      if (ch === '\n') {
        lines.push(currentLine)
        currentLine = ''
        continue
      }
      var testLine = currentLine + ch
      var metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = ch
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      lines.push(currentLine)
    }
    return lines
  },

  generateAndSave: function () {
    var that = this
    wx.vibrateShort({ type: 'medium' })

    if (!that.data.topText && !that.data.bottomText && that.data.activeStickers.length === 0) {
      wx.showToast({ title: that.data.i18n.inputTextOrSticker, icon: 'none' })
      return
    }

    // 文本内容安全检测
    var textToCheck = (that.data.topText || '') + ' ' + (that.data.bottomText || '')
    if (textToCheck.trim()) {
      contentSecurity.checkText(textToCheck, function(pass, errMsg) {
        if (!pass) {
          wx.showToast({ title: errMsg, icon: 'none', duration: 2500 })
          return
        }
        that._generateAndSaveInner()
      })
    } else {
      that._generateAndSaveInner()
    }
  },

  _generateAndSaveInner: function () {
    var that = this
    that.setData({ isGenerating: true })

    var query = wx.createSelectorQuery()
    query.select('#saveCanvas')
      .fields({ node: true, size: true })
      .exec(function (res) {
        if (!res[0]) {
          that.setData({ isGenerating: false })
          wx.showToast({ title: that.data.i18n.generateFailed, icon: 'none' })
          return
        }
        var canvas = res[0].node
        var ctx = canvas.getContext('2d')
        var dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = CANVAS_SIZE * dpr
        canvas.height = CANVAS_SIZE * dpr
        ctx.scale(dpr, dpr)
        that.renderMeme(ctx, CANVAS_SIZE, CANVAS_SIZE, canvas, true)

        setTimeout(function () {
          wx.canvasToTempFilePath({
            canvas: canvas,
            destWidth: CANVAS_SIZE * 2,
            destHeight: CANVAS_SIZE * 2,
            success: function (res) {
              that.saveToAlbum(res.tempFilePath)
              var tracker = getApp().tracker
              if (tracker) tracker.toolUse(33, '表情包制作', false)
            },
            fail: function () {
              that.setData({ isGenerating: false })
              wx.showToast({ title: that.data.i18n.generateFailed, icon: 'none' })
            }
          })
        }, 500)
      })
  },

  saveToAlbum: function (filePath) {
    var that = this
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.writePhotosAlbum'] === false) {
          wx.showModal({
            title: that.data.i18n.needAlbumPermission,
            content: that.data.i18n.needAlbumPermissionMsg,
            confirmText: that.data.i18n.goSettings,
            success: function (modalRes) {
              if (modalRes.confirm) {
                wx.openSetting()
              }
              that.setData({ isGenerating: false })
            }
          })
          return
        }
        wx.saveImageToPhotosAlbum({
          filePath: filePath,
          success: function () {
            wx.showToast({ title: that.data.i18n.savedToAlbum, icon: 'success' })
          },
          fail: function () {
            wx.showToast({ title: that.data.i18n.saveFailed, icon: 'none' })
          },
          complete: function () {
            that.setData({ isGenerating: false })
          }
        })
      },
      fail: function () {
        that.setData({ isGenerating: false })
      }
    })
  },

  copyResult: function() {
    var top = this.data.topText || ''
    var bottom = this.data.bottomText || ''
    var text = top && bottom ? top + '\n' + bottom : top || bottom
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        selectedTemplate: 'doge',
        topText: '',
        bottomText: '',
        fontSize: 40,
        fontColor: '#FFFFFF',
        strokeEnabled: true,
        strokeColor: '#000000',
        shadowEnabled: false,
        shadowColor: '#000000',
        bgColor: '#F5DEB3',
        previewEmoji: '🐕',
        previewBgColor: '#F5DEB3',
        customImagePath: '',
        showHotTemplates: false,
        showStickers: false,
        activeStickers: []
      })
      that.drawPreview()
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('表情包制作 - 百宝工具箱', '/package-life/meme-maker/meme-maker', '在线制作表情包，文字配图一键生成')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('表情包制作 - 文字配图一键生成')
  }
})
