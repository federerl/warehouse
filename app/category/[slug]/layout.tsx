import { getCategories } from "@/lib/queries";
import { CategorySidebar } from "@/components/CategorySidebar";

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <div className="hidden md:block">
          <CategorySidebar categories={categories} activeSlug={slug} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
