import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout · ShopHub",
  description: "Review your bag and enter shipping details.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
