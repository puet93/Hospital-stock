import type { FefoLotRow } from "./types";

function parseYmd(s: string): number {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getTime();
}

/**
 * Orden FEFO: primero vence antes; si empata, primero ingresó antes.
 * Solo lotes con cantidad disponible > 0.
 */
export function sortLotsByFefo(lots: FefoLotRow[]): FefoLotRow[] {
  return [...lots]
    .filter((l) => l.qtyAvailable > 0)
    .sort((a, b) => {
      const exp = parseYmd(a.expiryDate) - parseYmd(b.expiryDate);
      if (exp !== 0) return exp;
      return parseYmd(a.entryDate) - parseYmd(b.entryDate);
    });
}

/** Sugerencia de lotes para salida por cantidad `need` (FEFO). */
export function suggestFefoAllocation(
  lots: FefoLotRow[],
  need: number
): { lotId: string; take: number }[] {
  if (need <= 0) return [];
  const ordered = sortLotsByFefo(lots);
  const plan: { lotId: string; take: number }[] = [];
  let remaining = need;
  for (const lot of ordered) {
    if (remaining <= 0) break;
    const take = Math.min(lot.qtyAvailable, remaining);
    if (take > 0) {
      plan.push({ lotId: lot.id, take });
      remaining -= take;
    }
  }
  return plan;
}

/**
 * ¿El egreso desde `usedLotId` respeta FEFO? (el lote usado debe ser el primero sugerido con cantidad suficiente o parte del plan mínimo).
 */
export function isEgressFefoCompliant(
  lots: FefoLotRow[],
  usedLotId: string,
  qty: number
): boolean {
  if (qty <= 0) return true;
  const plan = suggestFefoAllocation(lots, qty);
  if (plan.length === 0) return false;
  const first = plan[0];
  if (first.lotId === usedLotId) return true;
  const used = lots.find((l) => l.id === usedLotId);
  if (!used || used.qtyAvailable < qty) return false;
  const idealFirst = sortLotsByFefo(lots)[0];
  if (!idealFirst) return false;
  if (idealFirst.id === usedLotId) return true;
  if (idealFirst.qtyAvailable >= qty) return false;
  const set = new Set(plan.map((p) => p.lotId));
  return set.has(usedLotId);
}
