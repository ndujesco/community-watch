import { Radio, RotateCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtime } from "@/hooks/use-realtime";

export function ConnectionBadge() {
  const { state } = useRealtime();
  const config = {
    open: { icon: Radio, label: "Live", tone: "text-safe border-safe/30 bg-safe/10", spin: false },
    connecting: {
      icon: RotateCw,
      label: "Connecting",
      tone: "text-watch border-watch/30 bg-watch/10",
      spin: true,
    },
    closed: {
      icon: WifiOff,
      label: "Polling",
      tone: "text-muted-foreground border-border bg-secondary/40",
      spin: false,
    },
  }[state];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        config.tone,
      )}
      title={
        state === "open"
          ? "Real-time WebSocket stream connected"
          : state === "closed"
            ? "WebSocket unavailable — falling back to polling"
            : "Connecting to live stream…"
      }
    >
      <Icon className={cn("h-3 w-3", config.spin && "animate-spin")} />
      {config.label}
      {state === "open" && (
        <span className="ml-0.5 h-1.5 w-1.5 animate-pulse-glow rounded-full bg-safe" />
      )}
    </span>
  );
}
