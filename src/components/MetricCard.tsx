import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/flood";
import type { Classification } from "@/lib/types";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  level?: Classification;
  subtitle?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  level,
  subtitle,
  delay = 0,
}: MetricCardProps) {
  const m = level ? meta(level) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4",
        m ? cn(m.border, m.glow) : "border-border",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-mono text-2xl font-bold text-foreground">{value}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          {subtitle && (
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "rounded-lg p-2",
            m ? cn(m.tint, m.text) : "bg-secondary text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {level === "emergency" && (
        <span className="absolute right-2 top-2 h-2 w-2 animate-pulse-glow rounded-full bg-emergency" />
      )}
    </motion.div>
  );
}
