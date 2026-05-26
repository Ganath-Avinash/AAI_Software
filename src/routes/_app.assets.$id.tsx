import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { subscribe } from "@/lib/mock-data";
import { useState, useEffect, useReducer } from "react";
import { HardDrive, Network as NetIcon, AppWindow, History, User as UserIcon, Calendar, MapPin, Hash, Edit, Undo2, Store } from "lucide-react";
import { AssetFormDialog } from "@/components/asset-form-dialog";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAsset, fetchUsers, updateAsset } from "@/lib/api";

export const Route = createFileRoute("/_app/assets/$id")({
  component: AssetDetail,
  notFoundComponent: () => <div className="p-8">Asset not found.</div>,
});

type Tab = "overview" | "network" | "software" | "history";

function AssetDetail() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const params = Route.useParams();
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => { const off = subscribe(force); return () => { off(); }; }, []);
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);

  const { data: asset, isLoading: assetLoading } = useQuery({ queryKey: ['asset', params.id], queryFn: () => fetchAsset(params.id) });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateAsset(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset', params.id] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      setEditOpen(false);
    },
    onError: (err: any) => {
      alert("Failed to update asset: " + err.message);
    }
  });

  if (assetLoading) return <div className="p-8">Loading asset details...</div>;
  if (!asset || asset.error) return <div className="p-8">Asset not found.</div>;

  const user = asset.assignedTo ? users.find((u: any) => u.id === asset.assignedTo) : null;


  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Assets", to: "/assets" }, { label: asset.id }]} />
      <AssetFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Asset"
        initial={asset}
        onSubmit={(data) => {
          updateMutation.mutate(data);
        }}
      />


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
          {role === "admin" && (
            <>
              <button onClick={() => setEditOpen(true)} className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2"><Edit className="size-4" /> Edit</button>
              {asset.assignedTo && <Link to="/withdrawals" className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2"><Undo2 className="size-4" /> Withdraw</Link>}
            </>
          )}
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
            
            <button onClick={() => setTab("history")} className="mt-4 w-full h-8 px-3 rounded-md border border-dashed bg-transparent text-xs font-medium hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
              <History className="size-3.5" /> View Previous Owners
            </button>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-3 text-sm">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Asset Info</h3>
            <Row icon={Hash} label="Serial Number" value={asset.serial} />
            <Row icon={UserIcon} label="Make" value={asset.make} />
            {!["Tab", "Keyboard", "Mouse", "Printer", "Scanner", "IT ACCESS.", "HDD"].includes(asset.type) && <Row icon={MapPin} label="Location" value={asset.location} />}
            {!["TV", "Server", "Tab", "Keyboard", "Mouse", "Camera", "Printer", "Scanner", "IT ACCESS.", "HDD"].includes(asset.type) && <Row icon={Calendar} label="Purchase Date" value={asset.purchaseDate} />}
            
            {!["Tab", "IT ACCESS."].includes(asset.type) && (
              <>
                <Row icon={Calendar} label="Install Date" value={asset.installDate} />
                {asset.supplyOrderNo && <Row icon={Hash} label="Supply Order No." value={asset.supplyOrderNo} />}
                {asset.warrantyType && <Row icon={MapPin} label="Warranty Type" value={asset.warrantyType} />}
                <Row icon={Calendar} label="Warranty Until" value={asset.warrantyUntil} />
                {asset.vendor && <Row icon={Store} label="Supplier" value={asset.vendor} />}
              </>
            )}
            {asset.remarks && asset.type !== "IT ACCESS." && <Row icon={Hash} label="Remarks" value={asset.remarks} />}
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
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {asset.specs && Object.entries(asset.specs as Record<string,string>)
                    .filter(([k]) => !k.startsWith("Keyboard") && !k.startsWith("Mouse"))
                    .map(([k, v]) => (
                    <div key={k} className="p-3 rounded-md bg-muted/40">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm font-medium mt-0.5">{v}</div>
                    </div>
                  ))}
                  {asset.customFields && Object.entries(asset.customFields as Record<string,string>)
                    .map(([k, v]) => (
                    <div key={k} className="p-3 rounded-md bg-muted/40 border-l-2 border-primary">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"><span>{k}</span> <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">Custom</span></div>
                      <div className="text-sm font-medium mt-0.5">{v}</div>
                    </div>
                  ))}
                  {!asset.specs && !asset.customFields && <Empty text="No detailed specs available." />}
                </div>

                {asset.specs && (asset.specs.KeyboardID || asset.specs.KeyboardMake || asset.specs.KeyboardSerial || asset.specs.KeyboardModel) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keyboard</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border rounded-lg bg-card">
                      <div><div className="text-xs text-muted-foreground mb-1">ID</div><div className="text-sm font-medium truncate">{asset.specs.KeyboardID || "-"}</div></div>
                      <div><div className="text-xs text-muted-foreground mb-1">Serial</div><div className="text-sm font-medium truncate">{asset.specs.KeyboardSerial || "-"}</div></div>
                      <div><div className="text-xs text-muted-foreground mb-1">Make</div><div className="text-sm font-medium truncate">{asset.specs.KeyboardMake || "-"}</div></div>
                      <div><div className="text-xs text-muted-foreground mb-1">Model</div><div className="text-sm font-medium truncate">{asset.specs.KeyboardModel || "-"}</div></div>
                    </div>
                  </div>
                )}
                
                {asset.specs && (asset.specs.MouseID || asset.specs.MouseMake || asset.specs.MouseSerial || asset.specs.MouseModel) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mouse</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border rounded-lg bg-card">
                      <div><div className="text-xs text-muted-foreground mb-1">ID</div><div className="text-sm font-medium truncate">{asset.specs.MouseID || "-"}</div></div>
                      <div><div className="text-xs text-muted-foreground mb-1">Serial</div><div className="text-sm font-medium truncate">{asset.specs.MouseSerial || "-"}</div></div>
                      <div><div className="text-xs text-muted-foreground mb-1">Make</div><div className="text-sm font-medium truncate">{asset.specs.MouseMake || "-"}</div></div>
                      <div><div className="text-xs text-muted-foreground mb-1">Model</div><div className="text-sm font-medium truncate">{asset.specs.MouseModel || "-"}</div></div>
                    </div>
                  </div>
                )}
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
                {(asset.history || []).map((h: any, i: number) => {
                  const isReturned = h.action?.toLowerCase().includes("returned");
                  const isAssigned = h.action?.toLowerCase().includes("assigned");
                  const color = isReturned ? "bg-warning" : isAssigned ? "bg-info" : "bg-primary";
                  
                  return (
                    <li key={i} className="ml-6 group">
                      <span className={`absolute -left-1.5 size-3 rounded-full ${color} border-2 border-card mt-1.5`} />
                      <div className="text-xs text-muted-foreground flex gap-2"><span>{h.date}</span> <span className="opacity-50">·</span> <span>by {h.by}</span></div>
                      <div className="text-sm font-medium mt-0.5">{h.action}</div>
                      
                      {h.by_user && (
                        <div className="mt-2 p-2 rounded-md bg-muted/40 text-xs border border-transparent group-hover:border-border transition-colors flex items-center gap-2 w-fit pr-4">
                           <UserIcon className="size-3 text-muted-foreground" /> {h.by_user}
                        </div>
                      )}
                    </li>
                  )
                })}
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
