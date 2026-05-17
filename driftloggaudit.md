# DriftLogg — Audit & Backlog Claude Code

Site audité : https://drift-logg.vercel.app/
Date : 12 mai 2026
Mode : avocat du diable, audit SaaS B2B pré-revenue.

---

## CONTEXTE PRODUIT (rappel pour Claude Code)

- **Produit** : DriftLogg, SaaS qui prédit le déclin des dépendances open source GitHub
- **Stack** : Next.js 14, TS strict, Tailwind, shadcn/ui, Octokit, Vercel
- **Wedge** : remplaçant Snyk Advisor (sunset janvier 2026), monitoring continu + recommandations d'alternatives
- **Concurrence** : OSSF Scorecard (gratuit), Socket.dev, Snyk, Endor Labs, deps.dev
- **Buyer** : engineering managers, tech leads, staff engineers
- **Pricing** : Free / Pro 29$ / Team 99$
- **Statut** : MVP fait solo + Claude Code, 0 clients payants

---

## RÉSUMÉ DES NOTES PAR AXE

| Axe | Note /10 | Statut |
|---|---|---|
| 1. Clarity (5s rule) | 8 | OK, minor fix |
| 2. Wedge / Positioning | 9 | Excellent, ne pas toucher |
| 3. Copy | 6 | À retravailler |
| 4. CTA / Conversion path | 6 | **Bloquant : Pro = waitlist** |
| 5. Crédibilité technique | 5 | Manque méthodologie + compteurs |
| 6. Social proof | 3 | Quasi inexistant |
| 7. Pricing | 6 | Visuel ok, mais waitlist + devise |
| 8. SEO / Discoverability | 5 | Manque pages programmatiques |
| 9. UX / Design | 7 | Solide, à valider mobile |

---

## DÉTAIL PAR AXE + ACTIONS

### 1. CLARITY — 8/10

**Constat** : Hero propre. Headline "Watch your dependencies before they die" + sous-titre nommant Snyk Advisor immédiatement + champ scan inline = compréhension en 5s. Manque le "pour qui" explicite.

**Action (30min)** : Ajouter un eyebrow ou sub-headline "For engineering teams shipping production code" sous le H1, ou à côté du `// OPEN SOURCE HEALTH MONITORING`.

---

### 2. WEDGE / POSITIONING — 9/10

**Constat** : Tableau comparatif DriftLogg vs OSSF Scorecard vs Snyk Advisor parfaitement exécuté. ✓ verts, ✗ blancs, "SUNSET" en rouge. Wedge limpide.

**Action** : Ne rien toucher.

---

### 3. COPY — 6/10

**Forces** :
- "Watch your dependencies before they die" : verbe d'action, image mortelle
- "The postmortem writes itself" : corde sensible EM
- Mockup moment/moment (34/100 CRITICAL, alertes contextuelles) = copy par l'exemple, excellent

**Faiblesses (Lorem corporate)** :
- "Three steps to never be surprised again" → titre paresseux
- "Built for engineering teams who've been burned before" → vague
- "Six signals, scored in seconds" → factuel sans émotion
- Cartes "What we measure" : descriptions trop génériques ("Are commits slowing down?")

**Réécritures concrètes** :
- "Three steps to never be surprised again" → **"From repo URL to migration plan in 60 seconds"**
- "Six signals, scored in seconds" → **"The 6 metrics that predicted moment.js, request, and node-sass dying — months before npm noticed"**
- "Built for engineering teams who've been burned before" → **"Used by teams who learned the hard way that 'looks maintained' isn't a strategy"**
- Cartes "What we measure" : ajouter seuils concrets, ex. "We flag repos with <2 commits/month over 90 days"

**Action (2h)** : Réécrire les H2 et les 6 cartes "What we measure" avec seuils chiffrés.

---

### 4. CTA + CONVERSION PATH — 6/10

**Constat** : Champ scan dans le hero = friction quasi nulle, excellent. CTA "Scan for free" répété en nav. MAIS le tier Pro "Most Popular" à 29$ affiche **"Join waitlist"** = meurtre de conversion. Tu présentes ton tier money comme prêt mais pas achetable.

**Action URGENTE (4h)** : Brancher Stripe Checkout sur Pro, même en mode "Founding member — locked-in $29 lifetime" ou "Early access — 14-day trial". Capturer les cartes maintenant. Si vraiment impossible cette semaine, retirer le badge "Most Popular" du Pro pour ne pas créer de frustration visuelle.

---

### 5. CRÉDIBILITÉ TECHNIQUE — 5/10

