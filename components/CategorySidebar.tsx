import Link from "next/link";
import type { CategoryView } from "@/lib/types";

export function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: CategoryView[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Categories" className="text-sm">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Categories
      </p>
      <ul>
        {categories.map((c) => {
          const active = c.slug === activeSlug;
          return (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between border-l-2 px-3 py-1.5 ${
                  active
                    ? "border-accent bg-accent/5 font-semibold text-accent"
                    : "border-transparent text-ink hover:bg-surface-alt hover:text-accent"
                }`}
              >
                <span>{c.name}</span>
                <span className="text-xs text-ink-muted">{c.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
