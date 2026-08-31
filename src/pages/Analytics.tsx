import { useEffect, useState } from "react";
import { Waves, CloudRain, TrendingUp, Sigma, Ruler, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { RainResponseScatter } from "@/components/charts/RainResponseScatter";
import { ClassificationDonut } from "@/components/charts/ClassificationDonut";
import { LoadingState, ErrorState } from "@/components/states";
import { fmtNum } from "@/lib/format";
import { useSiteAnalytics, useSites } from "@/hooks/use-api";

export default function Analytics() {
  const sites = useSites();
  const [site, setSite] = useState<string>();
  useEffect(() => {
    if (!site && sites.data?.length) setSite(sites.data[0].site_id);
  }, [sites.data, site]);

  const analytics = useSiteAnalytics(site, 96);

  return (
    <div>
      <PageHeader
        title="Site Analytics"
        description="Because the rain gauge and water-level sensor are co-located, the system directly observes how rainfall translates into water-level rise. The fitted coefficient α captures the site's drainage behaviour."
      />

      {analytics.isLoading && <LoadingState label="Computing site analytics…" />}
      {analytics.error && <ErrorState error={analytics.error} />}

      {analytics.data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Peak Water Level" value={fmtNum(analytics.data.summary.peak_water_level, 2)} unit="m" icon={Waves} />
            <MetricCard label="Channel Depth" value={fmtNum(analytics.data.summary.channel_depth, 2)} unit="m" icon={Ruler} />
            <MetricCard label="Peak Rainfall" value={fmtNum(analytics.data.summary.peak_rainfall, 0)} unit="mm/h" icon={CloudRain} />
            <MetricCard label="Max dH/dt" value={fmtNum((analytics.data.summary.max_dhdt) * 1000, 1)} unit="mm/m" icon={TrendingUp} />
            <MetricCard label="Fitted α" value={fmtNum(analytics.data.summary.empirical_alpha, 4)} icon={Sigma} subtitle="rainfall→level" />
            <MetricCard label="Drainage" value={cap(analytics.data.summary.drainage_quality)} icon={Activity} subtitle={`${analytics.data.summary.samples} samples`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RainResponseScatter
              points={analytics.data.scatter}
              alpha={analytics.data.summary.empirical_alpha}
            />
            <ClassificationDonut distribution={analytics.data.distribution} />
          </div>
        </div>
      )}
    </div>
  );
}

function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : "—";
}
