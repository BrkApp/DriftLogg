# DriftLogg — Open Source Decay Radar

Détecte les packages open source qui dérivent silencieusement vers l'abandon, avant que votre build ne casse.

## Fonctionnement

DriftLogg analyse n'importe quel dépôt GitHub public et calcule un **score de santé 0–100** basé sur cinq signaux :

| Signal | Poids | Description |
|---|---|---|
| Vélocité | 30 | Cadence de commits sur 90 jours |
| Réactivité | 25 | Délai moyen de première réponse sur les issues |
| Communauté | 20 | Contributeurs actifs + ratio fork/star |
| Fraîcheur | 15 | Dernier commit + dernière release |
| Confiance | 10 | Licence, SECURITY.md, FUNDING.yml |

## Stack

- **Next.js 14** — App Router, Server Actions
- **Octokit** — GitHub REST API
- **Tailwind CSS** — dark design system custom
- **TypeScript strict** — typage complet

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/BrkApp/DriftLogg
cd DriftLogg

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local et ajouter GITHUB_TOKEN (optionnel mais recommandé)

# 4. Lancer en développement
npm run dev
```

L'app est accessible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `GITHUB_TOKEN` | Non | Token GitHub — augmente la limite de 60 à 5 000 req/h |

Sans `GITHUB_TOKEN`, le rate limit GitHub est de 60 requêtes par heure par IP. Pour la production, un token est fortement recommandé.

**Créer un token** : [github.com/settings/tokens](https://github.com/settings/tokens) — aucune permission spécifique requise (lecture publique uniquement).

## Déploiement sur Vercel

```bash
# Via CLI
npx vercel

# Ou connecter le repo sur vercel.com (recommandé)
# → Import Git Repository → sélectionner DriftLogg
```

### Variables d'environnement sur Vercel

Dans le dashboard Vercel → Settings → Environment Variables :

```
GITHUB_TOKEN = ghp_xxxxxxxxxxxxx
```

### Limitations en production

- **Waitlist (`data/waitlist.json`)** : les Server Actions écrivent dans le système de fichiers local. Sur Vercel (serverless), ces écritures sont éphémères et ne persistent pas entre les invocations. Pour la production, remplacer par une base de données (Vercel KV, Supabase, Neon…).
- **Rate limit in-memory** : le cache et le rate limiting IP sont stockés en mémoire. Ils ne persistent pas entre les instances serverless. Pour un rate limiting fiable en prod, utiliser Vercel KV ou Upstash Redis.

## Structure du projet

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout + metadata SEO
├── scan/
│   ├── page.tsx               # Page de saisie d'un repo
│   └── [owner]/[repo]/
│       └── page.tsx           # Page de résultats du scan
├── api/scan/route.ts          # API POST /api/scan
├── actions/waitlist.ts        # Server Action waitlist
├── sitemap.ts                 # Sitemap dynamique
└── robots.ts                  # robots.txt

lib/
├── github.ts                  # Fetching GitHub API (Octokit)
├── scoring.ts                 # Calcul du score de santé
├── parse-repo.ts              # Parser URL/slug GitHub
└── utils.ts                   # cn() utility

components/
├── landing/                   # Composants landing page
├── scan/                      # Composants résultats (legacy)
├── ui/                        # Design system (Button, Input, Skeleton…)
└── waitlist-form.tsx          # Formulaire d'inscription waitlist
```

## Commandes utiles

```bash
npm run dev      # Développement local
npm run build    # Build de production (vérifie TypeScript)
npm run lint     # ESLint
npm start        # Démarrer le build de production
```

## Licence

MIT
