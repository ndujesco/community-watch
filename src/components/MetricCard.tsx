import { motion } from "framer-motion";
import { type AlertLevel } from "@/lib/mock-data";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  alertLevel?: AlertLevel;
  subtitle?: string;
}

const levelStyles: Record<AlertLevel, string> = {
  safe: "border-safe/30 glow-safe",
  warning: "border-warning/40 glow-warning",
  danger: "border-danger/50 glow-danger",
};

const iconBg: Record<AlertLevel, string> = {
  safe: "bg-safe/15 text-safe",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function MetricCard({ label, value, unit, icon: Icon, alertLevel = "safe", subtitle }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-lg border bg-card p-5 ${levelStyles[alertLevel]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-mono text-3xl font-bold text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${iconBg[alertLevel]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {alertLevel === "danger" && (
        <div className="absolute right-2 top-2 h-2 w-2 animate-pulse-glow rounded-full bg-danger" />
      )}
    </motion.div>
  );
}
