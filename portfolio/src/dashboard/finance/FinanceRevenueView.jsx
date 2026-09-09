import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  RotateCcw,
  Building2,
  Calendar,
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  Download,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.service';
import { clinicsService } from '@/services/clinicsService';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import {
  isRevenueRecognized,
  getRecognizedAmount,
} from '@/services/revenueService';
import { RecordPaymentModal } from '@/dashboard/views/config/components/RecordPaymentModal';

export default function FinanceRevenueView({ readOnly = false }) {
  const { currentUser } = useAuth();
  const isAuditor = currentUser?.role === 'auditor' || readOnly;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledPatient, setPrefilledPatient] = useState(null);

  // Fetch all clinics for the user's organization
  const clinicsList = useMemo(() => {
    try {
      const all = clinicsService.getClinics();
      if (!Array.isArray(all)) return [];
      const userOrgId = currentUser?.organizationId || 'org-001';
      return all.filter((c) => !c.orgId || c.orgId === userOrgId);
    } catch {
      return [];
    }
  }, [currentUser]);

  // Load raw revenue records
  const allRevenueRecords = useMemo(() => {
    const raw = storageService.get(storageService.KEYS.REVENUE) || [];
    const orgId = currentUser?.organizationId || 'org-001';

    // Filter by organization scope
    return raw.filter((r) => {
      if (!r) return false;
      const clinic = clinicsList.find((c) => isSameClinic(c.id, r.clinicId));
      if (clinic && clinic.orgId && clinic.orgId !== orgId) return false;
      return true;
    });
  }, [currentUser, clinicsList, refreshTrigger]);

  // Apply in-page filters
  const filteredRecords = useMemo(() => {
    return allRevenueRecords.filter((record) => {
      // Clinic Filter
      if (selectedClinicFilter !== 'all') {
        if (!isSameClinic(record.clinicId, selectedClinicFilter)) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatusFilter !== 'all') {
        const s = (record.status || '').toLowerCase();
        if (s !== selectedStatusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const patient = (record.patientName || '').toLowerCase();
        const treatment = (record.treatment || record.treatmentCategory || record.notes || '').toLowerCase();
        const clinicObj = getClinicById(record.clinicId);
        const clinicName = (clinicObj?.name || '').toLowerCase();
        const method = (record.method || '').toLowerCase();
        const id = (record.id || '').toLowerCase();

        return (
          patient.includes(query) ||
          treatment.includes(query) ||
          clinicName.includes(query) ||
          method.includes(query) ||
          id.includes(query)
        );
      }

      return true;
    });
  }, [allRevenueRecords, selectedClinicFilter, selectedStatusFilter, searchQuery]);

  // Financial KPI calculations using canonical helpers
  const stats = useMemo(() => {
    let recognized = 0;
    let outstanding = 0;
    let deposits = 0;
    let refunds = 0;

    filteredRecords.forEach((r) => {
      const status = (r.status || '').toLowerCase();
      const amount = getRecognizedAmount(r);

      if (isRevenueRecognized(r)) {
        recognized += amount;
        if (status.includes('deposit')) {
          deposits += (r.deposit !== undefined ? Number(r.deposit) : amount);
        }
      } else if (status === 'refunded') {
        refunds += amount;
      } else if (status === 'pending' || status === 'estimated') {
        outstanding += amount;
      }
    });

    return {
      totalRecognized: recognized,
      outstandingReceivables: outstanding,
      depositsCollected: deposits,
      refundsIssued: refunds,
      totalCount: filteredRecords.length,
    };
  }, [filteredRecords]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClinicFilter('all');
    setSelectedStatusFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedClinicFilter !== 'all' || selectedStatusFilter !== 'all';

  // Refund handler
  const handleIssueRefund = (recordId) => {
    if (isAuditor) {
      toast.error('Unauthorized: Auditor role has read-only access');
      return;
    }
    if (!window.confirm('Are you sure you want to issue a refund for this transaction? This action will update the status to Refunded.')) {
      return;
    }

    const all = storageService.get(storageService.KEYS.REVENUE) || [];
    const updated = all.map((r) => {
      if (r.id === recordId) {
        return {
          ...r,
          status: 'Refunded',
          refundedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    storageService.set(storageService.KEYS.REVENUE, updated);
    setRefreshTrigger((prev) => prev + 1);
    toast.success('Transaction marked as Refunded successfully.');
  };

  // Helper for Status Badge
  const renderStatusBadge = (status = 'Paid') => {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Paid
        </span>
      );
    }
    if (s.includes('deposit')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Clock className="w-3 h-3" />
          Deposit
        </span>
      );
    }
    if (s.includes('partial')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <TrendingUp className="w-3 h-3" />
          Partially Paid
        </span>
      );
    }
    if (s === 'refunded') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3" />
          Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        {status}
      </span>
    );
  };

  // Format currency
  const fmt = (num) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              {isAuditor ? 'Read Only • Auditing' : 'Finance & Billing'}
            </span>
            <span className="text-xs text-slate-500 font-medium">Smile Care Group (Org-Wide)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Revenue Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit branch cash flows, verify recognized receipts, and reconcile invoices across all clinic branches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isAuditor && (
            <button
              onClick={() => {
                setPrefilledPatient(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recognized Revenue</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">{fmt(stats.totalRecognized)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Cash collected & verified</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Receivables</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-600">{fmt(stats.outstandingReceivables)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending collection from patients</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deposits Held</span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">{fmt(stats.depositsCollected)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Advance procedure guarantees</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Refunds Issued</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-rose-600">{fmt(stats.refundsIssued)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Processed returns & cancellations</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, treatment, clinic, or method..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Select Dropdowns */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Clinic Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedClinicFilter}
                onChange={(e) => setSelectedClinicFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Clinics (All Branches)</option>
                {clinicsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="deposit received">Deposit Received</option>
                <option value="partially paid">Partially Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Financial Ledger Records</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredRecords.length} of {allRevenueRecords.length} revenue transactions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Patient / Client</th>
                <th className="py-3 px-4">Clinic Branch</th>
                <th className="py-3 px-4">Treatment / Notes</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Recognized Cash</th>
                <th className="py-3 px-4">Status</th>
                {!isAuditor && <th className="py-3 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAuditor ? 6 : 7} className="py-10 text-center text-slate-400">
                    No financial records match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const clinicObj = getClinicById(r.clinicId);
                  const clinicName = clinicObj?.name || r.clinicId || 'Downtown Dental';
                  const amount = getRecognizedAmount(r);
                  const isRecognized = isRevenueRecognized(r);
                  const isRefunded = (r.status || '').toLowerCase() === 'refunded';

                  return (
                    <tr key={r.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {r.patientName || r.name || 'Private Patient'}
                        <div className="text-[11px] font-normal text-slate-400">
                          {r.date ? new Date(r.date).toLocaleDateString() : (r.month || 'Recent')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{clinicName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                        {r.treatment || r.treatmentCategory || r.notes || 'Dental Procedure'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{r.method || 'Credit Card'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-semibold ${
                            isRecognized ? 'text-emerald-600' : isRefunded ? 'text-rose-500 line-through' : 'text-slate-500'
                          }`}
                        >
                          {fmt(amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(r.status)}
                      </td>
                      {!isAuditor && (
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isRecognized && !isRefunded && (
                              <button
                                onClick={() => handleIssueRefund(r.id)}
                                className="px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                                title="Issue refund for this transaction"
                              >
                                Refund
                              </button>
                            )}
                            {!isRecognized && !isRefunded && (
                              <button
                                onClick={() => {
                                  setPrefilledPatient(r);
                                  setIsModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                              >
                                Collect
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <RecordPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
          currentUser={currentUser}
          selectedClinicId={selectedClinicFilter !== 'all' ? selectedClinicFilter : undefined}
        />
      )}
    </div>
  );
}
