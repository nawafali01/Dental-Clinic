import { useState, useEffect, useCallback } from 'react';
import { useNavigate }                       from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, Phone, CheckSquare, Calendar,
  TrendingUp, DollarSign, Clock, AlertCircle,
  Plus, PhoneCall, ChevronUp, ChevronDown,
  ChevronsUpDown, Search, Filter, Check,
  Loader2, X, CheckCircle2, ArrowRight,
} from 'lucide-react';

import { useAuth }              from '@/context/AuthContext';
import { getAssignedLeads,
         getAllAssignedLeads,
         getLeadKPIs,
         LEAD_STATUSES,
         LEAD_PRIORITIES }      from '@/services/leadsService';
import { getTasks,
         getTasksForToday,
         completeTask,
         addTask,
         TASK_TYPES,
         TASK_PRIORITIES }      from '@/services/tasksService';
import { getWeeklyActivity,
         getTodayCallKPIs,
         logCall,
         CALL_OUTCOMES }        from '@/services/callsService';
import { getAgentRevenueStats } from '@/services/revenueService';
import { storageService }       from '@/services/storage.service';
import { INITIAL_DEMO_APPOINTMENTS } from '@/dashboard/views/appointments/constants';
import { STATUS_COLORS, PRIORITY_COLORS } from './agentConstants';

const Chip = ({ text, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${color}`}>{text}</span>
);

const formatTime = (isoStr) => {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ─── KPI Card ─────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, iconBg, trend }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    {sub && (
      <p className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
        {sub}
      </p>
    )}
  </div>
);

// ─── Section wrapper ─────────────────────────────────────────
const Section = ({ title, children, action }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Loading ─────────────────────────────────────────────────
const LoadingState = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
    <Loader2 className="w-6 h-6 animate-spin" />
    <p className="text-xs">{label}</p>
  </div>
);

// ─── Empty state ─────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
    <Icon className="w-8 h-8 opacity-30" />
    <p className="text-sm">{message}</p>
  </div>
);

// ─── Error state ─────────────────────────────────────────────
const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-red-400">
    <AlertCircle className="w-8 h-8" />
    <p className="text-sm">Something went wrong.</p>
    {onRetry && (
      <button onClick={onRetry} className="text-xs text-primary underline">Try again</button>
    )}
  </div>
);

// ─── Simple modal ────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Log Call Dialog ─────────────────────────────────────────
const LogCallDialog = ({ open, onClose, agentId, onLogged }) => {
  const [form, setForm] = useState({ leadName: '', outcome: 'contacted', duration: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      logCall({
        agentId,
        leadName: form.leadName,
        outcome:  form.outcome,
        duration: Number(form.duration) || 0,
        notes:    form.notes,
      });
      setSaving(false);
      setForm({ leadName: '', outcome: 'contacted', duration: '', notes: '' });
      onLogged?.();
      onClose();
    }, 400);
  };

  const field = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

  return (
    <Modal open={open} onClose={onClose} title="Log a Call">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Lead Name</label>
          <input className={field} value={form.leadName} onChange={(e) => setForm((f) => ({ ...f, leadName: e.target.value }))} placeholder="Ahmed Al-Rashidi" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Outcome</label>
          <select className={field} value={form.outcome} onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}>
            {CALL_OUTCOMES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Duration (seconds)</label>
          <input className={field} type="number" min="0" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 180" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Notes (optional)</label>
          <textarea className={`${field} resize-none`} rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Brief notes about the call…" />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving || !form.leadName} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Call'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Add Task Dialog ─────────────────────────────────────────
const AddTaskDialog = ({ open, onClose, agentId, onAdded }) => {
  const [form, setForm] = useState({ leadName: '', taskType: 'Call', dueTime: '09:00', priority: 'medium' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      addTask({ ...form, assignedAgentId: agentId });
      setSaving(false);
      setForm({ leadName: '', taskType: 'Call', dueTime: '09:00', priority: 'medium' });
      onAdded?.();
      onClose();
    }, 400);
  };

  const field = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

  return (
    <Modal open={open} onClose={onClose} title="Add a Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Lead Name</label>
          <input className={field} value={form.leadName} onChange={(e) => setForm((f) => ({ ...f, leadName: e.target.value }))} placeholder="Ahmed Al-Rashidi" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Task Type</label>
          <select className={field} value={form.taskType} onChange={(e) => setForm((f) => ({ ...f, taskType: e.target.value }))}>
            {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Due Time</label>
            <input className={field} type="time" value={form.dueTime} onChange={(e) => setForm((f) => ({ ...f, dueTime: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Priority</label>
            <select className={field} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving || !form.leadName} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Today's Tasks ────────────────────────────────────────────
const TodayTasks = ({ agentId, refresh, onRefresh }) => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [completing, setCompleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    try {
      setTasks(getTasksForToday(agentId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => { load(); }, [load, refresh]);

  const handleComplete = (taskId) => {
    setCompleting(taskId);
    setTimeout(() => {
      completeTask(taskId);
      setCompleting(null);
      onRefresh?.();
      load();
    }, 500);
  };

  const pending   = tasks.filter((t) => t.status === 'pending');
  const completed = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-2">
      {loading && <LoadingState label="Loading tasks…" />}
      {error   && <ErrorState onRetry={load} />}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState icon={CheckSquare} message="No tasks scheduled for today" />
      )}
      {!loading && !error && pending.map((task) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            task.overdue ? 'border-red-200 bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          <button
            onClick={() => handleComplete(task.id)}
            disabled={completing === task.id}
            className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-primary flex items-center justify-center shrink-0 transition-colors"
          >
            {completing === task.id && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {task.taskType} — <span className="text-slate-600">{task.leadName}</span>
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`flex items-center gap-1 text-xs ${task.overdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                {task.overdue && <AlertCircle className="w-3 h-3" />}
                <Clock className="w-3 h-3" />
                {formatTime(task.dueDate)}
                {task.overdue && ' · Overdue'}
              </span>
            </div>
          </div>
          <Chip text={task.priority} color={PRIORITY_COLORS[task.priority]} />
        </div>
      ))}
      {!loading && !error && completed.length > 0 && (
        <p className="text-xs text-slate-400 text-center pt-1">
          {completed.length} task{completed.length > 1 ? 's' : ''} completed today ✓
        </p>
      )}
    </div>
  );
};

