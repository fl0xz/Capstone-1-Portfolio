-- Foundry Labs Phase 1 schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard

create extension if not exists "uuid-ossp";

-- Brands (client groups)
create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  client_size text default 'mid-market' check (client_size in ('enterprise', 'mid-market', 'small-business')),
  color text default '#0071E3',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Connected platform accounts per brand
create table if not exists connected_accounts (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade not null,
  platform text not null check (platform in ('amazon', 'tiktok', 'ebay', 'etsy')),
  marketplace text default 'UK',
  seller_id text,
  name text not null,
  handle text default '',
  status text default 'syncing' check (status in ('connected', 'syncing', 'error', 'disconnected')),
  last_sync timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(brand_id, platform, marketplace)
);

-- OAuth tokens (server-side only — never expose to client)
create table if not exists oauth_tokens (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references connected_accounts(id) on delete cascade not null unique,
  refresh_token text not null,
  access_token text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- OAuth state for CSRF protection during connect flow
create table if not exists oauth_states (
  state text primary key,
  brand_id uuid references brands(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Daily metrics snapshots
create table if not exists metrics_snapshots (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references connected_accounts(id) on delete cascade not null,
  period text default '24h',
  revenue numeric default 0,
  orders integer default 0,
  views integer default 0,
  conversion_rate numeric default 0,
  ad_spend numeric default 0,
  margin numeric default 0,
  roi numeric default 0,
  captured_at timestamptz default now()
);

-- Row Level Security
alter table brands enable row level security;
alter table connected_accounts enable row level security;
alter table metrics_snapshots enable row level security;

create policy "Users manage own brands"
  on brands for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own accounts"
  on connected_accounts for all
  using (brand_id in (select id from brands where user_id = auth.uid()))
  with check (brand_id in (select id from brands where user_id = auth.uid()));

create policy "Users view own metrics"
  on metrics_snapshots for select
  using (account_id in (
    select ca.id from connected_accounts ca
    join brands b on b.id = ca.brand_id
    where b.user_id = auth.uid()
  ));

-- oauth_tokens and oauth_states: no client access (service role only)

create index if not exists idx_brands_user on brands(user_id);
create index if not exists idx_accounts_brand on connected_accounts(brand_id);
create index if not exists idx_metrics_account on metrics_snapshots(account_id);
