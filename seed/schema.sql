-- PulseHQ database schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- before running the Python seed scripts in seed/.

-- ============================================================
-- Table: clients
-- ============================================================
create table if not exists clients (
    id bigint generated always as identity primary key,
    name text not null,
    tier text not null,                    -- fictional / enterprise / generated
    industry text,
    health_score int2 not null default 0,  -- 0-100
    health_status text not null default 'watch', -- healthy / watch / at_risk
    usage_breadth_score int2 not null default 0,
    usage_depth_score int2 not null default 0,
    user_reach_score int2 not null default 0,
    ai_insight text,
    ai_recommendation text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- Table: feature_adoption
-- ============================================================
create table if not exists feature_adoption (
    id bigint generated always as identity primary key,
    client_id bigint not null references clients(id) on delete cascade,
    feature_name text not null,
    is_adopted boolean not null default false,
    adoption_score int2 not null default 0, -- 0-100 depth of usage
    last_used timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_feature_adoption_client_id on feature_adoption(client_id);
create index if not exists idx_feature_adoption_feature_name on feature_adoption(feature_name);

-- ============================================================
-- Table: strategy_memos
-- ============================================================
create table if not exists strategy_memos (
    id bigint generated always as identity primary key,
    memo_date date not null,
    executive_summary text,
    portfolio_health_section text,
    key_risks_section text,
    adoption_opportunities_section text,
    recommended_priorities_section text,
    generated_at timestamptz not null default now()
);

-- ============================================================
-- Table: market_news
-- ============================================================
create table if not exists market_news (
    id bigint generated always as identity primary key,
    headline text not null,
    summary text,
    category text, -- competitor / industry / opportunity
    published_date date,
    created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- PulseHQ is a portfolio/demo app with no end-user auth — the
-- frontend reads with the anon key, and seed scripts write with
-- it too. Policies below allow full anon access on all 4 tables.
-- ============================================================
alter table clients enable row level security;
alter table feature_adoption enable row level security;
alter table strategy_memos enable row level security;
alter table market_news enable row level security;

drop policy if exists "anon full access" on clients;
create policy "anon full access" on clients for all to anon using (true) with check (true);

drop policy if exists "anon full access" on feature_adoption;
create policy "anon full access" on feature_adoption for all to anon using (true) with check (true);

drop policy if exists "anon full access" on strategy_memos;
create policy "anon full access" on strategy_memos for all to anon using (true) with check (true);

drop policy if exists "anon full access" on market_news;
create policy "anon full access" on market_news for all to anon using (true) with check (true);
