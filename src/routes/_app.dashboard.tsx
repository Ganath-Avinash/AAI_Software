import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchAssets, fetchUsers, fetchHistory } from "@/lib/api";
import {
  HardDrive, CheckCircle2, AlertTriangle, Network as NetIcon,
  Users as UsersIcon, ArrowRightLeft, Undo2, Wrench, TrendingUp, Plus
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { role } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchDashboardStats });
  const { data: assets, isLoading: assetsLoading } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets });
  const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: recentActivity, isLoading: historyLoading } = useQuery({ queryKey: ['history'], queryFn: fetchHistory });

  if (statsLoading || assetsLoading || usersLoading || historyLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  const statCards = [
    { label: "Total Assets", value: stats?.total || 0, icon: HardDrive, tone: "bg-primary/10 text-primary", trend: "Total tracked" },
    { label: "Assigned", value: stats?.assigned || 0, icon: CheckCircle2, tone: "bg-info/10 text-info", trend: `${Math.round(((stats?.assigned || 0)/(stats?.total || 1))*100)}% utilization` },
    { label: "Available", value: stats?.available || 0, icon: CheckCircle2, tone: "bg-success/10 text-success", trend: "Ready to deploy" },
    { label: "Warranty Expiring", value: stats?.warrantyExpiring || 0, icon: AlertTriangle, tone: "bg-warning/15 text-warning-foreground", trend: "Next 6 months" },
    { label: "Network Devices", value: stats?.networkDevices || 0, icon: NetIcon, tone: "bg-info/10 text-info", trend: "Network tracked" },
    { label: "Total Users", value: stats?.users || 0, icon: UsersIcon, tone: "bg-accent text-accent-foreground", trend: `${stats?.activeUsers || 0} active` },
  ];

  const recentAssignments = (assets || []).filter((a: any) => a.assignedTo).slice(0, 5);
  const displayActivity = (recentActivity || []).slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening across AAI IT infrastructure today.</p>
        </div>
        <div className="flex gap-2">
          {role === "admin" && (
            <>
              <Link to="/assignments" className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2"><ArrowRightLeft className="size-4" /> Assign asset</Link>
              <Link to="/assets" className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2"><Plus className="size-4" /> New asset</Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`size-9 rounded-md grid place-items-center ${s.tone}`}><s.icon className="size-4" /></div>
              <TrendingUp className="size-3.5 text-muted-foreground" />
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            <div className="text-[11px] text-muted-foreground/70 mt-2">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Recent Assignments</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest hardware allocations across departments</p>
            </div>
            <Link to="/assignments" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left px-4 py-2.5 font-medium">Asset</th><th className="text-left px-4 py-2.5 font-medium">Assigned To</th><th className="text-left px-4 py-2.5 font-medium">Location</th><th className="text-left px-4 py-2.5 font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y">
              {recentAssignments.map((a: any) => {
                const u = (users || []).find((x: any) => x.id === a.assignedTo);
                return (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3"><Link to="/assets/$id" params={{ id: a.id }} className="font-medium text-primary hover:underline">{a.id}</Link><div className="text-xs text-muted-foreground">{a.model}</div></td>
                    <td className="px-4 py-3">{u && <Link to="/users/$id" params={{ id: u.id }} className="hover:underline">{u.name}</Link>}<div className="text-xs text-muted-foreground">{u?.department}</div></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.location}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Activity Feed</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest system events</p>
          </div>
          <ul className="p-4 space-y-4">
            {displayActivity.map((a: any) => (
              <li key={a.id} className="flex gap-3">
                <div className="size-8 shrink-0 rounded-full bg-accent grid place-items-center">
                  {a.status === "Assigned" ? <ArrowRightLeft className="size-3.5" /> : a.status === "Returned" ? <Undo2 className="size-3.5" /> : <Wrench className="size-3.5" />}
                </div>
                <div className="text-sm">
                  <div>{a.action}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.assignedDate || a.returnedDate}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
