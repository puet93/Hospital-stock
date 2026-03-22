"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { TopConsumedProductRow } from "@/lib/data/report-consumption";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ReportTopConsumedTable({
  rows,
  days,
}: {
  rows: TopConsumedProductRow[];
  days: number;
}) {
  const columns = useMemo<ColumnDef<TopConsumedProductRow>[]>(
    () => [
      { accessorKey: "brandName", header: "Marca" },
      { accessorKey: "presentationDisplay", header: "Presentación" },
      {
        accessorKey: "qtyOut",
        header: "Unidades egresadas",
        cell: ({ getValue }) => (
          <span className="tabular-nums font-medium">{Number(getValue())}</span>
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

  function downloadCsv() {
    const header = ["Marca", "Presentación", "Unidades egresadas"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          csvCell(r.brandName),
          csvCell(r.presentationDisplay),
          String(r.qtyOut),
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `consumo-top-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rows.length === 0}
          onClick={downloadCsv}
        >
          Descargar CSV
        </Button>
      </div>
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
                  Sin consumo agregado en este período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function csvCell(s: string) {
  const t = s.replace(/"/g, '""');
  return `"${t}"`;
}
