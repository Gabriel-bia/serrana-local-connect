import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type {
  Banner,
  Category,
  Product,
  Provider,
  ServiceCategory,
  Store,
  StoreCategory,
} from "@/data/seed";

export type CatalogData = {
  categories: Category[];
  serviceCategories: ServiceCategory[];
  storeCategories: StoreCategory[];
  banners: Banner[];
  stores: Store[];
  providers: Provider[];
  products: Product[];
};

type Row = Record<string, unknown>;

/**
 * Carrega o catálogo essencial no servidor (usado no loader da home),
 * para que o primeiro HTML já contenha produtos, lojas e prestadores.
 * Publico: usa a chave publishable + políticas SELECT anon.
 */
export const loadPriorityCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogData> => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) {
      console.error("[catalog] missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
      return emptyCatalog();
    }

    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const [categories, serviceCategories, storeCategories, banners, stores, providers, products] =
      await Promise.all([
        sb.from("categories").select("*"),
        sb.from("service_categories").select("*"),
        sb.from("store_categories").select("*"),
        sb.from("banners").select("*"),
        sb.from("stores").select("*"),
        sb.from("providers").select("*"),
        sb.from("products").select("*"),
      ]);

    const rows = (r: { data: unknown[] | null; error: { message: string } | null }): Row[] => {
      if (r.error) console.error("[catalog] query failed:", r.error.message);
      return ((r.data ?? []) as Row[]) ?? [];
    };

    return {
      categories: rows(categories).map((x): Category => ({
        id: String(x.id ?? ""),
        slug: String(x.slug ?? ""),
        name: String(x.name ?? ""),
        icon: String(x.icon ?? ""),
      })),
      serviceCategories: rows(serviceCategories).map((x): ServiceCategory => ({
        id: String(x.id ?? ""),
        slug: String(x.slug ?? ""),
        name: String(x.name ?? ""),
        icon: String(x.icon ?? ""),
      })),
      storeCategories: rows(storeCategories).map((x): StoreCategory => ({
        id: String(x.id ?? ""),
        storeId: String(x.store_id ?? ""),
        name: String(x.name ?? ""),
        position: Number(x.position ?? 0),
      })),
      banners: rows(banners).map((x): Banner => ({
        id: String(x.id ?? ""),
        title: String(x.title ?? ""),
        subtitle: String(x.subtitle ?? ""),
        image: String(x.image ?? ""),
        link: x.link ? String(x.link) : undefined,
      })),
      stores: rows(stores).map((x): Store => ({
        id: String(x.id ?? ""),
        name: String(x.name ?? ""),
        logo: String(x.logo ?? ""),
        banner: String(x.banner ?? ""),
        description: String(x.description ?? ""),
        categoryId: String(x.category_id ?? ""),
        whatsapp: String(x.whatsapp ?? ""),
        instagram: x.instagram ? String(x.instagram) : undefined,
        address: x.address ? String(x.address) : undefined,
        featured: Boolean(x.featured),
        blocked: x.blocked ? true : undefined,
      })),
      providers: rows(providers).map((x): Provider => ({
        id: String(x.id ?? ""),
        name: String(x.name ?? ""),
        photo: String(x.photo ?? ""),
        cover: String(x.cover ?? ""),
        description: String(x.description ?? ""),
        whatsapp: String(x.whatsapp ?? ""),
        phone: x.phone ? String(x.phone) : undefined,
        city: x.city ? String(x.city) : undefined,
        serviceArea: x.service_area ? String(x.service_area) : undefined,
        instagram: x.instagram ? String(x.instagram) : undefined,
        facebook: x.facebook ? String(x.facebook) : undefined,
        schedule: x.schedule ? String(x.schedule) : undefined,
        categoryIds: Array.isArray(x.category_ids) ? (x.category_ids as string[]) : [],
        featured: Boolean(x.featured),
        blocked: x.blocked ? true : undefined,
      })),
      products: rows(products).map((x): Product => ({
        id: String(x.id ?? ""),
        name: String(x.name ?? ""),
        image: String(x.image ?? ""),
        price: Number(x.price ?? 0),
        originalPrice: x.original_price != null ? Number(x.original_price) : undefined,
        description: String(x.description ?? ""),
        categoryId: String(x.category_id ?? ""),
        storeId: String(x.store_id ?? ""),
        storeCategoryId: x.store_category_id ? String(x.store_category_id) : undefined,
        externalLink: x.external_link ? String(x.external_link) : undefined,
        whatsapp: String(x.whatsapp ?? ""),
        featured: Boolean(x.featured),
        createdAt: x.created_at ? String(x.created_at) : undefined,
      })),
    };
  },
);

function emptyCatalog(): CatalogData {
  return {
    categories: [],
    serviceCategories: [],
    storeCategories: [],
    banners: [],
    stores: [],
    providers: [],
    products: [],
  };
}

/**
 * Faz upload de uma imagem (data URL) para o bucket público de catálogo.
 * Somente administradores autenticados podem chamar.
 */
export const uploadCatalogImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { dataUrl: string; table: string }) =>
      data as { dataUrl: string; table: string },
  )
  .handler(async ({ data, context }) => {
    const { dataUrl, table } = data;
    if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(dataUrl)) {
      throw new Error("Formato de imagem inválido.");
    }
    if (!/^[a-z_]+$/.test(table)) {
      throw new Error("Tabela inválida.");
    }

    const { data: isAdmin } = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Acesso restrito a administradores.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const m = /^data:([^;,]+)?;base64,(.*)$/s.exec(dataUrl)!;
    const mime = m[1] || "image/jpeg";
    const kind = mime.split("/")[1].toLowerCase();
    const ext = kind === "jpeg" ? "jpg" : kind === "svg+xml" ? "svg" : kind;
    const path = `${table}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = Buffer.from(m[2], "base64");

    const { error } = await supabaseAdmin.storage
      .from("catalog-images")
      .upload(path, bytes, { contentType: mime, upsert: true });
    if (error) throw new Error(error.message);

    return { url: supabaseAdmin.storage.from("catalog-images").getPublicUrl(path).data.publicUrl };
  });
