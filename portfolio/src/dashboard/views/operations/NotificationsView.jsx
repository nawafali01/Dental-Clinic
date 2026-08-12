import React from 'react';
import { notificationsList } from '@/data/routesData';
import { DevBanner, PageHeader } from '../components/ViewComponents';

export const NotificationsView = () => (
  <div className="space-y-6">
    <PageHeader title="Notifications" description="System and activity notifications" />
    <div className="space-y-3">
      {notificationsList.map((n, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
          </div>
          <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
        </div>
      ))}
    </div>
    <DevBanner text="Full Notifications centre is under development" />
  </div>
);

export default NotificationsView;
