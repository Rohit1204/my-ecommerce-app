"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/orders-api";
import { submitPaytmForm } from "@/lib/paytm-redirect";

function cartLines(cart: Record<string, [number, string, number]>) {
  return Object.entries(cart).filter(([, v]) => Array.isArray(v));
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Review" },
    { n: 2, label: "Details & pay" },
  ] as const;
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Checkout progress">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                step >= s.n
                  ? "bg-brand text-white shadow-md shadow-brand/25"
                  : "border border-zinc-200 bg-white text-zinc-400"
              }`}
            >
              {s.n}
            </span>
            <span className={`hidden text-sm font-semibold sm:inline ${step >= s.n ? "text-zinc-900" : "text-zinc-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 ? (
            <span className="hidden h-px w-8 bg-zinc-200 sm:block" aria-hidden />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TrustRow() {
  const items = [
    { t: "Secure", d: "Encrypted checkout" },
    { t: "Track", d: "Order id after pay" },
    { t: "Demo", d: "No real delivery" },
  ];
  return (
    <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((x) => (
        <div
          key={x.t}
          className="rounded-xl border border-zinc-200/80 bg-white/60 px-2 py-3 text-center shadow-sm backdrop-blur-sm sm:px-3"
        >
          <p className="text-[11px] font-bold text-zinc-900 sm:text-xs">{x.t}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-zinc-500 sm:text-[11px]">{x.d}</p>
        </div>
      ))}
    </div>
  );
}

