export const PUBLIC_ORIGIN = "https://serrana-express.lovable.app";

export function publicProfileUrl(kind: "loja" | "prestador", id: string) {
  return `${PUBLIC_ORIGIN}/${kind}/${encodeURIComponent(id)}`;
}

function rank(value: string, seed: number) {
  let hash = seed >>> 0;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  return hash >>> 0;
}

export function orderProducts<T extends { id: string; featured?: boolean }>(products: T[], seed: number | null) {
  const unique = [...new Map(products.map((p) => [p.id, p])).values()];
  if (seed === null) return unique;
  return unique.sort((a, b) => {
    const keyA = `${a.featured ? "featured" : "common"}:${a.id}`;
    const keyB = `${b.featured ? "featured" : "common"}:${b.id}`;
    return rank(keyA, seed) - rank(keyB, seed) || a.id.localeCompare(b.id);
  });
}

export function partitionProducts<T extends { id: string; featured?: boolean }>(products: T[], seed: number | null) {
  const ordered = orderProducts(products, seed);
  return { featured: ordered.filter((p) => p.featured), common: ordered.filter((p) => !p.featured) };
}

export function toggleProduct(ids: Set<string>, id: string) {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function selectedProductsMessage(store: { id: string; name: string }, products: { storeId: string; name: string; price: number }[]) {
  const items = products.filter((p) => p.storeId === store.id).map((p) => {
    const price = Number.isFinite(p.price) && p.price > 0 ? ` — ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price)}` : " — valor a combinar";
    return `• ${p.name}${price}`;
  });
  return `Confira estes produtos que encontrei na loja ${store.name}!\n\n${items.join("\n")}\n\nVeja todos os detalhes diretamente na loja:\n${publicProfileUrl("loja", store.id)}`;
}