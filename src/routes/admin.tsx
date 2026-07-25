import { createFileRoute, Outlet, useMatches, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { Pencil, Plus, Trash2, LogOut, ExternalLink, Upload, Lock, Unlock, ChevronLeft } from "lucide-react";
import { AdminAuthGate, useAdminLogout } from "@/components/AdminAuthGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { dataApi, useData, formatPrice, isValidWhatsappLink } from "@/lib/store";
import type { Banner, Category, Product, Service, ServiceCategory, Store, StoreCategory, Provider, ProviderService, ProviderWork } from "@/data/seed";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Serrana Express" }] }),
  component: AdminPage,
});

type Tab = "produtos" | "lojas" | "categorias" | "servicos" | "banners" | "prestadores" | "cat-prestadores";

function AdminPage() {
  const matches = useMatches();
  const currentRouteId = matches[matches.length - 1]?.routeId;
  const isAdminRoot = currentRouteId === "/admin";
  const redirectAfterLogin = currentRouteId === "/admin/whatsapp" ? "/admin/whatsapp" : "/dashboard";

  return (
    <AdminAuthGate redirectToAfterLogin={redirectAfterLogin}>
      {isAdminRoot ? <RedirectToDashboard /> : <Outlet />}
    </AdminAuthGate>
  );
}

function RedirectToDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto grid flex-1 place-items-center px-4 py-16 text-muted-foreground">
        Abrindo Dashboard…
      </main>
      <Footer />
    </div>
  );
}

export function AdminDashboardContent() {
  const [tab, setTab] = useState<Tab>("produtos");
  const data = useData();
  const logout = useAdminLogout("/admin");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "produtos", label: "Produtos", count: data.products.length },
    { key: "lojas", label: "Lojas", count: data.stores.length },
    { key: "prestadores", label: "Prestadores", count: data.providers.length },
    { key: "categorias", label: "Categorias", count: data.categories.length },
    { key: "cat-prestadores", label: "Categorias de Prestadores", count: data.serviceCategories.length },
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
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/relatorios"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              📄 Relatórios por Loja
            </a>
            <button
              onClick={async () => {
                if (!confirm("Enviar os dados deste dispositivo para a nuvem? Isso vai mesclar o conteúdo salvo neste celular/computador com o banco de dados online.")) return;
                try {
                  const { inserted } = await dataApi.importFromLocalStorage();
                  const total = Object.values(inserted).reduce((a, b) => a + b, 0);
                  alert(`Pronto! ${total} registros enviados para a nuvem.`);
                } catch (err) {
                  alert("Falha ao importar: " + (err instanceof Error ? err.message : String(err)));
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
              title="Faz upload do conteúdo salvo localmente neste dispositivo para o banco compartilhado"
            >
              <Upload className="h-4 w-4" /> Importar dados deste dispositivo
            </button>
            <button
              onClick={logout}
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
          {tab === "prestadores" && <ProvidersAdmin />}
          {tab === "categorias" && <CategoriesAdmin />}
          {tab === "cat-prestadores" && <ServiceCategoriesAdmin />}
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

/**
 * Redimensiona e comprime uma imagem no navegador para evitar payloads grandes
 * ao salvar (base64 grande estoura o limite do PostgREST).
 */
async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  const bitmap = await (typeof createImageBitmap === "function"
    ? createImageBitmap(file)
    : new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      }));
  const w = (bitmap as ImageBitmap).width || (bitmap as HTMLImageElement).naturalWidth;
  const h = (bitmap as ImageBitmap).height || (bitmap as HTMLImageElement).naturalHeight;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, cw, ch);
  const hasAlpha = file.type === "image/png" || file.type === "image/webp";
  const mime = hasAlpha ? "image/webp" : "image/jpeg";
  return canvas.toDataURL(mime, quality);
}

/**
 * Campo de upload de imagem com prévia. Aceita URL colada ou arquivo da galeria.
 * Arquivos são redimensionados e convertidos para base64 compacto.
 */
