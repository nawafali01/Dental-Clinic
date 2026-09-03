import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { toast } from 'sonner';

export function AddSourceModal({ isOpen, onClose, onSave, sourceToEdit = null }) {
  const isEdit = Boolean(sourceToEdit);

  const [formData, setFormData] = useState({
    source: '',
    type: 'Paid',
    status: 'Active',
    leads: '0',
    rate: '0%',
    color: 'green',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sourceToEdit) {
      setFormData({
        source: sourceToEdit.source || '',
        type: sourceToEdit.type || 'Paid',
        status: sourceToEdit.status || 'Active',
        leads: sourceToEdit.leads || '0',
        rate: sourceToEdit.rate || '0%',
        color: sourceToEdit.status === 'Active' ? 'green' : 'amber',
      });
    } else {
      setFormData({
        source: '',
        type: 'Paid',
        status: 'Active',
        leads: '0',
        rate: '0%',
        color: 'green',
      });
    }
  }, [sourceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.source.trim()) {
      toast.error('Source name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        color: formData.status === 'Active' ? 'green' : 'amber',
      };
      onSave?.(payload, sourceToEdit?.id || sourceToEdit?.source);
      toast.success(isEdit ? `Source updated!` : `Source added!`);
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
            <Target className="size-5" />
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? 'Edit Lead Acquisition Source' : 'Add Lead Acquisition Source'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Source / Channel Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TikTok Ads, Snapchat Spotlight"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Channel Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium cursor-pointer"
              >
                <option value="Paid">Paid Advertising</option>
                <option value="Social">Social Media</option>
                <option value="Organic">Organic Website</option>
                <option value="Direct">Direct / WhatsApp</option>
                <option value="Referral">Doctor / Patient Referral</option>
                <option value="Offline">Offline / Print / Event</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Channel Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium cursor-pointer"
              >
                <option value="Active">Active (Tracking)</option>
                <option value="Paused">Paused / Archived</option>
              </select>
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSourceModal;
