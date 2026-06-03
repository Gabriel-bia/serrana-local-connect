import { createServerFn } from "@tanstack/react-start";

export type StoreClickStats = {
  storeId: string;
  storeName: string;
  total: number;
  today: number;
  last7: number;
  last30: number;
  lastClickAt: string | null;
};

export type DailyPoint = { date: string; count: number };
export type MonthlyPoint = { month: string; count: number };

export type WhatsappStatsResult = {
  totals: {
    all: number;
    today: number;
    last7: number;
    last30: number;
    storesWithClicks: number;
  };
  perStore: StoreClickStats[];
  dailyLast30: DailyPoint[];
  monthly: MonthlyPoint[];
  generatedAt: string;
};

export const getWhatsappStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<WhatsappStatsResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("whatsapp_clicks")
      .select("store_id, store_name, clicked_at")
      .order("clicked_at", { ascending: false })
      .limit(50000);

    if (error) throw new Error(error.message);

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const ms7 = 7 * 24 * 60 * 60 * 1000;
    const ms30 = 30 * 24 * 60 * 60 * 1000;

    const perStoreMap = new Map<string, StoreClickStats>();
    const dailyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();

    // Pré-popula 30 dias
    for (let i = 29; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }

    let totalAll = 0;
    let totalToday = 0;
    let total7 = 0;
    let total30 = 0;

    for (const row of data ?? []) {
      const clickedAt = new Date(row.clicked_at);
      totalAll++;

      const isToday = clickedAt >= startOfToday;
      const in7 = now.getTime() - clickedAt.getTime() <= ms7;
      const in30 = now.getTime() - clickedAt.getTime() <= ms30;
      if (isToday) totalToday++;
      if (in7) total7++;
      if (in30) total30++;

      const key = row.store_id;
      const existing = perStoreMap.get(key);
      if (existing) {
        existing.total++;
        if (isToday) existing.today++;
        if (in7) existing.last7++;
        if (in30) existing.last30++;
        if (!existing.lastClickAt || clickedAt > new Date(existing.lastClickAt)) {
          existing.lastClickAt = row.clicked_at;
        }
      } else {
        perStoreMap.set(key, {
          storeId: row.store_id,
          storeName: row.store_name,
          total: 1,
          today: isToday ? 1 : 0,
          last7: in7 ? 1 : 0,
          last30: in30 ? 1 : 0,
          lastClickAt: row.clicked_at,
        });
      }

      if (in30) {
        const dayKey = clickedAt.toISOString().slice(0, 10);
        if (dailyMap.has(dayKey)) dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + 1);
      }
      const monthKey = clickedAt.toISOString().slice(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + 1);
    }

    return {
      totals: {
        all: totalAll,
        today: totalToday,
        last7: total7,
        last30: total30,
        storesWithClicks: perStoreMap.size,
      },
      perStore: [...perStoreMap.values()].sort((a, b) => b.total - a.total),
      dailyLast30: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
      monthly: [...monthlyMap.entries()]
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([month, count]) => ({ month, count })),
      generatedAt: new Date().toISOString(),
    };
  },
);
