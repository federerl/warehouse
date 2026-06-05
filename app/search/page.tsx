import type { Metadata } from "next";
import { getProducts } from "@/lib/queries";
import { parseSearchParams, type SearchParams } from "@/lib/filters";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductTable } from "@/components/ProductTable";
import { Pagination } from "@/components/Pagination";
import { ResultCount } from "@/components/ResultCount";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = parseSearchParams(sp).q;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseSearchParams(sp);
  const q = filters.q;

  const list = q
    ? await getProducts(filters)
    : { items: [], total: 0, page: 1, pages: 1, pageSize: 50 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: q ? `Search “${q}”` : "Search" }]}
      />

      <div className="mt-3 max-w-xl">
        <SearchBar defaultValue={q ?? ""} autoFocus={!q} />
      </div>

      {!q ? (
        <p className="mt-6 text-sm text-ink-muted">
          Enter a part number, type, or series to search the catalog.
        </p>
      ) : list.total === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={`No parts match “${q}”`}
            hint="Check the spelling or try a broader term."
          />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <ResultCount total={list.total} page={list.page} pageSize={list.pageSize} />
          </div>
          <div className="mt-2">
            <ProductTable items={list.items} showCategory />
            <Pagination
              page={list.page}
              pages={list.pages}
              filters={filters}
              basePath="/search"
            />
          </div>
        </>
      )}
    </div>
  );
}
