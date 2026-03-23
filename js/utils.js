/* ================================================================
   OpenScript — Utilities
   ================================================================ */

/** Escape HTML special characters to prevent XSS */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Return an emoji icon for a given filename / extension */
function getFileIcon(name) {
  if (!name) return '📄';
  if (name.endsWith('.lua') || name.endsWith('.luau')) return '📜';
  if (name.endsWith('.json')) return '📋';
  if (name.endsWith('.md'))   return '📝';
  if (name.endsWith('.txt'))  return '📄';
  if (name.includes('.'))     return '📄';
  return '📁';
}

/** Show a toast notification */
function toast(msg, type = '') {
  const wrap = document.getElementById('toast-wrap');
  const el   = document.createElement('div');
  el.className   = 'toast ' + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity    = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/**
 * Very basic Lua/Luau syntax highlighter.
 * Expects HTML-escaped input, returns HTML with <span> classes.
 */
function highlightLua(code) {
  return code
    // Comments first (before keywords corrupt them)
    .replace(/--[^\n]*/g, m => `<span class="cmt">${m}</span>`)
    // Keywords
    .replace(/\b(local|function|end|if|then|else|elseif|for|do|while|repeat|until|return|and|or|not|in|true|false|nil|break)\b/g, '<span class="kw">$1</span>')
    // Built-ins / globals
    .replace(/\b(game|workspace|script|math|string|table|os|print|warn|error|pcall|xpcall|require|ipairs|pairs|next|select|type|tostring|tonumber|unpack)\b/g, '<span class="fn">$1</span>')
    // Strings
    .replace(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g, m => `<span class="str">${m}</span>`)
    // Numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
}

/** Render a code block with syntax highlighting and a copy button */
function renderCodeBlock(code, ext) {
  const lang        = ext.replace('.', '').toUpperCase();
  const highlighted = highlightLua(escHtml(code));
  return `
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">${lang}</span>
      <button class="code-copy" onclick="copyCode(this)">Copy</button>
    </div>
    <div class="code-body"><pre>${highlighted}</pre></div>
  </div>`;
}

/** Copy the code inside a .code-block to clipboard */
function copyCode(btn) {
  const code = btn.closest('.code-block').querySelector('pre').textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy'), 2000);
  });
}
