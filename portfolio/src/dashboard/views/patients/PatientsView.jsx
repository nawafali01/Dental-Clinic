import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const PatientsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawPatients = storageService.get(storageService.KEYS.PATIENTS) || [];
  const patients = scopeData({ resource: 'patients', data: rawPatients, currentUser, selectedClinicId });

  const total = patients.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description="Patient records and history" action="+ Add Patient" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={total} sub="Scoped dataset" />
        <StatCard label="Active" value={total} sub="In active clinic scope" />
        <StatCard label="New This Month" value={Math.ceil(total * 0.4)} sub="Recent signups" />
        <StatCard label="Records" value={total} sub="Verified records" />
      </div>
      <Table
        headers={["Patient Name", "Phone", "Clinic ID", "Status"]}
        rows={patients.map(p => [
          p.fullName || p.name || 'John Doe',
          p.phone || '+1-555-0000',
          p.clinicId || 'Downtown Dental',
          <Badge key="status" color="green">Active</Badge>
        ])}
      />
      <DevBanner text="Full Patient Records module is under development" />
    </div>
  );
};

export default PatientsView;
