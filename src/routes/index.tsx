import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductCard } from "@/components/ProductCard";
import { StoreCard } from "@/components/StoreCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useData } from "@/lib/store";
import heroBanner from "@/assets/hero-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serrana Express — Vitrine digital da sua cidade" },
      { name: "description", content: "Encontre produtos, lojas e serviços locais em um só lugar. Fale direto com a loja pelo WhatsApp." },
      { property: "og:title", content: "Serrana Express" },
      { property: "og:description", content: "Vitrine digital de produtos, lojas e serviços locais." },
    ],
  }),
  component: Index,
});

function Index() {
  const { categories, stores, products, services } = useData();
  const [q, setQ] = useState("");
  const featuredStores = stores.filter((s) => s.featured);
  const featuredProducts = products.filter((p) => p.featured);
  const featuredServices = services.filter((s) => s.featured);
  const storeById = Object.fromEntries(stores.map((s) => [s.id, s]));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBanner} alt="" className="h-full w-full object-cover opacity-90" width={1600} height={900} />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dark)]/85 via-[var(--color-dark)]/40 to-transparent" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-28">
          <div className="max-w-2xl text-white">
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-primary/40">
              Sua cidade, conectada
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">
              Encontre produtos e serviços da sua cidade em um só lugar
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/85">
              Descubra lojas locais, compare produtos e fale direto pelo WhatsApp. Simples, rápido e sem complicação.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/categorias?q=${encodeURIComponent(q)}`;
              }}
              className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-full bg-white p-2 shadow-[var(--shadow-glow)]"
            >
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="O que você procura hoje?"
                className="flex-1 bg-transparent px-2 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:opacity-90">
                Buscar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="container mx-auto px-4 py-12">
        <SectionHeader title="Categorias" subtitle="Navegue por tipo de produto ou serviço" />
        <CategoryGrid categories={categories} />
      </section>

      {/* Lojas em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader title="Lojas em destaque" link="/categorias" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredStores.map((s) => <StoreCard key={s.id} store={s} />)}
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader title="Produtos em destaque" link="/categorias" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
          ))}
        </div>
      </section>

      {/* Serviços */}
      <section className="container mx-auto px-4 py-8">
        <SectionHeader title="Serviços locais" subtitle="Profissionais e prestadores da sua cidade" />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredServices.map((sv) => (
            <div key={sv.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={sv.image} alt={sv.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{sv.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{sv.description}</p>
                <div className="mt-4">
                  <WhatsAppButton link={sv.whatsapp} message={`Olá! Tenho interesse no serviço "${sv.name}".`} className="w-full" />
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

function SectionHeader({ title, subtitle, link }: { title: string; subtitle?: string; link?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Ver tudo <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
