import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WS_URL } from "@/lib/config";
import { meta } from "@/lib/flood";
import type { Alert, Reading, WSMessage } from "@/lib/types";

export type ConnState = "connecting" | "open" | "closed";

interface RealtimeValue {
  state: ConnState;
  lastReading: Reading | null;
  lastAlert: Alert | null;
  /** true while a real WebSocket stream is delivering updates */
  live: boolean;
}

const RealtimeContext = createContext<RealtimeValue>({
  state: "connecting",
  lastReading: null,
  lastAlert: null,
  live: false,
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ConnState>("connecting");
  const [lastReading, setLastReading] = useState<Reading | null>(null);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const lastInvalidate = useRef(0);
  const closedByUs = useRef(false);

  useEffect(() => {
    closedByUs.current = false;

    // Throttle high-frequency reading invalidations so the UI stays smooth.
    const invalidateLive = () => {
      const now = Date.now();
      if (now - lastInvalidate.current < 2000) return;
      lastInvalidate.current = now;
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["latest"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      queryClient.invalidateQueries({ queryKey: ["timeseries"] });
    };

    let pingTimer: ReturnType<typeof setInterval> | undefined;

    const connect = () => {
      setState(retryRef.current === 0 ? "connecting" : "connecting");
      let ws: WebSocket;
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setState("open");
        pingTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 25000);
      };

      ws.onmessage = (event) => {
        let msg: WSMessage;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        if (msg.type === "reading") {
          setLastReading(msg.data);
          invalidateLive();
        } else if (msg.type === "alert") {
          setLastAlert(msg.data);
          queryClient.invalidateQueries({ queryKey: ["alerts"] });
          queryClient.invalidateQueries({ queryKey: ["overview"] });
          announce(msg.data);
        } else if (msg.type === "alert_ack") {
          queryClient.invalidateQueries({ queryKey: ["alerts"] });
        }
      };

      ws.onclose = () => {
        if (pingTimer) clearInterval(pingTimer);
        if (!closedByUs.current) {
          setState("closed");
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    const scheduleReconnect = () => {
      retryRef.current += 1;
      const delay = Math.min(1000 * 2 ** retryRef.current, 15000);
      setTimeout(() => {
        if (!closedByUs.current) connect();
      }, delay);
    };

    connect();

    return () => {
      closedByUs.current = true;
      if (pingTimer) clearInterval(pingTimer);
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RealtimeContext.Provider
      value={{ state, lastReading, lastAlert, live: state === "open" }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

function announce(alert: Alert) {
  const m = meta(alert.level);
  if (alert.level === "emergency") {
    toast.error(`${m.label}: ${alert.site_name}`, { description: alert.message });
  } else if (alert.level === "warning") {
    toast.warning(`${m.label}: ${alert.site_name}`, { description: alert.message });
  } else if (alert.level === "watch") {
    toast(`${m.label}: ${alert.site_name}`, { description: alert.message });
  } else {
    toast.success(`All clear: ${alert.site_name}`, { description: alert.message });
  }
}

export const useRealtime = () => useContext(RealtimeContext);
