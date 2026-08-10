import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { checkInShortcutsList } from '../../mock-data/managerMockData';

export const CheckInShortcuts = () => {
  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-3 pt-2">
        {checkInShortcutsList.map((action, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className={`p-2.5 rounded-xl ${action.bg} ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {action.title}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};
