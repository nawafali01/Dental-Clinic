import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { LEAD_STATUS_STYLES, LEADS_KPI_CONFIG } from '../../constants/dashboardWidgetConstants';

const LeadsWidget = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();

  const rawLeads = storageService.get(storageService.KEYS.LEADS) || [];
  const leads = scopeData({ resource: 'leads', data: rawLeads, currentUser, selectedClinicId });

  const total          = leads.length;
  const hotCount       = leads.filter(l => l.priority === 'high').length;
  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const pendingCount   = leads.filter(l => l.status === 'new' || l.status === 'qualified').length;

  const kpiValues = { total, hot: hotCount, contacted: contactedCount, pending: pendingCount };

  const kpis = LEADS_KPI_CONFIG.map((k) => ({ ...k, value: kpiValues[k.key] ?? 0 }));

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Leads Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">Scoped view ({currentUser?.role})</p>
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
        {leads.slice(0, 4).map((lead) => (
          <div key={lead.id} className="flex items-center justify-between py-2.5 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                {(lead.patientName || lead.name || 'L').split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{lead.patientName || lead.name}</p>
                <p className="text-[10px] text-slate-500">{lead.source || 'Direct'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${LEAD_STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-700'}`}>
                {lead.status}
              </span>
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
