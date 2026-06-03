import { type ReactNode } from "react";
import { motion } from "framer-motion";

export const axisTick = { fontSize: 11, fill: "hsl(215 14% 58%)" };

export const tooltipStyle = {
  background: "hsl(220 20% 9%)",
  border: "1px solid hsl(220 14% 17%)",
  borderRadius: 10,
  fontSize: 12,
  color: "hsl(210 20% 92%)",
};

interface ChartShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  height?: number;
  children: ReactNode;
  delay?: number;
}

export function ChartShell({
  title,
  subtitle,
  actions,
  height = 260,
  children,
  delay = 0,
}: ChartShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-mono text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div style={{ height }}>{children}</div>
    </motion.div>
  );
}