function ImageUploadField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Imagem muito grande (máximo 15MB).");
      return;
    }
    try {
      const dataUrl = await compressImage(file, 1600, 0.82);
      onChange(dataUrl);
    } catch (err) {
      console.error("[image] compress failed", err);
      alert("Não foi possível processar a imagem.");
    }
  }

  return (
    <Field label={label}>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            className={inputClass}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cole uma URL ou envie da galeria"
            required={required}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Upload className="h-4 w-4" /> Galeria
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {value ? (
          <img
            src={value}
            alt="Prévia"
            className="h-24 w-24 rounded-lg border border-border object-cover"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma imagem selecionada.</p>
        )}
      </div>
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
    originalPrice: undefined,
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
  const { stores, categories, storeCategories } = useData();
  const [p, setP] = useState<Product>(initial);
  const storeCats = storeCategories
    .filter((sc) => sc.storeId === p.storeId)
    .sort((a, b) => a.position - b.position);
  // Reset store category if it no longer belongs to selected store
  useEffect(() => {
    if (p.storeCategoryId && !storeCats.some((sc) => sc.id === p.storeCategoryId)) {
      setP((prev) => ({ ...prev, storeCategoryId: undefined }));
    }
  }, [p.storeId, storeCats, p.storeCategoryId]);
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
      <ImageUploadField label="Foto do produto" value={p.image} onChange={(v) => setP({ ...p, image: v })} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (R$)"><input type="number" step="0.01" className={inputClass} value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} required /></Field>
        <Field label="Preço original — DE (opcional)"><input type="number" step="0.01" placeholder="0,00" className={inputClass} value={p.originalPrice ?? ""} onChange={(e) => setP({ ...p, originalPrice: e.target.value === "" ? undefined : Number(e.target.value) })} /></Field>
      </div>
      <Field label="Destaque"><select className={inputClass} value={p.featured ? "1" : "0"} onChange={(e) => setP({ ...p, featured: e.target.value === "1" })}><option value="0">Não</option><option value="1">Sim</option></select></Field>
      <Field label="Descrição"><textarea className={inputClass} rows={3} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria"><select className={inputClass} value={p.categoryId} onChange={(e) => setP({ ...p, categoryId: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Loja"><select className={inputClass} value={p.storeId} onChange={(e) => { const st = stores.find((s) => s.id === e.target.value); setP({ ...p, storeId: e.target.value, storeCategoryId: undefined, whatsapp: st?.whatsapp ?? p.whatsapp }); }}>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      </div>
      <Field label="Categoria da Loja (opcional)">
        <select
          className={inputClass}
          value={p.storeCategoryId ?? ""}
          onChange={(e) => setP({ ...p, storeCategoryId: e.target.value || undefined })}
          disabled={storeCats.length === 0}
        >
          <option value="">— Sem categoria da loja —</option>
          {storeCats.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
        </select>
        {storeCats.length === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">Esta loja ainda não possui categorias. Crie na edição da loja.</p>
        )}
      </Field>
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
  const blank: Store = { id: "", name: "", logo: "", banner: "", description: "", categoryId: categories[0]?.id ?? "", whatsapp: "", instagram: "", address: "", featured: false, blocked: false };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Loja</th><th className="p-3 hidden sm:table-cell">Categoria</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img src={s.logo} className="h-10 w-10 rounded object-cover" alt="" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{categories.find((c) => c.id === s.categoryId)?.name}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{categories.find((c) => c.id === s.categoryId)?.name}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {s.featured && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Destaque</span>}
                    {s.blocked
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive"><Lock className="h-3 w-3" />Bloqueada</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600"><Unlock className="h-3 w-3" />Ativa</span>}
                  </div>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => dataApi.upsert("stores", { ...s, blocked: !s.blocked })}
                    className="mr-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
                    title={s.blocked ? "Desbloquear loja" : "Bloquear loja"}
                  >
                    {s.blocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{s.blocked ? "Desbloquear" : "Bloquear"}</span>
                  </button>
                  <button onClick={() => setEditing(s)} className="mr-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-primary hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" /><span className="hidden sm:inline">Editar</span>
                  </button>
                  <button onClick={() => confirm("Excluir loja?") && dataApi.remove("stores", s.id)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-destructive hover:bg-muted">
                    <Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Excluir</span>
                  </button>
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
        <StoreForm key={editing.id || "new"} initial={editing} onCancel={() => setEditing(null)} onSave={(s, linkedIds) => {
          const id = s.id || newId();
          dataApi.upsert("stores", { ...s, id });
          // Atualiza vínculo dos produtos selecionados.
          const current = dataApi.get().products;
          for (const prod of current) {
            const shouldLink = linkedIds.includes(prod.id);
            if (shouldLink && prod.storeId !== id) {
              dataApi.upsert("products", { ...prod, storeId: id, whatsapp: s.whatsapp || prod.whatsapp });
            }
          }
          setEditing(null);
        }} />
      )}
    </div>
  );
}

