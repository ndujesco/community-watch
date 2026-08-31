import { useState } from "react";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge } from "@/components/RiskBadge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { meta } from "@/lib/flood";
import { fmtDateTime, fmtTFlood } from "@/lib/format";
import { useAckAlert, useAlerts } from "@/hooks/use-api";
import type { Alert } from "@/lib/types";

export default function Alerts() {
  const [level, setLevel] = useState<string>("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [detail, setDetail] = useState<Alert | null>(null);

  const { data, isLoading, error } = useAlerts({
    level: level === "all" ? undefined : level,
    acknowledged: activeOnly ? false : undefined,
    limit: 300,
  });
  const ack = useAckAlert();

  return (
    <div>
      <PageHeader
        title="Alert Log"
        description="CAP-compliant alerts generated on every escalation of flood classification. Warning and Emergency alerts are also dispatched via SMS and push to registered subscribers."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs value={level} onValueChange={setLevel}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="watch">Watch</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
        </Tabs>
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={activeOnly} onCheckedChange={setActiveOnly} />
          Active (unacknowledged) only
        </label>
      </div>

      {isLoading && <LoadingState label="Loading alerts…" />}
      {error && <ErrorState error={error} />}
      {data?.length === 0 && (
        <EmptyState icon={Bell} title="No alerts match these filters" />
      )}

      <div className="space-y-2">
        {data?.map((a) => {
          const m = meta(a.level);
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-lg border bg-card px-4 py-3 ${
                a.acknowledged ? "border-border opacity-70" : m.border
              }`}
            >
              <m.icon className={`h-4 w-4 flex-shrink-0 ${m.text}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={a.level} size="sm" showIcon={false} />
                  <span className="truncate text-sm font-medium text-foreground">{a.site_name}</span>
                  <span className="text-mono text-[11px] text-muted-foreground">{fmtDateTime(a.ts)}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.message}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => setDetail(a)}>
                  CAP
                </Button>
                {!a.acknowledged && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={ack.isPending}
                    onClick={() => ack.mutate({ alertId: a.alert_id })}
                  >
                    Ack
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CapDialog alert={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function CapDialog({ alert, onClose }: { alert: Alert | null; onClose: () => void }) {
  return (
    <Dialog open={!!alert} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {alert && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RiskBadge level={alert.level} size="sm" />
                {alert.cap.event}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="rounded-lg border border-border bg-secondary/40 p-3 text-muted-foreground">
                {alert.cap.instruction}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <Field label="Identifier" value={alert.cap.identifier} mono />
                <Field label="Sender" value={alert.cap.sender} />
                <Field label="Sent" value={fmtDateTime(alert.cap.sent)} />
                <Field label="Status" value={alert.cap.status} />
                <Field label="Severity" value={alert.cap.severity} />
                <Field label="Urgency" value={alert.cap.urgency} />
                <Field label="Certainty" value={alert.cap.certainty} />
                <Field label="Category" value={alert.cap.category} />
                <Field label="Area" value={alert.cap.area_desc} />
                <Field label="Water level" value={`${alert.water_level.toFixed(2)} m (${alert.capacity_pct.toFixed(0)}%)`} />
                <Field label="Rainfall" value={`${alert.rainfall_rate.toFixed(1)} mm/h`} />
                <Field label="T-flood" value={fmtTFlood(alert.tflood)} />
                <Field label="Channels" value={alert.channels.join(", ")} />
              </dl>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "text-mono text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}
