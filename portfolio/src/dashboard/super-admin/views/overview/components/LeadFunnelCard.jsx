import React from 'react';
import {
  Users,
  PhoneCall,
  CalendarCheck,
  CheckCircle,
  Award,
  DollarSign,
} from 'lucide-react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { safePct } from '../constants';

const STAGE_ICONS = {
  Captured: Users,
  Contacted: PhoneCall,
  Booked: CalendarCheck,
  Attended: CheckCircle,
  Converted: Award,
  Revenue: DollarSign,
};

export const LeadFunnelCard = ({ isLoading, derivedMetrics, selectedDateRange }) => {
  return (
    <Card
      title="Lead-to-Revenue Conversion Funnel"
      subtitle={`End-to-end patient acquisition lifecycle trajectory (${selectedDateRange})`}
      className="lg:col-span-2"
      action={
        <Badge variant="info" dot>
          Multi-Stage Scoped
        </Badge>
      }
    >
      {isLoading ? (
        <div className="h-48 flex items-center justify-center animate-pulse bg-slate-50 rounded-xl">
          <div className="h-4 bg-slate-200 rounded w-48" />
        </div>
      ) : derivedMetrics.totalLeads === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No lead telemetry available for the selected filters.
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {derivedMetrics.funnelStages.map((stage, idx) => {
              const Icon = STAGE_ICONS[stage.stage] || Users;
              return (
                <div
                  key={stage.stage}
                  className="bg-slate-50/80 border border-slate-100 hover:border-slate-200 rounded-xl p-3 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      0{idx + 1}. {stage.stage}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 font-mono">{stage.formattedValue}</div>
                    <div className="mt-1 text-[11px] text-slate-500 font-medium truncate">{stage.dropOff}</div>
                  </div>
                  <div className="mt-2.5 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.barColor}`}
                      style={{
                        width:
                          idx === 0
                            ? '100%'
                            : `${Math.max(
                                15,
                                Math.min(
                                  100,
                                  (stage.value / Math.max(1, derivedMetrics.funnelStages[0].value)) * 100
                                )
                              )}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversion Step Velocity Indicator */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">Funnel Health Velocity:</span>
              <span>Contacted {safePct(derivedMetrics.funnelStages[1]?.value, derivedMetrics.totalLeads)}</span>
              <span>•</span>
              <span>Booked {safePct(derivedMetrics.totalBookings, derivedMetrics.totalLeads)}</span>
              <span>•</span>
              <span>Converted {derivedMetrics.conversionRateStr}</span>
            </div>
            <div className="text-slate-400 text-[11px] font-mono">
              Recognized Yield: {derivedMetrics.formattedRevenue}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
