import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  UserPlus,
  Trash2,
  Ban,
} from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import {
  APPOINTMENT_STATUSES,
  TREATMENTS_FILTER_LIST,
} from '../constants';
import { isSameClinic } from '@/constants/clinics';
import { canUserPerformAction } from '@/utils/appointmentPermissions';

export const DetailDrawer = ({
  isOpen,
  onClose,
  appointment,
  isNewBooking,
  organizations,
  availableClinics,
  users = [],
  leads = [],
  onSaveAppointment,
  onCancelAppointment,
  onDeleteAppointment,
  onQuickCheckIn,
  onConvertToPatient,
  readOnly = false,
  currentUser = null,
}) => {
  // Form state for managing or creating
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [leadId, setLeadId] = useState('');
  const [treatment, setTreatment] = useState('Dental Implant');
  const [title, setTitle] = useState('Dental Implant Consultation');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM – 10:00 AM');
  const [status, setStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    if (appointment && !isNewBooking) {
      setPatientName(appointment.patientName || appointment.patient_name || '');
      setPhone(appointment.phone || appointment.patient_phone || '');
      setEmail(appointment.email || appointment.patient_email || '');
      setClinicId(appointment.clinicId || appointment.clinic_id || availableClinics[0]?.id || '');
      setAssignedTo(appointment.assigned_to || appointment.assignedTo || appointment.doctorId || '');
      setLeadId(appointment.lead_id || appointment.leadId || '');
      setTreatment(appointment.treatment || appointment.title || 'Dental Implant');
      setTitle(appointment.title || appointment.treatment || 'Clinical Consultation');
      setAppointmentType(appointment.appointmentType || appointment.appointment_type || 'consultation');
      setDurationMinutes(appointment.durationMinutes || appointment.duration_minutes || 30);
      setDate(appointment.scheduled_date || (appointment.date ? appointment.date.split('T')[0] : ''));
      setTimeSlot(appointment.timeSlot || '09:00 AM – 10:00 AM');
      setStatus(appointment.status || 'scheduled');
      setNotes(appointment.notes || '');
      setRescheduleReason('');
    } else if (isNewBooking) {
      setPatientName('');
      setPhone('');
      setEmail('');
      setClinicId(availableClinics[0]?.id || '');
      setAssignedTo('');
      setLeadId('');
      setTreatment('Teeth Whitening');
      setTitle('Teeth Whitening Consultation');
      setAppointmentType('consultation');
      setDurationMinutes(30);
      setDate(new Date().toISOString().split('T')[0]);
      setTimeSlot('10:00 AM – 11:00 AM');
      setStatus('scheduled');
      setNotes('');
      setRescheduleReason('');
    }
  }, [appointment, isNewBooking, availableClinics]);

  // Available staff from backend users
  const availableStaff = React.useMemo(() => {
    if (!users || users.length === 0) return [];
    return [...users].sort((a, b) => {
      const nameA = a.fullName || a.full_name || a.name || a.email || '';
      const nameB = b.fullName || b.full_name || b.name || b.email || '';
      return nameA.localeCompare(nameB);
    });
  }, [users]);

  // Available leads
  const availableLeads = React.useMemo(() => {
    if (!leads || leads.length === 0) return [];
    if (!clinicId) return leads;
    return leads.filter((l) => (!l.clinicId && !l.clinic_id) || isSameClinic(l.clinicId || l.clinic_id, clinicId));
  }, [leads, clinicId]);

  // Permission guards based on user role and data scope
  const canPerformSave = React.useMemo(() => {
    if (readOnly) return false;
    if (isNewBooking) {
      return canUserPerformAction(currentUser, 'create', { clinic_id: clinicId });
    }
    return canUserPerformAction(currentUser, 'edit', appointment);
  }, [readOnly, isNewBooking, currentUser, clinicId, appointment]);

  const canPerformCancel = React.useMemo(() => {
    if (readOnly || isNewBooking) return false;
    return canUserPerformAction(currentUser, 'cancel', appointment);
  }, [readOnly, isNewBooking, currentUser, appointment]);

  const canPerformDelete = React.useMemo(() => {
    if (readOnly || isNewBooking) return false;
    return canUserPerformAction(currentUser, 'delete', appointment);
  }, [readOnly, isNewBooking, currentUser, appointment]);

  const canPerformCheckIn = React.useMemo(() => {
    if (readOnly || isNewBooking) return false;
    return canUserPerformAction(currentUser, 'checkin', appointment);
  }, [readOnly, isNewBooking, currentUser, appointment]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const matchedClinic = availableClinics.find((c) => c.id === clinicId);
    const matchedStaff = availableStaff.find((u) => u.id === assignedTo || u._id === assignedTo);
    const resolvedStaffName = matchedStaff
      ? (matchedStaff.fullName || matchedStaff.full_name || matchedStaff.name || matchedStaff.email)
      : 'Unassigned';

    // Compute scheduled_time (HH:MM:SS)
    let scheduledTime = '10:00:00';
    if (timeSlot) {
      const matched = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (matched) {
        let h = parseInt(matched[1], 10);
        const m = matched[2];
        const ampm = matched[3]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        scheduledTime = `${String(h).padStart(2, '0')}:${m}:00`;
      }
    }

    const scheduledDate = date ? date.split('T')[0] : new Date().toISOString().split('T')[0];
    const computedIsoDate = `${scheduledDate}T${scheduledTime}`;

    // Ensure phone matches regex
    let cleanPhone = (phone || '').trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      cleanPhone = '+15551234567';
    }

    const cleanEmail = email && email.trim() && email.includes('@') ? email.trim() : null;
    const cleanAssignedTo = assignedTo && assignedTo.trim() && !assignedTo.startsWith('doc-') ? assignedTo.trim() : null;
    const cleanLeadId = leadId && leadId.trim() && !leadId.startsWith('lead-') ? leadId.trim() : null;

    const payload = {
      id: isNewBooking ? undefined : appointment?.id,
      patientName,
      patient_name: patientName,
      phone: cleanPhone,
      patient_phone: cleanPhone,
      email: cleanEmail,
      patient_email: cleanEmail,
      clinicId: clinicId || availableClinics[0]?.id,
      clinic_id: clinicId || availableClinics[0]?.id,
      clinicName: matchedClinic ? matchedClinic.name : 'Clinic',
      orgId: matchedClinic?.orgId || matchedClinic?.organization_id || 'org-001',
      orgName: matchedClinic?.orgName || matchedClinic?.organization_name || 'Smile Care Group',
      assigned_to: cleanAssignedTo,
      assignedTo: cleanAssignedTo,
      doctorId: cleanAssignedTo || 'unassigned',
      doctorName: resolvedStaffName,
      lead_id: cleanLeadId,
      leadId: cleanLeadId,
      treatment,
      title: title || treatment || 'Clinical Consultation',
      appointment_type: appointmentType || 'consultation',
      duration_minutes: Number(durationMinutes || 30),
      durationMinutes: Number(durationMinutes || 30),
      date: computedIsoDate,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      timeSlot,
      status,
      notes: rescheduleReason ? `${notes} (Rescheduled: ${rescheduleReason})`.trim() : (notes && notes.trim() ? notes.trim() : null),
      cancellation_reason: rescheduleReason || null,
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

            {/* Clinic & Assigned Staff (assigned_to) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinic & Assigned Provider</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clinic Location *</label>
                  <select
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {availableClinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.city ? `(${c.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-600">Assigned To (Staff / Provider)</label>
                    <span className="text-[10px] text-slate-400">
                      {availableStaff.length > 0 ? `${availableStaff.length} available` : 'Optional'}
                    </span>
                  </div>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Unassigned (No staff assigned)</option>
                    {availableStaff.map((u) => (
                      <option key={u.id || u._id} value={u.id || u._id}>
                        {u.fullName || u.full_name || u.name || u.email} ({u.role?.replace('_', ' ') || 'Staff'}{u.is_active === false || u.status === 'inactive' ? ' - Inactive' : ''})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Related Lead (lead_id) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Related Lead (Optional)</label>
                <select
                  value={leadId}
                  onChange={(e) => {
                    const lId = e.target.value;
                    setLeadId(lId);
                    if (lId && isNewBooking) {
                      const matchedLead = availableLeads.find((l) => l.id === lId);
                      if (matchedLead) {
                        if (!patientName && (matchedLead.patientName || matchedLead.name || matchedLead.first_name)) {
                          setPatientName(matchedLead.patientName || matchedLead.name || `${matchedLead.first_name || ''} ${matchedLead.last_name || ''}`.trim());
                        }
                        if (!phone && (matchedLead.phone || matchedLead.patient_phone)) {
                          setPhone(matchedLead.phone || matchedLead.patient_phone);
                        }
                        if (!email && (matchedLead.email || matchedLead.patient_email)) {
                          setEmail(matchedLead.email || matchedLead.patient_email);
                        }
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">None (Standalone Appointment)</option>
                  {availableLeads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.patientName || l.name || `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.id} {l.phone ? `(${l.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Treatment & Time Slot */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Treatment & Operatory Slot</h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Treatment</label>
                    <select
                      value={treatment}
                      onChange={(e) => {
                        setTreatment(e.target.value);
                        if (isNewBooking) setTitle(`${e.target.value} ${appointmentType === 'consultation' ? 'Consultation' : 'Session'}`);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    >
                      {TREATMENTS_FILTER_LIST.filter((t) => t.id !== 'all').map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Appointment Type</label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium capitalize"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="treatment">Treatment</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date</label>
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
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration</label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                      <option value={90}>90 mins</option>
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
                {!isNewBooking && (status === 'attended' || status === 'completed') && !readOnly && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">Patient File Integration</div>
                      <div className="text-[11px] text-emerald-700">Promote this lead to a registered clinical patient file</div>
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
                disabled={readOnly}
                placeholder="Enter pre-op instructions, patient medical alerts, or scheduling notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 disabled:opacity-75"
              />
            </div>
          </form>

          {/* 3. Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
                {readOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isNewBooking && !readOnly && canPerformCheckIn && onQuickCheckIn && status !== 'checked-in' && status !== 'checked_in' && status !== 'attended' && status !== 'completed' && status !== 'cancelled' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={CheckCircle}
                  onClick={() => {
                    const id = appointment?.id || appointment?._id;
                    if (id) onQuickCheckIn(id);
                  }}
                  className="cursor-pointer text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  Check In
                </Button>
              )}
              {!isNewBooking && !readOnly && canPerformCancel && onCancelAppointment && status !== 'cancelled' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Ban}
                  onClick={() => {
                    const id = appointment?.id || appointment?._id;
                    if (id) {
                      const reason = window.prompt(
                        `Reason for cancelling appointment for ${patientName || 'this patient'} (optional):`,
                        rescheduleReason || 'Patient requested cancellation'
                      );
                      if (reason !== null) {
                        onCancelAppointment(id, reason);
                      }
                    }
                  }}
                  className="cursor-pointer text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  Cancel Booking
                </Button>
              )}
              {!isNewBooking && !readOnly && canPerformDelete && onDeleteAppointment && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  icon={Trash2}
                  onClick={() => {
                    const id = appointment?.id || appointment?._id;
                    if (id && window.confirm(`Are you sure you want to permanently delete the appointment for ${patientName || 'this patient'}?`)) {
                      onDeleteAppointment(id);
                    }
                  }}
                  className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Delete
                </Button>
              )}
            </div>
            {canPerformSave ? (
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
            ) : (
              <span className="text-xs text-slate-400 font-medium italic">Read-Only View</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppointmentDetailDrawer = DetailDrawer;
export default DetailDrawer;
