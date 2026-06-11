var pinyinMap = {
  'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
  'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p',
  'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
  'y': 'y', 'z': 'z',
  '阿': 'a', '爱': 'ai', '安': 'an',
  '把': 'ba', '百': 'bai', '半': 'ban', '本': 'ben', '比': 'bi', '变': 'bian', '表': 'biao', '别': 'bie', '不': 'bu', '班': 'ban', '版': 'ban', '包': 'bao', '备': 'bei', '编': 'bian', '标': 'biao', '宾': 'bin', '播': 'bo', '补': 'bu',
  '查': 'cha', '差': 'cha', '产': 'chan', '常': 'chang', '成': 'cheng', '程': 'cheng', '尺': 'chi', '冲': 'chong', '处': 'chu', '除': 'chu', '测': 'ce', '策': 'ce', '存': 'cun', '操': 'cao', '城': 'cheng', '持': 'chi', '创': 'chuang', '催': 'cui',
  '大': 'da', '单': 'dan', '当': 'dang', '倒': 'dao', '导': 'dao', '得': 'de', '的': 'de', '地': 'di', '第': 'di', '典': 'dian', '定': 'ding', '丢': 'diu', '度': 'du', '段': 'duan', '短': 'duan', '对': 'dui', '达': 'da', '代': 'dai', '二': 'er', '打': 'da', '带': 'dai', '待': 'dai', '弹': 'dan', '倒': 'dao', '等': 'deng', '低': 'di', '点': 'dian', '电': 'dian', '调': 'diao', '顶': 'ding', '动': 'dong', '读': 'du', '多': 'duo',
  '发': 'fa', '法': 'fa', '反': 'fan', '范': 'fan', '房': 'fang', '费': 'fei', '分': 'fen', '份': 'fen', '风': 'feng', '复': 'fu', '付': 'fu', '负': 'fu', '翻': 'fan', '方': 'fang', '非': 'fei', '封': 'feng', '符': 'fu',
  '改': 'gai', '概': 'gai', '干': 'gan', '刚': 'gang', '高': 'gao', '个': 'ge', '格': 'ge', '更': 'geng', '工': 'gong', '公': 'gong', '功': 'gong', '管': 'guan', '规': 'gui', '国': 'guo', '过': 'guo', '感': 'gan', '给': 'gei', '关': 'guan', '光': 'guang', '广': 'guang', '归': 'gui',
  '还': 'hai', '海': 'hai', '含': 'han', '行': 'hang', '好': 'hao', '号': 'hao', '合': 'he', '和': 'he', '红': 'hong', '后': 'hou', '互': 'hu', '划': 'hua', '化': 'hua', '换': 'huan', '黄': 'huang', '汇': 'hui', '会': 'hui', '混': 'hun', '活': 'huo', '或': 'huo', '获': 'huo', '喝': 'he', '黑': 'hei', '恒': 'heng', '回': 'hui', '环': 'huan', '灰': 'hui', '婚': 'hun',
  '机': 'ji', '基': 'ji', '及': 'ji', '几': 'ji', '计': 'ji', '记': 'ji', '际': 'ji', '加': 'jia', '家': 'jia', '价': 'jia', '检': 'jian', '简': 'jian', '建': 'jian', '健': 'jian', '将': 'jiang', '降': 'jiang', '交': 'jiao', '角': 'jiao', '教': 'jiao', '接': 'jie', '结': 'jie', '解': 'jie', '界': 'jie', '借': 'jie', '今': 'jin', '金': 'jin', '紧': 'jin', '进': 'jin', '近': 'jin', '经': 'jing', '精': 'jing', '警': 'jing', '竞': 'jing', '镜': 'jing', '究': 'jiu', '九': 'jiu', '久': 'jiu', '旧': 'jiu', '局': 'ju', '决': 'jue', '觉': 'jue', '绝': 'jue', '具': 'ju', '卷': 'juan', '级': 'ji', '集': 'ji', '积': 'ji', '技': 'ji', '季': 'ji', '济': 'ji', '寄': 'ji', '加': 'jia', '减': 'jian', '剪': 'jian', '见': 'jian', '间': 'jian', '渐': 'jian', '箭': 'jian', '奖': 'jiang', '讲': 'jiang', '酱': 'jiang', '交': 'jiao', '较': 'jiao', '阶': 'jie', '节': 'jie', '截': 'jie', '仅': 'jin', '禁': 'jin', '景': 'jing', '净': 'jing', '静': 'jing', '纠': 'jiu', '就': 'jiu', '居': 'ju', '举': 'ju', '据': 'ju', '距': 'ju', '剧': 'ju',
  '开': 'kai', '看': 'kan', '科': 'ke', '可': 'ke', '克': 'ke', '客': 'ke', '空': 'kong', '控': 'kong', '口': 'kou', '快': 'kuai', '宽': 'kuan', '框': 'kuang', '卡': 'ka', '考': 'kao', '课': 'ke', '块': 'kuai', '款': 'kuan',
  '拉': 'la', '来': 'lai', '蓝': 'lan', '朗': 'lang', '类': 'lei', '累': 'lei', '离': 'li', '理': 'li', '历': 'li', '立': 'li', '利': 'li', '力': 'li', '例': 'li', '连': 'lian', '联': 'lian', '两': 'liang', '量': 'liang', '聊': 'liao', '列': 'lie', '临': 'lin', '龄': 'ling', '领': 'ling', '另': 'ling', '流': 'liu', '录': 'lu', '乱': 'luan', '率': 'lv', '滤': 'lv', '轮': 'lun', '逻': 'luo', '落': 'luo', '垃': 'la', '栏': 'lan', '楼': 'lou', '乐': 'le', '冷': 'leng', '里': 'li', '礼': 'li', '亮': 'liang', '零': 'ling', '留': 'liu', '路': 'lu', '绿': 'lv', '乱': 'luan',
  '码': 'ma', '买': 'mai', '满': 'man', '漫': 'man', '猫': 'mao', '冒': 'mao', '贸': 'mao', '眉': 'mei', '每': 'mei', '美': 'mei', '门': 'men', '米': 'mi', '密': 'mi', '面': 'mian', '民': 'min', '名': 'ming', '明': 'ming', '命': 'ming', '模': 'mo', '末': 'mo', '目': 'mu', '默': 'mo', '妈': 'ma', '慢': 'man', '忙': 'mang', '毛': 'mao', '没': 'mei', '描': 'miao', '秒': 'miao', '摸': 'mo', '魔': 'mo', '某': 'mou',
  '那': 'na', '内': 'nei', '纳': 'na', '能': 'neng', '年': 'nian', '念': 'nian', '农': 'nong', '浓': 'nong', '暖': 'nuan', '男': 'nan', '南': 'nan', '难': 'nan', '脑': 'nao', '你': 'ni', '逆': 'ni', '宁': 'ning', '女': 'nv',
  '欧': 'ou', '偶': 'ou',
  '排': 'pai', '判': 'pan', '旁': 'pang', '跑': 'pao', '配': 'pei', '批': 'pi', '片': 'pian', '偏': 'pian', '拼': 'pin', '频': 'pin', '评': 'ping', '屏': 'ping', '平': 'ping', '凭': 'ping', '盘': 'pan', '炮': 'pao', '朋': 'peng', '票': 'piao', '品': 'pin', '破': 'po',
  '期': 'qi', '齐': 'qi', '其': 'qi', '棋': 'qi', '启': 'qi', '气': 'qi', '千': 'qian', '签': 'qian', '前': 'qian', '钱': 'qian', '强': 'qiang', '切': 'qie', '清': 'qing', '情': 'qing', '请': 'qing', '秋': 'qiu', '求': 'qiu', '区': 'qu', '取': 'qu', '趣': 'qu', '去': 'qu', '圈': 'quan', '全': 'quan', '权': 'quan', '确': 'que', '七': 'qi', '奇': 'qi', '起': 'qi', '器': 'qi', '亲': 'qin', '轻': 'qing', '庆': 'qing', '穷': 'qiong', '群': 'qun',
  '然': 'ran', '让': 'rang', '热': 're', '人': 'ren', '认': 'ren', '任': 'ren', '日': 'ri', '容': 'rong', '入': 'ru', '软': 'ruan', '仍': 'reng', '如': 'ru', '弱': 'ruo',
  '三': 'san', '散': 'san', '扫': 'sao', '色': 'se', '删': 'shan', '上': 'shang', '少': 'shao', '设': 'she', '深': 'shen', '审': 'shen', '生': 'sheng', '失': 'shi', '时': 'shi', '实': 'shi', '识': 'shi', '世': 'shi', '式': 'shi', '示': 'shi', '事': 'shi', '是': 'shi', '手': 'shou', '首': 'shou', '受': 'shou', '数': 'shu', '刷': 'shua', '双': 'shuang', '水': 'shui', '顺': 'shun', '说': 'shuo', '搜': 'sou', '速': 'su', '随': 'sui', '碎': 'sui', '算': 'suan', '虽': 'sui', '缩': 'suo', '锁': 'suo', '四': 'si', '似': 'si', '松': 'song', '送': 'song', '素': 'su', '俗': 'su', '算': 'suan',
  '他': 'ta', '台': 'tai', '谈': 'tan', '弹': 'tan', '特': 'te', '提': 'ti', '天': 'tian', '填': 'tian', '条': 'tiao', '贴': 'tie', '铁': 'tie', '通': 'tong', '同': 'tong', '统': 'tong', '头': 'tou', '图': 'tu', '突': 'tu', '团': 'tuan', '退': 'tui', '拖': 'tuo', '太': 'tai', '探': 'tan', '逃': 'tao', '套': 'tao', '体': 'ti', '跳': 'tiao', '听': 'ting', '停': 'ting', '推': 'tui', '脱': 'tuo',
  '外': 'wai', '完': 'wan', '网': 'wang', '危': 'wei', '维': 'wei', '围': 'wei', '位': 'wei', '文': 'wen', '稳': 'wen', '问': 'wen', '卧': 'wo', '无': 'wu', '五': 'wu', '物': 'wu', '万': 'wan', '王': 'wang', '望': 'wang', '微': 'wei', '为': 'wei', '未': 'wei', '温': 'wen', '我': 'wo', '误': 'wu',
  '下': 'xia', '先': 'xian', '显': 'xian', '现': 'xian', '线': 'xian', '限': 'xian', '相': 'xiang', '向': 'xiang', '项': 'xiang', '消': 'xiao', '小': 'xiao', '效': 'xiao', '些': 'xie', '协': 'xie', '信': 'xin', '星': 'xing', '行': 'xing', '修': 'xiu', '秀': 'xiu', '虚': 'xu', '需': 'xu', '序': 'xu', '选': 'xuan', '学': 'xue', '雪': 'xue', '寻': 'xun', '循': 'xun', '验': 'yan', '响': 'xiang', '像': 'xiang', '享': 'xiang', '心': 'xin', '新': 'xin', '醒': 'xing', '详': 'xiang', '降': 'xiang', '写': 'xie', '西': 'xi', '系': 'xi', '喜': 'xi', '戏': 'xi', '细': 'xi', '夏': 'xia', '鲜': 'xian', '想': 'xiang', '笑': 'xiao', '校': 'xiao', '谢': 'xie', '辛': 'xin', '兴': 'xing', '型': 'xing', '修': 'xiu', '许': 'xu', '续': 'xu', '宣': 'xuan',
  '颜': 'yan', '羊': 'yang', '阳': 'yang', '样': 'yang', '摇': 'yao', '要': 'yao', '也': 'ye', '一': 'yi', '以': 'yi', '易': 'yi', '意': 'yi', '因': 'yin', '引': 'yin', '应': 'ying', '映': 'ying', '拥': 'yong', '永': 'yong', '用': 'yong', '优': 'you', '由': 'you', '邮': 'you', '有': 'you', '右': 'you', '于': 'yu', '余': 'yu', '与': 'yu', '预': 'yu', '域': 'yu', '员': 'yuan', '原': 'yuan', '源': 'yuan', '远': 'yuan', '愿': 'yuan', '月': 'yue', '阅': 'yue', '越': 'yue', '云': 'yun', '允': 'yun', '运': 'yun', '韵': 'yun', '压': 'ya', '亚': 'ya', '严': 'yan', '眼': 'yan', '演': 'yan', '养': 'yang', '页': 'ye', '依': 'yi', '移': 'yi', '已': 'yi', '益': 'yi', '义': 'yi', '音': 'yin', '阴': 'yin', '银': 'yin', '印': 'yin', '英': 'ying', '迎': 'ying', '盈': 'ying', '影': 'ying', '硬': 'ying', '勇': 'yong', '悠': 'you', '油': 'you', '游': 'you', '友': 'you', '又': 'you', '幼': 'you', '鱼': 'yu', '愉': 'yu', '渔': 'yu', '予': 'yu', '宇': 'yu', '羽': 'yu', '雨': 'yu', '语': 'yu', '玉': 'yu', '育': 'yu', '浴': 'yu', '御': 'yu', '遇': 'yu', '誉': 'yu', '愈': 'yu', '欲': 'yu', '圆': 'yuan', '缘': 'yuan', '约': 'yue', '跃': 'yue', '钥': 'yue', '岳': 'yue', '悦': 'yue', '均': 'yun', '蕴': 'yun', '言': 'yan', '盐': 'yan', '延': 'yan', '岩': 'yan', '沿': 'yan', '炎': 'yan', '研': 'yan', '盐': 'yan', '颜': 'yan', '掩': 'yan', '眼': 'yan', '验': 'yan', '央': 'yang', '扬': 'yang', '羊': 'yang', '仰': 'yang', '氧': 'yang', '样': 'yang', '腰': 'yao', '咬': 'yao', '药': 'yao', '钥': 'yao', '耀': 'yao', '爷': 'ye', '野': 'ye', '业': 'ye', '叶': 'ye', '夜': 'ye', '液': 'ye', '仪': 'yi', '宜': 'yi', '姨': 'yi', '遗': 'yi', '疑': 'yi', '乙': 'yi', '忆': 'yi', '译': 'yi', '异': 'yi', '役': 'yi', '抑': 'yi', '疫': 'yi', '溢': 'yi', '姻': 'yin', '银': 'yin', '饮': 'yin', '隐': 'yin', '樱': 'ying', '营': 'ying', '赢': 'ying', '拥': 'yong', '涌': 'yong', '涌': 'yong', '踊': 'yong', '优': 'you', '忧': 'you', '幽': 'you', '犹': 'you', '油': 'you', '游': 'you', '诱': 'you', '舆': 'yu', '屿': 'yu', '冤': 'yuan', '园': 'yuan', '援': 'yuan', '院': 'yuan', '怨': 'yuan', '曰': 'yue', '晕': 'yun',
  '在': 'zai', '咱': 'zan', '杂': 'za', '灾': 'zai', '载': 'zai', '暂': 'zan', '赞': 'zan', '脏': 'zang', '郭': 'guo', '早': 'zao', '造': 'zao', '噪': 'zao', '责': 'ze', '择': 'ze', '则': 'ze', '泽': 'ze', '贼': 'zei', '怎': 'zen', '增': 'zeng', '赠': 'zeng', '扎': 'zha', '眨': 'zha', '占': 'zhan', '展': 'zhan', '站': 'zhan', '张': 'zhang', '掌': 'zhang', '丈': 'zhang', '帐': 'zhang', '账': 'zhang', '障': 'zhang', '招': 'zhao', '找': 'zhao', '照': 'zhao', '罩': 'zhao', '折': 'zhe', '哲': 'zhe', '者': 'zhe', '这': 'zhe', '浙': 'zhe', '针': 'zhen', '侦': 'zhen', '真': 'zhen', '诊': 'zhen', '枕': 'zhen', '阵': 'zhen', '振': 'zhen', '镇': 'zhen', '震': 'zhen', '争': 'zheng', '征': 'zheng', '整': 'zheng', '正': 'zheng', '证': 'zheng', '政': 'zheng', '症': 'zheng', '之': 'zhi', '支': 'zhi', '知': 'zhi', '织': 'zhi', '脂': 'zhi', '执': 'zhi', '值': 'zhi', '职': 'zhi', '直': 'zhi', '植': 'zhi', '殖': 'zhi', '止': 'zhi', '旨': 'zhi', '指': 'zhi', '纸': 'zhi', '至': 'zhi', '志': 'zhi', '制': 'zhi', '质': 'zhi', '治': 'zhi', '秩': 'zhi', '智': 'zhi', '置': 'zhi', '中': 'zhong', '忠': 'zhong', '钟': 'zhong', '终': 'zhong', '种': 'zhong', '众': 'zhong', '周': 'zhou', '洲': 'zhou', '粥': 'zhou', '轴': 'zhou', '肘': 'zhou', '皱': 'zhou', '竹': 'zhu', '筑': 'zhu', '主': 'zhu', '煮': 'zhu', '嘱': 'zhu', '住': 'zhu', '注': 'zhu', '驻': 'zhu', '柱': 'zhu', '助': 'zhu', '祝': 'zhu', '著': 'zhu', '抓': 'zhua', '拽': 'zhuai', '专': 'zhuan', '转': 'zhuan', '赚': 'zhuan', '庄': 'zhuang', '装': 'zhuang', '壮': 'zhuang', '状': 'zhuang', '撞': 'zhuang', '追': 'zhui', '准': 'zhun', '捕': 'bu', '桌': 'zhuo', '着': 'zhe', '兹': 'zi', '资': 'zi', '姿': 'zi', '滋': 'zi', '粒': 'li', '子': 'zi', '字': 'zi', '自': 'zi', '宗': 'zong', '综': 'zong', '总': 'zong', '纵': 'zong', '组': 'zu', '嘴': 'zui', '最': 'zui', '罪': 'zui', '尊': 'zun', '左': 'zuo', '做': 'zuo', '座': 'zuo'
}

