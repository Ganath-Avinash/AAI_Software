import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { fetchAssets } from "@/lib/api";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: assets = [], isLoading } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets });

  const byType = new Map<string, number>();
  for (const a of assets) byType.set(a.type, (byType.get(a.type) ?? 0) + 1);
  const typeData = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);
  const maxType = typeData.length ? Math.max(...typeData.map(d => d[1])) : 1;

  const byLoc = new Map<string, number>();
  for (const a of assets) byLoc.set(a.location, (byLoc.get(a.location) ?? 0) + 1);
  const locData = Array.from(byLoc.entries());
  const maxLoc = locData.length ? Math.max(...locData.map(d => d[1])) : 1;

  const statusCounts = {
    Assigned: assets.filter((a: any) => a.status === "Assigned").length,
    Available: assets.filter((a: any) => a.status === "Available").length,
    Maintenance: assets.filter((a: any) => a.status === "Maintenance").length,
  };
  const totalS = statusCounts.Assigned + statusCounts.Available + statusCounts.Maintenance;

  if (isLoading) {
    return <div className="p-6">Loading reports...</div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Reports" }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-base text-muted-foreground mt-1">Asset distribution, lifecycle, and operational metrics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold tracking-tight">Hardware distribution by type</h3>
          <p className="text-sm text-muted-foreground mb-6">{assets.length} total assets recorded</p>
          <div className="space-y-4">
            {typeData.map(([type, count]) => (
              <div key={type} className="group">
                <div className="flex justify-between text-sm mb-1.5"><span className="font-medium text-foreground">{type}</span><span className="text-muted-foreground tabular-nums">{count}</span></div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all group-hover:bg-primary/80" style={{ width: `${(count / maxType) * 100}%` }} />
                </div>
              </div>
            ))}
            {typeData.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No assets found.</div>}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <h3 className="text-lg font-semibold tracking-tight">Asset status overview</h3>
          <p className="text-sm text-muted-foreground mb-6">Current lifecycle distribution</p>
          
          <div className="flex flex-col items-center justify-center gap-6 flex-1 pb-4 mt-2">
            {/* The Donut Chart */}
            <div className="relative size-44 md:size-48">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                {(() => {
                  if (totalS === 0) {
                    return <circle r="15.91549" cx="50" cy="50" fill="transparent" stroke="var(--color-muted)" strokeWidth="18" />;
                  }
                  let offset = 0;
                  const segs = [
                    { val: statusCounts.Assigned, color: "var(--color-info)" },
                    { val: statusCounts.Available, color: "var(--color-success)" },
                    { val: statusCounts.Maintenance, color: "var(--color-warning)" },
                  ];
                  return segs.map((s, i) => {
                    if (s.val === 0) return null;
                    const pct = (s.val / totalS) * 100;
                    const dash = `${pct} ${100 - pct}`;
                    const node = (
                      <circle
                        key={i}
                        r="15.91549"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        stroke={s.color}
                        strokeWidth="18"
                        strokeDasharray={dash}
                        strokeDashoffset={-offset}
                        className="transition-all duration-300 ease-in-out hover:opacity-85 cursor-pointer"
                      />
                    );
                    offset += pct;
                    return node;
                  });
                })()}
              </svg>
            </div>
            
            {/* Legend grid listed below */}
            <div className="w-full max-w-sm space-y-3">
              {/* Total Row Card */}
              <div className="flex justify-between items-center px-4 py-2.5 bg-secondary/30 rounded-lg border font-medium">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-foreground/40" />
                  Total Inventory
                </span>
                <span className="text-lg font-bold tabular-nums text-foreground">{totalS}</span>
              </div>
              
              {/* Status breakdown grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-card border rounded-lg p-3 flex flex-col items-center justify-between shadow-sm">
                  <span className="size-2.5 rounded-full mb-1.5" style={{ backgroundColor: "var(--color-info)" }} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Assigned</span>
                  <span className="text-base font-bold tabular-nums mt-1 text-foreground">{statusCounts.Assigned}</span>
                </div>
                <div className="bg-card border rounded-lg p-3 flex flex-col items-center justify-between shadow-sm">
                  <span className="size-2.5 rounded-full mb-1.5" style={{ backgroundColor: "var(--color-success)" }} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Available</span>
                  <span className="text-base font-bold tabular-nums mt-1 text-foreground">{statusCounts.Available}</span>
                </div>
                <div className="bg-card border rounded-lg p-3 flex flex-col items-center justify-between shadow-sm">
                  <span className="size-2.5 rounded-full mb-1.5" style={{ backgroundColor: "var(--color-warning)" }} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Maintenance</span>
                  <span className="text-base font-bold tabular-nums mt-1 text-foreground">{statusCounts.Maintenance}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <h3 className="text-lg font-semibold tracking-tight">Assets by location</h3>
          <p className="text-sm text-muted-foreground mb-6">AAI sites across India</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-6">
            {locData.map(([loc, count]) => (
              <div key={loc} className="group">
                <div className="flex justify-between text-sm mb-1.5"><span className="font-medium truncate pr-4 text-foreground">{loc || 'Unassigned'}</span><span className="text-muted-foreground tabular-nums">{count}</span></div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-sidebar rounded-full transition-all group-hover:bg-sidebar/80" style={{ width: `${(count / maxLoc) * 100}%` }} />
                </div>
              </div>
            ))}
            {locData.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center col-span-full">No locations found.</div>}
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
