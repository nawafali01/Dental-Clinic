import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { PERMISSIONS } from "@/dashboard/shared/config/permissions";
import { useAuth } from "@/context/AuthContext";
import { useClinic } from "@/context/ClinicContext";
import { storageService } from "@/services/storage.service";
import { scopeData } from "@/utils/scopeData";
import {
  reportsList,
  notificationsList,
  aiCopilotInitialMessages,
  treatmentsConfigRows,
  leadSourcesRows,
  leadStatusesRows,
  aiRunsRows,
  aiAutomationsRows,
  websitePagesList,
  leadFormsRows,
  integrationsList,
  patientCheckInRows,
  rescheduleRequestsRows,
} from "@/data/routesData";

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
// SHARED STUB VIEWS (Data-Scoped)
// ════════════════════════════════════════════════════════════════

// ── Leads ────────────────────────────────────────────────────
const LeadsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawLeads = storageService.get(storageService.KEYS.LEADS) || [];
  const leads = scopeData({ resource: 'leads', data: rawLeads, currentUser, selectedClinicId });

  const total = leads.length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const qualifiedCount = leads.filter(l => l.status === 'qualified').length;
  const convertedCount = leads.filter(l => l.status === 'converted').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Track and manage your lead pipeline" action="+ New Lead" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={total} sub="Scoped dataset" />
        <StatCard label="New Today" value={newCount} sub="Needs contact" />
        <StatCard label="Qualified" value={qualifiedCount} sub="In pipeline" />
        <StatCard label="Converted" value={convertedCount} sub="Won" />
      </div>
      <Table
        headers={["Lead Name", "Status", "Source", "Clinic", "Date"]}
        rows={leads.map(l => [
          l.patientName || l.name,
          <Badge color={l.status === 'converted' ? 'green' : l.status === 'qualified' ? 'purple' : l.status === 'lost' ? 'red' : 'blue'}>{l.status}</Badge>,
          l.source || 'Website',
          l.clinicId || 'Downtown Dental',
          l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '2026-08-03'
        ])}
      />
      <DevBanner text="Full Leads CRM is under development" />
    </div>
  );
};

// ── Appointments ─────────────────────────────────────────────
const AppointmentsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawAppts = storageService.get(storageService.KEYS.APPOINTMENTS) || [];
  const appts = scopeData({ resource: 'appointments', data: rawAppts, currentUser, selectedClinicId });

  const total = appts.length;
  const scheduled = appts.filter(a => a.status === 'scheduled').length;
  const pending = appts.filter(a => a.status === 'pending').length;
  const completed = appts.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Schedule and manage patient appointments" action="+ New Appointment" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Appts" value={total} sub="Scoped dataset" />
        <StatCard label="Scheduled" value={scheduled} sub="Upcoming" />
        <StatCard label="Pending" value={pending} sub="Needs confirmation" />
        <StatCard label="Completed" value={completed} sub="Past visits" />
      </div>
      <Table
        headers={["Patient ID / Name", "Clinic", "Date & Time", "Status"]}
        rows={appts.map(a => [
          a.patientName || a.patientId || 'Patient Record',
          a.clinicId || 'Downtown Dental',
          a.date ? new Date(a.date).toLocaleString() : 'Aug 3 — 09:00 AM',
          <Badge color={a.status === 'completed' ? 'green' : a.status === 'pending' ? 'amber' : 'blue'}>{a.status}</Badge>
        ])}
      />
      <DevBanner text="Full Appointment Scheduling is under development" />
    </div>
  );
};

