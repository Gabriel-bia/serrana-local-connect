import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useData, useDataReady } from "@/lib/store";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => ({ meta: [
    { title: `Categoria ${params.slug} — Serrana Express` },
    { name: "description", content: "Explore os produtos desta categoria nas lojas da Serrana Express." },
    { property: "og:title", content: `Categoria ${params.slug} — Serrana Express` },
    { property: "og:description", content: "Descubra produtos de lojas locais nesta categoria." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: CategoriaPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">Categoria não encontrada<BackButton fallback="/categorias" /></div>
  ),
});

function CategoriaPage() {
  const { slug } = Route.useParams();
  const ready = useDataReady();
  const { categories, products, stores } = useData();
  if (!ready) return <div className="min-h-screen grid place-items-center">Carregando categoria…</div>;
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw notFound();
  const visibleStores = stores.filter((s) => !s.blocked);
  const visibleIds = new Set(visibleStores.map((s) => s.id));
  const list = products.filter((p) => p.active !== false && p.categoryId === category.id && visibleIds.has(p.storeId));
  const storeById = Object.fromEntries(visibleStores.map((s) => [s.id, s]));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <BackButton fallback="/categorias" className="mb-4" />
        <div className="mb-6">
          <span className="text-sm text-muted-foreground">Categoria</span>
          <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
          <p className="mt-1 text-muted-foreground">{list.length} {list.length === 1 ? "produto" : "produtos"}</p>
        </div>
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            Nenhum produto nesta categoria ainda.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
