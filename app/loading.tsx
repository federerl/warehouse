export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
      <div className="h-32 w-full bg-rule" />
      <div className="mt-8 grid grid-cols-2 gap-px bg-rule sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}
