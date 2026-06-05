import { getCategories } from "@/lib/queries";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";

export default async function HomePage() {
  const categories = await getCategories();
  const totalParts = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <section className="border-b border-rule bg-brand text-white">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Aerospace Hardware Catalog
          </h1>
          <p className="mt-2 text-white/80">
            {totalParts.toLocaleString()} parts across {categories.length} categories.
            Search a part number or browse below.
          </p>
          <div className="mx-auto mt-6 max-w-xl">
            <SearchBar autoFocus />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand">
          Browse categories
        </h2>
        <ul className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.slug} className="contents">
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
