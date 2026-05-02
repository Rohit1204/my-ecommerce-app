/** Allow only same-origin relative paths (e.g. `/checkout`), not `//evil.com`. */
export function safeInternalPath(next: string | null | undefined): string | undefined {
  if (next == null || next === "") return undefined;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return undefined;
  return t;
}
