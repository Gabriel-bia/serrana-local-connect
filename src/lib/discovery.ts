export const PUBLIC_ORIGIN = "https://serrana-express.lovable.app";

export function publicProfileUrl(kind: "loja" | "prestador", id: string) {
  return `${PUBLIC_ORIGIN}/${kind}/${encodeURIComponent(id)}`;
}

export function publicProductUrl(id: string) {
  return `${PUBLIC_ORIGIN}/produto/${encodeURIComponent(id)}`;
}

export function publicServiceUrl(id: string) {
  return `${PUBLIC_ORIGIN}/servico/${encodeURIComponent(id)}`;
}

export function productShareMessage(product: { id: string; name: string; price: number }) {
  const price = Number.isFinite(product.price) && product.price > 0
    ? ` — ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}`
    : " — valor a combinar";
  return `Confira este produto que encontrei no Serrana Express!\n\n• ${product.name}${price}\n\nVeja todos os detalhes:\n${publicProductUrl(product.id)}`;
}

export function serviceShareMessage(service: { id: string; name: string; price?: number | null }, provider?: { name: string }) {
  const price = service.price != null && Number.isFinite(service.price) && service.price > 0
    ? ` — ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price)}`
    : " — valor a combinar";
  const by = provider?.name ? `\nPrestador: ${provider.name}` : "";
  return `Confira este serviço que encontrei no Serrana Express!\n\n• ${service.name}${price}${by}\n\nVeja todos os detalhes:\n${publicServiceUrl(service.id)}`;
}

export function providerShareMessage(provider: { id: string; name: string; city?: string }) {
  const city = provider.city ? `\n${provider.city}` : "";
  return `Conheça ${provider.name} no Serrana Express!${city}\n\nVeja o perfil completo:\n${publicProfileUrl("prestador", provider.id)}`;
}

export function storeShareMessage(store: { id: string; name: string; description?: string }) {
  const description = store.description?.trim() ? `\n${store.description.trim()}` : "";
  return `Conheça a loja ${store.name} no Serrana Express!${description}\n\nVeja todos os produtos:\n${publicProfileUrl("loja", store.id)}`;
}

export function workShareMessage(work: { providerId: string; title: string; description?: string }) {
  const description = work.description?.trim() ? `\n${work.description.trim()}` : "";
  return `Olha este trabalho que encontrei no Serrana Express!\n\n• ${work.title}${description}\n\nVeja mais no perfil do prestador:\n${publicProfileUrl("prestador", work.providerId)}`;
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