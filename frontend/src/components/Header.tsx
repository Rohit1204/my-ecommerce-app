"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

export function Header() {
  const router = useRouter();
  const { username, ready, clearSession } = useAuth();
  const { itemCount, ready: cartReady } = useCart();
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
    else router.push("/search");
  }

  return (
    <header className="sticky top-0 z-50 shadow-nav">
      <div className="bg-gradient-to-b from-brand to-brand-dark">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex items-center justify-between gap-3 lg:justify-start lg:gap-6">
              <Link href="/" className="group flex shrink-0 items-center gap-2.5 text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 transition group-hover:bg-white/25">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
                    <path d="M7 4h14v14H7V4zm0 16h14v2H7v-2zM3 4h2v18H3V4z" />
                  </svg>
                </span>
                <span className="text-lg font-bold tracking-tight">ShopHub</span>
              </Link>

              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  href="/checkout"
                  className="relative flex h-9 min-w-9 items-center justify-center rounded-lg bg-white/15 text-xs font-bold text-white hover:bg-white/25"
                  aria-label={`Cart, ${cartReady ? itemCount : 0} items`}
                >
                  Bag
                  {cartReady && itemCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold leading-none text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  ) : null}
                </Link>
                {!ready ? (
                  <span className="h-8 w-20 animate-pulse rounded-lg bg-white/10" aria-hidden />
                ) : username ? (
                  <span className="max-w-[7rem] truncate text-xs font-medium text-white/90">Hi, {username}</span>
                ) : null}
                {!ready ? null : username ? (
                  <button
                    type="button"
                    onClick={() => clearSession()}
                    className="rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
                  >
                    Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-sm hover:bg-white/95"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>

            <form
              onSubmit={onSearch}
              className="flex flex-1 items-center gap-0 overflow-hidden rounded-xl bg-white shadow-md shadow-black/10 lg:mx-2"
              role="search"
            >
              <label htmlFor="nav-search" className="sr-only">
                Search products
              </label>
              <input
                id="nav-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for products, brands and more"
                className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                autoComplete="off"
              />
              <button
                type="submit"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-brand transition hover:bg-zinc-50 sm:w-12"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </form>

            <nav className="hidden items-center gap-1 text-sm font-medium text-white/95 lg:flex">
              <Link
                href="/checkout"
                className="relative rounded-lg px-3 py-2 hover:bg-white/10"
                aria-label={`Cart, ${cartReady ? itemCount : 0} items`}
              >
                Bag
                {cartReady && itemCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                ) : null}
              </Link>
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-white/10">
                Home
              </Link>
              <Link href="/about" className="rounded-lg px-3 py-2 hover:bg-white/10">
                About
              </Link>
              <Link href="/tracker" className="rounded-lg px-3 py-2 hover:bg-white/10">
                Orders
              </Link>
              <Link href="/support" className="rounded-lg px-3 py-2 hover:bg-white/10">
                Help
              </Link>
              {!ready ? (
                <span className="ml-2 h-9 w-24 animate-pulse rounded-lg bg-white/10" aria-hidden />
              ) : username ? (
                <>
                  <span className="ml-2 max-w-[10rem] truncate rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/95">
                    {username}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearSession()}
                    className="ml-1 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/25"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup" className="ml-2 rounded-lg px-3 py-2 hover:bg-white/10">
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="ml-1 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand shadow-sm hover:bg-white/95"
                  >
                    Log in
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
        <div className="border-t border-white/10 bg-brand-dark/40 px-4 py-1.5 text-center text-[11px] font-medium text-white/75 sm:text-xs">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>Secure payments</span>
            <span className="hidden sm:inline">·</span>
            <span>Easy order tracking</span>
            <span className="hidden sm:inline">·</span>
            <span>Trusted catalog API</span>
          </span>
        </div>
      </div>
    </header>
  );
}
