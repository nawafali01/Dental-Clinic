import React from 'react';
import { treatmentsConfigRows } from '@/data/routesData';
import { Badge, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const TreatmentsConfigView = () => (
  <div className="space-y-6">
    <PageHeader title="Treatments Configuration" description="Manage available dental treatments and pricing" action="+ Add Treatment" />
    <Table
      headers={["Treatment", "Category", "Duration", "Base Price", "Status"]}
      rows={treatmentsConfigRows.map((t) => [
        t.treatment,
        t.category,
        t.duration,
        t.price,
        <Badge key="status" color={t.color}>{t.status}</Badge>,
      ])}
    />
    <DevBanner text="Full Treatments Configuration is under development" />
  </div>
);

export default TreatmentsConfigView;
