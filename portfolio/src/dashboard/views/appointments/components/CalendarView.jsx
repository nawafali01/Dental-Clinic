import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { CALENDAR_HOURS, WEEK_DAYS, DAYS } from '../constants';

export const CalendarView = ({
  viewMode, // 'day' | 'week' | 'month'
  appointments,
  onSelectAppointment,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'confirmed':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'attended':
      case 'completed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'rescheduled':
      case 'pending':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'no-show':
      case 'cancelled':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  // Day View: Hour Slots
  if (viewMode === 'day') {
    return (
      <Card
        title="Day Schedule Matrix"
        subtitle="Real-time operatory time slots and clinical chair utilization"
      >
        <div className="space-y-3 pt-2">
          {CALENDAR_HOURS.map((hour) => {
            const hourNumber = parseInt(hour.split(':')[0], 10);
            const slotAppts = appointments.filter((a) => {
              if (!a.date) return false;
              const apptHour = new Date(a.date).getHours();
              return apptHour === hourNumber;
            });

            return (
              <div key={hour} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="w-16 pt-1 text-xs font-mono font-bold text-slate-500 shrink-0 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {hour}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[48px]">
                  {slotAppts.map((appt) => (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppointment(appt)}
                      className={`p-3 rounded-xl border shadow-2xs hover:shadow-md cursor-pointer transition-all ${getStatusColor(
                        appt.status
                      )}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs truncate">{appt.patientName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80">
                          {appt.status}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-80 flex items-center justify-between">
                        <span className="truncate">{appt.treatment}</span>
                        <span className="font-medium">{appt.doctorName?.split(' ')[1] || 'Doctor'}</span>
                      </div>
                      {appt.aiRiskLevel === 'high' && (
                        <div className="mt-2 text-[10px] font-bold text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>AI No-Show Risk ({appt.aiRiskScore}%)</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {slotAppts.length === 0 && (
                    <div className="flex items-center text-xs text-slate-400 italic py-1">
                      No appointments scheduled in this hour
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // Week View: 7 Days Columns
  if (viewMode === 'week') {
    return (
      <Card
        title="Weekly Operatory Board"
        subtitle="7-day synchronized appointments across all active doctors"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 pt-2 overflow-x-auto">
          {DAYS.map((day, dIdx) => {
            const dayAppts = appointments.filter((_, idx) => idx % 7 === dIdx || (dIdx === 0 && idx === 0));

            return (
              <div key={day.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col space-y-2.5 min-h-[360px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">{day.label}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                    {dayAppts.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {dayAppts.map((appt) => (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppointment(appt)}
                      className={`p-2.5 rounded-lg border shadow-2xs hover:shadow-md cursor-pointer transition-all text-xs ${getStatusColor(
                        appt.status
                      )}`}
                    >
                      <div className="font-bold truncate">{appt.patientName}</div>
                      <div className="text-[10px] opacity-80 mt-0.5 truncate">{appt.treatment}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                        <span>{appt.timeSlot?.split('–')[0]?.trim() || '10:00 AM'}</span>
                        <span className="capitalize font-bold">{appt.status}</span>
                      </div>
                    </div>
                  ))}

                  {dayAppts.length === 0 && (
                    <div className="text-center py-10 text-[11px] text-slate-400">
                      Open Slots Available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // Month View: 30-Day Calendar Grid
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Card
      title="Monthly Capacity & Appointment Overview"
      subtitle="Complete monthly scheduling density and booked slots"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
        {daysInMonth.map((dayNum) => {
          const matchingAppts = appointments.filter((_, idx) => (idx * 3) % 30 + 1 === dayNum);

          return (
            <div
              key={dayNum}
              className={`p-2.5 rounded-xl border min-h-[90px] flex flex-col justify-between transition-all ${
                dayNum === new Date().getDate()
                  ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${dayNum === new Date().getDate() ? 'text-primary' : 'text-slate-700'}`}>
                  {dayNum}
                </span>
                {matchingAppts.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-white">
                    {matchingAppts.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-1">
                {matchingAppts.slice(0, 2).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAppointment(a)}
                    className="text-[10px] font-semibold truncate px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 hover:text-primary cursor-pointer"
                  >
                    {a.patientName}
                  </div>
                ))}
                {matchingAppts.length > 2 && (
                  <span className="text-[9px] text-slate-400 font-bold block text-right">
                    +{matchingAppts.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const AppointmentsCalendarView = CalendarView;
export default CalendarView;
