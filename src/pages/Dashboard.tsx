import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Waves,
  Droplets,
  TrendingUp,
  Timer,
  Thermometer,
  Gauge,
  CloudRain,
  RadioTower,
  Bell,
  Building2,
} from "lucide-react";
import { AlertBanner } from "@/components/AlertBanner";
import { MetricCard } from "@/components/MetricCard";
import { SiteStatusCard } from "@/components/SiteStatusCard";
import { AlertItem } from "@/components/AlertItem";
import { RiskBadge } from "@/components/RiskBadge";
import { WaterLevelChart } from "@/components/charts/WaterLevelChart";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { CLASS_RANK, meta } from "@/lib/flood";
import { fmtNum, fmtTFlood } from "@/lib/format";
import {
  useOverview,
  useSites,
  useAlerts,
  useLatest,
  useTimeseries,
} from "@/hooks/use-api";

export default function Dashboard() {
  const overview = useOverview();
  const sites = useSites();
  const alerts = useAlerts({ limit: 8 });
  const [focus, setFocus] = useState<string | undefined>();

  // Default focus = highest-risk site.
  useEffect(() => {
    if (!focus && overview.data?.sites?.length) {
      const worst = [...overview.data.sites].sort(
        (a, b) => CLASS_RANK[b.classification] - CLASS_RANK[a.classification],
      )[0];
      setFocus(worst.site_id);
    }
  }, [overview.data, focus]);

  const focusedSite = sites.data?.find((s) => s.site_id === focus);
  const latest = useLatest({ site_id: focus });
  const series = useTimeseries({ site_id: focus, hours: 24, points: 96 });
  const reading = latest.data?.[0];

  const bannerDetail = useMemo(() => {
    const sl = overview.data?.sites ?? [];
    const elevated = sl.filter((s) => s.classification !== "safe");
    if (!sl.length) return undefined;
    if (!elevated.length) return `All ${sl.length} monitored sites are within normal range.`;
    const names = elevated.map((s) => s.name).slice(0, 3).join(", ");
    return `${elevated.length} of ${sl.length} sites elevated: ${names}${elevated.length > 3 ? "…" : ""}.`;
  }, [overview.data]);

  if (overview.isLoading) return <LoadingState label="Loading network status…" />;
  if (overview.error) return <ErrorState error={overview.error} />;
  const o = overview.data!;

  return (
    <div className="space-y-6">
      <AlertBanner level={o.overall_classification} detail={bannerDetail} />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Monitored Sites" value={String(o.total_sites)} icon={Building2} />
        <MetricCard
          label="Stations Online"
          value={`${o.online_stations}/${o.total_stations}`}
          icon={RadioTower}
          level={o.online_stations < o.total_stations ? "watch" : "safe"}
        />
        <MetricCard
          label="Active Alerts"
          value={String(o.active_alerts)}
          icon={Bell}
          level={o.active_alerts > 0 ? "warning" : "safe"}
          subtitle="unacknowledged W/E"
        />
        <MetricCard
          label="Network Status"
          value={meta(o.overall_classification).label}
          icon={Waves}
          level={o.overall_classification}
        />
      </div>

      {/* Sites + alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Monitored Sites
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {o.sites.map((s, i) => (
              <SiteStatusCard
                key={s.site_id}
                site={s}
                selected={s.site_id === focus}
                onSelect={setFocus}
                delay={i * 0.04}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Alerts
            </h3>
            <Link to="/alerts" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {alerts.isLoading && <LoadingState label="Loading alerts…" />}
            {alerts.data?.length === 0 && (
              <EmptyState icon={Bell} title="No alerts yet" description="Alerts appear as conditions change." />
            )}
            {alerts.data?.slice(0, 8).map((a) => (
              <AlertItem key={a.id} alert={a} compact />
            ))}
          </div>
        </div>
      </div>

      {/* Focused site */}
      {focusedSite && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <h3 className="text-lg font-bold text-foreground">{focusedSite.name}</h3>
            {reading && <RiskBadge level={reading.classification} pulse />}
            <span className="text-xs text-muted-foreground">{focusedSite.area}</span>
            <Link
              to="/analytics"
              className="ml-auto text-xs text-primary hover:underline"
            >
              Site analytics →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <MetricCard
              label="Water Level"
              value={fmtNum(reading?.water_level, 2)}
              unit="m"
              icon={Waves}
              level={reading?.classification}
              subtitle={`${fmtNum(reading?.capacity_pct, 0)}% of ${focusedSite.channel_depth}m`}
            />
            <MetricCard
              label="Time to Flood"
              value={fmtTFlood(reading?.tflood ?? null)}
              icon={Timer}
              level={reading?.classification}
              subtitle="at current rate"
            />
            <MetricCard
              label="Rainfall Rate"
              value={fmtNum(reading?.rainfall_rate, 0)}
              unit="mm/h"
              icon={Droplets}
            />
            <MetricCard
              label="Rate of Rise"
              value={fmtNum((reading?.dhdt ?? 0) * 1000, 1)}
              unit="mm/min"
              icon={TrendingUp}
            />
            <MetricCard
              label="Temperature"
              value={fmtNum(reading?.temperature, 1)}
              unit="°C"
              icon={Thermometer}
            />
            <MetricCard
              label="Pressure"
              value={fmtNum(reading?.pressure, 0)}
              unit="hPa"
              icon={Gauge}
            />
            <MetricCard
              label="Humidity"
              value={fmtNum(reading?.humidity, 0)}
              unit="%"
              icon={Droplets}
            />
            <MetricCard
              label="Cumulative Rain"
              value={fmtNum(reading?.cumulative_rain, 1)}
              unit="mm"
              icon={CloudRain}
              subtitle="today"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {series.data && series.data.length > 0 ? (
              <>
                <WaterLevelChart
                  data={series.data}
                  hmax={focusedSite.channel_depth}
                  watchFrac={focusedSite.thresholds.watch_fraction}
                  warningFrac={focusedSite.thresholds.warning_fraction}
                  title="Water Level — 24h"
                />
                <RainfallChart data={series.data} title="Rainfall — 24h" />
              </>
            ) : (
              <div className="lg:col-span-2">
                <LoadingState label="Loading charts…" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
