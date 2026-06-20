# Toolbox 前端架构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个部署在 GitHub Pages 上的纯前端工具集合网站，包含完整架构和 3 个示例工具。

**Architecture:** 哈希路由 SPA，动态 import() 加载工具模块，发布-订阅状态管理，CSS Variables 主题系统。零外部依赖。

**Tech Stack:** 纯 HTML + CSS + JavaScript (ES6+)

---

### Task 1: 项目基础文件

**Files:**
- Create: `.nojekyll`
- Create: `404.html`

- [ ] **Step 1: 创建 .nojekyll**

创建空文件 `.nojekyll`，确保 GitHub Pages 保留 `_` 开头的目录。

```bash
touch .nojekyll
```

- [ ] **Step 2: 创建 404.html**

单页应用需要 404 页面处理 GitHub Pages 上的直接 URL 访问。当用户直接访问 `https://user.github.io/toolbox/tools/json-formatter/` 时，GitHub Pages 会返回 404，此页面通过 JavaScript 自动重定向到哈希路由。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 - Toolbox</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f5f5f7; color: #1d1d1f;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 4rem; font-weight: 700; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { margin: 1rem 0; color: #86868b; font-size: 1.1rem; }
    a { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border-radius: 8px; text-decoration: none; font-weight: 500; transition: opacity 0.2s; }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/Toolbox/">返回首页</a>
  </div>
  <script>
    // 尝试从 URL 路径提取工具名并重定向到哈希路由
    var path = window.location.pathname.replace('/Toolbox/', '').replace(/\/$/, '');
    if (path && path !== '404.html') {
      window.location.replace('/Toolbox/#' + path);
    }
  </script>
</body>
</html>
```

> **注意：** `404.html` 中的 `/Toolbox/` 路径前缀需要根据实际 GitHub Pages 仓库名调整。本地开发时直接用 `/`。

- [ ] **Step 3: 创建目录结构**

```bash
mkdir -p assets/css assets/js/core assets/js/utils assets/icons
mkdir -p tools/_template tools/json-formatter tools/timestamp-converter tools/uuid-generator
```

---

### Task 2: 工具注册清单

**Files:**
- Create: `tools-manifest.json`

- [ ] **Step 1: 创建 tools-manifest.json**

```json
{
  "tools": [
    {
      "id": "json-formatter",
      "name": "JSON 格式化",
      "description": "格式化、验证和压缩 JSON 数据，支持语法高亮和错误定位",
      "icon": "🔧",
      "path": "/tools/json-formatter/",
      "keywords": ["json", "格式化", "验证", "压缩"]
    },
    {
      "id": "timestamp-converter",
      "name": "时间戳转换",
      "description": "Unix 时间戳与日期时间双向转换，支持秒/毫秒",
      "icon": "⏱",
      "path": "/tools/timestamp-converter/",
      "keywords": ["timestamp", "时间戳", "unix", "日期转换"]
    },
    {
      "id": "uuid-generator",
      "name": "UUID 生成器",
      "description": "生成 v4 UUID，支持批量生成和一键复制",
      "icon": "🔑",
      "path": "/tools/uuid-generator/",
      "keywords": ["uuid", "guid", "生成器", "唯一标识"]
    }
  ]
}
```

---

### Task 3: 全局样式 — main.css

**Files:**
- Create: `assets/css/main.css`

- [ ] **Step 1: CSS Variables 和基础重置**

```css
/* ============================================
   Toolbox — Global Styles
   ============================================ */

/* --- CSS Variables (Theme: Light) --- */
:root {
  /* Colors */
  --color-primary: #667eea;
  --color-primary-hover: #5a6fd6;
  --color-accent: #764ba2;
  --color-bg: #f5f5f7;
  --color-surface: #ffffff;
  --color-surface-hover: #f0f0f2;
  --color-surface-alt: #e8e8ed;
  --color-text: #1d1d1f;
  --color-text-secondary: #86868b;
  --color-border: #e0e0e0;
  --color-success: #34d399;
  --color-error: #ef4444;
  --color-warning: #f59e0b;

  /* Sidebar */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 60px;
  --sidebar-bg: #ffffff;
  --sidebar-text: #86868b;
  --sidebar-text-active: #667eea;
  --sidebar-item-hover: #f0f0f2;
  --sidebar-item-active-bg: rgba(102, 126, 234, 0.08);

  /* Layout */
  --topbar-height: 48px;
  --footer-height: 48px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
}

/* --- Dark Theme --- */
[data-theme="dark"] {
  --color-primary: #818cf8;
  --color-primary-hover: #6d77e0;
  --color-accent: #a78bfa;
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-hover: #243044;
  --color-surface-alt: #334155;
  --color-text: #f1f5f9;
  --color-text-secondary: #64748b;
  --color-border: #334155;
  --color-success: #22c55e;
  --color-error: #f87171;
  --color-warning: #fbbf24;
  --sidebar-bg: #1e293b;
  --sidebar-text: #64748b;
  --sidebar-text-active: #818cf8;
  --sidebar-item-hover: #243044;
  --sidebar-item-active-bg: rgba(129, 140, 248, 0.1);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* --- Reset --- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}
a { color: var(--color-primary); text-decoration: none; }
a:hover { color: var(--color-primary-hover); }
img { max-width: 100%; display: block; }
button { cursor: pointer; font-family: inherit; }
input, textarea, select { font-family: inherit; font-size: inherit; }
```

- [ ] **Step 2: 布局样式**

```css
/* --- App Layout --- */
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* --- Sidebar --- */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease, width 0.3s ease;
}

