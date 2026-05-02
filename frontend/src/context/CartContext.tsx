"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartState } from "@/lib/cart-types";

const STORAGE_KEY = "cart";

function loadCart(): CartState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== "object" || o === null) return {};
    return o as CartState;
  } catch {
    return {};
  }
}

function persistCart(cart: CartState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

type CartContextValue = {
  cart: CartState;
  ready: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (productId: number, name: string, price: number, delta?: number) => void;
  setLineQuantity: (productId: number, qty: number) => void;
  removeLine: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    persistCart(cart);
  }, [cart, ready]);

  const itemCount = useMemo(() => {
    let n = 0;
    for (const line of Object.values(cart)) {
      if (Array.isArray(line)) n += line[0];
    }
    return n;
  }, [cart]);

  const subtotal = useMemo(() => {
    let t = 0;
    for (const line of Object.values(cart)) {
      if (Array.isArray(line) && line.length >= 3) t += line[0] * line[2];
    }
    return t;
  }, [cart]);

  const addToCart = useCallback((productId: number, name: string, price: number, delta = 1) => {
    const key = `pr${productId}`;
    setCart((prev) => {
      const next = { ...prev };
      const cur = next[key];
      if (cur && Array.isArray(cur)) {
        next[key] = [cur[0] + delta, name, price];
      } else {
        next[key] = [delta, name, price];
      }
      return next;
    });
  }, []);

  const setLineQuantity = useCallback((productId: number, qty: number) => {
    const key = `pr${productId}`;
    setCart((prev) => {
      const next = { ...prev };
      const cur = next[key];
      if (!cur || !Array.isArray(cur)) return prev;
      if (qty < 1) {
        delete next[key];
        return next;
      }
      next[key] = [qty, cur[1], cur[2]];
      return next;
    });
  }, []);

  const removeLine = useCallback((productId: number) => {
    const key = `pr${productId}`;
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const value = useMemo(
    () => ({
      cart,
      ready,
      itemCount,
      subtotal,
      addToCart,
      setLineQuantity,
      removeLine,
      clearCart,
    }),
    [cart, ready, itemCount, subtotal, addToCart, setLineQuantity, removeLine, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
