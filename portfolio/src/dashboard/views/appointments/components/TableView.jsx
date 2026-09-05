import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  UserCheck,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';

export const TableView = ({
  isLoading,
  appointments,
  paginatedAppointments,
  currentPage,
  totalPages,
  setCurrentPage,
  onSelectAppointment,
  onQuickCheckIn,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'checked-in':
        return <Badge variant="purple" dot>Checked In</Badge>;
      case 'confirmed':
        return <Badge variant="info" dot>Confirmed</Badge>;
      case 'booked':
        return <Badge variant="info" dot>Booked</Badge>;
      case 'attended':
        return <Badge variant="purple" dot>Attended</Badge>;
      case 'completed':
        return <Badge variant="success" dot>Completed</Badge>;
      case 'rescheduled':
        return <Badge variant="warning" dot>Rescheduled</Badge>;
      case 'no-show':
        return <Badge variant="error" dot>No-Show</Badge>;
      case 'cancelled':
        return <Badge variant="error" dot>Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning" dot>Pending</Badge>;
    }
  };

  const getAiRiskBadge = (level, score) => {
    if (level === 'high' || (score && score >= 70)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          High Risk ({score || 84}%)
        </span>
      );
    }
    if (level === 'medium' || (score && score >= 40)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Med ({score || 48}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Low ({score || 12}%)
      </span>
    );
  };

  return (
    <Card
      title="Appointment Directory & Clinical Bookings"
      subtitle="Complete chronological bookings, provider scheduling, and patient intake status"
      action={
        <span className="text-xs font-semibold text-slate-500">
          Showing {paginatedAppointments.length} of {appointments.length} Appointments
        </span>
      }
    >
      {isLoading ? (
        <div className="space-y-2 py-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-14 text-center text-slate-500 text-xs">
          <div className="text-sm font-semibold text-slate-800">No appointments match the selected criteria</div>
          <div className="mt-1 text-slate-400">
            Try adjusting your search query, clinic, doctor, or status filter.
          </div>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Patient Name & Contact</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Clinic & Org</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Treatment</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Provider / Doctor</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Date & Time Slot</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">AI No-Show Risk</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAppointments.map((appt) => {
                  const initials = (appt.patientName || 'Patient')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const apptDateObj = appt.date ? new Date(appt.date) : new Date();
                  const formattedDate = apptDateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr
                      key={appt.id}
                      onClick={() => onSelectAppointment(appt)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Patient Details */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                              {appt.patientName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal flex items-center gap-2 mt-0.5">
                              <span>{appt.phone || '+1-555-0100'}</span>
                              <span>•</span>
                              <span className="truncate max-w-[130px]">{appt.email || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Clinic & Org */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-xs text-slate-800">{appt.clinicName || 'Downtown Branch'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{appt.orgName || 'Smile Care Group'}</div>
                      </td>

                      {/* Treatment */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                          {appt.treatment || 'General Checkup'}
                        </span>
                      </td>

                      {/* Provider / Doctor */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-primary" />
                          <span className="truncate max-w-[130px]">{appt.doctorName || 'Dr. Catherine Reyes'}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{appt.timeSlot || '09:00 AM – 10:00 AM'}</span>
                        </div>
                      </td>

                      {/* AI Risk Score */}
                      <td className="py-3.5 px-4 text-center">
                        {getAiRiskBadge(appt.aiRiskLevel, appt.aiRiskScore)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(appt.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {appt.status !== 'checked-in' && appt.status !== 'attended' && appt.status !== 'completed' && (
                            <button
                              onClick={() => onQuickCheckIn(appt.id)}
                              title="Quick Patient Check-In"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectAppointment(appt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 border border-primary/20 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Local Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page <strong className="text-slate-800">{currentPage}</strong> of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export const AppointmentsTableView = TableView;
export default TableView;
