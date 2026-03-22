import { LotsDataTable } from "@/components/lots-data-table";
import { getLotsOverview } from "@/lib/data/lots-overview";

export default async function LotesPage() {
  const rows = await getLotsOverview();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Lotes y stock por ubicación
        </h1>
        <p className="text-muted-foreground text-sm">
          Orden sugerido de salida: FEFO (primer vencimiento, desempate por
          fecha de ingreso). La asignación operativa se implementa en servicios
          de egreso.
        </p>
      </div>
      <LotsDataTable rows={rows} />
    </div>
  );
}
