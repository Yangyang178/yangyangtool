Page({
  data: {
    text1: '',
    text2: '',
    diffResult: [],
    stats: { added: 0, removed: 0 },
    hasDiff: false
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onInput1(e) { this.setData({ text1: e.detail.value }) },
  onInput2(e) { this.setData({ text2: e.detail.value }) },

  clearText1() {
    this.setData({ text1: '' })
  },

  clearText2() {
    this.setData({ text2: '' })
  },

  swapTexts() {
    wx.vibrateShort({ type: 'light' })
    const tmp = this.data.text1
    this.setData({ text1: this.data.text2, text2: tmp })
  },

  compare() {
    const lines1 = (this.data.text1 || '').split('\n')
    const lines2 = (this.data.text2 || '').split('\n')

    wx.vibrateShort({ type: 'light' })

    const diff = []
    let added = 0, removed = 0

    const lcs = this.computeLCS(lines1, lines2)
    let i = 0, j = 0, k = 0
    while (i < lines1.length || j < lines2.length) {
      if (k < lcs.length && i < lines1.length && lines1[i] === lcs[k] && j < lines2.length && lines2[j] === lcs[k]) {
        diff.push({ type: 'same', num: ++k, content: lines1[i] })
        i++; j++; k++
      } else {
        let inLCS = false
        for (let m = k; m < lcs.length && !inLCS; m++) {
          if (i < lines1.length && lines1[i] === lcs[m]) inLCS = true
          if (j < lines2.length && lines2[j] === lcs[m]) inLCS = true
        }
        if (!inLCS) {
          while (i < lines1.length && (k >= lcs.length || lines1[i] !== lcs[k])) {
            diff.push({ type: 'removed', content: lines1[i++] })
            removed++
          }
          while (j < lines2.length && (k >= lcs.length || lines2[j] !== lcs[k])) {
            diff.push({ type: 'added', content: lines2[j++] })
            added++
          }
        } else {
          while (i < lines1.length && (k >= lcs.length || lines1[i] !== lcs[k])) {
            diff.push({ type: 'removed', content: lines1[i++] })
            removed++
          }
          while (j < lines2.length && (k >= lcs.length || lines2[j] !== lcs[k])) {
            diff.push({ type: 'added', content: lines2[j++] })
            added++
          }
        }
      }
    }

    this.setData({
      diffResult: diff,
      stats: { added, removed },
      hasDiff: added > 0 || removed > 0
    })

    if (diff.length === 0) {
      wx.showToast({ title: '两段文本完全相同', icon: 'none' })
    }
  },

  computeLCS(arr1, arr2) {
    const m = arr1.length, n = arr2.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    const result = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        result.unshift(arr1[i - 1])
        i--; j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }
    return result
  },

  onShareAppMessage() {
    return { title: '文本对比 - 好用方便的工具集', path: '/pages/index/index' }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
