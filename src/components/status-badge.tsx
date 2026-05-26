import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const map: Record<string, string> = {
    Assigned: "bg-info/10 text-info border-info/20",
    Available: "bg-success/10 text-success border-success/20",
    Expired: "bg-destructive/10 text-destructive border-destructive/20",
    Active: "bg-success/10 text-success border-success/20",
    Inactive: "bg-muted text-muted-foreground border-border",
    Maintenance: "bg-warning/15 text-warning-foreground border-warning/30",
    Online: "bg-success/10 text-success border-success/20",
    Offline: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      map[status] || "bg-muted text-muted-foreground border-border",
      className
    )}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
