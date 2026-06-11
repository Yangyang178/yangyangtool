var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')

var MORSE_MAP = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
  '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
}

var REVERSE_MORSE_MAP = {}
var mapKeys = Object.keys(MORSE_MAP)
for (var i = 0; i < mapKeys.length; i++) {
  REVERSE_MORSE_MAP[MORSE_MAP[mapKeys[i]]] = mapKeys[i]
}

var LETTER_LIST = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
var NUMBER_LIST = ['0','1','2','3','4','5','6','7','8','9']

var letterRefData = []
for (var li = 0; li < LETTER_LIST.length; li++) {
  letterRefData.push({ ch: LETTER_LIST[li], code: MORSE_MAP[LETTER_LIST[li]] })
}
var numberRefData = []
for (var ni = 0; ni < NUMBER_LIST.length; ni++) {
  numberRefData.push({ ch: NUMBER_LIST[ni], code: MORSE_MAP[NUMBER_LIST[ni]] })
}

var ABBREVIATIONS = [
  { abbr: 'SOS', meaning: '紧急求救', morse: '... --- ...' },
  { abbr: 'CQ', meaning: '通用呼叫', morse: '-.-. --.-' },
  { abbr: 'ACK', meaning: '确认/应答', morse: '.- -.-. -.-' },
  { abbr: 'NACK', meaning: '否认', morse: '-. .- -.-. -.-' },
  { abbr: 'QRZ', meaning: '谁在呼叫？', morse: '--.- .-. --..' },
  { abbr: 'QRM', meaning: '受到干扰', morse: '--.- .-. --' },
  { abbr: 'QRN', meaning: '天电干扰', morse: '--.- .-. -.' },
  { abbr: 'QRO', meaning: '增加功率', morse: '--.- .-. ---' },
  { abbr: 'QRP', meaning: '降低功率', morse: '--.- .-. .--.' },
  { abbr: 'QRS', meaning: '放慢速度', morse: '--.- .-. ...' },
  { abbr: 'QRT', meaning: '停止发送', morse: '--.- .-. -' },
  { abbr: 'QRV', meaning: '准备就绪', morse: '--.- .-. ...-' },
  { abbr: 'QRX', meaning: '稍等', morse: '--.- .-. -..-' },
  { abbr: 'QSL', meaning: '确认收到', morse: '--.- ... .-..' },
  { abbr: 'QSY', meaning: '更换频率', morse: '--.- ... -.--' },
  { abbr: '73', meaning: '最美好的祝愿', morse: '--... ...--' },
  { abbr: '88', meaning: '爱与亲吻', morse: '---.. ---..' },
  { abbr: 'DE', meaning: '来自(发信方)', morse: '-.. .' },
  { abbr: 'K', meaning: '请发送(邀请)', morse: '-.-' },
  { abbr: 'KN', meaning: '仅邀请指定台', morse: '-.- -.' },
  { abbr: 'SK', meaning: '结束通信', morse: '... -.-' },
  { abbr: 'AR', meaning: '消息结束', morse: '.- .-.' },
  { abbr: 'BT', meaning: '分隔/暂停', morse: '-... -' },
  { abbr: 'AS', meaning: '请稍候', morse: '.- ...' },
  { abbr: 'R', meaning: '收到/明白', morse: '.-.' }
]

var PRACTICE_CHARS = LETTER_LIST.concat(NUMBER_LIST)

var DOT_DURATION = 80
var DASH_DURATION = 240
var SYMBOL_GAP = 80
var LETTER_GAP = 240
var WORD_GAP = 560

