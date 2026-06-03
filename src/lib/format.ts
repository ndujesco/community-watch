export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtRelative(iso?: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 0) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function fmtTFlood(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes <= 0) return "now";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function fmtNum(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return "—";
  return n.toFixed(digits);
}

export function batteryTone(pct: number): string {
  if (pct >= 50) return "text-safe";
  if (pct >= 20) return "text-watch";
  return "text-emergency";
}

export function rssiQuality(rssi: number): { label: string; tone: string } {
  if (rssi >= -70) return { label: "Strong", tone: "text-safe" };
  if (rssi >= -85) return { label: "Fair", tone: "text-watch" };
  return { label: "Weak", tone: "text-emergency" };
}
