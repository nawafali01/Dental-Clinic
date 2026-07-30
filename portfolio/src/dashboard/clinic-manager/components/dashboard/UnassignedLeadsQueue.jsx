import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { managerLeadsQueue } from '../../mock-data/managerMockData';
import { UserPlus, ArrowRight, Hourglass } from 'lucide-react';

export const UnassignedLeadsQueue = () => {
  const getAiScoreVariant = (score) => {
    switch (score) {
      case 'High': return 'purple';
      case 'Medium': return 'info';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card 
      title="Unassigned Leads Queue" 
      subtitle="Newly ingested prospects awaiting counselor assignment"
      action={<Badge variant="warning">{managerLeadsQueue.length} Pending</Badge>}
    >
      <div className="space-y-3 pt-2">
        {managerLeadsQueue.map((lead) => (
          <div 
            key={lead.id} 
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 hover:bg-slate-100:bg-slate-800 transition-all"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {lead.name}
                </span>
                <Badge variant={getAiScoreVariant(lead.aiScore)} className="text-[9px] py-0 px-1.5 font-bold">
                  AI: {lead.aiScore}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                Interest: <span className="font-semibold text-slate-700">{lead.interest}</span>
              </p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                <Hourglass className="w-3 h-3" />
                <span>In queue for {lead.timeInQueue}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                {lead.status}
              </span>
              <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-primary:text-primary hover:border-primary transition-all">
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {managerLeadsQueue.length === 0 && (
          <div className="py-6 text-center text-slate-500 text-xs">
            No unassigned leads in queue.
          </div>
        )}
      </div>
    </Card>
  );
};