.sidebar-header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-logo {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-logo-icon {
  font-size: 1.4rem;
  -webkit-text-fill-color: initial;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-section-title {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  padding: 12px 12px 6px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  color: var(--sidebar-text);
  font-size: 0.875rem;
  font-weight: 450;
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.sidebar-item:hover {
  background: var(--sidebar-item-hover);
  color: var(--color-text);
}

.sidebar-item.active {
  background: var(--sidebar-item-active-bg);
  color: var(--sidebar-text-active);
  font-weight: 500;
}

.sidebar-item-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* --- Main Area --- */
.main-area {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

/* --- Top Bar --- */
.topbar {
  height: var(--topbar-height);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.topbar-breadcrumb {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* --- Content Area --- */
.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* --- Footer --- */
.app-footer {
  height: var(--footer-height);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
```

- [ ] **Step 3: 首页工具卡片网格**

```css
/* --- Tool Cards Grid (Homepage) --- */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.tool-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.tool-card-icon {
  font-size: 2rem;
  line-height: 1;
}

.tool-card-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
}

.tool-card-desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
```

- [ ] **Step 4: 通用组件样式**

```css
/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 0.15s ease;
}
.btn:hover { background: var(--color-surface-hover); }
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: #fff;
  border: none;
}
.btn-primary:hover { opacity: 0.9; }
.btn-sm { padding: 4px 10px; font-size: 0.8rem; }
.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 1rem;
  transition: all 0.15s ease;
}
.btn-icon:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

/* --- Inputs --- */
.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}
.input:focus { outline: none; border-color: var(--color-primary); }
.textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  resize: vertical;
  transition: border-color 0.15s ease;
}
.textarea:focus { outline: none; border-color: var(--color-primary); }
.textarea::placeholder { color: var(--color-text-secondary); }

/* Select */
.select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
}
.select:focus { outline: none; border-color: var(--color-primary); }

/* --- Toast / Message --- */
.message {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.message-error { background: rgba(239, 68, 68, 0.1); color: var(--color-error); border: 1px solid rgba(239, 68, 68, 0.2); }
.message-success { background: rgba(52, 211, 153, 0.1); color: var(--color-success); border: 1px solid rgba(52, 211, 153, 0.2); }
.message-info { background: rgba(102, 126, 234, 0.1); color: var(--color-primary); border: 1px solid rgba(102, 126, 234, 0.2); }
.message-warning { background: rgba(245, 158, 11, 0.1); color: var(--color-warning); border: 1px solid rgba(245, 158, 11, 0.2); }
```

- [ ] **Step 5: 响应式样式**

```css
/* --- Responsive --- */

/* Mobile hamburger button */
.hamburger-btn {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 1.3rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.hamburger-btn:hover { background: var(--color-surface-hover); }

/* Sidebar overlay (mobile) */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.sidebar-overlay.open { opacity: 1; }

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
  .tools-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
  .sidebar { width: var(--sidebar-collapsed-width); }
  .sidebar-item span:not(.sidebar-item-icon) { display: none; }
  .sidebar-header { padding: 16px 12px; }
  .sidebar-logo span:not(.sidebar-logo-icon) { display: none; }
  .sidebar-nav { padding: 8px; }
  .sidebar-item { justify-content: center; padding: 10px; }
  .sidebar-section-title { display: none; }
  .sidebar-footer .sidebar-item span:not(.sidebar-item-icon) { display: none; }
  .main-area { margin-left: var(--sidebar-collapsed-width); }
}

/* Mobile: <768px */
@media (max-width: 768px) {
  .hamburger-btn { display: flex; }

  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }
  .sidebar.open { transform: translateX(0); }
  .sidebar-overlay.open { display: block; }

  .sidebar.open .sidebar-item span:not(.sidebar-item-icon) { display: inline; }
  .sidebar.open .sidebar-logo span:not(.sidebar-logo-icon) { display: inline; }
  .sidebar.open .sidebar-section-title { display: block; }
  .sidebar.open .sidebar-footer .sidebar-item span:not(.sidebar-item-icon) { display: inline; }

  .main-area { margin-left: 0; }
  .topbar { padding: 0 16px; }
  .content-area { padding: 16px; }
  .tools-grid { grid-template-columns: 1fr; gap: 12px; }
}

/* Wide desktop */
@media (min-width: 1400px) {
  .tools-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
  .content-area { padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%; }
}
```

- [ ] **Step 6: 工具加载状态**

```css
/* --- Tool Container --- */
#tool-app {
  min-height: 300px;
}

/* Loading spinner */
.tool-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: var(--color-text-secondary);
}

.tool-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tool-error {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
}
.tool-error h3 { color: var(--color-error); margin-bottom: 8px; }
```

- [ ] **Step 7: 工具页通用样式**

```css
/* --- Common Tool Page Styles --- */
.tool-page { max-width: 800px; margin: 0 auto; }
.tool-page h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.tool-page .tool-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}
.tool-page .tool-section {
  margin-bottom: 20px;
}
.tool-page .tool-section label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--color-text-secondary);
}
.tool-page .tool-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.tool-page .tool-row .input,
.tool-page .tool-row .textarea { flex: 1; }
.tool-page .tool-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 16px 0;
}
.tool-page .tool-result {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-top: 16px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
}
```

- [ ] **Step 8: 动画和过渡**

```css
/* --- Utilities --- */
.fade-in { animation: fadeIn 0.25s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-text-secondary); }
```

---

### Task 4: 状态管理 — state.js

**Files:**
- Create: `assets/js/core/state.js`

- [ ] **Step 1: 实现 Event Bus + 全局状态**

```javascript
/**
 * Toolbox — Global State Manager
 * 轻量级发布-订阅模式 + 全局状态管理
 */

