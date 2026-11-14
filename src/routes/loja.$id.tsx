import { createFileRoute, notFound } from "@tanstack/react-router";
import { Instagram, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { useDiscovery } from "@/components/DiscoveryProvider";
import { orderProducts, publicProfileUrl, selectedProductsMessage, toggleProduct } from "@/lib/discovery";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useData, useDataReady } from "@/lib/store";

export const Route = createFileRoute("/loja/$id")({
  head: ({ params }) => ({ meta: [
    { title: `Loja ${params.id} — Serrana Express` },
    { name: "description", content: "Conheça a loja, escolha produtos e compartilhe sua seleção na Serrana Express." },
    { property: "og:title", content: `Loja ${params.id} — Serrana Express` },
    { property: "og:description", content: "Confira os produtos e entre em contato diretamente com esta loja." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LojaPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">Loja não encontrada<BackButton fallback="/lojas" /></div>
  ),
});

function LojaPage() {
  const { id } = Route.useParams();
  const ready = useDataReady();
  const { seed } = useDiscovery();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);
  useEffect(() => { setSelected(new Set()); setSelecting(false); }, [id]);
  const { stores, products, storeCategories } = useData();
  if (!ready) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">Carregando loja…<BackButton fallback="/lojas" /></div>;
  const store = stores.find((s) => s.id === id);
  if (!store || store.blocked) throw notFound();

  const list = orderProducts(products.filter((p) => p.active !== false && p.storeId === store.id), seed);
  const selectedProducts = list.filter((p) => selected.has(p.id));
  const selection = { active: selecting, ids: selected, toggle: (productId: string) => {
    setSelecting(true);
    setSelected((previous) => toggleProduct(previous, productId));
  } };

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
          <BackButton fallback="/lojas" className="absolute left-4 top-4" />
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
            <div className="flex flex-wrap gap-2 md:flex-col">
            <WhatsAppButton
              link={store.whatsapp}
              storeId={store.id}
              storeName={store.name}
              message={`Olá, vim pelo app Serrana Express! Encontrei a loja ${store.name}.`}
            />
            <ShareButton title={store.name} text={`Conheça ${store.name} na Serrana Express`} url={publicProfileUrl("loja", store.id)} />
            </div>
          </div>

          <div className="mt-10 pb-10 space-y-10">
            {list.length > 0 && <div className="sticky top-16 z-30 -mx-1 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-1 py-3 backdrop-blur">
              {selecting ? <>
                <span role="status" className="mr-auto text-sm font-semibold">{selectedProducts.length} selecionado{selectedProducts.length === 1 ? "" : "s"}</span>
                <Button variant="ghost" onClick={() => { setSelecting(false); setSelected(new Set()); }}>Cancelar</Button>
                <Button variant="outline" onClick={() => setSelected(new Set(list.map((p) => p.id)))}>Selecionar todos</Button>
                {selectedProducts.length > 0 && <ShareButton title={store.name} text={selectedProductsMessage(store, selectedProducts)} url={publicProfileUrl("loja", store.id)} />}
              </> : <Button variant="outline" onClick={() => setSelecting(true)}>Selecionar produtos</Button>}
            </div>}
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
                <CategoryCarousel products={items} storeById={storeById} selection={selection} />
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
                  <CategoryCarousel products={uncategorized} storeById={storeById} selection={selection} />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {uncategorized.map((p) => <ProductCard key={p.id} product={p} store={store} selection={{ active: selecting, selected: selected.has(p.id), toggle: () => selection.toggle(p.id) }} />)}
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

