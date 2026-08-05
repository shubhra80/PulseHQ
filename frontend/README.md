# PulseHQ Frontend

React + Vite + Tailwind CSS frontend for PulseHQ. Connects to Supabase using
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, read from the repo-root
`.env` file (see `vite.config.js`'s `envDir`).

## Views

- `/` — Client Health Dashboard
- `/clients/:id` — Client Detail + AI Insights
- `/adoption-gaps` — Adoption Gap Analyzer
- `/strategy-memo` — Weekly Strategy Memo

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
