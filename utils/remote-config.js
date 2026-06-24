var CACHE_KEY = 'remote_config'
var CACHE_TIME_KEY = 'remote_config_time'
var CACHE_TTL = 3600000
var storageUtil = require('./storage.js')

var DEFAULT_CONFIG = {
  hotSearchWords: ['汇率', '房贷', 'BMI', '个税', '字数', '番茄', 'JSON', '图片', '密码', '随机'],
  announcement: '',
  announcementEnabled: false,
  bannerEnabled: false,
  bannerImage: '',
  bannerLink: '',
  forceUpdateVersion: '',
  minSupportVersion: '',
  toolOrder: [],
  featuredToolIds: []
}

var RemoteConfig = {
  _config: null,

  init: function(callback) {
    var cached = this._loadCache()
    if (cached) {
      this._config = cached
      if (callback) callback(cached)
    }
    this._fetchFromCloud(callback)
  },

  get: function(key) {
    if (!this._config) this._config = this._loadCache() || DEFAULT_CONFIG
    if (key) return this._config[key] !== undefined ? this._config[key] : DEFAULT_CONFIG[key]
    return this._config
  },

  getAll: function() {
    if (!this._config) this._config = this._loadCache() || DEFAULT_CONFIG
    return this._config
  },

  _fetchFromCloud: function(callback) {
    var that = this
    try {
      var app = getApp()
      if (!app || !app.cloudReady) {
        if (callback) callback(that._config || DEFAULT_CONFIG)
        return
      }

      var db = wx.cloud.database()
      db.collection('config').doc('app_config').get({
        success: function(res) {
          if (res && res.data) {
            var remoteData = res.data
            delete remoteData._id
            delete remoteData._openid
            var merged = that._merge(DEFAULT_CONFIG, remoteData)
            that._config = merged
            that._saveCache(merged)
            if (callback) callback(merged)
          }
        },
        fail: function() {
          if (callback) callback(that._config || DEFAULT_CONFIG)
        }
      })
    } catch(e) {
      if (callback) callback(that._config || DEFAULT_CONFIG)
    }
  },

  _merge: function(defaults, remote) {
    var result = {}
    for (var key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        result[key] = (remote[key] !== undefined) ? remote[key] : defaults[key]
      }
    }
    return result
  },

  _loadCache: function() {
    try {
      var cacheTime = storageUtil.get(CACHE_TIME_KEY, 0)
      if (Date.now() - cacheTime > CACHE_TTL) return null
      var cached = storageUtil.get(CACHE_KEY)
      if (cached && typeof cached === 'object') return cached
    } catch(e) {}
    return null
  },

  _saveCache: function(config) {
    try {
      storageUtil.safeSet(CACHE_KEY, config)
      storageUtil.safeSet(CACHE_TIME_KEY, Date.now())
    } catch(e) {}
  }
}

module.exports = RemoteConfig
