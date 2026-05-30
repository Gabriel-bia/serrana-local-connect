import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, RotateCcw, LogOut, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { dataApi, useData, formatPrice, isValidWhatsappLink } from "@/lib/store";
import type { Banner, Category, Product, Service, Store } from "@/data/seed";

const AUTH_KEY = "serrana-admin-auth";
const ADMIN_PASS = "admin123";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Serrana Express" }] }),
  component: AdminPage,
});

type Tab = "produtos" | "lojas" | "categorias" | "servicos" | "banners";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<Tab>("produtos");
  const data = useData();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1 grid place-items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pass === ADMIN_PASS) {
                sessionStorage.setItem(AUTH_KEY, "1");
                setAuthed(true);
              } else {
                alert("Senha incorreta. (Dica: admin123)");
              }
            }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <h1 className="text-2xl font-bold">Área administrativa</h1>
            <p className="mt-1 text-sm text-muted-foreground">Informe a senha para continuar.</p>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Senha"
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="mt-3 w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90">
              Entrar
            </button>
            <p className="mt-3 text-xs text-muted-foreground">Senha padrão: <code>admin123</code></p>
          </form>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "produtos", label: "Produtos", count: data.products.length },
    { key: "lojas", label: "Lojas", count: data.stores.length },
    { key: "categorias", label: "Categorias", count: data.categories.length },
    { key: "servicos", label: "Serviços", count: data.services.length },
    { key: "banners", label: "Banners", count: data.banners.length },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gerencie o conteúdo da vitrine.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Restaurar dados de exemplo? Isso apaga suas alterações.")) dataApi.reset();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar
            </button>
            <button
              onClick={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label} <span className="ml-1 text-xs opacity-60">({t.count})</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "produtos" && <ProductsAdmin />}
          {tab === "lojas" && <StoresAdmin />}
          {tab === "categorias" && <CategoriesAdmin />}
          {tab === "servicos" && <ServicesAdmin />}
          {tab === "banners" && <BannersAdmin />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- Generic small UI ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Campo de Link do WhatsApp com validação e botão "Testar Link".
 * O administrador cola o link completo (https://wa.me/... ou https://api.whatsapp.com/...).
 */
function WhatsAppLinkField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const trimmed = value.trim();
  const isValid = isValidWhatsappLink(trimmed);
  const showError = trimmed.length > 0 && !isValid;

  return (
    <Field label="Link do WhatsApp">
      <div className="flex gap-2">
        <input
          type="url"
          className={`${inputClass} ${showError ? "border-destructive focus:ring-destructive" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://wa.me/5535999990000"
          required
        />
        <a
          href={isValid ? trimmed : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!isValid) {
              e.preventDefault();
              alert("Cole um link válido começando com https://wa.me/ ou https://api.whatsapp.com/");
            }
          }}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition ${
            isValid ? "hover:bg-muted text-foreground" : "opacity-60 cursor-not-allowed"
          }`}
        >
          <ExternalLink className="h-4 w-4" /> Testar Link
        </a>
      </div>
      {showError ? (
        <p className="mt-1 text-xs text-destructive">
          Link inválido. Use o formato https://wa.me/... ou https://api.whatsapp.com/...
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">
          Cole o link completo. Aceitos: https://wa.me/&lt;número&gt; ou https://api.whatsapp.com/send?phone=&lt;número&gt;
        </p>
      )}
    </Field>
  );
}

/* ---------------- Products ---------------- */

function ProductsAdmin() {
  const { products, stores, categories } = useData();
  const [editing, setEditing] = useState<Product | null>(null);
  const blank: Product = {
    id: "",
    name: "",
    image: "",
    price: 0,
    description: "",
    categoryId: categories[0]?.id ?? "",
    storeId: stores[0]?.id ?? "",
    whatsapp: stores[0]?.whatsapp ?? "",
    externalLink: "",
    featured: false,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Produto</th><th className="p-3">Loja</th><th className="p-3">Preço</th><th className="p-3">Destaque</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><div className="flex items-center gap-2"><img src={p.image} className="h-10 w-10 rounded object-cover" alt="" /><span>{p.name}</span></div></td>
                <td className="p-3 text-muted-foreground">{stores.find((s) => s.id === p.storeId)?.name}</td>
                <td className="p-3 font-semibold">{formatPrice(p.price)}</td>
                <td className="p-3">{p.featured ? "Sim" : "Não"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="mr-2 inline-flex items-center gap-1 text-primary hover:underline"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Excluir produto?") && dataApi.remove("products", p.id)} className="inline-flex items-center gap-1 text-destructive hover:underline"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-border">
          <button onClick={() => setEditing(blank)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo produto
          </button>
        </div>
      </div>

      {editing && (
        <ProductForm
          key={editing.id || "new"}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => { dataApi.upsert("products", { ...p, id: p.id || newId() }); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }: { initial: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const { stores, categories } = useData();
  const [p, setP] = useState<Product>(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isValidWhatsappLink(p.whatsapp.trim())) {
          alert("Informe um Link do WhatsApp válido (https://wa.me/... ou https://api.whatsapp.com/...).");
          return;
        }
        onSave({ ...p, whatsapp: p.whatsapp.trim() });
      }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit sticky top-20"
    >
      <h3 className="font-semibold">{p.id ? "Editar produto" : "Novo produto"}</h3>
      <Field label="Nome"><input className={inputClass} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} required /></Field>
      <Field label="Foto (URL)"><input className={inputClass} value={p.image} onChange={(e) => setP({ ...p, image: e.target.value })} required /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (R$)"><input type="number" step="0.01" className={inputClass} value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} required /></Field>
        <Field label="Destaque"><select className={inputClass} value={p.featured ? "1" : "0"} onChange={(e) => setP({ ...p, featured: e.target.value === "1" })}><option value="0">Não</option><option value="1">Sim</option></select></Field>
      </div>
      <Field label="Descrição"><textarea className={inputClass} rows={3} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria"><select className={inputClass} value={p.categoryId} onChange={(e) => setP({ ...p, categoryId: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Loja"><select className={inputClass} value={p.storeId} onChange={(e) => { const st = stores.find((s) => s.id === e.target.value); setP({ ...p, storeId: e.target.value, whatsapp: st?.whatsapp ?? p.whatsapp }); }}>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      </div>
      <WhatsAppLinkField value={p.whatsapp} onChange={(v) => setP({ ...p, whatsapp: v })} />
      <Field label="Link externo (opcional)"><input className={inputClass} value={p.externalLink ?? ""} onChange={(e) => setP({ ...p, externalLink: e.target.value })} /></Field>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground hover:opacity-90">Salvar</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 font-medium hover:bg-muted">Cancelar</button>
      </div>
    </form>
  );
}

/* ---------------- Stores ---------------- */

function StoresAdmin() {
  const { stores, categories } = useData();
  const [editing, setEditing] = useState<Store | null>(null);
  const blank: Store = { id: "", name: "", logo: "", banner: "", description: "", categoryId: categories[0]?.id ?? "", whatsapp: "", instagram: "", address: "", featured: false };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Loja</th><th className="p-3">Categoria</th><th className="p-3">WhatsApp</th><th className="p-3">Destaque</th><th></th></tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3"><div className="flex items-center gap-2"><img src={s.logo} className="h-10 w-10 rounded object-cover" alt="" /><span>{s.name}</span></div></td>
                <td className="p-3 text-muted-foreground">{categories.find((c) => c.id === s.categoryId)?.name}</td>
                <td className="p-3">{s.whatsapp}</td>
                <td className="p-3">{s.featured ? "Sim" : "Não"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(s)} className="mr-2 text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Excluir loja?") && dataApi.remove("stores", s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-border">
          <button onClick={() => setEditing(blank)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Nova loja</button>
        </div>
      </div>
      {editing && (
        <StoreForm key={editing.id || "new"} initial={editing} onCancel={() => setEditing(null)} onSave={(s) => { dataApi.upsert("stores", { ...s, id: s.id || newId() }); setEditing(null); }} />
      )}
    </div>
  );
}

function StoreForm({ initial, onSave, onCancel }: { initial: Store; onSave: (s: Store) => void; onCancel: () => void }) {
  const { categories } = useData();
  const [s, setS] = useState<Store>(initial);
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!isValidWhatsappLink(s.whatsapp.trim())) {
        alert("Informe um Link do WhatsApp válido (https://wa.me/... ou https://api.whatsapp.com/...).");
        return;
      }
      onSave({ ...s, whatsapp: s.whatsapp.trim() });
    }} className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit sticky top-20">
      <h3 className="font-semibold">{s.id ? "Editar loja" : "Nova loja"}</h3>
      <Field label="Nome"><input className={inputClass} value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} required /></Field>
      <Field label="Logo (URL)"><input className={inputClass} value={s.logo} onChange={(e) => setS({ ...s, logo: e.target.value })} required /></Field>
      <Field label="Banner (URL)"><input className={inputClass} value={s.banner} onChange={(e) => setS({ ...s, banner: e.target.value })} required /></Field>
      <Field label="Descrição"><textarea className={inputClass} rows={3} value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria"><select className={inputClass} value={s.categoryId} onChange={(e) => setS({ ...s, categoryId: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Destaque"><select className={inputClass} value={s.featured ? "1" : "0"} onChange={(e) => setS({ ...s, featured: e.target.value === "1" })}><option value="0">Não</option><option value="1">Sim</option></select></Field>
      </div>
      <Field label="WhatsApp"><input className={inputClass} value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} required placeholder="5535999990000" /></Field>
      <Field label="Instagram (sem @)"><input className={inputClass} value={s.instagram ?? ""} onChange={(e) => setS({ ...s, instagram: e.target.value })} /></Field>
      <Field label="Endereço (opcional)"><input className={inputClass} value={s.address ?? ""} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
      </div>
    </form>
  );
}

