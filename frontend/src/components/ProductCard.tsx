import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const showTrending = product.id % 3 === 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card ring-0 ring-transparent transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-card-hover hover:ring-2 hover:ring-brand/10">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden bg-gradient-to-b from-zinc-50 via-white to-zinc-50/50"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.product_name}
            fill
            className="object-contain p-4 transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs font-medium text-zinc-400">
            No image
          </span>
        )}
        <span className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-700 shadow-md backdrop-blur-sm">
          {product.category}
        </span>
        {showTrending ? (
          <span className="absolute right-3 top-3 rounded-lg bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
            Hot
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 border-t border-zinc-100/80 bg-gradient-to-b from-white to-zinc-50/30 p-4 pt-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="text-amber-500" aria-hidden>
            ★★★★
          </span>
          <span className="font-semibold text-zinc-600">4.{(product.id % 9) + 1}</span>
          <span className="text-zinc-400">· demo</span>
        </div>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug tracking-tight text-zinc-900">
          {product.product_name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{product.desc}</p>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-zinc-200/80 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Offer price</p>
            <p className="text-lg font-extrabold tabular-nums tracking-tight text-zinc-900">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
          </div>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-0.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark"
          >
            Details
            <ChevronRight className="h-3.5 w-3.5 opacity-90" />
          </Link>
        </div>
      </div>
    </article>
  );
}
