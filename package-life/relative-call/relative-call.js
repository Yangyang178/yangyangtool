var storageUtil = require('../../utils/storage.js')
var toolActions = require('../utils/tool-actions.js')
var poster = require('../utils/poster.js')
var i18n = require('../../utils/i18n.js')
var app = getApp()

var relationMap = {
  "f": { title: "父亲", pinyin: "fù qīn", call: "爸爸", desc: "自己的父亲" },
  "m": { title: "母亲", pinyin: "mǔ qīn", call: "妈妈", desc: "自己的母亲" },
  "ob": { title: "哥哥", pinyin: "gē ge", call: "哥", desc: "比自己年长的同辈男性" },
  "lb": { title: "弟弟", pinyin: "dì di", call: "弟", desc: "比自己年幼的同辈男性" },
  "os": { title: "姐姐", pinyin: "jiě jie", call: "姐", desc: "比自己年长的同辈女性" },
  "ls": { title: "妹妹", pinyin: "mèi mei", call: "妹", desc: "比自己年幼的同辈女性" },
  "f,f": { title: "爷爷", pinyin: "yé ye", call: "爷爷", desc: "父亲的父亲" },
  "f,m": { title: "奶奶", pinyin: "nǎi nai", call: "奶奶", desc: "父亲的母亲" },
  "m,f": { title: "外公", pinyin: "wài gōng", call: "外公", desc: "母亲的父亲" },
  "m,m": { title: "外婆", pinyin: "wài pó", call: "外婆", desc: "母亲的母亲" },
  "f,ob": { title: "伯父", pinyin: "bó fù", call: "伯伯", desc: "父亲的哥哥" },
  "f,lb": { title: "叔叔", pinyin: "shū shu", call: "叔叔", desc: "父亲的弟弟" },
  "f,os": { title: "姑姑", pinyin: "gū gu", call: "姑姑", desc: "父亲的姐姐" },
  "f,ls": { title: "姑姑", pinyin: "gū gu", call: "姑姑", desc: "父亲的妹妹" },
  "m,ob": { title: "舅舅", pinyin: "jiù jiu", call: "舅舅", desc: "母亲的哥哥" },
  "m,lb": { title: "舅舅", pinyin: "jiù jiu", call: "舅舅", desc: "母亲的弟弟" },
  "m,os": { title: "姨妈", pinyin: "yí mā", call: "姨妈", desc: "母亲的姐姐" },
  "m,ls": { title: "姨妈", pinyin: "yí mā", call: "姨妈", desc: "母亲的妹妹" },
  "ob,sp": { title: "嫂子", pinyin: "sǎo zi", call: "嫂子", desc: "哥哥的妻子" },
  "lb,sp": { title: "弟妹", pinyin: "dì mèi", call: "弟妹", desc: "弟弟的妻子" },
  "os,sp": { title: "姐夫", pinyin: "jiě fu", call: "姐夫", desc: "姐姐的丈夫" },
  "ls,sp": { title: "妹夫", pinyin: "mèi fu", call: "妹夫", desc: "妹妹的丈夫" },
  "f,f,f": { title: "曾祖父", pinyin: "zēng zǔ fù", call: "太爷爷", desc: "爷爷的父亲" },
  "f,f,m": { title: "曾祖母", pinyin: "zēng zǔ mǔ", call: "太奶奶", desc: "爷爷的母亲" },
  "m,f,f": { title: "外曾祖父", pinyin: "wài zēng zǔ fù", call: "太外公", desc: "外公的父亲" },
  "m,f,m": { title: "外曾祖母", pinyin: "wài zēng zǔ mǔ", call: "太外婆", desc: "外公的母亲" },
  "m,m,f": { title: "外曾外祖父", pinyin: "wài zēng wài zǔ fù", call: "太外公", desc: "外婆的父亲" },
  "m,m,m": { title: "外曾外祖母", pinyin: "wài zēng wài zǔ mǔ", call: "太外婆", desc: "外婆的母亲" },
  "f,ob,sp": { title: "伯母", pinyin: "bó mǔ", call: "伯母", desc: "伯父的妻子" },
  "f,lb,sp": { title: "婶婶", pinyin: "shěn shen", call: "婶婶", desc: "叔叔的妻子" },
  "f,os,sp": { title: "姑父", pinyin: "gū fu", call: "姑父", desc: "姑姑的丈夫" },
  "f,ls,sp": { title: "姑父", pinyin: "gū fu", call: "姑父", desc: "姑姑的丈夫" },
  "m,ob,sp": { title: "舅妈", pinyin: "jiù mā", call: "舅妈", desc: "舅舅的妻子" },
  "m,lb,sp": { title: "舅妈", pinyin: "jiù mā", call: "舅妈", desc: "舅舅的妻子" },
  "m,os,sp": { title: "姨父", pinyin: "yí fu", call: "姨父", desc: "姨妈的丈夫" },
  "m,ls,sp": { title: "姨父", pinyin: "yí fu", call: "姨父", desc: "姨妈的丈夫" },
  "f,f,ob": { title: "伯公", pinyin: "bó gōng", call: "伯公", desc: "爷爷的哥哥" },
  "f,f,lb": { title: "叔公", pinyin: "shū gōng", call: "叔公", desc: "爷爷的弟弟" },
  "f,f,os": { title: "姑婆", pinyin: "gū pó", call: "姑婆", desc: "爷爷的姐妹" },
  "f,f,ls": { title: "姑婆", pinyin: "gū pó", call: "姑婆", desc: "爷爷的姐妹" },
  "f,m,ob": { title: "舅公", pinyin: "jiù gōng", call: "舅公", desc: "奶奶的兄弟" },
  "f,m,lb": { title: "舅公", pinyin: "jiù gōng", call: "舅公", desc: "奶奶的兄弟" },
  "f,m,os": { title: "姨婆", pinyin: "yí pó", call: "姨婆", desc: "奶奶的姐妹" },
  "f,m,ls": { title: "姨婆", pinyin: "yí pó", call: "姨婆", desc: "奶奶的姐妹" },
  "m,f,ob": { title: "舅公", pinyin: "jiù gōng", call: "舅公", desc: "外公的兄弟" },
  "m,f,lb": { title: "舅公", pinyin: "jiù gōng", call: "舅公", desc: "外公的兄弟" },
  "m,f,os": { title: "姨婆", pinyin: "yí pó", call: "姨婆", desc: "外公的姐妹" },
  "m,f,ls": { title: "姨婆", pinyin: "yí pó", call: "姨婆", desc: "外公的妹妹" },
  "m,m,ob": { title: "舅公", pinyin: "jiù gōng", call: "舅公", desc: "外婆的兄弟" },
  "m,m,lb": { title: "舅公", pinyin: "jiù gōng", call: "舅公", desc: "外婆的兄弟" },
  "m,m,os": { title: "姨婆", pinyin: "yí pó", call: "姨婆", desc: "外婆的姐妹" },
  "m,m,ls": { title: "姨婆", pinyin: "yí pó", call: "姨婆", desc: "外婆的姐妹" },
  "f,f,ob,sp": { title: "伯婆", pinyin: "bó pó", call: "伯婆", desc: "伯公的妻子" },
  "f,f,lb,sp": { title: "婶婆", pinyin: "shěn pó", call: "婶婆", desc: "叔公的妻子" },
  "f,m,ob,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅婆", desc: "舅公的妻子" },
  "f,m,lb,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅婆", desc: "舅公的妻子" },
  "f,m,os,sp": { title: "姨公", pinyin: "yí gōng", call: "姨公", desc: "姨婆的丈夫" },
  "f,m,ls,sp": { title: "姨公", pinyin: "yí gōng", call: "姨公", desc: "姨婆的丈夫" },
  "f,f,os,sp": { title: "姑公", pinyin: "gū gōng", call: "姑公", desc: "姑婆的丈夫" },
  "f,f,ls,sp": { title: "姑公", pinyin: "gū gōng", call: "姑公", desc: "姑婆的丈夫" },
  "m,f,ob,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅婆", desc: "舅公的妻子" },
  "m,f,lb,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅婆", desc: "舅公的妻子" },
  "m,f,os,sp": { title: "姨公", pinyin: "yí gōng", call: "姨公", desc: "姨婆的丈夫" },
  "m,f,ls,sp": { title: "姨公", pinyin: "yí gōng", call: "姨公", desc: "姨婆的丈夫" },
  "m,m,ob,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅婆", desc: "舅公的妻子" },
  "m,m,lb,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅婆", desc: "舅公的妻子" },
  "m,m,os,sp": { title: "姨公", pinyin: "yí gōng", call: "姨公", desc: "姨婆的丈夫" },
  "m,m,ls,sp": { title: "姨公", pinyin: "yí gōng", call: "姨公", desc: "姨婆的丈夫" },
  "s": { title: "儿子", pinyin: "ér zi", call: "儿子", desc: "自己的儿子" },
  "d": { title: "女儿", pinyin: "nǚ ér", call: "女儿", desc: "自己的女儿" },
  "s,sp": { title: "儿媳", pinyin: "ér xí", call: "儿媳", desc: "儿子的妻子" },
  "d,sp": { title: "女婿", pinyin: "nǚ xù", call: "女婿", desc: "女儿的丈夫" },
  "s,s": { title: "孙子", pinyin: "sūn zi", call: "孙子", desc: "儿子的儿子" },
  "s,d": { title: "孙女", pinyin: "sūn nǚ", call: "孙女", desc: "儿子的女儿" },
  "d,s": { title: "外孙", pinyin: "wài sūn", call: "外孙", desc: "女儿的儿子" },
  "d,d": { title: "外孙女", pinyin: "wài sūn nǚ", call: "外孙女", desc: "女儿的女儿" },
  "s,s,s": { title: "曾孙", pinyin: "zēng sūn", call: "曾孙", desc: "孙子的儿子" },
  "s,s,d": { title: "曾孙女", pinyin: "zēng sūn nǚ", call: "曾孙女", desc: "孙子的女儿" },
  "s,d,s": { title: "曾外孙", pinyin: "zēng wài sūn", call: "曾外孙", desc: "孙女的儿子" },
  "s,d,d": { title: "曾外孙女", pinyin: "zēng wài sūn nǚ", call: "曾外孙女", desc: "孙女的女儿" },
  "d,s,s": { title: "外曾孙", pinyin: "wài zēng sūn", call: "外曾孙", desc: "外孙的儿子" },
  "d,s,d": { title: "外曾孙女", pinyin: "wài zēng sūn nǚ", call: "外曾孙女", desc: "外孙的女儿" },
  "d,d,s": { title: "外曾外孙", pinyin: "wài zēng wài sūn", call: "外曾外孙", desc: "外孙女的儿子" },
  "d,d,d": { title: "外曾外孙女", pinyin: "wài zēng wài sūn nǚ", call: "外曾外孙女", desc: "外孙女的女儿" },
  "s,s,sp": { title: "孙媳", pinyin: "sūn xí", call: "孙媳", desc: "孙子的妻子" },
  "s,d,sp": { title: "孙女婿", pinyin: "sūn nǚ xù", call: "孙女婿", desc: "孙女的丈夫" },
  "d,s,sp": { title: "外孙媳", pinyin: "wài sūn xí", call: "外孙媳", desc: "外孙的妻子" },
  "d,d,sp": { title: "外孙女婿", pinyin: "wài sūn nǚ xù", call: "外孙女婿", desc: "外孙女的丈夫" },
  "ob,s": { title: "侄子", pinyin: "zhí zi", call: "侄子", desc: "哥哥的儿子" },
  "ob,d": { title: "侄女", pinyin: "zhí nǚ", call: "侄女", desc: "哥哥的女儿" },
  "lb,s": { title: "侄子", pinyin: "zhí zi", call: "侄子", desc: "弟弟的儿子" },
  "lb,d": { title: "侄女", pinyin: "zhí nǚ", call: "侄女", desc: "弟弟的女儿" },
  "os,s": { title: "外甥", pinyin: "wài shēng", call: "外甥", desc: "姐姐的儿子" },
  "os,d": { title: "外甥女", pinyin: "wài shēng nǚ", call: "外甥女", desc: "姐姐的女儿" },
  "ls,s": { title: "外甥", pinyin: "wài shēng", call: "外甥", desc: "妹妹的儿子" },
  "ls,d": { title: "外甥女", pinyin: "wài shēng nǚ", call: "外甥女", desc: "妹妹的女儿" },
  "ob,s,sp": { title: "侄媳", pinyin: "zhí xí", call: "侄媳", desc: "哥哥儿子的妻子" },
  "ob,d,sp": { title: "侄女婿", pinyin: "zhí nǚ xù", call: "侄女婿", desc: "哥哥女儿的丈夫" },
  "lb,s,sp": { title: "侄媳", pinyin: "zhí xí", call: "侄媳", desc: "弟弟儿子的妻子" },
  "lb,d,sp": { title: "侄女婿", pinyin: "zhí nǚ xù", call: "侄女婿", desc: "弟弟女儿的丈夫" },
  "os,s,sp": { title: "外甥媳", pinyin: "wài shēng xí", call: "外甥媳", desc: "姐姐儿子的妻子" },
  "os,d,sp": { title: "外甥女婿", pinyin: "wài shēng nǚ xù", call: "外甥女婿", desc: "姐姐女儿的丈夫" },
  "ls,s,sp": { title: "外甥媳", pinyin: "wài shēng xí", call: "外甥媳", desc: "妹妹儿子的妻子" },
  "ls,d,sp": { title: "外甥女婿", pinyin: "wài shēng nǚ xù", call: "外甥女婿", desc: "妹妹女儿的丈夫" },
  "ob,s,s": { title: "侄孙", pinyin: "zhí sūn", call: "侄孙", desc: "侄子的儿子" },
  "ob,s,d": { title: "侄孙女", pinyin: "zhí sūn nǚ", call: "侄孙女", desc: "侄子的女儿" },
  "ob,d,s": { title: "侄外孙", pinyin: "zhí wài sūn", call: "侄外孙", desc: "侄女的儿子" },
  "ob,d,d": { title: "侄外孙女", pinyin: "zhí wài sūn nǚ", call: "侄外孙女", desc: "侄女的女儿" },
  "lb,s,s": { title: "侄孙", pinyin: "zhí sūn", call: "侄孙", desc: "侄子的儿子" },
  "lb,s,d": { title: "侄孙女", pinyin: "zhí sūn nǚ", call: "侄孙女", desc: "侄子的女儿" },
  "lb,d,s": { title: "侄外孙", pinyin: "zhí wài sūn", call: "侄外孙", desc: "侄女的儿子" },
  "lb,d,d": { title: "侄外孙女", pinyin: "zhí wài sūn nǚ", call: "侄外孙女", desc: "侄女的女儿" },
  "os,s,s": { title: "外甥孙", pinyin: "wài shēng sūn", call: "外甥孙", desc: "外甥的儿子" },
  "os,s,d": { title: "外甥孙女", pinyin: "wài shēng sūn nǚ", call: "外甥孙女", desc: "外甥的女儿" },
  "os,d,s": { title: "外甥外孙", pinyin: "wài shēng wài sūn", call: "外甥外孙", desc: "外甥女的儿子" },
  "os,d,d": { title: "外甥外孙女", pinyin: "wài shēng wài sūn nǚ", call: "外甥外孙女", desc: "外甥女的女儿" },
  "ls,s,s": { title: "外甥孙", pinyin: "wài shēng sūn", call: "外甥孙", desc: "外甥的儿子" },
  "ls,s,d": { title: "外甥孙女", pinyin: "wài shēng sūn nǚ", call: "外甥孙女", desc: "外甥的女儿" },
  "ls,d,s": { title: "外甥外孙", pinyin: "wài shēng wài sūn", call: "外甥外孙", desc: "外甥女的儿子" },
  "ls,d,d": { title: "外甥外孙女", pinyin: "wài shēng wài sūn nǚ", call: "外甥外孙女", desc: "外甥女的女儿" },
  "f,ob,s": { title: "堂兄", pinyin: "táng xiōng", call: "堂哥", desc: "伯父的儿子（年长）" },
  "f,ob,d": { title: "堂姐", pinyin: "táng jiě", call: "堂姐", desc: "伯父的女儿（年长）" },
  "f,lb,s": { title: "堂弟", pinyin: "táng dì", call: "堂弟", desc: "叔叔的儿子（年幼）" },
  "f,lb,d": { title: "堂妹", pinyin: "táng mèi", call: "堂妹", desc: "叔叔的女儿（年幼）" },
  "f,os,s": { title: "表哥", pinyin: "biǎo gē", call: "表哥", desc: "姑姑的儿子（年长）" },
  "f,os,d": { title: "表姐", pinyin: "biǎo jiě", call: "表姐", desc: "姑姑的女儿（年长）" },
  "f,ls,s": { title: "表弟", pinyin: "biǎo dì", call: "表弟", desc: "姑姑的儿子（年幼）" },
  "f,ls,d": { title: "表妹", pinyin: "biǎo mèi", call: "表妹", desc: "姑姑的女儿（年幼）" },
  "m,ob,s": { title: "表哥", pinyin: "biǎo gē", call: "表哥", desc: "舅舅的儿子（年长）" },
  "m,ob,d": { title: "表姐", pinyin: "biǎo jiě", call: "表姐", desc: "舅舅的女儿（年长）" },
  "m,lb,s": { title: "表弟", pinyin: "biǎo dì", call: "表弟", desc: "舅舅的儿子（年幼）" },
  "m,lb,d": { title: "表妹", pinyin: "biǎo mèi", call: "表妹", desc: "舅舅的女儿（年幼）" },
  "m,os,s": { title: "表哥", pinyin: "biǎo gē", call: "表哥", desc: "姨妈的儿子（年长）" },
  "m,os,d": { title: "表姐", pinyin: "biǎo jiě", call: "表姐", desc: "姨妈的女儿（年长）" },
  "m,ls,s": { title: "表弟", pinyin: "biǎo dì", call: "表弟", desc: "姨妈的儿子（年幼）" },
  "m,ls,d": { title: "表妹", pinyin: "biǎo mèi", call: "表妹", desc: "姨妈的女儿（年幼）" },
  "f,ob,s,sp": { title: "堂嫂", pinyin: "táng sǎo", call: "堂嫂", desc: "堂兄的妻子" },
  "f,ob,d,sp": { title: "堂姐夫", pinyin: "táng jiě fu", call: "堂姐夫", desc: "堂姐的丈夫" },
  "f,lb,s,sp": { title: "堂弟妹", pinyin: "táng dì mèi", call: "堂弟妹", desc: "堂弟的妻子" },
  "f,lb,d,sp": { title: "堂妹夫", pinyin: "táng mèi fu", call: "堂妹夫", desc: "堂妹的丈夫" },
  "f,os,s,sp": { title: "表嫂", pinyin: "biǎo sǎo", call: "表嫂", desc: "表哥的妻子" },
  "f,os,d,sp": { title: "表姐夫", pinyin: "biǎo jiě fu", call: "表姐夫", desc: "表姐的丈夫" },
  "f,ls,s,sp": { title: "表弟妹", pinyin: "biǎo dì mèi", call: "表弟妹", desc: "表弟的妻子" },
  "f,ls,d,sp": { title: "表妹夫", pinyin: "biǎo mèi fu", call: "表妹夫", desc: "表妹的丈夫" },
  "m,ob,s,sp": { title: "表嫂", pinyin: "biǎo sǎo", call: "表嫂", desc: "表哥的妻子" },
  "m,ob,d,sp": { title: "表姐夫", pinyin: "biǎo jiě fu", call: "表姐夫", desc: "表姐的丈夫" },
  "m,lb,s,sp": { title: "表弟妹", pinyin: "biǎo dì mèi", call: "表弟妹", desc: "表弟的妻子" },
  "m,lb,d,sp": { title: "表妹夫", pinyin: "biǎo mèi fu", call: "表妹夫", desc: "表妹的丈夫" },
  "m,os,s,sp": { title: "表嫂", pinyin: "biǎo sǎo", call: "表嫂", desc: "表哥的妻子" },
  "m,os,d,sp": { title: "表姐夫", pinyin: "biǎo jiě fu", call: "表姐夫", desc: "表姐的丈夫" },
  "m,ls,s,sp": { title: "表弟妹", pinyin: "biǎo dì mèi", call: "表弟妹", desc: "表弟的妻子" },
  "m,ls,d,sp": { title: "表妹夫", pinyin: "biǎo mèi fu", call: "表妹夫", desc: "表妹的丈夫" },
  "f,ob,s,s": { title: "堂侄", pinyin: "táng zhí", call: "堂侄", desc: "堂兄的儿子" },
  "f,ob,s,d": { title: "堂侄女", pinyin: "táng zhí nǚ", call: "堂侄女", desc: "堂兄的女儿" },
  "f,ob,d,s": { title: "堂外甥", pinyin: "táng wài shēng", call: "堂外甥", desc: "堂姐的儿子" },
  "f,ob,d,d": { title: "堂外甥女", pinyin: "táng wài shēng nǚ", call: "堂外甥女", desc: "堂姐的女儿" },
  "f,lb,s,s": { title: "堂侄", pinyin: "táng zhí", call: "堂侄", desc: "堂弟的儿子" },
  "f,lb,s,d": { title: "堂侄女", pinyin: "táng zhí nǚ", call: "堂侄女", desc: "堂弟的女儿" },
  "f,lb,d,s": { title: "堂外甥", pinyin: "táng wài shēng", call: "堂外甥", desc: "堂妹的儿子" },
  "f,lb,d,d": { title: "堂外甥女", pinyin: "táng wài shēng nǚ", call: "堂外甥女", desc: "堂妹的女儿" },
  "f,os,s,s": { title: "表侄", pinyin: "biǎo zhí", call: "表侄", desc: "表哥的儿子" },
  "f,os,s,d": { title: "表侄女", pinyin: "biǎo zhí nǚ", call: "表侄女", desc: "表哥的女儿" },
  "f,os,d,s": { title: "表外甥", pinyin: "biǎo wài shēng", call: "表外甥", desc: "表姐的儿子" },
  "f,os,d,d": { title: "表外甥女", pinyin: "biǎo wài shēng nǚ", call: "表外甥女", desc: "表姐的女儿" },
  "f,ls,s,s": { title: "表侄", pinyin: "biǎo zhí", call: "表侄", desc: "表弟的儿子" },
  "f,ls,s,d": { title: "表侄女", pinyin: "biǎo zhí nǚ", call: "表侄女", desc: "表弟的女儿" },
  "f,ls,d,s": { title: "表外甥", pinyin: "biǎo wài shēng", call: "表外甥", desc: "表妹的儿子" },
  "f,ls,d,d": { title: "表外甥女", pinyin: "biǎo wài shēng nǚ", call: "表外甥女", desc: "表妹的女儿" },
  "m,ob,s,s": { title: "表侄", pinyin: "biǎo zhí", call: "表侄", desc: "表哥的儿子" },
  "m,ob,s,d": { title: "表侄女", pinyin: "biǎo zhí nǚ", call: "表侄女", desc: "表哥的女儿" },
  "m,ob,d,s": { title: "表外甥", pinyin: "biǎo wài shēng", call: "表外甥", desc: "表姐的儿子" },
  "m,ob,d,d": { title: "表外甥女", pinyin: "biǎo wài shēng nǚ", call: "表外甥女", desc: "表姐的女儿" },
  "m,lb,s,s": { title: "表侄", pinyin: "biǎo zhí", call: "表侄", desc: "表弟的儿子" },
  "m,lb,s,d": { title: "表侄女", pinyin: "biǎo zhí nǚ", call: "表侄女", desc: "表弟的女儿" },
  "m,lb,d,s": { title: "表外甥", pinyin: "biǎo wài shēng", call: "表外甥", desc: "表妹的儿子" },
  "m,lb,d,d": { title: "表外甥女", pinyin: "biǎo wài shēng nǚ", call: "表外甥女", desc: "表妹的女儿" },
  "m,os,s,s": { title: "表侄", pinyin: "biǎo zhí", call: "表侄", desc: "表哥的儿子" },
  "m,os,s,d": { title: "表侄女", pinyin: "biǎo zhí nǚ", call: "表侄女", desc: "表哥的女儿" },
  "m,os,d,s": { title: "表外甥", pinyin: "biǎo wài shēng", call: "表外甥", desc: "表姐的儿子" },
  "m,os,d,d": { title: "表外甥女", pinyin: "biǎo wài shēng nǚ", call: "表外甥女", desc: "表姐的女儿" },
  "m,ls,s,s": { title: "表侄", pinyin: "biǎo zhí", call: "表侄", desc: "表弟的儿子" },
  "m,ls,s,d": { title: "表侄女", pinyin: "biǎo zhí nǚ", call: "表侄女", desc: "表弟的女儿" },
  "m,ls,d,s": { title: "表外甥", pinyin: "biǎo wài shēng", call: "表外甥", desc: "表妹的儿子" },
  "m,ls,d,d": { title: "表外甥女", pinyin: "biǎo wài shēng nǚ", call: "表外甥女", desc: "表妹的女儿" },
  "f,f,ob,s": { title: "堂伯", pinyin: "táng bó", call: "堂伯", desc: "伯公的儿子，父亲的堂兄" },
  "f,f,ob,d": { title: "堂姑", pinyin: "táng gū", call: "堂姑", desc: "伯公的女儿，父亲的堂姐" },
  "f,f,lb,s": { title: "堂叔", pinyin: "táng shū", call: "堂叔", desc: "叔公的儿子，父亲的堂弟" },
  "f,f,lb,d": { title: "堂姑", pinyin: "táng gū", call: "堂姑", desc: "叔公的女儿，父亲的堂妹" },
  "f,f,os,s": { title: "表伯", pinyin: "biǎo bó", call: "表伯", desc: "姑婆的儿子，父亲的表兄" },
  "f,f,os,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "姑婆的女儿，父亲的表姐" },
  "f,f,ls,s": { title: "表叔", pinyin: "biǎo shū", call: "表叔", desc: "姑婆的儿子，父亲的表弟" },
  "f,f,ls,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "姑婆的女儿，父亲的表妹" },
  "f,m,ob,s": { title: "表伯", pinyin: "biǎo bó", call: "表伯", desc: "舅公的儿子，父亲的表兄" },
  "f,m,ob,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "舅公的女儿，父亲的表姐" },
  "f,m,lb,s": { title: "表叔", pinyin: "biǎo shū", call: "表叔", desc: "舅公的儿子，父亲的表弟" },
  "f,m,lb,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "舅公的女儿，父亲的表妹" },
  "f,m,os,s": { title: "表伯", pinyin: "biǎo bó", call: "表伯", desc: "姨婆的儿子，父亲的表兄" },
  "f,m,os,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "姨婆的女儿，父亲的表姐" },
  "f,m,ls,s": { title: "表叔", pinyin: "biǎo shū", call: "表叔", desc: "姨婆的儿子，父亲的表弟" },
  "f,m,ls,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "姨婆的女儿，父亲的表妹" },
  "m,f,ob,s": { title: "表伯", pinyin: "biǎo bó", call: "表伯", desc: "外公兄弟的儿子，母亲的表兄" },
  "m,f,ob,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外公兄弟的女儿，母亲的表姐" },
  "m,f,lb,s": { title: "表叔", pinyin: "biǎo shū", call: "表叔", desc: "外公兄弟的儿子，母亲的表弟" },
  "m,f,lb,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外公兄弟的女儿，母亲的表妹" },
  "m,f,os,s": { title: "表伯", pinyin: "biǎo bó", call: "表伯", desc: "外公姐妹的儿子，母亲的表兄" },
  "m,f,os,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外公姐妹的女儿，母亲的表姐" },
  "m,f,ls,s": { title: "表叔", pinyin: "biǎo shū", call: "表叔", desc: "外公姐妹的儿子，母亲的表弟" },
  "m,f,ls,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外公姐妹的女儿，母亲的表妹" },
  "m,m,ob,s": { title: "表伯", pinyin: "biǎo bó", call: "表伯", desc: "外婆兄弟的儿子，母亲的表兄" },
  "m,m,ob,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外婆兄弟的女儿，母亲的表姐" },
  "m,m,lb,s": { title: "表叔", pinyin: "biǎo shū", call: "表叔", desc: "外婆兄弟的儿子，母亲的表弟" },
  "m,m,lb,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外婆兄弟的女儿，母亲的表妹" },
  "m,m,os,s": { title: "表伯", pinyin: "biǎo bó", call: "表伯", desc: "外婆姐妹的儿子，母亲的表兄" },
  "m,m,os,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外婆姐妹的女儿，母亲的表姐" },
  "m,m,ls,s": { title: "表叔", pinyin: "biǎo shū", call: "表叔", desc: "外婆姐妹的儿子，母亲的表弟" },
  "m,m,ls,d": { title: "表姑", pinyin: "biǎo gū", call: "表姑", desc: "外婆姐妹的女儿，母亲的表妹" },
  "f,f,ob,s,sp": { title: "堂伯母", pinyin: "táng bó mǔ", call: "堂伯母", desc: "堂伯的妻子" },
  "f,f,ob,d,sp": { title: "堂姑父", pinyin: "táng gū fu", call: "堂姑父", desc: "堂姑的丈夫" },
  "f,f,lb,s,sp": { title: "堂婶", pinyin: "táng shěn", call: "堂婶", desc: "堂叔的妻子" },
  "f,f,lb,d,sp": { title: "堂姑父", pinyin: "táng gū fu", call: "堂姑父", desc: "堂姑的丈夫" },
  "f,f,os,s,sp": { title: "表伯母", pinyin: "biǎo bó mǔ", call: "表伯母", desc: "表伯的妻子" },
  "f,f,os,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "f,f,ls,s,sp": { title: "表婶", pinyin: "biǎo shěn", call: "表婶", desc: "表叔的妻子" },
  "f,f,ls,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "f,m,ob,s,sp": { title: "表伯母", pinyin: "biǎo bó mǔ", call: "表伯母", desc: "表伯的妻子" },
  "f,m,ob,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "f,m,lb,s,sp": { title: "表婶", pinyin: "biǎo shěn", call: "表婶", desc: "表叔的妻子" },
  "f,m,lb,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "f,m,os,s,sp": { title: "表伯母", pinyin: "biǎo bó mǔ", call: "表伯母", desc: "表伯的妻子" },
  "f,m,os,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "f,m,ls,s,sp": { title: "表婶", pinyin: "biǎo shěn", call: "表婶", desc: "表叔的妻子" },
  "f,m,ls,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,f,ob,s,sp": { title: "表伯母", pinyin: "biǎo bó mǔ", call: "表伯母", desc: "表伯的妻子" },
  "m,f,ob,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,f,lb,s,sp": { title: "表婶", pinyin: "biǎo shěn", call: "表婶", desc: "表叔的妻子" },
  "m,f,lb,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,f,os,s,sp": { title: "表伯母", pinyin: "biǎo bó mǔ", call: "表伯母", desc: "表伯的妻子" },
  "m,f,os,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,f,ls,s,sp": { title: "表婶", pinyin: "biǎo shěn", call: "表婶", desc: "表叔的妻子" },
  "m,f,ls,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,m,ob,s,sp": { title: "表伯母", pinyin: "biǎo bó mǔ", call: "表伯母", desc: "表伯的妻子" },
  "m,m,ob,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,m,lb,s,sp": { title: "表婶", pinyin: "biǎo shěn", call: "表婶", desc: "表叔的妻子" },
  "m,m,lb,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,m,os,s,sp": { title: "表伯母", pinyin: "biǎo bó mǔ", call: "表伯母", desc: "表伯的妻子" },
  "m,m,os,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "m,m,ls,s,sp": { title: "表婶", pinyin: "biǎo shěn", call: "表婶", desc: "表叔的妻子" },
  "m,m,ls,d,sp": { title: "表姑父", pinyin: "biǎo gū fu", call: "表姑父", desc: "表姑的丈夫" },
  "f,f,ob,s,s": { title: "再从兄", pinyin: "zài cóng xiōng", call: "堂哥", desc: "堂伯的儿子" },
  "f,f,ob,s,d": { title: "再从姐", pinyin: "zài cóng jiě", call: "堂姐", desc: "堂伯的女儿" },
  "f,f,ob,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "堂姑的儿子" },
  "f,f,ob,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "堂姑的女儿" },
  "f,f,lb,s,s": { title: "再从弟", pinyin: "zài cóng dì", call: "堂弟", desc: "堂叔的儿子" },
  "f,f,lb,s,d": { title: "再从妹", pinyin: "zài cóng mèi", call: "堂妹", desc: "堂叔的女儿" },
  "f,f,lb,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "堂姑的儿子" },
  "f,f,lb,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "堂姑的女儿" },
  "f,f,os,s,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "表伯的儿子" },
  "f,f,os,s,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "表伯的女儿" },
  "f,f,os,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "表姑的儿子" },
  "f,f,os,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "表姑的女儿" },
  "f,f,ls,s,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "表叔的儿子" },
  "f,f,ls,s,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "表叔的女儿" },
  "f,f,ls,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "表姑的儿子" },
  "f,f,ls,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "表姑的女儿" },
  "f,m,ob,s,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "表伯的儿子" },
  "f,m,ob,s,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "表伯的女儿" },
  "f,m,ob,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "表姑的儿子" },
  "f,m,ob,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "表姑的女儿" },
  "f,m,lb,s,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "表叔的儿子" },
  "f,m,lb,s,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "表叔的女儿" },
  "f,m,lb,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "表姑的儿子" },
  "f,m,lb,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "表姑的女儿" },
  "f,m,os,s,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "姨婆方表伯的儿子" },
  "f,m,os,s,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "姨婆方表伯的女儿" },
  "f,m,os,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "姨婆方表姑的儿子" },
  "f,m,os,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "姨婆方表姑的女儿" },
  "f,m,ls,s,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "姨婆方表叔的儿子" },
  "f,m,ls,s,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "姨婆方表叔的女儿" },
  "f,m,ls,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "姨婆方表姑的儿子" },
  "f,m,ls,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "姨婆方表姑的女儿" },
  "m,f,ob,s,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外公方表伯的儿子" },
  "m,f,ob,s,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外公方表伯的女儿" },
  "m,f,ob,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外公方表姑的儿子" },
  "m,f,ob,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外公方表姑的女儿" },
  "m,f,lb,s,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外公方表叔的儿子" },
  "m,f,lb,s,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外公方表叔的女儿" },
  "m,f,lb,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外公方表姑的儿子" },
  "m,f,lb,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外公方表姑的女儿" },
  "m,f,os,s,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外公方表伯的儿子" },
  "m,f,os,s,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外公方表伯的女儿" },
  "m,f,os,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外公方表姑的儿子" },
  "m,f,os,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外公方表姑的女儿" },
  "m,f,ls,s,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外公方表叔的儿子" },
  "m,f,ls,s,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外公方表叔的女儿" },
  "m,f,ls,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外公方表姑的儿子" },
  "m,f,ls,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外公方表姑的女儿" },
  "m,m,ob,s,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外婆方表伯的儿子" },
  "m,m,ob,s,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外婆方表伯的女儿" },
  "m,m,ob,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外婆方表姑的儿子" },
  "m,m,ob,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外婆方表姑的女儿" },
  "m,m,lb,s,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外婆方表叔的儿子" },
  "m,m,lb,s,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外婆方表叔的女儿" },
  "m,m,lb,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外婆方表姑的儿子" },
  "m,m,lb,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外婆方表姑的女儿" },
  "m,m,os,s,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外婆方表伯的儿子" },
  "m,m,os,s,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外婆方表伯的女儿" },
  "m,m,os,d,s": { title: "从表兄", pinyin: "cóng biǎo xiōng", call: "表哥", desc: "外婆方表姑的儿子" },
  "m,m,os,d,d": { title: "从表姐", pinyin: "cóng biǎo jiě", call: "表姐", desc: "外婆方表姑的女儿" },
  "m,m,ls,s,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外婆方表叔的儿子" },
  "m,m,ls,s,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外婆方表叔的女儿" },
  "m,m,ls,d,s": { title: "从表弟", pinyin: "cóng biǎo dì", call: "表弟", desc: "外婆方表姑的儿子" },
  "m,m,ls,d,d": { title: "从表妹", pinyin: "cóng biǎo mèi", call: "表妹", desc: "外婆方表姑的女儿" }
}

