"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Point = { day: string; qty: number };

export function ConsumptionLineChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        Sin datos de consumo agregados todavía.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8 }}
            formatter={(v) => [`${v ?? 0} u.`, "Consumo"]}
            labelFormatter={(l) => `Día ${String(l)}`}
          />
          <Line
            type="monotone"
            dataKey="qty"
            stroke="var(--chart-2, #2563eb)"
            strokeWidth={2}
            dot={false}
            name="Consumo"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
