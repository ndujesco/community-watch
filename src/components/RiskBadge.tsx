import { cn } from "@/lib/utils";
import { meta } from "@/lib/flood";
import type { Classification } from "@/lib/types";

interface RiskBadgeProps {
  level: Classification;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

export function RiskBadge({
  level,
  size = "md",
  showIcon = true,
  pulse = false,
  className,
}: RiskBadgeProps) {
  const m = meta(level);
  const Icon = m.icon;
  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };
  const iconSizes = { sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-4 w-4" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold uppercase tracking-wide",
        m.solid,
        pulse && level === "emergency" && "animate-pulse-glow",
        sizes[size],
        className,
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {m.short}
    </span>
  );
}