var relationMapEn = {
  "f": { title: "Father", pinyin: "", call: "Dad", desc: "One's father" },
  "m": { title: "Mother", pinyin: "", call: "Mom", desc: "One's mother" },
  "ob": { title: "Older Brother", pinyin: "", call: "Brother", desc: "Male sibling older than oneself" },
  "lb": { title: "Younger Brother", pinyin: "", call: "Brother", desc: "Male sibling younger than oneself" },
  "os": { title: "Older Sister", pinyin: "", call: "Sister", desc: "Female sibling older than oneself" },
  "ls": { title: "Younger Sister", pinyin: "", call: "Sister", desc: "Female sibling younger than oneself" },
  "f,f": { title: "Paternal Grandfather", pinyin: "", call: "Grandpa", desc: "Father's father" },
  "f,m": { title: "Paternal Grandmother", pinyin: "", call: "Grandma", desc: "Father's mother" },
  "m,f": { title: "Maternal Grandfather", pinyin: "", call: "Grandpa", desc: "Mother's father" },
  "m,m": { title: "Maternal Grandmother", pinyin: "", call: "Grandma", desc: "Mother's mother" },
  "f,ob": { title: "Uncle (Paternal, Older)", pinyin: "", call: "Uncle", desc: "Father's older brother" },
  "f,lb": { title: "Uncle (Paternal, Younger)", pinyin: "", call: "Uncle", desc: "Father's younger brother" },
  "f,os": { title: "Aunt (Paternal, Older)", pinyin: "", call: "Aunt", desc: "Father's older sister" },
  "f,ls": { title: "Aunt (Paternal, Younger)", pinyin: "", call: "Aunt", desc: "Father's younger sister" },
  "m,ob": { title: "Uncle (Maternal, Older)", pinyin: "", call: "Uncle", desc: "Mother's older brother" },
  "m,lb": { title: "Uncle (Maternal, Younger)", pinyin: "", call: "Uncle", desc: "Mother's younger brother" },
  "m,os": { title: "Aunt (Maternal, Older)", pinyin: "", call: "Aunt", desc: "Mother's older sister" },
  "m,ls": { title: "Aunt (Maternal, Younger)", pinyin: "", call: "Aunt", desc: "Mother's younger sister" },
  "ob,sp": { title: "Sister-in-law", pinyin: "", call: "Sister-in-law", desc: "Older brother's wife" },
  "lb,sp": { title: "Sister-in-law", pinyin: "", call: "Sister-in-law", desc: "Younger brother's wife" },
  "os,sp": { title: "Brother-in-law", pinyin: "", call: "Brother-in-law", desc: "Older sister's husband" },
  "ls,sp": { title: "Brother-in-law", pinyin: "", call: "Brother-in-law", desc: "Younger sister's husband" },
  "f,f,f": { title: "Great-grandfather (Paternal)", pinyin: "", call: "Great-grandpa", desc: "Paternal grandfather's father" },
  "f,f,m": { title: "Great-grandmother (Paternal)", pinyin: "", call: "Great-grandma", desc: "Paternal grandfather's mother" },
  "m,f,f": { title: "Great-grandfather (Maternal)", pinyin: "", call: "Great-grandpa", desc: "Maternal grandfather's father" },
  "m,f,m": { title: "Great-grandmother (Maternal)", pinyin: "", call: "Great-grandma", desc: "Maternal grandfather's mother" },
  "m,m,f": { title: "Great-grandfather (Maternal Grandmother's Side)", pinyin: "", call: "Great-grandpa", desc: "Maternal grandmother's father" },
  "m,m,m": { title: "Great-grandmother (Maternal Grandmother's Side)", pinyin: "", call: "Great-grandma", desc: "Maternal grandmother's mother" },
  "f,ob,sp": { title: "Aunt (Paternal Uncle's Wife)", pinyin: "", call: "Aunt", desc: "Father's older brother's wife" },
  "f,lb,sp": { title: "Aunt (Paternal Uncle's Wife)", pinyin: "", call: "Aunt", desc: "Father's younger brother's wife" },
  "f,os,sp": { title: "Uncle (Paternal Aunt's Husband)", pinyin: "", call: "Uncle", desc: "Father's older sister's husband" },
  "f,ls,sp": { title: "Uncle (Paternal Aunt's Husband)", pinyin: "", call: "Uncle", desc: "Father's younger sister's husband" },
  "m,ob,sp": { title: "Aunt (Maternal Uncle's Wife)", pinyin: "", call: "Aunt", desc: "Mother's older brother's wife" },
  "m,lb,sp": { title: "Aunt (Maternal Uncle's Wife)", pinyin: "", call: "Aunt", desc: "Mother's younger brother's wife" },
  "m,os,sp": { title: "Uncle (Maternal Aunt's Husband)", pinyin: "", call: "Uncle", desc: "Mother's older sister's husband" },
  "m,ls,sp": { title: "Uncle (Maternal Aunt's Husband)", pinyin: "", call: "Uncle", desc: "Mother's younger sister's husband" },
  "f,f,ob": { title: "Great-uncle (Paternal, Older)", pinyin: "", call: "Great-uncle", desc: "Paternal grandfather's older brother" },
  "f,f,lb": { title: "Great-uncle (Paternal, Younger)", pinyin: "", call: "Great-uncle", desc: "Paternal grandfather's younger brother" },
  "f,f,os": { title: "Great-aunt (Paternal)", pinyin: "", call: "Great-aunt", desc: "Paternal grandfather's sister" },
  "f,f,ls": { title: "Great-aunt (Paternal)", pinyin: "", call: "Great-aunt", desc: "Paternal grandfather's sister" },
  "f,m,ob": { title: "Great-uncle (Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Paternal grandmother's brother" },
  "f,m,lb": { title: "Great-uncle (Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Paternal grandmother's brother" },
  "f,m,os": { title: "Great-aunt (Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Paternal grandmother's sister" },
  "f,m,ls": { title: "Great-aunt (Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Paternal grandmother's sister" },
  "m,f,ob": { title: "Great-uncle (Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Maternal grandfather's brother" },
  "m,f,lb": { title: "Great-uncle (Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Maternal grandfather's brother" },
  "m,f,os": { title: "Great-aunt (Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Maternal grandfather's sister" },
  "m,f,ls": { title: "Great-aunt (Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Maternal grandfather's younger sister" },
  "m,m,ob": { title: "Great-uncle (Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Maternal grandmother's brother" },
  "m,m,lb": { title: "Great-uncle (Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Maternal grandmother's brother" },
  "m,m,os": { title: "Great-aunt (Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Maternal grandmother's sister" },
  "m,m,ls": { title: "Great-aunt (Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Maternal grandmother's sister" },
  "f,f,ob,sp": { title: "Great-aunt (Great-uncle's Wife, Paternal)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (paternal side)" },
  "f,f,lb,sp": { title: "Great-aunt (Great-uncle's Wife, Paternal)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (paternal side)" },
  "f,m,ob,sp": { title: "Great-aunt (Great-uncle's Wife, Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (paternal grandmother's side)" },
  "f,m,lb,sp": { title: "Great-aunt (Great-uncle's Wife, Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (paternal grandmother's side)" },
  "f,m,os,sp": { title: "Great-uncle (Great-aunt's Husband, Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (paternal grandmother's side)" },
  "f,m,ls,sp": { title: "Great-uncle (Great-aunt's Husband, Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (paternal grandmother's side)" },
  "f,f,os,sp": { title: "Great-uncle (Great-aunt's Husband, Paternal)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (paternal side)" },
  "f,f,ls,sp": { title: "Great-uncle (Great-aunt's Husband, Paternal)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (paternal side)" },
  "m,f,ob,sp": { title: "Great-aunt (Great-uncle's Wife, Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (maternal grandfather's side)" },
  "m,f,lb,sp": { title: "Great-aunt (Great-uncle's Wife, Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (maternal grandfather's side)" },
  "m,f,os,sp": { title: "Great-uncle (Great-aunt's Husband, Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (maternal grandfather's side)" },
  "m,f,ls,sp": { title: "Great-uncle (Great-aunt's Husband, Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (maternal grandfather's side)" },
  "m,m,ob,sp": { title: "Great-aunt (Great-uncle's Wife, Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (maternal grandmother's side)" },
  "m,m,lb,sp": { title: "Great-aunt (Great-uncle's Wife, Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Great-uncle's wife (maternal grandmother's side)" },
  "m,m,os,sp": { title: "Great-uncle (Great-aunt's Husband, Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (maternal grandmother's side)" },
  "m,m,ls,sp": { title: "Great-uncle (Great-aunt's Husband, Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Great-aunt's husband (maternal grandmother's side)" },
  "s": { title: "Son", pinyin: "", call: "Son", desc: "One's son" },
  "d": { title: "Daughter", pinyin: "", call: "Daughter", desc: "One's daughter" },
  "s,sp": { title: "Daughter-in-law", pinyin: "", call: "Daughter-in-law", desc: "Son's wife" },
  "d,sp": { title: "Son-in-law", pinyin: "", call: "Son-in-law", desc: "Daughter's husband" },
  "s,s": { title: "Grandson", pinyin: "", call: "Grandson", desc: "Son's son" },
  "s,d": { title: "Granddaughter", pinyin: "", call: "Granddaughter", desc: "Son's daughter" },
  "d,s": { title: "Grandson (Maternal)", pinyin: "", call: "Grandson", desc: "Daughter's son" },
  "d,d": { title: "Granddaughter (Maternal)", pinyin: "", call: "Granddaughter", desc: "Daughter's daughter" },
  "s,s,s": { title: "Great-grandson", pinyin: "", call: "Great-grandson", desc: "Grandson's son" },
  "s,s,d": { title: "Great-granddaughter", pinyin: "", call: "Great-granddaughter", desc: "Grandson's daughter" },
  "s,d,s": { title: "Great-grandson (Maternal)", pinyin: "", call: "Great-grandson", desc: "Granddaughter's son" },
  "s,d,d": { title: "Great-granddaughter (Maternal)", pinyin: "", call: "Great-granddaughter", desc: "Granddaughter's daughter" },
  "d,s,s": { title: "Great-grandson (Maternal)", pinyin: "", call: "Great-grandson", desc: "Grandson's son (maternal)" },
  "d,s,d": { title: "Great-granddaughter (Maternal)", pinyin: "", call: "Great-granddaughter", desc: "Grandson's daughter (maternal)" },
  "d,d,s": { title: "Great-grandson (Maternal Granddaughter's Side)", pinyin: "", call: "Great-grandson", desc: "Granddaughter's son (maternal)" },
  "d,d,d": { title: "Great-granddaughter (Maternal Granddaughter's Side)", pinyin: "", call: "Great-granddaughter", desc: "Granddaughter's daughter (maternal)" },
  "s,s,sp": { title: "Granddaughter-in-law", pinyin: "", call: "Granddaughter-in-law", desc: "Grandson's wife" },
  "s,d,sp": { title: "Grandson-in-law", pinyin: "", call: "Grandson-in-law", desc: "Granddaughter's husband" },
  "d,s,sp": { title: "Granddaughter-in-law (Maternal)", pinyin: "", call: "Granddaughter-in-law", desc: "Grandson's wife (maternal)" },
  "d,d,sp": { title: "Grandson-in-law (Maternal)", pinyin: "", call: "Grandson-in-law", desc: "Granddaughter's husband (maternal)" },
  "ob,s": { title: "Nephew", pinyin: "", call: "Nephew", desc: "Older brother's son" },
  "ob,d": { title: "Niece", pinyin: "", call: "Niece", desc: "Older brother's daughter" },
  "lb,s": { title: "Nephew", pinyin: "", call: "Nephew", desc: "Younger brother's son" },
  "lb,d": { title: "Niece", pinyin: "", call: "Niece", desc: "Younger brother's daughter" },
  "os,s": { title: "Nephew (Sister's)", pinyin: "", call: "Nephew", desc: "Older sister's son" },
  "os,d": { title: "Niece (Sister's)", pinyin: "", call: "Niece", desc: "Older sister's daughter" },
  "ls,s": { title: "Nephew (Sister's)", pinyin: "", call: "Nephew", desc: "Younger sister's son" },
  "ls,d": { title: "Niece (Sister's)", pinyin: "", call: "Niece", desc: "Younger sister's daughter" },
  "ob,s,sp": { title: "Niece-in-law (Brother's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Older brother's son's wife" },
  "ob,d,sp": { title: "Nephew-in-law (Brother's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Older brother's daughter's husband" },
  "lb,s,sp": { title: "Niece-in-law (Brother's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Younger brother's son's wife" },
  "lb,d,sp": { title: "Nephew-in-law (Brother's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Younger brother's daughter's husband" },
  "os,s,sp": { title: "Niece-in-law (Sister's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Older sister's son's wife" },
  "os,d,sp": { title: "Nephew-in-law (Sister's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Older sister's daughter's husband" },
  "ls,s,sp": { title: "Niece-in-law (Sister's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Younger sister's son's wife" },
  "ls,d,sp": { title: "Nephew-in-law (Sister's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Younger sister's daughter's husband" },
  "ob,s,s": { title: "Grandnephew", pinyin: "", call: "Grandnephew", desc: "Nephew's son" },
  "ob,s,d": { title: "Grandniece", pinyin: "", call: "Grandniece", desc: "Nephew's daughter" },
  "ob,d,s": { title: "Grandnephew (Niece's)", pinyin: "", call: "Grandnephew", desc: "Niece's son" },
  "ob,d,d": { title: "Grandniece (Niece's)", pinyin: "", call: "Grandniece", desc: "Niece's daughter" },
  "lb,s,s": { title: "Grandnephew", pinyin: "", call: "Grandnephew", desc: "Nephew's son" },
  "lb,s,d": { title: "Grandniece", pinyin: "", call: "Grandniece", desc: "Nephew's daughter" },
  "lb,d,s": { title: "Grandnephew (Niece's)", pinyin: "", call: "Grandnephew", desc: "Niece's son" },
  "lb,d,d": { title: "Grandniece (Niece's)", pinyin: "", call: "Grandniece", desc: "Niece's daughter" },
  "os,s,s": { title: "Grandnephew (Sister's Side)", pinyin: "", call: "Grandnephew", desc: "Nephew's son (sister's side)" },
  "os,s,d": { title: "Grandniece (Sister's Side)", pinyin: "", call: "Grandniece", desc: "Nephew's daughter (sister's side)" },
  "os,d,s": { title: "Grandnephew (Niece's, Sister's Side)", pinyin: "", call: "Grandnephew", desc: "Niece's son (sister's side)" },
  "os,d,d": { title: "Grandniece (Niece's, Sister's Side)", pinyin: "", call: "Grandniece", desc: "Niece's daughter (sister's side)" },
  "ls,s,s": { title: "Grandnephew (Sister's Side)", pinyin: "", call: "Grandnephew", desc: "Nephew's son (sister's side)" },
  "ls,s,d": { title: "Grandniece (Sister's Side)", pinyin: "", call: "Grandniece", desc: "Nephew's daughter (sister's side)" },
  "ls,d,s": { title: "Grandnephew (Niece's, Sister's Side)", pinyin: "", call: "Grandnephew", desc: "Niece's son (sister's side)" },
  "ls,d,d": { title: "Grandniece (Niece's, Sister's Side)", pinyin: "", call: "Grandniece", desc: "Niece's daughter (sister's side)" },
  "f,ob,s": { title: "Cousin (Paternal, Older Male)", pinyin: "", call: "Cousin", desc: "Paternal uncle's son (older)" },
  "f,ob,d": { title: "Cousin (Paternal, Older Female)", pinyin: "", call: "Cousin", desc: "Paternal uncle's daughter (older)" },
  "f,lb,s": { title: "Cousin (Paternal, Younger Male)", pinyin: "", call: "Cousin", desc: "Paternal uncle's son (younger)" },
  "f,lb,d": { title: "Cousin (Paternal, Younger Female)", pinyin: "", call: "Cousin", desc: "Paternal uncle's daughter (younger)" },
  "f,os,s": { title: "Cousin (Paternal Aunt's, Older Male)", pinyin: "", call: "Cousin", desc: "Paternal aunt's son (older)" },
  "f,os,d": { title: "Cousin (Paternal Aunt's, Older Female)", pinyin: "", call: "Cousin", desc: "Paternal aunt's daughter (older)" },
  "f,ls,s": { title: "Cousin (Paternal Aunt's, Younger Male)", pinyin: "", call: "Cousin", desc: "Paternal aunt's son (younger)" },
  "f,ls,d": { title: "Cousin (Paternal Aunt's, Younger Female)", pinyin: "", call: "Cousin", desc: "Paternal aunt's daughter (younger)" },
  "m,ob,s": { title: "Cousin (Maternal, Older Male)", pinyin: "", call: "Cousin", desc: "Maternal uncle's son (older)" },
  "m,ob,d": { title: "Cousin (Maternal, Older Female)", pinyin: "", call: "Cousin", desc: "Maternal uncle's daughter (older)" },
  "m,lb,s": { title: "Cousin (Maternal, Younger Male)", pinyin: "", call: "Cousin", desc: "Maternal uncle's son (younger)" },
  "m,lb,d": { title: "Cousin (Maternal, Younger Female)", pinyin: "", call: "Cousin", desc: "Maternal uncle's daughter (younger)" },
  "m,os,s": { title: "Cousin (Maternal Aunt's, Older Male)", pinyin: "", call: "Cousin", desc: "Maternal aunt's son (older)" },
  "m,os,d": { title: "Cousin (Maternal Aunt's, Older Female)", pinyin: "", call: "Cousin", desc: "Maternal aunt's daughter (older)" },
  "m,ls,s": { title: "Cousin (Maternal Aunt's, Younger Male)", pinyin: "", call: "Cousin", desc: "Maternal aunt's son (younger)" },
  "m,ls,d": { title: "Cousin (Maternal Aunt's, Younger Female)", pinyin: "", call: "Cousin", desc: "Maternal aunt's daughter (younger)" },
  "f,ob,s,sp": { title: "Cousin's Wife (Paternal, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Paternal cousin's wife (older)" },
  "f,ob,d,sp": { title: "Cousin's Husband (Paternal, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Paternal cousin's husband (older)" },
  "f,lb,s,sp": { title: "Cousin's Wife (Paternal, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Paternal cousin's wife (younger)" },
  "f,lb,d,sp": { title: "Cousin's Husband (Paternal, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Paternal cousin's husband (younger)" },
  "f,os,s,sp": { title: "Cousin's Wife (Paternal Aunt's, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Paternal cousin's wife (aunt's side)" },
  "f,os,d,sp": { title: "Cousin's Husband (Paternal Aunt's, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Paternal cousin's husband (aunt's side)" },
  "f,ls,s,sp": { title: "Cousin's Wife (Paternal Aunt's, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Paternal cousin's wife (aunt's side)" },
  "f,ls,d,sp": { title: "Cousin's Husband (Paternal Aunt's, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Paternal cousin's husband (aunt's side)" },
  "m,ob,s,sp": { title: "Cousin's Wife (Maternal, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Maternal cousin's wife (older)" },
  "m,ob,d,sp": { title: "Cousin's Husband (Maternal, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Maternal cousin's husband (older)" },
  "m,lb,s,sp": { title: "Cousin's Wife (Maternal, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Maternal cousin's wife (younger)" },
  "m,lb,d,sp": { title: "Cousin's Husband (Maternal, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Maternal cousin's husband (younger)" },
  "m,os,s,sp": { title: "Cousin's Wife (Maternal Aunt's, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Maternal cousin's wife (aunt's side)" },
  "m,os,d,sp": { title: "Cousin's Husband (Maternal Aunt's, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Maternal cousin's husband (aunt's side)" },
  "m,ls,s,sp": { title: "Cousin's Wife (Maternal Aunt's, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Maternal cousin's wife (aunt's side)" },
  "m,ls,d,sp": { title: "Cousin's Husband (Maternal Aunt's, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Maternal cousin's husband (aunt's side)" },
  "f,ob,s,s": { title: "Cousin's Son (Paternal)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (older)" },
  "f,ob,s,d": { title: "Cousin's Daughter (Paternal)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (older)" },
  "f,ob,d,s": { title: "Cousin's Son (Paternal, Female Cousin's)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (female cousin)" },
  "f,ob,d,d": { title: "Cousin's Daughter (Paternal, Female Cousin's)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (female cousin)" },
  "f,lb,s,s": { title: "Cousin's Son (Paternal, Younger)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (younger)" },
  "f,lb,s,d": { title: "Cousin's Daughter (Paternal, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (younger)" },
  "f,lb,d,s": { title: "Cousin's Son (Paternal, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (younger female cousin)" },
  "f,lb,d,d": { title: "Cousin's Daughter (Paternal, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (younger female cousin)" },
  "f,os,s,s": { title: "Cousin's Son (Paternal Aunt's Side)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (aunt's side)" },
  "f,os,s,d": { title: "Cousin's Daughter (Paternal Aunt's Side)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (aunt's side)" },
  "f,os,d,s": { title: "Cousin's Son (Paternal Aunt's Side, Female Cousin's)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (aunt's side, female)" },
  "f,os,d,d": { title: "Cousin's Daughter (Paternal Aunt's Side, Female Cousin's)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (aunt's side, female)" },
  "f,ls,s,s": { title: "Cousin's Son (Paternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (aunt's side, younger)" },
  "f,ls,s,d": { title: "Cousin's Daughter (Paternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (aunt's side, younger)" },
  "f,ls,d,s": { title: "Cousin's Son (Paternal Aunt's Side, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Son", desc: "Paternal cousin's son (aunt's side, younger female)" },
  "f,ls,d,d": { title: "Cousin's Daughter (Paternal Aunt's Side, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Paternal cousin's daughter (aunt's side, younger female)" },
  "m,ob,s,s": { title: "Cousin's Son (Maternal)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (older)" },
  "m,ob,s,d": { title: "Cousin's Daughter (Maternal)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (older)" },
  "m,ob,d,s": { title: "Cousin's Son (Maternal, Female Cousin's)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (female cousin)" },
  "m,ob,d,d": { title: "Cousin's Daughter (Maternal, Female Cousin's)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (female cousin)" },
  "m,lb,s,s": { title: "Cousin's Son (Maternal, Younger)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (younger)" },
  "m,lb,s,d": { title: "Cousin's Daughter (Maternal, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (younger)" },
  "m,lb,d,s": { title: "Cousin's Son (Maternal, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (younger female cousin)" },
  "m,lb,d,d": { title: "Cousin's Daughter (Maternal, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (younger female cousin)" },
  "m,os,s,s": { title: "Cousin's Son (Maternal Aunt's Side)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (aunt's side)" },
  "m,os,s,d": { title: "Cousin's Daughter (Maternal Aunt's Side)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (aunt's side)" },
  "m,os,d,s": { title: "Cousin's Son (Maternal Aunt's Side, Female Cousin's)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (aunt's side, female)" },
  "m,os,d,d": { title: "Cousin's Daughter (Maternal Aunt's Side, Female Cousin's)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (aunt's side, female)" },
  "m,ls,s,s": { title: "Cousin's Son (Maternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (aunt's side, younger)" },
  "m,ls,s,d": { title: "Cousin's Daughter (Maternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (aunt's side, younger)" },
  "m,ls,d,s": { title: "Cousin's Son (Maternal Aunt's Side, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Son", desc: "Maternal cousin's son (aunt's side, younger female)" },
  "m,ls,d,d": { title: "Cousin's Daughter (Maternal Aunt's Side, Female Cousin's, Younger)", pinyin: "", call: "Cousin's Daughter", desc: "Maternal cousin's daughter (aunt's side, younger female)" },
  "f,f,ob,s": { title: "Second Cousin (Paternal, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, father's older male cousin" },
  "f,f,ob,d": { title: "Second Cousin (Paternal, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, father's older female cousin" },
  "f,f,lb,s": { title: "Second Cousin (Paternal, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, father's younger male cousin" },
  "f,f,lb,d": { title: "Second Cousin (Paternal, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, father's younger female cousin" },
  "f,f,os,s": { title: "Second Cousin (Paternal Great-aunt's Side, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, father's older male cousin" },
  "f,f,os,d": { title: "Second Cousin (Paternal Great-aunt's Side, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, father's older female cousin" },
  "f,f,ls,s": { title: "Second Cousin (Paternal Great-aunt's Side, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, father's younger male cousin" },
  "f,f,ls,d": { title: "Second Cousin (Paternal Great-aunt's Side, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, father's younger female cousin" },
  "f,m,ob,s": { title: "Second Cousin (Paternal Grandmother's Side, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, father's older male cousin" },
  "f,m,ob,d": { title: "Second Cousin (Paternal Grandmother's Side, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, father's older female cousin" },
  "f,m,lb,s": { title: "Second Cousin (Paternal Grandmother's Side, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, father's younger male cousin" },
  "f,m,lb,d": { title: "Second Cousin (Paternal Grandmother's Side, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, father's younger female cousin" },
  "f,m,os,s": { title: "Second Cousin (Paternal Grandmother's Aunt's Side, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, father's older male cousin" },
  "f,m,os,d": { title: "Second Cousin (Paternal Grandmother's Aunt's Side, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, father's older female cousin" },
  "f,m,ls,s": { title: "Second Cousin (Paternal Grandmother's Aunt's Side, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, father's younger male cousin" },
  "f,m,ls,d": { title: "Second Cousin (Paternal Grandmother's Aunt's Side, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, father's younger female cousin" },
  "m,f,ob,s": { title: "Second Cousin (Maternal Grandfather's Side, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, mother's older male cousin" },
  "m,f,ob,d": { title: "Second Cousin (Maternal Grandfather's Side, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, mother's older female cousin" },
  "m,f,lb,s": { title: "Second Cousin (Maternal Grandfather's Side, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, mother's younger male cousin" },
  "m,f,lb,d": { title: "Second Cousin (Maternal Grandfather's Side, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, mother's younger female cousin" },
  "m,f,os,s": { title: "Second Cousin (Maternal Grandfather's Aunt's Side, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, mother's older male cousin" },
  "m,f,os,d": { title: "Second Cousin (Maternal Grandfather's Aunt's Side, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, mother's older female cousin" },
  "m,f,ls,s": { title: "Second Cousin (Maternal Grandfather's Aunt's Side, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, mother's younger male cousin" },
  "m,f,ls,d": { title: "Second Cousin (Maternal Grandfather's Aunt's Side, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, mother's younger female cousin" },
  "m,m,ob,s": { title: "Second Cousin (Maternal Grandmother's Side, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, mother's older male cousin" },
  "m,m,ob,d": { title: "Second Cousin (Maternal Grandmother's Side, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, mother's older female cousin" },
  "m,m,lb,s": { title: "Second Cousin (Maternal Grandmother's Side, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's son, mother's younger male cousin" },
  "m,m,lb,d": { title: "Second Cousin (Maternal Grandmother's Side, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-uncle's daughter, mother's younger female cousin" },
  "m,m,os,s": { title: "Second Cousin (Maternal Grandmother's Aunt's Side, Older Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, mother's older male cousin" },
  "m,m,os,d": { title: "Second Cousin (Maternal Grandmother's Aunt's Side, Older Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, mother's older female cousin" },
  "m,m,ls,s": { title: "Second Cousin (Maternal Grandmother's Aunt's Side, Younger Male)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's son, mother's younger male cousin" },
  "m,m,ls,d": { title: "Second Cousin (Maternal Grandmother's Aunt's Side, Younger Female)", pinyin: "", call: "Second Cousin", desc: "Great-aunt's daughter, mother's younger female cousin" },
  "f,f,ob,s,sp": { title: "Second Cousin's Wife (Paternal, Older Male)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal, older)" },
  "f,f,ob,d,sp": { title: "Second Cousin's Husband (Paternal, Older Female)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal, older)" },
  "f,f,lb,s,sp": { title: "Second Cousin's Wife (Paternal, Younger Male)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal, younger)" },
  "f,f,lb,d,sp": { title: "Second Cousin's Husband (Paternal, Younger Female)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal, younger)" },
  "f,f,os,s,sp": { title: "Second Cousin's Wife (Paternal Great-aunt's Side)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal great-aunt's side)" },
  "f,f,os,d,sp": { title: "Second Cousin's Husband (Paternal Great-aunt's Side)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal great-aunt's side)" },
  "f,f,ls,s,sp": { title: "Second Cousin's Wife (Paternal Great-aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal great-aunt's side, younger)" },
  "f,f,ls,d,sp": { title: "Second Cousin's Husband (Paternal Great-aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal great-aunt's side, younger)" },
  "f,m,ob,s,sp": { title: "Second Cousin's Wife (Paternal Grandmother's Side)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal grandmother's side)" },
  "f,m,ob,d,sp": { title: "Second Cousin's Husband (Paternal Grandmother's Side)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal grandmother's side)" },
  "f,m,lb,s,sp": { title: "Second Cousin's Wife (Paternal Grandmother's Side, Younger)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal grandmother's side, younger)" },
  "f,m,lb,d,sp": { title: "Second Cousin's Husband (Paternal Grandmother's Side, Younger)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal grandmother's side, younger)" },
  "f,m,os,s,sp": { title: "Second Cousin's Wife (Paternal Grandmother's Aunt's Side)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal grandmother's aunt's side)" },
  "f,m,os,d,sp": { title: "Second Cousin's Husband (Paternal Grandmother's Aunt's Side)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal grandmother's aunt's side)" },
  "f,m,ls,s,sp": { title: "Second Cousin's Wife (Paternal Grandmother's Aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (paternal grandmother's aunt's side, younger)" },
  "f,m,ls,d,sp": { title: "Second Cousin's Husband (Paternal Grandmother's Aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (paternal grandmother's aunt's side, younger)" },
  "m,f,ob,s,sp": { title: "Second Cousin's Wife (Maternal Grandfather's Side)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandfather's side)" },
  "m,f,ob,d,sp": { title: "Second Cousin's Husband (Maternal Grandfather's Side)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandfather's side)" },
  "m,f,lb,s,sp": { title: "Second Cousin's Wife (Maternal Grandfather's Side, Younger)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandfather's side, younger)" },
  "m,f,lb,d,sp": { title: "Second Cousin's Husband (Maternal Grandfather's Side, Younger)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandfather's side, younger)" },
  "m,f,os,s,sp": { title: "Second Cousin's Wife (Maternal Grandfather's Aunt's Side)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandfather's aunt's side)" },
  "m,f,os,d,sp": { title: "Second Cousin's Husband (Maternal Grandfather's Aunt's Side)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandfather's aunt's side)" },
  "m,f,ls,s,sp": { title: "Second Cousin's Wife (Maternal Grandfather's Aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandfather's aunt's side, younger)" },
  "m,f,ls,d,sp": { title: "Second Cousin's Husband (Maternal Grandfather's Aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandfather's aunt's side, younger)" },
  "m,m,ob,s,sp": { title: "Second Cousin's Wife (Maternal Grandmother's Side)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandmother's side)" },
  "m,m,ob,d,sp": { title: "Second Cousin's Husband (Maternal Grandmother's Side)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandmother's side)" },
  "m,m,lb,s,sp": { title: "Second Cousin's Wife (Maternal Grandmother's Side, Younger)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandmother's side, younger)" },
  "m,m,lb,d,sp": { title: "Second Cousin's Husband (Maternal Grandmother's Side, Younger)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandmother's side, younger)" },
  "m,m,os,s,sp": { title: "Second Cousin's Wife (Maternal Grandmother's Aunt's Side)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandmother's aunt's side)" },
  "m,m,os,d,sp": { title: "Second Cousin's Husband (Maternal Grandmother's Aunt's Side)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandmother's aunt's side)" },
  "m,m,ls,s,sp": { title: "Second Cousin's Wife (Maternal Grandmother's Aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Wife", desc: "Second cousin's wife (maternal grandmother's aunt's side, younger)" },
  "m,m,ls,d,sp": { title: "Second Cousin's Husband (Maternal Grandmother's Aunt's Side, Younger)", pinyin: "", call: "Second Cousin's Husband", desc: "Second cousin's husband (maternal grandmother's aunt's side, younger)" },
  "f,f,ob,s,s": { title: "Third Cousin (Paternal, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal, older)" },
  "f,f,ob,s,d": { title: "Third Cousin (Paternal, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal, older)" },
  "f,f,ob,d,s": { title: "Third Cousin (Paternal, Female Second Cousin's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal, female second cousin)" },
  "f,f,ob,d,d": { title: "Third Cousin (Paternal, Female Second Cousin's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal, female second cousin)" },
  "f,f,lb,s,s": { title: "Third Cousin (Paternal, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal, younger)" },
  "f,f,lb,s,d": { title: "Third Cousin (Paternal, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal, younger)" },
  "f,f,lb,d,s": { title: "Third Cousin (Paternal, Female Second Cousin's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal, younger female second cousin)" },
  "f,f,lb,d,d": { title: "Third Cousin (Paternal, Female Second Cousin's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal, younger female second cousin)" },
  "f,f,os,s,s": { title: "Third Cousin (Paternal Great-aunt's Side, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal great-aunt's side)" },
  "f,f,os,s,d": { title: "Third Cousin (Paternal Great-aunt's Side, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal great-aunt's side)" },
  "f,f,os,d,s": { title: "Third Cousin (Paternal Great-aunt's Side, Female's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal great-aunt's side, female)" },
  "f,f,os,d,d": { title: "Third Cousin (Paternal Great-aunt's Side, Female's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal great-aunt's side, female)" },
  "f,f,ls,s,s": { title: "Third Cousin (Paternal Great-aunt's Side, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal great-aunt's side, younger)" },
  "f,f,ls,s,d": { title: "Third Cousin (Paternal Great-aunt's Side, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal great-aunt's side, younger)" },
  "f,f,ls,d,s": { title: "Third Cousin (Paternal Great-aunt's Side, Female's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal great-aunt's side, younger female)" },
  "f,f,ls,d,d": { title: "Third Cousin (Paternal Great-aunt's Side, Female's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal great-aunt's side, younger female)" },
  "f,m,ob,s,s": { title: "Third Cousin (Paternal Grandmother's Side, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's side)" },
  "f,m,ob,s,d": { title: "Third Cousin (Paternal Grandmother's Side, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's side)" },
  "f,m,ob,d,s": { title: "Third Cousin (Paternal Grandmother's Side, Female's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's side, female)" },
  "f,m,ob,d,d": { title: "Third Cousin (Paternal Grandmother's Side, Female's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's side, female)" },
  "f,m,lb,s,s": { title: "Third Cousin (Paternal Grandmother's Side, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's side, younger)" },
  "f,m,lb,s,d": { title: "Third Cousin (Paternal Grandmother's Side, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's side, younger)" },
  "f,m,lb,d,s": { title: "Third Cousin (Paternal Grandmother's Side, Female's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's side, younger female)" },
  "f,m,lb,d,d": { title: "Third Cousin (Paternal Grandmother's Side, Female's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's side, younger female)" },
  "f,m,os,s,s": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's aunt's side)" },
  "f,m,os,s,d": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's aunt's side)" },
  "f,m,os,d,s": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Female's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's aunt's side, female)" },
  "f,m,os,d,d": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Female's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's aunt's side, female)" },
  "f,m,ls,s,s": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's aunt's side, younger)" },
  "f,m,ls,s,d": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's aunt's side, younger)" },
  "f,m,ls,d,s": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Female's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (paternal grandmother's aunt's side, younger female)" },
  "f,m,ls,d,d": { title: "Third Cousin (Paternal Grandmother's Aunt's Side, Female's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (paternal grandmother's aunt's side, younger female)" },
  "m,f,ob,s,s": { title: "Third Cousin (Maternal Grandfather's Side, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's side)" },
  "m,f,ob,s,d": { title: "Third Cousin (Maternal Grandfather's Side, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's side)" },
  "m,f,ob,d,s": { title: "Third Cousin (Maternal Grandfather's Side, Female's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's side, female)" },
  "m,f,ob,d,d": { title: "Third Cousin (Maternal Grandfather's Side, Female's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's side, female)" },
  "m,f,lb,s,s": { title: "Third Cousin (Maternal Grandfather's Side, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's side, younger)" },
  "m,f,lb,s,d": { title: "Third Cousin (Maternal Grandfather's Side, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's side, younger)" },
  "m,f,lb,d,s": { title: "Third Cousin (Maternal Grandfather's Side, Female's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's side, younger female)" },
  "m,f,lb,d,d": { title: "Third Cousin (Maternal Grandfather's Side, Female's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's side, younger female)" },
  "m,f,os,s,s": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's aunt's side)" },
  "m,f,os,s,d": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's aunt's side)" },
  "m,f,os,d,s": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Female's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's aunt's side, female)" },
  "m,f,os,d,d": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Female's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's aunt's side, female)" },
  "m,f,ls,s,s": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's aunt's side, younger)" },
  "m,f,ls,s,d": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's aunt's side, younger)" },
  "m,f,ls,d,s": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Female's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandfather's aunt's side, younger female)" },
  "m,f,ls,d,d": { title: "Third Cousin (Maternal Grandfather's Aunt's Side, Female's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandfather's aunt's side, younger female)" },
  "m,m,ob,s,s": { title: "Third Cousin (Maternal Grandmother's Side, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's side)" },
  "m,m,ob,s,d": { title: "Third Cousin (Maternal Grandmother's Side, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's side)" },
  "m,m,ob,d,s": { title: "Third Cousin (Maternal Grandmother's Side, Female's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's side, female)" },
  "m,m,ob,d,d": { title: "Third Cousin (Maternal Grandmother's Side, Female's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's side, female)" },
  "m,m,lb,s,s": { title: "Third Cousin (Maternal Grandmother's Side, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's side, younger)" },
  "m,m,lb,s,d": { title: "Third Cousin (Maternal Grandmother's Side, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's side, younger)" },
  "m,m,lb,d,s": { title: "Third Cousin (Maternal Grandmother's Side, Female's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's side, younger female)" },
  "m,m,lb,d,d": { title: "Third Cousin (Maternal Grandmother's Side, Female's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's side, younger female)" },
  "m,m,os,s,s": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Older Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's aunt's side)" },
  "m,m,os,s,d": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Older Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's aunt's side)" },
  "m,m,os,d,s": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Female's, Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's aunt's side, female)" },
  "m,m,os,d,d": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Female's, Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's aunt's side, female)" },
  "m,m,ls,s,s": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's aunt's side, younger)" },
  "m,m,ls,s,d": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's aunt's side, younger)" },
  "m,m,ls,d,s": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Female's, Younger Male)", pinyin: "", call: "Third Cousin", desc: "Second cousin's son (maternal grandmother's aunt's side, younger female)" },
  "m,m,ls,d,d": { title: "Third Cousin (Maternal Grandmother's Aunt's Side, Female's, Younger Female)", pinyin: "", call: "Third Cousin", desc: "Second cousin's daughter (maternal grandmother's aunt's side, younger female)" }
}

