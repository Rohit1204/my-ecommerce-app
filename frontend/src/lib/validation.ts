/** Pragmatic email shape; not a full RFC parser — backend still validates. */
export function isValidEmailFormat(value: string): boolean {
  const t = value.trim();
  if (t.length === 0) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
