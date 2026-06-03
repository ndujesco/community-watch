import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Waves,
  Droplets,
  Timer,
  Thermometer,
  Gauge,
  BatteryMedium,
  SignalHigh,
  Cpu,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { RiskBadge } from "@/components/RiskBadge";
import { WaterLevelChart } from "@/components/charts/WaterLevelChart";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { DhdtChart } from "@/components/charts/DhdtChart";
import { LoadingState, ErrorState } from "@/components/states";
import { cn } from "@/lib/utils";
import { batteryTone, fmtNum, fmtRelative, fmtTFlood, rssiQuality } from "@/lib/format";
import { useSite, useStation, useTimeseries } from "@/hooks/use-api";

const SENSOR_LABELS: Record<string, string> = {
  rain_gauge: "Tipping-bucket rain gauge",
  ultrasonic: "Ultrasonic water-level (JSN-SR04T)",
  bmp280: "BMP280 pressure / temp",
  float_switch: "Float switch (redundant)",
};

export default function StationDetail() {
  const { stationId } = useParams();
  const station = useStation(stationId);
  const site = useSite(station.data?.site_id);
  const series = useTimeseries({ station_id: stationId, hours: 24, points: 96 });

  if (station.isLoading) return <LoadingState label="Loading station…" />;
  if (station.error) return <ErrorState error={station.error} />;
  const s = station.data!;
  const r = s.latest;
  const rssi = rssiQuality(s.rssi);

  return (
    <div>
      <Link
        to="/stations"
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All stations
      </Link>
      <PageHeader
        title={s.name}
        description={`${s.location} · ${s.station_id} · firmware ${s.firmware}`}
        actions={r && <RiskBadge level={r.classification} pulse />}
      />

      {/* Telemetry strip */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Battery</p>
          <p className={cn("text-mono mt-1 flex items-center gap-2 text-xl font-bold", batteryTone(s.battery))}>
            <BatteryMedium className="h-5 w-5" /> {fmtNum(s.battery, 0)}%
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Solar {fmtNum(s.solar_voltage, 1)} V</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">RF Link (433 MHz)</p>
          <p className={cn("text-mono mt-1 flex items-center gap-2 text-xl font-bold", rssi.tone)}>
            <SignalHigh className="h-5 w-5" /> {fmtNum(s.rssi, 0)} dBm
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{rssi.label} signal</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Last Seen</p>
          <p className="text-mono mt-1 flex items-center gap-2 text-xl font-bold text-foreground">
            <Cpu className="h-5 w-5" /> {fmtRelative(s.last_seen)}
          </p>
          <p className="mt-1 text-[11px] capitalize text-muted-foreground">{s.status}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sensors</p>
          <div className="mt-2 space-y-1">
            {Object.entries(s.sensors).map(([k, ok]) => (
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
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <MetricCard label="Water Level" value={fmtNum(r.water_level, 2)} unit="m" icon={Waves} level={r.classification} subtitle={`${fmtNum(r.capacity_pct, 0)}% capacity`} />
            <MetricCard label="Time to Flood" value={fmtTFlood(r.tflood)} icon={Timer} level={r.classification} />
            <MetricCard label="Rainfall" value={fmtNum(r.rainfall_rate, 0)} unit="mm/h" icon={Droplets} />
            <MetricCard label="Temperature" value={fmtNum(r.temperature, 1)} unit="°C" icon={Thermometer} />
            <MetricCard label="Pressure" value={fmtNum(r.pressure, 0)} unit="hPa" icon={Gauge} />
            <MetricCard label="Humidity" value={fmtNum(r.humidity, 0)} unit="%" icon={Droplets} />
          </div>

          {series.data && site.data && (
            <div className="grid gap-6 lg:grid-cols-2">
              <WaterLevelChart
                data={series.data}
                hmax={site.data.channel_depth}
                watchFrac={site.data.thresholds.watch_fraction}
                warningFrac={site.data.thresholds.warning_fraction}
                title="Water Level — 24h"
              />
              <RainfallChart data={series.data} title="Rainfall — 24h" />
              <div className="lg:col-span-2">
                <DhdtChart data={series.data} />
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This station has no recent readings (it may be under maintenance).
        </p>
      )}
    </div>
  );
}
