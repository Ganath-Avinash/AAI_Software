import { createFileRoute, redirect } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Sun, Moon, Monitor, Eye, EyeOff, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  beforeLoad: () => {
    if (typeof window === 'undefined') return;
    const role = localStorage.getItem("auth_role");
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { changePassword } = useAuth();
  
  // Theme Management
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return "system";
    return localStorage.getItem("app-theme") || "system";
  });

  const handleThemeChange = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
    window.dispatchEvent(new Event("app-theme-changed"));
  };

  // Password Management
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess(false);

    if (newPass !== confirmPass) {
      setPassError("New passwords do not match.");
      return;
    }
    if (newPass.length < 4) {
      setPassError("New password must be at least 4 characters.");
      return;
    }

    const success = await changePassword(oldPass, newPass);
    if (!success) {
      setPassError("Incorrect current password.");
    } else {
      setPassSuccess(true);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setPassSuccess(false), 3000);
    }
  };

  const sections = [
    { title: "Organization", desc: "Airports Authority of India", fields: [["Org name", "Airports Authority of India"], ["Time zone", "Asia/Kolkata (IST)"], ["Fiscal year", "April – March"]] },
    { title: "Notifications", desc: "Email & in-app alerts", fields: [["Warranty alerts", "30 days before expiry"], ["Assignment events", "Enabled"], ["Weekly digest", "Mondays 9:00 AM"]] },
    { title: "Security Settings", desc: "Access & authentication constraints", fields: [["Single sign-on", "AAI Active Directory"], ["MFA", "Required for admins"], ["Session timeout", "30 minutes"]] },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration, theme personalization, and security controls</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column: Metadata Sections */}
        <div className="md:col-span-2 space-y-6">
          {/* Theme customizer card */}
          <div className="bg-card border rounded-lg p-5">
            <h3 className="font-semibold text-base">Appearance</h3>
            <p className="text-xs text-muted-foreground mb-4">Choose how AAI ITAM looks on your screen</p>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="size-5 mb-1.5" />
                <span>Light</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="size-5 mb-1.5" />
                <span>Dark</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all ${
                  theme === "system"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="size-5 mb-1.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {sections.map(s => (
            <div key={s.title} className="bg-card border rounded-lg p-5">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
              <div className="mt-4 divide-y">
                {s.fields.map(([k, v]) => (
                  <div key={k} className="py-2.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right column: Change Password Card */}
        <div className="md:col-span-1">
          <div className="bg-card border rounded-lg p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="size-4 text-primary" />
              <h3 className="font-semibold text-base">Change Password</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Update your account password</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passError && (
                <div className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-md leading-relaxed">
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div className="text-xs font-medium text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 p-2.5 rounded-md leading-relaxed">
                  Password updated successfully.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium">Current Password</label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPass}
                    onChange={e => setOldPass(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full h-9 px-3 pr-10 rounded-md border text-sm outline-none bg-background focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full h-9 px-3 pr-10 rounded-md border text-sm outline-none bg-background focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full h-9 px-3 pr-10 rounded-md border text-sm outline-none bg-background focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-9 mt-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
