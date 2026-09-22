import React, { useState, useEffect } from 'react';
import { X, CreditCard, Search } from 'lucide-react';
import { toast } from 'sonner';
import { storageService } from '@/services/storage.service';
import { createRevenue } from '@/services/revenueService';
import { leadsService } from '@/services/leadsService';

export function RecordPaymentModal({ isOpen, onClose, onSuccess, currentUser, selectedClinicId }) {
  const clinics = storageService.get(storageService.KEYS.CLINICS) || [];

  const defaultClinicId =
    selectedClinicId && selectedClinicId !== 'all'
      ? selectedClinicId
      : clinics[0]?.id || '';

  const [formData, setFormData] = useState({
    lead_id: '',
    treatment_name: '',
    total_amount: '',
    deposit_amount: '',
    payment_type: 'credit_card',
    payment_status: 'paid',
    clinic_id: defaultClinicId,
    notes: '',
  });

  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDropdownOpen, setLeadDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch leads when modal opens using leadsService (handles org scope + auth)
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLeadsLoading(true);
    leadsService
      .fetchLeads({ limit: 200 }, currentUser)
      .then((result) => {
        if (cancelled) return;
        // fetchLeads returns { data, total } or array depending on version
        const raw = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : [];
        setLeads(raw);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[RecordPaymentModal] leads fetch error:', err);
        setLeads([]);
      })
      .finally(() => {
        if (!cancelled) setLeadsLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // Filter leads by search
  const filteredLeads = leads.filter((l) => {
    const name = `${l.first_name || ''} ${l.last_name || ''}`.toLowerCase();
    const email = (l.email || '').toLowerCase();
    const q = leadSearch.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lead_id) {
      toast.error('Please select a lead / patient');
      return;
    }
    if (!formData.treatment_name || formData.treatment_name.trim().length < 2) {
      toast.error('Treatment name is required (min 2 characters)');
      return;
    }
    const totalAmount = Number(formData.total_amount);
    if (!totalAmount || totalAmount <= 0) {
      toast.error('Total amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        lead_id: formData.lead_id,
        treatment_name: formData.treatment_name.trim(),
        total_amount: totalAmount,
        deposit_amount: Number(formData.deposit_amount) || totalAmount,
        payment_type: formData.payment_type,
        payment_status: formData.payment_status,
        ...(formData.clinic_id ? { clinic_id: formData.clinic_id } : {}),
        currency: 'USD',
        notes: formData.notes || '',
      };

      const newRecord = await createRevenue(payload, currentUser);
      toast.success(`Revenue of $${totalAmount.toLocaleString()} recorded!`);
      onSuccess?.(newRecord);
      onClose();
      // Reset
      setFormData({
        lead_id: '',
        treatment_name: '',
        total_amount: '',
        deposit_amount: '',
        payment_type: 'credit_card',
        payment_status: 'paid',
        clinic_id: defaultClinicId,
        notes: '',
      });
      setSelectedLead(null);
      setLeadSearch('');
      setLeadDropdownOpen(false);
    } catch (err) {
      console.error('[RecordPaymentModal]', err);
      toast.error(err?.message || 'Failed to record revenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="size-5" />
            <h2 className="text-lg font-bold text-slate-900">Record Revenue</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">

          {/* Lead / Patient — custom combobox */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Lead / Patient <span className="text-rose-500">*</span>
            </label>

            {/* Selected lead chip */}
            {selectedLead ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-primary/5 border border-primary/30 rounded-xl mb-1.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedLead.patientName || selectedLead.name}
                  </p>
                  {selectedLead.email && (
                    <p className="text-xs text-slate-400">{selectedLead.email}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLead(null);
                    setFormData((prev) => ({ ...prev, lead_id: '' }));
                    setLeadSearch('');
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors cursor-pointer ml-2"
                >
                  ✕ Change
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={leadsLoading ? 'Loading leads…' : 'Search by name or email…'}
                    value={leadSearch}
                    onChange={(e) => {
                      setLeadSearch(e.target.value);
                      setLeadDropdownOpen(true);
                    }}
                    onFocus={() => setLeadDropdownOpen(true)}
                    onBlur={() => {
                      // Slight delay to allow item click
                      setTimeout(() => setLeadDropdownOpen(false), 200);
                    }}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Dropdown list */}
                {leadDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {leadsLoading ? (
                      <div className="px-4 py-3 text-sm text-slate-400">Loading leads…</div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-400">No leads found</div>
                    ) : (
                      filteredLeads.map((l) => {
                        const id = l.id || l._id;
                        const name =
                          l.patientName ||
                          l.name ||
                          `${l.first_name || ''} ${l.last_name || ''}`.trim() ||
                          l.email || id;
                        const treatmentName =
                          l.treatment_interest ||
                          l.treatment_name ||
                          l.treatment ||
                          l.service ||
                          l.procedure ||
                          '';
                        const amount =
                          l.estimated_cost ||
                          l.estimatedCost ||
                          l.budget ||
                          l.value ||
                          l.amount ||
                          '';

                        return (
                          <button
                            key={id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault(); // prevent input blur before click fires
                              setSelectedLead({ ...l, patientName: name });
                              setFormData((prev) => ({
                                ...prev,
                                lead_id: id,
                                treatment_name: treatmentName || prev.treatment_name,
                                total_amount: amount ? String(amount) : prev.total_amount,
                                deposit_amount: amount ? String(amount) : prev.deposit_amount,
                                clinic_id: l.clinic_id || l.clinicId || prev.clinic_id,
                              }));
                              setLeadSearch('');
                              setLeadDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
                          >
                            <p className="text-sm font-semibold text-slate-800">{name}</p>
                            {l.email && <p className="text-xs text-slate-400">{l.email}</p>}
                            {treatmentName && (
                              <p className="text-xs text-primary/80 mt-0.5">
                                Treatment: {treatmentName}
                              </p>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Treatment Name — required */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Treatment Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={200}
              placeholder="e.g. Dental Implant Stage 1"
              value={formData.treatment_name}
              onChange={set('treatment_name')}
              className={inputCls}
            />
          </div>

          {/* Amount row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Total Amount (USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="450"
                value={formData.total_amount}
                onChange={set('total_amount')}
                className={`${inputCls} font-semibold`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Deposit Amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Same as total"
                value={formData.deposit_amount}
                onChange={set('deposit_amount')}
                className={inputCls}
              />
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Payment Method
              </label>
              <select value={formData.payment_type} onChange={set('payment_type')} className={`${inputCls} cursor-pointer`}>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="insurance">Insurance</option>
                <option value="financing">Financing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Payment Status
              </label>
              <select value={formData.payment_status} onChange={set('payment_status')} className={`${inputCls} cursor-pointer`}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="deposit_received">Deposit Received</option>
                <option value="partial">Partial</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Clinic Branch */}
          {clinics.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Clinic Branch
              </label>
              <select value={formData.clinic_id} onChange={set('clinic_id')} className={`${inputCls} cursor-pointer`}>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Follow-up session included"
              value={formData.notes}
              onChange={set('notes')}
              className={inputCls}
            />
          </div>
        </form>

        {/* Footer */}
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
            {isSubmitting ? 'Saving...' : 'Record Revenue'}
          </button>
        </div>
      </div>
    </div>
  );
}
