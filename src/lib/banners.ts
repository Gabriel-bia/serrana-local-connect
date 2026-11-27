import type { Banner } from "@/data/seed";

/** Banners ativos, com imagem e dentro do período programado, ordenados. */
export function visibleBanners(banners: Banner[], now: number): Banner[] {
  return banners
    .filter((b) => b.active !== false && !!b.image)
    .filter((b) => !b.startsAt || new Date(b.startsAt).getTime() <= now)
    .filter((b) => !b.endsAt || new Date(b.endsAt).getTime() > now)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function isExternalLink(link: string) {
  return /^https?:\/\//i.test(link);
}
