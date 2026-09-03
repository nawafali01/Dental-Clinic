import React from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { exportReportAsCSV, exportReportAsJSON } from '@/services/reportsService';
import { toast } from 'sonner';

export function ReportPreviewModal({ isOpen, onClose, report }) {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    // Open print dialog for the current report
    window.print();
  };

  const handleDownloadCSV = () => {
    exportReportAsCSV(report);
    toast.success('CSV spreadsheet exported!');
  };

  const handleDownloadJSON = () => {
    exportReportAsJSON(report);
    toast.success('JSON file exported!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50/90 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Report Viewer & Export
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-medium">Format: {report.format?.toUpperCase() || 'PDF'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print or Save as PDF"
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Print / Save PDF
            </button>

            <button
              onClick={handleDownloadCSV}
              title="Export as CSV"
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Export CSV
            </button>

            <button
              onClick={handleDownloadJSON}
              title="Export JSON payload"
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              JSON
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-2"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="report-print-area" className="flex-1 overflow-y-auto p-8 space-y-6 print:p-0 bg-white">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    AD
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                    Aurea Dental Enterprise
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    OFFICIAL REPORT
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{report.title}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Report ID: <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{report.id}</code>
                </p>
              </div>

              <div className="text-right space-y-1 text-xs text-slate-500">
                <div className="flex items-center justify-end gap-1.5 font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {report.period}
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {report.clinicName || 'Enterprise (All Clinics)'}
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Generated by {report.generatedBy}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(report.dateGenerated).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary Callout */}
          {report.summary && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs leading-relaxed text-slate-700 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 mb-0.5 uppercase tracking-wider text-[11px]">
                  Executive Summary
                </p>
                <p>{report.summary}</p>
              </div>
            </div>
          )}

          {/* KPI Cards Grid */}
          {report.metrics && report.metrics.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Key Performance Indicators
              </p>
              <div className="grid grid-cols-4 gap-3">
                {report.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{m.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabular Records */}
          {report.tableHeaders && report.tableRows && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Detailed Records & Breakdown
              </p>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {report.tableHeaders.map((th, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider text-[10px]"
                        >
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.tableRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 text-slate-700 font-medium">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-6 border-t border-slate-200 text-slate-400 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Authenticated CRM Audit Trail
            </div>
            <div>Confidential • Dental AI Automation System • SuperAdmin Scope</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPreviewModal;