function QtyStepper({
  qty,
  title,
  onDelta,
  onRemove,
}: {
  qty: number;
  title: string;
  onDelta: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50/80 p-0.5">
      <button
        type="button"
        onClick={() => (qty <= 1 ? onRemove() : onDelta(-1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-zinc-700 transition hover:bg-white hover:shadow-sm"
        aria-label={qty <= 1 ? `Remove ${title}` : "Decrease quantity"}
      >
        −
      </button>
      <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-zinc-900" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onDelta(1)}
        disabled={qty >= 999}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-medium text-zinc-700 transition hover:bg-white hover:shadow-sm disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { access, ready: authReady, username } = useAuth();
  const { cart, ready, subtotal, itemCount, setLineQuantity, removeLine, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip_code: "",
  });
  /** Reused on retry after failure so duplicate checkout isn’t created (API idempotency). */
  const checkoutIdempotencyKeyRef = useRef<string | null>(null);

  const lines = useMemo(() => cartLines(cart), [cart]);
  const empty = ready && lines.length === 0;
  const step: 1 | 2 = empty ? 1 : 2;

  useEffect(() => {
    if (!authReady) return;
    if (!access) {
      router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
    }
  }, [authReady, access, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (empty) return;
    setSubmitting(true);
    if (!access) return;
    const idempotencyKey =
      checkoutIdempotencyKeyRef.current ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    checkoutIdempotencyKeyRef.current = idempotencyKey;
    try {
      const res = await createOrder(
        {
          ...form,
          items: cart,
          amount: subtotal,
          idempotency_key: idempotencyKey,
        },
        access,
      );
      checkoutIdempotencyKeyRef.current = null;
      if (res.paytm?.action && res.paytm.fields) {
        submitPaytmForm(res.paytm.action, res.paytm.fields);
        return;
      }
      clearCart();
      router.push(`/?ordered=${res.order_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authReady || !access) {
    return (
      <div className="animate-fade-up mx-auto max-w-lg py-16 text-center">
        <div className="card-elevated px-6 py-10">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden />
          <p className="font-semibold text-zinc-900">Checking your session…</p>
          <p className="mt-2 text-sm text-zinc-600">
            {!authReady ? "Loading." : "Redirecting to sign in."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up relative pb-28 lg:pb-10">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/[0.07] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 top-40 h-64 w-64 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden />

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
          <li className="font-semibold text-zinc-800">Checkout</li>
        </ol>
      </nav>

      <header className="relative mb-8 flex flex-col gap-6 border-b border-zinc-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">ShopHub</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Checkout</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-600">
            Confirm your bag and where we should send updates. If Paytm is configured on the API, you&apos;ll be taken to
            pay securely after you place the order.
          </p>
          <p className="mt-3 text-xs font-medium text-zinc-500">
            Signed in as <span className="font-semibold text-zinc-800">{username}</span>
          </p>
        </div>
        <StepIndicator step={step} />
      </header>

      <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Order summary — first on mobile, sticky right on desktop */}
        <section className="lg:order-2 lg:col-span-5">
          <div className="card-elevated relative overflow-hidden border-brand/10 shadow-[0_12px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-24 lg:self-start">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-light to-accent opacity-90" aria-hidden />
            <div className="border-b border-zinc-100/90 bg-gradient-to-br from-white to-zinc-50/80 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Order summary</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {ready ? `${itemCount} item${itemCount === 1 ? "" : "s"} in your bag` : "Loading your bag…"}
                  </p>
                </div>
                {!empty && ready ? (
                  <Link
                    href="/search"
                    className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/5"
                  >
                    Add more
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {!ready ? (
                <div className="space-y-3">
                  <div className="h-14 animate-pulse rounded-xl bg-zinc-100" />
                  <div className="h-14 animate-pulse rounded-xl bg-zinc-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-zinc-100" />
                </div>
              ) : empty ? (
                <div className="rounded-2xl border-2 border-dashed border-zinc-200/90 bg-gradient-to-b from-zinc-50/90 to-white px-4 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-bold text-zinc-900">Your bag is empty</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-500">
                    Discover products on the home page or search, then return here to check out.
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                    <Link href="/" className="btn-primary w-full min-w-[10rem] sm:w-auto">
                      Browse home
                    </Link>
                    <Link
                      href="/search"
                      className="inline-flex w-full min-w-[10rem] items-center justify-center rounded-xl border-2 border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-800 transition hover:border-brand/25 sm:w-auto"
                    >
                      Search
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <ul className="max-h-[min(24rem,50vh)] space-y-2 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300">
                    {lines.map(([key, [qty, title, unit]]) => {
                      const idNum = Number(key.replace(/^pr/, ""));
                      const lineTotal = qty * unit;
                      return (
                        <li
                          key={key}
                          className="group rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm transition hover:border-zinc-200 hover:shadow-md sm:p-4"
                        >
                          <div className="flex gap-3 sm:gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 text-zinc-400 ring-1 ring-zinc-100">
                              <svg className="h-7 w-7 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">{title}</p>
                              <p className="mt-1 text-xs text-zinc-500">
                                ₹{unit.toLocaleString("en-IN")} <span className="text-zinc-400">×</span> {qty}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <QtyStepper
                                  qty={qty}
                                  title={title}
                                  onDelta={(d) => setLineQuantity(idNum, qty + d)}
                                  onRemove={() => removeLine(idNum)}
                                />
                                <p className="text-sm font-bold tabular-nums text-zinc-900">
                                  ₹{lineTotal.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-6 space-y-3 border-t border-zinc-100 pt-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Subtotal</span>
                      <span className="font-semibold tabular-nums text-zinc-800">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Delivery</span>
                      <span className="font-semibold text-emerald-700">FREE</span>
                    </div>
                    <div className="flex items-end justify-between border-t border-zinc-100 pt-4">
                      <span className="text-sm font-bold text-zinc-800">Total</span>
                      <span className="text-2xl font-extrabold tabular-nums tracking-tight text-zinc-900">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-400">Taxes included where applicable · demo store</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Shipping form */}
        <section className="lg:order-1 lg:col-span-7">
          <div className="card-elevated overflow-hidden border-zinc-200/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-100 pb-5">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Delivery details</h2>
                <p className="mt-1 text-xs text-zinc-500">We&apos;ll use this for confirmations and the order tracker.</p>
              </div>
              <Link href="/tracker" className="text-xs font-semibold text-brand hover:underline">
                Track an order →
              </Link>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-6">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Contact</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-name">
                      Full name
                    </label>
                    <input
                      id="co-name"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-field"
                      placeholder="As on ID / doorbell"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-email">
                      Email
                    </label>
                    <input
                      id="co-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-phone">
                    Mobile number
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Address</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-a1">
                      Flat, house no., street
                    </label>
                    <input
                      id="co-a1"
                      required
                      autoComplete="address-line1"
                      value={form.address1}
                      onChange={(e) => setForm((f) => ({ ...f, address1: e.target.value }))}
                      className="input-field"
                      placeholder="Street, building, landmark"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-a2">
                      Area, colony <span className="font-normal text-zinc-400">(optional)</span>
                    </label>
                    <input
                      id="co-a2"
                      autoComplete="address-line2"
                      value={form.address2}
                      onChange={(e) => setForm((f) => ({ ...f, address2: e.target.value }))}
                      className="input-field"
                      placeholder="Apt, suite, floor"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-city">
                        City
                      </label>
                      <input
                        id="co-city"
                        required
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        className="input-field"
                        placeholder="City"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-state">
                        State
                      </label>
                      <input
                        id="co-state"
                        required
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                        className="input-field"
                        placeholder="State"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-xs font-semibold text-zinc-700" htmlFor="co-zip">
                        PIN code
                      </label>
                      <input
                        id="co-zip"
                        required
                        autoComplete="postal-code"
                        value={form.zip_code}
                        onChange={(e) => setForm((f) => ({ ...f, zip_code: e.target.value }))}
                        className="input-field"
                        placeholder="560001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <TrustRow />

              {error ? (
                <div
                  className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900 shadow-sm"
                  role="alert"
                >
                  <p className="font-semibold">Couldn&apos;t place order</p>
                  <p className="mt-1 text-red-800/90">{error}</p>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={!ready || empty || submitting}
                  className="btn-accent order-1 w-full px-8 py-3.5 text-base font-bold shadow-lg shadow-accent/25 transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-45 sm:order-2 sm:w-auto sm:min-w-[12rem]"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Placing order…
                    </span>
                  ) : (
                    "Place order securely"
                  )}
                </button>
                <Link
                  href="/search"
                  className="order-2 text-center text-sm font-semibold text-brand hover:underline sm:order-1 sm:text-left"
                >
                  ← Continue shopping
                </Link>
              </div>
              <p className="text-center text-[11px] leading-relaxed text-zinc-400 sm:text-left">
                By placing an order you agree to demo terms — no real fulfilment. Paytm opens in-page when the backend is
                configured.
              </p>
            </form>
          </div>
        </section>
      </div>

      {/* Mobile sticky total bar */}
      {!empty && ready ? (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Total</p>
              <p className="text-lg font-extrabold tabular-nums text-zinc-900">₹{subtotal.toLocaleString("en-IN")}</p>
            </div>
            <p className="max-w-[55%] text-right text-[10px] leading-tight text-zinc-500">
              Scroll up to enter address, then tap &quot;Place order&quot;
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
