import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Eye,
  X,
  Server,
  Layers,
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

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [securityOnly, setSecurityOnly] = useState(false);
  const [entityFilter, setEntityFilter] = useState({ type: '', id: '' });

  // Data & Loading state
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Available branches for current user
  const availableClinics = useMemo(() => {
    if (isSuperAdmin) return CLINICS.filter((c) => !c.isAlias);
    return CLINICS.filter((c) => !c.isAlias && c.orgId === userOrgId);
  }, [isSuperAdmin, userOrgId]);

  // Async load logs from backend API with fallback
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      let fetched = [];
      if (entityFilter.type && entityFilter.id) {
        fetched = await auditLogsService.getEntityLogs(entityFilter.type, entityFilter.id);
        setIsLiveApi(true);
      } else {
        fetched = await auditLogsService.fetchLogs({
          currentUser,
          searchQuery,
          category: selectedCategory,
          severity: selectedSeverity,
          clinicId: selectedClinic,
          orgId: isSuperAdmin ? null : userOrgId,
          securityOnly,
          limit: 100,
        });
        setIsLiveApi(true);
      }
      setLogs(fetched);
    } catch (err) {
      console.warn('[AuditLogsView] Failed to fetch live logs:', err);
      // Fallback to local storage
      const local = auditLogsService.getLogs({
        currentUser,
        searchQuery,
        category: selectedCategory,
        severity: selectedSeverity,
        clinicId: selectedClinic,
        orgId: isSuperAdmin ? null : userOrgId,
      });
      setLogs(local);
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [
    currentUser,
    searchQuery,
    selectedCategory,
    selectedSeverity,
    selectedClinic,
    securityOnly,
    entityFilter.type,
    entityFilter.id,
  ]);

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const totalEvents = logs.length;
    const criticalEvents = logs.filter((l) => l.severity === AUDIT_SEVERITIES.CRITICAL).length;
    const warningEvents = logs.filter((l) => l.severity === AUDIT_SEVERITIES.WARNING).length;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const recent24hEvents = logs.filter((l) => new Date(l.timestamp).getTime() >= oneDayAgo).length;
    const uniqueActorsCount = new Set(logs.map((l) => l.actor).filter(Boolean)).size;

    return { totalEvents, criticalEvents, warningEvents, recent24hEvents, uniqueActorsCount };
  }, [logs]);

  // CSV Export
  const handleExport = () => {
    try {
      auditLogsService.exportToCSV(
        logs,
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
    setSecurityOnly(false);
    setEntityFilter({ type: '', id: '' });
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedSeverity !== 'all' ||
    selectedClinic !== 'all' ||
    securityOnly ||
    (entityFilter.type && entityFilter.id);

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
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isLiveApi
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Server className="w-3 h-3" />
              {isLiveApi ? 'FastAPI API Connected' : 'Local Storage Mode'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Audit Logs & Activity Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system-wide event trail across Smile Care Group branches. Verifies authentication, operations, financial events, and RBAC changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
            {/* Super Admin Security Toggle */}
            {isSuperAdmin && (
              <button
                onClick={() => setSecurityOnly(!securityOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  securityOnly
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                Security Logs Only
              </button>
            )}

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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
              Loading Audit Records...
            </div>
          </div>
        )}

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
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">No audit events match your search criteria</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try clearing your search query or selecting a different category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isCritical = log.severity === AUDIT_SEVERITIES.CRITICAL;
                  const isWarning = log.severity === AUDIT_SEVERITIES.WARNING;
                  const dateStr = new Date(log.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedLogDetail(log)}
                    >
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">
                            {log.clinicId ? log.clinicId.replace('clinic-', '').toUpperCase() : 'MAIN'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                        </div>
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLogDetail(log);
                          }}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Record Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Audit Log Payload Detail</h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Log ID</span>
                  <p className="font-mono text-slate-800 font-semibold">{selectedLogDetail.id}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Timestamp</span>
                  <p className="text-slate-800">{new Date(selectedLogDetail.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Actor Email</span>
                  <p className="text-slate-800 font-medium">{selectedLogDetail.actor}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Action</span>
                  <p className="font-mono text-slate-800 font-bold">{selectedLogDetail.action}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Entity</span>
                  <p className="text-slate-800">{selectedLogDetail.entity} ({selectedLogDetail.entityId})</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">IP Address</span>
                  <p className="font-mono text-slate-800">{selectedLogDetail.ipAddress}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Details Summary</span>
                <p className="text-slate-700 bg-white border border-slate-200 p-2.5 rounded-xl font-medium">
                  {selectedLogDetail.details}
                </p>
              </div>

              {selectedLogDetail.changes && (
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Sanitized Changes (Before / After)</span>
                  <pre className="bg-slate-900 text-purple-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLogDetail.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
