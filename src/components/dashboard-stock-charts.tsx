"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Loc = { name: string; units: number };
type Drug = { drugName: string; units: number };

export function StockByLocationChart({ data }: { data: Loc[] }) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Sin unidades en ubicaciones.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 16, top: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={132}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8 }}
            formatter={(v) => [`${v ?? 0} u.`, "Disponible"]}
          />
          <Bar
            dataKey="units"
            fill="var(--chart-1, #22c55e)"
            radius={[0, 4, 4, 0]}
            name="Unidades"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StockByDrugChart({ data }: { data: Drug[] }) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Sin stock agrupado por principio.
      </p>
    );
  }

  const chart = data.map((d) => ({ name: d.drugName, units: d.units }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chart} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-28}
            textAnchor="end"
            height={72}
          />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8 }}
            formatter={(v) => [`${v ?? 0} u.`, "Disponible"]}
          />
          <Bar
            dataKey="units"
            fill="var(--chart-3, #8b5cf6)"
            radius={[4, 4, 0, 0]}
            name="Unidades"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
