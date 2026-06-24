var cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

var db = cloud.database()

// 倒计时提醒云函数
// action: register - 注册倒计时事件
// action: cancel - 取消倒计时事件
// action: check - 每日定时触发，检查需要提醒的事件
exports.main = async (event, context) => {
  var action = event.action || 'check'

  if (action === 'register') {
    return await registerEvent(event)
  }

  if (action === 'cancel') {
    return await cancelEvent(event)
  }

  // 默认: check - 每日定时检查并发送提醒
  return await checkAndRemind()
}

// 注册倒计时事件到云数据库
async function registerEvent(event) {
  var eventId = event.eventId
  var eventName = event.eventName
  var targetDate = event.targetDate
  var targetTime = event.targetTime || '00:00'
  var category = event.category || 'life'
  var repeat = event.repeat || 'none'
  var templateId = event.templateId

  // 获取当前用户openid
  var openid = event.userInfo ? event.userInfo.openId : ''

  if (!eventId || !eventName || !targetDate) {
    return { success: false, error: 'missing required fields' }
  }

  try {
    // 检查是否已存在
    var existResult = await db.collection('countdown_reminders')
      .where({ eventId: eventId, openid: openid })
      .get()

    if (existResult.data && existResult.data.length > 0) {
      // 更新已有记录
      await db.collection('countdown_reminders')
        .doc(existResult.data[0]._id)
        .update({
          data: {
            eventName: eventName,
            targetDate: targetDate,
            targetTime: targetTime,
            category: category,
            repeat: repeat,
            templateId: templateId,
            updatedAt: db.serverDate()
          }
        })
    } else {
      // 新增记录
      await db.collection('countdown_reminders').add({
        data: {
          eventId: eventId,
          openid: openid,
          eventName: eventName,
          targetDate: targetDate,
          targetTime: targetTime,
          category: category,
          repeat: repeat,
          templateId: templateId,
          reminded1Day: false,
          remindedToday: false,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return { success: true }
  } catch (e) {
    console.error('registerEvent error:', e)
    return { success: false, error: e.message }
  }
}

// 取消倒计时事件
async function cancelEvent(event) {
  var eventId = event.eventId
  var openid = event.userInfo ? event.userInfo.openId : ''

  if (!eventId) {
    return { success: false, error: 'missing eventId' }
  }

  try {
    var result = await db.collection('countdown_reminders')
      .where({ eventId: eventId, openid: openid })
      .remove()

    return { success: true, removed: result.stats.removed }
  } catch (e) {
    console.error('cancelEvent error:', e)
    return { success: false, error: e.message }
  }
}

// 每日定时检查并发送提醒
// 需要在云开发控制台配置定时触发器: 0 8 * * * (每天8:00执行)
async function checkAndRemind() {
  var now = new Date()
  // 转为北京时间
  var bjOffset = 8 * 60 * 60 * 1000
  var bjNow = new Date(now.getTime() + bjOffset)
  var todayStr = bjNow.getFullYear() + '-' +
    String(bjNow.getMonth() + 1).padStart(2, '0') + '-' +
    String(bjNow.getDate()).padStart(2, '0')

  var tomorrow = new Date(bjNow.getTime() + 24 * 60 * 60 * 1000)
  var tomorrowStr = tomorrow.getFullYear() + '-' +
    String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' +
    String(tomorrow.getDate()).padStart(2, '0')

  var sentCount = 0
  var errorCount = 0

  try {
    // 查找今天或明天到期的事件
    var result = await db.collection('countdown_reminders')
      .where({
        targetDate: db.RegExp({
          regexp: '^(' + todayStr + '|' + tomorrowStr + ')'
        })
      })
      .get()

    if (!result.data || result.data.length === 0) {
      return { success: true, sent: 0, message: 'no events to remind' }
    }

    for (var i = 0; i < result.data.length; i++) {
      var item = result.data[i]
      var isToday = item.targetDate === todayStr
      var isTomorrow = item.targetDate === tomorrowStr

      // 检查是否已发送过
      if (isToday && item.remindedToday) continue
      if (isTomorrow && item.reminded1Day) continue

      // 计算剩余天数
      var daysLeft = isToday ? 0 : 1

      // 发送订阅消息 - 匹配「行动计划提醒」模板
      // 字段：计划名称、执行时间、计划内容、温馨提示
      try {
        var planName = item.eventName.length > 20 ? item.eventName.substring(0, 18) + '...' : item.eventName
        var planContent = daysLeft === 0 ? '今天到期，别忘了哦！' : '明天到期，提前准备吧！'
        var warmTip = '距离' + item.eventName + (daysLeft === 0 ? '已到' : '还有1天')

        await cloud.openapi.subscribeMessage.send({
          touser: item.openid,
          templateId: item.templateId,
          page: 'package-life/countdown/countdown',
          data: {
            thing1: { value: planName },
            time2: { value: item.targetDate + ' ' + (item.targetTime || '00:00') },
            thing3: { value: planContent },
            thing4: { value: warmTip.length > 20 ? warmTip.substring(0, 18) + '...' : warmTip }
          },
          miniprogramState: 'formal'
        })

        // 更新提醒状态
        var updateData = {}
        if (isToday) updateData.remindedToday = true
        if (isTomorrow) updateData.reminded1Day = true

        await db.collection('countdown_reminders')
          .doc(item._id)
          .update({ data: updateData })

        sentCount++
      } catch (e) {
        console.error('send reminder error:', e)
        errorCount++
      }
    }

    // 每天重置提醒状态（针对重复事件）
    // 清理已过期的非重复事件
    var expiredResult = await db.collection('countdown_reminders')
      .where({
        targetDate: db.RegExp({ regexp: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' }),
        repeat: 'none'
      })
      .get()

    for (var j = 0; j < expiredResult.data.length; j++) {
      var expItem = expiredResult.data[j]
      if (expItem.targetDate < todayStr && expItem.remindedToday) {
        await db.collection('countdown_reminders')
          .doc(expItem._id)
          .remove()
      }
    }

    return { success: true, sent: sentCount, errors: errorCount }
  } catch (e) {
    console.error('checkAndRemind error:', e)
    return { success: false, error: e.message }
  }
}
