import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Lock,
  User,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  auditLogsService,
  AUDIT_CATEGORIES,
  AUDIT_SEVERITIES,
} from '@/services/auditLogsService';
import { CLINICS } from '@/constants/clinics';

export default function AuditLogsView() {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'auditor';
  const isSuperAdmin = role === 'super_admin';
  const userOrgId = currentUser?.organizationId || 'org-001';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState('all');

  // Available branches for current user
  const availableClinics = useMemo(() => {
    if (isSuperAdmin) return CLINICS.filter((c) => !c.isAlias);
    return CLINICS.filter((c) => !c.isAlias && c.orgId === userOrgId);
  }, [isSuperAdmin, userOrgId]);

  // Load audit logs with tenancy scoping
  const filteredLogs = useMemo(() => {
    return auditLogsService.getLogs({
      currentUser,
      searchQuery,
      category: selectedCategory,
      severity: selectedSeverity,
      clinicId: selectedClinic,
      orgId: isSuperAdmin ? null : userOrgId,
    });
  }, [currentUser, searchQuery, selectedCategory, selectedSeverity, selectedClinic, isSuperAdmin, userOrgId]);

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    return auditLogsService.getStats(currentUser);
  }, [currentUser, filteredLogs]);

  // Handle CSV Export
  const handleExport = () => {
    try {
      auditLogsService.exportToCSV(
        filteredLogs,
        `smile_care_group_audit_logs_${new Date().toISOString().split('T')[0]}.csv`
      );
      toast.success('Audit trail exported to CSV successfully.');
    } catch (err) {
      toast.error(err.message || 'Export failed.');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSeverity('all');
    setSelectedClinic('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedSeverity !== 'all' ||
    selectedClinic !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-purple-100 text-purple-800 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Compliance & Audit Trail
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              Read-Only
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Audit Logs & Activity Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system-wide event trail across Smile Care Group branches. Verifies authentication, operations, financial events, and RBAC changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Scoped Events</span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalEvents}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Org compliance records</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Activity (24h)</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.recent24hEvents}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Logged within last 24 hours</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Alerts</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {stats.warningEvents + stats.criticalEvents}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.criticalEvents} critical, {stats.warningEvents} warnings
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Actors</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.uniqueActorsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Contributing operators</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by actor, action, details, or IP..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Branch filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">All Branches ({availableClinics.length})</option>
                {availableClinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value={AUDIT_SEVERITIES.INFO}>Info</option>
                <option value={AUDIT_SEVERITIES.WARNING}>Warning</option>
                <option value={AUDIT_SEVERITIES.CRITICAL}>Critical</option>
              </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {Object.values(AUDIT_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Actor & Role</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Action & Category</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Event Details</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Severity</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Branch / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">No audit events match your search criteria</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try clearing your search query or selecting a different category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCritical = log.severity === AUDIT_SEVERITIES.CRITICAL;
                  const isWarning = log.severity === AUDIT_SEVERITIES.WARNING;
                  const dateStr = new Date(log.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{log.actorName || log.actor}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{log.actor}</span>
                          <span className="mt-0.5 inline-block text-[10px] font-semibold text-slate-600 uppercase">
                            {log.role}
                          </span>
                        </div>
                      </td>

                      {/* Action & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-800 font-mono text-[11px]">
                            {log.action}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 w-fit">
                            {log.category}
                          </span>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-slate-800 leading-snug line-clamp-2">{log.details}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                          Entity: {log.entity} ({log.entityId})
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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

                      {/* Branch & IP */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-slate-700">
                            {log.clinicId ? log.clinicId.replace('clinic-', '').toUpperCase() : 'MAIN'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
