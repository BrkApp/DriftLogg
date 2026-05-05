# CLAUDE.md — DriftLogg

This file is the guardrail and roadmap for any agent (including future Claude
sessions) working on this codebase. Read it before making changes.

## What is DriftLogg?

DriftLogg is a SaaS that **predicts open source decline**. It scores public
packages/repositories across signals that correlate with abandonment risk, so
engineering teams can spot drifting dependencies before they break production.

The MVP is intentionally narrow:

1. A **landing page** that explains the value proposition.
2. A **free GitHub health check** — paste a public repo, get a drift score
   plus a breakdown of the signals.

Everything outside that scope is out of scope for the MVP.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with `tailwindcss-animate`
- **shadcn/ui** primitives (Radix-based) — components live in `components/ui`
- **lucide-react** for icons
- **octokit** for GitHub API calls
- Node runtime for the API route (no edge-specific code)

## Project structure

```
app/
  layout.tsx                      App shell + global CSS
  page.tsx                        Landing page (compose sections from /components/landing)
  globals.css                     Tailwind + CSS variables (shadcn theme tokens)
  scan/
    page.tsx                      Repo input page (uses ScanForm)
    [owner]/[repo]/page.tsx       Server-rendered health check results
  api/
    scan/route.ts                 POST/GET endpoint that returns a HealthReport JSON
components/
  ui/                             shadcn primitives (Button, Card, Input, Badge, Progress)
  landing/                        Landing-page sections (Hero, Features, CTA, Navbar, Footer)
  scan/                           Scan UI (ScanForm, ScoreRing, Breakdown, Signals, RepoStats)
lib/
  github.ts                       Octokit wrapper + parseRepoInput + fetchers
  scoring.ts                      Drift score algorithm + risk classification + signals
  types.ts                        Shared TypeScript types
  utils.ts                        cn() class merger
```

## Scoring algorithm (lib/scoring.ts)

The drift score is a 0–100 weighted sum across five sub-scores:

| Dimension     | Weight | Inputs                                                       |
| ------------- | ------ | ------------------------------------------------------------ |
| `commits`     | 30%    | `daysSinceLastCommit`, `commitsLast90Days`                   |
| `issues`      | 15%    | open/closed ratio, stale-issue count, average issue age      |
| `releases`    | 15%    | `daysSinceLastRelease`, presence of releases                 |
| `maintenance` | 25%    | archived/disabled flags, license, description, push freshness|
| `community`   | 15%    | stars, unique contributors in the last 90 days               |

`classifyRisk(score, metadata)` maps the score to:

- `low` (≥80), `moderate` (≥65), `elevated` (≥45), `high` (≥25), `critical` (<25)
- archived repos always return `critical`

`buildSignals(...)` produces a list of human-readable findings. Keep signals
honest: no celebratory message if there is a real risk, no doom message when
the data is normal.

When tweaking scoring, **add a unit test** before changing the weights — drift
scores are user-facing and need to remain stable.

## API contract

`POST /api/scan` body:

```json
{ "input": "vercel/next.js" }
// or
{ "owner": "vercel", "repo": "next.js" }
```

`GET /api/scan?owner=vercel&repo=next.js` works the same way.

Response is `HealthReport` (see `lib/types.ts`). Errors return `{ error, status }`.

## GitHub API rate limits

Unauthenticated: **60 requests/hour**. With `GITHUB_TOKEN` set in `.env.local`:
**5000 requests/hour**. Each scan currently costs ~5 requests. In production
we must:

1. Set a `GITHUB_TOKEN` (a fine-grained PAT with public-repo read is enough).
2. Add a cache layer (Redis / Vercel KV) keyed by `owner/repo` with a 10-minute
   TTL so repeated scans of popular repos don't burn rate limit. Right now the
   API just sets `Cache-Control: s-maxage=600`.

## Conventions

- Server Components by default. Add `"use client"` only when you need state,
  effects, or browser APIs (e.g. `ScanForm`).
- Path alias: import from `@/...` (configured in `tsconfig.json`).
- Tailwind only — no CSS modules, no inline styles unless dynamic.
- No business logic in components: keep fetchers in `lib/github.ts` and pure
  scoring in `lib/scoring.ts`.
- Keep components dumb — pass props, no top-level fetches inside leaf components.
- Don't add fancy abstractions. The MVP is tiny; prefer duplication to a clever
  helper that will be removed in a week.

## Roadmap

### MVP (current branch)

- [x] Project scaffolding (Next 14 + Tailwind + shadcn)
- [x] Landing page (Hero, Features, CTA)
- [x] `/scan` input page
- [x] `/scan/[owner]/[repo]` results page (server-rendered)
- [x] `/api/scan` endpoint
- [x] Drift scoring algorithm v1
- [ ] Loading skeletons for the results page
- [ ] OG image generation per scan (`/scan/[owner]/[repo]/opengraph-image.tsx`)
- [ ] Basic analytics event on scan completion

### v0.2 — public beta polish

- [ ] Cache layer for scan results (Redis or Vercel KV)
- [ ] "Recent scans" public feed
- [ ] Shareable public URLs with permalink
- [ ] Dark mode toggle
- [ ] Issue/PR velocity charts (recharts)
- [ ] Add a sitemap & robots.txt

### v0.3 — paid features

- [ ] Email signup + waitlist
- [ ] Watchlist: monitor a list of dependencies
- [ ] Slack/Discord webhook on score drop
- [ ] Multi-package report (paste a `package.json` / `requirements.txt`)
- [ ] Trend graphs (snapshot scores weekly)
- [ ] Stripe checkout for the paid tier

### v1 — full SaaS

- [ ] Auth (NextAuth / Clerk)
- [ ] Org workspaces
- [ ] Continuous monitoring of registered repos (cron)
- [ ] Public API with API keys
- [ ] npm/PyPI registry integration

## Guardrails

- **Suis les instructions à la lettre.** L'utilisateur enchaîne des prompts
  dans un ordre logique : chaque prompt définit son propre périmètre. Ne
  prends aucune initiative au-delà de ce qui est explicitement demandé
  (pas de refactor opportuniste, pas de "petit bonus", pas de mise à jour
  silencieuse de fichiers non listés). Si une dépendance casse, c'est
  attendu — le prompt suivant la corrigera.
- **Do not** ship features that aren't on the roadmap without updating this file.
- **Do not** add a database before v0.3 — the MVP is stateless on purpose.
- **Do not** add auth until v1.
- **Do not** call any GitHub endpoint that requires auth scopes beyond
  `public_repo`.
- **Do not** silently widen the scan inputs — if you accept GitLab / npm / PyPI
  inputs, that's a roadmap item, not a stealth feature.
- **Always** keep the score deterministic for a given GitHub state.
- **Always** keep the bundle small: no heavy client libs (charts excepted in v0.2).

## Local development

```bash
npm install
cp .env.example .env.local   # optional but recommended
npm run dev
```

Then open <http://localhost:3000>.
