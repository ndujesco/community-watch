// Types mirroring the FloodWatch API JSON shapes.

export type Classification = "safe" | "watch" | "warning" | "emergency";
export type StationStatus = "online" | "offline" | "maintenance";

export interface SiteThresholds {
  watch_fraction: number;
  warning_fraction: number;
  tflood_minutes: number;
  critical_rainfall: number;
  dhdt_negligible: number;
  dhdt_moderate: number;
}

export interface Site {
  id: string;
  site_id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  channel_depth: number;
  channel_width?: number;
  channel_type: string;
  catchment_area?: number;
  drainage_quality: string;
  alpha: number;
  baseline_drainage: number;
  thresholds: SiteThresholds;
}

export interface Reading {
  id?: string;
  station_id: string;
  site_id: string;
  ts: string;
  water_level: number;
  distance: number;
  rainfall_rate: number;
  cumulative_rain: number;
  temperature: number;
  humidity: number;
  dhdt: number;
  tflood: number | null;
  capacity_pct: number;
  classification: Classification;
  float_triggered: boolean;
  crc_valid: boolean;
  rssi: number;
}

export interface SensorHealth {
  rain_gauge: boolean;
  ultrasonic: boolean;
  climate: boolean;
  float_switch: boolean;
}

export interface Station {
  id: string;
  station_id: string;
  name: string;
  site_id: string;
  location: string;
  lat: number;
  lng: number;
  status: StationStatus;
  rssi: number;
  firmware: string;
  sensors: SensorHealth;
  installed_at?: string;
  last_seen?: string;
  latest?: Reading | null;
}

export interface CAPInfo {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msg_type: string;
  scope: string;
  category: string;
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  area_desc: string;
  instruction: string;
}

export interface Alert {
  id: string;
  alert_id: string;
  ts: string;
  station_id: string;
  site_id: string;
  site_name: string;
  area: string;
  level: Classification;
  previous_level: Classification | null;
  message: string;
  tflood: number | null;
  water_level: number;
  rainfall_rate: number;
  capacity_pct: number;
  cap: CAPInfo;
  channels: string[];
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

export interface SiteState {
  site_id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  classification: Classification;
  water_level: number;
  capacity_pct: number;
  tflood: number | null;
  rainfall_rate: number;
  dhdt: number;
  ts: string;
}

export interface Overview {
  now: string;
  overall_classification: Classification;
  total_sites: number;
  total_stations: number;
  online_stations: number;
  active_alerts: number;
  ws_clients: number;
  sites: SiteState[];
}

export interface SiteAnalytics {
  site: Site;
  scatter: { rainfall_rate: number; dhdt: number; ts: string }[];
  distribution: Record<Classification, number>;
  summary: {
    samples: number;
    peak_water_level: number;
    mean_water_level: number;
    peak_rainfall: number;
    max_dhdt: number;
    channel_depth: number;
    stored_alpha: number | null;
    empirical_alpha: number | null;
    drainage_quality: string;
    baseline_drainage: number;
  };
}

export interface SummaryRow {
  site_id: string;
  name: string;
  area: string;
  drainage_quality: string;
  channel_depth: number;
  alpha: number | null;
  empirical_alpha: number | null;
  peak_water_level: number;
  peak_rainfall: number;
  samples: number;
}

export interface Subscriber {
  id: string;
  subscriber_id: string;
  name: string;
  email: string;
  phone?: string | null;
  site_id: string | null;
  min_level: Classification;
  active: boolean;
  created_at: string;
}

export type WSMessage =
  | { type: "connected"; data: { clients: number } }
  | { type: "reading"; data: Reading }
  | { type: "alert"; data: Alert }
  | { type: "alert_ack"; data: Alert }
  | { type: "heartbeat" }
  | { type: "pong" };
