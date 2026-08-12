import React from 'react';
import { leadStatusesRows } from '@/data/routesData';
import { Badge, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const LeadStatusesView = () => (
  <div className="space-y-6">
    <PageHeader title="Lead Statuses Configuration" description="Define and manage lead pipeline stages" action="+ Add Status" />
    <Table
      headers={["Status Name", "Color", "Order", "Leads Count", "Actions"]}
      rows={leadStatusesRows.map((s) => [
        s.name,
        <Badge key="badge" color={s.color}>{s.color.charAt(0).toUpperCase() + s.color.slice(1)}</Badge>,
        s.order,
        s.leads,
        s.actions,
      ])}
    />
    <DevBanner text="Full Lead Statuses Configuration is under development" />
  </div>
);

export default LeadStatusesView;
