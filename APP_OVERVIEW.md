# RadiatorRepairHub — Application Overview

This document summarizes what the project is, what users can do on the site, and how the implementation is structured. It is based on a review of the `client` and `server` codebases.

## What the project is

**RadiatorRepairHub** is a public **directory and discovery website** for automotive radiator repair and related auto services. It helps visitors find shops by location, category, and search filters (ratings, reviews, amenities, hours), view rich **business detail pages** (including maps), and reach businesses through contact flows. The product is optimized for **SEO** (metadata, FAQ content, sitemap, robots) and is intended to run on **Vercel** for the frontend with a separate **Node/Express API** backed by **Supabase** (PostgreSQL) and **Redis** caching.

The repository is a **two-package** layout (no root `package.json` workspace):

| Package | Role |
|--------|------|
| `client/` | Next.js App Router UI (React 19, Next 16) |
| `server/` | REST API (Express 5, ESM) |

---

## User-facing features

- **Home** — Hero, featured businesses, categories, popular locations, how-it-works, trust content, contact teaser, and FAQ block tuned for radiator-repair search intent.
- **Search** — POST-based business search with pagination; filters include title, state/city/postal, score and review thresholds, primary/secondary categories, boolean **feature** flags (e.g. appointments, cards, wheelchair access), **sort** options (by reviews/score), and **open** hours hints (weekdays/weekends). Implemented via `ListingsWrapper` + SWR calling the API.
- **Featured listings** — Curated “top rated” style list from `/businesses/featured` (server applies minimum review count and score ordering).
- **Browse by geography** — States list, cities within a state, and city-level business listings using dynamic routes under `state/[state]`, `state/[state]/city/[city]`, and `states/...` variants with dedicated not-found pages.
- **Categories** — Index at `/categories` and per-category pages at `/category/[slug]` that drive the same search/listing experience filtered by category.
- **Business detail** — `/business/[slug]` with server-side data fetch, structured presentation, and **Google Maps** embed (requires `GOOGLE_MAPS_API_KEY`).
- **Marketing / legal** — About, FAQ, Contact (EmailJS), Get listed, Privacy, Terms; **maintenance** page exists at `/maintenance`.
- **Analytics & verification** — Optional Google Analytics (layout injects gtag when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set) and Search Console verification id.

---

## Technical implementation

### Frontend (`client/`)

- **Framework:** Next.js 16 with **App Router** (`src/app/`), **Turbopack** in dev (`next dev --turbopack`).
- **Styling:** Tailwind CSS v4, custom `globals.css`, **Google fonts** (Inter, Oswald) via `next/font`.
- **Data fetching:** Mix of **server** `fetch` (e.g. business page metadata and main content using `API_URI`) and **client** `fetch` / **SWR** for listings (`NEXT_PUBLIC_API_URI`). Custom fetch helpers live under `src/lib/utils/utils.js`.
- **UI libraries:** `framer-motion`, `lucide-react`, `sonner` toasts, `@emailjs/browser` for the contact form.
- **SEO:** Central `metadata` and `viewport` in `src/app/layout.js`; dynamic `sitemap.xml` and `robots.txt` route handlers; `next-sitemap` in dependencies for sitemap-related workflows.
- **Security headers:** Duplicated sensible defaults in `next.config.mjs` and `vercel.json` (frame options, referrer policy, permissions policy, cache headers for static discovery URLs).
- **Images:** `next/image` configured for Google user content and Street View hostnames.

**Note:** `client/src/proxy.js` exports a `proxy` function that would redirect to `/maintenance` when `MAINTENANCE_MODE === "true"`, but it is **not referenced** as Next.js middleware (`middleware.js`/`middleware.ts` is absent). To use maintenance redirects, that logic would need to be wired into a proper Next.js middleware entrypoint.

### Backend (`server/`)

- **Runtime:** Node with **ES modules** (`"type": "module"`), entry `src/index.js`.
- **HTTP:** Express 5, `http.createServer`, **Helmet**, **CORS** (localhost in dev, `WEB_URL` in production), JSON body parsing, **morgan** in development, **trust proxy** in production.
- **API layout:** Versioned prefix: `/v${API_VERSION}/api/...` with routers:
  - **`/businesses`** — `GET /featured`, `GET /:business_slug`, `POST /search` (query: `page`, `limit`; body validated with **Yup**). Older state/city GET routes exist in the file as commented **deprecated** code.
  - **`/location`** — `GET /states`, `GET /states/:state_id/cities`, `GET /cities/:city_id/postal-codes`.
  - **`/categories`** — `GET /primary`, `GET /secondary`.
- **Data layer:** **Supabase JS client** (`src/supabase/`) performs queries against tables such as `businesses`, `states`, `cities`, `postal_codes`, `primary_categories`, `secondary_categories` (via join tables), `business_features`, `business_hours`, etc. Responses are normalized in `supabase.functions.js` (e.g. flattening `features`, stripping internal ids).
- **Caching:** **ioredis** stores JSON payloads with TTLs; keys for featured businesses, single business by slug, search results, states, cities, postal codes, categories (see `src/redis/redis.js`). Development uses `DEV_` key prefix and shorter TTL helper.
- **Protection:** **Arcjet** (`src/middleware/arcjet.mw.js`) — shield, bot detection (search engines allowed; Postman allowed in dev), token-bucket rate limiting; applied to routes **after** the health `/` route.
- **Validation:** `paramsValidator`, `queryValidator`, `bodyValidator` in `src/middleware/validators.js` wired to Yup schemas.
- **Errors:** Consistent JSON error/success helpers in `customErrorHandler.js` and async wrappers in `wrappers.js`.
- **Auth middleware:** `src/middleware/auth.mw.js` implements Bearer-token verification via Supabase auth helpers, but **no route currently imports it** — likely reserved for future authenticated endpoints.

---

## Environment variables (high level)

**Server** (typical): `NODE_ENV`, `PORT`, `API_VERSION`, `WEB_URL`, Supabase URL/key, Redis host/port/password, `ARCJET_KEY`.

**Client** (see also `client/DEPLOYMENT.md`): `API_URI` and `NEXT_PUBLIC_API_URI` (base URL including versioned `/api` segment as deployed), `BUSINESS_EMAIL`, `WEB_URL`, `GOOGLE_MAPS_API_KEY`, EmailJS public keys, optional `GOOGLE_VERIFICATION_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, optional `MAINTENANCE_MODE` if middleware is added.

---

## Local development (quick reference)

From each package directory:

```bash
cd client && npm install && npm run dev
```

```bash
cd server && npm install && npm run server   # nodemon
# or: npm start
```

Ensure the API is reachable at the URLs configured in the client env vars, Redis and Supabase are provisioned, and Arcjet/EmailJS/Maps keys are set where those features are exercised.

---

## Summary

RadiatorRepairHub pairs a **content- and SEO-oriented Next.js frontend** with a **versioned Express API** that reads directory data from **Supabase**, accelerates hot paths with **Redis**, and gates abuse with **Arcjet**. The core product loop is: **discover** (home, geography, categories) → **filter** (search POST) → **evaluate** (business detail + map) → **contact** (email, EmailJS, mailto).

For deployment-specific steps and env var names, `client/DEPLOYMENT.md` remains the operational companion to this overview.