Page({
  data: {
    inputText: '',
    outputText: '',
    mode: 'encode',
    isDarkMode: false,
    fontSizeSetting: 'medium',
    hasResult: false,
    charCount: 0,
    morseCount: 0,
    letterRefData: letterRefData,
    numberRefData: numberRefData,
    abbreviations: ABBREVIATIONS,

    activeTab: 'convert',
    isPlaying: false,
    playProgress: '',
    playSpeed: 1,

    practiceMode: 'char2code',
    practiceQuestion: '',
    practiceAnswer: '',
    practiceOptions: [],
    practiceCorrect: -1,
    practiceSelected: -1,
    practiceScore: 0,
    practiceTotal: 0,
    practiceStreak: 0,
    practiceAccuracy: 0,
    showPracticeAnswer: false,
    practiceHint: ''
  },

  _audioCtx: null,
  _playTimer: null,
  _playTimeouts: [],

  onLoad: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('Morse电码转换')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var toolTexts = i18n.getToolPageTexts('morseCode')
    this.setData({ i18n: toolTexts })
    poster.setupForPage(this, 37)
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    var toolTexts = i18n.getToolPageTexts('morseCode')
    this.setData({ i18n: toolTexts })
  },

  onUnload: function() {
    this._stopAllPlayback()
  },

  onHide: function() {
    this._stopAllPlayback()
  },

  onTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    wx.vibrateShort({ type: 'light' })
    this._stopAllPlayback()
    this.setData({ activeTab: tab })
    if (tab === 'learn' && this.data.practiceTotal === 0) {
      this._generateQuestion()
    }
  },

  onModeChange: function(e) {
    var mode = e.currentTarget.dataset.mode
    if (mode === this.data.mode) return
    this.setData({
      mode: mode,
      inputText: '',
      outputText: '',
      hasResult: false,
      charCount: 0,
      morseCount: 0
    })
    toolActions.vibrate('light')
  },

  onInput: function(e) {
    var input = e.detail.value
    this.setData({ inputText: input })
    if (!input.trim()) {
      this.setData({
        outputText: '',
        hasResult: false,
        charCount: 0,
        morseCount: 0
      })
      return
    }
    if (this.data.mode === 'encode') {
      this.encode(input)
    } else {
      this.decode(input)
    }
  },

  encode: function(text) {
    var result = []
    var words = text.toUpperCase().split(' ')
    for (var w = 0; w < words.length; w++) {
      var word = words[w]
      if (!word) continue
      var morseWord = []
      for (var c = 0; c < word.length; c++) {
        var ch = word[c]
        if (MORSE_MAP[ch]) {
          morseWord.push(MORSE_MAP[ch])
        } else if (ch === ' ' || ch === '\n' || ch === '\t') {
          continue
        } else {
          morseWord.push('[' + ch + ']')
        }
      }
      if (morseWord.length > 0) {
        result.push(morseWord.join(' '))
      }
    }
    var output = result.join(' / ')
    var morseCount = 0
    var parts = output.split(' ')
    for (var p = 0; p < parts.length; p++) {
      if (parts[p] !== '/' && parts[p] !== '') {
        morseCount++
      }
    }
    this.setData({
      outputText: output,
      hasResult: true,
      charCount: text.replace(/\s/g, '').length,
      morseCount: morseCount
    })
  },

  decode: function(text) {
    var result = []
    var words = text.split('/')
    for (var w = 0; w < words.length; w++) {
      var word = words[w].trim()
      if (!word) continue
      var letters = word.split(' ')
      var decodedWord = ''
      for (var l = 0; l < letters.length; l++) {
        var code = letters[l].trim()
        if (code === '') continue
        if (REVERSE_MORSE_MAP[code]) {
          decodedWord += REVERSE_MORSE_MAP[code]
        } else {
          decodedWord += code
        }
      }
      if (decodedWord) {
        result.push(decodedWord)
      }
    }
    var output = result.join(' ')
    var morseCount = 0
    var allCodes = text.split(' ')
    for (var a = 0; a < allCodes.length; a++) {
      if (allCodes[a] !== '/' && allCodes[a].trim() !== '') {
        morseCount++
      }
    }
    this.setData({
      outputText: output,
      hasResult: true,
      charCount: text.length,
      morseCount: morseCount
    })
  },

  playMorse: function() {
    wx.vibrateShort({ type: 'medium' })
    var output = this.data.outputText
    if (!output || !output.trim()) {
      wx.showToast({ title: this.data.i18n.pleaseConvertFirst, icon: 'none' })
      return
    }
    if (this.data.isPlaying) {
      this._stopAllPlayback()
      return
    }
    this._playMorseSequence(output)
  },

  playCharMorse: function(e) {
    var code = e.currentTarget.dataset.code
    if (!code) return
    wx.vibrateShort({ type: 'light' })
    if (this.data.isPlaying) {
      this._stopAllPlayback()
      return
    }
    this._playMorseSequence(code)
  },

  playAbbrMorse: function(e) {
    var morse = e.currentTarget.dataset.morse
    if (!morse) return
    wx.vibrateShort({ type: 'light' })
    if (this.data.isPlaying) {
      this._stopAllPlayback()
      return
    }
    this._playMorseSequence(morse)
  },

  _playMorseSequence: function(morseStr) {
    var that = this
    var speed = this.data.playSpeed

    this.setData({ isPlaying: true, playProgress: '生成音频...' })

    var sampleRate = 8000
    var frequency = 700
    var samples = []

    var dotLen = Math.round(sampleRate * DOT_DURATION / 1000 / speed)
    var dashLen = Math.round(sampleRate * DASH_DURATION / 1000 / speed)
    var symGap = Math.round(sampleRate * SYMBOL_GAP / 1000 / speed)
    var letGap = Math.round(sampleRate * LETTER_GAP / 1000 / speed)
    var wordGap = Math.round(sampleRate * WORD_GAP / 1000 / speed)
    var fadeLen = Math.round(sampleRate * 0.005)

    var raw = morseStr.split('')
    for (var ri = 0; ri < raw.length; ri++) {
      var ch = raw[ri]
      if (ch === '.') {
        for (var s = 0; s < dotLen; s++) {
          var env = 1.0
          if (s < fadeLen) env = s / fadeLen
          if (s > dotLen - fadeLen) env = (dotLen - s) / fadeLen
          samples.push(Math.round(Math.sin(2 * Math.PI * frequency * s / sampleRate) * 32767 * 0.5 * env))
        }
        for (var sg = 0; sg < symGap; sg++) samples.push(0)
      } else if (ch === '-') {
        for (var s2 = 0; s2 < dashLen; s2++) {
          var env2 = 1.0
          if (s2 < fadeLen) env2 = s2 / fadeLen
          if (s2 > dashLen - fadeLen) env2 = (dashLen - s2) / fadeLen
          samples.push(Math.round(Math.sin(2 * Math.PI * frequency * s2 / sampleRate) * 32767 * 0.5 * env2))
        }
        for (var sg2 = 0; sg2 < symGap; sg2++) samples.push(0)
      } else if (ch === ' ') {
        for (var lg = 0; lg < letGap - symGap; lg++) samples.push(0)
      } else if (ch === '/') {
        for (var wg = 0; wg < wordGap - symGap; wg++) samples.push(0)
      }
    }

    var leadSilence = Math.round(sampleRate * 0.05)
    var trailSilence = Math.round(sampleRate * 0.1)
    var allSamples = []
    for (var ls = 0; ls < leadSilence; ls++) allSamples.push(0)
    for (var ai = 0; ai < samples.length; ai++) allSamples.push(samples[ai])
    for (var ts = 0; ts < trailSilence; ts++) allSamples.push(0)

    var numSamples = allSamples.length
    var dataSize = numSamples * 2
    var bufferSize = 44 + dataSize
    var buffer = new ArrayBuffer(bufferSize)
    var view = new DataView(buffer)

    var writeStr = function(offset, str) {
      for (var wi = 0; wi < str.length; wi++) {
        view.setUint8(offset + wi, str.charCodeAt(wi))
      }
    }

    writeStr(0, 'RIFF')
    view.setUint32(4, bufferSize - 8, true)
    writeStr(8, 'WAVE')
    writeStr(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeStr(36, 'data')
    view.setUint32(40, dataSize, true)

    for (var si = 0; si < numSamples; si++) {
      view.setInt16(44 + si * 2, allSamples[si], true)
    }

    var base64 = that._arrayBufferToBase64(buffer)

    var fs = wx.getFileSystemManager()
    var tempPath = wx.env.USER_DATA_PATH + '/morse_play.wav'

    try { fs.unlinkSync(tempPath) } catch (e) {}

    fs.writeFile({
      filePath: tempPath,
      data: base64,
      encoding: 'base64',
      success: function() {
        if (!that.data.isPlaying) return

        var audioCtx = wx.createInnerAudioContext()
        audioCtx.volume = 1.0
        audioCtx.src = tempPath
        that._audioCtx = audioCtx

        var progressParts = []
        var partIdx = 0
        var morseParts = morseStr.split(' ')
        for (var mp = 0; mp < morseParts.length; mp++) {
          if (morseParts[mp] !== '/' && morseParts[mp]) progressParts.push(morseParts[mp])
        }

        var totalMs = Math.round(numSamples / sampleRate * 1000)
        that.setData({ playProgress: '播放中...' })

        that._playTimeouts = []
        var progressTimer = setInterval(function() {
          if (!that.data.isPlaying) {
            clearInterval(progressTimer)
            return
          }
          if (partIdx < progressParts.length) {
            that.setData({ playProgress: progressParts[partIdx] })
            partIdx++
          }
        }, Math.max(300, totalMs / Math.max(progressParts.length, 1)))
        that._playTimeouts.push(progressTimer)

        audioCtx.onEnded(function() {
          clearInterval(progressTimer)
          that.setData({ isPlaying: false, playProgress: '' })
          audioCtx.destroy()
        })

        audioCtx.onError(function() {
          clearInterval(progressTimer)
          that.setData({ isPlaying: false, playProgress: '' })
          try { audioCtx.destroy() } catch (e) {}
        })

        audioCtx.play()
      },
      fail: function(res) {
        that.setData({ isPlaying: false, playProgress: '' })
        wx.showToast({ title: that.data.i18n.audioGenFail, icon: 'none' })
      }
    })
  },

  _arrayBufferToBase64: function(buffer) {
    var bytes = new Uint8Array(buffer)
    var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    var result = ''
    var len = bytes.length
    for (var i = 0; i < len; i += 3) {
      var b1 = bytes[i]
      var b2 = i + 1 < len ? bytes[i + 1] : 0
      var b3 = i + 2 < len ? bytes[i + 2] : 0
      result += base64Chars[b1 >> 2]
      result += base64Chars[((b1 & 3) << 4) | (b2 >> 4)]
      result += i + 1 < len ? base64Chars[((b2 & 15) << 2) | (b3 >> 6)] : '='
      result += i + 2 < len ? base64Chars[b3 & 63] : '='
    }
    return result
  },

  _stopAllPlayback: function() {
    for (var t = 0; t < this._playTimeouts.length; t++) {
      clearTimeout(this._playTimeouts[t])
    }
    this._playTimeouts = []
    if (this._audioCtx) {
      try { this._audioCtx.stop() } catch (e) {}
      try { this._audioCtx.destroy() } catch (e) {}
      this._audioCtx = null
    }
    this.setData({ isPlaying: false, playProgress: '' })
  },

  onSpeedChange: function(e) {
    var speed = parseFloat(e.currentTarget.dataset.speed)
    wx.vibrateShort({ type: 'light' })
    this.setData({ playSpeed: speed })
  },

  onPracticeModeChange: function(e) {
    var mode = e.currentTarget.dataset.mode
    wx.vibrateShort({ type: 'light' })
    this.setData({
      practiceMode: mode,
      practiceScore: 0,
      practiceTotal: 0,
      practiceStreak: 0,
      practiceAccuracy: 0,
      showPracticeAnswer: false,
      practiceSelected: -1,
      practiceCorrect: -1
    })
    this._generateQuestion()
  },

  _generateQuestion: function() {
    var mode = this.data.practiceMode
    var idx = Math.floor(Math.random() * PRACTICE_CHARS.length)
    var char = PRACTICE_CHARS[idx]
    var code = MORSE_MAP[char]

    if (mode === 'char2code') {
      var wrongCodes = this._getWrongOptions(code, 3)
      var options = wrongCodes.concat([code])
      options = this._shuffleArray(options)
      var correctIdx = -1
      for (var oi = 0; oi < options.length; oi++) {
        if (options[oi] === code) { correctIdx = oi; break }
      }
      this.setData({
        practiceQuestion: char,
        practiceAnswer: code,
        practiceOptions: options,
        practiceCorrect: correctIdx,
        practiceSelected: -1,
        showPracticeAnswer: false,
        practiceHint: ''
      })
    } else {
      var wrongChars = this._getWrongCharOptions(char, 3)
      var charOptions = wrongChars.concat([char])
      charOptions = this._shuffleArray(charOptions)
      var correctIdx2 = -1
      for (var ci = 0; ci < charOptions.length; ci++) {
        if (charOptions[ci] === char) { correctIdx2 = ci; break }
      }
      this.setData({
        practiceQuestion: code,
        practiceAnswer: char,
        practiceOptions: charOptions,
        practiceCorrect: correctIdx2,
        practiceSelected: -1,
        showPracticeAnswer: false,
        practiceHint: ''
      })
    }
  },

  _getWrongOptions: function(correctCode, count) {
    var allCodes = []
    var keys = Object.keys(MORSE_MAP)
    for (var k = 0; k < keys.length; k++) {
      var c = MORSE_MAP[keys[k]]
      if (c !== correctCode) allCodes.push(c)
    }
    return this._shuffleArray(allCodes).slice(0, count)
  },

  _getWrongCharOptions: function(correctChar, count) {
    var allChars = []
    for (var p = 0; p < PRACTICE_CHARS.length; p++) {
      if (PRACTICE_CHARS[p] !== correctChar) allChars.push(PRACTICE_CHARS[p])
    }
    return this._shuffleArray(allChars).slice(0, count)
  },

  _shuffleArray: function(arr) {
    var shuffled = arr.slice()
    for (var s = shuffled.length - 1; s > 0; s--) {
      var j = Math.floor(Math.random() * (s + 1))
      var temp = shuffled[s]
      shuffled[s] = shuffled[j]
      shuffled[j] = temp
    }
    return shuffled
  },

  onPracticeSelect: function(e) {
    if (this.data.showPracticeAnswer) return
    var idx = e.currentTarget.dataset.idx
    wx.vibrateShort({ type: 'medium' })
    var isCorrect = idx === this.data.practiceCorrect
    var newScore = this.data.practiceScore + (isCorrect ? 1 : 0)
    var newTotal = this.data.practiceTotal + 1
    var newStreak = isCorrect ? this.data.practiceStreak + 1 : 0
    var newAccuracy = Math.round(newScore / newTotal * 100)

    this.setData({
      practiceSelected: idx,
      showPracticeAnswer: true,
      practiceScore: newScore,
      practiceTotal: newTotal,
      practiceStreak: newStreak,
      practiceAccuracy: newAccuracy,
      practiceHint: isCorrect ? '✅ 正确！' : '❌ 正确答案是: ' + this.data.practiceAnswer
    })

    var that = this
    setTimeout(function() {
      that._generateQuestion()
    }, isCorrect ? 800 : 1500)
  },

  onPracticeHint: function() {
    wx.vibrateShort({ type: 'light' })
    var mode = this.data.practiceMode
    var hint = ''
    if (mode === 'char2code') {
      var code = this.data.practiceAnswer
      var count = 0
      for (var h = 0; h < code.length; h++) {
        if (code[h] === '-') count++
      }
      hint = '提示：共' + code.length + '个符号，其中' + count + '个长音(-)'
    } else {
      hint = '提示：' + this.data.practiceAnswer
    }
    this.setData({ practiceHint: hint })
  },

  onPlayPracticeQuestion: function() {
    if (this.data.isPlaying) {
      this._stopAllPlayback()
      return
    }
    var mode = this.data.practiceMode
    var code = ''
    if (mode === 'code2char') {
      code = this.data.practiceQuestion
    } else {
      code = this.data.practiceAnswer
    }
    if (code) {
      this._playMorseSequence(code)
    }
  },

  copyResult: function() {
    toolActions.copyText(this.data.outputText, '已复制电码')
  },

  resetData: function() {
    var that = this
    this._stopAllPlayback()
    toolActions.resetConfirm(function() {
      that.setData({
        inputText: '',
        outputText: '',
        mode: 'encode',
        hasResult: false,
        charCount: 0,
        morseCount: 0
      })
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('📡 Morse电码转换 - 百宝工具箱', '/package-text/morse-code/morse-code')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('📡 Morse电码转换 - 百宝工具箱')
  }
})
