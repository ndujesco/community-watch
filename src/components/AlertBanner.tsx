import { motion } from "framer-motion";
import { type AlertLevel } from "@/lib/mock-data";
import { Shield, AlertTriangle, AlertOctagon } from "lucide-react";

interface AlertBannerProps {
  level: AlertLevel;
}

const config: Record<AlertLevel, { icon: typeof Shield; label: string; desc: string; style: string }> = {
  safe: {
    icon: Shield,
    label: "All Clear",
    desc: "All sensor readings within normal range. No flood risk detected.",
    style: "border-safe/30 bg-safe/5 text-safe glow-safe",
  },
  warning: {
    icon: AlertTriangle,
    label: "Flood Watch",
    desc: "Elevated water levels detected. Monitor conditions and prepare to evacuate low-lying areas.",
    style: "border-warning/40 bg-warning/5 text-warning glow-warning",
  },
  danger: {
    icon: AlertOctagon,
    label: "Flood Warning — Take Action",
    desc: "Critical water levels detected. Evacuate flood-prone areas immediately. Emergency services notified.",
    style: "border-danger/50 bg-danger/8 text-danger glow-danger animate-pulse-glow",
  },
};

export function AlertBanner({ level }: AlertBannerProps) {
  const { icon: Icon, label, desc, style } = config[level];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 ${style}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0 sm:h-7 sm:w-7" />
      <div className="min-w-0">
        <h2 className="text-sm font-bold sm:text-lg">{label}</h2>
        <p className="text-xs opacity-80 sm:text-sm">{desc}</p>
      </div>
    </motion.div>
  );
}
