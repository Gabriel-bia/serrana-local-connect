import { createFileRoute, notFound } from "@tanstack/react-router";
import { Instagram, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
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
  const { stores, products } = useData();
  const store = stores.find((s) => s.id === id);
  if (!store) throw notFound();
  const list = products.filter((p) => p.storeId === store.id);

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
            <WhatsAppButton number={store.whatsapp} message={`Olá ${store.name}! Encontrei vocês na Serrana Express.`} label="Chamar no WhatsApp" />
          </div>

          <div className="mt-10 pb-10">
            <h2 className="text-2xl font-bold mb-4">Produtos da loja</h2>
            {list.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                Esta loja ainda não tem produtos cadastrados.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {list.map((p) => <ProductCard key={p.id} product={p} store={store} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
