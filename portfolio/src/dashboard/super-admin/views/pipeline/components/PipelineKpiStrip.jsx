import React from 'react';
import { Users, UserX, Flame, Percent, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';

export const PipelineKpiStrip = ({
  isLoading,
  totalCount,
  unassignedCount,
  hotCount,
  conversionRateStr,
  conversionRateNumber,
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
      {/* 1. Total Leads */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pipeline Volume
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Total Scoped Leads</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {totalCount.toLocaleString()}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant="info" className="text-[11px] font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>Active Pipeline</span>
          </Badge>
          <span className="text-[11px] text-slate-400">Current Scope</span>
        </div>
      </div>

      {/* 2. Unassigned Leads Queue */}
      <div className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
        unassignedCount > 0 ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Action Required
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Unassigned Queue</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {unassignedCount}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant={unassignedCount > 0 ? 'warning' : 'neutral'} dot className="text-[11px] font-bold">
            {unassignedCount > 0 ? 'Triage Needed' : 'Queue Clear'}
          </Badge>
          <span className="text-[11px] text-slate-400">Pending routing</span>
        </div>
      </div>

      {/* 3. High Priority / Hot Leads */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              High Intent
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Hot / High Priority Leads</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {hotCount}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant="error" className="text-[11px] font-bold">
            🔥 Urgent Touch
          </Badge>
          <span className="text-[11px] text-slate-400">AI Score &gt; 80</span>
        </div>
      </div>

      {/* 4. Overall Pipeline Conversion Rate */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Yield Velocity
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 truncate">Pipeline Conversion Rate</h4>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {conversionRateStr}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <Badge variant={conversionRateNumber >= 35 ? 'success' : 'info'} className="text-[11px] font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>Closed Won Ratio</span>
          </Badge>
          <span className="text-[11px] text-slate-400">Lead → Treatment</span>
        </div>
      </div>
    </div>
  );
};
