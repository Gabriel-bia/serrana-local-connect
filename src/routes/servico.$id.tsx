import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Tag, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BackButton } from "@/components/BackButton";
import { ShareButton } from "@/components/ShareButton";
import { useData, useDataReady, formatPrice } from "@/lib/store";
import { PUBLIC_ORIGIN } from "@/lib/discovery";
import { itemContactMessage } from "@/lib/whatsapp";

export const Route = createFileRoute("/servico/$id")({
  head: ({ params }) => ({ meta: [
    { title: `Serviço ${params.id} — Serrana Express` },
    { name: "description", content: "Confira detalhes, fotos e valor deste serviço e fale com o prestador na Serrana Express." },
    { property: "og:title", content: `Serviço ${params.id} — Serrana Express` },
    { property: "og:description", content: "Veja os detalhes deste serviço de um prestador local." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ServicoPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">Serviço não encontrado<BackButton fallback="/prestadores" /></div>
  ),
});

function ServicoPage() {
  const { id } = Route.useParams();
  const ready = useDataReady();
  const { providerServices, providers, serviceCategories } = useData();
  if (!ready) return <div className="min-h-screen grid place-items-center">Carregando serviço…</div>;
  const service = providerServices.find((s) => s.id === id);
  if (!service || !service.active) throw notFound();
  const provider = providers.find((p) => p.id === service.providerId);
  if (!provider || provider.blocked) throw notFound();
  const category = serviceCategories.find((c) => c.id === service.categoryId);
  const hasPrice = service.price != null && service.price > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <BackButton fallback="/prestadores" className="mb-4" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <img src={service.image} alt={service.name} className="aspect-square w-full object-cover" />
          </div>
          <div>
            {category && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Tag className="h-3 w-3" /> {category.name}
              </span>
            )}
            <h1 className="mt-2 text-3xl md:text-4xl font-bold">{service.name}</h1>
            <Link to="/prestador/$id" params={{ id: provider.id }} className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <User className="h-4 w-4" /> {provider.name}
            </Link>
            {hasPrice ? (
              <p className="mt-4 text-4xl font-extrabold text-primary">{formatPrice(service.price!)}</p>
            ) : (
              <p className="mt-4 text-2xl font-bold text-muted-foreground">Valor a combinar com o prestador</p>
            )}
            {service.duration && (
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {service.duration}
              </p>
            )}
            {service.description && (
              <p className="mt-4 text-foreground/80 leading-relaxed">{service.description}</p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <WhatsAppButton
                link={provider.whatsapp}
                storeId={provider.id}
                storeName={provider.name}
                message={itemContactMessage("servico", service)}
                replaceMessage
                label="Falar com o prestador"
                className="w-full"
              />
              <Link
                to="/prestador/$id"
                params={{ id: provider.id }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 font-semibold transition hover:bg-muted"
              >
                <User className="h-5 w-5" /> Ver prestador
              </Link>
              <div className="sm:col-span-2">
                <ShareButton
                  title={service.name}
                  text={`Confira o serviço "${service.name}" de ${provider.name} na Serrana Express`}
                  url={`${PUBLIC_ORIGIN}/servico/${service.id}`}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
