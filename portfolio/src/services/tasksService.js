/**
 * TASKS SERVICE
 *
 * All task-related business logic and persistence methods are isolated here.
 * Components must NEVER access localStorage directly.
 */

import { storageService } from './storage.service';
import { scopeData } from '../utils/scopeData';

const TASKS_KEY = storageService.KEYS.TASKS;

// ─── Constants ───────────────────────────────────────────────

export const TASK_TYPES = [
  'Call',
  'Email',
  'SMS',
  'WhatsApp',
  'Appointment-Confirmation',
  'Custom',
  'Follow-up',
  'Demo Call',
  'Meeting',
  'Other',
];

export const TASK_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];

export const TASK_QUEUES = {
  ALL: 'all',
  TODAY: 'today',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

// ─── Date / Time Helpers ─────────────────────────────────────

const normalizeDateStr = (dateVal) => {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  if (typeof dateVal === 'string' && dateVal.includes('T')) {
    return dateVal.split('T')[0];
  }
  return String(dateVal).substring(0, 10);
};

const getTodayDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns whether a task is overdue based on due_date/due_time and status
 */
export const isTaskOverdue = (task) => {
  const status = (task.status || '').toLowerCase();
  if (status === 'completed' || status === 'cancelled') {
    return false;
  }

  const todayStr = getTodayDateStr();
  const dueDateStr = normalizeDateStr(task.due_date || task.dueDate);

  if (dueDateStr < todayStr) {
    return true;
  }

  if (dueDateStr === todayStr && (task.due_time || task.dueTime)) {
    const dueTimeStr = task.due_time || task.dueTime;
    const [dueH, dueM] = dueTimeStr.split(':').map(Number);
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();

    if (dueH < currentH || (dueH === currentH && dueM < currentM)) {
      return true;
    }
  }

  return false;
};

/**
 * Normalizes a task entity to have both snake_case and camelCase compatibility
 */
export const normalizeTask = (t) => {
  if (!t) return null;
  const dueDate = normalizeDateStr(t.due_date || t.dueDate);
  const dueTime = t.due_time || t.dueTime || '09:00';
  const overdue = isTaskOverdue(t);

  // Capitalize status/priority nicely
  const rawStatus = t.status || 'Pending';
  const statusFormatted =
    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

  const rawPriority = t.priority || 'Normal';
  let priorityFormatted =
    rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase();
  if (priorityFormatted === 'Medium') priorityFormatted = 'Normal';

  return {
    ...t,
    id: t.id || crypto.randomUUID(),
    title: t.title || t.leadName || t.taskType || 'Follow-up Task',
    type: t.type || t.taskType || 'Call',
    taskType: t.type || t.taskType || 'Call',
    linked_lead_id: t.linked_lead_id || t.leadId || null,
    leadId: t.linked_lead_id || t.leadId || null,
    leadName: t.leadName || '',
    assignee_id: t.assignee_id || t.assigneeId || t.assignedAgentId || t.agentId || '',
    assigneeId: t.assignee_id || t.assigneeId || t.assignedAgentId || t.agentId || '',
    assignedAgentId: t.assignee_id || t.assigneeId || t.assignedAgentId || t.agentId || '',
    due_date: dueDate,
    dueDate: t.dueDate && t.dueDate.includes('T') ? t.dueDate : `${dueDate}T${dueTime}:00`,
    due_time: dueTime,
    dueTime: dueTime,
    priority: priorityFormatted,
    status: statusFormatted,
    completion_notes: t.completion_notes || t.completionNotes || '',
    completionNotes: t.completion_notes || t.completionNotes || '',
    created_at: t.created_at || t.createdAt || new Date().toISOString(),
    createdAt: t.created_at || t.createdAt || new Date().toISOString(),
    created_by: t.created_by || t.createdBy || 'system',
    organization_id: t.organization_id || t.orgId || t.organizationId || null,
    orgId: t.organization_id || t.orgId || t.organizationId || null,
    clinic_id: t.clinic_id || t.clinicId || 'clinic-downtown',
    clinicId: t.clinic_id || t.clinicId || 'clinic-downtown',
    overdue,
  };
};

// ─── CRUD Public API ─────────────────────────────────────────

/**
 * Retrieves list of tasks with RBAC scoping and optional filters.
 *
 * @param {object} filters - { queue, status, priority, type, assignee_id, clinic_id, organization_id, search, due_date }
 * @param {object} [currentUser] - user object from useAuth()
 * @param {string} [selectedClinicId] - selected clinic from useClinic()
 * @returns {Task[]} Scoped and filtered tasks
 */
export function listTasks(filters = {}, currentUser = null, selectedClinicId = null) {
  const rawTasks = (storageService.get(TASKS_KEY) || []).map(normalizeTask);

  // Apply row-level RBAC scoping if currentUser is provided
  let tasks = currentUser
    ? scopeData({ resource: 'tasks', data: rawTasks, currentUser, selectedClinicId })
    : rawTasks;

  const todayStr = getTodayDateStr();

  // 1. Queue Filter
  if (filters.queue && filters.queue !== TASK_QUEUES.ALL) {
    switch (filters.queue) {
      case TASK_QUEUES.TODAY:
        tasks = tasks.filter((t) => {
          const isToday = normalizeDateStr(t.due_date) === todayStr;
          const notDone = t.status !== 'Completed' && t.status !== 'Cancelled';
          return isToday && notDone;
        });
        break;

      case TASK_QUEUES.UPCOMING:
        tasks = tasks.filter((t) => {
          const isFuture = normalizeDateStr(t.due_date) > todayStr;
          const notDone = t.status !== 'Completed' && t.status !== 'Cancelled';
          return isFuture && notDone;
        });
        break;

      case TASK_QUEUES.COMPLETED:
        tasks = tasks.filter((t) => t.status === 'Completed');
        break;

      case TASK_QUEUES.OVERDUE:
        tasks = tasks.filter((t) => {
          const isPast = normalizeDateStr(t.due_date) < todayStr;
          const notDone = t.status !== 'Completed' && t.status !== 'Cancelled';
          return isPast && notDone;
        });
        break;

      default:
        break;
    }
  }

  // 2. Specific status filter
  if (filters.status && filters.status !== 'all') {
    tasks = tasks.filter(
      (t) => (t.status || '').toLowerCase() === filters.status.toLowerCase()
    );
  }

  // 3. Priority filter
  if (filters.priority && filters.priority !== 'all') {
    tasks = tasks.filter(
      (t) => (t.priority || '').toLowerCase() === filters.priority.toLowerCase()
    );
  }

  // 4. Type filter
  if (filters.type && filters.type !== 'all') {
    tasks = tasks.filter(
      (t) => (t.type || '').toLowerCase() === filters.type.toLowerCase()
    );
  }

  // 5. Assignee filter
  if (filters.assignee_id && filters.assignee_id !== 'all') {
    tasks = tasks.filter((t) => t.assignee_id === filters.assignee_id);
  }

  // 6. Clinic filter
  if (filters.clinic_id && filters.clinic_id !== 'all') {
    tasks = tasks.filter((t) => t.clinic_id === filters.clinic_id);
  }

  // 7. Organization filter
  if (filters.organization_id && filters.organization_id !== 'all') {
    tasks = tasks.filter((t) => t.organization_id === filters.organization_id);
  }

  // 8. Due date filter
  if (filters.due_date) {
    tasks = tasks.filter((t) => normalizeDateStr(t.due_date) === normalizeDateStr(filters.due_date));
  }

  // 9. Full-text search
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    tasks = tasks.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.leadName && t.leadName.toLowerCase().includes(q)) ||
        (t.type && t.type.toLowerCase().includes(q)) ||
        (t.completion_notes && t.completion_notes.toLowerCase().includes(q))
    );
  }

  // Sort by due date / time ascending by default
  return tasks.sort((a, b) => {
    const dateA = `${a.due_date}T${a.due_time || '00:00'}`;
    const dateB = `${b.due_date}T${b.due_time || '00:00'}`;
    return new Date(dateA) - new Date(dateB);
  });
}

