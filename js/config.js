/* ================================================================
   OpenScript — Config

   ENV VARIABLE NAMES:
     ENV_SUPABASE_URL      → your Supabase project URL
     ENV_SUPABASE_ANON_KEY → your Supabase anon/public key

   Set them in index.html before this file loads:

     <script>
       var ENV_SUPABASE_URL      = "https://xxxx.supabase.co";
       var ENV_SUPABASE_ANON_KEY = "eyJh...";
     </script>
   ================================================================ */

var SUPABASE_URL  = (typeof ENV_SUPABASE_URL      !== 'undefined') ? ENV_SUPABASE_URL      : '';
var SUPABASE_ANON = (typeof ENV_SUPABASE_ANON_KEY !== 'undefined') ? ENV_SUPABASE_ANON_KEY : '';

// Guard: show a banner if keys are missing, instead of crashing
if (!SUPABASE_URL || !SUPABASE_ANON) {
  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.createElement('div');
    banner.style.cssText = [
      'position:fixed;top:0;left:0;right:0;z-index:9999',
      'background:#1e3a5f;color:#fff;font-family:monospace',
      'font-size:13px;padding:12px 20px;line-height:1.6',
      'border-bottom:2px solid #3b82f6'
    ].join(';');
    banner.innerHTML =
      '<strong>OpenScript — setup needed</strong><br>' +
      'Open <code>index.html</code> and set <code>ENV_SUPABASE_URL</code> ' +
      'and <code>ENV_SUPABASE_ANON_KEY</code> to your Supabase project values.';
    document.body.prepend(banner);
  });
}

// Initialise Supabase — var so it's globally accessible across all script files
var sb = supabase.createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_ANON || 'placeholder'
);
