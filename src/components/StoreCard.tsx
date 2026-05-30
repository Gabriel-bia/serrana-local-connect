import { Link } from "@tanstack/react-router";
import type { Store } from "@/data/seed";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      to="/loja/$id"
      params={{ id: store.id }}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <img
        src={store.logo}
        alt={store.name}
        loading="lazy"
        className="h-16 w-16 rounded-lg object-cover ring-2 ring-primary/20"
      />
      <div className="min-w-0">
        <h3 className="truncate font-semibold">{store.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{store.description}</p>
      </div>
    </Link>
  );
}
