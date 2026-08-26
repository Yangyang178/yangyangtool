const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// checkin_rank 集合结构：
// { _openid, continuousDays, totalDays, totalPoints, lastCheckinDate, nickName, avatarUrl, updateTime }

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  // 上报签到数据
  if (action === 'report') {
    const { continuousDays, totalDays, totalPoints, lastCheckinDate, nickName, avatarUrl } = event
    try {
      const existRes = await db.collection('checkin_rank')
        .where({ _openid: openid })
        .limit(1)
        .get()

      const now = db.serverDate()
      if (existRes.data && existRes.data.length > 0) {
        const updateData = {
          continuousDays: continuousDays || 0,
          totalDays: totalDays || 0,
          totalPoints: totalPoints || 0,
          lastCheckinDate: lastCheckinDate || '',
          updateTime: now
        }
        if (nickName) updateData.nickName = nickName
        if (avatarUrl) updateData.avatarUrl = avatarUrl
        await db.collection('checkin_rank').doc(existRes.data[0]._id).update({ data: updateData })
      } else {
        await db.collection('checkin_rank').add({
          data: {
            _openid: openid,
            continuousDays: continuousDays || 0,
            totalDays: totalDays || 0,
            totalPoints: totalPoints || 0,
            lastCheckinDate: lastCheckinDate || '',
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

  // 获取排行榜
  if (action === 'getRank') {
    const { type, limit } = event
    const rankLimit = limit || 20
    let orderByField = 'continuousDays'
    if (type === 'total') orderByField = 'totalDays'

    try {
      const rankRes = await db.collection('checkin_rank')
        .orderBy(orderByField, 'desc')
        .orderBy('updateTime', 'asc')
        .limit(rankLimit)
        .get()

      // 获取当前用户排名
      const userRes = await db.collection('checkin_rank')
        .where({ _openid: openid })
        .limit(1)
        .get()

      let myRank = -1
      if (userRes.data && userRes.data.length > 0) {
        // 统计比当前用户排名靠前的人数
        const myData = userRes.data[0]
        const myValue = myData[orderByField]
        const countRes = await db.collection('checkin_rank')
          .where({
            [orderByField]: _.gt(myValue)
          })
          .count()
        myRank = countRes.total + 1
      }

      // 对排行榜数据脱敏（隐藏openid）
      const rankList = (rankRes.data || []).map((item, index) => ({
        rank: index + 1,
        nickName: item.nickName || '用户' + item._openid.slice(-4),
        avatarUrl: item.avatarUrl || '',
        continuousDays: item.continuousDays || 0,
        totalDays: item.totalDays || 0,
        totalPoints: item.totalPoints || 0,
        lastCheckinDate: item.lastCheckinDate || '',
        isMe: item._openid === openid
      }))

      return {
        success: true,
        rankList: rankList,
        myRank: myRank,
        myData: userRes.data && userRes.data.length > 0 ? {
          continuousDays: userRes.data[0].continuousDays || 0,
          totalDays: userRes.data[0].totalDays || 0,
          totalPoints: userRes.data[0].totalPoints || 0
        } : null
      }
    } catch (e) {
      return { success: false, error: e.message, rankList: [], myRank: -1 }
    }
  }

  return { success: false, error: 'unknown action' }
}
