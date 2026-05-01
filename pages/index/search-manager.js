/**
 * 搜索与过滤模块
 * 包含：拼音首字母映射、搜索历史、工具过滤等功能
 */

const pinyinMap = {
  'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
  'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p',
  'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x',
  'y': 'y', 'z': 'z',
  '阿': 'a', '爱': 'a', '安': 'a',
  '把': 'b', '百': 'b', '半': 'b', '本': 'b', '比': 'b', '变': 'b', '表': 'b', '别': 'b', '不': 'b',
  '查': 'c', '差': 'c', '产': 'c', '常': 'c', '成': 'c', '程': 'c', '尺': 'c', '冲': 'c', '处': 'c', '除': 'c', '测': 'c', '策': 'c', '存': 'c', '操': 'c',
  '大': 'd', '单': 'd', '当': 'd', '倒': 'd', '导': 'd', '得': 'd', '的': 'd', '地': 'd', '第': 'd', '典': 'd', '定': 'd', '丢': 'd', '度': 'd', '段': 'd', '短': 'd', '对': 'd', '达': 'd', '代': 'd', '二': 'e',
  '发': 'f', '法': 'f', '反': 'f', '范': 'f', '房': 'f', '费': 'f', '分': 'f', '份': 'f', '风': 'f', '复': 'f', '付': 'f', '负': 'f',
  '改': 'g', '概': 'g', '干': 'g', '刚': 'g', '高': 'g', '个': 'g', '格': 'g', '更': 'g', '工': 'g', '公': 'g', '功': 'g', '管': 'g', '规': 'g', '国': 'g', '过': 'g',
  '还': 'h', '海': 'h', '含': 'h', '行': 'h', '好': 'h', '号': 'h', '合': 'h', '和': 'h', '红': 'h', '后': 'h', '互': 'h', '划': 'h', '化': 'h', '换': 'h', '黄': 'h', '汇': 'h', '会': 'h', '混': 'h', '活': 'h', '或': 'h', '获': 'h', '喝': 'h', '黑': 'h', '恒': 'h',
  '机': 'j', '基': 'j', '及': 'j', '几': 'j', '计': 'j', '记': 'j', '际': 'j', '加': 'j', '家': 'j', '价': 'j', '检': 'j', '简': 'j', '建': 'j', '健': 'j', '将': 'j', '降': 'j', '交': 'j', '角': 'j', '教': 'j', '接': 'j', '结': 'j', '解': 'j', '界': 'j', '借': 'j', '今': 'j', '金': 'j', '紧': 'j', '进': 'j', '近': 'j', '经': 'j', '精': 'j', '警': 'j', '竞': 'j', '镜': 'j', '究': 'j', '九': 'j', '久': 'j', '旧': 'j', '局': 'j', '决': 'j', '觉': 'j', '绝': 'j', '具': 'j', '卷': 'j',
  '开': 'k', '看': 'k', '科': 'k', '可': 'k', '克': 'k', '客': 'k', '空': 'k', '控': 'k', '口': 'k', '快': 'k', '宽': 'k', '框': 'k',
  '拉': 'l', '来': 'l', '蓝': 'l', '朗': 'l', '类': 'l', '累': 'l', '离': 'l', '理': 'l', '历': 'l', '立': 'l', '利': 'l', '力': 'l', '例': 'l', '连': 'l', '联': 'l', '两': 'l', '量': 'l', '聊': 'l', '列': 'l', '临': 'l', '龄': 'l', '领': 'l', '另': 'l', '流': 'l', '录': 'l', '乱': 'l', '率': 'l', '滤': 'l', '轮': 'l', '逻': 'l', '落': 'l', '垃': 'l', '栏': 'l', '楼': 'l',
  '码': 'm', '买': 'm', '满': 'm', '漫': 'm', '猫': 'm', '冒': 'm', '贸': 'm', '眉': 'm', '每': 'm', '美': 'm', '门': 'm', '米': 'm', '密': 'm', '面': 'm', '民': 'm', '名': 'm', '明': 'm', '命': 'm', '模': 'm', '末': 'm', '目': 'm', '默': 'm',
  '那': 'n', '内': 'n', '纳': 'n', '能': 'n', '年': 'n', '念': 'n', '农': 'n', '浓': 'n', '暖': 'n',
  '欧': 'o', '偶': 'o',
  '排': 'p', '判': 'p', '旁': 'p', '跑': 'p', '配': 'p', '批': 'p', '片': 'p', '偏': 'p', '拼': 'p', '频': 'p', '评': 'p', '屏': 'p', '平': 'p', '凭': 'p',
  '期': 'q', '齐': 'q', '其': 'q', '棋': 'q', '启': 'q', '气': 'q', '千': 'q', '签': 'q', '前': 'q', '钱': 'q', '强': 'q', '切': 'q', '清': 'q', '情': 'q', '请': 'q', '秋': 'q', '求': 'q', '区': 'q', '取': 'q', '趣': 'q', '去': 'q', '圈': 'q', '全': 'q', '权': 'q', '确': 'q',
  '然': 'r', '让': 'r', '热': 'r', '人': 'r', '认': 'r', '任': 'r', '日': 'r', '容': 'r', '入': 'r', '软': 'r',
  '三': 's', '散': 's', '扫': 's', '色': 's', '删': 's', '上': 's', '少': 's', '设': 's', '深': 's', '审': 's', '生': 's', '失': 's', '时': 's', '实': 't', '识': 's', '世': 's', '式': 's', '示': 's', '事': 's', '是': 's', '手': 's', '首': 's', '受': 's', '数': 's', '刷': 's', '双': 's', '水': 's', '顺': 's', '说': 's', '搜': 's', '速': 's', '随': 's', '碎': 's', '算': 's', '虽': 's', '缩': 's', '锁': 's',
  '他': 't', '台': 't', '谈': 't', '弹': 't', '特': 't', '提': 't', '天': 't', '填': 't', '条': 't', '贴': 't', '铁': 't', '通': 't', '同': 't', '统': 't', '头': 't', '图': 't', '突': 't', '团': 't', '退': 't', '拖': 't',
  '外': 'w', '完': 'w', '网': 'w', '危': 'w', '维': 'w', '围': 'w', '位': 'w', '文': 'w', '稳': 'w', '问': 'w', '卧': 'w', '无': 'w', '五': 'w', '物': 'w',
  '下': 'x', '先': 'x', '显': 'x', '现': 'x', '线': 'x', '限': 'x', '相': 'x', '向': 'x', '项': 'x', '消': 'x', '小': 'x', '效': 'x', '些': 'x', '协': 'x', '信': 'x', '星': 'x', '行': 'x', '修': 'x', '秀': 'x', '虚': 'x', '需': 'x', '序': 'x', '选': 'x', '学': 'x', '雪': 'x', '寻': 'x', '循': 'x', '验': 'x', '响': 'x', '像': 'x', '享': 'x', '心': 'x', '新': 'x', '醒': 'x', '详': 'x', '降': 'x', '写': 'x',
  '颜': 'y', '羊': 'y', '阳': 'y', '样': 'y', '摇': 'y', '要': 'y', '也': 'y', '一': 'y', '以': 'y', '易': 'y', '意': 'y', '因': 'y', '引': 'y', '应': 'y', '映': 'y', '拥': 'y', '永': 'y', '用': 'y', '优': 'y', '由': 'y', '邮': 'y', '有': 'y', '右': 'y', '于': 'y', '余': 'y', '与': 'y', '预': 'y', '域': 'y', '员': 'y', '原': 'y', '源': 'y', '远': 'y', '愿': 'y', '月': 'y', '阅': 'y', '越': 'y', '云': 'y', '允': 'y', '运': 'y', '韵': 'y', '压': 'y', '亚': 'y', '严': 'y', '眼': 'y', '演': 'y', '养': 'y', '页': 'y', '依': 'y', '移': 'y', '已': 'y', '益': 'y', '义': 'y', '音': 'y', '阴': 'y', '银': 'y', '印': 'y', '英': 'y', '迎': 'y', '盈': 'y', '影': 'y', '硬': 'y', '勇': 'y', '悠': 'y', '油': 'y', '游': 'y', '友': 'y', '又': 'y', '幼': 'y', '鱼': 'y', '愉': 'y', '渔': 'y', '予': 'y', '宇': 'y', '羽': 'y', '雨': 'y', '语': 'y', '玉': 'y', '育': 'y', '浴': 'y', '蚌': 'y', '御': 'y', '优': 'y', '遇': 'y', '誉': 'y', '愈': 'y', '欲': 'y', '圆': 'y', '缘': 'y', '日': 'y', '约': 'y', '跃': 'y', '钥': 'y', '岳': 'y', '悦': 'y', '均': 'y', '蕴': 'y',
  '在': 'z', '咱': 'z', '杂': 'z', '灾': 'z', '载': 'z', '暂': 'z', '赞': 'z', '脏': 'z', '郭': 'z', '早': 'z', '造': 'z', '噪': 'z', '责': 'z', '择': 'z', '则': 'z', '泽': 'z', '贼': 'z', '怎': 'z', '增': 'z', '赠': 'z', '扎': 'z', '眨': 'z', '占': 'z', '展': 'z', '站': 'z', '张': 'z', '掌': 'z', '丈': 'z', '帐': 'z', '账': 'z', '障': 'z', '招': 'z', '找': 'z', '照': 'z', '罩': 'z', '折': 'z', '哲': 'z', '者': 'z', '这': 'z', '浙': 'z', '针': 'z', '侦': 'z', '真': 'z', '诊': 'z', '枕': 'z', '阵': 'z', '振': 'z', '镇': 'z', '震': 'z', '争': 'z', '征': 'z', '整': 'z', '正': 'z', '证': 'z', '政': 'z', '症': 'z', '之': 'z', '支': 'z', '知': 'z', '织': 'z', '脂': 'z', '执': 'z', '值': 'z', '职': 'z', '直': 'z', '植': 'z', '殖': 'z', '止': 'z', '旨': 'z', '指': 'z', '纸': 'z', '至': 'z', '志': 'z', '制': 'z', '质': 'z', '治': 'z', '秩': 'z', '智': 'z', '置': 'z', '中': 'zh', '忠': 'zh', '钟': 'zh', '终': 'zh', '种': 'zh', '众': 'zh', '周': 'zhou', '洲': 'z', '粥': 'z', '轴': 'z', '肘': 'z', '皱': 'z', '竹': 'z', '筑': 'z', '主': 'z', '煮': 'z', '嘱': 'z', '住': 'z', '注': 'z', '驻': 'z', '柱': 'z', '助': 'z', '筑': 'z', '祝': 'z', '著': 'z', '抓': 'z', '拽': 'z', '专': 'z', '转': 'z', '赚': 'z', '庄': 'z', '装': 'z', '壮': 'z', '状': 'z', '撞': 'z', '追': 'z', '准': 'z', '捕': 'z', '桌': 'z', '着': 'z', '兹': 'z', '资': 'z', '姿': 'z', '滋': 'z', '粒': 'z', '子': 'z', '字': 'z', '自': 'z', '宗': 'z', '综': 'z', '总': 'z', '纵': 'z'
}

