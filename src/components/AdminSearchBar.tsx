import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminFilters } from "@/lib/admin-search";

export function AdminSearchBar({ value, onChange, categories, status = false, count }: {
  value: AdminFilters; onChange: (value: AdminFilters) => void;
  categories?: { id: string; name: string }[]; status?: boolean; count: number;
}) {
  const control = "min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  return <div className="p-3 border-b border-border space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative flex-1 min-w-48"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input aria-label="Pesquisar cadastros" type="search" placeholder="Pesquisar…" value={value.query} onChange={(e) => onChange({ ...value, query: e.target.value })} className={`${control} w-full pl-9`} /></label>
      {categories && <select aria-label="Filtrar categoria" className={`${control} flex-1 min-w-36`} value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}><option value="">Todas as categorias</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
      {status && <select aria-label="Filtrar status" className={control} value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}><option value="">Todos os status</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select>}
      <Button variant="outline" size="icon" title="Limpar pesquisa e filtros" aria-label="Limpar pesquisa e filtros" onClick={() => onChange({ query: "", category: "", status: "" })}><X className="h-4 w-4" /></Button>
    </div>
    <p aria-live="polite" className="text-xs text-muted-foreground">{count} registro{count !== 1 ? "s" : ""}</p>
  </div>;
}