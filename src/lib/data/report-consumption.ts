import { db } from "@/db";
import {
  commercialProducts,
  consumptionDailyAggregates,
  presentations,
} from "@/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";
import { formatISO, subDays } from "date-fns";

export type TopConsumedProductRow = {
  productId: string;
  brandName: string;
  presentationDisplay: string;
  qtyOut: number;
};

export async function getTopConsumedProducts(
  days = 90,
  limit = 25
): Promise<TopConsumedProductRow[]> {
  if (!db) return [];

  const from = formatISO(subDays(new Date(), days), { representation: "date" });

  return db
    .select({
      productId: consumptionDailyAggregates.commercialProductId,
      qtyOut: sql<number>`sum(${consumptionDailyAggregates.qtyOut})::int`,
      brandName: sql<string>`max(${commercialProducts.brandName})`,
      presentationDisplay: sql<string>`max(${presentations.displayName})`,
    })
    .from(consumptionDailyAggregates)
    .innerJoin(
      commercialProducts,
      eq(
        consumptionDailyAggregates.commercialProductId,
        commercialProducts.id
      )
    )
    .innerJoin(
      presentations,
      eq(commercialProducts.presentationId, presentations.id)
    )
    .where(gte(consumptionDailyAggregates.day, from))
    .groupBy(consumptionDailyAggregates.commercialProductId)
    .orderBy(desc(sql`sum(${consumptionDailyAggregates.qtyOut})`))
    .limit(limit);
}
