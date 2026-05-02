"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { getApiBase } from "@/lib/api-config";
import type { Product } from "@/lib/types";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setErr(null);
    setLoading(true);
    setResults(null);
    try {
      const url = new URL(`${getApiBase()}/api/v1/products/search/`);
      url.searchParams.set("q", query);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(String(res.status));
      setResults(await res.json());
    } catch {
      setErr("Search failed — check the API and your query.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setQ(initialQ);
    if (initialQ.trim()) search(initialQ);
  }, [initialQ, search]);

  const hasQuery = initialQ.trim().length > 0;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero strip */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-brand/10 via-white to-accent/5 px-6 py-8 shadow-card sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Catalog search</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Find your next pick</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            Search product names and categories. Results use the same rich cards as the home aisles.
          </p>
        </div>
      </div>

      <div className="card-elevated overflow-hidden p-0 shadow-card">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 sm:px-5">
          <SearchIcon className="h-5 w-5 text-brand" />
          <span className="text-sm font-bold text-zinc-800">Search the store</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, brands, categories…"
                className="input-field pl-11"
                onKeyDown={(e) => e.key === "Enter" && search(q)}
                aria-label="Search query"
              />
            </div>
            <button
              type="button"
              onClick={() => search(q)}
              disabled={loading || !q.trim()}
              className="btn-primary shrink-0 px-8 sm:w-44"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
      </div>

      {err ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {err}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-10">
          <div className="mb-4 h-5 w-48 animate-pulse rounded bg-zinc-200" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : null}

      {!loading && results && results.length === 0 && hasQuery ? (
        <div className="mt-10 overflow-hidden rounded-3xl border border-dashed border-zinc-300 bg-gradient-to-b from-zinc-50 to-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-200/80 text-3xl text-zinc-500">
            ⌕
          </div>
          <p className="text-lg font-bold text-zinc-900">No matches for that search</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            Try a shorter keyword, a category name, or jump to an aisle on the{" "}
            <Link href="/" className="font-semibold text-brand hover:underline">
              home page
            </Link>
            .
          </p>
        </div>
      ) : null}

      {!loading && results && results.length > 0 ? (
        <div className="mt-10">
          <div className="mb-6 flex flex-col gap-3 border-b border-zinc-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Results</p>
              <p className="mt-1 text-xl font-extrabold text-zinc-900">
                {results.length} item{results.length === 1 ? "" : "s"} found
                {initialQ ? (
                  <span className="text-base font-semibold text-zinc-500">
                    {" "}
                    for &ldquo;{initialQ}&rdquo;
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
              Sorted by <span className="text-zinc-800">relevance</span>
              <span className="rounded bg-white px-2 py-0.5 text-[10px] text-zinc-400">demo</span>
            </div>
          </div>
          <div className="rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50/40 p-4 shadow-inner sm:p-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {!loading && results === null && !hasQuery ? (
        <div className="mt-10 rounded-3xl border border-zinc-200/80 bg-white/80 px-6 py-12 text-center text-sm text-zinc-600 shadow-sm">
          <p className="font-medium text-zinc-800">Type a query and hit Search</p>
          <p className="mt-1">Or use the search bar in the header to jump here with a query.</p>
        </div>
      ) : null}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6">
      <div className="h-36 rounded-3xl bg-zinc-200/80" />
      <div className="h-24 rounded-2xl bg-zinc-100" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
