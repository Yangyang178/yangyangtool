var STORAGE_VERSION = 1

var _migrations = {}

function registerMigration(fromVersion, toVersion, migrateFn) {
  var key = fromVersion + '->' + toVersion
  _migrations[key] = migrateFn
}

registerMigration(0, 1, function(data) {
  return data
})

function set(key, value) {
  var wrapped = {
    v: STORAGE_VERSION,
    d: value,
    t: Date.now()
  }
  try {
    wx.setStorageSync(key, wrapped)
    return true
  } catch (e) {
    console.error('[Storage.set] Failed for key:', key, e)
    return false
  }
}

function get(key, defaultValue) {
  try {
    var raw = wx.getStorageSync(key)
    if (raw === '' || raw === undefined || raw === null) {
      return defaultValue !== undefined ? defaultValue : null
    }

    if (typeof raw === 'object' && raw !== null && 'v' in raw) {
      var storedVersion = raw.v
      if (storedVersion < STORAGE_VERSION) {
        console.log('[Storage.get] Migrating', key, 'from v' + storedVersion + ' to v' + STORAGE_VERSION)
        var migratedData = runMigrations(storedVersion, STORAGE_VERSION, raw.d)
        set(key, migratedData)
        return migratedData
      }

      if (storedVersion > STORAGE_VERSION) {
        console.warn('[Storage.get]', key, 'has newer version v' + storedVersion + ', current app is v' + STORAGE_VERSION)
        return raw.d
      }

      return raw.d
    }

    console.log('[Storage.get]', key, 'has unversioned data, wrapping with v' + STORAGE_VERSION)
    set(key, raw)
    return raw
  } catch (e) {
    console.error('[Storage.get] Failed for key:', key, e)
    return defaultValue !== undefined ? defaultValue : null
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('[Storage.remove] Failed for key:', key, e)
    return false
  }
}

function clear() {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('[Storage.clear] Failed:', e)
    return false
  }
}

function getInfo(key) {
  try {
    var raw = wx.getStorageSync(key)
    if (raw === '' || raw === undefined || raw === null) {
      return { exists: false, version: 0, size: 0, updatedAt: 0 }
    }

    if (typeof raw === 'object' && raw !== null && 'v' in raw) {
      return {
        exists: true,
        version: raw.v,
        size: JSON.stringify(raw).length * 2,
        updatedAt: raw.t || 0
      }
    }

    return {
      exists: true,
      version: 0,
      size: JSON.stringify(raw).length * 2,
      updatedAt: 0
    }
  } catch (e) {
    return { exists: false, version: 0, size: 0, updatedAt: 0 }
  }
}

function getAllKeys() {
  try {
    var info = wx.getStorageInfoSync()
    return info.keys || []
  } catch (e) {
    return []
  }
}

function getRaw(key) {
  try {
    return wx.getStorageSync(key)
  } catch (e) {
    return null
  }
}

function runMigrations(fromVer, toVer, data) {
  var currentData = data
  var currentVer = fromVer

  while (currentVer < toVer) {
    var nextVer = currentVer + 1
    var migrationKey = currentVer + '->' + nextVer
    var migrator = _migrations[migrationKey]

    if (migrator) {
      try {
        currentData = migrator(currentData)
        console.log('[Storage] Migration', migrationKey, 'succeeded')
      } catch (e) {
        console.error('[Storage] Migration', migrationKey, 'failed:', e)
      }
    } else {
      console.warn('[Storage] No migration found for', migrationKey)
    }

    currentVer = nextVer
  }

  return currentData
}

module.exports = {
  VERSION: STORAGE_VERSION,
  set: set,
  get: get,
  remove: remove,
  clear: clear,
  getInfo: getInfo,
  getAllKeys: getAllKeys,
  getRaw: getRaw,
  registerMigration: registerMigration
}
