import { BADGE_COLOR_OPTIONS } from '@/constants/settingsConstants';

/**
 * Returns Tailwind styling class for a status color key
 */
export const getColorBadgeClass = (colorName) => {
  const found = BADGE_COLOR_OPTIONS.find((b) => b.value === colorName);
  return found ? found.bg : 'bg-slate-100 text-slate-700 border-slate-200';
};

/**
 * Reorders an array of items by moving element at `index` up or down
 * and recalculates their `order` property (1-based index).
 */
export const reorderCatalogItems = (items = [], index, direction) => {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const updated = [...items];
  const [moved] = updated.splice(index, 1);
  updated.splice(targetIndex, 0, moved);

  return updated.map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
};

/**
 * Lead Status Operations
 */
export const addLeadStatusItem = (statuses = [], name, color = 'blue') => {
  const newStatus = {
    id: `st-${Date.now()}`,
    name: name.trim(),
    color,
    order: statuses.length + 1,
    leads: '0',
  };
  return [...statuses, newStatus];
};

export const updateLeadStatusItem = (statuses = [], id, name, color) => {
  return statuses.map((s) =>
    s.id === id
      ? { ...s, name: name.trim(), color: color || s.color }
      : s
  );
};

export const deleteLeadStatusItem = (statuses = [], id) => {
  return statuses
    .filter((s) => s.id !== id)
    .map((s, idx) => ({ ...s, order: idx + 1 }));
};

/**
 * Lead Source Operations
 */
export const toggleLeadSourceItem = (sources = [], id) => {
  return sources.map((s) =>
    s.id === id ? { ...s, active: !s.active } : s
  );
};

export const addLeadSourceItem = (sources = [], name, type = 'Organic') => {
  const newSrc = {
    id: `src-${Date.now()}`,
    name: name.trim(),
    type,
    active: true,
    leads: '0',
    rate: '0%',
  };
  return [...sources, newSrc];
};

export const deleteLeadSourceItem = (sources = [], id) => {
  return sources.filter((s) => s.id !== id);
};

/**
 * Call Outcome Operations
 */
export const addCallOutcomeItem = (outcomes = [], name, type = 'positive', description = '') => {
  const newOutcome = {
    id: `co-${Date.now()}`,
    name: name.trim(),
    type,
    description: description.trim() || 'Custom logged disposition',
  };
  return [...outcomes, newOutcome];
};

export const deleteCallOutcomeItem = (outcomes = [], id) => {
  return outcomes.filter((co) => co.id !== id);
};

/**
 * Lost / Disqualified Reasons Operations
 */
export const addLostReasonItem = (reasons = [], reason) => {
  const newReason = {
    id: `lr-${Date.now()}`,
    reason: reason.trim(),
    active: true,
  };
  return [...reasons, newReason];
};

export const deleteLostReasonItem = (reasons = [], id) => {
  return reasons.filter((lr) => lr.id !== id);
};
