/* ================================================================
   OpenScript — Posts
   Loading, rendering, filtering, and viewing post detail.
   ================================================================ */

/* ── Load & Stats ── */

async function loadPosts() {
  const { data, error } = await sb
    .from('posts')
    .select('*, profiles(username, display_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) { console.error(error); return; }
  allPosts = data || [];
  renderPosts(allPosts);
}

async function loadStats() {
  const [
    { count: posts },
    { count: users },
    { count: local },
    { count: mod },
  ] = await Promise.all([
    sb.from('posts').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('posts').select('*', { count: 'exact', head: true }).eq('script_type', 'localscript'),
    sb.from('posts').select('*', { count: 'exact', head: true }).eq('script_type', 'modulescript'),
  ]);

  document.getElementById('stat-posts').textContent  = posts  ?? '0';
  document.getElementById('stat-users').textContent  = users  ?? '0';
  document.getElementById('stat-local').textContent  = local  ?? '0';
  document.getElementById('stat-module').textContent = mod    ?? '0';
}

/* ── Render post list ── */

function renderPosts(posts) {
  const list = document.getElementById('posts-list');

  if (!posts.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📭</div>
        <div class="empty-title">No scripts yet</div>
        <div class="empty-sub">Be the first to share something.</div>
      </div>`;
    return;
  }

  list.innerHTML = posts.map((p, i) => {
    const typeClass = p.script_type === 'localscript'  ? 'type-local'
                    : p.script_type === 'modulescript' ? 'type-module'
                    : 'type-custom';
    const typeLabel = p.script_type === 'localscript'  ? 'LocalScript'
                    : p.script_type === 'modulescript' ? 'ModuleScript'
                    : (p.custom_type || 'Custom');
    const author = p.profiles?.display_name || p.profiles?.username || 'Anonymous';
    const date   = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const ext    = p.file_ext || '.lua';
    const tags   = p.tags
      ? p.tags.slice(0, 3).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')
      : '';

    return `
    <div class="post-card" style="animation-delay:${i * 0.04}s" onclick="openPost('${p.id}')">
      <span class="post-type-badge ${typeClass}">${typeLabel}</span>
      <div class="post-content">
        <div class="post-title">${escHtml(p.title)}</div>
        ${p.description ? `<div class="post-desc">${escHtml(p.description)}</div>` : ''}
        <div class="post-meta">
          <span class="post-meta-item">by ${escHtml(author)}</span>
          <span class="post-meta-item">· ${date}</span>
          <span class="post-meta-item" style="font-family:var(--mono);font-size:11px;">${ext}</span>
          ${tags ? `<span style="display:flex;gap:4px;">${tags}</span>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── Filtering ── */

function setFilter(f, el) {
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  filterPosts();
}

function filterPosts() {
  const q      = document.getElementById('search-input').value.toLowerCase();
  let filtered = allPosts;

  if (activeFilter !== 'all') {
    filtered = filtered.filter(p => p.script_type === activeFilter);
  }
  if (q) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }
  renderPosts(filtered);
}

/* ── Post detail ── */

async function openPost(id) {
  const { data: post, error } = await sb
    .from('posts')
    .select('*, profiles(username, display_name)')
    .eq('id', id)
    .single();

  if (error || !post) { toast('Could not load post', 'error'); return; }
  currentPost = post;
  renderPostDetail(post);
  showPage('post');
}

function renderPostDetail(p) {
  const typeClass = p.script_type === 'localscript'  ? 'type-local'
                  : p.script_type === 'modulescript' ? 'type-module'
                  : 'type-custom';
  const typeLabel = p.script_type === 'localscript'  ? 'LocalScript'
                  : p.script_type === 'modulescript' ? 'ModuleScript'
                  : (p.custom_type || 'Custom');
  const author  = p.profiles?.display_name || p.profiles?.username || 'Anonymous';
  const date    = new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const tags    = p.tags ? p.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join(' ') : '';
  const tree    = p.file_tree ? renderTreeDisplay(p.file_tree) : '';
  const ext     = p.file_ext || '.lua';
  const sandboxNodes = buildSandboxNodes(p.file_tree || []);

  document.getElementById('post-detail-content').innerHTML = `
  <div class="post-detail-header animate-fadeUp">
    <div class="breadcrumb">
      <span class="breadcrumb-link" onclick="showPage('home')">← Browse</span>
      <span>/</span>
      <span class="post-type-badge ${typeClass}" style="font-size:11px;">${typeLabel}</span>
    </div>
    <h1 class="post-detail-title">${escHtml(p.title)}</h1>
    <div class="post-detail-meta">
      <span>by <strong>${escHtml(author)}</strong></span>
      <span>·</span>
      <span>${date}</span>
      <span>·</span>
      <span style="font-family:var(--mono);font-size:12px;">${ext}</span>
      ${tags ? `<span>·</span><span style="display:flex;gap:4px;flex-wrap:wrap;">${tags}</span>` : ''}
    </div>
  </div>

  <div class="post-detail-body animate-fadeUp" style="animation-delay:0.05s;">
    ${p.description
      ? `<p style="font-size:15px;color:var(--text2);line-height:1.7;font-weight:300;margin-bottom:24px;">${escHtml(p.description)}</p>`
      : ''}

    ${tree ? `<div class="post-section-label">File structure</div><div class="file-tree">${tree}</div>` : ''}

    ${(p.code || p.raw_link) ? `
      <div class="post-section-label">Script</div>
      ${p.raw_link
        ? `<div style="margin-bottom:8px;"><a href="${escHtml(p.raw_link)}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary">↗ View raw file</a></div>`
        : ''}
      ${p.code ? renderCodeBlock(p.code, ext) : ''}
    ` : ''}

    ${sandboxNodes ? `
      <div class="post-section-label">Interactive sandbox</div>
      <div class="sandbox">
        <div class="sandbox-toolbar">
          <span class="sandbox-title">Drag nodes around to explore the structure</span>
          <button class="btn btn-xs btn-secondary" onclick="resetSandbox()">Reset layout</button>
        </div>
        <div class="sandbox-area" id="sandbox-area">${sandboxNodes}</div>
      </div>
    ` : ''}

    <div style="height:60px;"></div>
  </div>`;

  setTimeout(initSandboxDrag, 100);
}

/* ── File tree display (read-only) ── */

function renderTreeDisplay(items, depth = 0) {
  if (!items || !items.length) return '';
  return items.map((item, i) => {
    const isLast    = i === items.length - 1;
    const connector = isLast ? '└─' : '├─';
    const icon      = item.type === 'folder' ? '📂' : getFileIcon(item.name || '');
    const hasLink   = !!item.link;
    const children  = item.children ? renderTreeDisplay(item.children, depth + 1) : '';

    return `
    <div class="${depth > 0 ? 'tree-indent' : ''}">
      <div class="tree-node" ${hasLink ? `onclick="window.open('${escHtml(item.link)}','_blank')"` : ''}>
        <span class="tree-connector">${connector}</span>
        <span class="tree-icon">${icon}</span>
        <span class="tree-name">${escHtml(item.name || 'untitled')}</span>
        ${item.ext ? `<span class="tree-ext">${escHtml(item.ext)}</span>` : ''}
        ${hasLink ? `<span class="tree-link">↗ open</span>` : ''}
      </div>
      ${children}
    </div>`;
  }).join('');
}

/* ── Sandbox ── */

function buildSandboxNodes(items, x = 30, y = 30) {
  if (!items || !items.length) return '';
  let html = '';
  items.forEach((item, i) => {
    const typeClass = item.type === 'folder' ? 'type-module' : 'type-local';
    const icon      = item.type === 'folder' ? '📂' : getFileIcon(item.name || '');
    const nx        = x + (i % 3) * 180;
    const ny        = y + Math.floor(i / 3) * 110;

    html += `<div class="sandbox-node" data-id="${i}" style="left:${nx}px;top:${ny}px;">
      <div class="sandbox-node-type post-type-badge ${typeClass}">${item.type || 'file'}</div>
      <div class="sandbox-node-title">${icon} ${escHtml(item.name || 'untitled')}</div>
      <div class="sandbox-node-sub">${item.ext ? escHtml(item.ext) : ''}</div>
    </div>`;

    if (item.children) html += buildSandboxNodes(item.children, nx + 20, ny + 120);
  });
  return html;
}

function initSandboxDrag() {
  document.querySelectorAll('.sandbox-node').forEach(node => {
    let dragging = false, ox = 0, oy = 0;

    node.addEventListener('mousedown', e => {
      dragging = true;
      node.classList.add('dragging');
      const rect = node.getBoundingClientRect();
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const area = document.getElementById('sandbox-area');
      if (!area) return;
      const ar = area.getBoundingClientRect();
      node.style.left = Math.max(0, e.clientX - ar.left - ox) + 'px';
      node.style.top  = Math.max(0, e.clientY - ar.top  - oy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
      node.classList.remove('dragging');
    });

    // Touch support
    node.addEventListener('touchstart', e => {
      dragging = true;
      node.classList.add('dragging');
      const rect = node.getBoundingClientRect();
      ox = e.touches[0].clientX - rect.left;
      oy = e.touches[0].clientY - rect.top;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!dragging) return;
      const area = document.getElementById('sandbox-area');
      if (!area) return;
      const ar = area.getBoundingClientRect();
      node.style.left = Math.max(0, e.touches[0].clientX - ar.left - ox) + 'px';
      node.style.top  = Math.max(0, e.touches[0].clientY - ar.top  - oy) + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
      dragging = false;
      node.classList.remove('dragging');
    });
  });
}

function resetSandbox() {
  document.querySelectorAll('.sandbox-node').forEach((node, i) => {
    node.style.left = (30 + (i % 3) * 180) + 'px';
    node.style.top  = (30 + Math.floor(i / 3) * 110) + 'px';
  });
}