class State {
  constructor() {
    this._listeners = {};
    this._state = {
      currentTool: null,       // 当前工具 ID
      theme: 'light',          // 'light' | 'dark'
      sidebarOpen: false,      // 移动端侧栏状态
      recentTools: [],         // 最近使用的工具
    };
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅的函数
   */
  subscribe(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  /**
   * 取消订阅
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  unsubscribe(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  /**
   * 发布事件
   * @param {string} event - 事件名
   * @param {*} data - 事件数据
   */
  publish(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => {
      try { cb(data); } catch (e) { console.error(`[State] Listener error:`, e); }
    });
  }

  /**
   * 获取状态值
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this._state[key];
  }

  /**
   * 设置状态值并自动通知
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    const old = this._state[key];
    if (old === value) return;
    this._state[key] = value;
    this.publish(`change:${key}`, { key, value, oldValue: old });
    this.publish('change', { key, value, oldValue: old });
  }

  /**
   * 获取所有状态
   * @returns {Object}
   */
  getAll() {
    return { ...this._state };
  }
}

// 全局单例
export const state = new State();
export default state;
```

---

### Task 5: 路由系统 — router.js

**Files:**
- Create: `assets/js/core/router.js`

- [ ] **Step 1: 实现哈希路由**

```javascript
/**
 * Toolbox — Hash Router
 * 基于 hashchange 的前端路由
 */

class Router {
  constructor() {
    this._routes = {};
    this._beforeHooks = [];
    this._afterHooks = [];
    this._currentRoute = null;
    this._handleHashChange = this._handleHashChange.bind(this);
  }

  /**
   * 初始化路由监听
   */
  init() {
    window.addEventListener('hashchange', this._handleHashChange);
    // 处理初始路由
    setTimeout(() => this._handleHashChange(), 0);
  }

  /**
   * 销毁路由监听
   */
  destroy() {
    window.removeEventListener('hashchange', this._handleHashChange);
  }

  /**
   * 注册路由
   * @param {string} path - 路由路径（如 '/json-formatter'）
   * @param {Function} handler - 路由处理函数
   */
  on(path, handler) {
    this._routes[path] = handler;
  }

  /**
   * 注册前置钩子
   * @param {Function} fn
   */
  before(fn) {
    this._beforeHooks.push(fn);
  }

  /**
   * 注册后置钩子
   * @param {Function} fn
   */
  after(fn) {
    this._afterHooks.push(fn);
  }

  /**
   * 导航到指定路径
   * @param {string} path - 以 '/' 开头（如 '/json-formatter'）
   */
  navigate(path) {
    window.location.hash = '#' + path;
  }

  /**
   * 获取当前路由
   * @returns {{ path: string, params: Object }}
   */
  getCurrentRoute() {
    return this._currentRoute;
  }

  /**
   * 处理 hashchange 事件
   */
  _handleHashChange() {
    const hash = window.location.hash || '#/';
    const path = hash.slice(1) || '/';

    // 解析路径和查询参数
    const [pathname, queryString] = path.split('?');
    const params = Object.fromEntries(new URLSearchParams(queryString));

    const route = { path: pathname, params, hash };

    // 运行前置钩子
    for (const hook of this._beforeHooks) {
      hook(route);
    }

    this._currentRoute = route;

    // 查找匹配路由
    const handler = this._routes[pathname];
    if (handler) {
      handler(route);
    } else if (this._routes['*']) {
      this._routes['*'](route);
    }

    // 运行后置钩子
    for (const hook of this._afterHooks) {
      hook(route);
    }
  }
}

export const router = new Router();
export default router;
```

---

### Task 6: 工具函数模块

**Files:**
- Create: `assets/js/utils/dom.js`
- Create: `assets/js/utils/storage.js`
- Create: `assets/js/utils/helpers.js`

- [ ] **Step 1: DOM 工具函数 — dom.js**

```javascript
/**
 * Toolbox — DOM Utilities
 */

/**
 * 选择单个元素
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
export const $ = (selector, context = document) => context.querySelector(selector);

/**
 * 选择多个元素
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {NodeList}
 */
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * 创建元素
 * @param {string} tag
 * @param {Object} [attrs]
 * @param {string|Element[]} [children]
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') { el.className = value; }
    else if (key === 'dataset') { Object.assign(el.dataset, value); }
    else if (key.startsWith('on')) { el.addEventListener(key.slice(2).toLowerCase(), value); }
    else if (key === 'style' && typeof value === 'object') { Object.assign(el.style, value); }
    else { el.setAttribute(key, value); }
  }
  if (typeof children === 'string') { el.innerHTML = children; }
  else if (Array.isArray(children)) { children.forEach(c => el.appendChild(c)); }
  return el;
}

/**
 * 清空元素内容
 * @param {Element} el
 */
