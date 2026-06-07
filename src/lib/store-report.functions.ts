import { createServerFn } from "@tanstack/react-start";
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
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const getStoreReport = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<StoreReportResult> => {
    const { requireAdminSession } = await import("./admin-auth.server");
    await requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = (supabaseAdmin.from("whatsapp_clicks" as never) as never as {
      select: (cols: string) => {
        order: (col: string, opts: { ascending: boolean }) => {
          limit: (n: number) => Promise<{
            data: Array<{ store_id: string; store_name: string; clicked_at: string }> | null;
            error: { message: string } | null;
          }>;
          gte?: (col: string, v: string) => unknown;
        };
      };
    })
      .select("store_id, store_name, clicked_at");

    let q: any = query;
    if (data.storeId) q = q.eq("store_id", data.storeId);
    if (data.startDate) q = q.gte("clicked_at", data.startDate);
    if (data.endDate) q = q.lte("clicked_at", data.endDate);

    const { data: rows, error } = await q
      .order("clicked_at", { ascending: false })
      .limit(50000);

    if (error) throw new Error(error.message);

    const map = new Map<string, StoreReportRow>();
    for (const row of (rows ?? []) as Array<{ store_id: string; store_name: string; clicked_at: string }>) {
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
