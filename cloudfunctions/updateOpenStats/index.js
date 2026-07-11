const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// open_stats 集合结构：
// { _openid, totalOpens, todayOpens, todayDate, nickName, avatarUrl, updateTime }

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  // 上报打开次数（每次启动小程序调用）
  if (action === 'report') {
    const { nickName, avatarUrl } = event
    // 使用北京时间(UTC+8)计算日期，避免跨天错误
    const nowUtc = new Date()
    const bjOffset = 8 * 60 * 60 * 1000
    const bjDate = new Date(nowUtc.getTime() + bjOffset)
    const todayStr = bjDate.toISOString().split('T')[0] // YYYY-MM-DD (北京时间)

    try {
      const existRes = await db.collection('open_stats')
        .where({ _openid: openid })
        .limit(1)
        .get()

      const now = db.serverDate()

      if (existRes.data && existRes.data.length > 0) {
        const doc = existRes.data[0]
        const updateData = {
          totalOpens: _.inc(1),
          updateTime: now
        }
        // 如果是今天，todayOpens+1；否则重置为1
        if (doc.todayDate === todayStr) {
          updateData.todayOpens = _.inc(1)
        } else {
          updateData.todayOpens = 1
          updateData.todayDate = todayStr
        }
        if (nickName) updateData.nickName = nickName
        if (avatarUrl) updateData.avatarUrl = avatarUrl

        await db.collection('open_stats').doc(doc._id).update({ data: updateData })
      } else {
        await db.collection('open_stats').add({
          data: {
            _openid: openid,
            totalOpens: 1,
            todayOpens: 1,
            todayDate: todayStr,
            nickName: nickName || '',
            avatarUrl: avatarUrl || '',
            updateTime: now
          }
        })
      }
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  // 获取开榜
  if (action === 'getRank') {
    const { type, limit } = event
    const rankLimit = limit || 10
    let orderByField = 'todayOpens'
    if (type === 'total') orderByField = 'totalOpens'

    try {
      const rankRes = await db.collection('open_stats')
        .orderBy(orderByField, 'desc')
        .orderBy('updateTime', 'asc')
        .limit(rankLimit)
        .get()

      // 获取当前用户排名
      const userRes = await db.collection('open_stats')
        .where({ _openid: openid })
        .limit(1)
        .get()

      let myRank = -1
      let myData = null
      if (userRes.data && userRes.data.length > 0) {
        myData = userRes.data[0]
        const myValue = myData[orderByField]
        const countRes = await db.collection('open_stats')
          .where({
            [orderByField]: _.gt(myValue)
          })
          .count()
        myRank = countRes.total + 1
      }

      const rankList = (rankRes.data || []).map((item, index) => ({
        rank: index + 1,
        nickName: item.nickName || '用户' + item._openid.slice(-4),
        avatarUrl: item.avatarUrl || '',
        todayOpens: item.todayOpens || 0,
        totalOpens: item.totalOpens || 0,
        isMe: item._openid === openid
      }))

      return {
        success: true,
        rankList: rankList,
        myRank: myRank,
        myData: myData ? {
          todayOpens: myData.todayOpens || 0,
          totalOpens: myData.totalOpens || 0
        } : null
      }
    } catch (e) {
      return { success: false, error: e.message, rankList: [], myRank: -1 }
    }
  }

  return { success: false, error: 'unknown action' }
}
