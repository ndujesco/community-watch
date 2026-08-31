import { useEffect, useState } from "react";
import { Save, Trash2, UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge } from "@/components/RiskBadge";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddSubscriber,
  useDeleteSubscriber,
  useSites,
  useSubscribers,
  useUpdateSite,
} from "@/hooks/use-api";
import type { Classification, Site } from "@/lib/types";

export default function Settings() {
  const sites = useSites();
  const site = sites.data?.[0]?.site_id;
  const selected = sites.data?.[0];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Calibrate the demo site's flood thresholds and manage the alert subscribers who receive email alerts on Warning and Emergency."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SiteConfig key={site} site={site} selected={selected} />
        <Subscribers />
      </div>
    </div>
  );
}

function SiteConfig({
  site,
  selected,
}: {
  site?: string;
  selected?: Site;
}) {
  const update = useUpdateSite();
  const [depth, setDepth] = useState("");
  const [watch, setWatch] = useState("");
  const [warning, setWarning] = useState("");
  const [tflood, setTflood] = useState("");
  const [critRain, setCritRain] = useState("");

  useEffect(() => {
    if (selected) {
      setDepth(String(selected.channel_depth));
      setWatch(String(selected.thresholds.watch_fraction));
      setWarning(String(selected.thresholds.warning_fraction));
      setTflood(String(selected.thresholds.tflood_minutes));
      setCritRain(String(selected.thresholds.critical_rainfall));
    }
  }, [selected]);

  const save = () => {
    if (!selected) return;
    update.mutate(
      {
        siteId: selected.site_id,
        body: {
          channel_depth: Number(depth),
          thresholds: {
            ...selected.thresholds,
            watch_fraction: Number(watch),
            warning_fraction: Number(warning),
            tflood_minutes: Number(tflood),
            critical_rainfall: Number(critRain),
          },
        },
      },
      {
        onSuccess: () => toast.success("Site configuration saved"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
      },
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Site Configuration
        </h3>
        {selected && <span className="text-xs text-muted-foreground">{selected.name}</span>}
      </div>

      {!selected ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {selected.area} · {selected.channel_type} · drainage {selected.drainage_quality}
          </p>
          <Field label="Channel depth Hmax (m)" hint="Total channel depth — the overflow level.">
            <Input value={depth} onChange={(e) => setDepth(e.target.value)} type="number" step="0.05" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Watch fraction" hint="× Hmax → Watch">
              <Input value={watch} onChange={(e) => setWatch(e.target.value)} type="number" step="0.05" />
            </Field>
            <Field label="Warning fraction" hint="× Hmax → Warning">
              <Input value={warning} onChange={(e) => setWarning(e.target.value)} type="number" step="0.05" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="T-flood threshold (min)" hint="Warn if overflow sooner">
              <Input value={tflood} onChange={(e) => setTflood(e.target.value)} type="number" step="1" />
            </Field>
            <Field label="Critical rainfall (mm/h)" hint="Heavy-rain trigger">
              <Input value={critRain} onChange={(e) => setCritRain(e.target.value)} type="number" step="1" />
            </Field>
          </div>
          <Button onClick={save} disabled={update.isPending} className="w-full">
            <Save className="mr-1.5 h-4 w-4" />
            {update.isPending ? "Saving…" : "Save configuration"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Subscribers() {
  const subs = useSubscribers();
  const add = useAddSubscriber();
  const del = useDeleteSubscriber();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<Classification>("warning");

  const submit = () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    add.mutate(
      { name, email, phone: phone || null, site_id: null, min_level: level },
      {
        onSuccess: () => {
          toast.success("Subscriber added");
          setName("");
          setEmail("");
          setPhone("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add"),
      },
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Alert Subscribers
      </h3>

      <div className="space-y-2">
        {subs.isLoading && <LoadingState />}
        {subs.data?.length === 0 && (
          <p className="text-xs text-muted-foreground">No subscribers yet.</p>
        )}
        {subs.data?.map((s) => (
          <div
            key={s.subscriber_id}
            className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{s.name}</p>
              <p className="text-mono text-[11px] text-muted-foreground">
                {s.email}{s.phone && ` · ${s.phone}`}
              </p>
            </div>
            <RiskBadge level={s.min_level} size="sm" showIcon={false} />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-emergency"
              onClick={() =>
                del.mutate(s.subscriber_id, { onSuccess: () => toast.success("Removed") })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Input
          placeholder="+234… (optional — also get SMS)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Select value={level} onValueChange={(v) => setLevel(v as Classification)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="watch">Watch &amp; above</SelectItem>
            <SelectItem value="warning">Warning &amp; above</SelectItem>
            <SelectItem value="emergency">Emergency only</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={submit} disabled={add.isPending} variant="outline" className="w-full">
          <UserPlus className="mr-1.5 h-4 w-4" /> Add subscriber
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
