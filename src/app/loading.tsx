export default function Loading() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 lg:px-6" aria-busy>
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[2/3] animate-pulse rounded-[3px] bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