var relationMapMale = {
  "sp": { title: "妻子", pinyin: "qī zi", call: "老婆", desc: "自己的配偶" },
  "sp,f": { title: "岳父", pinyin: "yuè fù", call: "爸", desc: "妻子的父亲" },
  "sp,m": { title: "岳母", pinyin: "yuè mǔ", call: "妈", desc: "妻子的母亲" },
  "sp,ob": { title: "大舅子", pinyin: "dà jiù zi", call: "哥", desc: "妻子的哥哥" },
  "sp,lb": { title: "小舅子", pinyin: "xiǎo jiù zi", call: "弟", desc: "妻子的弟弟" },
  "sp,os": { title: "大姨子", pinyin: "dà yí zi", call: "姐", desc: "妻子的姐姐" },
  "sp,ls": { title: "小姨子", pinyin: "xiǎo yí zi", call: "妹", desc: "妻子的妹妹" },
  "sp,f,f": { title: "岳祖父", pinyin: "yuè zǔ fù", call: "爷爷", desc: "妻子的爷爷" },
  "sp,f,m": { title: "岳祖母", pinyin: "yuè zǔ mǔ", call: "奶奶", desc: "妻子的奶奶" },
  "sp,m,f": { title: "岳外祖父", pinyin: "yuè wài zǔ fù", call: "外公", desc: "妻子的外公" },
  "sp,m,m": { title: "岳外祖母", pinyin: "yuè wài zǔ mǔ", call: "外婆", desc: "妻子的外婆" },
  "sp,ob,sp": { title: "舅嫂", pinyin: "jiù sǎo", call: "嫂子", desc: "妻子哥哥的妻子" },
  "sp,lb,sp": { title: "舅弟妹", pinyin: "jiù dì mèi", call: "弟妹", desc: "妻子弟弟的妻子" },
  "sp,os,sp": { title: "连襟", pinyin: "lián jīn", call: "姐夫", desc: "妻子姐姐的丈夫" },
  "sp,ls,sp": { title: "连襟", pinyin: "lián jīn", call: "妹夫", desc: "妻子妹妹的丈夫" },
  "sp,f,ob": { title: "伯岳父", pinyin: "bó yuè fù", call: "伯伯", desc: "妻子的伯父" },
  "sp,f,lb": { title: "叔岳父", pinyin: "shū yuè fù", call: "叔叔", desc: "妻子的叔叔" },
  "sp,f,os": { title: "姑岳母", pinyin: "gū yuè mǔ", call: "姑姑", desc: "妻子的姑姑" },
  "sp,f,ls": { title: "姑岳母", pinyin: "gū yuè mǔ", call: "姑姑", desc: "妻子的姑姑" },
  "sp,m,ob": { title: "舅岳父", pinyin: "jiù yuè fù", call: "舅舅", desc: "妻子的舅舅" },
  "sp,m,lb": { title: "舅岳父", pinyin: "jiù yuè fù", call: "舅舅", desc: "妻子的舅舅" },
  "sp,m,os": { title: "姨岳母", pinyin: "yí yuè mǔ", call: "姨妈", desc: "妻子的姨妈" },
  "sp,m,ls": { title: "姨岳母", pinyin: "yí yuè mǔ", call: "姨妈", desc: "妻子的姨妈" },
  "sp,f,ob,sp": { title: "伯岳母", pinyin: "bó yuè mǔ", call: "伯母", desc: "妻子伯父的妻子" },
  "sp,f,lb,sp": { title: "叔岳母", pinyin: "shū yuè mǔ", call: "婶婶", desc: "妻子叔叔的妻子" },
  "sp,f,os,sp": { title: "姑岳父", pinyin: "gū yuè fù", call: "姑父", desc: "妻子姑姑的丈夫" },
  "sp,f,ls,sp": { title: "姑岳父", pinyin: "gū yuè fù", call: "姑父", desc: "妻子姑姑的丈夫" },
  "sp,m,ob,sp": { title: "舅岳母", pinyin: "jiù yuè mǔ", call: "舅妈", desc: "妻子舅舅的妻子" },
  "sp,m,lb,sp": { title: "舅岳母", pinyin: "jiù yuè mǔ", call: "舅妈", desc: "妻子舅舅的妻子" },
  "sp,m,os,sp": { title: "姨岳父", pinyin: "yí yuè fù", call: "姨父", desc: "妻子姨妈的丈夫" },
  "sp,m,ls,sp": { title: "姨岳父", pinyin: "yí yuè fù", call: "姨父", desc: "妻子姨妈的丈夫" },
  "sp,f,ob,s": { title: "妻子的堂兄", pinyin: "qī zi de táng xiōng", call: "堂哥", desc: "妻子伯父的儿子" },
  "sp,f,ob,d": { title: "妻子的堂姐", pinyin: "qī zi de táng jiě", call: "堂姐", desc: "妻子伯父的女儿" },
  "sp,f,lb,s": { title: "妻子的堂弟", pinyin: "qī zi de táng dì", call: "堂弟", desc: "妻子叔叔的儿子" },
  "sp,f,lb,d": { title: "妻子的堂妹", pinyin: "qī zi de táng mèi", call: "堂妹", desc: "妻子叔叔的女儿" },
  "sp,f,os,s": { title: "妻子的表哥", pinyin: "qī zi de biǎo gē", call: "表哥", desc: "妻子姑姑的儿子" },
  "sp,f,os,d": { title: "妻子的表姐", pinyin: "qī zi de biǎo jiě", call: "表姐", desc: "妻子姑姑的女儿" },
  "sp,f,ls,s": { title: "妻子的表弟", pinyin: "qī zi de biǎo dì", call: "表弟", desc: "妻子姑姑的儿子" },
  "sp,f,ls,d": { title: "妻子的表妹", pinyin: "qī zi de biǎo mèi", call: "表妹", desc: "妻子姑姑的女儿" },
  "sp,m,ob,s": { title: "妻子的表哥", pinyin: "qī zi de biǎo gē", call: "表哥", desc: "妻子舅舅的儿子" },
  "sp,m,ob,d": { title: "妻子的表姐", pinyin: "qī zi de biǎo jiě", call: "表姐", desc: "妻子舅舅的女儿" },
  "sp,m,lb,s": { title: "妻子的表弟", pinyin: "qī zi de biǎo dì", call: "表弟", desc: "妻子舅舅的儿子" },
  "sp,m,lb,d": { title: "妻子的表妹", pinyin: "qī zi de biǎo mèi", call: "表妹", desc: "妻子舅舅的女儿" },
  "sp,m,os,s": { title: "妻子的表哥", pinyin: "qī zi de biǎo gē", call: "表哥", desc: "妻子姨妈的儿子" },
  "sp,m,os,d": { title: "妻子的表姐", pinyin: "qī zi de biǎo jiě", call: "表姐", desc: "妻子姨妈的女儿" },
  "sp,m,ls,s": { title: "妻子的表弟", pinyin: "qī zi de biǎo dì", call: "表弟", desc: "妻子姨妈的儿子" },
  "sp,m,ls,d": { title: "妻子的表妹", pinyin: "qī zi de biǎo mèi", call: "表妹", desc: "妻子姨妈的女儿" },
  "sp,f,ob,s,sp": { title: "妻子堂嫂", pinyin: "qī zi táng sǎo", call: "堂嫂", desc: "妻子堂兄的妻子" },
  "sp,f,ob,d,sp": { title: "妻子堂姐夫", pinyin: "qī zi táng jiě fu", call: "堂姐夫", desc: "妻子堂姐的丈夫" },
  "sp,f,lb,s,sp": { title: "妻子堂弟妹", pinyin: "qī zi táng dì mèi", call: "堂弟妹", desc: "妻子堂弟的妻子" },
  "sp,f,lb,d,sp": { title: "妻子堂妹夫", pinyin: "qī zi táng mèi fu", call: "堂妹夫", desc: "妻子堂妹的丈夫" },
  "sp,f,os,s,sp": { title: "妻子表嫂", pinyin: "qī zi biǎo sǎo", call: "表嫂", desc: "妻子表哥的妻子" },
  "sp,f,os,d,sp": { title: "妻子表姐夫", pinyin: "qī zi biǎo jiě fu", call: "表姐夫", desc: "妻子表姐的丈夫" },
  "sp,f,ls,s,sp": { title: "妻子表弟妹", pinyin: "qī zi biǎo dì mèi", call: "表弟妹", desc: "妻子表弟的妻子" },
  "sp,f,ls,d,sp": { title: "妻子表妹夫", pinyin: "qī zi biǎo mèi fu", call: "表妹夫", desc: "妻子表妹的丈夫" },
  "sp,m,ob,s,sp": { title: "妻子表嫂", pinyin: "qī zi biǎo sǎo", call: "表嫂", desc: "妻子表哥的妻子" },
  "sp,m,ob,d,sp": { title: "妻子表姐夫", pinyin: "qī zi biǎo jiě fu", call: "表姐夫", desc: "妻子表姐的丈夫" },
  "sp,m,lb,s,sp": { title: "妻子表弟妹", pinyin: "qī zi biǎo dì mèi", call: "表弟妹", desc: "妻子表弟的妻子" },
  "sp,m,lb,d,sp": { title: "妻子表妹夫", pinyin: "qī zi biǎo mèi fu", call: "表妹夫", desc: "妻子表妹的丈夫" },
  "sp,m,os,s,sp": { title: "妻子表嫂", pinyin: "qī zi biǎo sǎo", call: "表嫂", desc: "妻子表哥的妻子" },
  "sp,m,os,d,sp": { title: "妻子表姐夫", pinyin: "qī zi biǎo jiě fu", call: "表姐夫", desc: "妻子表姐的丈夫" },
  "sp,m,ls,s,sp": { title: "妻子表弟妹", pinyin: "qī zi biǎo dì mèi", call: "表弟妹", desc: "妻子表弟的妻子" },
  "sp,m,ls,d,sp": { title: "妻子表妹夫", pinyin: "qī zi biǎo mèi fu", call: "表妹夫", desc: "妻子表妹的丈夫" },
  "sp,ob,s": { title: "内侄", pinyin: "nèi zhí", call: "侄子", desc: "妻子哥哥的儿子" },
  "sp,ob,d": { title: "内侄女", pinyin: "nèi zhí nǚ", call: "侄女", desc: "妻子哥哥的女儿" },
  "sp,lb,s": { title: "内侄", pinyin: "nèi zhí", call: "侄子", desc: "妻子弟弟的儿子" },
  "sp,lb,d": { title: "内侄女", pinyin: "nèi zhí nǚ", call: "侄女", desc: "妻子弟弟的女儿" },
  "sp,os,s": { title: "妻外甥", pinyin: "qī wài shēng", call: "外甥", desc: "妻子姐姐的儿子" },
  "sp,os,d": { title: "妻外甥女", pinyin: "qī wài shēng nǚ", call: "外甥女", desc: "妻子姐姐的女儿" },
  "sp,ls,s": { title: "妻外甥", pinyin: "qī wài shēng", call: "外甥", desc: "妻子妹妹的儿子" },
  "sp,ls,d": { title: "妻外甥女", pinyin: "qī wài shēng nǚ", call: "外甥女", desc: "妻子妹妹的女儿" },
  "sp,ob,s,sp": { title: "内侄媳", pinyin: "nèi zhí xí", call: "侄媳", desc: "妻子哥哥儿子的妻子" },
  "sp,ob,d,sp": { title: "内侄女婿", pinyin: "nèi zhí nǚ xù", call: "侄女婿", desc: "妻子哥哥女儿的丈夫" },
  "sp,lb,s,sp": { title: "内侄媳", pinyin: "nèi zhí xí", call: "侄媳", desc: "妻子弟弟儿子的妻子" },
  "sp,lb,d,sp": { title: "内侄女婿", pinyin: "nèi zhí nǚ xù", call: "侄女婿", desc: "妻子弟弟女儿的丈夫" },
  "sp,os,s,sp": { title: "妻外甥媳", pinyin: "qī wài shēng xí", call: "外甥媳", desc: "妻子姐姐儿子的妻子" },
  "sp,os,d,sp": { title: "妻外甥女婿", pinyin: "qī wài shēng nǚ xù", call: "外甥女婿", desc: "妻子姐姐女儿的丈夫" },
  "sp,ls,s,sp": { title: "妻外甥媳", pinyin: "qī wài shēng xí", call: "外甥媳", desc: "妻子妹妹儿子的妻子" },
  "sp,ls,d,sp": { title: "妻外甥女婿", pinyin: "qī wài shēng nǚ xù", call: "外甥女婿", desc: "妻子妹妹女儿的丈夫" },
  "sp,f,f,ob": { title: "伯岳祖父", pinyin: "bó yuè zǔ fù", call: "伯公", desc: "妻子爷爷的哥哥" },
  "sp,f,f,lb": { title: "叔岳祖父", pinyin: "shū yuè zǔ fù", call: "叔公", desc: "妻子爷爷的弟弟" },
  "sp,f,f,os": { title: "姑岳祖母", pinyin: "gū yuè zǔ mǔ", call: "姑婆", desc: "妻子爷爷的姐妹" },
  "sp,f,f,ls": { title: "姑岳祖母", pinyin: "gū yuè zǔ mǔ", call: "姑婆", desc: "妻子爷爷的姐妹" },
  "sp,f,m,ob": { title: "舅岳祖父", pinyin: "jiù yuè zǔ fù", call: "舅公", desc: "妻子奶奶的兄弟" },
  "sp,f,m,lb": { title: "舅岳祖父", pinyin: "jiù yuè zǔ fù", call: "舅公", desc: "妻子奶奶的兄弟" },
  "sp,f,m,os": { title: "姨岳祖母", pinyin: "yí yuè zǔ mǔ", call: "姨婆", desc: "妻子奶奶的姐妹" },
  "sp,f,m,ls": { title: "姨岳祖母", pinyin: "yí yuè zǔ mǔ", call: "姨婆", desc: "妻子奶奶的姐妹" },
  "sp,m,f,ob": { title: "舅岳外祖父", pinyin: "jiù yuè wài zǔ fù", call: "舅公", desc: "妻子外公的兄弟" },
  "sp,m,f,lb": { title: "舅岳外祖父", pinyin: "jiù yuè wài zǔ fù", call: "舅公", desc: "妻子外公的兄弟" },
  "sp,m,f,os": { title: "姨岳外祖母", pinyin: "yí yuè wài zǔ mǔ", call: "姨婆", desc: "妻子外公的姐妹" },
  "sp,m,f,ls": { title: "姨岳外祖母", pinyin: "yí yuè wài zǔ mǔ", call: "姨婆", desc: "妻子外公的姐妹" },
  "sp,m,m,ob": { title: "舅岳外祖父", pinyin: "jiù yuè wài zǔ fù", call: "舅公", desc: "妻子外婆的兄弟" },
  "sp,m,m,lb": { title: "舅岳外祖父", pinyin: "jiù yuè wài zǔ fù", call: "舅公", desc: "妻子外婆的兄弟" },
  "sp,m,m,os": { title: "姨岳外祖母", pinyin: "yí yuè wài zǔ mǔ", call: "姨婆", desc: "妻子外婆的姐妹" },
  "sp,m,m,ls": { title: "姨岳外祖母", pinyin: "yí yuè wài zǔ mǔ", call: "姨婆", desc: "妻子外婆的姐妹" },
  "sp,f,f,ob,sp": { title: "妻子伯婆", pinyin: "qī zi bó pó", call: "伯婆", desc: "妻子伯公的妻子" },
  "sp,f,f,lb,sp": { title: "妻子婶婆", pinyin: "qī zi shěn pó", call: "婶婆", desc: "妻子叔公的妻子" },
  "sp,f,f,os,sp": { title: "妻子姑公", pinyin: "qī zi gū gōng", call: "姑公", desc: "妻子姑婆的丈夫" },
  "sp,f,f,ls,sp": { title: "妻子姑公", pinyin: "qī zi gū gōng", call: "姑公", desc: "妻子姑婆的丈夫" },
  "sp,f,m,ob,sp": { title: "妻子舅婆", pinyin: "qī zi jiù pó", call: "舅婆", desc: "妻子舅公的妻子" },
  "sp,f,m,lb,sp": { title: "妻子舅婆", pinyin: "qī zi jiù pó", call: "舅婆", desc: "妻子舅公的妻子" },
  "sp,f,m,os,sp": { title: "妻子姨公", pinyin: "qī zi yí gōng", call: "姨公", desc: "妻子姨婆的丈夫" },
  "sp,f,m,ls,sp": { title: "妻子姨公", pinyin: "qī zi yí gōng", call: "姨公", desc: "妻子姨婆的丈夫" },
  "sp,m,f,ob,sp": { title: "妻子舅婆", pinyin: "qī zi jiù pó", call: "舅婆", desc: "妻子舅公的妻子" },
  "sp,m,f,lb,sp": { title: "妻子舅婆", pinyin: "qī zi jiù pó", call: "舅婆", desc: "妻子舅公的妻子" },
  "sp,m,f,os,sp": { title: "妻子姨公", pinyin: "qī zi yí gōng", call: "姨公", desc: "妻子姨婆的丈夫" },
  "sp,m,f,ls,sp": { title: "妻子姨公", pinyin: "qī zi yí gōng", call: "姨公", desc: "妻子姨婆的丈夫" },
  "sp,m,m,ob,sp": { title: "妻子舅婆", pinyin: "qī zi jiù pó", call: "舅婆", desc: "妻子舅公的妻子" },
  "sp,m,m,lb,sp": { title: "妻子舅婆", pinyin: "qī zi jiù pó", call: "舅婆", desc: "妻子舅公的妻子" },
  "sp,m,m,os,sp": { title: "妻子姨公", pinyin: "qī zi yí gōng", call: "姨公", desc: "妻子姨婆的丈夫" },
  "sp,m,m,ls,sp": { title: "妻子姨公", pinyin: "qī zi yí gōng", call: "姨公", desc: "妻子姨婆的丈夫" }
}

