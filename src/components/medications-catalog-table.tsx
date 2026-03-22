"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
} from "@tanstack/react-table";
import type { MedicationCatalogRow } from "@/lib/data/medications-catalog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const globalMedFilter: FilterFn<MedicationCatalogRow> = (row, _id, value) => {
  const q = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  const r = row.original;
  const hay = [
    r.drugName,
    r.presentationDisplay,
    r.brandName,
    r.drugCode,
    r.barcode,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  return hay.some((s) => s.includes(q));
};

export function MedicationsCatalogTable({ rows }: { rows: MedicationCatalogRow[] }) {
  const [q, setQ] = useState("");

  const columns = useMemo<ColumnDef<MedicationCatalogRow>[]>(
    () => [
      {
        accessorKey: "drugName",
        header: "Principio activo",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.drugName}</div>
            {row.original.drugCode ? (
              <div className="text-muted-foreground text-xs">
                {row.original.drugCode}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "presentationDisplay",
        header: "Presentación",
      },
      {
        accessorKey: "brandName",
        header: "Marca comercial",
      },
      {
        accessorKey: "stockAvailable",
        header: "Stock u.",
        cell: ({ getValue }) => {
          const n = Number(getValue());
          return (
            <Badge variant={n > 0 ? "default" : "secondary"}>{n}</Badge>
          );
        },
      },
      {
        accessorKey: "lotCount",
        header: "Lotes",
      },
      {
        accessorKey: "barcode",
        header: "EAN",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground font-mono text-xs">
            {getValue() ? String(getValue()) : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter: q },
    onGlobalFilterChange: setQ,
    globalFilterFn: globalMedFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const shown = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por droga, presentación, marca o código…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
        <p className="text-muted-foreground text-sm">
          {shown} de {rows.length} productos
        </p>
      </div>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-28 text-center"
                >
                  {rows.length === 0
                    ? "No hay productos en catálogo. Ejecutá el seed o cargá datos."
                    : "Ningún resultado para esta búsqueda."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
