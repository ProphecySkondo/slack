# OpenScript

A clean, focused forum for sharing client-side Roblox scripts — LocalScripts, ModuleScripts, and custom file types.

---

## Project structure

```
openscript/
├── index.html          ← Main HTML shell (links all files)
├── css/
│   └── styles.css      ← All styles, variables, animations
├── js/
│   ├── config.js       ← Supabase client + ENV vars
│   ├── state.js        ← Shared app state
│   ├── utils.js        ← escHtml, toast, syntax highlight, etc.
│   ├── nav.js          ← Page switching (SPA-style)
│   ├── visitor.js      ← IP + device logging on page load
│   ├── auth.js         ← Sign in / register / session
│   ├── posts.js        ← List, render, filter, detail, sandbox
│   ├── create.js       ← Create post modal + tree builder
│   └── app.js          ← Entry point — bootstraps everything
└── db/
    └── schema.sql      ← Supabase SQL schema (run this first)
```

---

## Setup

### 1. Run the database schema

Open your Supabase project → **SQL Editor** → paste the contents of `db/schema.sql` and run it.

This creates three tables:

| Table      | Purpose                                    |
|------------|--------------------------------------------|
| `profiles` | User accounts (linked to `auth.users`)     |
| `posts`    | Scripts — code, file tree, tags, metadata  |
| `visitors` | IP address, device, OS logged on each visit|

---

### 2. Set your environment variables

Open `index.html` and find this block near the top:

```html
<script>
  window.ENV_SUPABASE_URL      = "YOUR_SUPABASE_URL";
  window.ENV_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
</script>
```

Replace the two strings with your actual values from:
**Supabase Dashboard → Project Settings → API**

| Variable                  | Where to find it                          |
|---------------------------|-------------------------------------------|
| `window.ENV_SUPABASE_URL`      | Project URL (e.g. `https://xxxx.supabase.co`) |
| `window.ENV_SUPABASE_ANON_KEY` | `anon` / `public` key                        |

> If you're using a build tool or server that injects env vars, set them as `window.ENV_SUPABASE_URL` and `window.ENV_SUPABASE_ANON_KEY` in your template before `js/config.js` loads.

---

### 3. Serve the files

This is a plain static site — no build step needed.

**Locally:**
```bash
# Python
python3 -m http.server 3000

# Node
npx serve .

# VS Code: use the Live Server extension
```

**Deploy anywhere static works:** Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc. Just point the root at the `openscript/` folder.

---

## Features

- **Auth** — username + password sign-in/register (Supabase Auth, email derived internally)
- **Post types** — LocalScript, ModuleScript, or Custom (you define the label and extension)
- **File extensions** — `.lua`, `.luau`, `.json`, `.txt`, or any custom extension
- **File tree builder** — add files and folders with optional raw links; shown as a readable tree on the post
- **Interactive sandbox** — drag-and-drop node cards derived from the file tree (mouse + touch)
- **Syntax highlighting** — basic Lua/Luau keyword highlighting with a copy button
- **Visitor logging** — IP address, device type (mobile/desktop), OS, and user agent logged per visit
- **Search + filter** — filter by type, search title/description/tags live
- **Stats bar** — live counts of scripts, contributors, LocalScripts, ModuleScripts
- **Toasts** — non-intrusive success/error/warning notifications
- **Skeleton loaders** — smooth loading state before data arrives
