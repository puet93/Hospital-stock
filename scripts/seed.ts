import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Definí DATABASE_URL en .env");
  process.exit(1);
}

const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client, { schema });

async function main() {
  const dup = await db
    .select({ id: schema.commercialProducts.id })
    .from(schema.commercialProducts)
    .where(eq(schema.commercialProducts.brandName, "Tafirol"))
    .limit(1);
  if (dup.length > 0) {
    console.log("Seed ya aplicado (producto Tafirol existe). Omitiendo.");
    return;
  }

  const [dep] = await db
    .insert(schema.locations)
    .values({ code: "DEP-CENT", name: "Depósito central", isStorage: true })
    .onConflictDoNothing({ target: schema.locations.code })
    .returning();

  let depId = dep?.id;
  if (!depId) {
    const [row] = await db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.code, "DEP-CENT"));
    depId = row!.id;
  }

  const [farm] = await db
    .insert(schema.locations)
    .values({ code: "FARM-QUI", name: "Farmacia turno noche", isStorage: true })
    .onConflictDoNothing({ target: schema.locations.code })
    .returning();

  let farmId = farm?.id;
  if (!farmId) {
    const [row] = await db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.code, "FARM-QUI"));
    farmId = row!.id;
  }

  const [uci] = await db
    .insert(schema.sectors)
    .values({ code: "UCI", name: "Unidad de cuidados intensivos" })
    .onConflictDoNothing({ target: schema.sectors.code })
    .returning();

  let uciId = uci?.id;
  if (!uciId) {
    const [row] = await db
      .select()
      .from(schema.sectors)
      .where(eq(schema.sectors.code, "UCI"));
    uciId = row!.id;
  }

  const [sup] = await db
    .insert(schema.suppliers)
    .values({ name: "Distribuidor demo SA", contact: "compras@demo.ar" })
    .returning();

  const [drugPara] = await db
    .insert(schema.drugs)
    .values({
      code: "PARA-PA",
      name: "Paracetamol",
      description: "Analgésico / antitérmico",
    })
    .onConflictDoNothing({ target: schema.drugs.code })
    .returning();

  let drugParaId = drugPara?.id;
  if (!drugParaId) {
    const [row] = await db
      .select()
      .from(schema.drugs)
      .where(eq(schema.drugs.code, "PARA-PA"));
    drugParaId = row!.id;
  }

  const [pres] = await db
    .insert(schema.presentations)
    .values({
      drugId: drugParaId,
      dosageForm: "Comprimido",
      strength: "500",
      unit: "mg",
      displayName: "Paracetamol 500 mg comp.",
    })
    .returning();

  const [prodTafi] = await db
    .insert(schema.commercialProducts)
    .values({
      presentationId: pres!.id,
      brandName: "Tafirol",
      barcode: "7790012345678",
    })
    .returning();

  const [prodGen] = await db
    .insert(schema.commercialProducts)
    .values({
      presentationId: pres!.id,
      brandName: "Genérico hospital",
      barcode: "7790099999999",
    })
    .returning();

  await db.insert(schema.brandEquivalencePairs).values({
    commercialProductIdA: prodTafi!.id,
    commercialProductIdB: prodGen!.id,
    notes: "Misma presentación 500 mg — sustitución operativa manual.",
  });

  const [opGroup] = await db
    .insert(schema.operationalEquivalenceGroups)
    .values({
      name: "Grupo paracetamol oral 500 mg",
      description: "Equivalencia terapéutico-operativa configurable",
    })
    .returning();

  await db.insert(schema.operationalEquivalenceGroupItems).values([
    { groupId: opGroup!.id, commercialProductId: prodTafi!.id },
    { groupId: opGroup!.id, commercialProductId: prodGen!.id },
  ]);

  await db.insert(schema.stockThresholds).values([
    {
      commercialProductId: prodTafi!.id,
      locationId: null,
      minQty: 50,
      maxQty: 5000,
      expiryWarningDays: 90,
      immobileDaysWarning: 120,
    },
    {
      commercialProductId: prodGen!.id,
      locationId: depId,
      minQty: 20,
      maxQty: 2000,
      expiryWarningDays: 60,
      immobileDaysWarning: 180,
    },
  ]);

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");

  const insertedLots = await db
    .insert(schema.inventoryLots)
    .values([
      {
        commercialProductId: prodTafi!.id,
        lotNumber: `TA-${y}-001`,
        expiryDate: `${y + 1}-06-30`,
        entryDate: `${y}-${m}-${d}`,
        supplierId: sup!.id,
        unitCostArsCents: 125_50,
        locationId: depId,
        qtyAvailable: 200,
        qtyReserved: 10,
        qtyBlocked: 0,
      },
      {
        commercialProductId: prodTafi!.id,
        lotNumber: `TA-${y}-002`,
        expiryDate: `${y + 1}-01-15`,
        entryDate: `${y}-01-10`,
        supplierId: sup!.id,
        unitCostArsCents: 118_00,
        locationId: depId,
        qtyAvailable: 40,
        qtyReserved: 0,
        qtyBlocked: 5,
      },
      {
        commercialProductId: prodGen!.id,
        lotNumber: `GE-${y}-010`,
        expiryDate: `${y}-08-01`,
        entryDate: `${y - 1}-06-01`,
        supplierId: sup!.id,
        unitCostArsCents: 45_00,
        locationId: farmId,
        qtyAvailable: 15,
        qtyReserved: 0,
        qtyBlocked: 0,
      },
    ])
    .returning({ id: schema.inventoryLots.id });

  const [lotA, lotB] = insertedLots;

  await db.insert(schema.stockMovements).values([
    {
      movementType: "egreso",
      inventoryLotId: lotA!.id,
      quantity: 12,
      fromLocationId: depId,
      toLocationId: farmId,
      sectorId: uciId,
      reference: "DEMO-EG-001",
      notes: "Egreso demo UCI",
    },
    {
      movementType: "transferencia",
      inventoryLotId: lotA!.id,
      quantity: 24,
      fromLocationId: depId,
      toLocationId: farmId,
      reference: "DEMO-TR-001",
    },
    {
      movementType: "ingreso",
      inventoryLotId: lotB!.id,
      quantity: 40,
      fromLocationId: null,
      toLocationId: depId,
      reference: "DEMO-IN-001",
    },
  ]);

  await db.insert(schema.consumptionDailyAggregates).values([
    {
      day: `${y}-${m}-01`,
      commercialProductId: prodTafi!.id,
      sectorId: uciId,
      locationId: depId,
      qtyOut: 12,
    },
    {
      day: `${y}-${m}-02`,
      commercialProductId: prodTafi!.id,
      sectorId: uciId,
      locationId: depId,
      qtyOut: 18,
    },
    {
      day: `${y}-${m}-03`,
      commercialProductId: prodTafi!.id,
      sectorId: uciId,
      locationId: depId,
      qtyOut: 9,
    },
  ]);

  console.log("Seed completado (datos demo).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await client.end({ timeout: 5 });
  });
