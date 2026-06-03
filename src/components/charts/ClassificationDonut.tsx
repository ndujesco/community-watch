import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CLASS_META } from "@/lib/flood";
import type { Classification } from "@/lib/types";
import { ChartShell, tooltipStyle } from "./chart-common";

export function ClassificationDonut({
  distribution,
  title = "Time in Each State",
}: {
  distribution: Record<Classification, number>;
  title?: string;
}) {
  const order: Classification[] = ["safe", "watch", "warning", "emergency"];
  const data = order
    .map((k) => ({ name: CLASS_META[k].label, key: k, value: distribution[k] ?? 0 }))
    .filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <ChartShell title={title} subtitle="share of readings" height={300} delay={0.1}>
      <div className="flex h-full items-center gap-4">
        <ResponsiveContainer width="55%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={52}
              outerRadius={86}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={CLASS_META[d.key].hsl} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, n: string) => [
                `${v} (${((v / total) * 100).toFixed(0)}%)`,
                n,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: CLASS_META[d.key].hsl }}
                />
                <span className="text-foreground">{d.name}</span>
              </span>
              <span className="text-mono text-muted-foreground">
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}
