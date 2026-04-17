var QRCode = (function() {
  var PAD0 = 0xEC;
  var PAD1 = 0x11;

  var ALPHANUMERIC_MAP = {};
  for (var i = 0; i < 10; i++) ALPHANUMERIC_MAP[String(i)] = i;
  for (var i = 10; i < 36; i++) ALPHANUMERIC_MAP[String.fromCharCode(i + 55)] = i;
  ALPHANUMERIC_MAP[' '] = 36; ALPHANUMERIC_MAP['$'] = 37; ALPHANUMERIC_MAP['%'] = 38;
  ALPHANUMERIC_MAP['*'] = 39; ALPHANUMERIC_MAP['+'] = 40; ALPHANUMERIC_MAP['-'] = 41;
  ALPHANUMERIC_MAP['.'] = 42; ALPHANUMERIC_MAP['/'] = 43; ALPHANUMERIC_MAP[':'] = 44;

  var EC_LEVELS = { L: 1, M: 0, Q: 3, H: 2 };

  function getNumRSBlocks(ver, ecl) {
    var rsBlocks = [
      null,
      [[1,26,19],[1,26,16],[1,26,13],[1,26,9]],
      [[1,44,34],[1,44,28],[1,44,22],[1,44,16]],
      [[1,70,55],[1,70,44],[2,35,17],[2,35,13]],
      [[1,100,80],[2,50,32],[2,50,24],[4,25,9]],
      [[1,134,108],[2,67,43],[2,33,15],[2,33,11]],
      [[2,86,68],[4,43,27],[4,43,19],[4,43,15]],
      [[2,98,78],[4,49,31],[4,49,14],[4,49,13]],
      [[2,121,97],[2,60,38],[4,45,18],[4,45,14]],
      [[2,146,116],[3,58,36],[4,58,16],[4,58,12]],
      [[2,172,68],[4,64,43],[6,36,19],[4,36,15]],
      [[4,196,99],[4,49,50],[8,43,24],[4,43,17]],
      [[4,219,119],[6,55,47],[8,45,22],[6,45,18]],
      [[4,242,137],[8,54,39],[8,52,20],[6,52,16]],
      [[4,292,155],[10,62,38],[8,53,18],[8,53,15]],
      [[4,346,177],[12,56,36],[12,56,16],[10,56,15]],
      [[6,404,195],[14,62,34],[16,56,16],[16,56,14]],
      [[6,466,219],[16,58,34],[16,58,18],[18,58,15]],
      [[6,532,243],[18,54,30],[18,54,16],[20,54,15]],
      [[6,581,267],[20,58,28],[20,58,16],[22,58,15]],
      [[6,655,291],[22,62,26],[22,62,16],[24,62,15]],
      [[8,733,321],[24,58,28],[24,63,18],[26,63,17]],
      [[8,803,357],[26,62,26],[26,63,18],[28,63,17]],
      [[8,879,395],[28,65,26],[28,63,18],[30,63,17]],
      [[8,961,425],[30,63,24],[28,59,18],[32,59,17]],
      [[8,1085,453],[32,63,22],[30,61,18],[34,61,16]],
      [[9,1156,483],[34,62,22],[32,60,18],[36,60,16]],
      [[9,1258,513],[36,58,20],[34,62,16],[38,62,16]],
      [[9,1364,549],[38,66,20],[36,65,16],[40,65,16]],
      [[10,1465,579],[40,63,18],[38,63,16],[42,63,15]],
      [[10,1528,609],[42,61,16],[40,61,16],[44,61,15]],
      [[11,1628,651],[46,62,16],[44,62,16],[48,62,15]],
      [[11,1732,693],[48,63,16],[46,63,16],[52,63,15]],
      [[12,1842,735],[52,63,14],[48,66,16],[56,66,15]],
      [[12,1958,777],[56,63,14],[52,65,14],[60,65,15]],
      [[13,2118,819],[60,63,14],[56,63,14],[64,63,15]],
      [[13,2238,861],[64,63,14],[60,60,14],[68,60,15]],
      [[14,2394,903],[68,63,14],[64,60,14],[72,60,15]],
      [[14,2534,945],[72,63,14],[68,60,14],[76,60,15]],
      [[15,2706,987],[76,63,14],[72,60,14],[80,60,15]],
      [[15,2876,1029],[80,63,14],[76,60,14],[84,60,15]]
    ];
    return rsBlocks[ver][ecl].map(function(b) { return b[0]; });
  }

  var NUM_ERROR_CORRECTION_CODEWORDS = [
    null,
    [7,10,13,17],[10,16,22,28],[15,26,18,13],[20,18,26,13],
    [26,24,18,15],[18,22,26,15],[20,24,30,13],[24,28,18,15],
    [30,24,20,17],[18,30,24,17],[20,28,26,17],[24,30,28,18],
    [26,28,20,16],[30,28,24,15],[28,30,28,15],[30,26,28,15],
    [28,34,26,17],[30,28,26,16],[30,34,28,16],[30,30,28,16],
    [30,32,30,16],[30,30,30,16],[30,30,30,16],[30,30,30,16],
    [30,30,30,16],[30,30,30,18],[26,30,28,18],[28,30,28,18],
    [28,28,28,18],[28,28,28,18],[28,28,28,18],[28,28,28,18]
  ];

  var NUM_RAW_DATA_MODULES = [
    null,
    26,44,70,100,134,172,196,244,294,346,
    404,466,532,581,655,733,815,901,991,1085,
    1156,1258,1364,1474,1588,1706,1828,1961,2086,2203,
    2331,2465,2601,2735,2877,3019,3163,3311
  ];

  function getNumRawDataModules(ver) {
    if (ver < 1 || ver > 40) throw 'Version out of range';
    return NUM_RAW_DATA_MODULES[ver];
  }

  function getNumDataCodewords(ver, ecl) {
    return Math.floor(getNumRawDataModules(ver) / 8) - NUM_ERROR_CORRECTION_CODEWORDS[ver][ecl];
  }

  function ReedSolomonComputeDivisor(degree) {
    var result = [];
    for (var i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    var root = 1;
    for (var i = 0; i < degree; i++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = rsMultiply(result[j], root);
        if (j + 1 < result.length)
          result[j] ^= result[j + 1];
      }
      root = rsMultiply(root, 2);
    }
    return result;
  }

  function rsMultiply(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = ((z << 1) ^ ((z >>> 7) * 0x11D)) & 0xFF;
      if (((y >>> i) & 1) !== 0) z ^= x;
    }
    return z;
  }

  function ReedSolomonComputeRemainder(data, divisor) {
    var result = data.slice();
    for (var i = 0; i < data.length; i++) {
      var factor = result[i];
      if (factor === 0) continue;
      for (var j = 0; j < divisor.length; j++)
        result[i + j] ^= rsMultiply(divisor[j], factor);
    }
    return result.slice(data.length);
  }

  function encodeText(text, ecl) {
    var segs = [{mode:'byte',data:text,numChars:text.length}];
    var dataBits = new BitBuffer();
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      appendModeIndicator(dataBits, seg.mode);
      appendNumAndData(dataBits, seg.mode, seg.data, seg.numChars);
    }
    var ver = getVersionForCapacity(dataBits.length(), ecl);
    addPaddingAndTerminate(dataBits, ver, ecl);
    var dataCodewords = createCodewords(dataBits, getNumDataCodewords(ver, ecl));
    var ecCodewords = computeECCodewords(dataCodewords, ver, ecl);
    var fullCodewords = dataCodewords.concat(ecCodewords);
    return interleaveWithEC(fullCodewords, ver, ecl);
  }

  function BitBuffer() {
    this.bytes = []; this.bitLen = 0;
  }
  BitBuffer.prototype.appendBits = function(val, len) {
    for (var i = len - 1; i >= 0; i--)
      this.putBit((val >>> i) & 1);
  };
  BitBuffer.prototype.putBit = function(bit) {
    if (this.bitLen % 8 === 0) this.bytes.push(0);
    if (bit !== 0) this.bytes[this.bytes.length - 1] |= (1 << (7 - (this.bitLen % 8)));
    this.bitLen++;
  };
  BitBuffer.prototype.length = function() { return this.bitLen; };

  function appendModeIndicator(bb, mode) {
    bb.appendBits({'byte':4,'numeric':1,'alphanumeric':2,'kanji':8}[mode], 4);
  }

  function appendNumAndData(bb, mode, data, numChars) {
    switch (mode) {
      case 'numeric':
        bb.appendBits(numChars, getNumCharCountBits('numeric', 40));
        for (var i = 0; i < numChars;) {
          var n = Math.min(numChars - i, 3);
          bb.appendBits(parseInt(data.substring(i, i+n), 10), n*3+((n===3)?1:(n===2)?4:4));
          i += n;
        }
        break;
      case 'alphanumeric':
        bb.appendBits(numChars, getNumCharCountBits('alphanumeric', 40));
        for (var i = 0; i < numChars;) {
          var n = Math.min(numChars - i, 2);
          var val = n === 2 ? ALPHANUMERIC_MAP[data[i]]*45 + ALPHANUMERIC_MAP[data[i+1]] : ALPHANUMERIC_MAP[data[i]];
          bb.appendBits(val, n===2?11:6); i+=n;
        }
        break;
      case 'byte':
        bb.appendBits(numChars, getNumCharCountBits('byte', 40));
        for (var i = 0; i < numChars; i++)
          bb.appendBits(data.charCodeAt(i), 8);
        break;
      case 'kanji':
        bb.appendBits(Math.floor(numChars/2), getNumCharCountBits('kanji', 40));
        for (var i = 0; i+1 < numChars; i+=2) {
          var cp = (data.charCodeAt(i)<<8)|data.charCodeAt(i+1);
          var val = (cp<0x9FFC)?cp:cp+0x8000;
          bb.appendBits(val, 13);
        }
        break;
      default: throw 'Invalid mode';
    }
  }

  function getNumCharCountBits(mode, ver) {
    var t = {'numeric':[10,12,14],'alphanumeric':[9,11,13],'byte':[8,16,16],'kanji':[8,10,12]}[mode];
    return t[ver<=9?0:ver<=26?1:2];
  }

  function getVersionForCapacity(capacity, ecl) {
    for (var v = 1; v <= 40; v++) {
      if (capacity <= getTotalDataBits(v, ecl)) return v;
    }
    throw 'Data too long';
  }

  function getTotalDataBits(ver, ecl) {
    return getNumDataCodewords(ver, ecl)*8;
  }

  function addPaddingAndTerminate(bb, ver, ecl) {
    var totalBits = getNumDataCodewords(ver, ecl)*8;
    var capacity = totalBits;
    bb.appendBits(0, Math.min(4, capacity - bb.length()));
    bb.appendBits(0, Math.ceil((bb.length()+7)/8)*8 - bb.length());
    for (var padByte = 0; bb.length() < totalBits; padByte^=1)
      bb.appendBits(padByte===0?PAD0:PAD1, 8);
  }

  function createCodewords(bb, numCW) {
    var bytes = bb.bytes;
    while (bytes.length > numCW) bytes.pop();
    while (bytes.length < numCW) bytes.push(0);
    return bytes;
  }

  function computeECCodewords(data, ver, ecl) {
    var blocks = getNumRSBlocks(ver, ecl);
    var divisor = ReedSolomonComputeDivisor(NUM_ERROR_CORRECTION_CODEWORDS[ver][ecl]);
    var result = [];
    var offset = 0;
    for (var b = 0; b < blocks.length; b++) {
      var dat = data.slice(offset, offset+blocks[b]);
      offset += blocks[b];
      var ecc = ReedSolomonComputeRemainder(dat, divisor);
      result = result.concat(ecc);
    }
    return result;
  }

  function interleaveWithEC(codewords, ver, ecl) {
    var nb = getNumRSBlocks(ver, ecl);
    var dcw = getNumDataCodewords(ver, ecl);
    var ecw = codewords.length - dcw;
    var result = [];
    var maxD = Math.max.apply(null, nb);
    for (var i = 0; i < maxD; i++)
      for (var b = 0; b < nb.length; b++)
        if (i < nb[b]) result.push(codewords[sumFirst(nb,b)+i]);
    var maxE = ecw/nb.length;
    for (var i = 0; i < maxE; i++)
      for (var b = 0; b < nb.length; b++)
        result.push(codewords[dcw+i+(b*maxE)]);
    return result;
  }

  function sumFirst(arr, n) { var s=0; for(var i=0;i<n;i++) s+=arr[i]; return s; }

  function constructMatrix(data, ver, ecl, mask) {
    var size = ver*4+17;
    var modules = [], isFunction = [];
    for (var y = 0; y < size; y++) {
      modules[y]=[];isFunction[y]=[];
      for (var x = 0; x < size; x++) {
        modules[y][x]=false;isFunction[y][x]=false;
      }
    }
    drawFinderPatterns(modules,isFunction,size);
    drawAlignmentPatterns(modules,isFunction,ver,size);
    drawTimingPatterns(modules,isFunction,size);
    drawDarkModule(modules,isFunction,ver,size);
    reserveFormatArea(isFunction,size);
    reserveVersionArea(isFunction,ver,size);
    placeDataCodewords(modules,isFunction,data,mask,size);
    drawFormatInfo(modules,isFunction,ecl,mask,size);
    drawVersionInfo(modules,isFunction,ver,size);
    return modules;
  }

  function drawFinderPatterns(m,f,s) {
    [[0,0],[s-7,0],[0,s-7]].forEach(function(p){
      for (var dy=-4;dy<=4;dy++){
        for (var dx=-4;dx<=4;dx++){
          var x=p[0]+dx,y=p[1]+dy;
          var dist=Math.max(Math.abs(dx),Math.abs(dy));
          m[y][x]=(dist!==2&&dist!==4);f[y][x]=true;
        }
      }
    });
  }

  function drawAlignmentPatterns(m,f,v,s) {
    if (v<2) return;
    var pos=[6,26,50,74]; var n=v-1;
    if (n>pos.length-1){pos.push(pos[pos.length-1]+40);n--;}
    pos.forEach(function(py){pos.forEach(function(px){
      if (f[py][px]) return;
      for(var dy=-2;dy<=2;dy++){for(var dx=-2;dx<=2;dx++){
        m[py+dy][px+dx]=(Math.max(Math.abs(dx),Math.abs(dy))!==1);
        f[py+dy][px+dx]=true;
      }}
      m[py][px]=true;
    })});
  }

  function drawTimingPatterns(m,f,s) {
    for (var i=8;i<s-8;i++){
      m[6][i]=m[i][6]=(i%2===0);f[6][i]=f[i][6]=true;
    }
  }

  function drawDarkModule(m,f,v,s){m[s-8][8]=true;f[s-8][8]=true;}

  function reserveFormatArea(f,s){
    for(var i=0;i<9;i++){f[8][i]=f[i][8]=true;if(i===8)f[8][8]=false;}
    f[8][s-8]=f[s-8][8]=true;
  }

  function reserveVersionArea(f,v,s){
    if(v<7)return;
    for(var i=0;i<6;i++)for(var j=0;j<3;j++){
      f[s-11+j][i]=f[i][s-11+j]=true;
    }
  }

  function placeDataCodewords(m,f,data,mask,size){
    var bitIdx=0;
    for(var right=size-1;right>=1;right-=2){
      if(right===6)right--;
      for(var vert=0;vert<size;vert++){
        for(var j=0;j<2;j++){
          var x=right-j;
          var upward=((right+1)&2)===0;
          var y=upward?(size-1-vert):vert;
          if(!f[y][x] && bitIdx<data.length*8){
            m[y][x]=((data[bitIdx>>>3]>>>(7-(bitIdx&7)))&1)!==0;
            bitIdx++;
          }
        }
      }
    }
    applyMask(m,f,mask,size);
  }

  var MASK_PATTERNS=[
    function(y,x){return(y+x)%2===0;},
    function(y,x){return y%2===0;},
    function(y,x){return x%3===0;},
    function(y,x){return(y+x)%3===0;},
    function(y,x){return(Math.floor(y/2)+Math.floor(x/3))%2===0;},
    function(y,x){return((y*x)%2)+((y*x))%3===0;},
    function(y,x){return(((y*x)%2)+(y+x)%3)%2===0;},
    function(y,x){return(((y+x)%2)+((y*x))%3)%2===0;}
  ];

  function applyMask(m,f,mask,size){
    var fn=MASK_PATTERNS[mask];
    for(var y=0;y<size;y++)for(var x=0;x<size;x++){
      if(!f[y][x]&&fn(y,x))m[y][x]=!m[y][x];
    }
  }

  function drawFormatInfo(m,f,ecl,mask,size){
    var data=(ecl<<3|mask);
    var rem=data<<10;
    for(var i=0;i<10;i++){rem=(rem<<1)^((rem>>>15)?0x537:0);}
    var bits=(data<<10|rem)^0x5412;
    for(var i=0;i<=5;i++){m[8][i]=((bits>>>i)&1)!==0;m[size-1-i][8]=((bits>>>(i+10))&1)!==0;}
    m[8][7]=((bits>>>6)&1)!==0;m[8][8]=((bits>>>7)&1)!==0;m[8][size-8]=((bits>>>8)&1)!==0;
    m[7][8]=((bits>>>9)&1)!==0;m[size-8][8]=((bits>>>15)&1)!==0;m[8][7]=((bits>>>6)&1)!==0;
  }

  function drawVersionInfo(m,f,ver,size){
    if(ver<7)return;
    var rem=ver;
    for(var i=0;i<12;i++){rem=(rem<<1)^((rem>>>11)?0x1F25:0);}
    var bits=ver<<12|rem;
    for(var i=0;i<18;i++){
      var bt=((bits>>>i)&1)!==0;
      var ci=Math.floor(i/3),ri=i%3;
      m[size-11+ri][ci]=bt;m[ci][size-11+ri]=bt;
    }
  }

  function findBestMask(matrices) {
    var bestScore = Infinity, bestIdx = 0;
    for (var i = 0; i < matrices.length; i++) {
      var score = calculatePenaltyScore(matrices[i]);
      if (score < bestScore) { bestScore = score; bestIdx = i; }
    }
    return bestIdx;
  }

  function calculatePenaltyScore(matrix) {
    var size = matrix.length, penalty = 0;
    for (var y = 0; y < size; y++) {
      var run = 1;
      for (var x = 1; x < size; x++, run++) {
        if (matrix[y][x] === matrix[y][x-1]) {
          if (run === 5) penalty += 3; else if (run > 5) penalty++;
        } else run = 1;
      }
    }
    for (var x = 0; x < size; x++) {
      var run = 1;
      for (var y = 1; y < size; y++, run++) {
        if (matrix[y][x] === matrix[y-1][x]) {
          if (run === 5) penalty += 3; else if (run > 5) penalty++;
        } else run = 1;
      }
    }
    for (var y = 0; y < size - 1; y++) {
      for (var x = 0; x < size - 1; x++) {
        if (matrix[y][x] &&
            matrix[y][x+1] && !matrix[y+1][x] && matrix[y+1][x+1])
          penalty += 3;
        if (!matrix[y][x] && matrix[y][x+1] &&
            matrix[y+1][x] && !matrix[y+1][x+1])
          penalty += 3;
      }
    }
    var darkRatio = 0, total = size*size;
    for (var y = 0; y < size; y++)
      for (var x = 0; x < size; x++)
        if (matrix[y][x]) darkRatio++;
    var ratio = Math.abs(darkRatio/total*20-10);
    penalty += ratio*10;
    return penalty;
  }

  function generate(text, ecl) {
    ecl = ecl || 'M';
    var eclIdx = EC_LEVELS[ecl];
    var data = encodeText(text, eclIdx);
    var ver = getVersionForCapacity(encodeText(text, eclIdx).length*8, eclIdx);
    data = encodeText(text, eclIdx);
    var matrices = [];
    for (var mask = 0; mask < 8; mask++)
      matrices.push(constructMatrix(data, ver, eclIdx, mask));
    var bestMask = findBestMask(matrices);
    return {modules:matrices[bestMask], version:ver, size:ver*4+17};
  }

  return { generate: generate };
})();

