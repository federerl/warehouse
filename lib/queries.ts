import { prisma } from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { PAGE_SIZE, type ProductFilters } from "@/lib/filters";
import type { CategoryView, Facet, ProductList, ProductView } from "@/lib/types";

const productInclude = {
  category: { select: { name: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toView(p: ProductRow): ProductView {
  return {
    id: p.id,
    partNumber: p.partNumber,
    otherPartNumber: p.otherPartNumber,
    otherPartNumber2: p.otherPartNumber2,
    categorySlug: p.categorySlug,
    categoryName: p.category?.name ?? null,
    selection1: p.selection1,
    type: p.type,
    series: p.series,
    pcPrice: p.pcPrice == null ? null : p.pcPrice.toNumber(),
    packQuantity: p.packQuantity,
    packQuantityNum: p.packQuantityNum,
    packPrice: p.packPrice == null ? null : p.packPrice.toNumber(),
    quantity: p.quantity,
    warnQuantity: p.warnQuantity,
    location: p.location,
    description: p.description,
    hasImage: p.hasImage,
  };
}

export async function getCategories(): Promise<CategoryView[]> {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    count: c._count.products,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryView | null> {
  const c = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    count: c._count.products,
  };
}

/** Distinct Type/Series values (with counts) available within a category. */
export async function getFacets(
  categorySlug: string,
): Promise<{ types: Facet[]; series: Facet[] }> {
  const [types, series] = await Promise.all([
    prisma.product.groupBy({
      by: ["type"],
      where: { categorySlug, type: { not: null } },
      _count: { _all: true },
      orderBy: { type: "asc" },
    }),
    prisma.product.groupBy({
      by: ["series"],
      where: { categorySlug, series: { not: null } },
      _count: { _all: true },
      orderBy: { series: "asc" },
    }),
  ]);
  return {
    types: types.map((t) => ({ value: t.type as string, count: t._count._all })),
    series: series.map((s) => ({ value: s.series as string, count: s._count._all })),
  };
}

function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];
  if (f.categorySlug) and.push({ categorySlug: f.categorySlug });
  if (f.types.length) and.push({ type: { in: f.types } });
  if (f.series.length) and.push({ series: { in: f.series } });
  if (f.stock === "in") and.push({ quantity: { gt: 0 } });
  if (f.stock === "out") and.push({ OR: [{ quantity: null }, { quantity: { lte: 0 } }] });
  if (f.minPrice != null) and.push({ pcPrice: { gte: f.minPrice } });
  if (f.maxPrice != null) and.push({ pcPrice: { lte: f.maxPrice } });
  if (f.q) {
    const contains = { contains: f.q, mode: "insensitive" as const };
    and.push({
      OR: [
        { partNumber: contains },
        { otherPartNumber: contains },
        { otherPartNumber2: contains },
        { description: contains },
        { type: contains },
        { series: contains },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

function buildOrderBy(f: ProductFilters): Prisma.ProductOrderByWithRelationInput[] {
  switch (f.sort) {
    case "price":
      return [{ pcPrice: { sort: f.dir, nulls: "last" } }, { partNumber: "asc" }];
    case "stock":
      return [{ quantity: { sort: f.dir, nulls: "last" } }, { partNumber: "asc" }];
    case "type":
      return [{ type: { sort: f.dir, nulls: "last" } }, { partNumber: "asc" }];
    default:
      return [{ partNumber: f.dir }];
  }
}

export async function getProducts(f: ProductFilters): Promise<ProductList> {
  const where = buildWhere(f);
  const page = Math.max(1, f.page);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(f),
      include: productInclude,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return {
    items: rows.map(toView),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
  };
}

export async function getProduct(id: string): Promise<ProductView | null> {
  const p = await prisma.product.findUnique({ where: { id }, include: productInclude });
  return p ? toView(p) : null;
}

/** Other parts in the same series (for the detail page), excluding the current one. */
export async function getRelatedProducts(
  product: ProductView,
  limit = 12,
): Promise<ProductView[]> {
  if (!product.series) return [];
  const rows = await prisma.product.findMany({
    where: {
      categorySlug: product.categorySlug,
      series: product.series,
      id: { not: product.id },
    },
    include: productInclude,
    orderBy: { partNumber: "asc" },
    take: limit,
  });
  return rows.map(toView);
}

export async function searchProducts(f: ProductFilters): Promise<ProductList> {
  return getProducts(f);
}
