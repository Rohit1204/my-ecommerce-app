/** Stable fragment id for category sections / jump links (ASCII slug). */
export function categoryAnchorSlug(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
