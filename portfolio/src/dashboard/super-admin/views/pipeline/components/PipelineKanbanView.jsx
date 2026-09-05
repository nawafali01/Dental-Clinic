import React from 'react';
import { UserCheck, UserX, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { PIPELINE_STAGES } from '../constants';

export const PipelineKanbanView = ({ leads, onSelectLead }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage.id);

        return (
          <div
            key={stage.id}
            className="bg-slate-100/80 border border-slate-200/90 rounded-2xl p-3 space-y-3 min-w-[240px] flex flex-col"
          >
            {/* Stage Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tracking-tight">{stage.label}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                {stageLeads.length}
              </span>
            </div>

            {/* Stage Cards Container */}
            <div className="space-y-2.5 min-h-[300px]">
              {stageLeads.map((lead) => {
                const isHot = lead.priority === 'high' || (lead.aiScore && lead.aiScore >= 80);

                return (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer space-y-2.5 group"
                  >
                    {/* Top Row: Name & AI score */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                          {lead.patientName}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {lead.treatment || 'General Inquiry'}
                        </p>
                      </div>
                      {isHot && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                          🔥 {lead.aiScore || 88}
                        </span>
                      )}
                    </div>

                    {/* Meta Row: Source & Clinic */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-600 truncate max-w-[100px]">
                        {lead.clinicName || 'Downtown Branch'}
                      </span>
                      <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-mono">
                        {lead.source || 'Ads'}
                      </span>
                    </div>

                    {/* Bottom Row: Assigned Agent / Unassigned Status */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {lead.assignedAgentName ? (
                        <span className="text-slate-600 font-medium flex items-center gap-1 truncate max-w-[130px]">
                          <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          {lead.assignedAgentName}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <UserX className="w-3 h-3 shrink-0" />
                          Unassigned
                        </span>
                      )}
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}

              {stageLeads.length === 0 && (
                <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                  No leads in {stage.label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
