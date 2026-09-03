import React, { useState } from 'react';
import {
  X,
  FileText,
  DollarSign,
  Users,
  Calendar,
  Building2,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { storageService } from '@/services/storage.service';
import {
  REPORT_TYPES,
  PERIOD_OPTIONS,
  FORMAT_OPTIONS,
  generateReport,
} from '@/services/reportsService';

const TYPE_ICONS = {
  revenue: DollarSign,
  leads: Users,
  appointments: Calendar,
  clinics: Building2,
  ai: Sparkles,
  patients: Users,
};

export function GenerateReportModal({
  isOpen,
  onClose,
  onGenerated,
  currentUser,
  selectedClinicId,
  initialType = 'revenue',
}) {
  const clinics = storageService.get(storageService.KEYS.CLINICS) || [];

  const [selectedType, setSelectedType] = useState(initialType || 'revenue');
  const [period, setPeriod] = useState('30d');
  const [clinicId, setClinicId] = useState(
    selectedClinicId && selectedClinicId !== 'all' ? selectedClinicId : 'all'
  );
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      setGenerationStep('Querying CRM database & live transactions...');
      await new Promise((res) => setTimeout(res, 350));

      setGenerationStep('Aggregating branch metrics & calculating KPIs...');
      await new Promise((res) => setTimeout(res, 350));

      setGenerationStep('Formatting executive report output...');
      await new Promise((res) => setTimeout(res, 300));

      const report = generateReport({
        type: selectedType,
        period,
        clinicId,
        format,
        includeCharts,
        generatedBy: currentUser?.fullName || 'System Administrator',
      });

      toast.success(`Report "${report.title}" generated successfully!`, {
        description: `Ready in ${report.format.toUpperCase()} format (${report.fileSize})`,
      });

      onGenerated?.(report);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={!isGenerating ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Generate Analytics Report</h2>
              <p className="text-xs text-slate-500">Configure parameters for automated report generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Select Report Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {REPORT_TYPES.map((type) => {
                const Icon = TYPE_ICONS[type.id] || FileText;
                const isSelected = selectedType === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{type.title}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {type.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scope and Date Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time Period */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Reporting Timeframe
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope / Clinic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Branch Scope
              </label>
              <select
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="all">🌟 All Clinics (Enterprise SuperAdmin)</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏥 {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = format === fmt.value;
                return (
                  <div
                    key={fmt.value}
                    onClick={() => setFormat(fmt.value)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-1 ring-emerald-500 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{fmt.label.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{fmt.value.toUpperCase()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Report Options</p>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-medium">
                Include executive KPI cards & visual performance summary
              </span>
            </label>
          </div>

          {/* Progress bar when generating */}
          {isGenerating && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-in fade-in space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  Generating Report...
                </span>
                <span className="text-emerald-600 text-[11px]">Processing</span>
              </div>
              <p className="text-xs text-emerald-700">{generationStep}</p>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full animate-pulse w-3/4 transition-all duration-300" />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Report Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default GenerateReportModal;
