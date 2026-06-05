import { EmptyState } from "@/components/EmptyState";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <EmptyState
        title="Part not found"
        hint="That part isn’t in the catalog."
        actionHref="/"
        actionLabel="Back to catalog"
      />
    </div>
  );
}
