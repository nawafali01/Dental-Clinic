import React from 'react';
import { Building2, TrendingUp, Users, Activity } from 'lucide-react';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { getScopeLabel } from '../../utils/dashboardUtils';

/**
 * OverviewWidget
 * System / organisation overview — shown to super_admin and org_admin only.
 * Calls getUserResourceAccess('organizations') with ZERO role parameters!
 */
const OverviewWidget = () => {
  const accessLevel = getUserResourceAccess('organizations');
  const scopeLabel  = getScopeLabel('organizations', accessLevel) || 'Overview';

  const stats = [
    { label: 'Active Organizations', value: accessLevel === 'all' ? '12' : '1',  icon: Building2, color: 'bg-violet-500/10 text-violet-600' },
    { label: 'Total Clinics',        value: accessLevel === 'all' ? '48' : '6',  icon: Activity,  color: 'bg-blue-500/10   text-blue-600'   },
    { label: 'Platform Users',       value: accessLevel === 'all' ? '234' : '32', icon: Users,     color: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'System Health',        value: '99.8%',                              icon: TrendingUp, color: 'bg-amber-500/10  text-amber-600'  },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">System Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-violet-100 text-violet-700">
          Organizations
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-900 leading-tight">{stat.value}</p>
              <p className="text-[10px] text-slate-500 leading-tight truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OverviewWidget;
