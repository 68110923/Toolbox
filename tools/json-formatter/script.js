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
