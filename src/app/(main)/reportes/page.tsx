import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground text-sm">
          Consumo por droga, marca, presentación, sector, ubicación y período
          (día/semana/mes) con medias móviles 30/60/90 y proyección simple de
          cobertura en días (ver{" "}
          <code className="text-xs">lib/stock/consumption.ts</code>).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Exportación</CardTitle>
          <CardDescription>
            Añadir consultas parametrizadas y export CSV/PDF según rol Auditor.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
