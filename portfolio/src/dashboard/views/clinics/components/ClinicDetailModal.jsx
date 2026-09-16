import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, MapPin, Clock, Globe, Shield, Calendar, Edit3 } from 'lucide-react';
import { clinicsService } from '@/services/clinicsService';
import { useOrg } from '@/dashboard/shared/context/OrgContext';

export function ClinicDetailModal({ isOpen, onClose, clinic = null, onEdit = null }) {
  const { organizations } = useOrg();
  const [detailData, setDetailData] = useState(clinic);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !clinic?.id) return;

    setDetailData(clinic);
    let isMounted = true;

    const loadFreshClinic = async () => {
      setIsLoading(true);
      try {
        const res = await clinicsService.fetchClinicById(clinic.id);
        if (isMounted && res?.data) {
          setDetailData(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch fresh clinic detail:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFreshClinic();

    return () => {
      isMounted = false;
    };
  }, [isOpen, clinic]);

  if (!isOpen || !detailData) return null;

  const orgName =
    organizations.find((o) => o.id === (detailData.organization_id || detailData.orgId))?.name ||
    detailData.organization_id ||
    'Unassigned';

  const workingHoursDisplay =
    (detailData.working_hours && typeof detailData.working_hours === 'object'
      ? detailData.working_hours.additionalProperty
      : detailData.operatingHours) || '08:00 AM - 08:00 PM';

  const isActive =
    detailData.is_active !== undefined
      ? Boolean(detailData.is_active)
      : detailData.status !== 'inactive';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{detailData.name || 'Clinic Details'}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Parent Organization: <span className="font-semibold text-slate-700">{orgName}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
          {/* Description */}
          {detailData.description && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="block font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1">
                Description
              </span>
              <p className="text-slate-700 text-xs leading-relaxed">{detailData.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Contact Email */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Contact Email
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                  {detailData.contact_email || detailData.email || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Contact Phone */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Contact Phone
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                  {detailData.contact_phone || detailData.phone || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Address
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                  {detailData.address || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Timezone */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Timezone
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                  {detailData.timezone || 'UTC'}
                </p>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Working Hours (additionalProperty)
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 font-mono">
                {workingHoursDisplay}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          {(detailData.createdAt || detailData.created_at) && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created: {new Date(detailData.createdAt || detailData.created_at).toLocaleDateString()}
              </span>
              {detailData.manager && (
                <span>Manager: <strong className="text-slate-600">{detailData.manager}</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(detailData);
              }}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Clinic
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
