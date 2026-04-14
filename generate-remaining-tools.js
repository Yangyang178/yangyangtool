const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'pages', 'tools');

// 工具配置
const toolConfigs = [
  { name: 'tip-calculator', title: '小费计算器', icon: '💰', color: '#F59E0B', desc: '快速计算小费金额' },
  { name: 'word-count', title: '字数统计', icon: '#️⃣', color: '#6366F1', desc: '中英文字符精准统计' },
  { name: 'case-converter', title: '大小写转换', icon: '🔤', color: '#EC4899', desc: '英文大小写一键切换' },
  { name: 'base64-tool', title: 'Base64编解码', icon: '🔐', color: '#14B8A6', desc: 'Base64编码解码工具' },
  { name: 'qrcode-generator', title: '二维码生成器', icon: '📱', color: '#8B5CF6', desc: '文字/链接生成二维码' },
  { name: 'pomodoro', title: '番茄计时', icon: '🍅', color: '#EF4444', desc: '专注工作25分钟' },
  { name: 'water-reminder', title: '喝水提醒', icon: '💧', color: '#06B6D4', desc: '健康饮水定时提醒' },
  { name: 'random-decision', title: '随机决定', icon: '🎲', color: '#F97316', desc: '抽签做决定不再纠结' },
  { name: 'garbage-sorting', title: '垃圾分类查询', icon: '♻️', color: '#10B981', desc: '智能识别垃圾类型' },
  { name: 'date-calculator', title: '日期计算器', icon: '📅', color: '#FBBF24', desc: '间隔天数精确计算' },
  { name: 'countdown', title: '倒计时', icon: '⏰', color: '#3B82F6', desc: '重要日期倒计时' },
  { name: 'world-clock', title: '世界时钟', icon: '🌍', color: '#8B5CF6', desc: '全球时区时间查看' },
  { name: 'age-calculator', title: '年龄计算器', icon: '👶', color: '#EC4899', desc: '精确到天的年龄计算' },
  { name: 'json-formatter', title: 'JSON格式化', icon: '{}', color: '#64748B', desc: 'JSON美化压缩工具' },
  { name: 'color-converter', title: '颜色转换', icon: '🎨', color: '#F472B6', desc: 'HEX/RGB/HSL互转' },
  { name: 'url-encoder', title: 'URL编解码', icon: '🔗', color: '#22D3EE', desc: 'URL编码解码工具' },
  { name: 'regex-tester', title: '正则表达式测试', icon: '✨', color: '#A78BFA', desc: '正则表达式在线测试' }
];

// JSON 模板
function generateJson(title) {
  return JSON.stringify({
    usingComponents: {
      "navigation-bar": "/components/navigation-bar/navigation-bar"
    },
    navigationBarTitleText: title
  }, null, 2);
}

// WXML 模板
function generateWxml(config) {
  return `<navigation-bar title="${config.title}" back="{{true}}" color="black" background="#F8FAFC"></navigation-bar>

<scroll-view class="tool-page" scroll-y>
  <view class="container">
    <view class="tool-header">
      <view class="icon-wrapper" style="background: linear-gradient(135deg, ${config.color}33 0%, ${config.color}66 100%);">
        <text class="tool-icon">${config.icon}</text>
      </view>
      <text class="tool-title">${config.title}</text>
      <text class="tool-desc">${config.desc}</text>
    </view>

    <view class="content-area">
      <view class="placeholder-card">
        <text class="placeholder-icon">🚀</text>
        <text class="placeholder-title">${config.title} 功能</text>
        <text class="placeholder-desc">此工具正在开发中，即将上线！</text>
        <button class="coming-soon-btn">
          <text>敬请期待</text>
        </button>
      </view>
    </view>
  </view>
</scroll-view>`;
}

// WXSS 模板
function generateWxss(color) {
  return `page { background-color: #F8FAFC; }
.tool-page { height: 100vh; }
.container { padding: 20px; padding-bottom: 40px; }

.tool-header { text-align: center; margin-bottom: 32px; }
.icon-wrapper { width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; background: linear-gradient(135deg, ${color}33 0%, ${color}66 100%); }
.tool-icon { font-size: 40px; }
.tool-title { font-size: 24px; font-weight: 700; color: #1E293B; display: block; margin-bottom: 8px; }
.tool-desc { font-size: 14px; color: #64748B; }

.content-area { margin-top: 20px; }
.placeholder-card { background: #FFFFFF; border-radius: 20px; padding: 60px 32px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.placeholder-icon { font-size: 64px; display: block; margin-bottom: 20px; opacity: 0.7; }
.placeholder-title { font-size: 22px; font-weight: 700; color: #1E293B; display: block; margin-bottom: 12px; }
.placeholder-desc { font-size: 15px; color: #64748B; display: block; margin-bottom: 28px; line-height: 1.5; }
.coming-soon-btn { background: linear-gradient(135deg, ${color} 0%, ${color}CC 100%); color: #FFFFFF; height: 48px; border-radius: 24px; font-size: 16px; font-weight: 600; border: none; box-shadow: 0 4px 12px ${color}44; }`;
}

// JS 模板
function generateJs(name, title) {
  return `Page({
  data: {},
  
  onLoad() {
    console.log('${title} 页面加载')
  },

  onShareAppMessage() {
    return {
      title: '${title} - 百宝工具箱',
      path: '/pages/tools/${name}/${name}'
    }
  }
})`;
}

// 生成所有工具
console.log('🚀 开始生成工具页面...\n');

let successCount = 0;
let failCount = 0;

toolConfigs.forEach((config, index) => {
  const toolPath = path.join(toolsDir, config.name);
  
  try {
    // 确保目录存在
    if (!fs.existsSync(toolPath)) {
      fs.mkdirSync(toolPath, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(path.join(toolPath, `${config.name}.json`), generateJson(config.title));
    fs.writeFileSync(path.join(toolPath, `${config.name}.wxml`), generateWxml(config));
    fs.writeFileSync(path.join(toolPath, `${config.name}.wxss`), generateWxss(config.color));
    fs.writeFileSync(path.join(toolPath, `${config.name}.js`), generateJs(config.name, config.title));

    console.log(`✅ [${index + 1}/${toolConfigs.length}] ${config.title}`);
    successCount++;
  } catch (error) {
    console.log(`❌ [${index + 1}/${toolConfigs.length}] ${config.title}: ${error.message}`);
    failCount++;
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`🎉 生成完成！`);
console.log(`   ✅ 成功: ${successCount} 个工具`);
console.log(`   ❌ 失败: ${failCount} 个工具`);
console.log(`${'='.repeat(50)}\n`);

if (successCount > 0) {
  console.log('💡 现在可以在微信开发者工具中编译并查看所有工具了！');
  console.log('   已完成的工具（可直接使用）：');
  console.log('   • 💱 汇率换算 - 实时汇率换算');
  console.log('   • 📏 单位换算 - 长度/重量/温度等');
  console.log('   • 🏠 房贷计算器 - 月供利息计算');
  console.log('\n   其他工具显示"即将上线"占位页面');
}
