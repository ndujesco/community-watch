import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/flood";
import type { Classification } from "@/lib/types";

interface AlertBannerProps {
  level: Classification;
  detail?: string;
}

export function AlertBanner({ level, detail }: AlertBannerProps) {
  const m = meta(level);
  const Icon = m.icon;
  return (
    <motion.div
      key={level}
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex items-center gap-4 rounded-xl border px-5 py-4",
        m.border,
        m.tint,
        m.glow,
        level === "emergency" && "animate-pulse-glow",
      )}
    >
      <div className={cn("rounded-lg p-2.5", m.tint, m.text)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className={cn("text-lg font-bold", m.text)}>
            {level === "safe" ? "All Clear" : `Flood ${m.label}`}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{detail || m.description}</p>
      </div>
    </motion.div>
  );
}