// ── Patients ─────────────────────────────────────────────────
const PatientsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawPatients = storageService.get(storageService.KEYS.PATIENTS) || [];
  const patients = scopeData({ resource: 'patients', data: rawPatients, currentUser, selectedClinicId });

  const total = patients.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description="Patient records and history" action="+ Add Patient" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={total} sub="Scoped dataset" />
        <StatCard label="Active" value={total} sub="In active clinic scope" />
        <StatCard label="New This Month" value={Math.ceil(total * 0.4)} sub="Recent signups" />
        <StatCard label="Records" value={total} sub="Verified records" />
      </div>
      <Table
        headers={["Patient Name", "Phone", "Clinic ID", "Status"]}
        rows={patients.map(p => [
          p.fullName || p.name || 'John Doe',
          p.phone || '+1-555-0000',
          p.clinicId || 'Downtown Dental',
          <Badge color="green">Active</Badge>
        ])}
      />
      <DevBanner text="Full Patient Records module is under development" />
    </div>
  );
};

// ── Calls ─────────────────────────────────────────────────────
const CallsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawCalls = storageService.get(storageService.KEYS.CALLS) || [];
  const calls = scopeData({ resource: 'calls', data: rawCalls, currentUser, selectedClinicId });

  const total = calls.length;
  const booked = calls.filter(c => c.outcome === 'booked').length;
  const missed = calls.filter(c => c.outcome === 'missed' || c.outcome === 'no-answer').length;
  const contacted = calls.filter(c => c.outcome === 'contacted').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Calls" description="Track all inbound and outbound calls" action="+ Log Call" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={total} sub="Scoped dataset" />
        <StatCard label="Booked" value={booked} sub="Successful bookings" />
        <StatCard label="Contacted" value={contacted} sub="In conversation" />
        <StatCard label="Missed / Unanswered" value={missed} sub="Follow-up needed" />
      </div>
      <Table
        headers={["Caller / Lead", "Duration", "Outcome", "Date & Time"]}
        rows={calls.map(c => [
          c.leadName || 'Caller',
          c.duration ? `${Math.floor(c.duration / 60)}m ${c.duration % 60}s` : '0m 0s',
          <Badge color={c.outcome === 'booked' ? 'green' : c.outcome === 'missed' ? 'red' : 'amber'}>{c.outcome}</Badge>,
          c.date ? new Date(c.date).toLocaleString() : 'Aug 3 — 09:15 AM'
        ])}
      />
      <DevBanner text="Full Call Tracking module is under development" />
    </div>
  );
};

// ── Tasks ─────────────────────────────────────────────────────
const TasksView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawTasks = storageService.get(storageService.KEYS.TASKS) || [];
  const tasks = scopeData({ resource: 'tasks', data: rawTasks, currentUser, selectedClinicId });

  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const highPriority = tasks.filter(t => t.priority === 'high').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Manage team tasks and follow-ups" action="+ New Task" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={total} sub="Assigned to your scope" />
        <StatCard label="Pending" value={pending} sub="Needs attention" />
        <StatCard label="High Priority" value={highPriority} sub="Urgent" />
        <StatCard label="Completed" value={completed} sub="Finished tasks" />
      </div>
      <Table
        headers={["Task / Lead", "Type", "Due Time", "Priority", "Status"]}
        rows={tasks.map(t => [
          t.leadName || t.taskType,
          t.taskType || 'Follow-up',
          t.dueTime || '09:00',
          <Badge color={t.priority === 'high' ? 'red' : 'amber'}>{t.priority}</Badge>,
          <Badge color={t.status === 'completed' ? 'green' : 'amber'}>{t.status}</Badge>
        ])}
      />
      <DevBanner text="Full Task Management module is under development" />
    </div>
  );
};

