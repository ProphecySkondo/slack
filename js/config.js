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

const SUPABASE_URL  = window.ENV_SUPABASE_URL      || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON = window.ENV_SUPABASE_ANON_KEY  || 'YOUR_SUPABASE_ANON_KEY';

// Initialise the Supabase client (available globally as `sb`)
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
