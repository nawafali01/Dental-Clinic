import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  Download,
  PieChart,
  BarChart3,
  ShieldCheck,
  Percent,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage.service';
import { clinicsService } from '@/services/clinicsService';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import {
  getOrgRevenueStats,
  getClinicRevenueBreakdown,
  getTreatmentRevenueBreakdown,
  normalizeTreatmentCategory,
  isRevenueRecognized,
  getRecognizedAmount,
} from '@/services/revenueService';

export default function FinanceReportsView() {
  const { currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const orgId = currentUser?.organizationId || 'org-001';

  // Load all raw records
  const allRecords = useMemo(() => {
    return storageService.get(storageService.KEYS.REVENUE) || [];
  }, []);

  // Filter records by period
  const periodFilteredRecords = useMemo(() => {
    if (selectedPeriod === 'all') return allRecords;

    return allRecords.filter((r) => {
      const d = r.date ? new Date(r.date) : null;
      const monthStr = (r.month || '').toLowerCase();

      if (selectedPeriod === 'sep_2026') {
        if (monthStr.includes('sep') || monthStr === 'sep' || monthStr === 'september') return true;
        if (d && d.getFullYear() === 2026 && d.getMonth() === 8) return true; // Month 8 is Sep
        return false;
      }

      if (selectedPeriod === 'aug_2026') {
        if (monthStr.includes('aug') || monthStr === 'aug' || monthStr === 'august') return true;
        if (d && d.getFullYear() === 2026 && d.getMonth() === 7) return true;
        return false;
      }

      if (selectedPeriod === 'q3_2026') {
        if (monthStr.includes('jul') || monthStr.includes('aug') || monthStr.includes('sep')) return true;
        if (d && d.getFullYear() === 2026 && [6, 7, 8].includes(d.getMonth())) return true;
        return false;
      }

      return true;
    });
  }, [allRecords, selectedPeriod]);

  // Overall Financial Metrics
  const summary = useMemo(() => {
    let recognized = 0;
    let totalBilled = 0;
    let deposits = 0;
    let refunds = 0;
    let count = 0;

    periodFilteredRecords.forEach((r) => {
      const amt = getRecognizedAmount(r);
      totalBilled += amt;
      const status = (r.status || '').toLowerCase();

      if (isRevenueRecognized(r)) {
        recognized += amt;
        count += 1;
        if (status.includes('deposit')) {
          deposits += (r.deposit !== undefined ? Number(r.deposit) : amt);
        }
      } else if (status === 'refunded') {
        refunds += amt;
      }
    });

    const collectionRate = totalBilled > 0 ? Math.round((recognized / totalBilled) * 100) : 100;
    const avgTicket = count > 0 ? Math.round(recognized / count) : 0;

    return {
      recognized,
      totalBilled,
      deposits,
      refunds,
      collectionRate,
      avgTicket,
      count,
    };
  }, [periodFilteredRecords]);

  // Clinic Breakdown
  const clinicStats = useMemo(() => {
    const map = {};
    periodFilteredRecords.forEach((r) => {
      if (!isRevenueRecognized(r)) return;
      const cid = r.clinicId || 'clinic-downtown';
      const amt = getRecognizedAmount(r);
      if (!map[cid]) {
        map[cid] = { clinicId: cid, revenue: 0, transactions: 0 };
      }
      map[cid].revenue += amt;
      map[cid].transactions += 1;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.revenue - a.revenue);

    return list.map((item) => {
      const clinicObj = getClinicById(item.clinicId);
      const share = summary.recognized > 0 ? Math.round((item.revenue / summary.recognized) * 100) : 0;
      return {
        ...item,
        name: clinicObj?.name || item.clinicId,
        city: clinicObj?.city || 'Main',
        share,
      };
    });
  }, [periodFilteredRecords, summary.recognized]);

  // Treatment Breakdown
  const treatmentStats = useMemo(() => {
    const map = {};
    periodFilteredRecords.forEach((r) => {
      if (!isRevenueRecognized(r)) return;
      const raw = r.treatmentCategory || r.category || r.treatment || r.notes || 'General & Preventive';
      const t = normalizeTreatmentCategory(raw);
      const amt = getRecognizedAmount(r);
      if (!map[t]) {
        map[t] = { name: t, revenue: 0, count: 0 };
      }
      map[t].revenue += amt;
      map[t].count += 1;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.revenue - a.revenue);

    return list.map((item) => {
      const share = summary.recognized > 0 ? Math.round((item.revenue / summary.recognized) * 100) : 0;
      const avg = item.count > 0 ? Math.round(item.revenue / item.count) : 0;
      return {
        ...item,
        share,
        avg,
      };
    });
  }, [periodFilteredRecords, summary.recognized]);

  // Payment Methods Breakdown
  const paymentMethodStats = useMemo(() => {
    const map = {};
    periodFilteredRecords.forEach((r) => {
      if (!isRevenueRecognized(r)) return;
      const m = r.method || 'Credit Card';
      const amt = getRecognizedAmount(r);
      if (!map[m]) {
        map[m] = { name: m, amount: 0, count: 0 };
      }
      map[m].amount += amt;
      map[m].count += 1;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.amount - a.amount);

    return list.map((item) => {
      const share = summary.recognized > 0 ? Math.round((item.amount / summary.recognized) * 100) : 0;
      return {
        ...item,
        share,
      };
    });
  }, [periodFilteredRecords, summary.recognized]);

  // Export CSV Function
  const handleExportCSV = () => {
    try {
      const headers = [
        'Transaction ID',
        'Date',
        'Patient Name',
        'Clinic Branch',
        'Treatment',
        'Payment Method',
        'Recognized Amount (USD)',
        'Status',
      ];

      const rows = periodFilteredRecords.map((r) => {
        const clinicObj = getClinicById(r.clinicId);
        const clinicName = clinicObj?.name || r.clinicId || 'Downtown Dental';
        const dateStr = r.date ? new Date(r.date).toISOString().split('T')[0] : (r.month || '');
        const amount = getRecognizedAmount(r);

        return [
          `"${r.id || ''}"`,
          `"${dateStr}"`,
          `"${r.patientName || 'Private Patient'}"`,
          `"${clinicName}"`,
          `"${r.treatment || r.treatmentCategory || r.notes || 'Dental Procedure'}"`,
          `"${r.method || 'Credit Card'}"`,
          amount,
          `"${r.status || 'Paid'}"`,
        ].join(',');
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `financial_report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Financial report exported to CSV successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV report.');
    }
  };

  const fmt = (num) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Audit & Reporting
            </span>
            <span className="text-xs text-slate-500 font-medium">Smile Care Group Consolidated</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Financial & Revenue Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit consolidated clinic cash flows, procedure revenue yields, and payment method reconciliations.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Available Records</option>
              <option value="sep_2026">Current Month (Sep 2026)</option>
              <option value="aug_2026">Last Month (Aug 2026)</option>
              <option value="q3_2026">Q3 2026 (Jul - Sep)</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recognized Inflow</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{fmt(summary.recognized)}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Actual cash collected</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Collection Yield</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary.collectionRate}%</p>
          <span className="text-[11px] text-slate-500 font-medium">Of total billed volume</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Deposits Held</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{fmt(summary.deposits)}</p>
          <span className="text-[11px] text-sky-600 font-medium">Guaranteed reservations</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Transaction</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{fmt(summary.avgTicket)}</p>
          <span className="text-[11px] text-slate-500 font-medium">Per completed receipt</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Processed Volume</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary.count}</p>
          <span className="text-[11px] text-slate-500 font-medium">Completed transactions</span>
        </div>
      </div>

      {/* Two Column Grid: Clinics vs Treatments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinic Branch Yield */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900">Revenue by Clinic Branch</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">{clinicStats.length} Branches</span>
            </div>

            <div className="mt-4 space-y-4">
              {clinicStats.map((clinic) => (
                <div key={clinic.clinicId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {clinic.name}{' '}
                      <span className="text-slate-400 font-normal">({clinic.city})</span>
                    </span>
                    <span className="font-bold text-slate-900">{fmt(clinic.revenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${clinic.share}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{clinic.transactions} transactions</span>
                    <span>{clinic.share}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Treatment Category Yield */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Revenue by Treatment Category</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">{treatmentStats.length} Categories</span>
            </div>

            <div className="mt-4 space-y-4">
              {treatmentStats.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="font-bold text-slate-900">{fmt(item.revenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Avg: {fmt(item.avg)} / case</span>
                    <span>{item.share}% of revenue</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Mix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Payment Methods Distribution</h3>
          </div>
          <span className="text-xs text-slate-400">Tender Reconciliation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {paymentMethodStats.map((m) => (
            <div key={m.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{m.name}</span>
                <span className="font-semibold text-slate-700">{m.share}%</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-2">{fmt(m.amount)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{m.count} payments</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
