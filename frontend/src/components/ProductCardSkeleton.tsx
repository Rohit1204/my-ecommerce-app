export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card">
      <div className="aspect-[4/5] animate-pulse bg-gradient-to-b from-zinc-100 to-zinc-50" />
      <div className="space-y-3 border-t border-zinc-100 p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-[85%] animate-pulse rounded bg-zinc-100" />
        <div className="flex justify-between pt-2">
          <div className="h-8 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
