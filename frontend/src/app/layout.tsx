import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShopHub · Electronics & more",
  description: "Browse products, track orders, and shop with a modern storefront powered by Django + Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-5 sm:py-8">
              {children}
            </main>
            <footer className="mt-auto shrink-0 border-t border-zinc-800/80 bg-zinc-950 text-zinc-400">
              <div className="mx-auto max-w-7xl px-4 py-10 sm:px-5">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <p className="text-lg font-bold tracking-tight text-white">ShopHub</p>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed">
                      Demo marketplace UI — fast catalog, secure auth, and order tools. Built to read like a real
                      e-commerce product, not a tutorial page.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Shop</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li>
                        <Link href="/" className="hover:text-white">
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link href="/search" className="hover:text-white">
                          Search
                        </Link>
                      </li>
                      <li>
                        <Link href="/checkout" className="hover:text-white">
                          Checkout
                        </Link>
                      </li>
                      <li>
                        <Link href="/tracker" className="hover:text-white">
                          Track order
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Help</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li>
                        <Link href="/support" className="hover:text-white">
                          Support
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="hover:text-white">
                          About
                        </Link>
                      </li>
                      <li>
                        <a
                          href="https://github.com/Rohit1204"
                          className="hover:text-white"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600 sm:text-left">
                  <span className="font-semibold text-zinc-300">Built by Rohit Ahuja</span>
                  <span className="mx-1.5 text-zinc-700" aria-hidden>
                    ·
                  </span>
                  Django REST API + Next.js · portfolio demo · © {new Date().getFullYear()}
                  <span className="mt-2 block sm:mt-0 sm:ml-1 sm:inline">
                    <a
                      href="https://github.com/Rohit1204"
                      className="font-medium text-brand-light underline-offset-2 hover:text-white hover:underline"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </span>
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
