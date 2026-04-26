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
    
    cropMode: 'free',
    
    targetFormat: 'webp',
    formatInfo: null,
    
    isProcessing: false,

    functions: [
      { id: 'compress', name: '压缩', icon: '🗜️' },
      { id: 'resize', name: '尺寸', icon: '📐' },
      { id: 'stitch', name: '拼接', icon: '🧩' },
      { id: 'crop', name: '裁剪', icon: '✂️' },
      { id: 'rotate', name: '旋转', icon: '🔄' },
      { id: 'convert', name: '转换', icon: '🔀' },
      { id: 'info', name: '信息', icon: 'ℹ️' }
    ],

    qualityPresets: [
      { label: '低质量', value: 30, desc: '体积最小，适合预览' },
      { label: '中等', value: 60, desc: '平衡体积和画质' },
      { label: '高质量', value: 80, desc: '推荐，适合分享' },
      { label: '原始', value: 100, desc: '最高画质' }
    ],

    outputFormats: [
      { label: 'JPG', value: 'jpg', color: '#EF4444' },
      { label: 'PNG', value: 'png', color: '#3B82F6' },
      { label: 'WebP', value: 'webp', color: '#8B5CF6' }
    ],

    presetSizes: [
      { label: '微信头像', width: 500, height: 500 },
      { label: '朋友圈', width: 1080, height: 1080 },
      { label: '微博封面', width: 920, height: 300 },
      { label: '淘宝主图', width: 800, height: 800 },
      { label: '证件照', width: 295, height: 413 },
      { label: '高清壁纸', width: 1920, height: 1080 },
      { label: 'Instagram', width: 1080, height: 1080 },
      { label: '小红书', width: 1242, height: 1660 }
    ],

    stitchModes: [
      { id: 'horizontal', name: '水平拼接', icon: '↔️' },
      { id: 'vertical', name: '垂直拼接', icon: '↕️' },
      { id: 'grid', name: '网格拼接', icon: '⊞' }
    ],

    cropModes: [
      { id: 'free', name: '自由裁剪', icon: '✂️' },
      { id: 'square', name: '正方形', icon: '⬜' },
      { id: 'circle', name: '圆形', icon: '⭕' },
      { id: '169', name: '16:9', icon: '🖥️' },
      { id: '43', name: '4:3', icon: '📺' },
      { id: '11', name: '1:1', icon: '⬛' }
    ],

    rotationOptions: [
      { angle: 90, name: '左转90°', icon: '↺' },
      { angle: 180, name: '旋转180°', icon: '🔄' },
      { angle: 270, name: '右转90°', icon: '↻' }
    ],

    allFormats: [
      { ext: '.jpg', name: 'JPEG', value: 'jpg', desc: '通用格式' },
      { ext: '.png', name: 'PNG', value: 'png', desc: '无损压缩' },
      { ext: '.webp', name: 'WebP', value: 'webp', desc: '高效压缩' }
    ]
  },

  onLoad: function() {
    this.updateFormatInfo()
  },

  switchFunction: function(e) {
    var funcId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ currentFunction: funcId })
  },

  chooseImage: function() {
    var maxCount = this.data.currentFunction === 'stitch' ? 9 : 1
    var self = this
    
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
          wx.showToast({ title: '未选择图片', icon: 'none' })
          return
        }
        
        var newImages = []
        for (var ni = 0; ni < res.tempFilePaths.length; ni++) {
          newImages.push({
            path: res.tempFilePaths[ni],
            size: 0,
            sizeText: '加载中...',
            width: 0,
            height: 0
          })
        }

        self.handleSelectedImages(newImages)
      },
      fail: function(err) {
        var errMsg = err.errMsg || ''
        
        if (errMsg.indexOf('cancel') > -1) {
          return
        }
        
        if (errMsg.indexOf('deny') > -1 || errMsg.indexOf('denied') > -1 || errMsg.indexOf('auth') > -1) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许访问相册和相机权限',
            confirmText: '去设置',
            success: function(res) {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        } else {
          wx.showToast({ title: '选择失败', icon: 'none', duration: 2000 })
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
      title: newImages.length > 1 ? '已选择' + newImages.length + '张图片' : '图片加载成功', 
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
      title: '确认清除',
      content: '确定要清除全部 ' + that.data.stitchImages.length + ' 张图片吗？',
      confirmText: '确认清除',
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            stitchImages: [],
            stitchResult: null
          })
          wx.showToast({ 
            title: '已清除全部图片', 
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
      wx.showToast({ title: '请先选择图片', icon: 'none' })
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

            wx.showToast({ title: '压缩完成', icon: 'success' })
          }
        })
      },
      fail: function() {
        wx.showToast({ title: '压缩失败，请重试', icon: 'none' })
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
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    var width = parseInt(this.data.targetWidth)
    var height = parseInt(this.data.targetHeight)

    if (!width || !height || width <= 0 || height <= 0) {
      wx.showToast({ title: '请输入有效的尺寸', icon: 'none' })
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
        wx.showToast({ title: '尺寸调整完成', icon: 'success' })
      },
      fail: function() {
        that.setData({ isProcessing: false })
        wx.showToast({ title: '调整失败，请重试', icon: 'none' })
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
    this.setData({ stitchBgColor: color })
  },

  stitchImages: function() {
    if (this.data.stitchImages.length < 2) {
      wx.showToast({ title: '请至少选择2张图片', icon: 'none' })
      return
    }

    var unloadedImages = []
    for (var ui = 0; ui < this.data.stitchImages.length; ui++) {
      var uimg = this.data.stitchImages[ui]
      if (uimg.width === 0 || uimg.height === 0) unloadedImages.push(uimg)
    }
    if (unloadedImages.length > 0) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
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
                    wx.showToast({ title: '拼接完成', icon: 'success' })
                  })
                }, 50)
              }
            }
            imgObj.onerror = function() {
              self.setData({ isProcessing: false })
              wx.showToast({ title: '图片加载失败', icon: 'none' })
            }
            imgObj.src = img.path
          })(images[slIdx], slIdx)
        }
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: '拼接失败', icon: 'none' })
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
                    wx.showToast({ title: '拼接完成', icon: 'success' })
                  })
                }, 50)
              }
            }
            imgObj.onerror = function() {
              self.setData({ isProcessing: false })
              wx.showToast({ title: '图片加载失败', icon: 'none' })
            }
            imgObj.src = img.path
          })(images[sgi], sgi)
        }
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: '拼接失败', icon: 'none' })
      }
    })
  },

  selectCropMode: function(e) {
    var mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ cropMode: mode })
  },

  cropImage: function() {
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
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

    if (mode === 'square' || mode === 'circle' || mode === '11') {
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
          wx.showToast({ title: '裁剪完成', icon: 'success' })
        },
        fail: function() {
          that.setData({ isProcessing: false })
          wx.showToast({ title: '裁剪失败', icon: 'none' })
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
              wx.showToast({ title: '裁剪完成', icon: 'success' })
            })
          }, 50)
        }
        img.onerror = function() {
          self.setData({ isProcessing: false })
          wx.showToast({ title: '图片加载失败', icon: 'none' })
        }
        img.src = image.path
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: '裁剪失败', icon: 'none' })
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
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
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
                wx.showToast({ title: '旋转完成', icon: 'success' })
              })
            }, 100)
          } catch (drawErr) {
            self.setData({ isProcessing: false })
            wx.showToast({ title: '旋转绘制失败', icon: 'none' })
          }
        }
        img.onerror = function() {
          self.setData({ isProcessing: false })
          wx.showToast({ title: '图片加载失败', icon: 'none' })
        }
        img.src = image.path
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: '旋转失败', icon: 'none' })
      }
    })
  },

  flipImage: function(e) {
    var direction = e && e.currentTarget ? e.currentTarget.dataset.direction : 'horizontal'
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
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
                wx.showToast({ title: '翻转完成', icon: 'success' })
              })
            }, 100)
          } catch (drawErr) {
            self.setData({ isProcessing: false })
            wx.showToast({ title: '翻转绘制失败', icon: 'none' })
          }
        }
        img.onerror = function() {
          self.setData({ isProcessing: false })
          wx.showToast({ title: '图片加载失败', icon: 'none' })
        }
        img.src = image.path
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: '翻转失败', icon: 'none' })
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

    var infoMap = {}
    infoMap['jpg'] = {
      name: 'JPEG',
      description: '最常见的图片格式，支持有损压缩，适合照片和复杂图像',
      features: ['有损压缩', '文件较小', '全平台兼容']
    }
    infoMap['png'] = {
      name: 'PNG',
      description: '无损压缩格式，支持透明背景，适合图标和截图',
      features: ['无损压缩', '支持透明', '保持清晰度']
    }
    infoMap['webp'] = {
      name: 'WebP',
      description: 'Google开发的新一代格式，比JPG小25-35%，比PNG小26%',
      features: ['超小体积', '高质量', '推荐使用']
    }

    this.setData({ formatInfo: infoMap[format] || null })
  },

  convertFormat: function() {
    var image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    this.setData({ isProcessing: true })
    var that = this

    wx.compressImage({
      src: image.path,
      quality: 100,
      fileType: this.data.targetFormat,
      success: function(res) {
        that.setData({ processedImagePath: res.tempFilePath, isProcessing: false })
        wx.showToast({ title: '格式转换完成', icon: 'success' })
      },
      fail: function() {
        that.setData({ isProcessing: false })
        wx.showToast({ title: '转换失败，请重试', icon: 'none' })
      }
    })
  },

  saveImage: function() {
    if (!this.data.processedImagePath && !this.data.stitchResult) {
      wx.showToast({ title: '没有可保存的图片', icon: 'none' })
      return
    }

    var filePath = this.data.processedImagePath || this.data.stitchResult
    var that = this

    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: function() {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: function() {
        wx.showModal({
          title: '提示',
          content: '需要相册权限才能保存图片',
          confirmText: '去设置',
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
          wx.showToast({ title: '导出失败', icon: 'none' })
        }
      }, this)
    } catch (e) {
      wx.showToast({ title: '导出异常', icon: 'none' })
    }
  },
  onShareAppMessage: function() {
    return { title: '图片处理 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline: function() {
    return { title: '' }
  }
})