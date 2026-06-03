import { cn } from "@/lib/utils";
import { meta } from "@/lib/flood";
import type { Classification } from "@/lib/types";

interface CapacityBarProps {
  pct: number;
  level: Classification;
  showLabel?: boolean;
  /** fractions of Hmax where thresholds sit, for tick marks */
  watchFrac?: number;
  warningFrac?: number;
}

export function CapacityBar({
  pct,
  level,
  showLabel = true,
  watchFrac = 0.5,
  warningFrac = 0.8,
}: CapacityBarProps) {
  const m = meta(level);
  const clamped = Math.max(0, Math.min(100, pct));
  const fillColor = {
    safe: "bg-safe",
    watch: "bg-watch",
    warning: "bg-warning",
    emergency: "bg-emergency",
  }[level];
  return (
    <div>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Channel capacity</span>
          <span className={cn("text-mono font-semibold", m.text)}>{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", fillColor)}
          style={{ width: `${clamped}%` }}
        />
        {/* threshold ticks */}
        <span
          className="absolute top-0 h-full w-px bg-watch/60"
          style={{ left: `${watchFrac * 100}%` }}
        />
        <span
          className="absolute top-0 h-full w-px bg-warning/70"
          style={{ left: `${warningFrac * 100}%` }}
        />
      </div>
    </div>
  );
}
