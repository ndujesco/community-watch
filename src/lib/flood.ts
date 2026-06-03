import { Shield, Eye, AlertTriangle, AlertOctagon, type LucideIcon } from "lucide-react";
import type { Classification } from "./types";

export interface ClassMeta {
  key: Classification;
  label: string;
  short: string;
  icon: LucideIcon;
  /** tailwind text color class */
  text: string;
  /** tailwind bg tint class */
  tint: string;
  /** tailwind border class */
  border: string;
  /** solid bg for chips */
  solid: string;
  /** glow utility */
  glow: string;
  /** hsl var for charts */
  hsl: string;
  description: string;
}

export const CLASS_META: Record<Classification, ClassMeta> = {
  safe: {
    key: "safe",
    label: "Safe",
    short: "Safe",
    icon: Shield,
    text: "text-safe",
    tint: "bg-safe/10",
    border: "border-safe/30",
    solid: "bg-safe text-safe-foreground",
    glow: "glow-safe",
    hsl: "hsl(152 58% 45%)",
    description: "Water level normal. No action required.",
  },
  watch: {
    key: "watch",
    label: "Watch",
    short: "Watch",
    icon: Eye,
    text: "text-watch",
    tint: "bg-watch/10",
    border: "border-watch/40",
    solid: "bg-watch text-watch-foreground",
    glow: "glow-watch",
    hsl: "hsl(45 96% 56%)",
    description: "Water rising or rainfall elevated. Monitor conditions.",
  },
  warning: {
    key: "warning",
    label: "Warning",
    short: "Warning",
    icon: AlertTriangle,
    text: "text-warning",
    tint: "bg-warning/10",
    border: "border-warning/40",
    solid: "bg-warning text-warning-foreground",
    glow: "glow-warning",
    hsl: "hsl(28 95% 55%)",
    description: "Overflow projected soon. Prepare to move to higher ground.",
  },
  emergency: {
    key: "emergency",
    label: "Emergency",
    short: "Emergency",
    icon: AlertOctagon,
    text: "text-emergency",
    tint: "bg-emergency/10",
    border: "border-emergency/50",
    solid: "bg-emergency text-emergency-foreground",
    glow: "glow-emergency",
    hsl: "hsl(0 84% 60%)",
    description: "Channel capacity reached. Evacuate flood-prone areas now.",
  },
};

export const CLASS_RANK: Record<Classification, number> = {
  safe: 0,
  watch: 1,
  warning: 2,
  emergency: 3,
};

export function worstClass(levels: Classification[]): Classification {
  return levels.reduce<Classification>(
    (worst, l) => (CLASS_RANK[l] > CLASS_RANK[worst] ? l : worst),
    "safe",
  );
}

export function meta(level: Classification): ClassMeta {
  return CLASS_META[level] ?? CLASS_META.safe;
}
