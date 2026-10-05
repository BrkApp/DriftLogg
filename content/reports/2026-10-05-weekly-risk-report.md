---
title: 'Weekly Risk Report — October 5, 2026'
date: '2026-10-05'
description: >-
  This week's riskiest npm packages: 5 critical, 10 high risk, 11 medium, 19
  healthy out of 45 scanned.
tags:
  - weekly
  - npm
  - risk
packageScores:
  pm2: 16
  cors: 20
  cheerio: 28
  helmet: 29
  gulp: 33
  lodash: 41
  tailwindcss: 42
  pinia: 42
  jest: 43
  zustand: 43
  chalk: 43
  nodemon: 47
  morgan: 50
  moment: 63
  svelte: 67
  sass: 70
  fastify: 70
  vite: 72
  prisma: 72
  redux: 72
  express: 75
  cypress: 77
  drizzle-orm: 77
  vue: 78
  sequelize: 78
  eslint: 81
  react: 82
  webpack: 82
  remix: 82
  typeorm: 83
  axios: 85
  '@nestjs/core': 85
  puppeteer: 85
  mocha: 87
  dotenv: 87
  mongoose: 88
  astro: 88
  playwright: 89
  mobx: 90
  '@angular/core': 92
  typescript: 92
  prettier: 92
  nuxt: 92
  pnpm: 95
  '@babel/core': 97
---

# Weekly Risk Report — October 5, 2026

DriftLogg scanned the 50 most depended-on npm packages this week. Here's what we found.

**Summary:** 5 critical · 10 high risk · 11 medium · 19 healthy

## 🔴 Critical Risk (score < 35)

| Package | Score | Key Signal |
|---------|-------|------------|
| `pm2` | 16 | No commits in the last 42 days |
| `cors` | 20 | No commit activity in the last 90 days |
| `cheerio` | 28 | No commits in the last 33 days |
| `helmet` | 29 | Commit velocity down 77% over the last 30 days |
| `gulp` | 33 | No commit activity in the last 90 days |

## 🟠 High Risk (score 35–59)

| Package | Score | Key Signal |
|---------|-------|------------|
| `lodash` | 41 | Critical bus factor: only 1 active contributor in the last 30 days |
| `tailwindcss` | 42 | Commit velocity down 78% over the last 30 days |
| `pinia` | 42 | Commit velocity down 92% over the last 30 days |
| `jest` | 43 | Maintenance mode only: recent commits limited to dependency updates and… |
| `zustand` | 43 | Commit velocity down 82% over the last 30 days |
| `chalk` | 43 | Single maintainer risk: one contributor made 91% of commits in the last… |
| `nodemon` | 47 | Maintenance mode only: recent commits limited to dependency updates and… |
| `morgan` | 50 | Commit velocity down 67% over the last 30 days |
| `moment` | 63 | README signals maintenance mode — no new features, bug-fixes or securit… |
| `axios` | 85 | README explicitly marks this project as deprecated |

## 🟡 Medium Risk (score 60–79)

| Package | Score | Key Signal |
|---------|-------|------------|
| `svelte` | 67 | 12 active contributors in the last 30 days |
| `sass` | 70 | Maintainers very responsive (< 24h average) |
| `fastify` | 70 | 13 active contributors in the last 30 days |
| `vite` | 72 | 31 active contributors in the last 30 days |
| `prisma` | 72 | Maintainers very responsive (< 24h average) |
| `redux` | 72 | Commit velocity up 3357% over the last 30 days |
| `express` | 75 | Maintainers very responsive (< 24h average) |
| `cypress` | 77 | GitHub Discussions enabled on this repository |
| `drizzle-orm` | 77 | Commit velocity up 67% over the last 30 days |
| `vue` | 78 | Financially supported via GitHub Sponsors or Open Collective |
| `sequelize` | 78 | Commit velocity up 946% over the last 30 days |

## 🟢 Healthy (score ≥ 80)

| Package | Score | Key Signal |
|---------|-------|------------|
| `eslint` | 81 | 20 active contributors in the last 30 days |
| `react` | 82 | 21 active contributors in the last 30 days |
| `webpack` | 82 | Commit velocity up 649% over the last 30 days |
| `remix` | 82 | 10 active contributors in the last 30 days |
| `typeorm` | 83 | Maintainers very responsive (< 24h average) |
| `@nestjs/core` | 85 | 42 active contributors in the last 30 days |
| `puppeteer` | 85 | 17 active contributors in the last 30 days |
| `mocha` | 87 | 12 active contributors in the last 30 days |
| `dotenv` | 87 | Maintainers very responsive (< 24h average) |
| `mongoose` | 88 | 14 active contributors in the last 30 days |
| `astro` | 88 | 35 active contributors in the last 30 days |
| `playwright` | 89 | 32 active contributors in the last 30 days |
| `mobx` | 90 | Financially supported via GitHub Sponsors or Open Collective |
| `@angular/core` | 92 | 39 active contributors in the last 30 days |
| `typescript` | 92 | 31 active contributors in the last 30 days |
| `prettier` | 92 | 16 active contributors in the last 30 days |
| `nuxt` | 92 | 19 active contributors in the last 30 days |
| `pnpm` | 95 | 98 active contributors in the last 30 days |
| `@babel/core` | 97 | 13 active contributors in the last 30 days |

## Biggest Movers

- ⬆️ `axios`: 52 → 85 (+33) — 10 active contributors in the last 30 days
- ⬆️ `typeorm`: 55 → 83 (+28) — Maintainers very responsive (< 24h average)
- ⬆️ `mongoose`: 63 → 88 (+25) — 14 active contributors in the last 30 days
- ⬇️ `moment`: 79 → 63 (-16) — README signals maintenance mode — no new features, bug-fixes or securit…
- ⬇️ `svelte`: 82 → 67 (-15) — Commit velocity down 58% over the last 30 days
- ⬇️ `morgan`: 63 → 50 (-13) — Commit velocity down 67% over the last 30 days
- ⬆️ `zustand`: 31 → 43 (+12) — Active community platform detected (Discord or Slack)
- ⬇️ `fastify`: 82 → 70 (-12) — Commit velocity down 53% over the last 30 days
- ⬇️ `webpack`: 94 → 82 (-12) — Commit velocity up 649% over the last 30 days
- ⬇️ `vite`: 82 → 72 (-10) — 31 active contributors in the last 30 days
- ⬇️ `vue`: 88 → 78 (-10) — Financially supported via GitHub Sponsors or Open Collective
- ⬆️ `mobx`: 80 → 90 (+10) — Financially supported via GitHub Sponsors or Open Collective
- ⬇️ `lodash`: 50 → 41 (-9) — Critical bus factor: only 1 active contributor in the last 30 days
- ⬆️ `sass`: 62 → 70 (+8) — Maintainers very responsive (< 24h average)
- ⬇️ `cheerio`: 35 → 28 (-7) — No commits in the last 33 days
- ⬇️ `react`: 88 → 82 (-6) — 21 active contributors in the last 30 days

## What Should You Do?

If you depend on a critical or high-risk package, start evaluating alternatives now. Run a free scan on your own repo to see your full dependency risk profile.

**[Scan your repo for free →](/scan)**
