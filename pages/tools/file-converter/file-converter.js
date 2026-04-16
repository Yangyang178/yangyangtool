Page({
  data: {
    searchKeyword: '',
    currentCategory: 'all',
    showDetail: false,
    selectedFormat: null,

    categories: [
      { id: 'all', name: '全部', icon: '📋' },
      { id: 'image', name: '图片', icon: '🖼️' },
      { id: 'video', name: '视频', icon: '🎬' },
      { id: 'audio', name: '音频', icon: '🎵' },
      { id: 'document', name: '文档', icon: '📄' },
      { id: 'archive', name: '压缩包', icon: '📦' }
    ],

    formats: [
      {
        ext: '.jpg',
        name: 'JPEG',
        category: 'image',
        categoryName: '图片',
        description: '最常见的有损压缩图片格式',
        features: ['有损压缩', '体积小', '全平台支持'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'JPEG (Joint Photographic Experts Group) 是最广泛使用的图片格式之一，采用有损压缩算法，能在保持较好画质的同时显著减小文件大小。适合照片、复杂图像等场景。',
        pros: ['兼容性极好', '文件体积小', '加载速度快', '所有设备支持'],
        cons: ['有损压缩', '不支持透明', '多次保存质量下降'],
        convertMethods: [
          {
            name: '在线转换',
            steps: '使用 TinyPNG、Squoosh 等在线工具'
          },
          {
            name: '系统自带',
            steps: 'Windows画图、macOS预览均可另存为JPG'
          },
          {
            name: '专业软件',
            steps: 'Photoshop、GIMP 等导出时选择JPG格式'
          }
        ]
      },
      {
        ext: '.png',
        name: 'PNG',
        category: 'image',
        categoryName: '图片',
        description: '无损压缩图片格式，支持透明通道',
        features: ['无损压缩', '透明背景', '清晰度高'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'PNG (Portable Network Graphics) 是一种无损压缩位图图形格式，支持透明背景和24位真彩色。适合图标、截图、文字图片等需要保持清晰度的场景。',
        pros: ['无损压缩', '支持透明', '适合图标/截图', '无损编辑'],
        cons: ['文件较大', '不适合照片', '不支持动画'],
        convertMethods: [
          {
            name: '在线转换',
            steps: '使用 Convertio、CloudConvert 等工具'
          },
          {
            name: '系统自带',
            steps: '右键图片 → 编辑 → 另存为PNG'
          },
          {
            name: '命令行',
            steps: 'ImageMagick: convert input.jpg output.png'
          }
        ]
      },
      {
        ext: '.webp',
        name: 'WebP',
        category: 'image',
        categoryName: '图片',
        description: 'Google开发的新一代高效图片格式',
        features: ['超小体积', '高画质', '现代浏览器'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'WebP 是 Google 开发的现代图片格式，同时支持有损和无损压缩。相比 JPG 小25-35%，比 PNG 小80%，是Web优化的理想选择。',
        pros: ['体积最小', '质量优秀', '支持动画', '支持透明'],
        cons: ['旧版软件不支持', '部分旧浏览器不兼容'],
        convertMethods: [
          {
            name: '在线转换',
            steps: '使用 Squoish.app（Google官方）或 CloudConvert'
          },
          {
            name: '命令行',
            steps: 'cwebp -q 80 input.jpg -o output.webp'
          }
        ]
      },
      {
        ext: '.gif',
        name: 'GIF',
        category: 'image',
        categoryName: '图片',
        description: '支持动画的经典图片格式',
        features: ['支持动画', '简单透明', '广泛支持'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'GIF (Graphics Interchange Format) 是一种支持动画的位图格式，采用LZW无损压缩算法。虽然历史悠久，但在表情包、简单动画场景仍被广泛使用。',
        pros: ['支持动画', '兼容性好', '适合表情包'],
        cons: ['只有256色', '文件通常很大', '画质一般'],
        convertMethods: [
          {
            name: '视频转GIF',
            steps: '使用 EZGIF.com 或 Giphy 上传视频'
          },
          {
            name: 'FFmpeg命令',
            steps: 'ffmpeg -i video.mp4 -vf "fps=10,scale=320:-1" output.gif'
          }
        ]
      },
      {
        ext: '.svg',
        name: 'SVG',
        category: 'image',
        categoryName: '图片',
        description: '可缩放矢量图形格式',
        features: ['矢量图', '无限缩放', '文件小'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'SVG (Scalable Vector Graphics) 是基于XML的矢量图像格式，可以无限放大而不失真。适合Logo、图标、图表等需要多尺寸使用的场景。',
        pros: ['无限缩放不失真', '文件体积小', '可用代码编辑', '可添加动画'],
        cons: ['不适合照片', '复杂图形文件大', '渲染性能较低'],
        convertMethods: [
          {
            name: '设计软件导出',
            steps: 'Illustrator、Figma、Sketch 直接导出SVG'
          },
          {
            name: '在线转换',
            steps: '使用 SVGOMG 优化或 Convertio 转换'
          }
        ]
      },
      {
        ext: '.mp4',
        name: 'MP4',
        category: 'video',
        categoryName: '视频',
        description: '最通用的视频容器格式',
        features: ['通用性强', '压缩效率高', '流媒体支持'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'MPEG-4 Part 14 (MP4) 是最流行的数字多媒体容器格式，支持视频、音频、字幕等。基于H.264/AVC或H.265/HEVC编码，是网络视频的标准格式。',
        pros: ['全平台支持', '压缩效率高', '支持高清/4K', '适合流媒体'],
        cons: ['版权限制', '编辑时需重编码'],
        convertMethods: [
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4'
          },
          {
            name: 'HandBrake',
            steps: '开源免费的视频转换工具，界面友好'
          },
          {
            name: '在线转换',
            steps: 'CloudConvert、OnlineConvert 等网站'
          }
        ]
      },
      {
        ext: '.avi',
        name: 'AVI',
        category: 'video',
        categoryName: '视频',
        description: '微软开发的传统视频格式',
        features: ['老牌格式', '无损支持', '兼容性好'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: false,
        web: false,
        fullDesc: 'Audio Video Interleave (AVI) 是微软1992年推出的多媒体容器格式。虽然年代久远，但由于其开放性和无损支持，在某些领域仍有应用。',
        pros: ['无损视频支持', '开放标准', '老设备兼容'],
        cons: ['文件体积大', '不支持现代编码', '网页不支持'],
        convertMethods: [
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.mp4 -c:v copy -c:a copy output.avi'
          }
        ]
      },
      {
        ext: '.mov',
        name: 'MOV',
        category: 'video',
        categoryName: '视频',
        description: 'Apple QuickTime视频格式',
        features: ['高质量', 'Apple生态', '专业编辑'],
        windows: true,
        mac: true,
        linux: false,
        android: false,
        ios: true,
        web: false,
        fullDesc: 'QuickTime File Format (MOV) 是苹果公司开发的视频容器格式，在专业视频制作和Apple生态系统中被广泛使用。支持高保真视频和无损音频。',
        pros: ['极高画质', '专业剪辑首选', 'Apple原生支持'],
        cons: ['跨平台兼容差', '文件通常较大'],
        convertMethods: [
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.mp4 -c:v copy -c:a copy output.mov'
          },
          {
            name: 'HandBrake',
            steps: '选择 MOV 容器格式输出'
          }
        ]
      },
      {
        ext: '.mkv',
        name: 'MKV',
        category: 'video',
        categoryName: '视频',
        description: 'Matroska开放多媒体容器',
        features: ['开放标准', '功能强大', '多轨道支持'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: false,
        fullDesc: 'Matroska Video (MKV) 是一个开放标准的免费容器格式，能容纳任意数量的视频、音频、字幕轨道。是高清影视收藏的首选格式。',
        pros: ['开放免费', '支持多音轨/字幕', '章节支持', '元数据丰富'],
        cons: ['部分播放器不支持', '移动端兼容一般'],
        convertMethods: [
          {
            name: 'MKVToolNix',
            steps: '专业的MKV编辑和封装工具'
          },
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.mp4 -c copy output.mkv'
          }
        ]
      },
      {
        ext: '.webm',
        name: 'WebM',
        category: 'video',
        categoryName: '视频',
        description: '专为Web优化的视频格式',
        features: ['开源免费', 'Web优化', '体积小'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'WebM 是专为Web设计的开放媒体格式，基于 VP8/VP9 视频编码和 Vorbis/Opus 音频编码。由Google推动，是HTML5视频的标准格式之一。',
        pros: ['完全开源', '压缩效率高', '浏览器原生支持', '适合嵌入网页'],
        cons: ['非编软件支持少', '硬件加速有限'],
        convertMethods: [
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.mp4 -c:v libvpx-vp9 -c:a libopus output.webm'
          },
          {
            name: 'Miro Video Converter',
            steps: '免费的桌面视频转换工具'
          }
        ]
      },
      {
        ext: '.mp3',
        name: 'MP3',
        category: 'audio',
        categoryName: '音频',
        description: '最流行的有损音频压缩格式',
        features: ['通用性好', '体积小', '兼容性强'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'MPEG Audio Layer III (MP3) 是最著名的数字音频编码格式，通过有损压缩大幅减小文件大小同时保持可接受的音质。几乎被所有设备和平台支持。',
        pros: ['兼容性无敌', '文件小巧', '元数据支持好', '流媒体友好'],
        cons: ['有损压缩', '128kbps以上音质损失明显'],
        convertMethods: [
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.wav -b:a 192k output.mp3'
          },
          {
            name: 'iTunes/音乐',
            steps: '导入 → 偏好设置 → 导出为MP3'
          },
          {
            name: '在线转换',
            steps: '123apps.com/audio-converter 等工具'
          }
        ]
      },
      {
        ext: '.wav',
        name: 'WAV',
        category: 'audio',
        categoryName: '音频',
        description: 'Microsoft无压缩音频格式',
        features: ['无损音质', '编辑方便', '专业用途'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'Waveform Audio File Format (WAV) 是微软和IBM开发的音频文件格式标准，用于存储PCM音频数据。由于是无压缩格式，能提供最高音质但文件体积巨大。',
        pros: ['原始音质', '编辑无损', '专业录音标准'],
        cons: ['文件极大', '不适合分享/传输'],
        convertMethods: [
          {
            name: 'Audacity',
            steps: '打开音频 → 文件 → 导出 → WAV'
          },
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.mp3 output.wav'
          }
        ]
      },
      {
        ext: '.flac',
        name: 'FLAC',
        category: 'audio',
        categoryName: '音频',
        description: '自由无损音频编解码器',
        features: ['无损压缩', '体积较小', '音质完美'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'Free Lossless Audio Codec (FLAC) 是一种无损音频压缩格式，能在不损失任何音质的情况下将音频文件压缩到原大小的50-70%。是发烧友的理想选择。',
        pros: ['真正无损', '比WAV小50%', '元数据完善', '开源免费'],
        cons: ['iOS支持有限', '部分老旧设备不支持'],
        convertMethods: [
          {
            name: 'dBpoweramp',
            steps: '专业的无损音频转换工具'
          },
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.wav -c:a flac output.flac'
          },
          {
            name: 'foobar2000',
            steps: '高级音频播放器，内置转换功能'
          }
        ]
      },
      {
        ext: '.aac',
        name: 'AAC',
        category: 'audio',
        categoryName: '音频',
        description: '高效的高级音频编码',
        features: ['高效率', '优于MP3', 'Apple首选'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'Advanced Audio Coding (AAC) 是MP3的继任者，在相同比特率下提供更好的音质。是YouTube、iPhone、PlayStation等平台的标准音频格式。',
        pros: ['比MP3音质更好', '效率更高', '多平台原生支持'],
        cons: ['版权较严格', '某些老旧设备不支持'],
        convertMethods: [
          {
            name: 'FFmpeg',
            steps: 'ffmpeg -i input.wav -c:a aac -b:a 256k output.aac'
          },
          {
            name: 'iTunes',
            steps: '导入 → AAC编码器 → 导出'
          }
        ]
      },
      {
        ext: '.pdf',
        name: 'PDF',
        category: 'document',
        categoryName: '文档',
        description: '便携式文档格式',
        features: ['跨平台一致', '打印友好', '安全性高'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'Portable Document Format (PDF) 是Adobe开发的文档格式，能够在任何设备上保持一致的显示效果。是全球文档交换的事实标准。',
        pros: ['跨平台一致性', '不可篡改(可选)', '支持注释/签名', '适合存档'],
        cons: ['编辑困难', '文件可能较大'],
        convertMethods: [
          {
            name: '打印转PDF',
            steps: '任何程序 → 打印 → 选择"Microsoft Print to PDF"'
          },
          {
            name: 'Word/Office',
            steps: '文件 → 另存为 → 选择PDF格式'
          },
          {
            name: '在线转换',
            steps: 'Smallpdf、ILovePDF 等网站'
          }
        ]
      },
      {
        ext: '.docx',
        name: 'DOCX',
        category: 'document',
        categoryName: '文档',
        description: 'Microsoft Word文档格式',
        features: ['功能强大', '排版灵活', '办公标准'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'Office Open XML DOCX 是Microsoft Word的现代文档格式，基于XML和ZIP压缩。支持丰富的文本格式、表格、图片、样式等功能，是办公文档的主流格式。',
        pros: ['功能全面', 'WPS/LibreOffice兼容', '协作方便'],
        cons: ['依赖Office套件', '版本兼容问题'],
        convertMethods: [
          {
            name: 'Word/WPS',
            steps: '打开文档 → 文件 → 另存为 → 选择格式'
          },
          {
            name: 'LibreOffice',
            steps: '免费开源，支持批量转换'
          },
          {
            name: '在线转换',
            steps: 'Google Docs上传后下载为其他格式'
          }
        ]
      },
      {
        ext: '.xlsx',
        name: 'XLSX',
        category: 'document',
        categoryName: '文档',
        description: 'Microsoft Excel电子表格',
        features: ['数据计算', '图表分析', '公式支持'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'Office Open XML XLSX 是Microsoft Excel的工作簿格式，用于存储电子表格数据。支持复杂的计算公式、图表、数据透视表、宏等功能。',
        pros: ['数据处理强大', '函数库丰富', '可视化图表'],
        cons: ['大文件性能差', '版本兼容问题'],
        convertMethods: [
          {
            name: 'Excel/WPS',
            steps: '打开 → 文件 → 另存为 → 选择CSV/PDF等'
          },
          {
            name: 'Python pandas',
            steps: 'import pandas as pd; pd.read_excel().to_csv()'
          }
        ]
      },
      {
        ext: '.pptx',
        name: 'PPTX',
        category: 'document',
        categoryName: '文档',
        description: 'Microsoft PowerPoint演示文稿',
        features: ['演示文稿', '动画效果', '多媒体支持'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: true,
        fullDesc: 'Office Open XML PPTX 是Microsoft PowerPoint演示文稿格式，用于创建幻灯片演示。支持丰富的动画、过渡效果、多媒体嵌入等功能。',
        pros: ['演示效果好', '模板资源丰富', '动画丰富'],
        cons: ['文件较大', '跨平台显示差异'],
        convertMethods: [
          {
            name: 'PowerPoint/WPS',
            steps: '文件 → 导出 → PDF/图片/视频'
          },
          {
            name: 'Google Slides',
            steps: '上传PPTX → 在线编辑 → 下载为其他格式'
          }
        ]
      },
      {
        ext: '.zip',
        name: 'ZIP',
        category: 'archive',
        categoryName: '压缩包',
        description: '最通用的压缩归档格式',
        features: ['通用性强', '速度快', '内建支持'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: true,
        web: false,
        fullDesc: 'ZIP是最广泛使用的压缩归档格式，几乎所有操作系统都原生支持。使用DEFLATE算法进行无损压缩，适合日常文件打包和分享。',
        pros: ['全平台原生支持', '压缩速度快', '兼容性最好'],
        cons: ['压缩率一般', '不支持超大文件'],
        convertMethods: [
          {
            name: '系统自带',
            steps: '右键 → 发送到 → 压缩(zipped)文件夹'
          },
          {
            name: '7-Zip',
            steps: '右键 → 7-Zip → 添加到压缩包 → 选择ZIP'
          }
        ]
      },
      {
        ext: '.7z',
        name: '7Z',
        category: 'archive',
        categoryName: '压缩包',
        description: '7-Zip的高压缩率格式',
        features: ['压缩率高', '开源免费', 'AES加密'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: false,
        web: false,
        fullDesc: '7z是7-Zip压缩软件的原生格式，采用LZMA/LZMA2算法，提供极高的压缩率。相比ZIP通常能减小30-70%的体积，是存档和长期保存的理想选择。',
        pros: ['压缩率最高', '支持超大文件', '强加密支持', '开源免费'],
        cons: ['需要安装7-Zip', '解压速度较慢'],
        convertMethods: [
          {
            name: '7-Zip',
            steps: '右键 → 7-Zip → 添加到压缩包 → 选择7z'
          },
          {
            name: '命令行',
            steps: '7z a archive.7z files/'
          }
        ]
      },
      {
        ext: '.rar',
        name: 'RAR',
        category: 'archive',
        categoryName: '压缩包',
        description: 'WinRAR专有压缩格式',
        features: ['压缩率高', '分卷支持', '恢复记录'],
        windows: true,
        mac: true,
        linux: true,
        android: true,
        ios: false,
        web: false,
        fullDesc: 'RAR是WinRAR的专有压缩格式，以高压缩率和分卷压缩功能著称。虽然不是开源格式，但在文件分享和盗版资源中极为常见。',
        pros: ['分卷压缩', '恢复记录', '压缩率高'],
        cons: ['闭源专有', '商业软件', '解压需WinRAR/UNRAR'],
        convertMethods: [
          {
            name: 'WinRAR',
            steps: '右键 → 添加到压缩文件 → 选择RAR格式'
          },
          {
            name: '转换为7Z',
            steps: '先用WinRAR解压，再用7-Zip重新压缩'
          }
        ]
      }
    ],

    scenarios: [
      {
        id: 1,
        icon: '🖼️',
        title: '照片优化分享',
        desc: '将相机拍摄的高清照片压缩并转换为WebP格式',
        from: 'RAW/JPG',
        to: 'WebP'
      },
      {
        id: 2,
        icon: '📱',
        title: '社交媒体发布',
        desc: '调整图片尺寸并转换为最佳格式适配各平台',
        from: '原图',
        to: 'JPG/PNG'
      },
      {
        id: 3,
        icon: '🎬',
        title: '视频格式统一',
        desc: '将各种格式的视频统一转换为MP4以便播放和分享',
        from: 'AVI/MOV/MKV',
        to: 'MP4'
      },
      {
        id: 4,
        icon: '🎵',
        title: '音频提取转换',
        desc: '从视频中提取音频并转换为MP3或FLAC',
        from: '视频文件',
        to: 'MP3/FLAC'
      },
      {
        id: 5,
        icon: '📄',
        title: '文档格式转换',
        desc: '将Word/Excel/PPT转换为PDF便于分发和打印',
        from: 'DOCX/XLSX/PPTX',
        to: 'PDF'
      },
      {
        id: 6,
        icon: '📦',
        title: '压缩包格式转换',
        desc: '将ZIP/RAR等格式转换为7Z以获得更小的体积',
        from: 'ZIP/RAR',
        to: '7Z'
      }
    ],

    recommendTools: [
      {
        name: 'FFmpeg',
        desc: '命令行音视频处理瑞士军刀',
        features: ['全能格式支持', '批量处理', '高度可定制'],
        platform: 'Windows / macOS / Linux'
      },
      {
        name: 'HandBrake',
        desc: '开源免费的视频转码工具',
        features: ['界面友好', '预设丰富', 'GPU加速'],
        platform: 'Windows / macOS / Linux'
      },
      {
        name: 'CloudConvert',
        desc: '在线文件格式转换平台',
        features: ['无需安装', '200+格式', 'API支持'],
        platform: 'Web浏览器'
      },
      {
        name: '7-Zip',
        desc: '免费的高效压缩解压软件',
        features: ['超高压缩率', '支持7z/ZIP/RAR', 'AES加密'],
        platform: 'Windows / macOS / Linux'
      },
      {
        name: 'Adobe Acrobat',
        desc: '专业的PDF创建和编辑工具',
        features: ['PDF编辑', '格式转换', '电子签名'],
        platform: 'Windows / macOS / iOS / Android'
      },
      {
        name: 'OnlineConvert',
        desc: '多功能在线文件转换器',
        features: ['支持所有主流格式', '批量转换', '云存储集成'],
        platform: 'Web浏览器'
      }
    ],

    filteredFormats: []
  },

  onLoad() {
    this.setData({ filteredFormats: this.data.formats })
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.filterFormats()
  },

  onSearch() {
    this.filterFormats()
    wx.vibrateShort({ type: 'light' })
  },

  clearSearch() {
    this.setData({ searchKeyword: '' })
    this.filterFormats()
  },

  filterFormats() {
    const keyword = this.data.searchKeyword.toLowerCase()
    const category = this.data.currentCategory

    let filtered = this.data.formats

    if (category !== 'all') {
      filtered = filtered.filter(f => f.category === category)
    }

    if (keyword) {
      filtered = filtered.filter(f =>
        f.ext.toLowerCase().includes(keyword) ||
        f.name.toLowerCase().includes(keyword) ||
        f.description.toLowerCase().includes(keyword)
      )
    }

    this.setData({ filteredFormats: filtered })
  },

  onCategoryChange(e) {
    const categoryId = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    this.setData({ currentCategory: categoryId })
    this.filterFormats()
  },

  showFormatDetail(e) {
    const ext = e.currentTarget.dataset.ext
    const format = this.data.formats.find(f => f.ext === ext)

    if (format) {
      wx.vibrateShort({ type: 'light' })
      this.setData({
        showDetail: true,
        selectedFormat: format
      })
    }
  },

  hideDetail() {
    this.setData({ showDetail: false })
  },

  showScenarioDetail(e) {
    const scenarioId = e.currentTarget.dataset.id
    const scenario = this.data.scenarios.find(s => s.id === scenarioId)

    if (scenario) {
      wx.showModal({
        title: scenario.title,
        content: scenario.desc + '\n\n推荐转换：' + scenario.from + ' → ' + scenario.to,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  }
})
