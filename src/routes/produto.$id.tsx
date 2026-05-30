import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, Store as StoreIcon, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useData, formatPrice } from "@/lib/store";

export const Route = createFileRoute("/produto/$id")({
  component: ProdutoPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">Produto não encontrado</div>
  ),
});

function ProdutoPage() {
  const { id } = Route.useParams();
  const { products, stores, categories } = useData();
  const product = products.find((p) => p.id === id);
  if (!product) throw notFound();
  const store = stores.find((s) => s.id === product.storeId);
  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
          </div>
          <div>
            {category && (
              <Link to="/categoria/$slug" params={{ slug: category.slug }} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Tag className="h-3 w-3" /> {category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl md:text-4xl font-bold">{product.name}</h1>
            {store && (
              <Link to="/loja/$id" params={{ id: store.id }} className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <StoreIcon className="h-4 w-4" /> {store.name}
              </Link>
            )}
            <p className="mt-4 text-4xl font-extrabold text-primary">{formatPrice(product.price)}</p>
            <p className="mt-4 text-foreground/80 leading-relaxed">{product.description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <WhatsAppButton
                number={product.whatsapp}
                message={`Olá! Tenho interesse no produto "${product.name}".`}
                label="Falar com a loja"
                className="w-full"
              />
              {store && (
                <Link
                  to="/loja/$id"
                  params={{ id: store.id }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 font-semibold transition hover:bg-muted"
                >
                  <StoreIcon className="h-5 w-5" /> Ver loja
                </Link>
              )}
              {product.externalLink && (
                <a
                  href={product.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 font-semibold text-primary transition hover:bg-primary/10"
                >
                  <ExternalLink className="h-5 w-5" /> Acessar link do produto
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
