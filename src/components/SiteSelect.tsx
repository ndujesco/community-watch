import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Site } from "@/lib/types";

interface SiteSelectProps {
  sites: Site[] | undefined;
  value?: string;
  onChange: (siteId: string) => void;
  includeAll?: boolean;
  className?: string;
}

export function SiteSelect({ sites, value, onChange, includeAll, className }: SiteSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? "w-[230px]"}>
        <SelectValue placeholder="Select a site" />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">All sites</SelectItem>}
        {sites?.map((s) => (
          <SelectItem key={s.site_id} value={s.site_id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
