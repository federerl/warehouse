import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/queries";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SpecSheet } from "@/components/SpecSheet";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { money, number } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Part not found" };
  const desc =
    product.description ?? `${product.selection1}${product.series ? ` · ${product.series}` : ""}`;
  return { title: product.partNumber, description: desc };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          {
            label: product.categoryName ?? product.selection1,
            href: `/category/${product.categorySlug}`,
          },
          ...(product.type ? [{ label: product.type }] : []),
          { label: product.partNumber },
        ]}
      />

      <div className="mt-2">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">{product.partNumber}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {[product.selection1, product.type, product.series].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
        <section aria-label="Specifications">
          <SpecSheet product={product} />
        </section>

        <aside aria-label="Pricing and availability" className="space-y-4 md:order-last">
          <div className="border border-rule p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {product.pcPrice == null ? "—" : money(product.pcPrice)}
              </span>
              {product.pcPrice != null && <span className="text-sm text-ink-muted">per piece</span>}
            </div>
            {product.packPrice != null && (
              <p className="mt-1 text-sm text-ink-muted">
                {money(product.packPrice)}
                {product.packQuantity ? ` per pack of ${product.packQuantity}` : " per pack"}
              </p>
            )}
            <div className="mt-3 border-t border-rule pt-3">
              <AvailabilityBadge
                quantity={product.quantity}
                warnQuantity={product.warnQuantity}
              />
              {product.quantity != null && (
                <p className="mt-1 text-xs text-ink-muted">
                  {number(product.quantity)} on hand
                </p>
              )}
            </div>
            {product.location && (
              <p className="mt-3 border-t border-rule pt-3 text-sm">
                <span className="text-ink-muted">Location: </span>
                <span className="font-medium">{product.location}</span>
              </p>
            )}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-8" aria-label="Others in this series">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand">
            Others in series {product.series}
          </h2>
          <ul className="divide-y divide-rule border border-rule">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/product/${r.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent/5"
                >
                  <span className="font-mono text-accent">{r.partNumber}</span>
                  <span className="flex items-center gap-4">
                    <span className="tabular-nums text-ink-muted">
                      {r.pcPrice == null ? "" : money(r.pcPrice)}
                    </span>
                    <AvailabilityBadge quantity={r.quantity} warnQuantity={r.warnQuantity} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
