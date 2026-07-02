var storageUtil = require('./storage.js')
var checkin = require('./checkin.js')
var i18n = require('./i18n.js')

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
  { id: 'checkin', nameKey: 'taskCheckin', icon: '📅', descKey: 'taskCheckinDesc', points: 10, target: 1 },
  { id: 'use_tools', nameKey: 'taskUseTools3', icon: '🔧', descKey: 'taskUseTools3Desc', points: 10, target: 3 },
  { id: 'use_tools_5', nameKey: 'taskUseTools5', icon: '⚡', descKey: 'taskUseTools5Desc', points: 15, target: 5 },
  { id: 'share_once', nameKey: 'taskShareOnce', icon: '📢', descKey: 'taskShareOnceDesc', points: 10, target: 1 },
  { id: 'fun_challenge', nameKey: 'taskFunChallenge', icon: '🧠', descKey: 'taskFunChallengeDesc', points: 15, target: 3 }
]

var SHOP_ITEMS = [
  {
    id: 'frame_gold',
    nameKey: 'shopFrameGold',
    icon: '🥇',
    descKey: 'shopFrameGoldDesc',
    price: 200,
    type: 'frame',
    frameClass: 'frame-gold',
    style: ''
  },
  {
    id: 'frame_diamond',
    nameKey: 'shopFrameDiamond',
    icon: '💎',
    descKey: 'shopFrameDiamondDesc',
    price: 500,
    type: 'frame',
    frameClass: 'frame-diamond',
    style: ''
  },
  {
    id: 'frame_rainbow',
    nameKey: 'shopFrameRainbow',
    icon: '🌈',
    descKey: 'shopFrameRainbowDesc',
    price: 800,
    type: 'frame',
    frameClass: 'frame-rainbow',
    style: ''
  },
  {
    id: 'theme_rose',
    nameKey: 'shopThemeRose',
    icon: '🌹',
    descKey: 'shopThemeRoseDesc',
    price: 300,
    type: 'theme',
    color: '#E11D48'
  },
  {
    id: 'theme_emerald',
    nameKey: 'shopThemeEmerald',
    icon: '💚',
    descKey: 'shopThemeEmeraldDesc',
    price: 300,
    type: 'theme',
    color: '#059669'
  },
  {
    id: 'theme_amber',
    nameKey: 'shopThemeAmber',
    icon: '🟡',
    descKey: 'shopThemeAmberDesc',
    price: 300,
    type: 'theme',
    color: '#D97706'
  },
  {
    id: 'theme_violet',
    nameKey: 'shopThemeViolet',
    icon: '💜',
    descKey: 'shopThemeVioletDesc',
    price: 400,
    type: 'theme',
    color: '#7C3AED'
  },
  {
    id: 'theme_sunset',
    nameKey: 'shopThemeSunset',
    icon: '🌅',
    descKey: 'shopThemeSunsetDesc',
    price: 500,
    type: 'theme',
    color: '#EA580C',
    color2: '#DC2626'
  },
  {
    id: 'theme_aurora',
    nameKey: 'shopThemeAurora',
    icon: '🌌',
    descKey: 'shopThemeAuroraDesc',
    price: 500,
    type: 'theme',
    color: '#06B6D4',
    color2: '#8B5CF6'
  },
  {
    id: 'theme_sakura',
    nameKey: 'shopThemeSakura',
    icon: '🌸',
    descKey: 'shopThemeSakuraDesc',
    price: 500,
    type: 'theme',
    color: '#EC4899',
    color2: '#F9A8D4'
  },
  {
    id: 'theme_ocean',
    nameKey: 'shopThemeOcean',
    icon: '🌊',
    descKey: 'shopThemeOceanDesc',
    price: 500,
    type: 'theme',
    color: '#1D4ED8',
    color2: '#0891B2'
  },
  {
    id: 'theme_forest',
    nameKey: 'shopThemeForest',
    icon: '🌲',
    descKey: 'shopThemeForestDesc',
    price: 500,
    type: 'theme',
    color: '#15803D',
    color2: '#CA8A04'
  },
  {
    id: 'theme_lavender',
    nameKey: 'shopThemeLavender',
    icon: '💜',
    descKey: 'shopThemeLavenderDesc',
    price: 600,
    type: 'theme',
    color: '#7C3AED',
    color2: '#DB2777'
  },
  {
    id: 'theme_fire',
    nameKey: 'shopThemeFire',
    icon: '🔥',
    descKey: 'shopThemeFireDesc',
    price: 600,
    type: 'theme',
    color: '#B91C1C',
    color2: '#F59E0B'
  },
  {
    id: 'theme_night',
    nameKey: 'shopThemeNight',
    icon: '✨',
    descKey: 'shopThemeNightDesc',
    price: 600,
    type: 'theme',
    color: '#1E1B4B',
    color2: '#4338CA'
  },
  {
    id: 'badge_pioneer',
    nameKey: 'shopBadgePioneer',
    icon: '🏅',
    descKey: 'shopBadgePioneerDesc',
    price: 600,
    type: 'badge',
    badge: '🏅'
  },
  {
    id: 'badge_master',
    nameKey: 'shopBadgeMaster',
    icon: '👑',
    descKey: 'shopBadgeMasterDesc',
    price: 1000,
    type: 'badge',
    badge: '👑'
  },
  {
    id: 'font_kai',
    nameKey: 'shopFontKai',
    icon: '📝',
    descKey: 'shopFontKaiDesc',
    price: 200,
    type: 'font',
    fontFamily: 'KaiTi, STKaiti, serif',
    fontClass: 'font-family-kai'
  },
  {
    id: 'font_song',
    nameKey: 'shopFontSong',
    icon: '📜',
    descKey: 'shopFontSongDesc',
    price: 200,
    type: 'font',
    fontFamily: 'SimSun, STSong, serif',
    fontClass: 'font-family-song'
  },
  {
    id: 'font_fang',
    nameKey: 'shopFontFang',
    icon: '✒️',
    descKey: 'shopFontFangDesc',
    price: 250,
    type: 'font',
    fontFamily: 'FangSong, STFangsong, serif',
    fontClass: 'font-family-fang'
  },
  {
    id: 'font_round',
    nameKey: 'shopFontRound',
    icon: '💫',
    descKey: 'shopFontRoundDesc',
    price: 350,
    type: 'font',
    fontFamily: 'Hiragino Sans GB, YouYuan, sans-serif',
    fontClass: 'font-family-round'
  },
  {
    id: 'font_hei',
    nameKey: 'shopFontHei',
    icon: '🔲',
    descKey: 'shopFontHeiDesc',
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
        name: i18n.t(task.nameKey),
        icon: task.icon,
        desc: i18n.t(task.descKey),
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
          this._addPoints(taskDef.points, i18n.t('reasonCompleteTask') + ': ' + i18n.t(taskDef.nameKey))
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

      this._addPoints(TOOL_USE_POINTS, i18n.t('reasonUseTool'))

      var taskDef3 = null
      var taskDef5 = null
      for (var j = 0; j < DAILY_TASKS.length; j++) {
        if (DAILY_TASKS[j].id === 'use_tools') taskDef3 = DAILY_TASKS[j]
        if (DAILY_TASKS[j].id === 'use_tools_5') taskDef5 = DAILY_TASKS[j]
      }
      if (taskDef3 && saved.use_tools >= taskDef3.target && saved.use_tools - 1 < taskDef3.target) {
        this._addPoints(taskDef3.points, i18n.t('reasonCompleteTask') + ': ' + i18n.t(taskDef3.nameKey))
      }
      if (taskDef5 && saved.use_tools_5 >= taskDef5.target && saved.use_tools_5 - 1 < taskDef5.target) {
        this._addPoints(taskDef5.points, i18n.t('reasonCompleteTask') + ': ' + i18n.t(taskDef5.nameKey))
      }
    }
    return this.getDailyTasks()
  },

  claimDailyBonus: function() {
    var taskInfo = this.getDailyTasks()
    if (!taskInfo.allDone) return { success: false, message: i18n.t('ptsTaskNotDone') }
    if (taskInfo.bonusClaimed) return { success: false, message: i18n.t('ptsBonusClaimed') }
    var saved = storageUtil.get(DAILY_TASKS_KEY, null)
    if (!saved || typeof saved !== 'object') {
      saved = { date: this._getToday(), checkin: 0, use_tools: 0, use_tools_5: 0, share_once: 0, fun_challenge: 0, bonusClaimed: false }
    }
    saved.bonusClaimed = true
    wx.setStorageSync(DAILY_TASKS_KEY, saved)
    this._addPoints(DAILY_TASK_BONUS, i18n.t('reasonDailyBonus'))
    return { success: true, points: DAILY_TASK_BONUS, message: i18n.t('ptsBonusSuccess') + DAILY_TASK_BONUS + i18n.t('ptsUnit') }
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
    if (!inviterCode) return { success: false, message: i18n.t('ptsInviteInvalid') }
    if (inviterCode === myCode) return { success: false, message: i18n.t('ptsInviteSelf') }
    if (inviterCode.length < 4) return { success: false, message: i18n.t('ptsInviteFormat') }
    if (inviterCode.indexOf('BB') !== 0) return { success: false, message: i18n.t('ptsInviteFormat') }
    var invited = storageUtil.get('invited_by', '')
    if (invited) return { success: false, message: i18n.t('ptsInviteUsed') }
    storageUtil.set('invited_by', inviterCode)
    this._addPoints(INVITE_POINTS, i18n.t('reasonInvite'))
    this._saveInviteRelation(inviterCode)
    return { success: true, points: INVITE_POINTS, message: i18n.t('ptsInviteSuccess') + INVITE_POINTS + i18n.t('ptsUnit') }
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
      this._addPoints(totalPoints, i18n.t('reasonInviteReward', { count: count }))
      var records = storageUtil.safeGetArray(INVITE_KEY)
      for (var j = 0; j < pending.length; j++) {
        records.unshift({
          invitee: pending[j].invitee || i18n.t('friend'),
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
                  invitee: res.data[i].inviteeCode || i18n.t('friend'),
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
        name: i18n.t(item.nameKey),
        icon: item.icon,
        desc: i18n.t(item.descKey),
        price: item.price,
        type: item.type,
        style: item.style || '',
        frameClass: item.frameClass || '',
        color: item.color || '',
        color2: item.color2 || '',
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
    if (!itemDef) return { success: false, message: i18n.t('ptsItemNotExist') }

    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    for (var j = 0; j < owned.length; j++) {
      if (owned[j] === itemId) return { success: false, message: i18n.t('ptsItemOwned') }
    }

    var currentPoints = checkin.getCurrentPoints()
    if (currentPoints < itemDef.price) return { success: false, message: i18n.t('ptsNotEnough') + (itemDef.price - currentPoints) + i18n.t('ptsUnit') }

    var spendResult = checkin.spendPoints(itemDef.price)
    if (!spendResult.success) return { success: false, message: i18n.t('ptsSpendFail') }

    owned.push(itemId)
    wx.setStorageSync(SHOP_ITEMS_KEY, owned)

    if (itemDef.type === 'frame' || itemDef.type === 'badge') {
      storageUtil.set(ACTIVE_FRAME_KEY, itemId)
    } else if (itemDef.type === 'theme') {
      storageUtil.set(ACTIVE_THEME_KEY, itemId)
    } else if (itemDef.type === 'font') {
      storageUtil.set(ACTIVE_FONT_KEY, itemId)
    }

    return { success: true, message: i18n.t('ptsPurchaseSuccess'), item: itemDef }
  },

  activateItem: function(itemId) {
    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    var isOwned = false
    for (var i = 0; i < owned.length; i++) {
      if (owned[i] === itemId) { isOwned = true; break }
    }
    if (!isOwned) return { success: false, message: i18n.t('ptsItemNotOwned') }

    var itemDef = null
    for (var j = 0; j < SHOP_ITEMS.length; j++) {
      if (SHOP_ITEMS[j].id === itemId) { itemDef = SHOP_ITEMS[j]; break }
    }
    if (!itemDef) return { success: false, message: i18n.t('ptsItemNotExist') }

    if (itemDef.type === 'frame' || itemDef.type === 'badge') {
      storageUtil.set(ACTIVE_FRAME_KEY, itemId)
    } else if (itemDef.type === 'theme') {
      storageUtil.set(ACTIVE_THEME_KEY, itemId)
    } else if (itemDef.type === 'font') {
      storageUtil.set(ACTIVE_FONT_KEY, itemId)
    }
    return { success: true, message: i18n.t('ptsActivated') }
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
            name: i18n.t(SHOP_ITEMS[i].nameKey),
            icon: SHOP_ITEMS[i].icon,
            desc: i18n.t(SHOP_ITEMS[i].descKey),
            frameClass: SHOP_ITEMS[i].frameClass || ''
          })
        }
      }
    }
    return frames
  },

  getOwnedThemes: function() {
    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    var themes = []
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].type === 'theme') {
        var isOwned = false
        for (var j = 0; j < owned.length; j++) {
          if (owned[j] === SHOP_ITEMS[i].id) { isOwned = true; break }
        }
        if (isOwned) {
          themes.push({
            id: SHOP_ITEMS[i].id,
            name: i18n.t(SHOP_ITEMS[i].nameKey),
            icon: SHOP_ITEMS[i].icon,
            desc: i18n.t(SHOP_ITEMS[i].descKey),
            color: SHOP_ITEMS[i].color || '',
            color2: SHOP_ITEMS[i].color2 || ''
          })
        }
      }
    }
    return themes
  },

  getOwnedBadges: function() {
    var owned = storageUtil.safeGetArray(SHOP_ITEMS_KEY)
    var badges = []
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].type === 'badge') {
        var isOwned = false
        for (var j = 0; j < owned.length; j++) {
          if (owned[j] === SHOP_ITEMS[i].id) { isOwned = true; break }
        }
        if (isOwned) {
          badges.push({
            id: SHOP_ITEMS[i].id,
            name: i18n.t(SHOP_ITEMS[i].nameKey),
            icon: SHOP_ITEMS[i].icon,
            desc: i18n.t(SHOP_ITEMS[i].descKey),
            badge: SHOP_ITEMS[i].badge || ''
          })
        }
      }
    }
    return badges
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
    var result = '--primaryColor:' + color + ';--primaryDark:' + darkColor + ';--primaryLight:' + lightColor + ';'
    if (theme.color2) {
      var darkColor2 = this._darkenColor(theme.color2, 20)
      result += '--primaryColor2:' + theme.color2 + ';--primaryDark2:' + darkColor2 + ';'
    } else {
      result += '--primaryColor2:' + darkColor + ';--primaryDark2:' + this._darkenColor(darkColor, 15) + ';'
    }
    return result
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
    storageUtil.safeSet(POINTS_KEY, newCurrent)
    storageUtil.safeSet(TOTAL_POINTS_KEY, newTotal)
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
