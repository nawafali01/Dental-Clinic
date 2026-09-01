import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, PageHeader, Table } from '../components/ViewComponents';
import { ClinicModal } from './components/ClinicModal';

export const ClinicsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const rawClinics = storageService.get(storageService.KEYS.CLINICS) || [];
  const clinics = scopeData({ resource: 'clinics', data: rawClinics, currentUser, selectedClinicId });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinics"
        description="Manage clinic branches, locations, and details"
        action="+ Add Clinic"
        onAction={() => setIsModalOpen(true)}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Clinics" value={clinics.length} sub="In scope" />
        <StatCard label="Active" value={clinics.length} sub="Operational" />
        <StatCard label="Status" value="Online" sub="Synced" />
        <StatCard label="Avg Rating" value="4.9" sub="Patient satisfaction" />
      </div>
      <Table
        headers={["Clinic Name", "City / Location", "Clinic ID", "Status"]}
        rows={clinics.map(c => [
          <div key="name" className="flex flex-col">
            <span className="font-semibold text-slate-900">{c.name}</span>
            {c.address && <span className="text-xs text-slate-400">{c.address}</span>}
          </div>,
          c.city || 'Riyadh',
          c.id,
          <Badge key="status" color="green">{c.status || 'Active'}</Badge>
        ])}
      />

      <ClinicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ClinicsView;
