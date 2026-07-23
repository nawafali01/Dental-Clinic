import React, { useState, useMemo } from 'react';
import { timeRanges, baseKpiMetrics } from '../mockData/dashboardData';
import { rawRevenueTrendData } from '../mockData/revenueData';
import { rawActivityFeed } from '../mockData/activityData';
import { rawAiTelemetryData } from '../mockData/aiData';

import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAdmin } from '../context/AdminContext';
import { useRole } from '../context/RoleContext';
import { useOrg } from '../context/OrgContext';
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
  Zap,
  Download,
  Bot,
  Activity,
  ArrowUpRight,
  Sparkles,
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
      
      let formattedVal = val;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Dashboard Overview
            </h1>
            <Badge variant="purple" dot>
              {currentRole.label} View
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time cross-clinic telemetry for <span className="font-semibold text-slate-700 dark:text-slate-300">{currentOrg.name}</span>
          </p>
        </div>

        {/* Time Range Filter & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedTimeRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
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
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <span className="truncate">{act.actor}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
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
    </div>
  );
}
