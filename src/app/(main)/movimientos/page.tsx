import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MovementsTable } from "@/components/movements-table";
import { getRecentMovements } from "@/lib/data/movements-feed";
import { MOVEMENT_LABELS } from "@/lib/constants";
import { db } from "@/db";

export default async function MovimientosPage() {
  const rows = await getRecentMovements(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Trazabilidad interna
        </h1>
        <p className="text-muted-foreground text-sm">
          Últimos movimientos sobre lotes. Tipos modelados:{" "}
          {Object.values(MOVEMENT_LABELS).slice(0, 5).join(", ")}…
        </p>
      </div>

      {!db ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin base de datos</CardTitle>
            <CardDescription>
              Conectá <code className="text-xs">DATABASE_URL</code> para listar
              movimientos.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <MovementsTable rows={rows} />
      )}
    </div>
  );
}
