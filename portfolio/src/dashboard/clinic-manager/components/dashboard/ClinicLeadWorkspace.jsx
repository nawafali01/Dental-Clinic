import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { clinicLeadWorkspaceFunnel, clinicLeadWorkspaceGoal } from '../../mock-data/managerMockData';

export const ClinicLeadWorkspace = () => {
  return (
    <Card 
      title="Clinic Lead Workspace" 
      subtitle="Lead pipeline progression for local clinic branch"
    >
      <div className="space-y-4 pt-2">
        {/* Funnel Pipeline Visual */}
        <div className="grid grid-cols-2 gap-3">
          {clinicLeadWorkspaceFunnel.map((stage, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stage.bg} ${stage.color}`}>
                  <stage.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-600">
                  {stage.stage}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-800">
                {stage.count}
              </span>
            </div>
          ))}
        </div>

        {/* Local Conversion Goals */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-500">Monthly Lead Conversion Goal</span>
            <span className="text-slate-800">
              {clinicLeadWorkspaceGoal.currentPct}% / {clinicLeadWorkspaceGoal.targetPct}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ width: clinicLeadWorkspaceGoal.progressWidth }} 
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
