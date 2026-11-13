export type AdminFilters = { query: string; category: string; status: string };
export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}
export function matchesAdminSearch(fields: (string | undefined)[], filters: AdminFilters, categoryIds: string[] = [], active?: boolean) {
  if (filters.category && !categoryIds.includes(filters.category)) return false;
  if (filters.status && active !== (filters.status === "active")) return false;
  const haystack = normalizeSearch(fields.filter(Boolean).join(" "));
  return normalizeSearch(filters.query).split(/\s+/).every((word) => haystack.includes(word) || (/^\d+$/.test(word) && haystack.replace(/\D/g, "").includes(word)));
}
export function isProductActive(product: { active?: boolean }) { return product.active !== false; }