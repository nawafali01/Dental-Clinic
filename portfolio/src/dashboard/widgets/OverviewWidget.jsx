import React, { useState, useEffect } from 'react';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { getScopeLabel } from '../../utils/dashboardUtils';
import { OVERVIEW_STATS_CONFIG } from '../../constants/dashboardWidgetConstants';
import { getDashboardReport } from '@/services/reportsService';

/**
 * OverviewWidget
 * System / organisation overview — shown to super_admin and org_admin only.
 * Connected to live FastAPI backend API: GET /api/v1/reports/dashboard
 */
const OverviewWidget = () => {
  const accessLevel = getUserResourceAccess('organizations');
  const scopeLabel  = getScopeLabel('organizations', accessLevel) || 'Overview';
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getDashboardReport()
      .then((data) => {
        if (!cancelled && data) {
          setDashboardData(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = OVERVIEW_STATS_CONFIG.map((s) => {
    let liveVal = accessLevel === 'all' ? s.allValue : s.scopedValue;
    if (dashboardData) {
      if (s.label.toLowerCase().includes('lead') && dashboardData.total_leads) {
        liveVal = `${dashboardData.total_leads}`;
      } else if (s.label.toLowerCase().includes('appointment') && dashboardData.total_appointments) {
        liveVal = `${dashboardData.total_appointments}`;
      } else if (s.label.toLowerCase().includes('revenue') && dashboardData.total_revenue) {
        liveVal = `$${Number(dashboardData.total_revenue).toLocaleString()}`;
      }
    }
    return {
      label: s.label,
      icon: s.icon,
      color: s.color,
      value: liveVal,
    };
  });

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
