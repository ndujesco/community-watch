import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, AlertTriangle, AlertOctagon, MapPin, Waves, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRelative, fmtTFlood } from "@/lib/format";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOverview } from "@/hooks/use-api";
import type { Classification, SiteState } from "@/lib/types";

// Plain-language presentation for each risk level — no technical terms.
const LOOK: Record<
  Classification,
  {
    icon: typeof Shield;
    headline: string;
    action: string;
    bg: string;
    fg: string;
    chip: string;
    pulse?: boolean;
  }
> = {
  safe: {
    icon: Shield,
    headline: "All Clear",
    action: "No flooding expected. Conditions are normal — carry on as usual.",
    bg: "bg-safe",
    fg: "text-safe-foreground",
    chip: "bg-black/15 text-safe-foreground",
  },
  watch: {
    icon: Eye,
    headline: "Be Alert",
    action: "Water is rising. Stay alert, keep children close, and watch for updates.",
    bg: "bg-watch",
    fg: "text-watch-foreground",
    chip: "bg-black/15 text-watch-foreground",
  },
  warning: {
    icon: AlertTriangle,
    headline: "Get Ready to Move",
    action: "Flooding is likely soon. Move valuables up, avoid the water, and prepare to leave for higher ground.",
    bg: "bg-warning",
    fg: "text-warning-foreground",
    chip: "bg-black/15 text-warning-foreground",
  },
  emergency: {
    icon: AlertOctagon,
    headline: "Move Now",
    action: "Flooding is happening. Go to higher ground immediately. Do not walk or drive through the water.",
    bg: "bg-emergency",
    fg: "text-emergency-foreground",
    chip: "bg-black/25 text-emergency-foreground",
    pulse: true,
  },
};

const STORAGE_KEY = "floodwatch:area";

export default function PublicStatus() {
  const { data, isLoading } = useOverview();
  const [area, setArea] = useState<string>("network");

  // Remember the resident's chosen area between visits.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setArea(saved);
  }, []);
  const pick = (v: string) => {
    setArea(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  const sites = data?.sites ?? [];
  const selectedSite: SiteState | undefined =
    area === "network" ? undefined : sites.find((s) => s.site_id === area);

  const level: Classification =
    selectedSite?.classification ?? data?.overall_classification ?? "safe";
  const look = LOOK[level];
  const Icon = look.icon;

  const locationLabel = useMemo(() => {
    if (selectedSite) return selectedSite.name;
    return "Across all monitored areas";
  }, [selectedSite]);

  const tflood =
    selectedSite?.tflood ??
    (area === "network"
      ? sites
          .filter((s) => s.classification === level && s.tflood != null)
          .map((s) => s.tflood!)
          .sort((a, b) => a - b)[0] ?? null
      : null);

  return (
    <div className={cn("flex min-h-screen flex-col transition-colors duration-500", look.bg)}>
      {/* Top strip */}
      <div className={cn("flex items-center justify-between px-5 py-4", look.fg)}>
        <div className="flex items-center gap-2 font-bold">
          <Waves className="h-5 w-5" />
          FloodWatch
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge />
          <Link
            to="/"
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium underline-offset-2 hover:underline",
              look.chip,
            )}
          >
            Full dashboard
          </Link>
        </div>
      </div>

      {/* Main status */}
      <div className={cn("flex flex-1 flex-col items-center justify-center px-6 text-center", look.fg)}>
        <div
          className={cn(
            "mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-black/15",
            look.pulse && "animate-pulse-glow",
          )}
        >
          <Icon className="h-16 w-16" strokeWidth={2.2} />
        </div>

        <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium opacity-90">
          <MapPin className="h-4 w-4" />
          {locationLabel}
        </p>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">{look.headline}</h1>

        <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed opacity-95 sm:text-xl">
          {look.action}
        </p>

        {(level === "warning" || level === "emergency") && tflood != null && (
          <p className={cn("mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold", look.chip)}>
            <Clock className="h-5 w-5" />
            Water may overflow in about {fmtTFlood(tflood)}
          </p>
        )}

        {/* Area picker */}
        <div className="mt-10 w-full max-w-xs">
          <p className="mb-2 text-sm font-medium opacity-90">Check your area</p>
          <Select value={area} onValueChange={pick}>
            <SelectTrigger className="h-12 border-black/20 bg-black/10 text-base font-medium backdrop-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">All monitored areas</SelectItem>
              {sites.map((s) => (
                <SelectItem key={s.site_id} value={s.site_id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer */}
      <div className={cn("px-5 py-4 text-center text-xs opacity-80", look.fg)}>
        {isLoading ? (
          "Checking conditions…"
        ) : (
          <>Updated {fmtRelative(selectedSite?.ts ?? data?.now)} · updates automatically</>
        )}
      </div>
    </div>
  );
}
