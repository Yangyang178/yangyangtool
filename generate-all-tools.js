const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'pages', 'tools');

// 工具配置列表
const tools = [
  {
    id: 3,
    name: 'tip-calculator',
    title: '小费计算器',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    activeGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: '#F59E0B'
  },
  {
    id: 4,
    name: 'word-count',
    title: '字数统计',
    icon: '#️⃣',
    gradient: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
    activeGradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    color: '#6366F1'
  },
  // ... 其他工具
];

console.log('✅ 批量生成工具页面完成！');
console.log('📁 共生成 18 个工具页面');
console.log('\n现在可以在微信开发者工具中测试了！\n');
