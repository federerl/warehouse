"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Facet } from "@/lib/types";

export function FilterRail({
  facets,
}: {
  facets: { types: Facet[]; series: Facet[] };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const activeTypes = sp.getAll("type");
  const activeSeries = sp.getAll("series");
  const activeStock = sp.get("stock") ?? "";

  const [minPrice, setMinPrice] = useState(sp.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");

  function push(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(sp.toString());
    mutate(params);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleMulti(key: string, value: string) {
    push((params) => {
      const all = params.getAll(key);
      params.delete(key);
      const next = all.includes(value)
        ? all.filter((v) => v !== value)
        : [...all, value];
      next.forEach((v) => params.append(key, v));
    });
  }

  function setStock(value: string) {
    push((params) => {
      if (value) params.set("stock", value);
      else params.delete("stock");
    });
  }

  function applyPrice() {
    push((params) => {
      if (minPrice.trim()) params.set("minPrice", minPrice.trim());
      else params.delete("minPrice");
      if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
      else params.delete("maxPrice");
    });
  }

  const hasFilters =
    activeTypes.length > 0 ||
    activeSeries.length > 0 ||
    !!activeStock ||
    !!sp.get("minPrice") ||
    !!sp.get("maxPrice");

  return (
    <aside className="text-sm" aria-label="Filters">
      <div className="flex items-center justify-between pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Filters</p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="text-xs font-medium text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <Section title="Availability">
        {[
          { v: "", label: "All" },
          { v: "in", label: "In stock" },
          { v: "out", label: "Out of stock" },
        ].map((opt) => (
          <label key={opt.v} className="flex cursor-pointer items-center gap-2 py-0.5">
            <input
              type="radio"
              name="stock"
              checked={activeStock === opt.v}
              onChange={() => setStock(opt.v)}
              className="accent-accent"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </Section>

      <Section title="Price (per piece)">
        <div className="flex items-center gap-2 py-1">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-20 rounded-sm border border-rule px-2 py-1 text-sm focus:border-accent focus:outline-none"
          />
          <span className="text-ink-muted">–</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-20 rounded-sm border border-rule px-2 py-1 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={applyPrice}
            className="rounded-sm bg-brand px-2 py-1 text-xs font-medium text-white hover:bg-brand-hover"
          >
            Go
          </button>
        </div>
      </Section>

      {facets.types.length > 0 && (
        <Section title="Type">
          <FacetList facets={facets.types} active={activeTypes} onToggle={(v) => toggleMulti("type", v)} />
        </Section>
      )}

      {facets.series.length > 0 && (
        <Section title="Series">
          <FacetList facets={facets.series} active={activeSeries} onToggle={(v) => toggleMulti("series", v)} />
        </Section>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule py-3">
      <p className="pb-1 font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

function FacetList({
  facets,
  active,
  onToggle,
}: {
  facets: Facet[];
  active: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
      {facets.map((f) => (
        <label key={f.value} className="flex cursor-pointer items-center justify-between gap-2 py-0.5">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active.includes(f.value)}
              onChange={() => onToggle(f.value)}
              className="accent-accent"
            />
            <span>{f.value}</span>
          </span>
          <span className="text-xs text-ink-muted">{f.count}</span>
        </label>
      ))}
    </div>
  );
}
