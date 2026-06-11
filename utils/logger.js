var envVersion = 'release'
try {
  var accountInfo = wx.getAccountInfoSync()
  envVersion = accountInfo.miniProgram.envVersion
} catch(e) {}

var isDev = envVersion === 'develop'

module.exports = {
  log: function() {
    if (isDev) console.log.apply(console, arguments)
  },
  warn: function() {
    if (isDev) console.warn.apply(console, arguments)
  },
  error: function() {
    if (isDev) console.error.apply(console, arguments)
  },
  info: function() {
    if (isDev) console.info.apply(console, arguments)
  }
}
