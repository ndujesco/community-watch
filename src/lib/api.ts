import { API_BASE } from "./config";
import type {
  Alert,
  Overview,
  Reading,
  Site,
  SiteAnalytics,
  Station,
  Subscriber,
  SummaryRow,
} from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export const api = {
  health: () => request<{ status: string; ws_clients: number }>("/api/health"),
  overview: () => request<Overview>("/api/overview"),

  sites: () => request<Site[]>("/api/sites"),
  site: (siteId: string) => request<Site>(`/api/sites/${siteId}`),
  updateSite: (siteId: string, body: Partial<Site> & { thresholds?: unknown }) =>
    request<Site>(`/api/sites/${siteId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  stations: (siteId?: string) =>
    request<Station[]>(`/api/stations${qs({ site_id: siteId })}`),
  station: (stationId: string) =>
    request<Station>(`/api/stations/${stationId}`),
  updateStation: (
    stationId: string,
    body: Partial<Pick<Station, "name" | "site_id" | "location" | "lat" | "lng" | "status">>,
  ) =>
    request<Station>(`/api/stations/${stationId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  latest: (params: { station_id?: string; site_id?: string } = {}) =>
    request<Reading[]>(`/api/readings/latest${qs(params)}`),
  readings: (params: {
    station_id?: string;
    site_id?: string;
    hours?: number;
    from?: string;
    to?: string;
    limit?: number;
  }) => request<Reading[]>(`/api/readings${qs(params)}`),
  timeseries: (params: {
    station_id?: string;
    site_id?: string;
    hours?: number;
    points?: number;
  }) => request<Reading[]>(`/api/readings/timeseries${qs(params)}`),

  alerts: (params: {
    site_id?: string;
    level?: string;
    acknowledged?: boolean;
    limit?: number;
  } = {}) => request<Alert[]>(`/api/alerts${qs(params)}`),
  ackAlert: (alertId: string, acknowledgedBy = "operator") =>
    request<Alert>(`/api/alerts/${alertId}/ack`, {
      method: "POST",
      body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
    }),

  siteAnalytics: (siteId: string, hours = 72) =>
    request<SiteAnalytics>(`/api/analytics/site/${siteId}${qs({ hours })}`),
  analyticsSummary: (hours = 72) =>
    request<{ sites: SummaryRow[]; hours: number }>(
      `/api/analytics/summary${qs({ hours })}`,
    ),

  subscribers: (siteId?: string) =>
    request<Subscriber[]>(`/api/subscribers${qs({ site_id: siteId })}`),
  addSubscriber: (body: {
    name: string;
    phone: string;
    site_id?: string | null;
    min_level?: string;
  }) =>
    request<Subscriber>("/api/subscribers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteSubscriber: (subscriberId: string) =>
    request<void>(`/api/subscribers/${subscriberId}`, { method: "DELETE" }),
};
