import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { fetchProduct, fetchRelatedProducts } from "@/lib/api-server";
import { ProductPurchaseActions, ProductPurchaseMobileBar } from "@/components/ProductPurchaseActions";

type Props = { params: Promise<{ id: string }> };

function descToHighlights(text: string): string[] {
  const chunks = text
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (chunks.length <= 1) return [text.trim()].filter(Boolean);
  return chunks.slice(0, 6);
}

function formatListedDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await fetchProduct(id);
    return {
      title: `${product.product_name} · ShopHub`,
      description: product.desc.slice(0, 160),
    };
  } catch {
    return { title: "Product · ShopHub" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  let product;
  try {
    product = await fetchProduct(id);
  } catch {
    notFound();
  }

  const related = await fetchRelatedProducts(product.category, product.id, 4);
  const highlights = descToHighlights(product.desc);
  const priceLabel = `₹${product.price.toLocaleString("en-IN")}`;
  const emiApprox = Math.max(1, Math.ceil(product.price / 6));

  return (
    <div className="animate-fade-up pb-24 lg:pb-8">
      <nav
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="rounded-lg px-2 py-1 font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-brand"
        >
          Home
        </Link>
        <span className="text-zinc-300" aria-hidden>
          /
        </span>
        <Link
          href={`/search?q=${encodeURIComponent(product.category)}`}
          className="rounded-lg px-2 py-1 font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-brand"
        >
          {product.category || "All"}
        </Link>
        <span className="text-zinc-300" aria-hidden>
          /
        </span>
        <span className="max-w-[min(100%,14rem)] truncate rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-800 sm:max-w-md sm:text-sm">
          {product.product_name}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
        {/* Gallery */}
        <div className="space-y-4 lg:col-span-5">
          <div className="card-elevated relative overflow-hidden p-4 sm:p-5">
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 sm:left-5 sm:top-5">
              <span className="rounded-lg bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                Deal of the day
              </span>
              {product.category ? (
                <span className="w-fit rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 shadow-sm backdrop-blur-sm">
                  {product.category}
                </span>
              ) : null}
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-50 via-white to-zinc-50/80 ring-1 ring-zinc-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.product_name}
                  fill
                  className="object-contain p-6 transition duration-500 hover:scale-[1.03]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400">
                  <svg className="h-14 w-14 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">No image</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { t: "Assured", s: "Quality check" },
              { t: "Fast", s: "Pack & dispatch" },
              { t: "Secure", s: "Pay at checkout" },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-xl border border-zinc-200/80 bg-white/80 px-2 py-3 text-center shadow-sm sm:px-3"
              >
                <p className="text-[11px] font-bold text-zinc-900 sm:text-xs">{x.t}</p>
                <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-[11px]">{x.s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buy box */}
        <div className="flex flex-col lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              ShopHub Choice
            </span>
            <span className="text-xs text-zinc-500">
              <span className="font-semibold text-amber-600">★★★★☆</span>
              <span className="ml-1">4.2</span>
              <span className="text-zinc-400"> · demo rating</span>
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-3xl lg:text-[2rem] lg:leading-snug">
            {product.product_name}
          </h1>

          {product.subcategory ? (
            <p className="mt-2 text-sm font-medium text-zinc-500">{product.subcategory}</p>
          ) : null}

          <div className="mt-6 card-elevated border-brand/10 bg-gradient-to-br from-white to-brand/[0.03] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Special price</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-extrabold tabular-nums tracking-tight text-zinc-900 sm:text-4xl">
                {priceLabel}
              </span>
              <span className="mb-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">
                Inclusive of taxes
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-600">
              No-cost EMI from <span className="font-semibold text-zinc-800">₹{emiApprox.toLocaleString("en-IN")}/mo</span>{" "}
              <span className="text-zinc-400">· illustrative</span>
            </p>

            <ProductPurchaseActions
              productId={product.id}
              name={product.product_name}
              price={product.price}
              category={product.category || product.product_name}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-600">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium shadow-sm">
              <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Free delivery above ₹500 <span className="text-zinc-400">(demo)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-medium shadow-sm">
              <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Pay on delivery available <span className="text-zinc-400">(demo)</span>
            </span>
          </div>

          {/* Highlights */}
          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Highlights</h2>
            <ul className="mt-3 space-y-2">
              {highlights.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specs */}
          <div className="mt-8 card-elevated overflow-hidden p-0">
            <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-3">
              <h2 className="text-sm font-bold text-zinc-900">Specifications</h2>
            </div>
            <dl className="divide-y divide-zinc-100">
              {[
                ["Category", product.category || "—"],
                ["Subcategory", product.subcategory || "—"],
                ["Listed on", formatListedDate(product.pub_date)],
                ["Product ID", String(product.id)],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 px-5 py-3 text-sm sm:grid-cols-4">
                  <dt className="font-medium text-zinc-500">{k}</dt>
                  <dd className="col-span-2 font-semibold text-zinc-900 sm:col-span-3">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14 border-t border-zinc-200/80 pt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="section-title">You may also like</h2>
              <p className="mt-1 text-sm text-zinc-600">More from {product.category}</p>
            </div>
            <Link href={`/search?q=${encodeURIComponent(product.category)}`} className="text-sm font-bold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <ProductPurchaseMobileBar
        productId={product.id}
        name={product.product_name}
        price={product.price}
        category={product.category || product.product_name}
        priceLabel={priceLabel}
      />
    </div>
  );
}
