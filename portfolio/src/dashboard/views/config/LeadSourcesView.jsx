import React, { useState } from 'react';
import { leadSourcesRows } from '@/data/routesData';
import { Badge, StatCard, PageHeader, Table } from '../components/ViewComponents';
import { AddSourceModal } from './components/AddSourceModal';

const SOURCES_KEY = 'dental_crm_lead_sources';

export const LeadSourcesView = () => {
  const [sources, setSources] = useState(() => {
    try {
      const stored = localStorage.getItem(SOURCES_KEY);
      return stored ? JSON.parse(stored) : leadSourcesRows;
    } catch {
      return leadSourcesRows;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSource = (newSource) => {
    const updated = [newSource, ...sources];
    setSources(updated);
    try {
      localStorage.setItem(SOURCES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Sources Configuration"
        description="Configure and track where your patient inquiries and leads originate"
        action="+ Add Source"
        onAction={() => setIsModalOpen(true)}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Sources" value={sources.length} sub="Active channels" />
        <StatCard label="Best Performer" value="Google Ads" sub="38% of leads" />
        <StatCard label="This Month" value="284" sub="Total leads" />
        <StatCard label="Avg Conv. Rate" value="6.9%" sub="Source average" />
      </div>
      <Table
        headers={["Source Name", "Type", "Leads This Month", "Conv. Rate", "Status"]}
        rows={sources.map((s) => [
          <span key="s" className="font-semibold text-slate-900">{s.source}</span>,
          s.type,
          s.leads || '0',
          s.rate || '0%',
          <Badge key="status" color={s.color || 'green'}>{s.status || 'Active'}</Badge>,
        ])}
      />

      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSource}
      />
    </div>
  );
};

export default LeadSourcesView;