var relationMapMaleEn = {
  "sp": { title: "Wife", pinyin: "", call: "Wife", desc: "One's spouse" },
  "sp,f": { title: "Father-in-law", pinyin: "", call: "Dad", desc: "Wife's father" },
  "sp,m": { title: "Mother-in-law", pinyin: "", call: "Mom", desc: "Wife's mother" },
  "sp,ob": { title: "Brother-in-law (Wife's Older Brother)", pinyin: "", call: "Brother", desc: "Wife's older brother" },
  "sp,lb": { title: "Brother-in-law (Wife's Younger Brother)", pinyin: "", call: "Brother", desc: "Wife's younger brother" },
  "sp,os": { title: "Sister-in-law (Wife's Older Sister)", pinyin: "", call: "Sister", desc: "Wife's older sister" },
  "sp,ls": { title: "Sister-in-law (Wife's Younger Sister)", pinyin: "", call: "Sister", desc: "Wife's younger sister" },
  "sp,f,f": { title: "Grandfather-in-law (Paternal)", pinyin: "", call: "Grandpa", desc: "Wife's paternal grandfather" },
  "sp,f,m": { title: "Grandmother-in-law (Paternal)", pinyin: "", call: "Grandma", desc: "Wife's paternal grandmother" },
  "sp,m,f": { title: "Grandfather-in-law (Maternal)", pinyin: "", call: "Grandpa", desc: "Wife's maternal grandfather" },
  "sp,m,m": { title: "Grandmother-in-law (Maternal)", pinyin: "", call: "Grandma", desc: "Wife's maternal grandmother" },
  "sp,ob,sp": { title: "Sister-in-law (Wife's Brother's Wife)", pinyin: "", call: "Sister-in-law", desc: "Wife's older brother's wife" },
  "sp,lb,sp": { title: "Sister-in-law (Wife's Brother's Wife)", pinyin: "", call: "Sister-in-law", desc: "Wife's younger brother's wife" },
  "sp,os,sp": { title: "Co-brother-in-law", pinyin: "", call: "Brother-in-law", desc: "Wife's older sister's husband" },
  "sp,ls,sp": { title: "Co-brother-in-law", pinyin: "", call: "Brother-in-law", desc: "Wife's younger sister's husband" },
  "sp,f,ob": { title: "Uncle-in-law (Wife's Paternal, Older)", pinyin: "", call: "Uncle", desc: "Wife's paternal uncle (older)" },
  "sp,f,lb": { title: "Uncle-in-law (Wife's Paternal, Younger)", pinyin: "", call: "Uncle", desc: "Wife's paternal uncle (younger)" },
  "sp,f,os": { title: "Aunt-in-law (Wife's Paternal, Older)", pinyin: "", call: "Aunt", desc: "Wife's paternal aunt (older)" },
  "sp,f,ls": { title: "Aunt-in-law (Wife's Paternal, Younger)", pinyin: "", call: "Aunt", desc: "Wife's paternal aunt (younger)" },
  "sp,m,ob": { title: "Uncle-in-law (Wife's Maternal, Older)", pinyin: "", call: "Uncle", desc: "Wife's maternal uncle (older)" },
  "sp,m,lb": { title: "Uncle-in-law (Wife's Maternal, Younger)", pinyin: "", call: "Uncle", desc: "Wife's maternal uncle (younger)" },
  "sp,m,os": { title: "Aunt-in-law (Wife's Maternal, Older)", pinyin: "", call: "Aunt", desc: "Wife's maternal aunt (older)" },
  "sp,m,ls": { title: "Aunt-in-law (Wife's Maternal, Younger)", pinyin: "", call: "Aunt", desc: "Wife's maternal aunt (younger)" },
  "sp,f,ob,sp": { title: "Aunt-in-law (Wife's Uncle's Wife, Paternal)", pinyin: "", call: "Aunt", desc: "Wife's paternal uncle's wife (older)" },
  "sp,f,lb,sp": { title: "Aunt-in-law (Wife's Uncle's Wife, Paternal)", pinyin: "", call: "Aunt", desc: "Wife's paternal uncle's wife (younger)" },
  "sp,f,os,sp": { title: "Uncle-in-law (Wife's Aunt's Husband, Paternal)", pinyin: "", call: "Uncle", desc: "Wife's paternal aunt's husband (older)" },
  "sp,f,ls,sp": { title: "Uncle-in-law (Wife's Aunt's Husband, Paternal)", pinyin: "", call: "Uncle", desc: "Wife's paternal aunt's husband (younger)" },
  "sp,m,ob,sp": { title: "Aunt-in-law (Wife's Uncle's Wife, Maternal)", pinyin: "", call: "Aunt", desc: "Wife's maternal uncle's wife (older)" },
  "sp,m,lb,sp": { title: "Aunt-in-law (Wife's Uncle's Wife, Maternal)", pinyin: "", call: "Aunt", desc: "Wife's maternal uncle's wife (younger)" },
  "sp,m,os,sp": { title: "Uncle-in-law (Wife's Aunt's Husband, Maternal)", pinyin: "", call: "Uncle", desc: "Wife's maternal aunt's husband (older)" },
  "sp,m,ls,sp": { title: "Uncle-in-law (Wife's Aunt's Husband, Maternal)", pinyin: "", call: "Uncle", desc: "Wife's maternal aunt's husband (younger)" },
  "sp,f,ob,s": { title: "Wife's Cousin (Paternal, Older Male)", pinyin: "", call: "Cousin", desc: "Wife's paternal uncle's son (older)" },
  "sp,f,ob,d": { title: "Wife's Cousin (Paternal, Older Female)", pinyin: "", call: "Cousin", desc: "Wife's paternal uncle's daughter (older)" },
  "sp,f,lb,s": { title: "Wife's Cousin (Paternal, Younger Male)", pinyin: "", call: "Cousin", desc: "Wife's paternal uncle's son (younger)" },
  "sp,f,lb,d": { title: "Wife's Cousin (Paternal, Younger Female)", pinyin: "", call: "Cousin", desc: "Wife's paternal uncle's daughter (younger)" },
  "sp,f,os,s": { title: "Wife's Cousin (Paternal Aunt's, Older Male)", pinyin: "", call: "Cousin", desc: "Wife's paternal aunt's son (older)" },
  "sp,f,os,d": { title: "Wife's Cousin (Paternal Aunt's, Older Female)", pinyin: "", call: "Cousin", desc: "Wife's paternal aunt's daughter (older)" },
  "sp,f,ls,s": { title: "Wife's Cousin (Paternal Aunt's, Younger Male)", pinyin: "", call: "Cousin", desc: "Wife's paternal aunt's son (younger)" },
  "sp,f,ls,d": { title: "Wife's Cousin (Paternal Aunt's, Younger Female)", pinyin: "", call: "Cousin", desc: "Wife's paternal aunt's daughter (younger)" },
  "sp,m,ob,s": { title: "Wife's Cousin (Maternal, Older Male)", pinyin: "", call: "Cousin", desc: "Wife's maternal uncle's son (older)" },
  "sp,m,ob,d": { title: "Wife's Cousin (Maternal, Older Female)", pinyin: "", call: "Cousin", desc: "Wife's maternal uncle's daughter (older)" },
  "sp,m,lb,s": { title: "Wife's Cousin (Maternal, Younger Male)", pinyin: "", call: "Cousin", desc: "Wife's maternal uncle's son (younger)" },
  "sp,m,lb,d": { title: "Wife's Cousin (Maternal, Younger Female)", pinyin: "", call: "Cousin", desc: "Wife's maternal uncle's daughter (younger)" },
  "sp,m,os,s": { title: "Wife's Cousin (Maternal Aunt's, Older Male)", pinyin: "", call: "Cousin", desc: "Wife's maternal aunt's son (older)" },
  "sp,m,os,d": { title: "Wife's Cousin (Maternal Aunt's, Older Female)", pinyin: "", call: "Cousin", desc: "Wife's maternal aunt's daughter (older)" },
  "sp,m,ls,s": { title: "Wife's Cousin (Maternal Aunt's, Younger Male)", pinyin: "", call: "Cousin", desc: "Wife's maternal aunt's son (younger)" },
  "sp,m,ls,d": { title: "Wife's Cousin (Maternal Aunt's, Younger Female)", pinyin: "", call: "Cousin", desc: "Wife's maternal aunt's daughter (younger)" },
  "sp,f,ob,s,sp": { title: "Wife's Cousin's Wife (Paternal, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Wife's paternal cousin's wife (older)" },
  "sp,f,ob,d,sp": { title: "Wife's Cousin's Husband (Paternal, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Wife's paternal cousin's husband (older)" },
  "sp,f,lb,s,sp": { title: "Wife's Cousin's Wife (Paternal, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Wife's paternal cousin's wife (younger)" },
  "sp,f,lb,d,sp": { title: "Wife's Cousin's Husband (Paternal, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Wife's paternal cousin's husband (younger)" },
  "sp,f,os,s,sp": { title: "Wife's Cousin's Wife (Paternal Aunt's Side)", pinyin: "", call: "Cousin's Wife", desc: "Wife's paternal cousin's wife (aunt's side)" },
  "sp,f,os,d,sp": { title: "Wife's Cousin's Husband (Paternal Aunt's Side)", pinyin: "", call: "Cousin's Husband", desc: "Wife's paternal cousin's husband (aunt's side)" },
  "sp,f,ls,s,sp": { title: "Wife's Cousin's Wife (Paternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Wife", desc: "Wife's paternal cousin's wife (aunt's side, younger)" },
  "sp,f,ls,d,sp": { title: "Wife's Cousin's Husband (Paternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Husband", desc: "Wife's paternal cousin's husband (aunt's side, younger)" },
  "sp,m,ob,s,sp": { title: "Wife's Cousin's Wife (Maternal, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Wife's maternal cousin's wife (older)" },
  "sp,m,ob,d,sp": { title: "Wife's Cousin's Husband (Maternal, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Wife's maternal cousin's husband (older)" },
  "sp,m,lb,s,sp": { title: "Wife's Cousin's Wife (Maternal, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Wife's maternal cousin's wife (younger)" },
  "sp,m,lb,d,sp": { title: "Wife's Cousin's Husband (Maternal, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Wife's maternal cousin's husband (younger)" },
  "sp,m,os,s,sp": { title: "Wife's Cousin's Wife (Maternal Aunt's Side)", pinyin: "", call: "Cousin's Wife", desc: "Wife's maternal cousin's wife (aunt's side)" },
  "sp,m,os,d,sp": { title: "Wife's Cousin's Husband (Maternal Aunt's Side)", pinyin: "", call: "Cousin's Husband", desc: "Wife's maternal cousin's husband (aunt's side)" },
  "sp,m,ls,s,sp": { title: "Wife's Cousin's Wife (Maternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Wife", desc: "Wife's maternal cousin's wife (aunt's side, younger)" },
  "sp,m,ls,d,sp": { title: "Wife's Cousin's Husband (Maternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Husband", desc: "Wife's maternal cousin's husband (aunt's side, younger)" },
  "sp,ob,s": { title: "Nephew (Wife's Brother's Son)", pinyin: "", call: "Nephew", desc: "Wife's older brother's son" },
  "sp,ob,d": { title: "Niece (Wife's Brother's Daughter)", pinyin: "", call: "Niece", desc: "Wife's older brother's daughter" },
  "sp,lb,s": { title: "Nephew (Wife's Brother's Son)", pinyin: "", call: "Nephew", desc: "Wife's younger brother's son" },
  "sp,lb,d": { title: "Niece (Wife's Brother's Daughter)", pinyin: "", call: "Niece", desc: "Wife's younger brother's daughter" },
  "sp,os,s": { title: "Nephew (Wife's Sister's Son)", pinyin: "", call: "Nephew", desc: "Wife's older sister's son" },
  "sp,os,d": { title: "Niece (Wife's Sister's Daughter)", pinyin: "", call: "Niece", desc: "Wife's older sister's daughter" },
  "sp,ls,s": { title: "Nephew (Wife's Sister's Son)", pinyin: "", call: "Nephew", desc: "Wife's younger sister's son" },
  "sp,ls,d": { title: "Niece (Wife's Sister's Daughter)", pinyin: "", call: "Niece", desc: "Wife's younger sister's daughter" },
  "sp,ob,s,sp": { title: "Niece-in-law (Wife's Brother's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Wife's older brother's son's wife" },
  "sp,ob,d,sp": { title: "Nephew-in-law (Wife's Brother's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Wife's older brother's daughter's husband" },
  "sp,lb,s,sp": { title: "Niece-in-law (Wife's Brother's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Wife's younger brother's son's wife" },
  "sp,lb,d,sp": { title: "Nephew-in-law (Wife's Brother's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Wife's younger brother's daughter's husband" },
  "sp,os,s,sp": { title: "Niece-in-law (Wife's Sister's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Wife's older sister's son's wife" },
  "sp,os,d,sp": { title: "Nephew-in-law (Wife's Sister's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Wife's older sister's daughter's husband" },
  "sp,ls,s,sp": { title: "Niece-in-law (Wife's Sister's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Wife's younger sister's son's wife" },
  "sp,ls,d,sp": { title: "Nephew-in-law (Wife's Sister's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Wife's younger sister's daughter's husband" },
  "sp,f,f,ob": { title: "Great-uncle-in-law (Wife's Paternal, Older)", pinyin: "", call: "Great-uncle", desc: "Wife's paternal grandfather's older brother" },
  "sp,f,f,lb": { title: "Great-uncle-in-law (Wife's Paternal, Younger)", pinyin: "", call: "Great-uncle", desc: "Wife's paternal grandfather's younger brother" },
  "sp,f,f,os": { title: "Great-aunt-in-law (Wife's Paternal)", pinyin: "", call: "Great-aunt", desc: "Wife's paternal grandfather's sister" },
  "sp,f,f,ls": { title: "Great-aunt-in-law (Wife's Paternal)", pinyin: "", call: "Great-aunt", desc: "Wife's paternal grandfather's sister" },
  "sp,f,m,ob": { title: "Great-uncle-in-law (Wife's Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's paternal grandmother's brother" },
  "sp,f,m,lb": { title: "Great-uncle-in-law (Wife's Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's paternal grandmother's brother" },
  "sp,f,m,os": { title: "Great-aunt-in-law (Wife's Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's paternal grandmother's sister" },
  "sp,f,m,ls": { title: "Great-aunt-in-law (Wife's Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's paternal grandmother's sister" },
  "sp,m,f,ob": { title: "Great-uncle-in-law (Wife's Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's maternal grandfather's brother" },
  "sp,m,f,lb": { title: "Great-uncle-in-law (Wife's Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's maternal grandfather's brother" },
  "sp,m,f,os": { title: "Great-aunt-in-law (Wife's Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's maternal grandfather's sister" },
  "sp,m,f,ls": { title: "Great-aunt-in-law (Wife's Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's maternal grandfather's sister" },
  "sp,m,m,ob": { title: "Great-uncle-in-law (Wife's Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's maternal grandmother's brother" },
  "sp,m,m,lb": { title: "Great-uncle-in-law (Wife's Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's maternal grandmother's brother" },
  "sp,m,m,os": { title: "Great-aunt-in-law (Wife's Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's maternal grandmother's sister" },
  "sp,m,m,ls": { title: "Great-aunt-in-law (Wife's Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's maternal grandmother's sister" },
  "sp,f,f,ob,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Paternal)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (paternal)" },
  "sp,f,f,lb,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Paternal)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (paternal)" },
  "sp,f,f,os,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Paternal)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (paternal)" },
  "sp,f,f,ls,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Paternal)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (paternal)" },
  "sp,f,m,ob,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (paternal grandmother's side)" },
  "sp,f,m,lb,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (paternal grandmother's side)" },
  "sp,f,m,os,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (paternal grandmother's side)" },
  "sp,f,m,ls,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (paternal grandmother's side)" },
  "sp,m,f,ob,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (maternal grandfather's side)" },
  "sp,m,f,lb,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (maternal grandfather's side)" },
  "sp,m,f,os,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (maternal grandfather's side)" },
  "sp,m,f,ls,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (maternal grandfather's side)" },
  "sp,m,m,ob,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (maternal grandmother's side)" },
  "sp,m,m,lb,sp": { title: "Great-aunt-in-law (Wife's Great-uncle's Wife, Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Wife's great-uncle's wife (maternal grandmother's side)" },
  "sp,m,m,os,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (maternal grandmother's side)" },
  "sp,m,m,ls,sp": { title: "Great-uncle-in-law (Wife's Great-aunt's Husband, Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Wife's great-aunt's husband (maternal grandmother's side)" }
}

