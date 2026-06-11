var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    ipAddress: '',
    queryResult: null,
    isLoading: false,
    hasResult: false,
    isDarkMode: false,
    fontSizeSetting: 'medium',

    myIpInfo: null,
    myIpLoading: false,
    showMyIpDetail: false,

    historyList: [],
    historySearch: '',
    showHistorySearch: false,

    batchMode: false,
    batchInput: '',
    batchResults: [],
    batchLoading: false,
    showBatchResult: false,

    ipFavorites: []
  },

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var i18nTexts = i18n.getToolPageTexts('ipLookup')
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('IP地址查询')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18nTexts })
    this._loadHistory()
    this._loadFavorites()
    this.queryMyIp()
    poster.setupForPage(this, 36)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ isDarkMode: isDark, fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('ipLookup') })
  },

  onIpInput: function(e) {
    this.setData({ ipAddress: e.detail.value })
  },

  _parseGeoipResult: function(data) {
    if (!data || !data.ip) return null
    return {
      ip: data.ip || '',
      country: data.country || '',
      province: data.region || '',
      city: data.city || '',
      district: '',
      isp: data.isp || '',
      org: data.organization || data.asn_organization || '',
      asn: data.asn ? 'AS' + data.asn : '',
      lat: data.latitude ? String(data.latitude) : '',
      lon: data.longitude ? String(data.longitude) : '',
      timezone: data.timezone || '',
      countryCode: data.country_code || ''
    }
  },

  queryIp: function() {
    var ip = this.data.ipAddress.trim()
    if (!ip) {
      wx.showToast({ title: this.data.i18n.pleaseInputIp, icon: 'none' })
      return
    }
    if (!this._validateIp(ip)) {
      wx.showToast({ title: this.data.i18n.ipFormatError, icon: 'none' })
      return
    }
    toolActions.vibrate('light')
    this.setData({ isLoading: true, hasResult: false, queryResult: null })
    var that = this
    wx.request({
      url: 'https://api.ip.sb/geoip/' + ip,
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        var result = that._parseGeoipResult(res.data)
        if (result) {
          that.setData({
            queryResult: result,
            hasResult: true,
            isLoading: false
          })
          that._saveHistory(result)
          var tracker = getApp().tracker
          if (tracker) tracker.toolUse(36, 'IP地址查询', false)
        } else {
          that.setData({ isLoading: false })
          wx.showToast({ title: that.data.i18n.queryFailedRetry, icon: 'none' })
        }
      },
      fail: function() {
        that.setData({ isLoading: false })
        wx.showToast({ title: this.data.i18n.networkError, icon: 'none' })
      }
    })
  },

  queryMyIp: function() {
    var that = this
    this.setData({ myIpLoading: true })
    wx.request({
      url: 'https://api.ip.sb/geoip/',
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        var info = that._parseGeoipResult(res.data)
        if (info) {
          that.setData({ myIpInfo: info, myIpLoading: false })
        } else {
          that.setData({ myIpLoading: false })
        }
      },
      fail: function() {
        that.setData({ myIpLoading: false })
      }
    })
  },

  refreshMyIp: function() {
    toolActions.vibrate('light')
    this.queryMyIp()
  },

  toggleMyIpDetail: function() {
    this.setData({ showMyIpDetail: !this.data.showMyIpDetail })
  },

  useMyIp: function() {
    if (!this.data.myIpInfo) return
    toolActions.vibrate('light')
    this.setData({ ipAddress: this.data.myIpInfo.ip })
    this.queryIp()
  },

  _validateIp: function(ip) {
    var ipv4Reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    if (ipv4Reg.test(ip)) return true
    var ipv6Reg = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
    if (ipv6Reg.test(ip)) return true
    return false
  },

  _saveHistory: function(result) {
    var list = this.data.historyList.slice()
    for (var i = 0; i < list.length; i++) {
      if (list[i].ip === result.ip) {
        list.splice(i, 1)
        break
      }
    }
    list.unshift({
      ip: result.ip,
      location: (result.province || '') + (result.city || ''),
      isp: result.isp || '',
      time: this._formatTime(new Date()),
      country: result.country || '',
      asn: result.asn || ''
    })
    if (list.length > 50) {
      list = list.slice(0, 50)
    }
    this.setData({ historyList: list })
    storageUtil.set('ipLookupHistory', list)
  },

  _loadHistory: function() {
    var list = storageUtil.safeGetArray('ipLookupHistory')
    this.setData({ historyList: list })
  },

  _loadFavorites: function() {
    var favs = storageUtil.safeGetArray('ipFavorites')
    this.setData({ ipFavorites: favs })
  },

  _saveFavorites: function() {
    storageUtil.set('ipFavorites', this.data.ipFavorites)
  },

  onHistoryTap: function(e) {
    var ip = e.currentTarget.dataset.ip
    toolActions.vibrate('light')
    this.setData({ ipAddress: ip })
    this.queryIp()
  },

  onDeleteHistory: function(e) {
    var ip = e.currentTarget.dataset.ip
    var list = this.data.historyList.slice()
    for (var i = 0; i < list.length; i++) {
      if (list[i].ip === ip) {
        list.splice(i, 1)
        break
      }
    }
    this.setData({ historyList: list })
    storageUtil.set('ipLookupHistory', list)
    wx.showToast({ title: this.data.i18n.deleted, icon: 'success' })
  },

  onClearHistory: function() {
    toolActions.vibrate('light')
    var that = this
    wx.showModal({
      title: this.data.i18n.confirmClearTitle,
      content: this.data.i18n.confirmClearAllHistory,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          that.setData({ historyList: [] })
          storageUtil.set('ipLookupHistory', [])
          wx.showToast({ title: this.data.i18n.cleared, icon: 'success' })
        }
      }
    })
  },

  toggleHistorySearch: function() {
    this.setData({
      showHistorySearch: !this.data.showHistorySearch,
      historySearch: ''
    })
  },

  onHistorySearchInput: function(e) {
    this.setData({ historySearch: e.detail.value.trim() })
  },

  toggleFavorite: function(e) {
    var ip = e.currentTarget.dataset.ip
    var favs = this.data.ipFavorites.slice()
    var found = false
    for (var i = 0; i < favs.length; i++) {
      if (favs[i] === ip) {
        favs.splice(i, 1)
        found = true
        break
      }
    }
    if (!found) {
      favs.push(ip)
    }
    this.setData({ ipFavorites: favs })
    this._saveFavorites()
    wx.showToast({ title: found ? this.data.i18n.unfavorited : this.data.i18n.favorited, icon: 'success' })
  },

  exportHistory: function() {
    var list = this.data.historyList
    if (list.length === 0) {
      wx.showToast({ title: this.data.i18n.noHistory, icon: 'none' })
      return
    }
    var text = 'IP查询历史导出\n'
    text += '导出时间: ' + this._formatTime(new Date()) + '\n'
    text += '━━━━━━━━━━━━━━━━━━━━\n'
    for (var i = 0; i < list.length; i++) {
      var item = list[i]
      text += item.ip + ' | ' + item.location + ' | ' + item.isp + ' | ' + item.time + '\n'
    }
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: this.data.i18n.copiedToClipboard, icon: 'success' })
      }
    })
  },

  toggleBatchMode: function() {
    toolActions.vibrate('light')
    this.setData({
      batchMode: !this.data.batchMode,
      batchInput: '',
      batchResults: [],
      showBatchResult: false
    })
  },

  onBatchInput: function(e) {
    this.setData({ batchInput: e.detail.value })
  },

  queryBatch: function() {
    var input = this.data.batchInput.trim()
    if (!input) {
      wx.showToast({ title: this.data.i18n.pleaseInputIpOrCidr, icon: 'none' })
      return
    }

    var ipList = []

    if (input.indexOf('/') > -1) {
      ipList = this._parseCidr(input)
    } else {
      var lines = input.split(/[\n,;]+/)
      for (var i = 0; i < lines.length; i++) {
        var ip = lines[i].trim()
        if (ip && this._validateIp(ip)) {
          ipList.push(ip)
        }
      }
    }

    if (ipList.length === 0) {
      wx.showToast({ title: this.data.i18n.noValidIp, icon: 'none' })
      return
    }

    if (ipList.length > 20) {
      wx.showToast({ title: this.data.i18n.maxQueryLimit, icon: 'none' })
      ipList = ipList.slice(0, 20)
    }

    this.setData({ batchLoading: true, batchResults: [], showBatchResult: true })
    this._batchQuerySequential(ipList, 0, [])
  },

  _parseCidr: function(cidr) {
    var parts = cidr.split('/')
    if (parts.length !== 2) return []
    var baseIp = parts[0]
    var prefixLen = parseInt(parts[1])
    if (isNaN(prefixLen) || prefixLen < 16 || prefixLen > 32) return []
    if (!this._validateIp(baseIp)) return []

    var octets = baseIp.split('.')
    var ipNum = 0
    for (var i = 0; i < 4; i++) {
      ipNum = ipNum * 256 + parseInt(octets[i])
    }

    var hostBits = 32 - prefixLen
    var networkAddr = (ipNum >> hostBits) << hostBits
    var broadcastAddr = networkAddr + Math.pow(2, hostBits) - 1

    var ipList = []
    var start = networkAddr + 1
    var end = broadcastAddr - 1
    if (hostBits <= 2) {
      start = networkAddr
      end = broadcastAddr
    }

    var maxCount = 20
    var count = 0
    for (var j = start; j <= end && count < maxCount; j++) {
      ipList.push(this._numToIp(j))
      count++
    }

    return ipList
  },

  _numToIp: function(num) {
    return ((num >> 24) & 0xFF) + '.' + ((num >> 16) & 0xFF) + '.' + ((num >> 8) & 0xFF) + '.' + (num & 0xFF)
  },

  _batchQuerySequential: function(ipList, index, results) {
    if (index >= ipList.length) {
      this.setData({ batchLoading: false, batchResults: results })
      return
    }

    var that = this
    var ip = ipList[index]
    wx.request({
      url: 'https://api.ip.sb/geoip/' + ip,
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        var result = that._parseGeoipResult(res.data)
        if (result) {
          results.push(result)
        } else {
          results.push({ ip: ip, country: '', province: '', city: '', isp: '', error: true })
        }
        that.setData({ batchResults: results.slice() })
        that._batchQuerySequential(ipList, index + 1, results)
      },
      fail: function() {
        results.push({ ip: ip, country: '', province: '', city: '', isp: '', error: true })
        that.setData({ batchResults: results.slice() })
        that._batchQuerySequential(ipList, index + 1, results)
      }
    })
  },

  copyBatchResult: function() {
    var results = this.data.batchResults
    if (results.length === 0) return
    var text = 'IP批量查询结果\n'
    text += '查询时间: ' + this._formatTime(new Date()) + '\n'
    text += '━━━━━━━━━━━━━━━━━━━━\n'
    for (var i = 0; i < results.length; i++) {
      var r = results[i]
      if (r.error) {
        text += r.ip + ' | 查询失败\n'
      } else {
        text += r.ip + ' | ' + (r.province || '') + (r.city || '') + ' | ' + (r.isp || '') + '\n'
      }
    }
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({ title: this.data.i18n.copiedToClipboard, icon: 'success' })
      }
    })
  },

  onBatchResultTap: function(e) {
    var ip = e.currentTarget.dataset.ip
    this.setData({ ipAddress: ip, batchMode: false })
    this.queryIp()
  },

  _formatTime: function(date) {
    var y = date.getFullYear()
    var m = date.getMonth() + 1
    var d = date.getDate()
    var h = date.getHours()
    var min = date.getMinutes()
    if (m < 10) m = '0' + m
    if (d < 10) d = '0' + d
    if (h < 10) h = '0' + h
    if (min < 10) min = '0' + min
    return y + '-' + m + '-' + d + ' ' + h + ':' + min
  },

  copyResult: function(e) {
    var val = e.currentTarget.dataset.value
    toolActions.copyText(val, null, this.data.i18n)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        ipAddress: '',
        queryResult: null,
        hasResult: false,
        isLoading: false
      })
    }, that.data.i18n)
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('🌐 IP地址查询 - 百宝工具箱', '/package-dev/ip-lookup/ip-lookup')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('🌐 IP地址查询 - 百宝工具箱')
  }
})
