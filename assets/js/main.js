/**
 * Toolbox — Application Entry Point
 */

import { router } from './core/router.js';
import state from './core/state.js';
import { toolLoader } from './loader.js';
import { storage } from './utils/storage.js';
import { $, $$, createElement } from './utils/dom.js';

class App {
  constructor() {
    this._manifest = null;
    this._unsubscribers = [];
  }

  async init() {
    const savedTheme = storage.get('theme', 'light');
    state.set('theme', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    await this._renderSidebar();
    toolLoader.setContainer('tool-app');
    this._setupThemeToggle();
    this._setupMobileMenu();
    this._setupRoutes();
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

    // Tools section title
    nav.appendChild(createElement('div', { className: 'sidebar-section-title' }, '工具'));

    // Tool items
    tools.forEach(tool => {
      nav.appendChild(createElement('button', {
        className: 'sidebar-item',
        dataset: { route: `/${tool.id}` },
        onclick: () => router.navigate(`/${tool.id}`)
      }, [
        createElement('span', { className: 'sidebar-item-icon' }, tool.icon),
        createElement('span', {}, tool.name)
      ]));
    });

    // Listen for tool changes → update active state + breadcrumb
    this._unsubscribers.push(
      state.subscribe('change:currentTool', ({ value }) => {
        $$('.sidebar-item').forEach(el => {
          el.classList.toggle('active', el.dataset.route === `/${value}` || (!value && el.dataset.route === '/'));
        });
        const titleEl = $('.topbar-title');
        if (titleEl) {
          const toolInfo = this._manifest?.tools.find(t => t.id === value);
          titleEl.textContent = toolInfo ? toolInfo.name : (value || '首页');
        }
      })
    );
  }

  _setupRoutes() {
    router.on('/', async () => {
      await toolLoader.destroy();
      await this._renderHomepage();
      state.set('currentTool', null);
    });

    router.on('*', async (route) => {
      if (route.path === '/') return;
      const toolId = route.path.replace(/^\//, '');
      await toolLoader.load(toolId);
    });
  }

  async _renderHomepage() {
    const container = $('#tool-app');
    if (!container) return;

    if (!this._manifest) await this._loadManifest();
    const tools = this._manifest?.tools || [];

    container.innerHTML = `
      <div class="fade-in">
        <h2 style="font-size:1.5rem;font-weight:600;margin-bottom:4px;">🔧 Toolbox</h2>
        <p style="color:var(--color-text-secondary);font-size:0.875rem;margin-bottom:24px;">开发工具集合，浏览器中即开即用</p>
        <div class="tools-grid">
          ${tools.map(t => `
            <div class="tool-card" data-route="/${t.id}">
              <div class="tool-card-icon">${t.icon}</div>
              <div class="tool-card-name">${t.name}</div>
              <div class="tool-card-desc">${t.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const route = card.dataset.route;
        if (route) router.navigate(route);
      });
    });
  }

  _setupThemeToggle() {
    const toggleBtn = $('#theme-toggle');
    const toggleTop = $('#theme-toggle-top');
    const themeIcon = $('#theme-icon');
    const themeLabel = $('#theme-label');

    const updateUI = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      const isDark = theme === 'dark';
      if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
      if (themeLabel) themeLabel.textContent = isDark ? '亮色模式' : '暗色模式';
      if (toggleTop) toggleTop.textContent = isDark ? '☀️' : '🌙';
    };

    const toggle = () => {
      const current = state.get('theme');
      const next = current === 'light' ? 'dark' : 'light';
      state.set('theme', next);
      storage.set('theme', next);
      updateUI(next);
    };

    [toggleBtn, toggleTop].forEach(btn => {
      if (btn) btn.addEventListener('click', toggle);
    });

    updateUI(state.get('theme'));
  }

  _setupMobileMenu() {
    const hamburger = $('#hamburger-btn');
    const sidebar = $('#sidebar');
    const overlay = $('#sidebar-overlay');

    const closeSidebar = () => {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    };

    const toggleSidebar = () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    };

    if (hamburger) hamburger.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Close sidebar on route change
    router.after(() => closeSidebar());
  }
}

const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
