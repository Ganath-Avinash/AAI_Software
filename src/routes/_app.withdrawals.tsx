import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { assets, users, updateAsset, subscribe, withdrawnReports, addWithdrawnReport } from "@/lib/mock-data";
import { Undo2, Check, Download } from "lucide-react";
import { useState, useEffect, useReducer } from "react";

export const Route = createFileRoute("/_app/withdrawals")({
  beforeLoad: () => {
    if (typeof window === 'undefined') return;
    const role = localStorage.getItem("auth_role");
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: WithdrawPage,
});

function WithdrawPage() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => { const off = subscribe(force); return () => { off(); }; }, []);

  const [activeTab, setActiveTab] = useState<"withdraw" | "with_it">("withdraw");
  const [selected, setSelected] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const assigned = assets.filter(a => a.assignedTo);

  const handleWithdraw = () => {
    const asset = assets.find(a => a.id === selected);
    const u = users.find(x => x.id === asset?.assignedTo);

    if (asset && u) {
      addWithdrawnReport({
        user: u.name,
        dept: u.department,
        model: asset.model,
        items: 1,
        cwn: "",
        cpuId: asset.type === "Desktop CPU" ? asset.id : "",
        monitorId: asset.type === "Monitor" ? asset.id : "",
        keyboardId: asset.type === "Keyboard" ? asset.id : "",
        mouseId: asset.type === "Mouse" ? asset.id : "",
        upsId: asset.type === "UPS" ? asset.id : "",
        printerId: asset.type === "Printer" ? asset.id : "",
        scannerId: asset.type === "Scanner" ? asset.id : "",
        lapId: asset.type === "Laptop" ? asset.id : "",
        lapAdap: "",
        lapBag: "",
        lapMse: "",
        wo: new Date().toISOString().slice(0, 10),
        headset: asset.type === "Headset" ? asset.id : "",
        webcam: asset.type === "Webcam" ? asset.id : "",
        remarks: "Withdrawn via App"
      });
    }

    updateAsset(selected, { status: "Available", assignedTo: null });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelected("");
    }, 2000);
  };
  
  // Dummy data removed, now relying on withdrawnReports from mock-data

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <Breadcrumbs items={[{ label: "Withdrawals" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Withdrawals & Returns</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage asset withdrawals and view withdrawn items.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <button onClick={() => setActiveTab("withdraw")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "withdraw" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Withdraw Asset</button>
          <button onClick={() => setActiveTab("with_it")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "with_it" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>WITH IT Report</button>
        </div>
      </div>

      {activeTab === "withdraw" && (
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
                {success ? (
                  <div className="w-full h-9 rounded-md bg-success/10 text-success text-sm font-medium flex items-center justify-center gap-2 border border-success/20">
                    <Check className="size-4" /> Withdrawn successfully
                  </div>
                ) : (
                  <button onClick={handleWithdraw} className="w-full h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Confirm withdrawal</button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select an asset on the left to begin.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "with_it" && (
        <div className="bg-card border rounded-lg flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">WITH IT - Withdrawn PCs & Assets</h2>
            <button className="flex items-center gap-2 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90">
              <Download className="size-4" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">SL:NO</th>
                  <th className="px-4 py-3 font-medium">WITHDRAWN FROM</th>
                  <th className="px-4 py-3 font-medium">DEPT</th>
                  <th className="px-4 py-3 font-medium">MODEL</th>
                  <th className="px-4 py-3 font-medium">ITEMS</th>
                  <th className="px-4 py-3 font-medium">COLUMN WO NAME</th>
                  <th className="px-4 py-3 font-medium">CPU ID</th>
                  <th className="px-4 py-3 font-medium">MONITOR ID</th>
                  <th className="px-4 py-3 font-medium">KEYBOARD ID</th>
                  <th className="px-4 py-3 font-medium">MOUSE ID</th>
                  <th className="px-4 py-3 font-medium">UPS ID</th>
                  <th className="px-4 py-3 font-medium">PRINTER ID</th>
                  <th className="px-4 py-3 font-medium">SCANNER ID</th>
                  <th className="px-4 py-3 font-medium">LAP ID</th>
                  <th className="px-4 py-3 font-medium">LAP ADAP</th>
                  <th className="px-4 py-3 font-medium">LAP BAG</th>
                  <th className="px-4 py-3 font-medium">LAP MSE</th>
                  <th className="px-4 py-3 font-medium">WO</th>
                  <th className="px-4 py-3 font-medium">HEADSET</th>
                  <th className="px-4 py-3 font-medium">WEBCAMERA</th>
                  <th className="px-4 py-3 font-medium">REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {withdrawnReports.length === 0 ? (
                  <tr><td colSpan={21} className="p-8 text-center text-muted-foreground">No withdrawals logged yet.</td></tr>
                ) : (
                  withdrawnReports.map(row => (
                    <tr key={row.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">{row.slNo}</td>
                      <td className="px-4 py-3 font-medium">{row.user}</td>
                      <td className="px-4 py-3">{row.dept}</td>
                      <td className="px-4 py-3">{row.model}</td>
                      <td className="px-4 py-3">{row.items}</td>
                      <td className="px-4 py-3">{row.cwn}</td>
                      <td className="px-4 py-3">{row.cpuId}</td>
                      <td className="px-4 py-3">{row.monitorId}</td>
                      <td className="px-4 py-3">{row.keyboardId}</td>
                      <td className="px-4 py-3">{row.mouseId}</td>
                      <td className="px-4 py-3">{row.upsId}</td>
                      <td className="px-4 py-3">{row.printerId}</td>
                      <td className="px-4 py-3">{row.scannerId}</td>
                      <td className="px-4 py-3">{row.lapId}</td>
                      <td className="px-4 py-3">{row.lapAdap}</td>
                      <td className="px-4 py-3">{row.lapBag}</td>
                      <td className="px-4 py-3">{row.lapMse}</td>
                      <td className="px-4 py-3">{row.wo}</td>
                      <td className="px-4 py-3">{row.headset}</td>
                      <td className="px-4 py-3">{row.webcam}</td>
                      <td className="px-4 py-3">{row.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
