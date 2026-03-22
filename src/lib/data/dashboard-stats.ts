import { db } from "@/db";
import {
  alerts,
  commercialProducts,
  consumptionDailyAggregates,
  inventoryLots,
} from "@/db/schema";
import { and, asc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { addDays, formatISO } from "date-fns";

export type DashboardStats = {
  stockValorizadoArsCents: number;
  expiring30: number;
  expiring60: number;
  expiring90: number;
  stockouts: number;
  avgCoverageDays: number | null;
  criticalAlerts: number;
  fefoComplianceSamplePct: number | null;
  inventoryAccuracyPct: number | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    stockValorizadoArsCents: 0,
    expiring30: 0,
    expiring60: 0,
    expiring90: 0,
    stockouts: 0,
    avgCoverageDays: null,
    criticalAlerts: 0,
    fefoComplianceSamplePct: null,
    inventoryAccuracyPct: null,
  };

  if (!db) return empty;

  const today = new Date();
  const d30 = formatISO(addDays(today, 30), { representation: "date" });
  const d60 = formatISO(addDays(today, 60), { representation: "date" });
  const d90 = formatISO(addDays(today, 90), { representation: "date" });
  const todayStr = formatISO(today, { representation: "date" });

  const [valorRow] = await db
    .select({
      total: sql<string>`coalesce(sum(${inventoryLots.qtyAvailable} * ${inventoryLots.unitCostArsCents}), 0)`,
    })
    .from(inventoryLots);

  const exp30 = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(inventoryLots)
    .where(
      and(
        lte(inventoryLots.expiryDate, d30),
        gte(inventoryLots.expiryDate, todayStr),
        sql`${inventoryLots.qtyAvailable} > 0`
      )
    );

  const exp60 = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(inventoryLots)
    .where(
      and(
        lte(inventoryLots.expiryDate, d60),
        gte(inventoryLots.expiryDate, todayStr),
        sql`${inventoryLots.qtyAvailable} > 0`
      )
    );

  const exp90 = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(inventoryLots)
    .where(
      and(
        lte(inventoryLots.expiryDate, d90),
        gte(inventoryLots.expiryDate, todayStr),
        sql`${inventoryLots.qtyAvailable} > 0`
      )
    );

  const sums = await db
    .select({
      pid: inventoryLots.commercialProductId,
      s: sql<number>`coalesce(sum(${inventoryLots.qtyAvailable}), 0)::int`,
    })
    .from(inventoryLots)
    .groupBy(inventoryLots.commercialProductId);

  const sumMap = new Map(sums.map((r) => [r.pid, r.s]));
  const allProducts = await db
    .select({ id: commercialProducts.id })
    .from(commercialProducts);
  const stockouts = allProducts.filter((p) => (sumMap.get(p.id) ?? 0) <= 0)
    .length;

  const criticalAlerts = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(alerts)
    .where(and(isNull(alerts.dismissedAt), eq(alerts.severity, "critical")));

  const byDay = await db
    .select({
      qty: sql<number>`coalesce(sum(${consumptionDailyAggregates.qtyOut}), 0)::int`,
      days: sql<number>`count(distinct ${consumptionDailyAggregates.day})::int`,
    })
    .from(consumptionDailyAggregates);

  const totalOut = byDay[0]?.qty ?? 0;
  const dayCount = Math.max(byDay[0]?.days ?? 1, 1);
  const avgDaily = totalOut / dayCount;

  const [stockTotalRow] = await db
    .select({
      u: sql<number>`coalesce(sum(${inventoryLots.qtyAvailable}), 0)::int`,
    })
    .from(inventoryLots);

  const totalUnits = stockTotalRow?.u ?? 0;
  const avgCoverage =
    avgDaily > 0 ? Math.round((totalUnits / avgDaily) * 10) / 10 : null;

  return {
    stockValorizadoArsCents: Number(valorRow?.total ?? 0),
    expiring30: exp30[0]?.c ?? 0,
    expiring60: exp60[0]?.c ?? 0,
    expiring90: exp90[0]?.c ?? 0,
    stockouts,
    avgCoverageDays: avgCoverage,
    criticalAlerts: criticalAlerts[0]?.c ?? 0,
    fefoComplianceSamplePct: null,
    inventoryAccuracyPct: null,
  };
}

export async function getTopConsumptionSeries() {
  if (!db) return [];
  const rows = await db
    .select({
      day: sql<string>`to_char(${consumptionDailyAggregates.day}, 'YYYY-MM-DD')`,
      qty: sql<number>`sum(${consumptionDailyAggregates.qtyOut})::int`,
    })
    .from(consumptionDailyAggregates)
    .groupBy(consumptionDailyAggregates.day)
    .orderBy(asc(consumptionDailyAggregates.day));
  return rows;
}
