import { EmptyState } from "@/components/EmptyState";

export default function CategoryNotFound() {
  return (
    <EmptyState
      title="Category not found"
      hint="That category doesn’t exist in the catalog."
      actionHref="/"
      actionLabel="Back to catalog"
    />
  );
}
