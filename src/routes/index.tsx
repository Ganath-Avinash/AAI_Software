import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plane, Shield, Lock } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(u, p);
    if (success) {
      navigate({ to: "/dashboard" });
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-lg bg-sidebar-accent grid place-items-center">
              <Plane className="size-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">Airports Authority of India</div>
              <div className="text-xs uppercase tracking-widest text-sidebar-foreground/70">Government of India · Ministry of Civil Aviation</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            IT Asset Management<br /><span className="text-sidebar-foreground/80">System</span>
          </h1>
          <p className="text-sidebar-foreground/80 max-w-md leading-relaxed">
            A unified platform to track, assign and manage hardware, software and network infrastructure across all AAI airports and offices.
          </p>
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <Shield className="size-4" /> Secured · Authorized personnel only
          </div>
        </div>

        <div className="relative text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} Airports Authority of India · All rights reserved
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="size-10 rounded-md bg-primary grid place-items-center"><Plane className="size-5 text-primary-foreground" /></div>
            <span className="font-bold">AAI ITAM</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Use your AAI domain credentials</p>
          </div>

          {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Employee ID / Username</label>
              <input value={u} onChange={e => setU(e.target.value)}
                className="mt-1.5 w-full h-10 px-3 rounded-md border bg-background focus:border-ring outline-none text-sm" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Password</label>
                <a className="text-xs text-primary hover:underline cursor-pointer">Forgot?</a>
              </div>
              <input type="password" value={p} onChange={e => setP(e.target.value)}
                className="mt-1.5 w-full h-10 px-3 rounded-md border bg-background focus:border-ring outline-none text-sm" />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" defaultChecked className="rounded" /> Keep me signed in on this device
            </label>
          </div>

          <button type="submit" className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Lock className="size-4" /> Sign in securely
          </button>

          <div className="text-center text-xs text-muted-foreground">
            Need access? Contact <span className="text-primary">IT Helpdesk · ext. 2100</span>
          </div>
          <div className="text-center">
            <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">Skip to demo dashboard →</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
