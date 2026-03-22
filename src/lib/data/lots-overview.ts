import { db } from "@/db";
import {
  commercialProducts,
  inventoryLots,
  locations,
  presentations,
} from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export type LotOverviewRow = {
  lotId: string;
  lotNumber: string;
  brandName: string;
  presentationName: string;
  locationName: string;
  expiryDate: string;
  entryDate: string;
  qtyAvailable: number;
  qtyReserved: number;
  qtyBlocked: number;
  unitCostArsCents: number;
};

export async function getLotsOverview(): Promise<LotOverviewRow[]> {
  if (!db) return [];

  const rows = await db
    .select({
      lotId: inventoryLots.id,
      lotNumber: inventoryLots.lotNumber,
      brandName: commercialProducts.brandName,
      presentationName: presentations.displayName,
      locationName: locations.name,
      expiryDate: sql<string>`to_char(${inventoryLots.expiryDate}, 'YYYY-MM-DD')`,
      entryDate: sql<string>`to_char(${inventoryLots.entryDate}, 'YYYY-MM-DD')`,
      qtyAvailable: inventoryLots.qtyAvailable,
      qtyReserved: inventoryLots.qtyReserved,
      qtyBlocked: inventoryLots.qtyBlocked,
      unitCostArsCents: inventoryLots.unitCostArsCents,
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
    .innerJoin(locations, eq(inventoryLots.locationId, locations.id))
    .orderBy(asc(inventoryLots.expiryDate));

  return rows;
}
