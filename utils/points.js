var storageUtil = require('./storage.js')
var checkin = require('./checkin.js')

var POINTS_KEY = 'user_points'
var TOTAL_POINTS_KEY = 'total_earned_points'
var DAILY_TASKS_KEY = 'daily_tasks'
var INVITE_KEY = 'invite_records'
var SHOP_ITEMS_KEY = 'owned_shop_items'
var ACTIVE_FRAME_KEY = 'active_avatar_frame'
var ACTIVE_THEME_KEY = 'active_theme_color'
var ACTIVE_FONT_KEY = 'active_font_family'

var TOOL_USE_POINTS = 2
var DAILY_TASK_BONUS = 20
var INVITE_POINTS = 50

var DAILY_TASKS = [
  { id: 'checkin', name: '每日签到', icon: '📅', desc: '完成今日签到', points: 10, target: 1 },
  { id: 'use_tools', name: '使用3个不同工具', icon: '🔧', desc: '使用3个不同的工具', points: 10, target: 3 },
  { id: 'use_tools_5', name: '使用5个工具', icon: '⚡', desc: '使用5个不同的工具', points: 15, target: 5 },
  { id: 'share_once', name: '分享一次', icon: '📢', desc: '分享小程序给好友', points: 10, target: 1 },
  { id: 'fun_challenge', name: '益智挑战', icon: '🧠', desc: '挑战3个益智工具', points: 15, target: 3 }
]

var SHOP_ITEMS = [
  {
    id: 'frame_gold',
    name: '流金溢彩头像框',
    icon: '🥇',
    desc: '流动的金色光芒，闪耀夺目',
    price: 200,
    type: 'frame',
    frameClass: 'frame-gold',
    style: ''
  },
  {
    id: 'frame_diamond',
    name: '璀璨星钻头像框',
    icon: '💎',
    desc: '冰蓝星钻光芒，高贵典雅',
    price: 500,
    type: 'frame',
    frameClass: 'frame-diamond',
    style: ''
  },
  {
    id: 'frame_rainbow',
    name: '梦幻极光头像框',
    icon: '🌈',
    desc: '七彩极光流转，如梦似幻',
    price: 800,
    type: 'frame',
    frameClass: 'frame-rainbow',
    style: ''
  },
  {
    id: 'theme_rose',
    name: '玫瑰主题色',
    icon: '🌹',
    desc: '浪漫玫瑰粉主题色',
    price: 300,
    type: 'theme',
    color: '#E11D48'
  },
  {
    id: 'theme_emerald',
    name: '翡翠主题色',
    icon: '💚',
    desc: '清新翡翠绿主题色',
    price: 300,
    type: 'theme',
    color: '#059669'
  },
  {
    id: 'theme_amber',
    name: '琥珀主题色',
    icon: '🟡',
    desc: '温暖琥珀金主题色',
    price: 300,
    type: 'theme',
    color: '#D97706'
  },
  {
    id: 'theme_violet',
    name: '紫晶主题色',
    icon: '💜',
    desc: '神秘紫晶主题色',
    price: 400,
    type: 'theme',
    color: '#7C3AED'
  },
  {
    id: 'badge_pioneer',
    name: '先锋徽章',
    icon: '🏅',
    desc: '显示在昵称旁的专属徽章',
    price: 600,
    type: 'badge',
    badge: '🏅'
  },
  {
    id: 'badge_master',
    name: '大师徽章',
    icon: '👑',
    desc: '显示在昵称旁的大师徽章',
    price: 1000,
    type: 'badge',
    badge: '👑'
  },
  {
    id: 'font_kai',
    name: '楷体字',
    icon: '📝',
    desc: '经典楷体，古韵悠长',
    price: 200,
    type: 'font',
    fontFamily: 'KaiTi, STKaiti, serif',
    fontClass: 'font-family-kai'
  },
  {
    id: 'font_song',
    name: '宋体字',
    icon: '📜',
    desc: '传统宋体，端庄大方',
    price: 200,
    type: 'font',
    fontFamily: 'SimSun, STSong, serif',
    fontClass: 'font-family-song'
  },
  {
    id: 'font_fang',
    name: '仿宋字',
    icon: '✒️',
    desc: '仿宋体，清秀雅致',
    price: 250,
    type: 'font',
    fontFamily: 'FangSong, STFangsong, serif',
    fontClass: 'font-family-fang'
  },
  {
    id: 'font_round',
    name: '圆体字',
    icon: '💫',
    desc: '圆润可爱，活泼灵动',
    price: 350,
    type: 'font',
    fontFamily: 'Hiragino Sans GB, YouYuan, sans-serif',
    fontClass: 'font-family-round'
  },
  {
    id: 'font_hei',
    name: '黑体字',
    icon: '🔲',
    desc: '简洁黑体，现代有力',
    price: 150,
    type: 'font',
    fontFamily: 'SimHei, STHeiti, sans-serif',
    fontClass: 'font-family-hei'
  }
]

