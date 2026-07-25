import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Store as StoreIcon, Wrench, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { ProviderCarousel } from "@/components/ProviderCarousel";
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
  { icon: Wrench, label: "Serviços", href: "/prestadores" },
  { icon: MapPin, label: "Perto de Você", href: "/categorias" },
];

function Index() {
  const { categories, stores: allStores, products: allProducts } = useData();
  const [q, setQ] = useState("");

  const stores = allStores.filter((s) => !s.blocked);
  const visibleStoreIds = new Set(stores.map((s) => s.id));
  const products = allProducts.filter((p) => visibleStoreIds.has(p.storeId));
  const storeById = useMemo(
    () => Object.fromEntries(stores.map((s) => [s.id, s])),
    [stores],
  );

  // Agrupar produtos por categoria (dinâmico, ignora vazias)
  const sections = useMemo(() => {
    const byCat = new Map<string, typeof products>();
    for (const p of products) {
      if (!byCat.has(p.categoryId)) byCat.set(p.categoryId, []);
      byCat.get(p.categoryId)!.push(p);
    }
    return categories
      .map((cat) => {
        const list = byCat.get(cat.id) ?? [];
        const sorted = [...list].sort((a, b) =>
          (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
        );
        return { category: cat, products: sorted.slice(0, 20) };
      })
      .filter((s) => s.products.length > 0);
  }, [products, categories]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
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

        <div className="container mx-auto px-4 pt-6 pb-8 md:pb-12">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {shortcuts.map((s) => (
              <a key={s.label} href={s.href} className="flex flex-col items-center gap-2 text-center">
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

      {/* Seções por categoria (dinâmico) */}
      {sections.length === 0 ? (
        <section className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
        </section>
      ) : (
        sections.map(({ category, products }) => {
          const Icon =
            (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Tag;
          return (
            <section key={category.id} className="container mx-auto px-4 py-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="truncate text-lg sm:text-xl md:text-2xl font-bold">
                    {category.name}
                  </h2>
                </div>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: category.slug }}
                  className="shrink-0 text-sm font-semibold text-primary hover:underline"
                >
                  Ver todos
                </Link>
              </div>
              <CategoryCarousel products={products} storeById={storeById} />
            </section>
          );
        })
      )}

      <Footer />
    </div>
  );
}
