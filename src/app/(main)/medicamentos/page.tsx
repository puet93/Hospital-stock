import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MedicationsCatalogTable } from "@/components/medications-catalog-table";
import {
  getMedicationsCatalog,
  getMedicationsSummary,
} from "@/lib/data/medications-catalog";
import { db } from "@/db";

export default async function MedicamentosPage() {
  const [rows, summary] = await Promise.all([
    getMedicationsCatalog(),
    getMedicationsSummary(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Medicamentos</h1>
        <p className="text-muted-foreground text-sm">
          Catálogo jerárquico: principio activo → presentación → marca. Stock y
          lotes consolidados en tiempo real desde la base.
        </p>
      </div>

      {!db ? (
        <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle>Sin conexión a la base</CardTitle>
            <CardDescription>
              Configurá <code className="text-xs">DATABASE_URL</code> para ver
              el catálogo.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription>Principios activos</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {summary.drugCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              Drogas distintas en catálogo.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Presentaciones</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {summary.presentationCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              Forma + concentración.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Marcas comerciales</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {summary.productCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              Productos comerciales únicos.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unidades disponibles</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {summary.totalUnits}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              Suma de <code className="text-xs">qty_available</code> en todos
              los lotes.
            </CardContent>
          </Card>
        </div>
      )}

      <MedicationsCatalogTable rows={rows} />
    </div>
  );
}
