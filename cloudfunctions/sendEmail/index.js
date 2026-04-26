const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  var feedbackType = event.feedbackType
  var feedbackContent = event.feedbackContent
  var contactInfo = event.contactInfo
  var deviceInfo = event.deviceInfo

  if (!feedbackContent || !feedbackContent.trim()) {
    return { success: false, error: '反馈内容为空' }
  }

  if (feedbackContent.trim().length < 5) {
    return { success: false, error: '反馈内容至少5个字' }
  }

  var now = new Date()
  var m = now.getMonth() + 1
  var d = now.getDate()
  var h = now.getHours()
  var min = now.getMinutes()
  var s = now.getSeconds()
  var mStr = m < 10 ? '0' + m : '' + m
  var dStr = d < 10 ? '0' + d : '' + d
  var hStr = h < 10 ? '0' + h : '' + h
  var minStr = min < 10 ? '0' + min : '' + min
  var sStr = s < 10 ? '0' + s : '' + s
  var timeStr = now.getFullYear() + '-' + mStr + '-' + dStr + ' ' + hStr + ':' + minStr + ':' + sStr

  var typeLabels = {
    bug: '问题反馈',
    suggestion: '功能建议',
    other: '其他'
  }

  var db = cloud.database()

  try {
    var result = await db.collection('user_feedbacks').add({
      data: {
        type: feedbackType,
        typeName: typeLabels[feedbackType] || '其他',
        content: feedbackContent,
        contact: contactInfo || '未填写',
        device: deviceInfo || '',
        time: timeStr,
        timestamp: Date.now(),
        status: 'pending',
        _createTime: db.serverDate()
      }
    })

    return {
      success: true,
      id: result._id,
      message: '反馈提交成功'
    }
  } catch (error) {
    console.error('保存反馈失败:', error)
    return {
      success: false,
      error: error.message || '保存失败，请稍后重试'
    }
  }
}