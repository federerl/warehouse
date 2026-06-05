import Link from "next/link";
import type { CategoryView } from "@/lib/types";

export function CategoryCard({ category }: { category: CategoryView }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex h-full flex-col justify-between bg-surface p-4 transition-colors hover:bg-accent/5"
    >
      <span className="font-semibold text-ink group-hover:text-accent">{category.name}</span>
      <span className="mt-3 text-xs text-ink-muted">
        {category.count.toLocaleString()} {category.count === 1 ? "part" : "parts"}
      </span>
    </Link>
  );
}
