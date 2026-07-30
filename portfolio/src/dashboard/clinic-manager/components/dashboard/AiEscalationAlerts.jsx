import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { managerAiAlerts } from '../../mock-data/managerMockData';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const AiEscalationAlerts = () => {
  return (
    <Card 
      title="AI Escalations" 
      subtitle="Requires human intervention"
      action={<Badge variant="destructive">{managerAiAlerts.length} Action Needed</Badge>}
    >
      <div className="space-y-3 pt-2">
        {managerAiAlerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 truncate">
                  {alert.alert}
                </span>
                <span className="text-[10px] text-red-500 font-mono whitespace-nowrap ml-2">
                  {alert.time}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-red-600">
                <span>{alert.patient}</span>
                <span>•</span>
                <span className="opacity-80">{alert.agent}</span>
              </div>
              <button className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700:text-red-300 transition-colors uppercase tracking-wider">
                Takeover Conversation <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {managerAiAlerts.length === 0 && (
          <div className="py-6 text-center text-slate-500 text-xs">
            No active escalations.
          </div>
        )}
      </div>
    </Card>
  );
};
