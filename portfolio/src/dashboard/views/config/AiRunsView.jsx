import React from 'react';
import { aiRunsRows } from '@/data/routesData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const AiRunsView = () => (
  <div className="space-y-6">
    <PageHeader title="AI Runs" description="Monitor AI automation execution history" action="Trigger Run" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Runs" value="1,842" sub="All time" />
      <StatCard label="Today" value="47" sub="Since midnight" />
      <StatCard label="Success Rate" value="98.3%" sub="+0.5% vs last week" />
      <StatCard label="Avg Duration" value="1.2s" sub="Per execution" />
    </div>
    <Table
      headers={["Run ID", "Automation", "Trigger", "Duration", "Status", "Time"]}
      rows={aiRunsRows.map((r) => [
        r.id,
        r.automation,
        r.trigger,
        r.duration,
        <Badge key="status" color={r.color}>{r.status}</Badge>,
        r.timestamp,
      ])}
    />
    <DevBanner text="Full AI Runs monitoring is under development" />
  </div>
);

export default AiRunsView;
