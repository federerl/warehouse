import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-hover bg-brand text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 whitespace-nowrap font-semibold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-white/15 text-sm font-bold">
            A
          </span>
          <span className="text-lg">AeroStock</span>
        </Link>
        <div className="flex-1">
          <SearchBar />
        </div>
        <Link href="/" className="hidden text-sm text-white/80 hover:text-white sm:block">
          Catalog
        </Link>
      </div>
    </header>
  );
}
