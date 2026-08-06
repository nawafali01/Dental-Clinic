/**
 * Dashboard & Widget Utilities
 * Helper functions and scope filter functions for widgets.
 * Imports data definitions and constants from src/constants/dashboardWidgetConstants.js
 */

import {
  SCOPE_LABELS,
  ALL_REPORTS_LIST,
  ALL_SETTINGS_LIST,
  MOCK_LEADS,
  MOCK_APPOINTMENTS,
  MOCK_USERS_LIST
} from '../constants/dashboardWidgetConstants';

/**
 * Returns scope label for a resource based on access level.
 */
export const getScopeLabel = (resource, accessLevel) => {
  if (!resource || !accessLevel) return '';
  return SCOPE_LABELS[resource]?.[accessLevel] ?? '';
};

// --- Scope Filter Helpers ---

const REPORT_SCOPE_ORDER = ['all', 'all_org', 'clinic', 'personal'];

export const getVisibleReports = (accessLevel, reportsList = ALL_REPORTS_LIST) => {
  const idx = REPORT_SCOPE_ORDER.indexOf(accessLevel);
  if (idx === -1) return [];
  const allowedScopes = REPORT_SCOPE_ORDER.slice(0, idx + 1);
  return reportsList.filter(r => allowedScopes.includes(r.scope));
};

const SETTINGS_SCOPE_ORDER = ['limited', 'org', 'all'];

export const getVisibleSettings = (accessLevel, settingsList = ALL_SETTINGS_LIST) => {
  const idx = SETTINGS_SCOPE_ORDER.indexOf(accessLevel);
  if (idx === -1) return [];
  const allowedScopes = SETTINGS_SCOPE_ORDER.slice(0, idx + 1);
  return settingsList.filter(s => allowedScopes.includes(s.scope));
};

export const getVisibleLeads = (accessLevel, leadsList = MOCK_LEADS) => {
  return accessLevel === 'assigned_only' ? leadsList.slice(0, 3) : leadsList;
};

export const getVisibleAppointments = (accessLevel, apptsList = MOCK_APPOINTMENTS) => {
  return accessLevel === 'assigned_manage' ? apptsList.slice(0, 3) : apptsList;
};

export const getVisibleUsers = (accessLevel, currentUser, usersList = MOCK_USERS_LIST) => {
  if (accessLevel === 'self' && currentUser) {
    return [{
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      status: 'active',
      email: currentUser.email
    }];
  }
  if (accessLevel === 'clinic_team') {
    return usersList.slice(1, 4);
  }
  return usersList;
};

// --- Time Greeting ---
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
