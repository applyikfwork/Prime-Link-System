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
  created_at timestamptz default now() not null
);

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
-- (Using custom auth — no Supabase Auth sessions)
alter table users disable row level security;
alter table plans disable row level security;
alter table clients disable row level security;
alter table tasks disable row level security;
alter table earnings disable row level security;
alter table messages disable row level security;

-- ─── Enable Realtime Replication ─────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table clients;

-- ─── Seed: Default Admin Account ─────────────────────────────
-- Password: Admin@PrimeLink2024
-- SHA-256 hash of "Admin@PrimeLink2024"
insert into users (name, email, password_hash, role, status)
values (
  'Prime Link Admin',
  'xyzapplywork@gmail.com',
  '1bd2fea57af48cd65b144f9ea0737c5fdc64142865a980c532e6b8ae4652142f',
  'admin',
  'active'
) on conflict (email) do nothing;

-- ─── Seed: Sample Plans ───────────────────────────────────────
insert into plans (name, client_price, salesman_commission, worker_payment, description)
values
  ('Starter SEO', 499, 75, 150, 'Basic SEO optimization for small businesses'),
  ('Growth SEO', 999, 150, 300, 'Comprehensive SEO with content strategy'),
  ('Enterprise SEO', 2499, 350, 750, 'Full-service SEO for large businesses and e-commerce')
on conflict do nothing;