function StoreForm({ initial, onSave, onCancel }: { initial: Store; onSave: (s: Store, linkedProductIds: string[]) => void; onCancel: () => void }) {
  const { categories, products, storeCategories } = useData();
  const [s, setS] = useState<Store>(initial);
  const [linkedIds, setLinkedIds] = useState<string[]>(
    () => products.filter((p) => p.storeId === initial.id).map((p) => p.id),
  );
  const [newCatName, setNewCatName] = useState("");
  const storeCats = storeCategories
    .filter((sc) => sc.storeId === s.id)
    .sort((a, b) => a.position - b.position);

  function toggleLink(id: string) {
    setLinkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function addStoreCategory() {
    const name = newCatName.trim();
    if (!name || !s.id) return;
    await dataApi.upsert("storeCategories", {
      id: newId(),
      storeId: s.id,
      name,
      position: storeCats.length,
    });
    setNewCatName("");
  }

  async function renameStoreCategory(sc: StoreCategory) {
    const name = prompt("Novo nome da categoria:", sc.name)?.trim();
    if (!name || name === sc.name) return;
    await dataApi.upsert("storeCategories", { ...sc, name });
  }

  async function removeStoreCategory(sc: StoreCategory) {
    if (!confirm(`Excluir a categoria "${sc.name}"? Os produtos permanecerão, mas ficarão sem categoria da loja.`)) return;
    await dataApi.remove("storeCategories", sc.id);
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!isValidWhatsappLink(s.whatsapp.trim())) {
        alert("Informe um Link do WhatsApp válido (https://wa.me/... ou https://api.whatsapp.com/...).");
        return;
      }
      onSave({ ...s, whatsapp: s.whatsapp.trim() }, linkedIds);
    }} className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <h3 className="font-semibold">{s.id ? "Editar loja" : "Nova loja"}</h3>
      <Field label="Nome da loja"><input className={inputClass} value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} required /></Field>
      <Field label="Categoria"><select className={inputClass} value={s.categoryId} onChange={(e) => setS({ ...s, categoryId: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <WhatsAppLinkField value={s.whatsapp} onChange={(v) => setS({ ...s, whatsapp: v })} />
      <Field label="Instagram (sem @)"><input className={inputClass} value={s.instagram ?? ""} onChange={(e) => setS({ ...s, instagram: e.target.value })} /></Field>
      <Field label="Descrição"><textarea className={inputClass} rows={3} value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} /></Field>
      <ImageUploadField label="Logo da loja" value={s.logo} onChange={(v) => setS({ ...s, logo: v })} required />
      <ImageUploadField label="Banner da loja" value={s.banner} onChange={(v) => setS({ ...s, banner: v })} required />
      <Field label="Endereço (opcional)"><input className={inputClass} value={s.address ?? ""} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Destaque"><select className={inputClass} value={s.featured ? "1" : "0"} onChange={(e) => setS({ ...s, featured: e.target.value === "1" })}><option value="0">Não</option><option value="1">Sim</option></select></Field>
        <Field label="Status"><select className={inputClass} value={s.blocked ? "1" : "0"} onChange={(e) => setS({ ...s, blocked: e.target.value === "1" })}><option value="0">Ativa (visível)</option><option value="1">Bloqueada (oculta)</option></select></Field>
      </div>

      <div>
        <span className="text-xs font-medium text-muted-foreground">Categorias da loja</span>
        {!s.id ? (
          <p className="mt-1 text-xs text-muted-foreground">Salve a loja primeiro para criar categorias próprias.</p>
        ) : (
          <>
            <div className="mt-1 space-y-1 rounded-lg border border-border bg-background p-2">
              {storeCats.length === 0 && (
                <p className="p-1 text-xs text-muted-foreground">Nenhuma categoria criada.</p>
              )}
              {storeCats.map((sc) => (
                <div key={sc.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted">
                  <span className="flex-1 truncate">{sc.name}</span>
                  <button type="button" onClick={() => renameStoreCategory(sc)} className="rounded p-1 hover:bg-background" aria-label="Editar"><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => removeStoreCategory(sc)} className="rounded p-1 hover:bg-background text-destructive" aria-label="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input className={inputClass} placeholder="Nova categoria" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              <button type="button" onClick={addStoreCategory} className="rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">Adicionar</button>
            </div>
          </>
        )}
      </div>

      <div>
        <span className="text-xs font-medium text-muted-foreground">Produtos vinculados à loja</span>
        <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-background p-2 space-y-1">
          {products.length === 0 && <p className="text-xs text-muted-foreground p-2">Nenhum produto cadastrado ainda.</p>}
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted cursor-pointer">
              <input type="checkbox" checked={linkedIds.includes(p.id)} onChange={() => toggleLink(p.id)} />
              <img src={p.image} className="h-6 w-6 rounded object-cover" alt="" />
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-xs text-muted-foreground">{formatPrice(p.price)}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Selecione os produtos que pertencem a esta loja.</p>
      </div>

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

/* ---------------- Service Categories (Prestadores) ---------------- */

function ServiceCategoriesAdmin() {
  const { serviceCategories } = useData();
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const blank: ServiceCategory = { id: "", slug: "", name: "", icon: "Wrench" };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Nome</th><th className="p-3">Slug</th><th className="p-3">Ícone</th><th></th></tr></thead>
          <tbody>
            {serviceCategories.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3 text-muted-foreground">{c.icon}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(c)} className="mr-2 text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Excluir categoria?") && dataApi.remove("serviceCategories", c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
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
          onSubmit={(e) => { e.preventDefault(); dataApi.upsert("serviceCategories", { ...editing, id: editing.id || newId() }); setEditing(null); }}
          className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit"
        >
          <h3 className="font-semibold">{editing.id ? "Editar categoria" : "Nova categoria de prestador"}</h3>
          <Field label="Nome"><input className={inputClass} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></Field>
          <Field label="Slug (URL)"><input className={inputClass} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} required /></Field>
          <Field label="Ícone (lucide-react)"><input className={inputClass} value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="Wrench" /></Field>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}


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
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValidWhatsappLink(editing.whatsapp.trim())) {
              alert("Informe um Link do WhatsApp válido (https://wa.me/... ou https://api.whatsapp.com/...).");
              return;
            }
            dataApi.upsert("services", { ...editing, whatsapp: editing.whatsapp.trim(), id: editing.id || newId() });
            setEditing(null);
          }}
          className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit"
        >
          <h3 className="font-semibold">{editing.id ? "Editar serviço" : "Novo serviço"}</h3>
          <Field label="Nome"><input className={inputClass} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></Field>
          <ImageUploadField label="Imagem do serviço" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} required />
          <Field label="Descrição"><textarea className={inputClass} rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
          <Field label="Loja"><select className={inputClass} value={editing.storeId} onChange={(e) => { const st = stores.find((s) => s.id === e.target.value); setEditing({ ...editing, storeId: e.target.value, whatsapp: st?.whatsapp ?? editing.whatsapp }); }}>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <WhatsAppLinkField value={editing.whatsapp} onChange={(v) => setEditing({ ...editing, whatsapp: v })} />
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
          <ImageUploadField label="Imagem do banner" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} />
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

