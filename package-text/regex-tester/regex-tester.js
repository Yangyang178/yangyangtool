var commonRegexes = [
  { name: '邮箱地址', pattern: '\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*', desc: '匹配标准邮箱格式' },
  { name: '手机号码', pattern: '1[3-9]\\d{9}', desc: '匹配中国大陆手机号' },
  { name: 'URL网址', pattern: '(https?|ftp)://[^\\s]+', desc: '匹配HTTP/FTP协议URL' },
  { name: 'IP地址', pattern: '((25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d?\\d)', desc: '匹配IPv4地址' },
  { name: '身份证号', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', desc: '匹配18位身份证号' },
  { name: '日期格式', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', desc: '匹配日期YYYY-MM-DD' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', desc: '匹配一个或多个中文' },
  { name: '数字', pattern: '-?\\d+(\\.\\d+)?', desc: '匹配整数或小数' },
  { name: '密码强度', pattern: '^(?=.*\\d)(?=.*[a-zA-Z]).{6,20}$', desc: '至少包含字母和数字' },
  { name: '用户名', pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,15}$', desc: '字母开头，可包含数字下划线' }
];

var sampleData = {
  regex: '\\d+',
  text: '电话：13812345678\n邮箱：test@example.com\n日期：2025-01-15\n价格：99.8元'
};

Page({
  data: {
    regexPattern: '',
    testText: '',
    
    flags: {
      g: true,
      i: false,
      m: false
    },
    
    currentFlags: 'g',
    
    errorMsg: '',
    
    matchResult: false,
    hasTested: false,
    matchCount: 0,
    highlightedText: '',
    matches: [],
    
    showReplace: false,
    replaceText: '',
    
    textLength: 0,
    lineCount: 0,
    
    commonRegexes: commonRegexes
  },

  onLoad: function() {
    this.updateFlagsDisplay();
  },

  onRegexInput: function(e) {
    this.setData({ 
      regexPattern: e.detail.value,
      errorMsg: ''
    });
  },

  onTextInput: function(e) {
    var value = e.detail.value;
    this.setData({
      testText: value,
      textLength: value.length,
      lineCount: value ? value.split('\n').length : 0
    });
  },

  toggleFlag: function(e) {
    wx.vibrateShort({ type: 'light' });
    var flag = e.currentTarget.dataset.flag;
    var flags = this.data.flags;
    flags[flag] = !flags[flag];
    
    this.setData({ flags: flags });
    this.updateFlagsDisplay();
  },

  updateFlagsDisplay: function() {
    var g = this.data.flags.g;
    var i = this.data.flags.i;
    var m = this.data.flags.m;
    var flagsStr = '';
    if (g) flagsStr += 'g';
    if (i) flagsStr += 'i';
    if (m) flagsStr += 'm';
    this.setData({ currentFlags: flagsStr || '-' });
  },

  testRegex: function() {
    wx.vibrateShort({ type: 'medium' });
    
    var regexPattern = this.data.regexPattern;
    var testText = this.data.testText;
    var flags = this.data.flags;
    
    if (!regexPattern.trim()) {
      wx.showToast({ title: '请输入正则表达式', icon: 'none' });
      return;
    }
    
    if (!testText.trim()) {
      wx.showToast({ title: '请输入测试文本', icon: 'none' });
      return;
    }

    try {
      var flagStr = '';
      if (flags.g) flagStr += 'g';
      if (flags.i) flagStr += 'i';
      if (flags.m) flagStr += 'm';
      
      var regex = new RegExp(regexPattern, flagStr);
      
      var matches = [];
      var match;
      
      if (flags.g) {
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            match: match[0],
            index: match.index
          });
          
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index
          });
        }
      }

      var highlightedText = this.generateHighlightedText(testText, matches);
      
      this.setData({
        errorMsg: '',
        matchResult: matches.length > 0,
        hasTested: true,
        matchCount: matches.length,
        highlightedText: highlightedText,
        matches: matches,
        showReplace: false
      });

      if (matches.length > 0) {
        wx.showToast({ 
          title: '找到 ' + matches.length + ' 个匹配', 
          icon: 'success',
          duration: 1500
        });
      } else {
        wx.showToast({ title: '未找到匹配', icon: 'none' });
      }
      
    } catch (e) {
      this.setData({
        errorMsg: '正则表达式错误: ' + e.message,
        matchResult: false,
        hasTested: true,
        matches: []
      });
      
      wx.vibrateLong({ type: 'heavy' });
    }
  },

  generateHighlightedText: function(text, matches) {
    if (!matches || matches.length === 0) {
      return text.replace(/</g, '&lt;');
    }

    var result = '';
    var lastIndex = 0;

    for (var idx = 0; idx < matches.length; idx++) {
      var match = matches[idx];
      result += this.escapeHtml(text.substring(lastIndex, match.index));
      result += '<span style="background:#C4B5FD;color:#1E293B;padding:2px 4px;border-radius:4px;font-weight:700;">' + this.escapeHtml(match.match) + '</span>';
      lastIndex = match.index + match.match.length;
    }
    
    result += this.escapeHtml(text.substring(lastIndex));
    return result;
  },

  escapeHtml: function(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  showReplacePanel: function() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showReplace: !this.data.showReplace });
  },

  onReplaceInput: function(e) {
    this.setData({ replaceText: e.detail.value });
  },

  executeReplace: function() {
    wx.vibrateShort({ type: 'medium' });

    var regexPattern = this.data.regexPattern;
    var testText = this.data.testText;
    var replaceText = this.data.replaceText;
    var flags = this.data.flags;
    
    if (!regexPattern.trim()) {
      wx.showToast({ title: '请输入正则表达式', icon: 'none' });
      return;
    }

    try {
      var flagStr = '';
      if (flags.g) flagStr += 'g';
      if (flags.i) flagStr += 'i';
      if (flags.m) flagStr += 'm';
      
      var regex = new RegExp(regexPattern, flagStr);
      var result = testText.replace(regex, replaceText);
      
      this.setData({
        testText: result,
        textLength: result.length,
        lineCount: result.split('\n').length,
        showReplace: false,
        matchResult: false,
        hasTested: false,
        matches: []
      });

      wx.showToast({ title: '替换成功！', icon: 'success' });
      
    } catch (e) {
      wx.showToast({ title: '替换失败', icon: 'none' });
    }
  },

  loadSampleRegex: function() {
    wx.vibrateShort({ type: 'light' });
    this.setData({
      regexPattern: sampleData.regex,
      testText: sampleData.text,
      textLength: sampleData.text.length,
      lineCount: sampleData.text.split('\n').length,
      errorMsg: ''
    });
    wx.showToast({ title: '已加载示例', icon: 'success' });
  },

  clearRegex: function() {
    wx.vibrateShort({ type: 'light' });
    this.setData({
      regexPattern: '',
      testText: '',
      errorMsg: '',
      matchResult: false,
      hasTested: false,
      matches: [],
      showReplace: false,
      replaceText: '',
      textLength: 0,
      lineCount: 0
    });
  },

  pasteText: function() {
    wx.vibrateShort({ type: 'light' });
    
    var that = this;
    wx.getClipboardData({
      success: function(res) {
        if (res.data && res.data.trim()) {
          that.setData({
            testText: res.data,
            textLength: res.data.length,
            lineCount: res.data.split('\n').length
          });
          wx.showToast({ title: '已粘贴', icon: 'success' });
        } else {
          wx.showToast({ title: '剪贴板为空', icon: 'none' });
        }
      }
    });
  },

  selectLibraryRegex: function(e) {
    wx.vibrateShort({ type: 'medium' });
    var regex = e.currentTarget.dataset.regex;
    
    this.setData({
      regexPattern: regex.pattern,
      errorMsg: ''
    });
    
    wx.showToast({ title: '已选择: ' + regex.name, icon: 'success' });
  },

  onShareAppMessage: function() {
    return {
      title: '正则表达式测试 - 百宝工具箱',
      path: '/pages/tools/regex-tester/regex-tester'
    };
  },
  onShareTimeline() {
    return { title: '' }
  }
});