/**
 * Gets single task by ID
 */
export function getTaskById(taskId) {
  if (!taskId) return null;
  const tasks = storageService.get(TASKS_KEY) || [];
  const found = tasks.find((t) => t.id === taskId);
  return found ? normalizeTask(found) : null;
}

/**
 * Creates a new task and persists it via storageService
 *
 * @param {object} taskData
 * @param {object} [currentUser]
 * @returns {Task}
 */
export function createTask(taskData, currentUser = null) {
  const tasks = storageService.get(TASKS_KEY) || [];

  const dueDate = taskData.due_date || taskData.dueDate || getTodayDateStr();
  const dueTime = taskData.due_time || taskData.dueTime || '09:00';

  const orgId =
    taskData.organization_id ||
    taskData.organizationId ||
    currentUser?.organizationId ||
    currentUser?.orgId ||
    null;

  const clinicId =
    taskData.clinic_id ||
    taskData.clinicId ||
    currentUser?.clinicId ||
    'clinic-downtown';

  const assigneeId =
    taskData.assignee_id ||
    taskData.assigneeId ||
    taskData.assignedAgentId ||
    currentUser?.id ||
    '';

  const rawTask = {
    id: crypto.randomUUID(),
    title: taskData.title || taskData.leadName || 'Follow-up Task',
    type: taskData.type || taskData.taskType || 'Call',
    linked_lead_id: taskData.linked_lead_id || taskData.leadId || null,
    leadName: taskData.leadName || '',
    assignee_id: assigneeId,
    due_date: dueDate,
    due_time: dueTime,
    priority: taskData.priority || 'Normal',
    status: taskData.status || 'Pending',
    completion_notes: taskData.completion_notes || '',
    created_at: new Date().toISOString(),
    created_by: currentUser?.id || 'system',
    organization_id: orgId,
    clinic_id: clinicId,
  };

  const newTask = normalizeTask(rawTask);
  storageService.set(TASKS_KEY, [newTask, ...tasks]);
  return newTask;
}

