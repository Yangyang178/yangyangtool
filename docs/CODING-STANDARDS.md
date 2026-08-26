# 📐 百宝工具箱 - 代码规范手册

> **版本**: v1.0  
> **适用范围**: 全项目（JS/WXML/WXSS/JSON）  
> **核心理念**: 可读性 > 简洁性 > 性能（在合理范围内）  
> **强制程度**: ⭐⭐⭐ 必须遵守 | ⭐⭐ 建议遵守 | ⭐ 可选参考

---

## 一、JavaScript 规范

### 1.1 基础语法（⭐⭐⭐ 强制）

#### 变量声明
```javascript
// ✅ 正确：使用 const/let，禁止 var
const APP_NAME = '百宝工具箱'        // 常量：全大写 + 下划线
let currentPage = 1                 // 变量：camelCase
let isLoading = false               // 布尔值：is/has/can/should 开头

// ❌ 错误：禁止使用 var
var name = 'test'
```

#### 函数定义
```javascript
// ✅ 方式一：箭头函数（推荐用于回调）
const formatNumber = (num) => {
  return num.toFixed(2)
}

// ✅ 方式二：简写方法（推荐用于 Page/Object 方法）
Page({
  data: {},
  onLoad() {},           // ✅ 不要写 onLoad: function() {}
  onShow() {},
  handleClick(e) {}     // 事件处理函数以 handle/on 开头
})

// ❌ 错误：避免匿名 function
setTimeout(function() {}, 1000)
```

#### 解构赋值
```javascript
// ✅ 推荐：对象解构
const { salary, deductions } = this.data
const [first, second] = array

// 数组/对象展开
const newTools = [...oldTools, newTool]
const mergedObj = { ...defaultConfig, ...userConfig }
```

#### 模板字符串
```javascript
// ✅ 使用模板字符串拼接
const message = `工具 ${toolName} 已添加到收藏`
const html = `<div class="card">${content}</div>`

// ❌ 避免字符串拼接
const msg = '工具 ' + name + ' 已添加'
```

---

### 1.2 函数规范（⭐⭐⭐ 强制）

#### 函数长度限制
```javascript
// ✅ 单个函数不超过 50 行
// 如果超过，考虑拆分为多个小函数

// ❌ 长函数示例（应拆分）
onLoad() {
  // 100+ 行...
}
```

**拆分原则**:
- 单一职责：每个函数只做一件事
- 纯函数优先：无副作用的函数更容易测试和维护
- 提取重复逻辑：超过2次使用的逻辑必须提取为独立函数

#### 参数数量
```javascript
// ✅ 参数 ≤ 3 个
function calculateTax(salary, threshold, rate) {}

// ❌ 参数过多时，使用配置对象
function complexFunc(a, b, c, d, e, f) {}  // 不推荐

// ✅ 改用对象参数
function complexFunc({ a, b, c, d, e, f }) {}
complexFunc({ a: 1, b: 2, c: 3 })
```

---

### 1.3 异步处理（⭐⭐ 建议）

#### Promise 链式调用
```javascript
// ✅ 使用 Promise.then()
wx.cloud.callFunction({ name: 'test' })
  .then(res => {
    console.log(res.result)
    return processData(res.result)
  })
  .then(data => {
    this.setData({ data })
  })
  .catch(err => {
    console.error('Error:', err)
    wx.showToast({ title: '操作失败', icon: 'none' })
  })

// ✅ async/await（如果支持）
async loadData() {
  try {
    const res = await wx.cloud.callFunction({ name: 'test' })
    const data = await processData(res.result)
    this.setData({ data })
  } catch (err) {
    this.handleError(err)
  }
}
```

---

### 1.4 数据操作（⭐⭐⭐ 强制）

#### setData 使用规范
```javascript
// ✅ 批量更新：一次 setData 更新多个字段
this.setData({
  isLoading: false,
  list: newList,
  total: newList.length
})

// ❌ 避免：频繁调用 setData
this.setData({ a: 1 })
this.setData({ b: 2 })  // 性能差！
this.setData({ c: 3 })

// ✅ 深层更新路径
this.setData({
  'list[0].name': '新名称',
  'form.address.city': '北京'
})
```

