import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { X, Bell, AlertTriangle, CheckCircle2, Info, Bot, UserPlus } from 'lucide-react';

const mockNotifications = [
  {
    id: 'n1',
    title: 'AI High Latency Alert',
    description: 'Clinic Downtown Dental experienced 1,840ms latency on Voice Agent run #8492.',
    time: '4 mins ago',
    type: 'warning',
    icon: AlertTriangle,
    read: false,
  },
  {
    id: 'n2',
    title: 'New High Value Lead',
    description: 'Full-Mouth Implant lead registered ($14,500 target value).',
    time: '18 mins ago',
    type: 'success',
    icon: UserPlus,
    read: false,
  },
  {
    id: 'n3',
    title: 'Prompt Version 2.4 Deployed',
    description: 'System automatically deployed optimized booking flow prompt across 4 clinics.',
    time: '1 hour ago',
    type: 'info',
    icon: Bot,
    read: true,
  },
  {
    id: 'n4',
    title: 'Weekly Financial Reconciliation',
    description: 'Deposit collections reached $148,200 (Target 98.4% achieved).',
    time: '3 hours ago',
    type: 'success',
    icon: CheckCircle2,
    read: true,
  },
];

export const NotificationsDrawer = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useAdmin();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
        onClick={() => setIsNotificationsOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                System Notifications
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                2 New
              </span>
            </div>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {mockNotifications.map((n) => {
              const IconComponent = n.icon;
              return (
                <div
                  key={n.id}
                  className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    !n.read ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        n.type === 'warning'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : n.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {n.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-center">
            <button className="text-xs font-medium text-primary hover:underline">
              Mark all as read
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
