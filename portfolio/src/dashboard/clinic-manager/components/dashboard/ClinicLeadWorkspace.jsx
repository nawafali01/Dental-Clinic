import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Users, UserCheck, MessageSquare, Calendar } from 'lucide-react';

export const ClinicLeadWorkspace = () => {
  const funnelStages = [
    { stage: 'New Ingested', count: 42, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { stage: 'AI Outreach', count: 28, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { stage: 'Appt Scheduled', count: 18, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { stage: 'Consultation Complete', count: 12, icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <Card 
      title="Clinic Lead Workspace" 
      subtitle="Lead pipeline progression for local clinic branch"
    >
      <div className="space-y-4 pt-2">
        {/* Funnel Pipeline Visual */}
        <div className="grid grid-cols-2 gap-3">
          {funnelStages.map((stage, idx) => (
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
            <span className="text-slate-800">72% / 80%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
          </div>
        </div>
      </div>
    </Card>
  );
};