// ── Revenue ────────────────────────────────────────────────────
const RevenueView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawRev = storageService.get(storageService.KEYS.REVENUE) || [];
  const rev = scopeData({ resource: 'revenue', data: rawRev, currentUser, selectedClinicId });

  const totalAmount = rev.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount);

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" description="Financial overview and revenue tracking" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formattedTotal} sub="Scoped dataset" />
        <StatCard label="Monthly Records" value={rev.length} sub="Filtered stats" />
        <StatCard label="Avg Revenue" value={rev.length > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount / rev.length) : '$0'} sub="Average per record" />
        <StatCard label="Scope" value={currentUser?.role === 'super_admin' ? 'Global' : 'Scoped'} sub="Row-level active" />
      </div>
      <Table
        headers={["Clinic / Scope", "Month", "Revenue", "Conversions", "Conv. Rate"]}
        rows={rev.map(r => [
          r.clinicId || 'Downtown Dental',
          r.month,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(r.revenue),
          r.conversions,
          `${r.conversionRate}%`
        ])}
      />
      <DevBanner text="Full Revenue Dashboard is under development" />
    </div>
  );
};

// ── Payments ──────────────────────────────────────────────────
const PaymentsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawRev = storageService.get(storageService.KEYS.REVENUE) || [];
  const rev = scopeData({ resource: 'payments', data: rawRev, currentUser, selectedClinicId });

  const totalAmount = rev.reduce((acc, r) => acc + (r.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track and manage all patient payments" action="+ Record Payment" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Collected" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount)} sub="Scoped payments" />
        <StatCard label="Records" value={rev.length} sub="Processed" />
        <StatCard label="Status" value="Verified" sub="In scope" />
        <StatCard label="Pending" value="$0" sub="All clear" />
      </div>
      <Table
        headers={["Clinic Scope", "Period", "Collected Amount", "Status"]}
        rows={rev.map(r => [
          r.clinicId || 'Downtown Dental',
          r.month,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(r.revenue),
          <Badge color="green">Paid</Badge>
        ])}
      />
      <DevBanner text="Full Payments module is under development" />
    </div>
  );
};

