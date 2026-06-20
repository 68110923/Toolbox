/**
 * Toolbox — Date Replacer Tool
 * 同花顺策略日期替换：将"今天/昨天/前天"替换为 A 股交易日
 */

let inputEl, countEl, outputEl, statusEl;

// ─── A 股交易日历 ─────────────────────────────────────────

/**
 * 判断是否为 A 股交易日
 * @param {Date} date
 * @returns {boolean}
 */
function isTradingDay(date) {
  const d = new Date(date);
  const day = d.getDay();
  // 周末非交易日
  if (day === 0 || day === 6) return false;
  return true;
}

/**
 * 生成 A 股交易日列表（从今天往前推）
 * @param {number} count - 需要的交易日数量
 * @returns {string[]} YYYY-MM-DD 格式，最新在前
 */
function generateTradingDates(count) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 今天如果是交易日则包含，否则从上一个交易日开始
  let cursor = new Date(today);

  while (dates.length < count) {
    if (isTradingDay(cursor)) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      dates.push(`${y}年${m}月${d}日`);
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates;
}

// ─── 日期替换逻辑 ─────────────────────────────────────────

/**
 * 构建日期替换正则映射
 */
function buildPatterns() {
  // 注意：长匹配优先，避免"上上个交易日"被"上个交易日"先匹配
  return [
    { pattern: /大大大前天|(?<!上)上上上上上个交易日/g, offset: 5 },
    { pattern: /大大前天|(?<!上)上上上上个交易日/g, offset: 4 },
    { pattern: /大前天|(?<!上)上上上个交易日/g, offset: 3 },
    { pattern: /前天|(?<!上)上上个交易日/g, offset: 2 },
    { pattern: /昨日|昨天|(?<!上)上个交易日/g, offset: 1 },
    { pattern: /今日|今天/g, offset: 0 },
  ];
}

/**
 * 对指定版本索引替换文本中的日期关键词
 * @param {string} text - 原始文本
 * @param {number} versionIndex - 版本索引 (0=最新交易日)
 * @param {string[]} tradingDates - 交易日列表
 * @returns {string}
 */
function replaceDates(text, versionIndex, tradingDates) {
  const patterns = buildPatterns();
  let result = text;

  for (const { pattern, offset } of patterns) {
    const dateIdx = versionIndex + offset;
    if (dateIdx < tradingDates.length) {
      const dateStr = tradingDates[dateIdx];
      result = result.replace(pattern, dateStr);
    }
  }

  return result;
}

// ─── UI 逻辑 ──────────────────────────────────────────────

function showToast(message) {
  let toast = document.querySelector('.dr-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'dr-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  clearTimeout(toast._removeTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1200);
}

function renderResults(results) {
  outputEl.innerHTML = '';

  if (results.length === 0) {
    outputEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--color-text-secondary);font-size:0.9rem;">暂无结果</div>';
    return;
  }

  const fragment = document.createDocumentFragment();

  results.forEach((text, index) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    // 第一条展示完整内容，其余截断为 23 字符（适配手机端）
    const displayText = index === 0 ? text : text.slice(0, 23) + '...';

    item.innerHTML = `
      <div class="result-number">${index + 1}.</div>
      <div class="result-content" title="${escapeHtml(text)}">${escapeHtml(displayText)}</div>
    `;

    item.addEventListener('click', () => {
      // 移除其他激活状态
      document.querySelectorAll('.result-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      navigator.clipboard.writeText(text).then(() => {
        showToast('✅ 已复制');
      }).catch(() => {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('✅ 已复制');
      });
    });

    fragment.appendChild(item);
  });

  outputEl.appendChild(fragment);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── 主逻辑 ────────────────────────────────────────────────

function generate() {
  const text = inputEl.value.trim();
  if (!text) {
    statusEl.textContent = '⚠️ 请输入策略文本';
    return;
  }

  const count = Math.max(1, Math.min(3000, parseInt(countEl.value) || 300));

  statusEl.textContent = `⏳ 正在生成 ${count} 个版本...`;

  // 使用 setTimeout 让 UI 先更新
  setTimeout(() => {
    const tradingDates = generateTradingDates(count + 10);
    const results = [];

    for (let i = 0; i < count; i++) {
      const replaced = replaceDates(text, i, tradingDates);
      results.push(replaced);
    }

    renderResults(results);
    statusEl.textContent = `✅ 已生成 ${count} 个版本，点击任意结果复制`;
  }, 50);
}

// ─── 生命周期 ──────────────────────────────────────────────

export function init(container) {
  inputEl = container.querySelector('#dr-input');
  countEl = container.querySelector('#dr-count');
  outputEl = container.querySelector('#dr-output');
  statusEl = container.querySelector('#dr-status');

  container.querySelector('#dr-submit').addEventListener('click', generate);
  container.querySelector('#dr-clear').addEventListener('click', () => {
    inputEl.value = '';
    outputEl.innerHTML = '';
    statusEl.textContent = '';
  });

  // 粘贴按钮
  container.querySelector('#dr-paste').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputEl.value = text;
      statusEl.textContent = '📋 已粘贴';
    } catch {
      statusEl.textContent = '⚠️ 粘贴失败，请手动 Ctrl+V';
    }
  });

  // 回车触发
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) generate();
  });

  statusEl.textContent = '就绪，输入文本后点击生成';
}

export function destroy() {
  inputEl = null;
  countEl = null;
  outputEl = null;
  statusEl = null;
  const toast = document.querySelector('.dr-toast');
  if (toast) toast.remove();
}
