/**
 * REVENUE SERVICE
 *
 * All revenue-related business logic is isolated here.
 * Components must NEVER access localStorage directly.
 * Swap storage calls with API calls when the backend is ready.
 */

import { storageService } from './storage.service';
import { getLeadKPIs }    from './leadsService';

const REVENUE_KEY = storageService.KEYS.REVENUE;

// ─── Public API ──────────────────────────────────────────────

/**
 * Returns a complete revenue stats object for the agent dashboard.
 *
 * @param {string} agentId
 * @returns {AgentRevenueStats}
 */
export function getAgentRevenueStats(agentId) {
  const records = (storageService.get(REVENUE_KEY) || []).filter(
    (r) => r.agentId === agentId
  );

  const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const current = records.find((r) => r.month === currentMonthKey);

  // Previous month
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);
  const previous = records.find((r) => r.month === prevMonthKey);

  // Lead KPIs (for conversion rate calculation)
  const leadKPIs = getLeadKPIs(agentId);

  const monthlyRevenue     = current?.revenue        ?? 0;
  const prevRevenue        = previous?.revenue       ?? 0;
  const revenueGrowth      = prevRevenue > 0
    ? Math.round(((monthlyRevenue - prevRevenue) / prevRevenue) * 1000) / 10
    : null;

  const conversionRate     = current?.conversionRate ?? 0;
  const totalConversions   = leadKPIs.convertedLeads;
  const totalLeads         = leadKPIs.assignedLeads;

  // Rolling 6-month summary sorted oldest → newest
  const monthlySummary = records
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((r) => ({
      month:          r.month,
      revenue:        r.revenue,
      conversions:    r.conversions,
      conversionRate: r.conversionRate,
    }));

  return {
    monthlyRevenue,
    prevRevenue,
    revenueGrowth,
    conversionRate,
    totalConversions,
    totalLeads,
    monthlySummary,
  };
}