export function empty(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/**
 * 显示/隐藏元素
 * @param {Element} el
 * @param {boolean} show
 */
export function toggle(el, show) {
  el.style.display = show ? '' : 'none';
}
```

- [ ] **Step 2: localStorage 封装 — storage.js**

```javascript
/**
 * Toolbox — Storage Wrapper
 * localStorage 封装，含 JSON 序列化和错误处理
 */

const PREFIX = 'toolbox_';

export const storage = {
  /**
   * 读取值
   * @param {string} key
   * @param {*} [defaultValue=null]
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * 写入值
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('[Storage] Failed to write:', key, e);
    }
  },

  /**
   * 删除值
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  /**
   * 清空所有 toolbox 前缀的数据
   */
  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};

export default storage;
```

- [ ] **Step 3: 通用辅助函数 — helpers.js**

```javascript
/**
 * Toolbox — General Helpers
 */

/**
 * 防抖
 * @param {Function} fn
 * @param {number} delay - 毫秒
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 复制文本到剪贴板
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * 生成随机 ID
 * @returns {string}
 */
export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * 安全获取时间戳
 * @returns {number}
 */
export function now() {
  return Date.now();
}
```

---

### Task 7: 工具加载器 — loader.js

**Files:**
- Create: `assets/js/loader.js`

- [ ] **Step 1: 实现工具动态加载**

```javascript
/**
 * Toolbox — Tool Loader
 * 动态加载工具 HTML/CSS/JS，管理工具生命周期
 */

import state from './core/state.js';

class ToolLoader {
  constructor() {
    this._currentModule = null;
    this._currentToolId = null;
    this._container = null;
  }

  /**
   * 设置挂载容器
   * @param {Element|string} container
   */
  setContainer(container) {
    this._container = typeof container === 'string'
      ? document.getElementById(container)
      : container;
  }

  /**
   * 加载工具
   * @param {string} toolId - 工具 ID（对应 tools-manifest.json 中的 id）
   * @returns {Promise<void>}
   */
  async load(toolId) {
    // 先销毁当前工具
    await this.destroy();

    this._currentToolId = toolId;
    const container = this._container;
    if (!container) return;

    // 显示加载状态
    container.innerHTML = `
      <div class="tool-loading fade-in">
        <div class="tool-loading-spinner"></div>
        <span>加载工具...</span>
      </div>
    `;

    try {
      const toolPath = `/Toolbox/tools/${toolId}`;

      // 1. 加载 HTML
      const htmlResp = await fetch(`${toolPath}/index.html`);
      if (!htmlResp.ok) throw new Error(`HTTP ${htmlResp.status}`);
      const html = await htmlResp.text();
      container.innerHTML = html;
      container.classList.add('fade-in');

      // 2. 加载 CSS（异步，不阻塞）
      this._loadCSS(toolId, `${toolPath}/style.css`);

      // 3. 加载 JS 模块
      const module = await import(`${toolPath}/script.js?v=${Date.now()}`);
      this._currentModule = module;

      // 4. 调用 init
      if (typeof module.init === 'function') {
        await module.init(container);
      }

      state.set('currentTool', toolId);
    } catch (err) {
      console.error(`[Loader] Failed to load tool "${toolId}":`, err);
      container.innerHTML = `
        <div class="tool-error fade-in">
          <h3>⚠️ 加载失败</h3>
          <p>工具 "${toolId}" 加载出错，请稍后重试。</p>
          <p style="font-size:0.8rem;color:var(--color-text-secondary);margin-top:8px;">${err.message}</p>
        </div>
      `;
    }
  }

  /**
   * 销毁当前工具
   */
  async destroy() {
    if (this._currentModule && typeof this._currentModule.destroy === 'function') {
      try { await this._currentModule.destroy(); } catch (e) { console.warn('[Loader] destroy error:', e); }
    }
    // 移除工具 CSS
    const existing = document.querySelectorAll('[data-tool-css]');
    existing.forEach(el => el.remove());
    this._currentModule = null;
    this._currentToolId = null;
  }

  /**
   * 动态加载 CSS
   * @param {string} toolId
   * @param {string} href
   */
  _loadCSS(toolId, href) {
    // 移除旧的工具 CSS
    const existing = document.querySelector(`link[data-tool-css="${toolId}"]`);
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.toolCss = toolId;
    link.onerror = () => console.warn(`[Loader] Failed to load CSS: ${href}`);
    document.head.appendChild(link);
  }
}

export const toolLoader = new ToolLoader();
export default toolLoader;
```

> **注意：** 路径 `/Toolbox/tools/` 中的 `/Toolbox` 前缀需要根据实际 GitHub Pages 仓库名调整。本地开发时建议使用相对路径或通过构建时替换。

---

### Task 8: 入口文件 — main.js

**Files:**
- Create: `assets/js/main.js`

- [ ] **Step 1: 实现应用初始化**

```javascript
/**
 * Toolbox — Application Entry Point
 */

import { router } from './core/router.js';
import state from './core/state.js';
import { toolLoader } from './loader.js';
import { storage } from './utils/storage.js';
import { $, $$, createElement, empty } from './utils/dom.js';

class App {
  constructor() {
    this._manifest = null;
    this._unsubscribers = [];
  }

  async init() {
    // 恢复主题偏好
    const savedTheme = storage.get('theme', 'light');
    state.set('theme', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 渲染侧栏
    await this._renderSidebar();

    // 设置工具加载容器
    toolLoader.setContainer('tool-app');

    // 注册路由
    this._setupRoutes();

    // 初始化路由器
    router.init();
  }

  async _loadManifest() {
    try {
      const resp = await fetch('/Toolbox/tools-manifest.json');
      this._manifest = await resp.json();
      return this._manifest.tools;
    } catch (err) {
      console.error('[App] Failed to load manifest:', err);
      return [];
    }
  }

  async _renderSidebar() {
    const tools = await this._loadManifest();
    const nav = $('.sidebar-nav');
    if (!nav) return;

    // 首页
    nav.appendChild(createElement('button', {
      className: 'sidebar-item',
      dataset: { route: '/' },
      onclick: () => router.navigate('/')
    }, [
      createElement('span', { className: 'sidebar-item-icon' }, '🏠'),
      createElement('span', {}, '首页')
    ]));

    // 工具列表标题
    nav.appendChild(createElement('div', { className: 'sidebar-section-title' }, '工具'));

    // 工具列表
    tools.forEach(tool => {
      const item = createElement('button', {
        className: 'sidebar-item',
        dataset: { route: `/${tool.id}` },
        onclick: () => router.navigate(`/${tool.id}`)
      }, [
        createElement('span', { className: 'sidebar-item-icon' }, tool.icon),
        createElement('span', {}, tool.name)
      ]);
      nav.appendChild(item);
    });

    // 监听主题变化更新侧栏高亮
    this._unsubscribers.push(
      state.subscribe('change:currentTool', ({ value }) => {
        $$('.sidebar-item').forEach(el => {
          el.classList.toggle('active', el.dataset.route === `/${value}` || (!value && el.dataset.route === '/'));
        });
        // 更新面包屑标题
        const titleEl = $('.topbar-title');
        if (titleEl) {
          const toolInfo = this._manifest?.tools.find(t => t.id === value);
          titleEl.textContent = toolInfo ? toolInfo.name : (value ? value : '首页');
        }
      })
    );
  }

  _setupRoutes() {
    // 首页路由
    router.on('/', async () => {
      await toolLoader.destroy();
      await this._renderHomepage();
      state.set('currentTool', null);
    });

    // 通配路由（工具页）
    router.on('*', async (route) => {
      if (route.path === '/') return;
      const toolId = route.path.replace(/^\//, '');
      await toolLoader.load(toolId);
    });
  }

  async _renderHomepage() {
    const container = $('#tool-app');
    if (!container) return;

    if (!this._manifest) {
      await this._loadManifest();
    }

    const tools = this._manifest?.tools || [];

    container.innerHTML = `
      <div class="fade-in">
        <h2 style="font-size:1.5rem;font-weight:600;margin-bottom:4px;">🔧 Toolbox</h2>
        <p style="color:var(--color-text-secondary);font-size:0.875rem;margin-bottom:24px;">开发工具集合，浏览器中即开即用</p>
        <div class="tools-grid">
          ${tools.map(tool => `
            <div class="tool-card" data-route="/${tool.id}">
              <div class="tool-card-icon">${tool.icon}</div>
              <div class="tool-card-name">${tool.name}</div>
              <div class="tool-card-desc">${tool.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 绑定卡片点击事件
    container.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const route = card.dataset.route;
        if (route) router.navigate(route);
      });
    });
  }
}

