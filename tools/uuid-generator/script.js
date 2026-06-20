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
  // No cleanup needed
}
