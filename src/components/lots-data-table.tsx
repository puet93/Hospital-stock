"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { LotOverviewRow } from "@/lib/data/lots-overview";
import { formatArsFromCents, formatDateAR } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function LotsDataTable({ rows }: { rows: LotOverviewRow[] }) {
  const columns = useMemo<ColumnDef<LotOverviewRow>[]>(
    () => [
      {
        accessorKey: "lotNumber",
        header: "Lote",
      },
      {
        accessorKey: "brandName",
        header: "Marca",
      },
      {
        accessorKey: "presentationName",
        header: "Presentación",
      },
      {
        accessorKey: "locationName",
        header: "Ubicación",
      },
      {
        accessorKey: "expiryDate",
        header: "Vencimiento",
        cell: ({ getValue }) => formatDateAR(String(getValue())),
      },
      {
        accessorKey: "qtyAvailable",
        header: "Disponible",
      },
      {
        accessorKey: "qtyReserved",
        header: "Reservado",
      },
      {
        accessorKey: "qtyBlocked",
        header: "Bloqueado",
        cell: ({ row }) => {
          const b = row.original.qtyBlocked;
          return b > 0 ? (
            <Badge variant="secondary">{b}</Badge>
          ) : (
            <span className="text-muted-foreground">0</span>
          );
        },
      },
      {
        accessorKey: "unitCostArsCents",
        header: "Costo u.",
        cell: ({ getValue }) =>
          formatArsFromCents(Number(getValue())),
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
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
                className="text-muted-foreground h-24 text-center"
              >
                No hay lotes cargados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
