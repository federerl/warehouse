import Link from "next/link";
import type { ProductView } from "@/lib/types";
import { SortableHeader } from "@/components/SortableHeader";
import { PriceCell } from "@/components/PriceCell";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";

const td = "px-3 py-1.5 border-b border-rule align-top";
const thPlain = "px-3 py-2 text-left font-semibold text-ink-muted";

export function ProductTable({
  items,
  showCategory = false,
}: {
  items: ProductView[];
  showCategory?: boolean;
}) {
  return (
    <div className="overflow-x-auto border border-rule">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b-2 border-brand bg-surface-alt text-xs uppercase tracking-wide">
            <SortableHeader field="part" label="Part No." />
            <SortableHeader field="type" label="Type" />
            <th className={thPlain}>Series</th>
            {showCategory && <th className={thPlain}>Category</th>}
            <SortableHeader field="price" label="Price" align="right" />
            <SortableHeader field="stock" label="Availability" />
            <th className={thPlain}>Location</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="hover:bg-accent/5">
              <td className={td}>
                <Link
                  href={`/product/${p.id}`}
                  className="font-mono text-accent hover:text-accent-hover hover:underline"
                >
                  {p.partNumber}
                </Link>
                {p.description && (
                  <div className="text-xs text-ink-muted">{p.description}</div>
                )}
              </td>
              <td className={td}>{p.type ?? "—"}</td>
              <td className={td}>{p.series ?? "—"}</td>
              {showCategory && (
                <td className={td}>
                  <Link
                    href={`/category/${p.categorySlug}`}
                    className="text-accent hover:underline"
                  >
                    {p.categoryName ?? "—"}
                  </Link>
                </td>
              )}
              <td className={`${td} text-right tabular-nums`}>
                <PriceCell
                  pcPrice={p.pcPrice}
                  packPrice={p.packPrice}
                  packQuantity={p.packQuantity}
                />
              </td>
              <td className={td}>
                <AvailabilityBadge quantity={p.quantity} warnQuantity={p.warnQuantity} />
              </td>
              <td className={`${td} text-ink-muted`}>{p.location ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
