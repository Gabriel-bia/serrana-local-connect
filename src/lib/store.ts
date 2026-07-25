import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type {
  Banner,
  Category,
  Product,
  Service,
  ServiceCategory,
  Provider,
  ProviderService,
  ProviderWork,
  Store,
  StoreCategory,
} from "@/data/seed";

type DataShape = {
  categories: Category[];
  stores: Store[];
  storeCategories: StoreCategory[];
  products: Product[];
  services: Service[];
  banners: Banner[];
  serviceCategories: ServiceCategory[];
  providers: Provider[];
  providerServices: ProviderService[];
  providerWorks: ProviderWork[];
};

const empty = (): DataShape => ({
  categories: [],
  stores: [],
  storeCategories: [],
  products: [],
  services: [],
  banners: [],
  serviceCategories: [],
  providers: [],
  providerServices: [],
  providerWorks: [],
});


let state: DataShape = empty();
let ready = false;
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}


// ============ Row mappers (DB snake_case <-> camelCase types) ============

type Row = Record<string, unknown>;

const map = {
  categories: {
    table: "categories",
    fromRow: (r: Row): Category => ({
      id: r.id as string,
      slug: (r.slug as string) ?? "",
      name: (r.name as string) ?? "",
      icon: (r.icon as string) ?? "",
    }),
    toRow: (c: Category): Row => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon }),
  },
  serviceCategories: {
    table: "service_categories",
    fromRow: (r: Row): ServiceCategory => ({
      id: r.id as string,
      slug: (r.slug as string) ?? "",
      name: (r.name as string) ?? "",
      icon: (r.icon as string) ?? "",
    }),
    toRow: (c: ServiceCategory): Row => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon }),
  },
  banners: {
    table: "banners",
    fromRow: (r: Row): Banner => ({
      id: r.id as string,
      title: (r.title as string) ?? "",
      subtitle: (r.subtitle as string) ?? "",
      image: (r.image as string) ?? "",
      link: (r.link as string) ?? undefined,
    }),
    toRow: (b: Banner): Row => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      image: b.image,
      link: b.link ?? null,
    }),
  },
  stores: {
    table: "stores",
    fromRow: (r: Row): Store => ({
      id: r.id as string,
      name: (r.name as string) ?? "",
      logo: (r.logo as string) ?? "",
      banner: (r.banner as string) ?? "",
      description: (r.description as string) ?? "",
      categoryId: (r.category_id as string) ?? "",
      whatsapp: (r.whatsapp as string) ?? "",
      instagram: (r.instagram as string) ?? undefined,
      address: (r.address as string) ?? undefined,
      featured: Boolean(r.featured),
      blocked: r.blocked ? true : undefined,
    }),
    toRow: (s: Store): Row => ({
      id: s.id,
      name: s.name,
      logo: s.logo ?? "",
      banner: s.banner ?? "",
      description: s.description ?? "",
      category_id: s.categoryId || null,
      whatsapp: s.whatsapp ?? "",
      instagram: s.instagram ?? null,
      address: s.address ?? null,
      featured: !!s.featured,
      blocked: !!s.blocked,
    }),
  },
  products: {
    table: "products",
    fromRow: (r: Row): Product => ({
      id: r.id as string,
      name: (r.name as string) ?? "",
      image: (r.image as string) ?? "",
      price: Number(r.price ?? 0),
      originalPrice: r.original_price != null ? Number(r.original_price) : undefined,
      description: (r.description as string) ?? "",
      categoryId: (r.category_id as string) ?? "",
      storeId: (r.store_id as string) ?? "",
      externalLink: (r.external_link as string) ?? undefined,
      whatsapp: (r.whatsapp as string) ?? "",
      featured: Boolean(r.featured),
      createdAt: (r.created_at as string) ?? undefined,
    }),
    toRow: (p: Product): Row => ({
      id: p.id,
      name: p.name,
      image: p.image ?? "",
      price: Number(p.price ?? 0),
      original_price: p.originalPrice != null && p.originalPrice > 0 ? Number(p.originalPrice) : null,
      description: p.description ?? "",
      category_id: p.categoryId || null,
      store_id: p.storeId || null,
      external_link: p.externalLink ?? null,
      whatsapp: p.whatsapp ?? "",
      featured: !!p.featured,
    }),
  },
  services: {
    table: "services",
    fromRow: (r: Row): Service => ({
      id: r.id as string,
      name: (r.name as string) ?? "",
      image: (r.image as string) ?? "",
      description: (r.description as string) ?? "",
      storeId: (r.store_id as string) ?? "",
      whatsapp: (r.whatsapp as string) ?? "",
      featured: Boolean(r.featured),
    }),
    toRow: (s: Service): Row => ({
      id: s.id,
      name: s.name,
      image: s.image ?? "",
      description: s.description ?? "",
      store_id: s.storeId || null,
      whatsapp: s.whatsapp ?? "",
      featured: !!s.featured,
    }),
  },
  providers: {
    table: "providers",
    fromRow: (r: Row): Provider => ({
      id: r.id as string,
      name: (r.name as string) ?? "",
      photo: (r.photo as string) ?? "",
      cover: (r.cover as string) ?? "",
      description: (r.description as string) ?? "",
      whatsapp: (r.whatsapp as string) ?? "",
      phone: (r.phone as string) ?? undefined,
      city: (r.city as string) ?? undefined,
      serviceArea: (r.service_area as string) ?? undefined,
      instagram: (r.instagram as string) ?? undefined,
      facebook: (r.facebook as string) ?? undefined,
      schedule: (r.schedule as string) ?? undefined,
      categoryIds: (r.category_ids as string[]) ?? [],
      featured: Boolean(r.featured),
      blocked: r.blocked ? true : undefined,
    }),
    toRow: (p: Provider): Row => ({
      id: p.id,
      name: p.name,
      photo: p.photo ?? "",
      cover: p.cover ?? "",
      description: p.description ?? "",
      whatsapp: p.whatsapp ?? "",
      phone: p.phone ?? null,
      city: p.city ?? null,
      service_area: p.serviceArea ?? null,
      instagram: p.instagram ?? null,
      facebook: p.facebook ?? null,
      schedule: p.schedule ?? null,
      category_ids: p.categoryIds ?? [],
      featured: !!p.featured,
      blocked: !!p.blocked,
    }),
  },
  providerServices: {
    table: "provider_services",
    fromRow: (r: Row): ProviderService => ({
      id: r.id as string,
      providerId: (r.provider_id as string) ?? "",
      name: (r.name as string) ?? "",
      description: (r.description as string) ?? "",
      price: r.price != null ? Number(r.price) : undefined,
      image: (r.image as string) ?? "",
      categoryId: (r.category_id as string) ?? "",
      duration: (r.duration as string) ?? undefined,
      active: r.active !== false,
      featured: Boolean(r.featured),
    }),
    toRow: (s: ProviderService): Row => ({
      id: s.id,
      provider_id: s.providerId || null,
      name: s.name,
      description: s.description ?? "",
      price: s.price ?? null,
      image: s.image ?? "",
      category_id: s.categoryId || null,
      duration: s.duration ?? null,
      active: s.active !== false,
      featured: !!s.featured,
    }),
  },
  providerWorks: {
    table: "provider_works",
    fromRow: (r: Row): ProviderWork => ({
      id: r.id as string,
      providerId: (r.provider_id as string) ?? "",
      title: (r.title as string) ?? "",
      description: (r.description as string) ?? "",
      image: (r.image as string) ?? "",
      date: (r.date as string) ?? "",
    }),
    toRow: (w: ProviderWork): Row => ({
      id: w.id,
      provider_id: w.providerId || null,
      title: w.title,
      description: w.description ?? "",
      image: w.image ?? "",
      date: w.date ?? "",
    }),
  },
} satisfies Record<keyof DataShape, { table: string; fromRow: (r: Row) => unknown; toRow: (x: never) => Row }>;

