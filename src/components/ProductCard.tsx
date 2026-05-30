import { Link } from "@tanstack/react-router";
import type { Product, Store } from "@/data/seed";
import { formatPrice } from "@/lib/store";

export function ProductCard({ product, store }: { product: Product; store?: Store }) {
  return (
    <Link
      to="/produto/$id"
      params={{ id: product.id }}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
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
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</h3>
        {store && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{store.name}</p>}
        <p className="mt-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
