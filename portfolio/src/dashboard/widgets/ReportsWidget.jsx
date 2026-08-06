import React from 'react';
import { FileText, Download, ArrowRight } from 'lucide-react';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { getScopeLabel, getVisibleReports } from '../../utils/dashboardUtils';

const STATUS_STYLES = {
  ready:      'bg-emerald-100 text-emerald-700',
  generating: 'bg-amber-100   text-amber-700',
  failed:     'bg-red-100     text-red-700',
};

const ReportsWidget = () => {
  const accessLevel  = getUserResourceAccess('reports');
  const scopeLabel   = getScopeLabel('reports', accessLevel) || 'Reports';
  const reports      = getVisibleReports(accessLevel);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700">
          {reports.length} reports
        </span>
      </div>

      {reports.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">No reports available for your scope.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{report.title}</p>
                <p className="text-[10px] text-slate-500">{report.period}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLES[report.status]}`}>
                  {report.status}
                </span>
                {report.status === 'ready' && (
                  <button className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
        View all reports <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </section>
  );
};

export default ReportsWidget;
