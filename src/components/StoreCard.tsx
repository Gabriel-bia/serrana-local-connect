import { Link } from "@tanstack/react-router";
import type { Store } from "@/data/seed";
import { ShareButton } from "@/components/ShareButton";
import { storeShareMessage, publicProfileUrl } from "@/lib/discovery";

export function StoreCard({ store, categoryName }: { store: Store; categoryName?: string }) {
  const cover = store.banner || store.logo;
  return (
    <Link
      to="/loja/$id"
      params={{ id: store.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={store.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{store.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          {categoryName && (
            <span className="inline-block rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {categoryName}
            </span>
          )}
          <span
            data-product-action
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="ml-auto"
          >
            <ShareButton
              variant="icon"
              label={`Compartilhar ${store.name}`}
              title={store.name}
              text={storeShareMessage(store)}
              url={publicProfileUrl("loja", store.id)}
              imageUrl={store.banner || store.logo}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