const app = new App();

// DOM Ready 后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
```

---

### Task 9: 首页 HTML — index.html

**Files:**
- Create: `index.html`

- [ ] **Step 1: 创建首页**

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Toolbox - 在线开发工具集合：JSON格式化、时间戳转换、UUID生成等" />
  <meta name="keywords" content="toolbox,开发工具,JSON格式化,时间戳,UUID生成" />
  <meta name="author" content="Toolbox" />
  <title>Toolbox - 开发工具集合</title>
  <link rel="stylesheet" href="/Toolbox/assets/css/main.css" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔧</text></svg>" />
</head>
<body>
  <div class="app-layout">
    <!-- Sidebar Overlay (Mobile) -->
    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span class="sidebar-logo-icon">🔧</span>
          <span>Toolbox</span>
        </div>
      </div>
      <nav class="sidebar-nav" role="navigation" aria-label="工具导航">
        <!-- 动态渲染 -->
      </nav>
      <div class="sidebar-footer">
        <button class="sidebar-item" id="theme-toggle" title="切换主题">
          <span class="sidebar-item-icon" id="theme-icon">🌙</span>
          <span id="theme-label">暗色模式</span>
        </button>
        <a href="https://github.com/Aedda/Toolbox" class="sidebar-item" target="_blank" rel="noopener noreferrer">
          <span class="sidebar-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </span>
          <span>GitHub</span>
        </a>
      </div>
    </aside>

    <!-- Main Area -->
    <main class="main-area">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger-btn" id="hamburger-btn" aria-label="菜单">☰</button>
          <span class="topbar-title">首页</span>
          <span class="topbar-breadcrumb"></span>
        </div>
        <div class="topbar-right">
          <button class="btn-icon" id="theme-toggle-top" title="切换主题">🌙</button>
        </div>
      </header>

      <!-- Content -->
      <section class="content-area" id="content-area">
        <div id="tool-app">
          <!-- 工具内容动态渲染 -->
        </div>
      </section>

      <!-- Footer -->
      <footer class="app-footer">
        &copy; 2026 Toolbox &middot; MIT License &middot; Built with ❤️
      </footer>
    </main>
  </div>

  <script type="module" src="/Toolbox/assets/js/main.js"></script>
</body>
</html>
```

---

### Task 10: 工具模板 — _template/

**Files:**
- Create: `tools/_template/index.html`
- Create: `tools/_template/style.css`
- Create: `tools/_template/script.js`

- [ ] **Step 1: 工具模板 HTML**

```html
<!-- tools/_template/index.html -->
<div class="tool-page tool-{name}" id="tool-app">
  <h2>工具名称</h2>
  <p class="tool-subtitle">工具功能描述</p>

  <!-- 输入区 -->
  <div class="tool-section">
    <label>输入</label>
    <textarea class="textarea" id="tool-input" placeholder="请输入..."></textarea>
  </div>

  <!-- 操作按钮 -->
  <div class="tool-actions">
    <button class="btn btn-primary" id="tool-submit">执行</button>
    <button class="btn" id="tool-clear">清空</button>
  </div>

  <!-- 输出区 -->
  <div class="tool-section">
    <label>输出</label>
    <div class="tool-result" id="tool-output"></div>
  </div>
</div>
```

- [ ] **Step 2: 工具模板 CSS**

```css
/* tools/_template/style.css */
.tool-{name} { /* 工具专属样式 */ }
.tool-{name} .tool-custom-section { margin-bottom: 16px; }
```

- [ ] **Step 3: 工具模板 JS**