var relationMapFemale = {
  "sp": { title: "丈夫", pinyin: "zhàng fu", call: "老公", desc: "自己的配偶" },
  "sp,f": { title: "公公", pinyin: "gōng gong", call: "爸", desc: "丈夫的父亲" },
  "sp,m": { title: "婆婆", pinyin: "pó po", call: "妈", desc: "丈夫的母亲" },
  "sp,ob": { title: "大伯子", pinyin: "dà bǎi zi", call: "哥", desc: "丈夫的哥哥" },
  "sp,lb": { title: "小叔子", pinyin: "xiǎo shū zi", call: "弟", desc: "丈夫的弟弟" },
  "sp,os": { title: "大姑子", pinyin: "dà gū zi", call: "姐", desc: "丈夫的姐姐" },
  "sp,ls": { title: "小姑子", pinyin: "xiǎo gū zi", call: "妹", desc: "丈夫的妹妹" },
  "sp,f,f": { title: "祖公公", pinyin: "zǔ gōng gong", call: "爷爷", desc: "丈夫的爷爷" },
  "sp,f,m": { title: "祖婆婆", pinyin: "zǔ pó po", call: "奶奶", desc: "丈夫的奶奶" },
  "sp,m,f": { title: "外公公", pinyin: "wài gōng gong", call: "外公", desc: "丈夫的外公" },
  "sp,m,m": { title: "外婆婆", pinyin: "wài pó po", call: "外婆", desc: "丈夫的外婆" },
  "sp,ob,sp": { title: "伯嫂", pinyin: "bó sǎo", call: "嫂子", desc: "丈夫哥哥的妻子" },
  "sp,lb,sp": { title: "婶子", pinyin: "shěn zi", call: "婶婶", desc: "丈夫弟弟的妻子" },
  "sp,os,sp": { title: "姑爷", pinyin: "gū yé", call: "姐夫", desc: "丈夫姐姐的丈夫" },
  "sp,ls,sp": { title: "姑爷", pinyin: "gū yé", call: "妹夫", desc: "丈夫妹妹的丈夫" },
  "sp,f,ob": { title: "伯翁", pinyin: "bó wēng", call: "伯伯", desc: "丈夫的伯父" },
  "sp,f,lb": { title: "叔翁", pinyin: "shū wēng", call: "叔叔", desc: "丈夫的叔叔" },
  "sp,f,os": { title: "姑婆", pinyin: "gū pó", call: "姑姑", desc: "丈夫的姑姑" },
  "sp,f,ls": { title: "姑婆", pinyin: "gū pó", call: "姑姑", desc: "丈夫的姑姑" },
  "sp,m,ob": { title: "舅公", pinyin: "jiù gōng", call: "舅舅", desc: "丈夫的舅舅" },
  "sp,m,lb": { title: "舅公", pinyin: "jiù gōng", call: "舅舅", desc: "丈夫的舅舅" },
  "sp,m,os": { title: "姨婆", pinyin: "yí pó", call: "姨妈", desc: "丈夫的姨妈" },
  "sp,m,ls": { title: "姨婆", pinyin: "yí pó", call: "姨妈", desc: "丈夫的姨妈" },
  "sp,f,ob,sp": { title: "伯婆", pinyin: "bó pó", call: "伯母", desc: "丈夫伯父的妻子" },
  "sp,f,lb,sp": { title: "婶婆", pinyin: "shěn pó", call: "婶婶", desc: "丈夫叔叔的妻子" },
  "sp,f,os,sp": { title: "姑公", pinyin: "gū gōng", call: "姑父", desc: "丈夫姑姑的丈夫" },
  "sp,f,ls,sp": { title: "姑公", pinyin: "gū gōng", call: "姑父", desc: "丈夫姑姑的丈夫" },
  "sp,m,ob,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅妈", desc: "丈夫舅舅的妻子" },
  "sp,m,lb,sp": { title: "舅婆", pinyin: "jiù pó", call: "舅妈", desc: "丈夫舅舅的妻子" },
  "sp,m,os,sp": { title: "姨公", pinyin: "yí gōng", call: "姨父", desc: "丈夫姨妈的丈夫" },
  "sp,m,ls,sp": { title: "姨公", pinyin: "yí gōng", call: "姨父", desc: "丈夫姨妈的丈夫" },
  "sp,f,ob,s": { title: "丈夫的堂兄", pinyin: "zhàng fu de táng xiōng", call: "堂哥", desc: "丈夫伯父的儿子" },
  "sp,f,ob,d": { title: "丈夫的堂姐", pinyin: "zhàng fu de táng jiě", call: "堂姐", desc: "丈夫伯父的女儿" },
  "sp,f,lb,s": { title: "丈夫的堂弟", pinyin: "zhàng fu de táng dì", call: "堂弟", desc: "丈夫叔叔的儿子" },
  "sp,f,lb,d": { title: "丈夫的堂妹", pinyin: "zhàng fu de táng mèi", call: "堂妹", desc: "丈夫叔叔的女儿" },
  "sp,f,os,s": { title: "丈夫的表哥", pinyin: "zhàng fu de biǎo gē", call: "表哥", desc: "丈夫姑姑的儿子" },
  "sp,f,os,d": { title: "丈夫的表姐", pinyin: "zhàng fu de biǎo jiě", call: "表姐", desc: "丈夫姑姑的女儿" },
  "sp,f,ls,s": { title: "丈夫的表弟", pinyin: "zhàng fu de biǎo dì", call: "表弟", desc: "丈夫姑姑的儿子" },
  "sp,f,ls,d": { title: "丈夫的表妹", pinyin: "zhàng fu de biǎo mèi", call: "表妹", desc: "丈夫姑姑的女儿" },
  "sp,m,ob,s": { title: "丈夫的表哥", pinyin: "zhàng fu de biǎo gē", call: "表哥", desc: "丈夫舅舅的儿子" },
  "sp,m,ob,d": { title: "丈夫的表姐", pinyin: "zhàng fu de biǎo jiě", call: "表姐", desc: "丈夫舅舅的女儿" },
  "sp,m,lb,s": { title: "丈夫的表弟", pinyin: "zhàng fu de biǎo dì", call: "表弟", desc: "丈夫舅舅的儿子" },
  "sp,m,lb,d": { title: "丈夫的表妹", pinyin: "zhàng fu de biǎo mèi", call: "表妹", desc: "丈夫舅舅的女儿" },
  "sp,m,os,s": { title: "丈夫的表哥", pinyin: "zhàng fu de biǎo gē", call: "表哥", desc: "丈夫姨妈的儿子" },
  "sp,m,os,d": { title: "丈夫的表姐", pinyin: "zhàng fu de biǎo jiě", call: "表姐", desc: "丈夫姨妈的女儿" },
  "sp,m,ls,s": { title: "丈夫的表弟", pinyin: "zhàng fu de biǎo dì", call: "表弟", desc: "丈夫姨妈的儿子" },
  "sp,m,ls,d": { title: "丈夫的表妹", pinyin: "zhàng fu de biǎo mèi", call: "表妹", desc: "丈夫姨妈的女儿" },
  "sp,f,ob,s,sp": { title: "丈夫堂嫂", pinyin: "zhàng fu táng sǎo", call: "堂嫂", desc: "丈夫堂兄的妻子" },
  "sp,f,ob,d,sp": { title: "丈夫堂姐夫", pinyin: "zhàng fu táng jiě fu", call: "堂姐夫", desc: "丈夫堂姐的丈夫" },
  "sp,f,lb,s,sp": { title: "丈夫堂弟妹", pinyin: "zhàng fu táng dì mèi", call: "堂弟妹", desc: "丈夫堂弟的妻子" },
  "sp,f,lb,d,sp": { title: "丈夫堂妹夫", pinyin: "zhàng fu táng mèi fu", call: "堂妹夫", desc: "丈夫堂妹的丈夫" },
  "sp,f,os,s,sp": { title: "丈夫表嫂", pinyin: "zhàng fu biǎo sǎo", call: "表嫂", desc: "丈夫表哥的妻子" },
  "sp,f,os,d,sp": { title: "丈夫表姐夫", pinyin: "zhàng fu biǎo jiě fu", call: "表姐夫", desc: "丈夫表姐的丈夫" },
  "sp,f,ls,s,sp": { title: "丈夫表弟妹", pinyin: "zhàng fu biǎo dì mèi", call: "表弟妹", desc: "丈夫表弟的妻子" },
  "sp,f,ls,d,sp": { title: "丈夫表妹夫", pinyin: "zhàng fu biǎo mèi fu", call: "表妹夫", desc: "丈夫表妹的丈夫" },
  "sp,m,ob,s,sp": { title: "丈夫表嫂", pinyin: "zhàng fu biǎo sǎo", call: "表嫂", desc: "丈夫表哥的妻子" },
  "sp,m,ob,d,sp": { title: "丈夫表姐夫", pinyin: "zhàng fu biǎo jiě fu", call: "表姐夫", desc: "丈夫表姐的丈夫" },
  "sp,m,lb,s,sp": { title: "丈夫表弟妹", pinyin: "zhàng fu biǎo dì mèi", call: "表弟妹", desc: "丈夫表弟的妻子" },
  "sp,m,lb,d,sp": { title: "丈夫表妹夫", pinyin: "zhàng fu biǎo mèi fu", call: "表妹夫", desc: "丈夫表妹的丈夫" },
  "sp,m,os,s,sp": { title: "丈夫表嫂", pinyin: "zhàng fu biǎo sǎo", call: "表嫂", desc: "丈夫表哥的妻子" },
  "sp,m,os,d,sp": { title: "丈夫表姐夫", pinyin: "zhàng fu biǎo jiě fu", call: "表姐夫", desc: "丈夫表姐的丈夫" },
  "sp,m,ls,s,sp": { title: "丈夫表弟妹", pinyin: "zhàng fu biǎo dì mèi", call: "表弟妹", desc: "丈夫表弟的妻子" },
  "sp,m,ls,d,sp": { title: "丈夫表妹夫", pinyin: "zhàng fu biǎo mèi fu", call: "表妹夫", desc: "丈夫表妹的丈夫" },
  "sp,ob,s": { title: "侄子", pinyin: "zhí zi", call: "侄子", desc: "丈夫哥哥的儿子" },
  "sp,ob,d": { title: "侄女", pinyin: "zhí nǚ", call: "侄女", desc: "丈夫哥哥的女儿" },
  "sp,lb,s": { title: "侄子", pinyin: "zhí zi", call: "侄子", desc: "丈夫弟弟的儿子" },
  "sp,lb,d": { title: "侄女", pinyin: "zhí nǚ", call: "侄女", desc: "丈夫弟弟的女儿" },
  "sp,os,s": { title: "外甥", pinyin: "wài shēng", call: "外甥", desc: "丈夫姐姐的儿子" },
  "sp,os,d": { title: "外甥女", pinyin: "wài shēng nǚ", call: "外甥女", desc: "丈夫姐姐的女儿" },
  "sp,ls,s": { title: "外甥", pinyin: "wài shēng", call: "外甥", desc: "丈夫妹妹的儿子" },
  "sp,ls,d": { title: "外甥女", pinyin: "wài shēng nǚ", call: "外甥女", desc: "丈夫妹妹的女儿" },
  "sp,ob,s,sp": { title: "侄媳", pinyin: "zhí xí", call: "侄媳", desc: "丈夫哥哥儿子的妻子" },
  "sp,ob,d,sp": { title: "侄女婿", pinyin: "zhí nǚ xù", call: "侄女婿", desc: "丈夫哥哥女儿的丈夫" },
  "sp,lb,s,sp": { title: "侄媳", pinyin: "zhí xí", call: "侄媳", desc: "丈夫弟弟儿子的妻子" },
  "sp,lb,d,sp": { title: "侄女婿", pinyin: "zhí nǚ xù", call: "侄女婿", desc: "丈夫弟弟女儿的丈夫" },
  "sp,os,s,sp": { title: "外甥媳", pinyin: "wài shēng xí", call: "外甥媳", desc: "丈夫姐姐儿子的妻子" },
  "sp,os,d,sp": { title: "外甥女婿", pinyin: "wài shēng nǚ xù", call: "外甥女婿", desc: "丈夫姐姐女儿的丈夫" },
  "sp,ls,s,sp": { title: "外甥媳", pinyin: "wài shēng xí", call: "外甥媳", desc: "丈夫妹妹儿子的妻子" },
  "sp,ls,d,sp": { title: "外甥女婿", pinyin: "wài shēng nǚ xù", call: "外甥女婿", desc: "丈夫妹妹女儿的丈夫" },
  "sp,f,f,ob": { title: "伯祖翁", pinyin: "bó zǔ wēng", call: "伯公", desc: "丈夫爷爷的哥哥" },
  "sp,f,f,lb": { title: "叔祖翁", pinyin: "shū zǔ wēng", call: "叔公", desc: "丈夫爷爷的弟弟" },
  "sp,f,f,os": { title: "祖姑婆", pinyin: "zǔ gū pó", call: "姑婆", desc: "丈夫爷爷的姐妹" },
  "sp,f,f,ls": { title: "祖姑婆", pinyin: "zǔ gū pó", call: "姑婆", desc: "丈夫爷爷的姐妹" },
  "sp,f,m,ob": { title: "祖舅公", pinyin: "zǔ jiù gōng", call: "舅公", desc: "丈夫奶奶的兄弟" },
  "sp,f,m,lb": { title: "祖舅公", pinyin: "zǔ jiù gōng", call: "舅公", desc: "丈夫奶奶的兄弟" },
  "sp,f,m,os": { title: "祖姨婆", pinyin: "zǔ yí pó", call: "姨婆", desc: "丈夫奶奶的姐妹" },
  "sp,f,m,ls": { title: "祖姨婆", pinyin: "zǔ yí pó", call: "姨婆", desc: "丈夫奶奶的姐妹" },
  "sp,m,f,ob": { title: "外舅公", pinyin: "wài jiù gōng", call: "舅公", desc: "丈夫外公的兄弟" },
  "sp,m,f,lb": { title: "外舅公", pinyin: "wài jiù gōng", call: "舅公", desc: "丈夫外公的兄弟" },
  "sp,m,f,os": { title: "外姨婆", pinyin: "wài yí pó", call: "姨婆", desc: "丈夫外公的姐妹" },
  "sp,m,f,ls": { title: "外姨婆", pinyin: "wài yí pó", call: "姨婆", desc: "丈夫外公的姐妹" },
  "sp,m,m,ob": { title: "外舅公", pinyin: "wài jiù gōng", call: "舅公", desc: "丈夫外婆的兄弟" },
  "sp,m,m,lb": { title: "外舅公", pinyin: "wài jiù gōng", call: "舅公", desc: "丈夫外婆的兄弟" },
  "sp,m,m,os": { title: "外姨婆", pinyin: "wài yí pó", call: "姨婆", desc: "丈夫外婆的姐妹" },
  "sp,m,m,ls": { title: "外姨婆", pinyin: "wài yí pó", call: "姨婆", desc: "丈夫外婆的姐妹" },
  "sp,f,f,ob,sp": { title: "丈夫伯婆", pinyin: "zhàng fu bó pó", call: "伯婆", desc: "丈夫伯公的妻子" },
  "sp,f,f,lb,sp": { title: "丈夫婶婆", pinyin: "zhàng fu shěn pó", call: "婶婆", desc: "丈夫叔公的妻子" },
  "sp,f,f,os,sp": { title: "丈夫姑公", pinyin: "zhàng fu gū gōng", call: "姑公", desc: "丈夫姑婆的丈夫" },
  "sp,f,f,ls,sp": { title: "丈夫姑公", pinyin: "zhàng fu gū gōng", call: "姑公", desc: "丈夫姑婆的丈夫" },
  "sp,f,m,ob,sp": { title: "丈夫舅婆", pinyin: "zhàng fu jiù pó", call: "舅婆", desc: "丈夫舅公的妻子" },
  "sp,f,m,lb,sp": { title: "丈夫舅婆", pinyin: "zhàng fu jiù pó", call: "舅婆", desc: "丈夫舅公的妻子" },
  "sp,f,m,os,sp": { title: "丈夫姨公", pinyin: "zhàng fu yí gōng", call: "姨公", desc: "丈夫姨婆的丈夫" },
  "sp,f,m,ls,sp": { title: "丈夫姨公", pinyin: "zhàng fu yí gōng", call: "姨公", desc: "丈夫姨婆的丈夫" },
  "sp,m,f,ob,sp": { title: "丈夫舅婆", pinyin: "zhàng fu jiù pó", call: "舅婆", desc: "丈夫舅公的妻子" },
  "sp,m,f,lb,sp": { title: "丈夫舅婆", pinyin: "zhàng fu jiù pó", call: "舅婆", desc: "丈夫舅公的妻子" },
  "sp,m,f,os,sp": { title: "丈夫姨公", pinyin: "zhàng fu yí gōng", call: "姨公", desc: "丈夫姨婆的丈夫" },
  "sp,m,f,ls,sp": { title: "丈夫姨公", pinyin: "zhàng fu yí gōng", call: "姨公", desc: "丈夫姨婆的丈夫" },
  "sp,m,m,ob,sp": { title: "丈夫舅婆", pinyin: "zhàng fu jiù pó", call: "舅婆", desc: "丈夫舅公的妻子" },
  "sp,m,m,lb,sp": { title: "丈夫舅婆", pinyin: "zhàng fu jiù pó", call: "舅婆", desc: "丈夫舅公的妻子" },
  "sp,m,m,os,sp": { title: "丈夫姨公", pinyin: "zhàng fu yí gōng", call: "姨公", desc: "丈夫姨婆的丈夫" },
  "sp,m,m,ls,sp": { title: "丈夫姨公", pinyin: "zhàng fu yí gōng", call: "姨公", desc: "丈夫姨婆的丈夫" }
}

