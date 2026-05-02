import type { Metadata } from "next";
import { TrackerForm } from "./TrackerForm";

export const metadata: Metadata = {
  title: "Track order · ShopHub",
  description: "Look up order status with your order id and email.",
};

export default function TrackerPage() {
  return <TrackerForm />;
}
