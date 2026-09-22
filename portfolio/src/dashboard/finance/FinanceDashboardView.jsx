import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  ArrowRight,
  Search,
  Receipt,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.service';
import { getClinicById } from '@/constants/clinics';
import {
  getRevenues,
  getOrgRevenueStats,
  getClinicRevenueBreakdown,
  getTreatmentRevenueBreakdown,
  isRevenueRecognized,
  getRecognizedAmount,
} from '@/services/revenueService';
import { getGreeting } from '@/utils/dashboardUtils';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';
import { RecordPaymentModal } from '@/dashboard/views/config/components/RecordPaymentModal';

// ── Palette for Treatment Pie ────────────────────────────────────
const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#64748b'];

// ── KPI Card Component ───────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, iconBg, trendColor }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${trendColor || 'text-slate-500'}`}>{sub}</p>}
    </div>
  </div>
);

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

export default function FinanceDashboardView() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const orgId = currentUser?.organizationId || 'org-001';
  const orgName = 'Smile Care Group';

  // State
  const [period, setPeriod] = useState('month'); // 'month' | 'quarter' | 'year' | 'all'
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [revenueList, setRevenueList] = useState([]);

  // Live Fetch Revenue Records
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const data = await getRevenues({}, currentUser);
        if (active) setRevenueList(data || []);
      } catch (err) {
        console.warn('FinanceDashboardView fetch error:', err);
      }
    }
    loadData();
    return () => { active = false; };
  }, [currentUser, refreshTrigger]);

  // Greeting
  const greeting = getGreeting();
  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.fullName?.split(' ')[0] || 'Controller';

  // ── Financial Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    return getOrgRevenueStats(orgId, period);
  }, [orgId, period, refreshTrigger, revenueList]);

  // ── Clinic Breakdown ─────────────────────────────────────────────
  const clinicData = useMemo(() => {
    return getClinicRevenueBreakdown(orgId);
  }, [orgId, refreshTrigger, revenueList]);

  // ── Treatment Breakdown ──────────────────────────────────────────
  const treatmentData = useMemo(() => {
    return getTreatmentRevenueBreakdown(orgId);
  }, [orgId, refreshTrigger, revenueList]);

  const totalTreatmentRevenue = useMemo(() => {
    return treatmentData.reduce((acc, t) => acc + (t.revenue || 0), 0);
  }, [treatmentData]);

  // ── Recent Payments Stream ───────────────────────────────────────
  const recentPayments = useMemo(() => {
    const orgRecords = revenueList.filter((r) => !orgId || r.orgId === orgId || !r.orgId);
    return orgRecords
      .slice()
      .sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0))
      .slice(0, 6);
  }, [orgId, revenueList]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {greeting}, {firstName} 💼
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial controller overview, recognized collections, and accounts receivable.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Organization Scope Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{orgName}</span>
              <span className="text-[10px] text-slate-400 font-mono">(All Branches)</span>
            </div>

            {/* Period Filter */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  period === 'month' ? 'bg-white shadow-2xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  period === 'all' ? 'bg-white shadow-2xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Time
              </button>
            </div>

            {/* Quick Action: Record Payment */}
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Financial KPI Cards (Locked Revenue Recognition Rule) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          sub="Recognized cash collections"
          iconBg="bg-emerald-100 text-emerald-600"
          trendColor="text-emerald-600"
        />
        <KpiCard
          icon={AlertCircle}
          label="Outstanding Receivables"
          value={formatCurrency(stats.totalOutstanding)}
          sub="Unpaid treatment balances"
          iconBg="bg-amber-100 text-amber-600"
          trendColor="text-amber-600"
        />
        <KpiCard
          icon={Receipt}
          label="Deposits Collected"
          value={formatCurrency(stats.depositsCollected)}
          sub="Secured treatment tranches"
          iconBg="bg-blue-100 text-blue-600"
          trendColor="text-blue-600"
        />
        <KpiCard
          icon={CreditCard}
          label="Refunds Issued"
          value={formatCurrency(stats.refundsIssued)}
          sub={`${stats.refundCount} transaction${stats.refundCount === 1 ? '' : 's'} reversed`}
          iconBg={stats.refundsIssued > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}
          trendColor={stats.refundsIssued > 0 ? 'text-rose-600' : 'text-slate-500'}
        />
      </div>

      {/* ── Revenue Visual Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Clinic Branch (Bar Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Revenue by Clinic Branch
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Recognized collections across all branches</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {clinicData.length} Branches
            </span>
          </div>

          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clinicData} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                  interval={0}
                  textAnchor="middle"
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                  labelFormatter={(name, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName ? `${item.fullName} (${item.city})` : `Clinic: ${name}`;
                  }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  barSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Treatment Category (Donut Chart with Modern Custom Legend) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Revenue by Treatment Category
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Clinical volume and collections yield</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {treatmentData.length} Specialties
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2">
            {/* Donut Chart with Center KPI */}
            <div className="sm:col-span-5 relative h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={treatmentData}
                    dataKey="revenue"
                    nameKey="treatment"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={76}
                    paddingAngle={3}
                    onMouseEnter={(_, index) => setHoveredCategory(treatmentData[index]?.treatment)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {treatmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={hoveredCategory === entry.treatment ? 3 : 1}
                        opacity={hoveredCategory && hoveredCategory !== entry.treatment ? 0.45 : 1}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Yield</span>
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(totalTreatmentRevenue || stats.totalRevenue)}
                </span>
              </div>
            </div>

            {/* Custom Modern Structured Legend with Mini Progress Bars */}
            <div className="sm:col-span-7 space-y-2 pl-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {treatmentData.map((item, idx) => {
                const color = PIE_COLORS[idx % PIE_COLORS.length];
                const pct = totalTreatmentRevenue > 0
                  ? Math.round((item.revenue / totalTreatmentRevenue) * 100)
                  : 0;
                const isHovered = hoveredCategory === item.treatment;

                return (
                  <div
                    key={item.treatment}
                    onMouseEnter={() => setHoveredCategory(item.treatment)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      isHovered ? 'bg-slate-50 border border-slate-200 shadow-2xs' : 'border border-transparent hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-slate-800 truncate text-[11px]" title={item.treatment}>
                          {item.treatment}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-slate-900 text-[11px]">{formatCurrency(item.revenue)}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Payment Activity Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-purple-600" />
              Recent Payment Transactions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time ledger of collections, deposits, and refunds</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(buildRoleUrl('/payments', 'finance'))}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <span>View All Transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Clinic Branch</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((p) => {
                const clinic = getClinicById(p.clinicId);
                const isPaid = (p.status || '').toLowerCase() === 'paid';
                const isRefunded = (p.status || '').toLowerCase() === 'refunded';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{p.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{p.patientName || 'Private Patient'}</td>
                    <td className="py-3 px-3 text-slate-600">{clinic?.name || p.clinicId}</td>
                    <td className="py-3 px-3 text-slate-600">{p.method || 'Credit Card'}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatCurrency(p.revenue || p.amount || 0)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRefunded
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {p.status || 'Paid'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                      {p.date ? new Date(p.date).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => {
          setRefreshTrigger((n) => n + 1);
          toast.success('Transaction logged to revenue ledger.');
        }}
        currentUser={currentUser}
        selectedClinicId="all"
      />
    </div>
  );
}
