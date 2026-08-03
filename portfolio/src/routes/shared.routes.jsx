import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { PERMISSIONS } from "@/dashboard/shared/config/permissions";

const UnifiedDashboard = lazy(() => import("@/dashboard/UnifiedDashboard"));

// ─── Fallback spinner ────────────────────────────────────────
const PageLoader = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

// ─── Shared stub helper ──────────────────────────────────────
const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue:    "bg-blue-100 text-blue-700",
    green:   "bg-emerald-100 text-emerald-700",
    amber:   "bg-amber-100 text-amber-700",
    red:     "bg-red-100 text-red-700",
    purple:  "bg-purple-100 text-purple-700",
    slate:   "bg-slate-100 text-slate-600",
  };
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
        <tr>
          {headers.map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-slate-700">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ════════════════════════════════════════════════════════════════
// SHARED STUB VIEWS
// ════════════════════════════════════════════════════════════════

// ── Leads ────────────────────────────────────────────────────
const LeadsView = () => (
  <div className="space-y-6">
    <PageHeader title="Leads" description="Track and manage your lead pipeline" action="+ New Lead" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Leads" value="1,284" sub="+12% this month" />
      <StatCard label="New Today" value="23" sub="+5 since yesterday" />
      <StatCard label="Qualified" value="342" sub="+8% this month" />
      <StatCard label="Converted" value="89" sub="+15% this month" />
    </div>
    <Table
      headers={["Lead Name", "Status", "Source", "Clinic", "Date"]}
      rows={[
        ["Ahmed Al-Rashidi",  <Badge color="purple">Qualified</Badge>,  "Google Ads", "Downtown Dental",    "2026-08-03"],
        ["Sara Johnson",      <Badge color="blue">New</Badge>,          "Instagram",  "Apex Orthodontics",  "2026-08-03"],
        ["Mohammed Hassan",   <Badge color="amber">Contacted</Badge>,   "Website",    "Westside Pediatric", "2026-08-02"],
        ["Fatima Al-Zaidi",   <Badge color="red">Lost</Badge>,          "Referral",   "Metro Cosmetic",     "2026-08-01"],
        ["Khalid Mansour",    <Badge color="green">Converted</Badge>,   "WhatsApp",   "Downtown Dental",    "2026-07-31"],
      ]}
    />
    <DevBanner text="Full Leads CRM is under development" />
  </div>
);

// ── Appointments ─────────────────────────────────────────────
const AppointmentsView = () => (
  <div className="space-y-6">
    <PageHeader title="Appointments" description="Schedule and manage patient appointments" action="+ New Appointment" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Today"     value="18"  sub="2 remaining" />
      <StatCard label="This Week" value="94"  sub="+6% vs last week" />
      <StatCard label="Pending"   value="31"  sub="Needs confirmation" />
      <StatCard label="Completed" value="63"  sub="This week" />
    </div>
    <Table
      headers={["Patient", "Doctor", "Date & Time", "Type", "Status"]}
      rows={[
        ["Ahmed Al-Rashidi",  "Dr. Aisha Khan",     "Aug 3 — 09:00 AM", "Checkup",        <Badge color="green">Confirmed</Badge>],
        ["Sara Johnson",      "Dr. Omar Hassan",    "Aug 3 — 10:30 AM", "Cleaning",       <Badge color="amber">Pending</Badge>],
        ["Mohammed Hassan",   "Dr. Aisha Khan",     "Aug 3 — 12:00 PM", "Root Canal",     <Badge color="green">Confirmed</Badge>],
        ["Fatima Al-Zaidi",   "Dr. Khalid Nasser",  "Aug 4 — 09:00 AM", "Whitening",      <Badge color="blue">Scheduled</Badge>],
        ["Khalid Mansour",    "Dr. Omar Hassan",    "Aug 4 — 11:00 AM", "Implant Consult",<Badge color="blue">Scheduled</Badge>],
      ]}
    />
    <DevBanner text="Full Appointment Scheduling is under development" />
  </div>
);

// ── Patients ─────────────────────────────────────────────────
const PatientsView = () => (
  <div className="space-y-6">
    <PageHeader title="Patients" description="Patient records and history" action="+ Add Patient" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Patients"  value="3,841" sub="+42 this month" />
      <StatCard label="New This Month"  value="42"    sub="+8% vs last month" />
      <StatCard label="Active"          value="2,190" sub="Had visit in 3 months" />
      <StatCard label="Inactive"        value="1,651" sub="No visit in 3+ months" />
    </div>
    <Table
      headers={["Patient", "Age", "Last Visit", "Next Appointment", "Clinic"]}
      rows={[
        ["Ahmed Al-Rashidi",  "34", "Jul 15, 2026", "Aug 10, 2026",  "Downtown Dental"],
        ["Sara Johnson",      "28", "Jun 30, 2026", "Aug 3, 2026",   "Apex Orthodontics"],
        ["Mohammed Hassan",   "45", "Aug 1, 2026",  "Aug 8, 2026",   "Westside Pediatric"],
        ["Fatima Al-Zaidi",   "31", "Jul 20, 2026", "Aug 4, 2026",   "Metro Cosmetic"],
        ["Khalid Mansour",    "52", "Jul 5, 2026",  "Aug 12, 2026",  "Downtown Dental"],
      ]}
    />
    <DevBanner text="Full Patient Records module is under development" />
  </div>
);

// ── Calls ─────────────────────────────────────────────────────
const CallsView = () => (
  <div className="space-y-6">
    <PageHeader title="Calls" description="Track all inbound and outbound calls" action="+ Log Call" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Today"    value="47"  sub="12 missed" />
      <StatCard label="This Week"value="218" sub="+15% vs last week" />
      <StatCard label="Answered" value="181" sub="83% answer rate" />
      <StatCard label="Missed"   value="37"  sub="17% miss rate" />
    </div>
    <Table
      headers={["Caller", "Type", "Duration", "Outcome", "Date & Time"]}
      rows={[
        ["Ahmed Al-Rashidi",  "Inbound",  "4m 32s", <Badge color="green">Booked</Badge>,   "Aug 3 — 09:15 AM"],
        ["Sara Johnson",      "Outbound", "2m 10s", <Badge color="amber">Follow-up</Badge>,"Aug 3 — 10:00 AM"],
        ["Unknown Caller",    "Inbound",  "0m 00s", <Badge color="red">Missed</Badge>,     "Aug 3 — 10:45 AM"],
        ["Mohammed Hassan",   "Inbound",  "6m 05s", <Badge color="green">Booked</Badge>,   "Aug 3 — 11:00 AM"],
        ["Khalid Mansour",    "Outbound", "3m 44s", <Badge color="blue">Informed</Badge>,  "Aug 3 — 12:30 PM"],
      ]}
    />
    <DevBanner text="Full Call Tracking module is under development" />
  </div>
);

// ── Tasks ─────────────────────────────────────────────────────
const TasksView = () => (
  <div className="space-y-6">
    <PageHeader title="Tasks" description="Manage team tasks and follow-ups" action="+ New Task" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total"      value="156"  sub="Across all staff" />
      <StatCard label="Due Today"  value="12"   sub="Needs attention" />
      <StatCard label="In Progress"value="38"   sub="Being worked on" />
      <StatCard label="Completed"  value="106"  sub="This week" />
    </div>
    <Table
      headers={["Task", "Assignee", "Due Date", "Priority", "Status"]}
      rows={[
        ["Follow up with Ahmed Al-Rashidi",    "Dr. Aisha Khan",    "Aug 3, 2026", <Badge color="red">High</Badge>,    <Badge color="amber">In Progress</Badge>],
        ["Send appointment reminder to Sara",  "Receptionist Team", "Aug 3, 2026", <Badge color="amber">Medium</Badge>,<Badge color="blue">Pending</Badge>],
        ["Update treatment plan for Mohammed", "Dr. Omar Hassan",   "Aug 4, 2026", <Badge color="red">High</Badge>,    <Badge color="blue">Pending</Badge>],
        ["Prepare monthly revenue report",     "Finance Team",      "Aug 5, 2026", <Badge color="amber">Medium</Badge>,<Badge color="amber">In Progress</Badge>],
        ["Review AI automation results",       "Admin Team",        "Aug 6, 2026", <Badge color="slate">Low</Badge>,   <Badge color="slate">Not Started</Badge>],
      ]}
    />
    <DevBanner text="Full Task Management module is under development" />
  </div>
);

// ── Revenue ────────────────────────────────────────────────────
const RevenueView = () => (
  <div className="space-y-6">
    <PageHeader title="Revenue" description="Financial overview and revenue tracking" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Revenue"  value="$284,500" sub="+18% YTD" />
      <StatCard label="This Month"     value="$48,200"  sub="+12% vs last month" />
      <StatCard label="Last Month"     value="$43,100"  sub="July 2026" />
      <StatCard label="Avg per Clinic" value="$12,050"  sub="Across 4 clinics" />
    </div>
    <Table
      headers={["Clinic", "This Month", "Last Month", "Growth", "Status"]}
      rows={[
        ["Downtown Dental Excellence",   "$18,400", "$16,200", <Badge color="green">+13.6%</Badge>, <Badge color="green">On Track</Badge>],
        ["Apex Orthodontics & Smiles",   "$12,100", "$10,800", <Badge color="green">+12.0%</Badge>, <Badge color="green">On Track</Badge>],
        ["Westside Pediatric & Family",  "$9,800",  "$9,300",  <Badge color="green">+5.4%</Badge>,  <Badge color="amber">Moderate</Badge>],
        ["Metro Cosmetic Care",          "$7,900",  "$6,800",  <Badge color="green">+16.2%</Badge>, <Badge color="green">On Track</Badge>],
      ]}
    />
    <DevBanner text="Full Revenue Dashboard is under development" />
  </div>
);

// ── Payments ──────────────────────────────────────────────────
const PaymentsView = () => (
  <div className="space-y-6">
    <PageHeader title="Payments" description="Track and manage all patient payments" action="+ Record Payment" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Collected"  value="$31,200" sub="This month" />
      <StatCard label="Pending"    value="$8,400"  sub="Awaiting payment" />
      <StatCard label="Failed"     value="$1,100"  sub="Needs follow-up" />
      <StatCard label="Refunded"   value="$320"    sub="This month" />
    </div>
    <Table
      headers={["Patient", "Amount", "Method", "Clinic", "Status", "Date"]}
      rows={[
        ["Ahmed Al-Rashidi",  "$450",  "Credit Card", "Downtown Dental",   <Badge color="green">Paid</Badge>,    "Aug 3, 2026"],
        ["Sara Johnson",      "$1,200","Insurance",   "Apex Orthodontics", <Badge color="green">Paid</Badge>,    "Aug 2, 2026"],
        ["Mohammed Hassan",   "$680",  "Cash",        "Westside Pediatric",<Badge color="amber">Pending</Badge>, "Aug 2, 2026"],
        ["Fatima Al-Zaidi",   "$250",  "Credit Card", "Metro Cosmetic",    <Badge color="red">Failed</Badge>,    "Aug 1, 2026"],
        ["Khalid Mansour",    "$1,500","Bank Transfer","Downtown Dental",  <Badge color="green">Paid</Badge>,    "Aug 1, 2026"],
      ]}
    />
    <DevBanner text="Full Payments module is under development" />
  </div>
);

// ── Reports ────────────────────────────────────────────────────
const ReportsView = () => (
  <div className="space-y-6">
    <PageHeader title="Reports" description="Analytics and performance reports" action="Generate Report" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Reports"     value="48"   sub="All time" />
      <StatCard label="Generated Today"   value="3"    sub="This session" />
      <StatCard label="Scheduled"         value="12"   sub="Automated" />
      <StatCard label="Shared"            value="8"    sub="With team" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[
        { title: "Lead Conversion Report",  desc: "Track leads from source to conversion",  color: "blue",   tag: "CRM" },
        { title: "Monthly Revenue Report",  desc: "Revenue breakdown by clinic and month",  color: "green",  tag: "Finance" },
        { title: "Appointment Summary",     desc: "Appointment trends and no-show rates",   color: "purple", tag: "Operations" },
        { title: "Patient Growth Report",   desc: "New vs returning patient trends",        color: "amber",  tag: "Patients" },
        { title: "AI Performance Report",   desc: "AI automation results and efficiency",   color: "cyan",   tag: "AI" },
        { title: "Staff Activity Report",   desc: "Task completion and team performance",   color: "slate",  tag: "Staff" },
      ].map((r, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <Badge color={r.color}>{r.tag}</Badge>
            <span className="text-xs text-slate-400">PDF</span>
          </div>
          <p className="font-semibold text-slate-900">{r.title}</p>
          <p className="text-xs text-slate-500">{r.desc}</p>
        </div>
      ))}
    </div>
    <DevBanner text="Full Reports module is under development" />
  </div>
);

