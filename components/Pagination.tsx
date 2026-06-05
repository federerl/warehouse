import Link from "next/link";
import { buildQueryString, type ProductFilters } from "@/lib/filters";

/** Build a window of page numbers with ellipses: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const add = (n: number) => out.push(n);
  const span = 1;
  const lo = Math.max(2, current - span);
  const hi = Math.min(total - 1, current + span);
  add(1);
  if (lo > 2) out.push("…");
  for (let n = lo; n <= hi; n++) add(n);
  if (hi < total - 1) out.push("…");
  if (total > 1) add(total);
  return out;
}

export function Pagination({
  page,
  pages,
  filters,
  basePath,
}: {
  page: number;
  pages: number;
  filters: ProductFilters;
  basePath: string;
}) {
  if (pages <= 1) return null;

  const href = (n: number) => {
    const qs = buildQueryString({ ...filters, page: n });
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkBase =
    "inline-flex h-8 min-w-8 items-center justify-center border border-rule px-2 text-sm hover:border-accent hover:text-accent";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center gap-1">
      <Link
        href={href(page - 1)}
        aria-label="Previous page"
        className={`${linkBase} ${page <= 1 ? disabled : ""}`}
      >
        Prev
      </Link>
      {pageWindow(page, pages).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${linkBase} ${
              n === page ? "border-brand bg-brand font-semibold text-white hover:text-white" : ""
            }`}
          >
            {n}
          </Link>
        ),
      )}
      <Link
        href={href(page + 1)}
        aria-label="Next page"
        className={`${linkBase} ${page >= pages ? disabled : ""}`}
      >
        Next
      </Link>
    </nav>
  );
}
