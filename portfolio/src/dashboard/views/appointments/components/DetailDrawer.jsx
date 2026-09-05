import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import {
  APPOINTMENT_STATUSES,
  DOCTORS_LIST,
  TREATMENTS_FILTER_LIST,
} from '../constants';

export const DetailDrawer = ({
  isOpen,
  onClose,
  appointment,
  isNewBooking,
  organizations,
  availableClinics,
  onSaveAppointment,
  onConvertToPatient,
}) => {
  // Form state for managing or creating
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [doctorId, setDoctorId] = useState('doc-1');
  const [treatment, setTreatment] = useState('Dental Implant');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM – 10:00 AM');
  const [status, setStatus] = useState('booked');
  const [notes, setNotes] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    if (appointment && !isNewBooking) {
      setPatientName(appointment.patientName || '');
      setPhone(appointment.phone || '');
      setEmail(appointment.email || '');
      setClinicId(appointment.clinicId || '');
      setDoctorId(appointment.doctorId || 'doc-1');
      setTreatment(appointment.treatment || 'Dental Implant');
      setDate(appointment.date ? appointment.date.split('T')[0] : '');
      setTimeSlot(appointment.timeSlot || '09:00 AM – 10:00 AM');
      setStatus(appointment.status || 'booked');
      setNotes(appointment.notes || '');
      setRescheduleReason('');
    } else if (isNewBooking) {
      setPatientName('');
      setPhone('');
      setEmail('');
      setClinicId(availableClinics[0]?.id || 'clinic-001');
      setDoctorId('doc-1');
      setTreatment('Teeth Whitening');
      setDate(new Date().toISOString().split('T')[0]);
      setTimeSlot('10:00 AM – 11:00 AM');
      setStatus('booked');
      setNotes('');
      setRescheduleReason('');
    }
  }, [appointment, isNewBooking, availableClinics]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const matchedDoc = DOCTORS_LIST.find((d) => d.id === doctorId);
    const matchedClinic = availableClinics.find((c) => c.id === clinicId);

    const payload = {
      id: isNewBooking ? `apt-${Date.now()}` : appointment.id,
      patientName,
      phone,
      email,
      clinicId: clinicId || 'clinic-001',
      clinicName: matchedClinic ? matchedClinic.name : 'Downtown Dental Excellence',
      orgId: matchedClinic?.orgId || 'org-001',
      orgName: matchedClinic?.orgName || 'Smile Care Group',
      doctorId,
      doctorName: matchedDoc ? matchedDoc.name.split(' (')[0] : 'Dr. Catherine Reyes',
      treatment,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      timeSlot,
      status,
      notes: rescheduleReason ? `${notes} (Rescheduled: ${rescheduleReason})`.trim() : notes,
      aiRiskLevel: appointment?.aiRiskLevel || 'low',
      aiRiskScore: appointment?.aiRiskScore || 15,
      aiRiskReason: appointment?.aiRiskReason || 'New booking intake recorded.',
      isConvertedPatient: appointment?.isConvertedPatient || false,
    };

    onSaveAppointment(payload, isNewBooking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* 1. Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    {isNewBooking ? 'Book New Clinical Appointment' : 'Manage Clinical Appointment'}
                  </h2>
                  {!isNewBooking && (
                    <Badge variant="purple" className="capitalize">
                      {status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isNewBooking
                    ? 'Schedule a patient consult, assign doctor, and lock operatory time.'
                    : `Appointment Ref: ${appointment?.id}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <form id="appointment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* AI Risk Summary Card (Existing Appointment Mode) */}
            {!isNewBooking && appointment?.aiRiskLevel && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  appointment.aiRiskLevel === 'high'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : appointment.aiRiskLevel === 'medium'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>AI No-Show Risk: {appointment.aiRiskLevel.toUpperCase()} ({appointment.aiRiskScore}%)</span>
                  </div>
                  <p className="opacity-90">{appointment.aiRiskReason}</p>
                </div>
              </div>
            )}

            {/* Patient Credentials */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Credentials</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Sarah Mitchell"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1-555-0142"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic & Doctor Assignment */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinic & Doctor Provider</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clinic Location</label>
                  <select
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {availableClinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Doctor</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {DOCTORS_LIST.filter((d) => d.id !== 'all').map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Treatment & Time Slot */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Treatment & Operatory Slot</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Treatment Type</label>
                  <select
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {TREATMENTS_FILTER_LIST.filter((t) => t.id !== 'all').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    >
                      <option value="08:30 AM – 09:30 AM">08:30 AM – 09:30 AM</option>
                      <option value="09:30 AM – 10:30 AM">09:30 AM – 10:30 AM</option>
                      <option value="10:30 AM – 11:30 AM">10:30 AM – 11:30 AM</option>
                      <option value="11:30 AM – 12:30 PM">11:30 AM – 12:30 PM</option>
                      <option value="01:30 PM – 02:30 PM">01:30 PM – 02:30 PM</option>
                      <option value="02:30 PM – 03:30 PM">02:30 PM – 03:30 PM</option>
                      <option value="03:30 PM – 04:30 PM">03:30 PM – 04:30 PM</option>
                      <option value="04:30 PM – 05:30 PM">04:30 PM – 05:30 PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Lifecycle Status & Transitions */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lifecycle Status & Transitions
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current State</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    {APPOINTMENT_STATUSES.filter((s) => s.id !== 'all').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reschedule / Cancellation Reason */}
                {(status === 'rescheduled' || status === 'cancelled') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                      Reason for {status === 'rescheduled' ? 'Rescheduling' : 'Cancellation'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patient schedule conflict / Acute sickness"
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      className="w-full px-3 py-2 bg-rose-50/60 border border-rose-200 rounded-xl text-xs text-rose-900"
                    />
                  </div>
                )}

                {/* Convert to Patient Action (When Attended / Completed) */}
                {!isNewBooking && (status === 'attended' || status === 'completed') && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">Consultation Attended</div>
                      <div className="text-[11px] text-emerald-700">Patient accepted treatment plan</div>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon={UserPlus}
                      onClick={() => onConvertToPatient(appointment.id)}
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                    >
                      {appointment.isConvertedPatient ? 'Patient Active' : 'Convert to Patient'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-600">Clinical / Intake Notes</label>
              <textarea
                rows={2}
                placeholder="Enter pre-op instructions, patient medical alerts, or scheduling notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </form>

          {/* 3. Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              type="submit"
              form="appointment-form"
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              className="cursor-pointer"
            >
              {isNewBooking ? 'Confirm & Book Appointment' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppointmentDetailDrawer = DetailDrawer;
export default DetailDrawer;
