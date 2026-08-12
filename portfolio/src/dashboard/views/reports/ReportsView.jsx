import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { scopeData } from '@/utils/scopeData';
import { reportsList } from '@/data/routesData';
import { Badge, StatCard, DevBanner, PageHeader } from '../components/ViewComponents';

export const ReportsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const reports = scopeData({ resource: 'reports', data: reportsList, currentUser, selectedClinicId });

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analytics and performance reports" action="Generate Report" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={reports.length} sub="Available in scope" />
        <StatCard label="Scheduled" value={Math.min(reports.length, 3)} sub="Automated" />
        <StatCard label="Scope" value={currentUser?.role} sub="Access level" />
        <StatCard label="Status" value="Ready" sub="PDF exports" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <Badge color={r.color}>{r.tag}</Badge>
              <span className="text-xs text-slate-400">PDF</span>
            </div>
            <p className="font-semibold text-slate-900">{r.title}</p>
            <p className="text-xs text-slate-500">{r.desc}</p>
          </div>
        ))}
      </div>
      <DevBanner text="Full Reports module is under development" />
    </div>
  );
};

export default ReportsView;
