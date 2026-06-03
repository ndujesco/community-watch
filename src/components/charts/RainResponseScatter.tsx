import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ChartShell, axisTick, tooltipStyle } from "./chart-common";

interface Props {
  points: { rainfall_rate: number; dhdt: number }[];
  alpha?: number | null;
  title?: string;
}

// Visualises the empirical rainfall -> water-level response at a site
// (report 3.3.2). The cloud's slope is the site coefficient alpha.
export function RainResponseScatter({ points, alpha, title = "Rainfall → Water-Level Response" }: Props) {
  const data = points.map((p) => ({
    rain: Number(p.rainfall_rate.toFixed(1)),
    // dH/dt in mm/min for readability
    dhdt: Number((p.dhdt * 1000).toFixed(2)),
  }));
  return (
    <ChartShell
      title={title}
      subtitle={alpha != null ? `fitted α ≈ ${alpha}` : "dH/dt vs rainfall"}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 17%)" />
          <XAxis
            type="number"
            dataKey="rain"
            name="Rainfall"
            unit=" mm/h"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            label={{ value: "Rainfall (mm/h)", fill: "hsl(215 14% 58%)", fontSize: 11, dy: 14 }}
          />
          <YAxis
            type="number"
            dataKey="dhdt"
            name="dH/dt"
            unit=" mm/min"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={54}
          />
          <ZAxis range={[24, 24]} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(v: number, n: string) =>
              n === "Rainfall" ? [`${v} mm/h`, n] : [`${v} mm/min`, "dH/dt"]
            }
          />
          <Scatter data={data} fill="hsl(185 72% 55%)" fillOpacity={0.55} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
