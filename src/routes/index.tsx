import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, ShoppingBag, Store as StoreIcon, Wrench, MapPin, Flame, Star, Briefcase } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { StoreCard } from "@/components/StoreCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useData } from "@/lib/store";
import heroBanner from "@/assets/hero-banner-serrana.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serrana Express — Vitrine digital da sua cidade" },
      { name: "description", content: "Encontre produtos, lojas e serviços locais em um só lugar. Fale direto com a loja pelo WhatsApp." },
      { property: "og:title", content: "Serrana Express" },
      { property: "og:description", content: "Vitrine digital de produtos, lojas e serviços locais." },
      { property: "og:image", content: heroBanner.url },
    ],
  }),
  component: Index,
});

const shortcuts = [
  { icon: ShoppingBag, label: "Produtos", href: "/categorias" },
  { icon: StoreIcon, label: "Lojas", href: "/categorias" },
  { icon: Wrench, label: "Serviços", href: "/categoria/servicos" },
  { icon: MapPin, label: "Perto de Você", href: "/categorias" },
];

function Index() {
  const { categories, stores: allStores, products: allProducts, services: allServices } = useData();
  const [q, setQ] = useState("");
  const visibleStoreIds = new Set(allStores.filter((s) => !s.blocked).map((s) => s.id));
  const stores = allStores.filter((s) => !s.blocked);
  const products = allProducts.filter((p) => visibleStoreIds.has(p.storeId));
  const services = allServices.filter((sv) => visibleStoreIds.has(sv.storeId));
  const featuredStores = stores.filter((s) => s.featured);
  const featuredProducts = products.filter((p) => p.featured);
  const featuredServices = services.filter((s) => s.featured);
  const storeById = Object.fromEntries(stores.map((s) => [s.id, s]));
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBanner.url}
            alt="Serrana Express - sua cidade conectada"
            className="h-full w-full object-cover"
            width={1600}
            height={900}
          />
          {/* Degradê laranja escuro para leitura */}
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.45_0.18_40)]/95 via-[oklch(0.55_0.2_42)]/70 to-[oklch(0.25_0.05_30)]/50 md:from-[oklch(0.45_0.18_40)]/90 md:via-[oklch(0.5_0.2_42)]/55 md:to-transparent" />
        </div>

        <div className="container mx-auto px-4 pt-8 pb-6 md:pt-16 md:pb-12">
          <div className="max-w-2xl text-white">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur">
              Sua cidade, conectada
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-md">
              Encontre produtos e serviços da sua cidade em um só lugar
            </h1>
            <p className="mt-3 text-sm sm:text-base md:text-lg text-white/90 max-w-xl">
              Descubra lojas locais, compare produtos e fale direto pelo WhatsApp. Simples, rápido e sem complicação.
            </p>
          </div>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/categorias?q=${encodeURIComponent(q)}`;
            }}
            className="mt-6 flex w-full items-center gap-2 rounded-full bg-white p-1.5 shadow-[var(--shadow-glow)] md:max-w-2xl"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="O que você procura hoje?"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:px-5">
              <Search className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Buscar</span>
              <span className="sm:hidden">Buscar</span>
            </button>
          </form>
        </div>

        {/* Shortcuts */}
        <div className="container mx-auto px-4 pb-8 md:pb-12">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {shortcuts.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-[var(--shadow-card)] ring-1 ring-primary/20 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] sm:h-16 sm:w-16">
                  <s.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white sm:text-xs">
                  {s.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Lojas em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader icon={Star} title="Lojas em destaque" link="/categorias" linkLabel="Ver todas" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featuredStores.map((s) => (
            <StoreCard key={s.id} store={s} categoryName={categoryById[s.categoryId]?.name} />
          ))}
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader icon={Flame} title="Produtos em destaque" link="/categorias" linkLabel="Ver todos" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
          ))}
        </div>
      </section>

      {/* Serviços em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader icon={Briefcase} title="Serviços em destaque" link="/categoria/$slug" linkLabel="Ver todos" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featuredServices.map((sv) => (
            <div
              key={sv.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img src={sv.image} alt={sv.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{sv.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{sv.description}</p>
                <div className="mt-3">
                  <WhatsAppButton
                    link={sv.whatsapp}
                    message={`Olá! Tenho interesse no serviço "${sv.name}".`}
                    label="WhatsApp"
                    className="w-full !py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Cadastre sua loja */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-2xl bg-[var(--gradient-hero)] p-8 md:p-12 text-center text-white shadow-[var(--shadow-glow)]">
          <h2 className="text-2xl md:text-4xl font-extrabold">Tem uma loja ou serviço?</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">
            Cadastre seu negócio na Serrana Express e seja encontrado pelos clientes da sua região.
          </p>
          <Link to="/admin" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary transition hover:scale-105">
            Quero cadastrar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionHeader({
  title,
  link,
  linkLabel = "Ver tudo",
  icon: Icon,
}: {
  title: string;
  link?: string;
  linkLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{title}</h2>
      </div>
      {link && (
        <Link to={link as "/categorias"} className="text-sm font-semibold text-primary hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
