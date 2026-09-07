import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { clinicsService } from '@/services/clinicsService';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import { Badge, StatCard, PageHeader, Table } from '../components/ViewComponents';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { RecordPaymentModal } from './components/RecordPaymentModal';

export const PaymentsView = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { selectedClinicId } = useClinic();
  const role = userRole || currentUser?.role || 'org_admin';
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isClinicManager = role === 'clinic_manager';

  const managerClinicId = currentUser?.clinicId || (currentUser?.clinicIds && currentUser?.clinicIds[0]) || 'clinic-downtown';
  const assignedClinicObj = getClinicById(managerClinicId);
  const assignedClinicName = assignedClinicObj?.name || 'Downtown Dental Excellence';

  const scopedUser = useMemo(() => ({
    ...currentUser,
    role,
    organizationId: currentUser?.organizationId || (isOrgAdmin ? 'org-001' : null),
    clinicId: isClinicManager ? managerClinicId : currentUser?.clinicId,
  }), [currentUser, role, isOrgAdmin, isClinicManager, managerClinicId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState(
    isClinicManager ? managerClinicId : 'all'
  );
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const rawRev = useMemo(() => {
    return storageService.get(storageService.KEYS.REVENUE) || [];
  }, [refreshTrigger]);

  const scopedPayments = useMemo(() => {
    return scopeData({
      resource: 'payments',
      data: rawRev,
      currentUser: scopedUser,
      selectedClinicId: isClinicManager ? managerClinicId : ((isSuperAdmin || isOrgAdmin) ? 'all' : selectedClinicId),
    });
  }, [rawRev, scopedUser, isSuperAdmin, isOrgAdmin, isClinicManager, managerClinicId, selectedClinicId]);

  // Clinics available for filter dropdown
  const clinicsList = useMemo(() => {
    try {
      const all = clinicsService.getClinics();
      if (!Array.isArray(all)) return [];
      const userOrgId = scopedUser?.organizationId || (isOrgAdmin ? 'org-001' : null);
      if (isOrgAdmin && userOrgId) {
        return all.filter((c) => c.orgId === userOrgId);
      }
      return all;
    } catch {
      return [];
    }
  }, [scopedUser, isOrgAdmin]);

  // Filtered dataset
  const filteredPayments = useMemo(() => {
    return scopedPayments.filter((r) => {
      // Clinic Filter
      if (!isClinicManager && selectedClinicFilter !== 'all') {
        if (!isSameClinic(r.clinicId, selectedClinicFilter)) {
          return false;
        }
      }

      // Method Filter
      if (selectedMethodFilter !== 'all') {
        const method = (r.method || 'Credit Card').toLowerCase();
        if (method !== selectedMethodFilter.toLowerCase()) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatusFilter !== 'all') {
        const status = (r.status || 'Paid').toLowerCase();
        if (status !== selectedStatusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const payee = (r.patientName || '').toLowerCase();
        const notes = (r.notes || '').toLowerCase();
        const method = (r.method || '').toLowerCase();
        const clinicName = (getClinicById(r.clinicId)?.name || r.clinicId || '').toLowerCase();
        const month = (r.month || '').toLowerCase();

        return (
          payee.includes(query) ||
          notes.includes(query) ||
          method.includes(query) ||
          clinicName.includes(query) ||
          month.includes(query)
        );
      }

      return true;
    });
  }, [scopedPayments, selectedClinicFilter, selectedMethodFilter, selectedStatusFilter, searchQuery]);

  const hasActiveFilters = searchQuery !== '' || selectedClinicFilter !== 'all' || selectedMethodFilter !== 'all' || selectedStatusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClinicFilter('all');
    setSelectedMethodFilter('all');
    setSelectedStatusFilter('all');
  };

  const totalAmount = filteredPayments.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAmount);
  const pendingCount = filteredPayments.filter(r => (r.status || 'Paid').toLowerCase() === 'pending').length;
  const paidCount = filteredPayments.filter(r => (r.status || 'Paid').toLowerCase() === 'paid').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track, filter, and manage all patient payments and clinic revenue"
        action="+ Record Payment"
        onAction={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Collected" value={formattedTotal} sub={hasActiveFilters ? "Filtered payments" : "Scoped payments"} />
        <StatCard label="Total Records" value={filteredPayments.length} sub={hasActiveFilters ? "Matching criteria" : "Processed"} />
        <StatCard label="Paid Transactions" value={paidCount} sub="Verified complete" />
        <StatCard label="Pending" value={pendingCount} sub={pendingCount > 0 ? "Awaiting clearance" : "All clear"} />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by payee, patient, notes, method, or clinic..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Clinic Filter / Fixed Badge */}
            {isClinicManager ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{assignedClinicName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedClinicFilter}
                  onChange={(e) => setSelectedClinicFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
                >
                  <option value="all">All Clinics</option>
                  {clinicsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city || 'Branch'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Method Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <select
                value={selectedMethodFilter}
                onChange={(e) => setSelectedMethodFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Methods</option>
                <option value="credit card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="insurance">Insurance</option>
                <option value="bank transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <Table
        headers={["Payee / Patient", "Clinic Branch", "Period / Date", "Collected Amount", "Method", "Status"]}
        rows={filteredPayments.map(r => {
          const clinicObj = getClinicById(r.clinicId);
          const clinicDisplayName = clinicObj?.name || r.clinicId || 'Downtown Dental';

          return [
            <div key="payee" className="flex flex-col">
              <span className="font-semibold text-slate-900">{r.patientName || r.clinicId || 'Downtown Dental'}</span>
              {r.notes && <span className="text-xs text-slate-400 italic">{r.notes}</span>}
            </div>,
            <div key="clinic" className="flex flex-col">
              <span className="text-slate-900 font-medium">{clinicDisplayName}</span>
              {clinicObj?.city && <span className="text-[11px] text-slate-400">{clinicObj.city}</span>}
            </div>,
            r.month || (r.date ? new Date(r.date).toLocaleDateString() : 'This Month'),
            <span key="amount" className="font-semibold text-slate-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(r.revenue || 0)}
            </span>,
            r.method || 'Credit Card',
            <Badge key="status" color={(r.status || 'Paid').toLowerCase() === 'pending' ? 'amber' : 'green'}>
              {r.status || 'Paid'}
            </Badge>
          ];
        })}
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
