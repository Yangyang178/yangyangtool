var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')
var poster = require('../utils/poster.js')

var CANVAS_W = 900
var MAX_CANVAS_H = 4096

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    isLoading: true,
    imageList: [],
    direction: 'vertical',
    gap: 0,
    bgColor: '#FFFFFF',
    resultImage: '',
    isStitching: false
  },

  onLoad: function() {
    this.setData({
      i18n: i18n.getToolPageTexts('imageStitch'),
      isDarkMode: storageUtil.get('darkMode') || false,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      fontClass: points.getFontClass(),
      isLoading: false
    })
    poster.setupForPage(this, 0)
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
  },

  onShow: function() {
    var setting = storageUtil.get('darkModeSetting', 'system')
    var isDark = false
    if (setting === 'dark') {
      isDark = true
    } else if (setting === 'system') {
      try { isDark = wx.getSystemInfoSync().theme === 'dark' } catch(e) {}
    }
    this.setData({
      isDarkMode: isDark,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      fontClass: points.getFontClass()
    })
  },

  chooseImages: function() {
    var that = this
    var remaining = 9 - this.data.imageList.length
    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var newList = that.data.imageList.concat(res.tempFilePaths)
        that.setData({ imageList: newList, resultImage: '' })
      }
    })
  },

  removeImage: function(e) {
    var index = e.currentTarget.dataset.index
    var list = this.data.imageList.slice()
    list.splice(index, 1)
    this.setData({ imageList: list, resultImage: '' })
  },

  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.imageList
    })
  },

  previewResult: function() {
    if (this.data.resultImage) {
      wx.previewImage({
        current: this.data.resultImage,
        urls: [this.data.resultImage]
      })
    }
  },

  setDirection: function(e) {
    this.setData({ direction: e.currentTarget.dataset.dir, resultImage: '' })
  },

  setGap: function(e) {
    this.setData({ gap: parseInt(e.currentTarget.dataset.gap, 10), resultImage: '' })
  },

  setBgColor: function(e) {
    this.setData({ bgColor: e.currentTarget.dataset.color, resultImage: '' })
  },

  doStitch: function() {
    var that = this
    var imageList = this.data.imageList
    var direction = this.data.direction
    var gap = this.data.gap
    var bgColor = this.data.bgColor

    if (imageList.length < 2) {
      wx.showToast({ title: that.data.i18n.needTwo || '请至少选择2张图片', icon: 'none' })
      return
    }

    this.setData({ isStitching: true })

    var query = wx.createSelectorQuery()
    query.select('#stitchCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) {
        that.setData({ isStitching: false })
        wx.showToast({ title: '拼接失败', icon: 'none' })
        return
      }
      var canvas = res[0].node
      var totalImages = imageList.length
      var loaded = 0
      var imgObjects = []

      for (var i = 0; i < totalImages; i++) {
        (function(idx) {
          var img = canvas.createImage()
          img.src = imageList[idx]
          img.onload = function() {
            imgObjects[idx] = img
            loaded++
            if (loaded >= totalImages) {
              that.renderStitch(canvas, imgObjects, direction, gap, bgColor)
            }
          }
          img.onerror = function() {
            imgObjects[idx] = null
            loaded++
            if (loaded >= totalImages) {
              that.renderStitch(canvas, imgObjects, direction, gap, bgColor)
            }
          }
        })(i)
      }
    })
  },

  renderStitch: function(canvas, imgObjects, direction, gap, bgColor) {
    var ctx = canvas.getContext('2d')
    var dpr = 2
    var validImgs = []
    for (var i = 0; i < imgObjects.length; i++) {
      if (imgObjects[i]) validImgs.push(imgObjects[i])
    }

    if (validImgs.length < 2) {
      this.setData({ isStitching: false })
      wx.showToast({ title: '拼接失败', icon: 'none' })
      return
    }

    var canvasW, canvasH
    if (direction === 'vertical') {
      canvasW = 0
      canvasH = 0
      for (var vi = 0; vi < validImgs.length; vi++) {
        if (validImgs[vi].width > canvasW) canvasW = validImgs[vi].width
        canvasH += validImgs[vi].height
      }
      canvasH += gap * (validImgs.length - 1)

      if (canvasH > MAX_CANVAS_H) {
        var ratio = MAX_CANVAS_H / canvasH
        canvasW = Math.floor(canvasW * ratio)
        canvasH = MAX_CANVAS_H
      }

      canvas.width = canvasW * dpr
      canvas.height = canvasH * dpr
      ctx.scale(dpr, dpr)
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvasW, canvasH)

      var offsetY = 0
      for (var vi2 = 0; vi2 < validImgs.length; vi2++) {
        var img = validImgs[vi2]
        var drawW = canvasW
        var drawH = Math.round(img.height * (canvasW / img.width))
        ctx.drawImage(img, 0, offsetY, drawW, drawH)
        offsetY += drawH + gap
      }
    } else {
      canvasH = 0
      canvasW = 0
      for (var hi = 0; hi < validImgs.length; hi++) {
        if (validImgs[hi].height > canvasH) canvasH = validImgs[hi].height
        canvasW += validImgs[hi].width
      }
      canvasW += gap * (validImgs.length - 1)

      if (canvasW > MAX_CANVAS_H) {
        var ratio2 = MAX_CANVAS_H / canvasW
        canvasH = Math.floor(canvasH * ratio2)
        canvasW = MAX_CANVAS_H
      }

      canvas.width = canvasW * dpr
      canvas.height = canvasH * dpr
      ctx.scale(dpr, dpr)
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvasW, canvasH)

      var offsetX = 0
      for (var hi2 = 0; hi2 < validImgs.length; hi2++) {
        var img2 = validImgs[hi2]
        var drawH2 = canvasH
        var drawW2 = Math.round(img2.width * (canvasH / img2.height))
        ctx.drawImage(img2, offsetX, 0, drawW2, drawH2)
        offsetX += drawW2 + gap
      }
    }

    var that = this
    wx.canvasToTempFilePath({
      canvas: canvas,
      fileType: 'jpg',
      quality: 0.92,
      success: function(res) {
        that.setData({ resultImage: res.tempFilePath, isStitching: false })
        try { points.recordToolUse(52) } catch(e) {}
      },
      fail: function() {
        that.setData({ isStitching: false })
        wx.showToast({ title: '拼接失败', icon: 'none' })
      }
    })
  },

  saveResult: function() {
    var that = this
    if (!this.data.resultImage) return

    wx.saveImageToPhotosAlbum({
      filePath: this.data.resultImage,
      success: function() {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: function(err) {
        if (err && err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
          wx.showModal({
            title: '需要授权',
            content: '需要您授权保存图片到相册',
            confirmText: '去设置',
            success: function(res) {
              if (res.confirm) wx.openSetting()
            }
          })
        }
      }
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('图片拼接 - 多图合成长图', '/package-office/image-stitch/image-stitch')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('图片拼接 - 多图合成长图')
  }
})
