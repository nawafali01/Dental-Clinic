import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { managerFinancials } from '../../mock-data/managerMockData';
import { TrendingUp, CreditCard, DollarSign } from 'lucide-react';

export const FinancialSummary = () => {
  const percentCollected = Math.min(
    100,
    (managerFinancials.currentCollected / managerFinancials.dailyTarget) * 100
  );

  return (
    <Card 
      title="Clinic Financial Summary" 
      subtitle="Today's financial metrics & targets"
    >
      <div className="space-y-4 pt-2">
        {/* Progress Tracker */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-slate-500">Daily Collection Target</span>
            <span className="text-slate-800">
              ${managerFinancials.currentCollected.toLocaleString()} / ${managerFinancials.dailyTarget.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" 
              style={{ width: `${percentCollected}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {percentCollected.toFixed(1)}% of today's target achieved
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Projected Total
            </span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              ${managerFinancials.projected.toLocaleString()}
            </div>
            <span className="text-[9px] text-emerald-500 flex items-center gap-0.5 mt-0.5 font-medium">
              <TrendingUp className="w-2.5 h-2.5" /> Exceeds Target
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Insurance Pending
            </span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              ${managerFinancials.insurancePending.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Claims submitted today
            </span>
          </div>
        </div>

        {/* Patient Billing Note */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            Uncollected Patient Balances
          </span>
          <span className="font-bold text-slate-700">
            ${managerFinancials.patientPending}
          </span>
        </div>
      </div>
    </Card>
  );
};
