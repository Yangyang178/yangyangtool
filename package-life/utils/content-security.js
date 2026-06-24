/**
 * 内容安全检测工具
 * 接入微信内容安全API，对用户上传的图片和文本进行安全检测
 */

var ContentSecurity = {
  /**
   * 检测图片是否安全
   * 方案：先上传到云存储，再用云存储fileID调用云函数检测
   * 避免base64大数据通过callFunction传输失败
   * @param {string} tempFilePath - 图片临时文件路径
   * @param {function} callback - 回调函数 callback(pass, errMsg)
   */
  checkImage: function(tempFilePath, callback) {
    if (!tempFilePath) {
      callback(true, '')
      return
    }

    // 先压缩图片，确保不超过1MB
    wx.compressImage({
      src: tempFilePath,
      quality: 70,
      success: function(compressRes) {
        var filePath = compressRes.tempFilePath || tempFilePath
        ContentSecurity._uploadAndCheck(filePath, callback)
      },
      fail: function() {
        // 压缩失败用原图
        ContentSecurity._uploadAndCheck(tempFilePath, callback)
      }
    })
  },

  /**
   * 上传图片到云存储临时目录，然后调用云函数检测
   */
  _uploadAndCheck: function(filePath, callback) {
    var timestamp = Date.now()
    var cloudPath = 'sec_check/' + timestamp + '_' + Math.floor(Math.random() * 10000) + '.jpg'

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: function(uploadRes) {
        // 上传成功，调用云函数检测
        wx.cloud.callFunction({
          name: 'contentSecurityCheck',
          data: {
            type: 'image',
            fileID: uploadRes.fileID
          },
          success: function(res) {
            // 检测完成后删除临时文件
            wx.cloud.deleteFile({ fileList: [uploadRes.fileID] })

            if (res.result && res.result.success) {
              if (res.result.pass) {
                callback(true, '')
              } else {
                callback(false, '图片包含违规内容，请更换')
              }
            } else {
              console.warn('内容安全检测异常:', res.result ? res.result.error : 'unknown')
              callback(false, '内容安全检测异常，请稍后重试')
            }
          },
          fail: function(err) {
            // 检测失败时删除临时文件
            wx.cloud.deleteFile({ fileList: [uploadRes.fileID] })
            console.warn('内容安全云函数调用失败:', err)
            callback(false, '安全检测服务暂不可用，请稍后重试')
          }
        })
      },
      fail: function(err) {
        console.warn('图片上传云存储失败:', err)
        // 上传失败时回退到base64方式
        ContentSecurity._checkImageBase64(filePath, callback)
      }
    })
  },

  /**
   * 回退方案：通过base64方式检测（仅在上传云存储失败时使用）
   */
  _checkImageBase64: function(tempFilePath, callback) {
    var fs = wx.getFileSystemManager()
    try {
      var fileData = fs.readFileSync(tempFilePath)
      var base64Data = wx.arrayBufferToBase64(fileData)

      if (base64Data.length > 1.5 * 1024 * 1024) {
        callback(false, '图片过大，请选择较小的图片')
        return
      }

      wx.cloud.callFunction({
        name: 'contentSecurityCheck',
        data: {
          type: 'image',
          mediaUrl: base64Data
        },
        success: function(res) {
          if (res.result && res.result.success) {
            if (res.result.pass) {
              callback(true, '')
            } else {
              callback(false, '图片包含违规内容，请更换')
            }
          } else {
            console.warn('内容安全检测异常:', res.result ? res.result.error : 'unknown')
            callback(false, '内容安全检测异常，请稍后重试')
          }
        },
        fail: function(err) {
          console.warn('内容安全云函数调用失败:', err)
          callback(false, '安全检测服务暂不可用，请稍后重试')
        }
      })
    } catch (e) {
      console.warn('读取图片文件失败:', e)
      callback(false, '图片读取失败，请重新选择')
    }
  },

  /**
   * 检测文本是否安全
   * @param {string} content - 待检测文本
   * @param {function} callback - 回调函数 callback(pass, errMsg)
   */
  checkText: function(content, callback) {
    if (!content || !content.trim()) {
      callback(true, '')
      return
    }

    // openid由云函数通过getWXContext自动获取，无需前端传递
    wx.cloud.callFunction({
      name: 'contentSecurityCheck',
      data: {
        type: 'text',
        content: content
      },
      success: function(res) {
        if (res.result && res.result.success) {
          if (res.result.pass) {
            callback(true, '')
          } else {
            callback(false, '内容包含违规信息，请修改')
          }
        } else {
          console.warn('内容安全检测异常:', res.result ? res.result.error : 'unknown')
          callback(false, '内容安全检测异常，请稍后重试')
        }
      },
      fail: function(err) {
        console.warn('内容安全云函数调用失败:', err)
        callback(false, '安全检测服务暂不可用，请稍后重试')
      }
    })
  }
}

module.exports = ContentSecurity
