import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { Product, Store } from "@/data/seed";
import { formatPrice, buildWhatsappLink } from "@/lib/store";
import { logWhatsappClick } from "@/lib/whatsapp-clicks";


export function ProductCard({ product, store }: { product: Product; store?: Store }) {
  const waLink = product.whatsapp || store?.whatsapp;
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            Destaque
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{product.name}</h3>
        <p className="mt-2 text-lg font-extrabold text-primary">{formatPrice(product.price)}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          {store && <p className="truncate text-xs text-muted-foreground">{store.name}</p>}
          {waLink && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (store) logWhatsappClick({ storeId: store.id, storeName: store.name });
                window.open(
                  buildWhatsappLink(waLink, `Olá! Tenho interesse no produto "${product.name}".`),
                  "_blank",
                );
              }}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-whatsapp)] text-[var(--color-whatsapp-foreground)] shadow-sm transition hover:opacity-90"
              aria-label="Conversar no WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </span>
          )}

        </div>
      </div>
    </Link>
  );
}
