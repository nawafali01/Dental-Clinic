import React from 'react';
import { leadFormsRows } from '@/data/routesData';
import { Badge, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const LeadFormsView = () => (
  <div className="space-y-6">
    <PageHeader title="Lead Forms" description="Create and manage lead capture forms" action="+ New Form" />
    <Table
      headers={["Form Name", "Source", "Leads Captured", "Conv. Rate", "Status"]}
      rows={leadFormsRows.map((f) => [
        f.name,
        f.source,
        f.leads,
        f.rate,
        <Badge key="status" color={f.color}>{f.status}</Badge>,
      ])}
    />
    <DevBanner text="Full Lead Forms builder is under development" />
  </div>
);

export default LeadFormsView;
