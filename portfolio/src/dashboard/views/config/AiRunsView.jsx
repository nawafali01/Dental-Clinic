import React, { useState, useEffect } from 'react';
import { Play, Sparkles, RefreshCw, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import aiService from '@/services/aiService';
import { PageHeader } from '../components/ViewComponents';

export const AiRunsView = () => {
  const [runs, setRuns] = useState([]);
  const [aiRuns, setAiRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null);

  const loadRuns = async () => {
    setIsLoading(true);
    try {
      const [fetchedRuns, fetchedAiRuns] = await Promise.all([
        aiService.getAutomationRuns(),
        aiService.getAIRuns(),
      ]);
      setRuns(fetchedRuns || []);
      setAiRuns(fetchedAiRuns || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load AI runs history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const totalRunsCount = runs.length + aiRuns.length;
  const successCount = runs.filter((r) => r.status === 'success').length + aiRuns.filter((r) => r.status === 'success').length;
  const successRate = totalRunsCount > 0 ? ((successCount / totalRunsCount) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Automation Execution History (`AIRun` & `AutomationRun`)"
        description="Audit log of all execution triggers, prompt versions used, input/output data payloads, and status"
        action={
          <button
            onClick={loadRuns}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
            <span>Sync History</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Recorded Runs</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalRunsCount}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">All time logged runs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Rate</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{successRate}%</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">High availability</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Latency</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">260ms</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Optimized throughput</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">Operational</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">LocalTunnel Active</p>
        </div>
      </div>

      {/* Main Execution Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Run ID</th>
              <th className="px-4 py-3">Feature / Rule Name</th>
              <th className="px-4 py-3">Prompt Version</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payload Inspector</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {runs.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">{r.id}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-800">{r.rule_name || r.automation_rule_id}</td>
                <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">N/A (Rule Trigger)</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      r.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setSelectedRun(r)}
                    className="flex items-center gap-1 text-xs font-mono text-primary hover:underline bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Payload</span>
                  </button>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {aiRuns.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-700">{r.id}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-800">{r.feature_name}</td>
                <td className="px-4 py-3.5 text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md w-fit">
                  {r.prompt_version_id}
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-emerald-100 text-emerald-800">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setSelectedRun(r)}
                    className="flex items-center gap-1 text-xs font-mono text-indigo-600 hover:underline bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect AI In/Out</span>
                  </button>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payload Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Run Payload Details (#{selectedRun.id})</h3>
                <p className="text-xs text-slate-500">{selectedRun.feature_name || selectedRun.rule_name}</p>
              </div>
              <button onClick={() => setSelectedRun(null)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
              {JSON.stringify(selectedRun.execution_details || selectedRun.input_data || selectedRun, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRunsView;
