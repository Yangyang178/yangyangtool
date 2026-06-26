var cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

var db = cloud.database()
var _ = db.command

// 喝水提醒云函数
// action: register - 注册喝水提醒
// action: cancel - 取消喝水提醒
// 无action - 定时触发器调用，检查并发送喝水提醒
exports.main = async (event, context) => {
  var action = event.action || ''

  if (action === 'register') {
    return await registerReminder(event)
  }

  if (action === 'cancel') {
    return await cancelReminder(event)
  }

  // 定时触发器调用 - 检查并发送喝水提醒
  return await checkAndRemind()
}

// 注册喝水提醒
async function registerReminder(event) {
  var interval = event.interval || 30
  var todayCups = event.todayCups || 0
  var targetCups = event.targetCups || 8
  var templateId = event.templateId
  var wxContext = cloud.getWXContext()
  var openid = wxContext.OPENID || ''

  if (!templateId || templateId.indexOf('TEMPL_ID') !== -1) {
    return { success: false, error: 'template not configured' }
  }

  try {
    var now = new Date()
    var nextRemindAt = new Date(now.getTime() + interval * 60 * 1000)

    // 检查是否已有活跃提醒
    var existResult = await db.collection('water_reminders')
      .where({ openid: openid, active: true })
      .get()

    if (existResult.data && existResult.data.length > 0) {
      await db.collection('water_reminders')
        .doc(existResult.data[0]._id)
        .update({
          data: {
            interval: interval,
            todayCups: todayCups,
            targetCups: targetCups,
            templateId: templateId,
            nextRemindAt: nextRemindAt,
            updatedAt: db.serverDate()
          }
        })
    } else {
      await db.collection('water_reminders').add({
        data: {
          openid: openid,
          interval: interval,
          todayCups: todayCups,
          targetCups: targetCups,
          templateId: templateId,
          nextRemindAt: nextRemindAt,
          active: true,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return { success: true }
  } catch (e) {
    console.error('registerReminder error:', e)
    return { success: false, error: e.message }
  }
}

// 取消喝水提醒
async function cancelReminder(event) {
  var wxContext = cloud.getWXContext()
  var openid = wxContext.OPENID || ''

  try {
    var result = await db.collection('water_reminders')
      .where({ openid: openid, active: true })
      .update({
        data: { active: false }
      })

    return { success: true, cancelled: result.stats.updated }
  } catch (e) {
    console.error('cancelReminder error:', e)
    return { success: false, error: e.message }
  }
}

// 定时触发器：检查并发送喝水提醒
async function checkAndRemind() {
  var now = new Date()
  var sentCount = 0
  var errorCount = 0

  try {
    // 查找到期且活跃的提醒
    var result = await db.collection('water_reminders')
      .where({
        nextRemindAt: _.lte(now),
        active: true
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
        var cupsText = item.todayCups + '/' + item.targetCups + '杯'
        var warmTip = '已喝' + cupsText + '，少量多次更健康'
        if (warmTip.length > 20) warmTip = warmTip.substring(0, 18) + '...'

        await cloud.openapi.subscribeMessage.send({
          touser: item.openid,
          templateId: item.templateId,
          page: 'package-life/water-reminder/water-reminder',
          data: {
            thing1: { value: '喝水提醒' },
            time2: { value: now.toISOString().replace('T', ' ').substring(0, 19) },
            thing3: { value: '该喝水啦！保持身体水分' },
            thing4: { value: warmTip }
          },
          miniprogramState: 'formal'
        })

        // 更新下次提醒时间
        var nextTime = new Date(now.getTime() + item.interval * 60 * 1000)
        await db.collection('water_reminders')
          .doc(item._id)
          .update({
            data: {
              nextRemindAt: nextTime,
              todayCups: item.todayCups + 1
            }
          })

        sentCount++
      } catch (e) {
        console.error('send water reminder error:', e)
        errorCount++
      }
    }

    // 清理不活跃的旧记录（7天前）
    var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    await db.collection('water_reminders')
      .where({ active: false, updatedAt: _.lte(sevenDaysAgo) })
      .limit(1000)
      .remove()

    return { success: true, sent: sentCount, errors: errorCount }
  } catch (e) {
    console.error('checkAndRemind error:', e)
    return { success: false, error: e.message }
  }
}
