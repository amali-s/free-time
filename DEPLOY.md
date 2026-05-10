# Deploying FreeTime to Vercel

This is the published path of least resistance for FreeTime. Vercel auto-detects
Next.js, runs the route handlers (`/api/spaces`, `/api/cities`, `/api/geocode`)
on its serverless runtime, and rebuilds on every push to `main`.

> **Why Vercel and not GitHub Pages?** GitHub Pages only serves static files
> and can't run Route Handlers, Drizzle queries, or the geocode proxy.
> Anything we'd ship to GH Pages would need a static-data rewrite (no live DB).
> If you ever want to revisit, see the "GitHub Pages alternative" section at
> the bottom.

---

## Prerequisites

You need accounts and credentials for the same services the local app uses:

1. **Supabase project** — for Postgres + PostGIS + Storage
2. **Google Cloud project** with Places API enabled — only needed if you want
   to run `npm run db:enrich-images` to backfill space photos
3. **GitHub repo** at `https://github.com/amali-s/free-time` (already set up)
4. **Vercel account** — free Hobby tier is fine

---

## One-time setup (Supabase)

If your Supabase project isn't yet provisioned for FreeTime:

```bash
# locally, with .env.local populated from .env.example
npm install
npm run db:setup     # creates tables + PostGIS extension
npm run db:seed      # loads cities + spaces from scripts/seed.ts
```

You only need to do this once per Supabase project. The deployed site will
read from this same database.

---

## Deploying to Vercel

### 1. Import the repo

1. Sign in at <https://vercel.com> with your GitHub account.
2. Click **Add New… → Project**.
3. Find `amali-s/free-time` in the import list and click **Import**.
4. Vercel will detect the framework as **Next.js**. Leave Build & Development
   settings on their defaults — they're correct.

### 2. Set environment variables

Before clicking Deploy, expand **Environment Variables** and add the four
variables from `.env.example`. Apply each to **Production**, **Preview**, and
**Development**:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | Public — exposed to the browser |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Your Supabase publishable key | Public — exposed to the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | **Server-only.** Never expose. Only needed if running `db:enrich-images` from Vercel |
| `DATABASE_URL` | `postgresql://postgres:<pwd>@db.<project>.supabase.co:5432/postgres` | Used server-side by Drizzle |
| `GOOGLE_PLACES_API_KEY` | Your Places API key | Only needed for `db:enrich-images` — not required for runtime |

### 3. Deploy

Click **Deploy**. First build takes ~2–3 minutes. When it finishes you'll get
a URL like `free-time-amali-s.vercel.app`.

### 4. Verify

Visit the URL and check:

- The page loads with the FreeTime header
- Granting geolocation routes you to a city if it's in the seed (e.g. Denver)
- The swipe deck shows real spaces with photos
- Searching cities returns matches
- `/api/spaces?city=denver-co` returns JSON with `total` and `spaces`

---

## Custom domain (optional)

In the Vercel project, go to **Settings → Domains** and add the domain you
own. Vercel walks you through the DNS records.

---

## How redeploys work

- Pushing to `main` triggers a **Production** deploy.
- Pushing to any other branch triggers a **Preview** deploy with its own URL.
- PRs get an automatic preview link in the PR comments.

---

## Troubleshooting

**Build fails with `DATABASE_URL is not set`**
The DB client now defers reading this env var until first request, so the
build itself shouldn't trip on it. If it does, double-check the variable is
applied to the **Production** environment in Vercel project settings.

**Build fails with ESLint errors**
Run `npx eslint .` locally first. The repo currently builds clean (0 errors,
4 non-blocking warnings). New errors block the build by default in Next 16.

**Pages load but show "Failed to load spaces"**
Open the deployed `/api/spaces?city=denver-co` URL directly. If it 500s,
your `DATABASE_URL` is wrong or your Supabase project is paused. Check
Vercel's **Logs → Runtime** for the underlying error.

**Geolocation shows "City not yet available"**
This is expected for cities not in the seed. The seed currently covers
Denver and Boulder. Add more cities to `scripts/seed.ts` and re-run
`npm run db:seed`.

**Vercel install fails on `@esbuild/darwin-arm64`**
This package is in `dependencies` for local Mac development but its `os`
field excludes Linux, so npm should skip it on Vercel. If install actually
fails, move it to `optionalDependencies` or remove it.

---

## GitHub Pages alternative (not recommended)

Possible only with significant rewrite:

1. Set `output: 'export'` and `basePath: '/free-time'` in `next.config.ts`.
2. Replace all three `/api/*` routes with build-time generated JSON files
   (run `scripts/seed.ts` data through a generator into `public/data/`).
3. Replace `useGeolocation`'s call to `/api/cities` and `/api/geocode` with
   direct browser calls to Nominatim (no proxy possible) and client-side
   matching against the bundled cities JSON.
4. Replace PostGIS `ST_Distance` proximity sort with client-side haversine.
5. Add `.github/workflows/deploy.yml` to publish `out/` to `gh-pages`.

You lose: live data, server-side filtering, image optimization, and the
ability to update spaces without rebuilding. You gain: zero infra cost.
