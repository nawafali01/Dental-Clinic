import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { managerAppointments } from '../../mock-data/managerMockData';
import { Calendar, Clock, User } from 'lucide-react';

export const AppointmentsList = () => {
  return (
    <Card 
      title="Today's Appointments" 
      subtitle="Scheduled patient treatments and consultations"
      action={<Badge variant="info">{managerAppointments.length} Active</Badge>}
    >
      <div className="space-y-3 pt-2">
        {managerAppointments.map((apt) => (
          <div 
            key={apt.id} 
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 ${
                apt.status === 'arrived' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-blue-500/10 text-blue-500'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {apt.patient}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {apt.type} • <span className="font-medium">{apt.provider}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {apt.time}
                </div>
              </div>
              <Badge 
                variant={apt.status === 'arrived' ? 'success' : 'secondary'}
                className="text-[9px] uppercase tracking-wider py-0.5 px-2 font-bold"
              >
                {apt.status}
              </Badge>
            </div>
          </div>
        ))}
        {managerAppointments.length === 0 && (
          <div className="py-6 text-center text-slate-500 text-xs">
            No appointments scheduled for today.
          </div>
        )}
      </div>
    </Card>
  );
};
