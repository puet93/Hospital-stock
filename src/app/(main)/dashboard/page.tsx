import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConsumptionLineChart } from "@/components/dashboard-chart";
import {
  getDashboardStats,
  getTopConsumptionSeries,
  type DashboardStats,
} from "@/lib/data/dashboard-stats";
import { formatArsFromCents } from "@/lib/format";
import { db } from "@/db";

const emptyStats: DashboardStats = {
  stockValorizadoArsCents: 0,
  expiring30: 0,
  expiring60: 0,
  expiring90: 0,
  stockouts: 0,
  avgCoverageDays: null,
  criticalAlerts: 0,
  fefoComplianceSamplePct: null,
  inventoryAccuracyPct: null,
};

export default async function DashboardPage() {
  let stats = emptyStats;
  let series: Awaited<ReturnType<typeof getTopConsumptionSeries>> = [];
  let dataError: string | null = null;

  if (db) {
    try {
      stats = await getDashboardStats();
      series = await getTopConsumptionSeries();
    } catch {
      dataError =
        "Error al consultar la base de datos. Revisá la URI (pooler :6543, usuario postgres.REF) y que el esquema esté aplicado.";
    }
  }

  const chartData = series.map((r) => ({ day: r.day, qty: r.qty }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel general</h1>
        <p className="text-muted-foreground text-sm">
          KPIs de inventario, vencimientos y consumo. Sin funciones de
          prescripción clínica.
        </p>
      </div>

      {!db ? (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle>Base de datos no conectada</CardTitle>
            <CardDescription>
              Configurá <code className="text-xs">DATABASE_URL</code> y ejecutá
              migraciones Drizzle para ver datos reales.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {dataError ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">No se cargaron los KPIs</CardTitle>
            <CardDescription className="text-destructive/90">
              {dataError}{" "}
              <Link
                href="/api/health/db"
                className="mt-2 block font-mono text-xs text-foreground underline"
              >
                /api/health/db
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stock valorizado</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatArsFromCents(stats.stockValorizadoArsCents)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Suma de disponible × costo unitario (ARS).
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximos a vencer</CardDescription>
            <CardTitle className="text-lg">
              30 / 60 / 90 días
            </CardTitle>
          </CardHeader>
          <CardContent className="tabular-nums text-sm">
            <p>
              {stats.expiring30} · {stats.expiring60} · {stats.expiring90}{" "}
              lotes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quiebres (sin stock)</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.stockouts}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Productos comerciales sin unidades disponibles.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cobertura media estimada</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stats.avgCoverageDays != null
                ? `${stats.avgCoverageDays} d`
                : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Stock total / consumo medio diario (agregados demo).
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia de consumo</CardTitle>
            <CardDescription>
              Serie diaria desde{" "}
              <code className="text-xs">consumption_daily_aggregates</code>{" "}
              (por medicamento, sector y ubicación en datos crudos).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsumptionLineChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas críticas activas</CardTitle>
            <CardDescription>No descartadas</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {stats.criticalAlerts}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>FEFO e inventario</CardTitle>
            <CardDescription>Indicadores en evolución</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>
              Cumplimiento FEFO:{" "}
              <span className="text-foreground font-medium">
                {stats.fefoComplianceSamplePct != null
                  ? `${stats.fefoComplianceSamplePct}%`
                  : "pendiente de auditoría de egresos"}
              </span>
            </p>
            <p>
              Exactitud de inventario:{" "}
              <span className="text-foreground font-medium">
                {stats.inventoryAccuracyPct != null
                  ? `${stats.inventoryAccuracyPct}%`
                  : "registrar conteos cíclicos"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
