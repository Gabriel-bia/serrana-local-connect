export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-[var(--color-dark)] text-[var(--color-dark-foreground)]">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">SE</span>
            Serrana Express
          </div>
          <p className="mt-3 text-sm opacity-80">
            A vitrine digital da sua cidade. Produtos, lojas e serviços locais em um só lugar.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="/" className="hover:opacity-100">Início</a></li>
            <li><a href="/categorias" className="hover:opacity-100">Categorias</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contato</h4>
          <p className="text-sm opacity-80">Quer cadastrar sua loja? Fale com a gente.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Serrana Express. Todos os direitos reservados.
      </div>
    </footer>
  );
}
