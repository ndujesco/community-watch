import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./Sidebar";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { useOverview } from "@/hooks/use-api";

const TITLES: Record<string, string> = {
  "/": "Live Dashboard",
  "/stations": "Sensor Stations",
  "/alerts": "Alert Log",
  "/history": "Historical Data",
  "/analytics": "Site Analytics",
  "/settings": "Settings",
};

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-mono hidden text-xs text-muted-foreground sm:inline">
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

export function TopBar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { data: overview } = useOverview();
  const title =
    TITLES[pathname] ?? (pathname.startsWith("/stations") ? "Station Detail" : "FloodWatch");

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <h2 className="text-base font-semibold text-foreground">{title}</h2>

      <div className="ml-auto flex items-center gap-3">
        <Clock />
        {overview && (
          <span className="hidden items-center gap-1.5 md:flex">
            <span className="text-[11px] text-muted-foreground">Network:</span>
            <RiskBadge level={overview.overall_classification} size="sm" pulse />
          </span>
        )}
        <ConnectionBadge />
      </div>
    </header>
  );
}
