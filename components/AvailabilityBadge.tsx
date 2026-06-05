import { availability, AVAILABILITY_LABEL } from "@/lib/format";

const COLOR = {
  in: "text-instock",
  low: "text-low",
  out: "text-out",
} as const;

export function AvailabilityBadge({
  quantity,
  warnQuantity,
}: {
  quantity: number | null;
  warnQuantity: number | null;
}) {
  const state = availability(quantity, warnQuantity);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${COLOR[state]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {AVAILABILITY_LABEL[state]}
    </span>
  );
}
