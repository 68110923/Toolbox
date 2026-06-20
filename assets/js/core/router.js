/**
 * Toolbox — Hash Router
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
   * @param {string} path
   * @param {Function} handler
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
   * @param {string} path
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

  _handleHashChange() {
    const hash = window.location.hash || '#/';
    const path = hash.slice(1) || '/';
    const [pathname, queryString] = path.split('?');
    const params = Object.fromEntries(new URLSearchParams(queryString));
    const route = { path: pathname, params, hash };

    for (const hook of this._beforeHooks) hook(route);

    this._currentRoute = route;
    const handler = this._routes[pathname];
    if (handler) handler(route);
    else if (this._routes['*']) this._routes['*'](route);

    for (const hook of this._afterHooks) hook(route);
  }
}

export const router = new Router();
export default router;
