import type { Metadata } from "next";
import Link from "next/link";
import { SupportForm } from "./SupportForm";

export const metadata: Metadata = {
  title: "Help & support · ShopHub",
  description: "Track orders, read quick answers, or message customer care.",
};

function QuickCard({
  href,
  title,
  desc,
  icon,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card-hover"
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} aria-hidden />
      <div className="flex gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-brand/10 group-hover:text-brand"
          aria-hidden
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-zinc-900 group-hover:text-brand">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">{desc}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand">
            Open
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SupportPage() {
  return (
    <div className="animate-fade-up relative pb-12">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/[0.07] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 top-36 h-60 w-60 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden />

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
          <li className="font-semibold text-zinc-800">Help</li>
        </ol>
      </nav>

      <header className="relative mb-10 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Customer care</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
          We&apos;re here to help
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-[17px]">
          For <strong className="font-semibold text-zinc-800">where is my order</strong>, use the tracker first — it&apos;s
          instant. For returns, damaged items, or anything else, send us a note; messages are stored on your Django backend
          via the API.
        </p>
      </header>

      <div className="relative mb-10 grid gap-4 sm:grid-cols-2">
        <QuickCard
          href="/tracker"
          title="Track my order"
          desc="Order id + email from checkout. See status history and items."
          accent="bg-gradient-to-r from-brand to-brand-light"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <QuickCard
          href="/about"
          title="About ShopHub"
          desc="How the storefront, API, and checkout fit together."
          accent="bg-gradient-to-r from-emerald-500 to-teal-500"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          }
        />
      </div>

      <div className="relative mb-12 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-orange-50/50 px-5 py-4 sm:px-6">
        <p className="text-sm font-semibold text-amber-950">Typical reply time</p>
        <p className="mt-1 text-sm text-amber-900/85">
          Demo project — we aim within <span className="font-bold">one business day</span>. No SLA; for production you&apos;d
          wire email alerts and a ticketing tool.
        </p>
      </div>

      <section className="relative mb-12">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Common questions</h2>
        <div className="card-elevated divide-y divide-zinc-100 overflow-hidden p-0 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <details className="group px-5 py-4 transition hover:bg-zinc-50/80 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-zinc-900">
              Where is my order id?
              <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              After you place an order on ShopHub, you&apos;re redirected home with a confirmation banner that includes your
              numeric <strong className="font-semibold text-zinc-800">order id</strong>. Use that plus the email you entered
              at checkout on the tracker.
            </p>
          </details>
          <details className="group px-5 py-4 transition hover:bg-zinc-50/80 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-zinc-900">
              Do I need an account to buy?
              <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Yes —{" "}
              <Link href="/login" className="font-semibold text-brand hover:underline">
                sign in
              </Link>{" "}
              (or{" "}
              <Link href="/signup" className="font-semibold text-brand hover:underline">
                sign up
              </Link>
              ) before checkout. Browsing and the bag work as a guest; placing the order requires a JWT session.
            </p>
          </details>
          <details className="group px-5 py-4 transition hover:bg-zinc-50/80 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-zinc-900">
              Is my message stored?
              <span className="text-zinc-400 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Yes — the form below calls{" "}
              <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800">
                POST /api/v1/contact/
              </code>{" "}
              and saves to the same <code className="rounded bg-zinc-100 px-1 font-mono text-xs">Contact</code> model as the
              legacy Django form.
            </p>
          </details>
        </div>
      </section>

      <section className="card-elevated relative overflow-hidden shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-light to-accent" aria-hidden />
        <div className="border-b border-zinc-100 bg-gradient-to-br from-white to-zinc-50/90 px-6 py-6 sm:px-8 sm:py-7">
          <h2 className="text-xl font-bold text-zinc-900">Message us</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Include your order id if the question is about a purchase. The more detail you add, the faster we can point you
            in the right direction.
          </p>
        </div>
        <div className="px-6 py-6 sm:px-8 sm:pb-8 sm:pt-7">
          <SupportForm />
        </div>
      </section>
    </div>
  );
}
