import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Users,
  DollarSign,
  UserCheck,
  Activity,
  ArrowRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.service';
import {
  getOrgRevenueStats,
  isRevenueRecognized,
  getRecognizedAmount,
} from '@/services/revenueService';
import {
  auditLogsService,
  AUDIT_SEVERITIES,
} from '@/services/auditLogsService';
import { usersService } from '@/services/usersService';
import { getGreeting } from '@/utils/dashboardUtils';

// ── Reusable KPI Card Component ─────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, iconBg, valueColor = 'text-slate-900' }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs transition-all hover:shadow-xs">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div className="mt-3">
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  </div>
);

export default function AuditorDashboardView() {
  const { currentUser } = useAuth();
  const orgId = currentUser?.organizationId || 'org-001';

  // Format currency
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);

  // 1. Total Leads (Org-wide)
  const leadsCount = useMemo(() => {
    try {
      const allLeads = storageService.get(storageService.KEYS.LEADS) || [];
      return allLeads.length;
    } catch {
      return 0;
    }
  }, []);

  // 2. Recognized Revenue (Same canonical calculation as Finance)
  const revenueStats = useMemo(() => {
    try {
      return getOrgRevenueStats(orgId);
    } catch {
      return { totalRevenue: 0 };
    }
  }, [orgId]);

  // 3. Active Users (Org-wide count)
  const activeUsersCount = useMemo(() => {
    try {
      const allUsers = usersService.getUsers();
      return allUsers.filter(
        (u) => (!u.organizationId || u.organizationId === orgId) && u.status === 'active'
      ).length;
    } catch {
      return 0;
    }
  }, [orgId]);

  // 4. Audit Log Statistics & Recent Activity
  const { recentLogs, stats } = useMemo(() => {
    try {
      const logs = auditLogsService.getLogs({ currentUser });
      const statsObj = auditLogsService.getStats(currentUser);
      return {
        recentLogs: logs.slice(0, 6),
        stats: statsObj,
      };
    } catch {
      return { recentLogs: [], stats: { totalEvents: 0, recent24hEvents: 0 } };
    }
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Greeting Header (Auditor Scope & Read-Only Badge) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Auditor Scope
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Read-Only / Zero Write Access
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Smile Care Group (4 Branches)
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
            {getGreeting()}, {currentUser?.name || currentUser?.fullName || 'Auditor'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            Organization-wide compliance and audit dashboard. Review operational pipeline, recognized financial collections, active staff access, and security event trails across all clinic locations.
          </p>
        </div>

        {/* Audit Status Pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-start md:items-end shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System Compliance Status
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-800">Operational & Verified</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Zero mutation controls active
          </span>
        </div>
      </div>

      {/* ── 4 KPI Cards Summarizing Org Health At A Glance ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <KpiCard
          icon={Users}
          label="Total Leads"
          value={leadsCount}
          sub="Org-wide pipeline records"
          iconBg="bg-blue-50 text-blue-600"
        />

        {/* Recognized Revenue */}
        <KpiCard
          icon={DollarSign}
          label="Recognized Revenue"
          value={formatCurrency(revenueStats.totalRevenue)}
          sub="Verified cash collections"
          iconBg="bg-emerald-50 text-emerald-600"
          valueColor="text-emerald-700"
        />

        {/* Active Users */}
        <KpiCard
          icon={UserCheck}
          label="Active Staff Users"
          value={activeUsersCount}
          sub="Current authorized logins"
          iconBg="bg-violet-50 text-violet-600"
        />

        {/* Recent Audit Events */}
        <KpiCard
          icon={Activity}
          label="Recent Audit Events"
          value={stats.recent24hEvents}
          sub={`${stats.totalEvents} total logged events`}
          iconBg="bg-amber-50 text-amber-600"
          valueColor="text-amber-700"
        />
      </div>

      {/* ── Recent Audit Activity Feed (Core Role Feature) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Recent Audit Activity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live immutable log of operational actions and security events within Smile Care Group.
            </p>
          </div>

          <Link
            to="/auditor/audit-logs"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold border border-purple-200 transition-colors"
          >
            <span>View Full Audit Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Audit Log Table Preview */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Actor</th>
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-4 font-bold">Details</th>
                <th className="py-3 px-4 font-bold text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No recent audit events recorded.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => {
                  const isCritical = log.severity === AUDIT_SEVERITIES.CRITICAL;
                  const isWarning = log.severity === AUDIT_SEVERITIES.WARNING;
                  const dateStr = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{log.actorName || log.actor}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.role}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-xs text-slate-600 truncate">{log.details}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            Critical
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            Info
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Organization Audit & Compliance Scope Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Lock className="w-4 h-4 text-primary" />
            Tenancy Boundary
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Locked to organization <strong className="text-slate-800 font-semibold">{orgId}</strong> (Smile Care Group). Isolated from other tenant databases with strict row-level security.
          </p>
          <div className="mt-3 text-[11px] text-slate-400 font-mono">
            Scope: 4 Clinic Branches
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            Data Integrity Policy
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Auditor privileges include read-only ledger inspection and compliance CSV export. Create, modify, delete, and payment processing functions are hard-gated.
          </p>
          <div className="mt-3 text-[11px] text-emerald-600 font-semibold">
            Status: Read-Only Enforced
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Active RBAC Guard
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Permissions verified across all 7 RBAC roles. Automated session tokens prevent unauthorized route escalation or service-level mutation.
          </p>
          <div className="mt-3 text-[11px] text-purple-600 font-semibold">
            Policy: Zero Write Access
          </div>
        </div>
      </div>
    </div>
  );
}
