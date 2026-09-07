import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Filter,
  RotateCcw,
  CheckCheck,
  Inbox,
  Search,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '../components/ViewComponents';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { notificationsService } from '@/services/notificationsService';
import { organizationsService } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { getClinicById, isSameClinic } from '@/constants/clinics';
import {
  NOTIFICATION_TYPE_OPTIONS,
  NOTIFICATION_STATUS_OPTIONS,
} from '@/constants/notificationConstants';

export const NotificationsView = () => {
  const { currentUser } = useAuth();
  const { userRole } = useRole();
  const { currentOrg } = useOrg();
  const role = userRole || currentUser?.role;
  const isSuperAdmin = role === 'super_admin';
  const isOrgAdmin = role === 'org_admin';
  const isClinicManager = role === 'clinic_manager';
  const isAgent = role === 'agent';
  const isScopedClinic = isClinicManager || isAgent;

  const managerClinicId = currentUser?.clinicId || (currentUser?.clinicIds && currentUser?.clinicIds[0]) || 'clinic-downtown';
  const assignedClinicObj = getClinicById(managerClinicId);
  const assignedClinicName = assignedClinicObj?.name || 'Downtown Dental Excellence';

  const [searchParams, setSearchParams] = useSearchParams();

  // URL query parameter filters
  const orgParam = searchParams.get('org') || 'all';
  const clinicParam = searchParams.get('clinic') || 'all';
  const typeParam = searchParams.get('type') || 'all';
  const statusParam = searchParams.get('status') || 'all';
  const searchParam = searchParams.get('q') || '';

  const [notifications, setNotifications] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [clinics, setClinics] = useState([]);

  // Load organizations, clinics, and notifications on mount
  useEffect(() => {
    try {
      const loadedNotifs = notificationsService.getNotifications();
      setNotifications(Array.isArray(loadedNotifs) ? loadedNotifs : []);

      const loadedOrgs = organizationsService.getOrganizationsSync();
      setOrganizations(Array.isArray(loadedOrgs) ? loadedOrgs : []);

      const loadedClinics = clinicsService.getClinics();
      setClinics(Array.isArray(loadedClinics) ? loadedClinics : []);
    } catch (err) {
      console.error('Failed to initialize notifications view data:', err);
    }
  }, []);

  // Sync state helpers with URL params
  const updateFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== 'all') {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        // If organization changes, reset clinic filter if it no longer belongs to that org
        if (key === 'org') {
          next.delete('clinic');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Determine available clinics for the selected organization
  const availableClinics = useMemo(() => {
    if (!isSuperAdmin) {
      const userOrgId = currentOrg?.id || 'org-001';
      return clinics.filter((c) => c.orgId === userOrgId);
    }
    if (orgParam === 'all') return clinics;
    return clinics.filter((c) => c.orgId === orgParam);
  }, [clinics, orgParam, isSuperAdmin, currentOrg]);

  // Fast maps for resolving clinic & org names
  const orgsMap = useMemo(() => {
    return new Map(organizations.map((o) => [o.id, o]));
  }, [organizations]);

  const clinicsMap = useMemo(() => {
    return new Map(clinics.map((c) => [c.id, c]));
  }, [clinics]);

  // Notification Operations
  const handleToggleRead = (id) => {
    const updated = notificationsService.toggleRead(id);
    setNotifications(updated);
  };

  const handleCardClick = (notification) => {
    if (!notification.read) {
      const updated = notificationsService.markAsRead(notification.id);
      setNotifications(updated);
    }
  };

  const handleMarkAllAsRead = () => {
    const updated = notificationsService.markAllAsRead();
    setNotifications(updated);
    toast.success('All notifications marked as read.');
  };

  // Filter notifications list with combined AND logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Organization filter
      if (isScopedClinic) {
        const userOrgId = currentUser?.organizationId || 'org-001';
        if (item.organizationId && item.organizationId !== userOrgId) return false;
      } else if (!isSuperAdmin) {
        const effectiveOrgId = (currentOrg?.id && currentOrg.id !== 'all') ? currentOrg.id : (currentUser?.organizationId || 'org-001');
        if (item.organizationId && item.organizationId !== effectiveOrgId) return false;
      } else if (orgParam !== 'all') {
        if (item.organizationId !== orgParam) return false;
      }

      // 2. Clinic filter
      if (isScopedClinic) {
        if (item.clinicId && !isSameClinic(item.clinicId, managerClinicId)) return false;
      } else if (clinicParam !== 'all') {
        if (item.clinicId && !isSameClinic(item.clinicId, clinicParam)) return false;
      }

      // 3. Type filter
      if (typeParam !== 'all') {
        if (item.type !== typeParam) return false;
      }

      // 4. Read/Unread status filter
      if (statusParam === 'unread' && item.read) return false;
      if (statusParam === 'read' && !item.read) return false;

      // 5. Text search query filter
      if (searchParam.trim()) {
        const query = searchParam.toLowerCase();
        const orgName = orgsMap.get(item.organizationId)?.name || '';
        const clinicName = clinicsMap.get(item.clinicId)?.name || '';
        const matchesTitle = (item.title || '').toLowerCase().includes(query);
        const matchesDesc = (item.desc || '').toLowerCase().includes(query);
        const matchesOrg = orgName.toLowerCase().includes(query);
        const matchesClinic = clinicName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesOrg && !matchesClinic) {
          return false;
        }
      }

      return true;
    });
  }, [
    notifications,
    isScopedClinic,
    managerClinicId,
    currentUser,
    currentOrg,
    isSuperAdmin,
    orgParam,
    clinicParam,
    typeParam,
    statusParam,
    searchParam,
    orgsMap,
    clinicsMap,
  ]);

  const isFilterActive =
    orgParam !== 'all' ||
    clinicParam !== 'all' ||
    typeParam !== 'all' ||
    statusParam !== 'all' ||
    searchParam.trim() !== '';

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Platform-wide activity alerts, appointment changes, and clinical updates across all organizations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Organization Filter (Super Admin gets dropdown, Org Admin gets locked badge) */}
          {!isScopedClinic && (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Organization
              </label>
              {isSuperAdmin ? (
                <div className="relative">
                  <select
                    aria-label="Filter by Organization"
                    value={orgParam}
                    onChange={(e) => updateFilter('org', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors"
                  >
                    <option value="all">All Organizations ({organizations.length})</option>
                    {organizations.map((org) => {
                      const orgClinicCount = clinics.filter((c) => c.orgId === org.id).length;
                      return (
                        <option key={org.id} value={org.id}>
                          {org.name} ({orgClinicCount} clinics)
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>{currentOrg?.name || 'Smile Care Group'}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Clinic Dropdown / Fixed Badge */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Clinic Branch
            </label>
            {isScopedClinic ? (
              <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{assignedClinicName}</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  aria-label="Filter by Clinic"
                  value={clinicParam}
                  onChange={(e) => updateFilter('clinic', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="all">
                    {isSuperAdmin
                      ? (orgParam === 'all'
                          ? `All Clinics (${clinics.length})`
                          : `All Clinics in Org (${availableClinics.length})`)
                      : `All Org Clinics (${availableClinics.length})`}
                  </option>
                  {availableClinics.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} ({cl.city || 'Central'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 3. Type / Category Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Notification Type
            </label>
            <div className="relative">
              <select
                aria-label="Filter by Type"
                value={typeParam}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors"
              >
                {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Text Search Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Search Text
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchParam}
                onChange={(e) => updateFilter('q', e.target.value)}
                placeholder="Search message text..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Read / Unread Status Filter Tabs & Clear Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Status:</span>
            {NOTIFICATION_STATUS_OPTIONS.map((tab) => {
              const isActive = statusParam === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => updateFilter('status', tab.value)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Notifications List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">No notifications match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting or clearing your organization, clinic, or category filters to see more results.
            </p>
          </div>
          {isFilterActive && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const org = orgsMap.get(n.organizationId);
            const clinic = clinicsMap.get(n.clinicId);

            // Context badge label
            let badgeText = '';
            if (clinic && org) {
              badgeText = `${clinic.name} · ${org.name}`;
            } else if (clinic) {
              badgeText = clinic.name;
            } else if (org) {
              badgeText = `${org.name} · System-wide`;
            } else {
              badgeText = 'Platform General';
            }

            return (
              <div
                key={n.id}
                onClick={() => handleCardClick(n)}
                className={`bg-white border rounded-xl p-4 flex items-start gap-3.5 transition-all cursor-pointer ${
                  n.read
                    ? 'border-slate-200 hover:bg-slate-50/70 opacity-90'
                    : 'border-slate-300 bg-white hover:border-slate-400 shadow-2xs ring-1 ring-slate-100'
                }`}
              >
                {/* Visual indicator dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 transition-transform ${
                    n.dot || 'bg-blue-500'
                  } ${!n.read ? 'ring-2 ring-primary/20 scale-110' : ''}`}
                />

                {/* Content body */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${n.read ? 'font-medium text-slate-800' : 'font-semibold text-slate-900'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{n.desc}</p>

                  {/* Context Badge Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[280px] sm:max-w-none">{badgeText}</span>
                    </span>

                    {n.type && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
                        {n.type}
                      </span>
                    )}

                    {!n.read && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Right metadata & quick toggle */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-slate-400 font-medium">{n.time}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRead(n.id);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 hover:underline transition-colors cursor-pointer"
                  >
                    {n.read ? 'Mark unread' : 'Mark as read'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
