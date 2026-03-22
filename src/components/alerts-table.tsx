"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { AlertRow } from "@/lib/data/alerts-feed";
import { ALERT_LABELS } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateAR } from "@/lib/format";

export function AlertsTable({ rows }: { rows: AlertRow[] }) {
  const columns = useMemo<ColumnDef<AlertRow>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Alta",
        cell: ({ getValue }) => {
          const v = getValue() as Date | null | undefined;
          if (!v) return "—";
          return formatDateAR(new Date(v).toISOString().slice(0, 10));
        },
      },
      {
        accessorKey: "severity",
        header: "Severidad",
        cell: ({ getValue }) => {
          const s = String(getValue());
          const v =
            s === "critical"
              ? "destructive"
              : s === "warning"
                ? "outline"
                : "secondary";
          return <Badge variant={v}>{s}</Badge>;
        },
      },
      {
        accessorKey: "alertType",
        header: "Tipo",
        cell: ({ getValue }) => (
          <span className="text-sm">
            {ALERT_LABELS[String(getValue())] ?? String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Título",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-muted-foreground line-clamp-2 text-xs">
              {row.original.message}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "brandName",
        header: "Producto",
        cell: ({ getValue }) => getValue() ?? "—",
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
                No hay alertas activas. El cron{" "}
                <code className="text-xs">/api/cron/evaluate-alerts</code> puede
                generarlas cuando corresponda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
