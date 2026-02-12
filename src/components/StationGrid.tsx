import { motion } from "framer-motion";
import { type SensorStation } from "@/lib/mock-data";
import { Wifi, WifiOff, BatteryMedium } from "lucide-react";

interface StationGridProps {
  stations: SensorStation[];
}

export function StationGrid({ stations }: StationGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Sensor Stations
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stations.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between rounded-md border px-4 py-3 ${
              s.status === "online"
                ? "border-safe/20 bg-safe/5"
                : "border-danger/20 bg-danger/5"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.location}</p>
              <p className="mt-1 text-xs text-muted-foreground">Last: {s.lastReading}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 pl-3">
              {s.status === "online" ? (
                <Wifi className="h-4 w-4 text-safe" />
              ) : (
                <WifiOff className="h-4 w-4 text-danger" />
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BatteryMedium className="h-3.5 w-3.5" />
                <span className="text-mono">{s.battery}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