/* ---------------- Categories ---------------- */

function CategoriesAdmin() {
  const { categories } = useData();
  const [editing, setEditing] = useState<Category | null>(null);
  const blank: Category = { id: "", slug: "", name: "", icon: "Tag" };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Nome</th><th className="p-3">Slug</th><th className="p-3">Ícone</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3 text-muted-foreground">{c.icon}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(c)} className="mr-2 text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Excluir categoria?") && dataApi.remove("categories", c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-border">
          <button onClick={() => setEditing(blank)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Nova categoria</button>
        </div>
      </div>
      {editing && (
        <form
          key={editing.id || "new"}
          onSubmit={(e) => { e.preventDefault(); dataApi.upsert("categories", { ...editing, id: editing.id || newId() }); setEditing(null); }}
          className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit"
        >
          <h3 className="font-semibold">{editing.id ? "Editar categoria" : "Nova categoria"}</h3>
          <Field label="Nome"><input className={inputClass} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></Field>
          <Field label="Slug (URL)"><input className={inputClass} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} required /></Field>
          <Field label="Ícone (lucide-react)"><input className={inputClass} value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="ShoppingBasket" /></Field>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------------- Services ---------------- */

function ServicesAdmin() {
  const { services, stores } = useData();
  const [editing, setEditing] = useState<Service | null>(null);
  const blank: Service = { id: "", name: "", image: "", description: "", storeId: stores[0]?.id ?? "", whatsapp: stores[0]?.whatsapp ?? "", featured: false };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Serviço</th><th className="p-3">Loja</th><th className="p-3">Destaque</th><th></th></tr></thead>
          <tbody>
            {services.map((sv) => (
              <tr key={sv.id} className="border-t border-border">
                <td className="p-3 font-medium">{sv.name}</td>
                <td className="p-3 text-muted-foreground">{stores.find((s) => s.id === sv.storeId)?.name}</td>
                <td className="p-3">{sv.featured ? "Sim" : "Não"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(sv)} className="mr-2 text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Excluir serviço?") && dataApi.remove("services", sv.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-border">
          <button onClick={() => setEditing(blank)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Novo serviço</button>
        </div>
      </div>
      {editing && (
        <form
          key={editing.id || "new"}
          onSubmit={(e) => { e.preventDefault(); dataApi.upsert("services", { ...editing, id: editing.id || newId() }); setEditing(null); }}
          className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit"
        >
          <h3 className="font-semibold">{editing.id ? "Editar serviço" : "Novo serviço"}</h3>
          <Field label="Nome"><input className={inputClass} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></Field>
          <Field label="Imagem (URL)"><input className={inputClass} value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} required /></Field>
          <Field label="Descrição"><textarea className={inputClass} rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
          <Field label="Loja"><select className={inputClass} value={editing.storeId} onChange={(e) => { const st = stores.find((s) => s.id === e.target.value); setEditing({ ...editing, storeId: e.target.value, whatsapp: st?.whatsapp ?? editing.whatsapp }); }}>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="WhatsApp"><input className={inputClass} value={editing.whatsapp} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} required /></Field>
          <Field label="Destaque"><select className={inputClass} value={editing.featured ? "1" : "0"} onChange={(e) => setEditing({ ...editing, featured: e.target.value === "1" })}><option value="0">Não</option><option value="1">Sim</option></select></Field>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------------- Banners ---------------- */

function BannersAdmin() {
  const { banners } = useData();
  const [editing, setEditing] = useState<Banner | null>(null);
  const blank: Banner = { id: "", title: "", subtitle: "", image: "", link: "" };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Título</th><th className="p-3">Subtítulo</th><th></th></tr></thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-3 font-medium">{b.title}</td>
                <td className="p-3 text-muted-foreground">{b.subtitle}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(b)} className="mr-2 text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Excluir banner?") && dataApi.remove("banners", b.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-border">
          <button onClick={() => setEditing(blank)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Novo banner</button>
        </div>
      </div>
      {editing && (
        <form
          key={editing.id || "new"}
          onSubmit={(e) => { e.preventDefault(); dataApi.upsert("banners", { ...editing, id: editing.id || newId() }); setEditing(null); }}
          className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit"
        >
          <h3 className="font-semibold">{editing.id ? "Editar banner" : "Novo banner"}</h3>
          <Field label="Título"><input className={inputClass} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></Field>
          <Field label="Subtítulo"><input className={inputClass} value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></Field>
          <Field label="Imagem (URL)"><input className={inputClass} value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></Field>
          <Field label="Link (opcional)"><input className={inputClass} value={editing.link ?? ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} /></Field>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
