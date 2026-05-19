import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { assets, users, addAsset, subscribe } from "@/lib/mock-data";
import { useState, useMemo, useEffect, useReducer } from "react";
import { Plus, Search, Grid3x3, List } from "lucide-react";
import { AssetFormDialog } from "@/components/asset-form-dialog";

export const Route = createFileRoute("/_app/assets/")({
  component: AssetsList,
});

function AssetsList() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const [open, setOpen] = useState(false);
  const [, force] = useReducer(x => x + 1, 0);
  useEffect(() => { const off = subscribe(force); return () => { off(); }; }, []);


  const filtered = useMemo(() => assets.filter(a => {
    const lower = q.toLowerCase();
    const matchQ = !q || a.id.toLowerCase().includes(lower) || a.model.toLowerCase().includes(lower) || a.serial.toLowerCase().includes(lower);
    const matchT = type === "all" || a.type === type;
    const matchS = status === "all" || a.status === status;
    return matchQ && matchT && matchS;
  }), [q, type, status]);

  const types = Array.from(new Set(assets.map(a => a.type)));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Assets" }]} />
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {assets.length} hardware items</p>
        </div>
        <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2"><Plus className="size-4" /> Add asset</button>
      </div>
      <AssetFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add New Asset"
        onSubmit={(data) => {
          addAsset({ ...data, assignedTo: data.assignedTo || null });
          setOpen(false);
        }}
      />


      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by asset ID, model, serial"
              className="w-full h-9 pl-9 pr-3 rounded-md border bg-background text-sm outline-none focus:border-ring" />
          </div>
          <select value={type} onChange={e => setType(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm">
            <option value="all">All types</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm">
            <option value="all">All statuses</option>
            <option>Assigned</option><option>Available</option><option>Maintenance</option>
          </select>
          <div className="flex border rounded-md overflow-hidden">
            <button onClick={() => setView("table")} className={`h-9 w-9 grid place-items-center ${view === "table" ? "bg-accent" : ""}`}><List className="size-4" /></button>
            <button onClick={() => setView("grid")} className={`h-9 w-9 grid place-items-center ${view === "grid" ? "bg-accent" : ""}`}><Grid3x3 className="size-4" /></button>
          </div>
        </div>

        {view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Asset ID</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Model</th>
                  <th className="text-left px-4 py-2.5 font-medium">Assigned To</th>
                  <th className="text-left px-4 py-2.5 font-medium">Location</th>
                  <th className="text-left px-4 py-2.5 font-medium">Warranty</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(a => {
                  const u = a.assignedTo ? users.find(x => x.id === a.assignedTo) : null;
                  return (
                    <tr key={a.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3"><Link to="/assets/$id" params={{ id: a.id }} className="font-medium text-primary hover:underline">{a.id}</Link></td>
                      <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                      <td className="px-4 py-3"><div className="text-foreground">{a.model}</div><div className="text-xs text-muted-foreground">{a.serial}</div></td>
                      <td className="px-4 py-3">{u ? <Link to="/users/$id" params={{ id: u.id }} className="hover:underline">{u.name}</Link> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.location}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{a.warrantyUntil}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
            {filtered.map(a => (
              <Link key={a.id} to="/assets/$id" params={{ id: a.id }} className="border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all">
                <div className="flex justify-between"><div className="text-xs text-muted-foreground">{a.type}</div><StatusBadge status={a.status} /></div>
                <div className="mt-2 font-semibold text-primary">{a.id}</div>
                <div className="text-sm">{a.model}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.location}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