#### 数据深拷贝
```javascript
// ✅ 推荐方式
const copy = JSON.parse(JSON.stringify(original))

// 或使用展开运算符（浅拷贝适用于简单对象）
const shallowCopy = { ...original }
const arrayCopy = [...originalArray]
```

---

## 二、WXML 模板规范

### 2.1 组件命名（⭐⭐⭐ 强制）

```xml
<!-- ✅ 组件名：kebab-case（短横线分隔） -->
<tool-page />
<navigation-bar />
<image-card />

<!-- 自定义组件前缀 -->
<custom-button />
<my-component />

<!-- 文件名与组件名保持一致 -->
<!-- tool-page.wxml → <tool-page /> -->
```

### 2.2 Class 命名（BEM 方法论）（⭐⭐⭐ 强制）

```xml
<!-- BEM: Block__Element--Modifier -->

<!-- Block: 组件/模块 -->
<view class="card">

  <!-- Element: 子元素 -->
  <view class="card__header">
    <text class="card__title">标题</text>
  </view>

  <!-- Modifier: 状态变体 -->
  <view class="card__body card__body--active">
    <text class="card__text card__text--highlight">内容</text>
  </view>

</view>

<!-- 实际示例 -->
<view class="tool-card tool-card--featured">
  <view class="tool-card__icon">
    <text class="tool-card__emoji">🔧</text>
  </view>
  <text class="tool-card__name">工具名称</text>
  <view class="tool-card__badge tool-card__badge--hot">热门</view>
</view>
```

**命名规则总结**:
- **Block**: `.component-name` （小写，单词间用 `-`）
- **Element**: `.block__element` （双下划线连接）
- **Modifier**: `.block--modifier` / `.block__element--modifier` （双短横线）

### 2.3 事件绑定（⭐⭐⭐ 强制）

```xml
<!-- ✅ 事件命名：on + 动词 -->
<button bindtap="onSearchClick" />
<input bindinput="onInputChange" />
<scroll-view bindscrolltolower="onLoadMore" />

<!-- 事件对象统一命名为 `e` -->
<view bindtap="handleClick" data-id="{{item.id}}">

<!-- 阻止事件冒泡 -->
<view catchtap="onFavoriteTap" data-id="{{id}}">
```

**常用事件命名前缀**:
| 前缀 | 用途 | 示例 |
|------|------|------|
| `on` | 用户交互 | `onClick`, `onSubmit`, `onChange` |
| `handle` | 处理逻辑 | `handleSubmit`, `handleToggle` |
| `load` | 数据加载 | `loadData`, `loadMore` |
| `toggle` | 状态切换 | `toggleFavorite`, `toggleMode` |

### 2.4 条件渲染与列表（⭐⭐ 建议）

```xml
<!-- ✅ 条件渲染：wx:if vs hidden -->
<view wx:if="{{isVisible}}">
  <!-- 条件为真时渲染（不占位） -->
</view>

<view wx:else>
  <!-- 条件为假时的备选 -->
</view>

<view hidden="{{!isVisible}}">
  <!-- 始终渲染但隐藏（占位） -->
</view>

<!-- 选择建议：
  - 频繁切换 → 用 hidden（性能好）
  - 条件复杂或初始不显示 → 用 wx:if
-->

<!-- 列表渲染 -->
<view wx:for="{{list}}" wx:key="id">
  <!-- 必须有 wx:key -->
  <!-- 使用 index 和 item 作为默认变量名 -->
  <text>{{index + 1}}. {{item.name}}</text>
</view>

<!-- 嵌套列表 -->
<block wx:for="{{categories}}" wx:key="id">
  <view class="category">
    <text>{{item.name}}</text>
    <view wx:for="{{item.tools}}" wx:key="tid">
      {{item.tname}}
    </view>
  </view>
</block>
```

---

## 三、WXSS 样式规范

### 3.1 CSS 变量系统（⭐⭐⭐ 强制）

