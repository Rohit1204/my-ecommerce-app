import type { CatalogSection, Product } from "@/lib/types";
import { getApiBase } from "@/lib/api-config";

export async function fetchCatalog(): Promise<CatalogSection[]> {
  const res = await fetch(`${getApiBase()}/api/v1/catalog/`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Catalog failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${getApiBase()}/api/v1/products/${id}/`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Product failed: ${res.status}`);
  }
  return res.json();
}

/** Same-category picks for PDP “You may also like” (excludes current id). */
export async function fetchRelatedProducts(
  category: string,
  excludeId: number,
  limit = 4,
): Promise<Product[]> {
  if (!category) return [];
  const catalog = await fetchCatalog();
  const section = catalog.find(
    (s) => s.category.toLowerCase() === category.toLowerCase(),
  );
  if (!section) return [];
  return section.products.filter((p) => p.id !== excludeId).slice(0, limit);
}
