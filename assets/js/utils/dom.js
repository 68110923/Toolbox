/**
 * Toolbox — DOM Utilities
 */

export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

export function createElement(tag, attrs = {}, children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else el.setAttribute(key, value);
  }
  if (typeof children === 'string') el.innerHTML = children;
  else if (Array.isArray(children)) children.forEach(c => el.appendChild(c));
  return el;
}

export function empty(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function toggle(el, show) {
  el.style.display = show ? '' : 'none';
}
