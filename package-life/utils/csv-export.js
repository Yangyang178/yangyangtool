/**
 * CSV导出工具模块
 * 提供通用的CSV生成和微信小程序文件保存功能
 */

/**
 * 转义CSV字段（处理逗号、引号、换行）
 */
function escapeCSVField(value) {
  if (value === null || value === undefined) return ''
  var str = String(value)
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

/**
 * 生成CSV字符串
 * @param {Array} headers - 表头数组 [{key, label}]
 * @param {Array} rows - 数据行数组
 * @returns {string} CSV字符串
 */
function generateCSV(headers, rows) {
  var lines = []
  var headerLine = []
  for (var h = 0; h < headers.length; h++) {
    headerLine.push(escapeCSVField(headers[h].label))
  }
  lines.push(headerLine.join(','))

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r]
    var line = []
    for (var c = 0; c < headers.length; c++) {
      var key = headers[c].key
      var val = row[key]
      if (typeof val === 'undefined') val = ''
      line.push(escapeCSVField(val))
    }
    lines.push(line.join(','))
  }

  return lines.join('\n')
}

/**
 * 确保用户数据目录存在
 */
function ensureDir(callback) {
  var basePath = wx.env.USER_DATA_PATH
  var fs = wx.getFileSystemManager()
  try {
    fs.accessSync(basePath)
    callback(basePath)
  } catch (e) {
    try {
      fs.mkdirSync(basePath, true)
      callback(basePath)
    } catch (e2) {
      callback(null)
    }
  }
}

/**
 * 清理旧的CSV文件，只保留最新的几个
 * @param {string} basePath - 用户数据目录
 * @param {number} keepCount - 保留的文件数量
 */
function cleanOldCSVFiles(basePath, keepCount) {
  if (!keepCount) keepCount = 3
  try {
    var fs = wx.getFileSystemManager()
    var files = fs.readdirSync(basePath)
    var csvFiles = []
    for (var i = 0; i < files.length; i++) {
      if (files[i].indexOf('.csv') > -1) {
        csvFiles.push(files[i])
      }
    }
    csvFiles.sort().reverse()
    for (var j = keepCount; j < csvFiles.length; j++) {
      try { fs.unlinkSync(basePath + '/' + csvFiles[j]) } catch (e) {}
    }
  } catch (e) {}
}

/**
 * 保存CSV到微信小程序用户文件目录
 * @param {string} csvContent - CSV内容
 * @param {string} fileName - 文件名（仅ASCII，不含路径）
 * @param {Object} options - 可选参数
 */
function saveCSV(csvContent, fileName, options) {
  ensureDir(function(basePath) {
    if (!basePath) {
      wx.showModal({
        title: '导出失败',
        content: '无法访问文件目录，请尝试"复制数据"方式导出',
        showCancel: false
      })
      if (options && options.fail) options.fail(new Error('no user data path'))
      return
    }

    var fs = wx.getFileSystemManager()
    var filePath = basePath + '/' + fileName

    cleanOldCSVFiles(basePath, 3)

    try {
      fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8')
    } catch (writeErr) {
      wx.showModal({
        title: '导出失败',
        content: '写入文件失败，是否复制数据到剪贴板？',
        confirmText: '复制数据',
        cancelText: '取消',
        success: function(modalRes) {
          if (modalRes.confirm) {
            wx.setClipboardData({
              data: csvContent,
              success: function() {
                wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
      if (options && options.fail) options.fail(writeErr)
      return
    }

    wx.showModal({
      title: '导出成功',
      content: '文件已保存，是否打开查看？',
      confirmText: '打开',
      cancelText: '关闭',
      success: function(res) {
        if (res.confirm) {
          wx.openDocument({
            filePath: filePath,
            showMenu: true,
            success: function() {
              if (options && options.success) options.success(filePath)
            },
            fail: function(err) {
              wx.showModal({
                title: '无法打开',
                content: '当前设备不支持直接打开CSV，可通过"分享文件"发送到聊天后用其他应用打开',
                showCancel: false
              })
              if (options && options.fail) options.fail(err)
            }
          })
        } else {
          if (options && options.success) options.success(filePath)
        }
      }
    })
  })
}

/**
 * 分享CSV文件到聊天
 * @param {string} csvContent - CSV内容
 * @param {string} fileName - 文件名（仅ASCII）
 */
function shareCSV(csvContent, fileName) {
  ensureDir(function(basePath) {
    if (!basePath) {
      wx.showModal({
        title: '分享失败',
        content: '无法访问文件目录，是否复制数据到剪贴板？',
        confirmText: '复制数据',
        cancelText: '取消',
        success: function(modalRes) {
          if (modalRes.confirm) {
            wx.setClipboardData({
              data: csvContent,
              success: function() {
                wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
      return
    }

    var fs = wx.getFileSystemManager()
    var filePath = basePath + '/' + fileName

    cleanOldCSVFiles(basePath, 3)

    try {
      fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8')
    } catch (writeErr) {
      wx.showModal({
        title: '分享失败',
        content: '文件保存失败，是否复制数据到剪贴板？',
        confirmText: '复制数据',
        cancelText: '取消',
        success: function(modalRes) {
          if (modalRes.confirm) {
            wx.setClipboardData({
              data: csvContent,
              success: function() {
                wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
      return
    }

    if (wx.shareFileMessage) {
      wx.shareFileMessage({
        filePath: filePath,
        success: function() {},
        fail: function(err) {
          wx.showModal({
            title: '分享失败',
            content: '是否复制数据到剪贴板后手动粘贴分享？',
            confirmText: '复制数据',
            cancelText: '取消',
            success: function(modalRes) {
              if (modalRes.confirm) {
                wx.setClipboardData({
                  data: csvContent,
                  success: function() {
                    wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
                  }
                })
              }
            }
          })
        }
      })
    } else {
      wx.showModal({
        title: '不支持分享文件',
        content: '当前微信版本不支持分享文件，是否复制数据到剪贴板？',
        confirmText: '复制数据',
        cancelText: '取消',
        success: function(modalRes) {
          if (modalRes.confirm) {
            wx.setClipboardData({
              data: csvContent,
              success: function() {
                wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
    }
  })
}

/**
 * 生成带日期的文件名（仅ASCII字符）
 * @param {string} prefix - 文件名前缀（仅英文）
 * @returns {string} 文件名，如 account_book_20260605_1230.csv
 */
function makeFileName(prefix) {
  var now = new Date()
  var y = now.getFullYear()
  var m = now.getMonth() + 1
  var d = now.getDate()
  var h = now.getHours()
  var mi = now.getMinutes()
  return prefix + '_' + y + (m < 10 ? '0' + m : '' + m) + (d < 10 ? '0' + d : '' + d) + '_' + (h < 10 ? '0' + h : '' + h) + (mi < 10 ? '0' + mi : '' + mi) + '.csv'
}

module.exports = {
  generateCSV: generateCSV,
  saveCSV: saveCSV,
  shareCSV: shareCSV,
  makeFileName: makeFileName,
  escapeCSVField: escapeCSVField
}
