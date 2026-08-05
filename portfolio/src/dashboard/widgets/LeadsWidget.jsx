import React from 'react';
import { Users, PhoneCall, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { getScopeLabel, getVisibleLeads } from '../../utils/dashboardUtils';
import { LEAD_STATUS_STYLES } from '../../constants/dashboardWidgetConstants';

const LeadsWidget = () => {
  const accessLevel  = getUserResourceAccess('leads');
  const scopeLabel   = getScopeLabel('leads', accessLevel) || 'Leads';
  const visibleLeads = getVisibleLeads(accessLevel);

  const kpis = [
    { label: 'Total',     value: visibleLeads.length, icon: Users,      color: 'bg-blue-500/10   text-blue-600'   },
    { label: 'Hot',       value: 2,                   icon: TrendingUp,  color: 'bg-rose-500/10   text-rose-600'   },
    { label: 'Contacted', value: 1,                   icon: PhoneCall,   color: 'bg-amber-500/10  text-amber-600'  },
    { label: 'Pending',   value: 1,                   icon: Clock,       color: 'bg-slate-500/10  text-slate-600'  },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Leads Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
          Leads
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 ${k.color}`}>
              <k.icon className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-bold text-slate-900">{k.value}</span>
            <span className="text-[10px] text-slate-500">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {visibleLeads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between py-2.5 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                {lead.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{lead.name}</p>
                <p className="text-[10px] text-slate-500">{lead.source}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${LEAD_STATUS_STYLES[lead.status]}`}>
                {lead.status}
              </span>
              <span className="text-xs font-bold text-slate-700">{lead.value}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
        View all leads <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </section>
  );
};

export default LeadsWidget;
