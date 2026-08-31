import { FlaskConical } from "lucide-react";

export function DemoNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">
          Live hardware demo — one real sensor node, not a citywide network.
        </p>
        <p className="mt-0.5">
          Every reading here is real telemetry from a single ESP32 sensor node built for this
          final-year project. It only reports while it's powered on and connected to WiFi during a
          test session — so if the station shows <span className="font-medium">offline</span> or
          the last reading looks old, the device is most likely switched off right now, not a bug.
          The system itself is designed to scale to many sites (see Analytics for the underlying
          model); this deployment just runs the one physical prototype.
        </p>
      </div>
    </div>
  );
}
