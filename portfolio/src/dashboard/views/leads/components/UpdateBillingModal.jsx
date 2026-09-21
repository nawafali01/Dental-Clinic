import React, { useState, useEffect } from 'react';
import { X, DollarSign, Receipt, CreditCard, FileText, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { updateLeadBilling } from '@/services/leadsService';

export function UpdateBillingModal({ isOpen, onClose, onSuccess, lead, currentUser }) {
  const [formData, setFormData] = useState({
    paid_amount: 0,
    payment_status: 'pending',
    receipt_status: 'unissued',
    invoice_number: '',
    invoice_status: 'draft',
    billing_notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      setFormData({
        paid_amount: lead.paid_amount ?? lead.paidAmount ?? 0,
        payment_status: lead.payment_status || lead.paymentStatus || 'pending',
        receipt_status: lead.receipt_status || lead.receiptStatus || 'unissued',
        invoice_number: lead.invoice_number || lead.invoiceNumber || (lead.id ? `INV-${String(lead.id).slice(-4).toUpperCase()}` : 'INV-0001'),
        invoice_status: lead.invoice_status || lead.invoiceStatus || 'draft',
        billing_notes: lead.billing_notes || lead.billingNotes || '',
      });
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const expectedRevenue = Number(lead.expected_revenue ?? lead.expectedRevenue ?? 0);
  const paidAmount = Number(formData.paid_amount) || 0;
  const balanceDue = Math.max(0, expectedRevenue - paidAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await updateLeadBilling(lead.id, formData, currentUser);
      toast.success(res?.message || 'Billing and invoice details updated successfully!');
      onSuccess?.(res?.data || { ...lead, ...formData });
      onClose();
    } catch (err) {
      console.error('[UpdateBillingModal] Error:', err);
      toast.error(err.message || 'Failed to update billing details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Update Billing & Invoice</h2>
              <p className="text-xs text-slate-500 font-medium">
                Lead #{lead.id} • {lead.patientName || lead.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Revenue Summary Preview Banner */}
        <div className="px-6 py-3.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-emerald-800 font-medium">Expected Treatment Fee:</span>
            <span className="ml-1 font-bold text-emerald-950">${expectedRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-emerald-800 font-medium">Balance Due:</span>
            <span className={`ml-1 font-bold ${balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              ${balanceDue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paid Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Paid Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer capitalize"
              >
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid (Fully Settled)</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Invoice Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Invoice Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="e.g. INV-2026-0042"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Invoice Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Invoice Status
              </label>
              <select
                value={formData.invoice_status}
                onChange={(e) => setFormData({ ...formData, invoice_status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer capitalize"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="settled">Settled</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Receipt Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Payment Receipt Status
            </label>
            <select
              value={formData.receipt_status}
              onChange={(e) => setFormData({ ...formData, receipt_status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer capitalize"
            >
              <option value="unissued">Unissued</option>
              <option value="issued">Issued</option>
              <option value="verified">Verified by Finance</option>
              <option value="refunded">Refunded / Cancelled</option>
            </select>
          </div>

          {/* Billing Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Financial Audit Memo / Notes
            </label>
            <textarea
              rows={2}
              value={formData.billing_notes}
              onChange={(e) => setFormData({ ...formData, billing_notes: e.target.value })}
              placeholder="Add audit notes, payment method references, or reconciliation details..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Billing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Billing Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