function getPinyinFirstLetter(str) {
  if (!str) return ''
  const firstChar = str.charAt(0).toLowerCase()
  return pinyinMap[firstChar] || firstChar
}

module.exports = {
  getPinyinFirstLetter,

  addToSearchHistory(keyword) {
    if (!keyword.trim()) return
    let history = wx.getStorageSync('searchHistory') || []
    history = history.filter(item => item !== keyword)
    history.unshift(keyword)
    if (history.length > 10) history = history.slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    this.setData({ searchHistory: history })
  },

  clearSearchHistory() {
    wx.showModal({
      title: '清空搜索历史',
      content: '确定要清空所有搜索历史吗？',
      confirmText: '清空',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({ searchHistory: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  onHotSearchClick(e) {
    const keyword = e.currentTarget.dataset.word
    this.setData({ searchKeyword: keyword })
    this.addToSearchHistory(keyword)
    this.filterTools()
  },

  onHistoryClick(e) {
    const keyword = e.currentTarget.dataset.word
    this.setData({ searchKeyword: keyword })
    this.filterTools()
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })
    this.filterTools()
  },

  clearSearch() {
    this.setData({ searchKeyword: '', showSearchPanel: false })
    this.filterTools()
  },

  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ currentCategory: categoryId, showSearchPanel: false })
    this.filterTools()
  },

  onSearchFocus() {
    this.setData({ showSearchPanel: true })
  },

  onSearchBlur() {
    setTimeout(() => {
      this.setData({ showSearchPanel: false })
    }, 200)
  },

  filterTools() {
    let filtered = [...this.data.tools]

    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === this.data.currentCategory)
    }

    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      const pinyinKeyword = getPinyinFirstLetter(keyword)

      filtered = filtered.filter(tool => {
        const nameMatch = tool.name.toLowerCase().indexOf(keyword) > -1
        const descMatch = tool.description.toLowerCase().indexOf(keyword) > -1
        const pinyinMatch = getPinyinFirstLetter(tool.name).toLowerCase().indexOf(pinyinKeyword) > -1

        return nameMatch || descMatch || pinyinMatch
      })

      this.addToSearchHistory(this.data.searchKeyword)
    }

    this.setData({ filteredTools: filtered })
  }
}
