import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { formatCurrency } from '../constants';

export const RevenueTrendsCard = ({
  isLoading,
  revenueChartData,
  selectedDateRange,
  activeChartTab,
  setActiveChartTab,
}) => {
  return (
    <Card
      title="Revenue Trends & Acquisition Trajectory"
      subtitle={`Time-series monetary generation across scoped entities (${selectedDateRange})`}
      action={
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveChartTab('timeline')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Revenue Timeline
          </button>
          <button
            onClick={() => setActiveChartTab('treatment')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'treatment'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            By Treatment Mix
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="h-64 w-full flex items-center justify-center animate-pulse bg-slate-50 rounded-xl">
          <div className="h-4 bg-slate-200 rounded w-48" />
        </div>
      ) : revenueChartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
          No chart data available for the selected filters.
        </div>
      ) : (
        <div className="h-68 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'timeline' ? (
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuperRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSuperLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="timeLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [
                    name === 'revenue' ? formatCurrency(val) : val,
                    name === 'revenue' ? 'Revenue' : 'Leads',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Recognized Revenue ($)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSuperRev)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="leads"
                  name="Leads Generated"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSuperLeads)"
                />
              </AreaChart>
            ) : (
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
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
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [formatCurrency(val), name]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar dataKey="implants" name="Dental Implants" fill="#0284c7" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="aligners" name="Clear Aligners" fill="#6366f1" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="restorative" name="Restorative Care" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
