import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { users, assets, updateAsset } from "@/lib/mock-data";
import { useState } from "react";
import { Check, ArrowRight, User as UserIcon, HardDrive } from "lucide-react";

export const Route = createFileRoute("/_app/assignments")({
  beforeLoad: () => {
    const role = localStorage.getItem("auth_role");
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  validateSearch: (search: Record<string, unknown>): { userId?: string } => ({
    userId: search.userId as string | undefined,
  }),
  component: AssignPage,
});

function AssignPage() {
  const { userId: initialUserId } = Route.useSearch();
  const [step, setStep] = useState(initialUserId ? 2 : 1);
  const [userId, setUserId] = useState<string>(initialUserId || "");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const available = assets.filter(a => a.status === "Available");
  const done = step === 4;

  const assetTypes = Array.from(new Set(available.map(a => a.type)));
  const [selectedType, setSelectedType] = useState<string>(assetTypes[0] || "");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "Assignments" }]} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assign Asset</h1>
        <p className="text-sm text-muted-foreground mt-1">Allocate available hardware to an employee in three quick steps.</p>
      </div>

      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Select User" },
          { n: 2, label: "Select Asset" },
          { n: 3, label: "Confirm" },
        ].map((s, i, arr) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`size-8 rounded-full grid place-items-center text-xs font-semibold border-2 ${step >= s.n ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
              {step > s.n ? <Check className="size-4" /> : s.n}
            </div>
            <div className={`text-sm font-medium ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
            {i < arr.length - 1 && <div className={`flex-1 h-px ${step > s.n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-lg p-6 min-h-[360px]">
        {done && (
          <div className="text-center space-y-3 py-10">
            <div className="size-14 rounded-full bg-success/10 text-success grid place-items-center mx-auto"><Check className="size-7" /></div>
            <h2 className="text-xl font-semibold">Assignment confirmed</h2>
            <p className="text-sm text-muted-foreground">{assetIds.length} asset(s) have been assigned to {users.find(u=>u.id===userId)?.name}.</p>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => { setStep(initialUserId ? 2 : 1); setUserId(initialUserId || ""); setAssetIds([]); }} className="h-9 px-3 rounded-md border bg-card text-sm">New assignment</button>
              <Link to="/users/$id" params={{ id: userId }} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center">View user</Link>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <h3 className="font-semibold mb-3">Choose an employee</h3>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[400px] overflow-auto">
              {users.map(u => (
                <button key={u.id} onClick={() => setUserId(u.id)} className={`flex items-center gap-3 p-3 rounded-md border text-left hover:border-primary ${userId === u.id ? "border-primary bg-primary/5" : ""}`}>
                  <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">{u.name.split(" ").map((n: string)=>n[0]).join("").slice(0,2)}</div>
                  <div><div className="font-medium text-sm">{u.name}</div><div className="text-xs text-muted-foreground">{u.department}</div></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Choose available assets</h3>
            <div className="flex flex-wrap gap-2">
              {assetTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${selectedType === type ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent text-muted-foreground"}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[300px] overflow-auto pr-2">
              {available.filter(a => a.type === selectedType).map(a => (
                <button key={a.id} onClick={() => setAssetIds(prev => prev.includes(a.id) ? prev.filter(id => id !== a.id) : [...prev, a.id])} className={`flex items-center gap-3 p-3 rounded-md border text-left hover:border-primary ${assetIds.includes(a.id) ? "border-primary bg-primary/5" : ""}`}>
                  <div className={`size-5 rounded border grid place-items-center ${assetIds.includes(a.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                    {assetIds.includes(a.id) && <Check className="size-3" />}
                  </div>
                  <div className="size-9 rounded-md bg-info/10 text-info grid place-items-center"><HardDrive className="size-4" /></div>
                  <div><div className="font-medium text-sm">{a.id}</div><div className="text-xs text-muted-foreground">{a.model}</div></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Review assignment</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md bg-muted/40 h-fit">
                <div className="text-xs uppercase text-muted-foreground flex items-center gap-1"><UserIcon className="size-3" /> Employee</div>
                <div className="mt-1 font-semibold">{users.find(u=>u.id===userId)?.name}</div>
                <div className="text-xs text-muted-foreground">{users.find(u=>u.id===userId)?.department}</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase text-muted-foreground flex items-center gap-1"><HardDrive className="size-3" /> Assets ({assetIds.length})</div>
                <div className="max-h-[200px] overflow-auto space-y-2 pr-2">
                  {assetIds.map(id => {
                    const a = assets.find(x => x.id === id);
                    return (
                      <div key={id} className="p-3 rounded-md bg-muted/40">
                        <div className="font-semibold text-sm">{a?.id}</div>
                        <div className="text-xs text-muted-foreground">{a?.type} · {a?.model}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">By confirming, an entry will be recorded in the audit log and an email notification will be sent.</p>
          </div>
        )}
      </div>

      {!done && (
        <div className="flex justify-between">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || (step === 2 && !!initialUserId)} className="h-9 px-3 rounded-md border bg-card text-sm disabled:opacity-50">Back</button>
          <button onClick={() => {
            if (step === 3) {
              assetIds.forEach(id => updateAsset(id, { status: "Assigned", assignedTo: userId }));
              setStep(4);
            } else {
              setStep(s => s + 1);
            }
          }} disabled={(step === 1 && !userId) || (step === 2 && assetIds.length === 0)} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            {step === 3 ? "Confirm assignment" : "Continue"} <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
