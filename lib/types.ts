/**
 * Plain, fully-serializable view types used across server and client components.
 * Prisma returns `Decimal`/`Date` objects that don't cross the server→client
 * boundary cleanly, so queries map rows into these primitives.
 */

export type CategoryView = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  count: number;
};

export type ProductView = {
  id: string;
  partNumber: string;
  otherPartNumber: string | null;
  otherPartNumber2: string | null;
  categorySlug: string;
  categoryName: string | null;
  selection1: string;
  type: string | null;
  series: string | null;
  pcPrice: number | null;
  packQuantity: string | null;
  packQuantityNum: number | null;
  packPrice: number | null;
  quantity: number | null;
  warnQuantity: number | null;
  location: string | null;
  description: string | null;
  hasImage: boolean;
};

export type Facet = { value: string; count: number };

export type ProductList = {
  items: ProductView[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
};

export type Availability = "in" | "low" | "out";
