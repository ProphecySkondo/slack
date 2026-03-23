/* ================================================================
   OpenScript — App Entry Point
   Bootstraps the application on page load.
   ================================================================ */

(async () => {
  await logVisitor();
  await checkSession();
  await loadPosts();
  await loadStats();
})();