// ── Reports ────────────────────────────────────────────────────
const ReportsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const reports = scopeData({ resource: 'reports', data: reportsList, currentUser, selectedClinicId });

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analytics and performance reports" action="Generate Report" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={reports.length} sub="Available in scope" />
        <StatCard label="Scheduled" value={Math.min(reports.length, 3)} sub="Automated" />
        <StatCard label="Scope" value={currentUser?.role} sub="Access level" />
        <StatCard label="Status" value="Ready" sub="PDF exports" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {reports.map((r, i) => (
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
};

// ── Clinics ────────────────────────────────────────────────────
const ClinicsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawClinics = storageService.get(storageService.KEYS.CLINICS) || [];
  const clinics = scopeData({ resource: 'clinics', data: rawClinics, currentUser, selectedClinicId });

  return (
    <div className="space-y-6">
      <PageHeader title="Clinics" description="Manage clinic branches and details" action="+ Add Clinic" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Clinics" value={clinics.length} sub="In scope" />
        <StatCard label="Active" value={clinics.length} sub="Operational" />
        <StatCard label="Status" value="Online" sub="Synced" />
        <StatCard label="Avg Rating" value="4.8" sub="Patient satisfaction" />
      </div>
      <Table
        headers={["Clinic Name", "City", "Clinic ID", "Status"]}
        rows={clinics.map(c => [
          c.name,
          c.city,
          c.id,
          <Badge color="green">Active</Badge>
        ])}
      />
      <DevBanner text="Full Clinic Management is under development" />
    </div>
  );
};


// ── Users ──────────────────────────────────────────────────────
const UsersView = lazy(() => import("@/features/users/UsersView"));

// ── Notifications ──────────────────────────────────────────────
const NotificationsView = () => (
  <div className="space-y-6">
    <PageHeader title="Notifications" description="System and activity notifications" />
    <div className="space-y-3">
      {notificationsList.map((n, i) => (
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
        {aiCopilotInitialMessages.map((msg, i) => (
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
      rows={treatmentsConfigRows.map((t) => [
        t.treatment,
        t.category,
        t.duration,
        t.price,
        <Badge color={t.color}>{t.status}</Badge>,
      ])}
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
      rows={leadSourcesRows.map((s) => [
        s.source,
        s.type,
        s.leads,
        s.rate,
        <Badge color={s.color}>{s.status}</Badge>,
      ])}
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
      rows={leadStatusesRows.map((s) => [
        s.name,
        <Badge color={s.color}>{s.color.charAt(0).toUpperCase() + s.color.slice(1)}</Badge>,
        s.order,
        s.leads,
        s.actions,
      ])}
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
      rows={aiRunsRows.map((r) => [
        r.id,
        r.automation,
        r.trigger,
        r.duration,
        <Badge color={r.color}>{r.status}</Badge>,
        r.timestamp,
      ])}
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
      rows={aiAutomationsRows.map((a) => [
        a.name,
        a.trigger,
        a.actions,
        a.runsToday,
        <Badge color={a.color}>{a.status}</Badge>,
      ])}
    />
    <DevBanner text="Full AI Automations builder is under development" />
  </div>
);

// ── Website Content ───────────────────────────────────────────────
const WebsiteContentView = () => (
  <div className="space-y-6">
    <PageHeader title="Website Content" description="Manage your clinic website content and pages" action="+ New Page" />
    <div className="grid grid-cols-3 gap-4">
      {websitePagesList.map((p, i) => (
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
      rows={leadFormsRows.map((f) => [
        f.name,
        f.source,
        f.leads,
        f.rate,
        <Badge color={f.color}>{f.status}</Badge>,
      ])}
    />
    <DevBanner text="Full Lead Forms builder is under development" />
  </div>
);

// ── Integrations ──────────────────────────────────────────────────
const IntegrationsView = () => (
  <div className="space-y-6">
    <PageHeader title="Integrations" description="Connect your tools and third-party services" action="+ Add Integration" />
    <div className="grid grid-cols-3 gap-4">
      {integrationsList.map((integration, i) => (
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

// ── Patient Check-In ──────────────────────────────────────────────
const PatientCheckInView = () => (
  <div className="space-y-6">
    <PageHeader title="Patient Check-In" description="Manage patient check-in and queue" action="Check In Patient" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Checked In" value="8" sub="Currently waiting" />
      <StatCard label="In Treatment" value="4" sub="With doctor" />
      <StatCard label="Completed Today" value="22" sub="Checked out" />
      <StatCard label="Avg Wait Time" value="12m" sub="Target: <15m" />
    </div>
    <Table
      headers={["Patient Name", "Doctor", "Arrival Time", "Status", "Action"]}
      rows={patientCheckInRows.map((p) => [
        p.name,
        p.doctor,
        p.arrivalTime,
        <Badge color={p.color}>{p.status}</Badge>,
        p.actionText,
      ])}
    />
    <DevBanner text="Full Patient Check-In & Queue Management is under development" />
  </div>
);

// ── Reschedule ────────────────────────────────────────────────────
const RescheduleView = () => (
  <div className="space-y-6">
    <PageHeader title="Reschedule Appointments" description="Quickly reschedule patient appointments" />
    <Table
      headers={["Patient Name", "Original Slot", "Requested Slot", "Reason", "Status"]}
      rows={rescheduleRequestsRows.map((r) => [
        r.patientName,
        r.originalSlot,
        r.requestedSlot,
        r.reason,
        <Badge color={r.color}>{r.status}</Badge>,
      ])}
    />
    <DevBanner text="Quick Reschedule module is under development" />
  </div>
);

// ── My Schedule ───────────────────────────────────────────────────
const MyScheduleView = () => (
  <div className="space-y-6">
    <PageHeader title="My Schedule" description="Your daily desk schedule and assigned tasks" />
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Shift" value="08:00 - 16:00" sub="Morning Desk" />
      <StatCard label="Check-Ins Done" value="18" sub="Today" />
      <StatCard label="Pending Reminders" value="5" sub="To call" />
    </div>
    <DevBanner text="Personal Receptionist Schedule view is under development" />
  </div>
);

// ════════════════════════════════════════════════════════════════
// SHARED ROUTES EXPORT
// ════════════════════════════════════════════════════════════════

const fallback = (label) => <PageLoader label={label} />;

export const sharedRoutes = [
  // ── Always accessible (all logged-in roles) ─────────────────
  {
    index: true,
    element: <Navigate to="dashboard" replace />,
  },
  {
    path: "dashboard",
    element: <Suspense fallback={fallback("Loading Dashboard...")}><UnifiedDashboard /></Suspense>,
  },

  // ── Resource-gated routes (protected via RoleGuard) ──────────
  {
    path: "leads",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_LEADS}>
        <LeadsView />
      </RoleGuard>
    ),
  },
  {
    path: "appointments",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}>
        <AppointmentsView />
      </RoleGuard>
    ),
  },
  {
    path: "patients",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_PATIENTS}>
        <PatientsView />
      </RoleGuard>
    ),
  },
  {
    path: "calls",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_CALLS}>
        <CallsView />
      </RoleGuard>
    ),
  },
  {
    path: "tasks",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_TASKS}>
        <TasksView />
      </RoleGuard>
    ),
  },
  {
    path: "revenue",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_REVENUE}>
        <RevenueView />
      </RoleGuard>
    ),
  },
  {
    path: "reports",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_REPORTS}>
        <ReportsView />
      </RoleGuard>
    ),
  },
  {
    path: "clinics",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_CLINICS}>
        <ClinicsView />
      </RoleGuard>
    ),
  },
  {
    path: "users",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_USERS}>
        <Suspense fallback={fallback("Loading Users...")}><UsersView /></Suspense>
      </RoleGuard>
    ),
  },
  {
    path: "patient-checkin",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}>
        <PatientCheckInView />
      </RoleGuard>
    ),
  },
  {
    path: "reschedule",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}>
        <RescheduleView />
      </RoleGuard>
    ),
  },
  {
    path: "my-schedule",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_APPOINTMENTS}>
        <MyScheduleView />
      </RoleGuard>
    ),
  },
  {
    path: "notifications",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_NOTIFICATIONS}>
        <NotificationsView />
      </RoleGuard>
    ),
  },
  {
    path: "ai-copilot",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_AI_COPILOT}>
        <AiCopilotView />
      </RoleGuard>
    ),
  },
  {
    path: "profile",
    element: <Suspense fallback={fallback("Loading Profile...")}><ProfileView /></Suspense>,
  },

  // ── Config & Admin Routes ──────────────────────────────────
  {
    path: "payments",
    element: (
      <RoleGuard permission={PERMISSIONS.VIEW_PAYMENTS}>
        <PaymentsView />
      </RoleGuard>
    ),
  },
  {
    path: "treatments-config",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_TREATMENTS}>
        <TreatmentsConfigView />
      </RoleGuard>
    ),
  },
  {
    path: "lead-sources",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_SOURCES}>
        <LeadSourcesView />
      </RoleGuard>
    ),
  },
  {
    path: "lead-statuses",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_STATUSES}>
        <LeadStatusesView />
      </RoleGuard>
    ),
  },
  {
    path: "ai-runs",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_AI_RUNS}>
        <AiRunsView />
      </RoleGuard>
    ),
  },
  {
    path: "ai-automations",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_AI_AUTOMATIONS}>
        <AiAutomationsView />
      </RoleGuard>
    ),
  },
  {
    path: "website-content",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_WEBSITE_CONTENT}>
        <WebsiteContentView />
      </RoleGuard>
    ),
  },
  {
    path: "lead-forms",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_LEAD_FORMS}>
        <LeadFormsView />
      </RoleGuard>
    ),
  },
  {
    path: "integrations",
    element: (
      <RoleGuard permission={PERMISSIONS.MANAGE_INTEGRATIONS}>
        <IntegrationsView />
      </RoleGuard>
    ),
  },
];
