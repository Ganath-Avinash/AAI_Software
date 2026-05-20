import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusBadge } from "@/components/status-badge";
import { users as mockUsers, addUser, subscribe } from "@/lib/mock-data";
import { useState, useMemo, useEffect, useReducer } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, fetchDepartments, createUser } from "@/lib/api";
import { Plus, Search, Filter, Download } from "lucide-react";
import { UserFormDialog } from "@/components/user-form-dialog";
import { useAuth } from "@/lib/auth-context";
import { exportToCsv } from "@/lib/export";

export const Route = createFileRoute("/_app/users/")({
  component: UsersList,
});

function UsersList() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [open, setOpen] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: serverDepartments = [] } = useQuery({ queryKey: ['departments'], queryFn: fetchDepartments });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpen(false);
    }
  });
  const filtered = useMemo(() => users.filter((u: any) => {
    const matchesQ = !q || (u.name && u.name.toLowerCase().includes(q.toLowerCase())) || (u.empId && u.empId.toLowerCase().includes(q.toLowerCase()));
    const matchesD = dept === "all" || u.department === dept;
    const matchesS = statusFilter === "all" || u.status === statusFilter;
    return matchesQ && matchesD && matchesS;
  }), [q, dept, statusFilter, users]);

  const departments = serverDepartments.length > 0 ? serverDepartments : Array.from(new Set(users.map((u: any) => u.department).filter(Boolean)));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Breadcrumbs items={[{ label: "Users" }]} />
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {users.length} employees</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCsv(filtered, 'users-export')} className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-2">
            <Download className="size-4" /> Export
          </button>
          {role === "admin" && (
            <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2"><Plus className="size-4" /> Add user</button>
          )}
        </div>
      </div>

      <UserFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add New User"
        onSubmit={(data) => { createMutation.mutate(data); }}
      />
      


      <div className="bg-card border rounded-lg">
        <div className="border-b px-4 flex gap-1">
          {["Active", "Inactive", "all"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                statusFilter === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {s === "all" ? "All Users" : s === "Active" ? "Active Users" : "Retired / Inactive"}
            </button>
          ))}
        </div>
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
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-muted/30 group">
                  <td className="px-4 py-3">
                    <Link to="/users/$id" params={{ id: u.id }} className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">{(u.name || "?").split(" ").map((n: string)=>n[0]).join("").slice(0,2)}</div>
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
