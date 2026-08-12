import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const RevenueView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawRev = storageService.get(storageService.KEYS.REVENUE) || [];
  const rev = scopeData({ resource: 'revenue', data: rawRev, currentUser, selectedClinicId });

  const totalAmount = rev.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount);

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" description="Financial overview and revenue tracking" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formattedTotal} sub="Scoped dataset" />
        <StatCard label="Monthly Records" value={rev.length} sub="Filtered stats" />
        <StatCard label="Avg Revenue" value={rev.length > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount / rev.length) : '$0'} sub="Average per record" />
        <StatCard label="Scope" value={currentUser?.role === 'super_admin' ? 'Global' : 'Scoped'} sub="Row-level active" />
      </div>
      <Table
        headers={["Clinic / Scope", "Month", "Revenue", "Conversions", "Conv. Rate"]}
        rows={rev.map(r => [
          r.clinicId || 'Downtown Dental',
          r.month,
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(r.revenue),
          r.conversions,
          `${r.conversionRate}%`
        ])}
      />
      <DevBanner text="Full Revenue Dashboard is under development" />
    </div>
  );
};

export default RevenueView;
