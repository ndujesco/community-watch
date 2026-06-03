import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtTime } from "@/lib/format";
import type { Reading } from "@/lib/types";
import { ChartShell, axisTick, tooltipStyle } from "./chart-common";

export function RainfallChart({ data, title = "Rainfall Rate" }: { data: Reading[]; title?: string }) {
  const chartData = data.map((d) => ({
    time: fmtTime(d.ts),
    rain: Number(d.rainfall_rate?.toFixed(1) ?? 0),
  }));
  return (
    <ChartShell title={title} subtitle="mm/h" delay={0.05}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 6, right: 14, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(210 80% 62%)" stopOpacity={0.9} />
              <stop offset="95%" stopColor="hsl(210 80% 62%)" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 17%)" />
          <XAxis dataKey="time" tick={axisTick} tickLine={false} axisLine={false} minTickGap={40} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={36} unit="" />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${v} mm/h`, "Rainfall"]}
            cursor={{ fill: "hsl(220 14% 17% / 0.4)" }}
          />
          <Bar dataKey="rain" fill="url(#rainGrad)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
