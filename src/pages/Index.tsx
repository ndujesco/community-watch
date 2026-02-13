import { Activity, Droplets, Waves, Wind, Gauge, Thermometer } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { AlertBanner } from "@/components/AlertBanner";
import { WaterLevelChart } from "@/components/WaterLevelChart";
import { RainfallChart } from "@/components/RainfallChart";
import { StationGrid } from "@/components/StationGrid";
import { AlertFeed } from "@/components/AlertFeed";
import {
  currentReading,
  weatherData,
  stations,
  recentAlerts,
  getAlertLevel,
  THRESHOLDS,
} from "@/lib/mock-data";

const Index = () => {
  const waterAlert = getAlertLevel(currentReading.waterLevel, THRESHOLDS.waterLevel);
  const rainAlert = getAlertLevel(currentReading.rainfall, THRESHOLDS.rainfall);
  const windAlert = getAlertLevel(currentReading.windSpeed, THRESHOLDS.windSpeed);

  // Overall alert is the worst of all
  const overallAlert =
    [waterAlert, rainAlert, windAlert].includes("danger")
      ? "danger"
      : [waterAlert, rainAlert, windAlert].includes("warning")
        ? "warning"
        : "safe";

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 sm:h-10 sm:w-10">
            <Activity className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-foreground sm:text-xl">FloodWatch Community Monitor</h1>
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              Real-time IoT weather & flood early-warning system
            </p>
          </div>
          <div className="w-full text-left sm:ml-auto sm:w-auto sm:text-right">
            <p className="text-mono text-[10px] text-muted-foreground sm:text-xs">
              {new Date().toLocaleDateString()} · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-[10px] text-muted-foreground sm:text-xs">{stations.filter((s) => s.status === "online").length}/{stations.length} stations online</p>
          </div>
        </header>

        {/* Alert Banner */}
        <div className="mb-4 sm:mb-6">
          <AlertBanner level={overallAlert} />
        </div>

        {/* Metrics Grid */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            label="Water Level"
            value={currentReading.waterLevel.toFixed(1)}
            unit="m"
            icon={Waves}
            alertLevel={waterAlert}
            subtitle="Main River Gauge"
          />
          <MetricCard
            label="Rainfall"
            value={currentReading.rainfall.toFixed(0)}
            unit="mm/h"
            icon={Droplets}
            alertLevel={rainAlert}
          />
          <MetricCard
            label="Wind Speed"
            value={currentReading.windSpeed.toFixed(0)}
            unit="km/h"
            icon={Wind}
            alertLevel={windAlert}
          />
          <MetricCard
            label="Temperature"
            value={currentReading.temperature.toFixed(1)}
            unit="°C"
            icon={Thermometer}
          />
          <MetricCard
            label="Humidity"
            value={currentReading.humidity.toFixed(0)}
            unit="%"
            icon={Droplets}
          />
          <MetricCard
            label="Pressure"
            value={currentReading.pressure.toFixed(0)}
            unit="hPa"
            icon={Gauge}
          />
        </div>

        {/* Charts */}
        <div className="mb-4 grid gap-4 sm:mb-6 sm:gap-6 lg:grid-cols-2">
          <WaterLevelChart data={weatherData} />
          <RainfallChart data={weatherData} />
        </div>

        {/* Stations & Alerts */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <StationGrid stations={stations} />
          <AlertFeed alerts={recentAlerts} />
        </div>
      </div>
    </div>
  );
};

export default Index;
