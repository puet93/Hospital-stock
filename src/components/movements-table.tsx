"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { MovementRow } from "@/lib/data/movements-feed";
import { MOVEMENT_LABELS } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeAR } from "@/lib/format";

function typeLabel(t: string) {
  return MOVEMENT_LABELS[t] ?? t;
}

export function MovementsTable({ rows }: { rows: MovementRow[] }) {
  const columns = useMemo<ColumnDef<MovementRow>[]>(
    () => [
      {
        accessorKey: "performedAt",
        header: "Fecha / hora",
        cell: ({ getValue }) =>
          formatDateTimeAR(new Date(getValue() as Date)),
      },
      {
        accessorKey: "movementType",
        header: "Tipo",
        cell: ({ getValue }) => (
          <Badge variant="outline">{typeLabel(String(getValue()))}</Badge>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Cantidad",
      },
      {
        id: "product",
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.brandName}</div>
            <div className="text-muted-foreground text-xs">
              {row.original.presentationName} · lote {row.original.lotNumber}
            </div>
          </div>
        ),
      },
      {
        id: "route",
        header: "Origen → destino",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.fromLocationName ?? "—"} →{" "}
            {row.original.toLocationName ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "reference",
        header: "Ref.",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">
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
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
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
                No hay movimientos registrados. Los ingresos/egresos aparecerán
                acá cuando cargues datos en{" "}
                <code className="text-xs">stock_movements</code>.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
