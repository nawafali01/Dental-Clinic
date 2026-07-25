import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { managerTeam } from '../../mock-data/managerMockData';
import { Sparkles, Calendar, Coffee, User } from 'lucide-react';

export const TeamAllocation = () => {
  return (
    <Card 
      title="Local Team Allocation" 
      subtitle="Real-time clinic practitioner schedules"
    >
      <div className="space-y-3 pt-2">
        {managerTeam.map((member) => (
          <div 
            key={member.id} 
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {member.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {member.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {member.currentPatient && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                  Treating: {member.currentPatient}
                </span>
              )}
              {member.status === 'break' && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center gap-1 font-medium">
                  <Coffee className="w-3 h-3 text-slate-400" /> Break
                </span>
              )}
              <Badge 
                variant={member.status === 'active' ? 'success' : 'secondary'}
                className="text-[9px] uppercase tracking-wider py-0.5 px-2 font-bold"
              >
                {member.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
