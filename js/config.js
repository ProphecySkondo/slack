/* ================================================================
   OpenScript — Config
   Set your environment variables below OR inject them server-side.

   ENV VARIABLE NAMES:
     window.ENV_SUPABASE_URL       → your Supabase project URL
     window.ENV_SUPABASE_ANON_KEY  → your Supabase anon/public key

   To inject via a static server or build tool, add a <script> block
   BEFORE this file loads:

     <script>
       window.ENV_SUPABASE_URL      = "https://xxxx.supabase.co";
       window.ENV_SUPABASE_ANON_KEY = "eyJh...";
     </script>

   For local dev you can also just replace the fallback strings below.
   ================================================================ */

var SUPABASE_URL  = window.ENV_SUPABASE_URL      || '';
var SUPABASE_ANON = window.ENV_SUPABASE_ANON_KEY  || '';

// Guard: if keys aren't set yet, show a clear banner instead of crashing
if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL' ||
    !SUPABASE_ANON || SUPABASE_ANON === 'YOUR_SUPABASE_ANON_KEY') {
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
      'Open <code>index.html</code> and set <code>window.ENV_SUPABASE_URL</code> ' +
      'and <code>window.ENV_SUPABASE_ANON_KEY</code> to your Supabase project values.';
    document.body.prepend(banner);
  });
}

// Initialise the Supabase client — exposed on window so all scripts can reach it
var sb = supabase.createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_ANON || 'placeholder'
);
