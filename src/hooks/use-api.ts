import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { POLL_INTERVAL } from "@/lib/config";
import { useRealtime } from "./use-realtime";

// When the live WebSocket is down, fall back to polling; otherwise rely on
// WS-driven invalidation (with a slow safety-net refetch).
function useLivePoll(fast = false) {
  const { live } = useRealtime();
  if (live) return fast ? 30000 : false;
  return POLL_INTERVAL;
}

export function useOverview() {
  const refetchInterval = useLivePoll(true);
  return useQuery({
    queryKey: ["overview"],
    queryFn: api.overview,
    refetchInterval,
  });
}

export function useSites() {
  return useQuery({ queryKey: ["sites"], queryFn: api.sites, staleTime: 60000 });
}

export function useSite(siteId?: string) {
  return useQuery({
    queryKey: ["site", siteId],
    queryFn: () => api.site(siteId!),
    enabled: !!siteId,
  });
}

export function useStations(siteId?: string) {
  const refetchInterval = useLivePoll(true);
  return useQuery({
    queryKey: ["stations", siteId ?? "all"],
    queryFn: () => api.stations(siteId),
    refetchInterval,
  });
}

export function useLatest(params: { station_id?: string; site_id?: string } = {}) {
  const refetchInterval = useLivePoll(true);
  return useQuery({
    queryKey: ["latest", params],
    queryFn: () => api.latest(params),
    refetchInterval,
  });
}

export function useTimeseries(params: {
  station_id?: string;
  site_id?: string;
  hours?: number;
  points?: number;
}) {
  const refetchInterval = useLivePoll(true);
  return useQuery({
    queryKey: ["timeseries", params],
    queryFn: () => api.timeseries(params),
    enabled: !!(params.station_id || params.site_id),
    refetchInterval,
  });
}

export function useReadings(params: {
  station_id?: string;
  site_id?: string;
  hours?: number;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["readings", params],
    queryFn: () => api.readings(params),
  });
}

export function useAlerts(
  params: { site_id?: string; level?: string; acknowledged?: boolean; limit?: number } = {},
) {
  const refetchInterval = useLivePoll();
  return useQuery({
    queryKey: ["alerts", params],
    queryFn: () => api.alerts(params),
    refetchInterval,
  });
}

export function useAckAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, by }: { alertId: string; by?: string }) =>
      api.ackAlert(alertId, by),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

export function useSiteAnalytics(siteId?: string, hours = 72) {
  return useQuery({
    queryKey: ["analytics", siteId, hours],
    queryFn: () => api.siteAnalytics(siteId!, hours),
    enabled: !!siteId,
  });
}

export function useAnalyticsSummary(hours = 72) {
  return useQuery({
    queryKey: ["analytics-summary", hours],
    queryFn: () => api.analyticsSummary(hours),
  });
}

export function useSubscribers(siteId?: string) {
  return useQuery({
    queryKey: ["subscribers", siteId ?? "all"],
    queryFn: () => api.subscribers(siteId),
  });
}

export function useAddSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addSubscriber,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscribers"] }),
  });
}

export function useDeleteSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSubscriber,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscribers"] }),
  });
}

export function useUpdateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ siteId, body }: { siteId: string; body: Record<string, unknown> }) =>
      api.updateSite(siteId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      qc.invalidateQueries({ queryKey: ["site"] });
    },
  });
}

