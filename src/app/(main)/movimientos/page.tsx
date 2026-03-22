import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MOVEMENT_LABELS } from "@/lib/constants";

export default function MovimientosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Trazabilidad interna
        </h1>
        <p className="text-muted-foreground text-sm">
          Tipos de movimiento modelados en base de datos:{" "}
          {Object.entries(MOVEMENT_LABELS)
            .map(([, v]) => v)
            .join(", ")}
          .
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registro de movimientos</CardTitle>
          <CardDescription>
            Tabla <code className="text-xs">stock_movements</code> con
            referencia a lote, ubicaciones origen/destino, sector para consumo y
            metadatos JSON. Implementar formularios de ingreso/egreso/transferencia
            con validación Zod y transacciones Drizzle.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
