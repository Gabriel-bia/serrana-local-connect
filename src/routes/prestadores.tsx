import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProviderCard } from "@/components/ProviderCard";
import { useData } from "@/lib/store";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
  city: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/prestadores")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Prestadores de Serviços — Serrana Express" },
      {
        name: "description",
        content:
          "Encontre profissionais e prestadores de serviços da sua região: barbeiros, eletricistas, fotógrafos, professores e muito mais.",
      },
    ],
  }),
  component: PrestadoresPage,
});

function PrestadoresPage() {
  const { providers: allProviders, serviceCategories, providerServices } = useData();
  const search = useSearch({ from: "/prestadores" });
  const [q, setQ] = useState(search.q);
  const [cat, setCat] = useState(search.cat);
  const [city, setCity] = useState(search.city);

  const providers = useMemo(() => allProviders.filter((p) => !p.blocked), [allProviders]);

  const cities = useMemo(
    () =>
      Array.from(new Set(providers.map((p) => p.city).filter((c): c is string => !!c))).sort(),
    [providers],
  );

  const categoryById = useMemo(
    () => Object.fromEntries(serviceCategories.map((c) => [c.id, c])),
    [serviceCategories],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return providers.filter((p) => {
      const cmatch = !cat || p.categoryIds.includes(cat);
      const citymatch = !city || p.city === city;
      const services = providerServices.filter((s) => s.providerId === p.id);
      const tmatch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.serviceArea?.toLowerCase().includes(term) ?? false) ||
        (p.city?.toLowerCase().includes(term) ?? false) ||
        services.some((s) => s.name.toLowerCase().includes(term)) ||
        p.categoryIds.some((id) =>
          categoryById[id]?.name.toLowerCase().includes(term),
        );
      return cmatch && citymatch && tmatch;
    });
  }, [q, cat, city, providers, providerServices, categoryById]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold">Prestadores de Serviços</h1>
        <p className="mt-1 text-muted-foreground">
          Profissionais da sua região, prontos para te atender.
        </p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar profissional, serviço, cidade..."
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {cities.length > 0 && (
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas as cidades</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCat("")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            Todas
          </button>
          {serviceCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                cat === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              Nenhum prestador encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  categoryName={
                    p.categoryIds[0] ? categoryById[p.categoryIds[0]]?.name : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
