# Toolbox — GitHub Pages 纯工具网站前端架构设计

## 项目概述

Toolbox 是一个部署在 GitHub Pages 上的纯前端工具集合网站。采用极简架构、零后端依赖、按需加载，提供 JSON 格式化、时间戳转换、UUID 生成等开发工具。

## 技术选型

| 项目 | 选择 |
|------|------|
| 技术栈 | 纯 HTML + CSS + JavaScript (ES6+) |
| 部署 | GitHub Pages |
| 第三方依赖 | 无（零外部依赖） |
| 构建工具 | 无（纯原生文件） |
| 字体 | system-ui / -apple-system 堆栈 |

## 设计语言

**风格定位：** macOS 极简基底 + 紫蓝渐变活力点缀

**色彩系统（亮色模式）：**
- Primary: `#667EEA` — 侧栏激活态、链接、按钮
- Accent: `#764BA2` — Logo、强调元素
- 背景: `#F5F5F7` — 经典 macOS 浅灰
- Surface: `#FFFFFF` — 卡片、内容区
- Text: `#1D1D1F` — 主文字
- Muted: `#86868B` — 辅助文字
- 边框: `#E0E0E0` — 分隔线

**色彩系统（暗色模式）：**
- Primary: `#818CF8` — 侧栏激活态
- Accent: `#A78BFA` — Logo
- 背景: `#0F172A`
- Surface: `#1E293B`
- Text: `#F1F5F9`
- Muted: `#64748B`

## 布局结构

### 桌面端（>1024px）
```
┌────────────────────────────────────────────┐
│ ┌─────────┐ ┌────────────────────────────┐ │
│ │         │ │  工具名 · 面包屑   [GitHub] │ │
│ │ 左侧栏  │ ├────────────────────────────┤ │
│ │ 240px   │ │                            │ │
│ │         │ │      工具内容区             │ │
│ │ - Logo  │ │     (动态加载)              │ │
│ │ - 导航  │ │                            │ │
│ │ - 主题  │ │                            │ │
│ │         │ ├────────────────────────────┤ │
│ │         │ │  © 2026 Toolbox            │ │
│ └─────────┘ └────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### 平板端（768-1024px）
- 左侧导航栏收缩为图标栏（60px），仅显示图标
- 或使用汉堡菜单展开全屏覆盖导航

### 移动端（<768px）
- 顶部栏含 Logo + 汉堡菜单按钮 + 主题切换
- 汉堡菜单点击后展开全屏覆盖层显示导航
- 工具卡片网格 2 列布局

## 响应式断点

- 移动端: `<768px`
- 平板端: `768px - 1024px`
- 桌面端: `>1024px`

## 核心架构

### 文件结构

```
Toolbox/
├── index.html                 # 首页（自动读取 manifest 生成工具卡片）
├── 404.html                   # 404 错误页面
├── .nojekyll                  # 禁用 Jekyll
├── tools-manifest.json        # 工具注册清单
├── assets/
│   ├── css/
│   │   └── main.css           # 全局样式（CSS Variables + BEM）
│   ├── js/
│   │   ├── core/
│   │   │   ├── router.js      # 哈希路由（#/tool-name）
│   │   │   └── state.js       # 发布-订阅状态管理
│   │   ├── utils/
│   │   │   ├── dom.js         # DOM 工具函数
│   │   │   ├── storage.js     # localStorage 封装
│   │   │   └── helpers.js     # 通用辅助函数
│   │   └── main.js            # 入口文件，初始化应用
│   └── icons/                 # SVG 图标
├── tools/
│   ├── _template/             # 工具模板
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── json-formatter/
│   ├── timestamp-converter/
│   └── uuid-generator/
└── README.md
```

### 路由系统 (router.js)

- 基于 `hashchange` 事件的哈希路由
- 路由格式：`#/tool-name`（工具页）和 `#/`（首页）
- 路由切换流程：解析 hash → 匹配 manifest → 加载工具资源 → 渲染内容 → 更新标题
- API: `navigate(path)`、`getCurrentRoute()`、`onRouteChange(callback)`

### 状态管理 (state.js)

- 轻量级发布-订阅模式（Event Bus）
- 存储状态：当前工具、主题偏好（light/dark）、最近使用的工具
- API: `subscribe(event, callback)`、`publish(event, data)`、`getState(key)`、`setState(key, value)`

### 工具加载机制

1. 路由变化触发工具加载
2. fetch 获取工具目录下的 `index.html`
3. 将 HTML 注入主内容区 (`id="tool-app"`)
4. 动态创建 `<link>` 加载工具 `style.css`
5. 动态创建 `<script type="module">` 加载工具 `script.js`
6. 调用工具的 `init(container)` 方法
7. 切换工具时调用上一个工具的 `destroy()` 方法清理资源

### 工具生命周期

每个工具必须暴露两个函数：
```javascript
export function init(container) { /* 挂载 DOM、绑定事件 */ }
export function destroy() { /* 清理定时器、解绑事件 */ }
```

工具 CSS 使用 `.tool-{name}` 前缀避免样式污染。

### 工具注册 (tools-manifest.json)

```json
{
  "tools": [
    {
      "id": "json-formatter",
      "name": "JSON 格式化",
      "description": "格式化、验证和压缩 JSON 数据",
      "icon": "json-icon.svg",
      "path": "/tools/json-formatter/"
    }
  ]
}
```

首页通过 fetch 读取 manifest，动态渲染工具卡片网格。

## 首批工具

1. **JSON 格式化器** — 输入 JSON → 格式化/压缩/验证，含错误提示
2. **时间戳转换器** — Unix 秒/毫秒时间戳与日期字符串互转，实时显示
3. **UUID 生成器** — 生成 v4 UUID，支持批量生成（1-100 个），一键复制

## 性能目标

- 首屏加载 < 1.5s（Lighthouse > 90）
- 所有工具按需懒加载
- 每个工具页面独立 `<title>` 和 `<meta description>`
- 直接 URL 访问支持（刷新后保持路由状态）

## 已确认的设计决策

- [x] 风格：macOS 极简 + 紫蓝渐变活力配色
- [x] 布局：左侧导航 + 顶部面包屑 + 内容区 + 底部
- [x] 响应式：三档断点适配，移动端汉堡菜单
- [x] 主题：亮色/暗色切换
- [x] 路由：哈希路由 SPA
- [x] 零外部依赖
