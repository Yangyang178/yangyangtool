const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// tool_usage_rank 集合结构：
// { toolId, toolName, toolIcon, totalUses, todayUses, todayDate, updateTime }

exports.main = async (event, context) => {
  const { action } = event

  // 上报工具使用
  if (action === 'report') {
    const { toolId, toolName, toolIcon } = event
    if (!toolId) return { success: false, error: 'toolId required' }

    // 使用北京时间计算日期
    const nowUtc = new Date()
    const bjOffset = 8 * 60 * 60 * 1000
    const bjDate = new Date(nowUtc.getTime() + bjOffset)
    const todayStr = bjDate.toISOString().split('T')[0]

    try {
      const existRes = await db.collection('tool_usage_rank')
        .where({ toolId: toolId })
        .limit(1)
        .get()

      const now = db.serverDate()

      if (existRes.data && existRes.data.length > 0) {
        const doc = existRes.data[0]
        const updateData = {
          totalUses: _.inc(1),
          updateTime: now
        }
        if (doc.todayDate === todayStr) {
          updateData.todayUses = _.inc(1)
        } else {
          updateData.todayUses = 1
          updateData.todayDate = todayStr
        }
        if (toolName) updateData.toolName = toolName
        if (toolIcon) updateData.toolIcon = toolIcon

        await db.collection('tool_usage_rank').doc(doc._id).update({ data: updateData })
      } else {
        await db.collection('tool_usage_rank').add({
          data: {
            toolId: toolId,
            toolName: toolName || '',
            toolIcon: toolIcon || '',
            totalUses: 1,
            todayUses: 1,
            todayDate: todayStr,
            updateTime: now
          }
        })
      }
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  // 获取工具排行
  if (action === 'getRank') {
    const { type, limit } = event
    const rankLimit = limit || 10
    let orderByField = 'todayUses'
    if (type === 'total') orderByField = 'totalUses'

    try {
      const rankRes = await db.collection('tool_usage_rank')
        .orderBy(orderByField, 'desc')
        .orderBy('updateTime', 'asc')
        .limit(rankLimit)
        .get()

      const rankList = (rankRes.data || []).map((item, index) => ({
        rank: index + 1,
        toolId: item.toolId,
        toolName: item.toolName || '',
        toolIcon: item.toolIcon || '',
        todayUses: item.todayUses || 0,
        totalUses: item.totalUses || 0
      }))

      return { success: true, rankList: rankList }
    } catch (e) {
      return { success: false, error: e.message, rankList: [] }
    }
  }

  return { success: false, error: 'unknown action' }
}
