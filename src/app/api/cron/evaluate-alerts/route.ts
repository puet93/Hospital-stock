import { NextResponse } from "next/server";
import { db } from "@/db";
import { alerts, inventoryLots, stockThresholds } from "@/db/schema";
import { evaluateOperationalAlerts } from "@/lib/alerts/evaluate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Vercel Cron: configurar en vercel.json y definir CRON_SECRET en el proyecto.
 */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json(
      { error: "Base de datos no configurada" },
      { status: 503 }
    );
  }

  const lots = await db.select().from(inventoryLots);
  const thresholds = await db.select().from(stockThresholds);

  const evalLots = lots.map((l) => ({
    id: l.id,
    commercialProductId: l.commercialProductId,
    locationId: l.locationId,
    expiryDate: l.expiryDate,
    entryDate: l.entryDate,
    qtyAvailable: l.qtyAvailable,
    qtyReserved: l.qtyReserved,
    qtyBlocked: l.qtyBlocked,
    unitCostArsCents: l.unitCostArsCents,
  }));

  const evalTh = thresholds.map((t) => ({
    commercialProductId: t.commercialProductId,
    locationId: t.locationId,
    minQty: t.minQty,
    maxQty: t.maxQty,
    expiryWarningDays: t.expiryWarningDays,
    immobileDaysWarning: t.immobileDaysWarning,
  }));

  const drafts = evaluateOperationalAlerts(evalLots, evalTh, new Date());

  if (drafts.length === 0) {
    return NextResponse.json({ inserted: 0, message: "Sin alertas nuevas" });
  }

  await db.insert(alerts).values(
    drafts.map((d) => ({
      alertType: d.alertType,
      severity: d.severity,
      title: d.title,
      message: d.message,
      metadata: d.metadata ?? null,
      inventoryLotId: d.inventoryLotId ?? null,
      commercialProductId: d.commercialProductId,
    }))
  );

  return NextResponse.json({ inserted: drafts.length });
}
