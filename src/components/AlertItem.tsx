import { cn } from "@/lib/utils";
import { meta } from "@/lib/flood";
import { fmtDateTime, fmtTFlood } from "@/lib/format";
import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, Smartphone } from "lucide-react";
import type { Alert } from "@/lib/types";

interface Props {
  alert: Alert;
  onAck?: (alertId: string) => void;
  compact?: boolean;
}

export function AlertItem({ alert, onAck, compact }: Props) {
  const m = meta(alert.level);
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border bg-card px-4 py-3",
        alert.acknowledged ? "border-border opacity-70" : m.border,
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0", m.text)}>
        <m.icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge level={alert.level} size="sm" showIcon={false} />
          <span className="truncate text-sm font-medium text-foreground">{alert.site_name}</span>
          <span className="text-mono ml-auto text-[11px] text-muted-foreground">
            {fmtDateTime(alert.ts)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
        {!compact && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              Level <span className="text-mono text-foreground">{alert.water_level.toFixed(2)}m</span>
            </span>
            <span>
              Capacity <span className="text-mono text-foreground">{alert.capacity_pct.toFixed(0)}%</span>
            </span>
            {alert.tflood != null && (
              <span>
                T-flood <span className="text-mono text-foreground">{fmtTFlood(alert.tflood)}</span>
              </span>
            )}
            <span className="flex items-center gap-2">
              {alert.channels.includes("sms") && <Smartphone className="h-3 w-3" />}
              {alert.channels.includes("push") && <MessageSquare className="h-3 w-3" />}
            </span>
            {alert.acknowledged ? (
              <span className="flex items-center gap-1 text-safe">
                <Check className="h-3 w-3" /> Ack&apos;d {alert.acknowledged_by && `· ${alert.acknowledged_by}`}
              </span>
            ) : (
              onAck && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-6 px-2 text-[11px]"
                  onClick={() => onAck(alert.alert_id)}
                >
                  Acknowledge
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
