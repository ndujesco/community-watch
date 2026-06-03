import { motion } from "framer-motion";
import { Droplets, Timer, TrendingUp, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/flood";
import { fmtNum, fmtTFlood } from "@/lib/format";
import { RiskBadge } from "./RiskBadge";
import { CapacityBar } from "./CapacityBar";
import type { SiteState } from "@/lib/types";

interface Props {
  site: SiteState;
  selected?: boolean;
  onSelect?: (siteId: string) => void;
  delay?: number;
}

export function SiteStatusCard({ site, selected, onSelect, delay = 0 }: Props) {
  const m = meta(site.classification);
  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(site.site_id)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "w-full rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40",
        selected ? cn(m.border, m.glow, "ring-1 ring-primary/40") : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{site.name}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{site.area}</span>
          </p>
        </div>
        <RiskBadge level={site.classification} size="sm" pulse />
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-mono text-2xl font-bold text-foreground">
          {fmtNum(site.water_level, 2)}
        </span>
        <span className="text-xs text-muted-foreground">m</span>
      </div>

      <div className="mt-2">
        <CapacityBar pct={site.capacity_pct} level={site.classification} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Droplets className="h-3 w-3 text-rain" />
          <span className="text-mono text-foreground">{fmtNum(site.rainfall_rate, 0)}</span> mm/h
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span className="text-mono text-foreground">{fmtNum(site.dhdt * 1000, 1)}</span> mm/m
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Timer className={cn("h-3 w-3", site.tflood != null ? m.text : "")} />
          <span className="text-mono text-foreground">{fmtTFlood(site.tflood)}</span>
        </div>
      </div>
    </motion.button>
  );
}
