import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Instagram, Facebook, MapPin, Clock, Phone, Share2, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ServiceOfferCard } from "@/components/ServiceOfferCard";
import { WorkCard } from "@/components/WorkCard";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/prestador/$id")({
  component: PrestadorPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">Prestador não encontrado</div>
  ),
});

async function shareProfile(name: string) {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  const nav = window.navigator;
  const data = { title: name, text: `Conheça ${name} na Serrana Express`, url };
  try {
    if ("share" in nav && typeof nav.share === "function") {
      await nav.share(data);
      return;
    }
  } catch {
    return;
  }
  try {
    await nav.clipboard.writeText(url);
    alert("Link do perfil copiado!");
  } catch {
    alert(url);
  }
}

function PrestadorPage() {
  const { id } = Route.useParams();
  const { providers, providerServices, providerWorks, serviceCategories } = useData();
  const provider = providers.find((p) => p.id === id);
  if (!provider || provider.blocked) throw notFound();

  const services = providerServices.filter((s) => s.providerId === provider.id && s.active);
  const works = providerWorks
    .filter((w) => w.providerId === provider.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const categoryById = Object.fromEntries(serviceCategories.map((c) => [c.id, c]));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative h-48 md:h-64 overflow-hidden bg-muted">
          <img src={provider.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <Link
            to="/prestadores"
            className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-lg bg-background/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-background transition"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
        <div className="container mx-auto px-4 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <img
              src={provider.photo}
              alt={provider.name}
              className="h-24 w-24 rounded-xl object-cover ring-4 ring-background"
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{provider.name}</h1>
              <div className="mt-2 flex flex-wrap gap-1">
                {provider.categoryIds.map((cid) => (
                  <span
                    key={cid}
                    className="rounded-full border border-primary/30 px-2 py-0.5 text-[10px] font-semibold text-primary"
                  >
                    {categoryById[cid]?.name ?? cid}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-muted-foreground">{provider.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {provider.city && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {provider.city}
                    {provider.serviceArea ? ` · ${provider.serviceArea}` : ""}
                  </span>
                )}
                {provider.schedule && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {provider.schedule}
                  </span>
                )}
                {provider.instagram && (
                  <a
                    href={`https://instagram.com/${provider.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Instagram className="h-4 w-4" /> @{provider.instagram}
                  </a>
                )}
                {provider.facebook && (
                  <a
                    href={`https://facebook.com/${provider.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Facebook className="h-4 w-4" /> {provider.facebook}
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col md:gap-2 md:w-auto w-full">
              <WhatsAppButton
                link={provider.whatsapp}
                storeId={provider.id}
                storeName={provider.name}
                message={`Olá ${provider.name}! Encontrei você na Serrana Express.`}
                label="WhatsApp"
                className="!py-2.5"
              />
              {provider.phone && (
                <a
                  href={`tel:${provider.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition hover:opacity-90"
                >
                  <Phone className="h-5 w-5" /> Ligar
                </a>
              )}
              <button
                type="button"
                onClick={() => shareProfile(provider.name)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 font-semibold text-foreground shadow-[var(--shadow-card)] transition hover:bg-muted"
              >
                <Share2 className="h-5 w-5" /> Compartilhar
              </button>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Serviços oferecidos</h2>
            {services.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                Este prestador ainda não cadastrou serviços.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {services.map((s) => (
                  <ServiceOfferCard key={s.id} service={s} provider={provider} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 pb-10">
            <h2 className="text-2xl font-bold mb-4">Trabalhos realizados</h2>
            {works.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                Nenhum trabalho publicado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {works.map((w) => (
                  <WorkCard key={w.id} work={w} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
