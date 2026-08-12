import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const AppointmentsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawAppts = storageService.get(storageService.KEYS.APPOINTMENTS) || [];
  const appts = scopeData({ resource: 'appointments', data: rawAppts, currentUser, selectedClinicId });

  const total = appts.length;
  const scheduled = appts.filter(a => a.status === 'scheduled').length;
  const pending = appts.filter(a => a.status === 'pending').length;
  const completed = appts.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Schedule and manage patient appointments" action="+ New Appointment" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Appts" value={total} sub="Scoped dataset" />
        <StatCard label="Scheduled" value={scheduled} sub="Upcoming" />
        <StatCard label="Pending" value={pending} sub="Needs confirmation" />
        <StatCard label="Completed" value={completed} sub="Past visits" />
      </div>
      <Table
        headers={["Patient ID / Name", "Clinic", "Date & Time", "Status"]}
        rows={appts.map(a => [
          a.patientName || a.patientId || 'Patient Record',
          a.clinicId || 'Downtown Dental',
          a.date ? new Date(a.date).toLocaleString() : 'Aug 3 — 09:00 AM',
          <Badge key="badge" color={a.status === 'completed' ? 'green' : a.status === 'pending' ? 'amber' : 'blue'}>{a.status}</Badge>
        ])}
      />
      <DevBanner text="Full Appointment Scheduling is under development" />
    </div>
  );
};

export default AppointmentsView;
