const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const iconsDir = path.join(__dirname, 'images');

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function createIcon(filename, drawFunction) {
  const size = 81;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 清空画布（透明背景）
  ctx.clearRect(0, 0, size, size);
  
  // 调用绘制函数
  drawFunction(ctx, size);
  
  // 保存为 PNG
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(iconsDir, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ 已生成: ${filename}`);
}

// 工具集图标 - 未选中状态
createIcon('tab-tools.png', (ctx, size) => {
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // 外框
  ctx.beginPath();
  ctx.roundRect(15, 20, 51, 41, 6);
  ctx.stroke();
  
  // 横线1
  ctx.beginPath();
  ctx.moveTo(25, 32);
  ctx.lineTo(56, 32);
  ctx.stroke();
  
  // 横线2
  ctx.beginPath();
  ctx.moveTo(25, 40.5);
  ctx.lineTo(48, 40.5);
  ctx.stroke();
  
  // 横线3
  ctx.beginPath();
  ctx.moveTo(25, 49);
  ctx.lineTo(52, 49);
  ctx.stroke();
});

// 工具集图标 - 选中状态
createIcon('tab-tools-active.png', (ctx, size) => {
  // 填充背景
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.roundRect(15, 20, 51, 41, 6);
  ctx.fill();
  
  // 白色内框
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(18, 23, 45, 35, 4);
  ctx.fill();
  
  // 蓝色横线
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(25, 32);
  ctx.lineTo(56, 32);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(25, 40.5);
  ctx.lineTo(48, 40.5);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(25, 49);
  ctx.lineTo(52, 49);
  ctx.stroke();
});

// 收藏夹图标 - 未选中状态
createIcon('tab-fav.png', (ctx, size) => {
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(40.5, 20);
  ctx.lineTo(47.5, 34.5);
  ctx.lineTo(63, 36.5);
  ctx.lineTo(52, 47.5);
  ctx.lineTo(54.5, 63);
  ctx.lineTo(40.5, 55);
  ctx.lineTo(26.5, 63);
  ctx.lineTo(29, 47.5);
  ctx.lineTo(18, 36.5);
  ctx.lineTo(33.5, 34.5);
  ctx.closePath();
  ctx.stroke();
});

// 收藏夹图标 - 选中状态
createIcon('tab-fav-active.png', (ctx, size) => {
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.moveTo(40.5, 20);
  ctx.lineTo(47.5, 34.5);
  ctx.lineTo(63, 36.5);
  ctx.lineTo(52, 47.5);
  ctx.lineTo(54.5, 63);
  ctx.lineTo(40.5, 55);
  ctx.lineTo(26.5, 63);
  ctx.lineTo(29, 47.5);
  ctx.lineTo(18, 36.5);
  ctx.lineTo(33.5, 34.5);
  ctx.closePath();
  ctx.fill();
});

// 最近使用图标 - 未选中状态
createIcon('tab-recent.png', (ctx, size) => {
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // 圆圈
  ctx.beginPath();
  ctx.arc(40.5, 40.5, 22, 0, Math.PI * 2);
  ctx.stroke();
  
  // 对勾
  ctx.beginPath();
  ctx.moveTo(30, 40.5);
  ctx.lineTo(38, 48.5);
  ctx.lineTo(52, 33);
  ctx.stroke();
});

// 最近使用图标 - 选中状态
createIcon('tab-recent-active.png', (ctx, size) => {
  // 蓝色圆圈填充
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.arc(40.5, 40.5, 22, 0, Math.PI * 2);
  ctx.fill();
  
  // 白色对勾
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(30, 40.5);
  ctx.lineTo(38, 48.5);
  ctx.lineTo(52, 33);
  ctx.stroke();
});

console.log('\n🎉 所有图标生成完成！');
console.log('📁 位置:', iconsDir);
console.log('\n现在可以在微信开发者工具中重新编译项目了！\n');