```javascript
/**
 * Toolbox — {ToolName} Tool
 * @module tools/{tool-id}
 */

/**
 * 工具初始化
 * @param {HTMLElement} container - 挂载容器
 */
export function init(container) {
  // 获取 DOM 元素
  // 绑定事件
  // 初始化状态
  console.log('{ToolName} initialized');
}

/**
 * 工具销毁
 * 清理定时器、解绑事件、重置状态
 */
export function destroy() {
  // 解绑事件
  // 清理定时器
  // 重置状态
  console.log('{ToolName} destroyed');
}
```

---

### Task 11: JSON 格式化工具

**Files:**
- Create: `tools/json-formatter/index.html`
- Create: `tools/json-formatter/style.css`
- Create: `tools/json-formatter/script.js`

- [ ] **Step 1: 工具 HTML**

```html
<!-- tools/json-formatter/index.html -->
<div class="tool-page tool-json-formatter" id="tool-app">
  <h2>🔧 JSON 格式化</h2>
  <p class="tool-subtitle">格式化、验证和压缩 JSON 数据，支持语法高亮和错误定位</p>

  <div class="tool-section">
    <label>输入 JSON</label>
    <textarea class="textarea" id="jf-input" placeholder="在此粘贴 JSON 数据..." rows="10"></textarea>
  </div>

  <div class="tool-actions">
    <button class="btn btn-primary" id="jf-format">🔄 格式化</button>
    <button class="btn" id="jf-compress">📦 压缩</button>
    <button class="btn" id="jf-validate">✅ 验证</button>
    <button class="btn" id="jf-clear">🗑 清空</button>
  </div>

  <div class="tool-section">
    <label>输出</label>
    <div class="tool-result" id="jf-output" style="max-height:500px;"></div>
  </div>

  <div id="jf-message"></div>
</div>
```

- [ ] **Step 2: 工具 CSS**

```css
/* tools/json-formatter/style.css */
.tool-json-formatter { }
.tool-json-formatter .json-error {
  color: var(--color-error);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.06);
  border-radius: var(--radius-sm);
  margin-top: 8px;
}
.tool-json-formatter .json-line {
  display: block;
  line-height: 1.7;
  white-space: pre;
}
.tool-json-formatter .json-key { color: #881391; }
.tool-json-formatter .json-string { color: #1a7f37; }
.tool-json-formatter .json-number { color: #0550ae; }
.tool-json-formatter .json-boolean { color: #cf222e; }
.tool-json-formatter .json-null { color: #656d76; }
.tool-json-formatter .json-bracket { color: #57606a; }

[data-theme="dark"] .tool-json-formatter .json-key { color: #d2a8ff; }
[data-theme="dark"] .tool-json-formatter .json-string { color: #7ee787; }
[data-theme="dark"] .tool-json-formatter .json-number { color: #79c0ff; }
[data-theme="dark"] .tool-json-formatter .json-boolean { color: #ff7b72; }
[data-theme="dark"] .tool-json-formatter .json-null { color: #8b949e; }
[data-theme="dark"] .tool-json-formatter .json-bracket { color: #8b949e; }
```

- [ ] **Step 3: 工具 JS**

```javascript
/**
 * Toolbox — JSON Formatter Tool
 */

let inputEl, outputEl, messageEl;

export function init(container) {
  inputEl = container.querySelector('#jf-input');
  outputEl = container.querySelector('#jf-output');
  messageEl = container.querySelector('#jf-message');

  container.querySelector('#jf-format').addEventListener('click', format);
  container.querySelector('#jf-compress').addEventListener('click', compress);
  container.querySelector('#jf-validate').addEventListener('click', validate);
  container.querySelector('#jf-clear').addEventListener('click', clear);
}

export function destroy() {
  inputEl = null;
  outputEl = null;
  messageEl = null;
}

function getJSON() {
  const raw = inputEl.value.trim();
  if (!raw) { showMessage('请输入 JSON 数据', 'warning'); return null; }
  try { return JSON.parse(raw); }
  catch (e) { showMessage(`JSON 解析错误: ${e.message}`, 'error'); return null; }
}

function showMessage(text, type = 'info') {
  messageEl.innerHTML = `<div class="message message-${type}">${text}</div>`;
}

function format() {
  const json = getJSON();
  if (!json) return;
  outputEl.innerHTML = syntaxHighlight(JSON.stringify(json, null, 2));
  showMessage('✅ 格式化完成', 'success');
}

function compress() {
  const json = getJSON();
  if (!json) return;
  outputEl.textContent = JSON.stringify(json);
  showMessage('✅ 压缩完成', 'success');
}

function validate() {
  const raw = inputEl.value.trim();
  if (!raw) { showMessage('请输入 JSON 数据', 'warning'); return; }
  try {
    JSON.parse(raw);
    showMessage('✅ 有效的 JSON', 'success');
    outputEl.textContent = 'JSON 语法正确';
  } catch (e) {
    const match = e.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      const line = raw.slice(0, pos).split('\n').length;
      const col = pos - raw.lastIndexOf('\n', pos);
      showMessage(`❌ 第 ${line} 行 第 ${col} 列: ${e.message}`, 'error');
    } else {
      showMessage(`❌ ${e.message}`, 'error');
    }
    outputEl.textContent = '';
  }
}

function clear() {
  inputEl.value = '';
  outputEl.textContent = '';
  messageEl.innerHTML = '';
}

function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/"([^"]*)"(?=\s*[,}\]])/g, '<span class="json-string">"$1"</span>')
    .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="json-number">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
    .replace(/\bnull\b/g, '<span class="json-null">null</span>')
    .replace(/([{}[\]])/g, '<span class="json-bracket">$1</span>');
}
```

---

### Task 12: 时间戳转换工具

**Files:**
- Create: `tools/timestamp-converter/index.html`
- Create: `tools/timestamp-converter/style.css`
- Create: `tools/timestamp-converter/script.js`

- [ ] **Step 1: 工具 HTML**

