"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-lg font-semibold text-ink">Something went wrong</p>
      <p className="mt-1 text-sm text-ink-muted">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-block rounded-sm bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
      >
        Try again
      </button>
    </div>
  );
}
