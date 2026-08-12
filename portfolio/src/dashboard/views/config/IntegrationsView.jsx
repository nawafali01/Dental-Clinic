import React from 'react';
import { integrationsList } from '@/data/routesData';
import { Badge, DevBanner, PageHeader } from '../components/ViewComponents';

export const IntegrationsView = () => (
  <div className="space-y-6">
    <PageHeader title="Integrations" description="Connect your tools and third-party services" action="+ Add Integration" />
    <div className="grid grid-cols-3 gap-4">
      {integrationsList.map((integration, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <Badge color="slate">{integration.category}</Badge>
            <Badge color={integration.color}>{integration.status}</Badge>
          </div>
          <p className="font-semibold text-slate-900">{integration.name}</p>
        </div>
      ))}
    </div>
    <DevBanner text="Full Integrations hub is under development" />
  </div>
);

export default IntegrationsView;
