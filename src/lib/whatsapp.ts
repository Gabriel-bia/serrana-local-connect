import { PUBLIC_ORIGIN, publicProductUrl, publicProfileUrl } from "./discovery";

export function isValidWhatsappLink(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return v.startsWith("https://wa.me/") || v.startsWith("https://api.whatsapp.com/");
}

/** Item contacts replace saved text; general contacts keep the registered message. */
export function buildWhatsappLink(stored: string, message?: string, replaceMessage = false): string {
  if (!stored) return "#";
  const raw = stored.trim();
  let url: URL;
  try {
    url = isValidWhatsappLink(raw) ? new URL(raw) : new URL(`https://wa.me/${raw.replace(/\D/g, "")}`);
  } catch {
    return raw;
  }
  if (message && (replaceMessage || !url.searchParams.has("text"))) url.searchParams.set("text", message);
  return url.toString();
}

export function itemContactMessage(kind: "produto" | "servico", item: { id: string; name: string; price?: number | null; providerId?: string; image?: string }) {
  const price = item.price != null && Number.isFinite(item.price) && item.price > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)
    : "valor a combinar";
  const url = kind === "produto" ? publicProductUrl(item.id)
    : item.providerId ? publicProfileUrl("prestador", item.providerId)
    : `${PUBLIC_ORIGIN}/servico/${encodeURIComponent(item.id)}`;
  let photo = "";
  if (kind === "produto" && item.image) {
    try {
      const image = new URL(item.image);
      if (image.protocol === "https:") photo = `\n\nFoto do produto:\n${image.href}`;
    } catch {
      // Only public absolute image links can be opened by the recipient.
    }
  }
  return `Olá, vim pelo app Serrana Express! Tenho interesse no ${kind === "produto" ? "produto" : "serviço"}:\n\n• ${item.name} — ${price}${photo}\n\n${url}`;
}