# AeroStock — Project Overview

An internal **aerospace hardware catalog** (styled after mcmaster.com): a dense,
fast, table-first browser over the shop's parts inventory. The data starts in
`inventory.xlsx` and is imported into **Postgres**; the website reads only from
Postgres. This is a **read-only catalog** for now, architected so an admin
CRUD layer can be added later without rework.

- **Stack:** Next.js 16.2.7 (App Router, Server Components) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7.8 · Postgres
- **Data:** 13 categories, **~1,872 parts** imported from the 13 named tabs of `inventory.xlsx`
- **Palette:** neutral corporate (slate primary, blue accent); semantic green/amber/red for stock status

---

## 1. The database system

### What it is
The app uses **Prisma 7** as the ORM against a **plain local PostgreSQL** instance
(localhost:5432). Each developer runs their own Postgres and a dedicated project
database/role:

```sql
CREATE USER warehouse WITH PASSWORD 'warehouse' CREATEDB;  -- CREATEDB lets Migrate make its shadow DB
CREATE DATABASE warehouse OWNER warehouse;
```

`.env` then holds a standard direct connection string:

```
DATABASE_URL="postgresql://warehouse:warehouse@localhost:5432/warehouse?schema=public"
```

> A plain `postgres://` URL is what makes real migrations, Studio, and psql all
> work with no proxy, no extra ports, and no `sslmode` workarounds. (An earlier
> iteration used the `npx prisma dev` proxy server; its `prisma+postgres://` URL
> broke `prisma migrate` and is kept commented-out in `.env` for reference only.)

### How the app connects (Prisma 7 specifics)
- **The connection URL is NOT in `schema.prisma`.** Prisma 7 forbids `url` in the
  datasource block. The URL lives in `prisma.config.ts` for CLI commands
  (migrate/studio), loaded from `.env` via `import "dotenv/config"`.
- **The runtime client uses the `@prisma/adapter-pg` driver adapter** (Prisma 7's
  connection model). `lib/pg-url.ts` passes a plain `postgres://` URL straight
  through (it also still decodes a legacy `prisma+postgres://` URL if one is set).
- **Schema sync uses real migrations** — `prisma migrate dev` to create them and
  `prisma migrate deploy` to apply them. History lives in `prisma/migrations/`
  (baselined as `0_init`).

### The schema (`prisma/schema.prisma`)
Two tables — a thin category lookup plus a flat, denormalized product table
(fast to filter/search, easy to extend with admin CRUD later):

| Model | Key fields |
|-------|-----------|
| **Category** | `id`, `name`, `slug` (unique), `sortOrder`, `_count.products` |
| **Product** | `id` (cuid), `partNumber`, `otherPartNumber`/`2`, `categorySlug` (indexed), `selection1` (category), `type`, `series`, `pcPrice`/`packPrice` (Decimal), `packQuantity` (raw text) + `packQuantityNum`, `quantity`, `warnQuantity`, `location`, `description`, `hasImage` |

Indexes on `categorySlug`, `(categorySlug, type)`, `(categorySlug, type, series)`,
and `partNumber` cover the browse/filter/search paths.

### The import (`prisma/seed.ts`)
Reads `inventory.xlsx` with `exceljs` and imports **only the 13 named category
tabs** (the synthetic ~15k-row "Sheet1" is intentionally skipped). It coerces
types on the way in:
- prices → `Decimal`; blanks → `null`
- `packQuantity` kept as raw text (`"1/8 LB"`), with `packQuantityNum` parsed only
  when the value is a clean integer (`"25"` → 25, `"1/8 LB"` → null)
- `quantity` / `warnQuantity` → integers; the "has picture" flag → `hasImage` boolean
- Unicode (e.g. `100°`) preserved

It's idempotent: it upserts the 13 categories and fully replaces the products.

---

## 2. High-level changes (what was added / modified)

### Database & data layer
- **`prisma/schema.prisma`** — added `Category` and `Product` models.
- **`prisma.config.ts`** — added `migrations.seed` and kept the datasource URL here (Prisma 7 requirement).
- **`prisma/seed.ts`** *(new)* — the xlsx → Postgres importer.
- **`lib/db.ts`** *(new)* — HMR-safe `PrismaClient` singleton using the pg driver adapter.
- **`lib/pg-url.ts`** *(new)* — derives the direct TCP URL from the `prisma+postgres` URL.
- **`lib/queries.ts`** *(new)* — all data access: `getCategories`, `getCategoryBySlug`, `getProducts(filters)`, `getFacets`, `getProduct`, `getRelatedProducts`, `searchProducts`.
- **`lib/types.ts`** *(new)* — plain serializable view types (Decimals → numbers, etc.).
- **`lib/format.ts`** *(new)* — `money()`, `number()`, and `availability()` (in/low/out) helpers.
- **`lib/filters.ts`** *(new)* — URL ⇄ filter-state translation (shared by server + client).

