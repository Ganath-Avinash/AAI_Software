import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { useQuery } from "@tanstack/react-query";
import { fetchVendor, fetchVendorAssets } from "@/lib/api";
import { Store, HardDrive } from "lucide-react";

export const Route = createFileRoute("/_app/vendors/$id")({
  component: VendorDetail,
});

function VendorDetail() {
  const { id } = Route.useParams();
  
  const { data: vendor, isLoading: vendorLoading } = useQuery({ queryKey: ['vendor', id], queryFn: () => fetchVendor(id) });
  const { data: assets = [], isLoading: assetsLoading } = useQuery({ queryKey: ['vendor-assets', id], queryFn: () => fetchVendorAssets(id) });

  if (vendorLoading) return <div className="p-8">Loading vendor details...</div>;
  if (!vendor || vendor.error) return <div className="p-8">Vendor not found.</div>;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Vendors", to: "/vendors" }, { label: vendor.name }]} />
      
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <Store className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{vendor.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Supplier of {vendor.assetsSupplied} {vendor.assetsSupplied === 1 ? 'asset' : 'assets'}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-muted/20">
          <h2 className="text-sm font-semibold flex items-center gap-2"><HardDrive className="size-4 text-muted-foreground" /> Supplied Assets</h2>
        </div>
        
        {assetsLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No assets supplied by this vendor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Asset ID</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Model</th>
                  <th className="text-left px-4 py-2.5 font-medium">Location</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assets.map((a: any) => (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3"><Link to="/assets/$id" params={{ id: a.id }} className="font-medium text-primary hover:underline">{a.id}</Link></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                    <td className="px-4 py-3"><div className="text-foreground">{a.model}</div><div className="text-xs text-muted-foreground">{a.serial}</div></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.location}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
