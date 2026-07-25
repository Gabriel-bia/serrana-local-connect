import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useData } from "@/lib/store";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
  loja: fallback(z.string(), "").default(""),
  min: fallback(z.number(), 0).default(0),
  max: fallback(z.number(), 0).default(0),
  ord: fallback(z.string(), "novos").default("novos"),
  promo: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/produtos")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Todos os produtos — Serrana Express" },
      { name: "description", content: "Busca completa de produtos locais com filtros por preço, categoria e loja." },
      { property: "og:title", content: "Produtos — Serrana Express" },
      { property: "og:description", content: "Encontre produtos de todas as lojas da sua cidade." },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const search = useSearch({ from: "/produtos" });
  const navigate = useNavigate({ from: "/produtos" });
  const { products: allProducts, stores: allStores, categories } = useData();

  const stores = useMemo(() => allStores.filter((s) => !s.blocked), [allStores]);
  const visibleIds = useMemo(() => new Set(stores.map((s) => s.id)), [stores]);
  const storeById = useMemo(() => Object.fromEntries(stores.map((s) => [s.id, s])), [stores]);

  const products = useMemo(() => {
    const term = search.q.trim().toLowerCase();
    const min = Number(search.min) || 0;
    const max = Number(search.max) || 0;
    const filtered = allProducts.filter((p) => {
      if (!visibleIds.has(p.storeId)) return false;
      if (search.cat && p.categoryId !== search.cat) return false;
      if (search.loja && p.storeId !== search.loja) return false;
      if (min > 0 && p.price < min) return false;
      if (max > 0 && p.price > max) return false;
      if (search.promo === "1") {
        if (!(p.originalPrice != null && p.originalPrice > p.price)) return false;
      }
      if (term) {
        const store = storeById[p.storeId];
        const hit =
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          store?.name.toLowerCase().includes(term);
        if (!hit) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    switch (search.ord) {
      case "preco-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "preco-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "nome":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
      case "desconto":
        sorted.sort((a, b) => {
          const da = a.originalPrice && a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const db = b.originalPrice && b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return db - da;
        });
        break;
      case "novos":
      default:
        sorted.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    }
    return sorted;
  }, [allProducts, visibleIds, storeById, search]);

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Todos os produtos</h1>
        </div>
        <p className="mt-1 text-muted-foreground">Filtre e ordene por preço, categoria, loja ou desconto.</p>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Buscar por nome, descrição ou loja..."
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={search.ord}
            onChange={(e) => update({ ord: e.target.value })}
            className="rounded-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="novos">Mais recentes</option>
            <option value="preco-asc">Menor preço</option>
            <option value="preco-desc">Maior preço</option>
            <option value="desconto">Maior desconto</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
          <select
            value={search.loja}
            onChange={(e) => update({ loja: e.target.value })}
            className="rounded-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas as lojas</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            onClick={() => update({ promo: search.promo === "1" ? "" : "1" })}
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
              search.promo === "1"
                ? "bg-destructive text-destructive-foreground"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            Só promoções
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Preço mínimo (R$)"
            value={search.min || ""}
            onChange={(e) => update({ min: Number(e.target.value) || 0 })}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Preço máximo (R$)"
            value={search.max || ""}
            onChange={(e) => update({ max: Number(e.target.value) || 0 })}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => navigate({ search: { q: "", cat: "", loja: "", min: 0, max: 0, ord: "novos", promo: "" } })}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Limpar filtros
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => update({ cat: "" })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !search.cat ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            Todas categorias
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ cat: c.id })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                search.cat === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>

        <div className="mt-4">
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              Nenhum produto com esses filtros.{" "}
              <Link to="/produtos" className="text-primary hover:underline">Limpar</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} store={storeById[p.storeId]} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