function getPinyinFirstLetter(str) {
  if (!str) return ''
  var firstChar = str.charAt(0).toLowerCase()
  return pinyinMap[firstChar] ? pinyinMap[firstChar].charAt(0) : firstChar
}

function getFullPinyin(str) {
  if (!str) return ''
  var result = ''
  for (var i = 0; i < str.length; i++) {
    var ch = str.charAt(i)
    var py = pinyinMap[ch]
    if (py) {
      result += py
    } else if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z') {
      result += ch.toLowerCase()
    } else if (ch >= '0' && ch <= '9') {
      result += ch
    }
  }
  return result
}

function getPinyinInitials(str) {
  if (!str) return ''
  var result = ''
  for (var i = 0; i < str.length; i++) {
    var ch = str.charAt(i)
    var py = pinyinMap[ch]
    if (py) {
      result += py.charAt(0)
    } else if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z') {
      result += ch.toLowerCase()
    }
  }
  return result
}

function fuzzyMatch(source, keyword) {
  if (!source || !keyword) return false
  var s = source.toLowerCase()
  var k = keyword.toLowerCase()
  if (s.indexOf(k) > -1) return true
  var fullPinyin = getFullPinyin(source)
  if (fullPinyin.indexOf(k) > -1) return true
  var initials = getPinyinInitials(source)
  if (initials.indexOf(k) > -1) return true
  return false
}

