import { db } from "@/db";
import {
  commercialProducts,
  consumptionDailyAggregates,
  drugs,
  inventoryLots,
  locations,
  presentations,
} from "@/db/schema";
import { asc, desc, eq, gte, sql } from "drizzle-orm";
import { formatISO, subDays } from "date-fns";

export type LocationStockPoint = { name: string; units: number };

export async function getStockByLocation(): Promise<LocationStockPoint[]> {
  if (!db) return [];

  const rows = await db
    .select({
      name: locations.name,
      units: sql<number>`coalesce(sum(${inventoryLots.qtyAvailable}), 0)::int`,
    })
    .from(inventoryLots)
    .innerJoin(locations, eq(inventoryLots.locationId, locations.id))
    .groupBy(locations.id, locations.name)
    .orderBy(asc(locations.name));

  return rows;
}

export type DrugStockPoint = { drugName: string; units: number };

export async function getStockByDrug(): Promise<DrugStockPoint[]> {
  if (!db) return [];

  const rows = await db
    .select({
      drugName: drugs.name,
      units: sql<number>`coalesce(sum(${inventoryLots.qtyAvailable}), 0)::int`,
    })
    .from(inventoryLots)
    .innerJoin(
      commercialProducts,
      eq(inventoryLots.commercialProductId, commercialProducts.id)
    )
    .innerJoin(
      presentations,
      eq(commercialProducts.presentationId, presentations.id)
    )
    .innerJoin(drugs, eq(presentations.drugId, drugs.id))
    .groupBy(drugs.id, drugs.name)
    .orderBy(
      desc(sql`coalesce(sum(${inventoryLots.qtyAvailable}), 0)`)
    );

  return rows;
}

/** Consumo total por día (últimos N días calendario). */
export async function getConsumptionTotalsByDay(days = 30) {
  if (!db) return [];

  const from = formatISO(subDays(new Date(), days), { representation: "date" });

  const rows = await db
    .select({
      day: sql<string>`to_char(${consumptionDailyAggregates.day}, 'YYYY-MM-DD')`,
      qty: sql<number>`sum(${consumptionDailyAggregates.qtyOut})::int`,
    })
    .from(consumptionDailyAggregates)
    .where(gte(consumptionDailyAggregates.day, from))
    .groupBy(consumptionDailyAggregates.day)
    .orderBy(asc(consumptionDailyAggregates.day));

  return rows.map((r) => ({ day: r.day, qty: r.qty }));
}
