function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    return false
  }
}

function get(key, defaultValue) {
  try {
    var raw = wx.getStorageSync(key)
    if (raw === '' || raw === undefined || raw === null) {
      return defaultValue !== undefined ? defaultValue : null
    }
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw) && 'v' in raw && 'd' in raw && typeof raw.v === 'number' && 't' in raw) {
      return raw.d
    }
    return raw
  } catch (e) {
    return defaultValue !== undefined ? defaultValue : null
  }
}

function unwrap(raw) {
  if (raw === '' || raw === undefined || raw === null) return raw
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw) && 'v' in raw && 'd' in raw && typeof raw.v === 'number' && 't' in raw) return raw.d
  return raw
}

function remove(key) {
  try { wx.removeStorageSync(key); return true } catch (e) { return false }
}

function clear() {
  try { wx.clearStorageSync(); return true } catch (e) { return false }
}

function getInfo(key) {
  try {
    var raw = wx.getStorageSync(key)
    if (raw === '' || raw === undefined || raw === null) return { exists: false, size: 0 }
    return { exists: true, size: JSON.stringify(raw).length * 2 }
  } catch (e) { return { exists: false, size: 0 } }
}

function getAllKeys() {
  try { var info = wx.getStorageInfoSync(); return info.keys || [] } catch (e) { return [] }
}

function safeGet(key, defaultValue) {
  try {
    var raw = wx.getStorageSync(key)
    if (raw === '' || raw === undefined || raw === null) {
      return defaultValue !== undefined ? defaultValue : null
    }
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw) && 'v' in raw && 'd' in raw && typeof raw.v === 'number' && 't' in raw) {
      var data = raw.d
      if (defaultValue !== undefined && (data === undefined || data === null)) return defaultValue
      return data
    }
    return raw
  } catch (e) {
    return defaultValue !== undefined ? defaultValue : null
  }
}

function safeGetArray(key) {
  var data = safeGet(key, [])
  if (Array.isArray(data)) return data
  return []
}

/**
 * 清理按日期键存储的对象，只保留最近N天的数据
 * @param {string} key - 存储键名
 * @param {number} keepDays - 保留天数
 */
function cleanDateKeyedData(key, keepDays) {
  if (!keepDays) keepDays = 30
  try {
    var data = wx.getStorageSync(key)
    if (!data || typeof data !== 'object' || Array.isArray(data)) return
    var cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - keepDays)
    var cutoffStr = cutoff.toDateString()
    var keys = Object.keys(data)
    var changed = false
    for (var i = 0; i < keys.length; i++) {
      try {
        var d = new Date(keys[i])
        if (isNaN(d.getTime()) || d < cutoff) {
          delete data[keys[i]]
          changed = true
        }
      } catch (e) {
        delete data[keys[i]]
        changed = true
      }
    }
    if (changed) {
      wx.setStorageSync(key, data)
    }
  } catch (e) {}
}

/**
 * 安全写入存储，写入前检查存储空间
 * @param {string} key - 存储键名
 * @param {*} value - 存储值
 * @returns {boolean} 是否写入成功
 */
function safeSet(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    // 存储空间不足，尝试清理后重试
    try {
      var info = wx.getStorageInfoSync()
      if (info.currentSize >= info.limitSize * 0.9) {
        // 清理日期索引数据
        var dateKeys = ['pomodoro_records', 'water_records']
        for (var i = 0; i < dateKeys.length; i++) {
          cleanDateKeyedData(dateKeys[i], 7)
        }
        // 清理临时文件
        try {
          var fs = wx.getFileSystemManager()
          var files = fs.readdirSync(wx.env.USER_DATA_PATH)
          for (var j = 0; j < files.length; j++) {
            if (files[j].indexOf('b64decode_') === 0 || files[j].indexOf('.csv') > -1) {
              try { fs.unlinkSync(wx.env.USER_DATA_PATH + '/' + files[j]) } catch (e2) {}
            }
          }
        } catch (e3) {}
        // 重试写入
        try {
          wx.setStorageSync(key, value)
          return true
        } catch (e4) {
          return false
        }
      }
    } catch (e5) {}
    return false
  }
}

module.exports = {
  set: set,
  get: get,
  unwrap: unwrap,
  safeGet: safeGet,
  safeGetArray: safeGetArray,
  safeSet: safeSet,
  cleanDateKeyedData: cleanDateKeyedData,
  remove: remove,
  clear: clear,
  getInfo: getInfo,
  getAllKeys: getAllKeys
}
