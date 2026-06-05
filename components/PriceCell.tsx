import { money } from "@/lib/format";

export function PriceCell({
  pcPrice,
  packPrice,
  packQuantity,
}: {
  pcPrice: number | null;
  packPrice: number | null;
  packQuantity: string | null;
}) {
  if (pcPrice == null && packPrice == null) {
    return <span className="text-ink-muted">—</span>;
  }
  return (
    <div className="leading-tight">
      {pcPrice != null && (
        <div>
          {money(pcPrice)}
          <span className="text-ink-muted"> ea</span>
        </div>
      )}
      {packPrice != null && (
        <div className="text-xs text-ink-muted">
          {money(packPrice)}
          {packQuantity ? ` / ${packQuantity}` : " / pack"}
        </div>
      )}
    </div>
  );
}
