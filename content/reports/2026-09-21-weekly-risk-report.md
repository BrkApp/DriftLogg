---
title: 'Weekly Risk Report — September 21, 2026'
date: '2026-09-21'
description: >-
  This week's riskiest npm packages: 4 critical, 9 high risk, 10 medium, 22
  healthy out of 45 scanned.
tags:
  - weekly
  - npm
  - risk
packageScores:
  cors: 21
  helmet: 28
  gulp: 33
  chalk: 33
  cheerio: 35
  axios: 39
  tailwindcss: 39
  zustand: 42
  mobx: 43
  nodemon: 47
  lodash: 50
  pm2: 57
  sass: 62
  jest: 64
  vite: 67
  fastify: 68
  prisma: 72
  redux: 72
  morgan: 73
  express: 75
  cypress: 76
  sequelize: 78
  remix: 80
  drizzle-orm: 81
  '@angular/core': 82
  mongoose: 82
  pinia: 83
  webpack: 84
  typeorm: 85
  nuxt: 85
  moment: 86
  eslint: 87
  dotenv: 87
  typescript: 88
  prettier: 88
  astro: 88
  svelte: 89
  '@nestjs/core': 91
  react: 92
  mocha: 92
  puppeteer: 92
  playwright: 92
  pnpm: 93
  vue: 95
  '@babel/core': 97
---

# Weekly Risk Report — September 21, 2026

DriftLogg scanned the 50 most depended-on npm packages this week. Here's what we found.

**Summary:** 4 critical · 9 high risk · 10 medium · 22 healthy

## 🔴 Critical Risk (score < 35)

| Package | Score | Key Signal |
|---------|-------|------------|
| `cors` | 21 | No commit activity in the last 90 days |
| `helmet` | 28 | Commit velocity down 93% over the last 30 days |
| `gulp` | 33 | No commit activity in the last 90 days |
| `chalk` | 33 | Commit velocity down 75% over the last 30 days |

## 🟠 High Risk (score 35–59)

| Package | Score | Key Signal |
|---------|-------|------------|
| `cheerio` | 35 | Commit velocity down 71% over the last 30 days |
| `axios` | 39 | README explicitly marks this project as deprecated |
| `tailwindcss` | 39 | Commit velocity down 90% over the last 30 days |
| `zustand` | 42 | Commit velocity down 80% over the last 30 days |
| `mobx` | 43 | Commit velocity down 75% over the last 30 days |
| `nodemon` | 47 | Maintenance mode only: recent commits limited to dependency updates and… |
| `lodash` | 50 | Critical bus factor: only 1 active contributor in the last 30 days |
| `pm2` | 57 | Single maintainer risk: one contributor made 100% of commits in the las… |
| `moment` | 86 | README signals maintenance mode — no new features, bug-fixes or securit… |

## 🟡 Medium Risk (score 60–79)

| Package | Score | Key Signal |
|---------|-------|------------|
| `sass` | 62 | 23.1M weekly npm downloads |
| `jest` | 64 | Maintainers very responsive (< 24h average) |
| `vite` | 67 | 16 active contributors in the last 30 days |
| `fastify` | 68 | Maintainers very responsive (< 24h average) |
| `prisma` | 72 | Maintainers very responsive (< 24h average) |
| `redux` | 72 | Commit velocity up 633% over the last 30 days |
| `morgan` | 73 | 9.6M weekly npm downloads |
| `express` | 75 | Maintainers very responsive (< 24h average) |
| `cypress` | 76 | GitHub Discussions enabled on this repository |
| `sequelize` | 78 | Commit velocity up 925% over the last 30 days |

## 🟢 Healthy (score ≥ 80)

| Package | Score | Key Signal |
|---------|-------|------------|
| `remix` | 80 | 12 active contributors in the last 30 days |
| `drizzle-orm` | 81 | Maintainers very responsive (< 24h average) |
| `@angular/core` | 82 | 32 active contributors in the last 30 days |
| `mongoose` | 82 | 12 active contributors in the last 30 days |
| `pinia` | 83 | Financially supported via GitHub Sponsors or Open Collective |
| `webpack` | 84 | 11 active contributors in the last 30 days |
| `typeorm` | 85 | 11 active contributors in the last 30 days |
| `nuxt` | 85 | 15 active contributors in the last 30 days |
| `eslint` | 87 | 26 active contributors in the last 30 days |
| `dotenv` | 87 | Maintainers very responsive (< 24h average) |
| `typescript` | 88 | 25 active contributors in the last 30 days |
| `prettier` | 88 | 19 active contributors in the last 30 days |
| `astro` | 88 | 33 active contributors in the last 30 days |
| `svelte` | 89 | 13 active contributors in the last 30 days |
| `@nestjs/core` | 91 | 28 active contributors in the last 30 days |
| `react` | 92 | 28 active contributors in the last 30 days |
| `mocha` | 92 | 12 active contributors in the last 30 days |
| `puppeteer` | 92 | 15 active contributors in the last 30 days |
| `playwright` | 92 | 26 active contributors in the last 30 days |
| `pnpm` | 93 | 65 active contributors in the last 30 days |
| `vue` | 95 | 15 active contributors in the last 30 days |
| `@babel/core` | 97 | 10 active contributors in the last 30 days |

## Biggest Movers

- ⬆️ `dotenv`: 27 → 87 (+60) — Maintainers very responsive (< 24h average)
- ⬆️ `drizzle-orm`: 24 → 81 (+57) — Maintainers very responsive (< 24h average)
- ⬇️ `mobx`: 89 → 43 (-46) — Commit velocity down 75% over the last 30 days
- ⬇️ `jest`: 92 → 64 (-28) — Commit velocity down 56% over the last 30 days
- ⬇️ `zustand`: 67 → 42 (-25) — Commit velocity down 80% over the last 30 days
- ⬇️ `vite`: 88 → 67 (-21) — Commit velocity down 56% over the last 30 days
- ⬇️ `sass`: 80 → 62 (-18) — Single maintainer risk: one contributor made 90% of commits in the last…
- ⬆️ `chalk`: 19 → 33 (+14) — 411.5M weekly npm downloads
- ⬇️ `remix`: 90 → 80 (-10) — Commit velocity up 78% over the last 30 days
- ⬇️ `@angular/core`: 92 → 82 (-10) — Commit velocity up 77% over the last 30 days
- ⬇️ `typeorm`: 95 → 85 (-10) — Commit velocity up 78% over the last 30 days
- ⬆️ `express`: 67 → 75 (+8) — Maintainers very responsive (< 24h average)
- ⬆️ `redux`: 65 → 72 (+7) — Commit velocity up 633% over the last 30 days
- ⬇️ `nuxt`: 92 → 85 (-7) — 15 active contributors in the last 30 days
- ⬇️ `nodemon`: 53 → 47 (-6) — Maintenance mode only: recent commits limited to dependency updates and…
- ⬆️ `prisma`: 66 → 72 (+6) — Maintainers very responsive (< 24h average)
- ⬇️ `mongoose`: 88 → 82 (-6) — 12 active contributors in the last 30 days
- ⬆️ `eslint`: 81 → 87 (+6) — 26 active contributors in the last 30 days

## What Should You Do?

If you depend on a critical or high-risk package, start evaluating alternatives now. Run a free scan on your own repo to see your full dependency risk profile.

**[Scan your repo for free →](/scan)**
