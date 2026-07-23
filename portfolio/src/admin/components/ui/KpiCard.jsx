import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from './Badge';
import { SparklineSvg } from '../../../assets/svg/SparklineSvg';

export const KpiCard = ({ title, value, change, isPositive, period, category, sparkline, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        {/* Top Meta Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {category}
          </span>
          {Icon && (
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
          {title}
        </h4>

        {/* Primary Value & Sparkline */}
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-mono">
            {value}
          </div>
          <SparklineSvg data={sparkline} isPositive={isPositive} />
        </div>
      </div>

      {/* Bottom Trend Badge Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <Badge
          variant={isPositive ? 'success' : 'error'}
          className="text-[11px] font-bold px-2 py-0.5"
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : change.startsWith('-') ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          <span>{change}</span>
        </Badge>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{period}</span>
      </div>
    </div>
  );
};
