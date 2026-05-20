import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { assets } from "@/lib/mock-data";
import { AppWindow, Download } from "lucide-react";
import { exportToCsv } from "@/lib/export";

export const Route = createFileRoute("/_app/software")({
  component: SoftwarePage,
});

function SoftwarePage() {
  const agg = new Map<string, { name: string; version: string; count: number; sample: { assetId: string; key: string; expires: string } }>();
  for (const a of assets) {
    for (const s of a.software ?? []) {
      const k = s.name;
      const ex = agg.get(k);
      if (ex) ex.count++;
      else agg.set(k, { name: s.name, version: s.version, count: 1, sample: { assetId: a.id, key: s.licenseKey, expires: s.expiresOn } });
    }
  }
  const items = Array.from(agg.values());

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Software" }]} />
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Software & Licenses</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} unique applications across the fleet</p>
        </div>
        <button onClick={() => exportToCsv(items.map(it => ({ Name: it.name, Version: it.version, Installs: it.count, SampleKey: it.sample.key, Expires: it.sample.expires })), 'software-export')} className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2">
          <Download className="size-4" /> Export
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.name} className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="size-11 rounded-md bg-primary/10 text-primary grid place-items-center"><AppWindow className="size-5" /></div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent">{it.count} installs</span>
            </div>
            <div className="mt-3 font-semibold">{it.name}</div>
            <div className="text-xs text-muted-foreground">Version {it.version}</div>
            <div className="mt-4 pt-4 border-t space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Sample key</span><span className="font-mono">{it.sample.key}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expires</span><span>{it.sample.expires}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">On asset</span><Link to="/assets/$id" params={{ id: it.sample.assetId }} className="text-primary hover:underline">{it.sample.assetId}</Link></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
