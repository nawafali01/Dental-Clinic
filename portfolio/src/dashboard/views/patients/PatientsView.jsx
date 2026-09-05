import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, PageHeader, Table } from '../components/ViewComponents';
import { PatientModal } from './components/PatientModal';

export const PatientsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const rawPatients = storageService.get(storageService.KEYS.PATIENTS) || [];
  const patients = scopeData({ resource: 'patients', data: rawPatients, currentUser, selectedClinicId });

  const total = patients.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Patient records and medical history"
        action="+ Add Patient"
        onAction={() => setIsModalOpen(true)}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={total} sub="Scoped dataset" />
        <StatCard label="Active" value={total} sub="In active clinic scope" />
        <StatCard label="New This Month" value={Math.ceil(total * 0.4)} sub="Recent signups" />
        <StatCard label="Records" value={total} sub="Verified records" />
      </div>
      <Table
        headers={["Patient Name", "Phone", "Email / Notes", "Clinic Branch", "Status"]}
        rows={patients.map(p => [
          <span key="name" className="font-semibold text-slate-900">{p.fullName || p.name || 'John Doe'}</span>,
          p.phone || '+1-555-0000',
          <div key="contact" className="flex flex-col">
            <span className="text-slate-700">{p.email || 'N/A'}</span>
            {p.medicalHistory && <span className="text-xs text-slate-400 italic">{p.medicalHistory}</span>}
          </div>,
          p.clinicId || 'Downtown Dental',
          <Badge key="status" color="green">{p.status || 'Active'}</Badge>
        ])}
      />

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        currentUser={currentUser}
        selectedClinicId={selectedClinicId}
      />
    </div>
  );
};

export default PatientsView;
