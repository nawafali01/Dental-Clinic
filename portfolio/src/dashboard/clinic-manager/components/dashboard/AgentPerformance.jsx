import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { managerAiPerformance } from '../../mock-data/managerMockData';
import { Phone, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const AgentPerformance = () => {
  const metrics = [
    { label: 'Outbound Calls', value: managerAiPerformance.callsHandled, icon: Phone, desc: 'Handled by local AI today' },
    { label: 'Avg Handle Time', value: managerAiPerformance.avgHandleTime, icon: Clock, desc: 'AI response latency & talk time' },
    { label: 'Human Escalation', value: managerAiPerformance.humanEscalationRate, icon: ArrowUpRight, desc: 'Transferred to desk staff' },
    { label: 'Bookings Secured', value: managerAiPerformance.appointmentsSecured, icon: CheckCircle2, desc: 'Appointments auto-booked' }
  ];

  return (
    <Card 
      title="AI Agent Performance" 
      subtitle="Operational efficiency of localized AI bots"
    >
      <div className="grid grid-cols-2 gap-4 pt-2">
        {metrics.map((metric, idx) => (
          <div 
            key={idx}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {metric.label}
              </span>
              <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <metric.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {metric.value}
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                {metric.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
