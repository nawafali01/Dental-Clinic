/**
 * CALLS SERVICE
 *
 * All call-related business logic is isolated here.
 * Components must NEVER access localStorage directly.
 * Swap storage calls with API calls when the backend is ready.
 */

import { storageService } from './storage.service';

const CALLS_KEY = storageService.KEYS.CALLS;

// ─── Helpers ─────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const isSameDay = (isoA, isoB) => {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
};

// ─── Public API ──────────────────────────────────────────────

/**
 * Returns chart-ready data for the last 7 days of call activity.
 * Already formatted for use with Recharts BarChart / LineChart.
 *
 * Shape:
 * [
 *   { day: 'Mon', date: '2026-07-28', total: 3, booked: 1, contacted: 1, missed: 1, noAnswer: 0 },
 *   ...
 * ]
 *
 * @param {string} agentId
 * @returns {ChartDay[]}
 */
export function getWeeklyActivity(agentId) {
  const calls = (storageService.get(CALLS_KEY) || []).filter(
    (c) => c.agentId === agentId
  );

  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateISO = d.toISOString();

    const dayCalls = calls.filter((c) => isSameDay(c.date, dateISO));

    return {
      day:       DAYS[d.getDay()],
      date:      d.toLocaleDateString('en-CA'), // YYYY-MM-DD
      total:     dayCalls.length,
      booked:    dayCalls.filter((c) => c.outcome === 'booked').length,
      contacted: dayCalls.filter((c) => c.outcome === 'contacted').length,
      missed:    dayCalls.filter((c) => c.outcome === 'missed').length,
      noAnswer:  dayCalls.filter((c) => c.outcome === 'no-answer').length,
    };
  });
}

/**
 * Returns raw call log for the agent.
 *
 * @param {string} agentId
 * @returns {Call[]}
 */
export function getCallLog(agentId) {
  return (storageService.get(CALLS_KEY) || [])
    .filter((c) => c.agentId === agentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Returns KPIs for today's calls.
 *
 * @param {string} agentId
 * @returns {{ todayCalls, bookedToday, missedToday, avgDuration }}
 */
export function getTodayCallKPIs(agentId) {
  const today = new Date().toISOString();
  const todayCalls = (storageService.get(CALLS_KEY) || []).filter(
    (c) => c.agentId === agentId && isSameDay(c.date, today)
  );

  const durations    = todayCalls.filter((c) => c.duration > 0).map((c) => c.duration);
  const avgDuration  = durations.length
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
    : 0;

  return {
    todayCalls:  todayCalls.length,
    bookedToday: todayCalls.filter((c) => c.outcome === 'booked').length,
    missedToday: todayCalls.filter((c) => c.outcome === 'missed' || c.outcome === 'no-answer').length,
    avgDuration,
  };
}

/**
 * Logs a new call.
 *
 * @param {object} callData - { agentId, leadName, leadId, outcome, duration? }
 * @returns {Call} the created call
 */
export function logCall(callData) {
  const calls = storageService.get(CALLS_KEY) || [];

  const newCall = {
    id:       crypto.randomUUID(),
    agentId:  callData.agentId,
    leadName: callData.leadName || '',
    leadId:   callData.leadId   || null,
    outcome:  callData.outcome  || 'contacted',
    duration: callData.duration || 0,
    notes:    callData.notes    || '',
    date:     new Date().toISOString(),
  };

  storageService.set(CALLS_KEY, [newCall, ...calls]);
  return newCall;
}

export const CALL_OUTCOMES = [
  { value: 'booked',     label: 'Appointment Booked' },
  { value: 'contacted',  label: 'Contacted'           },
  { value: 'missed',     label: 'Missed'              },
  { value: 'no-answer',  label: 'No Answer'           },
];
