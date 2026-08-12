import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const PaymentsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawRev = storageService.get(storageService.KEYS.REVENUE) || [];
  const rev = scopeData({ resource: 'payments', data: rawRev, currentUser, selectedClinicId });

  const totalAmount = rev.reduce((acc, r) => acc + (r.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track and manage all patient payments" action="+ Record Payment" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Collected" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount)} sub="Scoped payments" />
        <StatCard label="Records" value={rev.length} sub="Processed" />
        <StatCard label="Status" value="Verified" sub="In scope" />
        <StatCard label="Pending" value="$0" sub="All clear" />
      </div>
      <Table
        headers={["Clinic Scope", "Period", "Collected Amount", "Status"]}
        rows={rev.map(r => [
          r.clinicId || 'Downtown Dental',
          r.month,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(r.revenue),
          <Badge key="status" color="green">Paid</Badge>
        ])}
      />
      <DevBanner text="Full Payments module is under development" />
    </div>
  );
};

export default PaymentsView;