```css
/* 定义在 app.wxss 中 */

/* ========== 颜色系统 ========== */
page {
  /* 主色调 */
  --color-primary: #3B82F6;
  --color-primary-light: #60A5FA;
  --color-primary-dark: #2563EB;

  /* 功能色 */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #06B6D4;

  /* 文字颜色 */
  --text-primary: #1E293B;     /* 主要文字 */
  --text-secondary: #64748B;   /* 次要文字 */
  --text-muted: #94A3B8;       /* 辅助/禁用 */
  --text-inverse: #FFFFFF;     /* 反色文字（深色背景上）*/

  /* 背景色 */
  --bg-page: #F8FAFC;         /* 页面背景 */
  --bg-card: #FFFFFF;          /* 卡片背景 */
  --bg-surface: #F1F5F9;      /* 表面/输入框 */
  --bg-hover: #E2E8F0;        /* 悬停态 */

  /* 边框 */
  --border-light: #E2E8F0;
  --border-focus: #3B82F6;

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 字体大小 */
  --font-xs: 11px;
  --font-sm: 13px;
  --font-base: 15px;
  --font-lg: 17px;
  --font-xl: 20px;
  --font-2xl: 26px;
  --font-display: 32px;
}

/* 使用变量 */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-md);
}

.card-title {
  font-size: var(--font-lg);
  color: var(--text-primary);
  font-weight: 600;
}
```

### 3.2 选择器规范（⭐⭐ 建议）

```css
/* ✅ 选择器深度不超过 3 层 */
.tool-card { }                    /* 层级 1 */
.tool-card__title { }              /* 层级 2 */
.tool-card.featured .tool-card__title { } /* 层级 3 */

/* ❌ 避免过深嵌套 */
.page .container .section .list .item .title { }

/* ✅ 优先使用 class 选择器 */
.card { }
.card-header { }

/* ❌ 避免过度依赖标签选择器 */
div > ul > li > a { }
```

### 3.3 响应式设计（⭐⭐ 建议）

```css
/* 使用 rpx 单位（小程序推荐） */
.container {
  width: 750rpx;           /* 固定宽度 */
  padding: 32rpx;          /* 自动适配屏幕 */
  margin-bottom: 24rpx;
}

/* 特殊情况使用媒体查询 */
@media (min-width: 768px) {
  /* iPad 等大屏设备 */
  .tools-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 3.4 动画性能（⭐⭐⭐ 强制）

```css
/* ✅ 只使用 GPU 加速属性做动画 */
.animated-element {
  transition: transform 0.3s ease,
              opacity 0.3s ease,
              box-shadow 0.3s ease;
  /* 这些属性不会触发重排/重绘 */
}

/* ❌ 避免动画以下属性（会触发重排）*/
.bad-performance {
  /* width, height, top, left, margin, padding */
  transition: width 0.3s;  /* 性能差！ */
}

/* ✅ 使用 transform 替代位置变化 */
.move-right {
  transform: translateX(100px);  /* 好！ */
  /* 而不是 left: 100px;      差！ */
}

