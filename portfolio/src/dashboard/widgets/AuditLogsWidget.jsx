import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { getScopeLabel } from '../../utils/dashboardUtils';
import {
  MOCK_AUDIT_LOGS,
  AUDIT_ACTION_ICONS,
  AUDIT_ACTION_COLORS,
  AUDIT_SEVERITY_DOTS
} from '../../constants/dashboardWidgetConstants';

const AuditLogsWidget = () => {
  const accessLevel = getUserResourceAccess('audit_logs');
  const scopeLabel  = getScopeLabel('audit_logs', accessLevel) || 'Audit Logs';

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Audit Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700">
          Security
        </span>
      </div>

      <div className="space-y-2">
        {MOCK_AUDIT_LOGS.map((log) => {
          const Icon  = AUDIT_ACTION_ICONS[log.action]  ?? ShieldCheck;
          const color = AUDIT_ACTION_COLORS[log.action] ?? 'bg-slate-500/10 text-slate-600';

          return (
            <div
              key={log.id}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">{log.actor}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${AUDIT_SEVERITY_DOTS[log.severity]}`} />
                    <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{log.resource}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
        <Clock className="w-3.5 h-3.5" />
        Full audit history
      </button>
    </section>
  );
};

export default AuditLogsWidget;
