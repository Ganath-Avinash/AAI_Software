import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { assets } from "@/lib/mock-data";
import { Network as NetIcon, Download } from "lucide-react";
import { exportToCsv } from "@/lib/export";

export const Route = createFileRoute("/_app/network")({
  component: NetworkPage,
});

function NetworkPage() {
  const netAssets = assets.filter(a => a.network);
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Network" }]} />
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Network Devices</h1>
          <p className="text-sm text-muted-foreground mt-1">{netAssets.length} devices on AAI internal network</p>
        </div>
        <button onClick={() => exportToCsv(netAssets.map(a => ({ Hostname: a.network!.hostname, AssetId: a.id, IP: a.network!.ip, MACEthernet: a.network!.macEthernet, VLAN: a.network!.vlan, Status: a.network!.online ? "Online" : "Offline" })), 'network-export')} className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2">
          <Download className="size-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Online" value={netAssets.filter(a => a.network!.online).length} tone="success" />
        <Stat label="Offline" value={netAssets.filter(a => !a.network!.online).length} tone="muted" />
        <Stat label="Total Devices" value={netAssets.length} tone="info" />
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Hostname</th>
              <th className="text-left px-4 py-2.5 font-medium">Asset</th>
              <th className="text-left px-4 py-2.5 font-medium">IP Address</th>
              <th className="text-left px-4 py-2.5 font-medium">MAC (Ethernet)</th>
              <th className="text-left px-4 py-2.5 font-medium">VLAN</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {netAssets.map(a => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs flex items-center gap-2"><NetIcon className="size-3.5 text-muted-foreground" />{a.network!.hostname}</td>
                <td className="px-4 py-3"><Link to="/assets/$id" params={{ id: a.id }} className="text-primary hover:underline">{a.id}</Link></td>
                <td className="px-4 py-3 font-mono text-xs">{a.network!.ip}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.network!.macEthernet}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.network!.vlan}</td>
                <td className="px-4 py-3"><StatusBadge status={a.network!.online ? "Online" : "Offline"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    success: "bg-success/10 text-success",
    muted: "bg-muted text-muted-foreground",
    info: "bg-info/10 text-info",
  };
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className={`size-9 rounded-md grid place-items-center ${tones[tone]}`}><NetIcon className="size-4" /></div>
      <div className="text-2xl font-bold mt-3">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
