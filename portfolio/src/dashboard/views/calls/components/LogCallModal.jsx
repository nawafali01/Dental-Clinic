import React, { useState } from 'react';
import { X, PhoneCall, Clock, User, Building2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { logCall, CALL_OUTCOMES } from '@/services/callsService';
import { storageService } from '@/services/storage.service';

export function LogCallModal({ isOpen, onClose, onSuccess, currentUser, selectedClinicId }) {
  const leads = storageService.get(storageService.KEYS.LEADS) || [];
  const users = storageService.get(storageService.KEYS.USERS) || [];
  const clinics = storageService.get(storageService.KEYS.CLINICS) || [];

  const [formData, setFormData] = useState({
    leadName: '',
    leadId: '',
    durationMinutes: 3,
    durationSeconds: 30,
    outcome: 'contacted',
    notes: '',
    agentId: currentUser?.id || users[0]?.id || '',
    clinicId: selectedClinicId && selectedClinicId !== 'all' ? selectedClinicId : 'clinic-downtown',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLeadSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData((prev) => ({ ...prev, leadId: '', leadName: '' }));
      return;
    }
    const lead = leads.find((l) => l.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      leadId: selectedId,
      leadName: lead?.patientName || lead?.name || '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.leadName.trim()) {
      toast.error('Caller or Lead name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const totalDuration = (Number(formData.durationMinutes) || 0) * 60 + (Number(formData.durationSeconds) || 0);

      const created = logCall({
        agentId: formData.agentId,
        leadName: formData.leadName,
        leadId: formData.leadId || null,
        outcome: formData.outcome,
        duration: totalDuration,
        notes: formData.notes,
        clinicId: formData.clinicId,
      });

      if (created) {
        toast.success(`Call with ${formData.leadName} logged successfully!`);
        onSuccess?.(created);
        onClose();
      } else {
        toast.error('Failed to log call');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error logging call');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-primary">
            <PhoneCall className="size-5" />
            <h2 className="text-lg font-bold text-slate-900">Log a Call</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Quick Select from Leads */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Select Existing Lead (Optional)
            </label>
            <select
              value={formData.leadId}
              onChange={handleLeadSelect}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">-- Or enter custom name below --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.patientName || l.name} ({l.phone || 'No phone'})
                </option>
              ))}
            </select>
          </div>

          {/* Caller Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Caller / Lead Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={formData.leadName}
              onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Call Outcome */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Call Outcome
            </label>
            <select
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
            >
              {CALL_OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="180"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Seconds
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.durationSeconds}
                onChange={(e) => setFormData({ ...formData, durationSeconds: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Agent & Clinic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Logged By (Agent)
              </label>
              <select
                value={formData.agentId}
                onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.name} ({u.role?.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Clinic
              </label>
              <select
                value={formData.clinicId}
                onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Call Notes / Summary
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Inquired about full mouth rehabilitation, sent quote..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Saving...' : 'Log Call'}
          </button>
        </div>
      </div>
    </div>
  );
}
