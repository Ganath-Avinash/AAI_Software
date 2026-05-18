import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { assets } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const byType = new Map<string, number>();
  for (const a of assets) byType.set(a.type, (byType.get(a.type) ?? 0) + 1);
  const typeData = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);
  const maxType = Math.max(...typeData.map(d => d[1]));

  const byLoc = new Map<string, number>();
  for (const a of assets) byLoc.set(a.location, (byLoc.get(a.location) ?? 0) + 1);
  const locData = Array.from(byLoc.entries());
  const maxLoc = Math.max(...locData.map(d => d[1]));

  const statusCounts = {
    Assigned: assets.filter(a => a.status === "Assigned").length,
    Available: assets.filter(a => a.status === "Available").length,
    Maintenance: assets.filter(a => a.status === "Maintenance").length,
  };
  const totalS = statusCounts.Assigned + statusCounts.Available + statusCounts.Maintenance;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Reports" }]} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Asset distribution, lifecycle, and operational metrics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-5">
          <h3 className="font-semibold">Hardware distribution by type</h3>
          <p className="text-xs text-muted-foreground mb-4">{assets.length} total assets</p>
          <div className="space-y-2.5">
            {typeData.map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium">{type}</span><span className="text-muted-foreground tabular-nums">{count}</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / maxType) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5">
          <h3 className="font-semibold">Asset status overview</h3>
          <p className="text-xs text-muted-foreground mb-4">Current lifecycle distribution</p>
          <div className="flex items-center gap-6">
            <div className="relative size-40">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                {(() => {
                  let offset = 0;
                  const segs = [
                    { val: statusCounts.Assigned, color: "var(--color-info)" },
                    { val: statusCounts.Available, color: "var(--color-success)" },
                    { val: statusCounts.Maintenance, color: "var(--color-warning)" },
                  ];
                  return segs.map((s, i) => {
                    const pct = (s.val / totalS) * 100;
                    const dash = `${pct} ${100 - pct}`;
                    const node = <circle key={i} r="15.91549" cx="50" cy="50" fill="transparent" stroke={s.color} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={-offset} />;
                    offset += pct;
                    return node;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center"><div className="text-2xl font-bold">{totalS}</div><div className="text-xs text-muted-foreground">Total</div></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Legend color="var(--color-info)" label="Assigned" value={statusCounts.Assigned} />
              <Legend color="var(--color-success)" label="Available" value={statusCounts.Available} />
              <Legend color="var(--color-warning)" label="Maintenance" value={statusCounts.Maintenance} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5 lg:col-span-2">
          <h3 className="font-semibold">Assets by location</h3>
          <p className="text-xs text-muted-foreground mb-4">AAI sites across India</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {locData.map(([loc, count]) => (
              <div key={loc}>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium truncate">{loc}</span><span className="text-muted-foreground tabular-nums">{count}</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-sidebar rounded-full" style={{ width: `${(count / maxLoc) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-3 rounded-sm" style={{ background: color }} />
      <span className="w-24">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
