import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { APPOINTMENT_STATUS_STYLES } from '../../constants/dashboardWidgetConstants';

const AppointmentsWidget = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();

  const rawAppts = storageService.get(storageService.KEYS.APPOINTMENTS) || [];
  const appts = scopeData({ resource: 'appointments', data: rawAppts, currentUser, selectedClinicId });

  const confirmed = appts.filter(a => a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'completed').length;
  const pending   = appts.filter(a => a.status === 'pending').length;
  const cancelled = appts.filter(a => a.status === 'cancelled').length;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Scoped view ({currentUser?.role})</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
          Appointments
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-bold text-slate-800">{confirmed}</span>
          <span className="text-slate-500">active</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-bold text-slate-800">{pending}</span>
          <span className="text-slate-500">pending</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-xs">
          <XCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="font-bold text-slate-800">{cancelled}</span>
          <span className="text-slate-500">cancelled</span>
        </div>
      </div>

      <div className="space-y-2">
        {appts.slice(0, 4).map((appt) => (
          <div
            key={appt.id}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 leading-tight">
              <Calendar className="w-3.5 h-3.5 mb-0.5 text-slate-500" />
              {appt.date ? new Date(appt.date).getHours() + ':00' : '09:00'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{appt.patientName || appt.patientId || 'Patient'}</p>
              <p className="text-[10px] text-slate-500">{appt.type || 'Dental Checkup'} · {appt.clinicId || 'Downtown Clinic'}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize shrink-0 ${APPOINTMENT_STATUS_STYLES[appt.status] || 'bg-blue-100 text-blue-700'}`}>
              {appt.status}
            </span>
          </div>
        ))}
      </div>

      <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
        View full schedule <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </section>
  );
};

export default AppointmentsWidget;
