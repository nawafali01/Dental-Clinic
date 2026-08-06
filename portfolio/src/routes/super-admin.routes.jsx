import { Suspense } from "react";

// ─── Fallback spinner ───────────────────────────────────────────
const PageLoader = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = { blue: "bg-blue-100 text-blue-700", green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700", purple: "bg-purple-100 text-purple-700", slate: "bg-slate-100 text-slate-600", cyan: "bg-cyan-100 text-cyan-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
};

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    {sub && <p className="text-xs text-emerald-600 font-medium mt-1">{sub}</p>}
  </div>
);

const DevBanner = ({ text }) => (
  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
    🚧 {text} — will connect to the backend API when available.
  </div>
);

const PageHeader = ({ title, description, action }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 mt-0.5">{description}</p>
    </div>
    {action && (
      <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
        {action}
      </button>
    )}
  </div>
);

const Table = ({ headers, rows }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>{headers.map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors">
            {row.map((cell, j) => <td key={j} className="px-4 py-3 text-slate-700">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ════════════════════════════════════════════════════════════════
// SUPER ADMIN EXCLUSIVE VIEWS
// ════════════════════════════════════════════════════════════════

// ── Analytics Suite ───────────────────────────────────────────
const AnalyticsSuiteView = () => (
  <div className="space-y-6">
    <PageHeader title="Analytics Suite" description="Platform-wide performance analytics and funnel insights" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Leads"      value="1,284" sub="+12% vs last month" />
      <StatCard label="Conversion Rate"  value="6.9%"  sub="+0.8% vs last month" />
      <StatCard label="Total Revenue"    value="$284K" sub="+18% YTD" />
      <StatCard label="Avg. Lead Value"  value="$226"  sub="At conversion" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      {/* Funnel Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-900">Lead Conversion Funnel</h3>
        {[
          { stage: "New Leads",   count: 1284, pct: 100 },
          { stage: "Contacted",   count: 890,  pct: 69 },
          { stage: "Qualified",   count: 342,  pct: 27 },
          { stage: "Proposal",    count: 134,  pct: 10 },
          { stage: "Converted",   count: 89,   pct: 7 },
        ].map((s, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{s.stage}</span>
              <span className="font-semibold text-slate-900">{s.count.toLocaleString()} <span className="text-xs text-slate-400 font-normal">({s.pct}%)</span></span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      {/* Source Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-900">Lead Sources Breakdown</h3>
        {[
          { source: "Google Ads", leads: 487, color: "bg-blue-500" },
          { source: "Instagram",  leads: 321, color: "bg-pink-500" },
          { source: "Website",    leads: 208, color: "bg-purple-500" },
          { source: "WhatsApp",   leads: 156, color: "bg-green-500" },
          { source: "Referral",   leads: 112, color: "bg-amber-500" },
        ].map((s, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{s.source}</span>
              <span className="font-semibold text-slate-900">{s.leads}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full`} style={{ width: `${Math.round((s.leads / 487) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
    <DevBanner text="Full Analytics Suite with live charts is under development" />
  </div>
);

// ── AI Ops / Kill Switch ──────────────────────────────────────
const AiOpsView = () => (
  <div className="space-y-6">
    <PageHeader title="AI Operations & Governance" description="Monitor AI system health and control all automation" />
    {/* Kill Switch Banner */}
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between">
      <div>
        <p className="font-bold text-red-800 text-sm">Emergency Kill Switch</p>
        <p className="text-xs text-red-600 mt-0.5">Immediately halt all AI automations across the platform</p>
      </div>
      <button className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
        🛑 Kill All AI
      </button>
    </div>
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="AI Status"     value="Operational" sub="All systems nominal" />
      <StatCard label="Automations"   value="11 Active"   sub="3 paused" />
      <StatCard label="Runs Today"    value="1,842"        sub="98.3% success" />
      <StatCard label="Avg Latency"   value="1.2s"         sub="Per AI call" />
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">AI System Health</h3>
      {[
        { service: "Lead Processing AI",      status: "Operational", latency: "0.8s",  health: 99 },
        { service: "Appointment Reminder Bot",status: "Operational", latency: "1.1s",  health: 98 },
        { service: "WhatsApp Messaging AI",   status: "Operational", latency: "2.3s",  health: 96 },
        { service: "Lead Scoring Engine",     status: "Degraded",    latency: "5.1s",  health: 72 },
        { service: "Email Campaign AI",       status: "Operational", latency: "1.5s",  health: 99 },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-800">{s.service}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{s.latency}</span>
                <Badge color={s.status === "Operational" ? "green" : "amber"}>{s.status}</Badge>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.health > 90 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${s.health}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
    <DevBanner text="Full AI Governance panel with real-time monitoring is under development" />
  </div>
);

// ── Audit Logs ────────────────────────────────────────────────
const AuditLogsView = () => (
  <div className="space-y-6">
    <PageHeader title="Audit Logs & Compliance" description="Complete system-wide activity trail for compliance and security" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Events Today" value="847"  sub="Across all users" />
      <StatCard label="This Week"    value="5,291" sub="Logged actions" />
      <StatCard label="Warnings"     value="12"   sub="Need review" />
      <StatCard label="Users Active" value="28"   sub="In last 24 hours" />
    </div>
    <Table
      headers={["User", "Action", "Resource", "IP Address", "Severity", "Timestamp"]}
      rows={[
        ["superadmin@test.com",  "LOGIN",           "Auth System",   "192.168.1.10", <Badge color="green">Info</Badge>,   "Aug 3 — 12:05 PM"],
        ["orgadmin@test.com",    "UPDATE_LEAD",     "Lead #4829",    "192.168.1.21", <Badge color="green">Info</Badge>,   "Aug 3 — 11:48 AM"],
        ["manager@test.com",     "VIEW_PATIENTS",   "Patient List",  "192.168.1.34", <Badge color="green">Info</Badge>,   "Aug 3 — 11:30 AM"],
        ["superadmin@test.com",  "DELETE_USER",     "User #1120",    "192.168.1.10", <Badge color="amber">Warning</Badge>,"Aug 3 — 11:00 AM"],
        ["superadmin@test.com",  "TOGGLE_AI_KILL",  "AI Ops Panel",  "192.168.1.10", <Badge color="red">Critical</Badge>, "Aug 3 — 10:45 AM"],
        ["orgadmin@test.com",    "EXPORT_REPORT",   "Revenue Report","192.168.1.21", <Badge color="green">Info</Badge>,   "Aug 3 — 10:30 AM"],
        ["superadmin@test.com",  "CREATE_CLINIC",   "Clinic #005",   "192.168.1.10", <Badge color="green">Info</Badge>,   "Aug 3 — 09:15 AM"],
      ]}
    />
    <DevBanner text="Full Audit Log system with filters and export is under development" />
  </div>
);

// ── System Settings ───────────────────────────────────────────
const SystemSettingsView = () => (
  <div className="space-y-6">
    <PageHeader title="System Settings" description="Global platform configuration and system preferences" />
    <div className="grid grid-cols-3 gap-4">
      {[
        { section: "General",         items: ["Platform Name", "Default Language", "Timezone", "Date Format"],                 color: "blue" },
        { section: "Security",        items: ["Password Policy", "2FA Enforcement", "Session Timeout", "IP Allowlist"],        color: "red" },
        { section: "AI Configuration",items: ["AI Provider", "API Keys", "Rate Limits", "Fallback Behaviour"],               color: "purple" },
        { section: "Email",           items: ["SMTP Server", "From Address", "Email Templates", "Reply-to Settings"],          color: "green" },
        { section: "SMS & WhatsApp",  items: ["Twilio Account", "WhatsApp Business ID", "Message Templates", "Opt-out Rules"],color: "amber" },
        { section: "Billing",         items: ["Subscription Plan", "Payment Method", "Invoice History", "Usage Limits"],       color: "slate" },
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
    <DevBanner text="Full System Settings configuration panel is under development" />
  </div>
);

// ════════════════════════════════════════════════════════════════
// SUPER ADMIN ROUTES EXPORT (SA-exclusive only)
// ════════════════════════════════════════════════════════════════

export const superAdminRoutes = [
  {
    path: "analytics",
    element: <AnalyticsSuiteView />,
  },
  {
    path: "ai-ops",
    element: <AiOpsView />,
  },
  {
    path: "audit-logs",
    element: <AuditLogsView />,
  },
  {
    path: "settings",
    element: <SystemSettingsView />,
  },
];
