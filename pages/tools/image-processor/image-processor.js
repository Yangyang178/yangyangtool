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

  onLoad() {
    this.updateFormatInfo()
  },

  switchFunction(e) {
    const funcId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ currentFunction: funcId })
  },

  chooseImage() {
    const maxCount = this.data.currentFunction === 'stitch' ? 9 : 1
    const self = this
    
    console.log('[ImageProcessor] 开始选择图片 | 最大数量:', maxCount)
    
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        console.log('[ImageProcessor] 选择成功 | 文件数:', res.tempFilePaths.length)
        
        if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
          wx.showToast({ title: '未选择图片', icon: 'none' })
          return
        }
        
        const newImages = res.tempFilePaths.map((path) => ({
          path: path,
          size: 0,
          sizeText: '加载中...',
          width: 0,
          height: 0
        }))

        self.handleSelectedImages(newImages)
      },
      fail: function(err) {
        const errMsg = err.errMsg || ''
        
        if (errMsg.includes('cancel')) {
          console.log('[ImageProcessor] 用户取消选择')
          return
        }
        
        if (errMsg.includes('deny') || errMsg.includes('denied') || errMsg.includes('auth')) {
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
        
        console.error('[ImageProcessor] 选择失败:', JSON.stringify(err))
      }
    })
  },

  handleSelectedImages(newImages) {
    console.log('[ImageProcessor] 处理选中的图片 | 数量:', newImages.length)
    
    if (this.data.currentFunction === 'stitch') {
      const currentStitchImages = [...this.data.stitchImages, ...newImages]
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
      title: newImages.length > 1 ? `已选择${newImages.length}张图片` : '图片加载成功', 
      icon: 'success' 
    })
  },

  loadStitchImagesInfo(startIndex) {
    const images = [...this.data.stitchImages]
    
    for (let i = startIndex; i < images.length; i++) {
      wx.getImageInfo({
        src: images[i].path,
        success: (imgInfo) => {
          images[i] = {
            ...images[i],
            width: imgInfo.width,
            height: imgInfo.height
          }
          this.setData({ stitchImages: images })
        },
        fail: () => {
          console.warn(`Failed to load image info for index ${i}`)
        }
      })
    }
  },

  loadImageInfo(index) {
    if (!this.data.images[index]) return
    
    wx.getImageInfo({
      src: this.data.images[index].path,
      success: (imgInfo) => {
        const images = [...this.data.images]
        images[index] = {
          ...images[index],
          width: imgInfo.width,
          height: imgInfo.height
        }
        
        this.setData({
          images: images,
          targetWidth: imgInfo.width.toString(),
          targetHeight: imgInfo.height.toString()
        })
      }
    })
  },

  switchCurrentImage(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ 
      currentImageIndex: index,
      processedImagePath: '',
      compressResult: null
    })
    this.loadImageInfo(index)
  },

  removeImage(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    wx.vibrateShort({ type: 'light' })
    
    let images = [...this.data.images]
    images.splice(index, 1)
    
    this.setData({
      images: images,
      currentImageIndex: Math.min(index, Math.max(0, images.length - 1)),
      processedImagePath: ''
    })
  },

  removeStitchImage(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    wx.vibrateShort({ type: 'light' })
    
    let stitchImages = [...this.data.stitchImages]
    stitchImages.splice(index, 1)
    this.setData({ stitchImages })
  },

  clearStitchImages() {
    if (this.data.stitchImages.length === 0) return
    
    wx.vibrateShort({ type: 'medium' })
    
    wx.showModal({
      title: '确认清除',
      content: `确定要清除全部 ${this.data.stitchImages.length} 张图片吗？`,
      confirmText: '确认清除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          this.setData({
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

  clearAllImages() {
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

  getCurrentImage() {
    return this.data.images[this.data.currentImageIndex] || {}
  },

  onQualityChange(e) {
    this.setData({ quality: parseInt(e.detail.value) })
  },

  selectQualityPreset(e) {
    const quality = parseInt(e.currentTarget.dataset.value)
    wx.vibrateShort({ type: 'light' })
    this.setData({ quality })
  },

  selectOutputFormat(e) {
    wx.vibrateShort({ type: 'light' })
    const format = e.currentTarget.dataset.value
    if (format) {
      this.setData({ outputFormat: format })
    }
  },

  compressImage() {
    const image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    this.setData({ isProcessing: true, compressResult: null })

    wx.compressImage({
      src: image.path,
      quality: this.data.quality,
      compressedWidth: 0,
      compressedHeight: 0,
      fileType: this.data.outputFormat,
      success: (res) => {
        wx.getFileInfo({
          filePath: res.tempFilePath,
          success: (fileInfo) => {
            const originalBytes = image.size
            const ratio = originalBytes > 0 ? ((1 - fileInfo.size / originalBytes) * 100).toFixed(1) : 0
            
            this.setData({
              processedImagePath: res.tempFilePath,
              compressResult: {
                originalSize: image.sizeText,
                compressedSize: this.formatFileSize(fileInfo.size),
                savedSize: this.formatFileSize(Math.max(0, originalBytes - fileInfo.size)),
                ratio: Math.max(0, ratio),
                dimensions: `${image.width}×${image.height}`
              }
            })

            wx.showToast({ title: '压缩完成！', icon: 'success' })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '压缩失败，请重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ isProcessing: false })
      }
    })
  },

  onTargetWidthInput(e) {
    const width = e.detail.value
    this.setData({ targetWidth: width })

    if (this.data.isLockedRatio && width) {
      const image = this.getCurrentImage()
      if (image.width && image.height) {
        const ratio = image.height / image.width
        const height = Math.round(parseInt(width) * ratio)
        this.setData({ 
          targetHeight: height.toString(), 
          scalePercent: Math.round(parseInt(width) / image.width * 100) 
        })
      }
    }
  },

  onTargetHeightInput(e) {
    const height = e.detail.value
    this.setData({ targetHeight: height })

    if (this.data.isLockedRatio && height) {
      const image = this.getCurrentImage()
      if (image.width && image.height) {
        const ratio = image.width / image.height
        const width = Math.round(parseInt(height) * ratio)
        this.setData({ 
          targetWidth: width.toString(), 
          scalePercent: Math.round(parseInt(height) / image.height * 100) 
        })
      }
    }
  },

  onScalePercentChange(e) {
    let percent = e.detail.value ? parseInt(e.detail.value) : parseInt(e.currentTarget.dataset.percent)
    if (!percent) return
    
    const image = this.getCurrentImage()
    
    if (image.width && image.height) {
      const newWidth = Math.round(image.width * percent / 100)
      const newHeight = Math.round(image.height * percent / 100)
      
      this.setData({
        scalePercent: percent,
        targetWidth: newWidth.toString(),
        targetHeight: newHeight.toString()
      })
    } else {
      this.setData({ scalePercent: percent })
    }
  },

  toggleLockRatio() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ isLockedRatio: !this.data.isLockedRatio })
  },

  selectPresetSize(e) {
    wx.vibrateShort({ type: 'light' })
    const width = parseInt(e.currentTarget.dataset.width)
    const height = parseInt(e.currentTarget.dataset.height)
    const image = this.getCurrentImage()
    
    this.setData({
      targetWidth: width.toString(),
      targetHeight: height.toString(),
      scalePercent: image.width ? Math.round(width / image.width * 100) : 100
    })
  },

  resizeImage() {
    const image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    const width = parseInt(this.data.targetWidth)
    const height = parseInt(this.data.targetHeight)

    if (!width || !height || width <= 0 || height <= 0) {
      wx.showToast({ title: '请输入有效的尺寸', icon: 'none' })
      return
    }

    this.setData({ isProcessing: true })

    this.drawCanvas({
      imagePath: image.path,
      width: width,
      height: height,
      success: (tempFilePath) => {
        this.setData({ processedImagePath: tempFilePath, isProcessing: false })
        wx.showToast({ title: '尺寸调整完成！', icon: 'success' })
      },
      fail: () => {
        this.setData({ isProcessing: false })
        wx.showToast({ title: '调整失败，请重试', icon: 'none' })
      }
    })
  },

  switchStitchMode(e) {
    const mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ stitchMode: mode })
  },

  onStitchGapChange(e) {
    this.setData({ stitchGap: parseInt(e.detail.value) })
  },

  setStitchBgColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ stitchBgColor: color })
  },

  stitchImages() {
    if (this.data.stitchImages.length < 2) {
      wx.showToast({ title: '请至少选择2张图片', icon: 'none' })
      return
    }

    const unloadedImages = this.data.stitchImages.filter(img => img.width === 0 || img.height === 0)
    if (unloadedImages.length > 0) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
      setTimeout(() => this.stitchImages(), 500)
      return
    }

    this.setData({ isProcessing: true })

    const mode = this.data.stitchMode
    const gap = this.data.stitchGap || 0
    const bgColor = this.data.stitchBgColor

    if (mode === 'grid') {
      this.stitchGrid(gap, bgColor)
    } else {
      this.stitchLinear(mode, gap, bgColor)
    }
  },

  stitchLinear(mode, gap, bgColor) {
    const self = this
    const images = this.data.stitchImages
    let maxWidth = 0
    let maxHeight = 0

    images.forEach(img => {
      if (img.width > maxWidth) maxWidth = img.width
      if (img.height > maxHeight) maxHeight = img.height
    })

    const totalWidth = mode === 'horizontal' 
      ? images.reduce((sum, img) => sum + img.width, 0) + gap * (images.length - 1)
      : maxWidth
    const totalHeight = mode === 'vertical'
      ? images.reduce((sum, img) => sum + img.height, 0) + gap * (images.length - 1)
      : maxHeight

    this.drawCanvas({
      width: totalWidth,
      height: totalHeight,
      bgColor: bgColor,
      drawCallback: function(ctx, canvas) {
        let offset = 0
        let loadedCount = 0

        images.forEach((img, index) => {
          const imgObj = canvas.createImage()
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
                  wx.showToast({ title: '拼接完成！', icon: 'success' })
                })
              }, 50)
            }
          }
          imgObj.onerror = function() {
            self.setData({ isProcessing: false })
            wx.showToast({ title: '图片加载失败', icon: 'none' })
          }
          imgObj.src = img.path
        })
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: '拼接失败', icon: 'none' })
      }
    })
  },

  stitchGrid(gap, bgColor) {
    const self = this
    const images = this.data.stitchImages
    const count = images.length
    const cols = Math.ceil(Math.sqrt(count))
    const rows = Math.ceil(count / cols)

    let maxWidth = 0
    let maxHeight = 0
    images.forEach(img => {
      if (img.width > maxWidth) maxWidth = img.width
      if (img.height > maxHeight) maxHeight = img.height
    })

    const cellWidth = maxWidth
    const cellHeight = maxHeight
    const totalWidth = cols * cellWidth + gap * (cols - 1)
    const totalHeight = rows * cellHeight + gap * (rows - 1)

    this.drawCanvas({
      width: totalWidth,
      height: totalHeight,
      bgColor: bgColor,
      drawCallback: function(ctx, canvas) {
        let loadedCount = 0

        images.forEach((img, index) => {
          const row = Math.floor(index / cols)
          const col = index % cols
          const x = col * (cellWidth + gap)
          const y = row * (cellHeight + gap)

          const imgObj = canvas.createImage()
          imgObj.onload = function() {
            loadedCount++
            ctx.drawImage(imgObj, x, y, cellWidth, cellHeight)

            if (loadedCount === count) {
              setTimeout(function() {
                self.exportToTempFile(canvas, totalWidth, totalHeight, function(path) {
                  self.setData({ stitchResult: path, isProcessing: false })
                  wx.showToast({ title: '拼接完成！', icon: 'success' })
                })
              }, 50)
            }
          }
          imgObj.onerror = function() {
            self.setData({ isProcessing: false })
            wx.showToast({ title: '图片加载失败', icon: 'none' })
          }
          imgObj.src = img.path
        })
      },
      fail: function() {
        self.setData({ isProcessing: false })
        wx.showToast({ title: '拼接失败', icon: 'none' })
      }
    })
  },

  selectCropMode(e) {
    const mode = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ cropMode: mode })
  },

  cropImage() {
    const image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
      setTimeout(() => this.cropImage(), 500)
      return
    }

    this.setData({ isProcessing: true })

    const mode = this.data.cropMode
    let cropWidth = image.width
    let cropHeight = image.height
    let offsetX = 0
    let offsetY = 0

    if (mode === 'square' || mode === 'circle' || mode === '11') {
      const minDim = Math.min(image.width, image.height)
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
      this.drawCanvas({
        imagePath: image.path,
        width: cropWidth,
        height: cropHeight,
        sx: offsetX,
        sy: offsetY,
        sWidth: cropWidth,
        sHeight: cropHeight,
        success: (tempFilePath) => {
          this.setData({ processedImagePath: tempFilePath, isProcessing: false })
          wx.showToast({ title: '裁剪完成！', icon: 'success' })
        },
        fail: () => {
          this.setData({ isProcessing: false })
          wx.showToast({ title: '裁剪失败', icon: 'none' })
        }
      })
    }
  },

  cropToCircle(image, diameter, offsetX, offsetY) {
    const self = this
    const size = diameter
    const center = size / 2
    const radius = center

    this.drawCanvas({
      width: size,
      height: size,
      bgColor: 'transparent',
      drawCallback: function(ctx, canvas) {
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.clip()

        const img = canvas.createImage()
        img.onload = function() {
          ctx.drawImage(img, offsetX, offsetY, diameter, diameter, 0, 0, size, size)
          
          setTimeout(function() {
            self.exportToTempFile(canvas, size, size, function(path) {
              self.setData({ processedImagePath: path, isProcessing: false })
              wx.showToast({ title: '裁剪完成！', icon: 'success' })
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

  rotateImage(e) {
    let angle
    
    if (typeof e === 'object' && e.currentTarget) {
      angle = parseInt(e.currentTarget.dataset.angle) || 90
    } else if (typeof e === 'number') {
      angle = e
    } else {
      angle = 90
    }
    
    const image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
      setTimeout(() => this.rotateImage(angle), 500)
      return
    }

    this.setData({ isProcessing: true })

    const self = this
    const radians = (angle * Math.PI) / 180
    const sin = Math.abs(Math.sin(radians))
    const cos = Math.abs(Math.cos(radians))
    
    const newWidth = Math.ceil(image.width * cos + image.height * sin)
    const newHeight = Math.ceil(image.width * sin + image.height * cos)

    console.log('[Rotate] 角度:', angle, '° | 原始尺寸:', image.width, '×', image.height, '| 新尺寸:', newWidth, '×', newHeight)

    this.drawCanvas({
      width: newWidth,
      height: newHeight,
      drawCallback: function(ctx, canvas) {
        ctx.save()
        ctx.translate(newWidth / 2, newHeight / 2)
        ctx.rotate(radians)
        
        const img = canvas.createImage()
        img.onload = function() {
          try {
            console.log('[Rotate] 图片加载成功，开始绘制')
            ctx.drawImage(img, -image.width / 2, -image.height / 2, image.width, image.height)
            ctx.restore()
            
            setTimeout(function() {
              self.exportToTempFile(canvas, newWidth, newHeight, function(path) {
                self.setData({ processedImagePath: path, isProcessing: false })
                wx.showToast({ title: '旋转完成！', icon: 'success' })
              })
            }, 100)
          } catch (drawErr) {
            console.error('[Rotate] 绘制失败:', drawErr)
            self.setData({ isProcessing: false })
            wx.showToast({ title: '旋转绘制失败', icon: 'none' })
          }
        }
        img.onerror = function(err) {
          console.error('[Rotate] 图片加载失败:', err)
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

  flipImage(e) {
    const direction = e && e.currentTarget ? e.currentTarget.dataset.direction : 'horizontal'
    const image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    if (!image.width || !image.height) {
      wx.showToast({ title: '图片加载中，请稍候...', icon: 'none' })
      setTimeout(() => this.flipImage(e), 500)
      return
    }

    this.setData({ isProcessing: true })

    const self = this

    console.log('[Flip] 方向:', direction, '| 尺寸:', image.width, '×', image.height)

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

        const img = canvas.createImage()
        img.onload = function() {
          try {
            console.log('[Flip] 图片加载成功，开始绘制')
            ctx.drawImage(img, 0, 0, image.width, image.height)
            ctx.restore()
            
            setTimeout(function() {
              self.exportToTempFile(canvas, image.width, image.height, function(path) {
                self.setData({ processedImagePath: path, isProcessing: false })
                wx.showToast({ title: '翻转完成！', icon: 'success' })
              })
            }, 100)
          } catch (drawErr) {
            console.error('[Flip] 绘制失败:', drawErr)
            self.setData({ isProcessing: false })
            wx.showToast({ title: '翻转绘制失败', icon: 'none' })
          }
        }
        img.onerror = function(err) {
          console.error('[Flip] 图片加载失败:', err)
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

  selectTargetFormat(e) {
    wx.vibrateShort({ type: 'light' })
    const format = e.currentTarget.dataset.value || e.detail.value
    if (!format) return
    this.setData({ targetFormat: format })
    this.updateFormatInfo(format)
  },

  updateFormatInfo(format) {
    format = format || this.data.targetFormat

    const infoMap = {
      jpg: {
        name: 'JPEG',
        description: '最常见的图片格式，支持有损压缩，适合照片和复杂图像。',
        features: ['有损压缩', '文件较小', '全平台兼容']
      },
      png: {
        name: 'PNG',
        description: '无损压缩格式，支持透明背景，适合图标和截图。',
        features: ['无损压缩', '支持透明', '保持清晰度']
      },
      webp: {
        name: 'WebP',
        description: 'Google开发的新一代格式，比JPG小25-35%，比PNG小80%。',
        features: ['超小体积', '高画质', '推荐使用']
      }
    }

    this.setData({ formatInfo: infoMap[format] || null })
  },

  convertFormat() {
    const image = this.getCurrentImage()
    if (!image.path) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    this.setData({ isProcessing: true })

    wx.compressImage({
      src: image.path,
      quality: 100,
      fileType: this.data.targetFormat,
      success: (res) => {
        this.setData({ processedImagePath: res.tempFilePath, isProcessing: false })
        wx.showToast({ title: '格式转换完成！', icon: 'success' })
      },
      fail: () => {
        this.setData({ isProcessing: false })
        wx.showToast({ title: '转换失败，请重试', icon: 'none' })
      }
    })
  },

  saveImage() {
    if (!this.data.processedImagePath && !this.data.stitchResult) {
      wx.showToast({ title: '没有可保存的图片', icon: 'none' })
      return
    }

    const filePath = this.data.processedImagePath || this.data.stitchResult

    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: () => {
        wx.showModal({
          title: '提示',
          content: '需要相册权限才能保存图片',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  previewProcessedImage() {
    if (!this.data.processedImagePath && !this.data.stitchResult) return
    
    const filePath = this.data.processedImagePath || this.data.stitchResult
    
    wx.previewImage({
      urls: [filePath],
      current: filePath
    })
  },

  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  drawCanvas(options) {
    const self = this
    const { 
      imagePath, width, height, bgColor, 
      sx, sy, sWidth, sHeight,
      drawCallback, success, fail
    } = options

    console.log('[Canvas] 开始绘制 | 尺寸:', width, '×', height)

    if (!width || !height || width <= 0 || height <= 0) {
      console.error('[Canvas] 无效的画布尺寸:', width, height)
      if (fail) fail()
      return
    }

    try {
      const query = wx.createSelectorQuery()
      query.select('#imageCanvas')
        .fields({ node: true, size: true })
        .exec(function(res) {
          if (!res || !res[0]) {
            console.error('[Canvas] Canvas 元素未找到')
            if (fail) fail()
            return
          }

          try {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')

            canvas.width = width
            canvas.height = height

            console.log('[Canvas] 画布已初始化 | 实际尺寸:', canvas.width, '×', canvas.height)

            if (bgColor && bgColor !== 'transparent') {
              ctx.fillStyle = bgColor
              ctx.fillRect(0, 0, width, height)
            }

            if (drawCallback) {
              drawCallback(ctx, canvas)
            } else if (imagePath) {
              const img = canvas.createImage()
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
                  console.error('Draw error:', e)
                  if (fail) fail()
                }
              }
              img.onerror = function() {
                console.error('Image load error')
                if (fail) fail()
              }
              img.src = imagePath
            }
          } catch (e) {
            console.error('Canvas setup error:', e)
            if (fail) fail()
          }
        })
    } catch (e) {
      console.error('Query error:', e)
      if (fail) fail()
    }
  },

  exportToTempFile(canvas, width, height, callback) {
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
          console.error('Export failed:', err)
          wx.showToast({ title: '导出失败', icon: 'none' })
        }
      }, this)
    } catch (e) {
      console.error('Export error:', e)
      wx.showToast({ title: '导出异常', icon: 'none' })
    }
  }
})
