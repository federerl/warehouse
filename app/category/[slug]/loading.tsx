export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-40 bg-rule" />
      <div className="mt-3 h-7 w-48 bg-rule" />
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[210px_1fr]">
        <div className="hidden space-y-2 lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 w-full bg-rule" />
          ))}
        </div>
        <div className="border border-rule">
          <div className="h-9 bg-surface-alt" />
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-8 border-b border-rule" />
          ))}
        </div>
      </div>
    </div>
  );
}
