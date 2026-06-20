/**
 * Toolbox — Global State Manager
 * 轻量级发布-订阅模式 + 全局状态管理
 */

class State {
  constructor() {
    this._listeners = {};
    this._state = {
      currentTool: null,
      theme: 'light',
      sidebarOpen: false,
      recentTools: [],
    };
  }

  /**
   * 订阅事件
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  subscribe(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  /**
   * 取消订阅
   * @param {string} event
   * @param {Function} callback
   */
  unsubscribe(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  /**
   * 发布事件
   * @param {string} event
   * @param {*} data
   */
  publish(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => {
      try { cb(data); } catch (e) { console.error('[State] Listener error:', e); }
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

export const state = new State();
export default state;
