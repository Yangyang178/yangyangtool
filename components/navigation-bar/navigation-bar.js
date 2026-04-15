Component({
  options: {
    multipleSlots: true
  },
  
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    background: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    },
    loading: {
      type: Boolean,
      value: false
    },
    homeButton: {
      type: Boolean,
      value: false
    },
    animated: {
      type: Boolean,
      value: true
    },
    show: {
      type: Boolean,
      value: true,
      observer: '_showChange'
    },
    delta: {
      type: Number,
      value: 1
    }
  },

  data: {
    displayStyle: '',
    ios: false,
    innerPaddingRight: '',
    leftWidth: '',
    navBarTop: '0px',
    statusBarHeight: 0,
    navBarHeight: 44
  },

  lifetimes: {
    attached() {
      var that = this;

      try {
        var deviceInfo = wx.getDeviceInfo();
        var windowInfo = wx.getWindowInfo();
        var platform = deviceInfo.platform || 'ios';
        var windowWidth = windowInfo.windowWidth || 375;

        var statusBarHeight = windowInfo.statusBarHeight || 20;
        var menuButton = wx.getMenuButtonBoundingClientRect();
        var menuButtonTop = menuButton.top || (statusBarHeight + 4);
        var menuButtonHeight = menuButton.height || 32;

        var navBarHeight = menuButtonHeight + (menuButtonTop - statusBarHeight) * 2;
        var totalTop = statusBarHeight + (menuButtonTop - statusBarHeight);

        that.setData({
          ios: platform !== 'android',
          innerPaddingRight: 'padding-right: ' + (windowWidth - menuButton.left) + 'px',
          leftWidth: 'width: ' + (windowWidth - menuButton.left) + 'px',
          navBarTop: totalTop + 'px',
          statusBarHeight: statusBarHeight,
          navBarHeight: navBarHeight
        });

      } catch (e) {
        console.log('nav error:', e);
        that.setData({
          innerPaddingRight: 'padding-right: 100px',
          leftWidth: 'width: 100px',
          navBarTop: '48px',
          statusBarHeight: 24,
          navBarHeight: 48
        });
      }
    }
  },

  methods: {
    _showChange(show) {
      var animated = this.data.animated;
      var displayStyle = '';
      
      if (animated) {
        displayStyle = 'opacity: ' + (show ? '1' : '0') + ';transition:opacity 0.5s;';
      } else {
        displayStyle = 'display: ' + (show ? '' : 'none');
      }
      
      this.setData({
        displayStyle: displayStyle
      });
    },
    
    back() {
      var data = this.data;
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta
        });
      }
      this.triggerEvent('back', { delta: data.delta }, {});
    }
  }
});