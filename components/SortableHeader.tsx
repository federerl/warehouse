"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortKey } from "@/lib/filters";

export function SortableHeader({
  field,
  label,
  align = "left",
}: {
  field: SortKey;
  label: string;
  align?: "left" | "right";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const currentSort = (sp.get("sort") as SortKey) ?? "part";
  const currentDir = sp.get("dir") === "desc" ? "desc" : "asc";
  const active = currentSort === field;

  function onClick() {
    const params = new URLSearchParams(sp.toString());
    const nextDir = active && currentDir === "asc" ? "desc" : "asc";
    params.set("sort", field);
    params.set("dir", nextDir);
    if (field === "part") params.delete("sort"); // "part" asc is the default
    if (nextDir === "asc") params.delete("dir");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <th className={`px-3 py-2 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-semibold text-ink-muted hover:text-accent"
      >
        {label}
        <span
          aria-hidden
          className={`text-[10px] ${active ? "text-accent" : "text-rule-strong"}`}
        >
          {active ? (currentDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
