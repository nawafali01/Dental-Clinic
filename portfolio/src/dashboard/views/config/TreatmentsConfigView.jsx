import React, { useState, useEffect } from 'react';
import { treatmentsConfigRows } from '@/data/routesData';
import { Badge, PageHeader, Table } from '../components/ViewComponents';
import { AddTreatmentModal } from './components/AddTreatmentModal';

const TREATMENTS_STORAGE_KEY = 'dental_crm_treatments_config';

export const TreatmentsConfigView = () => {
  const [treatments, setTreatments] = useState(() => {
    try {
      const stored = localStorage.getItem(TREATMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : treatmentsConfigRows;
    } catch {
      return treatmentsConfigRows;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTreatment = (newTreatment) => {
    const updated = [newTreatment, ...treatments];
    setTreatments(updated);
    try {
      localStorage.setItem(TREATMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatments Configuration"
        description="Manage available dental treatments, procedure times, and pricing"
        action="+ Add Treatment"
        onAction={() => setIsModalOpen(true)}
      />
      <Table
        headers={["Treatment", "Category", "Duration", "Base Price", "Status"]}
        rows={treatments.map((t) => [
          <span key="t" className="font-semibold text-slate-900">{t.treatment}</span>,
          t.category,
          t.duration,
          t.price,
          <Badge key="status" color={t.color || 'green'}>{t.status}</Badge>,
        ])}
      />

      <AddTreatmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTreatment}
      />
    </div>
  );
};

export default TreatmentsConfigView;
