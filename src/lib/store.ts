import { useSyncExternalStore } from "react";
import {
  seedBanners,
  seedCategories,
  seedProducts,
  seedServices,
  seedStores,
  seedServiceCategories,
  seedProviders,
  seedProviderServices,
  seedProviderWorks,
  type Banner,
  type Category,
  type Product,
  type Service,
  type ServiceCategory,
  type Provider,
  type ProviderService,
  type ProviderWork,
  type Store,
} from "@/data/seed";

type DataShape = {
  categories: Category[];
  stores: Store[];
  products: Product[];
  services: Service[];
  banners: Banner[];
  serviceCategories: ServiceCategory[];
  providers: Provider[];
  providerServices: ProviderService[];
  providerWorks: ProviderWork[];
};

const KEY = "serrana-express-data-v3";

function defaults(): DataShape {
  return {
    categories: seedCategories,
    stores: seedStores,
    products: seedProducts,
    services: seedServices,
    banners: seedBanners,
    serviceCategories: seedServiceCategories,
    providers: seedProviders,
    providerServices: seedProviderServices,
    providerWorks: seedProviderWorks,
  };
}

function loadInitial(): DataShape {
  const base = defaults();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DataShape>;
      return { ...base, ...parsed };
    }
  } catch {}
  try {
    localStorage.setItem(KEY, JSON.stringify(base));
  } catch {}
  return base;
}

let state: DataShape = loadInitial();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useData(): DataShape {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export const dataApi = {
  get: () => state,
  reset: () => {
    state = {
      categories: seedCategories,
      stores: seedStores,
      products: seedProducts,
      services: seedServices,
      banners: seedBanners,
    };
    persist();
  },
  upsert<K extends keyof DataShape>(
    key: K,
    item: DataShape[K][number],
  ) {
    const arr = state[key] as Array<{ id: string }>;
    const idx = arr.findIndex((x) => x.id === (item as { id: string }).id);
    const next = [...arr];
    if (idx >= 0) next[idx] = item as never;
    else next.push(item as never);
    state = { ...state, [key]: next as DataShape[K] };
    persist();
  },
  remove<K extends keyof DataShape>(key: K, id: string) {
    const arr = state[key] as Array<{ id: string }>;
    state = {
      ...state,
      [key]: arr.filter((x) => x.id !== id) as DataShape[K],
    };
    persist();
  },
};

/**
 * Valida se uma string é um link oficial do WhatsApp.
 */
export function isValidWhatsappLink(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return v.startsWith("https://wa.me/") || v.startsWith("https://api.whatsapp.com/");
}

/**
 * Recebe o valor salvo (link completo do WhatsApp colado pelo admin) e
 * devolve uma URL pronta para uso, opcionalmente adicionando uma mensagem.
 * Mantém compatibilidade com dados antigos que armazenavam apenas números.
 */
export function buildWhatsappLink(stored: string, message?: string): string {
  if (!stored) return "#";
  const raw = stored.trim();

  let url: URL;
  try {
    if (isValidWhatsappLink(raw)) {
      url = new URL(raw);
    } else {
      // Compat: valor antigo era apenas o número.
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

/** Lojas visíveis para o público (não bloqueadas). */
export function isStoreVisible(store: { blocked?: boolean }): boolean {
  return !store.blocked;
}