function highlightText(text, keyword, isDarkMode) {
  if (!text || !keyword) return [{ type: 'text', text: text || '' }]
  var lowerText = text.toLowerCase()
  var lowerKeyword = keyword.toLowerCase()
  var highlightColor = isDarkMode ? '#60A5FA' : '#3B82F6'
  var highlightBg = isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(59,130,246,0.1)'
  var highlightStyle = 'color:' + highlightColor + ';font-weight:700;background:' + highlightBg + ';border-radius:3px;padding:0 2px;'

  var pos = lowerText.indexOf(lowerKeyword)
  if (pos > -1) {
    var nodes = []
    if (pos > 0) nodes.push({ type: 'text', text: text.substring(0, pos) })
    nodes.push({ name: 'span', attrs: { style: highlightStyle }, children: [{ type: 'text', text: text.substring(pos, pos + keyword.length) }] })
    if (pos + keyword.length < text.length) nodes.push({ type: 'text', text: text.substring(pos + keyword.length) })
    return nodes
  }

  var fullPinyin = getFullPinyin(text)
  var pinyinPos = fullPinyin.toLowerCase().indexOf(lowerKeyword)
  if (pinyinPos > -1) {
    var startChar = 0
    var endChar = text.length
    var pinyinOffset = 0
    for (var i = 0; i < text.length; i++) {
      var py = pinyinMap[text.charAt(i)]
      var pyLen = py ? py.length : 1
      if (pinyinOffset <= pinyinPos && pinyinOffset + pyLen > pinyinPos) {
        startChar = i
      }
      if (pinyinOffset < pinyinPos + keyword.length && pinyinOffset + pyLen >= pinyinPos + keyword.length) {
        endChar = i + 1
        break
      }
      pinyinOffset += pyLen
    }
    var nodes = []
    if (startChar > 0) nodes.push({ type: 'text', text: text.substring(0, startChar) })
    nodes.push({ name: 'span', attrs: { style: highlightStyle }, children: [{ type: 'text', text: text.substring(startChar, endChar) }] })
    if (endChar < text.length) nodes.push({ type: 'text', text: text.substring(endChar) })
    return nodes
  }

  var initials = getPinyinInitials(text)
  var initialsPos = initials.toLowerCase().indexOf(lowerKeyword)
  if (initialsPos > -1) {
    var positions = []
    for (var j = 0; j < text.length; j++) {
      var ch = text.charAt(j)
      var py2 = pinyinMap[ch]
      if (py2 || ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z') {
        positions.push(j)
      }
    }
    if (initialsPos + lowerKeyword.length <= positions.length) {
      var startIdx = positions[initialsPos]
      var endIdx = positions[initialsPos + lowerKeyword.length - 1] + 1
      if (startIdx !== undefined && endIdx !== undefined) {
        var nodes = []
        if (startIdx > 0) nodes.push({ type: 'text', text: text.substring(0, startIdx) })
        nodes.push({ name: 'span', attrs: { style: highlightStyle }, children: [{ type: 'text', text: text.substring(startIdx, endIdx) }] })
        if (endIdx < text.length) nodes.push({ type: 'text', text: text.substring(endIdx) })
        return nodes
      }
    }
  }

  return [{ type: 'text', text: text }]
}

module.exports = {
  getPinyinFirstLetter: getPinyinFirstLetter,
  getFullPinyin: getFullPinyin,
  getPinyinInitials: getPinyinInitials,
  fuzzyMatch: fuzzyMatch,
  highlightText: highlightText
}
