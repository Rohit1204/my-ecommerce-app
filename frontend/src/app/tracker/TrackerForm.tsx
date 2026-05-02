"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiBase } from "@/lib/api-config";

type TrackResponse =
  | { status: "success"; updates: { text: string; time: string }[]; itemsJson: string }
  | { status: "noitem" }
  | { status: "error"; detail?: string };

function parseLineItems(itemsJson: string): { name: string; qty: number }[] {
  try {
    const cart = JSON.parse(itemsJson) as Record<string, [number, string, ...unknown[]]>;
    return Object.keys(cart).map((key) => ({
      qty: cart[key][0],
      name: cart[key][1],
    }));
  } catch {
    return [];
  }
}

function formatUpdateTime(raw: string): string {
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return raw;
}

function StepDots({ phase }: { phase: "form" | "results" }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3" aria-label="Tracking steps">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          phase === "form" ? "bg-brand text-white shadow-md shadow-brand/25" : "bg-emerald-500 text-white shadow-md"
        }`}
      >
        1
      </span>
      <span className="h-px w-6 bg-zinc-200 sm:w-10" aria-hidden />
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          phase === "results" ? "bg-brand text-white shadow-md shadow-brand/25" : "border border-zinc-200 bg-white text-zinc-400"
        }`}
      >
        2
      </span>
      <span className="hidden text-xs font-semibold text-zinc-600 sm:inline">Details → Status</span>
    </div>
  );
}

function TrackerTrustRow() {
  const items = [
    { t: "Verified", d: "Id + email match" },
    { t: "Live", d: "Django order data" },
    { t: "Private", d: "No public search" },
  ];
  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {items.map((x) => (
        <div
          key={x.t}
          className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-2 py-2.5 text-center sm:px-3"
        >
          <p className="text-[10px] font-bold text-zinc-900 sm:text-[11px]">{x.t}</p>
          <p className="mt-0.5 text-[9px] leading-tight text-zinc-500 sm:text-[10px]">{x.d}</p>
        </div>
      ))}
    </div>
  );
}

