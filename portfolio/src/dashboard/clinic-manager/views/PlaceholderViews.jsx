import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderView = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
      <Construction className="w-8 h-8 text-emerald-500" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        {description}
      </p>
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
      Coming Soon
    </span>
  </div>
);

export const AppointmentsView = () => (
  <PlaceholderView
    title="Patient Appointments"
    description="Full appointment scheduling, patient check-in, and calendar management will be available here."
  />
);

export const PipelineView = () => (
  <PlaceholderView
    title="Local Lead Pipeline"
    description="Clinic-level lead tracking, outreach history, and conversion management will be available here."
  />
);

export const TasksView = () => (
  <PlaceholderView
    title="Task Manager"
    description="Assign, track, and resolve operational tasks for your clinic team from this module."
  />
);

export const MessagesView = () => (
  <PlaceholderView
    title="Patient Messages"
    description="Two-way patient communications, AI chat logs, and SMS/email threads will be available here."
  />
);
