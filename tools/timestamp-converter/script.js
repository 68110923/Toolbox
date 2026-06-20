/**
 * Toolbox — Timestamp Converter Tool
 */

export function init(container) {
  container.querySelector('#ts-to-date').addEventListener('click', toDate);
  container.querySelector('#ts-to-timestamp').addEventListener('click', toTimestamp);
  container.querySelector('#ts-now').addEventListener('click', showNow);

  container.querySelector('#ts-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') toDate();
  });
}

function toDate() {
  const input = document.getElementById('ts-input');
  const unit = document.getElementById('ts-unit');
  const output = document.getElementById('ts-result-1');
  const raw = input.value.trim();

  if (!raw) { output.textContent = '请输入时间戳'; return; }
  const num = Number(raw);
  if (isNaN(num)) { output.textContent = '请输入有效的数字'; return; }

  let ms = num;
  if (unit.value === 'seconds' || (unit.value === 'auto' && num < 1e12)) {
    ms = num * 1000;
  } else if (unit.value === 'milliseconds' || (unit.value === 'auto' && num >= 1e12)) {
    ms = num;
  }

  try {
    const d = new Date(ms);
    if (isNaN(d.getTime())) throw new Error('Invalid date');
    const lines = [
      'UTC: ' + d.toUTCString(),
      '本地: ' + d.toLocaleString('zh-CN', { timeZoneName: 'short' }),
      'ISO 8601: ' + d.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, ' +00:00'),
      '毫秒 (ms): ' + d.getTime(),
      '秒 (s): ' + Math.floor(d.getTime() / 1000),
    ];
    output.textContent = lines.join('\n');
    output.style.whiteSpace = 'pre-line';
  } catch {
    output.textContent = '无效的时间戳';
  }
}

function toTimestamp() {
  const input = document.getElementById('ts-datetime');
  const output = document.getElementById('ts-result-2');
  const val = input.value;
  if (!val) { output.textContent = '请选择日期和时间'; return; }
  const d = new Date(val);
  const lines = [
    '秒 (s): ' + Math.floor(d.getTime() / 1000),
    '毫秒 (ms): ' + d.getTime(),
  ];
  output.textContent = lines.join('\n');
  output.style.whiteSpace = 'pre-line';
}

function showNow() {
  const output = document.getElementById('ts-result-3');
  const now = Date.now();
  const lines = [
    '秒 (s): ' + Math.floor(now / 1000),
    '毫秒 (ms): ' + now,
    '本地时间: ' + new Date(now).toLocaleString('zh-CN'),
  ];
  output.textContent = lines.join('\n');
  output.style.whiteSpace = 'pre-line';
}

export function destroy() {
  // No cleanup needed
}
