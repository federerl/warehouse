export function ResultCount({
  total,
  page,
  pageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
}) {
  if (total === 0) {
    return <p className="text-sm text-ink-muted">No parts found</p>;
  }
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <p className="text-sm text-ink-muted">
      Showing <span className="font-medium text-ink">{from.toLocaleString()}</span>–
      <span className="font-medium text-ink">{to.toLocaleString()}</span> of{" "}
      <span className="font-medium text-ink">{total.toLocaleString()}</span> parts
    </p>
  );
}
