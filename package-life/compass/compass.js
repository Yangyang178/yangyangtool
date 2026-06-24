var points = require('../../utils/points.js')
var toolActions = require('../utils/tool-actions.js')
var storageUtil = require('../../utils/storage.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

Page({
  data: {
    isLoading: true,
    i18n: {},
    direction: 0,
    directionName: '北',
    directionDetail: '',
    latitude: '--',
    longitude: '--',
    altitude: '--',
    speed: '--',
    accuracy: '--',
    isLevel: true,
    ballX: 0,
    ballY: 0,
    compassRotate: 0,
    compassSupported: true,
    locationAuth: false,
    showTip: true,
    showCalibration: false,
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium',

    directionMarks: [],
    showMarks: false,
    markInputName: '',
    refreshTime: ''
  },

  _compassStarted: false,
  _lastDirections: [],

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('指南针')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('compass') })
    this.startCompass()
    this.startAccelerometer()
    this._loadMarks()
    poster.setupForPage(this, 31)
    var that = this
    setTimeout(function() {
      that.getLocation()
    }, 1500)
    this.setData({ isLoading: false })
  },

  onUnload: function() {
    this.stopCompass()
    this.stopAccelerometer()
  },

  onHide: function() {
    this.stopCompass()
    this.stopAccelerometer()
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('compass') })
    this.startCompass()
    this.startAccelerometer()
    // 每次显示时刷新位置信息
    this.getLocation()
  },

  onPrivacyAgreed: function() {
    this._compassStarted = false
    this.startCompass()
    this.startAccelerometer()
    this.getLocation()
  },

  startCompass: function() {
    var that = this
    if (that._compassStarted) return
    that._compassStarted = true
    that._lastDirections = []
    wx.onCompassChange(function(res) {
      if (!that.data.compassSupported) {
        that.setData({ compassSupported: true })
      }
      var direction = Math.round(res.direction) % 360
      if (direction < 0) {
        direction = direction + 360
      }
      var nameInfo = that.getDirectionName(direction)
      that.setData({
        direction: direction,
        directionName: nameInfo.name,
        directionDetail: nameInfo.detail,
        compassRotate: -direction
      })
      that._lastDirections.push(direction)
      if (that._lastDirections.length > 5) {
        that._lastDirections.shift()
      }
      if (that._lastDirections.length >= 3) {
        var unstable = false
        for (var i = 1; i < that._lastDirections.length; i++) {
          var diff = Math.abs(that._lastDirections[i] - that._lastDirections[i - 1])
          if (diff > 180) diff = 360 - diff
          if (diff > 5) {
            unstable = true
            break
          }
        }
        if (unstable && !that.data.showCalibration) {
          that.setData({ showCalibration: true })
        } else if (!unstable && that.data.showCalibration) {
          that.setData({ showCalibration: false })
        }
      }
    })
    wx.startCompass({
      success: function() {
        that.setData({ compassSupported: true })
      },
      fail: function() {
        that._compassStarted = false
        that.setData({ compassSupported: false })
      }
    })
  },

  stopCompass: function() {
    this._compassStarted = false
    this._lastDirections = []
    wx.stopCompass()
    wx.offCompassChange()
  },

  startAccelerometer: function() {
    var that = this
    wx.onAccelerometerChange(function(res) {
      var x = res.x
      var y = res.y
      var tiltX = x * 10
      var tiltY = y * 10
      var isLevel = Math.abs(x) < 0.15 && Math.abs(y) < 0.15
      that.setData({
        ballX: tiltX,
        ballY: tiltY,
        isLevel: isLevel
      })
    })
    wx.startAccelerometer({ interval: 'ui' })
  },

  stopAccelerometer: function() {
    wx.stopAccelerometer()
    wx.offAccelerometerChange()
  },

  getLocation: function() {
    var that = this
    // 先检查位置权限设置
    wx.getSetting({
      success: function(settingRes) {
        var locationAuthorized = settingRes.authSetting['scope.userLocation']
        if (locationAuthorized === false) {
          // 用户明确拒绝了位置权限
          that.setData({ locationAuth: false })
          wx.showModal({
            title: that.data.i18n.locationAuthDisabled,
            content: that.data.i18n.locationAuthDisabledMsg,
            confirmText: that.data.i18n.goSettings,
            success: function(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting()
              }
            }
          })
          return
        }
        // 权限已授权或未决定，调用getLocation
        that._doGetLocation()
      },
      fail: function() {
        // getSetting失败，直接尝试getLocation
        that._doGetLocation()
      }
    })
  },

  _doGetLocation: function() {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 3000,
      success: function(res) {
        var updateData = {
          latitude: res.latitude.toFixed(6),
          longitude: res.longitude.toFixed(6),
          locationAuth: true,
          refreshTime: that._formatTime(new Date())
        }
        if (res.altitude !== undefined && res.altitude !== null && res.altitude > 0) {
          updateData.altitude = res.altitude.toFixed(1)
        }
        if (res.speed !== undefined && res.speed !== null && res.speed > 0.1) {
          var speedKmh = res.speed * 3.6
          updateData.speed = speedKmh.toFixed(1)
        }
        if (res.accuracy !== undefined && res.accuracy !== null) {
          updateData.accuracy = res.accuracy.toFixed(0)
        }
        that.setData(updateData)
      },
      fail: function(err) {
        that.setData({ locationAuth: false })
        var msg = (err && err.errMsg) || ''
        var errno = (err && err.errno) || 0
        // 隐私协议未声明(errno 112)或隐私授权未通过
        if (errno === 112 || msg.indexOf('privacy') > -1 || msg.indexOf('not declared') > -1) {
          wx.showModal({
            title: that.data.i18n.locationUnavailable,
            content: that.data.i18n.locationUnavailableMsg,
            showCancel: false
          })
          return
        }
        // 授权拒绝
        if (msg.indexOf('auth deny') > -1 || msg.indexOf('authorize') > -1 || msg.indexOf('permission') > -1 || msg.indexOf('deny') > -1) {
          wx.showModal({
            title: that.data.i18n.locationAuthDisabled,
            content: that.data.i18n.locationAuthDisabledMsg,
            confirmText: that.data.i18n.goSettings,
            success: function(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  refreshLocation: function() {
    toolActions.vibrate('light')
    this.getLocation()
  },

  requestLocation: function() {
    toolActions.vibrate('light')
    this.getLocation()
  },

  getDirectionName: function(degree) {
    var directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
    var index = Math.round(degree / 45) % 8
    var mainDir = directions[index]
    var baseDegree = index * 45
    var offset = degree - baseDegree
    if (offset > 180) offset = offset - 360
    if (offset < -180) offset = offset + 360

    if (Math.abs(offset) < 2) {
      return { name: mainDir, detail: mainDir }
    }

    var nextIndex = (index + 1) % 8
    var prevIndex = (index - 1 + 8) % 8

    if (offset > 0) {
      return { name: mainDir, detail: mainDir + '偏' + directions[nextIndex].charAt(0) + ' ' + Math.abs(offset) + '\u00B0' }
    } else {
      return { name: mainDir, detail: mainDir + '偏' + directions[prevIndex].charAt(0) + ' ' + Math.abs(offset) + '\u00B0' }
    }
  },

  addDirectionMark: function() {
    var marks = this.data.directionMarks.slice()
    var dir = this.data.direction
    var nameInfo = this.getDirectionName(dir)
    var label = this.data.markInputName.trim()
    if (!label) {
      label = nameInfo.name + ' ' + dir + '\u00B0'
    }
    marks.push({
      id: Date.now(),
      direction: dir,
      label: label,
      time: this._formatTime(new Date()),
      lat: this.data.latitude,
      lng: this.data.longitude
    })
    if (marks.length > 20) {
      marks = marks.slice(0, 20)
    }
    this.setData({
      directionMarks: marks,
      markInputName: '',
      showMarks: true
    })
    this._saveMarks(marks)
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: this.data.i18n.directionMarked, icon: 'success' })
  },

  onMarkNameInput: function(e) {
    this.setData({ markInputName: e.detail.value })
  },

  removeMark: function(e) {
    var id = e.currentTarget.dataset.id
    var marks = this.data.directionMarks.slice()
    var newMarks = []
    for (var i = 0; i < marks.length; i++) {
      if (marks[i].id !== id) {
        newMarks.push(marks[i])
      }
    }
    this.setData({ directionMarks: newMarks })
    this._saveMarks(newMarks)
    wx.showToast({ title: this.data.i18n.deleted, icon: 'success' })
  },

  clearMarks: function() {
    var that = this
    wx.showModal({
      title: that.data.i18n.confirmClear,
      content: that.data.i18n.confirmClearMarks,
      confirmColor: '#EF4444',
      success: function(res) {
        if (res.confirm) {
          that.setData({ directionMarks: [], showMarks: false })
          that._saveMarks([])
          wx.showToast({ title: that.data.i18n.cleared, icon: 'success' })
        }
      }
    })
  },

  toggleMarks: function() {
    this.setData({ showMarks: !this.data.showMarks })
  },

  _saveMarks: function(marks) {
    storageUtil.set('compassDirectionMarks', marks)
  },

  _loadMarks: function() {
    var marks = storageUtil.safeGetArray('compassDirectionMarks')
    this.setData({ directionMarks: marks })
  },

  copyLocation: function() {
    var d = this.data
    var text = d.latitude + ', ' + d.longitude
    if (d.altitude !== '--') {
      text += ' 海拔:' + d.altitude + 'm'
    }
    toolActions.copyText(text, '坐标已复制')
  },

  copyResult: function() {
    var d = this.data
    var text = d.direction + '\u00B0 ' + d.directionName
    if (d.latitude !== '--' && d.longitude !== '--') {
      text += ' (' + d.latitude + ', ' + d.longitude + ')'
    }
    toolActions.copyText(text, '方向已复制')
  },

  dismissTip: function() {
    toolActions.vibrate('light')
    this.setData({ showTip: false })
  },

  _formatTime: function(d) {
    var h = d.getHours()
    var m = d.getMinutes()
    var s = d.getSeconds()
    if (h < 10) h = '0' + h
    if (m < 10) m = '0' + m
    if (s < 10) s = '0' + s
    return h + ':' + m + ':' + s
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('指南针 - 百宝工具箱', '/package-life/compass/compass', '手机指南针方向定位，经纬度显示')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('指南针 - 方向定位经纬度显示')
  }
})