```html
<!-- tools/timestamp-converter/index.html -->
<div class="tool-page tool-timestamp-converter" id="tool-app">
  <h2>⏱ 时间戳转换</h2>
  <p class="tool-subtitle">Unix 时间戳与日期时间双向转换，支持秒/毫秒</p>

  <!-- 时间戳 → 日期 -->
  <div class="tool-section">
    <label>时间戳 → 日期</label>
    <div class="tool-row">
      <input type="text" class="input" id="ts-input" placeholder="输入 Unix 时间戳（秒或毫秒）" />
      <select class="select" id="ts-unit">
        <option value="auto">自动检测</option>
        <option value="seconds">秒 (s)</option>
        <option value="milliseconds">毫秒 (ms)</option>
      </select>
      <button class="btn btn-primary" id="ts-to-date">→ 转换</button>
    </div>
    <div class="tool-result" id="ts-result-1" style="min-height:40px;"></div>
  </div>

  <!-- 日期 → 时间戳 -->
  <div class="tool-section">
    <label>日期 → 时间戳</label>
    <div class="tool-row">
      <input type="datetime-local" class="input" id="ts-datetime" />
      <button class="btn btn-primary" id="ts-to-timestamp">→ 转换</button>
    </div>
    <div class="tool-result" id="ts-result-2" style="min-height:40px;"></div>
  </div>

  <!-- 当前时间戳 -->
  <div class="tool-section">
    <button class="btn" id="ts-now">📡 获取当前时间戳</button>
    <div class="tool-result" id="ts-result-3" style="min-height:40px;"></div>
  </div>
</div>
```

- [ ] **Step 2: 工具 JS**

```javascript
/**
 * Toolbox — Timestamp Converter Tool
 */

export function init(container) {
  container.querySelector('#ts-to-date').addEventListener('click', toDate);
  container.querySelector('#ts-to-timestamp').addEventListener('click', toTimestamp);
  container.querySelector('#ts-now').addEventListener('click', showNow);

  // 回车触发转换
  container.querySelector('#ts-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') toDate();
  });
}

function toDate() {
  const input = document.getElementById('ts-input');
  const unit = document.getElementById('ts-unit');
  const output = document.getElementById('ts-result-1');
  const raw = input.value.trim();

  if (!raw) { output.textContent = '请输入时间戳'; return; }
  const num = Number(raw);
  if (isNaN(num)) { output.textContent = '请输入有效的数字'; return; }

  let ms = num;
  if (unit.value === 'seconds' || (unit.value === 'auto' && num < 1e12)) {
    ms = num * 1000;
  } else if (unit.value === 'milliseconds' || (unit.value === 'auto' && num >= 1e12)) {
    ms = num;
  }

  try {
    const d = new Date(ms);
    if (isNaN(d.getTime())) throw new Error('Invalid date');
    const utcStr = d.toUTCString();
    const localStr = d.toLocaleString('zh-CN', { timeZoneName: 'short' });
    const isoStr = d.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, ' +00:00');
    const detail = `
      UTC: ${utcStr}
      本地: ${localStr}
      ISO 8601: ${isoStr}
      毫秒: ${d.getTime()}
      秒: ${Math.floor(d.getTime() / 1000)}
    `.trim();
    output.textContent = detail;
    output.style.whiteSpace = 'pre-line';
  } catch {
    output.textContent = '无效的时间戳';
  }
}

function toTimestamp() {
  const input = document.getElementById('ts-datetime');
  const output = document.getElementById('ts-result-2');
  const val = input.value;
  if (!val) { output.textContent = '请选择日期和时间'; return; }
  const d = new Date(val);
  output.textContent = `
    秒 (s): ${Math.floor(d.getTime() / 1000)}
    毫秒 (ms): ${d.getTime()}
  `.trim();
  output.style.whiteSpace = 'pre-line';
}

function showNow() {
  const output = document.getElementById('ts-result-3');
  const now = Date.now();
  output.textContent = `
    秒 (s): ${Math.floor(now / 1000)}
    毫秒 (ms): ${now}
    本地时间: ${new Date(now).toLocaleString('zh-CN')}
  `.trim();
  output.style.whiteSpace = 'pre-line';
}

export function destroy() {
  // 无需清理
}
```

---

### Task 13: UUID 生成工具

**Files:**
- Create: `tools/uuid-generator/index.html`
- Create: `tools/uuid-generator/style.css`
- Create: `tools/uuid-generator/script.js`

- [ ] **Step 1: 工具 HTML**

```html
<!-- tools/uuid-generator/index.html -->
<div class="tool-page tool-uuid-generator" id="tool-app">
  <h2>🔑 UUID 生成器</h2>
  <p class="tool-subtitle">生成 v4 UUID，支持批量生成和一键复制</p>

  <div class="tool-section">
    <label>生成数量</label>
    <div class="tool-row">
      <input type="number" class="input" id="ug-count" value="1" min="1" max="100" style="max-width:100px;" />
      <button class="btn btn-primary" id="ug-generate">🎲 生成</button>
      <button class="btn" id="ug-copy-all">📋 复制全部</button>
      <button class="btn" id="ug-clear">🗑 清空</button>
    </div>
  </div>

  <div class="tool-section">
    <div class="tool-actions" style="margin:0;">
      <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;color:var(--color-text-secondary);cursor:pointer;">
        <input type="checkbox" id="ug-uppercase" />
        大写
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;color:var(--color-text-secondary);cursor:pointer;">
        <input type="checkbox" id="ug-braces" />
        带花括号 { }
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;color:var(--color-text-secondary);cursor:pointer;">
        <input type="checkbox" id="ug-hyphens" checked />
        保留连字符 -
      </label>
    </div>
  </div>

  <div class="tool-section">
    <div class="tool-result" id="ug-output" style="max-height:500px;font-family:var(--font-mono);font-size:0.8rem;"></div>
  </div>
</div>
```

