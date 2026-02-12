// Simulated weather/flood monitoring data for the community dashboard

export type AlertLevel = "safe" | "warning" | "danger";

export interface SensorStation {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  battery: number;
  lastReading: string;
}

export interface WeatherReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  waterLevel: number;
  windSpeed: number;
  pressure: number;
}

export interface AlertEntry {
  id: string;
  timestamp: string;
  level: AlertLevel;
  station: string;
  message: string;
}

export const THRESHOLDS = {
  waterLevel: { warning: 2.5, danger: 3.8 },
  rainfall: { warning: 30, danger: 60 },
  windSpeed: { warning: 45, danger: 70 },
};

export function getAlertLevel(value: number, thresholds: { warning: number; danger: number }): AlertLevel {
  if (value >= thresholds.danger) return "danger";
  if (value >= thresholds.warning) return "warning";
  return "safe";
}

// Generate time-series data for last 24 hours
function generateTimeSeries(): WeatherReading[] {
  const data: WeatherReading[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const hour = t.getHours();
    const isStormWindow = hour >= 14 && hour <= 18;
    data.push({
      timestamp: t.toISOString(),
      temperature: 27 + Math.sin(hour / 4) * 4 + (Math.random() - 0.5) * 2,
      humidity: 70 + (isStormWindow ? 15 : 0) + (Math.random() - 0.5) * 10,
      rainfall: isStormWindow ? 15 + Math.random() * 35 : Math.random() * 5,
      waterLevel: 1.2 + (isStormWindow ? 1.5 + Math.random() * 1.2 : Math.random() * 0.4),
      windSpeed: 12 + (isStormWindow ? 25 + Math.random() * 20 : Math.random() * 8),
      pressure: 1013 - (isStormWindow ? 8 + Math.random() * 5 : Math.random() * 3),
    });
  }
  return data;
}

export const weatherData = generateTimeSeries();

export const currentReading = weatherData[weatherData.length - 1];

export const stations: SensorStation[] = [
  { id: "S01", name: "River Gauge Alpha", location: "Main Bridge", status: "online", battery: 87, lastReading: "2m ago" },
  { id: "S02", name: "Rain Gauge Beta", location: "Market Square", status: "online", battery: 64, lastReading: "1m ago" },
  { id: "S03", name: "Drain Monitor C", location: "Elm Street Canal", status: "online", battery: 92, lastReading: "3m ago" },
  { id: "S04", name: "Weather Station D", location: "Community Center", status: "online", battery: 78, lastReading: "1m ago" },
  { id: "S05", name: "River Gauge Echo", location: "North Fork", status: "offline", battery: 12, lastReading: "4h ago" },
  { id: "S06", name: "Rain Gauge Foxtrot", location: "Hilltop School", status: "online", battery: 55, lastReading: "2m ago" },
];

export const recentAlerts: AlertEntry[] = [
  { id: "A1", timestamp: "14:32", level: "warning", station: "River Gauge Alpha", message: "Water level exceeded warning threshold (2.7m)" },
  { id: "A2", timestamp: "15:05", level: "danger", station: "Drain Monitor C", message: "Water level critical — danger threshold breached (3.9m)" },
  { id: "A3", timestamp: "15:18", level: "warning", station: "Rain Gauge Beta", message: "Heavy rainfall detected (42mm/h)" },
  { id: "A4", timestamp: "16:41", level: "warning", station: "Weather Station D", message: "Wind speed elevated (52 km/h)" },
  { id: "A5", timestamp: "17:02", level: "safe", station: "River Gauge Alpha", message: "Water level returning to normal (2.1m)" },
];
