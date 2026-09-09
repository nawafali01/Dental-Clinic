import React, { useState, useMemo } from 'react';
import {
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Building2,
  Users,
  Filter,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.service';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import { INITIAL_DEMO_APPOINTMENTS, DOCTORS_LIST } from '@/dashboard/views/appointments/constants';

// ── KPI Metric Card ──────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, iconBg, trendColor }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
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

export default function ReceptionistReportsView() {
  const { currentUser } = useAuth();

  // Assigned clinic resolution (Strict single-clinic scope)
  const clinicId =
    currentUser?.clinicId ||
    (currentUser?.clinicIds && currentUser?.clinicIds[0]) ||
    'clinic-downtown';
  const clinicObj = getClinicById(clinicId);
  const clinicName = clinicObj?.name || 'Downtown Dental Excellence';
  const clinicCity = clinicObj?.city || 'Riyadh';

  // Date Range filter
  const [dateRange, setDateRange] = useState('month'); // 'today' | 'week' | 'month' | 'all'

  // Fetch appointments
  const appointments = useMemo(() => {
    const saved = storageService.get(storageService.KEYS.APPOINTMENTS);
    const data = saved && Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_DEMO_APPOINTMENTS;
    // Strict clinic filter
    return data.filter((a) => isSameClinic(a.clinicId, clinicId));
  }, [clinicId]);

  // Filter appointments by selected date range
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return appointments.filter((a) => {
      if (!a.date) return true;
      const apptDate = new Date(a.date);

      if (dateRange === 'today') {
        return a.date.startsWith(todayStr);
      }

      if (dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const weekAhead = new Date();
        weekAhead.setDate(now.getDate() + 7);
        return apptDate >= weekAgo && apptDate <= weekAhead;
      }

      if (dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        const monthAhead = new Date();
        monthAhead.setDate(now.getDate() + 30);
        return apptDate >= monthAgo && apptDate <= monthAhead;
      }

      return true; // 'all'
    });
  }, [appointments, dateRange]);

  // ── Metrics Calculations ─────────────────────────────────────────
  const totalScheduled = filteredAppointments.length;
  const attendedCount = filteredAppointments.filter(
    (a) => a.status === 'attended' || a.status === 'completed' || a.status === 'checked-in'
  ).length;
  const completedOnlyCount = filteredAppointments.filter((a) => a.status === 'completed').length;
  const noShowCount = filteredAppointments.filter((a) => a.status === 'no-show').length;
  const cancelledCount = filteredAppointments.filter((a) => a.status === 'cancelled').length;

  const attendanceRate = totalScheduled > 0 ? Math.round((attendedCount / totalScheduled) * 100) : 0;
  const noShowRate = totalScheduled > 0 ? Math.round((noShowCount / totalScheduled) * 100) : 0;

  // ── Doctor Schedule Breakdown ────────────────────────────────────
  const doctorStats = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((a) => {
      const docName = a.doctorName || 'Unassigned Provider';
      if (!map[docName]) {
        map[docName] = { total: 0, attended: 0, noShow: 0, pending: 0 };
      }
      map[docName].total += 1;
      if (a.status === 'attended' || a.status === 'completed' || a.status === 'checked-in') {
        map[docName].attended += 1;
      } else if (a.status === 'no-show') {
        map[docName].noShow += 1;
      } else {
        map[docName].pending += 1;
      }
    });

    return Object.entries(map).map(([name, stats]) => ({
      name,
      ...stats,
      rate: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0,
    }));
  }, [filteredAppointments]);

  // ── Status Distribution ──────────────────────────────────────────
  const statusStats = useMemo(() => {
    const counts = {
      Confirmed: 0,
      'Checked-In': 0,
      Completed: 0,
      Booked: 0,
      Pending: 0,
      'No-Show': 0,
      Cancelled: 0,
    };

    filteredAppointments.forEach((a) => {
      const s = (a.status || '').toLowerCase();
      if (s === 'confirmed') counts.Confirmed += 1;
      else if (s === 'checked-in') counts['Checked-In'] += 1;
      else if (s === 'completed' || s === 'attended') counts.Completed += 1;
      else if (s === 'booked') counts.Booked += 1;
      else if (s === 'pending') counts.Pending += 1;
      else if (s === 'no-show') counts['No-Show'] += 1;
      else if (s === 'cancelled') counts.Cancelled += 1;
    });

    return counts;
  }, [filteredAppointments]);

  // ── Export CSV Handler ───────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['ID', 'Patient Name', 'Phone', 'Doctor', 'Treatment', 'Date', 'Time Slot', 'Status'];
    const rows = filteredAppointments.map((a) => [
      a.id,
      `"${a.patientName || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.doctorName || ''}"`,
      `"${a.treatment || ''}"`,
      a.date ? a.date.split('T')[0] : '',
      `"${a.timeSlot || ''}"`,
      a.status || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clinic_schedule_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Schedule report exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinic Schedule Reports
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Appointment volume, provider utilization, and clinic attendance rates.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Strict Assigned Clinic Badge (No multi-clinic switcher) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{clinicName}</span>
              <span className="text-[10px] text-slate-400">({clinicCity})</span>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setDateRange('today')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  dateRange === 'today' ? 'bg-white shadow-2xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  dateRange === 'week' ? 'bg-white shadow-2xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  dateRange === 'month' ? 'bg-white shadow-2xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setDateRange('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  dateRange === 'all' ? 'bg-white shadow-2xs font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>

            {/* Export & Print */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Schedule Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Scheduled"
          value={totalScheduled}
          sub="Appointments in selected period"
          icon={Calendar}
          iconBg="bg-blue-100 text-blue-600"
          trendColor="text-blue-600"
        />
        <StatCard
          label="Attended / Checked-In"
          value={attendedCount}
          sub={`${completedOnlyCount} fully completed`}
          icon={CheckCircle2}
          iconBg="bg-emerald-100 text-emerald-600"
          trendColor="text-emerald-600"
        />
        <StatCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          sub="Patients who showed up"
          icon={BarChart3}
          iconBg="bg-purple-100 text-purple-600"
          trendColor="text-purple-600"
        />
        <StatCard
          label="No-Show Rate"
          value={`${noShowRate}%`}
          sub={`${noShowCount} missed appointments`}
          icon={AlertTriangle}
          iconBg={noShowCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}
          trendColor={noShowCount > 0 ? 'text-rose-600' : 'text-slate-500'}
        />
      </div>

      {/* ── Detailed Breakdown Tables: Provider Performance & Status Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Utilization Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Provider Schedule Utilization
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Appointments and attendance across clinic doctors</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{doctorStats.length} Providers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3 text-center">Total Scheduled</th>
                  <th className="py-2.5 px-3 text-center">Attended</th>
                  <th className="py-2.5 px-3 text-center">No-Shows</th>
                  <th className="py-2.5 px-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctorStats.map((doc) => (
                  <tr key={doc.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{doc.name}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">{doc.total}</td>
                    <td className="py-3 px-3 text-center font-medium text-emerald-600">{doc.attended}</td>
                    <td className="py-3 px-3 text-center font-medium text-rose-600">{doc.noShow}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        {doc.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Distribution Summary (1 Column) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              Appointment Status Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across status categories</p>
          </div>

          <div className="space-y-3">
            {Object.entries(statusStats).map(([statusLabel, count]) => {
              const pct = totalScheduled > 0 ? Math.round((count / totalScheduled) * 100) : 0;
              return (
                <div key={statusLabel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{statusLabel}</span>
                    <span className="text-slate-900 font-bold">
                      {count} <span className="text-[11px] text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
