import React from 'react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { UserCheck, FileText, CreditCard, Stethoscope } from 'lucide-react';

export const CheckInShortcuts = () => {
  const shortcuts = [
    { title: 'Patient Check-in', icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Intake Forms', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Collect Co-pay', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Start Exam', icon: Stethoscope, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-3 pt-2">
        {shortcuts.map((action, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100:bg-slate-800 transition-colors"
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
