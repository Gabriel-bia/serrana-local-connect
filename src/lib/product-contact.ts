/** The linked store is the source of truth; standalone cards retain their contact. */
export function productWhatsapp(
  product: { whatsapp?: string },
  store?: { whatsapp: string },
): string {
  return store ? store.whatsapp : product.whatsapp ?? "";
}