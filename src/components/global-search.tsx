import { useState, useMemo, useRef, useEffect } from "react";
import { Search, User as UserIcon, HardDrive, Network as NetIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchAssets } from "@/lib/api";

export function GlobalSearch() {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: assets = [] } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets });
  
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return { users: [], assets: [] };
    const lower = q.toLowerCase();
    return {
      users: users.filter(u =>
        u.name.toLowerCase().includes(lower) || u.empId.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
      ).slice(0, 5),
      assets: assets.filter(a =>
        a.id.toLowerCase().includes(lower) || a.serial.toLowerCase().includes(lower) ||
        a.model.toLowerCase().includes(lower) || (a.network?.ip ?? "").includes(lower)
      ).slice(0, 6),
    };
  }, [q]);

  const go = (path: string) => { setOpen(false); setQ(""); navigate({ to: path }); };

  return (
    <div ref={ref} className="relative flex-1 max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search users, asset IDs, IP addresses, serials…"
        className="w-full h-10 pl-10 pr-4 rounded-md bg-secondary border border-transparent focus:border-ring focus:bg-background outline-none text-sm transition-colors"
      />
      {open && q && (
        <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-xl z-50 max-h-[420px] overflow-auto">
          {results.users.length === 0 && results.assets.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No results for "{q}"</div>
          ) : (
            <>
              {results.users.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Users</div>
                  {results.users.map(u => (
                    <button key={u.id} onClick={() => go(`/users/${u.id}`)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent text-left">
                      <div className="size-8 rounded-full bg-primary/10 grid place-items-center text-primary"><UserIcon className="size-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.empId} · {u.department}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.assets.length > 0 && (
                <div className="p-2 border-t">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assets</div>
                  {results.assets.map(a => (
                    <button key={a.id} onClick={() => go(`/assets/${a.id}`)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent text-left">
                      <div className="size-8 rounded-md bg-info/10 grid place-items-center text-info">
                        {a.network ? <NetIcon className="size-4" /> : <HardDrive className="size-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{a.id} — {a.model}</div>
                        <div className="text-xs text-muted-foreground">{a.type} · {a.network?.ip ?? a.serial}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
