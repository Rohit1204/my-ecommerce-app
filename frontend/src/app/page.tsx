import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { fetchCatalog } from "@/lib/api-server";
import { categoryAnchorSlug } from "@/lib/category-anchor";
import type { CatalogSection } from "@/lib/types";

type HomeProps = { searchParams?: Promise<{ ordered?: string }> };

function CategoryJumpChips({ sections }: { sections: CatalogSection[] }) {
  return (
    <nav
      className="rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)] ring-1 ring-zinc-100/80 sm:p-5"
      aria-label="Jump to a category"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="shrink-0">
          <h2 className="text-sm font-bold text-zinc-900">Jump to category</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Tap a chip to scroll — same page anchors.</p>
        </div>
        <div className="min-w-0 flex-1">
          <ul className="flex flex-wrap gap-2 sm:justify-end">
            {sections.map((s, chipIdx) => {
              const slug = categoryAnchorSlug(s.category);
              const n = s.products.length;
              const id = slug || `cat-${chipIdx}`;
              return (
                <li key={`${s.category}-${chipIdx}`}>
                  <a
                    href={`#cat-${id}`}
                    className="group inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/90 py-1.5 pl-3.5 pr-2 text-sm shadow-sm transition hover:border-brand/35 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                  >
                    <span className="truncate font-semibold text-zinc-900 group-hover:text-brand">
                      {s.category || "Uncategorized"}
                    </span>
                    <span
                      className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-600 ring-1 ring-zinc-200/90 group-hover:text-brand group-hover:ring-brand/20"
                      title={`${n} product${n === 1 ? "" : "s"} in this category`}
                    >
                      {n}&nbsp;{n === 1 ? "item" : "items"}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default async function HomePage({ searchParams }: HomeProps) {
  const ordered = (await searchParams)?.ordered;
  let sections: CatalogSection[];
  let error: string | null = null;
  try {
    sections = await fetchCatalog();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load catalog";
    sections = [] as CatalogSection[];
  }

  if (error) {
    return (
      <div className="card-elevated border-amber-200/80 bg-amber-50/90 p-6 text-amber-950">
        <p className="font-semibold">We couldn&apos;t reach the catalog.</p>
        <p className="mt-2 text-sm text-amber-900/90">
          Start Django with{" "}
          <code className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs">python manage.py runserver</code>
          {" · "}
          Set <code className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_API_URL</code> in{" "}
          <code className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs">frontend/.env.local</code>
        </p>
        <p className="mt-2 text-xs opacity-80">{error}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="card-elevated p-10 text-center">
        <p className="text-zinc-600">No products yet. Add some in Django admin, then refresh.</p>
      </div>
    );
  }

  const totalProducts = sections.reduce((n, s) => n + s.products.length, 0);

  return (
    <div className="animate-fade-up space-y-8 sm:space-y-10">
      {ordered ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 shadow-sm sm:px-5">
          <p className="font-semibold">Order placed — thank you!</p>
          <p className="mt-1 text-emerald-900/90">
            Your order id is <span className="font-mono font-bold">{ordered}</span>. Track it under{" "}
            <Link href="/tracker" className="font-bold text-brand underline">
              Orders
            </Link>{" "}
            with the email you used at checkout.
          </p>
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white px-5 py-9 shadow-card sm:px-8 sm:py-11">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-brand/[0.07] blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-accent/[0.06] blur-2xl" aria-hidden />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">ShopHub</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Shop by category
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
              Clear sections below — each block is one catalog category from your API. Use the chips to jump, or scroll
              the aisles.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-baseline gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
                <span className="text-2xl font-extrabold tabular-nums text-zinc-900">{totalProducts}</span>
                <span className="text-xs font-medium text-zinc-500">products</span>
              </div>
              <div className="inline-flex items-baseline gap-2 rounded-xl border border-brand/20 bg-brand/[0.06] px-4 py-2.5">
                <span className="text-2xl font-extrabold tabular-nums text-brand">{sections.length}</span>
                <span className="text-xs font-medium text-brand/80">categories</span>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/search" className="btn-primary">
                Search catalog
              </Link>
              <Link
                href="/tracker"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                Track an order
              </Link>
            </div>
          </div>
          <div className="hidden rounded-2xl border border-zinc-200 bg-zinc-900 px-5 py-5 text-white shadow-lg lg:block lg:w-[17.5rem]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/55">Why it feels real</p>
            <ul className="mt-3 space-y-2.5 text-sm text-white/90">
              <li className="flex gap-2">
                <span className="text-accent" aria-hidden>
                  ·
                </span>
                Jump links + in-page sections
              </li>
              <li className="flex gap-2">
                <span className="text-brand-light" aria-hidden>
                  ·
                </span>
                Product pages &amp; checkout on Next
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400" aria-hidden>
                  ·
                </span>
                Live data from Django REST
              </li>
            </ul>
          </div>
        </div>
      </section>

      <CategoryJumpChips sections={sections} />

      {/* Category sections */}
      {sections.map((section, secIdx) => {
        const slug = categoryAnchorSlug(section.category) || `cat-${secIdx}`;
        const n = section.products.length;
        return (
          <section
            key={`${section.category}-${secIdx}`}
            id={`cat-${slug}`}
            aria-labelledby={`heading-cat-${slug}`}
            className="scroll-mt-28 sm:scroll-mt-32"
          >
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-card">
              <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50/90 to-white px-5 py-6 sm:px-8 sm:py-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Category</p>
                    <h2
                      id={`heading-cat-${slug}`}
                      className="mt-1.5 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl"
                    >
                      {section.category || "Uncategorized"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                      <span className="font-semibold text-zinc-800">{n}</span>
                      {n === 1 ? " product" : " products"}
                      {n === 1 ? " in this aisle." : " in this aisle — open a card for details and add to bag."}
                    </p>
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(section.category || "")}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-zinc-800"
                  >
                    View all in search →
                  </Link>
                </div>
              </div>

              <div className="px-4 py-6 sm:px-7 sm:py-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {section.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <p className="pb-2 text-center text-[11px] text-zinc-400">
        Catalog from{" "}
        <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">/api/v1/catalog/</code>
      </p>
    </div>
  );
}
