import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { getAsset, getUser, updateAsset, subscribe } from "@/lib/mock-data";
import { useState, useEffect, useReducer } from "react";
import { HardDrive, Network as NetIcon, AppWindow, History, User as UserIcon, Calendar, MapPin, Hash, Edit, Undo2 } from "lucide-react";
import { AssetFormDialog } from "@/components/asset-form-dialog";


export const Route = createFileRoute("/_app/assets/$id")({
  loader: ({ params }) => {
    const asset = getAsset(params.id);
    if (!asset) throw notFound();
    return { asset, user: asset.assignedTo ? getUser(asset.assignedTo) : null };
  },
  component: AssetDetail,
  notFoundComponent: () => <div className="p-8">Asset not found.</div>,
});

type Tab = "overview" | "network" | "software" | "history";

function AssetDetail() {
  const { asset, user } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Assets", to: "/assets" }, { label: asset.id }]} />

      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-lg bg-primary/10 text-primary grid place-items-center"><HardDrive className="size-6" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{asset.id}</h1>
                <StatusBadge status={asset.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{asset.type} · {asset.model}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2"><Edit className="size-4" /> Edit</button>
          {asset.assignedTo && <Link to="/withdrawals" className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2"><Undo2 className="size-4" /> Withdraw</Link>}
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">Assigned to</h3>
            {user ? (
              <Link to="/users/$id" params={{ id: user.id }} className="flex items-center gap-3 group">
                <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">{user.name.split(" ").map((n: string)=>n[0]).join("").slice(0,2)}</div>
                <div>
                  <div className="font-medium group-hover:text-primary">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.department}</div>
                </div>
              </Link>
            ) : <div className="text-sm text-muted-foreground">Currently unassigned</div>}
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-3 text-sm">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Asset Info</h3>
            <Row icon={Hash} label="Serial Number" value={asset.serial} />
            <Row icon={MapPin} label="Location" value={asset.location} />
            <Row icon={Calendar} label="Purchase Date" value={asset.purchaseDate} />
            <Row icon={Calendar} label="Warranty Until" value={asset.warrantyUntil} />
            <Row icon={UserIcon} label="Make" value={asset.make} />
          </div>
        </div>

        {/* Right detail with tabs */}
        <div className="bg-card border rounded-lg">
          <div className="border-b px-4 flex gap-1">
            {([
              ["overview", "Overview", HardDrive],
              ["network", "Network", NetIcon],
              ["software", "Software", AppWindow],
              ["history", "History", History],
            ] as const).map(([k, l, Ic]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <Ic className="size-4" /> {l}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "overview" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(asset.specs as Record<string,string>).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-md bg-muted/40">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
                    <div className="text-sm font-medium mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            )}
            {tab === "network" && (
              asset.network ? (
                <div className="space-y-4">
                  <Link to="/network" className="block">
                    <div className="flex items-center justify-between p-4 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div>
                        <div className="text-xs text-muted-foreground">Hostname</div>
                        <div className="font-mono font-medium">{asset.network.hostname}</div>
                      </div>
                      <StatusBadge status={asset.network.online ? "Online" : "Offline"} />
                    </div>
                  </Link>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <NetField label="IP Address" value={asset.network.ip} />
                    <NetField label="VLAN" value={asset.network.vlan} />
                    <NetField label="Ethernet MAC" value={asset.network.macEthernet} />
                    <NetField label="WiFi MAC" value={asset.network.macWifi} />
                    <NetField label="Bluetooth MAC" value={asset.network.macBluetooth} />
                  </div>
                </div>
              ) : <Empty text="No network information available for this asset." />
            )}
            {tab === "software" && (
              asset.software ? (
                <div className="divide-y border rounded-md">
                  {(asset.software as any[]).map((s: any) => (
                    <div key={s.name} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-md bg-info/10 text-info grid place-items-center"><AppWindow className="size-4" /></div>
                        <div>
                          <div className="font-medium text-sm">{s.name}</div>
                          <div className="text-xs text-muted-foreground">v{s.version} · License {s.licenseKey}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">Expires {s.expiresOn}</div>
                    </div>
                  ))}
                </div>
              ) : <Empty text="No software registered on this asset." />
            )}
            {tab === "history" && (
              <ol className="relative border-l ml-3 space-y-6">
                {(asset.history as any[]).map((h: any, i: number) => (
                  <li key={i} className="ml-6">
                    <span className="absolute -left-1.5 size-3 rounded-full bg-primary border-2 border-card mt-1.5" />
                    <div className="text-xs text-muted-foreground">{h.date} · by {h.by}</div>
                    <div className="text-sm font-medium mt-0.5">{h.action}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Ic, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-muted-foreground"><Ic className="size-3.5" /> {label}</div>
      <div className="font-medium text-right">{value}</div>
    </div>
  );
}
function NetField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-muted/40">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="py-10 text-center text-sm text-muted-foreground">{text}</div>;
}
