import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { managerAiPerformance, agentPerformanceMetricsConfig } from '../../mock-data/managerMockData';

export const AgentPerformance = () => {
  const metrics = agentPerformanceMetricsConfig.map((item) => ({
    ...item,
    value: managerAiPerformance[item.key] ?? '',
  }));

  return (
    <Card 
      title="AI Agent Performance" 
      subtitle="Operational efficiency of localized AI bots"
    >
      <div className="grid grid-cols-2 gap-4 pt-2">
        {metrics.map((metric, idx) => (
          <div 
            key={idx}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {metric.label}
              </span>
              <div className="p-1 rounded-md bg-slate-100 text-slate-500">
                <metric.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-base font-extrabold text-slate-900">
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