var relationMapFemaleEn = {
  "sp": { title: "Husband", pinyin: "", call: "Husband", desc: "One's spouse" },
  "sp,f": { title: "Father-in-law", pinyin: "", call: "Dad", desc: "Husband's father" },
  "sp,m": { title: "Mother-in-law", pinyin: "", call: "Mom", desc: "Husband's mother" },
  "sp,ob": { title: "Brother-in-law (Husband's Older Brother)", pinyin: "", call: "Brother", desc: "Husband's older brother" },
  "sp,lb": { title: "Brother-in-law (Husband's Younger Brother)", pinyin: "", call: "Brother", desc: "Husband's younger brother" },
  "sp,os": { title: "Sister-in-law (Husband's Older Sister)", pinyin: "", call: "Sister", desc: "Husband's older sister" },
  "sp,ls": { title: "Sister-in-law (Husband's Younger Sister)", pinyin: "", call: "Sister", desc: "Husband's younger sister" },
  "sp,f,f": { title: "Grandfather-in-law (Paternal)", pinyin: "", call: "Grandpa", desc: "Husband's paternal grandfather" },
  "sp,f,m": { title: "Grandmother-in-law (Paternal)", pinyin: "", call: "Grandma", desc: "Husband's paternal grandmother" },
  "sp,m,f": { title: "Grandfather-in-law (Maternal)", pinyin: "", call: "Grandpa", desc: "Husband's maternal grandfather" },
  "sp,m,m": { title: "Grandmother-in-law (Maternal)", pinyin: "", call: "Grandma", desc: "Husband's maternal grandmother" },
  "sp,ob,sp": { title: "Sister-in-law (Husband's Brother's Wife)", pinyin: "", call: "Sister-in-law", desc: "Husband's older brother's wife" },
  "sp,lb,sp": { title: "Sister-in-law (Husband's Brother's Wife)", pinyin: "", call: "Sister-in-law", desc: "Husband's younger brother's wife" },
  "sp,os,sp": { title: "Co-sister-in-law", pinyin: "", call: "Sister-in-law", desc: "Husband's older sister's husband" },
  "sp,ls,sp": { title: "Co-sister-in-law", pinyin: "", call: "Sister-in-law", desc: "Husband's younger sister's husband" },
  "sp,f,ob": { title: "Uncle-in-law (Husband's Paternal, Older)", pinyin: "", call: "Uncle", desc: "Husband's paternal uncle (older)" },
  "sp,f,lb": { title: "Uncle-in-law (Husband's Paternal, Younger)", pinyin: "", call: "Uncle", desc: "Husband's paternal uncle (younger)" },
  "sp,f,os": { title: "Aunt-in-law (Husband's Paternal, Older)", pinyin: "", call: "Aunt", desc: "Husband's paternal aunt (older)" },
  "sp,f,ls": { title: "Aunt-in-law (Husband's Paternal, Younger)", pinyin: "", call: "Aunt", desc: "Husband's paternal aunt (younger)" },
  "sp,m,ob": { title: "Uncle-in-law (Husband's Maternal, Older)", pinyin: "", call: "Uncle", desc: "Husband's maternal uncle (older)" },
  "sp,m,lb": { title: "Uncle-in-law (Husband's Maternal, Younger)", pinyin: "", call: "Uncle", desc: "Husband's maternal uncle (younger)" },
  "sp,m,os": { title: "Aunt-in-law (Husband's Maternal, Older)", pinyin: "", call: "Aunt", desc: "Husband's maternal aunt (older)" },
  "sp,m,ls": { title: "Aunt-in-law (Husband's Maternal, Younger)", pinyin: "", call: "Aunt", desc: "Husband's maternal aunt (younger)" },
  "sp,f,ob,sp": { title: "Aunt-in-law (Husband's Uncle's Wife, Paternal)", pinyin: "", call: "Aunt", desc: "Husband's paternal uncle's wife (older)" },
  "sp,f,lb,sp": { title: "Aunt-in-law (Husband's Uncle's Wife, Paternal)", pinyin: "", call: "Aunt", desc: "Husband's paternal uncle's wife (younger)" },
  "sp,f,os,sp": { title: "Uncle-in-law (Husband's Aunt's Husband, Paternal)", pinyin: "", call: "Uncle", desc: "Husband's paternal aunt's husband (older)" },
  "sp,f,ls,sp": { title: "Uncle-in-law (Husband's Aunt's Husband, Paternal)", pinyin: "", call: "Uncle", desc: "Husband's paternal aunt's husband (younger)" },
  "sp,m,ob,sp": { title: "Aunt-in-law (Husband's Uncle's Wife, Maternal)", pinyin: "", call: "Aunt", desc: "Husband's maternal uncle's wife (older)" },
  "sp,m,lb,sp": { title: "Aunt-in-law (Husband's Uncle's Wife, Maternal)", pinyin: "", call: "Aunt", desc: "Husband's maternal uncle's wife (younger)" },
  "sp,m,os,sp": { title: "Uncle-in-law (Husband's Aunt's Husband, Maternal)", pinyin: "", call: "Uncle", desc: "Husband's maternal aunt's husband (older)" },
  "sp,m,ls,sp": { title: "Uncle-in-law (Husband's Aunt's Husband, Maternal)", pinyin: "", call: "Uncle", desc: "Husband's maternal aunt's husband (younger)" },
  "sp,f,ob,s": { title: "Husband's Cousin (Paternal, Older Male)", pinyin: "", call: "Cousin", desc: "Husband's paternal uncle's son (older)" },
  "sp,f,ob,d": { title: "Husband's Cousin (Paternal, Older Female)", pinyin: "", call: "Cousin", desc: "Husband's paternal uncle's daughter (older)" },
  "sp,f,lb,s": { title: "Husband's Cousin (Paternal, Younger Male)", pinyin: "", call: "Cousin", desc: "Husband's paternal uncle's son (younger)" },
  "sp,f,lb,d": { title: "Husband's Cousin (Paternal, Younger Female)", pinyin: "", call: "Cousin", desc: "Husband's paternal uncle's daughter (younger)" },
  "sp,f,os,s": { title: "Husband's Cousin (Paternal Aunt's, Older Male)", pinyin: "", call: "Cousin", desc: "Husband's paternal aunt's son (older)" },
  "sp,f,os,d": { title: "Husband's Cousin (Paternal Aunt's, Older Female)", pinyin: "", call: "Cousin", desc: "Husband's paternal aunt's daughter (older)" },
  "sp,f,ls,s": { title: "Husband's Cousin (Paternal Aunt's, Younger Male)", pinyin: "", call: "Cousin", desc: "Husband's paternal aunt's son (younger)" },
  "sp,f,ls,d": { title: "Husband's Cousin (Paternal Aunt's, Younger Female)", pinyin: "", call: "Cousin", desc: "Husband's paternal aunt's daughter (younger)" },
  "sp,m,ob,s": { title: "Husband's Cousin (Maternal, Older Male)", pinyin: "", call: "Cousin", desc: "Husband's maternal uncle's son (older)" },
  "sp,m,ob,d": { title: "Husband's Cousin (Maternal, Older Female)", pinyin: "", call: "Cousin", desc: "Husband's maternal uncle's daughter (older)" },
  "sp,m,lb,s": { title: "Husband's Cousin (Maternal, Younger Male)", pinyin: "", call: "Cousin", desc: "Husband's maternal uncle's son (younger)" },
  "sp,m,lb,d": { title: "Husband's Cousin (Maternal, Younger Female)", pinyin: "", call: "Cousin", desc: "Husband's maternal uncle's daughter (younger)" },
  "sp,m,os,s": { title: "Husband's Cousin (Maternal Aunt's, Older Male)", pinyin: "", call: "Cousin", desc: "Husband's maternal aunt's son (older)" },
  "sp,m,os,d": { title: "Husband's Cousin (Maternal Aunt's, Older Female)", pinyin: "", call: "Cousin", desc: "Husband's maternal aunt's daughter (older)" },
  "sp,m,ls,s": { title: "Husband's Cousin (Maternal Aunt's, Younger Male)", pinyin: "", call: "Cousin", desc: "Husband's maternal aunt's son (younger)" },
  "sp,m,ls,d": { title: "Husband's Cousin (Maternal Aunt's, Younger Female)", pinyin: "", call: "Cousin", desc: "Husband's maternal aunt's daughter (younger)" },
  "sp,f,ob,s,sp": { title: "Husband's Cousin's Wife (Paternal, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Husband's paternal cousin's wife (older)" },
  "sp,f,ob,d,sp": { title: "Husband's Cousin's Husband (Paternal, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Husband's paternal cousin's husband (older)" },
  "sp,f,lb,s,sp": { title: "Husband's Cousin's Wife (Paternal, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Husband's paternal cousin's wife (younger)" },
  "sp,f,lb,d,sp": { title: "Husband's Cousin's Husband (Paternal, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Husband's paternal cousin's husband (younger)" },
  "sp,f,os,s,sp": { title: "Husband's Cousin's Wife (Paternal Aunt's Side)", pinyin: "", call: "Cousin's Wife", desc: "Husband's paternal cousin's wife (aunt's side)" },
  "sp,f,os,d,sp": { title: "Husband's Cousin's Husband (Paternal Aunt's Side)", pinyin: "", call: "Cousin's Husband", desc: "Husband's paternal cousin's husband (aunt's side)" },
  "sp,f,ls,s,sp": { title: "Husband's Cousin's Wife (Paternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Wife", desc: "Husband's paternal cousin's wife (aunt's side, younger)" },
  "sp,f,ls,d,sp": { title: "Husband's Cousin's Husband (Paternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Husband", desc: "Husband's paternal cousin's husband (aunt's side, younger)" },
  "sp,m,ob,s,sp": { title: "Husband's Cousin's Wife (Maternal, Older Male)", pinyin: "", call: "Cousin's Wife", desc: "Husband's maternal cousin's wife (older)" },
  "sp,m,ob,d,sp": { title: "Husband's Cousin's Husband (Maternal, Older Female)", pinyin: "", call: "Cousin's Husband", desc: "Husband's maternal cousin's husband (older)" },
  "sp,m,lb,s,sp": { title: "Husband's Cousin's Wife (Maternal, Younger Male)", pinyin: "", call: "Cousin's Wife", desc: "Husband's maternal cousin's wife (younger)" },
  "sp,m,lb,d,sp": { title: "Husband's Cousin's Husband (Maternal, Younger Female)", pinyin: "", call: "Cousin's Husband", desc: "Husband's maternal cousin's husband (younger)" },
  "sp,m,os,s,sp": { title: "Husband's Cousin's Wife (Maternal Aunt's Side)", pinyin: "", call: "Cousin's Wife", desc: "Husband's maternal cousin's wife (aunt's side)" },
  "sp,m,os,d,sp": { title: "Husband's Cousin's Husband (Maternal Aunt's Side)", pinyin: "", call: "Cousin's Husband", desc: "Husband's maternal cousin's husband (aunt's side)" },
  "sp,m,ls,s,sp": { title: "Husband's Cousin's Wife (Maternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Wife", desc: "Husband's maternal cousin's wife (aunt's side, younger)" },
  "sp,m,ls,d,sp": { title: "Husband's Cousin's Husband (Maternal Aunt's Side, Younger)", pinyin: "", call: "Cousin's Husband", desc: "Husband's maternal cousin's husband (aunt's side, younger)" },
  "sp,ob,s": { title: "Nephew (Husband's Brother's Son)", pinyin: "", call: "Nephew", desc: "Husband's older brother's son" },
  "sp,ob,d": { title: "Niece (Husband's Brother's Daughter)", pinyin: "", call: "Niece", desc: "Husband's older brother's daughter" },
  "sp,lb,s": { title: "Nephew (Husband's Brother's Son)", pinyin: "", call: "Nephew", desc: "Husband's younger brother's son" },
  "sp,lb,d": { title: "Niece (Husband's Brother's Daughter)", pinyin: "", call: "Niece", desc: "Husband's younger brother's daughter" },
  "sp,os,s": { title: "Nephew (Husband's Sister's Son)", pinyin: "", call: "Nephew", desc: "Husband's older sister's son" },
  "sp,os,d": { title: "Niece (Husband's Sister's Daughter)", pinyin: "", call: "Niece", desc: "Husband's older sister's daughter" },
  "sp,ls,s": { title: "Nephew (Husband's Sister's Son)", pinyin: "", call: "Nephew", desc: "Husband's younger sister's son" },
  "sp,ls,d": { title: "Niece (Husband's Sister's Daughter)", pinyin: "", call: "Niece", desc: "Husband's younger sister's daughter" },
  "sp,ob,s,sp": { title: "Niece-in-law (Husband's Brother's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Husband's older brother's son's wife" },
  "sp,ob,d,sp": { title: "Nephew-in-law (Husband's Brother's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Husband's older brother's daughter's husband" },
  "sp,lb,s,sp": { title: "Niece-in-law (Husband's Brother's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Husband's younger brother's son's wife" },
  "sp,lb,d,sp": { title: "Nephew-in-law (Husband's Brother's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Husband's younger brother's daughter's husband" },
  "sp,os,s,sp": { title: "Niece-in-law (Husband's Sister's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Husband's older sister's son's wife" },
  "sp,os,d,sp": { title: "Nephew-in-law (Husband's Sister's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Husband's older sister's daughter's husband" },
  "sp,ls,s,sp": { title: "Niece-in-law (Husband's Sister's Son's Wife)", pinyin: "", call: "Niece-in-law", desc: "Husband's younger sister's son's wife" },
  "sp,ls,d,sp": { title: "Nephew-in-law (Husband's Sister's Daughter's Husband)", pinyin: "", call: "Nephew-in-law", desc: "Husband's younger sister's daughter's husband" },
  "sp,f,f,ob": { title: "Great-uncle-in-law (Husband's Paternal, Older)", pinyin: "", call: "Great-uncle", desc: "Husband's paternal grandfather's older brother" },
  "sp,f,f,lb": { title: "Great-uncle-in-law (Husband's Paternal, Younger)", pinyin: "", call: "Great-uncle", desc: "Husband's paternal grandfather's younger brother" },
  "sp,f,f,os": { title: "Great-aunt-in-law (Husband's Paternal)", pinyin: "", call: "Great-aunt", desc: "Husband's paternal grandfather's sister" },
  "sp,f,f,ls": { title: "Great-aunt-in-law (Husband's Paternal)", pinyin: "", call: "Great-aunt", desc: "Husband's paternal grandfather's sister" },
  "sp,f,m,ob": { title: "Great-uncle-in-law (Husband's Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's paternal grandmother's brother" },
  "sp,f,m,lb": { title: "Great-uncle-in-law (Husband's Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's paternal grandmother's brother" },
  "sp,f,m,os": { title: "Great-aunt-in-law (Husband's Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's paternal grandmother's sister" },
  "sp,f,m,ls": { title: "Great-aunt-in-law (Husband's Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's paternal grandmother's sister" },
  "sp,m,f,ob": { title: "Great-uncle-in-law (Husband's Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's maternal grandfather's brother" },
  "sp,m,f,lb": { title: "Great-uncle-in-law (Husband's Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's maternal grandfather's brother" },
  "sp,m,f,os": { title: "Great-aunt-in-law (Husband's Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's maternal grandfather's sister" },
  "sp,m,f,ls": { title: "Great-aunt-in-law (Husband's Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's maternal grandfather's sister" },
  "sp,m,m,ob": { title: "Great-uncle-in-law (Husband's Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's maternal grandmother's brother" },
  "sp,m,m,lb": { title: "Great-uncle-in-law (Husband's Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's maternal grandmother's brother" },
  "sp,m,m,os": { title: "Great-aunt-in-law (Husband's Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's maternal grandmother's sister" },
  "sp,m,m,ls": { title: "Great-aunt-in-law (Husband's Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's maternal grandmother's sister" },
  "sp,f,f,ob,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Paternal)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (paternal)" },
  "sp,f,f,lb,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Paternal)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (paternal)" },
  "sp,f,f,os,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Paternal)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (paternal)" },
  "sp,f,f,ls,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Paternal)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (paternal)" },
  "sp,f,m,ob,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (paternal grandmother's side)" },
  "sp,f,m,lb,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Paternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (paternal grandmother's side)" },
  "sp,f,m,os,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (paternal grandmother's side)" },
  "sp,f,m,ls,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Paternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (paternal grandmother's side)" },
  "sp,m,f,ob,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (maternal grandfather's side)" },
  "sp,m,f,lb,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Maternal Grandfather's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (maternal grandfather's side)" },
  "sp,m,f,os,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (maternal grandfather's side)" },
  "sp,m,f,ls,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Maternal Grandfather's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (maternal grandfather's side)" },
  "sp,m,m,ob,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (maternal grandmother's side)" },
  "sp,m,m,lb,sp": { title: "Great-aunt-in-law (Husband's Great-uncle's Wife, Maternal Grandmother's Side)", pinyin: "", call: "Great-aunt", desc: "Husband's great-uncle's wife (maternal grandmother's side)" },
  "sp,m,m,os,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (maternal grandmother's side)" },
  "sp,m,m,ls,sp": { title: "Great-uncle-in-law (Husband's Great-aunt's Husband, Maternal Grandmother's Side)", pinyin: "", call: "Great-uncle", desc: "Husband's great-aunt's husband (maternal grandmother's side)" }
}

