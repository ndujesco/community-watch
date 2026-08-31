import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge } from "@/components/RiskBadge";
import { WaterLevelChart } from "@/components/charts/WaterLevelChart";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { DhdtChart } from "@/components/charts/DhdtChart";
import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtDateTime, fmtNum, fmtTFlood } from "@/lib/format";
import { useReadings, useSites, useTimeseries } from "@/hooks/use-api";

const RANGES = [
  { label: "24h", hours: 24 },
  { label: "48h", hours: 48 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 },
];

export default function History() {
  const sites = useSites();
  const [site, setSite] = useState<string>();
  const [hours, setHours] = useState(48);

  useEffect(() => {
    if (!site && sites.data?.length) setSite(sites.data[0].site_id);
  }, [sites.data, site]);

  const selected = sites.data?.find((s) => s.site_id === site);
  const series = useTimeseries({ site_id: site, hours, points: 160 });
  const table = useReadings({ site_id: site, hours, limit: 300 });

  const exportCsv = () => {
    if (!table.data?.length) return;
    const cols = [
      "ts", "water_level", "rainfall_rate", "cumulative_rain", "dhdt",
      "tflood", "capacity_pct", "classification", "temperature", "humidity",
    ];
    const rows = table.data.map((r) =>
      cols.map((c) => (r as unknown as Record<string, unknown>)[c] ?? "").join(","),
    );
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floodwatch-${site}-${hours}h.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Historical Data"
        description="Recorded sensor readings, derived rate-of-rise (dH/dt), and flood classification over time from the demo sensor node."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!table.data?.length}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.hours} value={String(r.hours)}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {(series.isLoading || sites.isLoading) && <LoadingState label="Loading history…" />}
      {series.error && <ErrorState error={series.error} />}

      {selected && series.data && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <WaterLevelChart
              data={series.data}
              hmax={selected.channel_depth}
              watchFrac={selected.thresholds.watch_fraction}
              warningFrac={selected.thresholds.warning_fraction}
              title={`Water Level — ${selected.name}`}
            />
            <RainfallChart data={series.data} />
            <div className="lg:col-span-2">
              <DhdtChart data={series.data} />
            </div>
          </div>

          {/* Readings table */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recorded Readings
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {table.data?.length ?? 0} rows (latest first)
              </span>
            </div>
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-card text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 font-medium">Time</th>
                    <th className="px-4 py-2 font-medium">Level (m)</th>
                    <th className="px-4 py-2 font-medium">Cap %</th>
                    <th className="px-4 py-2 font-medium">Rain (mm/h)</th>
                    <th className="px-4 py-2 font-medium">dH/dt (mm/m)</th>
                    <th className="px-4 py-2 font-medium">T-flood</th>
                    <th className="px-4 py-2 font-medium">Class</th>
                  </tr>
                </thead>
                <tbody className="text-mono">
                  {[...(table.data ?? [])].reverse().map((r, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-1.5 text-muted-foreground">{fmtDateTime(r.ts)}</td>
                      <td className="px-4 py-1.5 text-foreground">{fmtNum(r.water_level, 2)}</td>
                      <td className="px-4 py-1.5 text-foreground">{fmtNum(r.capacity_pct, 0)}</td>
                      <td className="px-4 py-1.5 text-foreground">{fmtNum(r.rainfall_rate, 1)}</td>
                      <td className="px-4 py-1.5 text-foreground">{fmtNum(r.dhdt * 1000, 1)}</td>
                      <td className="px-4 py-1.5 text-foreground">{fmtTFlood(r.tflood)}</td>
                      <td className="px-4 py-1.5">
                        <RiskBadge level={r.classification} size="sm" showIcon={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
