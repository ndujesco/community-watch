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
      className={`relative rounded-lg border bg-card p-3 sm:p-5 ${levelStyles[alertLevel]}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</p>
          <div className="mt-1 flex items-baseline gap-1 sm:mt-2 sm:gap-1.5">
            <span className="text-mono text-xl font-bold text-foreground sm:text-3xl">{value}</span>
            <span className="text-[10px] text-muted-foreground sm:text-sm">{unit}</span>
          </div>
          {subtitle && <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">{subtitle}</p>}
        </div>
        <div className={`rounded-md p-1.5 sm:rounded-lg sm:p-2.5 ${iconBg[alertLevel]}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
      {alertLevel === "danger" && (
        <div className="absolute right-2 top-2 h-2 w-2 animate-pulse-glow rounded-full bg-danger" />
      )}
    </motion.div>
  );
}
