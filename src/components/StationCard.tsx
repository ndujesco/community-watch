import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wifi,
  WifiOff,
  Wrench,
  BatteryMedium,
  SignalHigh,
  MapPin,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { meta } from "@/lib/flood";
import { batteryTone, fmtNum, fmtRelative, rssiQuality } from "@/lib/format";
import { RiskBadge } from "./RiskBadge";
import type { Station } from "@/lib/types";

const statusConfig = {
  online: { icon: Wifi, tone: "text-safe", border: "border-safe/25 bg-safe/5", label: "Online" },
  offline: { icon: WifiOff, tone: "text-emergency", border: "border-emergency/25 bg-emergency/5", label: "Offline" },
  maintenance: { icon: Wrench, tone: "text-watch", border: "border-watch/25 bg-watch/5", label: "Maintenance" },
};

export function StationCard({ station, delay = 0 }: { station: Station; delay?: number }) {
  const sc = statusConfig[station.status] ?? statusConfig.offline;
  const StatusIcon = sc.icon;
  const rssi = rssiQuality(station.rssi);
  const latest = station.latest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn("rounded-xl border bg-card p-4", sc.border)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/stations/${station.station_id}`}
            className="truncate text-sm font-semibold text-foreground hover:text-primary"
          >
            {station.name}
          </Link>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{station.location}</span>
          </p>
        </div>
        <span className={cn("flex items-center gap-1 text-[11px] font-medium", sc.tone)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {sc.label}
        </span>
      </div>

      <p className="text-mono mt-1 text-[10px] text-muted-foreground">{station.station_id}</p>

      {latest ? (
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Water level</p>
            <p className="text-mono text-xl font-bold text-foreground">
              {fmtNum(latest.water_level, 2)}<span className="text-xs text-muted-foreground"> m</span>
            </p>
          </div>
          <RiskBadge level={latest.classification} size="sm" />
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">No recent readings</p>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <BatteryMedium className={cn("h-3.5 w-3.5", batteryTone(station.battery))} />
          <span className="text-mono">{fmtNum(station.battery, 0)}%</span>
        </span>
        <span className="flex items-center gap-1" title={`${station.rssi} dBm`}>
          <SignalHigh className={cn("h-3.5 w-3.5", rssi.tone)} />
          <span className="text-mono">{fmtNum(station.rssi, 0)}</span>
        </span>
        <span className="flex items-center gap-1" title={station.firmware}>
          <Cpu className="h-3.5 w-3.5" />
          <span className="truncate">{fmtRelative(station.last_seen)}</span>
        </span>
      </div>
    </motion.div>
  );
}
