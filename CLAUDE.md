# CLAUDE.md — DriftLogg

SaaS qui prédit le déclin des dépendances open source. Score 0–100 via signaux GitHub. Buyer : engineering managers / tech leads. Stack : Next.js 14 App Router + TypeScript strict + Tailwind + shadcn/ui + Octokit + Vercel.

## Commandes

- Dev : `npm run dev` → http://localhost:3000
- Build : `npm run build`
- Lint : `npm run lint`
- Type check : `npx tsc --noEmit`
- Générer rapport hebdo : `npm run generate-report`

> Les scripts dans `scripts/` utilisent esbuild pour contourner le conflit ESM/CJS d'octokit v4. Ne pas les exécuter avec `tsx` directement — voir `package.json`.

## Architecture

```
app/
  page.tsx              Landing (compose components/landing/*)
  api/scan/route.ts     Endpoint public GET + POST + CORS
  scan/                 UI scan (input + résultats)
  reports/              Pages rapports Markdown
  vs/                   Pages comparaison concurrents
  api-docs/             Documentation API publique
components/
  landing/              Sections landing — Server Components
  scan/                 UI résultats scan
  shared/               Composants réutilisables (ScanInput, EmailCapture…)
  ui/                   Primitives shadcn — NE PAS modifier
lib/
  github.ts             Seul fichier autorisé à appeler l'API GitHub
  scoring.ts            Algorithme de score pur, sans effets de bord
  types.ts              Types partagés
content/reports/        Rapports hebdo Markdown — générés automatiquement, ne pas éditer
scripts/                Génération rapport hebdo (esbuild + Node)
driftloggaudit.md       Audit complet du 12 mai 2026 + ordre des sprints
```

**Règle d'or :** aucune logique métier dans les composants. Fetchers → `lib/github.ts`. Score → `lib/scoring.ts`. Zéro fetch dans les composants feuilles.

## Règles

- IMPORTANT : lancer `npx tsc --noEmit` après chaque modification de fichier TypeScript.
- Server Components par défaut. `"use client"` uniquement pour state / effets / browser APIs.
- Imports depuis `@/...` uniquement — alias tsconfig configuré.
- Tailwind uniquement — zéro CSS modules, zéro `style={}` sauf valeur calculée dynamiquement.
- JAMAIS élargir silencieusement les inputs du scan (GitLab / npm / PyPI = roadmap item).
- JAMAIS modifier les poids du scoring sans ajouter un test unitaire — les scores sont user-facing.
- JAMAIS committer `.env*`, secrets ou `data/waitlist.json`.
- Pas de base de données avant la v0.3 — stateless par design.
- Pas d'auth avant la v1.
- L'API GitHub ne doit utiliser que des scopes `public_repo`.

## Workflow

- Changements minimaux. Ne jamais refactoriser du code non lié à la tâche en cours.
- En cas d'incertitude entre deux approches, exposer les deux et laisser choisir.
- Un commit par changement logique — pas de commit géant multi-features.
- Ne pas ajouter de feature non demandée, même si elle paraît évidente.
- Les dépendances cassées après un prompt sont normales — le prompt suivant les corrige.
