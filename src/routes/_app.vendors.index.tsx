import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { fetchVendors } from "@/lib/api";
import { Search, Store } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/vendors/")({
  component: VendorsList,
});

function VendorsList() {
  const [q, setQ] = useState("");
  const { data: vendors = [], isLoading } = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });

  const filtered = vendors.filter((v: any) => v.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Vendors" }]} />
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors & Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage hardware suppliers and track asset sourcing</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search vendors..."
              className="w-full h-9 pl-9 pr-3 rounded-md border bg-background text-sm outline-none focus:border-ring" />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading vendors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No vendors found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium w-16"></th>
                  <th className="text-left px-4 py-2.5 font-medium">Vendor Name</th>
                  <th className="text-left px-4 py-2.5 font-medium">Assets Supplied</th>
                  <th className="text-left px-4 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((v: any) => (
                  <tr key={v.id} className="hover:bg-muted/30 group">
                    <td className="px-4 py-3">
                      <div className="size-8 rounded bg-primary/10 text-primary grid place-items-center">
                        <Store className="size-4" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{v.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.assetsSupplied} {v.assetsSupplied === 1 ? 'asset' : 'assets'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/vendors/$id" params={{ id: v.id }} className="text-primary text-xs font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details →
                      </Link>
                    </td>
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