### Pages (`app/`)
- **`app/layout.tsx`** — replaced boilerplate: site header (with search) + footer, metadata.
- **`app/globals.css`** — neutral-corporate Tailwind 4 theme tokens; dark mode removed.
- **`app/page.tsx`** — home: hero search + 13-category grid.
- **`app/category/[slug]/`** — `layout.tsx` (persistent category sidebar) + `page.tsx` (the core: filter rail + sortable dense product table + pagination) + `loading.tsx` + `not-found.tsx`.
- **`app/product/[id]/`** — `page.tsx` (spec sheet + price/availability block + "others in series") + `loading.tsx` + `not-found.tsx`.
- **`app/search/`** — `page.tsx` (cross-category results, reuses the table) + `loading.tsx`.
- **`app/loading.tsx`, `app/not-found.tsx`, `app/error.tsx`** — global states.

### Components (`components/`) — all new
`SiteHeader`, `SearchBar` (client), `SiteFooter`, `CategorySidebar`, `Breadcrumbs`,
`CategoryCard`, `ProductTable`, `SortableHeader` (client), `FilterRail` (client),
`Pagination`, `AvailabilityBadge`, `PriceCell`, `ResultCount`, `SpecSheet`, `EmptyState`.

Filtering/sorting/paging are **URL-driven**: client components only rewrite the
query string; server components re-query Postgres. Minimal client JS.

### Tooling
- Added dev deps: `exceljs`, `tsx`. Added runtime deps: `@prisma/adapter-pg`, `pg`.
- `package.json` scripts: `seed`, `db:seed`, `postinstall` (`prisma generate`).

---

## 3. Running the app

Postgres runs as a background service (it starts with your machine), so day to
day you just run the site:

```bash
npm run dev          # http://localhost:3000
```

First-time setup (after creating the `warehouse` role + database — see §1):

```bash
npm run db:deploy    # apply migrations  (prisma migrate deploy)
npm run seed         # import inventory.xlsx  (or: npx prisma db seed)
```

When you change `schema.prisma`, create a migration instead of pushing:

```bash
npm run db:migrate   # prisma migrate dev — generates + applies a new migration
```

> `npm run build` prerenders the home page, so Postgres must be running during a
> build (it normally is, as a service).

---

## 4. How to check the Postgres database

### Option A — Prisma Studio (easiest, GUI in the browser)
```bash
npm run db:studio    # or: npx prisma studio
```
Opens a table browser (usually http://localhost:5555) where you can view/edit
`Category` and `Product` rows, filter, and sort.

### Option B — any SQL client / `psql`
Connect with the project credentials:

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| User | `warehouse` |
| Password | `warehouse` |
| Database | `warehouse` |

```bash
psql "postgresql://warehouse:warehouse@localhost:5432/warehouse"
```
Then, for example:
```sql
\dt                                            -- list tables
SELECT COUNT(*) FROM "Product";                -- 1872
SELECT name, slug FROM "Category" ORDER BY "sortOrder";
SELECT "partNumber","type","pcPrice","quantity"
  FROM "Product" WHERE "categorySlug" = 'bolts' LIMIT 10;
```
Works the same in GUI tools (DBeaver, TablePlus, pgAdmin) using the fields above.

### Option C — quick one-off query script
Create a throwaway `prisma/check.ts` that imports the client the same way
`prisma/seed.ts` does, then `npx tsx prisma/check.ts`.

---

## 5. Known caveats / future work
- **Soft 404s:** `notFound()` renders the correct "not found" page but currently returns HTTP 200 (not 404) in this Next 16 setup.
- **Migrations** live in `prisma/migrations/` (`0_init` baseline). Use `npm run db:migrate` for schema changes; teammates/CI apply with `npm run db:deploy`.
- **No caching directives** (`'use cache'`) yet — added alongside the future admin write path so `revalidateTag` can invalidate reads.
- **Admin CRUD** is out of scope for now; the architecture reserves `/admin` + Server Actions for it.
- **No product images** (by design) — the catalog is table-only; `hasImage` is stored for future use.
