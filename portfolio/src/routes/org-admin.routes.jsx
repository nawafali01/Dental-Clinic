// Organization Admin Exclusive Routes
// Currently only one OA-exclusive page: Organization Settings.
// All other Org Admin pages are shared via shared.routes.jsx.

const Badge = ({ children, color = "blue" }) => {
  const colors = { blue: "bg-blue-100 text-blue-700", green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700", slate: "bg-slate-100 text-slate-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
};

const DevBanner = ({ text }) => (
  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
    🚧 {text} — will connect to the backend API when available.
  </div>
);

// ── Organization Settings ─────────────────────────────────────
const OrgSettingsView = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
      <p className="text-sm text-slate-500 mt-0.5">Manage your organization's preferences and configuration</p>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[
        { section: "Organization Profile", items: ["Organization Name", "Logo", "Business Type", "Registration Number"], color: "blue" },
        { section: "Clinics",              items: ["Active Clinics", "Clinic Limit", "Shared Resources", "Inter-clinic Access"], color: "green" },
        { section: "Branding",             items: ["Primary Color", "Secondary Color", "Font Style", "Email Footer"], color: "purple" },
        { section: "Notifications",        items: ["Alert Preferences", "Digest Emails", "Mobile Push", "Escalation Rules"], color: "amber" },
        { section: "Team Access",          items: ["Invite Policy", "Default Role", "Auto-assign Leads", "Access Expiry"], color: "slate" },
        { section: "Data & Privacy",       items: ["Data Retention", "Export Data", "Delete Account", "GDPR Compliance"], color: "red" },
      ].map((s, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{s.section}</h3>
            <Badge color={s.color}>Config</Badge>
          </div>
          <ul className="space-y-2">
            {s.items.map((item, j) => (
              <li key={j} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-slate-600">{item}</span>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Edit</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <DevBanner text="Full Organization Settings panel is under development" />
  </div>
);

export const orgAdminRoutes = [
  {
    path: "org-settings",
    element: <OrgSettingsView />,
  },
];
