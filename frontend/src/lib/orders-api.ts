import { getApiBase } from "@/lib/api-config";
import type { CartState } from "@/lib/cart-types";

export type CreateOrderResult = {
  order_id: number;
  paytm: { action: string; fields: Record<string, string> } | null;
  idempotent?: boolean;
};

export async function createOrder(
  payload: {
    name: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip_code: string;
    items: CartState;
    amount: number;
    idempotency_key: string;
  },
  accessToken: string,
): Promise<CreateOrderResult> {
  const res = await fetch(`${getApiBase()}/api/v1/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 401) {
    throw new Error("Your session expired. Please sign in again.");
  }
  if (!res.ok) {
    const detail = data.detail;
    let msg: string;
    if (typeof detail === "string") msg = detail;
    else if (detail && typeof detail === "object") msg = JSON.stringify(detail);
    else msg = res.statusText || "Could not place order";
    throw new Error(msg);
  }
  return data as unknown as CreateOrderResult;
}
