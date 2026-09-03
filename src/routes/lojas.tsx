import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoreCard } from "@/components/StoreCard";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/lojas")({
  head: () => ({
    meta: [
      { title: "Lojas — Serrana Express" },
      {
        name: "description",
        content: "Conheça todas as lojas locais cadastradas na Serrana Express e fale direto com elas.",
      },
      { property: "og:title", content: "Lojas — Serrana Express" },
      {
        property: "og:description",
        content: "Conheça todas as lojas locais cadastradas na Serrana Express.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LojasPage,
});

function LojasPage() {
  const { stores: allStores } = useData();
  const [q, setQ] = useState("");

  const stores = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allStores
      .filter((s) => !s.blocked)
      .filter(
        (s) =>
          !term ||
          s.name.toLowerCase().includes(term) ||
          (s.description ?? "").toLowerCase().includes(term),
      );
  }, [allStores, q]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold">Lojas</h1>
        <p className="mt-1 text-muted-foreground">Todas as lojas da sua cidade em um só lugar.</p>

        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar loja..."
            className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {stores.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">Nenhuma loja encontrada.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {stores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
