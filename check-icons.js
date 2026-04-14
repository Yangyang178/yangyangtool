const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  百宝工具箱 - 图标转换说明');
console.log('========================================\n');

const iconsDir = path.join(__dirname, 'images');
const svgFiles = [
  'tab-tools.svg',
  'tab-tools-active.svg',
  'tab-fav.svg',
  'tab-fav-active.svg',
  'tab-recent.svg',
  'tab-recent-active.svg'
];

console.log('📁 已创建的 SVG 图标文件：\n');
svgFiles.forEach(file => {
  const filePath = path.join(iconsDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (未找到)`);
  }
});

console.log('\n' + '='.repeat(40));
console.log('⚠️  重要提示：');
console.log('='.repeat(40) + '\n');

console.log('微信小程序的 tabBar 图标需要 PNG 格式！');
console.log('\n请选择以下方法之一进行转换：\n');

console.log('方法一：使用在线转换工具（推荐）');
console.log('-----------------------------------');
console.log('1. 访问 https://convertio.co/svg-png/');
console.log('2. 上传上述 6 个 SVG 文件');
console.log('3. 设置输出尺寸为: 81 x 81 像素');
console.log('4. 下载 PNG 文件并重命名（去掉 -active 后缀的 .svg 变为 .png）\n');

console.log('方法二：使用 Figma / Sketch 等设计软件');
console.log('----------------------------------------');
console.log('1. 打开 SVG 文件');
console.log('2. 导出为 PNG，尺寸 81x81px');
console.log('3. 确保背景透明\n');

console.log('方法三：安装 sharp 库自动转换（需要 Node.js）');
console.log('-------------------------------------------------');
console.log('运行命令:');
console.log('  npm install sharp');
console.log('  node convert-to-png.js\n');

console.log('='.repeat(40));
console.log('✨ 转换后的文件列表：');
console.log('='.repeat(40) + '\n');

const pngFiles = [
  { svg: 'tab-tools.svg', png: 'tab-tools.png', desc: '工具集（未选中）' },
  { svg: 'tab-tools-active.svg', png: 'tab-tools-active.png', desc: '工具集（选中）' },
  { svg: 'tab-fav.svg', png: 'tab-fav.png', desc: '收藏夹（未选中）' },
  { svg: 'tab-fav-active.svg', png: 'tab-fav-active.png', desc: '收藏夹（选中）' },
  { svg: 'tab-recent.svg', png: 'tab-recent.png', desc: '最近使用（未选中）' },
  { svg: 'tab-recent-active.svg', png: 'tab-recent-active.png', desc: '最近使用（选中）' }
];

pngFiles.forEach(item => {
  console.log(`  📄 ${item.png} - ${item.desc}`);
});

console.log('\n完成转换后，即可在微信开发者工具中正常运行项目！\n');