// ── Clinics ────────────────────────────────────────────────────
const ClinicsView = () => (
  <div className="space-y-6">
    <PageHeader title="Clinics" description="Manage clinic branches and details" action="+ Add Clinic" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Clinics"  value="4"   sub="All branches" />
      <StatCard label="Active"         value="4"   sub="Fully operational" />
      <StatCard label="Total Staff"    value="32"  sub="Across all clinics" />
      <StatCard label="Avg Rating"     value="4.8" sub="Patient satisfaction" />
    </div>
    <Table
      headers={["Clinic Name", "Manager", "City", "Staff", "Status"]}
      rows={[
        ["Downtown Dental Excellence",  "Dr. Aisha Khan",   "Riyadh", "10", <Badge color="green">Active</Badge>],
        ["Apex Orthodontics & Smiles",  "Dr. Omar Hassan",  "Jeddah", "8",  <Badge color="green">Active</Badge>],
        ["Westside Pediatric & Family", "Dr. Sara Ahmed",   "Riyadh", "7",  <Badge color="green">Active</Badge>],
        ["Metro Cosmetic Care",         "Dr. Khalid Nasser","Dammam", "7",  <Badge color="green">Active</Badge>],
      ]}
    />
    <DevBanner text="Full Clinic Management is under development" />
  </div>
);

