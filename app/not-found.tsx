import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        title="Page not found"
        hint="The page you’re looking for doesn’t exist."
        actionHref="/"
        actionLabel="Back to catalog"
      />
    </div>
  );
}
