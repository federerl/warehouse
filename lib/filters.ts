/**
 * URL <-> filter-state translation. Pure (no framework imports) so both server
 * components (parsing `searchParams`) and client components (building links)
 * share one source of truth for the catalog's query string.
 */

export const PAGE_SIZE = 50;

export type SortKey = "part" | "price" | "stock" | "type";
export type SortDir = "asc" | "desc";
export type StockFilter = "in" | "out";

export const SORT_KEYS: SortKey[] = ["part", "price", "stock", "type"];

export type ProductFilters = {
  categorySlug?: string;
  q?: string;
  types: string[];
  series: string[];
  stock?: StockFilter;
  minPrice?: number;
  maxPrice?: number;
  sort: SortKey;
  dir: SortDir;
  page: number;
};

/** Shape Next.js resolves `searchParams` into. */
export type SearchParams = Record<string, string | string[] | undefined>;

function asArray(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function first(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = first(v);
  if (s == null || s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function parseSearchParams(
  sp: SearchParams,
  opts: { categorySlug?: string } = {},
): ProductFilters {
  const sortRaw = first(sp.sort) as SortKey | undefined;
  const sort: SortKey = sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : "part";
  const dir: SortDir = first(sp.dir) === "desc" ? "desc" : "asc";
  const stockRaw = first(sp.stock);
  const stock: StockFilter | undefined =
    stockRaw === "in" || stockRaw === "out" ? stockRaw : undefined;
  const pageRaw = num(sp.page);
  const q = first(sp.q)?.trim() || undefined;

  return {
    categorySlug: opts.categorySlug,
    q,
    types: asArray(sp.type),
    series: asArray(sp.series),
    stock,
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    sort,
    dir,
    page: pageRaw && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
  };
}

/** Serialize filters back to a query string (omits defaults and the path-bound slug). */
export function buildQueryString(filters: Partial<ProductFilters>): string {
  const p = new URLSearchParams();
  (filters.types ?? []).forEach((t) => p.append("type", t));
  (filters.series ?? []).forEach((s) => p.append("series", s));
  if (filters.q) p.set("q", filters.q);
  if (filters.stock) p.set("stock", filters.stock);
  if (filters.minPrice != null) p.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) p.set("maxPrice", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "part") p.set("sort", filters.sort);
  if (filters.dir && filters.dir !== "asc") p.set("dir", filters.dir);
  if (filters.page && filters.page > 1) p.set("page", String(filters.page));
  return p.toString();
}
