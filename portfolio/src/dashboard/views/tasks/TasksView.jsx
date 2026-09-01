import React, { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  Filter,
  User,
  Layers,
  Inbox,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import {
  listTasks,
  deleteTask,
  TASK_QUEUES,
  TASK_PRIORITIES,
  TASK_TYPES,
  normalizeTask,
} from '@/services/tasksService';
import { canDoAction, hasRolePermission, PERMISSIONS } from '@/dashboard/shared/config/permissions';
import { Badge, StatCard, PageHeader } from '../components/ViewComponents';
import { TaskModal } from './components/TaskModal';
import { TaskCompleteModal } from './components/TaskCompleteModal';

export const TasksView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const role = currentUser?.role || 'agent';

  // Check permissions
  const canView = hasRolePermission(role, PERMISSIONS.VIEW_TASKS);
  const canCreate = canDoAction(role, 'tasks', 'create');
  const canEdit = canDoAction(role, 'tasks', 'edit');
  const canDelete = canDoAction(role, 'tasks', 'delete');
  const isAuditor = role === 'auditor';

  // ── State ──────────────────────────────────────────────────
  const [activeQueue, setActiveQueue] = useState(TASK_QUEUES.TODAY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const reloadTasks = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // ── Load Users & Leads for resolution ───────────────────────
  const usersMap = useMemo(() => {
    const rawUsers = storageService.get(storageService.KEYS.USERS) || [];
    const map = {};
    rawUsers.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [refreshTrigger]);

  const leadsMap = useMemo(() => {
    const rawLeads = storageService.get(storageService.KEYS.LEADS) || [];
    const map = {};
    rawLeads.forEach((l) => {
      map[l.id] = l;
    });
    return map;
  }, [refreshTrigger]);

  // ── Load all scoped tasks for Stat Cards & Queues ────────────
  const allScopedTasks = useMemo(() => {
    return listTasks({ queue: TASK_QUEUES.ALL }, currentUser, selectedClinicId);
  }, [currentUser, selectedClinicId, refreshTrigger]);

  // ── Stat Cards calculations ─────────────────────────────────
  const total = allScopedTasks.length;
  const pending = allScopedTasks.filter(
    (t) => (t.status || '').toLowerCase() === 'pending' || (t.status || '').toLowerCase() === 'in progress'
  ).length;
  const highPriority = allScopedTasks.filter(
    (t) => (t.priority || '').toLowerCase() === 'high' || (t.priority || '').toLowerCase() === 'urgent'
  ).length;
  const completed = allScopedTasks.filter(
    (t) => (t.status || '').toLowerCase() === 'completed'
  ).length;

  // ── Queue Counts ────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];

  const queueCounts = useMemo(() => {
    let todayCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;
    let overdueCount = 0;

    allScopedTasks.forEach((t) => {
      const d = String(t.due_date || t.dueDate || '').substring(0, 10);
      const isCompleted = (t.status || '').toLowerCase() === 'completed';
      const isCancelled = (t.status || '').toLowerCase() === 'cancelled';

      if (isCompleted) {
        completedCount++;
      } else if (!isCancelled) {
        if (d === todayStr) todayCount++;
        else if (d > todayStr) upcomingCount++;
        else if (d < todayStr) overdueCount++;
      }
    });

    return {
      all: allScopedTasks.length,
      today: todayCount,
      upcoming: upcomingCount,
      completed: completedCount,
      overdue: overdueCount,
    };
  }, [allScopedTasks, todayStr]);

  // ── Filtered Tasks for Active Queue ─────────────────────────
  const filteredTasks = useMemo(() => {
    return listTasks(
      {
        queue: activeQueue,
        search: searchQuery,
        priority: selectedPriority,
        type: selectedType,
      },
      currentUser,
      selectedClinicId
    );
  }, [activeQueue, searchQuery, selectedPriority, selectedType, currentUser, selectedClinicId, refreshTrigger]);

  // ── Handlers ────────────────────────────────────────────────
  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const success = deleteTask(taskId);
      if (success) {
        toast.success('Task deleted successfully');
        reloadTasks();
      } else {
        toast.error('Failed to delete task');
      }
    }
  };

  // Helper for Initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Color mapping helper
  const getPriorityBadgeColor = (p) => {
    const lower = (p || '').toLowerCase();
    if (lower === 'urgent') return 'red';
    if (lower === 'high') return 'red';
    if (lower === 'normal' || lower === 'medium') return 'amber';
    return 'slate';
  };

  const getStatusBadgeColor = (s) => {
    const lower = (s || '').toLowerCase();
    if (lower === 'completed') return 'green';
    if (lower === 'in progress') return 'blue';
    if (lower === 'overdue') return 'red';
    if (lower === 'cancelled') return 'slate';
    return 'amber';
  };

  // Access Denied State (for Receptionist/Finance without tasks permission)
  if (!canView) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <div className="size-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Task Access Restricted</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Your role ({role}) does not have permission to view or manage team tasks. Please contact your Clinic Manager or System Administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Tasks"
        description={
          isAuditor
            ? 'Read-only view of clinic tasks and operational follow-ups'
            : 'Manage team tasks, patient follow-ups, and daily workflows'
        }
        action={
          canCreate ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="size-4" /> + New Task
            </button>
          ) : null
        }
      />

      {/* ── Auditor Notice if applicable ── */}
      {isAuditor && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-slate-700 text-sm">
          <Lock className="size-4 text-slate-500" />
          <span>Auditor Mode: Viewing all clinic tasks in read-only audit mode.</span>
        </div>
      )}

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={total} sub="Assigned to your scope" />
        <StatCard label="Pending" value={pending} sub="Needs attention" />
        <StatCard label="High Priority" value={highPriority} sub="Urgent follow-ups" />
        <StatCard label="Completed" value={completed} sub="Finished tasks" />
      </div>

      {/* ── Queue Navigation & Filter Bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        {/* Queue Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-3">
          {[
            { key: TASK_QUEUES.TODAY, label: 'Today', count: queueCounts.today },
            { key: TASK_QUEUES.UPCOMING, label: 'Upcoming', count: queueCounts.upcoming },
            { key: TASK_QUEUES.OVERDUE, label: 'Overdue', count: queueCounts.overdue, isAlert: queueCounts.overdue > 0 },
            { key: TASK_QUEUES.COMPLETED, label: 'Completed', count: queueCounts.completed },
            { key: TASK_QUEUES.ALL, label: 'All Tasks', count: queueCounts.all },
          ].map((tab) => {
            const isActive = activeQueue === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveQueue(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.isAlert
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, lead, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              <option value="all">All Priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              <option value="all">All Types</option>
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Task Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Task / Title
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Due Time
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="size-8 stroke-[1.5] text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        {activeQueue === TASK_QUEUES.TODAY
                          ? 'No tasks due today'
                          : activeQueue === TASK_QUEUES.UPCOMING
                          ? 'No upcoming tasks scheduled'
                          : activeQueue === TASK_QUEUES.OVERDUE
                          ? 'Great job! No overdue tasks'
                          : activeQueue === TASK_QUEUES.COMPLETED
                          ? 'No completed tasks yet'
                          : 'No tasks found matching your filters'}
                      </p>
                      {canCreate && activeQueue !== TASK_QUEUES.COMPLETED && (
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          + Create a new task
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const assignee = usersMap[t.assignee_id] || usersMap[t.assigneeId] || usersMap[t.assignedAgentId];
                  const assigneeName = assignee?.fullName || assignee?.name || t.assignedAgentName || 'Unassigned';
                  const assigneeInitials = getInitials(assigneeName);

                  // Linked lead name
                  const linkedLead = leadsMap[t.linked_lead_id || t.leadId];
                  const leadName = t.leadName || linkedLead?.patientName || linkedLead?.name || '';

                  const isDone = (t.status || '').toLowerCase() === 'completed';
                  const isOverdue = t.overdue && !isDone;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Title & Linked Lead */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${
                              isDone
                                ? 'text-slate-400 line-through'
                                : 'text-slate-900'
                            }`}
                          >
                            {t.title || leadName || t.type}
                          </span>
                          {leadName && (
                            <span className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              <span>Patient:</span>
                              <span className="text-slate-700">{leadName}</span>
                            </span>
                          )}
                          {t.completion_notes && isDone && (
                            <span className="text-xs text-emerald-700 italic mt-0.5">
                              Note: {t.completion_notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assignee Avatar + Name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center ring-1 ring-emerald-300/60">
                            {assigneeInitials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-800">
                              {assigneeName}
                            </span>
                            {assignee?.role && (
                              <span className="text-[10px] text-slate-400 capitalize">
                                {assignee.role.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                        {t.type || t.taskType || 'Call'}
                      </td>

                      {/* Due Time & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-800 font-medium">
                            {t.due_time || t.dueTime || '09:00'}
                          </span>
                          {t.due_date && (
                            <span className="text-xs text-slate-400">
                              ({String(t.due_date).substring(5, 10)})
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge color={getPriorityBadgeColor(t.priority)}>
                          {t.priority}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge color={getStatusBadgeColor(t.status)}>
                          {t.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Complete Action */}
                          {!isDone && canEdit && !isAuditor && (
                            <button
                              onClick={() => setCompletingTask(t)}
                              title="Mark Complete"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle className="size-4" />
                            </button>
                          )}

                          {/* Edit Action */}
                          {canEdit && !isAuditor && (
                            <button
                              onClick={() => setEditingTask(t)}
                              title="Edit Task"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                          )}

                          {/* Delete Action */}
                          {canDelete && !isAuditor && (
                            <button
                              onClick={() => handleDelete(t.id)}
                              title="Delete Task"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={reloadTasks}
        currentUser={currentUser}
        selectedClinicId={selectedClinicId}
      />

      <TaskModal
        isOpen={Boolean(editingTask)}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSuccess={reloadTasks}
        currentUser={currentUser}
        selectedClinicId={selectedClinicId}
      />

      <TaskCompleteModal
        isOpen={Boolean(completingTask)}
        task={completingTask}
        onClose={() => setCompletingTask(null)}
        onSuccess={reloadTasks}
      />
    </div>
  );
};

export default TasksView;