**Constat positif** : Dashboard moment/moment dans le hero prouve que le scoring fonctionne. Indicateur vert "•" à côté du logo = touche live/healthy.

**Manques pour un staff engineer** :
- Stack non mentionnée côté visiteur (TypeScript strict, Next.js 14)
- Aucun compteur ("X repos scanned", "Y packages monitored")
- Pas de page /methodology expliquant le poids des 6 signaux
- Lien GitHub uniquement en footer
- Incohérence domaine : meta dit `driftlogg.dev`, URL est `drift-logg.vercel.app`

**Actions** :
- (3h) Créer `/methodology` détaillant le scoring (poids de chaque signal, seuils, sources de données via Octokit)
- (1h) Ajouter compteur live "X repos scanned this week" en bas du hero
- (30min) Lien GitHub repo public dans la nav (icône)
- (1h) Déployer sur `driftlogg.dev` (le domaine est dans les meta tags)

---

### 6. SOCIAL PROOF — 3/10

**Constat** : Aucun logo client (normal pré-revenue), mais sous-exploitation du build-in-public. Les 3 Weekly Risk Reports existants sont une bonne base. Mais aucune mention :
- "Hacker News / r/programming"
- Tweets embed
- Compteur beta
- Cas historiques où DriftLogg aurait flaggé en avance

**Action (4h)** : Créer une section "Track record" avec 5-6 cas vérifiables :
> "DriftLogg's scoring would have flagged:
> - moment — 18 months before official deprecation
> - request — 2 years before npm retired it
> - node-sass — 6 months before Sass team announced sunset
> - bower — 9 months before maintenance mode"

Run le scoring rétroactivement sur ces packages à des dates passées, capture screenshots.

---

### 7. PRICING — 6/10

**Constat** : Visuel propre, hiérarchie claire, glow vert sur Pro. Mais :
- "Join waitlist" sur Pro = bloquant (cf. §4)
- Devise en `$` alors que le brief mentionne 29€ → incohérence marché
- Team plan : "SSO Google" seulement = signal faible. Boîtes qui paient 99$/mois veulent Okta/Azure AD
- Pas de mention TVA EU pour utilisateurs européens

**Actions** :
- (4h) Stripe Checkout Pro activable
- (30min) Choisir devise unique cohérente avec marché cible (US-first = $, EU-first = €)
- (30min) Team plan : "SSO (Google, Okta on request)" au lieu de "SSO Google" seul
- (30min) Ajouter mention "VAT included for EU customers" si applicable

---

### 8. SEO / DISCOVERABILITY — 5/10

**Constat** : Title et meta corrects et optimisés sur "Snyk Advisor replacement". OG image à vérifier. Mais aucune page SEO programmatique alors que tu as la data et le wedge.

**Actions URGENTES** :

1. **(8h) Générer 50+ pages `/is-{package}-maintained/[name]`** depuis tes scans existants
   - Template Next.js dynamique
   - Pull data Octokit + scoring DriftLogg
   - Schema.org SoftwareApplication
   - Internal linking entre pages
   - Target : top 100 npm packages + top 50 PyPI

2. **(2h) Page `/alternative-to-snyk-advisor`** qui reprend le tableau comparatif + FAQ migration

3. **(2h) Pages `/vs/ossf-scorecard`, `/vs/socket-dev`, `/vs/snyk`** ciblant les requêtes comparatives

4. **(1h) OG image dynamique** = screenshot du dashboard moment/moment ou équivalent. Asset visuel parfait pour CTR social.

5. **(1h) `sitemap.xml` dynamique** + soumission Google Search Console

---

### 9. UX / DESIGN — 7/10

**Constat** : Dark mode natif, palette verte sur noir, typo monospace pour éléments techniques. Hiérarchie propre. Hover states soignés (carte verte sur "Maintainer Response"). Touches "code aesthetic" assumées (`> owner/repo`, `// OPEN SOURCE HEALTH MONITORING`).

**À vérifier (non audité, pas de screenshot mobile)** :
- Responsive du tableau comparatif (risque scroll horizontal)
- Pricing cards sur mobile
- Hero scan input sur petit écran

**Actions (2h)** :
- Test responsive complet (Chrome DevTools + vrai device)
- Tableau comparatif : version mobile en stack vertical par concurrent
- Audit Lighthouse (perf + accessibilité + SEO)

---

## TOP 3 FIX URGENTS (cette semaine)

### 🔴 FIX 1 — Activer Pro avec Stripe Checkout (4h)
**Pourquoi** : Le tier "Most Popular" à 29$ affiche "Join waitlist". Tu sabotes ta propre demo. Tant que ce bouton ne prend pas de carte, le site est un side project.

