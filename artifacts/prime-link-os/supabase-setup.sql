-- ============================================================
-- Prime Link OS — Supabase Database Setup
-- Run this entire script in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users Table ─────────────────────────────────────────────
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'salesman', 'worker')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  online boolean not null default false,
  performance_score integer,
  last_seen_at timestamptz,
  created_at timestamptz default now() not null
);

-- ─── Plans Table ─────────────────────────────────────────────
create table if not exists plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  client_price numeric not null,
  salesman_commission numeric not null,
  worker_payment numeric not null,
  description text,
  features text[] not null default '{}',
  badge text,
  sort_order integer not null default 0,
  created_at timestamptz default now() not null
);

-- Add new columns if upgrading existing database
alter table plans add column if not exists features text[] not null default '{}';
alter table plans add column if not exists badge text;
alter table plans add column if not exists sort_order integer not null default 0;

-- ─── Clients Table ───────────────────────────────────────────
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  client_name text not null,
  phone text not null,
  business text,
  website text,
  plan_id uuid references plans(id) on delete set null,
  added_by uuid references users(id) on delete set null,
  assigned_to uuid references users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  notes text,
  created_at timestamptz default now() not null
);

-- ─── Tasks Table ─────────────────────────────────────────────
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  priority text not null default 'normal' check (priority in ('urgent', 'high_value', 'normal', 'delayed')),
  assigned_to uuid references users(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  deadline date,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'approved')),
  progress integer default 0,
  result_url text,
  created_at timestamptz default now() not null
);

-- ─── Earnings Table ──────────────────────────────────────────
create table if not exists earnings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references users(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('commission', 'payment', 'bonus')),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  description text,
  created_at timestamptz default now() not null
);

-- ─── Messages Table ──────────────────────────────────────────
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid not null references users(id) on delete cascade,
  receiver_id uuid references users(id) on delete cascade,
  content text not null,
  is_group boolean not null default false,
  created_at timestamptz default now() not null
);

-- ─── Disable Row Level Security ───────────────────────────────
alter table users disable row level security;
alter table plans disable row level security;
alter table clients disable row level security;
alter table tasks disable row level security;
alter table earnings disable row level security;
alter table messages disable row level security;

-- ─── Pages Table (admin-managed footer pages) ───────────────
create table if not exists pages (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  content text not null default '',
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table pages disable row level security;

-- ─── Site Settings (singleton row, id = 1) ───────────────────
create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  site_title text not null default 'Prime Link OS',
  favicon_url text,
  logo_url text,
  updated_at timestamptz default now() not null
);

insert into site_settings (id, site_title) values (1, 'Prime Link OS')
on conflict (id) do nothing;

alter table site_settings disable row level security;

-- ─── Audit Requests (contact form submissions) ───────────────
create table if not exists audit_requests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  business text,
  phone text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'archived')),
  created_at timestamptz default now() not null
);

create index if not exists audit_requests_created_at_idx on audit_requests (created_at desc);
create index if not exists audit_requests_status_idx on audit_requests (status);

alter table audit_requests disable row level security;

alter publication supabase_realtime add table audit_requests;

-- ─── Enable Realtime Replication ─────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table clients;

-- ─── Seed: Default Admin Account ─────────────────────────────
insert into users (name, email, password_hash, role, status)
values (
  'Prime Link Admin',
  'xyzapplywork@gmail.com',
  '1bd2fea57af48cd65b144f9ea0737c5fdc64142865a980c532e6b8ae4652142f',
  'admin',
  'active'
) on conflict (email) do nothing;

-- ─── Remove old sample plans and insert new ones ─────────────
delete from plans where name in ('Starter SEO', 'Growth SEO', 'Enterprise SEO');

insert into plans (name, client_price, salesman_commission, worker_payment, description, badge, sort_order, features)
values
  (
    'Starter Plan', 5999, 700, 1200,
    'Best for new businesses or small local businesses starting online growth.',
    null, 1,
    ARRAY['Google Business Profile basic optimization','Business information setup (name, address, phone, timing)','Primary keyword targeting','Basic local keyword research','5 business directory submissions','Basic on-page SEO suggestions','Map visibility improvement basics','1 month support']
  ),
  (
    'Growth Plan', 9999, 1200, 2000,
    'Best for running businesses wanting more calls, visits, and leads.',
    null, 2,
    ARRAY['Everything in Starter Plan','Advanced Google Business Profile optimization','15 local keyword targets','Competitor local SEO analysis','15 directory/citation submissions','Review strategy guidance','Local content suggestions','Website local SEO improvements','Monthly ranking report','Priority support']
  ),
  (
    'Pro Plan', 12999, 1600, 2600,
    'Best for businesses wanting strong local growth and faster results.',
    'Most Popular', 3,
    ARRAY['Everything in Growth Plan','Premium Google Maps ranking strategy','25 keyword targets','Advanced competitor gap analysis','25 high-quality citations','Review growth strategy + templates','Geo-targeted content plan','Advanced website local SEO fixes','Conversion optimization suggestions','Stronger map pack strategy','Dedicated support','Detailed monthly report']
  ),
  (
    'Elite Plan', 19999, 2400, 4000,
    'Best for serious businesses wanting maximum local dominance.',
    'Maximum Growth', 4,
    ARRAY['Everything in Pro Plan','Aggressive local ranking strategy','50 keyword targets','Multi-location SEO support (if needed)','Premium citation campaign','Reputation management strategy','High-conversion landing page guidance','Full local SEO audit + fixes roadmap','Competitor takeover strategy','Highest priority support','Weekly progress updates','VIP consultation calls']
  )
on conflict do nothing;
