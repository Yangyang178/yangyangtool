var storageUtil = require('../../utils/storage.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    currentFunction: 'compress',
    images: [],
    currentImageIndex: 0,
    processedImagePath: '',
    
    quality: 80,
    outputFormat: 'jpg',
    compressResult: null,
    
    targetWidth: '',
    targetHeight: '',
    scalePercent: 100,
    isLockedRatio: true,
    
    stitchMode: 'horizontal',
    stitchImages: [],
    stitchGap: 0,
    stitchBgColor: '#FFFFFF',
    stitchResult: null,
    stitchBorderRadius: 0,
    stitchGapColor: '#FFFFFF',
    stitchGapColors: [
      { color: '#FFFFFF', name: '' },
      { color: '#000000', name: '' },
      { color: '#F3F4F6', name: '' },
      { color: '#8B5CF6', name: '' },
      { color: '#EF4444', name: '' },
      { color: '#10B981', name: '' }
    ],
    
    cropMode: 'free',
    
    targetFormat: 'webp',
    formatInfo: null,
    
    isProcessing: false,
    isDarkMode: false,
    fontSizeSetting: 'medium',

    functions: [
      { id: 'compress', name: '', icon: '🗜️' },
      { id: 'resize', name: '', icon: '📐' },
      { id: 'stitch', name: '', icon: '🧩' },
      { id: 'crop', name: '', icon: '✂️' },
      { id: 'rotate', name: '', icon: '🔄' },
      { id: 'convert', name: '', icon: '🔀' },
      { id: 'watermark', name: '', icon: '💧' },
      { id: 'info', name: '', icon: 'ℹ️' },
      { id: 'batch', name: '', icon: '📦' }
    ],

    qualityPresets: [
      { label: '', value: 30, desc: '' },
      { label: '', value: 60, desc: '' },
      { label: '', value: 80, desc: '' },
      { label: '', value: 100, desc: '' }
    ],

    outputFormats: [
      { label: 'JPG', value: 'jpg', color: '#EF4444' },
      { label: 'PNG', value: 'png', color: '#3B82F6' },
      { label: 'WebP', value: 'webp', color: '#8B5CF6' }
    ],

    presetSizes: [
      { label: '', width: 500, height: 500 },
      { label: '', width: 1080, height: 1080 },
      { label: '', width: 920, height: 300 },
      { label: '', width: 800, height: 800 },
      { label: '', width: 295, height: 413 },
      { label: '', width: 1920, height: 1080 },
      { label: '', width: 1080, height: 1080 },
      { label: '', width: 1242, height: 1660 }
    ],

    stitchModes: [
      { id: 'horizontal', name: '', icon: '↔️' },
      { id: 'vertical', name: '', icon: '↕️' },
      { id: 'grid', name: '', icon: '⊞' },
      { id: 'long', name: '', icon: '📜' }
    ],

    cropModes: [
      { id: 'free', name: '', icon: '✂️' },
      { id: 'custom', name: '', icon: '📐' },
      { id: 'idphoto', name: '', icon: '🪪' },
      { id: 'square', name: '', icon: '⬜' },
      { id: 'circle', name: '', icon: '⭕' },
      { id: '169', name: '', icon: '🖥️' },
      { id: '43', name: '', icon: '📺' },
      { id: '11', name: '', icon: '⬛' }
    ],

    idPhotoPresets: [
      { name: '', width: 295, height: 413, desc: '' },
      { name: '', width: 413, height: 579, desc: '' },
      { name: '', width: 413, height: 531, desc: '' },
      { name: '', width: 390, height: 567, desc: '' }
    ],

    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
    selectedIdPhoto: 0,
    cropPreviewStyle: '',

    rotationOptions: [
      { angle: 90, name: '', icon: '↺' },
      { angle: 180, name: '', icon: '🔄' },
      { angle: 270, name: '', icon: '↻' }
    ],

    allFormats: [
      { ext: '.jpg', name: 'JPEG', value: 'jpg', desc: '' },
      { ext: '.png', name: 'PNG', value: 'png', desc: '' },
      { ext: '.webp', name: 'WebP', value: 'webp', desc: '' },
      { ext: '.bmp', name: 'BMP', value: 'bmp', desc: '' }
    ],

    convertCompare: null,

    batchImages: [],
    batchMode: 'compress',
    batchQuality: 80,
    batchOutputFormat: 'jpg',
    batchCropMode: 'square',
    batchWatermarkText: '',
    batchWatermarkPosition: 'bottom-right',
    batchWatermarkOpacity: 50,
    batchWatermarkSize: 24,
    batchProgress: 0,
    batchTotal: 0,
    batchProgressPercent: 0,
    batchProcessing: false,
    batchResults: [],
    batchSummary: null,

    batchModes: [
      { id: 'compress', name: '', icon: '🗜️', desc: '' },
      { id: 'crop', name: '', icon: '✂️', desc: '' },
      { id: 'watermark', name: '', icon: '💧', desc: '' }
    ],

    batchCropModes: [
      { id: 'square', name: '', icon: '⬜' },
      { id: '169', name: '', icon: '🖥️' },
      { id: '43', name: '', icon: '📺' },
      { id: '11', name: '', icon: '⬛' }
    ],

    watermarkPositions: [
      { id: 'top-left', name: '' },
      { id: 'top-right', name: '' },
      { id: 'center', name: '' },
      { id: 'bottom-left', name: '' },
      { id: 'bottom-right', name: '' }
    ],

    imageDetailInfo: null,
    imageDPI: 0,
    imageColorSpace: '',
    imageEXIF: null,
    imageDominantColors: [],
    infoTab: 'basic',

    wmText: '',
    wmPosition: 'bottom-right',
    wmOpacity: 50,
    wmSize: 24,
    wmColor: '#FFFFFF',
    wmAngle: 0,
    wmMode: 'single',
    wmColors: [
      { color: '#FFFFFF', name: '' },
      { color: '#000000', name: '' },
      { color: '#EF4444', name: '' },
      { color: '#3B82F6', name: '' },
      { color: '#F59E0B', name: '' },
      { color: '#8B5CF6', name: '' }
    ]
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var i18nTexts = i18n.getToolPageTexts('imageProcessor')
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('图片处理')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    this._updateI18nData(i18nTexts)
    this.updateFormatInfo()
    poster.setupForPage(this, 21)
  },
  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    var i18nTexts = i18n.getToolPageTexts('imageProcessor')
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, i18n: i18nTexts })
    this._updateI18nData(i18nTexts)
  },

  onPrivacyAgreed: function() {
    // privacy-popup 组件同意后的回调
    // 隐私授权通过后，用户再次点击选择图片即可正常使用
  },

  _updateI18nData: function(t) {
    this.setData({
      functions: [
        { id: 'compress', name: t.funcCompress, icon: '🗜️' },
        { id: 'resize', name: t.funcResize, icon: '📐' },
        { id: 'stitch', name: t.funcStitch, icon: '🧩' },
        { id: 'crop', name: t.funcCrop, icon: '✂️' },
        { id: 'rotate', name: t.funcRotate, icon: '🔄' },
        { id: 'convert', name: t.funcConvert, icon: '🔀' },
        { id: 'watermark', name: t.funcWatermark, icon: '💧' },
        { id: 'info', name: t.funcInfo, icon: 'ℹ️' },
        { id: 'batch', name: t.funcBatch, icon: '📦' }
      ],
      qualityPresets: [
        { label: t.qpLow, value: 30, desc: t.qpLowDesc },
        { label: t.qpMedium, value: 60, desc: t.qpMediumDesc },
        { label: t.qpHigh, value: 80, desc: t.qpHighDesc },
        { label: t.qpOriginal, value: 100, desc: t.qpOriginalDesc }
      ],
      presetSizes: [
        { label: t.psWechatAvatar, width: 500, height: 500 },
        { label: t.psMoments, width: 1080, height: 1080 },
        { label: t.psWeiboCover, width: 920, height: 300 },
        { label: t.psTaobaoMain, width: 800, height: 800 },
        { label: t.psIdPhoto, width: 295, height: 413 },
        { label: t.psHdWallpaper, width: 1920, height: 1080 },
        { label: t.psInstagram, width: 1080, height: 1080 },
        { label: t.psXiaohongshu, width: 1242, height: 1660 }
      ],
      stitchModes: [
        { id: 'horizontal', name: t.smHorizontal, icon: '↔️' },
        { id: 'vertical', name: t.smVertical, icon: '↕️' },
        { id: 'grid', name: t.smGrid, icon: '⊞' },
        { id: 'long', name: t.smLong, icon: '📜' }
      ],
      cropModes: [
        { id: 'free', name: t.cmFree, icon: '✂️' },
        { id: 'custom', name: t.cmCustom, icon: '📐' },
        { id: 'idphoto', name: t.cmIdPhoto, icon: '🪪' },
        { id: 'square', name: t.cmSquare, icon: '⬜' },
        { id: 'circle', name: t.cmCircle, icon: '⭕' },
        { id: '169', name: t.cm169, icon: '🖥️' },
        { id: '43', name: t.cm43, icon: '📺' },
        { id: '11', name: t.cm11, icon: '⬛' }
      ],
      idPhotoPresets: [
        { name: t.ip1inch, width: 295, height: 413, desc: t.ip1inchDesc },
        { name: t.ip2inch, width: 413, height: 579, desc: t.ip2inchDesc },
        { name: t.ipSmall2inch, width: 413, height: 531, desc: t.ipSmall2inchDesc },
        { name: t.ipLarge1inch, width: 390, height: 567, desc: t.ipLarge1inchDesc }
      ],
      rotationOptions: [
        { angle: 90, name: t.roLeft90, icon: '↺' },
        { angle: 180, name: t.ro180, icon: '🔄' },
        { angle: 270, name: t.roRight90, icon: '↻' }
      ],
      allFormats: [
        { ext: '.jpg', name: 'JPEG', value: 'jpg', desc: t.afJpgDesc },
        { ext: '.png', name: 'PNG', value: 'png', desc: t.afPngDesc },
        { ext: '.webp', name: 'WebP', value: 'webp', desc: t.afWebpDesc },
        { ext: '.bmp', name: 'BMP', value: 'bmp', desc: t.afBmpDesc }
      ],
      batchModes: [
        { id: 'compress', name: t.bmCompress, icon: '🗜️', desc: t.bmCompressDesc },
        { id: 'crop', name: t.bmCrop, icon: '✂️', desc: t.bmCropDesc },
        { id: 'watermark', name: t.bmWatermark, icon: '💧', desc: t.bmWatermarkDesc }
      ],
      batchCropModes: [
        { id: 'square', name: t.bcmSquare, icon: '⬜' },
        { id: '169', name: t.bcm169, icon: '🖥️' },
        { id: '43', name: t.bcm43, icon: '📺' },
        { id: '11', name: t.bcm11, icon: '⬛' }
      ],
      watermarkPositions: [
        { id: 'top-left', name: t.wpTopLeft },
        { id: 'top-right', name: t.wpTopRight },
        { id: 'center', name: t.wpCenter },
        { id: 'bottom-left', name: t.wpBottomLeft },
        { id: 'bottom-right', name: t.wpBottomRight }
      ],
      stitchGapColors: [
        { color: '#FFFFFF', name: t.sgcWhite },
        { color: '#000000', name: t.sgcBlack },
        { color: '#F3F4F6', name: t.sgcLightGray },
        { color: '#8B5CF6', name: t.sgcPurple },
        { color: '#EF4444', name: t.sgcRed },
        { color: '#10B981', name: t.sgcGreen }
      ],
      wmColors: [
        { color: '#FFFFFF', name: t.wmcWhite },
        { color: '#000000', name: t.wmcBlack },
        { color: '#EF4444', name: t.wmcRed },
        { color: '#3B82F6', name: t.wmcBlue },
        { color: '#F59E0B', name: t.wmcYellow },
        { color: '#8B5CF6', name: t.wmcPurple }
      ]
    })
  },

  switchFunction: function(e) {
    var funcId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ currentFunction: funcId })
    if (funcId === 'info' && this.data.images.length > 0) {
      this._loadDetailInfo()
    }
  },

  chooseImage: function() {
    var maxCount = 1
    if (this.data.currentFunction === 'stitch') {
      maxCount = 9
    } else if (this.data.currentFunction === 'batch') {
      maxCount = 20
    }
    var self = this

    if (wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: function(res) {
          if (res.needAuthorization) {
            self._requirePrivacyAuthorization(function() {
              self._doChooseMedia(maxCount)
            })
          } else {
            self._doChooseMedia(maxCount)
          }
        },
        fail: function() {
          self._doChooseMedia(maxCount)
        }
      })
    } else {
      self._doChooseMedia(maxCount)
    }
  },

  _requirePrivacyAuthorization: function(callback) {
    var self = this
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: function() {
          if (callback) callback()
        },
        fail: function() {
          wx.showModal({
            title: self.data.i18n.privacyAuthTitle,
            content: self.data.i18n.privacyAuthContent,
            confirmText: self.data.i18n.confirmBtn,
            cancelText: self.data.i18n.cancelBtn,
            success: function(modalRes) {
              if (modalRes.confirm) {
                wx.showToast({ title: self.data.i18n.tapSelectAgain, icon: 'none', duration: 2000 })
              }
            }
          })
        }
      })
    } else {
      if (callback) callback()
    }
  },

  _doChooseMedia: function(maxCount) {
    var self = this

    wx.chooseMedia({
      count: maxCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        if (!res.tempFiles || res.tempFiles.length === 0) {
          wx.showToast({ title: self.data.i18n.noImageSelected, icon: 'none' })
          return
        }

        var newImages = []
        for (var ni = 0; ni < res.tempFiles.length; ni++) {
          var file = res.tempFiles[ni]
          newImages.push({
            path: file.tempFilePath,
            size: file.size || 0,
            sizeText: file.size ? self.formatFileSize(file.size) : self.data.i18n.loading,
            width: file.width || 0,
            height: file.height || 0
          })
        }

        self.handleSelectedImages(newImages)
      },
      fail: function(err) {
        var errMsg = err.errMsg || ''
        if (errMsg.indexOf('cancel') > -1) {
          return
        }
        if (errMsg.indexOf('privacy') > -1 || errMsg.indexOf('112') > -1) {
          self._requirePrivacyAuthorization()
        } else {
          wx.showToast({ title: self.data.i18n.selectFailed, icon: 'none', duration: 2000 })
        }
      }
    })
  },

  handleSelectedImages: function(newImages) {
    if (this.data.currentFunction === 'stitch') {
      var currentStitchImages = []
      for (var si = 0; si < this.data.stitchImages.length; si++) {
        currentStitchImages.push(this.data.stitchImages[si])
      }
      for (var sni = 0; sni < newImages.length; sni++) {
        currentStitchImages.push(newImages[sni])
      }
      this.setData({
        stitchImages: currentStitchImages
      })
      
      if (newImages.length > 0) {
        this.loadStitchImagesInfo(currentStitchImages.length - newImages.length)
      }
    } else if (this.data.currentFunction === 'batch') {
      var currentBatchImages = []
      for (var bi = 0; bi < this.data.batchImages.length; bi++) {
        currentBatchImages.push(this.data.batchImages[bi])
      }
      for (var bni = 0; bni < newImages.length; bni++) {
        currentBatchImages.push(newImages[bni])
      }
      this.setData({
        batchImages: currentBatchImages,
        batchResults: [],
        batchSummary: null
      })

      if (newImages.length > 0) {
        this.loadBatchImagesInfo(currentBatchImages.length - newImages.length)
      }
    } else {
      this.setData({
        images: newImages,
        currentImageIndex: 0,
        processedImagePath: '',
        compressResult: null,
        stitchResult: null
      })

      if (newImages.length > 0) {
        this.loadImageInfo(0)
      }
    }

    wx.showToast({ 
      title: newImages.length > 1 ? this.data.i18n.imagesSelectedPrefix + newImages.length + this.data.i18n.imagesSelectedSuffix : this.data.i18n.imageLoaded, 
      icon: 'success' 
    })
  },

  loadStitchImagesInfo: function(startIndex) {
    var images = []
    for (var lsi = 0; lsi < this.data.stitchImages.length; lsi++) {
      images.push(this.data.stitchImages[lsi])
    }
    
    for (var i = startIndex; i < images.length; i++) {
      (function(idx) {
        wx.getImageInfo({
          src: images[idx].path,
          success: function(imgInfo) {
            var newImg = {}
            for (var lsiKey in images[idx]) { newImg[lsiKey] = images[idx][lsiKey] }
            newImg.width = imgInfo.width
            newImg.height = imgInfo.height
            images[idx] = newImg
            this.setData({ stitchImages: images })
          }.bind(this),
          fail: function() {}
        })
      }).call(this, i)
    }
  },

  loadImageInfo: function(index) {
    if (!this.data.images[index]) return
    var self = this
    
    wx.getImageInfo({
      src: this.data.images[index].path,
      success: function(imgInfo) {
        var images = []
        for (var lii = 0; lii < self.data.images.length; lii++) {
          images.push(self.data.images[lii])
        }
        var newImg = {}
        for (var liKey in images[index]) { newImg[liKey] = images[index][liKey] }
        newImg.width = imgInfo.width
        newImg.height = imgInfo.height
        images[index] = newImg
        
        self.setData({
          images: images,
          targetWidth: imgInfo.width.toString(),
          targetHeight: imgInfo.height.toString()
        })
      }
    })
  },

  loadBatchImagesInfo: function(startIndex) {
    var images = []
    for (var lbi = 0; lbi < this.data.batchImages.length; lbi++) {
      images.push(this.data.batchImages[lbi])
    }
    
    for (var i = startIndex; i < images.length; i++) {
      (function(idx) {
        wx.getImageInfo({
          src: images[idx].path,
          success: function(imgInfo) {
            var newImg = {}
            for (var bKey in images[idx]) { newImg[bKey] = images[idx][bKey] }
            newImg.width = imgInfo.width
            newImg.height = imgInfo.height
            images[idx] = newImg
            this.setData({ batchImages: images })
          }.bind(this),
          fail: function() {}
        })
      }).call(this, i)
    }
  },

  removeBatchImage: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    wx.vibrateShort({ type: 'light' })

    var images = []
    for (var rbi = 0; rbi < this.data.batchImages.length; rbi++) {
      images.push(this.data.batchImages[rbi])
    }
    images.splice(index, 1)

    this.setData({
      batchImages: images,
      batchResults: [],
      batchSummary: null
    })
  },

  clearBatchImages: function() {
    if (this.data.batchImages.length === 0) return

    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmClearTitle,
      content: that.data.i18n.confirmClearContentPrefix + that.data.batchImages.length + that.data.i18n.confirmClearContentSuffix,
      confirmText: that.data.i18n.confirmClearBtn,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            batchImages: [],
            batchResults: [],
            batchSummary: null
          })
          wx.showToast({ title: that.data.i18n.allImagesCleared, icon: 'success' })
        }
      }
    })
  },

  selectBatchMode: function(e) {
    var mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ batchMode: mode })
  },

  onBatchQualityChange: function(e) {
    this.setData({ batchQuality: parseInt(e.detail.value) })
  },

  selectBatchOutputFormat: function(e) {
    wx.vibrateShort({ type: 'light' })
    var format = e.currentTarget.dataset.value
    if (format) {
      this.setData({ batchOutputFormat: format })
    }
  },

  selectBatchCropMode: function(e) {
    var mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ batchCropMode: mode })
  },

  onWatermarkTextInput: function(e) {
    this.setData({ batchWatermarkText: e.detail.value })
  },

  selectWatermarkPosition: function(e) {
    var pos = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ batchWatermarkPosition: pos })
  },

  onWatermarkOpacityChange: function(e) {
    this.setData({ batchWatermarkOpacity: parseInt(e.detail.value) })
  },

  onWatermarkSizeChange: function(e) {
    this.setData({ batchWatermarkSize: parseInt(e.detail.value) })
  },

  startBatchProcess: function() {
    if (this.data.batchImages.length === 0) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }

    if (this.data.batchMode === 'watermark' && !this.data.batchWatermarkText) {
      wx.showToast({ title: this.data.i18n.inputWatermarkText, icon: 'none' })
      return
    }

    var unloadedCount = 0
    for (var ui = 0; ui < this.data.batchImages.length; ui++) {
      if (!this.data.batchImages[ui].width || !this.data.batchImages[ui].height) {
        unloadedCount++
      }
    }
    if (unloadedCount > 0) {
      wx.showToast({ title: this.data.i18n.imageLoading, icon: 'none' })
      var that = this
      setTimeout(function() { that.startBatchProcess() }, 500)
      return
    }

    this.setData({
      batchProcessing: true,
      batchProgress: 0,
      batchTotal: this.data.batchImages.length,
      batchProgressPercent: 0,
      batchResults: [],
      batchSummary: null
    })

    this.processBatchItem(0)
  },

  processBatchItem: function(index) {
    if (index >= this.data.batchImages.length) {
      this.finishBatchProcess()
      return
    }

    var image = this.data.batchImages[index]
    var self = this
    var mode = this.data.batchMode

    if (mode === 'compress') {
      this.batchCompressOne(image, function(result) {
        self.appendBatchResult(index, result)
        var prog = index + 1
        self.setData({ batchProgress: prog, batchProgressPercent: Math.round(prog / self.data.batchTotal * 100) })
        self.processBatchItem(index + 1)
      })
    } else if (mode === 'crop') {
      this.batchCropOne(image, function(result) {
        self.appendBatchResult(index, result)
        var prog2 = index + 1
        self.setData({ batchProgress: prog2, batchProgressPercent: Math.round(prog2 / self.data.batchTotal * 100) })
        self.processBatchItem(index + 1)
      })
    } else if (mode === 'watermark') {
      this.batchWatermarkOne(image, function(result) {
        self.appendBatchResult(index, result)
        var prog3 = index + 1
        self.setData({ batchProgress: prog3, batchProgressPercent: Math.round(prog3 / self.data.batchTotal * 100) })
        self.processBatchItem(index + 1)
      })
    }
  },

  batchCompressOne: function(image, callback) {
    var self = this
    wx.compressImage({
      src: image.path,
      quality: this.data.batchQuality,
      fileType: this.data.batchOutputFormat,
      success: function(res) {
        wx.getFileInfo({
          filePath: res.tempFilePath,
          success: function(fileInfo) {
            var originalBytes = image.size || 0
            var ratio = originalBytes > 0 ? ((1 - fileInfo.size / originalBytes) * 100).toFixed(1) : 0
            callback({
              path: res.tempFilePath,
              originalSize: image.sizeText || self.formatFileSize(originalBytes),
              compressedSize: self.formatFileSize(fileInfo.size),
              savedSize: self.formatFileSize(Math.max(0, originalBytes - fileInfo.size)),
              ratio: Math.max(0, ratio),
              success: true
            })
          },
          fail: function() {
            callback({
              path: res.tempFilePath,
              originalSize: image.sizeText || '',
              compressedSize: '',
              savedSize: '',
              ratio: 0,
              success: true
            })
          }
        })
      },
      fail: function() {
        callback({ path: '', success: false })
      }
    })
  },

  batchCropOne: function(image, callback) {
    var mode = this.data.batchCropMode
    var cropWidth = image.width
    var cropHeight = image.height
    var offsetX = 0
    var offsetY = 0

    if (mode === 'square' || mode === '11') {
      var minDim = Math.min(image.width, image.height)
      cropWidth = minDim
      cropHeight = minDim
      offsetX = (image.width - minDim) / 2
      offsetY = (image.height - minDim) / 2
    } else if (mode === '169') {
      cropHeight = Math.round(image.width * 9 / 16)
      if (cropHeight > image.height) {
        cropHeight = image.height
        cropWidth = Math.round(image.height * 16 / 9)
      }
      offsetX = (image.width - cropWidth) / 2
      offsetY = (image.height - cropHeight) / 2
    } else if (mode === '43') {
      cropHeight = Math.round(image.width * 3 / 4)
      if (cropHeight > image.height) {
        cropHeight = image.height
        cropWidth = Math.round(image.height * 4 / 3)
      }
      offsetX = (image.width - cropWidth) / 2
      offsetY = (image.height - cropHeight) / 2
    }

    var self = this
    this.drawCanvas({
      imagePath: image.path,
      width: cropWidth,
      height: cropHeight,
      sx: offsetX,
      sy: offsetY,
      sWidth: cropWidth,
      sHeight: cropHeight,
      success: function(tempFilePath) {
        callback({ path: tempFilePath, success: true })
      },
      fail: function() {
        callback({ path: '', success: false })
      }
    })
  },

  batchWatermarkOne: function(image, callback) {
    var self = this
    var text = this.data.batchWatermarkText
    var position = this.data.batchWatermarkPosition
    var opacity = this.data.batchWatermarkOpacity / 100
    var fontSize = this.data.batchWatermarkSize

    this.drawCanvas({
      width: image.width,
      height: image.height,
      drawCallback: function(ctx, canvas) {
        var img = canvas.createImage()
        img.onload = function() {
          ctx.drawImage(img, 0, 0, image.width, image.height)

          ctx.globalAlpha = opacity
          ctx.font = 'bold ' + fontSize + 'px sans-serif'
          ctx.fillStyle = '#FFFFFF'
          ctx.strokeStyle = 'rgba(0,0,0,0.5)'
          ctx.lineWidth = Math.max(1, fontSize / 12)

          var metrics = ctx.measureText(text)
          var textWidth = metrics.width
          var textHeight = fontSize
          var padding = fontSize * 0.6

          var x = 0
          var y = 0

          if (position === 'top-left') {
            x = padding
            y = padding + textHeight
          } else if (position === 'top-right') {
            x = image.width - textWidth - padding
            y = padding + textHeight
          } else if (position === 'center') {
            x = (image.width - textWidth) / 2
            y = (image.height + textHeight) / 2
          } else if (position === 'bottom-left') {
            x = padding
            y = image.height - padding
          } else {
            x = image.width - textWidth - padding
            y = image.height - padding
          }

          ctx.strokeText(text, x, y)
          ctx.fillText(text, x, y)
          ctx.globalAlpha = 1

          setTimeout(function() {
            self.exportToTempFile(canvas, image.width, image.height, function(path) {
              callback({ path: path, success: true })
            })
          }, 50)
        }
        img.onerror = function() {
          callback({ path: '', success: false })
        }
        img.src = image.path
      },
      fail: function() {
        callback({ path: '', success: false })
      }
    })
  },

  appendBatchResult: function(index, result) {
    var results = []
    for (var ari = 0; ari < this.data.batchResults.length; ari++) {
      results.push(this.data.batchResults[ari])
    }
    results.push({
      index: index,
      path: result.path,
      originalSize: result.originalSize || '',
      compressedSize: result.compressedSize || '',
      savedSize: result.savedSize || '',
      ratio: result.ratio || 0,
      success: result.success
    })
    this.setData({ batchResults: results })
  },

  finishBatchProcess: function() {
    var results = this.data.batchResults
    var successCount = 0
    var failCount = 0
    var totalSaved = 0

    for (var fi = 0; fi < results.length; fi++) {
      if (results[fi].success) {
        successCount++
      } else {
        failCount++
      }
    }

    var summary = {
      total: results.length,
      successCount: successCount,
      failCount: failCount
    }

    this.setData({
      batchProcessing: false,
      batchSummary: summary
    })

    wx.showToast({
      title: this.data.i18n.batchDonePrefix + successCount + this.data.i18n.batchDoneSuffix,
      icon: 'success',
      duration: 2000
    })
    var tracker = getApp().tracker
    if (tracker) tracker.toolUse(21, '图片处理', false)
  },

  saveBatchResult: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var results = this.data.batchResults
    var that = this
    if (!results[index] || !results[index].path) {
      wx.showToast({ title: that.data.i18n.imageProcessFailed, icon: 'none' })
      return
    }

    wx.saveImageToPhotosAlbum({
      filePath: results[index].path,
      success: function() {
        wx.showToast({ title: that.data.i18n.savedToAlbum, icon: 'success' })
      },
      fail: function() {
        wx.showModal({
          title: that.data.i18n.tipTitle,
          content: that.data.i18n.needAlbumPermission,
          confirmText: that.data.i18n.goToSettings,
          success: function(res) {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  saveAllBatchResults: function() {
    var results = this.data.batchResults
    var that = this
    var successPaths = []
    for (var si = 0; si < results.length; si++) {
      if (results[si].success && results[si].path) {
        successPaths.push(results[si].path)
      }
    }

    if (successPaths.length === 0) {
      wx.showToast({ title: that.data.i18n.noImageToSave, icon: 'none' })
      return
    }

    var savedCount = 0
    var failCount = 0

    var saveNext = function(paths, idx) {
      if (idx >= paths.length) {
        wx.showToast({
          title: that.data.i18n.savedCountPrefix + savedCount + that.data.i18n.savedCountSuffix,
          icon: 'success'
        })
        return
      }

      wx.saveImageToPhotosAlbum({
        filePath: paths[idx],
        success: function() {
          savedCount++
          saveNext(paths, idx + 1)
        },
        fail: function() {
          failCount++
          saveNext(paths, idx + 1)
        }
      })
    }

    saveNext(successPaths, 0)
  },

  previewBatchResult: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var results = this.data.batchResults
    if (!results[index] || !results[index].path) return

    var urls = []
    for (var pi = 0; pi < results.length; pi++) {
      if (results[pi].path) {
        urls.push(results[pi].path)
      }
    }

    wx.previewImage({
      urls: urls,
      current: results[index].path
    })
  },

  switchCurrentImage: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    this.setData({ 
      currentImageIndex: index,
      processedImagePath: '',
      compressResult: null
    })
    this.loadImageInfo(index)
  },

  removeImage: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    wx.vibrateShort({ type: 'light' })
    
    var images = []
    for (var ri = 0; ri < this.data.images.length; ri++) {
      images.push(this.data.images[ri])
    }
    images.splice(index, 1)
    
    this.setData({
      images: images,
      currentImageIndex: Math.min(index, Math.max(0, images.length - 1)),
      processedImagePath: ''
    })
  },

  removeStitchImage: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    wx.vibrateShort({ type: 'light' })
    
    var stitchImages = []
    for (var rsi = 0; rsi < this.data.stitchImages.length; rsi++) {
      stitchImages.push(this.data.stitchImages[rsi])
    }
    stitchImages.splice(index, 1)
    this.setData({ stitchImages: stitchImages })
  },

  clearStitchImages: function() {
    if (this.data.stitchImages.length === 0) return
    
    wx.vibrateShort({ type: 'medium' })
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmClearTitle,
      content: that.data.i18n.confirmClearContentPrefix + that.data.stitchImages.length + that.data.i18n.confirmClearContentSuffix,
      confirmText: that.data.i18n.confirmClearBtn,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            stitchImages: [],
            stitchResult: null
          })
          wx.showToast({ 
            title: that.data.i18n.allImagesCleared, 
            icon: 'success' 
          })
        }
      }
    })
  },

  clearAllImages: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      images: [],
      currentImageIndex: 0,
      processedImagePath: '',
      compressResult: null,
      stitchImages: [],
      stitchResult: null
    })
  },

  getCurrentImage: function() {
    return this.data.images[this.data.currentImageIndex] || {}
  },

  onQualityChange: function(e) {
    this.setData({ quality: parseInt(e.detail.value) })
  },

  selectQualityPreset: function(e) {
    var quality = parseInt(e.currentTarget.dataset.value)
    wx.vibrateShort({ type: 'light' })
    this.setData({ quality: quality })
  },

  selectOutputFormat: function(e) {
    wx.vibrateShort({ type: 'light' })
    var format = e.currentTarget.dataset.value
    if (format) {
      this.setData({ outputFormat: format })
    }
  },

  compressImage: function() {
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }

    this.setData({ isProcessing: true, compressResult: null })

    var that = this
    wx.compressImage({
      src: image.path,
      quality: this.data.quality,
      compressedWidth: 0,
      compressedHeight: 0,
      fileType: this.data.outputFormat,
      success: function(res) {
        wx.getFileInfo({
          filePath: res.tempFilePath,
          success: function(fileInfo) {
            var originalBytes = image.size
            var ratio = originalBytes > 0 ? ((1 - fileInfo.size / originalBytes) * 100).toFixed(1) : 0
            
            that.setData({
              processedImagePath: res.tempFilePath,
              compressResult: {
                originalSize: image.sizeText,
                compressedSize: that.formatFileSize(fileInfo.size),
                savedSize: that.formatFileSize(Math.max(0, originalBytes - fileInfo.size)),
                ratio: Math.max(0, ratio),
                dimensions: image.width + '×' + image.height
              }
            })

            wx.showToast({ title: that.data.i18n.compressDone, icon: 'success' })
            var tracker = getApp().tracker
            if (tracker) tracker.toolUse(21, '图片处理', false)
          }
        })
      },
      fail: function() {
        wx.showToast({ title: that.data.i18n.compressFailed, icon: 'none' })
      },
      complete: function() {
        that.setData({ isProcessing: false })
      }
    })
  },

  onTargetWidthInput: function(e) {
    var width = e.detail.value
    this.setData({ targetWidth: width })

    if (this.data.isLockedRatio && width) {
      var image = this.getCurrentImage()
      if (image.width && image.height) {
        var ratio = image.height / image.width
        var height = Math.round(parseInt(width) * ratio)
        this.setData({ 
          targetHeight: height.toString(), 
          scalePercent: Math.round(parseInt(width) / image.width * 100) 
        })
      }
    }
  },

  onTargetHeightInput: function(e) {
    var height = e.detail.value
    this.setData({ targetHeight: height })

    if (this.data.isLockedRatio && height) {
      var image = this.getCurrentImage()
      if (image.width && image.height) {
        var ratio = image.width / image.height
        var width = Math.round(parseInt(height) * ratio)
        this.setData({ 
          targetWidth: width.toString(), 
          scalePercent: Math.round(parseInt(height) / image.height * 100) 
        })
      }
    }
  },

  onScalePercentChange: function(e) {
    var percent = e.detail.value ? parseInt(e.detail.value) : parseInt(e.currentTarget.dataset.percent)
    if (!percent) return
    
    var image = this.getCurrentImage()
    
    if (image.width && image.height) {
      var newWidth = Math.round(image.width * percent / 100)
      var newHeight = Math.round(image.height * percent / 100)
      
      this.setData({
        scalePercent: percent,
        targetWidth: newWidth.toString(),
        targetHeight: newHeight.toString()
      })
    } else {
      this.setData({ scalePercent: percent })
    }
  },

  toggleLockRatio: function() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ isLockedRatio: !this.data.isLockedRatio })
  },

  selectPresetSize: function(e) {
    wx.vibrateShort({ type: 'light' })
    var width = parseInt(e.currentTarget.dataset.width)
    var height = parseInt(e.currentTarget.dataset.height)
    var image = this.getCurrentImage()
    
    this.setData({
      targetWidth: width.toString(),
      targetHeight: height.toString(),
      scalePercent: image.width ? Math.round(width / image.width * 100) : 100
    })
  },

  resizeImage: function() {
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }

    var width = parseInt(this.data.targetWidth)
    var height = parseInt(this.data.targetHeight)

    if (!width || !height || width <= 0 || height <= 0) {
      wx.showToast({ title: this.data.i18n.inputValidSize, icon: 'none' })
      return
    }

    this.setData({ isProcessing: true })
    var that = this

    this.drawCanvas({
      imagePath: image.path,
      width: width,
      height: height,
      success: function(tempFilePath) {
        that.setData({ processedImagePath: tempFilePath, isProcessing: false })
        wx.showToast({ title: that.data.i18n.resizeDone, icon: 'success' })
        var tracker = getApp().tracker
        if (tracker) tracker.toolUse(21, '图片处理', false)
      },
      fail: function() {
        that.setData({ isProcessing: false })
        wx.showToast({ title: that.data.i18n.resizeFailed, icon: 'none' })
      }
    })
  },

  switchStitchMode: function(e) {
    var mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ stitchMode: mode })
  },

  onStitchGapChange: function(e) {
    this.setData({ stitchGap: parseInt(e.detail.value) })
  },

  setStitchBgColor: function(e) {
    var color = e.currentTarget.dataset.color
    this.setData({ stitchBgColor: color, stitchGapColor: color })
  },

  setStitchGapColor: function(e) {
    var color = e.currentTarget.dataset.color
    this.setData({ stitchGapColor: color })
  },

  onStitchBorderRadiusChange: function(e) {
    this.setData({ stitchBorderRadius: parseInt(e.detail.value) })
  },

  moveStitchImageUp: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    if (index <= 0) return
    wx.vibrateShort({ type: 'light' })
    var images = this.data.stitchImages.slice()
    var temp = images[index]
    images[index] = images[index - 1]
    images[index - 1] = temp
    this.setData({ stitchImages: images })
  },

  moveStitchImageDown: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    if (index >= this.data.stitchImages.length - 1) return
    wx.vibrateShort({ type: 'light' })
    var images = this.data.stitchImages.slice()
    var temp = images[index]
    images[index] = images[index + 1]
    images[index + 1] = temp
    this.setData({ stitchImages: images })
  },

  stitchImages: function() {
    if (this.data.stitchImages.length < 2) {
      wx.showToast({ title: this.data.i18n.selectAtLeast2, icon: 'none' })
      return
    }

    var unloadedImages = []
    for (var ui = 0; ui < this.data.stitchImages.length; ui++) {
      var uimg = this.data.stitchImages[ui]
      if (uimg.width === 0 || uimg.height === 0) unloadedImages.push(uimg)
    }
    if (unloadedImages.length > 0) {
      wx.showToast({ title: this.data.i18n.imageLoading, icon: 'none' })
      var that = this
      setTimeout(function() { that.stitchImages() }, 500)
      return
    }

    this.setData({ isProcessing: true })

    var mode = this.data.stitchMode
    var gap = this.data.stitchGap || 0
    var bgColor = this.data.stitchBgColor

    if (mode === 'grid') {
      this.stitchGrid(gap, bgColor)
    } else if (mode === 'long') {
      this.stitchLong(gap, bgColor)
    } else {
      this.stitchLinear(mode, gap, bgColor)
    }
  },

  stitchLinear: function(mode, gap, bgColor) {
    var self = this
    var images = this.data.stitchImages
    var maxWidth = 0
    var maxHeight = 0

    for (var fidx = 0; fidx < images.length; fidx++) {
      if (images[fidx].width > maxWidth) maxWidth = images[fidx].width
      if (images[fidx].height > maxHeight) maxHeight = images[fidx].height
    }

    var totalWidthSum = 0
    for (var twi = 0; twi < images.length; twi++) totalWidthSum += images[twi].width
    var totalHeightSum = 0
    for (var thi = 0; thi < images.length; thi++) totalHeightSum += images[thi].height

    var totalWidth = mode === 'horizontal' 
      ? totalWidthSum + gap * (images.length - 1)
      : maxWidth
    var totalHeight = mode === 'vertical'
      ? totalHeightSum + gap * (images.length - 1)
      : maxHeight

    this.drawCanvas({
      width: totalWidth,
      height: totalHeight,
      bgColor: bgColor,
      drawCallback: function(ctx, canvas) {
        var offset = 0
        var loadedCount = 0

        for (var slIdx = 0; slIdx < images.length; slIdx++) {
          (function(img, index) {
            var imgObj = canvas.createImage()
            imgObj.onload = function() {
              loadedCount++
              
              if (mode === 'horizontal') {
                ctx.drawImage(imgObj, offset, 0, img.width, img.height)
                offset += img.width + gap
              } else {
                ctx.drawImage(imgObj, 0, offset, img.width, img.height)
                offset += img.height + gap
              }

              if (loadedCount === images.length) {
                setTimeout(function() {
                  self.exportToTempFile(canvas, totalWidth, totalHeight, function(path) {
                    self.setData({ stitchResult: path, isProcessing: false })
                    wx.showToast({ title: self.data.i18n.stitchDone, icon: 'success' })
                    var tracker = getApp().tracker
                    if (tracker) tracker.toolUse(21, '图片处理', false)
                  })
                }, 50)
              }
            }
            imgObj.onerror = function() {
              self.setData({ isProcessing: false })
              wx.showToast({ title: self.data.i18n.imageLoadFailed, icon: 'none' })
            }
            imgObj.src = img.path
          })(images[slIdx], slIdx)
        }
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: self.data.i18n.stitchFailed, icon: 'none' })
      }
    })
  },

  stitchGrid: function(gap, bgColor) {
    var self = this
    var images = this.data.stitchImages
    var count = images.length
    var cols = Math.ceil(Math.sqrt(count))
    var rows = Math.ceil(count / cols)

    var maxWidth = 0
    var maxHeight = 0
    for (var sgfi = 0; sgfi < images.length; sgfi++) {
      if (images[sgfi].width > maxWidth) maxWidth = images[sgfi].width
      if (images[sgfi].height > maxHeight) maxHeight = images[sgfi].height
    }

    var cellWidth = maxWidth
    var cellHeight = maxHeight
    var totalWidth = cols * cellWidth + gap * (cols - 1)
    var totalHeight = rows * cellHeight + gap * (rows - 1)

    this.drawCanvas({
      width: totalWidth,
      height: totalHeight,
      bgColor: bgColor,
      drawCallback: function(ctx, canvas) {
        var loadedCount = 0

        for (var sgi = 0; sgi < images.length; sgi++) {
          (function(img, index) {
            var row = Math.floor(index / cols)
            var col = index % cols
            var x = col * (cellWidth + gap)
            var y = row * (cellHeight + gap)

            var imgObj = canvas.createImage()
            imgObj.onload = function() {
              loadedCount++
              ctx.drawImage(imgObj, x, y, cellWidth, cellHeight)

              if (loadedCount === count) {
                setTimeout(function() {
                  self.exportToTempFile(canvas, totalWidth, totalHeight, function(path) {
                    self.setData({ stitchResult: path, isProcessing: false })
                    wx.showToast({ title: self.data.i18n.stitchDone, icon: 'success' })
                    var tracker = getApp().tracker
                    if (tracker) tracker.toolUse(21, '图片处理', false)
                  })
                }, 50)
              }
            }
            imgObj.onerror = function() {
              self.setData({ isProcessing: false })
              wx.showToast({ title: self.data.i18n.imageLoadFailed, icon: 'none' })
            }
            imgObj.src = img.path
          })(images[sgi], sgi)
        }
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: self.data.i18n.stitchFailed, icon: 'none' })
      }
    })
  },

  stitchLong: function(gap, bgColor) {
    var self = this
    var images = this.data.stitchImages
    var targetWidth = 0
    for (var li = 0; li < images.length; li++) {
      if (images[li].width > targetWidth) targetWidth = images[li].width
    }

    var scaledInfo = []
    var totalHeight = 0
    for (var si = 0; si < images.length; si++) {
      var ratio = targetWidth / images[si].width
      var scaledH = Math.round(images[si].height * ratio)
      scaledInfo.push({ y: totalHeight, height: scaledH })
      totalHeight += scaledH + gap
    }
    totalHeight -= gap

    this.drawCanvas({
      width: targetWidth,
      height: totalHeight,
      bgColor: bgColor,
      drawCallback: function(ctx, canvas) {
        var loadedCount = 0

        for (var lIdx = 0; lIdx < images.length; lIdx++) {
          (function(img, index) {
            var imgObj = canvas.createImage()
            imgObj.onload = function() {
              loadedCount++
              ctx.drawImage(imgObj, 0, scaledInfo[index].y, targetWidth, scaledInfo[index].height)

              if (loadedCount === images.length) {
                setTimeout(function() {
                  self.exportToTempFile(canvas, targetWidth, totalHeight, function(path) {
                    self.setData({ stitchResult: path, isProcessing: false })
                    wx.showToast({ title: self.data.i18n.longStitchDone, icon: 'success' })
                    var tracker = getApp().tracker
                    if (tracker) tracker.toolUse(21, '图片处理', false)
                  })
                }, 50)
              }
            }
            imgObj.onerror = function() {
              self.setData({ isProcessing: false })
              wx.showToast({ title: self.data.i18n.imageLoadFailed, icon: 'none' })
            }
            imgObj.src = img.path
          })(images[lIdx], lIdx)
        }
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: self.data.i18n.stitchFailed, icon: 'none' })
      }
    })
  },

  selectCropMode: function(e) {
    var mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ cropMode: mode })
    if (mode === 'custom' || mode === 'idphoto') {
      this._initCropCoords()
    }
  },

  _initCropCoords: function() {
    var image = this.getCurrentImage()
    if (!image.width || !image.height) return
    var w = image.width
    var h = image.height
    if (this.data.cropMode === 'idphoto') {
      var preset = this.data.idPhotoPresets[this.data.selectedIdPhoto]
      var ratio = preset.width / preset.height
      var cropH = h
      var cropW = Math.round(h * ratio)
      if (cropW > w) {
        cropW = w
        cropH = Math.round(w / ratio)
      }
      var x = Math.round((w - cropW) / 2)
      var y = Math.round((h - cropH) / 2)
      this.setData({ cropX: x, cropY: y, cropW: cropW, cropH: cropH })
    } else {
      this.setData({ cropX: 0, cropY: 0, cropW: w, cropH: h })
    }
    this._updateCropPreview()
  },

  onCropXInput: function(e) {
    var val = parseInt(e.detail.value) || 0
    this.setData({ cropX: val })
    this._updateCropPreview()
  },

  onCropYInput: function(e) {
    var val = parseInt(e.detail.value) || 0
    this.setData({ cropY: val })
    this._updateCropPreview()
  },

  onCropWInput: function(e) {
    var val = parseInt(e.detail.value) || 0
    this.setData({ cropW: val })
    this._updateCropPreview()
  },

  onCropHInput: function(e) {
    var val = parseInt(e.detail.value) || 0
    this.setData({ cropH: val })
    this._updateCropPreview()
  },

  selectIdPhotoPreset: function(e) {
    var idx = parseInt(e.currentTarget.dataset.index)
    wx.vibrateShort({ type: 'light' })
    this.setData({ selectedIdPhoto: idx })
    this._initCropCoords()
  },

  _updateCropPreview: function() {
    var image = this.getCurrentImage()
    if (!image.width || !image.height) return
    var imgW = image.width
    var imgH = image.height
    var cx = this.data.cropX
    var cy = this.data.cropY
    var cw = this.data.cropW
    var ch = this.data.cropH
    var previewMaxW = 300
    var previewMaxH = 200
    var scale = Math.min(previewMaxW / imgW, previewMaxH / imgH)
    var displayW = Math.round(imgW * scale)
    var displayH = Math.round(imgH * scale)
    var left = Math.round(cx * scale)
    var top = Math.round(cy * scale)
    var width = Math.round(cw * scale)
    var height = Math.round(ch * scale)
    var style = 'position:relative;width:' + displayW + 'px;height:' + displayH + 'px;'
    this.setData({ cropPreviewStyle: style, cropPreviewLeft: left, cropPreviewTop: top, cropPreviewWidth: width, cropPreviewHeight: height })
  },

  cropImage: function() {
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: this.data.i18n.imageLoading, icon: 'none' })
      var that = this
      setTimeout(function() { that.cropImage() }, 500)
      return
    }

    this.setData({ isProcessing: true })

    var mode = this.data.cropMode
    var cropWidth = image.width
    var cropHeight = image.height
    var offsetX = 0
    var offsetY = 0

    if (mode === 'custom' || mode === 'idphoto') {
      offsetX = this.data.cropX
      offsetY = this.data.cropY
      cropWidth = this.data.cropW
      cropHeight = this.data.cropH
      if (!cropWidth || !cropHeight || cropWidth <= 0 || cropHeight <= 0) {
        this.setData({ isProcessing: false })
        wx.showToast({ title: this.data.i18n.setValidCropArea, icon: 'none' })
        return
      }
      if (offsetX + cropWidth > image.width || offsetY + cropHeight > image.height) {
        this.setData({ isProcessing: false })
        wx.showToast({ title: this.data.i18n.cropAreaOutOfRange, icon: 'none' })
        return
      }
    } else if (mode === 'square' || mode === 'circle' || mode === '11') {
      var minDim = Math.min(image.width, image.height)
      cropWidth = minDim
      cropHeight = minDim
      offsetX = (image.width - minDim) / 2
      offsetY = (image.height - minDim) / 2
    } else if (mode === '169') {
      cropHeight = Math.round(image.width * 9 / 16)
      offsetY = (image.height - cropHeight) / 2
    } else if (mode === '43') {
      cropHeight = Math.round(image.width * 3 / 4)
      offsetY = (image.height - cropHeight) / 2
    }

    if (mode === 'circle') {
      this.cropToCircle(image, cropWidth, offsetX, offsetY)
    } else {
      var that = this
      this.drawCanvas({
        imagePath: image.path,
        width: cropWidth,
        height: cropHeight,
        sx: offsetX,
        sy: offsetY,
        sWidth: cropWidth,
        sHeight: cropHeight,
        success: function(tempFilePath) {
          that.setData({ processedImagePath: tempFilePath, isProcessing: false })
          wx.showToast({ title: that.data.i18n.cropDone, icon: 'success' })
          var tracker = getApp().tracker
          if (tracker) tracker.toolUse(21, '图片处理', false)
        },
        fail: function() {
          that.setData({ isProcessing: false })
          wx.showToast({ title: that.data.i18n.cropFailed, icon: 'none' })
        }
      })
    }
  },

  cropToCircle: function(image, diameter, offsetX, offsetY) {
    var self = this
    var size = diameter
    var center = size / 2
    var radius = center

    this.drawCanvas({
      width: size,
      height: size,
      bgColor: 'transparent',
      drawCallback: function(ctx, canvas) {
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.clip()

        var img = canvas.createImage()
        img.onload = function() {
          ctx.drawImage(img, offsetX, offsetY, diameter, diameter, 0, 0, size, size)
          
          setTimeout(function() {
            self.exportToTempFile(canvas, size, size, function(path) {
              self.setData({ processedImagePath: path, isProcessing: false })
            wx.showToast({ title: self.data.i18n.cropDone, icon: 'success' })
            var tracker = getApp().tracker
            if (tracker) tracker.toolUse(21, '图片处理', false)
            })
          }, 50)
        }
        img.onerror = function() {
          self.setData({ isProcessing: false })
          wx.showToast({ title: self.data.i18n.imageLoadFailed, icon: 'none' })
        }
        img.src = image.path
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: self.data.i18n.cropFailed, icon: 'none' })
      }
    })
  },

  rotateImage: function(e) {
    var angle
    
    if (typeof e === 'object' && e.currentTarget) {
      angle = parseInt(e.currentTarget.dataset.angle) || 90
    } else if (typeof e === 'number') {
      angle = e
    } else {
      angle = 90
    }
    
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: this.data.i18n.imageLoading, icon: 'none' })
      var that = this
      setTimeout(function() { that.rotateImage(angle) }, 500)
      return
    }

    this.setData({ isProcessing: true })

    var self = this
    var radians = (angle * Math.PI) / 180
    var sin = Math.abs(Math.sin(radians))
    var cos = Math.abs(Math.cos(radians))
    
    var newWidth = Math.ceil(image.width * cos + image.height * sin)
    var newHeight = Math.ceil(image.width * sin + image.height * cos)

    this.drawCanvas({
      width: newWidth,
      height: newHeight,
      drawCallback: function(ctx, canvas) {
        ctx.save()
        ctx.translate(newWidth / 2, newHeight / 2)
        ctx.rotate(radians)
        
        var img = canvas.createImage()
        img.onload = function() {
          try {
            ctx.drawImage(img, -image.width / 2, -image.height / 2, image.width, image.height)
            ctx.restore()
            
            setTimeout(function() {
              self.exportToTempFile(canvas, newWidth, newHeight, function(path) {
                self.setData({ processedImagePath: path, isProcessing: false })
                wx.showToast({ title: self.data.i18n.rotateDone, icon: 'success' })
                var tracker = getApp().tracker
                if (tracker) tracker.toolUse(21, '图片处理', false)
              })
            }, 100)
          } catch (drawErr) {
            self.setData({ isProcessing: false })
            wx.showToast({ title: self.data.i18n.rotateDrawFailed, icon: 'none' })
          }
        }
        img.onerror = function() {
          self.setData({ isProcessing: false })
          wx.showToast({ title: self.data.i18n.imageLoadFailed, icon: 'none' })
        }
        img.src = image.path
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: self.data.i18n.rotateFailed, icon: 'none' })
      }
    })
  },

  flipImage: function(e) {
    var direction = e && e.currentTarget ? e.currentTarget.dataset.direction : 'horizontal'
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: this.data.i18n.imageLoading, icon: 'none' })
      var that = this
      setTimeout(function() { that.flipImage(e) }, 500)
      return
    }

    this.setData({ isProcessing: true })

    var self = this

    this.drawCanvas({
      width: image.width,
      height: image.height,
      drawCallback: function(ctx, canvas) {
        ctx.save()
        
        if (direction === 'horizontal') {
          ctx.translate(image.width, 0)
          ctx.scale(-1, 1)
        } else {
          ctx.translate(0, image.height)
          ctx.scale(1, -1)
        }

        var img = canvas.createImage()
        img.onload = function() {
          try {
            ctx.drawImage(img, 0, 0, image.width, image.height)
            ctx.restore()
            
            setTimeout(function() {
              self.exportToTempFile(canvas, image.width, image.height, function(path) {
                self.setData({ processedImagePath: path, isProcessing: false })
                wx.showToast({ title: self.data.i18n.flipDone, icon: 'success' })
                var tracker = getApp().tracker
                if (tracker) tracker.toolUse(21, '图片处理', false)
              })
            }, 100)
          } catch (drawErr) {
            self.setData({ isProcessing: false })
            wx.showToast({ title: self.data.i18n.flipDrawFailed, icon: 'none' })
          }
        }
        img.onerror = function() {
          self.setData({ isProcessing: false })
          wx.showToast({ title: self.data.i18n.imageLoadFailed, icon: 'none' })
        }
        img.src = image.path
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: self.data.i18n.flipFailed, icon: 'none' })
      }
    })
  },

  selectTargetFormat: function(e) {
    wx.vibrateShort({ type: 'light' })
    var format = e.currentTarget.dataset.value || e.detail.value
    if (!format) return
    this.setData({ targetFormat: format })
    this.updateFormatInfo(format)
  },

  updateFormatInfo: function(format) {
    format = format || this.data.targetFormat
    var t = this.data.i18n

    var infoMap = {}
    infoMap['jpg'] = {
      name: 'JPEG',
      description: t.fiJpgDesc,
      features: [t.fiJpgF1, t.fiJpgF2, t.fiJpgF3]
    }
    infoMap['png'] = {
      name: 'PNG',
      description: t.fiPngDesc,
      features: [t.fiPngF1, t.fiPngF2, t.fiPngF3]
    }
    infoMap['webp'] = {
      name: 'WebP',
      description: t.fiWebpDesc,
      features: [t.fiWebpF1, t.fiWebpF2, t.fiWebpF3]
    }
    infoMap['bmp'] = {
      name: 'BMP',
      description: t.fiBmpDesc,
      features: [t.fiBmpF1, t.fiBmpF2, t.fiBmpF3]
    }

    this.setData({ formatInfo: infoMap[format] || null })
  },

  convertFormat: function() {
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }

    this.setData({ isProcessing: true })
    var that = this
    var targetFmt = this.data.targetFormat

    if (targetFmt === 'bmp') {
      this.drawCanvas({
        imagePath: image.path,
        width: image.width,
        height: image.height,
        success: function(tempFilePath) {
          that._buildConvertCompare(image, tempFilePath, function() {
            that.setData({ processedImagePath: tempFilePath, isProcessing: false })
            wx.showToast({ title: that.data.i18n.convertDone, icon: 'success' })
            var tracker = getApp().tracker
            if (tracker) tracker.toolUse(21, '图片处理', false)
          })
        },
        fail: function() {
          that.setData({ isProcessing: false })
          wx.showToast({ title: that.data.i18n.convertFailed, icon: 'none' })
        }
      })
    } else {
      wx.compressImage({
        src: image.path,
        quality: 100,
        fileType: targetFmt,
        success: function(res) {
          that._buildConvertCompare(image, res.tempFilePath, function() {
            that.setData({ processedImagePath: res.tempFilePath, isProcessing: false })
            wx.showToast({ title: that.data.i18n.convertDone, icon: 'success' })
            var tracker = getApp().tracker
            if (tracker) tracker.toolUse(21, '图片处理', false)
          })
        },
        fail: function() {
          that.setData({ isProcessing: false })
          wx.showToast({ title: that.data.i18n.convertFailed, icon: 'none' })
        }
      })
    }
  },

  _buildConvertCompare: function(originalImage, newFilePath, callback) {
    var self = this
    wx.getFileInfo({
      filePath: newFilePath,
      success: function(fileInfo) {
        var originalSize = originalImage.size || 0
        var newSize = fileInfo.size
        var diff = newSize - originalSize
        var diffText = diff > 0 ? '+' + self.formatFileSize(diff) : self.formatFileSize(Math.abs(diff))
        var ratio = originalSize > 0 ? ((diff / originalSize) * 100).toFixed(1) : '0'
        var ratioText = diff > 0 ? '+' + ratio + '%' : ratio + '%'
        self.setData({
          convertCompare: {
            originalSize: self.formatFileSize(originalSize),
            newSize: self.formatFileSize(newSize),
            diffText: diffText,
            ratioText: ratioText,
            isSmaller: diff < 0
          }
        })
        if (callback) callback()
      },
      fail: function() {
        self.setData({ convertCompare: null })
        if (callback) callback()
      }
    })
  },

  saveImage: function() {
    if (!this.data.processedImagePath && !this.data.stitchResult) {
      wx.showToast({ title: this.data.i18n.noImageToSave, icon: 'none' })
      return
    }

    var filePath = this.data.processedImagePath || this.data.stitchResult
    var that = this

    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: function() {
        wx.showToast({ title: that.data.i18n.savedToAlbum, icon: 'success' })
      },
      fail: function() {
        wx.showModal({
          title: that.data.i18n.tipTitle,
          content: that.data.i18n.needAlbumPermission,
          confirmText: that.data.i18n.goToSettings,
          success: function(res) {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  previewProcessedImage: function() {
    if (!this.data.processedImagePath && !this.data.stitchResult) return
    
    var filePath = this.data.processedImagePath || this.data.stitchResult
    
    wx.previewImage({
      urls: [filePath],
      current: filePath
    })
  },

  formatFileSize: function(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    var k = 1024
    var sizes = ['B', 'KB', 'MB', 'GB']
    var i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  drawCanvas: function(options) {
    var self = this
    var imagePath = options.imagePath
    var width = options.width
    var height = options.height
    var bgColor = options.bgColor
    var sx = options.sx
    var sy = options.sy
    var sWidth = options.sWidth
    var sHeight = options.sHeight
    var drawCallback = options.drawCallback
    var success = options.success
    var fail = options.fail

    if (!width || !height || width <= 0 || height <= 0) {
      if (fail) fail()
      return
    }

    try {
      var query = wx.createSelectorQuery()
      query.select('#imageCanvas')
        .fields({ node: true, size: true })
        .exec(function(res) {
          if (!res || !res[0]) {
            if (fail) fail()
            return
          }

          try {
            var canvas = res[0].node
            var ctx = canvas.getContext('2d')

            canvas.width = width
            canvas.height = height

            if (bgColor && bgColor !== 'transparent') {
              ctx.fillStyle = bgColor
              ctx.fillRect(0, 0, width, height)
            }

            if (drawCallback) {
              drawCallback(ctx, canvas)
            } else if (imagePath) {
              var img = canvas.createImage()
              img.onload = function() {
                try {
                  if (sx !== undefined && sy !== undefined) {
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height)
                  } else {
                    ctx.drawImage(img, 0, 0, width, height)
                  }
                  
                  setTimeout(function() {
                    self.exportToTempFile(canvas, width, height, success)
                  }, 50)
                } catch (e) {
                  if (fail) fail()
                }
              }
              img.onerror = function() {
                if (fail) fail()
              }
              img.src = imagePath
            }
          } catch (e) {
            if (fail) fail()
          }
        })
    } catch (e) {
      if (fail) fail()
    }
  },

  exportToTempFile: function(canvas, width, height, callback) {
    var that = this
    try {
      wx.canvasToTempFilePath({
        canvas: canvas,
        width: width,
        height: height,
        destWidth: width,
        destHeight: height,
        fileType: 'png',
        quality: 1,
        success: function(res) {
          if (callback) callback(res.tempFilePath)
        },
        fail: function(err) {
          wx.showToast({ title: that.data.i18n.exportFailed, icon: 'none' })
        }
      }, this)
    } catch (e) {
      wx.showToast({ title: that.data.i18n.exportError, icon: 'none' })
    }
  },
  onInfoTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab
    wx.vibrateShort({ type: 'light' })
    this.setData({ infoTab: tab })
    if (tab === 'exif' && !this.data.imageEXIF) {
      this._loadEXIFInfo()
    }
    if (tab === 'color' && this.data.imageDominantColors.length === 0) {
      this._extractDominantColors()
    }
  },

  _loadDetailInfo: function() {
    var image = this.getCurrentImage()
    if (!image.path) return
    var self = this

    wx.getImageInfo({
      src: image.path,
      success: function(imgInfo) {
        var dpi = 72
        var t = self.data.i18n
        var orientation = t.orientNormal
        if (imgInfo.orientation) {
          var orientMap = { 'up': t.orientNormal, 'up-mirrored': t.orientHMirror, 'down': t.orient180, 'down-mirrored': t.orientVMirror, 'left-mirrored': t.orientLeft90Mirror, 'right': t.orientRight90, 'right-mirrored': t.orientRight90Mirror, 'left': t.orientLeft90 }
          orientation = orientMap[imgInfo.orientation] || imgInfo.orientation
        }
        var colorSpace = 'sRGB'
        var type = imgInfo.type || 'unknown'
        if (type === 'png') colorSpace = 'sRGB + Alpha'
        var megapixels = (imgInfo.width * imgInfo.height / 1000000).toFixed(1)
        var aspectGcd = self._gcd(imgInfo.width, imgInfo.height)
        var aspectW = imgInfo.width / aspectGcd
        var aspectH = imgInfo.height / aspectGcd

        var detail = {
          width: imgInfo.width,
          height: imgInfo.height,
          megapixels: megapixels,
          aspectRatio: aspectW + ':' + aspectH,
          orientation: orientation,
          type: type,
          dpi: dpi,
          colorSpace: colorSpace
        }

        self.setData({
          imageDetailInfo: detail,
          imageDPI: dpi,
          imageColorSpace: colorSpace
        })
      }
    })
  },

  _gcd: function(a, b) {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) {
      var temp = b
      b = a % b
      a = temp
    }
    return a
  },

  _loadEXIFInfo: function() {
    var image = this.getCurrentImage()
    if (!image.path) return
    var self = this

    wx.getFileSystemManager().readFile({
      filePath: image.path,
      success: function(res) {
        var exif = self._parseEXIF(res.data)
        self.setData({ imageEXIF: exif })
      },
      fail: function() {
        self.setData({ imageEXIF: { available: false } })
      }
    })
  },

  _parseEXIF: function(buffer) {
    var t = this.data.i18n
    var result = { available: false, items: [] }
    try {
      var bytes = new Uint8Array(buffer)
      if (bytes.length < 4) return result
      var isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8
      if (!isJPEG) {
        result.items.push({ key: t.exifFormat || 'Format', value: t.exifNotJpeg })
        return result
      }
      var offset = 2
      while (offset < bytes.length - 1) {
        if (bytes[offset] !== 0xFF) break
        var marker = bytes[offset + 1]
        if (marker === 0xE1) {
          result.available = true
          var segLen = (bytes[offset + 2] << 8) | bytes[offset + 3]
          var exifStart = offset + 4
          if (bytes[exifStart] === 0x45 && bytes[exifStart + 1] === 0x78 && bytes[exifStart + 2] === 0x69 && bytes[exifStart + 3] === 0x66) {
            var tiffOffset = exifStart + 6
            var littleEndian = bytes[tiffOffset + 1] === 0x49
            var ifdOffset = this._readU16(bytes, tiffOffset + 4, littleEndian) | (this._readU16(bytes, tiffOffset + 6, littleEndian) << 16)
            this._parseIFD(bytes, tiffOffset + ifdOffset, littleEndian, tiffOffset, result.items)
          }
          break
        }
        if (marker === 0xDA || marker === 0xD9) break
        var segLen2 = (bytes[offset + 2] << 8) | bytes[offset + 3]
        offset += 2 + segLen2
      }
    } catch (e) {}
    return result
  },

  _readU16: function(bytes, offset, le) {
    if (le) return bytes[offset] | (bytes[offset + 1] << 8)
    return (bytes[offset] << 8) | bytes[offset + 1]
  },

  _readU32: function(bytes, offset, le) {
    if (le) return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)
    return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]
  },

  _parseIFD: function(bytes, offset, le, tiffBase, items) {
    var t = this.data.i18n
    var tagNames = {
      0x010F: t.exifMaker, 0x0110: t.exifModel, 0x0112: t.exifOrientation,
      0x011A: t.exifXRes, 0x011B: t.exifYRes, 0x0131: t.exifSoftware,
      0x0132: t.exifDateTime, 0x8769: t.exifIFDPointer || 'ExifIFD',
      0xA002: t.exifPixelW, 0xA003: t.exifPixelH,
      0x9003: t.exifDateOriginal, 0x9004: t.exifDateDigitized,
      0x920A: t.exifFocalLength, 0xA405: t.exifFocalLength35,
      0x829A: t.exifExposureTime, 0x829D: t.exifAperture,
      0x8827: t.exifISO, 0x9209: t.exifFlash
    }
    var orientValues = { 1: t.orientNormal, 2: t.orientHMirror, 3: t.orient180, 4: t.orientVMirror, 5: t.orientLeft90Mirror, 6: t.orientRight90, 7: t.orientRight90Mirror, 8: t.orientLeft90 }
    var flashValues = { 0: t.flashNo, 1: t.flashYes, 5: t.flashNoReturn, 7: t.flashHasReturn, 16: t.flashOff, 24: t.flashAutoOff, 25: t.flashAuto, 31: t.flashAutoReturn }

    if (offset + 2 > bytes.length) return
    var count = this._readU16(bytes, offset, le)
    var exifIFDOffset = -1

    for (var i = 0; i < count; i++) {
      var entryOffset = offset + 2 + i * 12
      if (entryOffset + 12 > bytes.length) break
      var tag = this._readU16(bytes, entryOffset, le)
      var type = this._readU16(bytes, entryOffset + 2, le)
      var count2 = this._readU32(bytes, entryOffset + 4, le)
      var valueOffset = entryOffset + 8

      if (tag === 0x8769) {
        exifIFDOffset = this._readU32(bytes, valueOffset, le)
        continue
      }

      var name = tagNames[tag]
      if (!name) continue

      var value = ''
      if (tag === 0x0112) {
        var orientVal = this._readU16(bytes, valueOffset, le)
        value = orientValues[orientVal] || orientVal.toString()
      } else if (tag === 0x9209) {
        var flashVal = this._readU16(bytes, valueOffset, le)
        value = flashValues[flashVal] || flashVal.toString()
      } else if (type === 2) {
        var strBytes = []
        var strStart = count2 > 4 ? tiffBase + this._readU32(bytes, valueOffset, le) : valueOffset
        for (var si = 0; si < count2 - 1 && strStart + si < bytes.length; si++) {
          if (bytes[strStart + si] === 0) break
          strBytes.push(String.fromCharCode(bytes[strStart + si]))
        }
        value = strBytes.join('')
      } else if (type === 3) {
        value = this._readU16(bytes, valueOffset, le).toString()
        if (tag === 0x8827) value = 'ISO ' + value
      } else if (type === 4) {
        value = this._readU32(bytes, valueOffset, le).toString()
      } else if (type === 5) {
        var num = this._readU32(bytes, tiffBase + this._readU32(bytes, valueOffset, le), le)
        var den = this._readU32(bytes, tiffBase + this._readU32(bytes, valueOffset, le) + 4, le)
        if (den > 0) {
          if (tag === 0x829A) {
            if (den >= num) value = '1/' + Math.round(den / num) + 's'
            else value = (num / den).toFixed(1) + 's'
          } else if (tag === 0x829D) {
            value = 'f/' + (num / den).toFixed(1)
          } else if (tag === 0x920A) {
            value = (num / den).toFixed(1) + 'mm'
          } else {
            value = (num / den).toFixed(2)
          }
        }
      }

      if (value) items.push({ key: name, value: value })
    }

    if (exifIFDOffset > 0) {
      this._parseIFD(bytes, tiffBase + exifIFDOffset, le, tiffBase, items)
    }
  },

  _extractDominantColors: function() {
    var image = this.getCurrentImage()
    if (!image.path || !image.width || !image.height) return
    var self = this

    this.drawCanvas({
      imagePath: image.path,
      width: image.width,
      height: image.height,
      drawCallback: function(ctx, canvas) {
        var img = canvas.createImage()
        img.onload = function() {
          ctx.drawImage(img, 0, 0, image.width, image.height)
          try {
            var sampleSize = 50
            var sampleW = Math.min(image.width, sampleSize)
            var sampleH = Math.min(image.height, sampleSize)
            var tempCanvas = wx.createOffscreenCanvas({ type: '2d', width: sampleW, height: sampleH })
            var tempCtx = tempCanvas.getContext('2d')
            tempCtx.drawImage(canvas, 0, 0, sampleW, sampleH)
            var imageData = tempCtx.getImageData(0, 0, sampleW, sampleH)
            var data = imageData.data
            var buckets = {}
            for (var pi = 0; pi < data.length; pi += 16) {
              var r = Math.round(data[pi] / 32) * 32
              var g = Math.round(data[pi + 1] / 32) * 32
              var b = Math.round(data[pi + 2] / 32) * 32
              var key = r + ',' + g + ',' + b
              if (!buckets[key]) buckets[key] = { r: r, g: g, b: b, count: 0 }
              buckets[key].count++
            }
            var sorted = []
            for (var bk in buckets) sorted.push(buckets[bk])
            sorted.sort(function(a, b) { return b.count - a.count })
            var colors = []
            var topCount = Math.min(6, sorted.length)
            for (var ti = 0; ti < topCount; ti++) {
              var c = sorted[ti]
              var hex = '#' + self._toHex(c.r) + self._toHex(c.g) + self._toHex(c.b)
              var percent = Math.round(c.count / (data.length / 16) * 100)
              colors.push({ hex: hex, r: c.r, g: c.g, b: c.b, percent: percent })
            }
            self.setData({ imageDominantColors: colors })
          } catch (e) {
            self._extractColorsFallback(ctx, image.width, image.height)
          }
        }
        img.onerror = function() {}
        img.src = image.path
      },
      fail: function() {}
    })
  },

  _extractColorsFallback: function(ctx, w, h) {
    var colors = [
      { hex: '#000000', r: 0, g: 0, b: 0, percent: 0 },
      { hex: '#FFFFFF', r: 255, g: 255, b: 255, percent: 0 }
    ]
    this.setData({ imageDominantColors: colors })
  },

  _toHex: function(n) {
    var h = Math.min(255, Math.max(0, n)).toString(16)
    return h.length < 2 ? '0' + h : h
  },

  onWmTextInput: function(e) {
    this.setData({ wmText: e.detail.value })
  },

  onWmOpacityChange: function(e) {
    this.setData({ wmOpacity: parseInt(e.detail.value) })
  },

  onWmSizeChange: function(e) {
    this.setData({ wmSize: parseInt(e.detail.value) })
  },

  onWmAngleChange: function(e) {
    this.setData({ wmAngle: parseInt(e.detail.value) })
  },

  selectWmPosition: function(e) {
    var pos = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ wmPosition: pos })
  },

  selectWmColor: function(e) {
    var color = e.currentTarget.dataset.color
    this.setData({ wmColor: color })
  },

  onWmModeChange: function(e) {
    var mode = e.currentTarget.dataset.mode
    wx.vibrateShort({ type: 'light' })
    this.setData({ wmMode: mode })
  },

  applyWatermark: function() {
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: this.data.i18n.selectImageFirst, icon: 'none' })
      return
    }
    if (!this.data.wmText.trim()) {
      wx.showToast({ title: this.data.i18n.inputWatermarkText, icon: 'none' })
      return
    }

    this.setData({ isProcessing: true })
    var that = this
    var w = image.width
    var h = image.height

    this.drawCanvas({
      imagePath: image.path,
      width: w,
      height: h,
      drawCallback: function(ctx, canvas) {
        var img = canvas.createImage()
        img.onload = function() {
          ctx.drawImage(img, 0, 0, w, h)

          var text = that.data.wmText
          var fontSize = that.data.wmSize
          var opacity = that.data.wmOpacity / 100
          var color = that.data.wmColor
          var angle = that.data.wmAngle
          var mode = that.data.wmMode
          var position = that.data.wmPosition

          ctx.save()
          ctx.globalAlpha = opacity
          ctx.font = 'bold ' + fontSize + 'px sans-serif'
          ctx.fillStyle = color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          if (mode === 'tile') {
            var spacing = fontSize * 5
            var diagonal = Math.sqrt(w * w + h * h)
            ctx.translate(w / 2, h / 2)
            ctx.rotate(angle * Math.PI / 180)
            for (var ty = -diagonal; ty < diagonal; ty += spacing) {
              for (var tx = -diagonal; tx < diagonal; tx += spacing) {
                ctx.fillText(text, tx, ty)
              }
            }
          } else {
            var px = 0
            var py = 0
            var margin = fontSize * 1.5
            if (position === 'top-left') { px = margin; py = margin; ctx.textAlign = 'left'; ctx.textBaseline = 'top' }
            else if (position === 'top-right') { px = w - margin; py = margin; ctx.textAlign = 'right'; ctx.textBaseline = 'top' }
            else if (position === 'center') { px = w / 2; py = h / 2 }
            else if (position === 'bottom-left') { px = margin; py = h - margin; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom' }
            else if (position === 'bottom-right') { px = w - margin; py = h - margin; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom' }

            if (angle !== 0) {
              ctx.translate(px, py)
              ctx.rotate(angle * Math.PI / 180)
              ctx.fillText(text, 0, 0)
            } else {
              ctx.fillText(text, px, py)
            }
          }
          ctx.restore()

          setTimeout(function() {
            that.exportToTempFile(canvas, w, h, function(path) {
              that.setData({ processedImagePath: path, isProcessing: false })
              wx.showToast({ title: that.data.i18n.watermarkDone, icon: 'success' })
              var tracker = getApp().tracker
              if (tracker) tracker.toolUse(21, '图片处理', false)
            })
          }, 50)
        }
        img.onerror = function() {
          that.setData({ isProcessing: false })
          wx.showToast({ title: that.data.i18n.imageLoadFailed, icon: 'none' })
        }
        img.src = image.path
      },
      fail: function() {
        that.setData({ isProcessing: false })
        wx.showToast({ title: that.data.i18n.watermarkFailed, icon: 'none' })
      }
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig(this.data.i18n.shareTitle, '/package-dev/image-processor/image-processor')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig(this.data.i18n.shareTitle)
  }
})