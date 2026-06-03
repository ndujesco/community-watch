// Runtime configuration. Override via Vite env vars at build/deploy time:
//   VITE_API_URL  e.g. https://floodwatch-api.onrender.com
//   VITE_WS_URL   e.g. wss://floodwatch-api.onrender.com/ws  (derived if unset)

const rawApi = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export const API_BASE = rawApi || "http://localhost:8000";

export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  API_BASE.replace(/^http/, "ws") + "/ws";

// Polling fallback cadence (ms) used when the WebSocket is unavailable.
export const POLL_INTERVAL = 8000;
