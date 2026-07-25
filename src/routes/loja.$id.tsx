import { createFileRoute, notFound } from "@tanstack/react-router";
import { Instagram, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/loja/$id")({
  component: LojaPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">Loja não encontrada</div>
  ),
});

function LojaPage() {
  const { id } = Route.useParams();
  const { stores, products, storeCategories } = useData();
  const store = stores.find((s) => s.id === id);
  if (!store || store.blocked) throw notFound();

  const list = products
    .filter((p) => p.storeId === store.id)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const cats = storeCategories
    .filter((c) => c.storeId === store.id)
    .sort((a, b) => a.position - b.position);

  const storeById = { [store.id]: store };
  const sections = cats
    .map((c) => ({ cat: c, items: list.filter((p) => p.storeCategoryId === c.id) }))
    .filter((s) => s.items.length > 0);
  const uncategorized = list.filter(
    (p) => !p.storeCategoryId || !cats.some((c) => c.id === p.storeCategoryId),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative h-48 md:h-64 overflow-hidden bg-muted">
          <img src={store.banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        <div className="container mx-auto px-4 -mt-16 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <img src={store.logo} alt={store.name} className="h-24 w-24 rounded-xl object-cover ring-4 ring-background" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
              <p className="mt-2 text-muted-foreground">{store.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {store.address && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {store.address}
                  </span>
                )}
                {store.instagram && (
                  <a
                    href={`https://instagram.com/${store.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Instagram className="h-4 w-4" /> @{store.instagram}
                  </a>
                )}
              </div>
            </div>
            <WhatsAppButton link={store.whatsapp} storeId={store.id} storeName={store.name} message={`Olá ${store.name}! Encontrei vocês na Serrana Express.`} label="Chamar no WhatsApp" />
          </div>

          <div className="mt-10 pb-10 space-y-10">
            {list.length === 0 && (
              <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                Esta loja ainda não tem produtos cadastrados.
              </div>
            )}

            {sections.map(({ cat, items }) => (
              <section key={cat.id}>
                <div className="mb-3 flex items-end justify-between">
                  <h2 className="text-xl md:text-2xl font-bold">{cat.name}</h2>
                  <span className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "itens"}</span>
                </div>
                <CategoryCarousel products={items} storeById={storeById} />
              </section>
            ))}

            {uncategorized.length > 0 && (
              <section>
                <div className="mb-3 flex items-end justify-between">
                  <h2 className="text-xl md:text-2xl font-bold">
                    {sections.length > 0 ? "Outros produtos" : "Produtos da loja"}
                  </h2>
                  <span className="text-xs text-muted-foreground">{uncategorized.length} {uncategorized.length === 1 ? "item" : "itens"}</span>
                </div>
                {sections.length > 0 ? (
                  <CategoryCarousel products={uncategorized} storeById={storeById} />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {uncategorized.map((p) => <ProductCard key={p.id} product={p} store={store} />)}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

