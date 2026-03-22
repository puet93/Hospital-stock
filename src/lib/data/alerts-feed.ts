import { db } from "@/db";
import { alerts, commercialProducts } from "@/db/schema";
import { desc, eq, isNull } from "drizzle-orm";

export type AlertRow = {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  createdAt: Date | null;
  brandName: string | null;
};

export async function getActiveAlerts(limit = 100): Promise<AlertRow[]> {
  if (!db) return [];

  const rows = await db
    .select({
      id: alerts.id,
      alertType: alerts.alertType,
      severity: alerts.severity,
      title: alerts.title,
      message: alerts.message,
      createdAt: alerts.createdAt,
      brandName: commercialProducts.brandName,
    })
    .from(alerts)
    .leftJoin(
      commercialProducts,
      eq(alerts.commercialProductId, commercialProducts.id)
    )
    .where(isNull(alerts.dismissedAt))
    .orderBy(desc(alerts.createdAt))
    .limit(limit);

  return rows;
}
