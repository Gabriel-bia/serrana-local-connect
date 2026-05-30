import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useData } from "@/lib/store";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/categorias")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Categorias — Serrana Express" },
      { name: "description", content: "Explore todas as categorias de produtos e serviços locais." },
    ],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const { categories, products, stores } = useData();
  const search = useSearch({ from: "/categorias" });
  const [q, setQ] = useState(search.q);
  const [cat, setCat] = useState(search.cat);

  const storeById = useMemo(() => Object.fromEntries(stores.map((s) => [s.id, s])), [stores]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      const store = storeById[p.storeId];
      const cmatch = !cat || p.categoryId === cat;
      const tmatch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        store?.name.toLowerCase().includes(term) ||
        categories.find((c) => c.id === p.categoryId)?.name.toLowerCase().includes(term);
      return cmatch && tmatch;
    });
  }, [q, cat, products, stores, categories, storeById]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <p className="mt-1 text-muted-foreground">Filtre por categoria ou busque por nome.</p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos, lojas..."
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCat("")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !cat ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                cat === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              Nenhum resultado encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Categorias populares</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="rounded-xl border border-border bg-card p-4 text-center font-medium shadow-[var(--shadow-card)] transition hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
