import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MedicamentosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Medicamentos</h1>
        <p className="text-muted-foreground text-sm">
          Jerarquía: droga (principio activo) → presentación → producto
          comercial → lote. Este módulo enlaza catálogo y equivalencias
          administrables.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Próximos pasos de desarrollo</CardTitle>
          <CardDescription>
            CRUD con permisos por rol (Admin, Farmacia jefe, Farmacéutico,
            Depósito, Auditor, Solo lectura), búsqueda y filtros por droga /
            marca / presentación.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
