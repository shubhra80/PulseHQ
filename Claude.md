# PulseHQ — CLAUDE.md

## What This Project Is
PulseHQ is an AI-powered client health intelligence platform for 
SaaS teams. It turns raw product usage data into client health 
scores, adoption gap analysis, and weekly strategy memos — 
automatically, without manual reporting or dashboard maintenance.

This is a portfolio project built by a product manager using 
Claude Code, Supabase, React, and Vercel. It demonstrates 
AI-native product development — directing AI tools to build 
sophisticated systems while maintaining architectural oversight 
and product judgment.

## The Four Core Views

### View 1 — Client Health Dashboard (Landing Page)
- Table/grid of 100 fictional SaaS clients
- Each client has a 0-100 health score
- Color coded: green (75-100 healthy), yellow (40-74 watch), 
  red (0-39 at risk)
- Sortable and filterable by health score, status, industry
- Key metrics visible at a glance — usage score, adoption score, 
  engagement score
- Clickable rows — drill into any client for detail
- Summary stats at top — total clients, healthy count, 
  at risk count, watch count

### View 2 — Client Detail + AI Insights
- Full breakdown of selected client's health score
- Individual scores for each of the 8 features
- What's driving the score up or down
- AI-generated insight about this client's health
- Recommended action for CS/Sales team
- Risk indicators if applicable

### View 3 — Adoption Gap Analyzer
- Which features each client has NOT adopted yet
- Ranked by opportunity — biggest gaps across most clients
- Feature-level view — how many of 100 clients use each feature
- AI recommendation on where to focus adoption efforts
- Filterable by health status — see adoption gaps for at-risk 
  clients specifically

### View 4 — Weekly Strategy Memo
- One page AI-generated strategic briefing
- Synthesizes: overall portfolio health + biggest adoption gaps + 
  sample market news
- Written in plain business language — no jargon
- Sections: Executive Summary, Portfolio Health, 
  Key Risks, Adoption Opportunities, Recommended Priorities
- Looks like something a VP would actually read and act on

## The 8 Product Features
1. SSO (Single Sign-On)
2. Customize Dashboard
3. Insights
4. Data Exports
5. Verbatim Exports
6. Scheduling
7. Load Prediction
8. Mobile App

## Client Tiers for Dummy Data
### Tier 1 — 15 Recognizable Fictional Companies
Dunder Mifflin, Pied Piper Technologies, Initech Solutions,
Vandelay Industries, Acme Corporation, Bluth Company,
Prestige Worldwide, Waystar Royco, Sterling Cooper,
Globex Corporation, Umbrella Corp, Cyberdyne Systems,
Stark Industries, Wonka Industries, Hooli

### Tier 2 — 35 Realistic Enterprise Companies
Meridian Analytics, Apex Logistics, Crestview Financial,
Northbridge Consulting, Summit Data Systems, Vantage Group,
Pinnacle Solutions, Horizon Technologies, BlueSky Analytics,
Cornerstone Ventures, Silverline Systems, Cascade Digital,
Ironwood Consulting, Coastline Data, Redwood Technologies,
Clearwater Analytics, Bridgepoint Solutions, Highmark Systems,
Lakeside Technologies, Mountainview Data, Riverview Analytics,
Oakwood Solutions, Elmwood Technologies, Maple Leaf Systems,
Birchwood Analytics, Cedarview Solutions, Pinewood Data,
Willowbrook Technologies, Ashford Analytics, Foxwood Systems,
Thornberry Solutions, Greenfield Technologies, Westbrook Data,
Eastview Analytics, Northwood Systems

### Tier 3 — 50 Generated B2B Companies
Across industries: healthcare, finance, logistics, 
retail, manufacturing — generated with realistic 
naming conventions (e.g. MedBridge Analytics, 
TradeFlow Systems, RetailEdge Solutions, etc.)
Claude Code will generate these during data seeding.

## Health Score Formula
Score = weighted average of:
- Usage Breadth (30%) — how many features used out of 8
- Usage Depth (40%) — frequency and volume of usage per feature
- User Reach (30%) — how many users actively using the platform

