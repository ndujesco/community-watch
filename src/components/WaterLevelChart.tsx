import { motion } from "framer-motion";
import { type WeatherReading, THRESHOLDS } from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface WaterLevelChartProps {
  data: WeatherReading[];
}

export function WaterLevelChart({ data }: WaterLevelChartProps) {
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    waterLevel: parseFloat(d.waterLevel.toFixed(2)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Water Level — 24h
      </h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(195, 85%, 55%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(195, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215, 12%, 55%)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 55%)" }} tickLine={false} axisLine={false} domain={[0, 5]} unit="m" />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 14%, 18%)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <ReferenceLine y={THRESHOLDS.waterLevel.warning} stroke="hsl(38, 92%, 55%)" strokeDasharray="6 4" label={{ value: "Warning", fill: "hsl(38, 92%, 55%)", fontSize: 11, position: "right" }} />
            <ReferenceLine y={THRESHOLDS.waterLevel.danger} stroke="hsl(0, 72%, 55%)" strokeDasharray="6 4" label={{ value: "Danger", fill: "hsl(0, 72%, 55%)", fontSize: 11, position: "right" }} />
            <Area type="monotone" dataKey="waterLevel" stroke="hsl(195, 85%, 55%)" strokeWidth={2} fill="url(#waterGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
