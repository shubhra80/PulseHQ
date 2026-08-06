# PulseHQ

**Live demo:** https://pulse-hq-eta.vercel.app

Turns raw SaaS usage data into client health scores, adoption gaps, and weekly strategy memos — automatically.

## What it does

PulseHQ is an AI-powered client intelligence platform built for SaaS teams. Instead of manually piecing together account health signals, PulseHQ does it automatically:

- **Weekly Strategy** — AI-generated strategic briefing synthesizing portfolio health, adoption gaps, and market context
- **Client Health** — 100 accounts scored 0–100 across usage breadth, depth, and user reach
- **Adoption Gaps** — feature-by-feature view of which clients haven't adopted key capabilities yet

## Built with

- **Claude API** — generates client insights, recommendations, and weekly strategy memos
- **Supabase** — PostgreSQL database storing client data, health scores, and AI-generated content
- **React + Tailwind CSS** — frontend dashboard
- **Vercel** — deployment and hosting
- **Claude Code** — built and shipped entirely using AI-assisted development

## Why I built this

I'm a Group Product Manager with 15+ years in AI-powered B2B SaaS. PulseHQ started as a way to explore what AI-native product development actually looks like in practice — not just using AI as a writing assistant, but as a core part of the architecture.

The same patterns here — MCP connectors, pre-generated AI content, health scoring logic, adoption analytics — apply directly to enterprise SaaS products.

## Running locally

1. Clone the repo
2. Set up Supabase and run `seed/schema.sql`
3. Run the seed scripts: `seed_clients.py`, `seed_features.py`, `seed_news.py`, `generate_ai.py`
4. Add environment variables to `frontend/.env`
5. `cd frontend && npm install && npm run dev`  