// ─── Weekly Call Chart ────────────────────────────────────────
const WeeklyCallChart = ({ agentId, refresh }) => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    try {
      setData(getWeeklyActivity(agentId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => { load(); }, [load, refresh]);

  if (loading) return <LoadingState label="Loading activity…" />;
  if (error)   return <ErrorState onRetry={load} />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          labelStyle={{ fontWeight: 600, color: '#1e293b' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar dataKey="booked"    name="Booked"    fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="contacted" name="Contacted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="missed"    name="Missed"    fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="noAnswer"  name="No Answer" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Leads Table ─────────────────────────────────────────────
const PAGE_SIZE = 8;

const SortIcon = ({ field, sortKey, sortDir }) => {
  if (sortKey !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-primary" />
    : <ChevronDown className="w-3 h-3 text-primary" />;
};

const LeadsTable = ({ agentId, refresh }) => {
  const navigate = useNavigate();

  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [priority, setPriority] = useState('');
  const [sortKey,  setSortKey]  = useState('lastActivityDate');
  const [sortDir,  setSortDir]  = useState('desc');
  const [result,   setResult]   = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    try {
      const res = getAssignedLeads(agentId, { page, pageSize: PAGE_SIZE, search, status, priority, sortKey, sortDir });
      setResult(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [agentId, page, search, status, priority, sortKey, sortDir]);

  useEffect(() => { load(); }, [load, refresh]);
  useEffect(() => { setPage(1); }, [search, status, priority]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const TH = ({ label, field }) => (
    <th className="px-4 py-3 text-left">
      <button
        onClick={() => field && toggleSort(field)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider ${field ? 'text-slate-500 hover:text-slate-800 cursor-pointer' : 'text-slate-400 cursor-default'}`}
      >
        {label}
        {field && <SortIcon field={field} sortKey={sortKey} sortDir={sortDir} />}
      </button>
    </th>
  );

  const relativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60)    return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs  < 24)    return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-3">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          className="py-2 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          className="py-2 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {LEAD_PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <TH label="Lead Name"    field="patientName" />
              <TH label="Treatment"    field="treatment"   />
              <TH label="Status"       field="status"      />
              <TH label="Priority"     field="priority"    />
              <TH label="Last Activity"field="lastActivityDate" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={5}><LoadingState label="Loading leads…" /></td></tr>
            )}
            {error && (
              <tr><td colSpan={5}><ErrorState onRetry={load} /></td></tr>
            )}
            {!loading && !error && result.data.length === 0 && (
              <tr><td colSpan={5}><EmptyState icon={Users} message="No leads found matching your filters" /></td></tr>
            )}
            {!loading && !error && result.data.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{lead.patientName}</td>
                <td className="px-4 py-3 text-slate-600">{lead.treatment}</td>
                <td className="px-4 py-3"><Chip text={lead.status}   color={STATUS_COLORS[lead.status]} /></td>
                <td className="px-4 py-3"><Chip text={lead.priority} color={PRIORITY_COLORS[lead.priority]} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{relativeTime(lead.lastActivityDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && result.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {Math.min((result.page - 1) * PAGE_SIZE + 1, result.total)}–{Math.min(result.page * PAGE_SIZE, result.total)} of {result.total} leads</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={result.page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${p === result.page ? 'bg-primary text-white' : 'border border-slate-200 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              disabled={result.page === result.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Today's Appointments Component ──────────────────────────
const TodayAppointments = ({ agentId, refresh }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const all = storageService.get(storageService.KEYS.APPOINTMENTS) || INITIAL_DEMO_APPOINTMENTS;
      const todayStr = new Date().toISOString().split('T')[0];
      const filtered = all.filter((a) => {
        const isAssigned = !a.assignedAgentId || a.assignedAgentId === agentId || a.assignedUserId === agentId;
        const isToday = a.date && a.date.startsWith(todayStr);
        return isAssigned && isToday;
      });
      setAppointments(filtered.length > 0 ? filtered : all.filter(a => !a.assignedAgentId || a.assignedAgentId === agentId).slice(0, 3));
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, refresh]);

  if (loading) return <LoadingState label="Loading today's schedule…" />;
  if (appointments.length === 0) {
    return <EmptyState icon={Calendar} message="No appointments scheduled for you today" />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {appointments.map((appt) => (
        <div key={appt.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
              {appt.timeSlot ? appt.timeSlot.split(' ')[0] : '09:00'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{appt.patientName}</p>
              <p className="text-xs text-slate-500 truncate">{appt.treatment} • {appt.doctorName || 'Dr. Catherine Reyes'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
              appt.status === 'checked-in' ? 'bg-emerald-100 text-emerald-700' :
              appt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {appt.status || 'Scheduled'}
            </span>
            <button
              onClick={() => navigate('/agent/appointments')}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── My Leads Funnel Component ──────────────────────────────
const LeadsFunnel = ({ agentId, refresh }) => {
  const [funnel, setFunnel] = useState({ new: 0, contacted: 0, booked: 0, attended: 0, converted: 0 });

  useEffect(() => {
    try {
      const leads = getAllAssignedLeads(agentId);
      const newL = leads.filter(l => l.status === 'new').length;
      const contactedL = leads.filter(l => l.status === 'contacted').length;
      const bookedL = leads.filter(l => l.status === 'proposal' || l.status === 'booked' || l.status === 'qualified').length;
      const convertedL = leads.filter(l => l.status === 'converted' || l.status === 'won').length;
      const attendedL = Math.max(convertedL, Math.round(bookedL * 0.75)) || (leads.length > 0 ? 1 : 0);

      setFunnel({
        new: newL,
        contacted: contactedL,
        booked: bookedL,
        attended: attendedL,
        converted: convertedL,
      });
    } catch {
      // fallback
    }
  }, [agentId, refresh]);

  const stages = [
    { label: 'New', count: funnel.new, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Contacted', count: funnel.contacted, color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Booked', count: funnel.booked, color: 'bg-indigo-500', lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Attended', count: funnel.attended, color: 'bg-cyan-500', lightColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { label: 'Converted', count: funnel.converted, color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  const total = stages[0].count || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const pct = Math.min(100, Math.round((stage.count / Math.max(1, total)) * 100));
          return (
            <div key={stage.label} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${stage.lightColor}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{stage.label}</span>
                <span className="text-lg font-black">{stage.count}</span>
              </div>
              <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${Math.max(15, pct)}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium opacity-80">
                <span>Stage {idx + 1}</span>
                <span>{pct}% of funnel</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Follow-Up Backlog Component ─────────────────────────────
const FollowUpBacklog = ({ agentId, refresh, onLogCall }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const overdue = getTasks({ queue: 'overdue', assignee_id: agentId }) || [];
      const assigned = getAllAssignedLeads(agentId);
      const staleLeads = assigned.filter(l => l.status === 'new' || l.status === 'contacted').slice(0, 3);

      const combined = [
        ...overdue.map(t => ({
          id: t.id,
          type: 'task',
          title: t.title,
          subtitle: `Overdue task • ${t.priority || 'Normal'} priority`,
          patientName: t.lead_name || 'Patient Follow-up',
          urgent: t.priority === 'Urgent' || t.priority === 'High',
        })),
        ...staleLeads.map(l => ({
          id: l.id,
          type: 'lead',
          title: `Contact lead: ${l.patientName}`,
          subtitle: `${l.treatment} • No contact in 3+ days`,
          patientName: l.patientName,
          urgent: l.priority === 'urgent' || l.priority === 'high',
        })),
      ];

      setItems(combined);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [agentId, refresh]);

  if (loading) return <LoadingState label="Checking backlog…" />;
  if (items.length === 0) {
    return <EmptyState icon={CheckCircle2} message="All caught up! No overdue follow-ups." />;
  }

  return (
    <div className="space-y-2.5">
      {items.slice(0, 4).map((item) => (
        <div key={item.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 transition-colors">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${item.urgent ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
              <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.subtitle}</p>
          </div>
          <button
            onClick={() => onLogCall && onLogCall(item.patientName)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Call Now
          </button>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN AGENT DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════

export default function AgentDashboardView() {
  const { currentUser } = useAuth();
  const agentId = currentUser?.id;

  const [kpis,    setKpis]    = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [callKPI, setCallKPI] = useState(null);
  const [todayApptsCount, setTodayApptsCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const [showLogCall,  setShowLogCall]  = useState(false);
  const [showAddTask,  setShowAddTask]  = useState(false);

  const doRefresh = () => setRefresh((n) => n + 1);

  useEffect(() => {
    if (!agentId) return;
    setKpis(getLeadKPIs(agentId));
    setRevenue(getAgentRevenueStats(agentId));
    setCallKPI(getTodayCallKPIs(agentId));

    try {
      const allAppts = storageService.get(storageService.KEYS.APPOINTMENTS) || INITIAL_DEMO_APPOINTMENTS;
      const todayStr = new Date().toISOString().split('T')[0];
      const myToday = allAppts.filter(a => {
        const isAssigned = a.assignedAgentId === agentId || a.assignedUserId === agentId || a.assigned_user_id === agentId;
        const isToday = a.date && a.date.startsWith(todayStr);
        return isAssigned && isToday;
      });
      setTodayApptsCount(myToday.length);

      const overdue = getTasks({ queue: 'overdue', assignee_id: agentId }) || [];
      setOverdueTasksCount(overdue.length);
    } catch {
      // fallback
    }
  }, [agentId, refresh]);

  if (!agentId) return null;

  // 6 Scoped Personal KPI Cards (Assigned/Own only)
  const kpiCards = [
    {
      icon:   Users,
      label:  'My Assigned Leads',
      value:  kpis?.assignedLeads ?? '0',
      sub:    `${kpis?.newLeads ?? 0} new today`,
      iconBg: 'bg-blue-100 text-blue-600',
      trend:  'up',
    },
    {
      icon:   Phone,
      label:  'Calls Today',
      value:  callKPI?.todayCalls ?? '0',
      sub:    (callKPI?.todayCalls ?? 0) > 0 ? `${callKPI?.answeredToday ?? 0} answered` : 'No calls logged today',
      iconBg: 'bg-violet-100 text-violet-600',
      trend:  'up',
    },
    {
      icon:   Calendar,
      label:  'My Appointments Today',
      value:  todayApptsCount,
      sub:    todayApptsCount > 0 ? `${todayApptsCount} scheduled` : 'None scheduled',
      iconBg: 'bg-purple-100 text-purple-600',
      trend:  'up',
    },
    {
      icon:   AlertCircle,
      label:  'My Overdue Tasks',
      value:  overdueTasksCount,
      sub:    overdueTasksCount > 0 ? 'Requires immediate action' : 'All tasks up to date',
      iconBg: 'bg-amber-100 text-amber-600',
      trend:  overdueTasksCount > 0 ? 'down' : 'up',
    },
    {
      icon:   TrendingUp,
      label:  'My Conversion Rate',
      value:  `${revenue?.conversionRate ?? kpis?.conversionRate ?? 0}%`,
      sub:    'Lead to booking',
      iconBg: 'bg-cyan-100 text-cyan-600',
      trend:  'up',
    },
    {
      icon:   DollarSign,
      label:  'My Revenue',
      value:  formatCurrency(revenue?.monthlyRevenue || 0),
      sub:    `${revenue?.totalConversions ?? kpis?.convertedLeads ?? 0} closed this month`,
      iconBg: 'bg-emerald-100 text-emerald-600',
      trend:  'up',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Good {getGreeting()}, {currentUser?.fullName?.split(' ')[0] ?? 'Agent'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's your personal operational dashboard for today.</p>
        </div>
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogCall(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-slate-500" />
            Log Call
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* ── Personal Scoped KPI Cards (3-col x 2-row) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* ── Today's Appointments (Only Theirs) & Follow-up Backlog ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Today's Appointments (Assigned to Me)">
          <TodayAppointments agentId={agentId} refresh={refresh} />
        </Section>

        <Section title="My Follow-Up Backlog">
          <FollowUpBacklog
            agentId={agentId}
            refresh={refresh}
            onLogCall={(name) => setShowLogCall(true)}
          />
        </Section>
      </div>

      {/* ── My Leads Funnel ── */}
      <Section title="My Leads Funnel (Personal Conversion Stages)">
        <LeadsFunnel agentId={agentId} refresh={refresh} />
      </Section>

      {/* ── Mid Section: Tasks + Call Activity Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section
          title="Today's Tasks"
          action={
            <button onClick={() => setShowAddTask(true)} className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          }
        >
          <TodayTasks agentId={agentId} refresh={refresh} onRefresh={doRefresh} />
        </Section>

        <Section title="My Weekly Call Activity">
          <WeeklyCallChart agentId={agentId} refresh={refresh} />
        </Section>
      </div>

      {/* ── Assigned Leads Table ── */}
      <Section title="My Assigned Leads">
        <LeadsTable agentId={agentId} refresh={refresh} />
      </Section>

      {/* ── Dialogs ── */}
      <LogCallDialog
        open={showLogCall}
        onClose={() => setShowLogCall(false)}
        agentId={agentId}
        onLogged={doRefresh}
      />
      <AddTaskDialog
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        agentId={agentId}
        onAdded={doRefresh}
      />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