**Implémentation Claude Code** :
- Créer route `/api/checkout/pro` avec Stripe SDK
- Webhook `/api/webhooks/stripe` pour activer le plan post-paiement
- Page `/success` post-checkout
- Option fallback : mode "Founding member — $29 locked-in lifetime, 100 spots only"
- Variables d'env : `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO`, `STRIPE_WEBHOOK_SECRET`

### 🔴 FIX 2 — Pages SEO programmatiques `/is-{package}-maintained/[name]` (8h)
**Pourquoi** : Tu as 0 trafic organique. Tu as la data. Tu as le wedge Snyk sunset. C'est ton canal d'acquisition n°1 gratuit.

**Implémentation Claude Code** :
- Route dynamique `app/is-[package]-maintained/[name]/page.tsx`
- `generateStaticParams` sur top 100 npm + top 50 PyPI
- `generateMetadata` avec title/desc/OG dynamique
- Cache ISR 24h via `revalidate = 86400`
- Composant `<PackageHealthCard />` réutilisable
- Schema.org SoftwareApplication JSON-LD
- Internal linking : "Compare to similar packages"
- `sitemap.ts` dynamique listant toutes les pages générées

### 🔴 FIX 3 — Track record social proof (3h)
**Pourquoi** : Pré-revenue = pas de logos clients. Mais tu peux prouver que ton scoring aurait flaggé les morts célèbres en avance.

**Implémentation Claude Code** :
- Section `<TrackRecord />` sur la landing entre "Why DriftLogg" et "Three steps"
- Liste : moment, request, node-sass, bower, gulp, grunt
- Pour chaque : "Flagged X months before official deprecation"
- Mini-cards avec score historique + date du signal
- Optionnel : page `/track-record` détaillée avec timeline interactive

---

## TOP 3 NICE-TO-HAVE

### 🟡 NTH 1 — Page `/methodology` (3h)
Détailler le poids des 6 signaux, seuils, sources de données. Crédibilité staff engineer.

### 🟡 NTH 2 — Mobile responsive du tableau comparatif (2h)
Stack vertical par concurrent sur breakpoint < 768px.

### 🟡 NTH 3 — Cohérence domaine + devise (1h30)
Déployer sur `driftlogg.dev`. Choisir $ ou € selon marché cible et appliquer partout.

---

## TÂCHES BONUS (backlog moyen terme)

- Status page publique (`status.driftlogg.dev`) — renforce le "•" vert du logo
- Blog technique avec article "How we score 6 signals to predict OSS decay"
- API publique read-only (key gratuite) — flywheel dev community
- Intégration GitHub App officielle (publication marketplace)
- VS Code extension : score dans le `package.json` au hover
- Slack/Discord community pour build-in-public
- Newsletter "Dead Package Weekly" (capture leads via les Weekly Risk Reports)

---

## VERDICT FINAL

> Si je devais investir 50K€, ce site me ferait dire **OUI avec une condition** — parce que le design est sérieux, le wedge Snyk est exploité chirurgicalement, le scan public sans friction est rare et puissant, et le mockup moment/moment est une démo qui vend toute seule ; mais tant que le bouton Pro dit "Join waitlist" au lieu de prendre ma carte, ce n'est pas un investissement, c'est un don à un side project qui refuse de devenir un business. **Active Stripe cette semaine et la réponse devient OUI sec.**

---

## ORDRE D'EXÉCUTION RECOMMANDÉ POUR CLAUDE CODE

```
Sprint 1 (semaine 1) — Débloquer la monétisation
  [4h] FIX 1 : Stripe Checkout Pro
  [3h] FIX 3 : Track record social proof
  [30min] Sub-headline "For engineering teams..."

Sprint 2 (semaine 2) — Trafic organique
  [8h] FIX 2 : Pages /is-{package}-maintained
  [2h] Page /alternative-to-snyk-advisor
  [1h] OG image dynamique
  [1h] sitemap.xml

Sprint 3 (semaine 3) — Crédibilité
  [3h] Page /methodology
  [2h] Réécriture copy H2 + cartes "What we measure"
  [2h] Responsive mobile complet
  [1h] Déploiement driftlogg.dev

Sprint 4 (semaine 4) — Long tail
  [2h] Pages /vs/* (Scorecard, Socket, Snyk)
  [3h] Newsletter "Dead Package Weekly"
  [4h] API publique read-only
```

**Total Sprint 1 : ~7h30 → débloque le revenu**
**Total Sprint 2 : ~12h → débloque le trafic**
