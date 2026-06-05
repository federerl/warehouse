import type { Availability } from "@/lib/types";

/** Format a price as USD, or an em dash when unknown. */
export function money(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

/** Group-separated integer, or em dash when unknown. */
export function number(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/** Derive stock status from on-hand quantity vs. the reorder threshold. */
export function availability(
  quantity: number | null | undefined,
  warnQuantity: number | null | undefined,
): Availability {
  if (quantity == null || quantity <= 0) return "out";
  if (warnQuantity != null && quantity <= warnQuantity) return "low";
  return "in";
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
};
