import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { users, addUser, subscribe } from "@/lib/mock-data";
import { useState, useMemo, useEffect, useReducer } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { UserFormDialog } from "@/components/user-form-dialog";

export const Route = createFileRoute("/_app/users/")({
  component: UsersList,
});

function UsersList() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [open, setOpen] = useState(false);
  const [, force] = useReducer(x => x + 1, 0);
  useEffect(() => { const off = subscribe(force); return () => { off(); }; }, []);


  const filtered = useMemo(() => users.filter(u => {
    const matchesQ = !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.empId.toLowerCase().includes(q.toLowerCase());
    const matchesD = dept === "all" || u.department === dept;
    return matchesQ && matchesD;
  }), [q, dept]);

  const departments = Array.from(new Set(users.map(u => u.department)));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Users" }]} />
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {users.length} employees</p>
        </div>
        <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2"><Plus className="size-4" /> Add user</button>
      </div>

      <UserFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add New User"
        onSubmit={(data) => { addUser(data); setOpen(false); }}
      />
      

      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or employee ID"
              className="w-full h-9 pl-9 pr-3 rounded-md border bg-background text-sm outline-none focus:border-ring" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <select value={dept} onChange={e => setDept(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm outline-none">
              <option value="all">All departments</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Employee</th>
                <th className="text-left px-4 py-2.5 font-medium">Department</th>
                <th className="text-left px-4 py-2.5 font-medium">Designation</th>
                <th className="text-left px-4 py-2.5 font-medium">Location</th>
                <th className="text-left px-4 py-2.5 font-medium">Intercom</th>
                <th className="text-center px-4 py-2.5 font-medium">Devices</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 group">
                  <td className="px-4 py-3">
                    <Link to="/users/$id" params={{ id: u.id }} className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">{u.name.split(" ").map((n: string)=>n[0]).join("").slice(0,2)}</div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.empId}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.designation}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.location}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{u.intercom}</td>
                  <td className="px-4 py-3 text-center"><span className="inline-flex min-w-[24px] justify-center px-1.5 py-0.5 rounded-full bg-accent text-xs font-medium">{u.assetIds.length}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t flex justify-between items-center text-xs text-muted-foreground">
          <div>Showing 1–{filtered.length} of {filtered.length}</div>
          <div className="flex gap-1">
            <button className="h-7 px-2.5 border rounded text-xs hover:bg-accent" disabled>Previous</button>
            <button className="h-7 px-2.5 border rounded text-xs bg-primary text-primary-foreground">1</button>
            <button className="h-7 px-2.5 border rounded text-xs hover:bg-accent" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
