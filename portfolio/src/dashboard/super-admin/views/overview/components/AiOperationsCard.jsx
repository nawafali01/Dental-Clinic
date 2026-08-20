import React from 'react';
import { Users, Clock, Bot } from 'lucide-react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';

export const AiOperationsCard = ({ isLoading, aiOperationsMetrics }) => {
  return (
    <Card
      title="AI Operations & Alerts"
      subtitle="Real-time automated copilot & queue health"
      action={
        <Badge variant="purple" dot>
          Live Telemetry
        </Badge>
      }
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-14 bg-slate-100 rounded-xl" />
          <div className="h-14 bg-slate-100 rounded-xl" />
          <div className="h-14 bg-slate-100 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Unassigned Leads Queue */}
          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Unassigned Leads Queue</h4>
                <p className="text-[11px] text-slate-500">Requires triage / routing</p>
              </div>
            </div>
            <Badge variant={aiOperationsMetrics.unassignedLeadsCount > 5 ? 'warning' : 'info'}>
              {aiOperationsMetrics.unassignedLeadsCount} Leads
            </Badge>
          </div>

          {/* Overdue Follow-ups */}
          <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Overdue Follow-ups</h4>
                <p className="text-[11px] text-slate-500">Pending clinic outreach</p>
              </div>
            </div>
            <Badge variant={aiOperationsMetrics.overdueFollowUpsCount > 0 ? 'warning' : 'neutral'}>
              {aiOperationsMetrics.overdueFollowUpsCount} Overdue
            </Badge>
          </div>

          {/* AI Copilot Telemetry Summary */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <Bot className="w-3.5 h-3.5" />
                <span>AI Copilot Engine</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ● {aiOperationsMetrics.telemetry.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Runs</div>
                <div className="font-bold text-xs text-slate-100 mt-0.5">
                  {aiOperationsMetrics.totalAiRuns.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Acceptance</div>
                <div className="font-bold text-xs text-emerald-400 mt-0.5">
                  {aiOperationsMetrics.agentAcceptanceRate}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Anomalies</div>
                <div
                  className={`font-bold text-xs mt-0.5 ${
                    aiOperationsMetrics.systemAnomalyFlags > 0 ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  {aiOperationsMetrics.systemAnomalyFlags} Flags
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
