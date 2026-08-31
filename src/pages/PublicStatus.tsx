import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Shield, Eye, AlertTriangle, AlertOctagon, MapPin, Waves, Clock, FlaskConical, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRelative, fmtTFlood } from "@/lib/format";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { useAddSubscriber, useOverview } from "@/hooks/use-api";
import type { Classification } from "@/lib/types";

// Plain-language presentation for each risk level — no technical terms.
const LOOK: Record<
  Classification,
  {
    icon: typeof Shield;
    headline: string;
    action: string;
    bg: string;
    fg: string;
    chip: string;
    pulse?: boolean;
  }
> = {
  safe: {
    icon: Shield,
    headline: "All Clear",
    action: "No flooding expected. Conditions are normal — carry on as usual.",
    bg: "bg-safe",
    fg: "text-safe-foreground",
    chip: "bg-black/15 text-safe-foreground",
  },
  watch: {
    icon: Eye,
    headline: "Be Alert",
    action: "Water is rising. Stay alert, keep children close, and watch for updates.",
    bg: "bg-watch",
    fg: "text-watch-foreground",
    chip: "bg-black/15 text-watch-foreground",
  },
  warning: {
    icon: AlertTriangle,
    headline: "Get Ready to Move",
    action: "Flooding is likely soon. Move valuables up, avoid the water, and prepare to leave for higher ground.",
    bg: "bg-warning",
    fg: "text-warning-foreground",
    chip: "bg-black/15 text-warning-foreground",
  },
  emergency: {
    icon: AlertOctagon,
    headline: "Move Now",
    action: "Flooding is happening. Go to higher ground immediately. Do not walk or drive through the water.",
    bg: "bg-emergency",
    fg: "text-emergency-foreground",
    chip: "bg-black/25 text-emergency-foreground",
    pulse: true,
  },
};

export default function PublicStatus() {
  const { data, isLoading } = useOverview();

  const site = data?.sites?.[0];
  const level: Classification = site?.classification ?? data?.overall_classification ?? "safe";
  const look = LOOK[level];
  const Icon = look.icon;
  const locationLabel = site?.name ?? "FloodWatch Demo Site";
  const tflood = site?.tflood ?? null;

  return (
    <div className={cn("flex min-h-screen flex-col transition-colors duration-500", look.bg)}>
      {/* Top strip */}
      <div className={cn("flex items-center justify-between px-5 py-4", look.fg)}>
        <div className="flex items-center gap-2 font-bold">
          <Waves className="h-5 w-5" />
          FloodWatch
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge />
          <Link
            to="/"
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium underline-offset-2 hover:underline",
              look.chip,
            )}
          >
            Full dashboard
          </Link>
        </div>
      </div>

      {/* Main status */}
      <div className={cn("flex flex-1 flex-col items-center justify-center px-6 text-center", look.fg)}>
        <div
          className={cn(
            "mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-black/15",
            look.pulse && "animate-pulse-glow",
          )}
        >
          <Icon className="h-16 w-16" strokeWidth={2.2} />
        </div>

        <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium opacity-90">
          <MapPin className="h-4 w-4" />
          {locationLabel}
        </p>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">{look.headline}</h1>

        <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed opacity-95 sm:text-xl">
          {look.action}
        </p>

        {(level === "warning" || level === "emergency") && tflood != null && (
          <p className={cn("mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold", look.chip)}>
            <Clock className="h-5 w-5" />
            Water may overflow in about {fmtTFlood(tflood)}
          </p>
        )}

        <p className="mt-10 inline-flex max-w-sm items-center gap-2 rounded-full bg-black/10 px-4 py-2 text-xs font-medium opacity-90">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" />
          Live hardware demo — one real sensor node, not a citywide network.
        </p>

        <SubscribeForm look={look} />
      </div>

      {/* Footer */}
      <div className={cn("px-5 py-4 text-center text-xs opacity-80", look.fg)}>
        {isLoading ? (
          "Checking conditions…"
        ) : (
          <>Updated {fmtRelative(site?.ts ?? data?.now)} · updates automatically</>
        )}
      </div>
    </div>
  );
}

function SubscribeForm({ look }: { look: (typeof LOOK)[Classification] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const add = useAddSubscriber();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Enter an email address");
      return;
    }
    add.mutate(
      { name: name || email, email, phone: phone || null, site_id: null, min_level: "warning" },
      {
        onSuccess: () => setDone(true),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Could not subscribe"),
      },
    );
  };

  if (done) {
    return (
      <p
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium",
          look.chip,
        )}
      >
        <Check className="h-3.5 w-3.5" /> Subscribed — you'll get an email
        {phone ? " and SMS" : ""} on Warning and Emergency alerts.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold underline-offset-2 hover:underline",
          look.chip,
        )}
      >
        <Mail className="h-3.5 w-3.5" /> Subscribe for email alerts
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 flex w-full max-w-xs flex-col gap-2">
      <input
        autoFocus
        type="text"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-black/20 bg-black/10 px-3 py-2 text-sm placeholder:opacity-60 focus:outline-none"
      />
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-black/20 bg-black/10 px-3 py-2 text-sm placeholder:opacity-60 focus:outline-none"
      />
      <input
        type="tel"
        placeholder="+234… (optional — also get SMS)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="rounded-lg border border-black/20 bg-black/10 px-3 py-2 text-sm placeholder:opacity-60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={add.isPending}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-semibold",
          look.chip,
        )}
      >
        {add.isPending ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
