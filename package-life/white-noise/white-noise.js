var storageUtil = require('../../utils/storage.js')
var points = require('../../utils/points.js')
var logger = require('../../utils/logger.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var SAMPLE_RATE = 11025
var DURATION = 2
var NUM_SAMPLES = SAMPLE_RATE * DURATION

function linearToGain(value) {
  var v = value / 100
  if (v <= 0) return 0
  return Math.pow(v, 1.6)
}

function generateWhiteNoise(numSamples) {
  var samples = new Float32Array(numSamples)
  for (var i = 0; i < numSamples; i++) {
    samples[i] = Math.random() * 2 - 1
  }
  return samples
}

function generatePinkNoise(numSamples) {
  var samples = new Float32Array(numSamples)
  var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (var i = 0; i < numSamples; i++) {
    var white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    b6 = white * 0.115926
    samples[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.35
  }
  return samples
}

function generateBrownNoise(numSamples) {
  var samples = new Float32Array(numSamples)
  var lastOut = 0
  for (var i = 0; i < numSamples; i++) {
    var white = Math.random() * 2 - 1
    lastOut = (lastOut + 0.02 * white) / 1.02
    samples[i] = lastOut * 3.5
  }
  return samples
}

function applyCrossfade(samples) {
  var fadeLen = Math.min(220, Math.floor(samples.length * 0.01))
  for (var i = 0; i < fadeLen; i++) {
    var t = i / fadeLen
    samples[i] *= t
    samples[samples.length - 1 - i] *= t
  }
  return samples
}

function generateRainSamples() {
  return applyCrossfade(generatePinkNoise(NUM_SAMPLES))
}

function generateOceanSamples() {
  var samples = generateBrownNoise(NUM_SAMPLES)
  for (var i = 0; i < NUM_SAMPLES; i++) {
    var t = i / SAMPLE_RATE
    samples[i] *= 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(2 * Math.PI * t / 3))
  }
  return applyCrossfade(samples)
}

function generateFireSamples() {
  var samples = generateBrownNoise(NUM_SAMPLES)
  for (var i = 0; i < NUM_SAMPLES; i++) {
    if (Math.random() < 0.003) {
      var burstLen = Math.floor(Math.random() * 200) + 50
      for (var j = 0; j < burstLen && (i + j) < NUM_SAMPLES; j++) {
        var env = 1 - j / burstLen
        samples[i + j] += (Math.random() * 2 - 1) * env * 0.3
      }
    }
  }
  return applyCrossfade(samples)
}

function generateForestSamples() {
  var samples = generatePinkNoise(NUM_SAMPLES)
  for (var i = 0; i < NUM_SAMPLES; i++) {
    var t = i / SAMPLE_RATE
    samples[i] *= 0.7 + 0.3 * Math.sin(2 * Math.PI * t * 0.5)
  }
  return applyCrossfade(samples)
}

function generateWindSamples() {
  var samples = generateBrownNoise(NUM_SAMPLES)
  for (var i = 0; i < NUM_SAMPLES; i++) {
    var t = i / SAMPLE_RATE
    samples[i] *= 0.6 + 0.4 * Math.sin(2 * Math.PI * t * 0.15)
  }
  return applyCrossfade(samples)
}

function generateThunderSamples() {
  var samples = new Float32Array(NUM_SAMPLES)
  var lastOut = 0
  for (var i = 0; i < NUM_SAMPLES; i++) {
    var white = Math.random() * 2 - 1
    lastOut = (lastOut + 0.01 * white) / 1.01
    samples[i] = lastOut * 6
    if (Math.random() < 0.0008) {
      var burstLen = Math.floor(Math.random() * 4000) + 2000
      for (var j = 0; j < burstLen && (i + j) < NUM_SAMPLES; j++) {
        var env = Math.exp(-j / 1500)
        samples[i + j] += (Math.random() * 2 - 1) * env * 0.5
      }
    }
  }
  return applyCrossfade(samples)
}

function generateStreamSamples() {
  var pink = generatePinkNoise(NUM_SAMPLES)
  var white = generateWhiteNoise(NUM_SAMPLES)
  var samples = new Float32Array(NUM_SAMPLES)
  for (var i = 0; i < NUM_SAMPLES; i++) {
    samples[i] = pink[i] * 0.6 + white[i] * 0.25
  }
  return applyCrossfade(samples)
}

function generateCafeSamples() {
  var pink = generatePinkNoise(NUM_SAMPLES)
  var brown = generateBrownNoise(NUM_SAMPLES)
  var samples = new Float32Array(NUM_SAMPLES)
  for (var i = 0; i < NUM_SAMPLES; i++) {
    samples[i] = pink[i] * 0.5 + brown[i] * 0.4
  }
  return applyCrossfade(samples)
}

var SOUND_GENERATORS = {
  rain: generateRainSamples,
  ocean: generateOceanSamples,
  fire: generateFireSamples,
  forest: generateForestSamples,
  wind: generateWindSamples,
  thunder: generateThunderSamples,
  stream: generateStreamSamples,
  cafe: generateCafeSamples
}

var SOUND_LIST = [
  { id: 'rain', name: '雨声', icon: '🌧️', color: '#3B82F6', bgColor: '#EFF6FF', activeBg: '#DBEAFE', volume: 50, active: false },
  { id: 'ocean', name: '海浪', icon: '🌊', color: '#06B6D4', bgColor: '#ECFEFF', activeBg: '#CFFAFE', volume: 50, active: false },
  { id: 'fire', name: '篝火', icon: '🔥', color: '#F97316', bgColor: '#FFF7ED', activeBg: '#FFEDD5', volume: 50, active: false },
  { id: 'forest', name: '森林', icon: '🌲', color: '#22C55E', bgColor: '#F0FDF4', activeBg: '#DCFCE7', volume: 50, active: false },
  { id: 'wind', name: '风声', icon: '💨', color: '#8B5CF6', bgColor: '#F5F3FF', activeBg: '#EDE9FE', volume: 50, active: false },
  { id: 'thunder', name: '雷声', icon: '⛈️', color: '#6366F1', bgColor: '#EEF2FF', activeBg: '#E0E7FF', volume: 50, active: false },
  { id: 'stream', name: '溪流', icon: '💧', color: '#14B8A6', bgColor: '#F0FDFA', activeBg: '#CCFBF1', volume: 50, active: false },
  { id: 'cafe', name: '咖啡馆', icon: '☕', color: '#A16207', bgColor: '#FEFCE8', activeBg: '#FEF9C3', volume: 50, active: false }
]

var TIMER_OPTIONS = [
  { label: '关闭', minutes: 0 },
  { label: '15分', minutes: 15 },
  { label: '30分', minutes: 30 },
  { label: '60分', minutes: 60 },
  { label: '90分', minutes: 90 },
  { label: '120分', minutes: 120 }
]

var SCENE_PRESETS = [
  {
    id: 'focus',
    name: '专注工作',
    icon: '🎯',
    desc: '屏蔽干扰，提升专注力',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    sounds: [
      { id: 'cafe', volume: 40 },
      { id: 'rain', volume: 30 }
    ],
    timer: 60
  },
  {
    id: 'sleep',
    name: '深度睡眠',
    icon: '🌙',
    desc: '舒缓自然音，助你入眠',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    sounds: [
      { id: 'rain', volume: 50 },
      { id: 'thunder', volume: 20 },
      { id: 'wind', volume: 15 }
    ],
    timer: 60
  },
  {
    id: 'meditate',
    name: '冥想放松',
    icon: '🧘',
    desc: '平静内心，深度放松',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    sounds: [
      { id: 'ocean', volume: 40 },
      { id: 'stream', volume: 25 }
    ],
    timer: 30
  },
  {
    id: 'nature',
    name: '自然漫步',
    icon: '🌿',
    desc: '身临其境，感受自然',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    sounds: [
      { id: 'forest', volume: 50 },
      { id: 'stream', volume: 35 },
      { id: 'wind', volume: 20 }
    ],
    timer: 0
  },
  {
    id: 'cozy',
    name: '温馨壁炉',
    icon: '🏠',
    desc: '炉火噼啪，温暖惬意',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    sounds: [
      { id: 'fire', volume: 55 },
      { id: 'wind', volume: 15 }
    ],
    timer: 0
  }
]

var FADE_DURATION = 30

Page({
  data: {
    isLoading: true,
    sounds: SOUND_LIST,
    timerOptions: TIMER_OPTIONS,
    activeCount: 0,
    globalVolume: 80,
    selectedTimerIndex: 0,
    timerCountdown: 0,
    timerDisplay: '',
    isTimerRunning: false,
    isFadingOut: false,

    scenePresets: SCENE_PRESETS,
    activeScene: '',

    favorites: [],
    showFavorites: false,
    favInputName: '',
    showFavInput: false,

    i18n: {},
    isDarkMode: false,
    fontClass: '',
    fontSizeSetting: 'medium'
  },

  webAudioCtx: null,
  audioBuffers: {},
  sourceNodes: {},
  gainNodes: {},
  timerInterval: null,
  fadeInterval: null,

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('白噪音')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark, i18n: i18n.getToolPageTexts('whiteNoise') })
    this._updateI18nData()
    this.loadPlayState()
    this._loadFavorites()
    this.initAudio()
    poster.setupForPage(this, 30)
    this.setData({ isLoading: false })
  },

  onUnload: function() {
    this.stopAllSounds()
    this.clearTimerInterval()
    this.clearFadeInterval()
    this.savePlayState()
    if (this.webAudioCtx) {
      try { this.webAudioCtx.close() } catch(e) {}
      this.webAudioCtx = null
    }
  },

  onHide: function() {
    this.savePlayState()
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    var fontClass = points.getFontClass()
    this.setData({ isDarkMode: isDark, fontClass: fontClass })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize, i18n: i18n.getToolPageTexts('whiteNoise') })
    this._updateI18nData()
    if (this.webAudioCtx && this.webAudioCtx.state === 'suspended') {
      var that = this
      this.webAudioCtx.resume().then(function() {
        that.restoreSounds()
      }).catch(function() {})
    } else {
      this.restoreSounds()
    }
  },

  initAudio: function() {
    try {
      this.webAudioCtx = wx.createWebAudioContext()
    } catch(e) {
      logger.warn('Web Audio API not available:', e)
      return
    }
    this.buildAllBuffers()
  },

  buildAllBuffers: function() {
    var ctx = this.webAudioCtx
    if (!ctx) return
    var sounds = this.data.sounds
    for (var i = 0; i < sounds.length; i++) {
      var id = sounds[i].id
      var gen = SOUND_GENERATORS[id]
      if (gen && !this.audioBuffers[id]) {
        var samples = gen()
        var buffer = ctx.createBuffer(1, samples.length, SAMPLE_RATE)
        var channelData = buffer.getChannelData(0)
        for (var j = 0; j < samples.length; j++) {
          channelData[j] = samples[j]
        }
        this.audioBuffers[id] = buffer
      }
    }
  },

  startSound: function(id, volume) {
    if (!this.webAudioCtx || !this.audioBuffers[id]) return
    this.stopSound(id)
    var ctx = this.webAudioCtx
    var source = ctx.createBufferSource()
    source.buffer = this.audioBuffers[id]
    source.loop = true
    var gainNode = ctx.createGain()
    gainNode.gain.value = linearToGain(volume) * linearToGain(this.data.globalVolume)
    source.connect(gainNode)
    gainNode.connect(ctx.destination)
    source.start(0)
    this.sourceNodes[id] = source
    this.gainNodes[id] = gainNode
  },

  stopSound: function(id) {
    var source = this.sourceNodes[id]
    if (source) {
      try { source.stop() } catch(e) {}
      try { source.disconnect() } catch(e) {}
      this.sourceNodes[id] = null
    }
    var gain = this.gainNodes[id]
    if (gain) {
      try { gain.disconnect() } catch(e) {}
      this.gainNodes[id] = null
    }
  },

  restoreSounds: function() {
    var sounds = this.data.sounds
    for (var i = 0; i < sounds.length; i++) {
      var id = sounds[i].id
      var isActive = sounds[i].active
      var volume = sounds[i].volume || 50
      if (isActive) {
        this.startSound(id, volume)
      }
    }
  },

  toggleSound: function(e) {
    var id = e.currentTarget.dataset.id
    var sounds = this.data.sounds
    var targetIndex = -1
    for (var i = 0; i < sounds.length; i++) {
      if (sounds[i].id === id) { targetIndex = i; break }
    }
    if (targetIndex === -1) return
    var newActive = !sounds[targetIndex].active
    var updateKey = 'sounds[' + targetIndex + '].active'
    var updateData = {}
    updateData[updateKey] = newActive
    this.setData(updateData)
    if (newActive) {
      var volume = sounds[targetIndex].volume || 50
      this.startSound(id, volume)
      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(30, '白噪音', false)
    } else {
      this.stopSound(id)
    }
    this.updateActiveCount()
    this.setData({ activeScene: '' })
    wx.vibrateShort({ type: 'light' })
    this.savePlayState()
  },

  onSoundVolumeChange: function(e) {
    var id = e.currentTarget.dataset.id
    var volume = parseInt(e.detail.value)
    var sounds = this.data.sounds
    var targetIndex = -1
    for (var i = 0; i < sounds.length; i++) {
      if (sounds[i].id === id) { targetIndex = i; break }
    }
    if (targetIndex === -1) return
    var updateKey = 'sounds[' + targetIndex + '].volume'
    var updateData = {}
    updateData[updateKey] = volume
    this.setData(updateData)
    var gainNode = this.gainNodes[id]
    if (gainNode && sounds[targetIndex].active) {
      gainNode.gain.value = linearToGain(volume) * linearToGain(this.data.globalVolume)
    }
    this.savePlayState()
  },

  onGlobalVolumeChange: function(e) {
    var volume = parseInt(e.detail.value)
    this.setData({ globalVolume: volume })
    var sounds = this.data.sounds
    for (var i = 0; i < sounds.length; i++) {
      var id = sounds[i].id
      var gainNode = this.gainNodes[id]
      if (gainNode && sounds[i].active) {
        var soundVolume = sounds[i].volume || 50
        gainNode.gain.value = linearToGain(soundVolume) * linearToGain(volume)
      }
    }
    this.savePlayState()
  },

  applyScene: function(e) {
    var sceneId = e.currentTarget.dataset.id
    var scene = null
    var scenePresets = this.data.scenePresets
    for (var si = 0; si < scenePresets.length; si++) {
      if (scenePresets[si].id === sceneId) { scene = scenePresets[si]; break }
    }
    if (!scene) return
    wx.vibrateShort({ type: 'medium' })

    this.stopAllSounds()
    this.clearTimerInterval()
    this.clearFadeInterval()

    var sounds = this.data.sounds
    var updateData = {}
    for (var i = 0; i < sounds.length; i++) {
      updateData['sounds[' + i + '].active'] = false
      updateData['sounds[' + i + '].volume'] = 50
    }

    for (var j = 0; j < scene.sounds.length; j++) {
      var preset = scene.sounds[j]
      for (var k = 0; k < sounds.length; k++) {
        if (sounds[k].id === preset.id) {
          updateData['sounds[' + k + '].active'] = true
          updateData['sounds[' + k + '].volume'] = preset.volume
          this.startSound(preset.id, preset.volume)
          break
        }
      }
    }

    var timerIdx = 0
    if (scene.timer > 0) {
      for (var ti = 0; ti < TIMER_OPTIONS.length; ti++) {
        if (TIMER_OPTIONS[ti].minutes === scene.timer) { timerIdx = ti; break }
      }
    }

    updateData.activeScene = sceneId
    this.setData(updateData)
    this.updateActiveCount()

    if (timerIdx > 0) {
      this.setData({ selectedTimerIndex: timerIdx })
      var minutes = TIMER_OPTIONS[timerIdx].minutes
      var totalSeconds = minutes * 60
      this.setData({
        isTimerRunning: true,
        timerCountdown: totalSeconds,
        timerDisplay: this.formatCountdown(totalSeconds)
      })
      this.startCountdown()
    } else {
      this.setData({
        selectedTimerIndex: 0,
        isTimerRunning: false,
        timerCountdown: 0,
        timerDisplay: ''
      })
    }

    this.savePlayState()
    wx.showToast({ title: this.data.i18n.sceneSwitched + scene.name, icon: 'success' })
  },

  selectTimer: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    this.setData({ selectedTimerIndex: index })
    this.clearTimerInterval()
    this.clearFadeInterval()
    if (index === 0) {
      this.setData({ isTimerRunning: false, timerCountdown: 0, timerDisplay: '', isFadingOut: false })
    } else {
      var minutes = TIMER_OPTIONS[index].minutes
      var totalSeconds = minutes * 60
      this.setData({
        isTimerRunning: true,
        timerCountdown: totalSeconds,
        timerDisplay: this.formatCountdown(totalSeconds),
        isFadingOut: false
      })
      this.startCountdown()
    }
    wx.vibrateShort({ type: 'light' })
    this.savePlayState()
  },

  startCountdown: function() {
    var that = this
    this.clearTimerInterval()
    this.timerInterval = setInterval(function() {
      var countdown = that.data.timerCountdown - 1
      if (countdown <= FADE_DURATION && countdown > 0 && !that.data.isFadingOut) {
        that.setData({ isFadingOut: true })
        that.startFadeOut()
      }
      if (countdown <= 0) {
        that.clearTimerInterval()
        that.clearFadeInterval()
        that.stopAllSounds()
        that.setData({
          isTimerRunning: false,
          timerCountdown: 0,
          timerDisplay: '',
          selectedTimerIndex: 0,
          isFadingOut: false
        })
        wx.vibrateLong()
        wx.showToast({ title: that.data.i18n.timerEnded, icon: 'none', duration: 2000 })
        that.savePlayState()
        return
      }
      that.setData({
        timerCountdown: countdown,
        timerDisplay: that.formatCountdown(countdown)
      })
    }, 1000)
  },

  startFadeOut: function() {
    var that = this
    var steps = FADE_DURATION
    var currentStep = 0
    var originalGlobalVolume = that.data.globalVolume
    this.clearFadeInterval()
    this.fadeInterval = setInterval(function() {
      currentStep++
      var progress = currentStep / steps
      var newVolume = Math.round(originalGlobalVolume * (1 - progress))
      if (newVolume < 0) newVolume = 0
      that.setData({ globalVolume: newVolume })
      var sounds = that.data.sounds
      for (var i = 0; i < sounds.length; i++) {
        var id = sounds[i].id
        var gainNode = that.gainNodes[id]
        if (gainNode && sounds[i].active) {
          var soundVolume = sounds[i].volume || 50
          gainNode.gain.value = linearToGain(soundVolume) * linearToGain(newVolume)
        }
      }
      if (currentStep >= steps) {
        that.clearFadeInterval()
      }
    }, 1000)
  },

  formatCountdown: function(seconds) {
    var mins = Math.floor(seconds / 60)
    var secs = seconds % 60
    var minsStr = mins < 10 ? '0' + mins : '' + mins
    var secsStr = secs < 10 ? '0' + secs : '' + secs
    return minsStr + ':' + secsStr
  },

  clearTimerInterval: function() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  clearFadeInterval: function() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }
  },

  stopAllSounds: function() {
    var sounds = this.data.sounds
    var updateData = {}
    for (var i = 0; i < sounds.length; i++) {
      var id = sounds[i].id
      this.stopSound(id)
      updateData['sounds[' + i + '].active'] = false
    }
    this.setData(updateData)
    this.updateActiveCount()
  },

  stopAll: function() {
    this.stopAllSounds()
    this.clearTimerInterval()
    this.clearFadeInterval()
    this.setData({
      isTimerRunning: false,
      timerCountdown: 0,
      timerDisplay: '',
      selectedTimerIndex: 0,
      isFadingOut: false,
      activeScene: ''
    })
    wx.vibrateShort({ type: 'medium' })
    this.savePlayState()
  },

  updateActiveCount: function() {
    var sounds = this.data.sounds
    var count = 0
    for (var i = 0; i < sounds.length; i++) {
      if (sounds[i].active) count++
    }
    this.setData({ activeCount: count })
  },

  saveFavorite: function() {
    var name = this.data.favInputName.trim()
    if (!name) {
      wx.showToast({ title: this.data.i18n.inputComboNameToast, icon: 'none' })
      return
    }
    var sounds = this.data.sounds
    var activeSounds = []
    for (var i = 0; i < sounds.length; i++) {
      if (sounds[i].active) {
        activeSounds.push({ id: sounds[i].id, volume: sounds[i].volume || 50 })
      }
    }
    if (activeSounds.length === 0) {
      wx.showToast({ title: this.data.i18n.selectSoundFirst, icon: 'none' })
      return
    }
    var favs = this.data.favorites.slice()
    favs.unshift({
      id: Date.now(),
      name: name,
      sounds: activeSounds,
      timer: this.data.selectedTimerIndex > 0 ? TIMER_OPTIONS[this.data.selectedTimerIndex].minutes : 0,
      time: this._formatTime(new Date())
    })
    if (favs.length > 10) favs = favs.slice(0, 10)
    this.setData({ favorites: favs, showFavInput: false, favInputName: '' })
    this._saveFavorites(favs)
    wx.vibrateShort({ type: 'medium' })
    wx.showToast({ title: this.data.i18n.favorited, icon: 'success' })
  },

  applyFavorite: function(e) {
    var favId = e.currentTarget.dataset.id
    var fav = null
    var favs = this.data.favorites
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].id === favId) { fav = favs[i]; break }
    }
    if (!fav) return
    wx.vibrateShort({ type: 'medium' })
    this.stopAllSounds()
    this.clearTimerInterval()
    this.clearFadeInterval()
    var sounds = this.data.sounds
    var updateData = { activeScene: '' }
    for (var j = 0; j < sounds.length; j++) {
      updateData['sounds[' + j + '].active'] = false
      updateData['sounds[' + j + '].volume'] = 50
    }
    for (var k = 0; k < fav.sounds.length; k++) {
      var preset = fav.sounds[k]
      for (var m = 0; m < sounds.length; m++) {
        if (sounds[m].id === preset.id) {
          updateData['sounds[' + m + '].active'] = true
          updateData['sounds[' + m + '].volume'] = preset.volume
          this.startSound(preset.id, preset.volume)
          break
        }
      }
    }
    this.setData(updateData)
    this.updateActiveCount()
    if (fav.timer > 0) {
      var timerIdx = 0
      for (var ti = 0; ti < TIMER_OPTIONS.length; ti++) {
        if (TIMER_OPTIONS[ti].minutes === fav.timer) { timerIdx = ti; break }
      }
      if (timerIdx > 0) {
        this.setData({ selectedTimerIndex: timerIdx })
        var totalSeconds = fav.timer * 60
        this.setData({ isTimerRunning: true, timerCountdown: totalSeconds, timerDisplay: this.formatCountdown(totalSeconds) })
        this.startCountdown()
      }
    }
    this.savePlayState()
    wx.showToast({ title: this.data.i18n.applied + fav.name, icon: 'success' })
  },

  removeFavorite: function(e) {
    var favId = e.currentTarget.dataset.id
    var favs = this.data.favorites.slice()
    var newFavs = []
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].id !== favId) newFavs.push(favs[i])
    }
    this.setData({ favorites: newFavs })
    this._saveFavorites(newFavs)
    wx.showToast({ title: this.data.i18n.deleted, icon: 'success' })
  },

  toggleFavInput: function() {
    this.setData({ showFavInput: !this.data.showFavInput, favInputName: '' })
  },

  onFavNameInput: function(e) {
    this.setData({ favInputName: e.detail.value })
  },

  toggleFavorites: function() {
    this.setData({ showFavorites: !this.data.showFavorites })
  },

  _updateI18nData: function() {
    var texts = this.data.i18n
    var sounds = this.data.sounds
    var soundNames = {
      rain: texts.soundRain, ocean: texts.soundOcean, fire: texts.soundFire, forest: texts.soundForest,
      wind: texts.soundWind, thunder: texts.soundThunder, stream: texts.soundStream, cafe: texts.soundCafe
    }
    var updateData = {}
    for (var i = 0; i < sounds.length; i++) {
      if (soundNames[sounds[i].id]) {
        updateData['sounds[' + i + '].name'] = soundNames[sounds[i].id]
      }
    }
    var timerLabels = [texts.timerClose, texts.timer15m, texts.timer30m, texts.timer60m, texts.timer90m, texts.timer120m]
    var timerOptions = this.data.timerOptions
    for (var j = 0; j < timerOptions.length && j < timerLabels.length; j++) {
      updateData['timerOptions[' + j + '].label'] = timerLabels[j]
    }
    var sceneMap = {
      focus: { name: texts.sceneFocusName, desc: texts.sceneFocusDesc },
      sleep: { name: texts.sceneSleepName, desc: texts.sceneSleepDesc },
      meditate: { name: texts.sceneMeditateName, desc: texts.sceneMeditateDesc },
      nature: { name: texts.sceneNatureName, desc: texts.sceneNatureDesc },
      cozy: { name: texts.sceneCozyName, desc: texts.sceneCozyDesc }
    }
    var scenes = this.data.scenePresets
    for (var k = 0; k < scenes.length; k++) {
      var sceneData = sceneMap[scenes[k].id]
      if (sceneData) {
        updateData['scenePresets[' + k + '].name'] = sceneData.name
        updateData['scenePresets[' + k + '].desc'] = sceneData.desc
      }
    }
    this.setData(updateData)
  },

  _saveFavorites: function(favs) {
    storageUtil.set('whiteNoiseFavorites', favs)
  },

  _loadFavorites: function() {
    var favs = storageUtil.safeGetArray('whiteNoiseFavorites')
    this.setData({ favorites: favs })
  },

  _formatTime: function(d) {
    var h = d.getHours()
    var m = d.getMinutes()
    if (h < 10) h = '0' + h
    if (m < 10) m = '0' + m
    return h + ':' + m
  },

  savePlayState: function() {
    try {
      var state = {
        sounds: [],
        globalVolume: this.data.globalVolume,
        selectedTimerIndex: this.data.selectedTimerIndex
      }
      var sounds = this.data.sounds
      for (var i = 0; i < sounds.length; i++) {
        state.sounds.push({
          id: sounds[i].id,
          active: sounds[i].active,
          volume: sounds[i].volume || 50
        })
      }
      storageUtil.safeSet('white_noise_state', state)
    } catch (e) {
      logger.warn('Save state error:', e)
    }
  },

  loadPlayState: function() {
    try {
      var state = storageUtil.get('white_noise_state')
      if (!state) return
      var sounds = this.data.sounds
      for (var i = 0; i < sounds.length; i++) {
        for (var j = 0; j < state.sounds.length; j++) {
          if (sounds[i].id === state.sounds[j].id) {
            sounds[i].active = state.sounds[j].active
            sounds[i].volume = state.sounds[j].volume
            break
          }
        }
      }
      this.setData({
        sounds: sounds,
        globalVolume: state.globalVolume || 80,
        selectedTimerIndex: state.selectedTimerIndex || 0
      })
      this.updateActiveCount()
    } catch (e) {
      logger.warn('Load state error:', e)
    }
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('白噪音 - 百宝工具箱', '/package-life/white-noise/white-noise', '助眠白噪音，自然音效放松专注')
  },
  onShareTimeline: function() {
    return poster.getTimelineConfig('白噪音 - 助眠自然音效放松专注')
  }
})
