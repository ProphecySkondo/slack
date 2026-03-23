/* ================================================================
   OpenScript — Auth
   Handles sign-in, registration, session restore, and nav state.
   ================================================================ */

async function checkSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadUserProfile();
    updateNavForUser();
  }
}

async function loadUserProfile() {
  if (!currentUser) return;
  const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  if (data) currentUser.profile = data;
  updateNavAvatar();
}

function updateNavForUser() {
  document.getElementById('nav-auth-area').style.display = 'none';
  const ua = document.getElementById('nav-user-area');
  ua.style.display = 'flex';
  document.getElementById('create-btn').style.display = 'inline-flex';
}

function updateNavAvatar() {
  const av   = document.getElementById('nav-avatar');
  const name = currentUser?.profile?.username || currentUser?.email || 'U';
  av.textContent = name.charAt(0).toUpperCase();
}

/* ── Modal control ── */

function showAuthModal(mode) {
  authMode = mode;
  document.getElementById('auth-modal').style.display = 'flex';
  document.getElementById('auth-modal-title').textContent =
    mode === 'login' ? 'Sign in' : 'Join OpenScript';
  document.getElementById('auth-submit-btn').textContent =
    mode === 'login' ? 'Sign in' : 'Create account';
  document.getElementById('auth-display-group').style.display =
    mode === 'register' ? 'block' : 'none';
  document.getElementById('auth-toggle-text').innerHTML =
    mode === 'login'
      ? 'New here? <a onclick="switchAuthMode()">Create an account</a>'
      : 'Already have one? <a onclick="switchAuthMode()">Sign in</a>';
}

function switchAuthMode() {
  showAuthModal(authMode === 'login' ? 'register' : 'login');
}

function closeAuthModal(e) {
  if (e && e.target !== document.getElementById('auth-modal')) return;
  document.getElementById('auth-modal').style.display = 'none';
}

/* ── Submit ── */

var authSubmitting = false;

async function submitAuth() {
  if (authSubmitting) return;

  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!username || !password) { toast('Fill in all fields', 'error'); return; }

  authSubmitting = true;
  const btn      = document.getElementById('auth-submit-btn');
  btn.innerHTML  = '<span class="spinner"></span>';

  // Supabase auth requires an email — we derive one from the username.
  const fakeEmail = `${username}@openscript.local`;

  try {
    if (authMode === 'register') {
      const displayName = document.getElementById('auth-displayname').value.trim() || username;
      const { data, error } = await sb.auth.signUp({ email: fakeEmail, password });
      if (error) throw error;

      if (data.user) {
        await sb.from('profiles').upsert({
          id:           data.user.id,
          username:     username,
          display_name: displayName,
          created_at:   new Date().toISOString(),
        });
        currentUser         = data.user;
        currentUser.profile = { username, display_name: displayName };
        updateNavForUser();
        updateNavAvatar();
        closeAuthModal();
        toast('Welcome to OpenScript!', 'success');
        await loadPosts();
        await loadStats();
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email: fakeEmail, password });
      if (error) throw error;
      currentUser = data.user;
      await loadUserProfile();
      updateNavForUser();
      updateNavAvatar();
      closeAuthModal();
      toast('Welcome back!', 'success');
    }
  } catch (e) {
    toast(e.message || 'Something went wrong', 'error');
  } finally {
    authSubmitting     = false;
    btn.innerHTML = authMode === 'login' ? 'Sign in' : 'Create account';
  }
}
