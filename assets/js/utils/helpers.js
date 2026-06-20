/**
 * Toolbox — General Helpers
 */

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(textarea);
    textarea.select();
    try { return document.execCommand('copy'); }
    catch { return false; }
    finally { document.body.removeChild(textarea); }
  }
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function now() {
  return Date.now();
}
