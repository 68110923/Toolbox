/**
 * Toolbox — Date Replacer Tool
 * 同花顺策略日期替换：将"今天/昨天/前天"替换为 A 股交易日
 */

let inputEl, countEl, outputEl, statusEl;

// ─── A 股交易日历（含节假日） ────────────────────────────

/**
 * 内置节假日缓存（API 获取失败时使用）
 * 格式: "YYYY-MM-DD" 列表
 * 覆盖 2024-2027 主要节假日
 */
const FALLBACK_HOLIDAYS = new Set([
  // ── 2024 ──
  '2024-01-01', // 元旦
  '2024-02-09','2024-02-10','2024-02-11','2024-02-12',
  '2024-02-13','2024-02-14','2024-02-15','2024-02-16','2024-02-17', // 春节
  '2024-04-04','2024-04-05', // 清明节
  '2024-05-01','2024-05-02','2024-05-03', // 劳动节
  '2024-06-10', // 端午节
  '2024-09-15','2024-09-16','2024-09-17', // 中秋节
  '2024-10-01','2024-10-02','2024-10-03','2024-10-04','2024-10-07', // 国庆节
  // ── 2025 ──
  '2025-01-01', // 元旦
  '2025-01-28','2025-01-29','2025-01-30','2025-01-31',
  '2025-02-01','2025-02-02','2025-02-03','2025-02-04', // 春节
  '2025-04-04','2025-04-05','2025-04-06', // 清明节
  '2025-05-01','2025-05-02','2025-05-05', // 劳动节
  '2025-05-31','2025-06-01','2025-06-02', // 端午节
  '2025-10-01','2025-10-02','2025-10-03','2025-10-06','2025-10-07','2025-10-08', // 国庆+中秋
  // ── 2026 ──
  '2026-01-01','2026-01-02','2026-01-03', // 元旦
  '2026-02-16','2026-02-17','2026-02-18','2026-02-19',
  '2026-02-20','2026-02-21','2026-02-22', // 春节 (2/17 除夕~2/23 初六)
  '2026-04-04','2026-04-05','2026-04-06', // 清明节 (4/5 周日)
  '2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05', // 劳动节
  '2026-06-19','2026-06-20','2026-06-21', // 端午节 (6/19 周五)
  '2026-09-27','2026-09-28','2026-09-29','2026-09-30', // 中秋节 (9/27 周日)
  '2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07', // 国庆节
  // ── 2027 ──
  '2027-01-01','2027-01-02','2027-01-03', // 元旦
  '2027-02-06','2027-02-07','2027-02-08','2027-02-09',
  '2027-02-10','2027-02-11','2027-02-12', // 春节
  '2027-04-04','2027-04-05', // 清明节
  '2027-05-01','2027-05-02','2027-05-03', // 劳动节
  '2027-06-14','2027-06-15','2027-06-16', // 端午节
  '2027-09-20','2027-09-21', // 中秋节
  '2027-10-01','2027-10-02','2027-10-03','2027-10-04','2027-10-05','2027-10-06','2027-10-07', // 国庆节
]);

/**
 * 从 timor.tech 公费 API 获取节假日数据
 * https://timor.tech/api/holiday/
 */
let _holidays = null;
let _holidaysLoading = false;
let _holidaysPromise = null;

async function loadHolidays() {
  if (_holidaysLoading) return _holidaysPromise;
  _holidaysLoading = true;

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  _holidaysPromise = (async () => {
    const holidaySet = new Set(FALLBACK_HOLIDAYS);

    try {
      // 尝试通过 API 获取更准确的假日数据
      const results = await Promise.allSettled(
        years.map(year =>
          fetch(`https://timor.tech/api/holiday/year/${year}`, { signal: AbortSignal.timeout(3000) })
            .then(r => r.json())
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.code === 0) {
          const data = result.value.holiday || result.value;
          // timor.tech 返回格式: { "2026-01-01": { holiday: true, ... }, ... }
          for (const [dateStr, info] of Object.entries(data)) {
            if (info.holiday === true || info.type?.type === 2 || info.type?.type === 3) {
              holidaySet.add(dateStr);
            }
            // 调休上班日（周末但市场开市）→ 从假日集合中移除
            if (info.type?.type === 1 && info.holiday === false) {
              holidaySet.delete(dateStr);
            }
          }
        }
      }
    } catch {
      // API 失败，使用内置 fallback 数据
      console.log('[DateReplacer] Using fallback holiday data');
    }

    _holidays = holidaySet;
    return holidaySet;
  })();

  return _holidaysPromise;
}

/**
 * 判断是否为 A 股交易日
 * 排除：周末 + 法定节假日
 * 包含：调休上班日
 */
function isTradingDay(date) {
  const d = new Date(date);
  const day = d.getDay();
  // 周末非交易日（除非是调休上班日，已从 holidays 中移除）
  if (day === 0 || day === 6) return false;

  // 检查法定节假日
  if (_holidays) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayStr}`;
    if (_holidays.has(dateStr)) return false;
  }

  return true;
}

/**
 * 生成 A 股交易日列表（从今天往前推）
 * @param {number} count - 需要的交易日数量
 * @returns {string[]} YYYY年MM月DD日 格式，最新在前
 */
function generateTradingDates(count) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  setTimeout(async () => {
    // 确保节假日数据已加载
    if (!_holidays) {
      await loadHolidays();
    }

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

  // 异步加载节假日数据
  loadHolidays().then(() => {
    statusEl.textContent = '✓ 已加载交易日历（含节假日排除）';
  }).catch(() => {
    // fallback 数据已自动使用
    statusEl.textContent = '就绪，输入文本后点击生成';
  });
}

export function destroy() {
  inputEl = null;
  countEl = null;
  outputEl = null;
  statusEl = null;
  const toast = document.querySelector('.dr-toast');
  if (toast) toast.remove();
}
