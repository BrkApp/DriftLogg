# DriftLogg — Open Source Decay Radar

DriftLogg scores any public GitHub repository on a 0–100 health scale so engineering teams can spot drifting dependencies before they break production.

## How it works

Six signals are weighted into a single drift score:

| Dimension     | Max | What it measures                                      |
|---------------|-----|-------------------------------------------------------|
| Velocity      | 25  | Recent commit cadence vs. prior 60-day baseline       |
| Responsiveness| 20  | Average first-response time on issues                 |
| Community     | 15  | Active contributors + fork/star ratio                 |
| Freshness     | 15  | Days since last commit + last release                 |
| Trust         | 10  | License, SECURITY.md, FUNDING.yml                     |
| Social        | 15  | Sponsorship, discussions, npm downloads, badges       |

Risk levels: **healthy** (≥80) · **medium** (≥60) · **high** (≥35) · **critical** (<35)

## Stack

- **Next.js 14** — App Router, Server Actions, SSG for reports
- **TypeScript strict** — all types centralised in `lib/types.ts`
- **Tailwind CSS** — custom dark design system (`--dl-*` tokens)
- **Octokit** — GitHub REST API wrapper
- **shadcn/ui** — Radix-based UI primitives
- **Vercel KV** (optional) — persistent cache driver in production

## Local setup

```bash
git clone https://github.com/BrkApp/DriftLogg
cd DriftLogg
npm install
cp .env.example .env.local   # add GITHUB_TOKEN (recommended)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable           | Required | Description                                                |
|--------------------|----------|------------------------------------------------------------|
| `GITHUB_TOKEN`     | No       | Fine-grained PAT — raises rate limit from 60 to 5,000/h   |
| `ADMIN_KEY`        | No       | Enables `GET /api/cache/stats` (header: `X-Admin-Key`)     |
| `KV_REST_API_URL`  | No       | Vercel KV URL — switches cache from in-memory to KV        |
| `KV_REST_API_TOKEN`| No       | Vercel KV token                                            |

## Project structure

```
app/
├── page.tsx                        Landing page
├── layout.tsx                      Root layout + SEO metadata
├── scan/
│   ├── page.tsx                    Repo input form
│   └── [owner]/[repo]/page.tsx     Scan results (client, fetches /api/scan)
├── reports/
│   ├── page.tsx                    Weekly reports index
│   └── [slug]/page.tsx             Individual report (SSG)
├── api/
│   ├── scan/route.ts               POST /api/scan — runs the health check
│   └── cache/stats/route.ts        GET /api/cache/stats — admin endpoint
└── actions/waitlist.ts             Server Action — email capture

lib/
├── types.ts                        Canonical TypeScript types (no logic)
├── constants.ts                    Validation rules, rate limits, scoring caps
├── github.ts                       Octokit wrapper + all GitHub fetchers
├── scoring.ts                      Drift score algorithm (pure functions)
├── cache.ts                        Memory / Vercel KV cache driver
├── reports.ts                      Markdown report reader (gray-matter)
├── parse-repo.ts                   GitHub URL / slug parser
└── utils.ts                        cn(), timeAgo(), classifySignal()

components/
├── scan/                           Scan results sub-components
│   ├── ScanSkeleton.tsx
│   ├── ErrorState.tsx
│   ├── ScanResults.tsx
│   ├── RepoHeader.tsx
│   ├── ScoreSection.tsx
│   ├── BreakdownSection.tsx
│   ├── SignalsSection.tsx
│   └── CtaSection.tsx
├── landing/                        Landing page sections
├── shared/                         Cross-page components (Layout, ScoreGauge, …)
└── ui/                             shadcn primitives (Button, Input, Skeleton, …)

content/reports/                    Markdown weekly reports (gray-matter frontmatter)
scripts/                            CLI tools (mass-scan, weekly report generator)
```

## Scripts

```bash
npm run dev                  # Dev server on :3000
npm run build                # Production build (also type-checks)
npm run lint                 # ESLint
npm start                    # Start production build

# Weekly risk report — scans 50 popular packages and writes to content/reports/
npm run generate-report

# Mass scan — hits /api/scan for a list of repos, outputs results.csv
# Requires dev server running on :3000
npx tsx scripts/mass-scan.ts
```

## Deploy on Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add `GITHUB_TOKEN` (and optionally `ADMIN_KEY`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`) in **Settings → Environment Variables**
4. Deploy

> **Limitations:** The waitlist Server Action writes to `data/waitlist.json` on disk. On Vercel (stateless serverless), writes are ephemeral. Replace with a database (Vercel KV, Supabase, Neon) for production persistence.

## License

MIT
