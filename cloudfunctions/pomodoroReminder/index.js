var cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

var db = cloud.database()
var _ = db.command

// 番茄钟完成提醒云函数
// action: register - 注册延迟提醒（专注开始时调用）
// action: cancel - 取消提醒（暂停/重置时调用）
// 无action - 定时触发器调用，检查并发送到期提醒
exports.main = async (event, context) => {
  var action = event.action || ''

  if (action === 'register') {
    return await registerReminder(event)
  }

  if (action === 'cancel') {
    return await cancelReminder(event)
  }

  // 定时触发器调用 - 检查并发送到期提醒
  return await checkAndRemind()
}

// 注册延迟提醒
async function registerReminder(event) {
  var duration = event.duration || 25
  var mode = event.mode || 'work'
  var templateId = event.templateId
  var openid = event.userInfo ? event.userInfo.openId : ''

  if (!templateId || templateId.indexOf('TEMPL_ID') !== -1) {
    return { success: false, error: 'template not configured' }
  }

  try {
    var now = new Date()
    var remindAt = new Date(now.getTime() + duration * 60 * 1000)

    var result = await db.collection('pomodoro_reminders').add({
      data: {
        openid: openid,
        duration: duration,
        mode: mode,
        templateId: templateId,
        remindAt: remindAt,
        sent: false,
        cancelled: false,
        createdAt: db.serverDate()
      }
    })

    return { success: true, id: result._id }
  } catch (e) {
    console.error('registerReminder error:', e)
    return { success: false, error: e.message }
  }
}

// 取消提醒
async function cancelReminder(event) {
  var openid = event.userInfo ? event.userInfo.openId : ''

  try {
    var result = await db.collection('pomodoro_reminders')
      .where({
        openid: openid,
        sent: false,
        cancelled: false
      })
      .update({
        data: { cancelled: true }
      })

    return { success: true, cancelled: result.stats.updated }
  } catch (e) {
    console.error('cancelReminder error:', e)
    return { success: false, error: e.message }
  }
}

// 定时触发器：检查并发送到期的番茄钟提醒
async function checkAndRemind() {
  var now = new Date()
  var sentCount = 0
  var errorCount = 0

  try {
    // 查找到期且未发送、未取消的提醒
    var result = await db.collection('pomodoro_reminders')
      .where({
        remindAt: _.lte(now),
        sent: false,
        cancelled: false
      })
      .limit(100)
      .get()

    if (!result.data || result.data.length === 0) {
      return { success: true, sent: 0, message: 'no pending reminders' }
    }

    for (var i = 0; i < result.data.length; i++) {
      var item = result.data[i]
      try {
        // 匹配「行动计划提醒」模板字段
        var planName = '专注完成提醒'
        var planContent = '专注' + item.duration + '分钟已完成'
        if (planContent.length > 20) planContent = planContent.substring(0, 18) + '...'

        await cloud.openapi.subscribeMessage.send({
          touser: item.openid,
          templateId: item.templateId,
          page: 'package-life/pomodoro/pomodoro',
          data: {
            thing1: { value: planName },
            time2: { value: now.toISOString().replace('T', ' ').substring(0, 19) },
            thing3: { value: planContent },
            thing4: { value: '休息一下吧，准备下一轮' }
          },
          miniprogramState: 'formal'
        })

        // 标记为已发送
        await db.collection('pomodoro_reminders')
          .doc(item._id)
          .update({ data: { sent: true } })

        sentCount++
      } catch (e) {
        console.error('send pomodoro reminder error:', e)
        // 发送失败也标记为已发送，避免重复尝试
        await db.collection('pomodoro_reminders')
          .doc(item._id)
          .update({ data: { sent: true } })
        errorCount++
      }
    }

    // 清理7天前的已发送记录
    var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    await db.collection('pomodoro_reminders')
      .where({ sent: true, createdAt: _.lte(sevenDaysAgo) })
      .limit(1000)
      .remove()

    return { success: true, sent: sentCount, errors: errorCount }
  } catch (e) {
    console.error('checkAndRemind error:', e)
    return { success: false, error: e.message }
  }
}
