/** Matches legacy Django `localStorage.cart`: pr<id> → [qty, name, unitPrice]. */
export type CartLine = [number, string, number];

export type CartState = Record<string, CartLine>;
