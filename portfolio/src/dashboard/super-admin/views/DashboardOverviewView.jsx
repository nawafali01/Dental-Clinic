import { useState, useMemo } from 'react';
import { timeRanges, baseKpiMetrics } from '@/dashboard/super-admin/mock-data/dashboardData';
import { rawRevenueTrendData } from '@/dashboard/super-admin/mock-data/revenueData';
import { rawActivityFeed } from '@/dashboard/super-admin/mock-data/activityData';
import { rawAiTelemetryData } from '@/dashboard/super-admin/mock-data/aiData';

import { KpiCard } from '@/dashboard/shared/components/ui/KpiCard';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { useAdmin } from '@/dashboard/shared/context/AdminContext';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';

import { organizationsService } from '@/services/organizationsService';
import { OrganizationsTable } from '../components/organizations/OrganizationsTable';
import { OrgModal } from '../components/organizations/OrgModal';
import { OrgDetailDrawer } from '../components/organizations/OrgDetailDrawer';

import {
  Users,
  PhoneCall,
  CalendarCheck,
  CheckCircle,
  XCircle,
  DollarSign,
  Award,
  Building2,
  UserCheck,
  Plus,
  Download,
  Bot,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const kpiIcons = {
  total_leads: Users,
  contact_rate: PhoneCall,
  booking_rate: CalendarCheck,
  attendance_rate: CheckCircle,
  no_show_rate: XCircle,
  revenue: DollarSign,
  avg_treatment_val: Award,
  active_clinics: Building2,
  active_users: UserCheck,
};

export default function DashboardOverviewView() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30 Days');
  const { setIsCommandPaletteOpen } = useAdmin();
  const { currentRole } = useRole();
  const { selectedOrgId, currentOrg } = useOrg();

  // ── Organizations Management & Dynamic Super Admin Metrics ────────
  const [organizations, setOrganizations] = useState(() => organizationsService.getOrganizationsSync());
  const [selectedOrgDrawer, setSelectedOrgDrawer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  const refreshOrganizations = () => {
    const updated = organizationsService.getOrganizationsSync();
    setOrganizations(updated);
    if (selectedOrgDrawer) {
      const refreshedSelected = updated.find((o) => o.id === selectedOrgDrawer.id);
      if (refreshedSelected) setSelectedOrgDrawer(refreshedSelected);
    }
  };

  const isSuperAdmin = currentRole?.id === 'super_admin' || currentRole?.label === 'Super Admin';

  // ── Dynamic Super Admin KPI Calculations ─────────────────────────
  const superAdminKpis = useMemo(() => {
    const totalOrgs = organizations.length;

    const totalClinics = organizations.reduce((acc, org) => {
      return acc + (org.clinics ? org.clinics.length : 0);
    }, 0);

    const totalActiveUsers = organizations.reduce((acc, org) => {
      return acc + (org.users ? org.users.length : 0);
    }, 0) + 60; // Include system staff users (derived dynamically)

    const totalNewLeads = organizations.reduce((acc, org) => {
      return acc + (org.newLeadsCount || 0);
    }, 0);

    const totalRevenueRaw = organizations.reduce((acc, org) => {
      return acc + (org.revenue || 0);
    }, 0);

    const formattedRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(totalRevenueRaw);

    return {
      totalOrgs: String(totalOrgs).padStart(2, '0'),
      totalClinics: String(totalClinics).padStart(2, '0'),
      totalActiveUsers,
      totalNewLeads,
      formattedRevenue,
    };
  }, [organizations]);

  const aiHealthStatus = useMemo(() => rawAiTelemetryData[selectedOrgId] || rawAiTelemetryData.all, [selectedOrgId]);
  const revenueTrendData = useMemo(() => rawRevenueTrendData[selectedOrgId] || rawRevenueTrendData.all, [selectedOrgId]);

  const recentActivities = useMemo(() => {
    if (selectedOrgId === 'all') return rawActivityFeed;
    return rawActivityFeed.filter(a => a.orgId === selectedOrgId);
  }, [selectedOrgId]);

  const metrics = useMemo(() => {
    const multiplier = selectedOrgId === 'apex' ? 0.6 : selectedOrgId === 'smilecare' ? 0.4 : 1;

    return baseKpiMetrics.map(metric => {
      let val = metric.baseValue * multiplier;

      let formattedVal;
      if (metric.id === 'revenue' || metric.id === 'avg_treatment_val') {
        formattedVal = `$${Math.round(val).toLocaleString()}`;
      } else if (metric.id === 'total_leads') {
        formattedVal = Math.round(val).toLocaleString();
      } else if (metric.unit === '%') {
        formattedVal = `${metric.baseValue}${metric.unit}`;
      } else {
        formattedVal = `${Math.round(val)}${metric.unit}`;
      }

      return {
        ...metric,
        value: formattedVal
      };
    });
  }, [selectedOrgId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <Badge variant="purple" dot>
              {currentRole.label} View
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time cross-clinic telemetry for <span className="font-semibold text-slate-700">{currentOrg.name}</span>
          </p>
        </div>

        {/* Time Range Filter & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeRange === range
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCommandPaletteOpen(true)}
          >
            Quick Action
          </Button>
          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SUPER ADMIN EXCLUSIVE SECTION                                   */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isSuperAdmin && (
        <div className="space-y-6 border-b border-slate-200/80 pb-6">
          {/* 1. Super Admin Overview / KPI Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                Super Admin Overview & Network KPIs
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiCard
                title="Total Organizations"
                value={superAdminKpis.totalOrgs}
                change="+2 this month"
                isPositive={true}
                period="Active Orgs"
                icon={Building2}
              />
              <KpiCard
                title="Total Clinics"
                value={superAdminKpis.totalClinics}
                change="+3 branches"
                isPositive={true}
                period="Cross-network"
                icon={Building2}
              />
              <KpiCard
                title="Total Active Users"
                value={superAdminKpis.totalActiveUsers}
                change="+12 staff"
                isPositive={true}
                period="Active accounts"
                icon={UserCheck}
              />
              <KpiCard
                title="New Leads — Last 30 Days"
                value={superAdminKpis.totalNewLeads}
                change="+14.2%"
                isPositive={true}
                period="vs prev 30d"
                icon={Users}
              />
              <KpiCard
                title="Recognized Revenue"
                value={superAdminKpis.formattedRevenue}
                change="+18.6%"
                isPositive={true}
                period="Last 30 Days"
                icon={DollarSign}
              />
            </div>
          </div>

          {/* 2. Funnel / Performance Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Funnel / Performance Summary
              </h3>
              <span className="text-[10px] text-slate-400">Last 30 Days Trajectory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="pt-2 sm:pt-0 sm:px-4 first:px-0 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Leads</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{superAdminKpis.totalNewLeads}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ↑ +14.2%
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Top of Funnel</p>
                </div>
              </div>

              <div className="pt-3 sm:pt-0 sm:px-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments Booked</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">76</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ↑ 61.3%
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Booking Velocity</p>
                </div>
              </div>

              <div className="pt-3 sm:pt-0 sm:px-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Converted</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">31</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ↑ 40.8%
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Closed Treatments</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Quick Alerts Panel */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0 mt-0.5 sm:mt-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Quick Alerts</h4>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-800 font-medium">
                  <span>• 3 pending organization approvals</span>
                  <span>• 2 clinics currently inactive</span>
                  <span>• 5 organizations created this month</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Organizations Management Table */}
          <OrganizationsTable
            organizations={organizations}
            onOpenCreate={() => {
              setEditingOrg(null);
              setIsModalOpen(true);
            }}
            onOpenEdit={(org) => {
              setEditingOrg(org);
              setIsModalOpen(true);
            }}
            onSelectOrg={(org) => setSelectedOrgDrawer(org)}
          />
        </div>
      )}

      {/* AI Telemetry Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">AI Engine Telemetry</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ● {aiHealthStatus.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {aiHealthStatus.activeAgents} Active AI Voice & Chat Agents operating across {currentOrg.name}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-mono">Avg Latency</div>
            <div className="font-bold text-slate-100 text-sm">{aiHealthStatus.latencyMs} ms</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-mono">Success Rate</div>
            <div className="font-bold text-emerald-400 text-sm">{aiHealthStatus.successRate}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-mono">Calls Today</div>
            <div className="font-bold text-slate-100 text-sm">{aiHealthStatus.todayCalls}</div>
          </div>
        </div>
      </div>

      {/* 9 KPI Deck Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            System Key Performance Indicators
          </h3>
          <span className="text-xs text-slate-500">Updated 2 minutes ago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <KpiCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              isPositive={metric.isPositive}
              period={metric.period}
              category={metric.category}
              sparkline={metric.sparkline}
              icon={kpiIcons[metric.id]}
            />
          ))}
        </div>
      </div>

      {/* Charts & Real-time Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Lead Trends Chart */}
        <Card
          title="Revenue & Lead Generation Velocity"
          subtitle="7-day aggregated performance trajectory"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" icon={ArrowUpRight}>
              Analytics View
            </Button>
          }
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live Activity Stream */}
        <Card
          title="Live Operational Feed"
          subtitle="Real-time actions across clinics & AI"
          action={
            <Badge variant="info" dot>
              Real-time
            </Badge>
          }
        >
          <div className="space-y-3 divide-y divide-slate-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    act.status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : act.status === 'warning'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                    <span className="truncate">{act.actor}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {act.action}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{act.target}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-500">{act.clinic}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No recent activities found for {currentOrg.name}.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create / Edit Organization Modal */}
      <OrgModal
        isOpen={isModalOpen}
        initialData={editingOrg}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrg(null);
        }}
        onSave={() => {
          refreshOrganizations();
        }}
      />

      {/* Organization Details Drawer */}
      <OrgDetailDrawer
        isOpen={Boolean(selectedOrgDrawer)}
        org={selectedOrgDrawer}
        onClose={() => setSelectedOrgDrawer(null)}
        onEdit={(orgToEdit) => {
          setEditingOrg(orgToEdit);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
