# Security Audit — DriftLogg
**Date:** 2026-05-11  
**Auditor:** Claude Sonnet 4.6  
**Scope:** Full codebase pre-deployment review

---

## 1. Secrets & Leaks

### `.gitignore` — `.env.production` manquant
- **Statut:** ✅ CORRIGÉ
- `.env.production` ajouté au `.gitignore`.
- Couverture finale : `.env`, `.env*.local`, `.env.production`.

### Historique git
- **Statut:** ✅ CLEAN
- Commandes exécutées :
  ```
  git log --all -p -- '*.env*'
  git log --all -p | grep -i "ghp_\|github_token=\|secret=\|password=\|api_key="
  ```
- Résultat : le grep a retourné `+GITHUB_TOKEN = ghp_xxxxxxxxxxxxx` — il s'agit d'un placeholder explicite dans `.env.example`, pas d'un token réel.
- Aucun secret valide dans l'historique.

### `.env.example`
- **Statut:** ✅ CONFORME
- Toutes les valeurs sont vides ou clairement labelisées comme placeholders.
- `ADMIN_KEY` était commenté : décommenté pour rendre l'exigence visible.

---

## 2. Validation des inputs

### `/api/scan` — limite `owner` incorrecte
- **Statut:** ✅ CORRIGÉ
- Avant : `NAME_MAX = 100` appliqué à owner ET repo.
- Après : `OWNER_MAX = 39` (limite GitHub officielle) et `REPO_MAX = 100`.
- Régex séparés : `OWNER_RE = /^[A-Za-z0-9-]+$/` (pas de point ni underscore pour les usernames) et `REPO_RE = /^[A-Za-z0-9._-]+$/`.
- Erreurs 400 distinctes et explicites pour chaque cas.

### `lib/parse-repo.ts` — aucune validation côté client
- **Statut:** ✅ CORRIGÉ
- Ajout de `validateParts()` qui vérifie longueur et format après parsing de l'URL ou du slug.
- Un input comme `a`.repeat(40)+`/repo` est rejeté avant navigation.

### `/scan/[owner]/[repo]` — params URL non validés côté client
- **Statut:** ✅ CORRIGÉ
- Ajout d'une validation au début de `runScan()` dans la page résultats.
- Si les params de l'URL sont invalides (accès direct au path), affiche "Invalid repository path." sans appeler l'API.

---

## 3. Rate Limiting

### In-memory limiter — reset au cold start
- **Statut:** ✅ DOCUMENTÉ
- Le rate limiter utilise `x-forwarded-for` / `x-real-ip` pour identifier l'IP ✓
- Ajout d'un commentaire explicite dans `app/api/scan/route.ts` :
  ```
  // ⚠️ In-memory rate limiter resets on cold start.
  // For production scale, replace with Vercel KV or Upstash Redis.
  ```
- Limites actuelles : 20 req/min/IP, 500 req/min global — raisonnables pour le MVP.

---

## 4. Headers de sécurité

### `next.config.mjs` — aucun security header
- **Statut:** ✅ CORRIGÉ
- Headers ajoutés sur toutes les routes (`source: "/(.*)"`) :

| Header | Valeur |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;` |

> Note : `unsafe-inline` dans `script-src` est nécessaire pour Next.js App Router (hydration inline). À durcir avec nonces en v1 si l'exposition publique augmente.

---

## 5. Endpoint admin `/api/cache/stats`

- **Statut:** ✅ CONFORME
- L'endpoint retourne `503 "ADMIN_KEY is not set on the server."` si la variable n'est pas configurée.
- Retourne `403 "Forbidden"` si le header `X-Admin-Key` est absent ou incorrect.
- `ADMIN_KEY` décommenté dans `.env.example` pour rendre l'obligation visible lors du déploiement.

---

## 6. Dépendances — `npm audit`

### Avant
```
5 vulnérabilités : 1 moderate, 3 high, 1 critical
```

### CVE critique patchée
| CVE | Description | Fix |
|---|---|---|
| GHSA-f82v-jwr5-mffw | Authorization Bypass in Next.js Middleware | ✅ `next@14.2.35` |

### Après (`next@14.2.35`)
```
5 vulnérabilités : 1 moderate, 4 high
```

### Vulnérabilités résiduelles (non bloquantes)

| Package | Sévérité | Description | Contexte |
|---|---|---|---|
| `glob` via `eslint-config-next` | High | Command injection via CLI | Dev-only, jamais exécuté en production |
| `next` (Image Optimizer DoS) | High | DoS via `remotePatterns` | Non utilisé (aucune `next/image` avec remote) |
| `next` (RSC deserialization DoS) | High | DoS via React Server Components | Exige un attaquant contrôlant les props RSC |
| `next` (HTTP request smuggling) | High | Via `rewrites` config | Aucun `rewrites` configuré |
| `postcss` | Moderate | XSS via stringify | CSS généré en build, pas à runtime |

**Fix complet = `next@16`** — breaking change, hors scope MVP. À planifier pour v0.2.

---

## Récapitulatif

| # | Catégorie | Statut |
|---|---|---|
| 1 | `.env.production` dans `.gitignore` | ✅ Corrigé |
| 2 | Secrets dans l'historique git | ✅ Clean |
| 3 | `owner` max 39 chars dans `/api/scan` | ✅ Corrigé |
| 4 | Validation regex séparée owner/repo | ✅ Corrigé |
| 5 | Validation client dans `parse-repo.ts` | ✅ Corrigé |
| 6 | Validation client dans la page résultats | ✅ Corrigé |
| 7 | Cold start rate limiter documenté | ✅ Documenté |
| 8 | Security headers (`next.config.mjs`) | ✅ Corrigé |
| 9 | `ADMIN_KEY` obligatoire dans `.env.example` | ✅ Corrigé |
| 10 | CVE critique Next.js (Authorization Bypass) | ✅ Patché (`14.2.35`) |
| 11 | CVE high Next.js résiduelles | ⚠️ Accepté (requiert Next.js 16) |
| 12 | `glob` dev dependency | ⚠️ Accepté (dev-only) |
