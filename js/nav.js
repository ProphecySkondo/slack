/* ================================================================
   OpenScript — Navigation
   Page switching (SPA-style with CSS display toggle).
   ================================================================ */

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) { el.classList.add('active'); currentPage = page; }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchNav(page) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`nav-${page}`)?.classList.add('active');
  showPage(page);
}