/* ✅ 使用 will-change 提示浏览器优化 */
.frequently-animated {
  will-change: transform, opacity;
}
```

---

## 四、JSON 配置规范

### 4.1 页面配置（⭐⭐⭐ 强制）

```json
{
  "usingComponents": {
    "navigation-bar": "/components/navigation-bar/navigation-bar",
    "tool-page": "/components/tool-page/tool-page"
  },
  "styleIsolation": "apply-shared",
  "navigationBarTitleText": "",
  "navigationBarBackgroundColor": "#ffffff",
  "navigationBarTextStyle": "black"
}
```

**注意**:
- `usingComponents`: 按需引入，不要全局注册所有组件
- `styleIsolation`: 推荐使用 `apply-shared`（样式隔离但可影响子组件）

---

## 五、文件组织规范

### 5.1 目录结构（⭐⭐⭐ 强制）

```
project-root/
├── app.js                    # 应用入口
├── app.json                  # 应用配置
├── app.wxss                  # 全局样式（CSS变量）
├── project.config.json        # 项目配置
│
├── pages/                    # 页面目录
│   ├── index/
│   │   ├── index.js          # 页面逻辑
│   │   ├── index.json        # 页面配置
│   │   ├── index.wxml        # 页面模板
│   │   └── index.wxss        # 页面样式
│   │
│   └── ...
│
├── components/               # 公共组件
│   ├── component-name/
│   │   ├── component.js
│   │   ├── component.json
│   │   ├── component.wxml
│   │   └── component.wxss
│   │
│   └── ...
│
├── package-*/                # 分包目录
│   └── tool-name/
│       └── ...
│
├── utils/                    # 工具函数
│   ├── storage.js            # 存储相关
│   ├── helpers.js            # 通用辅助
│   ├── pinyin.js             # 拼音转换
│   └── error-handler.js      # 错误处理
│
├── config/                   # 配置文件
│   ├── routes.js             # 路由映射
│   └── constants.js          # 常量定义
│
├── data/                     # 静态数据
│   ├── tools.js              # 工具数据
│   └── categories.js         # 分类数据
│
├── styles/                   # 公共样式
│   └── tool-common.wxss      # 工具页面通用样式
│
├── templates/                # 模板
│   └── tool-template/
│
├── images/                   # 图片资源
│   ├── icons/                # 图标
│   └── illustrations/        # 插图
│
└── docs/                     # 文档
    ├── plans/                # 计划文档
    └── *.md                  # 其他文档
```

### 5.2 文件命名规则（⭐⭐⭐ 强制）

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| **页面文件** | kebab-case | `text-diff.js`, `tax-calculator.js` |
| **组件文件** | kebab-case | `navigation-bar.js`, `tool-page.js` |
| **工具函数** | camelCase | `formatDate.js`, `deepClone.js` |
| **常量文件** | UPPER_SNAKE | `API_URLS.js`, `ERROR_CODES.js` |
| **样式文件** | 与主文件同名 | `index.wxss`, `tool-card.wxss` |

---

## 六、注释规范

### 6.1 注释风格（⭐⭐ 建议）

#### JavaScript
```javascript
/**
 * 工具函数说明
 * @param {number} salary - 税前月薪
 * @param {number} threshold - 个税起征点
 * @returns {number} 应缴个税金额
 * @example
 * calculateTax(12000, 5000) // 返回 60
 */
function calculateTax(salary, threshold) {
  // TODO: 未来需要支持专项附加扣除
  // FIXME: 这个算法在极端情况下可能不准确
  // HACK: 临时解决方案，等待官方API
  // NOTE: 注意这里的边界条件
  
  const taxable = Math.max(0, salary - threshold)
  return computeByBracket(taxable)
}
```

#### WXML
```xml
<!-- 
  工具卡片组件
  Props: tool (Object) - 工具数据对象
  Events: tap - 点击卡片时触发
-->
<view class="tool-card" bindtap="onCardTap">
  <!-- 图标区域：使用渐变背景增强视觉效果 -->
  <view class="icon-wrapper" style="background: {{tool.iconBg}}">
    <text>{{tool.icon}}</text>
  </view>
</view>
```

#### WXSS
```css
/**
 * 工具卡片样式
 * 设计来源: Material Design Card
 * 最后更新: 2026-04-29
 * 相关组件: tool-page
 */

.tool-card {
  /* 使用 CSS 变量确保主题一致性 */
  background: var(--bg-card);
  
  /* 渐变边框效果（仅特色卡片） */
  &--featured {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea, #764ba2) border-box;
  }
}
```

---

## 七、Git 提交规范

### 7.1 Commit Message 格式（⭐⭐⭐ 强制）

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
| Type | 使用场景 | 示例 |
|------|---------|------|
| `feat` | 新功能 | `feat(homepage): add hero section with quick access` |
| `fix` | Bug修复 | `fix(tax-calculator): correct deduction calculation logic` |
| `style` | 样式调整 | `style(tool-card): update to v2 design with larger icons` |
| `refactor` | 重构代码 | `refactor(index): extract tools data to separate file` |
| `perf` | 性能优化 | `perf(search): implement debounce for input` |
| `docs` | 文档更新 | `docs(readme): add installation guide` |
| `chore` | 杂项/构建 | `chore(git): update .gitignore rules` |
| `test` | 测试相关 | `test(unit): add calculation test cases` |
| `revert` | 回滚提交 | `revert(feat): rollback broken feature` |

**Scope 范围**（可选）:
- 文件名/目录名/模块名
- 如: `(homepage)`, `(tool-card)`, `(api)`

**Subject 主题**:
- 简明扼要，不超过 50 字符
- 使用中文或英文（保持一致性）
- 不要以句号结尾

**Body 正文**（可选）:
- 详细描述做了什么、为什么这样做
- 关联 Issue 或 PR 编号

**Footer 页脚**（可选）:
- `Closes #123`
- `Reviewed-by: @username`