export function TrackerForm() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<"idle" | "notfound" | "success">("idle");
  const [updates, setUpdates] = useState<{ text: string; time: string }[]>([]);
  const [lineItems, setLineItems] = useState<{ name: string; qty: number }[]>([]);

  const phase: "form" | "results" = lookup === "success" ? "results" : "form";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLookup("idle");
    setUpdates([]);
    setLineItems([]);
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/orders/track/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ order_id: orderId.trim(), email: email.trim() }),
      });
      const data = (await res.json()) as TrackResponse;
      if (!res.ok && data.status === "error") {
        setError(data.detail ?? "Something went wrong.");
        return;
      }
      if (data.status === "success") {
        setLookup("success");
        setUpdates(data.updates);
        setLineItems(parseLineItems(data.itemsJson));
        return;
      }
      if (data.status === "noitem") {
        setLookup("notfound");
        return;
      }
      setError("Unexpected response from server.");
    } catch {
      setError("Network error — is Django running on " + getApiBase() + "?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up relative pb-10">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/[0.07] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-32 h-56 w-56 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden />

      <nav className="relative mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-zinc-500">
          <li>
            <Link href="/" className="font-medium text-brand transition hover:text-brand-dark">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-zinc-300">
            /
          </li>
          <li className="font-semibold text-zinc-800">Track order</li>
        </ol>
      </nav>

      <header className="relative mb-8 flex flex-col gap-6 border-b border-zinc-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">ShopHub</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Track your order</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            Use the numeric order id from your confirmation email and the same address you used at checkout. Status comes
            from your live Django orders.
          </p>
        </div>
        <StepDots phase={phase} />
      </header>

      <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Lookup form — sticky on desktop */}
        <section className="lg:col-span-5">
          <div className="card-elevated relative overflow-hidden border-brand/10 shadow-[0_12px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-24 lg:self-start">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-light to-accent opacity-90" aria-hidden />
            <div className="border-b border-zinc-100/90 bg-gradient-to-br from-white to-zinc-50/80 px-5 py-5 sm:px-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Order lookup</h2>
              <p className="mt-1 text-xs text-zinc-500">Both fields must match your order record.</p>
            </div>
            <div className="p-5 sm:p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="orderId" className="mb-1.5 block text-xs font-semibold text-zinc-700">
                    Order ID
                  </label>
                  <input
                    id="orderId"
                    name="orderId"
                    type="text"
                    inputMode="numeric"
                    required
                    autoComplete="off"
                    placeholder="e.g. 12"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="input-field font-mono tabular-nums"
                  />
                  <p className="mt-1.5 text-[11px] text-zinc-400">Digits only, as shown after checkout.</p>
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-zinc-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email used at checkout"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm font-bold shadow-lg shadow-brand/20 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Looking up…
                    </span>
                  ) : (
                    "Track order"
                  )}
                </button>
              </form>
              <TrackerTrustRow />
              <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-400 sm:text-left">
                API:{" "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-700">POST /api/v1/orders/track/</code>
              </p>
              <Link
                href="/checkout"
                className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-brand hover:underline sm:justify-start"
              >
                Need to place an order? Checkout →
              </Link>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="space-y-6 lg:col-span-7">
          <div className="card-elevated overflow-hidden border-zinc-200/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Shipment timeline</h2>
                <p className="mt-1 text-xs text-zinc-500">Latest updates first.</p>
              </div>
              {lookup === "success" && orderId.trim() ? (
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold tabular-nums text-brand">
                  #{orderId.trim()}
                </span>
              ) : null}
            </div>

            <div className="mt-5">
              {error ? (
                <div
                  className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-4 text-sm text-red-900 shadow-sm"
                  role="alert"
                >
                  <p className="font-semibold">Something went wrong</p>
                  <p className="mt-1 text-red-800/90">{error}</p>
                </div>
              ) : lookup === "notfound" ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-200/90 bg-amber-50/60 px-4 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-amber-950">No order found</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-amber-900/85">
                    That combination of order id and email doesn&apos;t match our records. Typos and extra spaces are the
                    usual cause.
                  </p>
                  <ul className="mx-auto mt-4 max-w-sm space-y-1.5 text-left text-xs text-amber-900/80">
                    <li className="flex gap-2">
                      <span className="font-bold text-amber-700">·</span>
                      Copy the id from your confirmation or home page banner after checkout.
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-amber-700">·</span>
                      Use the exact email you typed on the checkout form.
                    </li>
                  </ul>
                </div>
              ) : lookup === "idle" ? (
                <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50/90 to-white px-4 py-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">Ready when you are</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600">
                    Enter your order id and email on the left, then tap <strong>Track order</strong> to load your timeline
                    and items.
                  </p>
                </div>
              ) : updates.length === 0 ? (
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-zinc-800">No updates yet</p>
                  <p className="mt-2 text-sm text-zinc-600">
                    Your order is on file, but there are no status rows in the system yet. Check back later or add updates
                    in Django admin for demos.
                  </p>
                </div>
              ) : (
                <ul className="relative space-y-0 pl-2 sm:pl-3">
                  <span
                    className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-brand/40 via-zinc-200 to-transparent sm:left-[19px]"
                    aria-hidden
                  />
                  {[...updates].reverse().map((u, i) => (
                    <li key={`${u.time}-${i}`} className="relative flex gap-4 pb-8 last:pb-0">
                      <span
                        className={`relative z-10 mt-1 flex h-3.5 w-3.5 shrink-0 rounded-full sm:h-4 sm:w-4 ${
                          i === 0
                            ? "bg-brand shadow-[0_0_0_4px_rgba(40,116,240,0.2)]"
                            : "border-2 border-zinc-300 bg-white"
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1 -mt-0.5 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
                        {i === 0 ? (
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">Latest</p>
                        ) : null}
                        <p className="text-sm font-medium leading-relaxed text-zinc-900">{u.text}</p>
                        <time
                          className="mt-2 inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-600"
                          dateTime={u.time}
                        >
                          {formatUpdateTime(u.time)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card-elevated overflow-hidden border-zinc-200/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Items in this order</h2>
              <p className="mt-1 text-xs text-zinc-500">From your checkout snapshot.</p>
            </div>
            <div className="mt-5">
              {lookup === "idle" ? (
                <div className="rounded-xl bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600">
                  Run a lookup to see line items.
                </div>
              ) : lookup === "notfound" ? (
                <div className="rounded-xl bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600">
                  No items — order wasn&apos;t found.
                </div>
              ) : lineItems.length === 0 ? (
                <div className="rounded-xl bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-600">
                  We couldn&apos;t parse saved line items for this order.
                </div>
              ) : (
                <ul className="space-y-2">
                  {lineItems.map((row, i) => (
                    <li
                      key={`${row.name}-${row.qty}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-200"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </span>
                        <span className="truncate text-sm font-semibold text-zinc-900">{row.name}</span>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold tabular-nums text-brand">
                        ×{row.qty}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
