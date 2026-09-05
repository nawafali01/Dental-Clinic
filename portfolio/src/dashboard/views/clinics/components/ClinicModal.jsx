import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { clinicsService } from '@/services/clinicsService';

export function ClinicModal({ isOpen, onClose, onSuccess, currentUser, clinicToEdit = null }) {
  const isEdit = Boolean(clinicToEdit);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Riyadh',
    address: '',
    phone: '+1 (555) 020-0000',
    email: '',
    operatingHours: '08:00 AM - 08:00 PM',
    chairsCount: 4,
    status: 'active',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clinicToEdit) {
      setFormData({
        name: clinicToEdit.name || '',
        city: clinicToEdit.city || 'Riyadh',
        address: clinicToEdit.address || '',
        phone: clinicToEdit.phone || '',
        email: clinicToEdit.email || '',
        operatingHours: clinicToEdit.operatingHours || '08:00 AM - 08:00 PM',
        chairsCount: clinicToEdit.chairsCount || 4,
        status: clinicToEdit.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        city: 'Riyadh',
        address: '',
        phone: '+1 (555) 020-0000',
        email: '',
        operatingHours: '08:00 AM - 08:00 PM',
        chairsCount: 4,
        status: 'active',
      });
    }
  }, [clinicToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Clinic branch name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        const updated = clinicsService.updateClinic(clinicToEdit.id, {
          name: formData.name.trim(),
          city: formData.city,
          address: formData.address || `${formData.city} Central District`,
          phone: formData.phone,
          email: formData.email,
          operatingHours: formData.operatingHours,
          chairsCount: Number(formData.chairsCount) || 4,
          status: formData.status,
        });
        toast.success(`Clinic "${updated.name}" updated successfully!`);
        onSuccess?.(updated);
      } else {
        const newClinic = clinicsService.addClinic({
          name: formData.name.trim(),
          city: formData.city,
          address: formData.address || `${formData.city} Central District`,
          phone: formData.phone,
          email: formData.email,
          operatingHours: formData.operatingHours,
          chairsCount: Number(formData.chairsCount) || 4,
          orgId: currentUser?.organizationId || null,
          status: formData.status,
        });
        toast.success(`Clinic branch "${newClinic.name}" added successfully!`);
        onSuccess?.(newClinic);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(isEdit ? 'Failed to update clinic' : 'Failed to add clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Clinic Branch' : 'Add New Clinic Branch'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update branch location, hours & operating status' : 'Register a new branch to the multi-clinic system'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Clinic Branch Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Northgate Aesthetic & Family Dental"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">City</label>
              <input
                type="text"
                placeholder="e.g. Riyadh"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 020-1122"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="branch@aureadental.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Dental Chairs Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.chairsCount}
                onChange={(e) => setFormData({ ...formData, chairsCount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Full Address</label>
            <input
              type="text"
              placeholder="e.g. King Fahd Road, Al Olaya District, Suite 400"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Operating Hours</label>
              <input
                type="text"
                placeholder="08:00 AM - 08:00 PM"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Branch Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium cursor-pointer"
              >
                <option value="active">Active (Operational)</option>
                <option value="inactive">Inactive / Maintenance</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
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
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Clinic Branch')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClinicModal;
