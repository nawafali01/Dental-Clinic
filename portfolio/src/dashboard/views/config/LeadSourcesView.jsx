import React from 'react';
import { leadSourcesRows } from '@/data/routesData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const LeadSourcesView = () => (
  <div className="space-y-6">
    <PageHeader title="Lead Sources Configuration" description="Configure and track where your leads come from" action="+ Add Source" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Sources" value="8" sub="Active channels" />
      <StatCard label="Best Performer" value="Google Ads" sub="38% of leads" />
      <StatCard label="This Month" value="284" sub="Total leads" />
      <StatCard label="Avg Conv. Rate" value="6.9%" sub="Source average" />
    </div>
    <Table
      headers={["Source Name", "Type", "Leads This Month", "Conv. Rate", "Status"]}
      rows={leadSourcesRows.map((s) => [
        s.source,
        s.type,
        s.leads,
        s.rate,
        <Badge key="status" color={s.color}>{s.status}</Badge>,
      ])}
    />
    <DevBanner text="Full Lead Sources Configuration is under development" />
  </div>
);

export default LeadSourcesView;
