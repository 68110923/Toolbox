# 🔧 Toolbox

> 在线开发工具集合 — 纯前端，零依赖，浏览器中即开即用。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-blue)](https://aedda.github.io/Toolbox/)

## 工具列表

| 工具 | 描述 |
|------|------|
| 🔧 **JSON 格式化** | 格式化、验证和压缩 JSON 数据，支持语法高亮 |
| ⏱ **时间戳转换** | Unix 时间戳与日期时间双向转换，支持秒/毫秒 |
| 🔑 **UUID 生成器** | 生成 v4 UUID，支持批量生成（最多100个）和一键复制 |

## 本地开发

无需构建工具，直接在浏览器中打开即可：

```bash
# 使用本地服务器（推荐，避免 CORS 问题）
cd Toolbox
python3 -m http.server 8080
# 或使用 npx serve .
# 或使用 VS Code Live Server
```

然后访问 `http://localhost:8080`

> ⚠️ 注意：由于代码中使用 `/Toolbox/` 作为 GitHub Pages 的根路径前缀，本地开发时如果不在 `/Toolbox` 子目录下运行，需要手动修改 `index.html`、`404.html` 和 `main.js` 中的路径前缀为 `/`。

## 添加新工具

1. 复制 `tools/_template/` 目录为 `tools/your-tool-name/`
2. 修改三个文件：
   - `index.html` — 工具 UI（使用 `.tool-{name}` 类名前缀）
   - `style.css` — 工具专属样式（`.tool-{name}` 前缀避免污染）
   - `script.js` — 工具逻辑（见下方模板）
3. 在 `tools-manifest.json` 中添加工具信息

### 工具脚本模板

```javascript
export function init(container) {
  // 挂载 DOM、绑定事件、初始化状态
}

export function destroy() {
  // 清理定时器、解绑事件、重置状态
}
```

### 添加流程

```bash
# 1. 复制模板
cp -r tools/_template/ tools/my-tool/
# 2. 编辑三个文件
# 3. 修改 tools-manifest.json 添加工具信息
```

## 技术栈

- **纯 HTML + CSS + JavaScript (ES6+)** — 零外部依赖
- **哈希路由** — SPA 页面切换，支持直接 URL 访问
- **CSS Variables** — 完整的亮色/暗色主题系统
- **动态模块加载** — `import()` 按需加载工具，自动生命周期管理
- **发布-订阅状态管理** — 轻量级 Event Bus

## 项目结构

```
Toolbox/
├── index.html              # 首页
├── 404.html                # 404 错误页（含 SPA 重定向）
├── .nojekyll               # 禁用 Jekyll
├── tools-manifest.json     # 工具注册清单
├── assets/
│   ├── css/
│   │   └── main.css        # 全局样式（主题 + 布局 + 组件）
│   ├── js/
│   │   ├── core/
│   │   │   ├── router.js   # 哈希路由
│   │   │   └── state.js    # 状态管理
│   │   ├── utils/
│   │   │   ├── dom.js      # DOM 工具
│   │   │   ├── storage.js  # localStorage 封装
│   │   │   └── helpers.js  # 通用辅助函数
│   │   ├── loader.js       # 工具动态加载器
│   │   └── main.js         # 入口文件
│   └── icons/
├── tools/
│   ├── _template/          # 工具模板
│   ├── json-formatter/     # JSON 格式化工具
│   ├── timestamp-converter/ # 时间戳转换工具
│   └── uuid-generator/     # UUID 生成工具
└── README.md
```

## 部署

项目部署到 GitHub Pages：

1. 将代码推送到 GitHub 仓库 `Aedda/Toolbox`
2. 在仓库 Settings > Pages 中设置：
   - Source: **Deploy from a branch**
   - Branch: `main`, root `/`
3. 等待几分钟，访问 `https://aedda.github.io/Toolbox/`

## 设计语言

- **风格：** macOS 极简基底 + 紫蓝渐变（`#667EEA` → `#764BA2`）活力点缀
- **布局：** 左侧固定导航栏 + 顶部面包屑 + 内容区 + 底部
- **响应式：** 移动端（<768px）汉堡菜单 / 平板端（768-1024px）图标栏 / 桌面端（>1024px）完整侧栏
- **字体：** system-ui / -apple-system 字体堆栈

## License

MIT
