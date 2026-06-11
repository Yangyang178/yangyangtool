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

module.exports = {
  set: set,
  get: get,
  unwrap: unwrap,
  safeGet: safeGet,
  safeGetArray: safeGetArray,
  remove: remove,
  clear: clear,
  getInfo: getInfo,
  getAllKeys: getAllKeys
}
