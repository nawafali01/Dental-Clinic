import React from 'react';
import { StatCard, DevBanner, PageHeader } from '../components/ViewComponents';

export const MyScheduleView = () => (
  <div className="space-y-6">
    <PageHeader title="My Schedule" description="Your daily desk schedule and assigned tasks" />
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Shift" value="08:00 - 16:00" sub="Morning Desk" />
      <StatCard label="Check-Ins Done" value="18" sub="Today" />
      <StatCard label="Pending Reminders" value="5" sub="To call" />
    </div>
    <DevBanner text="Personal Receptionist Schedule view is under development" />
  </div>
);

export default MyScheduleView;
