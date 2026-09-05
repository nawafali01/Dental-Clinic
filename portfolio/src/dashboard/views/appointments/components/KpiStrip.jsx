import React from 'react';
import { Calendar, UserCheck, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';

export const KpiStrip = ({
  isLoading,
  todayCount,
  confirmedCheckedInCount,
  attendanceRateStr,
  attendanceRateNumber,
  noShowRiskCount,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs animate-pulse space-y-3">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="h-7 bg-slate-200 rounded w-32" />
            <div className="h-4 bg-slate-100 rounded w-20 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today's Total Appointments */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Daily Schedule
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Today's Total Appointments</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {todayCount}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant="info" className="text-[11px] font-bold">
            Live Today
          </Badge>
          <span className="text-[11px] text-slate-400">Scoped visits</span>
        </div>
      </div>

      {/* 2. Confirmed / Checked In Count */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Arrival Velocity
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Confirmed & Checked In</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {confirmedCheckedInCount}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant="purple" dot className="text-[11px] font-bold">
            In Clinic / Ready
          </Badge>
          <span className="text-[11px] text-slate-400">Verified slots</span>
        </div>
      </div>

      {/* 3. Attendance Rate (%) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Clinical Yield
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Attendance Rate</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {attendanceRateStr}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant={attendanceRateNumber >= 80 ? 'success' : 'warning'} className="text-[11px] font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>Completed Ratio</span>
          </Badge>
          <span className="text-[11px] text-slate-400">Target &gt; 85%</span>
        </div>
      </div>

      {/* 4. Flagged No-Show Risk Count */}
      <div className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
        noShowRiskCount > 0 ? 'border-rose-300 ring-2 ring-rose-400/20' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              AI Risk Detection
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Flagged No-Show Risk</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {noShowRiskCount}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant={noShowRiskCount > 0 ? 'error' : 'neutral'} dot className="text-[11px] font-bold">
            {noShowRiskCount > 0 ? 'Urgent Outreach Needed' : 'Low Risk'}
          </Badge>
          <span className="text-[11px] text-slate-400">Risk Score &gt; 70</span>
        </div>
      </div>
    </div>
  );
};

export const AppointmentsKpiStrip = KpiStrip;
export default KpiStrip;
