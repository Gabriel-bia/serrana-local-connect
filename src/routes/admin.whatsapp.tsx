import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  MessageCircle,
  RefreshCw,
  Search,
  Store as StoreIcon,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getWhatsappStats, type StoreClickStats } from "@/lib/whatsapp-stats.functions";

export const Route = createFileRoute("/admin/whatsapp")({
  head: () => ({ meta: [{ title: "Relatório de Cliques WhatsApp — Serrana Express" }] }),
  component: WhatsappReportPage,
});

const COLORS = [
  "#f97316", "#ea580c", "#fb923c", "#fdba74", "#c2410c",
  "#92400e", "#fed7aa", "#7c2d12", "#facc15", "#0ea5e9",
];

function WhatsappReportPage() {
  return (
    <AdminAuthGate redirectToAfterLogin="/admin/whatsapp">
      <ReportDashboard />
    </AdminAuthGate>
  );
}

function ReportDashboard() {
  const fetchStats = useServerFn(getWhatsappStats);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["whatsapp-stats"],
    queryFn: () => fetchStats(),
    refetchInterval: 30_000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <a
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao painel
            </a>
            <h1 className="mt-1 text-3xl font-bold">Relatório de Cliques WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Atualiza automaticamente a cada 30 segundos.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>

        {isLoading || !data ? (
          <div className="mt-12 grid place-items-center text-muted-foreground">Carregando…</div>
        ) : (
          <ReportBody data={data} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function ReportBody({ data }: { data: Awaited<ReturnType<typeof getWhatsappStats>> }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof StoreClickStats>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = data.perStore.filter((s) => !q || s.storeName.toLowerCase().includes(q));
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [data.perStore, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir]);

  const top10 = data.perStore.slice(0, 10).map((s) => ({ name: s.storeName, total: s.total }));
  const pieData = data.perStore.slice(0, 8).map((s) => ({ name: s.storeName, value: s.total }));

  const toggleSort = (k: keyof StoreClickStats) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total geral" value={data.totals.all} icon={<MessageCircle className="h-4 w-4" />} />
        <StatCard label="Hoje" value={data.totals.today} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Últimos 7 dias" value={data.totals.last7} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Últimos 30 dias" value={data.totals.last30} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Lojas com cliques" value={data.totals.storesWithClicks} icon={<StoreIcon className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Top 10 lojas mais clicadas">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top10} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Evolução diária (últimos 30 dias)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.dailyLast30}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Participação por loja">
          {pieData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Crescimento mensal">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Detalhes por loja</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar loja…"
                className="w-56 rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <ExportButtons data={filtered} generatedAt={data.generatedAt} />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <Th onClick={() => toggleSort("storeName")} active={sortKey === "storeName"} dir={sortDir}>Loja</Th>
                <Th onClick={() => toggleSort("total")} active={sortKey === "total"} dir={sortDir}>Total</Th>
                <Th onClick={() => toggleSort("today")} active={sortKey === "today"} dir={sortDir}>Hoje</Th>
                <Th onClick={() => toggleSort("last7")} active={sortKey === "last7"} dir={sortDir}>7 dias</Th>
                <Th onClick={() => toggleSort("last30")} active={sortKey === "last30"} dir={sortDir}>30 dias</Th>
                <Th onClick={() => toggleSort("lastClickAt")} active={sortKey === "lastClickAt"} dir={sortDir}>Último clique</Th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum clique registrado ainda.
                  </td>
                </tr>
              ) : (
                pageData.map((s) => (
                  <tr key={s.storeId} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-2 pr-3 font-medium">{s.storeName}</td>
                    <td className="py-2 pr-3 font-semibold text-primary">{s.total}</td>
                    <td className="py-2 pr-3">{s.today}</td>
                    <td className="py-2 pr-3">{s.last7}</td>
                    <td className="py-2 pr-3">{s.last30}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{formatDate(s.lastClickAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Página {page} de {totalPages} · {filtered.length} loja{filtered.length === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border bg-card px-3 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-border bg-card px-3 py-1 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-extrabold text-primary">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="mb-2 font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">Sem dados ainda</div>;
}

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th className="py-2 pr-3">
      <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-foreground ${active ? "text-foreground" : ""}`}>
        {children}
        {active && <span>{dir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

function ExportButtons({
  data,
  generatedAt,
}: {
  data: StoreClickStats[];
  generatedAt: string;
}) {
  const rows = data.map((s) => ({
    Loja: s.storeName,
    Total: s.total,
    Hoje: s.today,
    "Últimos 7 dias": s.last7,
    "Últimos 30 dias": s.last30,
    "Último clique": formatDate(s.lastClickAt),
  }));

  const exportCSV = () => {
    const header = Object.keys(rows[0] ?? { Loja: "" });
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        header.map((h) => `"${String((r as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "relatorio-whatsapp.csv");
  };

  const exportXLSX = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cliques WhatsApp");
    XLSX.writeFile(wb, "relatorio-whatsapp.xlsx");
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Cliques WhatsApp — Serrana Express", 14, 16);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date(generatedAt).toLocaleString("pt-BR")}`, 14, 23);
    autoTable(doc, {
      startY: 28,
      head: [["Loja", "Total", "Hoje", "7 dias", "30 dias", "Último clique"]],
      body: rows.map((r) => [
        r.Loja,
        r.Total,
        r.Hoje,
        r["Últimos 7 dias"],
        r["Últimos 30 dias"],
        r["Último clique"],
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
    });
    doc.save("relatorio-whatsapp.pdf");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={exportCSV}
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <Download className="h-3.5 w-3.5" /> CSV
      </button>
      <button
        onClick={exportXLSX}
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
      </button>
      <button
        onClick={exportPDF}
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        <FileText className="h-3.5 w-3.5" /> PDF
      </button>
    </div>
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
