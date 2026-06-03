import { type LucideIcon, Loader2, Inbox, AlertCircle } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-emergency/30 bg-emergency/5 py-12 text-center">
      <AlertCircle className="h-6 w-6 text-emergency" />
      <p className="text-sm font-medium text-foreground">Could not load data</p>
      <p className="max-w-md text-xs text-muted-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Is the backend running at the configured API URL?
      </p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-14 text-center">
      <Icon className="h-7 w-7 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
