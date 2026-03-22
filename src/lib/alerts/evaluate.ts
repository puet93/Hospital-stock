import { differenceInCalendarDays, parseISO } from "date-fns";

export type EvalLot = {
  id: string;
  commercialProductId: string;
  locationId: string;
  expiryDate: string;
  entryDate: string;
  qtyAvailable: number;
  qtyReserved: number;
  qtyBlocked: number;
  unitCostArsCents: number;
};

export type EvalThreshold = {
  commercialProductId: string;
  locationId: string | null;
  minQty: number;
  maxQty: number | null;
  expiryWarningDays: number;
  immobileDaysWarning: number;
};

export type EvalAlertDraft = {
  alertType:
    | "stock_bajo"
    | "quiebre_stock"
    | "vencimiento_proximo"
    | "lote_vencido"
    | "stock_inmovilizado"
    | "sobrestock";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  inventoryLotId?: string;
  commercialProductId: string;
  metadata?: Record<string, unknown>;
};

function totalAvailableByProduct(
  lots: EvalLot[]
): Map<string, { total: number; byLocation: Map<string, number> }> {
  const map = new Map<
    string,
    { total: number; byLocation: Map<string, number> }
  >();
  for (const l of lots) {
    const cur = map.get(l.commercialProductId) ?? {
      total: 0,
      byLocation: new Map<string, number>(),
    };
    cur.total += l.qtyAvailable;
    cur.byLocation.set(
      l.locationId,
      (cur.byLocation.get(l.locationId) ?? 0) + l.qtyAvailable
    );
    map.set(l.commercialProductId, cur);
  }
  return map;
}

/** Genera borradores de alertas operativas (idempotencia en capa de persistencia recomendada). */
export function evaluateOperationalAlerts(
  lots: EvalLot[],
  thresholds: EvalThreshold[],
  today = new Date()
): EvalAlertDraft[] {
  const drafts: EvalAlertDraft[] = [];
  const byProduct = totalAvailableByProduct(lots);

  for (const th of thresholds) {
    const agg = byProduct.get(th.commercialProductId);
    const qtyAtLoc =
      th.locationId && agg
        ? (agg.byLocation.get(th.locationId) ?? 0)
        : (agg?.total ?? 0);

    if (qtyAtLoc <= 0) {
      drafts.push({
        alertType: "quiebre_stock",
        severity: "critical",
        title: "Quiebre de stock",
        message: `Sin unidades disponibles para el producto (umbral / ubicación).`,
        commercialProductId: th.commercialProductId,
        metadata: { locationId: th.locationId, minQty: th.minQty },
      });
    } else if (qtyAtLoc > 0 && qtyAtLoc <= th.minQty) {
      drafts.push({
        alertType: "stock_bajo",
        severity: "warning",
        title: "Stock bajo",
        message: `Stock ${qtyAtLoc} en o por debajo del mínimo ${th.minQty}.`,
        commercialProductId: th.commercialProductId,
        metadata: { locationId: th.locationId },
      });
    }

    if (th.maxQty != null && qtyAtLoc > th.maxQty) {
      drafts.push({
        alertType: "sobrestock",
        severity: "info",
        title: "Sobrestock",
        message: `Stock ${qtyAtLoc} supera el máximo configurado ${th.maxQty}.`,
        commercialProductId: th.commercialProductId,
        metadata: { locationId: th.locationId },
      });
    }
  }

  for (const lot of lots) {
    const exp = parseISO(lot.expiryDate);
    const daysToExpiry = differenceInCalendarDays(exp, today);

    if (daysToExpiry < 0) {
      drafts.push({
        alertType: "lote_vencido",
        severity: "critical",
        title: "Lote vencido",
        message: `Lote vencido con ${lot.qtyAvailable} unidades disponibles.`,
        inventoryLotId: lot.id,
        commercialProductId: lot.commercialProductId,
        metadata: { lotNumber: lot.id },
      });
    } else {
      const th = thresholds.find(
        (t) =>
          t.commercialProductId === lot.commercialProductId &&
          (t.locationId === null || t.locationId === lot.locationId)
      );
      const warnDays = th?.expiryWarningDays ?? 90;
      if (daysToExpiry <= warnDays && lot.qtyAvailable > 0) {
        drafts.push({
          alertType: "vencimiento_proximo",
          severity: daysToExpiry <= 30 ? "critical" : "warning",
          title: "Vencimiento próximo",
          message: `Vence en ${daysToExpiry} días (${lot.qtyAvailable} u.).`,
          inventoryLotId: lot.id,
          commercialProductId: lot.commercialProductId,
          metadata: { daysToExpiry },
        });
      }
    }

    const immobileDays = differenceInCalendarDays(
      today,
      parseISO(lot.entryDate)
    );
    const th = thresholds.find(
      (t) =>
        t.commercialProductId === lot.commercialProductId &&
        (t.locationId === null || t.locationId === lot.locationId)
    );
    const immobileWarn = th?.immobileDaysWarning ?? 180;
    if (
      lot.qtyAvailable > 0 &&
      immobileDays >= immobileWarn &&
      lot.qtyBlocked + lot.qtyReserved === 0
    ) {
      drafts.push({
        alertType: "stock_inmovilizado",
        severity: "info",
        title: "Stock posiblemente inmovilizado",
        message: `Mismo lote sin movimiento aparente desde hace ${immobileDays} días.`,
        inventoryLotId: lot.id,
        commercialProductId: lot.commercialProductId,
        metadata: { immobileDays },
      });
    }
  }

  return drafts;
}
