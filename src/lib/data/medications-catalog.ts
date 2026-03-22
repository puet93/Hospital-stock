import { db } from "@/db";
import {
  commercialProducts,
  drugs,
  inventoryLots,
  presentations,
} from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export type MedicationCatalogRow = {
  drugId: string;
  drugName: string;
  drugCode: string | null;
  presentationDisplay: string;
  productId: string;
  brandName: string;
  barcode: string | null;
  stockAvailable: number;
  lotCount: number;
};

export async function getMedicationsCatalog(): Promise<MedicationCatalogRow[]> {
  if (!db) return [];

  const sums = await db
    .select({
      pid: inventoryLots.commercialProductId,
      total: sql<number>`coalesce(sum(${inventoryLots.qtyAvailable}), 0)::int`,
      lots: sql<number>`count(*)::int`,
    })
    .from(inventoryLots)
    .groupBy(inventoryLots.commercialProductId);

  const sumMap = new Map(
    sums.map((s) => [s.pid, { total: s.total, lots: s.lots }])
  );

  const base = await db
    .select({
      drugId: drugs.id,
      drugName: drugs.name,
      drugCode: drugs.code,
      presentationDisplay: presentations.displayName,
      productId: commercialProducts.id,
      brandName: commercialProducts.brandName,
      barcode: commercialProducts.barcode,
    })
    .from(commercialProducts)
    .innerJoin(
      presentations,
      eq(commercialProducts.presentationId, presentations.id)
    )
    .innerJoin(drugs, eq(presentations.drugId, drugs.id))
    .orderBy(
      asc(drugs.name),
      asc(presentations.displayName),
      asc(commercialProducts.brandName)
    );

  return base.map((r) => {
    const agg = sumMap.get(r.productId);
    return {
      ...r,
      stockAvailable: agg?.total ?? 0,
      lotCount: agg?.lots ?? 0,
    };
  });
}

export async function getMedicationsSummary() {
  if (!db) {
    return { drugCount: 0, productCount: 0, totalUnits: 0, presentationCount: 0 };
  }

  const [d] = await db.select({ c: sql<number>`count(*)::int` }).from(drugs);
  const [p] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(presentations);
  const [cp] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(commercialProducts);
  const [u] = await db
    .select({
      c: sql<number>`coalesce(sum(${inventoryLots.qtyAvailable}), 0)::int`,
    })
    .from(inventoryLots);

  return {
    drugCount: d?.c ?? 0,
    presentationCount: p?.c ?? 0,
    productCount: cp?.c ?? 0,
    totalUnits: u?.c ?? 0,
  };
}
