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

  setContainer(container) {
    this._container = typeof container === 'string'
      ? document.getElementById(container)
      : container;
  }

  async load(toolId) {
    await this.destroy();

    this._currentToolId = toolId;
    const container = this._container;
    if (!container) return;

    container.innerHTML = `
      <div class="tool-loading fade-in">
        <div class="tool-loading-spinner"></div>
        <span>加载工具...</span>
      </div>
    `;

    try {
      const toolPath = `/Toolbox/tools/${toolId}`;

      const htmlResp = await fetch(`${toolPath}/index.html`);
      if (!htmlResp.ok) throw new Error(`HTTP ${htmlResp.status}`);
      const html = await htmlResp.text();
      container.innerHTML = html;
      container.classList.add('fade-in');

      this._loadCSS(toolId, `${toolPath}/style.css`);

      const module = await import(`${toolPath}/script.js?v=${Date.now()}`);
      this._currentModule = module;

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

  async destroy() {
    if (this._currentModule && typeof this._currentModule.destroy === 'function') {
      try { await this._currentModule.destroy(); } catch (e) { console.warn('[Loader] destroy error:', e); }
    }
    const existing = document.querySelectorAll('[data-tool-css]');
    existing.forEach(el => el.remove());
    this._currentModule = null;
    this._currentToolId = null;
  }

  _loadCSS(toolId, href) {
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