// ============ Load + realtime ============

let loaded = false;
let loadPromise: Promise<void> | null = null;

// Supabase typed client requires literal table names; we resolve dynamically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sbAny = supabase as any;

async function loadAll(): Promise<void> {
  const keys = Object.keys(map) as (keyof DataShape)[];
  const results = await Promise.all(
    keys.map((k) => sbAny.from(map[k].table).select("*")),
  );
  const next = empty();
  keys.forEach((k, i) => {
    const rows = (results[i].data ?? []) as Row[];
    const cfg = map[k];
    (next[k] as unknown[]) = rows.map((r) => cfg.fromRow(r));
  });
  state = next;
  ready = true;
  notify();
}

export function useDataReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => ready,
  );
}


function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  loadPromise = loadAll().catch((err) => {
    console.error("[store] initial load failed", err);
  });
  const channel = supabase.channel("serrana-data-sync");
  (Object.values(map) as { table: string }[]).forEach((cfg) => {
    channel.on(
      "postgres_changes" as never,
      { event: "*", schema: "public", table: cfg.table },
      () => {
        loadAll().catch((err) => console.error("[store] realtime reload failed", err));
      },
    );
  });
  channel.subscribe();
}

ensureLoaded();

export function useData(): DataShape {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export const dataApi = {
  get: () => state,
  ready: () => loadPromise ?? Promise.resolve(),
  reload: () => loadAll(),
  async upsert<K extends keyof DataShape>(key: K, item: DataShape[K][number]) {
    const cfg = map[key];
    // optimistic local update
    const arr = state[key] as Array<{ id: string }>;
    const idx = arr.findIndex((x) => x.id === (item as { id: string }).id);
    const next = [...arr];
    if (idx >= 0) next[idx] = item as never;
    else next.push(item as never);
    state = { ...state, [key]: next as DataShape[K] };
    notify();
    const { error } = await sbAny.from(cfg.table).upsert(cfg.toRow(item as never));
    if (error) {
      console.error(`[store] upsert ${key} failed`, error);
      toast.error(`Falha ao salvar: ${error.message}`);
      loadAll();
      throw error;
    }
  },
  async remove<K extends keyof DataShape>(key: K, id: string) {
    const cfg = map[key];
    const arr = state[key] as Array<{ id: string }>;
    state = { ...state, [key]: arr.filter((x) => x.id !== id) as DataShape[K] };
    notify();
    const { error } = await sbAny.from(cfg.table).delete().eq("id", id);
    if (error) {
      console.error(`[store] remove ${key} failed`, error);
      toast.error(`Falha ao excluir: ${error.message}`);
      loadAll();
      throw error;
    }
  },
  /** One-time migration: upload current localStorage snapshot to the cloud. */
  async importFromLocalStorage(): Promise<{ inserted: Record<string, number> }> {
    if (typeof window === "undefined") throw new Error("Disponível apenas no navegador.");
    const raw = localStorage.getItem("serrana-express-data-v3");
    if (!raw) throw new Error("Nenhum dado encontrado neste dispositivo.");
    const parsed = JSON.parse(raw) as Partial<DataShape>;
    const order: (keyof DataShape)[] = [
      "categories",
      "serviceCategories",
      "banners",
      "stores",
      "providers",
      "products",
      "services",
      "providerServices",
      "providerWorks",
    ];
    const inserted: Record<string, number> = {};
    for (const k of order) {
      const items = (parsed[k] ?? []) as DataShape[typeof k];
      if (!items.length) {
        inserted[k] = 0;
        continue;
      }
      const cfg = map[k];
      const rows = items.map((i) => cfg.toRow(i as never));
      // chunk to avoid request size limits
      const chunkSize = 200;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const slice = rows.slice(i, i + chunkSize);
        const { error } = await sbAny.from(cfg.table).upsert(slice);
        if (error) {
          console.error(`[import] ${cfg.table} failed`, error);
          throw new Error(`${cfg.table}: ${error.message}`);
        }
      }
      inserted[k] = items.length;
    }
    await loadAll();
    return { inserted };
  },
};

/** Mantém compat: gera link válido a partir do número salvo. */
export function isValidWhatsappLink(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return v.startsWith("https://wa.me/") || v.startsWith("https://api.whatsapp.com/");
}

export function buildWhatsappLink(stored: string, message?: string): string {
  if (!stored) return "#";
  const raw = stored.trim();
  let url: URL;
  try {
    if (isValidWhatsappLink(raw)) {
      url = new URL(raw);
    } else {
      const digits = raw.replace(/\D/g, "");
      url = new URL(`https://wa.me/${digits}`);
    }
  } catch {
    return raw;
  }
  if (message && !url.searchParams.has("text")) {
    url.searchParams.set("text", message);
  }
  return url.toString();
}

export function formatPrice(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function isStoreVisible(store: { blocked?: boolean }): boolean {
  return !store.blocked;
}
