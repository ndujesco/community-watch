import { motion } from "framer-motion";
import { type AlertEntry } from "@/lib/mock-data";
import { AlertTriangle, AlertOctagon, Shield } from "lucide-react";

interface AlertFeedProps {
  alerts: AlertEntry[];
}

const levelIcon = {
  safe: Shield,
  warning: AlertTriangle,
  danger: AlertOctagon,
};

const levelColor = {
  safe: "text-safe",
  warning: "text-warning",
  danger: "text-danger",
};

export function AlertFeed({ alerts }: AlertFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Recent Alerts
      </h3>
      <div className="space-y-3">
        {alerts.map((a) => {
          const Icon = levelIcon[a.level];
          return (
            <div key={a.id} className="flex gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
              <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${levelColor[a.level]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{a.station}</span>
                  <span className="text-mono text-xs text-muted-foreground">{a.timestamp}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