**完整示例**:
```
feat(homepage): upgrade hero section with brand identity and quick access

- Add logo with glow effect for brand recognition
- Implement top-3 frequently used tools shortcut area
- Add usage statistics bar for social proof
- Optimize spacing and typography hierarchy

Related: #42, roadmap item M3-D1
```

---

## 八、代码审查清单

### 8.1 提交前自查（⭐⭐⭐ 强制）

每次提交代码前，确认：

#### JavaScript
- [ ] 无 `var` 声明（全部改为 `const`/`let`）
- [ ] 无匿名 `function()`（改用箭头函数或方法简写）
- [ ] 函数长度 < 50 行（否则需拆分）
- [ ] 无 `console.log` 残留（调试后删除）
- [ ] 错误已正确处理（try-catch 或 Promise.catch）
- [ ] setData 调用已合并（避免频繁调用）

#### WXML
- [ ] 组件名使用 kebab-case
- [ ] Class 遵循 BEM 命名
- [ ] 事件绑定使用 `on/handle/toggle` 前缀
- [ ] 列表渲染有 `wx:key`
- [ ] 无硬编码的字符串/数字（提取为变量）

#### WXSS
- [ ] 使用 CSS 变量（颜色/间距/圆角等）
- [ ] 选择器嵌套 ≤ 3 层
- [ ] 动画仅使用 GPU 加速属性
- [ ] 无 `!important`（特殊情况除外）
- [ ] 移动端优先使用 `rpx` 单位

#### 通用
- [ ] 文件命名符合规范
- [ ] 注释清晰必要
- [ ] 无死代码/注释掉的代码块
- [ ] 无 console.warn/error 残留

---

## 九、常见反模式（Anti-Patterns）

### ❌ 应该避免的写法

```javascript
// 1. 直接修改 props/data（应该通过 setData）
this.data.list.push(newItem)

// 2. 在循环中创建函数
for (let i = 0; i < arr.length; i++) {
  items.push({
    onClick: () => this.handleClick(i)  // ❌ 每次循环都创建新函数
  })
}

// 3. 过深的嵌套回调
wx.request({
  success: (res) => {
    wx.request({
      success: (res2) => {
        wx.request({  // 回调地狱
          success: (res3) => {}
        })
      }
    })
  }
})

// 4. 魔法数字（未解释的常量）
if (status === 404) { }  // ✅ 改为: if (status === STATUS.NOT_FOUND)

// 5. 过长的条件判断
if (type === 'a' || type === 'b' || type === 'c') { }
// ✅ 改为: if (VALID_TYPES.includes(type))

// 6. 同步阻塞操作
const data = fs.readFileSync('large-file.json')  // ❌ 阻塞主线程
```

---

## 十、工具与资源推荐

### 推荐编辑器插件
- **ESLint**: JavaScript 代码检查
- **Prettier**: 代码自动格式化
- **WXML Format**: 微信开发者工具内置

### 学习资源
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [JavaScript Standard Style](https://standardjs.com/)
- [BEM 官方文档](http://getbem.com/)
- [CSS Tricks](https://css-tricks.com/)

---

## 版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| v1.0 | 2026-04-29 | AI Assistant | 初始版本，基于终极优化路线图 Phase 1 Task 1.2 |

---

**最后更新**: 2026-04-29  
**维护者**: 百宝工具箱开发团队  
**遵循此规范，让代码更优雅、可维护、可扩展！** ✨
