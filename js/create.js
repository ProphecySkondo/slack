/* ================================================================
   OpenScript — Create Post
   Modal, file tree builder, extension picker, and submit logic.
   ================================================================ */

/* ── Modal control ── */

function showCreateModal() {
  if (!currentUser) {
    showAuthModal('login');
    toast('Sign in to post', 'warning');
    return;
  }
  document.getElementById('create-modal').style.display = 'flex';
  treeItems = [];
  renderTreeItems();
}

function closeCreateModal(e) {
  if (e && e.target !== document.getElementById('create-modal')) return;
  document.getElementById('create-modal').style.display = 'none';
}

/* ── Type / extension pickers ── */

function setPostType(type, el) {
  activePostType = type;
  // Reset all type-tab buttons in the script-type row only (first 3)
  const tabs = document.querySelectorAll('#create-modal .type-tabs:first-of-type .type-tab');
  tabs.forEach(b => (b.className = 'type-tab'));
  const map = { localscript: 'active-local', modulescript: 'active-module', custom: 'active-custom' };
  el.className = 'type-tab ' + (map[type] || '');
  document.getElementById('custom-type-row').style.display = type === 'custom' ? 'block' : 'none';
}

function setExt(ext, el) {
  activeExt = ext;
  document.querySelectorAll('#ext-tabs .type-tab').forEach(b => (b.className = 'type-tab'));
  el.className = 'type-tab active-local';
  document.getElementById('custom-ext-row').style.display = ext === 'custom' ? 'block' : 'none';
}

function setCodeTab(tab) {
  codeTab = tab;
  document.getElementById('code-tab-paste').className = 'filter-btn' + (tab === 'paste' ? ' active' : '');
  document.getElementById('code-tab-link').className  = 'filter-btn' + (tab === 'link'  ? ' active' : '');
  document.getElementById('code-paste-area').style.display = tab === 'paste' ? 'block' : 'none';
  document.getElementById('code-link-area').style.display  = tab === 'link'  ? 'block' : 'none';
}

/* ── File tree builder ── */

function addTreeItem(kind) {
  const id = ++treeIdCounter;
  if (kind === 'child' && treeItems.length) {
    const parent = treeItems[treeItems.length - 1];
    if (!parent.children) parent.children = [];
    parent.children.push({ id, type: 'file', name: '', ext: activeExt, link: '', children: [] });
  } else {
    treeItems.push({
      id,
      type: kind === 'folder' ? 'folder' : 'file',
      name: '', ext: activeExt, link: '', children: [],
    });
  }
  renderTreeItems();
}

function removeTreeItem(id) {
  treeItems = treeItems.filter(i => i.id !== id);
  treeItems.forEach(i => {
    if (i.children) i.children = i.children.filter(c => c.id !== id);
  });
  renderTreeItems();
}

function updateTreeItem(id, key, val) {
  function update(items) {
    items.forEach(i => {
      if (i.id === id) i[key] = val;
      if (i.children) update(i.children);
    });
  }
  update(treeItems);
}

function renderTreeItems() {
  const container = document.getElementById('tree-items');

  if (!treeItems.length) {
    container.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:8px 4px;">No files yet — use the buttons below to add.</div>`;
    return;
  }

  function renderItem(item, depth = 0) {
    const connector = depth === 0 ? '├─' : '└─';
    const indentCls = depth > 0 ? 'tree-item-indent' : '';
    return `
    <div class="tree-item-row ${indentCls}" data-id="${item.id}">
      <span class="tree-connector-static">${connector}</span>
      <span>${item.type === 'folder' ? '📂' : '📄'}</span>
      <input class="tree-item-input"
        placeholder="${item.type === 'folder' ? 'FolderName' : 'FileName'}"
        value="${escHtml(item.name)}"
        onchange="updateTreeItem(${item.id},'name',this.value)">
      <select class="tree-item-select" onchange="updateTreeItem(${item.id},'type',this.value)">
        <option value="file"   ${item.type === 'file'   ? 'selected' : ''}>file</option>
        <option value="folder" ${item.type === 'folder' ? 'selected' : ''}>folder</option>
      </select>
      <input class="tree-item-input"
        placeholder="link (optional)" style="max-width:160px;font-size:11px;"
        value="${escHtml(item.link || '')}"
        onchange="updateTreeItem(${item.id},'link',this.value)">
      <button class="tree-item-del" onclick="removeTreeItem(${item.id})">✕</button>
    </div>
    ${(item.children || []).map(c => renderItem(c, depth + 1)).join('')}`;
  }

  container.innerHTML = treeItems.map(i => renderItem(i)).join('');
}

/* ── Submit ── */

let postSubmitting = false;

async function submitPost() {
  if (postSubmitting) return;

  const title = document.getElementById('post-title').value.trim();
  if (!title) { toast('Add a title', 'error'); return; }

  postSubmitting = true;
  const btn      = document.getElementById('create-submit-btn');
  btn.innerHTML  = '<span class="spinner"></span> Publishing…';

  try {
    const ext = activeExt === 'custom'
      ? (document.getElementById('custom-ext-input').value.trim() || '.lua')
      : activeExt;

    const tagsRaw = document.getElementById('post-tags').value.trim();
    const tags    = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const payload = {
      user_id:     currentUser.id,
      title,
      description: document.getElementById('post-desc').value.trim()     || null,
      script_type: activePostType,
      custom_type: activePostType === 'custom'
        ? (document.getElementById('custom-ext').value.trim() || null)
        : null,
      file_ext: ext,
      code:     codeTab === 'paste' ? (document.getElementById('post-code').value.trim()    || null) : null,
      raw_link: codeTab === 'link'  ? (document.getElementById('post-rawlink').value.trim() || null) : null,
      tags,
      file_tree: treeItems.length ? treeItems : null,
    };

    const { data, error } = await sb.from('posts').insert(payload).select().single();
    if (error) throw error;

    closeCreateModal();
    toast('Script published!', 'success');
    await loadPosts();
    await loadStats();
    setTimeout(() => openPost(data.id), 400);
  } catch (e) {
    toast(e.message || 'Failed to publish', 'error');
  } finally {
    postSubmitting  = false;
    btn.innerHTML   = 'Publish script';
  }
}
