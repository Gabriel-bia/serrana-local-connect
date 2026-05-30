import { Link } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            SE
          </span>
          <span className="hidden sm:inline">Serrana Express</span>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams({ q });
            window.location.href = `/categorias?${params.toString()}`;
          }}
          className="hidden md:flex flex-1 max-w-xl mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos, lojas ou categorias..."
              className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/" className="px-3 py-2 rounded-md hover:bg-muted">Início</Link>
          <Link to="/categorias" className="px-3 py-2 rounded-md hover:bg-muted">Categorias</Link>
          <Link to="/admin" className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground">Admin</Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const params = new URLSearchParams({ q });
              window.location.href = `/categorias?${params.toString()}`;
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
          <div className="flex flex-col">
            <Link to="/" className="py-2" onClick={() => setOpen(false)}>Início</Link>
            <Link to="/categorias" className="py-2" onClick={() => setOpen(false)}>Categorias</Link>
            <Link to="/admin" className="py-2 text-muted-foreground" onClick={() => setOpen(false)}>Admin</Link>
          </div>
        </div>
      )}
    </header>
  );
}
