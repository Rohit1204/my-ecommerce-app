import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · ShopHub",
  description: "How ShopHub works — catalog, checkout, orders, and tech stack.",
};

function IconBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className ?? ""}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="animate-fade-up relative pb-12">
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-brand/[0.08] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-40 h-56 w-56 rounded-full bg-accent/[0.07] blur-3xl" aria-hidden />

      <nav className="relative mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-zinc-500">
          <li>
            <Link href="/" className="font-medium text-brand hover:text-brand-dark">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-zinc-300">
            /
          </li>
          <li className="font-semibold text-zinc-800">About</li>
        </ol>
      </nav>

      <header className="relative mb-10 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">ShopHub</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
          Built like a real store, scoped as a demo
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-[17px]">
          ShopHub is a full-stack ecommerce sample: browse and buy on{" "}
          <strong className="font-semibold text-zinc-800">Next.js</strong>, with{" "}
          <strong className="font-semibold text-zinc-800">Django REST</strong> for catalog, auth, orders, and support —
          the kind of split you’d grow into production.
        </p>
      </header>

      <div className="relative mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group card-elevated relative overflow-hidden p-6 transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand to-brand-light opacity-80" aria-hidden />
          <div className="flex gap-4">
            <IconBox className="bg-brand/10 text-brand">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </IconBox>
            <div>
              <h2 className="font-bold text-zinc-900">Orders &amp; tracking</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Checkout creates real order rows; the tracker shows status updates and line items from the same database.
              </p>
              <Link href="/tracker" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
                Track an order
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="group card-elevated relative overflow-hidden p-6 transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent to-amber-500 opacity-90" aria-hidden />
          <div className="flex gap-4">
            <IconBox className="bg-accent/10 text-accent-dark">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </IconBox>
            <div>
              <h2 className="font-bold text-zinc-900">Secure checkout</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Sign in to place orders. When Paytm keys are configured, payment handoff uses the same checksum flow as
                common Indian gateways.
              </p>
              <Link href="/checkout" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
                Go to checkout
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="group card-elevated relative overflow-hidden p-6 transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" aria-hidden />
          <div className="flex gap-4">
            <IconBox className="bg-emerald-500/10 text-emerald-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </IconBox>
            <div>
              <h2 className="font-bold text-zinc-900">Help &amp; support</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Questions go to the API and the same contact store as the legacy Django app — one backend for every
                channel.
              </p>
              <Link href="/support" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
                Customer care
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="relative mb-12 overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/25 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden />
        <h2 className="relative text-lg font-bold text-white sm:text-xl">Tech snapshot</h2>
        <ul className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Storefront", "Next.js App Router, Tailwind"],
            ["API", "Django REST + JWT"],
            ["Data", "PostgreSQL / SQLite + models"],
            ["Payments", "Paytm-style staging hook"],
          ].map(([k, v]) => (
            <li key={k} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">{k}</p>
              <p className="mt-1 text-sm font-semibold text-white/95">{v}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">FAQ</h2>
        <div className="card-elevated divide-y divide-zinc-100 overflow-hidden p-0 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <details className="group px-5 py-4 transition hover:bg-zinc-50/80 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-zinc-900">
              How do I place an order?
              <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Browse on ShopHub, add items to your bag, then open{" "}
              <Link href="/checkout" className="font-semibold text-brand hover:underline">
                Checkout
              </Link>
              . You&apos;ll need to{" "}
              <Link href="/login" className="font-semibold text-brand hover:underline">
                sign in
              </Link>{" "}
              — only logged-in customers can complete an order.
            </p>
          </details>
          <details className="group px-5 py-4 transition hover:bg-zinc-50/80 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-zinc-900">
              How do I track my order?
              <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Use{" "}
              <Link href="/tracker" className="font-semibold text-brand hover:underline">
                Track order
              </Link>{" "}
              with your order id and the email from checkout. You&apos;ll see timeline updates and items for that order.
            </p>
          </details>
          <details className="group px-5 py-4 transition hover:bg-zinc-50/80 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-zinc-900">
              Is this a production store?
              <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              No — it&apos;s a portfolio demo. Use env vars for secrets, turn on HTTPS, and harden auth before real
              customers or money.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
