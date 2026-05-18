import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { assets, users } from "@/lib/mock-data";
import { Undo2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/withdrawals")({
  component: WithdrawPage,
});

function WithdrawPage() {
  const [selected, setSelected] = useState<string>("");
  const assigned = assets.filter(a => a.assignedTo);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "Withdrawals" }]} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw Asset</h1>
        <p className="text-sm text-muted-foreground mt-1">Return an assigned asset back into inventory.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b font-semibold">Currently assigned assets</div>
          <div className="max-h-[500px] overflow-auto divide-y">
            {assigned.map(a => {
              const u = users.find(x => x.id === a.assignedTo);
              return (
                <button key={a.id} onClick={() => setSelected(a.id)}
                  className={`w-full text-left p-4 hover:bg-muted/40 flex items-center justify-between ${selected === a.id ? "bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                    <div>
                      <div className="font-medium text-sm">{a.id} <span className="text-muted-foreground font-normal">· {a.model}</span></div>
                      <div className="text-xs text-muted-foreground">Assigned to {u?.name} · {u?.department}</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.location}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-5 space-y-4">
          <div className="size-11 rounded-md bg-warning/15 text-warning-foreground grid place-items-center"><Undo2 className="size-5" /></div>
          <h3 className="font-semibold">Withdrawal details</h3>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-md bg-muted/40">
                <div className="text-xs text-muted-foreground">Selected asset</div>
                <Link to="/assets/$id" params={{ id: selected }} className="font-medium text-primary">{selected}</Link>
              </div>
              <label className="block">
                <span className="text-xs font-medium">Reason</span>
                <select className="mt-1 w-full h-9 px-2 rounded-md border bg-background text-sm">
                  <option>Employee exit</option><option>Repair / Replacement</option><option>End of life</option><option>Department transfer</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium">Notes</span>
                <textarea rows={3} className="mt-1 w-full p-2 rounded-md border bg-background text-sm" placeholder="Optional notes…" />
              </label>
              <button className="w-full h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium">Confirm withdrawal</button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an asset on the left to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
