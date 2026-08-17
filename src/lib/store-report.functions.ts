import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type StoreReportRow = {
  storeId: string;
  storeName: string;
  total: number;
  firstClickAt: string | null;
  lastClickAt: string | null;
  dailyBreakdown: Array<{ date: string; count: number }>;
};

export type StoreReportResult = {
  rangeStart: string | null;
  rangeEnd: string | null;
  totals: { all: number; storesWithClicks: number; averagePerStore: number };
  rows: StoreReportRow[];
  generatedAt: string;
};

const inputSchema = z.object({
  storeId: z.string().min(1).max(200).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  /** Restringe o relatório a um conjunto de IDs (lojas ou prestadores). */
  entityIds: z.array(z.string().min(1).max(200)).max(2000).optional().nullable(),
});

export const getStoreReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<StoreReportResult> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Acesso administrativo obrigatório.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = (supabaseAdmin as any)
      .from("whatsapp_clicks")
      .select("store_id, store_name, clicked_at");

    if (data.storeId) q = q.eq("store_id", data.storeId);
    if (data.startDate) q = q.gte("clicked_at", data.startDate);
    if (data.endDate) q = q.lte("clicked_at", data.endDate);

    const { data: rows, error } = await q.order("clicked_at", { ascending: false }).limit(50000);

    if (error) throw new Error(error.message);

    const allowed = data.entityIds && data.entityIds.length > 0 ? new Set(data.entityIds) : null;

    const map = new Map<string, StoreReportRow>();
    for (const row of (rows ?? []) as Array<{ store_id: string; store_name: string; clicked_at: string }>) {
      if (allowed && !allowed.has(row.store_id)) continue;
      const r = map.get(row.store_id);
      const day = row.clicked_at.slice(0, 10);
      if (r) {
        r.total++;
        if (!r.lastClickAt || row.clicked_at > r.lastClickAt) r.lastClickAt = row.clicked_at;
        if (!r.firstClickAt || row.clicked_at < r.firstClickAt) r.firstClickAt = row.clicked_at;
        const d = r.dailyBreakdown.find((x) => x.date === day);
        if (d) d.count++;
        else r.dailyBreakdown.push({ date: day, count: 1 });
      } else {
        map.set(row.store_id, {
          storeId: row.store_id,
          storeName: row.store_name,
          total: 1,
          firstClickAt: row.clicked_at,
          lastClickAt: row.clicked_at,
          dailyBreakdown: [{ date: day, count: 1 }],
        });
      }
    }

    const list = [...map.values()].sort((a, b) => b.total - a.total);
    list.forEach((r) => r.dailyBreakdown.sort((a, b) => (a.date < b.date ? -1 : 1)));

    const all = list.reduce((acc, r) => acc + r.total, 0);
    const averagePerStore = list.length > 0 ? all / list.length : 0;

    return {
      rangeStart: data.startDate ?? null,
      rangeEnd: data.endDate ?? null,
      totals: { all, storesWithClicks: list.length, averagePerStore },
      rows: list,
      generatedAt: new Date().toISOString(),
    };
  });
