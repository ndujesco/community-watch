import { PageHeader } from "@/components/PageHeader";
import { StationCard } from "@/components/StationCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { useStations } from "@/hooks/use-api";
import { RadioTower } from "lucide-react";

export default function Stations() {
  const { data, isLoading, error } = useStations();

  const online = data?.filter((s) => s.status === "online").length ?? 0;
  const total = data?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Sensor Stations"
        description="Co-located rain-gauge and ultrasonic water-level nodes transmitting over the 433 MHz RF link. Each node reports water level, rainfall, battery, and link quality."
        actions={
          data && (
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="text-mono font-semibold text-safe">{online}</span>/{total} online
            </span>
          )
        }
      />
      {isLoading && <LoadingState label="Loading stations…" />}
      {error && <ErrorState error={error} />}
      {data?.length === 0 && <EmptyState icon={RadioTower} title="No stations registered" />}
      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s, i) => (
            <StationCard key={s.station_id} station={s} delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  );
}
