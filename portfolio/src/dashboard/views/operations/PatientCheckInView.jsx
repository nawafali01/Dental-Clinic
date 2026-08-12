import React from 'react';
import { patientCheckInRows } from '@/data/routesData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const PatientCheckInView = () => (
  <div className="space-y-6">
    <PageHeader title="Patient Check-In" description="Manage patient check-in and queue" action="Check In Patient" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Checked In" value="8" sub="Currently waiting" />
      <StatCard label="In Treatment" value="4" sub="With doctor" />
      <StatCard label="Completed Today" value="22" sub="Checked out" />
      <StatCard label="Avg Wait Time" value="12m" sub="Target: <15m" />
    </div>
    <Table
      headers={["Patient Name", "Doctor", "Arrival Time", "Status", "Action"]}
      rows={patientCheckInRows.map((p) => [
        p.name,
        p.doctor,
        p.arrivalTime,
        <Badge key="status" color={p.color}>{p.status}</Badge>,
        p.actionText,
      ])}
    />
    <DevBanner text="Full Patient Check-In & Queue Management is under development" />
  </div>
);

export default PatientCheckInView;
