import { Link } from "@tanstack/react-router";
import type { Provider } from "@/data/seed";
import { ShareButton } from "@/components/ShareButton";
import { providerShareMessage, publicProfileUrl } from "@/lib/discovery";

export function ProviderCard({
  provider,
  categoryName,
}: {
  provider: Provider;
  categoryName?: string;
}) {
  const cover = provider.cover || provider.photo;
  return (
    <Link
      to="/prestador/$id"
      params={{ id: provider.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={provider.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {provider.photo && (
          <img
            src={provider.photo}
            alt=""
            className="absolute bottom-2 left-2 h-10 w-10 rounded-full border-2 border-white object-cover shadow"
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{provider.name}</h3>
        {categoryName && (
          <span className="mt-2 inline-block rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {categoryName}
          </span>
        )}
        <div className="mt-1 flex items-center justify-between gap-2">
          {provider.city && (
            <p className="text-[11px] text-muted-foreground">{provider.city}</p>
          )}
          <span
            data-product-action
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="ml-auto"
          >
            <ShareButton
              variant="icon"
              label={`Compartilhar ${provider.name}`}
              title={provider.name}
              text={providerShareMessage(provider)}
              url={publicProfileUrl("prestador", provider.id)}
              imageUrl={provider.photo || provider.cover}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
