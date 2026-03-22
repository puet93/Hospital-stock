import { db } from "@/db";
import {
  brandEquivalencePairs,
  commercialProducts,
  drugEquivalenceLinks,
  drugs,
  operationalEquivalenceGroupItems,
  operationalEquivalenceGroups,
  presentations,
} from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { asc, eq } from "drizzle-orm";

export type DrugEquivalenceRow = {
  id: string;
  drugA: string;
  drugB: string;
  notes: string | null;
};

export type BrandEquivalenceRow = {
  id: string;
  brandA: string;
  brandB: string;
  presentationA: string;
  presentationB: string;
  notes: string | null;
};

export type OperationalGroupRow = {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  brands: string[];
};

export async function getDrugEquivalences(): Promise<DrugEquivalenceRow[]> {
  if (!db) return [];
  const da = alias(drugs, "da");
  const db_ = alias(drugs, "db");

  return db
    .select({
      id: drugEquivalenceLinks.id,
      drugA: da.name,
      drugB: db_.name,
      notes: drugEquivalenceLinks.notes,
    })
    .from(drugEquivalenceLinks)
    .innerJoin(da, eq(drugEquivalenceLinks.drugIdA, da.id))
    .innerJoin(db_, eq(drugEquivalenceLinks.drugIdB, db_.id))
    .orderBy(asc(da.name), asc(db_.name));
}

export async function getBrandEquivalences(): Promise<BrandEquivalenceRow[]> {
  if (!db) return [];
  const cpa = alias(commercialProducts, "cpa");
  const cpb = alias(commercialProducts, "cpb");
  const prA = alias(presentations, "pr_a");
  const prB = alias(presentations, "pr_b");

  return db
    .select({
      id: brandEquivalencePairs.id,
      brandA: cpa.brandName,
      brandB: cpb.brandName,
      presentationA: prA.displayName,
      presentationB: prB.displayName,
      notes: brandEquivalencePairs.notes,
    })
    .from(brandEquivalencePairs)
    .innerJoin(cpa, eq(brandEquivalencePairs.commercialProductIdA, cpa.id))
    .innerJoin(cpb, eq(brandEquivalencePairs.commercialProductIdB, cpb.id))
    .innerJoin(prA, eq(cpa.presentationId, prA.id))
    .innerJoin(prB, eq(cpb.presentationId, prB.id))
    .orderBy(asc(cpa.brandName));
}

export async function getOperationalGroups(): Promise<OperationalGroupRow[]> {
  if (!db) return [];

  const groups = await db
    .select({
      id: operationalEquivalenceGroups.id,
      name: operationalEquivalenceGroups.name,
      description: operationalEquivalenceGroups.description,
    })
    .from(operationalEquivalenceGroups)
    .orderBy(asc(operationalEquivalenceGroups.name));

  const out: OperationalGroupRow[] = [];

  for (const g of groups) {
    const items = await db
      .select({
        brand: commercialProducts.brandName,
      })
      .from(operationalEquivalenceGroupItems)
      .innerJoin(
        commercialProducts,
        eq(
          operationalEquivalenceGroupItems.commercialProductId,
          commercialProducts.id
        )
      )
      .where(eq(operationalEquivalenceGroupItems.groupId, g.id))
      .orderBy(asc(commercialProducts.brandName));

    out.push({
      id: g.id,
      name: g.name,
      description: g.description,
      productCount: items.length,
      brands: items.map((i) => i.brand),
    });
  }

  return out;
}
