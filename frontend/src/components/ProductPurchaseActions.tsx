"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type Props = {
  productId: number;
  name: string;
  price: number;
  category: string;
};

export function ProductPurchaseActions({ productId, name, price, category }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();

  function onAddToCart() {
    addToCart(productId, name, price, 1);
  }

  function onBuyNow() {
    addToCart(productId, name, price, 1);
    router.push("/checkout");
  }

  const moreQ = category || name;

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={onAddToCart} className="btn-primary flex-1 sm:flex-none sm:px-8">
          Add to cart
        </button>
        <button type="button" onClick={onBuyNow} className="btn-accent flex-1 sm:flex-none sm:px-8">
          Buy now
        </button>
        <Link
          href={`/search?q=${encodeURIComponent(moreQ)}`}
          className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-800 transition hover:border-brand/30 hover:bg-zinc-50 sm:flex-none"
        >
          More like this
        </Link>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Checkout and Paytm (when configured) run through ShopHub. The same <code className="rounded bg-zinc-100 px-1 text-[11px]">cart</code>{" "}
        in localStorage is shared with the Django template shop on port 8000.
      </p>
    </>
  );
}

type MobileProps = Props & { priceLabel: string };

export function ProductPurchaseMobileBar(props: MobileProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { productId, name, price, priceLabel } = props;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Your price</p>
          <p className="truncate text-lg font-bold tabular-nums text-zinc-900">{priceLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(productId, name, price, 1)}
          className="btn-primary shrink-0 px-3 py-2.5 text-xs sm:text-sm"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            addToCart(productId, name, price, 1);
            router.push("/checkout");
          }}
          className="btn-accent shrink-0 px-3 py-2.5 text-xs sm:text-sm"
        >
          Buy
        </button>
      </div>
    </div>
  );
}
