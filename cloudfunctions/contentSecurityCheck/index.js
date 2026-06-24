var cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  var type = event.type || 'image'

  // 通过云开发上下文获取用户openid
  var wxContext = cloud.getWXContext()
  var openid = event.openid || wxContext.OPENID || ''

  try {
    if (type === 'image') {
      var imgBuffer = null

      // 优先使用云存储fileID方式
      if (event.fileID) {
        var downloadRes = await cloud.downloadFile({
          fileID: event.fileID
        })
        imgBuffer = downloadRes.fileContent
      } else if (event.mediaUrl) {
        // 回退：base64方式
        imgBuffer = Buffer.from(event.mediaUrl, 'base64')
      } else {
        return { success: false, error: '缺少图片参数' }
      }

      // 使用云开发内容安全API检测图片
      var result = await cloud.openapi.security.imgSecCheck({
        media: { contentType: 'image/png', value: imgBuffer }
      })

      return {
        success: true,
        pass: result.errCode === 0,
        errCode: result.errCode,
        errMsg: result.errMsg
      }
    } else if (type === 'text') {
      var content = event.content || ''
      if (!content) {
        return { success: false, error: '缺少文本参数' }
      }

      if (!openid) {
        return { success: false, error: '无法获取用户身份' }
      }

      // 使用msgSecCheck v2版本
      var result = await cloud.openapi.security.msgSecCheck({
        openid: openid,
        scene: 1,
        version: 2,
        content: content
      })

      // v2版本通过 result.suggest 判断
      var pass = result.errCode === 0 && result.result && result.result.suggest === 'pass'
      return {
        success: true,
        pass: pass,
        suggest: result.result ? result.result.suggest : '',
        label: result.result ? result.result.label : 0,
        errCode: result.errCode,
        errMsg: result.errMsg
      }
    } else {
      return { success: false, error: '不支持的检测类型' }
    }
  } catch (e) {
    console.error('内容安全检测失败:', e)
    // errCode 87014 表示内容违规
    if (e.errCode === 87014) {
      return { success: true, pass: false, errCode: 87014, errMsg: '内容含有违法违规内容' }
    }
    return { success: false, error: e.message || '检测服务异常' }
  }
}