/* ---------------- Providers (Prestadores) ---------------- */

function ProvidersAdmin() {
  const { providers, serviceCategories } = useData();
  const [editing, setEditing] = useState<Provider | null>(null);
  const [managing, setManaging] = useState<Provider | null>(null);
  const blank: Provider = {
    id: "",
    name: "",
    photo: "",
    cover: "",
    description: "",
    whatsapp: "",
    phone: "",
    city: "",
    serviceArea: "",
    instagram: "",
    facebook: "",
    schedule: "",
    categoryIds: [],
    featured: false,
    blocked: false,
  };

  if (managing) {
    return <ProviderManage provider={managing} onBack={() => setManaging(null)} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Prestador</th>
              <th className="p-3 hidden sm:table-cell">Categorias</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img src={p.photo} className="h-10 w-10 rounded-full object-cover" alt="" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.city}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">
                  {p.categoryIds
                    .map((id) => serviceCategories.find((c) => c.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.featured && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Destaque</span>}
                    {p.blocked
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive"><Lock className="h-3 w-3" />Bloqueado</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600"><Unlock className="h-3 w-3" />Ativo</span>}
                  </div>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setManaging(p)}
                    className="mr-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
                    title="Gerenciar serviços e trabalhos"
                  >
                    Serviços/Trabalhos
                  </button>
                  <button
                    onClick={() => dataApi.upsert("providers", { ...p, blocked: !p.blocked })}
                    className="mr-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
                  >
                    {p.blocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => setEditing(p)} className="mr-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-primary hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm("Excluir prestador? Os serviços e trabalhos vinculados também serão removidos.")) return;
                      const all = dataApi.get();
                      all.providerServices.filter((s) => s.providerId === p.id).forEach((s) => dataApi.remove("providerServices", s.id));
                      all.providerWorks.filter((w) => w.providerId === p.id).forEach((w) => dataApi.remove("providerWorks", w.id));
                      dataApi.remove("providers", p.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-destructive hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-border">
          <button onClick={() => setEditing(blank)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo prestador
          </button>
        </div>
      </div>

      {editing && (
        <ProviderForm
          key={editing.id || "new"}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => {
            dataApi.upsert("providers", { ...p, id: p.id || newId() });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProviderForm({ initial, onSave, onCancel }: { initial: Provider; onSave: (p: Provider) => void; onCancel: () => void }) {
  const { serviceCategories } = useData();
  const [p, setP] = useState<Provider>(initial);

  function toggleCat(id: string) {
    setP((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((x) => x !== id)
        : [...prev.categoryIds, id],
    }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isValidWhatsappLink(p.whatsapp.trim())) {
          alert("Informe um Link do WhatsApp válido.");
          return;
        }
        if (p.categoryIds.length === 0) {
          alert("Selecione ao menos uma categoria.");
          return;
        }
        onSave({ ...p, whatsapp: p.whatsapp.trim() });
      }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
    >
      <h3 className="font-semibold">{p.id ? "Editar prestador" : "Novo prestador"}</h3>
      <Field label="Nome do profissional ou empresa">
        <input className={inputClass} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} required />
      </Field>
      <ImageUploadField label="Foto de perfil" value={p.photo} onChange={(v) => setP({ ...p, photo: v })} required />
      <ImageUploadField label="Imagem de capa" value={p.cover} onChange={(v) => setP({ ...p, cover: v })} required />
      <Field label="Descrição profissional">
        <textarea className={inputClass} rows={3} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} required />
      </Field>
      <WhatsAppLinkField value={p.whatsapp} onChange={(v) => setP({ ...p, whatsapp: v })} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone"><input className={inputClass} value={p.phone ?? ""} onChange={(e) => setP({ ...p, phone: e.target.value })} placeholder="+5535999990000" /></Field>
        <Field label="Cidade"><input className={inputClass} value={p.city ?? ""} onChange={(e) => setP({ ...p, city: e.target.value })} /></Field>
      </div>
      <Field label="Região de atendimento">
        <input className={inputClass} value={p.serviceArea ?? ""} onChange={(e) => setP({ ...p, serviceArea: e.target.value })} placeholder="Ex.: Serrana e região" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Instagram (sem @)"><input className={inputClass} value={p.instagram ?? ""} onChange={(e) => setP({ ...p, instagram: e.target.value })} /></Field>
        <Field label="Facebook"><input className={inputClass} value={p.facebook ?? ""} onChange={(e) => setP({ ...p, facebook: e.target.value })} /></Field>
      </div>
      <Field label="Horário de atendimento">
        <input className={inputClass} value={p.schedule ?? ""} onChange={(e) => setP({ ...p, schedule: e.target.value })} placeholder="Ex.: Seg a Sex, 8h-18h" />
      </Field>

      <div>
        <span className="text-xs font-medium text-muted-foreground">Categorias de serviço</span>
        <div className="mt-1 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto rounded-lg border border-border bg-background p-2">
          {serviceCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCat(c.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                p.categoryIds.includes(c.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Destaque"><select className={inputClass} value={p.featured ? "1" : "0"} onChange={(e) => setP({ ...p, featured: e.target.value === "1" })}><option value="0">Não</option><option value="1">Sim</option></select></Field>
        <Field label="Status"><select className={inputClass} value={p.blocked ? "1" : "0"} onChange={(e) => setP({ ...p, blocked: e.target.value === "1" })}><option value="0">Ativo (visível)</option><option value="1">Bloqueado (oculto)</option></select></Field>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
      </div>
    </form>
  );
}

function ProviderManage({ provider, onBack }: { provider: Provider; onBack: () => void }) {
  const { providerServices, providerWorks, serviceCategories } = useData();
  const myServices = providerServices.filter((s) => s.providerId === provider.id);
  const myWorks = providerWorks.filter((w) => w.providerId === provider.id);

  const [editingService, setEditingService] = useState<ProviderService | null>(null);
  const [editingWork, setEditingWork] = useState<ProviderWork | null>(null);

  const blankService: ProviderService = {
    id: "",
    providerId: provider.id,
    name: "",
    description: "",
    price: undefined,
    image: "",
    categoryId: provider.categoryIds[0] ?? serviceCategories[0]?.id ?? "",
    duration: "",
    active: true,
    featured: false,
  };
  const blankWork: ProviderWork = {
    id: "",
    providerId: provider.id,
    title: "",
    description: "",
    image: "",
    date: new Date().toISOString().slice(0, 10),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <img src={provider.photo} className="h-10 w-10 rounded-full object-cover" alt="" />
          <div>
            <div className="font-semibold">{provider.name}</div>
            <div className="text-xs text-muted-foreground">Gerenciar serviços e trabalhos</div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-semibold">Serviços oferecidos</h3>
            <button onClick={() => setEditingService(blankService)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" /> Novo serviço
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Serviço</th><th className="p-3">Valor</th><th className="p-3">Status</th><th></th></tr>
            </thead>
            <tbody>
              {myServices.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">Nenhum serviço cadastrado.</td></tr>}
              {myServices.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={s.image} className="h-10 w-10 rounded object-cover" alt="" />
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{serviceCategories.find((c) => c.id === s.categoryId)?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{s.price != null && s.price > 0 ? formatPrice(s.price) : "—"}</td>
                  <td className="p-3 text-xs">
                    {s.active ? <span className="text-emerald-600">Ativo</span> : <span className="text-muted-foreground">Inativo</span>}
                    {s.featured && <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-primary">Destaque</span>}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditingService(s)} className="mr-2 text-primary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => confirm("Excluir serviço?") && dataApi.remove("providerServices", s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingService && (
          <form
            key={editingService.id || "new-s"}
            onSubmit={(e) => {
              e.preventDefault();
              dataApi.upsert("providerServices", { ...editingService, id: editingService.id || newId() });
              setEditingService(null);
            }}
            className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit"
          >
            <h3 className="font-semibold">{editingService.id ? "Editar serviço" : "Novo serviço"}</h3>
            <Field label="Nome"><input className={inputClass} value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} required /></Field>
            <Field label="Descrição"><textarea className={inputClass} rows={3} value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} /></Field>
            <ImageUploadField label="Imagem ilustrativa" value={editingService.image} onChange={(v) => setEditingService({ ...editingService, image: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor (R$) — opcional">
                <input type="number" step="0.01" className={inputClass} value={editingService.price ?? ""} onChange={(e) => setEditingService({ ...editingService, price: e.target.value === "" ? undefined : Number(e.target.value) })} />
              </Field>
              <Field label="Tempo estimado"><input className={inputClass} value={editingService.duration ?? ""} onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })} placeholder="Ex.: 40 min" /></Field>
            </div>
            <Field label="Categoria"><select className={inputClass} value={editingService.categoryId} onChange={(e) => setEditingService({ ...editingService, categoryId: e.target.value })}>{serviceCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status"><select className={inputClass} value={editingService.active ? "1" : "0"} onChange={(e) => setEditingService({ ...editingService, active: e.target.value === "1" })}><option value="1">Ativo</option><option value="0">Inativo</option></select></Field>
              <Field label="Destaque"><select className={inputClass} value={editingService.featured ? "1" : "0"} onChange={(e) => setEditingService({ ...editingService, featured: e.target.value === "1" })}><option value="0">Não</option><option value="1">Sim</option></select></Field>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
              <button type="button" onClick={() => setEditingService(null)} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
            </div>
          </form>
        )}
      </div>

      {/* Works */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-semibold">Trabalhos realizados</h3>
            <button onClick={() => setEditingWork(blankWork)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" /> Novo trabalho
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Trabalho</th><th className="p-3">Data</th><th></th></tr>
            </thead>
            <tbody>
              {myWorks.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground text-sm">Nenhum trabalho publicado.</td></tr>}
              {myWorks.map((w) => (
                <tr key={w.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={w.image} className="h-10 w-10 rounded object-cover" alt="" />
                      <div>
                        <div className="font-medium">{w.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{w.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{w.date ? new Date(w.date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditingWork(w)} className="mr-2 text-primary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => confirm("Excluir trabalho?") && dataApi.remove("providerWorks", w.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingWork && (
          <form
            key={editingWork.id || "new-w"}
            onSubmit={(e) => {
              e.preventDefault();
              dataApi.upsert("providerWorks", { ...editingWork, id: editingWork.id || newId() });
              setEditingWork(null);
            }}
            className="rounded-xl border border-border bg-card p-4 space-y-3 h-fit"
          >
            <h3 className="font-semibold">{editingWork.id ? "Editar trabalho" : "Novo trabalho"}</h3>
            <Field label="Título"><input className={inputClass} value={editingWork.title} onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })} required /></Field>
            <Field label="Descrição"><textarea className={inputClass} rows={3} value={editingWork.description} onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })} /></Field>
            <ImageUploadField label="Foto do trabalho" value={editingWork.image} onChange={(v) => setEditingWork({ ...editingWork, image: v })} required />
            <Field label="Data da publicação"><input type="date" className={inputClass} value={editingWork.date} onChange={(e) => setEditingWork({ ...editingWork, date: e.target.value })} required /></Field>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground">Salvar</button>
              <button type="button" onClick={() => setEditingWork(null)} className="rounded-lg border border-border px-3 py-2 font-medium">Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

