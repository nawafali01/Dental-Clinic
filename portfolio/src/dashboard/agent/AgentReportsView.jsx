import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  Users, PhoneCall, CalendarCheck, CheckCircle2,
  Award, DollarSign, TrendingUp, Filter, Calendar,
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { getAllAssignedLeads } from '@/services/leadsService';
import { getAgentRevenueStats, getAgentRevenueTrend, getAgentRevenueRecords } from '@/services/revenueService';
import { storageService } from '@/services/storage.service';
import { INITIAL_DEMO_APPOINTMENTS } from '@/dashboard/views/appointments/constants';

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Month'];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const safePct = (part, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
};

export default function AgentReportsView() {
  const { currentUser } = useAuth();
  const agentId = currentUser?.id;

  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [activeChartTab, setActiveChartTab] = useState('revenue'); // 'revenue' | 'volume'

  // ── Scoped Data Queries (Strictly Personal & Date-Filtered) ──
  const {
    leads,
    appointments,
    revenueRecords,
    revenueStats,
    trendData,
    funnelMetrics,
  } = useMemo(() => {
    if (!agentId) {
      return {
        leads: [],
        appointments: [],
        revenueRecords: [],
        revenueStats: null,
        trendData: [],
        funnelMetrics: {
          totalLeads: 0,
          contacted: 0,
          booked: 0,
          attended: 0,
          converted: 0,
          contactRate: '0%',
          bookingRate: '0%',
          attendanceRate: '0%',
          conversionRate: '0%',
        },
      };
    }

    // 1. All records scoped strictly to this agent
    const allMyLeads = getAllAssignedLeads(agentId);
    const allAppts = storageService.get(storageService.KEYS.APPOINTMENTS) || INITIAL_DEMO_APPOINTMENTS;
    const allMyAppts = allAppts.filter(
      (a) => a.assignedAgentId === agentId || a.assignedUserId === agentId || a.assigned_user_id === agentId
    );
    const allMyRevenue = getAgentRevenueRecords(agentId);

    // 2. Date boundary calculation based on selectedRange
    const now = new Date();
    let startDate = new Date();

    if (selectedRange === 'Today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (selectedRange === 'Last 7 Days') {
      startDate.setDate(now.getDate() - 7);
    } else if (selectedRange === 'Last 30 Days') {
      startDate.setDate(now.getDate() - 30);
    } else if (selectedRange === 'Last 90 Days') {
      startDate.setDate(now.getDate() - 90);
    } else if (selectedRange === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const isInRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d >= startDate && d <= now;
    };

    // Filter leads, appointments, and revenue by date range
    const myLeads = allMyLeads.filter((l) => isInRange(l.createdAt) || isInRange(l.lastActivityDate));
    // If no leads fall in range, fall back to all assigned leads for this agent
    const activeLeads = myLeads.length > 0 ? myLeads : allMyLeads;

    const myAppts = allMyAppts.filter((a) => isInRange(a.date));
    const activeAppts = myAppts.length > 0 ? myAppts : allMyAppts;

    const myRevenueRecords = allMyRevenue.filter((r) => isInRange(r.date));
    const activeRevenue = myRevenueRecords.length > 0 ? myRevenueRecords : allMyRevenue;

    // 3. Time series trend strictly for this agent
    const trend = getAgentRevenueTrend(agentId, selectedRange);

    // 4. Overall agent revenue stats
    const revStats = getAgentRevenueStats(agentId);

    // 5. Funnel calculation matching spec:
    // leads → contacted → appointment booked → attended → converted
    const totalLeads = activeLeads.length;
    const contacted = activeLeads.filter(
      (l) => l.status === 'contacted' || l.status === 'qualified' || l.status === 'proposal' || l.status === 'converted' || l.status === 'won'
    ).length;

    const booked = activeLeads.filter(
      (l) => l.status === 'proposal' || l.status === 'qualified' || l.status === 'converted' || l.status === 'won'
    ).length;

    const attended = activeAppts.filter(
      (a) => a.status === 'checked-in' || a.status === 'completed' || a.status === 'confirmed'
    ).length;

    const converted = activeLeads.filter((l) => l.status === 'converted' || l.status === 'won').length;

    const contactRate    = safePct(contacted, totalLeads);
    const bookingRate    = safePct(booked, contacted || totalLeads);
    const attendanceRate = safePct(attended, booked || activeAppts.length);
    const conversionRate = safePct(converted, totalLeads);

    return {
      leads: activeLeads,
      appointments: activeAppts,
      revenueRecords: activeRevenue,
      revenueStats: revStats,
      trendData: trend,
      funnelMetrics: {
        totalLeads,
        contacted,
        booked,
        attended,
        converted,
        contactRate,
        bookingRate,
        attendanceRate,
        conversionRate,
      },
    };
  }, [agentId, selectedRange]);

  // Funnel visual steps
  const funnelStages = [
    {
      label: '1. Leads Captured',
      value: funnelMetrics.totalLeads,
      rate: '100%',
      rateLabel: 'Total Inbound',
      icon: Users,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50/60 text-blue-700 border-blue-200/70',
    },
    {
      label: '2. Contacted',
      value: funnelMetrics.contacted,
      rate: funnelMetrics.contactRate,
      rateLabel: 'Contact Rate',
      icon: PhoneCall,
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50/60 text-amber-700 border-amber-200/70',
    },
    {
      label: '3. Appointment Booked',
      value: funnelMetrics.booked,
      rate: funnelMetrics.bookingRate,
      rateLabel: 'Booking Rate',
      icon: CalendarCheck,
      color: 'bg-indigo-500',
      lightBg: 'bg-indigo-50/60 text-indigo-700 border-indigo-200/70',
    },
    {
      label: '4. Consult Attended',
      value: funnelMetrics.attended,
      rate: funnelMetrics.attendanceRate,
      rateLabel: 'Attendance Rate',
      icon: CheckCircle2,
      color: 'bg-cyan-500',
      lightBg: 'bg-cyan-50/60 text-cyan-700 border-cyan-200/70',
    },
    {
      label: '5. Treatment Converted',
      value: funnelMetrics.converted,
      rate: funnelMetrics.conversionRate,
      rateLabel: 'Conversion Rate',
      icon: Award,
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50/60 text-emerald-700 border-emerald-200/70',
    },
  ];

  // Won cases table
  const wonLeads = useMemo(() => {
    return leads
      .filter((l) => l.status === 'converted' || l.status === 'won')
      .map((lead) => {
        const matchingRev = revenueRecords.find(
          (r) => (r.patientName && r.patientName.toLowerCase() === (lead.patientName || lead.name || '').toLowerCase()) ||
                 r.leadId === lead.id
        );
        return {
          id: lead.id,
          patientName: lead.patientName || lead.name || 'Private Patient',
          treatment: lead.treatment || 'General Dentistry',
          source: lead.source || 'Direct',
          revenue: Number(matchingRev?.revenue) || Number(matchingRev?.amount) || 0,
          date: lead.lastActivityDate || lead.createdAt || new Date().toISOString(),
        };
      });
  }, [leads, revenueRecords]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Personal Performance Reports</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Scoped analytics for {currentUser?.fullName || 'Agent'}. Showing strictly your assigned leads, conversion funnel, and recognized revenue.
          </p>
        </div>

        {/* Date Range Filter Bar */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRange === range
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ── Personal KPI Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Recognized Revenue</p>
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(revenueStats?.monthlyRevenue)}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {revenueStats?.totalConversions || 0} won cases this month
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Conversion Rate</p>
            <span className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {funnelMetrics.conversionRate}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {funnelMetrics.converted} converted of {funnelMetrics.totalLeads} assigned leads
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consult Attendance Rate</p>
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {funnelMetrics.attendanceRate}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {funnelMetrics.attended} attended of {funnelMetrics.booked} bookings
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Rate</p>
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {funnelMetrics.contactRate}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {funnelMetrics.contacted} of {funnelMetrics.totalLeads} reached
          </p>
        </div>
      </div>

      {/* ── Personal Conversion Funnel Section ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Personal Conversion Funnel</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-stage trajectory across your assigned leads ({selectedRange})
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Assigned Only Scope
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {funnelStages.map((stage, idx) => {
              const Icon = stage.icon;
              const maxVal = Math.max(1, funnelStages[0].value);
              const barWidth = Math.max(15, Math.min(100, Math.round((stage.value / maxVal) * 100)));

              return (
                <div
                  key={stage.label}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${stage.lightBg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">{stage.label}</span>
                    <Icon className="w-4 h-4 opacity-70" />
                  </div>

                  <div>
                    <div className="text-2xl font-black text-slate-900">{stage.value}</div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                      {stage.rateLabel}: <span className="font-bold text-slate-900">{stage.rate}</span>
                    </div>
                  </div>

                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Funnel Health Footer Summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">Conversion Velocity:</span>
              <span>Contact: <strong>{funnelMetrics.contactRate}</strong></span>
              <span>•</span>
              <span>Booking: <strong>{funnelMetrics.bookingRate}</strong></span>
              <span>•</span>
              <span>Attendance: <strong>{funnelMetrics.attendanceRate}</strong></span>
              <span>•</span>
              <span>Final Conversion: <strong>{funnelMetrics.conversionRate}</strong></span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Assigned Pool: {funnelMetrics.totalLeads} leads
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal Revenue Over Time Chart ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Personal Revenue Trend</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recognized revenue from your closed leads and consultations over {selectedRange.toLowerCase()}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveChartTab('revenue')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartTab === 'revenue'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daily Revenue
            </button>
            <button
              onClick={() => setActiveChartTab('cumulative')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeChartTab === 'cumulative'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cumulative Trend
            </button>
          </div>
        </div>

        <div className="p-5">
          {trendData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              No revenue recorded in this period.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="agentRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timeLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: 12,
                      color: '#ffffff',
                      fontSize: 12,
                    }}
                    formatter={(value) => [formatCurrency(value), activeChartTab === 'cumulative' ? 'Cumulative Revenue' : 'Recognized Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeChartTab === 'cumulative' ? 'cumulativeRevenue' : 'revenue'}
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#agentRevenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Closed Cases Attributed to Agent ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">My Closed & Converted Cases</h2>
            <p className="text-xs text-slate-500 mt-0.5">Leads assigned to you that successfully accepted treatment</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {wonLeads.length} Converted Deals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Patient Name</th>
                <th className="px-5 py-3">Treatment</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Attributed Revenue</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wonLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No converted cases yet.
                  </td>
                </tr>
              ) : (
                wonLeads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">{item.patientName}</td>
                    <td className="px-5 py-3 text-slate-600">{item.treatment}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {item.source}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-emerald-600">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Won / Converted
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
