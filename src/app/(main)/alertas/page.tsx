import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertsTable } from "@/components/alerts-table";
import { getActiveAlerts } from "@/lib/data/alerts-feed";
import { ALERT_LABELS } from "@/lib/constants";
import { db } from "@/db";

export default async function AlertasPage() {
  const rows = await getActiveAlerts(150);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Alertas operativas
        </h1>
        <p className="text-muted-foreground text-sm">
          Alertas no descartadas. Generación automática vía cron{" "}
          <code className="text-xs">/api/cron/evaluate-alerts</code>. Tipos:{" "}
          {Object.values(ALERT_LABELS).slice(0, 4).join(", ")}…
        </p>
      </div>

      {!db ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin base de datos</CardTitle>
            <CardDescription>
              Configurá la URI de Postgres para ver alertas.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <AlertsTable rows={rows} />
      )}
    </div>
  );
}
