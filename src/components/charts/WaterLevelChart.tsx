import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtTime } from "@/lib/format";
import type { Reading } from "@/lib/types";
import { ChartShell, axisTick, tooltipStyle } from "./chart-common";

interface Props {
  data: Reading[];
  hmax: number;
  watchFrac?: number;
  warningFrac?: number;
  title?: string;
}

export function WaterLevelChart({
  data,
  hmax,
  watchFrac = 0.5,
  warningFrac = 0.8,
  title = "Water Level",
}: Props) {
  const chartData = data.map((d) => ({
    time: fmtTime(d.ts),
    level: Number(d.water_level?.toFixed(3) ?? 0),
  }));
  const yMax = Math.max(hmax * 1.1, ...chartData.map((d) => d.level)) || hmax;

  return (
    <ChartShell title={title} subtitle={`H_max = ${hmax} m`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 6, right: 14, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(195 85% 55%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(195 85% 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 17%)" />
          <XAxis dataKey="time" tick={axisTick} tickLine={false} axisLine={false} minTickGap={40} />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            domain={[0, Number(yMax.toFixed(1))]}
            width={42}
            unit="m"
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} m`, "Water level"]} />
          <ReferenceLine
            y={Number((watchFrac * hmax).toFixed(2))}
            stroke="hsl(45 96% 56%)"
            strokeDasharray="5 4"
            label={{ value: "Watch", fill: "hsl(45 96% 56%)", fontSize: 10, position: "insideRight" }}
          />
          <ReferenceLine
            y={Number((warningFrac * hmax).toFixed(2))}
            stroke="hsl(28 95% 55%)"
            strokeDasharray="5 4"
            label={{ value: "Warning", fill: "hsl(28 95% 55%)", fontSize: 10, position: "insideRight" }}
          />
          <ReferenceLine
            y={hmax}
            stroke="hsl(0 84% 60%)"
            strokeDasharray="5 4"
            label={{ value: "Capacity", fill: "hsl(0 84% 60%)", fontSize: 10, position: "insideRight" }}
          />
          <Area
            type="monotone"
            dataKey="level"
            stroke="hsl(195 85% 55%)"
            strokeWidth={2}
            fill="url(#waterGrad)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
