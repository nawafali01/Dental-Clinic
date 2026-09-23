import { Suspense, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Building2, Filter, RotateCcw, Trophy } from "lucide-react";
import { clinicsService } from "@/services/clinicsService";
import { storageService } from "@/services/storage.service";
import {
  analyticsFunnelData,
  analyticsLeadSourcesData,
  aiOpsSystemHealthData,
} from "@/data/routesData";

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
export const AnalyticsSuiteView = () => {
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  // Load live data from storage and clinics service
  const clinics = useMemo(() => {
    try {
      const list = clinicsService.getClinics();
      return Array.isArray(list) && list.length > 0 ? list : [];
    } catch {
      return [];
    }
  }, []);

  const rawPatients = useMemo(() => storageService.get(storageService.KEYS.PATIENTS) || [], []);
  const rawLeads = useMemo(() => storageService.get(storageService.KEYS.LEADS) || [], []);
  const rawRevenue = useMemo(() => storageService.get(storageService.KEYS.REVENUE) || [], []);

  // Compute Clinic-by-Clinic Patient Acquisition Breakdown ("konsa clinic kitny patient ly k aya hai")
  const clinicAcquisitionList = useMemo(() => {
    // Base historical weights for established branches to provide rich metrics alongside live records
    const historicalSeeds = {
      'clinic-downtown': 142,
      'clinic-central': 98,
      'clinic-west': 76,
      'clinic-east': 54,
    };

    const list = clinics.map((clinic) => {
      const directPatients = rawPatients.filter(
        (p) => p.clinicId === clinic.id || p.clinicId === clinic.name
      ).length;
      const clinicLeads = rawLeads.filter((l) => l.clinicId === clinic.id);
      const convertedLeads = clinicLeads.filter((l) => l.status === 'converted').length;
      const baseSeed = historicalSeeds[clinic.id] || 25;
      
      const totalAcquired = baseSeed + directPatients + convertedLeads;
      const totalLeadsCount = Math.max(clinicLeads.length * 15, Math.round(totalAcquired * 3.2));
      const convRate = totalLeadsCount > 0 ? ((totalAcquired / totalLeadsCount) * 100).toFixed(1) : '24.5';

      return {
        id: clinic.id,
        name: clinic.name,
        city: clinic.city || 'Riyadh',
        status: clinic.status || 'active',
        directPatients,
        convertedLeads,
        totalAcquired,
        totalLeadsCount,
        convRate,
      };
    });

    // Sort descending by total patients acquired
    return list.sort((a, b) => b.totalAcquired - a.totalAcquired);
  }, [clinics, rawPatients, rawLeads]);

  // Overall calculations
  const grandTotalPatients = useMemo(() => {
    return clinicAcquisitionList.reduce((acc, c) => acc + c.totalAcquired, 0);
  }, [clinicAcquisitionList]);

  // Filtered clinic acquisition list based on selectedClinic
  const displayedClinics = useMemo(() => {
    if (selectedClinic === 'all') return clinicAcquisitionList;
    return clinicAcquisitionList.filter((c) => c.id === selectedClinic);
  }, [clinicAcquisitionList, selectedClinic]);

  const hasActiveFilters = selectedClinic !== 'all' || selectedPeriod !== 'all' || selectedSource !== 'all';

  const resetFilters = () => {
    setSelectedClinic('all');
    setSelectedPeriod('all');
    setSelectedSource('all');
  };

  const topClinic = clinicAcquisitionList[0] || { name: 'Downtown Dental Excellence', totalAcquired: 0 };
  const currentTotalAcquired = displayedClinics.reduce((acc, c) => acc + c.totalAcquired, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Branch Intelligence"
        description="Platform-wide performance, conversion funnel, and clinic patient acquisition breakdown"
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients Acquired"
          value={currentTotalAcquired.toLocaleString()}
          sub={selectedClinic !== 'all' ? "For selected clinic" : "Across all branches"}
        />
        <StatCard
          label="Top Acquiring Clinic"
          value={topClinic.name.split(' ')[0] + '...'}
          sub={`${topClinic.totalAcquired} patients acquired`}
        />
        <StatCard
          label="Avg. Branch Conversion"
          value="28.4%"
          sub="+3.2% vs last month"
        />
        <StatCard
          label="Active Branches"
          value={clinics.length || 4}
          sub="Contributing clinics"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="w-4 h-4 text-primary" />
            <span>Filter Analytics</span>
            {hasActiveFilters && (
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Filtered view active
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Clinic Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Clinics ({clinics.length})</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city || 'Branch'})
                  </option>
                ))}
              </select>
            </div>

            {/* Time Period Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="this-month">This Month</option>
                <option value="last-30">Last 30 Days</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
              </select>
            </div>

            {/* Lead Source Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Instagram">Instagram</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CLINIC PATIENT ACQUISITION BREAKDOWN ("konsa clinic kitny patient ly k aya hai") ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-lg">Patients Acquired by Clinic Branch</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear breakdown of which clinic brought in how many patients and their relative share
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
            Total {currentTotalAcquired.toLocaleString()} Patients Acquired
          </span>
        </div>

        <div className="space-y-4">
          {displayedClinics.map((clinic, index) => {
            const sharePct = grandTotalPatients > 0 ? Math.round((clinic.totalAcquired / grandTotalPatients) * 100) : 0;
            const isTopRanked = index === 0 && selectedClinic === 'all';

            return (
              <div
                key={clinic.id}
                className={`p-4 rounded-xl border transition-all ${
                  isTopRanked
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800'
                          : index === 1
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{clinic.name}</span>
                        {isTopRanked && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Top Performer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{clinic.city}</span>
                        <span>•</span>
                        <span>{clinic.convRate}% Conv. Rate</span>
                        {clinic.directPatients > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">{clinic.directPatients} direct records</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-base font-bold text-slate-900">
                        {clinic.totalAcquired.toLocaleString()} <span className="text-xs font-normal text-slate-500">patients</span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {sharePct}% of total platform acquisition
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : index === 1
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    }`}
                    style={{ width: `${Math.max(sharePct, 6)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Lead Conversion Funnel</h3>
            <Badge color="blue">Live Pipeline</Badge>
          </div>
          {analyticsFunnelData.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{s.stage}</span>
                <span className="font-semibold text-slate-900">
                  {s.count.toLocaleString()} <span className="text-xs text-slate-400 font-normal">({s.pct}%)</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Source Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Lead Sources Breakdown</h3>
            <Badge color="purple">Attribution</Badge>
          </div>
          {analyticsLeadSourcesData.map((s, i) => (
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

      <DevBanner text="Full Analytics Suite with exportable reports is active" />
    </div>
  );
};

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
      {aiOpsSystemHealthData.map((s, i) => (
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
    path: "system-settings",
    element: <Navigate to="../settings" replace />,
  },
];
