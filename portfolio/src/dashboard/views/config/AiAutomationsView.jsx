import React from 'react';
import { aiAutomationsRows } from '@/data/routesData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const AiAutomationsView = () => (
  <div className="space-y-6">
    <PageHeader title="AI Automations" description="Build and manage AI-powered workflows" action="+ New Automation" />
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total" value="14" sub="Configured" />
      <StatCard label="Active" value="11" sub="Running" />
      <StatCard label="Paused" value="3" sub="Temporarily stopped" />
      <StatCard label="Runs Today" value="47" sub="Executions" />
    </div>
    <Table
      headers={["Automation Name", "Trigger", "Actions", "Runs Today", "Status"]}
      rows={aiAutomationsRows.map((a) => [
        a.name,
        a.trigger,
        a.actions,
        a.runsToday,
        <Badge key="status" color={a.color}>{a.status}</Badge>,
      ])}
    />
    <DevBanner text="Full AI Automations builder is under development" />
  </div>
);

export default AiAutomationsView;
