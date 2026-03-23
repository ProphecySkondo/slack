/* ================================================================
   OpenScript — Visitor Logging
   Logs IP address, device type, OS, and user agent to Supabase
   on every page load. Fails silently — non-critical.
   ================================================================ */

async function logVisitor() {
  try {
    const res    = await fetch('https://api64.ipify.org?format=json').catch(() => null);
    const ip     = res ? (await res.json()).ip : 'unknown';
    const ua     = navigator.userAgent;
    const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'mobile' : 'desktop';
    const os     = /Windows/.test(ua)    ? 'Windows'
                 : /Mac/.test(ua)        ? 'macOS'
                 : /Linux/.test(ua)      ? 'Linux'
                 : /Android/.test(ua)    ? 'Android'
                 : /iPhone|iPad/.test(ua)? 'iOS'
                 : 'Other';

    await sb.from('visitors').insert({
      ip_address:  ip,
      device_type: device,
      os:          os,
      user_agent:  ua.substring(0, 200),
      page:        window.location.pathname,
    });
  } catch (_) {
    // silent fail — logging should never block the user experience
  }
}
