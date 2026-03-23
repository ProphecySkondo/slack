-- ================================================================
--  OpenScript — Supabase Schema
--  Run this in your Supabase project → SQL Editor
-- ================================================================

-- 1. PROFILES (linked to auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique,
  display_name  text,
  bio           text,
  created_at    timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);


-- 2. POSTS (scripts)
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  script_type   text not null check (script_type in ('localscript', 'modulescript', 'custom')),
  custom_type   text,          -- user-defined label when type = 'custom'
  file_ext      text default '.lua',
  code          text,          -- pasted code
  raw_link      text,          -- link to raw file
  tags          text[],        -- array of tag strings
  file_tree     jsonb,         -- nested file structure
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Authenticated users can insert posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();


-- 3. VISITORS (IP + device logging)
create table if not exists public.visitors (
  id            bigserial primary key,
  ip_address    text,
  device_type   text,          -- 'mobile' or 'desktop'
  os            text,
  user_agent    text,
  page          text,
  created_at    timestamptz default now()
);
alter table public.visitors enable row level security;

-- Allow anonymous inserts (the site logs visits on load)
create policy "Anyone can log a visit"
  on public.visitors for insert with check (true);

-- Only authenticated admins can view visitor logs (optional: remove for open access)
create policy "Admins can view visitors"
  on public.visitors for select using (auth.role() = 'authenticated');


-- ================================================================
--  Useful indexes
-- ================================================================
create index if not exists posts_user_id_idx    on public.posts(user_id);
create index if not exists posts_type_idx       on public.posts(script_type);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists visitors_ip_idx      on public.visitors(ip_address);
create index if not exists visitors_created_idx on public.visitors(created_at desc);
