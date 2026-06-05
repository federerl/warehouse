import type { ProductView } from "@/lib/types";
import { money, number } from "@/lib/format";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value == null || value === "";
  return (
    <div className="grid grid-cols-[140px_1fr] border-b border-rule last:border-b-0">
      <dt className="bg-surface-alt px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
      <dd className={`px-3 py-2 ${empty ? "text-ink-muted" : "text-ink"}`}>
        {empty ? "—" : value}
      </dd>
    </div>
  );
}

export function SpecSheet({ product }: { product: ProductView }) {
  return (
    <dl className="border border-rule">
      <Row label="Part number" value={<span className="font-mono">{product.partNumber}</span>} />
      <Row label="Other part #" value={product.otherPartNumber} />
      {product.otherPartNumber2 && (
        <Row label="Other part #" value={product.otherPartNumber2} />
      )}
      <Row label="Category" value={product.categoryName ?? product.selection1} />
      <Row label="Type" value={product.type} />
      <Row label="Series" value={product.series} />
      <Row label="Description" value={product.description} />
      <Row label="Per-piece price" value={product.pcPrice == null ? null : money(product.pcPrice)} />
      <Row label="Pack quantity" value={product.packQuantity} />
      <Row label="Pack price" value={product.packPrice == null ? null : money(product.packPrice)} />
      <Row label="On hand" value={product.quantity == null ? null : number(product.quantity)} />
      <Row label="Reorder at" value={product.warnQuantity == null ? null : number(product.warnQuantity)} />
      <Row label="Location" value={product.location} />
    </dl>
  );
}
