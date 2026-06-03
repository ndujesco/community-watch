import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Waves, CloudRain, TrendingUp, Sigma, Ruler, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { SiteSelect } from "@/components/SiteSelect";
import { RainResponseScatter } from "@/components/charts/RainResponseScatter";
import { ClassificationDonut } from "@/components/charts/ClassificationDonut";
import { ChartShell, axisTick, tooltipStyle } from "@/components/charts/chart-common";
import { LoadingState, ErrorState } from "@/components/states";
import { fmtNum } from "@/lib/format";
import { useAnalyticsSummary, useSiteAnalytics, useSites } from "@/hooks/use-api";

const QUALITY_COLOR: Record<string, string> = {
  good: "hsl(152 58% 45%)",
  moderate: "hsl(45 96% 56%)",
  poor: "hsl(0 84% 60%)",
};

export default function Analytics() {
  const sites = useSites();
  const [site, setSite] = useState<string>();
  useEffect(() => {
    if (!site && sites.data?.length) setSite(sites.data[0].site_id);
  }, [sites.data, site]);

  const analytics = useSiteAnalytics(site, 96);
  const summary = useAnalyticsSummary(96);

  return (
    <div>
      <PageHeader
        title="Site Analytics"
        description="Because the rain gauge and water-level sensor are co-located, the system directly observes how rainfall translates into water-level rise at each site. The fitted coefficient α captures that site-specific drainage behaviour."
        actions={<SiteSelect sites={sites.data} value={site} onChange={setSite} />}
      />

      {analytics.isLoading && <LoadingState label="Computing site analytics…" />}
      {analytics.error && <ErrorState error={analytics.error} />}

      {analytics.data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Peak Water Level" value={fmtNum(analytics.data.summary.peak_water_level, 2)} unit="m" icon={Waves} />
            <MetricCard label="Channel Depth" value={fmtNum(analytics.data.summary.channel_depth, 2)} unit="m" icon={Ruler} />
            <MetricCard label="Peak Rainfall" value={fmtNum(analytics.data.summary.peak_rainfall, 0)} unit="mm/h" icon={CloudRain} />
            <MetricCard label="Max dH/dt" value={fmtNum((analytics.data.summary.max_dhdt) * 1000, 1)} unit="mm/m" icon={TrendingUp} />
            <MetricCard label="Fitted α" value={fmtNum(analytics.data.summary.empirical_alpha, 4)} icon={Sigma} subtitle="rainfall→level" />
            <MetricCard label="Drainage" value={cap(analytics.data.summary.drainage_quality)} icon={Activity} subtitle={`${analytics.data.summary.samples} samples`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RainResponseScatter
              points={analytics.data.scatter}
              alpha={analytics.data.summary.empirical_alpha}
            />
            <ClassificationDonut distribution={analytics.data.distribution} />
          </div>

          {/* Cross-site comparison — report Figure 3.5 */}
          {summary.data && (
            <ChartShell
              title="Site Drainage Comparison — coefficient α"
              subtitle="higher α ⇒ rainfall causes faster water-level rise (poorer drainage)"
              height={300}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.data.sites.map((s) => ({
                    name: s.name.replace(/ (Canal|Drain|Channel)$/, ""),
                    alpha: s.empirical_alpha ?? 0,
                    quality: s.drainage_quality,
                  }))}
                  margin={{ top: 8, right: 16, left: -6, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 17%)" />
                  <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={60} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [v.toFixed(4), "α"]}
                    cursor={{ fill: "hsl(220 14% 17% / 0.4)" }}
                  />
                  <Bar dataKey="alpha" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {summary.data.sites.map((s) => (
                      <Cell key={s.site_id} fill={QUALITY_COLOR[s.drainage_quality] ?? "hsl(185 72% 55%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          )}

          {summary.data && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Site Comparison
                </h3>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 font-medium">Site</th>
                      <th className="px-4 py-2 font-medium">Drainage</th>
                      <th className="px-4 py-2 font-medium">Depth (m)</th>
                      <th className="px-4 py-2 font-medium">α (fitted)</th>
                      <th className="px-4 py-2 font-medium">Peak level (m)</th>
                      <th className="px-4 py-2 font-medium">Peak rain (mm/h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.data.sites.map((s) => (
                      <tr key={s.site_id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-2 text-foreground">{s.name}</td>
                        <td className="px-4 py-2 capitalize text-muted-foreground">{s.drainage_quality}</td>
                        <td className="text-mono px-4 py-2 text-foreground">{fmtNum(s.channel_depth, 2)}</td>
                        <td className="text-mono px-4 py-2 text-foreground">{fmtNum(s.empirical_alpha, 4)}</td>
                        <td className="text-mono px-4 py-2 text-foreground">{fmtNum(s.peak_water_level, 2)}</td>
                        <td className="text-mono px-4 py-2 text-foreground">{fmtNum(s.peak_rainfall, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : "—";
}
