export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6">
      <div className="h-4 w-40 bg-rule" />
      <div className="mt-3 h-10 w-full max-w-xl bg-rule" />
      <div className="mt-6 border border-rule">
        <div className="h-9 bg-surface-alt" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-8 border-b border-rule" />
        ))}
      </div>
    </div>
  );
}
