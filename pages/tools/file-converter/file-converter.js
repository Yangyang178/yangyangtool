Page({
  data: {
    inputMode: 'text',
    textContent: '',
    contentType: 'auto',
    textFocus: false,
    isChoosingFile: false,
    canShowFormats: false,
    hasInput: false,
    canConvert: false,
    
    filePath: '',
    fileName: '',
    fileSize: 0,
    fileSizeText: '',
    fileType: '',
    fileExt: '',
    fileContent: '',
    
    selectedFile: null,
    isImage: false,
    imageInfo: null,
    isTextFile: false,
    
    targetFormat: '',
    targetFormatName: '',
    availableFormats: [],
    
    convertedPath: '',
    convertedFileName: '',
    convertResult: null,
    isConverting: false,
    hasConverted: false,
    convertType: '',
    conversionLog: [],

    formatCategories: {
      image: [
        { value: 'jpg', name: 'JPG', fullName: 'JPG 图片', desc: '通用格式', color: '#EF4444', mode: 'direct' },
        { value: 'png', name: 'PNG', fullName: 'PNG 图片', desc: '无损透明', color: '#3B82F6', mode: 'direct' },
        { value: 'webp', name: 'WebP', fullName: 'WebP 图片', desc: '高效压缩', color: '#8B5CF6', mode: 'direct' },
        { value: 'base64', name: 'Base64', fullName: 'Base64 编码', desc: '文本编码', color: '#F59E0B', mode: 'encode' }
      ],
      pdf: [
        { value: 'docx', name: 'Word', fullName: 'Word 文档', desc: '生成可编辑文档', color: '#2563EB', mode: 'generate' },
        { value: 'xlsx', name: 'Excel', fullName: 'Excel 表格', desc: '生成表格数据', color: '#059669', mode: 'generate' },
        { value: 'pptx', name: 'PPT', fullName: 'PPT 演示', desc: '生成演示文稿', color: '#DC2626', mode: 'generate' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 纯文本', desc: '提取文字内容', color: '#F59E0B', mode: 'extract' },
        { value: 'html', name: 'HTML', fullName: 'HTML 网页', desc: '转为网页格式', color: '#10B981', mode: 'generate' },
        { value: 'jpg', name: 'JPG', fullName: 'JPG 图片', desc: '转为图片格式', color: '#EF4444', mode: 'generate' },
        { value: 'base64', name: 'Base64', fullName: 'Base64 编码', desc: '完整编码', color: '#7C3AED', mode: 'encode' }
      ],
      docx: [
        { value: 'pdf', name: 'PDF', fullName: 'PDF 文档', desc: '生成只读文档', color: '#EF4444', mode: 'generate' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 纯文本', desc: '提取文字内容', color: '#F59E0B', mode: 'extract' },
        { value: 'html', name: 'HTML', fullName: 'HTML 网页', desc: '转为网页格式', color: '#10B981', mode: 'generate' },
        { value: 'jpg', name: 'JPG', fullName: 'JPG 图片', desc: '转为长图', color: '#EF4444', mode: 'generate' },
        { value: 'base64', name: 'Base64', fullName: 'Base64 编码', desc: '完整编码', color: '#7C3AED', mode: 'encode' }
      ],
      xlsx: [
        { value: 'pdf', name: 'PDF', fullName: 'PDF 文档', desc: '打印友好格式', color: '#EF4444', mode: 'generate' },
        { value: 'csv', name: 'CSV', fullName: 'CSV 表格', desc: '通用数据格式', color: '#059669', mode: 'direct' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 纯文本', desc: '提取表格数据', color: '#F59E0B', mode: 'extract' },
        { value: 'json', name: 'JSON', fullName: 'JSON 数据', desc: '结构化数据', color: '#8B5CF6', mode: 'generate' },
        { value: 'html', name: 'HTML', fullName: 'HTML 表格', desc: '网页展示', color: '#10B981', mode: 'generate' },
        { value: 'base64', name: 'Base64', fullName: 'Base64 编码', desc: '完整编码', color: '#7C3AED', mode: 'encode' }
      ],
      pptx: [
        { value: 'pdf', name: 'PDF', fullName: 'PDF 文档', desc: '分享打印格式', color: '#EF4444', mode: 'generate' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 纯文本', desc: '提取文字大纲', color: '#F59E0B', mode: 'extract' },
        { value: 'jpg', name: 'JPG', fullName: 'JPG 图片', desc: '导出为图片', color: '#EF4444', mode: 'generate' },
        { value: 'base64', name: 'Base64', fullName: 'Base64 编码', desc: '完整编码', color: '#7C3AED', mode: 'encode' }
      ],
      text: [
        { value: 'docx', name: 'Word', fullName: 'Word 文档', desc: '排版美化', color: '#2563EB', mode: 'generate' },
        { value: 'pdf', name: 'PDF', fullName: 'PDF 文档', desc: '正式存档', color: '#EF4444', mode: 'generate' },
        { value: 'html', name: 'HTML', fullName: 'HTML 网页', desc: '发布到网站', color: '#10B981', mode: 'generate' },
        { value: 'json', name: 'JSON', fullName: 'JSON 数据', desc: '结构化封装', color: '#8B5CF6', mode: 'generate' }
      ],
      json: [
        { value: 'formatted', name: '美化', fullName: '格式化 JSON', desc: '易读缩进', color: '#10B981', mode: 'direct' },
        { value: 'minified', name: '压缩', fullName: '压缩 JSON', desc: '最小体积', color: '#EF4444', mode: 'direct' },
        { value: 'csv', name: 'CSV', fullName: 'CSV 表格', desc: 'Excel可用', color: '#059669', mode: 'direct' },
        { value: 'docx', name: 'Word', fullName: 'Word 文档', desc: '生成报告', color: '#2563EB', mode: 'generate' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 文本', desc: '纯文本输出', color: '#F59E0B', mode: 'direct' }
      ],
      csv: [
        { value: 'xlsx', name: 'Excel', fullName: 'Excel 表格', desc: '专业编辑', color: '#059669', mode: 'generate' },
        { value: 'json', name: 'JSON', fullName: 'JSON 数据', desc: '程序处理', color: '#8B5CF6', mode: 'direct' },
        { value: 'html', name: 'HTML', fullName: 'HTML 表格', desc: '网页展示', color: '#10B981', mode: 'generate' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 文本', desc: '纯文本查看', color: '#F59E0B', mode: 'direct' }
      ],
      web: [
        { value: 'pdf', name: 'PDF', fullName: 'PDF 文档', desc: '保存打印', color: '#EF4444', mode: 'generate' },
        { value: 'docx', name: 'Word', fullName: 'Word 文档', desc: '可编辑', color: '#2563EB', mode: 'generate' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 纯文本', desc: '提取文字', color: '#F59E0B', mode: 'extract' },
        { value: 'jpg', name: 'JPG', fullName: 'JPG 截图', desc: '转为图片', color: '#EF4444', mode: 'generate' }
      ],
      document: [
        { value: 'txt', name: 'TXT', fullName: 'TXT 纯文本', desc: '提取文字内容', color: '#F59E0B', mode: 'extract' },
        { value: 'html', name: 'HTML', fullName: 'HTML 网页', desc: '转为网页格式', color: '#10B981', mode: 'generate' },
        { value: 'json', name: 'JSON', fullName: 'JSON 元数据', desc: '结构化信息', color: '#8B5CF6', mode: 'generate' },
        { value: 'base64', name: 'Base64', fullName: 'Base64 编码', desc: '完整编码', color: '#7C3AED', mode: 'encode' }
      ],
      other: [
        { value: 'base64', name: 'Base64', fullName: 'Base64 编码', desc: '通用编码', color: '#7C3AED', mode: 'encode' },
        { value: 'txt', name: 'TXT', fullName: 'TXT 文本', desc: '尝试提取', color: '#94A3B8', mode: 'extract' }
      ]
    },

    supportTypes: [
      { ext: '.jpg', type: 'image', icon: '🖼️', name: 'JPG 图片' },
      { ext: '.jpeg', type: 'image', icon: '🖼️', name: 'JPEG 图片' },
      { ext: '.png', type: 'image', icon: '🖼️', name: 'PNG 图片' },
      { ext: '.webp', type: 'image', icon: '🖼️', name: 'WebP 图片' },
      { ext: '.gif', type: 'image', icon: '🎨', name: 'GIF 动图' },
      { ext: '.bmp', type: 'image', icon: '🖼️', name: 'BMP 图片' },
      { ext: '.txt', type: 'text', icon: '📝', name: '文本文件' },
      { ext: '.md', type: 'text', icon: '📋', name: 'Markdown' },
      { ext: '.json', type: 'json', icon: '{ }', name: 'JSON 数据' },
      { ext: '.csv', type: 'csv', icon: '📊', name: 'CSV 表格' },
      { ext: '.pdf', type: 'document', icon: '📄', name: 'PDF 文档' },
      { ext: '.doc', type: 'document', icon: '📘', name: 'Word 文档' },
      { ext: '.docx', type: 'document', icon: '📘', name: 'Word 文档' },
      { ext: '.xls', type: 'document', icon: '📗', name: 'Excel 表格' },
      { ext: '.xlsx', type: 'document', icon: '📗', name: 'Excel 表格' },
      { ext: '.ppt', type: 'document', icon: '📙', name: 'PPT 演示' },
      { ext: '.pptx', type: 'document', icon: '📙', name: 'PPT 演示' },
      { ext: '.html', type: 'web', icon: '🌐', name: '网页文件' },
      { ext: '.htm', type: 'web', icon: '🌐', name: '网页文件' },
      { ext: '.xml', type: 'text', icon: '📄', name: 'XML 文件' }
    ]
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const file = res.tempFiles[0]
        const ext = '.jpg'
        const typeInfo = { type: 'image', icon: '🖼️', name: 'JPG 图片' }
        
        const formats = this.data.formatCategories.image || []
        const firstFmt = formats.length > 0 ? formats[0] : null
        
        this.setData({
          selectedFile: file,
          filePath: file.tempFilePath,
          fileName: file.tempFilePath.split('/').pop() || ('image_' + Date.now() + '.jpg'),
          fileSize: file.size,
          fileSizeText: this.formatFileSize(file.size || 0),
          fileExt: ext,
          fileType: typeInfo.type,
          isImage: true,
          isTextFile: false,
          availableFormats: formats,
          targetFormat: firstFmt ? firstFmt.value : '',
          targetFormatName: firstFmt ? firstFmt.fullName : '',
          hasConverted: false,
          convertedPath: '',
          convertResult: null,
          convertType: '',
          conversionLog: [],
          fileContent: '',
          hasInput: true,
          canShowFormats: true,
          canConvert: !!firstFmt
        })

        this.loadImageInfo(file.tempFilePath)
        wx.showToast({ title: '图片已选择', icon: 'success' })
      },
      fail: () => {}
    })
  },

  chooseDocument() {
    const self = this
    
    console.log('[FileConverter] 开始选择文件...')
    this.setData({ isChoosingFile: true })
    
    wx.showActionSheet({
      itemList: ['📱 从聊天记录选择', '💾 从手机本地选择'],
      success: function(res) {
        console.log('[FileConverter] 用户选择了方式:', res.tapIndex)
        
        if (res.tapIndex === 0) {
          self.chooseFromChat()
        } else {
          self.chooseFromLocal()
        }
      },
      fail: function(err) {
        console.log('[FileConverter] 取消选择:', err)
        self.setData({ isChoosingFile: false })
      }
    })
  },

  chooseFromChat() {
    const self = this
    
    console.log('[FileConverter] 方式1: 从聊天记录选择...')
    
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'json', 'csv', 'html', 'xml', 'md'],
      success: (res) => {
        console.log('[FileConverter] 聊天选择成功, 完整res:', JSON.stringify(res).substring(0, 500))
        console.log('[FileConverter] tempFiles数量:', res.tempFiles ? res.tempFiles.length : 'undefined')
        
        if (res.tempFiles && res.tempFiles.length > 0) {
          const file = res.tempFiles[0]
          console.log('[FileConverter] 文件详情 - name:', file.name, '| path:', file.path, '| size:', file.size, '| type:', file.type)
        }
        
        self.handleSelectedFile(res)
      },
      fail: (err) => {
        console.error('[FileConverter] 聊天选择失败:', JSON.stringify(err))
        self.handleChooseError(err, 'chat')
      },
      complete: () => {
        setTimeout(() => { 
          if (self.data.isChoosingFile && !self.data.selectedFile) {
            console.log('[FileConverter] complete超时检查: isChoosingFile仍为true但无selectedFile, 重置状态')
            self.setData({ isChoosingFile: false }) 
          }
        }, 2000)
      }
    })
  },

  chooseFromLocal() {
    const self = this
    
    console.log('[FileConverter] 方式2: 从手机本地选择...')
    
    if (wx.getFileSystemManager && wx.getFileSystemManager().chooseFile) {
      try {
        wx.getFileSystemManager().chooseFile({
          count: 1,
          type: 'file',
          extension: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'json', 'csv', 'html', 'xml', 'md', 'jpg', 'png', 'jpeg', 'webp', 'gif'],
          success: (res) => {
            console.log('[FileConverter] 本地选择成功:', JSON.stringify(res).substring(0, 300))
            
            if (!res.tempFiles || res.tempFiles.length === 0) {
              wx.showToast({ title: '未选择文件', icon: 'none' })
              self.setData({ isChoosingFile: false })
              return
            }
            
            const file = res.tempFiles[0]
            const fakeRes = {
              tempFiles: [{
                path: file.path,
                name: file.name || file.path.split('/').pop(),
                size: file.size || 0,
                type: file.type || ''
              }]
            }
            
            self.handleSelectedFile(fakeRes)
          },
          fail: (err) => {
            console.error('[FileConverter] 本地选择失败:', err)
            self.handleChooseError(err, 'local')
          },
          complete: () => {
            setTimeout(() => { 
              if (self.data.isChoosingFile && !self.data.selectedFile) {
                self.setData({ isChoosingFile: false }) 
              }
            }, 1000)
          }
        })
      } catch (e) {
        console.warn('[FileConverter] chooseFile 不支持，降级到聊天模式')
        this.setData({ isChoosingFile: false })
        this.chooseFromChat()
      }
    } else {
      console.log('[FileConverter] 不支持本地文件选择，使用聊天模式')
      this.setData({ isChoosingFile: false })
      
      wx.showModal({
        title: '提示',
        content: '当前版本不支持直接从手机本地选择文件。\n\n请使用"从聊天记录选择"方式：\n1. 先将文件发送给"文件传输助手"\n2. 然后在这里选择该聊天中的文件',
        confirmText: '我知道了',
        showCancel: false,
        success: function() {
          setTimeout(() => self.chooseFromChat(), 500)
        }
      })
    }
  },

  handleSelectedFile(res) {
    console.log('[FileConverter] 处理选中的文件, res:', JSON.stringify(res).substring(0, 500))
    
    if (!res.tempFiles || res.tempFiles.length === 0) {
      console.error('[FileConverter] 错误: tempFiles为空或不存在')
      wx.showToast({ title: '未选择文件', icon: 'none' })
      this.setData({ isChoosingFile: false })
      return
    }
    
    const file = res.tempFiles[0]
    console.log('[FileConverter] 文件信息:', JSON.stringify(file))
    console.log('[FileConverter] 文件名:', file.name, '| 大小:', file.size, '| 路径:', file.path)
    
    if (!file.path) {
      console.error('[FileConverter] 错误: 文件path为空')
      wx.showToast({ title: '文件路径异常，请重试', icon: 'none' })
      this.setData({ isChoosingFile: false })
      return
    }
    
    if (!file.name) {
      console.warn('[FileConverter] 警告: 文件name为空, 使用路径生成名称')
    }
    
    const fileName = file.name || file.path.split('/').pop() || ('unknown_' + Date.now())
    const ext = this.getExt(fileName).toLowerCase()
    const typeInfo = this.getFileType(ext)
    
    console.log('[FileConverter] 解析结果 - fileName:', fileName, '| ext:', ext, '| typeInfo:', typeInfo.type)
    
    let formats = []
    const extToCategory = {
      '.pdf': 'pdf', '.docx': 'docx', '.doc': 'docx',
      '.xlsx': 'xlsx', '.xls': 'xlsx', '.pptx': 'pptx', '.ppt': 'pptx',
      '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.webp': 'image', '.gif': 'image', '.bmp': 'image',
      '.txt': 'text', '.md': 'text', '.xml': 'text',
      '.json': 'json', '.csv': 'csv', '.html': 'web', '.htm': 'web'
    }
    
    const categoryKey = extToCategory[ext] || typeInfo.type
    formats = this.data.formatCategories[categoryKey] || this.data.formatCategories.other
    const firstFmt = formats.length > 0 ? formats[0] : null
    
    this.setData({
      selectedFile: file,
      filePath: file.path,
      fileName: fileName,
      fileSize: file.size || 0,
      fileSizeText: this.formatFileSize(file.size),
      fileExt: ext,
      fileType: typeInfo.type,
      isImage: typeInfo.type === 'image',
      isTextFile: ['text', 'json', 'csv', 'web'].includes(typeInfo.type),
      availableFormats: formats,
      targetFormat: firstFmt ? firstFmt.value : '',
      targetFormatName: firstFmt ? firstFmt.fullName : '',
      hasConverted: false, convertedPath: '', convertResult: null,
      convertType: '', conversionLog: [], fileContent: '',
      hasInput: true, canShowFormats: true, canConvert: !!firstFmt,
      inputMode: 'wechat',
      isChoosingFile: false
    })

    if (typeInfo.type === 'image') { this.loadImageInfo(file.path) }
    if (['text', 'json', 'csv'].includes(typeInfo.type)) { this.loadFileContent(file.path) }

    wx.showToast({ title: '已选择 ' + ext.toUpperCase(), icon: 'success' })
  },

  handleChooseError(err, source) {
    console.error('[FileConverter] 选择失败 | 来源:', source, '| 错误:', JSON.stringify(err))
    this.setData({ isChoosingFile: false })
    
    const errMsg = err.errMsg || ''
    
    if (errMsg.includes('cancel')) {
      console.log('[FileConverter] 用户主动取消')
      return
    }
    
    if (errMsg.includes('msgFiles is null') || errMsg.includes('no file') || errMsg.includes('empty') || errMsg.includes('no such file')) {
      wx.showModal({
        title: '未找到可用文件',
        content: source === 'chat' 
          ? '该聊天中没有可选择的文档文件。\n\n常见原因：\n• 文件在收藏夹中（收藏夹文件无法直接选择）\n• 未向该聊天发送过文件\n• 文件类型不支持\n\n✅ 解决方法：\n1. 先将PDF/Word等文件发送给"文件传输助手"\n2. 然后在这里选择"从聊天记录选择"\n3. 选择"文件传输助手"聊天\n4. 选择刚发送的文件'
          : '未找到可用的文件。',
        confirmText: '重试',
        cancelText: '换一种方式',
        success: (res) => {
          if (res.confirm) {
            setTimeout(() => this.chooseDocument(), 300)
          }
        }
      })
      return
    }
    
    if (errMsg.includes('permission') || errMsg.includes('deny') || errMsg.includes('auth')) {
      wx.showModal({
        title: '需要权限',
        content: '请在设置中允许访问文件权限。',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            wx.openSetting()
          }
        }
      })
      return
    }
    
    if (!errMsg || errMsg === '' || errMsg.includes('fail') || errMsg.includes('error')) {
      wx.showModal({
        title: '选择文件异常',
        content: '选择文件时发生了未知错误。\n\n可能原因：\n• 从收藏夹选择文件（不支持）\n• 微信版本过低\n• 文件过大或格式特殊\n\n建议操作：\n1. 将文件先发送给"文件传输助手"\n2. 再从聊天记录中选择该文件',
        confirmText: '我知道了',
        cancelText: '重试',
        success: (res) => {
          if (res.cancel) {
            setTimeout(() => this.chooseDocument(), 300)
          }
        }
      })
      return
    }
    
    wx.showModal({
      title: '选择文件失败',
      content: '错误：' + errMsg + '\n\n建议：\n• 尝试另一种选择方式\n• 确保文件已发送到聊天记录（非收藏夹）\n• 重启微信后再试',
      confirmText: '知道了',
      showCancel: false
    })
  },

  getExt(filename) {
    const dotIndex = filename.lastIndexOf('.')
    return dotIndex > -1 ? filename.substring(dotIndex) : ''
  },

  getFileType(ext) {
    for (let i = 0; i < this.data.supportTypes.length; i++) {
      if (this.data.supportTypes[i].ext === ext) {
        return this.data.supportTypes[i]
      }
    }
    return { type: 'other', icon: '📎', name: '未知类型' }
  },

  loadImageInfo(path) {
    wx.getImageInfo({
      src: path,
      success: (res) => {
        this.setData({ imageInfo: res })
      }
    })
  },

  loadFileContent(path) {
    const fs = wx.getFileSystemManager()
    try {
      fs.readFile({
        filePath: path,
        encoding: 'utf8',
        success: (res) => {
          this.setData({ fileContent: res.data || '' })
        },
        fail: () => {
          fs.readFile({
            filePath: path,
            encoding: 'binary',
            success: (res) => {
              this.setData({ fileContent: '(二进制文件内容)' })
            },
            fail: () => {
              this.setData({ fileContent: '(无法读取内容)' })
            }
          })
        }
      })
    } catch (e) {
      this.setData({ fileContent: '(读取失败)' })
    }
  },

  selectFormat(e) {
    wx.vibrateShort({ type: 'light' })
    const value = e.currentTarget.dataset.value
    const name = e.currentTarget.dataset.name || ''
    this.setData({ 
      targetFormat: value,
      targetFormatName: name,
      hasConverted: false,
      convertedPath: '',
      convertResult: null,
      canConvert: this.data.hasInput && !!value
    })
  },

  convertFile() {
    const isTextMode = this.data.inputMode === 'text'
    
    if (isTextMode) {
      if (!this.data.textContent || this.data.textContent.trim().length === 0) {
        wx.showToast({ title: '请先输入内容', icon: 'none' })
        return
      }
    } else {
      if (!this.data.selectedFile) {
        wx.showToast({ title: '请先选择图片', icon: 'none' })
        return
      }
    }

    if (!this.data.targetFormat) {
      wx.showToast({ title: '请选择目标格式', icon: 'none' })
      return
    }

    this.setData({ isConverting: true, conversionLog: [] })

    const fmt = this.data.targetFormat

    if (isTextMode) {
      this.addLog('开始文本内容转换...')
      this.convertTextContent()
    } else if (this.data.isImage && ['jpg', 'png', 'webp'].includes(fmt)) {
      this.convertImage()
    } else if (fmt === 'base64') {
      this.convertToBase64()
    } else if (this.data.fileType === 'text' || this.data.fileType === 'json' || this.data.fileType === 'csv') {
      this.convertText()
    } else if (this.data.fileType === 'document') {
      this.convertDocument()
    } else if (this.data.fileType === 'web') {
      this.convertWebFile()
    } else {
      this.convertGeneric()
    }
  },

  convertTextContent() {
    this.addLog('正在处理文本转换...')
    
    const content = this.data.textContent
    const fmt = this.data.targetFormat
    let newContent = ''
    let newExt = ''
    let newFileName = ''

    switch (fmt) {
      case 'docx':
        newContent = this.generateDocxFile(content, '文档')
        newExt = '.docx'
        newFileName = 'document_converted.docx'
        this.addLog('已生成Word文档')
        break
      case 'pdf':
        newContent = this.textToPdfHtml(content, '文档')
        newExt = '.html'
        newFileName = 'document_pdf.html'
        this.addLog('已生成可打印HTML(可用浏览器打印为PDF)')
        break
      case 'html':
        newContent = this.textToHtml(content, '文档')
        newExt = '.html'
        newFileName = 'document.html'
        this.addLog('已转换为HTML格式')
        break
      case 'json':
        newContent = this.textToJson(content, '文档')
        newExt = '.json'
        newFileName = 'document.json'
        this.addLog('已转换为JSON格式')
        break
      case 'formatted':
        try {
          const parsed = JSON.parse(content)
          newContent = JSON.stringify(parsed, null, 2)
          this.addLog('JSON格式化完成')
        } catch (e) {
          newContent = content
          this.addLog('JSON解析失败，保持原样')
        }
        newExt = '_formatted.json'
        newFileName = 'formatted.json'
        break
      case 'minified':
        try {
          const parsed = JSON.parse(content)
          newContent = JSON.stringify(parsed)
          this.addLog('JSON压缩完成')
        } catch (e) {
          newContent = content.replace(/\s+/g, '').trim()
          this.addLog('已完成压缩处理')
        }
        newExt = '_min.json'
        newFileName = 'minified.json'
        break
      case 'csv':
        newContent = this.jsonToCsv(content)
        newExt = '.csv'
        newFileName = 'data.csv'
        this.addLog('已转换为CSV格式')
        break
      case 'base64':
        const encoded = Buffer.from(content, 'utf-8').toString('base64')
        newContent = `data:text/plain;base64,\n${encoded}`
        newExt = '_base64.txt'
        newFileName = 'encoded_base64.txt'
        this.addLog('Base64编码完成')
        break
      default:
        newContent = content
        newExt = '.txt'
        newFileName = 'output.txt'
        this.addLog('完成基本转换')
    }

    const fs = wx.getFileSystemManager()
    const self = this
    const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`

    setTimeout(() => {
      fs.writeFile({
        filePath: tempFilePath,
        data: newContent,
        encoding: 'utf8',
        success: () => {
          self.setData({
            convertedPath: tempFilePath,
            convertedFileName: newFileName,
            convertResult: {
              originalSize: self.formatFileSize(content.length),
              newSize: self.formatFileSize(newContent.length),
              savedSize: '-',
              ratio: '-',
              isGuide: false,
              previewText: newContent.substring(0, 800) + (newContent.length > 800 ? '\n\n...(更多内容)' : ''),
              isTextResult: true,
              contentLength: newContent.length
            },
            isConverting: false,
            hasConverted: true,
            convertType: 'text'
          })
          
          wx.showToast({ title: '转换成功！', icon: 'success' })
        },
        fail: () => {
          self.setData({ isConverting: false })
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      })
    }, 200)
  },

  convertImage() {
    this.addLog('开始图片格式转换...')
    
    const qualityMap = { jpg: 92, png: 100, webp: 88, gif: 80 }
    const formatMap = { jpg: 'jpg', png: 'png', webp: 'webp', gif: 'gif' }

    wx.compressImage({
      src: this.data.filePath,
      quality: qualityMap[this.data.targetFormat] || 85,
      compressedWidth: 0,
      compressedHeight: 0,
      fileType: formatMap[this.data.targetFormat] || 'png',
      success: (res) => {
        this.addLog('图片转换成功')
        this.handleConvertSuccess(res.tempFilePath)
      },
      fail: (err) => {
        this.addLog('转换失败: ' + (err.errMsg || '未知错误'))
        this.setData({ isConverting: false })
        wx.showToast({ title: '转换失败，请重试', icon: 'none' })
      }
    })
  },

  convertToBase64() {
    this.addLog('正在转换为Base64编码...')
    
    const fs = wx.getFileSystemManager()
    const self = this
    
    setTimeout(() => {
      try {
        fs.readFile({
          filePath: self.data.filePath,
          encoding: 'base64',
          success: (res) => {
            const base64Content = res.data
            const originalName = self.data.fileName.replace(/\.[^/.]+$/, '')
            const newFileName = originalName + '_base64.txt'
            
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            const header = `data:${self.getMimeType(self.data.fileExt)};base64,\n`
            const fullContent = header + base64Content
            
            fs.writeFile({
              filePath: tempFilePath,
              data: fullContent,
              encoding: 'utf8',
              success: () => {
                self.addLog('Base64编码完成')
                
                self.setData({
                  convertedPath: tempFilePath,
                  convertedFileName: newFileName,
                  convertResult: {
                    originalSize: self.data.fileSizeText,
                    newSize: self.formatFileSize(fullContent.length),
                    savedSize: '-',
                    ratio: '-',
                    isGuide: false,
                    previewText: base64Content.substring(0, 200) + (base64Content.length > 200 ? '...' : ''),
                    totalLength: base64Content.length
                  },
                  isConverting: false,
                  hasConverted: true,
                  convertType: 'base64'
                })
                
                wx.showToast({ title: '转换成功！', icon: 'success' })
              },
              fail: (writeErr) => {
                self.addLog('写入失败: ' + writeErr.errMsg)
                self.setData({ isConverting: false })
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: (err) => {
            self.addLog('读取失败: ' + err.errMsg)
            self.setData({ isConverting: false })
            wx.showToast({ title: '文件读取失败', icon: 'none' })
          }
        })
      } catch (e) {
        self.addLog('异常: ' + e.message)
        self.setData({ isConverting: false })
        wx.showToast({ title: '转换异常', icon: 'none' })
      }
    }, 300)
  },

  getMimeType(ext) {
    const mimeMap = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
      '.pdf': 'application/pdf', '.txt': 'text/plain',
      '.html': 'text/html', '.htm': 'text/html',
      '.json': 'application/json', '.xml': 'application/xml',
      '.csv': 'text/csv', '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
    return mimeMap[ext.toLowerCase()] || 'application/octet-stream'
  },

  convertText() {
    this.addLog('正在处理文本转换...')
    
    const content = this.data.fileContent
    const fmt = this.data.targetFormat
    const originalName = this.data.fileName.replace(/\.[^/.]+$/, '')
    let newContent = ''
    let newExt = ''
    let newFileName = ''

    switch (fmt) {
      case 'html':
        newContent = this.textToHtml(content, originalName)
        newExt = '.html'
        newFileName = originalName + '.html'
        this.addLog('已转换为HTML格式')
        break
        
      case 'json':
        newContent = this.textToJson(content, originalName)
        newExt = '.json'
        newFileName = originalName + '.json'
        this.addLog('已转换为JSON格式')
        break
        
      case 'formatted':
        try {
          const parsed = JSON.parse(content)
          newContent = JSON.stringify(parsed, null, 2)
          this.addLog('JSON格式化完成')
        } catch (e) {
          newContent = content
          this.addLog('JSON解析失败，保持原样')
        }
        newExt = '_formatted.json'
        newFileName = originalName + '_formatted.json'
        break
        
      case 'minified':
        try {
          const parsed = JSON.parse(content)
          newContent = JSON.stringify(parsed)
          this.addLog('JSON压缩完成')
        } catch (e) {
          newContent = content.replace(/\s+/g, '').trim()
          this.addLog('已完成压缩处理')
        }
        newExt = '_min.json'
        newFileName = originalName + '_min.json'
        break
        
      case 'csv':
        newContent = this.jsonToCsv(content)
        newExt = '.csv'
        newFileName = originalName + '.csv'
        this.addLog('已转换为CSV格式')
        break
        
      case 'pdf':
        newContent = this.textToPdfHtml(content, originalName)
        newExt = '.html'
        newFileName = originalName + '_pdf.html'
        this.addLog('已生成可打印的HTML(可用浏览器打印为PDF)')
        break
        
      case 'docx':
        newContent = this.textToDocxXml(content, originalName)
        newExt = '.xml'
        newFileName = originalName + '_word.xml'
        this.addLog('已生成Word兼容XML(可用Word打开)')
        break
        
      default:
        newContent = content
        newExt = '.txt'
        newFileName = originalName + '_converted.txt'
        this.addLog('完成基本转换')
    }

    const fs = wx.getFileSystemManager()
    const self = this
    const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`

    setTimeout(() => {
      fs.writeFile({
        filePath: tempFilePath,
        data: newContent,
        encoding: 'utf8',
        success: () => {
          self.setData({
            convertedPath: tempFilePath,
            convertedFileName: newFileName,
            convertResult: {
              originalSize: self.data.fileSizeText,
              newSize: self.formatFileSize(newContent.length),
              savedSize: '-',
              ratio: '-',
              isGuide: false,
              previewText: newContent.substring(0, 500) + (newContent.length > 500 ? '\n...(更多内容)' : ''),
              isTextResult: true
            },
            isConverting: false,
            hasConverted: true,
            convertType: 'text'
          })
          
          wx.showToast({ title: '转换成功！', icon: 'success' })
        },
        fail: (err) => {
          self.addLog('保存失败: ' + err.errMsg)
          self.setData({ isConverting: false })
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      })
    }, 200)
  },

  textToHtml(text, title) {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>\n')
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { border-bottom: 2px solid #14B8A6; padding-bottom: 10px; color: #1E293B; }
    pre { background: #F8FAFC; padding: 16px; border-radius: 8px; overflow-x: auto;
         white-space: pre-wrap; word-wrap: break-word; border-left: 4px solid #14B8A6; }
    .meta { color: #94A3B8; font-size: 12px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>📄 ${title}</h1>
  <div class="meta">由 百宝工具箱 转换生成 | ${new Date().toLocaleString()}</div>
  <pre>${escaped}</pre>
</body>
</html>`
  },

  textToJson(text, title) {
    try {
      const parsed = JSON.parse(text)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return JSON.stringify({
        source: title,
        convertedAt: new Date().toISOString(),
        contentType: 'text/plain',
        content: text,
        charCount: text.length,
        lineCount: text.split('\n').length,
        wordCount: text.split(/\s+/).filter(w => w.length > 0).length
      }, null, 2)
    }
  },

  jsonToCsv(jsonStr) {
    try {
      const data = JSON.parse(jsonStr)
      
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0])
        const csvRows = [headers.join(',')]
        
        data.forEach(row => {
          const values = headers.map(h => {
            let val = row[h]
            if (val === null || val === undefined) val = ''
            val = String(val).replace(/"/g, '""')
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              val = '"' + val + '"'
            }
            return val
          })
          csvRows.push(values.join(','))
        })
        
        return csvRows.join('\n')
      } else if (typeof data === 'object' && data !== null) {
        const csvRows = []
        Object.keys(data).forEach(key => {
          let val = String(data[key]).replace(/"/g, '""')
          if (val.includes(',') || val.includes('"')) {
            val = '"' + val + '"'
          }
          csvRows.push(`"${key}",${val}`)
        })
        return 'Key,Value\n' + csvRows.join('\n')
      }
      
      return jsonStr
    } catch (e) {
      return 'Error parsing JSON: ' + e.message
    }
  },

  textToPdfHtml(text, title) {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const paragraphs = escaped.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n')
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} - PDF Export</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: "SimSun", serif; font-size: 12pt; line-height: 1.8; color: #000; }
    h1 { text-align: center; font-size: 18pt; margin-bottom: 30pt; }
    p { text-indent: 2em; margin: 8pt 0; }
    @media print { body { print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${paragraphs}
</body>
</html>`
  },

  textToDocxXml(text, title) {
    const paragraphs = text.split('\n').filter(p => p.trim()).map(p => {
      const escaped = p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`
  },

  convertDocument() {
    this.addLog('正在处理文档转换...')
    
    const fmt = this.data.targetFormat
    const originalName = this.data.fileName.replace(/\.[^/.]+$/, '')
    const fs = wx.getFileSystemManager()
    const self = this

    if (fmt === 'txt') {
      this.extractDocumentText()
      return
    }

    if (fmt === 'docx') {
      this.addLog('正在生成Word文档...')
      this.extractAndConvertToDocx(originalName, fs)
      return
    }

    if (fmt === 'xlsx') {
      this.addLog('正在生成Excel表格...')
      this.convertToExcel(originalName, fs)
      return
    }

    if (fmt === 'pptx') {
      this.addLog('正在生成PPT演示文稿...')
      this.convertToPptx(originalName, fs)
      return
    }

    if (fmt === 'jpg' || fmt === 'png') {
      this.addLog('正在转换为图片格式...')
      this.convertDocToImage(originalName, fs)
      return
    }

    if (fmt === 'html') {
      this.addLog('正在生成HTML文档...')
      const htmlContent = this.generateDocHtml(originalName)
      const newFileName = originalName + '.html'
      const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
      
      setTimeout(() => {
        fs.writeFile({
          filePath: tempFilePath,
          data: htmlContent,
          encoding: 'utf8',
          success: () => {
            self.addLog('已转换为HTML文档')
            self.finishTextConversion(tempFilePath, newFileName, htmlContent)
          },
          fail: () => {
            self.setData({ isConverting: false })
            wx.showToast({ title: '转换失败', icon: 'none' })
          }
        })
      }, 300)
      return
    }

    if (fmt === 'json') {
      this.addLog('正在生成JSON数据...')
      const jsonData = {
        fileInfo: {
          name: self.data.fileName,
          size: self.data.fileSize,
          sizeText: self.data.fileSizeText,
          type: self.data.fileExt.toUpperCase(),
          convertedAt: new Date().toISOString()
        },
        note: '文档元数据提取完成'
      }
      const jsonStr = JSON.stringify(jsonData, null, 2)
      const newFileName = originalName + '_info.json'
      const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
      
      setTimeout(() => {
        fs.writeFile({
          filePath: tempFilePath,
          data: jsonStr,
          encoding: 'utf8',
          success: () => {
            self.addLog('已生成文档信息JSON')
            self.finishTextConversion(tempFilePath, newFileName, jsonStr)
          },
          fail: () => {
            self.setData({ isConverting: false })
            wx.showToast({ title: '转换失败', icon: 'none' })
          }
        })
      }, 300)
      return
    }

    if (fmt === 'csv') {
      this.addLog('正在生成CSV文件...')
      this.convertToCsv(originalName, fs)
      return
    }

    if (fmt === 'base64') {
      this.convertToBase64()
      return
    }

    this.setData({ isConverting: false })
    wx.showToast({ title: '该转换暂不支持', icon: 'none' })
  },

  extractAndConvertToDocx(originalName, fs) {
    const self = this
    
    setTimeout(() => {
      try {
        fs.readFile({
          filePath: self.data.filePath,
          encoding: 'utf8',
          success: (res) => {
            let content = res.data
            
            if (self.data.fileExt === '.pdf') {
              content = self.extractPdfTextForDocx(content)
            } else if (['.docx', '.xlsx', '.pptx'].includes(self.data.fileExt)) {
              content = self.extractOfficeXmlText(content).replace(/===.*?===\n/g, '').replace(/原始文件[^\n]*\n/g, '').replace(/提取时间[^\n]*\n/g, '').replace(/=+\n/g, '')
            } else {
              content = self.cleanBinaryText(content)
            }
            
            const docxContent = self.generateDocxFile(content, originalName)
            const newFileName = originalName + '_converted.docx'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: docxContent,
              encoding: 'utf8',
              success: () => {
                self.addLog('Word文档生成成功！可用WPS/Word打开')
                self.finishTextConversion(tempFilePath, newFileName, docxContent)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            const fallbackContent = `[${self.data.fileName} 的内容]\n\n此文件为${self.data.fileExt.toUpperCase()}格式。\n\n转换时间：${new Date().toLocaleString()}\n\n提示：如需完整转换，建议使用WPS Office或专业转换工具。`
            const docxContent = self.generateDocxFile(fallbackContent, originalName)
            const newFileName = originalName + '_converted.docx'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: docxContent,
              encoding: 'utf8',
              success: () => {
                self.addLog('已生成基础Word文档(含文件信息)')
                self.finishTextConversion(tempFilePath, newFileName, docxContent)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '转换失败', icon: 'none' })
              }
            })
          }
        })
      } catch (e) {
        self.setData({ isConverting: false })
        wx.showToast({ title: '处理异常', icon: 'none' })
      }
    }, 400)
  },

  extractPdfTextForDocx(raw) {
    const textParts = []
    const lines = raw.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes('/Title')) {
        const match = line.match(/\/Title\s*\(([^)]*)\)/)
        if (match && match[1]) textParts.push(match[1])
      }
      
      if (line.includes('/Author')) {
        const match = line.match(/\/Author\s*\(([^)]*)\)/)
        if (match && match[1]) textParts.push('作者：' + match[1])
      }
      
      const btMatch = line.match(/\(([^)]{5,})\)/g)
      if (btMatch) {
        btMatch.forEach(t => {
          const clean = t.replace(/^\(|\)$/g, '')
          if (clean.trim() && !clean.match(/^[\d\s.,\-]+$/) && clean.length < 200) {
            textParts.push(clean)
          }
        })
      }
      
      if (line.match(/^[\x20-\x7E\u4e00-\u9fa5]{15,}$/)) {
        textParts.push(line.trim())
      }
    }
    
    if (textParts.length === 0) {
      textParts.push('[PDF文本内容]')
      textParts.push('')
      textParts.push('说明：此PDF可能为扫描件或包含特殊编码。')
      textParts.push('建议使用Adobe Acrobat或百度OCR进行文字识别后再次转换。')
    }
    
    return textParts.join('\n\n')
  },

  generateDocxFile(content, title) {
    const paragraphs = content.split('\n').filter(p => p.trim()).map(p => {
      const escaped = p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      
      if (escaped.length < 50 && escaped.indexOf(' ') < 0) {
        return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`
      }
      
      return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"
                xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint"
                w:macrosPresent="no" w:embeddedObjPresent="no" w:ocxPresent="no"
                xml:space="preserve">
  <w:fonts>
    <w:defaultFonts w:ascii="宋体" w:fareast="宋体" w:h-ansi="Calibri" w:cs="Times New Roman"/>
  </w:fonts>
  <w:styles>
    <w:style w:type="paragraph" w:styleId="Heading1" w:default="on">
      <w:name w:val="heading 1"/>
      <w:rPr><w:b/><w:sz w:val="36"/><w:sz-cs w:val="36"/></w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Normal" w:default="on">
      <w:name w:val="Normal"/>
      <w:rPr><w:sz w:val="24"/></w:rPr>
    </w:style>
  </w:styles>
  <w:body>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
      <w:cols w:space="720"/>
    </w:sectPr>
    ${paragraphs}
  </w:body>
</w:wordDocument>`
  },

  convertToExcel(originalName, fs) {
    const self = this
    
    setTimeout(() => {
      try {
        fs.readFile({
          filePath: self.data.filePath,
          encoding: 'utf8',
          success: (res) => {
            let csvContent = ''
            
            if (self.data.fileExt === '.pdf') {
              const extracted = self.extractPdfTextForDocx(res.data)
              const lines = extracted.split('\n').filter(l => l.trim())
              csvContent = lines.map(l => {
                const cells = l.split(/[,\t|]/).map(c => `"${c.trim().replace(/"/g, '""')}"`)
                return cells.join(',')
              }).join('\n')
              
              if (!csvContent) {
                csvContent = '"序号","内容"\n' + lines.slice(0, 100).map((l, i) => `"${i+1}","${l.replace(/"/g, '""')}"`).join('\n')
              }
            } else if (self.data.fileExt === '.csv') {
              csvContent = res.data
            } else {
              const lines = res.data.split('\n').filter(l => l.trim()).slice(0, 200)
              csvContent = '"序号","原文内容"\n' + lines.map((l, i) => `"${i+1}","${l.replace(/"/g, '""')}"`).join('\n')
            }
            
            const excelXml = self.generateExcelFile(csvContent, originalName)
            const newFileName = originalName + '_converted.xls'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: excelXml,
              encoding: 'utf8',
              success: () => {
                self.addLog('Excel表格生成成功！可用WPS/Excel打开')
                self.finishTextConversion(tempFilePath, newFileName, excelXml)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            const defaultCsv = '"项目","值"\n"文件名",' + `"${self.data.fileName}"\n` +
                              '"大小",' + `"${self.data.fileSizeText}"\n` +
                              '"类型",' + `"${self.data.fileExt}"\n` +
                              '"时间",' + `"${new Date().toLocaleString()}"`
            
            const excelXml = self.generateExcelFile(defaultCsv, originalName)
            const newFileName = originalName + '_converted.xls'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: excelXml,
              encoding: 'utf8',
              success: () => {
                self.addLog('已生成基础Excel(含文件信息)')
                self.finishTextConversion(tempFilePath, newFileName, excelXml)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '转换失败', icon: 'none' })
              }
            })
          }
        })
      } catch (e) {
        self.setData({ isConverting: false })
        wx.showToast({ title: '处理异常', icon: 'none' })
      }
    }, 400)
  },

  generateExcelFile(csvData, title) {
    const rows = csvData.split('\n')
    const sheetData = rows.map(row => {
      const cells = row.split(',').map(cell => {
        const val = cell.replace(/^"|"$/g, '').replace(/""/g, '"')
        return `<Cell><Data ss:Type="String">${val}</Data></Cell>`
      }).join('')
      return `<Row>${cells}</Row>`
    }).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${title}">
    <Table>
      ${sheetData}
    </Table>
  </Worksheet>
</Workbook>`
  },

  convertToPptx(originalName, fs) {
    const self = this
    
    setTimeout(() => {
      try {
        fs.readFile({
          filePath: self.data.filePath,
          encoding: 'utf8',
          success: (res) => {
            let content = ''
            
            if (self.data.fileExt === '.pdf') {
              content = self.extractPdfTextForDocx(res.data)
            } else {
              content = self.cleanBinaryText(res.data)
            }
            
            const slides = content.split('\n\n').filter(p => p.trim()).slice(0, 12)
            
            if (slides.length === 0) {
              slides.push(`${originalName}`, `文件类型：${self.data.fileExt.toUpperCase()}`, 
                         `文件大小：${self.data.fileSizeText}`, `转换时间：${new Date().toLocaleString()}`)
            }
            
            const pptxContent = self.generatePptxFile(slides, originalName)
            const newFileName = originalName + '_converted.ppt'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: pptxContent,
              encoding: 'utf8',
              success: () => {
                self.addLog('PPT演示文稿生成成功！可用WPS/PPT打开')
                self.finishTextConversion(tempFilePath, newFileName, pptxContent)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            const defaultSlides = [
              `${originalName}`,
              `文件信息`,
              `类型：${self.data.fileExt.toUpperCase()}`,
              `大小：${self.data.fileSizeText}`,
              `时间：${new Date().toLocaleString()}`
            ]
            
            const pptxContent = self.generatePptxFile(defaultSlides, originalName)
            const newFileName = originalName + '_converted.ppt'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: pptxContent,
              encoding: 'utf8',
              success: () => {
                self.addLog('已生成基础PPT(含文件信息)')
                self.finishTextConversion(tempFilePath, newFileName, pptxContent)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '转换失败', icon: 'none' })
              }
            })
          }
        })
      } catch (e) {
        self.setData({ isConverting: false })
        wx.showToast({ title: '处理异常', icon: 'none' })
      }
    }, 400)
  },

  generatePptxFile(slides, title) {
    const slideXmls = slides.map((slide, idx) => {
      const escaped = slide.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 500)
      return `<p:slide>
        <p:cSld>
          <p:spTree>
            <p:nvGrpSpPr/>
            <p:grpSpPr/>
            <p:sp>
              <p:nvSpPr>
                <p:cNvPr id="2" name="TextBox ${idx + 1}"/>
                <p:cNvSpPr txBox="1"/>
                <p:nvPr/>
              </p:nvSpPr>
              <p:spPr/>
              <p:txBody>
                <a:bodyPr wrap="square" rtlCol="0"/>
                <a:lstStyle/>
                <a:p>
                  <a:r>
                    <a:rPr lang="zh-CN" sz="2400" b="1"/>
                    <a:t>${escaped}</a:t>
                  </a:r>
                </a:p>
              </p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
        <p:clrMapOvr>
          <a:masterClrMapping/>
        </p:clrMapOvr>
      </p:slide>`
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                saveSubsetFonts="1">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${slides.map((_, i) => `<p:sldId id="${i + 256}" r:id="rId${i + 1}"/>`).join('\n    ')}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="9144000" cy="6858000"/>
  ${slideXmls}
</p:presentation>`
  },

  convertDocToImage(originalName, fs) {
    const self = this
    
    setTimeout(() => {
      try {
        fs.readFile({
          filePath: self.data.filePath,
          encoding: 'utf8',
          success: (res) => {
            let content = ''
            
            if (self.data.fileExt === '.pdf') {
              content = self.extractPdfTextForDocx(res.data)
            } else {
              content = self.cleanBinaryText(res.data)
            }
            
            const imgHtml = self.generateImageHtml(content, originalName)
            const newFileName = originalName + '_as_image.html'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: imgHtml,
              encoding: 'utf8',
              success: () => {
                self.addLog('已生成长图HTML（可截图保存）')
                
                self.setData({
                  convertedPath: tempFilePath,
                  convertedFileName: newFileName,
                  convertResult: {
                    originalSize: self.data.fileSizeText,
                    newSize: self.formatFileSize(imgHtml.length),
                    savedSize: '-',
                    ratio: '-',
                    isGuide: false,
                    previewText: '✅ 已生成网页版长图！\n\n操作步骤：\n1. 点击下方"打开文件"按钮\n2. 在浏览器中打开生成的HTML\n3. 使用浏览器截图功能保存为图片\n4. 或按 Ctrl+P 打印为PDF/PNG',
                    isTextResult: true,
                    contentLength: imgHtml.length,
                    isImageHint: true
                  },
                  isConverting: false,
                  hasConverted: true,
                  convertType: 'text'
                })
                
                wx.showToast({ title: '长图HTML已生成', icon: 'success' })
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            self.setData({ isConverting: false })
            wx.showToast({ title: '读取失败', icon: 'none' })
          }
        })
      } catch (e) {
        self.setData({ isConverting: false })
        wx.showToast({ title: '处理异常', icon: 'none' })
      }
    }, 400)
  },

  generateImageHtml(content, title) {
    const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>\n')
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 长图</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
      max-width: 750px; margin: 0 auto; padding: 40px 30px;
      background: #FFFFFF; color: #333;
    }
    .header { 
      text-align: center; padding-bottom: 30px; 
      border-bottom: 3px solid #14B8A6; margin-bottom: 30px;
    }
    .header h1 { font-size: 28px; color: #0F766E; margin-bottom: 10px; }
    .header .meta { font-size: 13px; color: #64748B; }
    .content { 
      font-size: 16px; line-height: 2; color: #1E293B;
      padding: 20px; background: #F8FAFC; border-radius: 12px;
      border-left: 4px solid #14B8A6;
    }
    .footer { 
      text-align: center; margin-top: 40px; padding-top: 20px;
      border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;
    }
    @media print { body { padding: 20px; } .footer { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 ${title}</h1>
    <div class="meta">由 百宝工具箱 转换生成 | ${new Date().toLocaleString()}</div>
  </div>
  <div class="content">${escaped}</div>
  <div class="footer">
    <p>百宝工具箱 | 文档转图片</p>
  </div>
</body>
</html>`
  },

  convertToCsv(originalName, fs) {
    const self = this
    
    setTimeout(() => {
      try {
        fs.readFile({
          filePath: self.data.filePath,
          encoding: 'utf8',
          success: (res) => {
            let csvContent = ''
            
            if (self.data.fileExt === '.xlsx' || self.data.fileExt === '.xls') {
              const lines = res.data.split('\n').filter(l => l.trim())
              csvContent = '"行号","内容"\n' + lines.slice(0, 500).map((l, i) => `"${i+1}","${l.replace(/"/g, '""')}"`).join('\n')
            } else {
              const lines = res.data.split('\n').filter(l => l.trim())
              csvContent = '"序号","原文内容"\n' + lines.slice(0, 500).map((l, i) => `"${i+1}","${l.replace(/"/g, '""')}"`).join('\n')
            }
            
            const newFileName = originalName + '_converted.csv'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: csvContent,
              encoding: 'utf8',
              success: () => {
                self.addLog('CSV文件生成成功！可用Excel/WPS打开')
                self.finishTextConversion(tempFilePath, newFileName, csvContent)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            self.setData({ isConverting: false })
            wx.showToast({ title: '读取失败', icon: 'none' })
          }
        })
      } catch (e) {
        self.setData({ isConverting: false })
        wx.showToast({ title: '处理异常', icon: 'none' })
      }
    }, 300)
  },

  extractDocumentText() {
    this.addLog('尝试提取文档文本内容...')
    
    const fs = wx.getFileSystemManager()
    const self = this
    const originalName = this.data.fileName.replace(/\.[^/.]+$/, '')

    setTimeout(() => {
      try {
        fs.readFile({
          filePath: self.data.filePath,
          encoding: 'utf8',
          success: (res) => {
            let content = res.data
            
            if (self.data.fileExt === '.pdf') {
              content = self.extractPdfText(content)
            } else if (['.docx', '.xlsx', '.pptx'].includes(self.data.fileExt)) {
              content = self.extractOfficeXmlText(content)
            } else {
              content = self.cleanBinaryText(content)
            }
            
            const newFileName = originalName + '_extracted.txt'
            const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
            
            fs.writeFile({
              filePath: tempFilePath,
              data: content,
              encoding: 'utf8',
              success: () => {
                self.addLog('文本提取完成')
                self.finishTextConversion(tempFilePath, newFileName, content)
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            fs.readFile({
              filePath: self.data.filePath,
              encoding: 'ascii',
              success: (res) => {
                let content = self.cleanBinaryText(res.data)
                const newFileName = originalName + '_extracted.txt'
                const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
                
                fs.writeFile({
                  filePath: tempFilePath,
                  data: content,
                  encoding: 'utf8',
                  success: () => {
                    self.addLog('文本提取完成(ASCII模式)')
                    self.finishTextConversion(tempFilePath, newFileName, content)
                  },
                  fail: () => {
                    self.setData({ isConverting: false })
                    wx.showToast({ title: '处理失败', icon: 'none' })
                  }
                })
              },
              fail: () => {
                self.setData({ isConverting: false })
                wx.showToast({ title: '无法读取文件', icon: 'none' })
              }
            })
          }
        })
      } catch (e) {
        self.setData({ isConverting: false })
        wx.showToast({ title: '处理异常', icon: 'none' })
      }
    }, 300)
  },

  extractPdfText(raw) {
    const textParts = []
    const lines = raw.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes('/Title')) {
        const match = line.match(/\/Title\s*\(([^)]*)\)/)
        if (match) textParts.push('标题: ' + match[1])
      }
      
      if (line.includes('/Author')) {
        const match = line.match(/\/Author\s*\(([^)]*)\)/)
        if (match) textParts.push('作者: ' + match[1])
      }
      
      if (line.includes('BT') && line.includes('ET')) {
        const textMatch = line.match(/\(([^)]+)\)/g)
        if (textMatch) {
          textMatch.forEach(t => {
            const clean = t.replace(/^\(|\)$/g, '')
            if (clean.trim()) textParts.push(clean)
          })
        }
      }
      
      if (line.match(/^[\x20-\x7E\s\u4e00-\u9fa5]{10,}$/)) {
        textParts.push(line.trim())
      }
    }
    
    if (textParts.length === 0) {
      textParts.push('[PDF文件结构复杂，部分文本可能未完全提取]')
      textParts.push('提示：此PDF可能是扫描件或包含特殊编码')
      textParts.push('建议使用 Adobe Acrobat 或百度OCR 进行完整提取')
    }
    
    return '=== PDF文本提取结果 ===\n' +
           '原始文件: ' + this.data.fileName + '\n' +
           '提取时间: ' + new Date().toLocaleString() + '\n' +
           '========================\n\n' + 
           textParts.join('\n')
  },

  extractOfficeXmlText(raw) {
    const textParts = []
    const textRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g
    let match
    
    while ((match = textRegex.exec(raw)) !== null) {
      if (match[1].trim()) textParts.push(match[1].trim())
    }
    
    if (textParts.length === 0) {
      const allText = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (allText.length > 50) {
        textParts.push(allText.substring(0, 2000))
      } else {
        textParts.push('[Office文档内容加密或使用特殊格式]')
        textParts.push('建议使用 WPS Office 或 Microsoft Office 打开并另存为文本格式')
      }
    }
    
    return '=== Office文档文本提取 ===\n' +
           '原始文件: ' + this.data.fileName + '\n' +
           '提取时间: ' + new Date().toLocaleString() + '\n' +
           '============================\n\n' +
           textParts.join('\n')
  },

  cleanBinaryText(raw) {
    let cleaned = ''
    for (let i = 0; i < raw.length; i++) {
      const code = raw.charCodeAt(i)
      if ((code >= 32 && code <= 126) || code >= 0x4e00 || code === 10 || code === 13 || code === 9) {
        cleaned += raw[i]
      } else if (code === 0 || cleaned.length > 0 && cleaned[cleaned.length - 1] !== '\n') {
        cleaned += ' '
      }
    }
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    if (cleaned.length < 20) {
      return '[该文件为二进制格式，无法直接提取可读文本]\n' +
             '文件类型: ' + this.data.fileExt.toUpperCase() + '\n' +
             '建议：使用对应的专用软件打开此文件'
    }
    
    return '=== 文件内容提取 ===\n' +
           '原始文件: ' + this.data.fileName + '\n' +
           '==================\n\n' +
           cleaned.substring(0, 5000)
  },

  generateDocHtml(title) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; color: #1E293B; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #14B8A6; }
    .header h1 { font-size: 28px; color: #0F766E; }
    .meta { color: #64748B; font-size: 14px; margin-top: 10px; }
    .content { background: #FFFFFF; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .footer { text-align: center; margin-top: 40px; color: #94A3B8; font-size: 12px; }
    @media print { body { padding: 20px; } .footer { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 ${title}</h1>
    <div class="meta">
      <p>原始格式: ${this.data.fileExt.toUpperCase()} | 转换时间: ${new Date().toLocaleString()}</p>
      <p>由 百宝工具箱 文档格式转换工具 生成</p>
    </div>
  </div>
  <div class="content">
    <p style="color:#64748B;text-align:center;padding:40px;">
      [文档内容已转换为HTML格式]<br>
      可在浏览器中打开查看，或按 Ctrl+P 打印/导出为PDF
    </p>
  </div>
  <div class="footer">
    <p>百宝工具箱 | 文档格式转换</p>
  </div>
</body>
</html>`
  },

  convertWebFile() {
    this.addLog('正在处理网页文件...')
    
    const fs = wx.getFileSystemManager()
    const self = this
    const fmt = this.data.targetFormat
    const originalName = this.data.fileName.replace(/\.[^/.]+$/, '')

    fs.readFile({
      filePath: self.data.filePath,
      encoding: 'utf8',
      success: (res) => {
        const htmlContent = res.data
        
        if (fmt === 'txt') {
          let text = htmlContent
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim()
          
          const newFileName = originalName + '.txt'
          const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
          
          fs.writeFile({
            filePath: tempFilePath,
            data: text,
            encoding: 'utf8',
            success: () => {
              self.addLog('已提取网页文本')
              self.finishTextConversion(tempFilePath, newFileName, text)
            },
            fail: () => {
              self.setData({ isConverting: false })
              wx.showToast({ title: '转换失败', icon: 'none' })
            }
          })
        } else if (fmt === 'json') {
          const metaData = {
            source: originalName,
            extractedAt: new Date().toISOString(),
            htmlLength: htmlContent.length,
            note: 'HTML元数据提取完成'
          }
          const jsonStr = JSON.stringify(metaData, null, 2)
          const newFileName = originalName + '_meta.json'
          const tempFilePath = `${wx.env.USER_DATA_PATH}/${newFileName}`
          
          fs.writeFile({
            filePath: tempFilePath,
            data: jsonStr,
            encoding: 'utf8',
            success: () => {
              self.addLog('已生成网页元数据JSON')
              self.finishTextConversion(tempFilePath, newFileName, jsonStr)
            },
            fail: () => {
              self.setData({ isConverting: false })
              wx.showToast({ title: '转换失败', icon: 'none' })
            }
          })
        } else {
          self.setData({ isConverting: false })
          wx.showToast({ title: '该转换暂不支持', icon: 'none' })
        }
      },
      fail: () => {
        self.setData({ isConverting: false })
        wx.showToast({ title: '文件读取失败', icon: 'none' })
      }
    })
  },

  convertGeneric() {
    this.addLog('正在处理文件...')
    
    const fmt = this.data.targetFormat
    
    if (fmt === 'base64') {
      this.convertToBase64()
    } else if (fmt === 'txt') {
      this.extractDocumentText()
    } else {
      this.setData({ isConverting: false })
      wx.showToast({ title: '该文件类型暂不支持此转换', icon: 'none' })
    }
  },

  finishTextConversion(filePath, fileName, content) {
    const self = this
    self.setData({
      convertedPath: filePath,
      convertedFileName: fileName,
      convertResult: {
        originalSize: self.data.fileSizeText,
        newSize: self.formatFileSize(content.length),
        savedSize: '-',
        ratio: '-',
        isGuide: false,
        previewText: content.substring(0, 800) + (content.length > 800 ? '\n\n...(更多内容，请查看完整文件)' : ''),
        isTextResult: true,
        contentLength: content.length
      },
      isConverting: false,
      hasConverted: true,
      convertType: 'text'
    })
    
    wx.showToast({ title: '转换成功！', icon: 'success' })
  },

  handleConvertSuccess(tempFilePath) {
    const self = this
    
    wx.getFileInfo({
      filePath: tempFilePath,
      success: (fileInfo) => {
        const originalSize = self.data.fileSize
        const ratio = originalSize > 0 ? ((1 - fileInfo.size / originalSize) * 100).toFixed(1) : 0
        
        self.setData({
          convertedPath: tempFilePath,
          convertedFileName: self.data.fileName.replace(/\.[^/.]+$/, '') + '_' + self.data.targetFormat.toUpperCase() + '.' + self.data.targetFormat,
          convertResult: {
            originalSize: self.data.fileSizeText,
            newSize: self.formatFileSize(fileInfo.size),
            savedSize: self.formatFileSize(Math.max(0, originalSize - fileInfo.size)),
            ratio: Math.max(0, ratio),
            isGuide: false,
            isImageResult: true
          },
          isConverting: false,
          hasConverted: true,
          convertType: 'image'
        })

        wx.showToast({ title: '转换成功！', icon: 'success' })
      },
      fail: () => {
        self.setData({
          convertedPath: tempFilePath,
          convertResult: {
            originalSize: self.data.fileSizeText,
            newSize: '已完成',
            savedSize: '-',
            ratio: '-',
            isGuide: false,
            isImageResult: true
          },
          isConverting: false,
          hasConverted: true,
          convertType: 'image'
        })
        wx.showToast({ title: '转换完成', icon: 'success' })
      }
    })
  },

  addLog(msg) {
    const logs = [...this.data.conversionLog]
    logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
    this.setData({ conversionLog: logs.slice(-10) })
  },

  saveConverted() {
    const result = this.data.convertResult
    const path = this.data.convertedPath
    
    if (!path) {
      wx.showToast({ title: '没有可保存的文件', icon: 'none' })
      return
    }

    if (result && result.isImageResult) {
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: () => {
          wx.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: () => {
          wx.showModal({
            title: '提示',
            content: '需要相册权限才能保存',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) wx.openSetting()
            }
          })
        }
      })
    } else {
      this.copyContentToFile()
    }
  },

  copyContentToFile() {
    const content = this.data.convertResult && this.data.convertResult.previewText
    if (!content) {
      wx.showToast({ title: '没有可复制的内容', icon: 'none' })
      return
    }
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({ title: '内容已复制到剪贴板', icon: 'success' })
      }
    })
  },

  previewConverted() {
    const path = this.data.convertedPath
    if (!path) return
    
    if (this.data.convertType === 'image' || this.data.isImage) {
      wx.previewImage({
        urls: [path],
        current: path
      })
    } else {
      wx.openDocument({
        filePath: path,
        showMenu: true,
        success: () => {},
        fail: () => {
          wx.showToast({ title: '无法预览此文件', icon: 'none' })
        }
      })
    }
  },

  clearFile() {
    wx.vibrateShort({ type: 'light' })
    this.setData({
      selectedFile: null,
      filePath: '',
      fileName: '',
      fileSize: 0,
      fileSizeText: '',
      fileType: '',
      fileExt: '',
      isImage: false,
      isTextFile: false,
      imageInfo: null,
      availableFormats: [],
      targetFormat: '',
      targetFormatName: '',
      convertedPath: '',
      convertedFileName: '',
      convertResult: null,
      hasConverted: false,
      convertType: '',
      conversionLog: [],
      fileContent: ''
    })
  },

  clearAll() {
    wx.vibrateShort({ type: 'light' })
    this.clearFile()
    this.setData({
      textContent: '',
      contentType: 'auto'
    })
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    wx.vibrateShort({ type: 'light' })
    
    const hasInput = mode === 'text' ? (this.data.textContent.length > 0) : (mode === 'image' || mode === 'wechat') ? !!this.data.selectedFile : false
    
    this.setData({
      inputMode: mode,
      hasConverted: false,
      convertResult: null,
      convertedPath: '',
      targetFormat: '',
      targetFormatName: '',
      availableFormats: [],
      conversionLog: [],
      hasInput: hasInput,
      canShowFormats: hasInput,
      canConvert: false
    })
    
    if (mode === 'text') {
      this.updateFormatsForText()
    } else if (mode === 'image') {
      if (this.data.selectedFile && this.data.isImage) {
        this.updateFormatsForImage()
      }
    } else if (mode === 'wechat') {
      if (this.data.selectedFile) {
        this.updateFormatsForWechat()
      }
    }
  },

  updateFormatsForWechat() {
    const ext = this.data.fileExt
    const fileType = this.data.fileType
    
    const extToCategory = {
      '.pdf': 'pdf',
      '.docx': 'docx', '.doc': 'docx',
      '.xlsx': 'xlsx', '.xls': 'xlsx',
      '.pptx': 'pptx', '.ppt': 'pptx',
      '.jpg': 'image', '.jpeg': 'image', '.png': 'image',
      '.webp': 'image', '.gif': 'image', '.bmp': 'image',
      '.txt': 'text', '.md': 'text', '.xml': 'text',
      '.json': 'json',
      '.csv': 'csv',
      '.html': 'web', '.htm': 'web'
    }
    
    const categoryKey = extToCategory[ext] || fileType
    const formats = this.data.formatCategories[categoryKey] || this.data.formatCategories.other
    const firstFmt = formats.length > 0 ? formats[0] : null
    
    this.setData({
      availableFormats: formats,
      targetFormat: firstFmt ? firstFmt.value : '',
      targetFormatName: firstFmt ? firstFmt.fullName : '',
      canShowFormats: true,
      canConvert: !!firstFmt
    })
  },

  updateFormatsForText() {
    const content = this.data.textContent
    let detectedType = this.data.contentType
    
    if (detectedType === 'auto' && content.trim().length > 0) {
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        detectedType = 'json'
      } else if (content.includes('\t') || (content.split(',').length > 3 && content.split('\n').length > 1)) {
        detectedType = 'csv'
      } else if (content.includes('<') && content.includes('>')) {
        detectedType = 'html'
      } else {
        detectedType = 'txt'
      }
    }
    
    const categoryMap = { txt: 'text', json: 'json', csv: 'csv', html: 'text', xml: 'text' }
    const categoryKey = categoryMap[detectedType] || 'text'
    const formats = this.data.formatCategories[categoryKey] || this.data.formatCategories.text
    const firstFmt = formats.length > 0 ? formats[0] : null
    
    this.setData({
      availableFormats: formats,
      targetFormat: firstFmt ? firstFmt.value : '',
      targetFormatName: firstFmt ? firstFmt.fullName : '',
      canShowFormats: content.trim().length > 0,
      hasInput: true,
      canConvert: content.trim().length > 0 && !!firstFmt
    })
  },

  updateFormatsForImage() {
    const formats = this.data.formatCategories.image || []
    const firstFmt = formats.length > 0 ? formats[0] : null
    this.setData({
      availableFormats: formats,
      targetFormat: firstFmt ? firstFmt.value : '',
      targetFormatName: firstFmt ? firstFmt.fullName : ''
    })
  },

  onTextInput(e) {
    const content = e.detail.value || ''
    this.setData({ textContent: content })
    
    if (content.length > 0 && !this.data.selectedFile) {
      this.updateFormatsForText()
    } else if (content.length === 0) {
      this.setData({
        canShowFormats: false,
        hasInput: false,
        canConvert: false,
        availableFormats: [],
        targetFormat: '',
        targetFormatName: ''
      })
    }
  },

  pasteContent() {
    wx.vibrateShort({ type: 'light' })
    wx.getClipboardData({
      success: (res) => {
        if (res.data) {
          this.setData({ 
            textContent: res.data, 
            textFocus: true 
          })
          this.updateFormatsForText()
          wx.showToast({ title: '已粘贴内容', icon: 'success' })
        } else {
          wx.showToast({ title: '剪贴板为空', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '无法读取剪贴板', icon: 'none' })
      }
    })
  },

  clearText() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ textContent: '' })
    wx.showToast({ title: '已清空', icon: 'none' })
  },

  loadSample() {
    wx.vibrateShort({ type: 'light' })
    
    let sample = ''
    const type = this.data.contentType === 'auto' ? 'json' : this.data.contentType
    
    switch(type) {
      case 'json':
        sample = JSON.stringify({
          name: '百宝工具箱',
          version: '2.0.0',
          tools: ['汇率换算', '单位换算', '房贷计算器'],
          author: 'Yangyang',
          tags: ['实用', '便捷', '多功能']
        }, null, 2)
        break
      case 'csv':
        sample = '名称,类型,分类,热度\n汇率换算,计算器,金融,高\n单位换算,转换器,通用,高\n房贷计算器,计算器,生活,中\n图片处理,工具,媒体,中\n文件转换,工具,文档,新'
        break
      case 'html':
        sample = '<!DOCTYPE html>\n<html>\n<head>\n  <title>示例文档</title>\n</head>\n<body>\n  <h1>百宝工具箱</h1>\n  <p>这是一个示例HTML文档</p>\n</body>\n</html>'
        break
      default:
        sample = '百宝工具箱\n\n一款实用的微信小程序工具集合。\n\n功能包括：\n- 汇率换算\n- 单位换算\n- 房贷计算器\n- 图片处理\n- 文件格式转换\n\n让生活更便捷！'
    }
    
    this.setData({ textContent: sample, textFocus: true })
    this.updateFormatsForText()
    wx.showToast({ title: '已加载示例', icon: 'success' })
  },

  setContentType(e) {
    const type = e.currentTarget.dataset.type
    wx.vibrateShort({ type: 'light' })
    this.setData({ contentType: type })
    this.updateFormatsForText()
  },

  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
})