var quickRefData = {
  zhichang: {
    name: '直系长辈',
    items: [
      { relation: '父亲的父亲', title: '爷爷', call: '爷爷' },
      { relation: '父亲的母亲', title: '奶奶', call: '奶奶' },
      { relation: '母亲的父亲', title: '外公', call: '外公/姥爷' },
      { relation: '母亲的母亲', title: '外婆', call: '外婆/姥姥' },
      { relation: '父亲的哥哥', title: '伯父', call: '伯伯' },
      { relation: '父亲的弟弟', title: '叔叔', call: '叔叔' },
      { relation: '父亲的姐妹', title: '姑姑', call: '姑姑' },
      { relation: '母亲的兄弟', title: '舅舅', call: '舅舅' },
      { relation: '母亲的姐妹', title: '姨妈', call: '姨妈' }
    ]
  },
  tongbei: {
    name: '同辈亲属',
    items: [
      { relation: '父亲的兄弟的儿子', title: '堂兄弟', call: '堂哥/堂弟' },
      { relation: '父亲的兄弟的女儿', title: '堂姐妹', call: '堂姐/堂妹' },
      { relation: '姑/舅/姨的儿子', title: '表兄弟', call: '表哥/表弟' },
      { relation: '姑/舅/姨的女儿', title: '表姐妹', call: '表姐/表妹' },
      { relation: '哥哥的妻子', title: '嫂子', call: '嫂子' },
      { relation: '弟弟的妻子', title: '弟妹', call: '弟妹' },
      { relation: '姐姐的丈夫', title: '姐夫', call: '姐夫' },
      { relation: '妹妹的丈夫', title: '妹夫', call: '妹夫' }
    ]
  },
  wanbei: {
    name: '晚辈亲属',
    items: [
      { relation: '兄弟的儿子', title: '侄子', call: '侄子' },
      { relation: '兄弟的女儿', title: '侄女', call: '侄女' },
      { relation: '姐妹的儿子', title: '外甥', call: '外甥' },
      { relation: '姐妹的女儿', title: '外甥女', call: '外甥女' },
      { relation: '儿子的儿子', title: '孙子', call: '孙子' },
      { relation: '儿子的女儿', title: '孙女', call: '孙女' },
      { relation: '女儿的儿子', title: '外孙', call: '外孙' },
      { relation: '女儿的女儿', title: '外孙女', call: '外孙女' }
    ]
  },
  peiou: {
    name: '配偶亲属',
    items: [
      { relation: '妻子的父亲(男方)', title: '岳父', call: '爸' },
      { relation: '妻子的母亲(男方)', title: '岳母', call: '妈' },
      { relation: '丈夫的父亲(女方)', title: '公公', call: '爸' },
      { relation: '丈夫的母亲(女方)', title: '婆婆', call: '妈' },
      { relation: '妻子的哥哥', title: '大舅子', call: '哥' },
      { relation: '妻子的弟弟', title: '小舅子', call: '弟' },
      { relation: '丈夫的哥哥', title: '大伯子', call: '哥' },
      { relation: '丈夫的弟弟', title: '小叔子', call: '弟' }
    ]
  }
}

var dialectData = {
  beifang: {
    name: '北方方言',
    items: [
      { standard: '外公', dialect: '姥爷', region: '东北/华北' },
      { standard: '外婆', dialect: '姥姥', region: '东北/华北' },
      { standard: '伯父', dialect: '大爷', region: '山东/河北' },
      { standard: '叔叔', dialect: '叔/小爹', region: '河南/安徽' },
      { standard: '姑姑', dialect: '姑妈/姑娘', region: '东北' },
      { standard: '舅舅', dialect: '舅父/舅爸', region: '华北' },
      { standard: '妻子', dialect: '媳妇儿/对象', region: '东北/北京' },
      { standard: '丈夫', dialect: '老公/当家的', region: '北方通用' }
    ]
  },
  wu: {
    name: '吴语方言',
    items: [
      { standard: '外公', dialect: '阿公/外公', region: '苏南/浙北' },
      { standard: '外婆', dialect: '阿婆/好婆', region: '苏南/浙北' },
      { standard: '爷爷', dialect: '阿爹/爹爹', region: '上海/苏州' },
      { standard: '奶奶', dialect: '阿奶/好奶', region: '上海/苏州' },
      { standard: '伯父', dialect: '大伯/老伯', region: '吴语区' },
      { standard: '叔叔', dialect: '阿叔/爷叔', region: '上海' },
      { standard: '姑姑', dialect: '孃孃/阿姑', region: '吴语区' },
      { standard: '妻子', dialect: '家主婆/老太婆', region: '上海/苏南' }
    ]
  },
  yue: {
    name: '粤语方言',
    items: [
      { standard: '爷爷', dialect: '阿爷/爷爷', region: '广东/香港' },
      { standard: '奶奶', dialect: '阿嫲/嫲嫲', region: '广东/香港' },
      { standard: '外公', dialect: '阿公/公公', region: '广东' },
      { standard: '外婆', dialect: '阿婆/婆婆', region: '广东' },
      { standard: '伯父', dialect: '伯爷/大伯', region: '广东' },
      { standard: '叔叔', dialect: '阿叔/叔仔', region: '广东' },
      { standard: '姑姑', dialect: '姑姐/姑妈', region: '广东' },
      { standard: '妻子', dialect: '老婆/太太', region: '广东/香港' }
    ]
  },
  min: {
    name: '闽语方言',
    items: [
      { standard: '爷爷', dialect: '阿公/安公', region: '福建/台湾' },
      { standard: '奶奶', dialect: '阿嬷/安嬷', region: '福建/台湾' },
      { standard: '外公', dialect: '外阿公', region: '闽南' },
      { standard: '外婆', dialect: '外阿嬷', region: '闽南' },
      { standard: '伯父', dialect: '阿伯/大伯', region: '福建' },
      { standard: '叔叔', dialect: '阿叔/小叔', region: '福建' },
      { standard: '姑姑', dialect: '阿姑/姑仔', region: '闽南' },
      { standard: '妻子', dialect: '某/牵手', region: '闽南' }
    ]
  },
  xiang: {
    name: '湘语方言',
    items: [
      { standard: '爷爷', dialect: '爹爹/公公', region: '湖南' },
      { standard: '奶奶', dialect: '娭毑/奶奶', region: '湖南' },
      { standard: '外公', dialect: '嘎公/外公', region: '湖南' },
      { standard: '外婆', dialect: '嘎婆/外婆', region: '湖南' },
      { standard: '伯父', dialect: '伯伯/大爹', region: '湖南' },
      { standard: '叔叔', dialect: '满满/叔子', region: '湖南' },
      { standard: '姑姑', dialect: '姑娭/姑娘', region: '湖南' },
      { standard: '妻子', dialect: '堂客/老婆', region: '湖南' }
    ]
  }
}

