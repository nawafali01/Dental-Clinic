import React, { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateLead, assignLead, LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES } from '@/services/leadsService';
import { usersService } from '@/services/usersService';
import { storageService } from '@/services/storage.service';
import { CLINICS, getClinicsByOrgId, isSameClinic } from '@/constants/clinics';
import { clinicsService } from '@/services/clinicsService';

export function EditLeadModal({ isOpen, onClose, onSuccess, lead, currentUser }) {
  const [users, setUsers] = useState(() => usersService.getUsersSync() || []);
  const [clinics, setClinics] = useState(() => clinicsService.getClinics() || []);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      clinicsService.fetchClinics().then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setClinics(res.data);
        }
      }).catch(() => {});

      const userOrg = currentUser?.organization_id || currentUser?.organizationId || 'f7e07406-f91f-49be-adeb-8d03bcac1dfd';
      usersService.fetchUsers({ organization_id: userOrg }).then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setUsers(res.data);
        }
      }).catch(() => {});
    }
  }, [isOpen, currentUser]);

  const userAssignedClinics = useMemo(() => {
    return [
      ...(Array.isArray(currentUser?.assigned_clinics) ? currentUser.assigned_clinics : []),
      ...(Array.isArray(currentUser?.assignedClinics) ? currentUser.assignedClinics : []),
      ...(Array.isArray(currentUser?.clinicIds) ? currentUser.clinicIds : []),
      ...(currentUser?.clinicId ? [currentUser.clinicId] : []),
      ...(currentUser?.clinic_id ? [currentUser.clinic_id] : []),
    ].filter(Boolean);
  }, [currentUser]);

  const role = (currentUser?.role || '').toLowerCase();
  const isAgent = role === 'agent';
  const isClinicScoped = role === 'clinic_manager' || role === 'receptionist' || isAgent;

  const displayedClinics = useMemo(() => {
    if (isClinicScoped && userAssignedClinics.length > 0) {
      const filtered = clinics.filter((c) =>
        userAssignedClinics.some((cId) => c.id === cId || isSameClinic(c.id, cId))
      );
      return filtered.length > 0 ? filtered : clinics;
    }
    return clinics;
  }, [clinics, isClinicScoped, userAssignedClinics]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: 'website',
    status: 'new',
    notes: '',
    treatment_interest: '',
    expected_revenue: 1,
    assigned_to: '',
    priority: '',
    clinic_id: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        email: lead.email || '',
        phone: lead.phone || lead.phoneNumber || '',
        source: (lead.source || 'website').toLowerCase(),
        status: (lead.status || 'new').toLowerCase(),
        notes: lead.notes || '',
        treatment_interest: lead.treatment_interest || lead.treatment || '',
        expected_revenue: Number(lead.expected_revenue ?? lead.expectedRevenue ?? 1),
        assigned_to: lead.assigned_to || lead.assignedAgentId || '',
        priority: (lead.priority || '').toLowerCase(),
        clinic_id: lead.clinic_id || lead.clinicId || (displayedClinics[0]?.id || 'clinic-downtown'),
      });
    }
  }, [lead, clinics, displayedClinics]);

  // Fetch users specifically assigned to the selected clinic whenever clinic_id changes
  useEffect(() => {
    if (!isOpen || !formData.clinic_id) return;

    let isMounted = true;
    setIsLoadingAgents(true);

    usersService
      .fetchUsers({ clinic_id: formData.clinic_id })
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data)) {
          setUsers((prev) => {
            const userMap = new Map();
            prev.forEach((u) => userMap.set(u.id, u));
            res.data.forEach((u) => userMap.set(u.id, u));
            return Array.from(userMap.values());
          });
        }
      })
      .catch((err) => {
        console.warn('[EditLeadModal] Error fetching clinic-specific users:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingAgents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, formData.clinic_id]);

  const isUserAssignedToClinic = (user, targetClinicId) => {
    if (!user || !targetClinicId) return false;

    const targetClinicObj = clinics.find(
      (c) => c.id === targetClinicId || c._id === targetClinicId
    );
    const targetClinicName = (targetClinicObj?.name || '').trim().toLowerCase();

    const userClinics = [
      ...(Array.isArray(user.assigned_clinics) ? user.assigned_clinics : []),
      ...(Array.isArray(user.assignedClinics) ? user.assignedClinics : []),
      ...(Array.isArray(user.clinicIds) ? user.clinicIds : []),
      ...(user.clinicId ? [user.clinicId] : []),
    ].filter(Boolean);

    return userClinics.some((cId) => {
      if (typeof cId !== 'string') return false;
      const cleanId = cId.trim();

      if (cleanId === targetClinicId) return true;
      if (targetClinicObj && (cleanId === targetClinicObj.id || cleanId === targetClinicObj._id)) return true;
      if (targetClinicName && cleanId.toLowerCase() === targetClinicName) return true;
      if (isSameClinic(cleanId, targetClinicId)) return true;

      return false;
    });
  };

  const availableAgents = useMemo(() => {
    if (!formData.clinic_id) return [];

    const filtered = users.filter((u) => {
      if (u.is_active === false || u.status === 'disabled' || u.status === 'inactive') return false;

      const role = (u.role || '').toLowerCase();
      if (['super_admin', 'org_admin', 'finance', 'auditor'].includes(role)) {
        return false;
      }

      return isUserAssignedToClinic(u, formData.clinic_id);
    });

    return filtered.sort((a, b) => {
      const aIsAgent = (a.role || '').toLowerCase() === 'agent' ? 0 : 1;
      const bIsAgent = (b.role || '').toLowerCase() === 'agent' ? 0 : 1;
      if (aIsAgent !== bIsAgent) return aIsAgent - bIsAgent;
      const nameA = a.fullName || a.name || a.email || '';
      const nameB = b.fullName || b.name || b.email || '';
      return nameA.localeCompare(nameB);
    });
  }, [users, formData.clinic_id, clinics]);

  const handleClinicChange = (newClinicId) => {
    setFormData((prev) => {
      const isAssignedStillValid = users.some(
        (u) => u.id === prev.assigned_to && isUserAssignedToClinic(u, newClinicId)
      );

      return {
        ...prev,
        clinic_id: newClinicId,
        assigned_to: isAssignedStillValid ? prev.assigned_to : '',
      };
    });
  };

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    if (isAgent && formData.status === 'won') {
      toast.error('Unauthorized: Agents cannot mark lead status as WON.');
      setIsSubmitting(false);
      return;
    }

    try {
      const assignedUser = users.find((u) => u.id === formData.assigned_to);
      const targetAssignedTo = isAgent ? (currentUser?.id || lead.assigned_to) : formData.assigned_to;
      const targetAssignedName = isAgent
        ? (currentUser?.fullName || currentUser?.name || currentUser?.email || 'Agent')
        : (assignedUser?.fullName || assignedUser?.name || '');

      const updatePayload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        source: formData.source || 'website',
        status: formData.status || 'new',
        notes: formData.notes.trim(),
        treatment_interest: formData.treatment_interest.trim(),
        expected_revenue: Number(formData.expected_revenue) || 1,
        assigned_to: targetAssignedTo,
        priority: formData.priority,
        clinic_id: formData.clinic_id,
        assignedAgentName: targetAssignedName,
      };

      const res = await updateLead(lead.id, updatePayload, currentUser);
      const updated = res?.data || res;

      if (!isAgent && formData.assigned_to && formData.assigned_to !== lead.assigned_to) {
        try {
          await assignLead(lead.id, formData.assigned_to);
        } catch (assignErr) {
          console.warn('[EditLeadModal] Background assignLead call warning:', assignErr);
        }
      }

      if (updated) {
        toast.success(`Lead updated successfully!`);
        onSuccess?.(updated);
        onClose();
      } else {
        toast.error('Failed to update lead');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error updating lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !lead || role === 'finance' || role === 'auditor') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Lead #{lead.id}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Update record details (PUT /api/v1/leads/{lead.id})</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jonathan"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Smith"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                placeholder="jonathan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Treatment Interest & Expected Revenue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Treatment Interest
              </label>
              <select
                value={formData.treatment_interest}
                onChange={(e) => setFormData({ ...formData, treatment_interest: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
              >
                <option value="Dental Implant">Dental Implant</option>
                <option value="Teeth Whitening">Teeth Whitening</option>
                <option value="Root Canal">Root Canal</option>
                <option value="Invisalign">Invisalign</option>
                <option value="Veneers">Veneers</option>
                <option value="Orthodontics">Orthodontics</option>
                <option value="Dental Cleaning">Dental Cleaning</option>
                <option value="Crown & Bridge">Crown & Bridge</option>
                <option value="General Consultation">General Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Expected Revenue ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1000"
                  value={formData.expected_revenue}
                  onChange={(e) => setFormData({ ...formData, expected_revenue: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Lead Source & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer capitalize"
              >
                {LEAD_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer uppercase"
              >
                <option value="">Unspecified</option>
                {LEAD_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clinic Branch & Assigned Agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Clinic Branch</label>
              <select
                value={formData.clinic_id}
                onChange={(e) => handleClinicChange(e.target.value)}
                disabled={displayedClinics.length <= 1}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer font-medium disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {displayedClinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.id} {c.city ? `(${c.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned Agent / Staff</label>
                {isLoadingAgents ? (
                  <span className="text-[10px] text-primary flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading agents...
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-normal">
                    {availableAgents.length} {availableAgents.length === 1 ? 'agent available' : 'agents available'}
                  </span>
                )}
              </div>
              {isAgent ? (
                <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
                  {currentUser?.fullName || currentUser?.name || currentUser?.email || 'You'} (Assigned to you)
                </div>
              ) : (
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">
                    {availableAgents.length === 0
                      ? 'Unassigned (No agents in this branch)'
                      : 'Unassigned'}
                  </option>
                  {availableAgents.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.name || u.email} ({u.role?.replace('_', ' ') || 'Agent'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Pipeline Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Pipeline Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer uppercase"
            >
              {LEAD_STATUSES.filter((s) => !isAgent || s !== 'won').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Treatment Inquiry</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter patient notes or inquiries..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
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
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default EditLeadModal;
