import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { getScopeLabel } from '../../utils/dashboardUtils';
import { REVENUE_SPARKLINE_DATA, REVENUE_BY_SCOPE } from '../../constants/dashboardWidgetConstants';

const RevenueWidget = () => {
  const accessLevel  = getUserResourceAccess('revenue');
  const scopeLabel   = getScopeLabel('revenue', accessLevel) || 'Revenue';
  const data         = REVENUE_BY_SCOPE[accessLevel] ?? REVENUE_BY_SCOPE.default;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Revenue</h2>
          <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
          Revenue
        </span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </span>
            <span className="text-2xl font-extrabold text-slate-900">{data.total}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            This month: <span className="font-semibold text-slate-700">{data.monthly}</span>
          </p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${data.positive ? 'text-emerald-600' : 'text-red-500'}`}>
          {data.positive
            ? <TrendingUp className="w-4 h-4" />
            : <TrendingDown className="w-4 h-4" />
          }
          {data.change}
        </div>
      </div>

      <div className="h-20 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_SPARKLINE_DATA} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#fff',
              }}
              formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <BarChart2 className="w-3.5 h-3.5" />
        7-day trend · Updated just now
      </div>
    </section>
  );
};

export default RevenueWidget;
