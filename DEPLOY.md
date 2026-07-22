# Deploiement

L'application utilise **PostgreSQL** (dev et prod) : le schema Prisma est deja
configure, **aucun changement de code n'est requis pour deployer**. Il reste a
provisionner une base managee et a importer le repo sur un hebergeur.

## Option recommandee : Vercel + Postgres (Neon / Vercel Postgres)

### 1. Provisionner une base Postgres

- **Vercel Postgres** (onglet *Storage* du projet Vercel), ou
- **Neon** (https://neon.tech, offre gratuite) → recuperer la chaine
  `postgresql://...`.

### 2. Importer le repo sur Vercel

1. https://vercel.com/new → *Import Git Repository* → `bko-yao/plateformecours`
   (l'app GitHub de Claude est deja installee, le repo est visible).
2. Framework detecte : **Next.js** (aucune config a changer).
3. **Environment Variables** :
   - `DATABASE_URL` = la chaine Postgres de l'etape 1
   - `NEXT_PUBLIC_SITE_URL` = l'URL de production (ex. `https://preceptio.vercel.app`)
   - `CREDIT_IMPOT_RATE` = `0.5`
4. **Build Command** (pour appliquer le schema au deploiement) :
   ```
   prisma generate && prisma db push && next build
   ```
   (`prisma db push` cree les tables sur la base Postgres au premier build.)
5. Deployer.

### 3. Seed des professeurs de demonstration (une fois)

En local, pointe sur la base de prod puis :

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

> Le seed est optionnel : sans lui, l'app fonctionne mais l'annuaire de profs
> est vide. En production reelle, les profs sont crees via l'onboarding.

## Alternative : Railway / Fly.io / Render

Ces hebergeurs deploient aussi bien l'app + une base Postgres managee. Memes
etapes : provisionner Postgres, definir `DATABASE_URL`, build command
`prisma generate && prisma db push && next build`.

## Checklist production (au-dela du MVP)

- [ ] PostgreSQL manage + sauvegardes
- [ ] Variables Stripe / URSSAF / Anthropic (voir `.env.example`)
- [ ] Domaine + `NEXT_PUBLIC_SITE_URL`
- [ ] Hebergement des donnees en UE (RGPD, cf. CONCEPTION.md section 9)
- [ ] Monitoring (Sentry) et logs
