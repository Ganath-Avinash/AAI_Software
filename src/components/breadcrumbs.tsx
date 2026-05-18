import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export function Breadcrumbs({ items }: { items?: { label: string; to?: string }[] }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const auto = !items;
  const segs = pathname.split("/").filter(Boolean);
  const computed = segs.map((s, i) => ({
    label: decodeURIComponent(s).replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    to: "/" + segs.slice(0, i + 1).join("/"),
  }));
  const crumbs = auto ? computed : items!;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="size-3.5" />
      </Link>
      {crumbs.map((c, i) => (
        <Fragment key={i}>
          <ChevronRight className="size-3.5" />
          {c.to && i < crumbs.length - 1 ? (
            <Link to={c.to as string} className="hover:text-foreground transition-colors">{c.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{c.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
