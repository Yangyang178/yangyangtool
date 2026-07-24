var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var i18n = require('../../utils/i18n.js')
var poster = require('../utils/poster.js')

var CANVAS_SIZE = 900

Page({
  data: {
    i18n: {},
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',
    isLoading: true,
    imageUrl: '',
    gridType: 3,
    fillMode: 'cover',
    bgColor: '#FFFFFF',
    gridImages: [],
    isSaving: false
  },

  onLoad: function() {
    this.setData({
      i18n: i18n.getToolPageTexts('gridImage'),
      isDarkMode: storageUtil.get('darkMode') || false,
      fontSizeSetting: storageUtil.get('fontSizeSetting', 'medium'),
      fontClass: points.getFontClass(),
      isLoading: false
    })
    poster.setupForPage(this, 51)
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

  chooseImage: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({ imageUrl: res.tempFilePaths[0] })
        that.doGridCut()
      }
    })
  },

  setGridType: function(e) {
    var type = parseInt(e.currentTarget.dataset.type, 10)
    this.setData({ gridType: type })
    if (this.data.imageUrl) this.doGridCut()
  },

  setFillMode: function(e) {
    this.setData({ fillMode: e.currentTarget.dataset.mode })
    if (this.data.imageUrl) this.doGridCut()
  },

  setBgColor: function(e) {
    this.setData({ bgColor: e.currentTarget.dataset.color })
    if (this.data.imageUrl) this.doGridCut()
  },

  doGridCut: function() {
    var that = this
    var imageUrl = this.data.imageUrl
    var gridType = this.data.gridType
    var fillMode = this.data.fillMode
    var bgColor = this.data.bgColor

    var query = wx.createSelectorQuery()
    query.select('#gridCanvas').fields({ node: true, size: true }).exec(function(res) {
      if (!res || !res[0] || !res[0].node) {
        wx.showToast({ title: '切图失败', icon: 'none' })
        return
      }
      var canvas = res[0].node
      var ctx = canvas.getContext('2d')
      canvas.width = CANVAS_SIZE
      canvas.height = CANVAS_SIZE

      var img = canvas.createImage()
      img.src = imageUrl
      img.onload = function() {
        var imgW = img.width
        var imgH = img.height
        var cellSize = CANVAS_SIZE / gridType

        // 先填充背景
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        if (fillMode === 'cover') {
          // cover模式：整张图填满整个正方形网格，裁掉超出部分
          var scale = Math.max(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH)
          var drawW = imgW * scale
          var drawH = imgH * scale
          var offsetX = (CANVAS_SIZE - drawW) / 2
          var offsetY = (CANVAS_SIZE - drawH) / 2
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
        } else {
          // contain模式：整张图完整显示在正方形网格内，空余部分填背景色
          var scale2 = Math.min(CANVAS_SIZE / imgW, CANVAS_SIZE / imgH)
          var drawW2 = imgW * scale2
          var drawH2 = imgH * scale2
          var offsetX2 = (CANVAS_SIZE - drawW2) / 2
          var offsetY2 = (CANVAS_SIZE - drawH2) / 2
          ctx.drawImage(img, offsetX2, offsetY2, drawW2, drawH2)
        }

        // 网格画好了，直接用 canvasToTempFilePath 的 x/y 截取每个格子
        var images = []
        var exportCellSize = 300

        var cutNext = function(index) {
          if (index >= gridType * gridType) {
            that.setData({ gridImages: images })
            return
          }
          var row = Math.floor(index / gridType)
          var col = index % gridType

          wx.canvasToTempFilePath({
            canvas: canvas,
            x: col * cellSize,
            y: row * cellSize,
            width: cellSize,
            height: cellSize,
            destWidth: exportCellSize,
            destHeight: exportCellSize,
            fileType: 'jpg',
            quality: 0.92,
            success: function(exportRes) {
              images.push(exportRes.tempFilePath)
              cutNext(index + 1)
            },
            fail: function() {
              cutNext(index + 1)
            }
          })
        }

        cutNext(0)
      }
      img.onerror = function() {
        wx.showToast({ title: '图片加载失败', icon: 'none' })
      }
    })
  },

  saveAllImages: function() {
    var that = this
    var images = this.data.gridImages
    if (!images || images.length === 0) return

    this.setData({ isSaving: true })
    var saveIndex = 0
    var savedCount = 0

    var saveNext = function() {
      if (saveIndex >= images.length) {
        that.setData({ isSaving: false })
        wx.showToast({ title: '已保存' + savedCount + '张图片', icon: 'success', duration: 2000 })
        try { points.recordToolUse(51) } catch(e) {}
        return
      }

      wx.saveImageToPhotosAlbum({
        filePath: images[saveIndex],
        success: function() {
          savedCount++
          saveIndex++
          saveNext()
        },
        fail: function(err) {
          if (err && err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
            that.setData({ isSaving: false })
            wx.showModal({
              title: '需要授权',
              content: '需要您授权保存图片到相册',
              confirmText: '去设置',
              success: function(modalRes) {
                if (modalRes.confirm) wx.openSetting()
              }
            })
          } else {
            saveIndex++
            saveNext()
          }
        }
      })
    }

    saveNext()
  },

  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.gridImages
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('九宫格切图 - 一键发朋友圈', '/package-office/grid-image/grid-image')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('九宫格切图 - 一键发朋友圈')
  }
})
