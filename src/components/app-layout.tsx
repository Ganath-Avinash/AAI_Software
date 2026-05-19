import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, HardDrive, Network, AppWindow,
  ArrowRightLeft, Undo2, BarChart3, Settings, Bell, Plane, LogOut, Info
} from "lucide-react";
import { GlobalSearch } from "@/components/global-search";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/assets", label: "Assets", icon: HardDrive },
  { to: "/network", label: "Network", icon: Network },
  { to: "/software", label: "Software", icon: AppWindow },
  { to: "/assignments", label: "Assignments", icon: ArrowRightLeft },
  { to: "/withdrawals", label: "Withdrawals", icon: Undo2 },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/credits", label: "Credits", icon: Info },
];

export function AppLayout() {
  const pathname = useRouterState({ select: s => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="size-9 rounded-md bg-sidebar-accent grid place-items-center">
            <Plane className="size-5 text-sidebar-accent-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-white">AAI ITAM</div>
            <div className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider">Asset Management</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50">
            <LogOut className="size-4" /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center gap-4 px-6">
          <GlobalSearch />
          <button className="size-9 grid place-items-center rounded-md hover:bg-accent relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="text-right">
              <div className="text-sm font-medium leading-tight">Admin User</div>
              <div className="text-xs text-muted-foreground">IT Operations</div>
            </div>
            <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">AU</div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
