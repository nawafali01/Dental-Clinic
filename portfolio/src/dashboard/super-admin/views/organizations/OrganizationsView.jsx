import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, Landmark, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { organizationsService } from '@/services/organizationsService';
import { OrganizationsTable } from '../../components/organizations/OrganizationsTable';
import { OrgModal } from '../../components/organizations/OrgModal';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';

export default function OrganizationsView() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'super_admin';

  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrgForEdit, setSelectedOrgForEdit] = useState(null);

  const fetchOrganizations = useCallback(() => {
    try {
      const data = organizationsService.getOrganizationsSync();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleOpenCreate = () => {
    setSelectedOrgForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org) => {
    setSelectedOrgForEdit(org);
    setIsModalOpen(true);
  };

  const handleSelectOrg = (org) => {
    if (!org?.id) return;
    const detailPath = buildRoleUrl(`/organizations/${org.id}`, role);
    navigate(detailPath);
  };

  const handleSaveSuccess = () => {
    fetchOrganizations();
    setIsModalOpen(false);
    setSelectedOrgForEdit(null);
  };

  // Summary Metrics
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(o => (o.status || 'active').toLowerCase() === 'active').length;
  const totalClinics = organizations.reduce((acc, o) => acc + (o.clinics ? o.clinics.length : 0), 0);
  const totalUsers = organizations.reduce((acc, o) => acc + (o.users ? o.users.length : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global multi-tenant organization directory, brand identities, and branch allocations
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Organization
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organizations</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalOrgs}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Global multi-tenant accounts</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Status</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeOrgs}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Operating normally</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clinics</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalClinics}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Assigned clinic branches</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Managed Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalUsers}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Staff across all orgs</p>
        </div>
      </div>

      {/* Organizations Table Component */}
      <OrganizationsTable
        organizations={organizations}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onSelectOrg={handleSelectOrg}
      />

      {/* Create / Edit Modal */}
      <OrgModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSuccess}
        initialData={selectedOrgForEdit}
      />
    </div>
  );
}
