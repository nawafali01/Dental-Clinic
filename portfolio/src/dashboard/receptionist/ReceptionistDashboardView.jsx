import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  UserCheck,
  Clock,
  AlertTriangle,
  Building2,
  CheckCircle2,
  CalendarCheck,
  XCircle,
  Phone,
  Search,
  Filter,
  Plus,
  ArrowRight,
  MoreVertical,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.service';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import {
  INITIAL_DEMO_APPOINTMENTS,
  APPOINTMENT_STATUSES,
  DOCTORS_LIST,
} from '@/dashboard/views/appointments/constants';
import { getGreeting } from '@/utils/dashboardUtils';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';

// ── Status Color Helper ──────────────────────────────────────────
const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'checked-in':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'attended':
    case 'completed':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'booked':
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'no-show':
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'rescheduled':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// ── KPI Card Component ───────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, iconBg, trendColor }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${trendColor || 'text-slate-500'}`}>{sub}</p>}
    </div>
  </div>
);

export default function ReceptionistDashboardView() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Assigned Clinic Resolution (Strict single-clinic scope)
  const clinicId =
    currentUser?.clinicId ||
    (currentUser?.clinicIds && currentUser?.clinicIds[0]) ||
    'clinic-downtown';
  const clinicObj = getClinicById(clinicId);
  const clinicName = clinicObj?.name || 'Downtown Dental Excellence';
  const clinicCity = clinicObj?.city || 'Riyadh';

  // Appointments State
  const [appointments, setAppointments] = useState(() => {
    const saved = storageService.get(storageService.KEYS.APPOINTMENTS);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    storageService.set(storageService.KEYS.APPOINTMENTS, INITIAL_DEMO_APPOINTMENTS);
    return INITIAL_DEMO_APPOINTMENTS;
  });

  // Filters State for Today's Schedule Table
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Reschedule Modal State
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM – 11:00 AM');

  // Greeting
  const greeting = getGreeting();
  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.fullName?.split(' ')[0] || 'Receptionist';

  // Persist helper
  const updateAppointments = useCallback((updater) => {
    setAppointments((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storageService.set(storageService.KEYS.APPOINTMENTS, next);
      return next;
    });
  }, []);

  // Today's Date String (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Tomorrow's Date String
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // ── Scoped Clinic Appointments ──────────────────────────────────
  // Strictly filtered to receptionist's clinic, NO agent/assignee filtering
  const clinicAppointments = useMemo(() => {
    return appointments.filter((a) => isSameClinic(a.clinicId, clinicId));
  }, [appointments, clinicId]);

  // Today's Appointments (Clinic-wide)
  const todayAppointments = useMemo(() => {
    return clinicAppointments.filter((a) => a.date && a.date.startsWith(todayStr));
  }, [clinicAppointments, todayStr]);

  // Checked In Count Today
  const checkedInCount = useMemo(() => {
    return todayAppointments.filter((a) => a.status === 'checked-in').length;
  }, [todayAppointments]);

  // Pending Confirmations (Today + Tomorrow)
  const pendingConfirmations = useMemo(() => {
    return clinicAppointments.filter((a) => {
      const isSoon = a.date && (a.date.startsWith(todayStr) || a.date.startsWith(tomorrowStr));
      const isUnconfirmed = a.status === 'pending' || a.status === 'booked';
      return isSoon && isUnconfirmed;
    });
  }, [clinicAppointments, todayStr, tomorrowStr]);

  // No-Shows Today
  const noShowsTodayCount = useMemo(() => {
    return todayAppointments.filter((a) => a.status === 'no-show').length;
  }, [todayAppointments]);

  // Filtered Today's Schedule for display
  const filteredTodaySchedule = useMemo(() => {
    return todayAppointments.filter((a) => {
      if (scheduleSearch.trim()) {
        const q = scheduleSearch.toLowerCase().trim();
        const matchesName = (a.patientName || '').toLowerCase().includes(q);
        const matchesDoctor = (a.doctorName || '').toLowerCase().includes(q);
        const matchesTreatment = (a.treatment || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDoctor && !matchesTreatment) return false;
      }

      if (selectedDoctor !== 'all' && a.doctorId !== selectedDoctor) {
        return false;
      }

      if (selectedStatus !== 'all' && a.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [todayAppointments, scheduleSearch, selectedDoctor, selectedStatus]);

  // ── Quick Actions Handlers ───────────────────────────────────────
  const handleCheckIn = useCallback((apptId) => {
    updateAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'checked-in' } : a))
    );
    toast.success('Patient checked in successfully.');
  }, [updateAppointments]);

  const handleMarkNoShow = useCallback((apptId) => {
    updateAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'no-show' } : a))
    );
    toast.error('Appointment marked as No-Show.');
  }, [updateAppointments]);

  const handleCancelAppointment = useCallback((apptId) => {
    updateAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'cancelled' } : a))
    );
    toast.info('Appointment cancelled.');
  }, [updateAppointments]);

  const handleConfirmAppointment = useCallback((apptId) => {
    updateAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'confirmed' } : a))
    );
    toast.success('Appointment confirmed & reminder queued.');
  }, [updateAppointments]);

  const handleOpenReschedule = (appt) => {
    setRescheduleAppt(appt);
    setNewDate(appt.date ? appt.date.split('T')[0] : todayStr);
    setNewTime(appt.timeSlot || '10:00 AM – 11:00 AM');
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleAppt) return;

    updateAppointments((prev) =>
      prev.map((a) =>
        a.id === rescheduleAppt.id
          ? {
              ...a,
              date: `${newDate}T${newTime.slice(0, 2)}:00:00.000Z`,
              timeSlot: newTime,
              status: 'rescheduled',
            }
          : a
      )
    );
    toast.success(`Appointment rescheduled to ${newDate}.`);
    setRescheduleAppt(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Front-desk clinic calendar, patient arrivals, and schedule confirmations for today.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Strict Assigned Clinic Badge (No multi-clinic switcher) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{clinicName}</span>
              <span className="text-[10px] text-slate-400">({clinicCity})</span>
            </div>

            <button
              onClick={() => navigate(buildRoleUrl('/appointments', 'receptionist'))}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 KPI Cards (Clinic-wide, no revenue/personal metrics) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Calendar}
          label="Today's Appointments"
          value={todayAppointments.length}
          sub="All clinic providers today"
          iconBg="bg-blue-100 text-blue-600"
          trendColor="text-blue-600"
        />
        <KpiCard
          icon={UserCheck}
          label="Checked In"
          value={checkedInCount}
          sub={`${todayAppointments.length > 0 ? Math.round((checkedInCount / todayAppointments.length) * 100) : 0}% of today's schedule`}
          iconBg="bg-purple-100 text-purple-600"
          trendColor="text-purple-600"
        />
        <KpiCard
          icon={Clock}
          label="Pending Confirmations"
          value={pendingConfirmations.length}
          sub="Next 24–48 hours"
          iconBg="bg-amber-100 text-amber-600"
          trendColor="text-amber-600"
        />
        <KpiCard
          icon={AlertTriangle}
          label="No-Shows Today"
          value={noShowsTodayCount}
          sub={noShowsTodayCount === 0 ? 'Zero no-shows recorded' : 'Requires front-desk follow-up'}
          iconBg={noShowsTodayCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}
          trendColor={noShowsTodayCount > 0 ? 'text-rose-600' : 'text-slate-500'}
        />
      </div>

      {/* ── Main Operations Grid: Today's Schedule & Upcoming Confirmations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Today's Clinic Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live patient queue and appointments across all clinic doctors
              </p>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, doctor..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary w-40"
                />
              </div>

              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                {DOCTORS_LIST.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.shortName || d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="checked-in">Checked In</option>
                <option value="confirmed">Confirmed</option>
                <option value="booked">Booked</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="no-show">No-Show</option>
              </select>
            </div>
          </div>

          {/* Schedule Table */}
          {filteredTodaySchedule.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No appointments match your filters for today.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Adjust search criteria or view the full appointments calendar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">Treatment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Inline Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTodaySchedule.map((appt) => {
                    const isCheckedIn = appt.status === 'checked-in';
                    const isCompleted = appt.status === 'completed';
                    const isNoShow = appt.status === 'no-show';
                    const isCancelled = appt.status === 'cancelled';

                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {appt.timeSlot || (appt.date ? new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{appt.patientName}</div>
                          <div className="text-[11px] text-slate-400">{appt.phone || 'No phone'}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          {appt.doctorName || 'Dr. Reyes'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {appt.treatment}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getStatusColor(
                              appt.status
                            )}`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Check-In Action */}
                            {!isCheckedIn && !isCompleted && !isNoShow && !isCancelled && (
                              <button
                                onClick={() => handleCheckIn(appt.id)}
                                title="Check In Patient"
                                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] border border-purple-200 transition-colors cursor-pointer"
                              >
                                Check In
                              </button>
                            )}

                            {/* Reschedule Action */}
                            {!isCompleted && !isCancelled && (
                              <button
                                onClick={() => handleOpenReschedule(appt)}
                                title="Reschedule Appointment"
                                className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200 transition-colors cursor-pointer"
                              >
                                Reschedule
                              </button>
                            )}

                            {/* Mark No-Show Action */}
                            {!isCheckedIn && !isCompleted && !isNoShow && !isCancelled && (
                              <button
                                onClick={() => handleMarkNoShow(appt.id)}
                                title="Mark as No-Show"
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-[11px] border border-rose-200 transition-colors cursor-pointer"
                              >
                                No-Show
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
          )}
        </div>

        {/* Upcoming Confirmations Needed (1 Column) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Upcoming Confirmations
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Next 24–48h unconfirmed appointments</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {pendingConfirmations.length} Pending
              </span>
            </div>

            {pendingConfirmations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="font-semibold text-slate-700">All set!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No upcoming appointments require confirmation.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
                {pendingConfirmations.map((appt) => (
                  <div key={appt.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs truncate">
                        {appt.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{appt.phone || 'No phone'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {appt.date ? new Date(appt.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'Tomorrow'} • {appt.timeSlot || '10:00 AM'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmAppointment(appt.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Confirm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate(buildRoleUrl('/appointments', 'receptionist'))}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Manage Clinic Appointments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Reschedule Modal ── */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleAppt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
              <p className="font-semibold text-slate-900">{rescheduleAppt.patientName}</p>
              <p className="text-slate-500">Provider: {rescheduleAppt.doctorName}</p>
              <p className="text-slate-500">Treatment: {rescheduleAppt.treatment}</p>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="09:00 AM – 10:00 AM">09:00 AM – 10:00 AM</option>
                  <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                  <option value="11:00 AM – 12:00 PM">11:00 AM – 12:00 PM</option>
                  <option value="01:00 PM – 02:00 PM">01:00 PM – 02:00 PM</option>
                  <option value="02:00 PM – 03:00 PM">02:00 PM – 03:00 PM</option>
                  <option value="03:00 PM – 04:00 PM">03:00 PM – 04:00 PM</option>
                  <option value="04:00 PM – 05:00 PM">04:00 PM – 05:00 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleAppt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
