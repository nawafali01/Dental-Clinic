import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { toast } from 'sonner';

export function AddStatusModal({ isOpen, onClose, onSave, statusToEdit = null, currentCount = 0 }) {
  const isEdit = Boolean(statusToEdit);

  const [formData, setFormData] = useState({
    name: '',
    color: 'blue',
    order: String(currentCount + 1),
    leads: '0',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (statusToEdit) {
      setFormData({
        name: statusToEdit.name || '',
        color: statusToEdit.color || 'blue',
        order: String(statusToEdit.order || '1'),
        leads: statusToEdit.leads || '0',
      });
    } else {
      setFormData({
        name: '',
        color: 'blue',
        order: String(currentCount + 1),
        leads: '0',
      });
    }
  }, [statusToEdit, isOpen, currentCount]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Status name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      onSave?.(formData, statusToEdit?.id || statusToEdit?.name);
      toast.success(isEdit ? `Status stage updated!` : `Status stage added!`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-primary">
            <Tag className="size-5" />
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? 'Edit Pipeline Stage' : 'Add Pipeline Stage'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Stage Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. In Treatment, Deposit Paid"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Badge Color</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium cursor-pointer"
              >
                <option value="blue">Blue (Initial / Intake)</option>
                <option value="amber">Amber (Waiting / In Review)</option>
                <option value="purple">Purple (Qualified)</option>
                <option value="green">Green (Converted / Success)</option>
                <option value="red">Red (Lost / Disqualified)</option>
                <option value="slate">Slate (Neutral)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Funnel Order Index
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Stage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStatusModal;
