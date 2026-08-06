/**
 * TASKS SERVICE
 *
 * All task-related business logic is isolated here.
 * Components must NEVER access localStorage directly.
 * Swap storage calls with API calls when the backend is ready.
 */

import { storageService } from './storage.service';

const TASKS_KEY = storageService.KEYS.TASKS;

// ─── Helpers ─────────────────────────────────────────────────

const isSameDay = (isoA, isoB) => {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
};

const isOverdue = (dueDate, status) => {
  if (status === 'completed') return false;
  return new Date(dueDate) < new Date();
};

// ─── Public API ──────────────────────────────────────────────

/**
 * Returns tasks due today for a specific agent, enriched with an `overdue` flag.
 *
 * @param {string} agentId
 * @returns {Task[]}
 */
export function getTasksForToday(agentId) {
  const today = new Date().toISOString();
  const tasks = (storageService.get(TASKS_KEY) || []).filter(
    (t) => t.assignedAgentId === agentId && isSameDay(t.dueDate, today)
  );

  return tasks
    .map((t) => ({ ...t, overdue: isOverdue(t.dueDate, t.status) }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/**
 * Marks a task as completed.
 *
 * @param {string} taskId
 * @returns {Task|null} the updated task
 */
export function completeTask(taskId) {
  const tasks = storageService.get(TASKS_KEY) || [];
  const updated = tasks.map((t) =>
    t.id === taskId
      ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
      : t
  );
  storageService.set(TASKS_KEY, updated);
  return updated.find((t) => t.id === taskId) || null;
}

/**
 * Adds a new task for the specified agent.
 *
 * @param {object} taskData - { assignedAgentId, dueTime, taskType, leadName, leadId, priority }
 * @returns {Task} the created task
 */
export function addTask(taskData) {
  const tasks = storageService.get(TASKS_KEY) || [];

  const dueDate = (() => {
    const [h, m] = (taskData.dueTime || '09:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  })();

  const newTask = {
    id:              crypto.randomUUID(),
    assignedAgentId: taskData.assignedAgentId,
    dueTime:         taskData.dueTime  || '09:00',
    taskType:        taskData.taskType || 'Call',
    leadName:        taskData.leadName || '',
    leadId:          taskData.leadId   || null,
    priority:        taskData.priority || 'medium',
    status:          'pending',
    dueDate,
    createdAt:       new Date().toISOString(),
    overdue:         false,
  };

  storageService.set(TASKS_KEY, [newTask, ...tasks]);
  return newTask;
}

/**
 * Removes a task by ID.
 */
export function deleteTask(taskId) {
  const tasks = (storageService.get(TASKS_KEY) || []).filter((t) => t.id !== taskId);
  storageService.set(TASKS_KEY, tasks);
}

export const TASK_TYPES = ['Call', 'Follow-up', 'Email', 'WhatsApp', 'Demo Call', 'Meeting', 'Other'];
export const TASK_PRIORITIES = ['high', 'medium', 'low'];
