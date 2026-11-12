import { Link } from "@tanstack/react-router";
import { Check, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Product, Store } from "@/data/seed";
import { formatPrice, buildWhatsappLink } from "@/lib/store";
import { logWhatsappClick } from "@/lib/whatsapp-clicks";


export type ProductSelection = { active: boolean; selected: boolean; toggle: () => void };

export function ProductCard({ product, store, selection }: { product: Product; store?: Store; selection?: ProductSelection }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const held = useRef(false);
  const cancelHold = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancelHold, []);
  const waLink = product.whatsapp || store?.whatsapp;
  const originalPrice = product.originalPrice;
  const hasPromo =
    originalPrice != null && originalPrice > 0 && originalPrice > product.price;
  const discount = hasPromo
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      aria-label={selection?.active ? `${product.name}, ${selection.selected ? "selecionado" : "não selecionado"}` : undefined}
      onPointerDown={(e) => {
        if (!selection || e.button !== 0 || (e.target as Element).closest("[data-product-action]")) return;
        held.current = false;
        start.current = { x: e.clientX, y: e.clientY };
        cancelHold();
        if (!selection.active) timer.current = setTimeout(() => { held.current = true; selection.toggle(); }, 500);
      }}
      onPointerMove={(e) => { if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) cancelHold(); }}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onContextMenu={(e) => { if (selection) e.preventDefault(); }}
      onDragStart={(e) => { if (selection) e.preventDefault(); }}
      onClick={(e) => {
        if (held.current || selection?.active) {
          e.preventDefault();
          e.stopPropagation();
          if (!held.current) selection?.toggle();
          held.current = false;
        }
      }}
      className={`group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition motion-reduce:transition-none hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] ${selection ? "select-none [-webkit-touch-callout:none]" : ""} ${selection?.selected ? "ring-2 ring-primary bg-accent" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          draggable={false}
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {selection?.active && <span className={`absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full border-2 ${selection.selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`} aria-hidden="true">{selection.selected && <Check className="h-4 w-4" />}</span>}
        {hasPromo && (
          <span className="absolute top-2 right-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive-foreground">
            -{discount}%
          </span>
        )}
        {product.featured && (
          <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            Destaque
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{product.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-lg font-extrabold text-primary">{formatPrice(product.price)}</p>
          {hasPromo && (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(originalPrice)}</p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          {store && <p className="truncate text-xs text-muted-foreground">{store.name}</p>}
          {waLink && !selection?.active && (
            <span
              data-product-action
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (store) logWhatsappClick({ storeId: store.id, storeName: store.name });
                window.open(
                  buildWhatsappLink(
                    waLink,
                    `Olá, vim pelo app Serrana Express! Tenho interesse no produto "${product.name}".`,
                  ),
                  "_blank",
                  "noopener,noreferrer",
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
