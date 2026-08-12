import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const TasksView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawTasks = storageService.get(storageService.KEYS.TASKS) || [];
  const tasks = scopeData({ resource: 'tasks', data: rawTasks, currentUser, selectedClinicId });

  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const highPriority = tasks.filter(t => t.priority === 'high').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Manage team tasks and follow-ups" action="+ New Task" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={total} sub="Assigned to your scope" />
        <StatCard label="Pending" value={pending} sub="Needs attention" />
        <StatCard label="High Priority" value={highPriority} sub="Urgent" />
        <StatCard label="Completed" value={completed} sub="Finished tasks" />
      </div>
      <Table
        headers={["Task / Lead", "Type", "Due Time", "Priority", "Status"]}
        rows={tasks.map(t => [
          t.leadName || t.taskType,
          t.taskType || 'Follow-up',
          t.dueTime || '09:00',
          <Badge key="priority" color={t.priority === 'high' ? 'red' : 'amber'}>{t.priority}</Badge>,
          <Badge key="status" color={t.status === 'completed' ? 'green' : 'amber'}>{t.status}</Badge>
        ])}
      />
      <DevBanner text="Full Task Management module is under development" />
    </div>
  );
};

export default TasksView;
