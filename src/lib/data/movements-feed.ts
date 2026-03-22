import { db } from "@/db";
import {
  commercialProducts,
  inventoryLots,
  locations,
  presentations,
  stockMovements,
} from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq } from "drizzle-orm";

export type MovementRow = {
  id: string;
  movementType: string;
  quantity: number;
  performedAt: Date;
  reference: string | null;
  lotNumber: string;
  brandName: string;
  presentationName: string;
  fromLocationName: string | null;
  toLocationName: string | null;
};

export async function getRecentMovements(limit = 150): Promise<MovementRow[]> {
  if (!db) return [];

  const fromLoc = alias(locations, "from_loc");
  const toLoc = alias(locations, "to_loc");

  const rows = await db
    .select({
      id: stockMovements.id,
      movementType: stockMovements.movementType,
      quantity: stockMovements.quantity,
      performedAt: stockMovements.performedAt,
      reference: stockMovements.reference,
      lotNumber: inventoryLots.lotNumber,
      brandName: commercialProducts.brandName,
      presentationName: presentations.displayName,
      fromLocationName: fromLoc.name,
      toLocationName: toLoc.name,
    })
    .from(stockMovements)
    .innerJoin(
      inventoryLots,
      eq(stockMovements.inventoryLotId, inventoryLots.id)
    )
    .innerJoin(
      commercialProducts,
      eq(inventoryLots.commercialProductId, commercialProducts.id)
    )
    .innerJoin(
      presentations,
      eq(commercialProducts.presentationId, presentations.id)
    )
    .leftJoin(fromLoc, eq(stockMovements.fromLocationId, fromLoc.id))
    .leftJoin(toLoc, eq(stockMovements.toLocationId, toLoc.id))
    .orderBy(desc(stockMovements.performedAt))
    .limit(limit);

  return rows;
}
