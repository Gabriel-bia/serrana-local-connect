import { useSyncExternalStore } from "react";
import {
  seedBanners,
  seedCategories,
  seedProducts,
  seedServices,
  seedStores,
  type Banner,
  type Category,
  type Product,
  type Service,
  type Store,
} from "@/data/seed";

type DataShape = {
  categories: Category[];
  stores: Store[];
  products: Product[];
  services: Service[];
  banners: Banner[];
};

const KEY = "serrana-express-data-v1";

function loadInitial(): DataShape {
  if (typeof window === "undefined") {
    return {
      categories: seedCategories,
      stores: seedStores,
      products: seedProducts,
      services: seedServices,
      banners: seedBanners,
    };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DataShape;
  } catch {}
  const initial: DataShape = {
    categories: seedCategories,
    stores: seedStores,
    products: seedProducts,
    services: seedServices,
    banners: seedBanners,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(initial));
  } catch {}
  return initial;
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

export function whatsappLink(number: string, message?: string) {
  const clean = number.replace(/\D/g, "");
  const m = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${clean}${m}`;
}

export function formatPrice(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
