import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Printer,
  ArrowUpRight,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { reportsList } from '@/data/routesData';
import {
  getGeneratedReports,
  deleteReport,
  exportReportAsCSV,
  exportReportAsJSON,
  REPORT_TYPES,
} from '@/services/reportsService';
import { Badge, StatCard, PageHeader } from '../components/ViewComponents';
import { GenerateReportModal } from './components/GenerateReportModal';
import { ReportPreviewModal } from './components/ReportPreviewModal';

export const ReportsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();

  // State
  const [reportsHistory, setReportsHistory] = useState(() => getGeneratedReports());
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [preselectedType, setPreselectedType] = useState('revenue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');

  // Handle template card click to quick generate
  const handleQuickGenerate = (template) => {
    // Map template tag or title to report type
    let targetType = 'revenue';
    const tag = (template.tag || '').toLowerCase();
    const title = (template.title || '').toLowerCase();

    if (tag.includes('crm') || title.includes('lead')) targetType = 'leads';
    else if (tag.includes('operations') || title.includes('appointment')) targetType = 'appointments';
    else if (tag.includes('clinic') || title.includes('branch')) targetType = 'clinics';
    else if (tag.includes('ai') || title.includes('ai')) targetType = 'ai';
    else if (tag.includes('patient')) targetType = 'patients';
    else targetType = 'revenue';

    setPreselectedType(targetType);
    setIsGenerateModalOpen(true);
  };

  // Callback when report is generated
  const handleReportGenerated = (newReport) => {
    setReportsHistory(getGeneratedReports());
    setPreviewReport(newReport);
  };

  // Delete report
  const handleDeleteReport = (reportId, e) => {
    e.stopPropagation();
    const updated = deleteReport(reportId);
    setReportsHistory(updated);
    toast.success('Report removed from history');
  };

  // Export report CSV
  const handleDownloadCSV = (report, e) => {
    e.stopPropagation();
    exportReportAsCSV(report);
    toast.success(`Downloaded ${report.title}.csv`);
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reportsHistory.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.clinicName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.period?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTagFilter === 'ALL' ||
        report.type?.toUpperCase() === selectedTagFilter ||
        (selectedTagFilter === 'FINANCE' && report.type === 'revenue') ||
        (selectedTagFilter === 'OPERATIONS' && report.type === 'appointments');

      return matchesSearch && matchesTag;
    });
  }, [reportsHistory, searchQuery, selectedTagFilter]);

  // Unique tags for filter pills
  const filterPills = [
    { label: 'All Reports', value: 'ALL' },
    { label: 'Finance & Revenue', value: 'FINANCE' },
    { label: 'CRM & Leads', value: 'LEADS' },
    { label: 'Operations', value: 'OPERATIONS' },
    { label: 'Clinics', value: 'CLINICS' },
    { label: 'AI Ops', value: 'AI' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header with Functional Action */}
      <PageHeader
        title="Reports & Analytics"
        description="Generate, export and audit enterprise financial, clinical and operational reports."
        action={
          <button
            onClick={() => {
              setPreselectedType('revenue');
              setIsGenerateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs hover:shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            Generate Report
          </button>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Generated Reports"
          value={reportsHistory.length}
          sub="Historical logs available"
        />
        <StatCard
          label="Report Templates"
          value={reportsList.length}
          sub="Preconfigured presets"
        />
        <StatCard
          label="User Access Scope"
          value={currentUser?.role === 'super_admin' ? 'Super Admin' : (currentUser?.role || 'Admin')}
          sub="Enterprise Multi-Clinic"
        />
        <StatCard
          label="Export Engine"
          value="Online"
          sub="PDF, CSV & JSON ready"
        />
      </div>

      {/* Quick Report Templates Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Instant Report Templates</h2>
            <p className="text-xs text-slate-500">Click any template card below to configure and generate instantly</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1-Click Launchers
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {reportsList.map((r, i) => (
            <div
              key={i}
              onClick={() => handleQuickGenerate(r)}
              className="group bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <Badge color={r.color}>{r.tag}</Badge>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-emerald-600 font-semibold transition-colors">
                  <span>Generate</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {r.title}
                </p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Scope: Multi-Clinic</span>
                <span className="font-semibold text-slate-600">PDF & CSV</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Reports History Log Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Generated Reports Archive</h2>
            <p className="text-xs text-slate-500">
              Audit log of all analytics reports generated by SuperAdmin & Clinic Managers
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports or clinics..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {filterPills.map((pill) => {
            const isActive = selectedTagFilter === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => setSelectedTagFilter(pill.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Reports Archive Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Report Details
                </th>
                <th className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Branch Scope
                </th>
                <th className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Timeframe
                </th>
                <th className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Format & Size
                </th>
                <th className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Status
                </th>
                <th className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">No reports found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try changing your search filter or generate a new report</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setPreviewReport(report)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Title and ID */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {report.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Generated by {report.generatedBy} • {new Date(report.dateGenerated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Clinic Scope */}
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {report.clinicName || 'All Clinics (Enterprise)'}
                    </td>

                    {/* Timeframe */}
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                        {report.period}
                      </span>
                    </td>

                    {/* Format & Size */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase font-bold text-[10px] text-slate-600 px-1.5 py-0.5 bg-slate-100 rounded">
                          {report.format || 'PDF'}
                        </span>
                        <span className="text-slate-400 text-[11px]">{report.fileSize || '1.2 MB'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewReport(report);
                          }}
                          title="Preview & Print Report"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDownloadCSV(report, e)}
                          title="Download CSV"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          title="Delete Report"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generation Modal */}
      <GenerateReportModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerated={handleReportGenerated}
        currentUser={currentUser}
        selectedClinicId={selectedClinicId}
        initialType={preselectedType}
      />

      {/* Preview Modal */}
      <ReportPreviewModal
        isOpen={Boolean(previewReport)}
        onClose={() => setPreviewReport(null)}
        report={previewReport}
      />
    </div>
  );
};

export default ReportsView;
