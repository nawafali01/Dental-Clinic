import React from 'react';
import { websitePagesList } from '@/data/routesData';
import { Badge, DevBanner, PageHeader } from '../components/ViewComponents';

export const WebsiteContentView = () => (
  <div className="space-y-6">
    <PageHeader title="Website Content" description="Manage your clinic website content and pages" action="+ New Page" />
    <div className="grid grid-cols-3 gap-4">
      {websitePagesList.map((p, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <Badge color="slate">{p.tag}</Badge>
            <Badge color={p.status === "Published" ? "green" : "amber"}>{p.status}</Badge>
          </div>
          <p className="font-semibold text-slate-900">{p.title}</p>
          <p className="text-xs text-slate-500">{p.desc}</p>
        </div>
      ))}
    </div>
    <DevBanner text="Full Website CMS is under development" />
  </div>
);

export default WebsiteContentView;