Page({
  data: {
    inputContent: '',
    showQRCode: false,
    canvasReady: false
  },

  onInput(e) {
    this.setData({ 
      inputContent: e.detail.value,
      showQRCode: false
    })
  },

  clearInput() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ 
      inputContent: '',
      showQRCode: false,
      canvasReady: false
    })
  },

  generateQRCode() {
    if (!this.data.inputContent.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    wx.vibrateShort({ type: 'medium' })
    
    this.setData({ showQRCode: true })

    setTimeout(() => {
      this.drawRealQRCode()
    }, 300)

    wx.showToast({ title: '生成成功', icon: 'success' })
  },

  drawRealQRCode() {
    const content = this.data.inputContent
    
    try {
      const qrResult = QRCode.generate(content, 'M')
      const modules = qrResult.modules
      const size = qrResult.size
      const ctx = wx.createCanvasContext('qrcodeCanvas', this)
      
      const margin = 12
      const canvasSize = 280
      const moduleSize = (canvasSize - margin * 2) / size
      
      ctx.clearRect(0, 0, canvasSize, canvasSize)
      ctx.setFillStyle('#FFFFFF')
      ctx.fillRect(0, 0, canvasSize, canvasSize)
      
      ctx.setFillStyle('#000000')
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (modules[row][col]) {
            ctx.fillRect(
              margin + col * moduleSize,
              margin + row * moduleSize,
              moduleSize,
              moduleSize
            )
          }
        }
      }
      
      ctx.draw(false, () => {
        this.setData({ canvasReady: true })
      })
    } catch (err) {
      console.error('[QRCode] 生成失败:', err)
      wx.showToast({ title: '生成失败，内容过长', icon: 'none' })
    }
  },

  saveToAlbum() {
    wx.vibrateShort({ type: 'light' })
    
    wx.canvasToTempFilePath({
      canvasId: 'qrcodeCanvas',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: () => {
            wx.showModal({
              title: '提示',
              content: '需要您授权保存到相册',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting()
                }
              }
            })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    }, this)
  },

  shareQRCode() {
    wx.vibrateShort({ type: 'light' })
    
    wx.showActionSheet({
      itemList: ['复制内容', '分享给朋友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: this.data.inputContent,
            success: () => wx.showToast({ title: '已复制', icon: 'success' })
          })
        } else {
          this.onShareAppMessage()
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '我的二维码',
      path: '/pages/tools/qrcode-generator/qrcode-generator'
    }
  },
  onShareTimeline() {
    return { title: '' }
  }
})
