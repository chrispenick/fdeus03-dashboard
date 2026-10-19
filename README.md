# FDEUS03 Capstone Dashboard

Next.js (App Router) + Postgres. Public read-only dashboard; admin password for edits; per-judge secret links for scoring.

## Local
```
cp .env.example .env   # export these vars in your shell (Next loads .env automatically)
npm install
npm run db:init        # applies db/schema.sql, seeds 12 teams / 59 members if empty
npm run dev
```
`npm run db:seed` wipes teams/members/links and reseeds from `db/FDEUS03_Capstone_Teams.txt`.

## Railway
1. New project → add the **PostgreSQL** plugin and a service from this directory (set the root directory to `dash/`).
2. Service variables: `DATABASE_URL` (reference `${{Postgres.DATABASE_URL}}`), `ADMIN_PASSWORD`, `SESSION_SECRET` (long random string).
3. Deploy. `npm start` runs `db:init` first (idempotent: schema + seed only when empty), then starts Next.
4. Open `/admin`, sign in, add rubric criteria and judges, copy each judge's link, and use **Reveal** when ready.

Set `PGSSL=true` if your Postgres requires SSL.
