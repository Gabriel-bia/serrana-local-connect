import { Link } from "@tanstack/react-router";
import { MessageCircle, Clock } from "lucide-react";
import type { ProviderService, Provider } from "@/data/seed";
import { formatPrice, buildWhatsappLink } from "@/lib/store";
import { logWhatsappClick } from "@/lib/whatsapp-clicks";
import { itemContactMessage } from "@/lib/whatsapp";

export function ServiceOfferCard({
  service,
  provider,
}: {
  service: ProviderService;
  provider?: Provider;
}) {
  const waLink = provider?.whatsapp;
  return (
    <Link
      to="/servico/$id"
      params={{ id: service.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={service.image}
          alt={service.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {service.featured && (
          <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            Destaque
          </span>
        )}
        {!service.active && (
          <span className="absolute top-2 right-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Inativo
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {service.name}
        </h3>
        {service.price != null && service.price > 0 ? (
          <p className="mt-2 text-lg font-extrabold text-primary">{formatPrice(service.price)}</p>
        ) : (
          <p className="mt-2 text-sm font-semibold text-muted-foreground">A combinar</p>
        )}
        {service.duration && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" /> {service.duration}
          </p>
        )}
        {service.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{service.description}</p>
        )}
        {waLink && provider && (
          <span
            data-product-action
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              logWhatsappClick({ storeId: provider.id, storeName: provider.name });
              window.open(
                buildWhatsappLink(
                  waLink,
                  itemContactMessage("servico", service),
                  true,
                ),
                "_blank",
                "noopener,noreferrer",
              );
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-whatsapp)] px-3 py-2 text-xs font-semibold text-[var(--color-whatsapp-foreground)] shadow-sm transition hover:opacity-90"
            aria-label="Conversar no WhatsApp"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </span>
        )}
      </div>
    </Link>
  );
}