- [ ] **Step 2: 工具 JS**

```javascript
/**
 * Toolbox — UUID Generator Tool
 */

export function init(container) {
  container.querySelector('#ug-generate').addEventListener('click', generate);
  container.querySelector('#ug-copy-all').addEventListener('click', copyAll);
  container.querySelector('#ug-clear').addEventListener('click', clearOutput);
  container.querySelector('#ug-count').addEventListener('keydown', e => {
    if (e.key === 'Enter') generate();
  });
}

function uuidV4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generate() {
  const countEl = document.getElementById('ug-count');
  const outputEl = document.getElementById('ug-output');
  const uppercase = document.getElementById('ug-uppercase').checked;
  const braces = document.getElementById('ug-braces').checked;
  const hyphens = document.getElementById('ug-hyphens').checked;

  let count = parseInt(countEl.value) || 1;
  count = Math.max(1, Math.min(100, count));

  const uuids = [];
  for (let i = 0; i < count; i++) {
    let id = uuidV4();
    if (!hyphens) id = id.replace(/-/g, '');
    if (uppercase) id = id.toUpperCase();
    if (braces) id = '{' + id + '}';
    uuids.push(id);
  }

  outputEl.textContent = uuids.join('\n');
}

function copyAll() {
  const outputEl = document.getElementById('ug-output');
  const text = outputEl.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('ug-copy-all');
    const orig = btn.textContent;
    btn.textContent = '✅ 已复制';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

function clearOutput() {
  document.getElementById('ug-output').textContent = '';
}

export function destroy() {
  // 无需清理
}
```

---

### Task 14: 主题切换功能

**Files:**
- Modify: `assets/js/main.js`（已包含在 Task 8 中，此处补充主题切换逻辑）

- [ ] **Step 1: 补充主题切换功能**

在 `assets/js/main.js` 的 `_renderSidebar` 方法之后，或在 `init` 方法中，添加主题切换绑定：

```javascript
// 在 App.init() 中补充
_setupThemeToggle() {
  const toggleBtn = $('#theme-toggle');
  const toggleTop = $('#theme-toggle-top');
  const themeIcon = $('#theme-icon');
  const themeLabel = $('#theme-label');

  const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
    if (themeLabel) themeLabel.textContent = isDark ? '亮色模式' : '暗色模式';
    if (toggleTop) toggleTop.textContent = isDark ? '☀️' : '🌙';
  };

  const toggleTheme = () => {
    const current = state.get('theme');
    const next = current === 'light' ? 'dark' : 'light';
    state.set('theme', next);
    storage.set('theme', next);
    updateThemeUI(next);
  };

  [toggleBtn, toggleTop].forEach(btn => {
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  // 初始化 UI
  updateThemeUI(state.get('theme'));
}
```

在 `init()` 方法末尾调用 `this._setupThemeToggle()`。

---

### Task 15: README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 编写 README**

```markdown
# 🔧 Toolbox

> 在线开发工具集合 — 纯前端，零依赖，浏览器中即开即用。

## 工具列表

- 🔧 **JSON 格式化** — 格式化、验证和压缩 JSON 数据
- ⏱ **时间戳转换** — Unix 时间戳与日期时间双向转换
- 🔑 **UUID 生成器** — 生成 v4 UUID，支持批量生成

## 本地开发

无需构建工具，直接在浏览器中打开 `index.html` 即可。

```bash
# 使用本地服务器（推荐，避免 CORS 问题）
python3 -m http.server 8080
# 或使用 VS Code Live Server
```

然后访问 `http://localhost:8080`

## 添加新工具

1. 复制 `tools/_template/` 目录为 `tools/your-tool-name/`
2. 修改 `index.html`、`style.css`、`script.js`
3. 在 `tools-manifest.json` 中添加工具信息
4. 确保工具暴露 `init(container)` 和 `destroy()` 方法

### 工具模板

每个工具目录包含三个文件：

- `index.html` — 工具 UI（包含 `id="tool-app"` 挂载点）
- `style.css` — 工具样式（使用 `.tool-{name}` 前缀）
- `script.js` — 工具逻辑（export init/destroy）

```javascript
export function init(container) {
  // 挂载 DOM、绑定事件
}

export function destroy() {
  // 清理资源、解绑事件
}
```

## 部署

项目部署到 GitHub Pages：

```bash
git push origin main
```

在 GitHub 仓库 Settings > Pages 中设置源为 `main` 分支的根目录。

## 技术栈

- 纯 HTML + CSS + JavaScript (ES6+)
- 哈希路由 SPA
- CSS Variables 亮色/暗色主题
- 零外部依赖

## License

MIT
```

---

### 自检

**1. 需求覆盖：**
- ✅ 完整目录结构 — Task 1-3 覆盖
- ✅ 路由系统 (router.js) — Task 5
- ✅ 状态管理 (state.js) — Task 4
- ✅ 工具加载机制 — Task 7 (loader.js)
- ✅ 布局 & UI — Task 3 (main.css), Task 9 (index.html)
- ✅ 工具模板 — Task 10
- ✅ JSON 格式化器 — Task 11
- ✅ 时间戳转换 — Task 12
- ✅ UUID 生成器 — Task 13
- ✅ 亮暗主题切换 — Task 14
- ✅ README.md — Task 15
- ✅ 首个加载 < 1.5s — 零依赖、按需加载
- ✅ 直接 URL 访问 — 404.html + 哈希路由

**2. 无占位符：** 所有代码块包含完整实现

**3. 类型一致性：** router/state API 在各 Task 中保持一致