var quickRefDataEn = {
  zhichang: {
    name: 'Direct Elders',
    items: [
      { relation: "Father's father", title: 'Grandfather', call: 'Grandpa' },
      { relation: "Father's mother", title: 'Grandmother', call: 'Grandma' },
      { relation: "Mother's father", title: 'Grandfather', call: 'Grandpa (Maternal)' },
      { relation: "Mother's mother", title: 'Grandmother', call: 'Grandma (Maternal)' },
      { relation: "Father's older brother", title: 'Uncle', call: 'Uncle (Paternal)' },
      { relation: "Father's younger brother", title: 'Uncle', call: 'Uncle (Paternal)' },
      { relation: "Father's sister", title: 'Aunt', call: 'Aunt (Paternal)' },
      { relation: "Mother's brother", title: 'Uncle', call: 'Uncle (Maternal)' },
      { relation: "Mother's sister", title: 'Aunt', call: 'Aunt (Maternal)' }
    ]
  },
  tongbei: {
    name: 'Same Generation',
    items: [
      { relation: "Father's brother's son", title: 'Male Cousin', call: 'Cousin (Paternal)' },
      { relation: "Father's brother's daughter", title: 'Female Cousin', call: 'Cousin (Paternal)' },
      { relation: "Aunt/Uncle's son", title: 'Male Cousin', call: 'Cousin (Maternal)' },
      { relation: "Aunt/Uncle's daughter", title: 'Female Cousin', call: 'Cousin (Maternal)' },
      { relation: "Older brother's wife", title: 'Sister-in-law', call: 'Sister-in-law' },
      { relation: "Younger brother's wife", title: 'Sister-in-law', call: 'Sister-in-law' },
      { relation: "Older sister's husband", title: 'Brother-in-law', call: 'Brother-in-law' },
      { relation: "Younger sister's husband", title: 'Brother-in-law', call: 'Brother-in-law' }
    ]
  },
  wanbei: {
    name: 'Younger Generation',
    items: [
      { relation: "Brother's son", title: 'Nephew', call: 'Nephew' },
      { relation: "Brother's daughter", title: 'Niece', call: 'Niece' },
      { relation: "Sister's son", title: 'Nephew', call: 'Nephew' },
      { relation: "Sister's daughter", title: 'Niece', call: 'Niece' },
      { relation: "Son's son", title: 'Grandson', call: 'Grandson' },
      { relation: "Son's daughter", title: 'Granddaughter', call: 'Granddaughter' },
      { relation: "Daughter's son", title: 'Grandson', call: 'Grandson (Maternal)' },
      { relation: "Daughter's daughter", title: 'Granddaughter', call: 'Granddaughter (Maternal)' }
    ]
  },
  peiou: {
    name: "Spouse's Family",
    items: [
      { relation: "Wife's father", title: 'Father-in-law', call: 'Dad' },
      { relation: "Wife's mother", title: 'Mother-in-law', call: 'Mom' },
      { relation: "Husband's father", title: 'Father-in-law', call: 'Dad' },
      { relation: "Husband's mother", title: 'Mother-in-law', call: 'Mom' },
      { relation: "Wife's older brother", title: 'Brother-in-law', call: 'Brother' },
      { relation: "Wife's younger brother", title: 'Brother-in-law', call: 'Brother' },
      { relation: "Husband's older brother", title: 'Brother-in-law', call: 'Brother' },
      { relation: "Husband's younger brother", title: 'Brother-in-law', call: 'Brother' }
    ]
  }
}

var dialectDataEn = {
  beifang: {
    name: 'Northern',
    items: [
      { standard: 'Maternal Grandfather', dialect: 'Laoye', region: 'Northeast & North China' },
      { standard: 'Maternal Grandmother', dialect: 'Laolao', region: 'Northeast & North China' },
      { standard: "Father's Older Brother", dialect: 'Daye', region: 'Shandong & Hebei' },
      { standard: "Father's Younger Brother", dialect: 'Shu / Xiaodie', region: 'Henan & Anhui' },
      { standard: "Father's Sister", dialect: 'Guma / Guniang', region: 'Northeast' },
      { standard: "Mother's Brother", dialect: 'Jiufu / Jiuba', region: 'North China' },
      { standard: 'Wife', dialect: 'Xifur / Duixiang', region: 'Northeast & Beijing' },
      { standard: 'Husband', dialect: 'Laogong / Dangjiade', region: 'Northern General' }
    ]
  },
  wu: {
    name: 'Wu',
    items: [
      { standard: 'Maternal Grandfather', dialect: 'Agong / Waigong', region: 'S. Jiangsu & N. Zhejiang' },
      { standard: 'Maternal Grandmother', dialect: 'Apo / Haopo', region: 'S. Jiangsu & N. Zhejiang' },
      { standard: 'Paternal Grandfather', dialect: 'Adie / Diedie', region: 'Shanghai & Suzhou' },
      { standard: 'Paternal Grandmother', dialect: 'Anai / Haonai', region: 'Shanghai & Suzhou' },
      { standard: "Father's Older Brother", dialect: 'Dabo / Laobo', region: 'Wu Region' },
      { standard: "Father's Younger Brother", dialect: 'Ashu / Yeshu', region: 'Shanghai' },
      { standard: "Father's Sister", dialect: 'Niagniang / Agu', region: 'Wu Region' },
      { standard: 'Wife', dialect: 'Jiazhupo / Laotaipo', region: 'Shanghai & S. Jiangsu' }
    ]
  },
  yue: {
    name: 'Cantonese',
    items: [
      { standard: 'Paternal Grandfather', dialect: 'Aye / Yeye', region: 'Guangdong & Hong Kong' },
      { standard: 'Paternal Grandmother', dialect: 'Ama / Mama', region: 'Guangdong & Hong Kong' },
      { standard: 'Maternal Grandfather', dialect: 'Agong / Gonggong', region: 'Guangdong' },
      { standard: 'Maternal Grandmother', dialect: 'Apo / Popo', region: 'Guangdong' },
      { standard: "Father's Older Brother", dialect: 'Boye / Dabo', region: 'Guangdong' },
      { standard: "Father's Younger Brother", dialect: 'Ashu / Shuzai', region: 'Guangdong' },
      { standard: "Father's Sister", dialect: 'Gujie / Guma', region: 'Guangdong' },
      { standard: 'Wife', dialect: 'Laopo / Taitai', region: 'Guangdong & Hong Kong' }
    ]
  },
  min: {
    name: 'Min',
    items: [
      { standard: 'Paternal Grandfather', dialect: 'Agong / Angong', region: 'Fujian & Taiwan' },
      { standard: 'Paternal Grandmother', dialect: 'Amo / Anmo', region: 'Fujian & Taiwan' },
      { standard: 'Maternal Grandfather', dialect: 'Wai Agong', region: 'Southern Fujian' },
      { standard: 'Maternal Grandmother', dialect: 'Wai Amo', region: 'Southern Fujian' },
      { standard: "Father's Older Brother", dialect: 'Abo / Dabo', region: 'Fujian' },
      { standard: "Father's Younger Brother", dialect: 'Ashu / Xiaoshu', region: 'Fujian' },
      { standard: "Father's Sister", dialect: 'Agu / Guzai', region: 'Southern Fujian' },
      { standard: 'Wife', dialect: 'Mou / Qianshou', region: 'Southern Fujian' }
    ]
  },
  xiang: {
    name: 'Xiang',
    items: [
      { standard: 'Paternal Grandfather', dialect: 'Die / Gonggong', region: 'Hunan' },
      { standard: 'Paternal Grandmother', dialect: 'Aijie / Nainai', region: 'Hunan' },
      { standard: 'Maternal Grandfather', dialect: 'Gagong / Waigong', region: 'Hunan' },
      { standard: 'Maternal Grandmother', dialect: 'Gapo / Waipo', region: 'Hunan' },
      { standard: "Father's Older Brother", dialect: 'Bobo / Dadie', region: 'Hunan' },
      { standard: "Father's Younger Brother", dialect: 'Manman / Shuzi', region: 'Hunan' },
      { standard: "Father's Sister", dialect: 'Guai / Guniang', region: 'Hunan' },
      { standard: 'Wife', dialect: 'Tangke / Laopo', region: 'Hunan' }
    ]
  }
}

Page({
  data: {
    i18n: {},
    gender: '',
    chain: [],
    chainDisplay: '',
    result: null,
    history: [],
    stepButtons: [
      { code: 'f', label: '爸爸', icon: '👨' },
      { code: 'm', label: '妈妈', icon: '👩' },
      { code: 's', label: '儿子', icon: '👦' },
      { code: 'd', label: '女儿', icon: '👧' },
      { code: 'ob', label: '哥哥', icon: '👦' },
      { code: 'lb', label: '弟弟', icon: '👦' },
      { code: 'os', label: '姐姐', icon: '👧' },
      { code: 'ls', label: '妹妹', icon: '👧' },
      { code: 'sp', label: '配偶', icon: '💍', isSpouse: true }
    ],

    isDarkMode: false,
    fontSizeSetting: 'medium',
    activeTab: 'query',
    quickRefCategory: 'zhichang',
    dialectRegion: 'beifang',
    chainNodes: []
  },

  _updateI18nData: function() {
    var i18nTexts = i18n.getToolPageTexts('relativeCall')
    var stepLabelMap = {
      f: i18nTexts.stepFather, m: i18nTexts.stepMother,
      s: i18nTexts.stepSon, d: i18nTexts.stepDaughter,
      ob: i18nTexts.stepOlderBrother, lb: i18nTexts.stepYoungerBrother,
      os: i18nTexts.stepOlderSister, ls: i18nTexts.stepYoungerSister,
      sp: i18nTexts.stepSpouse
    }
    var stepButtons = this.data.stepButtons.slice()
    for (var i = 0; i < stepButtons.length; i++) {
      if (stepLabelMap[stepButtons[i].code]) {
        stepButtons[i].label = stepLabelMap[stepButtons[i].code]
      }
    }
    var catNameMap = {
      zhichang: i18nTexts.catDirectElder, tongbei: i18nTexts.catSameGen,
      wanbei: i18nTexts.catYounger, peiou: i18nTexts.catSpouse
    }
    var quickRefCategories = this.data.quickRefCategories.slice()
    for (var j = 0; j < quickRefCategories.length; j++) {
      if (catNameMap[quickRefCategories[j].key]) {
        quickRefCategories[j].name = catNameMap[quickRefCategories[j].key]
      }
    }
    var dialectNameMap = {
      beifang: i18nTexts.dialectNorth, wu: i18nTexts.dialectWu,
      yue: i18nTexts.dialectYue, min: i18nTexts.dialectMin, xiang: i18nTexts.dialectXiang
    }
    var dialectRegions = this.data.dialectRegions.slice()
    for (var k = 0; k < dialectRegions.length; k++) {
      if (dialectNameMap[dialectRegions[k].key]) {
        dialectRegions[k].name = dialectNameMap[dialectRegions[k].key]
      }
    }
    var lang = i18n.getLanguage()
    var currentQuickRefData = lang === 'en' ? quickRefDataEn : quickRefData
    var currentDialectData = lang === 'en' ? dialectDataEn : dialectData
    var quickRefCategory = this.data.quickRefCategory || 'zhichang'
    var dialectRegion = this.data.dialectRegion || 'beifang'
    var quickRefItems = currentQuickRefData[quickRefCategory] ? currentQuickRefData[quickRefCategory].items : []
    var dialectItems = currentDialectData[dialectRegion] ? currentDialectData[dialectRegion].items : []
    this.setData({
      i18n: i18nTexts,
      stepButtons: stepButtons,
      quickRefCategories: quickRefCategories,
      dialectRegions: dialectRegions,
      quickRefItems: quickRefItems,
      dialectItems: dialectItems
    })
  },

  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    var tracker = getApp().tracker
    if (tracker) tracker.pageView('亲戚称谓')
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })

    var history = []
    try {
      history = storageUtil.safeGetArray('relative_call_history')
    } catch (e) {
      history = []
    }
    this.setData({ history: history })
    poster.setupForPage(this, 29)

    var lang = i18n.getLanguage()
    var currentQuickRefData = lang === 'en' ? quickRefDataEn : quickRefData
    var currentDialectData = lang === 'en' ? dialectDataEn : dialectData

    var quickRefCategories = []
    var quickRefKeys = ['zhichang', 'tongbei', 'wanbei', 'peiou']
    for (var i = 0; i < quickRefKeys.length; i++) {
      quickRefCategories.push({ key: quickRefKeys[i], name: currentQuickRefData[quickRefKeys[i]].name })
    }
    var quickRefItems = currentQuickRefData.zhichang.items

    var dialectRegions = []
    var dialectKeys = ['beifang', 'wu', 'yue', 'min', 'xiang']
    for (var j = 0; j < dialectKeys.length; j++) {
      dialectRegions.push({ key: dialectKeys[j], name: currentDialectData[dialectKeys[j]].name })
    }
    var dialectItems = currentDialectData.beifang.items

    this.setData({
      quickRefCategories: quickRefCategories,
      quickRefItems: quickRefItems,
      dialectRegions: dialectRegions,
      dialectItems: dialectItems
    })

    this._updateI18nData()
  },

  onShow: function() {
    var app = getApp()
    var isDark = app.globalData.isDarkMode || false
    this.setData({ isDarkMode: isDark })
    var fontSize = storageUtil.get('fontSizeSetting', 'medium')
    this.setData({ fontSizeSetting: fontSize })
    this._updateI18nData()
  },

  onGenderSelect: function (e) {
    wx.vibrateShort({ type: 'light' })
    var gender = e.currentTarget.dataset.gender
    this.setData({
      gender: gender,
      chain: [],
      chainDisplay: '',
      result: null
    })
  },

  onStepSelect: function (e) {
    wx.vibrateShort({ type: 'light' })
    var code = e.currentTarget.dataset.code
    var label = e.currentTarget.dataset.label
    var chain = this.data.chain.slice()
    chain.push({ code: code, label: label })
    var chainDisplay = this.buildChainDisplay(chain)
    this.setData({
      chain: chain,
      chainDisplay: chainDisplay
    })
    this.lookupRelation(chain)
    this.buildChainNodes()
  },

  onBackStep: function () {
    wx.vibrateShort({ type: 'medium' })
    var chain = this.data.chain.slice()
    if (chain.length === 0) return
    chain.pop()
    var chainDisplay = this.buildChainDisplay(chain)
    var result = null
    if (chain.length > 0) {
      result = this.lookupRelationSync(chain)
    }
    this.setData({
      chain: chain,
      chainDisplay: chainDisplay,
      result: result
    })
    this.buildChainNodes()
  },

  onReset: function () {
    wx.vibrateShort({ type: 'medium' })
    this.setData({
      chain: [],
      chainDisplay: '',
      result: null
    })
    this.buildChainNodes()
  },

  onHistoryTap: function (e) {
    wx.vibrateShort({ type: 'light' })
    var index = e.currentTarget.dataset.index
    var record = this.data.history[index]
    if (!record) return
    var chain = []
    for (var i = 0; i < record.codes.length; i++) {
      chain.push({ code: record.codes[i], label: record.labels[i] })
    }
    var chainDisplay = this.buildChainDisplay(chain)
    this.setData({
      chain: chain,
      chainDisplay: chainDisplay,
      result: this.lookupRelationSync(chain)
    })
    this.buildChainNodes()
  },

  onClearHistory: function () {
    wx.vibrateShort({ type: 'medium' })
    this.setData({ history: [] })
    try {
      wx.setStorageSync('relative_call_history', [])
    } catch (e) {}
  },

  buildChainDisplay: function (chain) {
    var i18nTexts = this.data.i18n || {}
    var separator = i18nTexts.chainSeparator || '的'
    var display = ''
    for (var i = 0; i < chain.length; i++) {
      display += chain[i].label
      if (i < chain.length - 1) {
        display += separator
      }
    }
    return display
  },

  buildChainNodes: function() {
    var chain = this.data.chain
    var result = this.data.result
    var i18nTexts = this.data.i18n || {}
    var meLabel = i18nTexts.me || '我'
    var nodes = []
    nodes.push({ id: 'me', label: meLabel, type: 'me' })
    for (var i = 0; i < chain.length; i++) {
      nodes.push({ id: 'step_' + i, label: chain[i].label, type: chain[i].code === 'sp' ? 'spouse' : 'relative', code: chain[i].code })
    }
    if (result) {
      nodes.push({ id: 'result', label: result.title, type: 'result' })
    }
    this.setData({ chainNodes: nodes })
  },

  getChainKey: function (chain) {
    var key = ''
    for (var i = 0; i < chain.length; i++) {
      if (i > 0) key += ','
      key += chain[i].code
    }
    return key
  },

  lookupRelationSync: function (chain) {
    var key = this.getChainKey(chain)
    var result = null
    var isEn = i18n.getLanguage() === 'en'
    if (this.data.gender === 'male') {
      if (isEn && relationMapMaleEn[key]) {
        result = relationMapMaleEn[key]
      } else if (relationMapMale[key]) {
        result = relationMapMale[key]
      }
    } else if (this.data.gender === 'female') {
      if (isEn && relationMapFemaleEn[key]) {
        result = relationMapFemaleEn[key]
      } else if (relationMapFemale[key]) {
        result = relationMapFemale[key]
      }
    }
    if (!result) {
      if (isEn && relationMapEn[key]) {
        result = relationMapEn[key]
      } else if (relationMap[key]) {
        result = relationMap[key]
      }
    }
    return result
  },

  lookupRelation: function (chain) {
    var result = this.lookupRelationSync(chain)
    if (result) {
      this.addToHistory(chain, result)
      var tracker = getApp().tracker
      if (tracker) tracker.toolUse(29, '亲戚称谓', false)
    }
    this.setData({ result: result })
    this.buildChainNodes()
  },

  addToHistory: function (chain, result) {
    var i18nTexts = this.data.i18n || {}
    var separator = i18nTexts.chainSeparator || '的'
    var chainText = ''
    var codes = []
    var labels = []
    for (var i = 0; i < chain.length; i++) {
      chainText += chain[i].label
      if (i < chain.length - 1) chainText += separator
      codes.push(chain[i].code)
      labels.push(chain[i].label)
    }

    var now = new Date()
    var time = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() + ' ' + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()

    var record = {
      chainText: chainText,
      codes: codes,
      labels: labels,
      title: result.title,
      call: result.call,
      time: time
    }

    var history = this.data.history.slice()
    for (var i = 0; i < history.length; i++) {
      if (history[i].chainText === record.chainText) {
        history.splice(i, 1)
        break
      }
    }
    history.unshift(record)
    if (history.length > 10) {
      history = history.slice(0, 10)
    }

    this.setData({ history: history })
    try {
      wx.setStorageSync('relative_call_history', history)
    } catch (e) {}
  },

  copyResult: function() {
    var result = this.data.result
    var i18nTexts = this.data.i18n || {}
    var copyFormat = i18nTexts.copyFormat || '叫'
    var text = ''
    if (result) {
      text = this.data.chainDisplay + ' → ' + result.title + '（' + copyFormat + result.call + '）'
    }
    toolActions.copyText(text)
  },

  resetData: function() {
    var that = this
    toolActions.resetConfirm(function() {
      that.setData({
        gender: '',
        chain: [],
        chainDisplay: '',
        result: null
      })
    })
  },

  onTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  onQuickRefCategory: function(e) {
    var category = e.currentTarget.dataset.category
    var lang = i18n.getLanguage()
    var data = lang === 'en' ? quickRefDataEn : quickRefData
    var items = data[category] ? data[category].items : []
    this.setData({ quickRefCategory: category, quickRefItems: items })
  },

  onDialectRegion: function(e) {
    var region = e.currentTarget.dataset.region
    var lang = i18n.getLanguage()
    var data = lang === 'en' ? dialectDataEn : dialectData
    var items = data[region] ? data[region].items : []
    this.setData({ dialectRegion: region, dialectItems: items })
  },

  onQuickRefItemTap: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var category = this.data.quickRefCategory
    var lang = i18n.getLanguage()
    var data = lang === 'en' ? quickRefDataEn : quickRefData
    var item = data[category].items[index]
    if (!item) return
    wx.vibrateShort({ type: 'light' })
    wx.setClipboardData({
      data: item.title + '(' + item.call + ')',
      success: function() {
        wx.showToast({ title: that.data.i18n.copied, icon: 'success' })
      }
    })
  },

  onShareAppMessage: function() {
    return poster.getShareConfig('👨‍👩‍👧‍👦 亲戚称谓 - 百宝工具箱', '/package-life/relative-call/relative-call')
  },

  onShareTimeline: function() {
    return poster.getTimelineConfig('👨‍👩‍👧‍👦 亲戚称谓 - 百宝工具箱')
  }
})
