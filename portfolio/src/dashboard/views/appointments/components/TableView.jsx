import React from 'react';
import {
  Clock,
  Calendar,
  UserCheck,
  Eye,
  CheckCircle,
  CalendarX,
  Trash2,
  Ban,
} from 'lucide-react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Pagination } from '@/dashboard/shared/components/ui/Pagination';
import { canUserPerformAction } from '@/utils/appointmentPermissions';

export const TableView = ({
  isLoading,
  appointments,
  paginatedAppointments,
  currentPage,
  totalPages,
  pageSize = 10,
  setCurrentPage,
  onSelectAppointment,
  onQuickCheckIn,
  onCancelAppointment,
  onDeleteAppointment,
  readOnly = false,
  currentUser = null,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'checked-in':
      case 'checked_in':
        return <Badge variant="purple" dot>Checked In</Badge>;
      case 'confirmed':
        return <Badge variant="info" dot>Confirmed</Badge>;
      case 'booked':
      case 'scheduled':
        return <Badge variant="info" dot>Scheduled</Badge>;
      case 'reminded':
        return <Badge variant="info" dot>Reminded</Badge>;
      case 'in_progress':
        return <Badge variant="purple" dot>In Progress</Badge>;
      case 'attended':
        return <Badge variant="purple" dot>Attended</Badge>;
      case 'completed':
        return <Badge variant="success" dot>Completed</Badge>;
      case 'rescheduled':
        return <Badge variant="warning" dot>Rescheduled</Badge>;
      case 'no-show':
      case 'no_show':
        return <Badge variant="error" dot>No-Show</Badge>;
      case 'cancelled':
        return <Badge variant="error" dot>Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning" dot>Pending</Badge>;
    }
  };

  return (
    <Card
      title="Appointment Directory & Clinical Bookings"
      subtitle="Complete chronological bookings, provider scheduling, and patient intake status"
      action={
        appointments.length > 0 ? (
          <span className="text-xs font-semibold text-slate-500">
            {appointments.length} Total Appointments
          </span>
        ) : null
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
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <CalendarX className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-800">No appointments found in backend database</div>
          <div className="mt-1 text-slate-400">
            Click "+ Book Appointment" above to schedule your first appointment in the backend.
          </div>
        </div>
      ) : (
        <div>
          {/* Responsive table contained inside card */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs">
                  <th className="py-3 px-3.5 text-left font-semibold uppercase tracking-wider">Patient Details</th>
                  <th className="py-3 px-3 text-left font-semibold uppercase tracking-wider">Clinic</th>
                  <th className="py-3 px-3 text-left font-semibold uppercase tracking-wider">Treatment</th>
                  <th className="py-3 px-3 text-left font-semibold uppercase tracking-wider">Provider</th>
                  <th className="py-3 px-3 text-left font-semibold uppercase tracking-wider">Date & Time</th>
                  <th className="py-3 px-3 text-center font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-3.5 text-right font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAppointments.map((appt) => {
                  const initials = (appt.patientName || appt.patient_name || 'Patient')
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
                      <td className="py-3 px-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors truncate max-w-[140px]">
                              {appt.patientName || appt.patient_name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-normal truncate max-w-[140px]">
                              {appt.phone || appt.patient_phone || appt.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Clinic */}
                      <td className="py-3 px-3 text-slate-600">
                        <div className="font-medium text-xs text-slate-800 truncate max-w-[130px]">
                          {appt.clinicName || appt.clinic_name || 'Clinic'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {appt.orgName || appt.org_name || ''}
                        </div>
                      </td>

                      {/* Treatment */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 truncate max-w-[130px]">
                          {appt.treatment || appt.title || 'Consultation'}
                        </span>
                      </td>

                      {/* Provider / Doctor */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[120px]">{appt.doctorName || appt.doctor_name || 'Assigned Doctor'}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]">{appt.timeSlot || appt.scheduled_time || '10:00 AM'}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        {getStatusBadge(appt.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!readOnly &&
                            onQuickCheckIn &&
                            canUserPerformAction(currentUser, 'checkin', appt) &&
                            appt.status !== 'checked-in' &&
                            appt.status !== 'checked_in' &&
                            appt.status !== 'attended' &&
                            appt.status !== 'completed' &&
                            appt.status !== 'cancelled' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickCheckIn(appt.id);
                                }}
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
                            {readOnly || !canUserPerformAction(currentUser, 'edit', appt) ? 'View' : 'Manage'}
                          </button>
                          {!readOnly &&
                            onCancelAppointment &&
                            canUserPerformAction(currentUser, 'cancel', appt) &&
                            appt.status !== 'cancelled' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const reason = window.prompt(
                                    `Reason for cancelling appointment for ${appt.patientName || 'this patient'} (optional):`,
                                    'Patient requested cancellation'
                                  );
                                  if (reason !== null) {
                                    onCancelAppointment(appt.id, reason);
                                  }
                                }}
                                title="Cancel Appointment"
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          {!readOnly &&
                            onDeleteAppointment &&
                            canUserPerformAction(currentUser, 'delete', appt) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to permanently delete the appointment for ${appt.patientName || 'this patient'}?`)) {
                                    onDeleteAppointment(appt.id);
                                  }
                                }}
                                title="Delete Appointment"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Unified Pagination (matching Leads & Users views) */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={appointments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="appointments"
            className="-mx-5 -mb-5 mt-4"
          />
        </div>
      )}
    </Card>
  );
};

export default TableView;