var Points = {
  getDailyTasks: function() {
    var today = this._getToday()
    var saved = storageUtil.get(DAILY_TASKS_KEY, null)
    if (!saved || typeof saved !== 'object' || saved.date !== today) {
      saved = { date: today, checkin: 0, use_tools: 0, use_tools_5: 0, share_once: 0, fun_challenge: 0, bonusClaimed: false }
      wx.setStorageSync(DAILY_TASKS_KEY, saved)
    }
    var tasks = []
    for (var i = 0; i < DAILY_TASKS.length; i++) {
      var task = DAILY_TASKS[i]
      var progress = saved[task.id] || 0
      var completed = progress >= task.target
      tasks.push({
        id: task.id,
        name: task.name,
        icon: task.icon,
        desc: task.desc,
        points: task.points,
        target: task.target,
        progress: Math.min(progress, task.target),
        completed: completed
      })
    }
    var allDone = true
    for (var j = 0; j < tasks.length; j++) {
      if (!tasks[j].completed) { allDone = false; break }
    }
    return {
      tasks: tasks,
      allDone: allDone,
      bonusClaimed: saved.bonusClaimed || false,
      bonusPoints: DAILY_TASK_BONUS
    }
  },

  recordTaskProgress: function(taskId, increment) {
    var today = this._getToday()
    var saved = storageUtil.get(DAILY_TASKS_KEY, null)
    if (!saved || typeof saved !== 'object' || saved.date !== today) {
      saved = { date: today, checkin: 0, use_tools: 0, use_tools_5: 0, share_once: 0, fun_challenge: 0, bonusClaimed: false }
    }
    if (typeof increment === 'undefined') increment = 1
    saved[taskId] = (saved[taskId] || 0) + increment
    wx.setStorageSync(DAILY_TASKS_KEY, saved)

    var taskDef = null
    for (var i = 0; i < DAILY_TASKS.length; i++) {
      if (DAILY_TASKS[i].id === taskId) { taskDef = DAILY_TASKS[i]; break }
    }
    if (taskDef && saved[taskId] >= taskDef.target && taskDef.points > 0) {
      var prevProgress = saved[taskId] - increment
      if (prevProgress < taskDef.target) {
        if (taskId !== 'checkin') {
          this._addPoints(taskDef.points, '完成任务: ' + taskDef.name)
        }
      }
    }

    return this.getDailyTasks()
  },

  recordToolUse: function(toolId) {
    var today = this._getToday()
    var saved = storageUtil.get(DAILY_TASKS_KEY, null)
    if (!saved || typeof saved !== 'object' || saved.date !== today) {
      saved = { date: today, checkin: 0, use_tools: 0, use_tools_5: 0, share_once: 0, fun_challenge: 0, bonusClaimed: false }
    }
    var toolKey = 'daily_used_tools_' + today
    var usedTools = storageUtil.safeGetArray(toolKey)
    var alreadyUsed = false
    for (var i = 0; i < usedTools.length; i++) {
      if (usedTools[i] === toolId) { alreadyUsed = true; break }
    }
    if (!alreadyUsed) {
      usedTools.push(toolId)
      wx.setStorageSync(toolKey, usedTools)
      saved.use_tools = (saved.use_tools || 0) + 1
      saved.use_tools_5 = saved.use_tools
      wx.setStorageSync(DAILY_TASKS_KEY, saved)

      this._addPoints(TOOL_USE_POINTS, '使用工具')

      var taskDef3 = null
      var taskDef5 = null
      for (var j = 0; j < DAILY_TASKS.length; j++) {
        if (DAILY_TASKS[j].id === 'use_tools') taskDef3 = DAILY_TASKS[j]
        if (DAILY_TASKS[j].id === 'use_tools_5') taskDef5 = DAILY_TASKS[j]
      }
      if (taskDef3 && saved.use_tools >= taskDef3.target && saved.use_tools - 1 < taskDef3.target) {
        this._addPoints(taskDef3.points, '完成任务: ' + taskDef3.name)
      }
      if (taskDef5 && saved.use_tools_5 >= taskDef5.target && saved.use_tools_5 - 1 < taskDef5.target) {
        this._addPoints(taskDef5.points, '完成任务: ' + taskDef5.name)
      }
    }
    return this.getDailyTasks()
  },

  claimDailyBonus: function() {
    var taskInfo = this.getDailyTasks()
    if (!taskInfo.allDone) return { success: false, message: '请先完成所有每日任务' }
    if (taskInfo.bonusClaimed) return { success: false, message: '今日奖励已领取' }
    var saved = storageUtil.get(DAILY_TASKS_KEY, null)
    if (!saved || typeof saved !== 'object') {
      saved = { date: this._getToday(), checkin: 0, use_tools: 0, use_tools_5: 0, share_once: 0, fun_challenge: 0, bonusClaimed: false }
    }
    saved.bonusClaimed = true
    wx.setStorageSync(DAILY_TASKS_KEY, saved)
    this._addPoints(DAILY_TASK_BONUS, '完成全部每日任务奖励')
    return { success: true, points: DAILY_TASK_BONUS, message: '领取成功！+' + DAILY_TASK_BONUS + '积分' }
  },

  recordShare: function() {
    return this.recordTaskProgress('share_once')
  },

  recordFunToolUse: function(toolId) {
    var today = this._getToday()
    // 统一使用 daily_used_tools_ 去重，避免与 recordToolUse 重复计分
    var toolKey = 'daily_used_tools_' + today
    var usedTools = storageUtil.safeGetArray(toolKey)
    var alreadyUsed = false
    for (var i = 0; i < usedTools.length; i++) {
      if (usedTools[i] === toolId) { alreadyUsed = true; break }
    }
    if (!alreadyUsed) {
      // 计入 use_tools 任务并加基础积分
      this.recordToolUse(toolId)
    }
    // 单独追踪趣味工具用于 fun_challenge 任务
    var funKey = 'daily_fun_tools_' + today
    var usedFunTools = storageUtil.safeGetArray(funKey)
    var funAlreadyUsed = false
    for (var j = 0; j < usedFunTools.length; j++) {
      if (usedFunTools[j] === toolId) { funAlreadyUsed = true; break }
    }
    if (!funAlreadyUsed) {
      usedFunTools.push(toolId)
      wx.setStorageSync(funKey, usedFunTools)
      return this.recordTaskProgress('fun_challenge')
    }
    return this.getDailyTasks()
  },

  getInviteInfo: function() {
    var records = storageUtil.safeGetArray(INVITE_KEY)
    var totalInvites = records.length
    var totalPoints = 0
    for (var i = 0; i < records.length; i++) {
      totalPoints += (records[i].points || INVITE_POINTS)
    }
    return {
      totalInvites: totalInvites,
      totalPoints: totalPoints,
      records: records.slice(0, 20)
    }
  },

  recordInvite: function(inviterCode) {
    var myCode = this.getMyInviteCode()
    if (!inviterCode) return { success: false, message: '邀请码无效' }
    if (inviterCode === myCode) return { success: false, message: '不能使用自己的邀请码' }
    if (inviterCode.length < 4) return { success: false, message: '邀请码格式不正确' }
    if (inviterCode.indexOf('BB') !== 0) return { success: false, message: '邀请码格式不正确' }
    var invited = storageUtil.get('invited_by', '')
    if (invited) return { success: false, message: '已使用过邀请码' }
    storageUtil.set('invited_by', inviterCode)
    this._addPoints(INVITE_POINTS, '使用邀请码奖励')
    this._saveInviteRelation(inviterCode)
    return { success: true, points: INVITE_POINTS, message: '邀请码使用成功！+' + INVITE_POINTS + '积分' }
  },

  checkInviteRewards: function() {
    var myCode = this.getMyInviteCode()
    var pendingKey = 'pending_invite_rewards'
    var pending = storageUtil.safeGetArray(pendingKey)
    if (pending.length === 0) return { count: 0, points: 0 }
    var totalPoints = 0
    var count = 0
    for (var i = 0; i < pending.length; i++) {
      totalPoints += INVITE_POINTS
      count++
    }
    if (count > 0) {
      this._addPoints(totalPoints, '邀请好友奖励 x' + count)
      var records = storageUtil.safeGetArray(INVITE_KEY)
      for (var j = 0; j < pending.length; j++) {
        records.unshift({
          invitee: pending[j].invitee || '好友',
          time: pending[j].time || Date.now(),
          points: INVITE_POINTS
        })
      }
      if (records.length > 50) records = records.slice(0, 50)
      wx.setStorageSync(INVITE_KEY, records)
      wx.setStorageSync(pendingKey, [])
    }
    return { count: count, points: totalPoints }
  },

  _saveInviteRelation: function(inviterCode) {
    try {
      if (wx.cloud) {
        var db = wx.cloud.database()
        db.collection('invite_relations').add({
          data: {
            inviterCode: inviterCode,
            inviteeCode: this.getMyInviteCode(),
            time: Date.now(),
            rewarded: false
          }
        })
      }
    } catch(e) {}
  },

  _checkCloudInviteRewards: function() {
    var myCode = this.getMyInviteCode()
    try {
      if (wx.cloud) {
        var db = wx.cloud.database()
        var that = this
        db.collection('invite_relations').where({
          inviterCode: myCode,
          rewarded: false
        }).get({
          success: function(res) {
            if (res.data && res.data.length > 0) {
              var pendingKey = 'pending_invite_rewards'
              var pending = []
              for (var i = 0; i < res.data.length; i++) {
                pending.push({
                  invitee: res.data[i].inviteeCode || '好友',
                  time: res.data[i].time || Date.now(),
                  _id: res.data[i]._id
                })
              }
              wx.setStorageSync(pendingKey, pending)
              that.checkInviteRewards()
              for (var j = 0; j < res.data.length; j++) {
                db.collection('invite_relations').doc(res.data[j]._id).update({ data: { rewarded: true } })
              }
            }
          }
        })
      }
    } catch(e) {}
  },

  getMyInviteCode: function() {
    var code = storageUtil.get('my_invite_code', '')
    if (!code) {
      code = 'BB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase()
      storageUtil.set('my_invite_code', code)
    }
    return code
  },

  getShopItems: function() {
    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    var activeFrame = storageUtil.get(ACTIVE_FRAME_KEY, '')
    var activeTheme = storageUtil.get(ACTIVE_THEME_KEY, '')
    var activeFont = storageUtil.get(ACTIVE_FONT_KEY, '')
    var items = []
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      var item = SHOP_ITEMS[i]
      var isOwned = false
      for (var j = 0; j < owned.length; j++) {
        if (owned[j] === item.id) { isOwned = true; break }
      }
      var isActive = false
      if (item.type === 'frame' && activeFrame === item.id) isActive = true
      if (item.type === 'theme' && activeTheme === item.id) isActive = true
      if (item.type === 'badge' && activeFrame === item.id) isActive = true
      if (item.type === 'font' && activeFont === item.id) isActive = true
      items.push({
        id: item.id,
        name: item.name,
        icon: item.icon,
        desc: item.desc,
        price: item.price,
        type: item.type,
        style: item.style || '',
        frameClass: item.frameClass || '',
        color: item.color || '',
        badge: item.badge || '',
        fontFamily: item.fontFamily || '',
        fontClass: item.fontClass || '',
        isOwned: isOwned,
        isActive: isActive
      })
    }
    return items
  },

  purchaseItem: function(itemId) {
    var itemDef = null
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].id === itemId) { itemDef = SHOP_ITEMS[i]; break }
    }
    if (!itemDef) return { success: false, message: '商品不存在' }

    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    for (var j = 0; j < owned.length; j++) {
      if (owned[j] === itemId) return { success: false, message: '已拥有该商品' }
    }

    var currentPoints = checkin.getCurrentPoints()
    if (currentPoints < itemDef.price) return { success: false, message: '积分不足，还需 ' + (itemDef.price - currentPoints) + ' 积分' }

    var spendResult = checkin.spendPoints(itemDef.price)
    if (!spendResult.success) return { success: false, message: '积分扣除失败' }

    owned.push(itemId)
    wx.setStorageSync(SHOP_ITEMS_KEY, owned)

    if (itemDef.type === 'frame' || itemDef.type === 'badge') {
      storageUtil.set(ACTIVE_FRAME_KEY, itemId)
    } else if (itemDef.type === 'theme') {
      storageUtil.set(ACTIVE_THEME_KEY, itemId)
    } else if (itemDef.type === 'font') {
      storageUtil.set(ACTIVE_FONT_KEY, itemId)
    }

    return { success: true, message: '购买成功！', item: itemDef }
  },

  activateItem: function(itemId) {
    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    var isOwned = false
    for (var i = 0; i < owned.length; i++) {
      if (owned[i] === itemId) { isOwned = true; break }
    }
    if (!isOwned) return { success: false, message: '未拥有该商品' }

    var itemDef = null
    for (var j = 0; j < SHOP_ITEMS.length; j++) {
      if (SHOP_ITEMS[j].id === itemId) { itemDef = SHOP_ITEMS[j]; break }
    }
    if (!itemDef) return { success: false, message: '商品不存在' }

    if (itemDef.type === 'frame' || itemDef.type === 'badge') {
      storageUtil.set(ACTIVE_FRAME_KEY, itemId)
    } else if (itemDef.type === 'theme') {
      storageUtil.set(ACTIVE_THEME_KEY, itemId)
    } else if (itemDef.type === 'font') {
      storageUtil.set(ACTIVE_FONT_KEY, itemId)
    }
    return { success: true, message: '已激活' }
  },

  deactivateItem: function(type) {
    if (type === 'frame' || type === 'badge') {
      storageUtil.set(ACTIVE_FRAME_KEY, '')
    } else if (type === 'theme') {
      storageUtil.set(ACTIVE_THEME_KEY, '')
    } else if (type === 'font') {
      storageUtil.set(ACTIVE_FONT_KEY, '')
    }
    return { success: true }
  },

  getActiveFrame: function() {
    var activeId = storageUtil.get(ACTIVE_FRAME_KEY, '')
    if (!activeId) return null
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].id === activeId) return SHOP_ITEMS[i]
    }
    return null
  },

  getOwnedFrames: function() {
    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    var frames = []
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].type === 'frame') {
        var isOwned = false
        for (var j = 0; j < owned.length; j++) {
          if (owned[j] === SHOP_ITEMS[i].id) { isOwned = true; break }
        }
        if (isOwned) {
          frames.push({
            id: SHOP_ITEMS[i].id,
            name: SHOP_ITEMS[i].name,
            icon: SHOP_ITEMS[i].icon,
            desc: SHOP_ITEMS[i].desc,
            frameClass: SHOP_ITEMS[i].frameClass || ''
          })
        }
      }
    }
    return frames
  },

  getActiveTheme: function() {
    var activeId = storageUtil.get(ACTIVE_THEME_KEY, '')
    if (!activeId) return null
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].id === activeId) return SHOP_ITEMS[i]
    }
    return null
  },

  getActiveFont: function() {
    var activeId = storageUtil.get(ACTIVE_FONT_KEY, '')
    if (!activeId) return null
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].id === activeId) return SHOP_ITEMS[i]
    }
    return null
  },

  getFontClass: function() {
    var font = this.getActiveFont()
    if (!font || !font.fontClass) return ''
    return font.fontClass
  },

  getFontFamily: function() {
    var font = this.getActiveFont()
    if (!font || !font.fontFamily) return ''
    return font.fontFamily
  },

  /**
   * 获取主题色的CSS变量字符串，用于style属性
   * 返回如: --primaryColor:#E11D48;--primaryDark:#BE123C;--primaryLight:rgba(225,29,72,0.1)
   */
  getThemeStyle: function() {
    var theme = this.getActiveTheme()
    if (!theme || !theme.color) return ''
    var color = theme.color
    var darkColor = this._darkenColor(color, 20)
    var lightColor = this._hexToRgba(color, 0.1)
    return '--primaryColor:' + color + ';--primaryDark:' + darkColor + ';--primaryLight:' + lightColor + ';'
  },

  /**
   * 将hex颜色变暗指定百分比
   */
  _darkenColor: function(hex, percent) {
    var r = parseInt(hex.slice(1, 3), 16)
    var g = parseInt(hex.slice(3, 5), 16)
    var b = parseInt(hex.slice(5, 7), 16)
    r = Math.max(0, Math.floor(r * (100 - percent) / 100))
    g = Math.max(0, Math.floor(g * (100 - percent) / 100))
    b = Math.max(0, Math.floor(b * (100 - percent) / 100))
    var rStr = r < 16 ? '0' + r.toString(16) : r.toString(16)
    var gStr = g < 16 ? '0' + g.toString(16) : g.toString(16)
    var bStr = b < 16 ? '0' + b.toString(16) : b.toString(16)
    return '#' + rStr + gStr + bStr
  },

  /**
   * 将hex颜色转为rgba字符串
   */
  _hexToRgba: function(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16)
    var g = parseInt(hex.slice(3, 5), 16)
    var b = parseInt(hex.slice(5, 7), 16)
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
  },

  getActiveBadge: function() {
    var frame = this.getActiveFrame()
    if (frame && frame.type === 'badge') return frame.badge
    return ''
  },

  getPointsSummary: function() {
    var currentPoints = checkin.getCurrentPoints()
    var totalEarned = checkin.getTotalEarnedPoints()
    var taskInfo = this.getDailyTasks()
    var inviteInfo = this.getInviteInfo()
    var completedTasks = 0
    for (var i = 0; i < taskInfo.tasks.length; i++) {
      if (taskInfo.tasks[i].completed) completedTasks++
    }
    return {
      currentPoints: currentPoints,
      totalEarned: totalEarned,
      totalSpent: Math.max(0, totalEarned - currentPoints),
      dailyTaskCompleted: completedTasks,
      dailyTaskTotal: taskInfo.tasks.length,
      dailyBonusClaimed: taskInfo.bonusClaimed,
      dailyAllDone: taskInfo.allDone,
      totalInvites: inviteInfo.totalInvites
    }
  },

  _addPoints: function(amount, reason) {
    var current = checkin.getCurrentPoints()
    var totalEarned = checkin.getTotalEarnedPoints()
    if (typeof current !== 'number' || isNaN(current)) current = 0
    if (typeof totalEarned !== 'number' || isNaN(totalEarned)) totalEarned = 0
    var newCurrent = current + amount
    var newTotal = totalEarned + amount
    wx.setStorageSync(POINTS_KEY, newCurrent)
    wx.setStorageSync(TOTAL_POINTS_KEY, newTotal)
  },

  _getToday: function() {
    var d = new Date()
    var y = d.getFullYear()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return y + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day)
  }
}

module.exports = Points
