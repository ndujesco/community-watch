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
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">FloodWatch Community Monitor</h1>
            <p className="text-xs text-muted-foreground">
              Real-time IoT weather & flood early-warning system
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-mono text-xs text-muted-foreground">
              {new Date().toLocaleDateString()} · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-xs text-muted-foreground">{stations.filter((s) => s.status === "online").length}/{stations.length} stations online</p>
          </div>
        </header>

        {/* Alert Banner */}
        <div className="mb-6">
          <AlertBanner level={overallAlert} />
        </div>

        {/* Metrics Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <WaterLevelChart data={weatherData} />
          <RainfallChart data={weatherData} />
        </div>

        {/* Stations & Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <StationGrid stations={stations} />
          <AlertFeed alerts={recentAlerts} />
        </div>
      </div>
    </div>
  );
};

export default Index;
