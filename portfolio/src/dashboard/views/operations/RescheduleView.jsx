import React from 'react';
import { rescheduleRequestsRows } from '@/data/routesData';
import { Badge, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const RescheduleView = () => (
  <div className="space-y-6">
    <PageHeader title="Reschedule Appointments" description="Quickly reschedule patient appointments" />
    <Table
      headers={["Patient Name", "Original Slot", "Requested Slot", "Reason", "Status"]}
      rows={rescheduleRequestsRows.map((r) => [
        r.patientName,
        r.originalSlot,
        r.requestedSlot,
        r.reason,
        <Badge key="status" color={r.color}>{r.status}</Badge>,
      ])}
    />
    <DevBanner text="Quick Reschedule module is under development" />
  </div>
);

export default RescheduleView;
