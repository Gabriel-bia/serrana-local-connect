import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/categoria/$slug")({
  component: CategoriaPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">Categoria não encontrada</div>
  ),
});

function CategoriaPage() {
  const { slug } = Route.useParams();
  const { categories, products, stores } = useData();
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw notFound();
  const list = products.filter((p) => p.categoryId === category.id);
  const storeById = Object.fromEntries(stores.map((s) => [s.id, s]));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
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
