import React, { useState, useEffect } from 'react';
import { X, Activity, DollarSign, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';

export function AddTreatmentModal({ isOpen, onClose, onSave, treatmentToEdit = null }) {
  const isEdit = Boolean(treatmentToEdit);

  const [formData, setFormData] = useState({
    treatment: '',
    category: 'Cosmetic',
    duration: '45 min',
    price: '$350',
    status: 'Active',
    color: 'green',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (treatmentToEdit) {
      setFormData({
        treatment: treatmentToEdit.treatment || '',
        category: treatmentToEdit.category || 'Cosmetic',
        duration: treatmentToEdit.duration || '45 min',
        price: treatmentToEdit.price || '$350',
        status: treatmentToEdit.status || 'Active',
        color: treatmentToEdit.status === 'Active' ? 'green' : 'amber',
      });
    } else {
      setFormData({
        treatment: '',
        category: 'Cosmetic',
        duration: '45 min',
        price: '$350',
        status: 'Active',
        color: 'green',
      });
    }
  }, [treatmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.treatment.trim()) {
      toast.error('Treatment name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedPrice = formData.price.startsWith('$') ? formData.price : `$${formData.price}`;
      const payload = {
        ...formData,
        price: formattedPrice,
        color: formData.status === 'Active' ? 'green' : 'amber',
      };

      onSave?.(payload, treatmentToEdit?.id || treatmentToEdit?.treatment);
      toast.success(isEdit ? `Treatment updated!` : `Treatment added!`);
      onClose();
    } catch (err) {
      toast.error('Failed to save treatment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="size-5" />
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? 'Edit Dental Treatment' : 'Add Dental Treatment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Treatment Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Invisalign Clear Aligners"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium cursor-pointer"
              >
                <option value="Preventive">Preventive</option>
                <option value="Restorative">Restorative</option>
                <option value="Cosmetic">Cosmetic</option>
                <option value="Orthodontic">Orthodontic</option>
                <option value="Surgical">Surgical</option>
                <option value="General">General Consultation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Average Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 45 min"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Base Procedure Price
              </label>
              <input
                type="text"
                placeholder="$250"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Catalog Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium cursor-pointer"
              >
                <option value="Active">Active (Bookable)</option>
                <option value="Inactive">Inactive / Suspended</option>
                <option value="Review">Under Review</option>
              </select>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Treatment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTreatmentModal;
