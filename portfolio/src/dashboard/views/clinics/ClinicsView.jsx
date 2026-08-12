import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const ClinicsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawClinics = storageService.get(storageService.KEYS.CLINICS) || [];
  const clinics = scopeData({ resource: 'clinics', data: rawClinics, currentUser, selectedClinicId });

  return (
    <div className="space-y-6">
      <PageHeader title="Clinics" description="Manage clinic branches and details" action="+ Add Clinic" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Clinics" value={clinics.length} sub="In scope" />
        <StatCard label="Active" value={clinics.length} sub="Operational" />
        <StatCard label="Status" value="Online" sub="Synced" />
        <StatCard label="Avg Rating" value="4.8" sub="Patient satisfaction" />
      </div>
      <Table
        headers={["Clinic Name", "City", "Clinic ID", "Status"]}
        rows={clinics.map(c => [
          c.name,
          c.city,
          c.id,
          <Badge key="status" color="green">Active</Badge>
        ])}
      />
      <DevBanner text="Full Clinic Management is under development" />
    </div>
  );
};

export default ClinicsView;
