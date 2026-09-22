import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { processRefund } from '@/services/revenueService';

/**
 * RefundModal — calls POST /api/v1/revenue/{revenue_id}/refund
 * Only accessible by FINANCE role (enforced in processRefund service).
 */
export function RefundModal({ isOpen, onClose, onSuccess, record, currentUser }) {
  const maxAmount = Number(
    record?.paid_amount ?? record?.paidAmount ?? record?.total_amount ?? record?.revenue ?? 0
  );

  const [amount, setAmount] = useState(String(maxAmount || ''));
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const refundAmount = Number(amount);

    if (maxAmount === 0) {
      toast.error('No payments have been recorded for this revenue — refund is not possible yet.');
      return;
    }
    if (!refundAmount || refundAmount <= 0) {
      toast.error('Refund amount must be greater than 0');
      return;
    }
    if (refundAmount > maxAmount) {
      toast.error(`Refund amount cannot exceed paid amount ($${maxAmount.toLocaleString()})`);
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    setIsSubmitting(true);
    try {
      await processRefund(record.id, { amount: refundAmount, reason: reason.trim() }, currentUser);
      toast.success(`Refund of $${refundAmount.toLocaleString()} processed successfully`);
      onSuccess?.();
      onClose();
      setAmount(String(maxAmount || ''));
      setReason('');
    } catch (err) {
      console.error('[RefundModal]', err);
      // Extract real backend error message
      const backendMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to process refund';
      toast.error(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:border-rose-400 transition-all';

  const treatmentName = record.treatment_name || record.treatmentName || record.notes || 'Revenue Record';
  const currency = record.currency || 'USD';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/60">
          <div className="flex items-center gap-2 text-rose-600">
            <RotateCcw className="size-5" />
            <h2 className="text-lg font-bold text-slate-900">Issue Refund</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Record summary */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Treatment</p>
          <p className="text-sm font-semibold text-slate-800">{treatmentName}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Max refundable:{' '}
            {maxAmount === 0 ? (
              <span className="font-semibold text-amber-600">$0.00 — no payments recorded yet</span>
            ) : (
              <span className="font-semibold text-slate-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(maxAmount)}
              </span>
            )}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Refund Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Refund Amount ({currency}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0.01"
              max={maxAmount > 0 ? maxAmount : undefined}
              step="0.01"
              placeholder={String(maxAmount || '0')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputCls} font-semibold`}
            />
            {maxAmount > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(maxAmount))}
                className="mt-1 text-xs text-primary hover:underline cursor-pointer"
              >
                Use full amount (${maxAmount.toLocaleString()})
              </button>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Patient cancelled procedure, double charge correction…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-amber-500 mt-0.5 text-sm">⚠</span>
            <p className="text-xs text-amber-700">
              This action will process a refund via the backend and update the payment status to <strong>Refunded</strong>. This cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Processing...' : 'Process Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