Each component scored 0-100, then weighted.
Final score rounded to nearest integer.

IMPORTANT: Score must reflect genuine health signals.
Account size must NOT be a proxy for health score.
A small company using all 8 features deeply should 
score higher than a large company using 2 features lightly.

## AI Content Strategy — Pre-Generated and Cached
All AI-generated content (client insights, recommendations, 
strategy memo) is generated ONCE and stored in Supabase.
Content is served from the database — not generated per click.
This keeps the app fast, cost-efficient, and reliable.

Regeneration happens on a simulated weekly schedule — 
this can be triggered manually from an admin view 
for demo purposes.

## Tech Stack
- Frontend: React + Tailwind CSS
- Backend: Supabase (PostgreSQL)
- AI: Claude API (claude-sonnet-4-6)
- Hosting: Vercel (free tier)
- Version Control: GitHub
- Built with: Claude Code

## Supabase Database Schema

### Table: clients
- id (int8, primary key, auto)
- name (text) — company name
- tier (text) — fictional / enterprise / generated
- industry (text)
- health_score (int2) — 0 to 100
- health_status (text) — healthy / watch / at_risk
- usage_breadth_score (int2)
- usage_depth_score (int2)
- user_reach_score (int2)
- ai_insight (text) — pre-generated Claude insight
- ai_recommendation (text) — pre-generated action
- created_at (timestamptz)
- updated_at (timestamptz)

### Table: feature_adoption
- id (int8, primary key, auto)
- client_id (int8, foreign key → clients.id)
- feature_name (text)
- is_adopted (boolean)
- adoption_score (int2) — 0 to 100 depth of usage
- last_used (timestamptz)
- created_at (timestamptz)

### Table: strategy_memos
- id (int8, primary key, auto)
- memo_date (date)
- executive_summary (text)
- portfolio_health_section (text)
- key_risks_section (text)
- adoption_opportunities_section (text)
- recommended_priorities_section (text)
- generated_at (timestamptz)

### Table: market_news
- id (int8, primary key, auto)
- headline (text)
- summary (text)
- category (text) — competitor / industry / opportunity
- published_date (date)
- created_at (timestamptz)

## File Structure
pulsehq/
├── CLAUDE.md              # This file
├── README.md              # Project description + live link
├── .gitignore             # Ignore .env and sensitive files
├── .env                   # API keys — never commit
├── requirements.txt       # Python dependencies
├── seed/
│   ├── seed_clients.py    # Generate and seed 100 clients
│   ├── seed_features.py   # Generate feature adoption data
│   ├── seed_news.py       # Generate sample market news
│   └── generate_ai.py     # Generate all AI content via Claude API
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # View 1 — client health table
│   │   │   ├── ClientDetail.jsx   # View 2 — client detail + insights
│   │   │   ├── AdoptionGap.jsx    # View 3 — adoption gap analyzer
│   │   │   └── StrategyMemo.jsx   # View 4 — weekly memo
│   │   └── lib/
│   │       └── supabase.js        # Supabase client
│   ├── package.json
│   └── tailwind.config.js
└── vercel.json                    # Vercel deployment config

## Environment Variables
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

## Design Principles
- Clean, professional, enterprise-feeling UI
- Dark sidebar navigation between the 4 views
- Data tables should be sortable and filterable
- Health status always color coded consistently
- Mobile responsive — works on phone and desktop
- Fast — all AI content served from cache, not generated live

## What This Project Demonstrates
- AI-native product development
- Real database architecture (Supabase/PostgreSQL)
- API integration (Claude AI)
- Frontend development (React + Tailwind)
- Data modeling and scoring logic
- Product thinking — solving a real business problem
- Building and deploying a full stack application

## Session Rules for Claude Code
- Always read this CLAUDE.md before starting any work
- Never commit .env files to GitHub
- Health score formula must never conflate account size with health
- All 4 views must be functional before any styling polish
- Seed data before building frontend — data first, UI second
- Pre-generate all AI content and store in Supabase
- Test each view works correctly before moving to the next
- Keep components small and focused — one job per component
