import React from 'react';
import { managerKpis } from '../../mock-data/managerMockData';
import { KpiCard } from '@/dashboard/shared/components/ui/KpiCard';

export const DailyKpiCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {managerKpis.map((metric) => (
        <KpiCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          isPositive={metric.isPositive}
          period={metric.period}
          category={metric.category}
          sparkline={metric.sparkline}
          icon={metric.icon}
        />
      ))}
    </div>
  );
};
