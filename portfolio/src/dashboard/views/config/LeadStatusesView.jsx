import React, { useState } from 'react';
import { leadStatusesRows } from '@/data/routesData';
import { Badge, PageHeader, Table } from '../components/ViewComponents';
import { AddStatusModal } from './components/AddStatusModal';

const STATUSES_KEY = 'dental_crm_lead_statuses';

export const LeadStatusesView = () => {
  const [statuses, setStatuses] = useState(() => {
    try {
      const stored = localStorage.getItem(STATUSES_KEY);
      return stored ? JSON.parse(stored) : leadStatusesRows;
    } catch {
      return leadStatusesRows;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddStatus = (newStatus) => {
    const updated = [...statuses, newStatus];
    setStatuses(updated);
    try {
      localStorage.setItem(STATUSES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Statuses Configuration"
        description="Define and manage lead pipeline stages and workflow statuses"
        action="+ Add Status"
        onAction={() => setIsModalOpen(true)}
      />
      <Table
        headers={["Status Name", "Color Badge", "Order", "Leads Count", "Actions"]}
        rows={statuses.map((s) => [
          <span key="s" className="font-semibold text-slate-900">{s.name}</span>,
          <Badge key="badge" color={s.color}>{s.color.charAt(0).toUpperCase() + s.color.slice(1)}</Badge>,
          s.order,
          s.leads || '0',
          <span key="act" className="text-xs text-slate-500 font-medium">Active</span>,
        ])}
      />

      <AddStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStatus}
        currentCount={statuses.length}
      />
    </div>
  );
};

export default LeadStatusesView;
