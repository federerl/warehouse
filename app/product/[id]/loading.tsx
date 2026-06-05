export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6">
      <div className="h-4 w-56 bg-rule" />
      <div className="mt-3 h-8 w-48 bg-rule" />
      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-px border border-rule">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 border-b border-rule" />
          ))}
        </div>
        <div className="h-40 border border-rule" />
      </div>
    </div>
  );
}
