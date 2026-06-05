import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getFacets, getProducts } from "@/lib/queries";
import { parseSearchParams, type SearchParams } from "@/lib/filters";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FilterRail } from "@/components/FilterRail";
import { ProductTable } from "@/components/ProductTable";
import { Pagination } from "@/components/Pagination";
import { ResultCount } from "@/components/ResultCount";
import { EmptyState } from "@/components/EmptyState";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? category.name : "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const filters = parseSearchParams(sp, { categorySlug: slug });
  const [list, facets] = await Promise.all([getProducts(filters), getFacets(slug)]);

  const basePath = `/category/${slug}`;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>
        <ResultCount total={list.total} page={list.page} pageSize={list.pageSize} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[210px_1fr]">
        <FilterRail facets={facets} />
        <div className="min-w-0">
          {list.items.length === 0 ? (
            <EmptyState
              title="No parts match these filters"
              hint="Try removing a filter or widening the price range."
              actionHref={basePath}
              actionLabel="Clear filters"
            />
          ) : (
            <>
              <ProductTable items={list.items} />
              <Pagination
                page={list.page}
                pages={list.pages}
                filters={filters}
                basePath={basePath}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