/**
 * Updates an existing task and persists changes
 *
 * @param {string} taskId
 * @param {object} updates
 * @returns {Task|null}
 */
export function updateTask(taskId, updates = {}) {
  const tasks = storageService.get(TASKS_KEY) || [];
  let updatedTask = null;

  const updatedTasks = tasks.map((t) => {
    if (t.id !== taskId) return t;

    const merged = {
      ...t,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // If status changed to Completed and no completion date set, add completed_at
    if (
      (updates.status === 'Completed' || updates.status === 'completed') &&
      !merged.completed_at
    ) {
      merged.completed_at = new Date().toISOString();
      merged.completedAt = merged.completed_at;
    }

    updatedTask = normalizeTask(merged);
    return updatedTask;
  });

  if (updatedTask) {
    storageService.set(TASKS_KEY, updatedTasks);
  }

  return updatedTask;
}

/**
 * Marks task as completed with optional completion notes
 *
 * @param {string} taskId
 * @param {string} [completionNotes]
 * @returns {Task|null}
 */
export function completeTask(taskId, completionNotes = '') {
  return updateTask(taskId, {
    status: 'Completed',
    completion_notes: completionNotes,
    completed_at: new Date().toISOString(),
  });
}

/**
 * Deletes a task by ID
 *
 * @param {string} taskId
 * @returns {boolean}
 */
export function deleteTask(taskId) {
  if (!taskId) return false;
  const tasks = storageService.get(TASKS_KEY) || [];
  const filtered = tasks.filter((t) => t.id !== taskId);
  storageService.set(TASKS_KEY, filtered);
  return true;
}

/**
 * Returns tasks due today for a specific agent (backward compatibility for AgentDashboardView)
 *
 * @param {string} agentId
 * @returns {Task[]}
 */
export function getTasksForToday(agentId) {
  const today = getTodayDateStr();
  const tasks = (storageService.get(TASKS_KEY) || []).map(normalizeTask);

  return tasks
    .filter(
      (t) =>
        (t.assignee_id === agentId || t.assignedAgentId === agentId) &&
        normalizeDateStr(t.due_date) === today
    )
    .sort((a, b) => {
      const timeA = a.due_time || '00:00';
      const timeB = b.due_time || '00:00';
      return timeA.localeCompare(timeB);
    });
}

/**
 * Backward compatibility alias for addTask
 */
export function addTask(taskData) {
  return createTask({
    ...taskData,
    title: taskData.leadName ? `${taskData.taskType || 'Task'} with ${taskData.leadName}` : (taskData.title || 'Task'),
    type: taskData.taskType || 'Call',
    assignee_id: taskData.assignedAgentId,
    linked_lead_id: taskData.leadId,
    due_time: taskData.dueTime,
    due_date: getTodayDateStr(),
    priority: taskData.priority || 'Normal',
  });
}
