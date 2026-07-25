import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { managerOverdueTasks } from '../../mock-data/managerMockData';
import { AlertCircle, CheckSquare } from 'lucide-react';

export const OverdueTaskManager = () => {
  return (
    <Card 
      title="Overdue Task Manager" 
      subtitle="Operational and administrative tasks requiring immediate action"
      action={<Badge variant="destructive">{managerOverdueTasks.length} Urgent</Badge>}
    >
      <div className="space-y-3 pt-2">
        {managerOverdueTasks.map((task) => (
          <div 
            key={task.id} 
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start justify-between gap-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  task.priority === 'High' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                }`} />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {task.task}
                </span>
              </div>
              {task.patient && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Patient: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.patient}</span>
                </p>
              )}
              <div className="mt-1 flex items-center gap-1 text-[10px] text-red-500 font-mono font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Overdue by {task.overdueBy}</span>
              </div>
            </div>

            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500 transition-all shrink-0">
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {managerOverdueTasks.length === 0 && (
          <div className="py-6 text-center text-slate-500 text-xs">
            No overdue tasks.
          </div>
        )}
      </div>
    </Card>
  );
};
