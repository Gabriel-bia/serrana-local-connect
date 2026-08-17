import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, History, RefreshCw, Store as StoreIcon } from "lucide-react";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useData } from "@/lib/store";
import { getStoreReport, type StoreReportResult } from "@/lib/store-report.functions";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios por Loja — Serrana Express" }] }),
  component: () => (
    <AdminAuthGate redirectToAfterLogin="/admin/relatorios">
      <ReportsPage />
    </AdminAuthGate>
  ),
});

type Period = "today" | "7d" | "30d" | "custom";

const HISTORY_KEY = "serrana-report-history-v1";

type HistoryEntry = {
  id: string;
  generatedAt: string;
  storeLabel: string;
  periodLabel: string;
  total: number;
};

type Kind = "stores" | "providers";
export type ReportEntity = { id: string; name: string; categoryName: string };

function ReportsPage() {
  const { stores, categories, providers, serviceCategories } = useData();
  const [kind, setKind] = useState<Kind>("stores");
  const [storeId, setStoreId] = useState<string>("all");
  const [period, setPeriod] = useState<Period>("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const entities: ReportEntity[] = useMemo(() => {
    if (kind === "providers") {
      return providers.map((p) => ({
        id: p.id,
        name: p.name,
        categoryName:
          (p.categoryIds ?? [])
            .map((cid) => serviceCategories.find((c) => c.id === cid)?.name)
            .filter(Boolean)
            .join(", ") || "—",
      }));
    }
    return stores.map((s) => ({
      id: s.id,
      name: s.name,
      categoryName: categories.find((c) => c.id === s.categoryId)?.name ?? "—",
    }));
  }, [kind, stores, categories, providers, serviceCategories]);

  const entityIds = useMemo(() => entities.map((e) => e.id), [entities]);
  const noun = kind === "providers" ? "prestador" : "loja";
  const nounPlural = kind === "providers" ? "prestadores" : "lojas";

  useEffect(() => {
    setStoreId("all");
  }, [kind]);

  const { startDate, endDate, periodLabel } = useMemo(() => computeRange(period, customStart, customEnd), [period, customStart, customEnd]);

  const fetchReport = useServerFn(getStoreReport);
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["store-report", kind, storeId, startDate, endDate, entityIds.length],
    queryFn: () =>
      fetchReport({
        data: {
          storeId: storeId === "all" ? null : storeId,
          startDate,
          endDate,
          entityIds: storeId === "all" ? entityIds : null,
        },
      }),
    enabled: entityIds.length > 0 || storeId !== "all",
    retry: 1,
  });

  const selectedStore = storeId === "all" ? null : entities.find((s) => s.id === storeId) ?? null;
  const storeLabel = selectedStore ? selectedStore.name : `Todos os ${nounPlural}`;

  const onExportPDF = async () => {
    if (!data) return;
    await exportPDF({ data, entities, selectedStoreId: storeId, periodLabel, storeLabel, noun });
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      storeLabel,
      periodLabel,
      total: data.totals.all,
    };
    const next = [entry, ...history].slice(0, 30);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <a href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel
        </a>
        <h1 className="mt-1 text-3xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Gere relatórios de lojas ou prestadores de serviço e exporte em PDF.</p>

        <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Tipo</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="stores">Lojas</option>
              <option value="providers">Prestadores de serviço</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{kind === "providers" ? "Prestador" : "Loja"}</span>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os {nounPlural} (relatório geral)</option>
              {entities.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}

            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Período</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="today">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="custom">Personalizado</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
            </button>
            <button
              onClick={onExportPDF}
              disabled={!data || isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" /> Baixar PDF
            </button>
          </div>

          {period === "custom" && (
            <>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Data inicial</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Data final</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-lg font-bold">Prévia do relatório</h2>
          {error ? (
            <p className="text-sm text-destructive">
              Não foi possível gerar o relatório: {(error as Error).message}
            </p>
          ) : isLoading || !data ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <ReportPreview
              data={data}
              entities={entities}
              noun={noun}
              selectedStoreId={storeId}
              storeLabel={storeLabel}
              periodLabel={periodLabel}
            />
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <History className="h-4 w-4" /> Histórico de relatórios gerados
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Loja</th>
                    <th className="py-2 pr-3">Período</th>
                    <th className="py-2 pr-3">Cliques</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-border">
                      <td className="py-2 pr-3">{new Date(h.generatedAt).toLocaleString("pt-BR")}</td>
                      <td className="py-2 pr-3">{h.storeLabel}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{h.periodLabel}</td>
                      <td className="py-2 pr-3 font-semibold text-primary">{h.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem(HISTORY_KEY);
              }}
              className="mt-3 text-xs text-muted-foreground hover:text-destructive"
            >
              Limpar histórico
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ReportPreview({
  data,
  entities,
  noun,
  selectedStoreId,
  storeLabel,
  periodLabel,
}: {
  data: StoreReportResult;
  entities: ReportEntity[];
  noun: string;
  selectedStoreId: string;
  storeLabel: string;
  periodLabel: string;
}) {
  const avg = data.totals.averagePerStore;
  const selected = selectedStoreId !== "all" ? entities.find((s) => s.id === selectedStoreId) : null;
  const selectedRow = selected ? data.rows.find((r) => r.storeId === selected.id) : null;
  const selectedCount = selectedRow?.total ?? 0;

  const observation =
    selectedStoreId === "all"
      ? `Total de ${data.totals.all} cliques distribuídos entre ${data.totals.storesWithClicks} ${noun}(s). Média por ${noun}: ${avg.toFixed(1)}.`
      : selectedCount >= avg
      ? "Parabéns! O desempenho está acima da média, atraindo muitos clientes."
      : "Há oportunidades para aumentar a visibilidade. Considere atualizar as publicações e ofertas.";


  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Relatório de Desempenho</p>
            <p className="text-lg font-bold">{storeLabel}</p>
            <p className="text-xs text-muted-foreground">
              Período: {periodLabel} · Gerado em {new Date(data.generatedAt).toLocaleString("pt-BR")}
            </p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground">
            SE
          </span>
        </div>
      </div>

      {selected ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Info label={noun === "prestador" ? "Prestador" : "Loja"} value={selected.name} />
          <Info label="Categoria" value={selected.categoryName} />
          <Info label="Cliques no WhatsApp" value={selectedCount.toLocaleString("pt-BR")} highlight />
          <Info label="Visualizações" value="Métrica em implantação" />
          <Info
            label="Último clique"
            value={selectedRow?.lastClickAt ? new Date(selectedRow.lastClickAt).toLocaleString("pt-BR") : "—"}
          />
          <Info label="Primeiro clique no período" value={selectedRow?.firstClickAt ? new Date(selectedRow.firstClickAt).toLocaleString("pt-BR") : "—"} />
          <Info label="Data do relatório" value={new Date(data.generatedAt).toLocaleString("pt-BR")} />
          <Info label="Média geral por loja" value={avg.toFixed(1)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Info label="Total de cliques" value={data.totals.all.toLocaleString("pt-BR")} highlight />
          <Info label="Lojas com cliques" value={data.totals.storesWithClicks.toLocaleString("pt-BR")} />
          <Info label="Média por loja" value={avg.toFixed(1)} />
          <Info label="Período" value={periodLabel} />
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Observações automáticas</p>
        <p className="mt-1 text-sm">{observation}</p>
      </div>

      {selectedStoreId === "all" && data.rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2">Loja</th>
                <th className="p-2">Categoria</th>
                <th className="p-2">Cliques</th>
                <th className="p-2">Último clique</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => {
                const st = entities.find((s) => s.id === r.storeId);
                const cat = st ? st.categoryName : "—";
                return (
                  <tr key={r.storeId} className="border-t border-border">
                    <td className="p-2 font-medium">{r.storeName}</td>
                    <td className="p-2 text-muted-foreground">{cat ?? "—"}</td>
                    <td className="p-2 font-semibold text-primary">{r.total}</td>
                    <td className="p-2 text-muted-foreground">
                      {r.lastClickAt ? new Date(r.lastClickAt).toLocaleString("pt-BR") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="border-t border-border pt-3 text-center text-xs italic text-muted-foreground">
        Obrigado por fazer parte do Serrana Express. Juntos estamos conectando clientes e empresas locais de forma rápida, prática e eficiente.
      </p>
    </div>
  );
}

function Info({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function computeRange(period: Period, customStart: string, customEnd: string) {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);
  let label = "";

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
    label = "Hoje";
  } else if (period === "7d") {
    start.setDate(start.getDate() - 7);
    label = "Últimos 7 dias";
  } else if (period === "30d") {
    start.setDate(start.getDate() - 30);
    label = "Últimos 30 dias";
  } else {
    if (customStart) start = new Date(customStart + "T00:00:00");
    else start.setDate(start.getDate() - 30);
    if (customEnd) end.setTime(new Date(customEnd + "T23:59:59").getTime());
    label = `${start.toLocaleDateString("pt-BR")} – ${end.toLocaleDateString("pt-BR")}`;
  }

  return { startDate: start.toISOString(), endDate: end.toISOString(), periodLabel: label };
}

async function exportPDF({
  data,
  entities,
  noun,
  selectedStoreId,
  periodLabel,
  storeLabel,
}: {
  data: StoreReportResult;
  entities: ReportEntity[];
  noun: string;
  selectedStoreId: string;
  periodLabel: string;
  storeLabel: string;
}) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header — logo box "SE" + title
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(14, 12, 16, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SE", 22, 23, { align: "center" });

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(16);
  doc.text("Serrana Express — Relatório de Desempenho", 34, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Loja: ${storeLabel}`, 34, 26);
  doc.text(`Período: ${periodLabel}`, 34, 31);
  doc.text(`Gerado em: ${new Date(data.generatedAt).toLocaleString("pt-BR")}`, 34, 36);

  let y = 46;
  const selected = selectedStoreId !== "all" ? stores.find((s) => s.id === selectedStoreId) : null;
  const avg = data.totals.averagePerStore;

  if (selected) {
    const row = data.rows.find((r) => r.storeId === selected.id);
    const cat = categories.find((c) => c.id === selected.categoryId)?.name ?? "—";
    autoTable(doc, {
      startY: y,
      head: [["Campo", "Valor"]],
      body: [
        ["Nome da loja", selected.name],
        ["Categoria", cat],
        ["Quantidade de cliques no WhatsApp", String(row?.total ?? 0)],
        ["Visualizações", "Métrica em implantação"],
        ["Data de cadastro", "Não informada"],
        ["Último clique", row?.lastClickAt ? new Date(row.lastClickAt).toLocaleString("pt-BR") : "—"],
        ["Data do relatório", new Date(data.generatedAt).toLocaleString("pt-BR")],
        ["Média geral por loja", avg.toFixed(1)],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [249, 115, 22] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    const obs =
      (row?.total ?? 0) >= avg
        ? "Parabéns! Sua loja está apresentando excelente desempenho e atraindo muitos clientes."
        : "Há oportunidades para aumentar a visibilidade da sua loja. Considere atualizar suas publicações e ofertas.";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("Observações", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wrap = doc.splitTextToSize(obs, pageWidth - 28);
    doc.text(wrap, 14, y + 6);
    y += 6 + wrap.length * 5 + 4;

    if (row && row.dailyBreakdown.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Data", "Cliques"]],
        body: row.dailyBreakdown.map((d) => [d.date, String(d.count)]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [234, 88, 12] },
      });
    }
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Loja", "Categoria", "Cliques", "Último clique"]],
      body: data.rows.map((r) => {
        const st = stores.find((s) => s.id === r.storeId);
        const cat = st ? categories.find((c) => c.id === st.categoryId)?.name ?? "—" : "—";
        return [r.storeName, cat, String(r.total), r.lastClickAt ? new Date(r.lastClickAt).toLocaleString("pt-BR") : "—"];
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [249, 115, 22] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Resumo geral", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Total: ${data.totals.all} cliques · ${data.totals.storesWithClicks} loja(s) com cliques · Média ${avg.toFixed(1)} por loja.`,
      14,
      y + 6,
    );
  }

  // Footer on each page
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220);
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.setFont("helvetica", "italic");
    const msg =
      "Obrigado por fazer parte do Serrana Express. Juntos estamos conectando clientes e empresas locais de forma rápida, prática e eficiente.";
    const wrap = doc.splitTextToSize(msg, pageWidth - 28);
    doc.text(wrap, pageWidth / 2, pageHeight - 13, { align: "center" });
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 5, { align: "right" });
  }

  const safe = storeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`relatorio-${safe || "geral"}-${Date.now()}.pdf`);
}
