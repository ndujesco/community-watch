import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtTime } from "@/lib/format";
import type { Reading } from "@/lib/types";
import { ChartShell, axisTick, tooltipStyle } from "./chart-common";

export function DhdtChart({ data, title = "Rate of Rise (dH/dt)" }: { data: Reading[]; title?: string }) {
  const chartData = data.map((d) => ({
    time: fmtTime(d.ts),
    // convert m/min -> mm/min for readability
    dhdt: Number(((d.dhdt ?? 0) * 1000).toFixed(1)),
  }));
  return (
    <ChartShell title={title} subtitle="mm/min" delay={0.1}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 6, right: 14, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 17%)" />
          <XAxis dataKey="time" tick={axisTick} tickLine={false} axisLine={false} minTickGap={40} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number) => [`${v} mm/min`, "dH/dt"]}
          />
          <ReferenceLine y={0} stroke="hsl(220 14% 30%)" />
          <Line
            type="monotone"
            dataKey="dhdt"
            stroke="hsl(185 72% 55%)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
