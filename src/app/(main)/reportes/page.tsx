import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportTopConsumedTable } from "@/components/report-top-consumed";
import { getTopConsumedProducts } from "@/lib/data/report-consumption";
import { db } from "@/db";

const REPORT_DAYS = 90;

export default async function ReportesPage() {
  const top = await getTopConsumedProducts(REPORT_DAYS, 30);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground text-sm">
          Consumo agregado por producto (últimos {REPORT_DAYS} días) desde{" "}
          <code className="text-xs">consumption_daily_aggregates</code>. Export
          CSV para auditoría.
        </p>
      </div>

      {!db ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin base de datos</CardTitle>
            <CardDescription>Conectá la DB para generar reportes.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ranking de consumo</CardTitle>
            <CardDescription>
              Suma de unidades egresadas en el período; desglose por marca y
              presentación comercial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportTopConsumedTable rows={top} days={REPORT_DAYS} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
