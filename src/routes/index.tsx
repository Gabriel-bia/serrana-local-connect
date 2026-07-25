import { createFileRoute } from "@tanstack/react-router";
import { Search, ShoppingBag, Store as StoreIcon, Wrench, MapPin, Flame, Star, Briefcase, UserCog, Sparkles, Tag } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { StoreCard } from "@/components/StoreCard";
import { ProviderCard } from "@/components/ProviderCard";
import { ServiceOfferCard } from "@/components/ServiceOfferCard";
import { useData } from "@/lib/store";
import heroBanner from "@/assets/hero-banner-serrana-v2.png.asset.json";

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
  { icon: ShoppingBag, label: "Produtos", href: "/produtos" },
  { icon: StoreIcon, label: "Lojas", href: "/categorias" },
  { icon: UserCog, label: "Prestadores", href: "/prestadores" },
  { icon: Wrench, label: "Serviços", href: "/categoria/servicos" },
  { icon: MapPin, label: "Perto de Você", href: "/categorias" },
];

function Index() {
  const {
    categories,
    stores: allStores,
    products: allProducts,
    providers: allProviders,
    providerServices: allProviderServices,
    serviceCategories,
  } = useData();
  const [q, setQ] = useState("");
  const visibleStoreIds = new Set(allStores.filter((s) => !s.blocked).map((s) => s.id));
  const stores = allStores.filter((s) => !s.blocked);
  const products = allProducts.filter((p) => visibleStoreIds.has(p.storeId));
  const providers = allProviders.filter((p) => !p.blocked);
  const visibleProviderIds = new Set(providers.map((p) => p.id));
  const providerServices = allProviderServices.filter(
    (s) => visibleProviderIds.has(s.providerId) && s.active,
  );
  const byNewest = <T extends { createdAt?: string }>(a: T, b: T) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  const productsNewest = [...products].sort(byNewest);
  const featuredStores = stores.filter((s) => s.featured);
  const newestProducts = productsNewest.slice(0, 10);
  const promoProducts = productsNewest
    .filter((p) => p.originalPrice != null && p.originalPrice > p.price)
    .slice(0, 10);
  const featuredProducts = productsNewest.filter((p) => p.featured).slice(0, 10);
  const featuredProviderServices = providerServices.filter((s) => s.featured).slice(0, 10);
  const featuredProviders = providers.filter((p) => p.featured).slice(0, 8);
  const storeById = Object.fromEntries(stores.map((s) => [s.id, s]));
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));
  const serviceCategoryById = Object.fromEntries(serviceCategories.map((c) => [c.id, c]));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero - Banner image (já contém marca, texto e CTAs) */}
      <section className="relative bg-white">
        <a href="/categorias" className="block">
          <img
            src={heroBanner.url}
            alt="Serrana Express — Encontre produtos e serviços da sua cidade em um só lugar"
            className="w-full h-auto object-cover"
            width={1600}
            height={900}
          />
        </a>

        {/* Search */}
        <div className="container mx-auto px-4 -mt-4 md:-mt-8 relative z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/produtos?q=${encodeURIComponent(q)}`;
            }}
            className="flex w-full items-center gap-2 rounded-full bg-white p-1.5 shadow-[var(--shadow-glow)] ring-1 ring-primary/10 md:max-w-2xl md:mx-auto"
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
        <div className="container mx-auto px-4 pt-6 pb-8 md:pb-12">
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
                <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground sm:text-xs">
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

      {/* Novidades - últimos postados */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader icon={Sparkles} title="Novidades" link="/produtos?ord=novos" linkLabel="Ver todos" />
        {newestProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {newestProducts.map((p) => (
              <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
            ))}
          </div>
        )}
      </section>

      {/* Promoções */}
      {promoProducts.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <SectionHeader icon={Tag} title="Promoções" link="/produtos?promo=1" linkLabel="Ver todas" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {promoProducts.map((p) => (
              <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
            ))}
          </div>
        </section>
      )}

      {/* Produtos em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader icon={Flame} title="Produtos em destaque" link="/produtos" linkLabel="Ver todos" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
          ))}
        </div>
      </section>

      {/* Serviços em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader icon={Briefcase} title="Serviços em destaque" link="/prestadores" linkLabel="Ver todos" />
        {featuredProviderServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço em destaque ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featuredProviderServices.map((sv) => (
              <ServiceOfferCard
                key={sv.id}
                service={sv}
                provider={providerById[sv.providerId]}
              />
            ))}
          </div>
        )}
      </section>

      {/* Prestadores em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader icon={UserCog} title="Prestadores em destaque" link="/prestadores" linkLabel="Ver todos" />
        {featuredProviders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum prestador em destaque ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProviders.map((pr) => (
              <ProviderCard
                key={pr.id}
                provider={pr}
                categoryName={pr.categoryIds[0] ? serviceCategoryById[pr.categoryIds[0]]?.name : undefined}
              />
            ))}
          </div>
        )}
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
        <a href={link} className="text-sm font-semibold text-primary hover:underline">
          {linkLabel}
        </a>
      )}
    </div>
  );
}
