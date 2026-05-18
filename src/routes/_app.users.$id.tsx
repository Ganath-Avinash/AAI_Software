import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { getUser, getUserAssets } from "@/lib/mock-data";
import { Mail, MapPin, Phone, Building2, BadgeCheck, Edit, ArrowRightLeft, HardDrive } from "lucide-react";

export const Route = createFileRoute("/_app/users/$id")({
  loader: ({ params }) => {
    const user = getUser(params.id);
    if (!user) throw notFound();
    return { user, assets: getUserAssets(user.id) };
  },
  component: UserDetail,
  notFoundComponent: () => <div className="p-8">User not found.</div>,
});

function UserDetail() {
  const { user, assets } = Route.useLoaderData();
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Users", to: "/users" }, { label: user.name }]} />

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-sidebar-accent" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <div className="size-24 rounded-xl bg-card border-4 border-card shadow text-primary grid place-items-center text-2xl font-bold">
                {user.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                  <StatusBadge status={user.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{user.designation} · {user.empId}</p>
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              <button className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2"><Edit className="size-4" /> Edit</button>
              <Link to="/assignments" className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2"><ArrowRightLeft className="size-4" /> Assign asset</Link>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Building2, label: "Department", value: user.department },
              { icon: MapPin, label: "Location", value: user.location },
              { icon: Phone, label: "Intercom", value: user.intercom },
              { icon: BadgeCheck, label: "Employee Type", value: user.employeeType },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3 p-3 rounded-md bg-muted/40">
                <f.icon className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{f.label}</div>
                  <div className="text-sm font-medium">{f.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" /> {user.email}
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Assigned Assets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{assets.length} device{assets.length !== 1 && "s"} currently allocated to this employee</p>
          </div>
        </div>
        {assets.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <HardDrive className="size-10 mx-auto mb-3 opacity-40" />
            No assets assigned yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {assets.map(a => (
              <Link key={a.id} to="/assets/$id" params={{ id: a.id }}
                className="border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all group bg-card">
                <div className="flex items-start justify-between">
                  <div className="size-9 rounded-md bg-info/10 text-info grid place-items-center"><HardDrive className="size-4" /></div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-3 font-medium text-sm group-hover:text-primary">{a.id}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.type} · {a.model}</div>
                <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
                  <span>Warranty</span><span className="font-medium text-foreground">{a.warrantyUntil}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
