import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getBrandEquivalences,
  getDrugEquivalences,
  getOperationalGroups,
} from "@/lib/data/equivalences-feed";
import { db } from "@/db";

export default async function EquivalenciasPage() {
  const [drugEq, brandEq, groups] = await Promise.all([
    getDrugEquivalences(),
    getBrandEquivalences(),
    getOperationalGroups(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Equivalencias
        </h1>
        <p className="text-muted-foreground text-sm">
          Vínculos administrables entre drogas, grupos operativos y marcas. El
          sistema no infiere equivalencias clínicas automáticamente.
        </p>
      </div>

      {!db ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin base de datos</CardTitle>
            <CardDescription>Conectá la DB para ver equivalencias.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-1">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Por principio activo</CardTitle>
              <CardDescription>
                Tabla <code className="text-xs">drug_equivalence_links</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Droga A</TableHead>
                    <TableHead>Droga B</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drugEq.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground h-24 text-center"
                      >
                        Sin vínculos entre drogas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    drugEq.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.drugA}</TableCell>
                        <TableCell className="font-medium">{r.drugB}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {r.notes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Marcas (misma presentación)</CardTitle>
              <CardDescription>
                <code className="text-xs">brand_equivalence_pairs</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Marca A</TableHead>
                    <TableHead>Marca B</TableHead>
                    <TableHead>Presentaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandEq.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground h-24 text-center"
                      >
                        Sin pares de marca.
                      </TableCell>
                    </TableRow>
                  ) : (
                    brandEq.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.brandA}</TableCell>
                        <TableCell className="font-medium">{r.brandB}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {r.presentationA} ↔ {r.presentationB}
                          {r.notes ? ` · ${r.notes}` : ""}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grupos operativos</CardTitle>
              <CardDescription>
                <code className="text-xs">operational_equivalence_groups</code>{" "}
                + ítems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groups.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Sin grupos configurados.
                </p>
              ) : (
                groups.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-semibold">{g.name}</h3>
                      <Badge variant="secondary">{g.productCount} ítems</Badge>
                    </div>
                    {g.description ? (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {g.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground">Marcas: </span>
                      {g.brands.join(", ") || "—"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
