import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ALERT_LABELS } from "@/lib/constants";

export default function AlertasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Alertas operativas
        </h1>
        <p className="text-muted-foreground text-sm">
          Generación automática vía cron (
          <code className="text-xs">/api/cron/evaluate-alerts</code>) con{" "}
          <code className="text-xs">CRON_SECRET</code>. Tipos:{" "}
          {Object.values(ALERT_LABELS).join(", ")}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado y descarte</CardTitle>
          <CardDescription>
            Conectar tabla <code className="text-xs">alerts</code> con filtros
            por severidad y producto. Se recomienda deduplicar alertas por
            (tipo, lote, ventana temporal) antes de insertar en producción.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
