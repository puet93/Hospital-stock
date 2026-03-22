import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EquivalenciasPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Equivalencias</h1>
        <p className="text-muted-foreground text-sm">
          Tres niveles administrables: vínculos entre drogas, grupos operativos
          terapéuticos y pares de marcas con misma composición/concentración. El
          sistema no infiere equivalencias clínicas complejas.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por principio activo</CardTitle>
            <CardDescription>
              Tabla <code className="text-xs">drug_equivalence_links</code>
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operativa manual</CardTitle>
            <CardDescription>
              <code className="text-xs">operational_equivalence_groups</code>
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marcas</CardTitle>
            <CardDescription>
              <code className="text-xs">brand_equivalence_pairs</code>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
