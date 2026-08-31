import {
  Waves,
  Droplets,
  TrendingUp,
  Timer,
  Thermometer,
  CloudRain,
  SignalHigh,
  Cpu,
  CheckCircle2,
  XCircle,
  Radio,
} from "lucide-react";
import { DemoNotice } from "@/components/DemoNotice";
import { AlertBanner } from "@/components/AlertBanner";
import { MetricCard } from "@/components/MetricCard";
import { RiskBadge } from "@/components/RiskBadge";
import { WaterLevelChart } from "@/components/charts/WaterLevelChart";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { DhdtChart } from "@/components/charts/DhdtChart";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { cn } from "@/lib/utils";
import { fmtNum, fmtRelative, fmtTFlood, rssiQuality } from "@/lib/format";
import { useSite, useStations, useTimeseries } from "@/hooks/use-api";

const SENSOR_LABELS: Record<string, string> = {
  rain_gauge: "Analog rain-intensity sensor (YL-83 / FC-37)",
  ultrasonic: "Ultrasonic water-level sensor (AJ-SR04M)",
  climate: "Climate sensor — temperature & humidity (DHT11)",
  float_switch: "Float switches (redundant high-water cutoff)",
};

export default function Dashboard() {
  const stations = useStations();
  const station = stations.data?.[0];

  // Hooks must run unconditionally (before any early return below), so these
  // are safely called with an undefined id when the device hasn't reported
  // in yet — both hooks no-op until real ids are available.
  const site = useSite(station?.site_id);
  const series = useTimeseries({ station_id: station?.station_id, hours: 24, points: 96 });

  if (stations.isLoading) return <LoadingState label="Connecting to the sensor node…" />;
  if (stations.error) return <ErrorState error={stations.error} />;

  if (!station) {
    return (
      <div className="space-y-6">
        <DemoNotice />
        <EmptyState
          icon={Radio}
          title="Waiting for the device's first reading"
          description="No sensor node has reported in yet. Once the ESP32 is powered on, connected to WiFi, and posts its first reading, it will appear here automatically — no setup needed on this end."
        />
      </div>
    );
  }

  const r = station.latest;
  const rssi = rssiQuality(station.rssi);

  return (
    <div className="space-y-6">
      <DemoNotice />

      <AlertBanner
        level={r?.classification ?? "safe"}
        detail={
          r
            ? undefined
            : "This station has registered but hasn't sent a reading recently."
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-foreground">{station.name}</h2>
        {r && <RiskBadge level={r.classification} pulse />}
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
            station.status === "online"
              ? "bg-safe/15 text-safe"
              : station.status === "maintenance"
                ? "bg-watch/15 text-watch"
                : "bg-emergency/15 text-emergency",
          )}
        >
          {station.status}
        </span>
        <span className="text-xs text-muted-foreground">{station.location}</span>
      </div>

      {/* Device telemetry strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">WiFi Signal</p>
          <p className={cn("text-mono mt-1 flex items-center gap-2 text-xl font-bold", rssi.tone)}>
            <SignalHigh className="h-5 w-5" /> {fmtNum(station.rssi, 0)} dBm
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{rssi.label} signal</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Last Seen</p>
          <p className="text-mono mt-1 flex items-center gap-2 text-xl font-bold text-foreground">
            <Cpu className="h-5 w-5" /> {fmtRelative(station.last_seen)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            device_id {station.station_id}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sensors</p>
          <div className="mt-2 space-y-1">
            {Object.entries(station.sensors).map(([k, ok]) => (
              <p key={k} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {ok ? (
                  <CheckCircle2 className="h-3 w-3 text-safe" />
                ) : (
                  <XCircle className="h-3 w-3 text-emergency" />
                )}
                {SENSOR_LABELS[k] ?? k}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Latest reading */}
      {r ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Water Level"
              value={fmtNum(r.water_level, 2)}
              unit="m"
              icon={Waves}
              level={r.classification}
              subtitle={`${fmtNum(r.capacity_pct, 0)}% of ${fmtNum(site.data?.channel_depth, 2)}m`}
            />
            <MetricCard
              label="Time to Flood"
              value={fmtTFlood(r.tflood)}
              icon={Timer}
              level={r.classification}
              subtitle="at current rate"
            />
            <MetricCard
              label="Rain Intensity"
              value={fmtNum(r.rainfall_rate, 0)}
              unit="% wet"
              icon={Droplets}
              subtitle="rain-pad wetness proxy"
            />
            <MetricCard
              label="Rate of Rise"
              value={fmtNum(r.dhdt * 1000, 1)}
              unit="mm/min"
              icon={TrendingUp}
            />
            <MetricCard
              label="Temperature"
              value={fmtNum(r.temperature, 1)}
              unit="°C"
              icon={Thermometer}
            />
            <MetricCard
              label="Humidity"
              value={fmtNum(r.humidity, 0)}
              unit="%"
              icon={Droplets}
            />
            <MetricCard
              label="Cumulative Rain (today)"
              value={fmtNum(r.cumulative_rain, 1)}
              unit="mm-equiv"
              icon={CloudRain}
            />
          </div>

          {series.data && series.data.length > 0 && site.data ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <WaterLevelChart
                data={series.data}
                hmax={site.data.channel_depth}
                watchFrac={site.data.thresholds.watch_fraction}
                warningFrac={site.data.thresholds.warning_fraction}
                title="Water Level — 24h"
              />
              <RainfallChart data={series.data} title="Rain Intensity — 24h" />
              <div className="lg:col-span-2">
                <DhdtChart data={series.data} />
              </div>
            </div>
          ) : (
            <LoadingState label="Loading charts…" />
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This station has registered but has no readings yet.
        </p>
      )}
    </div>
  );
}
