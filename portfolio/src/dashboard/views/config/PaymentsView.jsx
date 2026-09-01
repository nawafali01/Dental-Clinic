import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, PageHeader, Table } from '../components/ViewComponents';
import { RecordPaymentModal } from './components/RecordPaymentModal';

export const PaymentsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const rawRev = storageService.get(storageService.KEYS.REVENUE) || [];
  const rev = scopeData({ resource: 'payments', data: rawRev, currentUser, selectedClinicId });

  const totalAmount = rev.reduce((acc, r) => acc + (r.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track and manage all patient payments and clinic revenue"
        action="+ Record Payment"
        onAction={() => setIsModalOpen(true)}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Collected" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount)} sub="Scoped payments" />
        <StatCard label="Records" value={rev.length} sub="Processed" />
        <StatCard label="Status" value="Verified" sub="In scope" />
        <StatCard label="Pending" value="$0" sub="All clear" />
      </div>
      <Table
        headers={["Clinic Scope / Payee", "Period / Date", "Collected Amount", "Method", "Status"]}
        rows={rev.map(r => [
          <div key="payee" className="flex flex-col">
            <span className="font-semibold text-slate-900">{r.patientName || r.clinicId || 'Downtown Dental'}</span>
            {r.notes && <span className="text-xs text-slate-400 italic">{r.notes}</span>}
          </div>,
          r.month || (r.date ? new Date(r.date).toLocaleDateString() : 'This Month'),
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(r.revenue || 0),
          r.method || 'Credit Card',
          <Badge key="status" color={r.status === 'Pending' ? 'amber' : 'green'}>{r.status || 'Paid'}</Badge>
        ])}
      />

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        currentUser={currentUser}
        selectedClinicId={selectedClinicId}
      />
    </div>
  );
};

export default PaymentsView;
