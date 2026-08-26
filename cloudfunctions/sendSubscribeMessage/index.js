var cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

var db = cloud.database()

// 发送订阅消息的通用云函数
// 支持倒计时、番茄钟、喝水提醒等场景
exports.main = async (event, context) => {
  var templateType = event.templateType || ''
  var toUser = event.toUser || ''
  var data = event.data || {}
  var page = event.page || ''

  if (!templateType || !toUser) {
    return { success: false, error: 'missing templateType or toUser' }
  }

  // 模板ID映射 - 需要在微信公众平台后台申请后替换
  var TEMPLATE_MAP = {
    'countdown_remind': 'qbKp5hOMoxHgj08ooZV9Oxla6d__mfB--oQMQduJ2SI',
    'pomodoro_complete': 'qbKp5hOMoxHgj08ooZV9Oxla6d__mfB--oQMQduJ2SI',
    'water_remind': 'qbKp5hOMoxHgj08ooZV9Oxla6d__mfB--oQMQduJ2SI'
  }

  var templateId = TEMPLATE_MAP[templateType]
  if (!templateId || templateId.indexOf('TEMPL_ID') !== -1) {
    return { success: false, error: 'template not configured: ' + templateType }
  }

  try {
    var result = await cloud.openapi.subscribeMessage.send({
      touser: toUser,
      templateId: templateId,
      page: page,
      data: data,
      miniprogramState: 'formal'
    })
    return { success: true, result: result }
  } catch (e) {
    console.error('sendSubscribeMessage error:', e)
    return { success: false, error: e.message || e.errMsg || 'unknown error' }
  }
}
