import { createFileRoute, redirect } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const Route = createFileRoute("/_app/settings")({
  beforeLoad: () => {
    if (typeof window === 'undefined') return;
    const role = localStorage.getItem("auth_role");
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const sections = [
    { title: "Organization", desc: "Airports Authority of India", fields: [["Org name", "Airports Authority of India"], ["Time zone", "Asia/Kolkata (IST)"], ["Fiscal year", "April – March"]] },
    { title: "Notifications", desc: "Email & in-app alerts", fields: [["Warranty alerts", "30 days before expiry"], ["Assignment events", "Enabled"], ["Weekly digest", "Mondays 9:00 AM"]] },
    { title: "Security", desc: "Access & authentication", fields: [["Single sign-on", "AAI Active Directory"], ["MFA", "Required for admins"], ["Session timeout", "30 minutes"]] },
  ];
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration and preferences</p>
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
  );
}