// ── Users ──────────────────────────────────────────────────────
const UsersView = lazy(() => import("@/features/users/UsersView"));

// ── Notifications ──────────────────────────────────────────────
const NotificationsView = () => (
  <div className="space-y-6">
    <PageHeader title="Notifications" description="System and activity notifications" />
    <div className="space-y-3">
      {[
        { title: "New lead assigned",              desc: "Ahmed Al-Rashidi was assigned to you from Google Ads",    time: "5 minutes ago",  dot: "bg-blue-500" },
        { title: "Appointment confirmed",          desc: "Sara Johnson confirmed her appointment for Aug 3, 10:30 AM",time: "20 minutes ago", dot: "bg-green-500" },
        { title: "Payment received",               desc: "Khalid Mansour paid $1,500 via Bank Transfer",           time: "1 hour ago",      dot: "bg-emerald-500" },
        { title: "AI automation completed",        desc: "Lead nurturing sequence ran for 12 leads successfully",  time: "2 hours ago",     dot: "bg-purple-500" },
        { title: "Missed call follow-up needed",   desc: "3 calls were missed this morning and need follow-up",    time: "3 hours ago",     dot: "bg-amber-500" },
        { title: "Monthly report generated",       desc: "July 2026 revenue report is ready to download",         time: "1 day ago",       dot: "bg-slate-400" },
      ].map((n, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
          </div>
          <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
    <DevBanner text="Full Notifications centre is under development" />
  </div>
);

// ── AI Copilot ─────────────────────────────────────────────────
const AiCopilotView = () => (
  <div className="space-y-6">
    <PageHeader title="AI Copilot" description="Your intelligent assistant for clinic operations" />
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50">
        {[
          { role: "ai",   text: "Hello! I'm your AI Copilot. I can help you analyze leads, draft follow-up messages, summarize reports, and much more. What would you like to do today?" },
          { role: "user", text: "How many leads came in this week?" },
          { role: "ai",   text: "This week you received 47 new leads. Google Ads contributed the most with 18 leads (38%), followed by Instagram with 14 leads (30%), and referrals with 9 leads (19%). Your best performing day was Wednesday with 12 new leads." },
          { role: "user", text: "Which leads need follow-up today?" },
          { role: "ai",   text: "You have 8 leads that need follow-up today. The highest priority is Ahmed Al-Rashidi who was qualified 3 days ago with no contact, followed by 3 leads from last week's Google Ads campaign that haven't been called yet. Would you like me to draft follow-up messages for them?" },
        ].map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Ask your AI Copilot anything..."
          readOnly
        />
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Send</button>
      </div>
    </div>
    <DevBanner text="AI Copilot full integration is under development" />
  </div>
);

// ── Profile ────────────────────────────────────────────────────
const ProfileView = lazy(() => import("@/features/profile/ProfileView"));

// ── Treatments Config ──────────────────────────────────────────
const TreatmentsConfigView = () => (
  <div className="space-y-6">
    <PageHeader title="Treatments Configuration" description="Manage available dental treatments and pricing" action="+ Add Treatment" />
    <Table
      headers={["Treatment", "Category", "Duration", "Base Price", "Status"]}
      rows={[
        ["Teeth Cleaning",     "Preventive",  "45 min",  "$80",    <Badge color="green">Active</Badge>],
        ["Root Canal",         "Restorative", "90 min",  "$650",   <Badge color="green">Active</Badge>],
        ["Teeth Whitening",    "Cosmetic",    "60 min",  "$250",   <Badge color="green">Active</Badge>],
        ["Dental Implant",     "Surgical",    "120 min", "$1,500", <Badge color="green">Active</Badge>],
        ["Orthodontic Consult","Orthodontic", "30 min",  "$100",   <Badge color="green">Active</Badge>],
        ["Tooth Extraction",   "Surgical",    "30 min",  "$150",   <Badge color="amber">Review</Badge>],
      ]}
    />
    <DevBanner text="Full Treatments Configuration is under development" />
  </div>
);

// ── Lead Sources ────────────────────────────────────────────────
const LeadSourcesView = () => (
  <div className="space-y-6">
    <PageHeader title="Lead Sources Configuration" description="Configure and track where your leads come from" action="+ Add Source" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Sources" value="8"    sub="Active channels" />
      <StatCard label="Best Performer"value="Google Ads" sub="38% of leads" />
      <StatCard label="This Month"    value="284"  sub="Total leads" />
      <StatCard label="Avg Conv. Rate"value="6.9%" sub="Source average" />
    </div>
    <Table
      headers={["Source Name", "Type", "Leads This Month", "Conv. Rate", "Status"]}
      rows={[
        ["Google Ads",     "Paid",    "108", "8.3%", <Badge color="green">Active</Badge>],
        ["Instagram",      "Social",  "79",  "5.1%", <Badge color="green">Active</Badge>],
        ["Website",        "Organic", "52",  "7.7%", <Badge color="green">Active</Badge>],
        ["WhatsApp",       "Direct",  "28",  "9.2%", <Badge color="green">Active</Badge>],
        ["Referral",       "Referral","17",  "11.8%",<Badge color="green">Active</Badge>],
        ["TV Advertisement","Offline","0",   "0%",   <Badge color="amber">Paused</Badge>],
      ]}
    />
    <DevBanner text="Full Lead Sources Configuration is under development" />
  </div>
);

// ── Lead Statuses ────────────────────────────────────────────────
const LeadStatusesView = () => (
  <div className="space-y-6">
    <PageHeader title="Lead Statuses Configuration" description="Define and manage lead pipeline stages" action="+ Add Status" />
    <Table
      headers={["Status Name", "Color", "Order", "Leads Count", "Actions"]}
      rows={[
        ["New",        <Badge color="blue">Blue</Badge>,    "1", "156", "Edit / Delete"],
        ["Contacted",  <Badge color="amber">Amber</Badge>,  "2", "89",  "Edit / Delete"],
        ["Qualified",  <Badge color="purple">Purple</Badge>,"3", "67",  "Edit / Delete"],
        ["Proposal",   <Badge color="blue">Cyan</Badge>,    "4", "34",  "Edit / Delete"],
        ["Converted",  <Badge color="green">Green</Badge>,  "5", "89",  "Edit / Delete"],
        ["Lost",       <Badge color="red">Red</Badge>,      "6", "49",  "Edit / Delete"],
      ]}
    />
    <DevBanner text="Full Lead Statuses Configuration is under development" />
  </div>
);

// ── AI Runs ──────────────────────────────────────────────────────
const AiRunsView = () => (
  <div className="space-y-6">
    <PageHeader title="AI Runs" description="Monitor AI automation execution history" action="Trigger Run" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Runs"   value="1,842" sub="All time" />
      <StatCard label="Today"        value="47"    sub="Since midnight" />
      <StatCard label="Success Rate" value="98.3%" sub="+0.5% vs last week" />
      <StatCard label="Avg Duration" value="1.2s"  sub="Per execution" />
    </div>
    <Table
      headers={["Run ID", "Automation", "Trigger", "Duration", "Status", "Time"]}
      rows={[
        ["RUN-4829", "Lead Welcome Message",   "New Lead Created",  "0.8s",  <Badge color="green">Success</Badge>, "Aug 3 — 12:05 PM"],
        ["RUN-4828", "Appointment Reminder",   "24h Before Appt",   "1.1s",  <Badge color="green">Success</Badge>, "Aug 3 — 11:00 AM"],
        ["RUN-4827", "Follow-up Sequence",     "Lead Inactive 3d",  "2.3s",  <Badge color="amber">Warning</Badge>, "Aug 3 — 10:30 AM"],
        ["RUN-4826", "Payment Confirmation",   "Payment Received",  "0.5s",  <Badge color="green">Success</Badge>, "Aug 3 — 10:00 AM"],
        ["RUN-4825", "Lead Score Update",      "Scheduled Daily",   "5.1s",  <Badge color="red">Failed</Badge>,    "Aug 3 — 09:00 AM"],
      ]}
    />
    <DevBanner text="Full AI Runs monitoring is under development" />
  </div>
);

// ── AI Automations ────────────────────────────────────────────────
const AiAutomationsView = () => (
  <div className="space-y-6">
    <PageHeader title="AI Automations" description="Build and manage AI-powered workflows" action="+ New Automation" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total"   value="14"  sub="Configured" />
      <StatCard label="Active"  value="11"  sub="Running" />
      <StatCard label="Paused"  value="3"   sub="Temporarily stopped" />
      <StatCard label="Runs Today" value="47" sub="Executions" />
    </div>
    <Table
      headers={["Automation Name", "Trigger", "Actions", "Runs Today", "Status"]}
      rows={[
        ["New Lead Welcome",        "Lead Created",       "Send WhatsApp + Email",    "18", <Badge color="green">Active</Badge>],
        ["Appointment Reminder",    "24h Before Appt",    "Send SMS + Email",         "12", <Badge color="green">Active</Badge>],
        ["Follow-up Sequence",      "No Contact 3 Days",  "Send Email → Call Task",   "8",  <Badge color="green">Active</Badge>],
        ["Payment Receipt",         "Payment Confirmed",  "Send Email + Receipt PDF", "9",  <Badge color="green">Active</Badge>],
        ["Lost Lead Re-engagement", "Lead Marked Lost",   "Wait 7d → Send Offer",    "0",  <Badge color="amber">Paused</Badge>],
      ]}
    />
    <DevBanner text="Full AI Automations builder is under development" />
  </div>
);

// ── Website Content ───────────────────────────────────────────────
const WebsiteContentView = () => (
  <div className="space-y-6">
    <PageHeader title="Website Content" description="Manage your clinic website content and pages" action="+ New Page" />
    <div className="grid grid-cols-3 gap-4">
      {[
        { title: "Homepage",       desc: "Hero, services, testimonials",  status: "Published", tag: "Main" },
        { title: "Services",       desc: "All dental services listing",    status: "Published", tag: "Services" },
        { title: "Doctors",        desc: "Doctor profiles and specialties",status: "Published", tag: "Team" },
        { title: "Book Appointment",desc: "Online booking form & calendar",status: "Published", tag: "Booking" },
        { title: "Blog",           desc: "Dental health articles",         status: "Draft",     tag: "Content" },
        { title: "Contact",        desc: "Contact form and clinic locations",status:"Published", tag: "Contact" },
      ].map((p, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <Badge color="slate">{p.tag}</Badge>
            <Badge color={p.status === "Published" ? "green" : "amber"}>{p.status}</Badge>
          </div>
          <p className="font-semibold text-slate-900">{p.title}</p>
          <p className="text-xs text-slate-500">{p.desc}</p>
        </div>
      ))}
    </div>
    <DevBanner text="Full Website CMS is under development" />
  </div>
);

// ── Lead Forms ────────────────────────────────────────────────────
const LeadFormsView = () => (
  <div className="space-y-6">
    <PageHeader title="Lead Forms" description="Create and manage lead capture forms" action="+ New Form" />
    <Table
      headers={["Form Name", "Source", "Leads Captured", "Conv. Rate", "Status"]}
      rows={[
        ["Google Ads Landing Page Form", "Google Ads", "108", "8.3%",  <Badge color="green">Active</Badge>],
        ["Instagram Campaign Form",      "Instagram",  "79",  "5.1%",  <Badge color="green">Active</Badge>],
        ["Website Contact Form",         "Organic",    "52",  "7.7%",  <Badge color="green">Active</Badge>],
        ["WhatsApp Opt-in Form",         "WhatsApp",   "28",  "9.2%",  <Badge color="green">Active</Badge>],
        ["Ramadan Offer Form",           "Seasonal",   "12",  "12.5%", <Badge color="amber">Paused</Badge>],
      ]}
    />
    <DevBanner text="Full Lead Forms builder is under development" />
  </div>
);

// ── Integrations ──────────────────────────────────────────────────
const IntegrationsView = () => (
  <div className="space-y-6">
    <PageHeader title="Integrations" description="Connect your tools and third-party services" action="+ Add Integration" />
    <div className="grid grid-cols-3 gap-4">
      {[
        { name: "WhatsApp Business", category: "Messaging",  status: "Connected",     color: "green" },
        { name: "Google Ads",        category: "Marketing",  status: "Connected",     color: "green" },
        { name: "Twilio (SMS/Calls)",category: "Telephony",  status: "Connected",     color: "green" },
        { name: "Stripe",            category: "Payments",   status: "Connected",     color: "green" },
        { name: "Google Calendar",   category: "Scheduling", status: "Not Connected", color: "slate" },
        { name: "Mailchimp",         category: "Email",      status: "Not Connected", color: "slate" },
        { name: "Zapier",            category: "Automation", status: "Not Connected", color: "slate" },
        { name: "HubSpot CRM",       category: "CRM",        status: "Coming Soon",   color: "amber" },
        { name: "Salesforce",        category: "CRM",        status: "Coming Soon",   color: "amber" },
      ].map((integration, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <Badge color="slate">{integration.category}</Badge>
            <Badge color={integration.color}>{integration.status}</Badge>
          </div>
          <p className="font-semibold text-slate-900">{integration.name}</p>
        </div>
      ))}
    </div>
    <DevBanner text="Full Integrations hub is under development" />
  </div>
);

// ════════════════════════════════════════════════════════════════
// SHARED ROUTES EXPORT
// ════════════════════════════════════════════════════════════════

const fallback = (label) => <PageLoader label={label} />;

export const sharedRoutes = [
  // ── Always accessible (all roles) ───────────────────────────
  {
    index: true,
    element: <Navigate to="dashboard" replace />,
  },
  {
    path: "dashboard",
    element: <Suspense fallback={fallback("Loading Dashboard...")}><UnifiedDashboard /></Suspense>,
  },
  {
    path: "leads",
    element: <LeadsView />,
  },
  {
    path: "appointments",
    element: <AppointmentsView />,
  },
  {
    path: "patients",
    element: <PatientsView />,
  },
  {
    path: "calls",
    element: <CallsView />,
  },
  {
    path: "tasks",
    element: <TasksView />,
  },
  {
    path: "revenue",
    element: <RevenueView />,
  },
  {
    path: "reports",
    element: <ReportsView />,
  },
  {
    path: "clinics",
    element: <ClinicsView />,
  },
  {
    path: "users",
    element: <Suspense fallback={fallback("Loading Users...")}><UsersView /></Suspense>,
  },
  {
    path: "notifications",
    element: <NotificationsView />,
  },
  {
    path: "ai-copilot",
    element: <AiCopilotView />,
  },
  {
    path: "profile",
    element: <Suspense fallback={fallback("Loading Profile...")}><ProfileView /></Suspense>,
  },

  // ── Permission-gated (SA + OA only) ─────────────────────────
  {
    path: "payments",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_PAYMENTS} fallback={<Navigate to="/admin/dashboard" replace />}>
        <PaymentsView />
      </RoleGuard>
    ),
  },
  {
    path: "treatments-config",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_TREATMENTS} fallback={<Navigate to="/admin/dashboard" replace />}>
        <TreatmentsConfigView />
      </RoleGuard>
    ),
  },
  {
    path: "lead-sources",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_SOURCES} fallback={<Navigate to="/admin/dashboard" replace />}>
        <LeadSourcesView />
      </RoleGuard>
    ),
  },
  {
    path: "lead-statuses",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_STATUSES} fallback={<Navigate to="/admin/dashboard" replace />}>
        <LeadStatusesView />
      </RoleGuard>
    ),
  },
  {
    path: "ai-runs",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_AI_RUNS} fallback={<Navigate to="/admin/dashboard" replace />}>
        <AiRunsView />
      </RoleGuard>
    ),
  },
  {
    path: "ai-automations",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_AI_AUTOMATIONS} fallback={<Navigate to="/admin/dashboard" replace />}>
        <AiAutomationsView />
      </RoleGuard>
    ),
  },
  {
    path: "website-content",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_WEBSITE_CONTENT} fallback={<Navigate to="/admin/dashboard" replace />}>
        <WebsiteContentView />
      </RoleGuard>
    ),
  },
  {
    path: "lead-forms",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_FORMS} fallback={<Navigate to="/admin/dashboard" replace />}>
        <LeadFormsView />
      </RoleGuard>
    ),
  },
  {
    path: "integrations",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_INTEGRATIONS} fallback={<Navigate to="/admin/dashboard" replace />}>
        <IntegrationsView />
      </RoleGuard>
    ),
  },
];
